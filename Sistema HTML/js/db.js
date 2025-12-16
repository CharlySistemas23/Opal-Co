// IndexedDB Database Manager

const DB = {
    db: null,
    dbName: 'opal_pos_db',
    version: 5,

    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve(this.db);
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                this.createStores(db, event);
            };
        });
    },

    createStores(db, event = null) {
        // Settings
        if (!db.objectStoreNames.contains('settings')) {
            db.createObjectStore('settings', { keyPath: 'key' });
        }

        // Device
        if (!db.objectStoreNames.contains('device')) {
            db.createObjectStore('device', { keyPath: 'id' });
        }

        // Audit Log
        if (!db.objectStoreNames.contains('audit_log')) {
            const auditStore = db.createObjectStore('audit_log', { keyPath: 'id', autoIncrement: true });
            auditStore.createIndex('user_id', 'user_id', { unique: false });
            auditStore.createIndex('created_at', 'created_at', { unique: false });
        }

        // Employees
        if (!db.objectStoreNames.contains('employees')) {
            const empStore = db.createObjectStore('employees', { keyPath: 'id' });
            empStore.createIndex('barcode', 'barcode', { unique: true });
            empStore.createIndex('branch_id', 'branch_id', { unique: false });
        }

        // Users
        if (!db.objectStoreNames.contains('users')) {
            const userStore = db.createObjectStore('users', { keyPath: 'id' });
            userStore.createIndex('username', 'username', { unique: true });
            userStore.createIndex('employee_id', 'employee_id', { unique: false });
        }

        // Catalog Agencies
        if (!db.objectStoreNames.contains('catalog_agencies')) {
            const agencyStore = db.createObjectStore('catalog_agencies', { keyPath: 'id' });
            agencyStore.createIndex('barcode', 'barcode', { unique: false });
        } else if (event) {
            // Agregar índice si el store ya existe (durante upgrade)
            const transaction = event.target.transaction;
            if (transaction) {
                const agencyStore = transaction.objectStore('catalog_agencies');
                if (!agencyStore.indexNames.contains('barcode')) {
                    agencyStore.createIndex('barcode', 'barcode', { unique: false });
                }
            }
        }

        // Catalog Guides
        if (!db.objectStoreNames.contains('catalog_guides')) {
            const guideStore = db.createObjectStore('catalog_guides', { keyPath: 'id' });
            guideStore.createIndex('agency_id', 'agency_id', { unique: false });
            guideStore.createIndex('barcode', 'barcode', { unique: false });
        } else if (event) {
            // Agregar índice si el store ya existe (durante upgrade)
            const transaction = event.target.transaction;
            if (transaction) {
                const guideStore = transaction.objectStore('catalog_guides');
                if (!guideStore.indexNames.contains('barcode')) {
                    guideStore.createIndex('barcode', 'barcode', { unique: false });
                }
            }
        }

        // Catalog Sellers
        if (!db.objectStoreNames.contains('catalog_sellers')) {
            const sellerStore = db.createObjectStore('catalog_sellers', { keyPath: 'id' });
            sellerStore.createIndex('barcode', 'barcode', { unique: false });
        } else if (event) {
            // Agregar índice si el store ya existe (durante upgrade)
            const transaction = event.target.transaction;
            if (transaction) {
                const sellerStore = transaction.objectStore('catalog_sellers');
                if (!sellerStore.indexNames.contains('barcode')) {
                    sellerStore.createIndex('barcode', 'barcode', { unique: false });
                }
            }
        }

        // Catalog Branches
        if (!db.objectStoreNames.contains('catalog_branches')) {
            db.createObjectStore('catalog_branches', { keyPath: 'id' });
        }

        // Payment Methods
        if (!db.objectStoreNames.contains('payment_methods')) {
            db.createObjectStore('payment_methods', { keyPath: 'id' });
        }

        // Commission Rules
        if (!db.objectStoreNames.contains('commission_rules')) {
            const commStore = db.createObjectStore('commission_rules', { keyPath: 'id' });
            commStore.createIndex('entity_type', 'entity_type', { unique: false });
            commStore.createIndex('entity_id', 'entity_id', { unique: false });
        }

        // Inventory Items
        if (!db.objectStoreNames.contains('inventory_items')) {
            const invStore = db.createObjectStore('inventory_items', { keyPath: 'id' });
            invStore.createIndex('sku', 'sku', { unique: true });
            invStore.createIndex('barcode', 'barcode', { unique: true });
            invStore.createIndex('branch_id', 'branch_id', { unique: false });
            invStore.createIndex('status', 'status', { unique: false });
        }

        // Inventory Photos
        if (!db.objectStoreNames.contains('inventory_photos')) {
            const photoStore = db.createObjectStore('inventory_photos', { keyPath: 'id' });
            photoStore.createIndex('item_id', 'item_id', { unique: false });
        }

        // Inventory Logs
        if (!db.objectStoreNames.contains('inventory_logs')) {
            const logStore = db.createObjectStore('inventory_logs', { keyPath: 'id' });
            logStore.createIndex('item_id', 'item_id', { unique: false });
            logStore.createIndex('created_at', 'created_at', { unique: false });
        }

        // Inventory Certificates (Certificados de Joyería)
        if (!db.objectStoreNames.contains('inventory_certificates')) {
            const certStore = db.createObjectStore('inventory_certificates', { keyPath: 'id' });
            certStore.createIndex('item_id', 'item_id', { unique: false });
            certStore.createIndex('certificate_number', 'certificate_number', { unique: false });
        }

        // Inventory Price History (Historial de Precios)
        if (!db.objectStoreNames.contains('inventory_price_history')) {
            const priceStore = db.createObjectStore('inventory_price_history', { keyPath: 'id' });
            priceStore.createIndex('item_id', 'item_id', { unique: false });
            priceStore.createIndex('date', 'date', { unique: false });
        }

        // Sales
        if (!db.objectStoreNames.contains('sales')) {
            const saleStore = db.createObjectStore('sales', { keyPath: 'id' });
            saleStore.createIndex('folio', 'folio', { unique: true });
            saleStore.createIndex('branch_id', 'branch_id', { unique: false });
            saleStore.createIndex('seller_id', 'seller_id', { unique: false });
            saleStore.createIndex('agency_id', 'agency_id', { unique: false });
            saleStore.createIndex('guide_id', 'guide_id', { unique: false });
            saleStore.createIndex('created_at', 'created_at', { unique: false });
            saleStore.createIndex('status', 'status', { unique: false });
            saleStore.createIndex('sync_status', 'sync_status', { unique: false });
        }

        // Sale Items
        if (!db.objectStoreNames.contains('sale_items')) {
            const itemStore = db.createObjectStore('sale_items', { keyPath: 'id' });
            itemStore.createIndex('sale_id', 'sale_id', { unique: false });
            itemStore.createIndex('item_id', 'item_id', { unique: false });
        }

        // Payments
        if (!db.objectStoreNames.contains('payments')) {
            const payStore = db.createObjectStore('payments', { keyPath: 'id' });
            payStore.createIndex('sale_id', 'sale_id', { unique: false });
        }

        // Customers
        if (!db.objectStoreNames.contains('customers')) {
            db.createObjectStore('customers', { keyPath: 'id' });
        }

        // Repairs
        if (!db.objectStoreNames.contains('repairs')) {
            const repStore = db.createObjectStore('repairs', { keyPath: 'id' });
            repStore.createIndex('folio', 'folio', { unique: true });
            repStore.createIndex('status', 'status', { unique: false });
            repStore.createIndex('sync_status', 'sync_status', { unique: false });
        }

        // Repair Photos
        if (!db.objectStoreNames.contains('repair_photos')) {
            const repPhotoStore = db.createObjectStore('repair_photos', { keyPath: 'id' });
            repPhotoStore.createIndex('repair_id', 'repair_id', { unique: false });
        }

        // Cost Entries
        if (!db.objectStoreNames.contains('cost_entries')) {
            const costStore = db.createObjectStore('cost_entries', { keyPath: 'id' });
            costStore.createIndex('branch_id', 'branch_id', { unique: false });
            costStore.createIndex('date', 'date', { unique: false });
            costStore.createIndex('sync_status', 'sync_status', { unique: false });
        }

        // Sync Queue
        if (!db.objectStoreNames.contains('sync_queue')) {
            const syncStore = db.createObjectStore('sync_queue', { keyPath: 'id' });
            syncStore.createIndex('entity_type', 'entity_type', { unique: false });
            syncStore.createIndex('status', 'status', { unique: false });
            syncStore.createIndex('created_at', 'created_at', { unique: false });
        }

        // Sync Logs
        if (!db.objectStoreNames.contains('sync_logs')) {
            const logStore = db.createObjectStore('sync_logs', { keyPath: 'id' });
            logStore.createIndex('type', 'type', { unique: false });
            logStore.createIndex('status', 'status', { unique: false });
            logStore.createIndex('created_at', 'created_at', { unique: false });
        }

        // Tourist Reports
        if (!db.objectStoreNames.contains('tourist_reports')) {
            const tourStore = db.createObjectStore('tourist_reports', { keyPath: 'id' });
            tourStore.createIndex('date', 'date', { unique: false });
            tourStore.createIndex('branch_id', 'branch_id', { unique: false });
            tourStore.createIndex('status', 'status', { unique: false });
            tourStore.createIndex('sync_status', 'sync_status', { unique: false });
        }

        // Tourist Report Lines
        if (!db.objectStoreNames.contains('tourist_report_lines')) {
            const lineStore = db.createObjectStore('tourist_report_lines', { keyPath: 'id' });
            lineStore.createIndex('report_id', 'report_id', { unique: false });
            lineStore.createIndex('sale_id', 'sale_id', { unique: false });
        }

        // Cash Sessions (Aperturas/Cierres de Caja)
        if (!db.objectStoreNames.contains('cash_sessions')) {
            const cashStore = db.createObjectStore('cash_sessions', { keyPath: 'id' });
            cashStore.createIndex('branch_id', 'branch_id', { unique: false });
            cashStore.createIndex('user_id', 'user_id', { unique: false });
            cashStore.createIndex('date', 'date', { unique: false });
            cashStore.createIndex('status', 'status', { unique: false });
            cashStore.createIndex('created_at', 'created_at', { unique: false });
        }

        // Cash Movements (Movimientos de Efectivo)
        if (!db.objectStoreNames.contains('cash_movements')) {
            const moveStore = db.createObjectStore('cash_movements', { keyPath: 'id' });
            moveStore.createIndex('session_id', 'session_id', { unique: false });
            moveStore.createIndex('type', 'type', { unique: false });
            moveStore.createIndex('created_at', 'created_at', { unique: false });
        }

        // Barcode Scan History
        if (!db.objectStoreNames.contains('barcode_scan_history')) {
            const scanStore = db.createObjectStore('barcode_scan_history', { keyPath: 'id' });
            scanStore.createIndex('barcode', 'barcode', { unique: false });
            scanStore.createIndex('timestamp', 'timestamp', { unique: false });
            scanStore.createIndex('context', 'context', { unique: false });
        }

        // Barcode Print Templates
        if (!db.objectStoreNames.contains('barcode_print_templates')) {
            db.createObjectStore('barcode_print_templates', { keyPath: 'id' });
        }
    },

    // Generic CRUD operations
    async add(storeName, data) {
        return new Promise((resolve, reject) => {
            try {
                if (!this.db) {
                    console.error('Database not initialized');
                    reject(new Error('Database not initialized'));
                    return;
                }
                
                // Clean data - remove any non-serializable properties
                const cleanData = JSON.parse(JSON.stringify(data));
                
                const tx = this.db.transaction([storeName], 'readwrite');
                const store = tx.objectStore(storeName);
                const request = store.add(cleanData);
                
                request.onsuccess = () => {
                    resolve(request.result);
                };
                
                request.onerror = () => {
                    console.error('Error in add:', request.error);
                    reject(request.error);
                };
            } catch (e) {
                console.error('Exception in add:', e);
                reject(e);
            }
        });
    },

    async get(storeName, key) {
        return new Promise((resolve, reject) => {
            try {
                if (!this.db) {
                    console.error('Database not initialized');
                    resolve(null);
                    return;
                }
                const tx = this.db.transaction([storeName], 'readonly');
                const store = tx.objectStore(storeName);
                const request = store.get(key);
                request.onsuccess = () => {
                    resolve(request.result || null);
                };
                request.onerror = () => {
                    console.error('Error in get:', request.error);
                    resolve(null);
                };
            } catch (e) {
                console.error('Exception in get:', e);
                resolve(null);
            }
        });
    },

    async getAll(storeName, indexName = null, query = null) {
        return new Promise((resolve, reject) => {
            try {
                if (!this.db) {
                    console.error('Database not initialized');
                    resolve([]);
                    return;
                }
                
                // Verificar que el store existe antes de intentar acceder
                if (!this.db.objectStoreNames.contains(storeName)) {
                    console.warn(`Store ${storeName} no existe en la base de datos`);
                    resolve([]);
                    return;
                }
                
                const tx = this.db.transaction([storeName], 'readonly');
                const store = tx.objectStore(storeName);
                const source = indexName ? store.index(indexName) : store;
                const request = source.getAll(query);
                request.onsuccess = () => {
                    resolve(request.result || []);
                };
                request.onerror = () => {
                    console.error('Error in getAll:', request.error);
                    resolve([]);
                };
            } catch (e) {
                console.error('Exception in getAll:', e);
                resolve([]);
            }
        });
    },

    async put(storeName, data) {
        return new Promise((resolve, reject) => {
            try {
                if (!this.db) {
                    console.error('Database not initialized');
                    reject(new Error('Database not initialized'));
                    return;
                }
                
                // Clean data - remove any non-serializable properties
                const cleanData = JSON.parse(JSON.stringify(data));
                
                const tx = this.db.transaction([storeName], 'readwrite');
                const store = tx.objectStore(storeName);
                const request = store.put(cleanData);
                
                request.onsuccess = () => {
                    resolve(request.result);
                };
                
                request.onerror = () => {
                    console.error('Error in put:', request.error);
                    reject(request.error);
                };
            } catch (e) {
                console.error('Exception in put:', e);
                reject(e);
            }
        });
    },

    async delete(storeName, key) {
        return new Promise((resolve, reject) => {
            try {
                if (!this.db) {
                    console.error('Database not initialized');
                    reject(new Error('Database not initialized'));
                    return;
                }
                const tx = this.db.transaction([storeName], 'readwrite');
                const store = tx.objectStore(storeName);
                const request = store.delete(key);
                request.onsuccess = () => {
                    resolve();
                };
                request.onerror = () => {
                    console.error('Error in delete:', request.error);
                    reject(request.error);
                };
            } catch (e) {
                console.error('Exception in delete:', e);
                reject(e);
            }
        });
    },

    async query(storeName, indexName, query) {
        return new Promise((resolve, reject) => {
            try {
                if (!this.db) {
                    console.error('Database not initialized');
                    resolve([]);
                    return;
                }
                if (!this.db.objectStoreNames.contains(storeName)) {
                    console.warn(`Store ${storeName} no existe en la base de datos`);
                    resolve([]);
                    return;
                }
                const tx = this.db.transaction([storeName], 'readonly');
                const store = tx.objectStore(storeName);
                
                // Verificar si el índice existe
                if (indexName && !store.indexNames.contains(indexName)) {
                    console.warn(`Índice ${indexName} no existe en el store ${storeName}, usando getAll y filtrando manualmente`);
                    // Fallback: obtener todos y filtrar manualmente
                    const request = store.getAll();
                    request.onsuccess = () => {
                        const results = request.result || [];
                        const filtered = results.filter(item => {
                            if (query === null || query === undefined) return true;
                            return item[indexName] === query;
                        });
                        resolve(filtered);
                    };
                    request.onerror = () => {
                        console.error('Error in query fallback:', request.error);
                        resolve([]);
                    };
                    return;
                }
                
                const index = indexName ? store.index(indexName) : store;
                const request = index.getAll(query);
                request.onsuccess = () => {
                    resolve(request.result || []);
                };
                request.onerror = () => {
                    console.error('Error in query:', request.error);
                    resolve([]);
                };
            } catch (e) {
                console.error('Exception in query:', e);
                resolve([]);
            }
        });
    },

    async count(storeName, indexName = null, query = null) {
        return new Promise((resolve, reject) => {
            try {
                if (!this.db) {
                    console.error('Database not initialized');
                    resolve(0);
                    return;
                }
                const tx = this.db.transaction([storeName], 'readonly');
                const store = tx.objectStore(storeName);
                const source = indexName ? store.index(indexName) : store;
                const request = source.count(query);
                request.onsuccess = () => {
                    resolve(request.result || 0);
                };
                request.onerror = () => {
                    console.error('Error in count:', request.error);
                    resolve(0);
                };
            } catch (e) {
                console.error('Exception in count:', e);
                resolve(0);
            }
        });
    },

    // Helper: Get by index unique value
    async getByIndex(storeName, indexName, value) {
        return new Promise((resolve, reject) => {
            try {
                if (!this.db) {
                    console.error('Database not initialized');
                    resolve(null);
                    return;
                }
                const tx = this.db.transaction([storeName], 'readonly');
                const store = tx.objectStore(storeName);
                const index = store.index(indexName);
                const request = index.get(value);
                request.onsuccess = () => {
                    resolve(request.result || null);
                };
                request.onerror = () => {
                    console.error('Error in getByIndex:', request.error);
                    resolve(null);
                };
            } catch (e) {
                console.error('Exception in getByIndex:', e);
                resolve(null);
            }
        });
    },

    // Clear all data from a store
    async clear(storeName) {
        return new Promise((resolve, reject) => {
            try {
                if (!this.db) {
                    console.error('Database not initialized');
                    reject(new Error('Database not initialized'));
                    return;
                }
                const tx = this.db.transaction([storeName], 'readwrite');
                const store = tx.objectStore(storeName);
                const request = store.clear();
                
                request.onsuccess = () => {
                    resolve();
                };
                
                request.onerror = () => {
                    console.error('Error in clear:', request.error);
                    reject(request.error);
                };
            } catch (e) {
                console.error('Exception in clear:', e);
                reject(e);
            }
        });
    }
};

