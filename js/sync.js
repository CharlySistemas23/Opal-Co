// Sincronización con Google Sheets

const SyncManager = {
    syncUrl: null,
    syncToken: null,
    isOnline: navigator.onLine,
    isSyncing: false,
    paused: false,

    async init() {
        // Load sync settings
        try {
            const urlSetting = await DB.get('settings', 'sync_url');
            const tokenSetting = await DB.get('settings', 'sync_token');
            this.syncUrl = urlSetting?.value || null;
            this.syncToken = tokenSetting?.value || null;
        } catch (e) {
            console.error('Error loading sync settings:', e);
        }

        // Monitor online status
        window.addEventListener('online', () => {
            this.isOnline = true;
            UI.updateSyncStatus(true, false);
            this.autoSync();
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            UI.updateSyncStatus(false, false);
        });

        // Initial status
        UI.updateSyncStatus(this.isOnline, false);

        // Auto sync basado en configuración
        this.setupAutoSync();
    },

    async setupAutoSync() {
        // Limpiar intervalo anterior si existe
        if (this.autoSyncInterval) {
            clearInterval(this.autoSyncInterval);
        }

        const settings = await this.getSyncSettings();
        const autoSync = settings.autoSync || 'disabled';

        if (autoSync === 'disabled') {
            return;
        }

        const intervals = {
            '5min': 5 * 60 * 1000,
            '15min': 15 * 60 * 1000,
            '30min': 30 * 60 * 1000,
            '1hour': 60 * 60 * 1000
        };

        const intervalMs = intervals[autoSync] || 5 * 60 * 1000;

        this.autoSyncInterval = setInterval(() => {
            if (this.isOnline && !this.isSyncing) {
                this.autoSync();
            }
        }, intervalMs);
    },

    async addToQueue(entityType, entityId, action = 'upsert') {
        try {
            // Verificar que SyncManager esté inicializado
            if (!this.syncUrl && !this.syncToken) {
                console.warn('⚠️ SyncManager no está configurado, pero agregando a cola de todas formas');
            }
            
            const queueItem = {
                id: Utils.generateId(),
                entity_type: entityType,
                entity_id: entityId,
                action: action,
                status: 'pending',
                retries: 0,
                last_attempt: null,
                created_at: new Date().toISOString()
            };
            
            console.log(`➕ Agregando a cola de sincronización: ${entityType} ${entityId.substring(0, 20)}...`);
            
            await DB.add('sync_queue', queueItem);
            
            // Verificar que se guardó correctamente
            const saved = await DB.get('sync_queue', queueItem.id);
            if (!saved) {
                console.error('❌ Error: El elemento no se guardó en la cola');
                throw new Error('No se pudo guardar el elemento en la cola de sincronización');
            }
            
            console.log(`✅ Agregado a cola exitosamente: ${queueItem.id}`);
            
            // Log
            await this.addLog('info', `Agregado a cola: ${entityType} ${entityId.substring(0, 20)}`, 'pending');
            
            return queueItem.id;
        } catch (e) {
            console.error('❌ Error adding to sync queue:', e);
            console.error('Stack:', e.stack);
            await this.addLog('error', `Error agregando a cola: ${e.message}`, 'failed');
            throw e;
        }
    },

    async addLog(type, message, status = 'info', duration = null) {
        try {
            const log = {
                id: Utils.generateId(),
                type: type,
                message: message,
                status: status,
                duration: duration,
                items_synced: status === 'synced' ? parseInt(message.match(/\d+/)?.[0] || 0) : null,
                created_at: new Date().toISOString()
            };
            await DB.add('sync_logs', log);
            
            // Keep only last 2000 logs
            const allLogs = await DB.getAll('sync_logs') || [];
            if (allLogs.length > 2000) {
                const toDelete = allLogs.sort((a, b) => new Date(a.created_at) - new Date(b.created_at)).slice(0, allLogs.length - 2000);
                for (const log of toDelete) {
                    await DB.delete('sync_logs', log.id);
                }
            }
        } catch (e) {
            console.error('Error adding sync log:', e);
        }
    },

    async syncNow() {
        if (!this.isOnline) {
            Utils.showNotification('Sin conexión a internet', 'error');
            return;
        }

        if (!this.syncUrl || !this.syncToken) {
            Utils.showNotification('Configura la URL y token de sincronización', 'error');
            console.error('❌ Sincronización no configurada:', {
                hasUrl: !!this.syncUrl,
                hasToken: !!this.syncToken
            });
            return;
        }

        // Verificar que la URL sea válida
        if (!this.syncUrl.includes('script.google.com')) {
            Utils.showNotification('❌ URL de sincronización inválida. Debe ser una URL de Google Apps Script.', 'error');
            console.error('❌ URL inválida:', this.syncUrl);
            return;
        }

        if (this.isSyncing) {
            Utils.showNotification('Sincronización en progreso...', 'info');
            return;
        }
        
        if (this.paused) {
            console.log('Sync is paused');
            Utils.showNotification('La sincronización está pausada', 'info');
            return;
        }

        const startTime = Date.now();
        this.isSyncing = true;
        UI.updateSyncStatus(this.isOnline, true);

        try {
            // Obtener configuración de filtros
            const settings = await this.getSyncSettings();
            const entityFilters = settings.entityFilters || {};
            
            // Obtener configuración avanzada
            const batchSize = settings.batchSize || 50;
            const maxRetries = settings.maxRetries || 5;

            // DIAGNÓSTICO: Obtener TODOS los elementos de la cola para ver qué hay
            const allQueueItems = await DB.getAll('sync_queue') || [];
            console.log(`📊 DIAGNÓSTICO: Total de elementos en cola: ${allQueueItems.length}`);
            
            // Agrupar por status para diagnóstico
            const byStatus = {};
            const byType = {};
            allQueueItems.forEach(item => {
                const status = item.status || 'unknown';
                const type = item.entity_type || 'unknown';
                if (!byStatus[status]) {
                    byStatus[status] = [];
                }
                if (!byType[type]) {
                    byType[type] = [];
                }
                byStatus[status].push(item);
                byType[type].push(item);
            });
            
            console.log('📊 Elementos por status:', Object.entries(byStatus).map(([s, items]) => 
                `${s}: ${items.length}`
            ).join(', '));
            console.log('📊 Elementos por tipo:', Object.entries(byType).map(([t, items]) => 
                `${t}: ${items.length}`
            ).join(', '));
            
            // Intentar obtener pendientes con query
            let pending = [];
            try {
                pending = await DB.query('sync_queue', 'status', 'pending') || [];
                console.log(`📋 Elementos pendientes (query): ${pending.length}`);
            } catch (queryError) {
                console.warn('⚠️ Error en query, usando getAll y filtrando:', queryError);
                // Fallback: obtener todos y filtrar manualmente
                pending = allQueueItems.filter(item => (item.status || 'pending') === 'pending');
                console.log(`📋 Elementos pendientes (fallback): ${pending.length}`);
            }
            
            // Si no hay pendientes, mostrar información detallada
            if (pending.length === 0) {
                if (allQueueItems.length > 0) {
                    const statusDetails = Object.entries(byStatus).map(([status, items]) => 
                        `${status}: ${items.length}`
                    ).join(', ');
                    console.warn(`⚠️ Hay ${allQueueItems.length} elementos en la cola pero ninguno está pendiente`);
                    console.warn(`   Estados: ${statusDetails}`);
                    Utils.showNotification(
                        `No hay elementos pendientes. Cola: ${allQueueItems.length} elementos (${statusDetails})`, 
                        'warning'
                    );
                } else {
                    console.log('ℹ️ La cola está completamente vacía - no se han agregado elementos para sincronizar');
                    Utils.showNotification(
                        'No hay elementos pendientes de sincronizar. Los datos se agregan automáticamente cuando creas ventas, inventario, etc.', 
                        'info'
                    );
                }
                this.isSyncing = false;
                UI.updateSyncStatus(this.isOnline, false);
                return;
            }
            
            // Aplicar filtros de entidad
            if (Object.keys(entityFilters).length > 0) {
                const beforeFilter = pending.length;
                pending = pending.filter(item => entityFilters[item.entity_type] !== false);
                console.log(`🔍 Después de filtros: ${pending.length} (filtrados: ${beforeFilter - pending.length})`);
            }
            
            if (pending.length === 0) {
                console.log('ℹ️ Todos los elementos pendientes fueron filtrados');
                Utils.showNotification('No hay elementos pendientes de sincronizar (filtrados)', 'info');
                this.isSyncing = false;
                UI.updateSyncStatus(this.isOnline, false);
                return;
            }

            // Procesar en batches
            const batches = [];
            for (let i = 0; i < pending.length; i += batchSize) {
                batches.push(pending.slice(i, i + batchSize));
            }

            // Group by entity type
            const grouped = {};
            pending.forEach(item => {
                if (!grouped[item.entity_type]) {
                    grouped[item.entity_type] = [];
                }
                grouped[item.entity_type].push(item);
            });

            let successCount = 0;
            let errorCount = 0;

            for (const [entityType, items] of Object.entries(grouped)) {
                try {
                    console.log(`📦 Procesando ${items.length} items de tipo ${entityType}...`);
                    
                    // Separar items por acción (upsert vs delete)
                    const upsertItems = items.filter(i => !i.action || i.action === 'upsert');
                    const deleteItems = items.filter(i => i.action === 'delete');
                    
                    console.log(`  - Upserts: ${upsertItems.length}, Deletes: ${deleteItems.length}`);
                    
                    // Preparar records para upsert
                    const records = await this.prepareRecords(entityType, upsertItems.map(i => i.entity_id), 'upsert');
                    console.log(`  - Records preparados: ${records.length}`);
                    
                    // Preparar records para delete (obtener metadata de items eliminados)
                    const deleteRecords = await this.prepareRecords(entityType, deleteItems.map(i => i.entity_id), 'delete');
                    console.log(`  - Delete records preparados: ${deleteRecords.length}`);
                    
                    // Combinar records
                    const allRecords = [...records, ...deleteRecords];
                    
                    console.log(`📤 Enviando ${allRecords.length} registros a Google Sheets...`);
                    const result = await this.sendToSheets(entityType, allRecords, items);
                    
                    if (result.success) {
                        console.log(`✅ ${entityType} sincronizado exitosamente`);
                        
                        // Mark as synced solo si realmente se enviaron datos Y se verificó la respuesta
                        if (allRecords.length > 0) {
                            for (const item of items) {
                                await DB.put('sync_queue', {
                                    ...item,
                                    status: 'synced',
                                    last_attempt: new Date().toISOString()
                                });
                                
                                // Si fue una eliminación, limpiar el store de eliminados después de sincronizar
                                if (item.action === 'delete') {
                                    try {
                                        await DB.delete('sync_deleted_items', item.entity_id);
                                    } catch (e) {
                                        console.warn('Error limpiando sync_deleted_items:', e);
                                    }
                                }
                            }
                            successCount += items.length;
                            const deleteCount = deleteItems.length;
                            const logMessage = deleteCount > 0 
                                ? `Sincronizado: ${upsertItems.length} ${entityType}, ${deleteCount} eliminado(s)`
                                : `Sincronizado: ${items.length} ${entityType}`;
                            await this.addLog('success', logMessage, 'synced', Date.now() - startTime);
                        } else {
                            console.warn(`⚠️ No se enviaron registros para ${entityType} - no marcando como sincronizado`);
                            throw new Error(`No se prepararon registros para ${entityType}`);
                        }
                    } else {
                        // Si hay error de CORS, mostrar mensaje específico y NO marcar como sincronizado
                        if (result.corsBlocked) {
                            console.error(`❌ ERROR CORS para ${entityType}:`, result.error);
                            Utils.showNotification(
                                `❌ ERROR CORS: ${result.error}. Los datos NO se enviaron.`, 
                                'error'
                            );
                        } else {
                            console.error(`❌ Error sincronizando ${entityType}:`, result.error);
                        }
                        throw new Error(result.error || 'Error desconocido');
                    }
                } catch (e) {
                    console.error(`❌ Error completo sincronizando ${entityType}:`, e);
                    console.error('Stack:', e.stack);
                    await this.addLog('error', `Error sincronizando ${entityType}: ${e.message}`, 'failed');
                    // Increment retries
                    for (const item of items) {
                        const newRetries = (item.retries || 0) + 1;
                        await DB.put('sync_queue', {
                            ...item,
                            retries: newRetries,
                            last_attempt: new Date().toISOString(),
                            status: newRetries >= maxRetries ? 'failed' : 'pending'
                        });
                    }
                    errorCount += items.length;
                }
            }

            const duration = Date.now() - startTime;
            this.isSyncing = false;
            UI.updateSyncStatus(this.isOnline, false);

            // Guardar log de sincronización completa
            await this.addLog('info', `Sincronización completada: ${successCount} exitosos, ${errorCount} errores`, 
                errorCount > 0 ? 'failed' : 'synced', duration);

            if (errorCount > 0) {
                Utils.showNotification(`Sincronización completada con ${errorCount} errores`, 'error');
            } else {
                Utils.showNotification(`Sincronización exitosa: ${successCount} elementos`, 'success');
            }

            // Trigger sync status update event
            window.dispatchEvent(new CustomEvent('sync-completed', { 
                detail: { successCount, errorCount, duration } 
            }));

        } catch (e) {
            console.error('Error in sync:', e);
            this.isSyncing = false;
            UI.updateSyncStatus(this.isOnline, false);
            await this.addLog('error', `Error en sincronización: ${e.message}`, 'failed');
            Utils.showNotification('Error en sincronización', 'error');
        }
    },

    async prepareRecords(entityType, entityIds, action = 'upsert') {
        const records = [];
        
        for (const id of entityIds) {
            try {
                let record = null;
                
                // Si es una eliminación, obtener metadata del store de eliminados
                if (action === 'delete') {
                    try {
                        const deletedMetadata = await DB.get('sync_deleted_items', id);
                        if (deletedMetadata && deletedMetadata.metadata) {
                            record = {
                                ...deletedMetadata.metadata,
                                _action: 'delete', // Marcar como eliminación
                                _deleted_at: deletedMetadata.deleted_at
                            };
                        } else {
                            // Si no hay metadata, crear un record básico con el ID
                            record = {
                                id: id,
                                _action: 'delete',
                                _deleted_at: new Date().toISOString()
                            };
                        }
                    } catch (deleteError) {
                        // Si falla, crear un record básico
                        record = {
                            id: id,
                            _action: 'delete',
                            _deleted_at: new Date().toISOString()
                        };
                    }
                } else {
                    // Acción normal (upsert)
                    switch (entityType) {
                        case 'sale':
                            record = await DB.get('sales', id);
                            if (record) {
                                const items = await DB.query('sale_items', 'sale_id', id);
                                const payments = await DB.query('payments', 'sale_id', id);
                                record.items = items;
                                record.payments = payments;
                            }
                            break;
                        case 'inventory_item':
                            record = await DB.get('inventory_items', id);
                            break;
                        case 'employee':
                            record = await DB.get('employees', id);
                            break;
                        case 'repair':
                            record = await DB.get('repairs', id);
                            break;
                        case 'cost_entry':
                            record = await DB.get('cost_entries', id);
                            break;
                        case 'tourist_report':
                            record = await DB.get('tourist_reports', id);
                            if (record) {
                                const lines = await DB.query('tourist_report_lines', 'report_id', id);
                                record.lines = lines;
                            }
                            break;
                        case 'catalog_seller':
                            record = await DB.get('catalog_sellers', id);
                            break;
                        case 'catalog_guide':
                            record = await DB.get('catalog_guides', id);
                            break;
                        case 'catalog_agency':
                            record = await DB.get('catalog_agencies', id);
                            break;
                        case 'customer':
                            record = await DB.get('customers', id);
                            break;
                        case 'user':
                            record = await DB.get('users', id);
                            break;
                        case 'arrival_rate_rule':
                            record = await DB.get('arrival_rate_rules', id);
                            break;
                        case 'agency_arrival':
                            record = await DB.get('agency_arrivals', id);
                            break;
                        case 'daily_profit_report':
                            record = await DB.get('daily_profit_reports', id);
                            break;
                        case 'inventory_transfer':
                            record = await DB.get('inventory_transfers', id);
                            if (record) {
                                const transferItems = await DB.query('inventory_transfer_items', 'transfer_id', id);
                                record.items = transferItems;
                            }
                            break;
                        case 'catalog_branch':
                            record = await DB.get('catalog_branches', id);
                            break;
                        case 'exchange_rate_daily':
                            record = await DB.get('exchange_rates_daily', id);
                            break;
                        case 'cash_session':
                            record = await DB.get('cash_sessions', id);
                            if (record) {
                                const movements = await DB.query('cash_movements', 'session_id', id);
                                record.movements = movements;
                            }
                            break;
                        case 'cash_movement':
                            record = await DB.get('cash_movements', id);
                            break;
                        case 'payment':
                            record = await DB.get('payments', id);
                            break;
                        case 'inventory_log':
                            record = await DB.get('inventory_logs', id);
                            break;
                        case 'audit_log':
                            record = await DB.get('audit_log', id);
                            break;
                        case 'budget_entry':
                            record = await DB.get('budget_entries', id);
                            break;
                        default:
                            console.warn(`⚠️ Tipo de entidad desconocido en prepareRecords: ${entityType}`);
                            // Intentar obtener el record directamente por el nombre de la tabla
                            try {
                                const tableName = entityType.replace(/_/g, '_');
                                record = await DB.get(tableName, id);
                                if (record) {
                                    console.log(`✅ Record obtenido directamente de ${tableName}`);
                                }
                            } catch (e) {
                                console.error(`❌ No se pudo obtener record de ${entityType}:`, e);
                            }
                            break;
                    }
                }
                
                if (record) {
                    records.push(record);
                }
            } catch (e) {
                console.error(`Error preparing record ${id}:`, e);
            }
        }
        
        return records;
    },

    async sendToSheets(entityType, records, queueItems = null) {
        if (!this.syncUrl || !this.syncToken) {
            throw new Error('Sync URL o token no configurado');
        }

        const settings = await this.getSyncSettings();
        const timeout = (settings.timeout || 30) * 1000;
        
        // Separar records de eliminaciones y upserts
        const deleteRecords = records.filter(r => r._action === 'delete');
        const upsertRecords = records.filter(r => !r._action || r._action !== 'delete');

        console.log(`📤 Enviando ${upsertRecords.length} registros y ${deleteRecords.length} eliminaciones de tipo ${entityType} a Google Sheets...`);

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeout);

            const payload = {
                token: this.syncToken,
                entity_type: entityType,
                records: upsertRecords, // Solo enviar upserts en records normales
                deletes: deleteRecords.map(r => ({ // Enviar eliminaciones separadas
                    id: r.id,
                    sku: r.sku || null,
                    branch_id: r.branch_id || null,
                    deleted_at: r._deleted_at || new Date().toISOString()
                })),
                device_id: await this.getDeviceId(),
                timestamp: new Date().toISOString()
            };

            console.log('📦 Payload preparado:', {
                entityType,
                recordsCount: upsertRecords.length,
                deletesCount: deleteRecords.length,
                payloadSize: JSON.stringify(payload).length
            });

            // SOLUCIÓN: Usar text/plain para evitar preflight request
            // Google Apps Script tiene problemas con preflight OPTIONS
            // Usando text/plain hace que la petición sea "simple" y no requiere preflight
            let response;
            let responseData = null;
            
            try {
                response = await fetch(this.syncUrl, {
                    method: 'POST',
                    mode: 'cors',
                    headers: {
                        'Content-Type': 'text/plain;charset=utf-8' // CRÍTICO: text/plain evita preflight
                    },
                    body: JSON.stringify(payload),
                    redirect: 'follow',
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                // Intentar leer la respuesta
                if (response.ok) {
                    try {
                        const text = await response.text();
                        if (text) {
                            responseData = JSON.parse(text);
                            console.log('✅ Respuesta de Google Sheets:', responseData);
                        }
                    } catch (parseError) {
                        console.warn('⚠️ No se pudo parsear la respuesta, pero la petición fue exitosa:', parseError);
                    }
                    
                    if (responseData && responseData.success === false) {
                        throw new Error(responseData.error || 'Error desconocido desde Google Sheets');
                    }
                    
                    return { 
                        success: true, 
                        message: responseData?.message || 'Datos enviados a Google Sheets',
                        data: responseData
                    };
                } else {
                    const errorText = await response.text().catch(() => 'Error desconocido');
                    throw new Error(`Error HTTP ${response.status}: ${errorText}`);
                }
            } catch (corsError) {
                // Si falla CORS, intentar con no-cors como fallback
                console.warn('⚠️ Error con CORS, intentando con no-cors:', corsError.message);
                
                clearTimeout(timeoutId);
                const noCorsController = new AbortController();
                const noCorsTimeoutId = setTimeout(() => noCorsController.abort(), timeout);
                
                try {
                    response = await fetch(this.syncUrl, {
                        method: 'POST',
                        mode: 'no-cors', // Fallback: no-cors
                        headers: {
                            'Content-Type': 'text/plain;charset=utf-8'
                        },
                        body: JSON.stringify(payload),
                        redirect: 'follow',
                        signal: noCorsController.signal
                    });

                    clearTimeout(noCorsTimeoutId);
                    console.error('❌ FALLO CRÍTICO: no-cors no es confiable para Google Apps Script');
                    
                    // CRÍTICO: no-cors NO funciona bien con Google Apps Script
                    // Los datos probablemente NO se están enviando
                    // NO marcar como exitoso - marcar como error para que se reintente
                    return { 
                        success: false, 
                        error: 'CORS bloqueado: Google Apps Script no está configurado para recibir peticiones desde este dominio. ACTUALIZA el Google Apps Script con los headers CORS y vuelve a desplegar la aplicación web.',
                        corsBlocked: true,
                        requiresAction: 'Necesitas actualizar Google Apps Script y configurar CORS'
                    };
                } catch (noCorsError) {
                    clearTimeout(noCorsTimeoutId);
                    throw noCorsError;
                }
            }
        } catch (e) {
            console.error('❌ Error enviando a Google Sheets:', e);
            if (e.name === 'AbortError') {
                return { success: false, error: 'Timeout: La sincronización tardó demasiado' };
            }
            return { success: false, error: e.message || 'Error desconocido' };
        }
    },

    async getDeviceId() {
        try {
            const devices = await DB.getAll('device');
            if (devices.length > 0) {
                return devices[0].id;
            }
            // Create device ID
            const deviceId = Utils.generateId();
            await DB.add('device', {
                id: deviceId,
                name: navigator.userAgent,
                created_at: new Date().toISOString()
            });
            return deviceId;
        } catch (e) {
            return 'unknown';
        }
    },

    async autoSync() {
        if (this.isOnline && !this.isSyncing && !this.paused) {
            const allItems = await DB.getAll('sync_queue') || [];
            const pending = allItems.filter(i => i.status === 'pending');
            
            // Aplicar filtros de entidad si están configurados
            const settings = await this.getSyncSettings();
            const entityFilters = settings.entityFilters || {};
            if (Object.keys(entityFilters).length > 0) {
                const filtered = pending.filter(item => entityFilters[item.entity_type] !== false);
                if (filtered.length > 0) {
                    this.syncNow();
                }
            } else if (pending.length > 0) {
                this.syncNow();
            }
        }
    },

    async getSyncStatus() {
        const allItems = await DB.getAll('sync_queue') || [];
        const pending = allItems.filter(i => i.status === 'pending').length;
        const synced = allItems.filter(i => i.status === 'synced').length;
        const failed = allItems.filter(i => i.status === 'failed').length;
        
        return {
            pending,
            synced,
            failed,
            total: pending + synced + failed
        };
    },

    // ========================================
    // FUNCIONALIDADES AVANZADAS
    // ========================================

    async getAdvancedStats() {
        const allItems = await DB.getAll('sync_queue') || [];
        const synced = allItems.filter(i => i.status === 'synced');
        const failed = allItems.filter(i => i.status === 'failed');
        const total = allItems.length;
        
        const successRate = total > 0 ? (synced.length / total * 100) : 100;
        
        // Calcular tiempo promedio de sincronización
        const syncLogs = await DB.getAll('sync_logs') || [];
        const successfulLogs = syncLogs.filter(l => l.status === 'synced' && l.duration);
        const avgDuration = successfulLogs.length > 0 
            ? Math.round(successfulLogs.reduce((sum, l) => sum + (l.duration || 0), 0) / successfulLogs.length)
            : 0;

        return {
            totalProcessed: total,
            successRate,
            avgPerSync: synced.length > 0 ? synced.length / Math.max(syncLogs.filter(l => l.status === 'synced').length, 1) : 0,
            avgDuration: avgDuration
        };
    },

    async getLastSyncInfo() {
        const logs = await DB.getAll('sync_logs') || [];
        const syncLogs = logs.filter(l => l.type === 'success' || l.type === 'error').sort((a, b) => 
            new Date(b.created_at) - new Date(a.created_at)
        );
        
        return syncLogs[0] || null;
    },

    async getAnalytics() {
        const allItems = await DB.getAll('sync_queue') || [];
        const logs = await DB.getAll('sync_logs') || [];
        
        // Análisis por tipo
        const byType = {};
        allItems.forEach(item => {
            if (!byType[item.entity_type]) {
                byType[item.entity_type] = 0;
            }
            if (item.status === 'synced') {
                byType[item.entity_type]++;
            }
        });

        // Análisis de duración
        const durations = logs.filter(l => l.duration).map(l => l.duration);
        const avgDuration = durations.length > 0 ? Math.round(durations.reduce((sum, d) => sum + d, 0) / durations.length) : 0;
        const minDuration = durations.length > 0 ? Math.min(...durations) : 0;
        const maxDuration = durations.length > 0 ? Math.max(...durations) : 0;

        // Análisis de errores
        const errorLogs = logs.filter(l => l.type === 'error' || l.status === 'failed');
        const errorCounts = {};
        errorLogs.forEach(log => {
            const message = log.message || 'Error desconocido';
            if (!errorCounts[message]) {
                errorCounts[message] = 0;
            }
            errorCounts[message]++;
        });
        const errors = Object.entries(errorCounts)
            .map(([message, count]) => ({ message, count }))
            .sort((a, b) => b.count - a.count);

        // Historial de últimos 30 días
        const history = [];
        for (let i = 29; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const dayLogs = logs.filter(l => l.created_at && l.created_at.startsWith(dateStr));
            history.push({
                date: dateStr,
                count: dayLogs.filter(l => l.status === 'synced').length
            });
        }

        return {
            byType,
            avgDuration,
            minDuration,
            maxDuration,
            totalSyncs: logs.filter(l => l.status === 'synced').length,
            errors,
            history
        };
    },

    async getSyncSettings() {
        const settings = await DB.getAll('settings') || [];
        const settingsMap = {};
        settings.forEach(s => {
            settingsMap[s.key] = s.value;
        });

        return {
            autoSync: settingsMap.auto_sync || 'disabled',
            batchSize: parseInt(settingsMap.sync_batch_size || 50),
            timeout: parseInt(settingsMap.sync_timeout || 30),
            compress: settingsMap.sync_compress === 'true',
            retryFailed: settingsMap.sync_retry_failed !== 'false',
            notifyErrors: settingsMap.sync_notify_errors !== 'false',
            maxRetries: parseInt(settingsMap.sync_max_retries || 5),
            entityFilters: JSON.parse(settingsMap.sync_entity_filters || '{}')
        };
    },

    async saveSyncSettings() {
        const autoSync = document.getElementById('sync-auto-frequency')?.value || 'disabled';
        const batchSize = parseInt(document.getElementById('sync-batch-size')?.value || 50);
        const timeout = parseInt(document.getElementById('sync-timeout')?.value || 30);

        await DB.put('settings', { key: 'auto_sync', value: autoSync, updated_at: new Date().toISOString() });
        await DB.put('settings', { key: 'sync_batch_size', value: batchSize, updated_at: new Date().toISOString() });
        await DB.put('settings', { key: 'sync_timeout', value: timeout, updated_at: new Date().toISOString() });

        // Reconfigurar auto-sync
        await this.setupAutoSync();

        Utils.showNotification('Configuración guardada', 'success');
    },

    async saveEntityFilters() {
        const entities = ['sale', 'inventory_item', 'customer', 'employee', 'repair', 'cost_entry', 'tourist_report', 'catalog_seller', 'catalog_guide', 'catalog_agency'];
        const filters = {};
        
        entities.forEach(entity => {
            const checkbox = document.getElementById(`sync-filter-${entity}`);
            filters[entity] = checkbox ? checkbox.checked : true;
        });

        await DB.put('settings', { 
            key: 'sync_entity_filters', 
            value: JSON.stringify(filters), 
            updated_at: new Date().toISOString() 
        });

        Utils.showNotification('Filtros guardados', 'success');
    },

    async saveAdvancedSettings() {
        const compress = document.getElementById('sync-compress')?.checked || false;
        const retryFailed = document.getElementById('sync-retry-failed')?.checked !== false;
        const notifyErrors = document.getElementById('sync-notify-errors')?.checked !== false;
        const maxRetries = parseInt(document.getElementById('sync-max-retries')?.value || 5);

        await DB.put('settings', { key: 'sync_compress', value: compress.toString(), updated_at: new Date().toISOString() });
        await DB.put('settings', { key: 'sync_retry_failed', value: retryFailed.toString(), updated_at: new Date().toISOString() });
        await DB.put('settings', { key: 'sync_notify_errors', value: notifyErrors.toString(), updated_at: new Date().toISOString() });
        await DB.put('settings', { key: 'sync_max_retries', value: maxRetries, updated_at: new Date().toISOString() });

        Utils.showNotification('Configuración avanzada guardada', 'success');
    },

    async syncFailedItems() {
        const failed = await DB.query('sync_queue', 'status', 'failed');
        if (failed.length === 0) {
            Utils.showNotification('No hay elementos fallidos para reintentar', 'info');
            return;
        }

        // Resetear estado a pending
        for (const item of failed) {
            await DB.put('sync_queue', {
                ...item,
                status: 'pending',
                retries: 0
            });
        }

        Utils.showNotification(`${failed.length} elementos marcados para reintento`, 'success');
        await this.syncNow();
    },

    async clearSyncedItems() {
        if (!await Utils.confirm('¿Eliminar todos los elementos sincronizados de la cola?')) {
            return;
        }

        const synced = await DB.query('sync_queue', 'status', 'synced');
        for (const item of synced) {
            await DB.delete('sync_queue', item.id);
        }

        Utils.showNotification(`${synced.length} elementos eliminados`, 'success');
    },

    async sync() {
        return await this.syncNow();
    },
    
    // Función para verificar la conexión con Google Apps Script
    async testConnection() {
        if (!this.syncUrl || !this.syncToken) {
            return { success: false, error: 'URL o token no configurado' };
        }

        try {
            console.log('🔍 Probando conexión con Google Apps Script...');
            
            // Intentar hacer una petición GET simple para verificar CORS
            try {
                const response = await fetch(this.syncUrl, {
                    method: 'GET',
                    mode: 'cors',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    const text = await response.text();
                    console.log('✅ Conexión exitosa. Respuesta:', text);
                    return { 
                        success: true, 
                        message: 'Conexión verificada correctamente. CORS está configurado.',
                        corsWorking: true
                    };
                } else {
                    return { 
                        success: false, 
                        error: `Error HTTP ${response.status}`,
                        corsWorking: false
                    };
                }
            } catch (corsError) {
                if (corsError.message.includes('CORS') || corsError.message.includes('fetch')) {
                    console.error('❌ ERROR CORS:', corsError);
                    return { 
                        success: false, 
                        error: 'CORS bloqueado. Google Apps Script no está configurado correctamente. Actualiza el código en Google Apps Script y crea una NUEVA implementación.',
                        corsWorking: false,
                        requiresAction: 'Actualizar Google Apps Script con headers CORS y volver a desplegar'
                    };
                } else {
                    throw corsError;
                }
            }
        } catch (e) {
            console.error('❌ Error probando conexión:', e);
            return { 
                success: false, 
                error: e.message || 'Error desconocido',
                corsWorking: false
            };
        }
    },

    // Función de diagnóstico para verificar el estado de la cola
    async diagnoseQueue() {
        try {
            const allItems = await DB.getAll('sync_queue') || [];
            const byStatus = {};
            const byType = {};
            
            allItems.forEach(item => {
                const status = item.status || 'unknown';
                const type = item.entity_type || 'unknown';
                if (!byStatus[status]) byStatus[status] = [];
                if (!byType[type]) byType[type] = [];
                byStatus[status].push(item);
                byType[type].push(item);
            });
            
            const diagnosis = {
                total: allItems.length,
                byStatus: Object.fromEntries(Object.entries(byStatus).map(([s, items]) => [s, items.length])),
                byType: Object.fromEntries(Object.entries(byType).map(([t, items]) => [t, items.length])),
                pending: byStatus.pending?.length || 0,
                synced: byStatus.synced?.length || 0,
                failed: byStatus.failed?.length || 0,
                recentPending: byStatus.pending?.slice(-10).map(i => ({
                    type: i.entity_type,
                    id: i.entity_id?.substring(0, 20),
                    created: i.created_at
                })) || []
            };
            
            console.log('🔍 DIAGNÓSTICO DE COLA DE SINCRONIZACIÓN:', diagnosis);
            return diagnosis;
        } catch (e) {
            console.error('Error en diagnóstico:', e);
            return { error: e.message };
        }
    },
    
    // Función para forzar re-agregar elementos a la cola (útil si se perdieron)
    async forceRequeueEntityType(entityType, limit = 100) {
        try {
            console.log(`🔄 Forzando re-agregar ${entityType} a la cola...`);
            
            let records = [];
            switch (entityType) {
                case 'sale':
                    records = await DB.getAll('sales') || [];
                    break;
                case 'inventory_item':
                    records = await DB.getAll('inventory_items') || [];
                    break;
                case 'customer':
                    records = await DB.getAll('customers') || [];
                    break;
                case 'employee':
                    records = await DB.getAll('employees') || [];
                    break;
                case 'repair':
                    records = await DB.getAll('repairs') || [];
                    break;
                case 'cost_entry':
                    records = await DB.getAll('cost_entries') || [];
                    break;
                default:
                    throw new Error(`Tipo de entidad no soportado: ${entityType}`);
            }
            
            // Limitar cantidad
            records = records.slice(0, limit);
            
            console.log(`📦 Encontrados ${records.length} registros de ${entityType}`);
            
            let added = 0;
            let errors = 0;
            
            for (const record of records) {
                try {
                    // Verificar si ya está en la cola
                    const existing = await DB.getAll('sync_queue') || [];
                    const alreadyInQueue = existing.some(item => 
                        item.entity_type === entityType && 
                        item.entity_id === record.id &&
                        item.status === 'pending'
                    );
                    
                    if (!alreadyInQueue) {
                        await this.addToQueue(entityType, record.id);
                        added++;
                    }
                } catch (e) {
                    console.error(`Error agregando ${record.id}:`, e);
                    errors++;
                }
            }
            
            console.log(`✅ Re-agregados ${added} elementos, ${errors} errores`);
            Utils.showNotification(`Re-agregados ${added} elementos de ${entityType} a la cola`, 'success');
            
            return { added, errors, total: records.length };
        } catch (e) {
            console.error('Error en forceRequeueEntityType:', e);
            Utils.showNotification(`Error: ${e.message}`, 'error');
            throw e;
        }
    }
};

// Exponer SyncManager globalmente
window.SyncManager = SyncManager;

