// UI Manager - Navegación y modales

const UI = {
    currentModule: null,
    currentUser: null,

    init() {
        this.setupNavigation();
        this.setupModals();
        this.setupGlobalSearch();
    },

    setupNavigation() {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', async (e) => {
                e.preventDefault();
                const module = item.dataset.module;
                this.showModule(module);
                // Cargar el módulo después de mostrarlo
                if (window.App && window.App.loadModule) {
                    await window.App.loadModule(module);
                }
            });
        });
    },

    showModule(moduleName) {
        // Update nav
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.module === moduleName) {
                item.classList.add('active');
            }
        });

        // Hide all modules
        document.querySelectorAll('.module').forEach(mod => {
            mod.style.display = 'none';
        });

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
            const placeholder = document.getElementById('module-placeholder');
            const title = document.getElementById('module-title');
            const content = document.getElementById('module-content');
            
            if (placeholder && title && content) {
                placeholder.style.display = 'block';
                title.textContent = this.getModuleTitle(moduleName);
                // NO establecer "Cargando módulo..." aquí - dejar que el módulo lo maneje
                // content.innerHTML = this.getModuleContent(moduleName);
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
            'settings': 'Configuración'
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
        
        if (modalTitle) modalTitle.textContent = title;
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
                            btnElement.addEventListener('click', btn.onclick);
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
    }
};

