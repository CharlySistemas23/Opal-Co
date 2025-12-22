// UI Manager - Navegación y modales

const UI = {
    currentModule: null,
    currentUser: null,
    loadingModule: null,
    moduleLoadPromise: null,
    moduleChangeTimeout: null,

    init() {
        this.setupNavigation();
        this.setupModals();
        this.setupGlobalSearch();
    },

    setupNavigation() {
        // Configurar clics en items de navegación
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', async (e) => {
                e.preventDefault();
                e.stopPropagation();
                const module = item.dataset.module;
                
                // Cancelar carga anterior si existe
                if (this.moduleChangeTimeout) {
                    clearTimeout(this.moduleChangeTimeout);
                    this.moduleChangeTimeout = null;
                }
                
                // Si ya se está cargando este módulo, ignorar
                if (this.loadingModule === module) {
                    return;
                }
                
                // Cancelar carga anterior si hay una en progreso
                if (this.loadingModule && this.loadingModule !== module) {
                    console.log(`Cancelando carga de módulo anterior: ${this.loadingModule}`);
                    this.loadingModule = null;
                    if (this.moduleLoadPromise) {
                        // Marcar como cancelado
                        this.moduleLoadPromise = null;
                    }
                }
                
                // Usar debounce para evitar cambios muy rápidos
                this.moduleChangeTimeout = setTimeout(async () => {
                    this.moduleChangeTimeout = null;
                    this.loadingModule = module;
                    
                    try {
                        this.showModule(module);
                        // Cargar el módulo después de mostrarlo
                        if (window.App && window.App.loadModule) {
                            this.moduleLoadPromise = window.App.loadModule(module);
                            await this.moduleLoadPromise;
                        }
                    } catch (error) {
                        // Solo mostrar error si aún estamos en el mismo módulo
                        if (this.loadingModule === module) {
                            console.error(`Error cargando módulo ${module}:`, error);
                        }
                    } finally {
                        // Solo limpiar si aún estamos en el mismo módulo
                        if (this.loadingModule === module) {
                            this.loadingModule = null;
                            this.moduleLoadPromise = null;
                        }
                    }
                }, 50); // Debounce de 50ms
            });
        });

        // Configurar secciones colapsables - Usar event delegation en el sidebar
        const sidebarNav = document.querySelector('.sidebar-nav');
        if (sidebarNav) {
            sidebarNav.addEventListener('click', (e) => {
                // Verificar si el click fue en un header o en sus hijos, pero no en un nav-item
                const header = e.target.closest('.nav-section-header');
                const navItem = e.target.closest('.nav-item');
                
                // Si se hizo clic en un header (o sus hijos como iconos, labels, chevron) pero NO en un nav-item
                if (header && !navItem) {
                    e.preventDefault();
                    e.stopPropagation();
                    const section = header.dataset.section;
                    if (!section) return;
                    
                    // Asegurar que el elemento items existe
                    const items = header.nextElementSibling;
                    if (!items || !items.classList.contains('nav-section-items')) {
                        return;
                    }
                    
                    // Toggle de la clase collapsed
                    const wasCollapsed = header.classList.contains('collapsed');
                    
                    if (!wasCollapsed) {
                        // Va a colapsar
                        // Primero obtener la altura actual (sin restricciones)
                        const currentHeight = items.scrollHeight;
                        // Establecer esa altura como max-height
                        items.style.maxHeight = currentHeight + 'px';
                        // Forzar reflow
                        requestAnimationFrame(() => {
                            // Ahora colapsar
                            header.classList.add('collapsed');
                            items.style.maxHeight = '0px';
                        });
                    } else {
                        // Va a expandir
                        header.classList.remove('collapsed');
                        // Quitar cualquier restricción de max-height temporalmente
                        items.style.maxHeight = 'none';
                        // Forzar reflow para que el navegador calcule la altura real
                        requestAnimationFrame(() => {
                            const realHeight = items.scrollHeight;
                            // Establecer a 0 primero
                            items.style.maxHeight = '0px';
                            // Forzar otro reflow
                            requestAnimationFrame(() => {
                                // Ahora animar hasta la altura real
                                items.style.maxHeight = realHeight + 'px';
                                // Después de la animación, remover el max-height para que sea automático
                                setTimeout(() => {
                                    if (!header.classList.contains('collapsed')) {
                                        items.style.maxHeight = '';
                                    }
                                }, 350);
                            });
                        });
                    }
                    
                    const isCollapsed = !wasCollapsed;
                    
                    // Guardar estado
                    this.saveSectionState(section, isCollapsed);
                }
            });
        }
        
        // También configurar directamente en cada header como backup
        setTimeout(() => {
            document.querySelectorAll('.nav-section-header').forEach(header => {
                header.addEventListener('click', (e) => {
                    const navItem = e.target.closest('.nav-item');
                    if (navItem) return; // Si es un nav-item, no hacer nada
                    
                    e.preventDefault();
                    e.stopPropagation();
                    const section = header.dataset.section;
                    if (!section) return;
                    
                    const items = header.nextElementSibling;
                    if (!items || !items.classList.contains('nav-section-items')) {
                        return;
                    }
                    
                    const wasCollapsed = header.classList.contains('collapsed');
                    
                    if (!wasCollapsed) {
                        const currentHeight = items.scrollHeight;
                        items.style.maxHeight = currentHeight + 'px';
                        requestAnimationFrame(() => {
                            header.classList.add('collapsed');
                            items.style.maxHeight = '0px';
                        });
                    } else {
                        header.classList.remove('collapsed');
                        items.style.maxHeight = 'none';
                        requestAnimationFrame(() => {
                            const realHeight = items.scrollHeight;
                            items.style.maxHeight = '0px';
                            requestAnimationFrame(() => {
                                items.style.maxHeight = realHeight + 'px';
                                setTimeout(() => {
                                    if (!header.classList.contains('collapsed')) {
                                        items.style.maxHeight = '';
                                    }
                                }, 350);
                            });
                        });
                    }
                    
                    this.saveSectionState(section, !wasCollapsed);
                });
            });
        }, 200);
        
        // Cargar estado guardado de secciones colapsables DESPUÉS de crear wrappers y configurar eventos
        // Usar setTimeout para asegurar que el DOM esté completamente renderizado
        setTimeout(() => {
            this.loadSectionStates();
        }, 100);
    },

    loadSectionStates() {
        try {
            // Verificar que los elementos existan en el DOM
            const headers = document.querySelectorAll('.nav-section-header');
            if (headers.length === 0) {
                console.warn('No se encontraron headers de sección, reintentando...');
                setTimeout(() => this.loadSectionStates(), 200);
                return;
            }

            // Mapeo de módulos a secciones
            const moduleToSection = {
                'dashboard': 'operaciones',
                'pos': 'operaciones',
                'cash': 'operaciones',
                'barcodes': 'operaciones',
                'inventory': 'inventario',
                'transfers': 'inventario',
                'customers': 'clientes',
                'repairs': 'clientes',
                'tourist-report': 'clientes',
                'employees': 'administracion',
                'reports': 'analisis',
                'costs': 'analisis',
                'sync': 'sistema',
                'settings': 'sistema',
                'qa': 'sistema'
            };

            // Cargar estados guardados del localStorage
            const savedStates = localStorage.getItem('nav_section_states');
            const states = savedStates ? JSON.parse(savedStates) : {};

            // Determinar qué sección debe estar desplegada
            let sectionToExpand = null;
            
            // Buscar módulo activo
            const currentModule = localStorage.getItem('current_module');
            if (currentModule && moduleToSection[currentModule]) {
                sectionToExpand = moduleToSection[currentModule];
            } else {
                // Buscar nav-item activo en DOM
                const activeNavItem = document.querySelector('.nav-item.active');
                if (activeNavItem) {
                    const activeModule = activeNavItem.dataset.module;
                    if (activeModule && moduleToSection[activeModule]) {
                        sectionToExpand = moduleToSection[activeModule];
                    }
                }
            }

            // Aplicar estados a cada sección
            headers.forEach((header) => {
                const section = header.dataset.section;
                if (!section) return;
                
                const items = header.nextElementSibling;
                if (!items || !items.classList.contains('nav-section-items')) {
                    return;
                }
                
                // Si hay un estado guardado, usarlo; si no, usar el estado por defecto
                const isCollapsed = states.hasOwnProperty(section) 
                    ? states[section] 
                    : (section !== sectionToExpand); // Por defecto, colapsar todas excepto la activa
                
                // Aplicar estado SIN animación inicial (para evitar el "flash")
                items.style.transition = 'none';
                
                if (isCollapsed) {
                    header.classList.add('collapsed');
                    items.style.maxHeight = '0px';
                } else {
                    header.classList.remove('collapsed');
                    // Medir altura real sin restricciones
                    items.style.maxHeight = 'none';
                    const realHeight = items.scrollHeight;
                    items.style.maxHeight = realHeight + 'px';
                }
            });
            
            // Después de aplicar estados, habilitar transiciones
            setTimeout(() => {
                document.querySelectorAll('.nav-section-items').forEach(items => {
                    items.style.transition = 'max-height 0.3s ease, opacity 0.3s ease';
                });
            }, 100);

        } catch (e) {
            console.error('Error loading section states:', e);
        }
    },

    // Función para expandir una sección específica
    expandSection(sectionName) {
        const header = document.querySelector(`.nav-section-header[data-section="${sectionName}"]`);
        if (header) {
            // Simplemente remover la clase collapsed - el CSS se encarga del resto
            header.classList.remove('collapsed');
            // No guardar este estado automático (no llamar a saveSectionState)
        }
    },

    // Función para colapsar una sección específica
    collapseSection(sectionName) {
        const header = document.querySelector(`.nav-section-header[data-section="${sectionName}"]`);
        if (header) {
            header.classList.add('collapsed');
            this.saveSectionState(sectionName, true);
        }
    },

    saveSectionState(section, isCollapsed) {
        try {
            // Guardar el estado cuando el usuario hace clic manualmente
            const savedStates = localStorage.getItem('nav_section_states');
            const states = savedStates ? JSON.parse(savedStates) : {};
            states[section] = isCollapsed;
            localStorage.setItem('nav_section_states', JSON.stringify(states));
        } catch (e) {
            console.error('Error saving section state:', e);
        }
    },

    filterMenuByPermissions() {
        if (typeof PermissionManager === 'undefined') return;

        // Mapeo de módulos a permisos requeridos
        const modulePermissions = {
            'dashboard': 'dashboard.view',
            'pos': 'pos.view',
            'cash': 'cash.view',
            'barcodes': 'barcodes.generate',
            'inventory': 'inventory.view',
            'transfers': 'transfers.view',
            'customers': 'customers.view',
            'repairs': 'repairs.view',
            'tourist-report': 'arrivals.view',
            'employees': 'employees.view',
            'reports': 'reports.view',
            'costs': 'costs.view',
            'sync': 'settings.sync',
            'settings': 'settings.view',
            'qa': 'settings.qa'
        };

        // Ocultar módulos sin permiso
        document.querySelectorAll('.nav-item[data-module]').forEach(item => {
            const module = item.dataset.module;
            const requiredPermission = modulePermissions[module];
            
            if (requiredPermission && !PermissionManager.hasPermission(requiredPermission)) {
                item.style.display = 'none';
            } else {
                item.style.display = '';
            }
        });

        // Filtrar QA específicamente
        const qaNavItem = document.getElementById('nav-qa');
        if (qaNavItem) {
            if (PermissionManager.hasPermission('settings.qa')) {
                qaNavItem.style.display = '';
            } else {
                qaNavItem.style.display = 'none';
            }
        }

        // Ocultar secciones completas si no tienen items visibles
        document.querySelectorAll('.nav-section').forEach(section => {
            const sectionItems = section.querySelectorAll('.nav-section-items .nav-item[data-module]');
            const visibleItems = Array.from(sectionItems).filter(item => item.style.display !== 'none');
            
            // Si no hay items visibles en la sección, ocultarla completamente
            if (visibleItems.length === 0) {
                section.style.display = 'none';
            } else {
                section.style.display = '';
            }
        });
    },

    showModule(moduleName) {
        // Si es el mismo módulo y no se está cargando, no hacer nada
        if (this.currentModule === moduleName && !this.loadingModule) {
            return;
        }

        // Mapeo de módulos a secciones
        const moduleToSection = {
            'dashboard': 'operaciones',
            'pos': 'operaciones',
            'cash': 'operaciones',
            'barcodes': 'operaciones',
            'inventory': 'inventario',
            'transfers': 'inventario',
            'customers': 'clientes',
            'repairs': 'clientes',
            'tourist-report': 'clientes',
            'employees': 'administracion',
            'reports': 'analisis',
            'costs': 'analisis',
            'sync': 'sistema',
            'settings': 'sistema',
            'qa': 'sistema'
        };

        // Desplegar automáticamente la sección del módulo actual
        const sectionName = moduleToSection[moduleName];
        if (sectionName) {
            this.expandSection(sectionName);
        }

        // Cancelar cualquier operación pendiente de otro módulo
        if (this.currentModule && this.currentModule !== moduleName) {
            // Limpiar cualquier estado pendiente del módulo anterior
            const previousModule = document.getElementById(`module-${this.currentModule}`);
            if (previousModule) {
                // Marcar como oculto sin animación
                previousModule.style.display = 'none';
            }
        }

        // Update nav
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.module === moduleName) {
                item.classList.add('active');
            }
        });

        // Hide all modules and placeholder
        document.querySelectorAll('.module').forEach(mod => {
            mod.style.display = 'none';
        });
        
        const placeholder = document.getElementById('module-placeholder');
        if (placeholder) {
            placeholder.style.display = 'none';
        }

        // Show target module
        const moduleEl = document.getElementById(`module-${moduleName}`);
        if (moduleEl) {
            moduleEl.style.display = 'block';
            this.currentModule = moduleName;
            
            // Guardar módulo actual en localStorage
            localStorage.setItem('current_module', moduleName);
            
            // Trigger module load event
            window.dispatchEvent(new CustomEvent('module-loaded', { detail: { module: moduleName } }));
        } else {
            // Use placeholder for dynamic modules
            const title = document.getElementById('module-title');
            const content = document.getElementById('module-content');
            
            if (placeholder && title && content) {
                placeholder.style.display = 'block';
                title.textContent = this.getModuleTitle(moduleName);
                // Limpiar contenido anterior para forzar recarga
                content.innerHTML = '';
                this.currentModule = moduleName;
                
                // Guardar módulo actual en localStorage
                localStorage.setItem('current_module', moduleName);
                
                window.dispatchEvent(new CustomEvent('module-loaded', { detail: { module: moduleName } }));
            }
        }
    },

    getModuleTitle(moduleName) {
        const titles = {
            'barcodes': 'Códigos de Barras',
            'customers': 'Clientes',
            'repairs': 'Reparaciones',
            'employees': 'Empleados',
            'reports': 'Reportes',
            'costs': 'Costos',
            'tourist-report': 'Reporte Turistas',
            'sync': 'Sincronización',
            'settings': 'Configuración',
            'qa': 'QA / Autopruebas',
            'transfers': 'Transferencias entre Sucursales',
            'inventory': 'Inventario',
            'pos': 'POS',
            'cash': 'Caja',
            'dashboard': 'Dashboard'
        };
        return titles[moduleName] || 'Módulo';
    },

    getModuleContent(moduleName) {
        // Content will be set by each module's init()
        return '<p>Cargando módulo...</p>';
    },

    getModuleContent(moduleName) {
        // This will be populated by each module
        return '<p>Cargando módulo...</p>';
    },

    setupModals() {
        const overlay = document.getElementById('modal-overlay');
        const closeBtn = document.getElementById('modal-close-btn');
        
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeModal());
        }
        
        if (overlay) {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    this.closeModal();
                }
            });
        }
    },

    showModal(title, body, footer = '') {
        const overlay = document.getElementById('modal-overlay');
        const modalTitle = document.getElementById('modal-title');
        const modalBody = document.getElementById('modal-body');
        const modalFooter = document.getElementById('modal-footer');
        
        // Usar innerHTML para soportar íconos en el título
        if (modalTitle) modalTitle.innerHTML = title;
        if (modalBody) modalBody.innerHTML = body;
        
        // Si footer es un array de botones, convertirlo a HTML y agregar event listeners
        if (Array.isArray(footer)) {
            const footerHTML = footer.map((btn, index) => {
                return `<button class="${btn.class || 'btn-secondary'}" id="modal-btn-${index}">${btn.text || 'Botón'}</button>`;
            }).join('');
            if (modalFooter) {
                modalFooter.innerHTML = footerHTML;
                // Agregar event listeners a los botones
                footer.forEach((btn, index) => {
                    if (btn.onclick) {
                        const btnElement = document.getElementById(`modal-btn-${index}`);
                        if (btnElement) {
                            // Convertir string a función si es necesario
                            let handler = btn.onclick;
                            if (typeof handler === 'string') {
                                // Si es un string, crear una función que lo ejecute en el contexto global
                                // Esto permite usar strings como 'UI.closeModal()' o 'window.Transfers.createTransfer()'
                                const codeString = handler;
                                handler = function() {
                                    try {
                                        // Ejecutar en contexto global usando Function constructor
                                        return new Function(codeString)();
                                    } catch (e) {
                                        console.error('Error ejecutando onclick handler:', codeString, e);
                                    }
                                };
                            }
                            btnElement.addEventListener('click', handler);
                        }
                    }
                });
            }
        } else {
            if (modalFooter) modalFooter.innerHTML = footer;
        }
        
        if (overlay) overlay.style.display = 'flex';
    },

    closeModal() {
        const overlay = document.getElementById('modal-overlay');
        if (overlay) overlay.style.display = 'none';
    },

    setupGlobalSearch() {
        const searchInput = document.getElementById('global-search');
        if (searchInput) {
            searchInput.addEventListener('input', Utils.debounce((e) => {
                const query = e.target.value.trim();
                if (query.length > 2) {
                    this.performGlobalSearch(query);
                }
            }, 300));
        }
    },

    async performGlobalSearch(query) {
        // Search across inventory, sales, customers
        const results = [];
        
        // Search inventory
        try {
            const items = await DB.getAll('inventory_items');
            const matches = items.filter(item => 
                item.sku?.toLowerCase().includes(query.toLowerCase()) ||
                item.name?.toLowerCase().includes(query.toLowerCase()) ||
                item.barcode?.includes(query)
            );
            results.push(...matches.map(item => ({
                type: 'inventario',
                label: `${item.sku} - ${item.name}`,
                data: item
            })));
        } catch (e) {
            console.error('Error searching inventory:', e);
        }
        
        // Search sales
        try {
            const sales = await DB.getAll('sales');
            const matches = sales.filter(sale =>
                sale.folio?.toLowerCase().includes(query.toLowerCase())
            );
            results.push(...matches.map(sale => ({
                type: 'venta',
                label: `Venta ${sale.folio}`,
                data: sale
            })));
        } catch (e) {
            console.error('Error searching sales:', e);
        }
        
        // Show results in dropdown (simplified)
        if (results.length > 0) {
            this.showSearchResults(results);
        }
    },

    showSearchResults(results) {
        // Simple implementation - can be enhanced
        console.log('Search results:', results);
    },

    updateUserInfo(user) {
        this.currentUser = user;
        const userEl = document.getElementById('current-user');
        if (userEl && user) {
            userEl.textContent = user.name || user.username || 'Usuario';
        }
    },

    updateBranchInfo(branch) {
        const branchEl = document.getElementById('current-branch');
        if (branchEl && branch) {
            branchEl.textContent = branch.name || 'Tienda';
        }
    },

    updateSyncStatus(online, syncing = false) {
        const statusEl = document.getElementById('connection-status');
        const textEl = document.getElementById('sync-text');
        
        if (statusEl) {
            statusEl.className = `status-indicator ${online ? 'online' : 'offline'}`;
        }
        
        if (textEl) {
            textEl.textContent = syncing ? 'Sincronizando...' : (online ? 'Online' : 'Offline');
        }
    },

    // Mostrar/ocultar elementos de navegación solo para admin
    updateAdminNavigation(isAdmin) {
        const adminNavItems = document.querySelectorAll('.nav-admin-only');
        adminNavItems.forEach(item => {
            item.style.display = isAdmin ? 'flex' : 'none';
        });
        
        // Específicamente el módulo QA
        const qaNav = document.getElementById('nav-qa');
        if (qaNav) {
            qaNav.style.display = isAdmin ? 'flex' : 'none';
        }
    }
};

