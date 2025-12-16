// Main Application Entry Point

const App = {
    async init() {
        try {
            // Initialize database
            await DB.init();
            console.log('Database initialized');

            // Initialize UI
            UI.init();
            console.log('UI initialized');

            // Initialize Barcode Manager
            BarcodeManager.init();
            console.log('Barcode manager initialized');

            // Initialize Sync Manager
            await SyncManager.init();
            console.log('Sync manager initialized');

            // Initialize User Manager
            await UserManager.init();
            console.log('User manager initialized');
            
            // Initialize Backup Manager (backups automáticos cada 10 minutos)
            if (typeof BackupManager !== 'undefined') {
                await BackupManager.init();
                console.log('Backup manager initialized');
            }
            
            // Helper: Create users if they don't exist (for debugging)
            window.createDemoUsers = async function() {
                console.log('Creating demo users...');
                try {
                    // Ensure branches exist first
                    const branches = await DB.getAll('catalog_branches');
                    if (branches.length === 0) {
                        await DB.put('catalog_branches', { id: 'branch1', name: 'Tienda 1', address: '', active: true });
                    }

                    const emp1 = { id: 'emp1', name: 'Admin', role: 'admin', branch_id: 'branch1', active: true, barcode: 'EMP001' };
                    const emp2 = { id: 'emp2', name: 'Vendedor 1', role: 'seller', branch_id: 'branch1', active: true, barcode: 'EMP002' };
                    
                    await DB.put('employees', emp1);
                    await DB.put('employees', emp2);
                    console.log('Employees created');
                    
                    const pinHash = await Utils.hashPin('1234');
                    console.log('PIN hash generated:', pinHash.substring(0, 20) + '...');
                    
                    const user1 = {
                        id: 'user1',
                        username: 'admin',
                        employee_id: 'emp1',
                        role: 'admin',
                        permissions: ['all'],
                        active: true,
                        pin_hash: pinHash
                    };
                    const user2 = {
                        id: 'user2',
                        username: 'vendedor1',
                        employee_id: 'emp2',
                        role: 'seller',
                        permissions: ['pos', 'inventory_view'],
                        active: true,
                        pin_hash: pinHash
                    };
                    
                    await DB.put('users', user1);
                    await DB.put('users', user2);
                    console.log('Users created successfully!');
                    console.log('Try login with: admin / 1234');
                    return true;
                } catch (error) {
                    console.error('Error creating demo users:', error);
                    return false;
                }
            };
            
            // Auto-create users if they don't exist
            setTimeout(async () => {
                const users = await DB.getAll('users') || [];
                if (!Array.isArray(users) || users.length === 0) {
                    console.warn('No users found, creating demo users...');
                    await window.createDemoUsers();
                }
            }, 2000);

            // Bypass login function for debugging
            window.bypassLogin = async function() {
                console.log('=== BYPASS LOGIN ===');
                try {
                    // Ensure database is ready
                    if (!DB.db) {
                        console.log('Esperando inicialización de DB...');
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    }

                    // Force create users and employees
                    console.log('Forzando creación de usuarios...');
                    await window.createUsersManually();
                    await new Promise(resolve => setTimeout(resolve, 500));

                    // Ensure users exist
                    let users = await DB.getAll('users') || [];
                    if (!Array.isArray(users) || users.length === 0) {
                        console.log('Creando usuarios con createDemoUsers...');
                        await window.createDemoUsers();
                        await new Promise(resolve => setTimeout(resolve, 500));
                        users = await DB.getAll('users') || [];
                    }

                    if (!Array.isArray(users) || users.length === 0) {
                        console.error('No se pudieron crear usuarios');
                        alert('Error: No se pudieron crear usuarios. Abre la consola (F12) para más detalles.');
                        return;
                    }

                    if (!Array.isArray(users) || users.length === 0) {
                        alert('Error: No se pudieron crear usuarios. Abre la consola (F12) para más detalles.');
                        return;
                    }

                    const user = users.find(u => u && u.username === 'admin' && u.active) || users[0];
                    if (!user) {
                        alert('Error: No se pudo encontrar usuario. Recarga la página.');
                        return;
                    }

                    let employee = await DB.get('employees', user.employee_id);
                    if (!employee) {
                        // Create employee if missing
                        employee = {
                            id: 'emp1',
                            name: 'Admin',
                            role: 'admin',
                            branch_id: 'branch1',
                            active: true,
                            barcode: 'EMP001'
                        };
                        await DB.put('employees', employee);
                    } else {
                        // Ensure employee is active
                        if (!employee.active) {
                            employee.active = true;
                            await DB.put('employees', employee);
                            console.log('Empleado activado:', employee.name);
                        }
                    }

                    UserManager.currentUser = user;
                    UserManager.currentEmployee = employee;
                    localStorage.setItem('current_user_id', user.id);
                    localStorage.setItem('current_employee_id', employee.id);

                    // Ensure branch exists
                    if (employee.branch_id) {
                        let branch = await DB.get('catalog_branches', employee.branch_id);
                        if (!branch) {
                            branch = { id: 'branch1', name: 'Tienda 1', address: '', active: true };
                            await DB.put('catalog_branches', branch);
                        }
                        localStorage.setItem('current_branch_id', branch.id);
                    }

                    // Update UI
                    if (UI) {
                        if (UI.updateUserInfo) UI.updateUserInfo(employee);
                        if (employee.branch_id && UI.updateBranchInfo) {
                            const branch = await DB.get('catalog_branches', employee.branch_id);
                            if (branch) UI.updateBranchInfo(branch);
                        }
                    }

                    // Hide login screen
                    const loginScreen = document.getElementById('login-screen');
                    if (loginScreen) {
                        loginScreen.style.display = 'none';
                    }

                    // Show dashboard
                    document.querySelectorAll('.module').forEach(mod => {
                        mod.style.display = 'none';
                    });
                    
                    const dashboard = document.getElementById('module-dashboard');
                    if (dashboard) {
                        dashboard.style.display = 'block';
                    }

                    // Update nav
                    document.querySelectorAll('.nav-item').forEach(item => {
                        item.classList.remove('active');
                        if (item.dataset.module === 'dashboard') {
                            item.classList.add('active');
                        }
                    });

                    if (UI && UI.showModule) {
                        UI.showModule('dashboard');
                    }

                    console.log('Bypass login exitoso');
                    if (Utils && Utils.showNotification) {
                        Utils.showNotification('Acceso directo exitoso', 'success');
                    }
                } catch (error) {
                    console.error('Error en bypassLogin:', error);
                    alert('Error en acceso directo: ' + error.message + '\nAbre la consola (F12) para más detalles.');
                }
            };

            // Helper to create users manually
            window.createUsersManually = async function() {
                try {
                    console.log('Creando usuarios manualmente...');
                    // Create branch
                    await DB.put('catalog_branches', { id: 'branch1', name: 'Tienda 1', address: '', active: true });
                    console.log('Branch creado');
                    
                    // Create employee - ensure active
                    const emp = { id: 'emp1', name: 'Admin', role: 'admin', branch_id: 'branch1', active: true, barcode: 'EMP001' };
                    await DB.put('employees', emp);
                    console.log('Employee creado:', emp);
                    
                    // Create user - ensure active
                    const pinHash = await Utils.hashPin('1234');
                    const usr = {
                        id: 'user1',
                        username: 'admin',
                        employee_id: 'emp1',
                        role: 'admin',
                        permissions: ['all'],
                        active: true,
                        pin_hash: pinHash
                    };
                    await DB.put('users', usr);
                    console.log('User creado:', usr);
                    
                    console.log('Usuarios creados manualmente exitosamente');
                    return true;
                } catch (e) {
                    console.error('Error creando usuarios manualmente:', e);
                    return false;
                }
            };

            // Setup module load handlers
            window.addEventListener('module-loaded', (e) => {
                this.loadModule(e.detail.module);
            });

            // Setup sync button
            document.getElementById('sync-now-btn')?.addEventListener('click', () => {
                SyncManager.syncNow();
            });

            // Setup logout
            document.getElementById('logout-btn')?.addEventListener('click', () => {
                UserManager.logout();
            });

            // Load demo data if needed
            await this.loadDemoData();
            
            // Verificar y corregir códigos de barras faltantes o inconsistentes
            await this.verifyAndFixBarcodes();

            console.log('Application initialized');
            
            // Restaurar módulo guardado si el usuario está autenticado
            if (UserManager.currentUser) {
                const savedModule = localStorage.getItem('current_module');
                if (savedModule && UI && UI.showModule) {
                    // Esperar un momento para que todo esté listo
                    setTimeout(async () => {
                        await this.loadModule(savedModule);
                    }, 100);
                }
            }
        } catch (e) {
            console.error('Error initializing app:', e);
            Utils.showNotification('Error al inicializar la aplicación', 'error');
        }
    },

    async loadModule(moduleName) {
        try {
            console.log(`Loading module: ${moduleName}`);
            switch (moduleName) {
                case 'dashboard':
                    if (typeof Dashboard !== 'undefined') {
                        if (!Dashboard.initialized) {
                            await Dashboard.init();
                        } else {
                            await Dashboard.loadDashboard();
                        }
                    } else {
                        await this.loadDashboard();
                    }
                    break;
                case 'pos':
                    if (typeof POS !== 'undefined') {
                        if (!POS.initialized) {
                            await POS.init();
                        } else {
                            // Si ya está inicializado, recargar productos
                            await POS.loadProducts();
                        }
                    }
                    break;
                case 'inventory':
                    if (typeof Inventory !== 'undefined') {
                        if (!Inventory.initialized) {
                            await Inventory.init();
                        } else {
                            // Verificar si el contenido necesita ser reconfigurado
                            const content = document.getElementById('module-content');
                            if (content && (content.innerHTML.includes('Cargando módulo') || content.innerHTML.trim() === '' || !content.querySelector('#inventory-list'))) {
                                await Inventory.setupEventListeners();
                            }
                            // Siempre recargar los datos cuando se navega al módulo
                            if (typeof Inventory.loadInventory === 'function') {
                                await Inventory.loadInventory();
                            }
                        }
                    }
                    break;
                case 'tourist-report':
                    if (typeof TouristReport !== 'undefined') {
                        if (!TouristReport.initialized) {
                            await TouristReport.init();
                        } else if (typeof TouristReport.displayReport === 'function') {
                            await TouristReport.displayReport();
                        }
                    }
                    break;
                case 'barcodes':
                    if (typeof BarcodesModule !== 'undefined') {
                        if (!BarcodesModule.initialized) {
                            await BarcodesModule.init();
                        } else {
                            // Verificar si el contenido necesita ser reconfigurado
                            const content = document.getElementById('barcodes-content');
                            if (content && (content.innerHTML.includes('Cargando módulo') || content.innerHTML.trim() === '' || !content.querySelector('#barcodes-list'))) {
                                if (typeof BarcodesModule.setupEventListeners === 'function') {
                                    BarcodesModule.setupEventListeners();
                                } else if (typeof BarcodesModule.setupUI === 'function') {
                                    BarcodesModule.setupUI();
                                } else {
                                    console.error('BarcodesModule.setupEventListeners no existe, usando setupUI');
                                    BarcodesModule.setupUI();
                                }
                            }
                            // Recargar la pestaña activa si el módulo ya está inicializado
                            const activeTab = document.querySelector('#barcodes-tabs .tab-btn.active')?.dataset.tab || 'overview';
                            if (typeof BarcodesModule.loadTab === 'function') {
                                await BarcodesModule.loadTab(activeTab);
                            } else if (typeof BarcodesModule.loadBarcodes === 'function') {
                                await BarcodesModule.loadBarcodes();
                            }
                        }
                    }
                    break;
                case 'repairs':
                    if (typeof Repairs !== 'undefined') {
                        if (!Repairs.initialized) {
                            await Repairs.init();
                        } else {
                            // Verificar si el contenido necesita ser reconfigurado
                            const content = document.getElementById('module-content');
                            if (content && (content.innerHTML.includes('Cargando módulo') || content.innerHTML.trim() === '' || !content.querySelector('#repairs-list'))) {
                                Repairs.setupUI();
                            }
                            // Siempre recargar los datos cuando se navega al módulo
                            if (typeof Repairs.loadRepairs === 'function') {
                                await Repairs.loadRepairs();
                            }
                        }
                    }
                    break;
                case 'reports':
                    if (typeof Reports !== 'undefined') {
                        if (!Reports.initialized) {
                            await Reports.init();
                        } else {
                            // Reports necesita reconfigurar UI si el contenido está vacío o dice "Cargando módulo"
                            const content = document.getElementById('module-content');
                            if (content && (content.innerHTML.includes('Cargando módulo') || content.innerHTML.trim() === '')) {
                                Reports.setupUI();
                                await Reports.loadCatalogs();
                            } else {
                                const activeTab = document.querySelector('#reports-tabs .tab-btn.active')?.dataset.tab || 'reports';
                                await Reports.loadTab(activeTab);
                            }
                        }
                    }
                    break;
                case 'costs':
                    if (typeof Costs !== 'undefined') {
                        if (!Costs.initialized) {
                            await Costs.init();
                        } else {
                            const activeTab = document.querySelector('#costs-tabs .tab-btn.active')?.dataset.tab || 'costs';
                            await Costs.loadTab(activeTab);
                        }
                    }
                    break;
                case 'customers':
                    if (typeof Customers !== 'undefined') {
                        if (!Customers.initialized) {
                            await Customers.init();
                        } else {
                            // Verificar si el contenido necesita ser reconfigurado
                            const content = document.getElementById('module-content');
                            if (content && (content.innerHTML.includes('Cargando módulo') || content.innerHTML.trim() === '' || !content.querySelector('#customers-list'))) {
                                Customers.setupEventListeners();
                            }
                            // Siempre recargar los datos cuando se navega al módulo
                            if (typeof Customers.loadCustomers === 'function') {
                                await Customers.loadCustomers();
                            }
                        }
                    }
                    break;
                case 'employees':
                    if (typeof Employees !== 'undefined') {
                        if (!Employees.initialized) {
                            await Employees.init();
                        } else {
                            // Verificar si el contenido necesita ser reconfigurado
                            const content = document.getElementById('module-content');
                            if (content && (content.innerHTML.includes('Cargando módulo') || content.innerHTML.trim() === '' || !content.querySelector('.employees-tabs'))) {
                                Employees.setupUI();
                            }
                            // Siempre recargar los datos cuando se navega al módulo
                            if (typeof Employees.loadEmployees === 'function') {
                                await Employees.loadEmployees();
                            }
                        }
                    }
                    break;
                case 'settings':
                    if (typeof Settings !== 'undefined') {
                        if (!Settings.initialized) {
                            await Settings.init();
                        } else {
                            // Settings necesita reconfigurar UI si el contenido está vacío o dice "Cargando módulo"
                            const content = document.getElementById('module-content');
                            if (content && (content.innerHTML.includes('Cargando módulo') || content.innerHTML.trim() === '')) {
                                Settings.setupUI();
                                await Settings.loadSettings();
                            } else if (typeof Settings.loadSettings === 'function') {
                                await Settings.loadSettings();
                            }
                        }
                    }
                    break;
                case 'sync':
                    if (typeof SyncUI !== 'undefined') {
                        if (!SyncUI.initialized) {
                            await SyncUI.init();
                        } else {
                            // Recargar la pestaña activa si ya está inicializado
                            const activeTab = document.querySelector('#sync-tabs .tab-btn.active')?.dataset.tab || 'overview';
                            await SyncUI.loadTab(activeTab);
                        }
                    }
                    break;
                case 'cash':
                    if (typeof Cash !== 'undefined') {
                        if (!Cash.initialized) {
                            await Cash.init();
                        } else {
                            // Asegurarse de que el módulo esté visible y el DOM esté listo
                            const cashModule = document.getElementById('module-cash');
                            const cashPlaceholder = document.getElementById('module-placeholder');
                            const isModuleVisible = (cashModule && cashModule.style.display !== 'none') || 
                                                    (cashPlaceholder && cashPlaceholder.style.display !== 'none');
                            
                            if (isModuleVisible) {
                                // Esperar a que el DOM esté listo
                                let attempts = 0;
                                const maxAttempts = 10;
                                while (attempts < maxAttempts) {
                                    const cashContent = document.getElementById('module-content');
                                    if (cashContent && cashContent.querySelector('#cash-status-text')) {
                                        await Cash.loadCurrentSession();
                                        break;
                                    }
                                    await new Promise(resolve => setTimeout(resolve, 50));
                                    attempts++;
                                }
                                if (attempts >= maxAttempts) {
                                    console.warn('No se pudo cargar la sesión de cash: elementos del DOM no están listos');
                                }
                            }
                        }
                    }
                    break;
                default:
                    console.warn(`Unknown module: ${moduleName}`);
            }
            
            console.log(`Module ${moduleName} loaded successfully`);
        } catch (e) {
            console.error(`Error loading module ${moduleName}:`, e);
            Utils.showNotification(`Error al cargar módulo ${moduleName}: ${e.message}`, 'error');
        }
    },

    async loadDashboard() {
        try {
            const today = Utils.formatDate(new Date(), 'YYYY-MM-DD');
            const yesterday = Utils.formatDate(new Date(Date.now() - 86400000), 'YYYY-MM-DD');
            const sales = await DB.getAll('sales') || [];
            const todaySales = sales.filter(s => s.created_at?.startsWith(today) && s.status === 'completada');
            const yesterdaySales = sales.filter(s => s.created_at?.startsWith(yesterday) && s.status === 'completada');

            // KPIs
            const totalSales = todaySales.reduce((sum, s) => sum + s.total, 0);
            const yesterdayTotal = yesterdaySales.reduce((sum, s) => sum + s.total, 0);
            const tickets = todaySales.length;
            const passengers = todaySales.reduce((sum, s) => sum + (s.passengers || 1), 0);
            const avgTicket = tickets > 0 ? totalSales / passengers : 0;
            const closeRate = passengers > 0 ? (tickets / passengers) * 100 : 0;
            const salesChange = yesterdayTotal > 0 ? ((totalSales - yesterdayTotal) / yesterdayTotal * 100).toFixed(1) : 0;

            document.getElementById('kpi-sales-today').textContent = Utils.formatCurrency(totalSales);
            document.getElementById('kpi-tickets').textContent = tickets;
            document.getElementById('kpi-avg-ticket').textContent = Utils.formatCurrency(avgTicket);
            document.getElementById('kpi-close-rate').textContent = `${closeRate.toFixed(1)}%`;

            // Sales chart data (last 7 days)
            const last7Days = [];
            for (let i = 6; i >= 0; i--) {
                const date = new Date(Date.now() - i * 86400000);
                const dateStr = Utils.formatDate(date, 'YYYY-MM-DD');
                const daySales = sales.filter(s => s.created_at?.startsWith(dateStr) && s.status === 'completada');
                const dayTotal = daySales.reduce((sum, s) => sum + s.total, 0);
                last7Days.push({
                    date: Utils.formatDate(date, 'DD/MM'),
                    total: dayTotal
                });
            }

            // Top products
            const productCounts = {};
            const saleItems = await DB.getAll('sale_items') || [];
            for (const sale of todaySales) {
                const items = saleItems.filter(si => si.sale_id === sale.id);
                for (const item of items) {
                    const invItem = await DB.get('inventory_items', item.item_id);
                    if (invItem) {
                        const key = invItem.name || invItem.sku;
                        productCounts[key] = (productCounts[key] || 0) + item.quantity;
                    }
                }
            }

            const topProducts = Object.entries(productCounts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5);

            // Top sellers
            const sellerCounts = {};
            todaySales.forEach(sale => {
                if (sale.seller_id) {
                    sellerCounts[sale.seller_id] = (sellerCounts[sale.seller_id] || 0) + sale.total;
                }
            });

            const topSellers = Object.entries(sellerCounts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5);

            const sellersList = document.getElementById('top-sellers-list');
            if (sellersList) {
                const sellers = await DB.getAll('catalog_sellers') || [];
                sellersList.innerHTML = `
                    <h3 style="margin-bottom: 15px;">Top Vendedores</h3>
                    ${topSellers.length === 0 ? '<p style="text-align: center; color: #999;">No hay ventas hoy</p>' : topSellers.map(([id, total]) => {
                        const seller = sellers.find(s => s.id === id);
                        const percentage = totalSales > 0 ? (total / totalSales * 100).toFixed(1) : 0;
                        return `<div style="padding: 12px; margin-bottom: 8px; background: var(--color-bg-secondary); border-radius: var(--radius-md); border-left: 4px solid var(--color-primary);">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <div>
                                    <strong>${seller?.name || id}</strong>
                                    <div style="font-size: 12px; color: var(--color-text-secondary);">${percentage}% del total</div>
                                </div>
                                <div style="font-size: 18px; font-weight: 600;">${Utils.formatCurrency(total)}</div>
                            </div>
                        </div>`;
                    }).join('')}
                `;
            }

            // Add charts section
            const dashboardModule = document.getElementById('module-dashboard');
            if (dashboardModule) {
                let chartsSection = dashboardModule.querySelector('#dashboard-charts');
                if (!chartsSection) {
                    chartsSection = document.createElement('div');
                    chartsSection.id = 'dashboard-charts';
                    chartsSection.className = 'dashboard-section';
                    const topSellersDiv = dashboardModule.querySelector('#top-sellers-list').parentElement;
                    topSellersDiv.insertBefore(chartsSection, topSellersDiv.firstChild);
                }

                const maxSales = Math.max(...last7Days.map(d => d.total), 1);
                chartsSection.innerHTML = `
                    <h3>Ventas Últimos 7 Días</h3>
                    <div style="display: flex; align-items: flex-end; gap: 8px; height: 200px; margin: 20px 0; padding: 20px; background: var(--color-bg-secondary); border-radius: var(--radius-md);">
                        ${last7Days.map(day => {
                            const height = maxSales > 0 ? (day.total / maxSales * 100) : 0;
                            return `
                                <div style="flex: 1; display: flex; flex-direction: column; align-items: center; gap: 8px;">
                                    <div style="flex: 1; display: flex; align-items: flex-end; width: 100%;">
                                        <div style="width: 100%; background: linear-gradient(180deg, var(--color-primary) 0%, var(--color-accent) 100%); border-radius: var(--radius-sm) var(--radius-sm) 0 0; height: ${height}%; min-height: ${day.total > 0 ? '4px' : '0'}; transition: all 0.3s;"></div>
                                    </div>
                                    <div style="font-size: 11px; color: var(--color-text-secondary); text-align: center;">
                                        <div>${day.date}</div>
                                        <div style="font-weight: 600; color: var(--color-text); margin-top: 4px;">${Utils.formatCurrency(day.total)}</div>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                    ${yesterdayTotal > 0 ? `
                        <div style="padding: 12px; background: ${salesChange >= 0 ? 'rgba(52, 199, 89, 0.1)' : 'rgba(255, 59, 48, 0.1)'}; border-radius: var(--radius-md); border-left: 4px solid ${salesChange >= 0 ? 'var(--color-success)' : 'var(--color-danger)'}; margin-bottom: 20px;">
                            <strong>Comparativa con Ayer:</strong> ${salesChange >= 0 ? '+' : ''}${salesChange}% 
                            <small style="color: var(--color-text-secondary);">(${Utils.formatCurrency(Math.abs(totalSales - yesterdayTotal))})</small>
                        </div>
                    ` : ''}
                    ${topProducts.length > 0 ? `
                        <h3 style="margin-top: 30px;">Top Productos Hoy</h3>
                        <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 15px;">
                            ${topProducts.map(([name, qty]) => `
                                <div style="padding: 10px; background: var(--color-bg-secondary); border-radius: var(--radius-md); display: flex; justify-content: space-between; align-items: center;">
                                    <span><strong>${name}</strong></span>
                                    <span style="font-size: 18px; font-weight: 600; color: var(--color-primary);">${qty} unidades</span>
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                `;
            }

            // Alerts
            const items = await DB.getAll('inventory_items') || [];
            const itemsWithoutPhoto = [];
            for (const item of items) {
                const photos = await DB.query('inventory_photos', 'item_id', item.id);
                if (photos.length === 0) {
                    itemsWithoutPhoto.push(item);
                }
            }

            const alertsList = document.getElementById('alerts-list');
            if (alertsList) {
                const alerts = [];
                if (itemsWithoutPhoto.length > 0) {
                    alerts.push(`${itemsWithoutPhoto.length} piezas sin foto`);
                }
                
                const pendingSync = await DB.count('sync_queue', 'status', 'pending');
                if (pendingSync > 0) {
                    alerts.push(`${pendingSync} elementos pendientes de sincronizar`);
                }

                const lowStockItems = items.filter(item => item.status === 'disponible' && item.price > 0).length;
                if (lowStockItems < 10) {
                    alerts.push(`Solo ${lowStockItems} piezas disponibles`);
                }

                alertsList.innerHTML = alerts.length === 0 
                    ? '<p style="text-align: center; color: var(--color-success); padding: 20px;"><i class="fas fa-check-circle"></i> Todo en orden</p>'
                    : alerts.map(alert => `<div class="alert-item"><i class="fas fa-exclamation-triangle"></i> ${alert}</div>`).join('');
            }
        } catch (e) {
            console.error('Error loading dashboard:', e);
        }
    },

    async loadDemoData() {
        // Asegurar que se carguen productos demo
        await this.loadDemoInventory();
        // Always ensure demo data is loaded (in case of issues)
        try {
            // Load catalogs
            await this.loadCatalogs();
            
            // Load employees and users
            await this.loadEmployees();
            
            // Mark as loaded
            await DB.put('settings', {
                key: 'demo_data_loaded',
                value: 'true',
                updated_at: new Date().toISOString()
            });

            console.log('Demo data loaded/verified');
            
            // Verify users exist
            const users = await DB.getAll('users') || [];
            const employees = await DB.getAll('employees') || [];
            console.log(`Users loaded: ${Array.isArray(users) ? users.length : 'ERROR'}, Employees loaded: ${Array.isArray(employees) ? employees.length : 'ERROR'}`);
            
            if (users.length === 0 || employees.length === 0) {
                console.warn('No users or employees found, recreating...');
                await this.loadEmployees();
            }
        } catch (e) {
            console.error('Error loading demo data:', e);
            // Try again
            setTimeout(() => this.loadDemoData(), 1000);
        }
    },

    async loadCatalogs() {
        // Agencies
        const agencies = [
            { id: 'ag1', name: 'TRAVELEX', active: true },
            { id: 'ag2', name: 'VERANOS', active: true },
            { id: 'ag3', name: 'TANITOURS', active: true },
            { id: 'ag4', name: 'DISCOVERY', active: true },
            { id: 'ag5', name: 'TB', active: true },
            { id: 'ag6', name: 'TTF', active: true }
        ];

        for (const agency of agencies) {
            try {
                const existing = await DB.get('catalog_agencies', agency.id);
                if (existing) {
                    // Si existe pero no tiene código de barras, generarlo
                    if (!existing.barcode || Utils.isBarcodeEmpty(existing.barcode)) {
                        existing.barcode = Utils.generateAgencyBarcode(existing);
                        await DB.put('catalog_agencies', existing);
                    }
                } else {
                    // Nuevo registro: generar código de barras
                    agency.barcode = Utils.generateAgencyBarcode(agency);
                    await DB.put('catalog_agencies', agency);
                }
            } catch (e) {
                // Already exists
            }
        }

        // Sellers
        const sellers = [
            'SEBASTIAN', 'CALI', 'SAULA', 'ANDRES', 'ANGEL', 'SR ANGEL', 'RAMSES', 'ISAURA',
            'CARLOS', 'PACO', 'FRANCISCO', 'OMAR', 'PANDA', 'KARLA', 'JUAN CARLOS', 'NADIA',
            'JASON', 'ROBERTO', 'PEDRO', 'ANA', 'JOVA', 'EDITH', 'VERO', 'POCHIS',
            'RAMON', 'ALDAIR', 'CLAUDIA', 'SERGIO', 'MANUEL'
        ].map((name, idx) => ({
            id: `seller_${idx + 1}`,
            name: name,
            active: true,
            commission_rule: this.getSellerCommissionRule(name)
        }));

        for (const seller of sellers) {
            try {
                const existing = await DB.get('catalog_sellers', seller.id);
                if (existing) {
                    // Si existe pero no tiene código de barras, generarlo
                    if (!existing.barcode || Utils.isBarcodeEmpty(existing.barcode)) {
                        existing.barcode = Utils.generateSellerBarcode(existing);
                        await DB.put('catalog_sellers', existing);
                    }
                } else {
                    // Nuevo registro: generar código de barras
                    seller.barcode = Utils.generateSellerBarcode(seller);
                    await DB.put('catalog_sellers', seller);
                }
            } catch (e) {
                // Already exists
            }
        }

        // Guides (by agency)
        const guidesData = {
            'ag2': ['CARLOS SIS', 'MARIO RENDON', 'CHAVA', 'FREDY', 'NETO', 'EMMANUEL'],
            'ag3': ['MARINA', 'GLORIA', 'DANIELA'],
            'ag4': ['RAMON', 'GUSTAVO SIS', 'GUSTAVO LEPE', 'NOVOA', 'ERIK', 'CHILO', 'FERMIN', 'EMMA', 'HERASMO'],
            'ag1': ['MIGUEL SUAREZ', 'SANTA', 'MIGUEL DELGADILLO', 'ANDRES CHAVEZ', 'SAREM', 'ZAVALA', 'TEMO', 'ROCIO', 'NETO', 'SEBASTIAN S'],
            'ag5': ['MIGUEL IBARRA', 'ADAN', 'MIGUEL RAGA', 'GABINO', 'HECTOR SUAREZ', 'OSCAR', 'JOSE AVILES'],
            'ag6': ['HUGO', 'HILBERTO', 'JOSE MASIAS', 'DAVID BUSTOS', 'ALFONSO', 'DANIEL RIVERA', 'EDUARDO LEAL']
        };

        let guideIdx = 1;
        for (const [agencyId, guideNames] of Object.entries(guidesData)) {
            for (const name of guideNames) {
                try {
                    const guideId = `guide_${guideIdx++}`;
                    const guideData = {
                        id: guideId,
                        name: name,
                        agency_id: agencyId,
                        active: true,
                        commission_rule: name === 'MARINA' ? 'guide_marina' : 'guide_default'
                    };
                    const existing = await DB.get('catalog_guides', guideId);
                    if (existing) {
                        // Si existe pero no tiene código de barras, generarlo
                        if (!existing.barcode || Utils.isBarcodeEmpty(existing.barcode)) {
                            existing.barcode = Utils.generateGuideBarcode(existing);
                            await DB.put('catalog_guides', existing);
                        }
                    } else {
                        // Nuevo registro: generar código de barras
                        guideData.barcode = Utils.generateGuideBarcode(guideData);
                        await DB.put('catalog_guides', guideData);
                    }
                } catch (e) {
                    // Already exists
                }
            }
        }

        // Branches
        const branches = [
            { id: 'branch1', name: 'Tienda 1', address: '', active: true },
            { id: 'branch2', name: 'Tienda 2', address: '', active: true },
            { id: 'branch3', name: 'Tienda 3', address: '', active: true },
            { id: 'branch4', name: 'Tienda 4', address: '', active: true }
        ];

        for (const branch of branches) {
            try {
                await DB.put('catalog_branches', branch);
            } catch (e) {
                // Already exists
            }
        }

        // Payment Methods
        const paymentMethods = [
            { id: 'pm1', name: 'Efectivo USD', code: 'CASH_USD', active: true },
            { id: 'pm2', name: 'Efectivo MXN', code: 'CASH_MXN', active: true },
            { id: 'pm3', name: 'Efectivo EUR', code: 'CASH_EUR', active: true },
            { id: 'pm4', name: 'Efectivo CAD', code: 'CASH_CAD', active: true },
            { id: 'pm5', name: 'TPV Visa/MC', code: 'TPV_VISA', active: true },
            { id: 'pm6', name: 'TPV Amex', code: 'TPV_AMEX', active: true }
        ];

        for (const pm of paymentMethods) {
            try {
                await DB.put('payment_methods', pm);
            } catch (e) {
                // Already exists
            }
        }

        // Commission Rules
        const commissionRules = [
            { id: 'seller_sebastian', entity_type: 'seller', entity_id: 'seller_1', discount_pct: 0, multiplier: 10, active: true },
            { id: 'seller_omar_jc', entity_type: 'seller', entity_id: null, discount_pct: 20, multiplier: 7, active: true },
            { id: 'seller_default', entity_type: 'seller', entity_id: null, discount_pct: 5, multiplier: 9, active: true },
            { id: 'guide_marina', entity_type: 'guide', entity_id: null, discount_pct: 0, multiplier: 10, active: true },
            { id: 'guide_default', entity_type: 'guide', entity_id: null, discount_pct: 18, multiplier: 10, active: true }
        ];

        for (const rule of commissionRules) {
            try {
                await DB.put('commission_rules', rule);
            } catch (e) {
                // Already exists
            }
        }
    },

    getSellerCommissionRule(name) {
        if (name === 'SEBASTIAN') return 'seller_sebastian';
        if (name === 'OMAR' || name === 'JUAN CARLOS') return 'seller_omar_jc';
        return 'seller_default';
    },

    async loadEmployees() {
        // Create demo employees - always ensure they're active
        const employees = [
            { id: 'emp1', name: 'Admin', role: 'admin', branch_id: 'branch1', active: true, barcode: 'EMP001' },
            { id: 'emp2', name: 'Vendedor 1', role: 'seller', branch_id: 'branch1', active: true, barcode: 'EMP002' }
        ];

        for (const emp of employees) {
            try {
                const existing = await DB.get('employees', emp.id);
                if (existing) {
                    // Update to ensure active and barcode
                    existing.active = true;
                    if (!existing.barcode || Utils.isBarcodeEmpty(existing.barcode)) {
                        existing.barcode = Utils.generateEmployeeBarcode(existing);
                    }
                    await DB.put('employees', existing);
                } else {
                    // Nuevo registro: generar código de barras si no existe
                    if (!emp.barcode || Utils.isBarcodeEmpty(emp.barcode)) {
                        emp.barcode = Utils.generateEmployeeBarcode(emp);
                    }
                    await DB.put('employees', emp);
                }
            } catch (e) {
                console.error('Error creating employee:', e);
                // Try again
                try {
                    if (!emp.barcode || Utils.isBarcodeEmpty(emp.barcode)) {
                        emp.barcode = Utils.generateEmployeeBarcode(emp);
                    }
                    await DB.put('employees', emp);
                } catch (e2) {
                    console.error('Error retrying:', e2);
                }
            }
        }

        // Create demo users - always ensure they're active
        const pinHash = await Utils.hashPin('1234');
        const users = [
            {
                id: 'user1',
                username: 'admin',
                employee_id: 'emp1',
                role: 'admin',
                permissions: ['all'],
                active: true,
                pin_hash: pinHash
            },
            {
                id: 'user2',
                username: 'vendedor1',
                employee_id: 'emp2',
                role: 'seller',
                permissions: ['pos', 'inventory_view', 'descuentos'],
                active: true,
                pin_hash: pinHash
            }
        ];

        for (const user of users) {
            try {
                const existing = await DB.get('users', user.id);
                if (existing) {
                    // Update to ensure active
                    existing.active = true;
                    existing.pin_hash = user.pin_hash; // Ensure PIN hash is set
                    await DB.put('users', existing);
                } else {
                    await DB.put('users', user);
                }
            } catch (e) {
                console.error('Error creating user:', e);
                // Try again
                try {
                    await DB.put('users', user);
                } catch (e2) {
                    console.error('Error retrying:', e2);
                }
            }
        }

        // Create demo inventory items
        await this.loadDemoInventory();

        // Create demo customers
        await this.loadDemoCustomers();
    },

    async loadDemoInventory() {
        const demoItems = [
            {
                id: 'inv1',
                sku: 'AN001',
                barcode: 'AN001',
                name: 'Anillo Oro 18k Diamante',
                metal: 'Oro 18k',
                stone: 'Diamante',
                size: '6',
                weight_g: 5.2,
                measures: '15mm',
                cost: 8000,
                price: 0,
                location: 'Vitrina 1',
                status: 'disponible',
                branch_id: 'branch1',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            },
            {
                id: 'inv2',
                sku: 'PU002',
                barcode: 'PU002',
                name: 'Pulsera Plata Sterling',
                metal: 'Plata 925',
                stone: 'Sin piedra',
                size: 'Mediana',
                weight_g: 12.5,
                measures: '18cm',
                cost: 2000,
                price: 0,
                location: 'Vitrina 2',
                status: 'disponible',
                branch_id: 'branch1',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            },
            {
                id: 'inv3',
                sku: 'CO003',
                barcode: 'CO003',
                name: 'Collar Oro 14k Perlas',
                metal: 'Oro 14k',
                stone: 'Perlas',
                size: '45cm',
                weight_g: 8.3,
                measures: '45cm',
                cost: 5000,
                price: 0,
                location: 'Vitrina 1',
                status: 'disponible',
                branch_id: 'branch1',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            },
            {
                id: 'inv4',
                sku: 'AR004',
                barcode: 'AR004',
                name: 'Aretes Oro 18k Esmeraldas',
                metal: 'Oro 18k',
                stone: 'Esmeraldas',
                size: 'Mediana',
                weight_g: 3.5,
                measures: '2cm',
                cost: 6000,
                price: 0,
                location: 'Vitrina 1',
                status: 'disponible',
                branch_id: 'branch1',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            },
            {
                id: 'inv5',
                sku: 'AN005',
                barcode: 'AN005',
                name: 'Anillo Plata 925 Zafiro',
                metal: 'Plata 925',
                stone: 'Zafiro',
                size: '7',
                weight_g: 4.8,
                measures: '16mm',
                cost: 3500,
                price: 0,
                location: 'Vitrina 2',
                status: 'disponible',
                branch_id: 'branch1',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }
        ];

        let created = 0;
        for (const item of demoItems) {
            try {
                // Verificar si ya existe
                const existing = await DB.get('inventory_items', item.id);
                if (!existing) {
                    await DB.put('inventory_items', item);
                    created++;
                }
            } catch (e) {
                console.error(`Error creando item ${item.id}:`, e);
            }
        }
        console.log(`Productos demo creados: ${created} de ${demoItems.length}`);
        return created;
    },

    async loadDemoCustomers() {
        const demoCustomers = [
            {
                id: 'cust1',
                name: 'María González',
                email: 'maria.gonzalez@email.com',
                phone: '5551234567',
                notes: 'Cliente frecuente, prefiere anillos',
                created_at: new Date().toISOString()
            },
            {
                id: 'cust2',
                name: 'Juan Pérez',
                email: 'juan.perez@email.com',
                phone: '5559876543',
                notes: '',
                created_at: new Date().toISOString()
            }
        ];

        for (const customer of demoCustomers) {
            try {
                await DB.put('customers', customer);
            } catch (e) {
                // Already exists
            }
        }
    },

    async verifyAndFixBarcodes() {
        try {
            // Verificar y corregir empleados
            const employees = await DB.getAll('employees') || [];
            for (const emp of employees) {
                if (!emp.barcode || Utils.isBarcodeEmpty(emp.barcode)) {
                    emp.barcode = Utils.generateEmployeeBarcode(emp);
                    await DB.put('employees', emp);
                }
            }

            // Verificar y corregir vendedores
            const sellers = await DB.getAll('catalog_sellers') || [];
            for (const seller of sellers) {
                if (!seller.barcode || Utils.isBarcodeEmpty(seller.barcode)) {
                    seller.barcode = Utils.generateSellerBarcode(seller);
                    await DB.put('catalog_sellers', seller);
                }
            }

            // Verificar y corregir guías
            const guides = await DB.getAll('catalog_guides') || [];
            for (const guide of guides) {
                if (!guide.barcode || Utils.isBarcodeEmpty(guide.barcode)) {
                    guide.barcode = Utils.generateGuideBarcode(guide);
                    await DB.put('catalog_guides', guide);
                }
            }

            // Verificar y corregir agencias
            const agencies = await DB.getAll('catalog_agencies') || [];
            for (const agency of agencies) {
                if (!agency.barcode || Utils.isBarcodeEmpty(agency.barcode)) {
                    agency.barcode = Utils.generateAgencyBarcode(agency);
                    await DB.put('catalog_agencies', agency);
                }
            }

            // Verificar items de inventario
            const items = await DB.getAll('inventory_items') || [];
            for (const item of items) {
                if (!item.barcode || Utils.isBarcodeEmpty(item.barcode)) {
                    item.barcode = item.sku || `ITEM${item.id.substring(0, 6).toUpperCase()}`;
                    await DB.put('inventory_items', item);
                }
            }

            console.log('Códigos de barras verificados y corregidos');
        } catch (e) {
            console.error('Error verificando códigos de barras:', e);
        }
    }
};

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => App.init());
} else {
    App.init();
}

