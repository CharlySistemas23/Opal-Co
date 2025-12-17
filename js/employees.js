// Employees & Users Management Module

const Employees = {
    initialized: false,
    
    async init() {
        if (this.initialized) return;
        this.setupUI();
        await this.loadEmployees();
        this.initialized = true;
    },

    setupUI() {
        const content = document.getElementById('module-content');
        if (!content) return;

        content.innerHTML = `
            <div style="margin-bottom: var(--spacing-md); display: flex; gap: var(--spacing-xs); align-items: center;">
                <button class="btn-primary" id="employee-add-btn">Nuevo</button>
                <button class="btn-secondary" id="employee-export-btn">Exportar</button>
                <span id="employee-current-tab" style="margin-left: auto; font-size: 11px; color: var(--color-text-secondary);"></span>
            </div>
            <div id="employees-tabs" class="tabs-container">
                <button class="tab-btn active" data-tab="employees"><i class="fas fa-user-tie"></i> Empleados</button>
                <button class="tab-btn" data-tab="users">🔐 Usuarios</button>
                <button class="tab-btn" data-tab="sellers"><i class="fas fa-user-tag"></i> Vendedores</button>
                <button class="tab-btn" data-tab="guides"><i class="fas fa-suitcase"></i> Guías</button>
                <button class="tab-btn" data-tab="agencies">🏢 Agencias</button>
            </div>
            <div id="employees-content"></div>
        `;

        // Event listeners dinámicos
        document.getElementById('employee-add-btn')?.addEventListener('click', () => this.handleAddClick());
        document.getElementById('employee-export-btn')?.addEventListener('click', () => this.handleExportClick());
        
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                const tab = e.target.dataset.tab;
                this.currentTab = tab;
                this.loadTab(tab);
            });
        });

        this.currentTab = 'employees';
        // Cargar la pestaña inicial
        this.loadTab('employees');
    },

    handleAddClick() {
        const tab = this.currentTab || 'employees';
        switch(tab) {
            case 'employees':
                this.showAddEmployeeForm();
                break;
            case 'users':
                this.showAddUserForm();
                break;
            case 'sellers':
                this.showAddSellerForm();
                break;
            case 'guides':
                this.showAddGuideForm();
                break;
            case 'agencies':
                this.showAddAgencyForm();
                break;
        }
    },

    handleExportClick() {
        const tab = this.currentTab || 'employees';
        switch(tab) {
            case 'employees':
                this.exportEmployees();
                break;
            case 'users':
                this.exportUsers();
                break;
            case 'sellers':
                this.exportSellers();
                break;
            case 'guides':
                this.exportGuides();
                break;
            case 'agencies':
                this.exportAgencies();
                break;
        }
    },

    async loadTab(tab) {
        const tabNameEl = document.getElementById('employee-current-tab');
        if (tabNameEl) {
            const names = {
                'employees': 'Empleados',
                'users': 'Usuarios',
                'sellers': 'Vendedores',
                'guides': 'Guías',
                'agencies': 'Agencias'
            };
            tabNameEl.textContent = names[tab] || '';
        }

        switch(tab) {
            case 'employees':
                await this.loadEmployees();
                break;
            case 'users':
                await this.loadUsers();
                break;
            case 'sellers':
                await this.loadSellers();
                break;
            case 'guides':
                await this.loadGuides();
                break;
            case 'agencies':
                await this.loadAgencies();
                break;
        }
    },

    async loadEmployees() {
        const content = document.getElementById('employees-content');
        if (!content) return;

        try {
            const employees = await DB.getAll('employees') || [];
            const branches = await DB.getAll('catalog_branches') || [];
            const sales = await DB.getAll('sales') || [];
            
            // Obtener estadísticas de ventas por empleado
            const employeesWithStats = employees.map(emp => {
                // Buscar ventas donde el empleado está relacionado
                // Buscar por employee_id si existe en las ventas
                const directSales = sales.filter(s => s.employee_id === emp.id);
                
                // También buscar por seller_id si coincide con algún vendedor relacionado
                // Por ahora solo buscamos ventas directas
                const allSales = directSales;
                
                const completedSales = allSales.filter(s => s && s.status === 'completada');
                const totalSales = completedSales.reduce((sum, s) => sum + (s.total || 0), 0);
                const avgSale = completedSales.length > 0 ? totalSales / completedSales.length : 0;
                
                return {
                    ...emp,
                    salesCount: completedSales.length,
                    totalSales,
                    avgSale
                };
            });
            
            // Mostrar estadísticas generales
            await this.displayEmployeeStats(employeesWithStats);

            content.innerHTML = `
                <div style="overflow-x: auto; width: 100%; max-width: 100%; box-sizing: border-box;">
                    <table class="cart-table" style="width: 100%; max-width: 100%; table-layout: auto; min-width: 1000px;">
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Rol</th>
                            <th>Sucursal</th>
                            <th>Ventas</th>
                            <th>Total Vendido</th>
                            <th>Barcode</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${employeesWithStats.map(emp => {
                            const branch = branches.find(b => b.id === emp.branch_id);
                            return `
                                <tr>
                                    <td><strong>${emp.name}</strong></td>
                                    <td>${emp.role || 'N/A'}</td>
                                    <td>${branch?.name || 'N/A'}</td>
                                    <td>${emp.salesCount || 0}</td>
                                        <td style="font-weight: 600;">${Utils.formatCurrency(emp.totalSales || 0)}</td>
                                    <td>${emp.barcode || 'N/A'}</td>
                                        <td><span class="status-badge status-${emp.active ? 'disponible' : 'vendida'}">${emp.active ? 'Activo' : 'Inactivo'}</span></td>
                                    <td>
                                        <button class="btn-secondary btn-sm" onclick="window.Employees.editEmployee('${emp.id}')">Editar</button>
                                        <button class="btn-secondary btn-sm" onclick="window.Employees.generateBarcode('${emp.id}')">Barcode</button>
                                        ${emp.salesCount > 0 ? `
                                            <button class="btn-secondary btn-sm" onclick="window.Employees.showEmployeeStats('${emp.id}')">
                                                <i class="fas fa-chart-line"></i>
                                            </button>
                                        ` : ''}
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
                </div>
            `;
        } catch (e) {
            console.error('Error loading employees:', e);
        }
    },
    
    
    async displayEmployeeStats(employees) {
        let statsContainer = document.getElementById('employees-stats');
        if (!statsContainer) {
            const content = document.getElementById('employees-content');
            if (content && content.parentNode) {
                statsContainer = document.createElement('div');
                statsContainer.id = 'employees-stats';
                statsContainer.style.marginBottom = 'var(--spacing-xl)';
                content.parentNode.insertBefore(statsContainer, content);
            }
        }
        
        if (!statsContainer) return;
        
        const activeEmployees = employees.filter(e => e.active).length;
        const totalSales = employees.reduce((sum, e) => sum + (e.totalSales || 0), 0);
        const totalSalesCount = employees.reduce((sum, e) => sum + (e.salesCount || 0), 0);
        const avgSalesPerEmployee = activeEmployees > 0 ? totalSales / activeEmployees : 0;
        
        // Top empleados por ventas
        const topEmployees = employees
            .filter(e => e.totalSales > 0)
            .sort((a, b) => b.totalSales - a.totalSales)
            .slice(0, 5);
        
        const maxEmployeeSales = Math.max(...topEmployees.map(e => e.totalSales), 1);
        
        statsContainer.innerHTML = `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: var(--spacing-md); margin-bottom: var(--spacing-lg); width: 100%; max-width: 100%; box-sizing: border-box;">
                <div class="kpi-card" style="min-width: 0; width: 100%; box-sizing: border-box;">
                    <div class="kpi-label">Total Empleados</div>
                    <div class="kpi-value">${employees.length}</div>
                </div>
                <div class="kpi-card" style="min-width: 0; width: 100%; box-sizing: border-box;">
                    <div class="kpi-label">Empleados Activos</div>
                    <div class="kpi-value">${activeEmployees}</div>
                </div>
                <div class="kpi-card" style="min-width: 0; width: 100%; box-sizing: border-box;">
                    <div class="kpi-label">Total Ventas</div>
                    <div class="kpi-value">${totalSalesCount}</div>
                </div>
                <div class="kpi-card" style="min-width: 0; width: 100%; box-sizing: border-box;">
                    <div class="kpi-label">Ingresos Totales</div>
                    <div class="kpi-value">${Utils.formatCurrency(totalSales)}</div>
                </div>
                <div class="kpi-card" style="min-width: 0; width: 100%; box-sizing: border-box;">
                    <div class="kpi-label">Promedio por Empleado</div>
                    <div class="kpi-value">${Utils.formatCurrency(avgSalesPerEmployee)}</div>
                </div>
            </div>
            
            ${topEmployees.length > 0 ? `
                <div class="dashboard-section" style="width: 100%; max-width: 100%; box-sizing: border-box;">
                    <h3 style="font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: var(--spacing-sm);">Top Empleados por Ventas</h3>
                    <div style="background: var(--color-bg-secondary); padding: var(--spacing-md); border-radius: var(--radius-md); margin-top: var(--spacing-sm); width: 100%; box-sizing: border-box;">
                        ${topEmployees.map((emp, idx) => {
                            const width = maxEmployeeSales > 0 ? (emp.totalSales / maxEmployeeSales * 100) : 0;
                            return `
                                <div style="margin-bottom: var(--spacing-sm); min-width: 0; width: 100%; box-sizing: border-box;">
                                    <div style="display: flex; justify-content: space-between; margin-bottom: 4px; min-width: 0;">
                                        <div style="min-width: 0; overflow: hidden; text-overflow: ellipsis;">
                                            <span style="font-weight: 600; color: var(--color-primary); font-size: 10px;">#${idx + 1}</span>
                                            <span style="margin-left: var(--spacing-xs); font-weight: 600; font-size: 11px;">${emp.name}</span>
                                            <div style="font-size: 9px; color: var(--color-text-secondary);">
                                                ${emp.salesCount} ventas • Prom: ${Utils.formatCurrency(emp.avgSale || 0)}
                                            </div>
                                        </div>
                                        <div style="font-size: 14px; font-weight: 600; white-space: nowrap; margin-left: var(--spacing-xs);">
                                            ${Utils.formatCurrency(emp.totalSales)}
                                        </div>
                                    </div>
                                    <div style="width: 100%; height: 18px; background: var(--color-border-light); border-radius: var(--radius-full); overflow: hidden; box-sizing: border-box;">
                                        <div style="width: ${width}%; height: 100%; background: var(--gradient-accent); transition: width 0.3s;"></div>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            ` : ''}
        `;
    },
    
    async showEmployeeStats(employeeId) {
        const employee = await DB.get('employees', employeeId);
        if (!employee) return;
        
        const sales = await DB.getAll('sales') || [];
        const employeeSales = sales.filter(s => {
            // Buscar ventas relacionadas con este empleado
            return s.employee_id === employeeId;
        });
        
        const completedSales = employeeSales.filter(s => s.status === 'completada');
        const totalSales = completedSales.reduce((sum, s) => sum + (s.total || 0), 0);
        const avgSale = completedSales.length > 0 ? totalSales / completedSales.length : 0;
        
        // Ventas por mes
        const monthlyStats = {};
        completedSales.forEach(sale => {
            const saleDate = new Date(sale.created_at);
            const monthKey = `${saleDate.getFullYear()}-${String(saleDate.getMonth() + 1).padStart(2, '0')}`;
            if (!monthlyStats[monthKey]) {
                monthlyStats[monthKey] = { count: 0, total: 0 };
            }
            monthlyStats[monthKey].count += 1;
            monthlyStats[monthKey].total += sale.total || 0;
        });
        
        const monthlyData = Object.entries(monthlyStats)
            .map(([month, stats]) => ({ month, ...stats }))
            .sort((a, b) => a.month.localeCompare(b.month))
            .slice(-6);
        
        const maxMonthly = Math.max(...monthlyData.map(m => m.total), 1);
        
        const body = `
            <div class="dashboard-section">
                <h3>Estadísticas de ${employee.name}</h3>
                <div class="dashboard-grid" style="margin-bottom: var(--spacing-lg);">
                    <div class="kpi-card">
                        <div class="kpi-label">Total Ventas</div>
                        <div class="kpi-value">${completedSales.length}</div>
                    </div>
                    <div class="kpi-card">
                        <div class="kpi-label">Total Vendido</div>
                        <div class="kpi-value">${Utils.formatCurrency(totalSales)}</div>
                    </div>
                    <div class="kpi-card">
                        <div class="kpi-label">Ticket Promedio</div>
                        <div class="kpi-value">${Utils.formatCurrency(avgSale)}</div>
                    </div>
                </div>
                
                ${monthlyData.length > 0 ? `
                    <h3>Ventas por Mes</h3>
                    <div style="background: var(--color-bg-secondary); padding: var(--spacing-lg); border-radius: var(--radius-md); margin-top: var(--spacing-md);">
                        <div style="display: flex; align-items: flex-end; gap: 3px; height: 140px;">
                            ${monthlyData.map(month => {
                                const height = maxMonthly > 0 ? (month.total / maxMonthly * 100) : 0;
                                const monthName = new Date(month.month + '-01').toLocaleDateString('es', { month: 'short' });
                                return `
                                    <div style="flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px;">
                                        <div style="flex: 1; display: flex; align-items: flex-end; width: 100%;">
                                            <div style="width: 100%; background: linear-gradient(180deg, var(--color-primary) 0%, var(--color-accent) 100%); 
                                                border-radius: var(--radius-xs) var(--radius-xs) 0 0; 
                                                height: ${height}%; 
                                                min-height: ${month.total > 0 ? '3px' : '0'};"></div>
                                        </div>
                                        <div style="font-size: 9px; color: var(--color-text-secondary); text-align: center;">
                                            <div>${monthName}</div>
                                            <div style="font-weight: 600; color: var(--color-text); margin-top: 2px; font-size: 10px;">${Utils.formatCurrency(month.total)}</div>
                                            <div style="font-size: 8px; color: var(--color-text-secondary);">${month.count}</div>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
        
        UI.showModal(`Estadísticas: ${employee.name}`, body, '<button class="btn-primary" onclick="UI.closeModal()">Cerrar</button>');
    },

    async loadUsers() {
        const content = document.getElementById('employees-content');
        if (!content) return;

        try {
            const users = await DB.getAll('users');
            const employees = await DB.getAll('employees');

            content.innerHTML = `
                <table class="cart-table">
                    <thead>
                        <tr>
                            <th>Username</th>
                            <th>Empleado</th>
                            <th>Rol</th>
                            <th>Permisos</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${users.map(user => {
                            const emp = employees.find(e => e.id === user.employee_id);
                            return `
                                <tr>
                                    <td>${user.username}</td>
                                    <td>${emp?.name || 'N/A'}</td>
                                    <td>${user.role || 'N/A'}</td>
                                    <td>${user.permissions?.length || 0} permisos</td>
                                    <td>${user.active ? 'Activo' : 'Inactivo'}</td>
                                    <td>
                                        <button class="btn-secondary btn-sm" onclick="window.Employees.editUser('${user.id}')">Editar</button>
                                        <button class="btn-secondary btn-sm" onclick="window.Employees.resetPin('${user.id}')">Reset PIN</button>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
                <button class="btn-primary btn-sm" style="margin-top: var(--spacing-sm);" onclick="window.Employees.showAddUserForm()">Nuevo Usuario</button>
            `;
        } catch (e) {
            console.error('Error loading users:', e);
        }
    },

    async showAddEmployeeForm(employeeId = null) {
        const employee = employeeId ? await DB.get('employees', employeeId) : null;
        const branches = await DB.getAll('catalog_branches');

        const body = `
            <form id="employee-form">
                <div class="form-group">
                    <label>Nombre *</label>
                    <input type="text" id="emp-name" class="form-input" value="${employee?.name || ''}" required>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Rol</label>
                        <select id="emp-role" class="form-select">
                            <option value="seller" ${employee?.role === 'seller' ? 'selected' : ''}>Vendedor</option>
                            <option value="admin" ${employee?.role === 'admin' ? 'selected' : ''}>Administrador</option>
                            <option value="manager" ${employee?.role === 'manager' ? 'selected' : ''}>Gerente</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Sucursal</label>
                        <select id="emp-branch" class="form-select">
                            ${branches.map(b => `<option value="${b.id}" ${employee?.branch_id === b.id ? 'selected' : ''}>${b.name}</option>`).join('')}
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label>Código de Barras</label>
                    <input type="text" id="emp-barcode" class="form-input" value="${employee?.barcode || ''}">
                    <button type="button" class="btn-secondary btn-sm" onclick="window.Employees.generateBarcodeForForm()" style="margin-top: var(--spacing-xs);">Generar</button>
                </div>
                <div class="form-group">
                    <label>Estado</label>
                    <select id="emp-active" class="form-select">
                        <option value="true" ${employee?.active !== false ? 'selected' : ''}>Activo</option>
                        <option value="false" ${employee?.active === false ? 'selected' : ''}>Inactivo</option>
                    </select>
                </div>
                ${employee?.barcode ? `
                <div style="text-align: center; margin: var(--spacing-md) 0;">
                    <svg id="emp-barcode-preview"></svg>
                </div>
                ` : ''}
            </form>
        `;

        const footer = `
            <button class="btn-secondary" onclick="UI.closeModal()">Cancelar</button>
            <button class="btn-primary" onclick="window.Employees.saveEmployee('${employeeId || ''}')">Guardar</button>
        `;

        UI.showModal(employeeId ? 'Editar Empleado' : 'Nuevo Empleado', body, footer);

        if (employee?.barcode) {
            setTimeout(() => {
                BarcodeManager.generateCode128(employee.barcode, 'emp-barcode-preview');
            }, 100);
        }
    },

    generateBarcodeForForm() {
        const name = document.getElementById('emp-name').value;
        if (!name) {
            Utils.showNotification('Ingresa un nombre primero', 'error');
            return;
        }
        const barcode = `EMP${name.toUpperCase().replace(/\s+/g, '').substring(0, 6)}${Date.now().toString().slice(-4)}`;
        document.getElementById('emp-barcode').value = barcode;
    },

    async saveEmployee(employeeId) {
        const form = document.getElementById('employee-form');
        if (!form || !form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const employee = {
            id: employeeId || Utils.generateId(),
            name: document.getElementById('emp-name').value,
            role: document.getElementById('emp-role').value,
            branch_id: document.getElementById('emp-branch').value,
            barcode: document.getElementById('emp-barcode').value || null,
            active: document.getElementById('emp-active').value === 'true',
            created_at: employeeId ? (await DB.get('employees', employeeId))?.created_at : new Date().toISOString()
        };

        await DB.put('employees', employee);
        await SyncManager.addToQueue('employee', employee.id);

        Utils.showNotification(employeeId ? 'Empleado actualizado' : 'Empleado agregado', 'success');
        UI.closeModal();
        this.loadEmployees();
    },

    async editEmployee(employeeId) {
        await this.showAddEmployeeForm(employeeId);
    },

    async generateBarcode(employeeId) {
        const employee = await DB.get('employees', employeeId);
        if (!employee) return;

        if (!employee.barcode) {
            const barcode = `EMP${employee.name.toUpperCase().replace(/\s+/g, '').substring(0, 6)}${Date.now().toString().slice(-4)}`;
            employee.barcode = barcode;
            await DB.put('employees', employee);
        }

        await BarcodeManager.printBarcodeLabel({
            sku: employee.barcode,
            name: employee.name,
            barcode: employee.barcode,
            price: 0
        });
    },

    async showAddUserForm(userId = null) {
        const user = userId ? await DB.get('users', userId) : null;
        const employees = await DB.getAll('employees');

        const permissions = [
            'descuentos', 'cancelaciones', 'devoluciones', 'editar_costo',
            'export', 'tipo_cambio', 'catalogos', 'ver_utilidades'
        ];

        const body = `
            <form id="user-form">
                <div class="form-group">
                    <label>Username *</label>
                    <input type="text" id="user-username" class="form-input" value="${user?.username || ''}" required>
                </div>
                <div class="form-group">
                    <label>Empleado</label>
                    <select id="user-employee" class="form-select">
                        <option value="">Seleccionar...</option>
                        ${employees.map(e => `<option value="${e.id}" ${user?.employee_id === e.id ? 'selected' : ''}>${e.name}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Rol</label>
                    <select id="user-role" class="form-select">
                        <option value="seller" ${user?.role === 'seller' ? 'selected' : ''}>Vendedor</option>
                        <option value="admin" ${user?.role === 'admin' ? 'selected' : ''}>Administrador</option>
                        <option value="manager" ${user?.role === 'manager' ? 'selected' : ''}>Gerente</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>PIN (dejar vacío para mantener actual)</label>
                    <input type="password" id="user-pin" class="form-input" maxlength="6" placeholder="6 dígitos">
                </div>
                <div class="form-group">
                    <label>Permisos</label>
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--spacing-sm); margin-top: var(--spacing-sm);">
                        ${permissions.map(perm => `
                            <label style="display: flex; align-items: center; gap: 5px;">
                                <input type="checkbox" value="${perm}" ${user?.permissions?.includes(perm) ? 'checked' : ''}>
                                ${perm.replace(/_/g, ' ')}
                            </label>
                        `).join('')}
                    </div>
                </div>
                <div class="form-group">
                    <label>Estado</label>
                    <select id="user-active" class="form-select">
                        <option value="true" ${user?.active !== false ? 'selected' : ''}>Activo</option>
                        <option value="false" ${user?.active === false ? 'selected' : ''}>Inactivo</option>
                    </select>
                </div>
            </form>
        `;

        const footer = `
            <button class="btn-secondary" onclick="UI.closeModal()">Cancelar</button>
            <button class="btn-primary" onclick="window.Employees.saveUser('${userId || ''}')">Guardar</button>
        `;

        UI.showModal(userId ? 'Editar Usuario' : 'Nuevo Usuario', body, footer);
    },

    async saveUser(userId) {
        const form = document.getElementById('user-form');
        if (!form || !form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const pinInput = document.getElementById('user-pin').value;
        let pinHash = null;
        if (pinInput && pinInput.length >= 4) {
            pinHash = await Utils.hashPin(pinInput);
        } else if (userId) {
            const existing = await DB.get('users', userId);
            pinHash = existing.pin_hash;
        }

        const checkboxes = document.querySelectorAll('#user-form input[type="checkbox"]:checked');
        const permissions = Array.from(checkboxes).map(cb => cb.value);

        const user = {
            id: userId || Utils.generateId(),
            username: document.getElementById('user-username').value,
            employee_id: document.getElementById('user-employee').value || null,
            role: document.getElementById('user-role').value,
            pin_hash: pinHash,
            permissions: permissions,
            active: document.getElementById('user-active').value === 'true',
            created_at: userId ? (await DB.get('users', userId))?.created_at : new Date().toISOString()
        };

        await DB.put('users', user);
        await SyncManager.addToQueue('user', user.id);

        Utils.showNotification(userId ? 'Usuario actualizado' : 'Usuario agregado', 'success');
        UI.closeModal();
        this.loadUsers();
    },

    async editUser(userId) {
        await this.showAddUserForm(userId);
    },

    async resetPin(userId) {
        if (!await Utils.confirm('¿Resetear PIN de este usuario?')) return;

        const newPin = prompt('Ingresa nuevo PIN (4-6 dígitos):');
        if (!newPin || newPin.length < 4) {
            Utils.showNotification('PIN inválido', 'error');
            return;
        }

        const user = await DB.get('users', userId);
        if (!user) return;

        user.pin_hash = await Utils.hashPin(newPin);
        await DB.put('users', user);

        Utils.showNotification('PIN actualizado', 'success');
    },

    // ========== VENDEDORES ==========
    async loadSellers() {
        const content = document.getElementById('employees-content');
        if (!content) return;

        try {
            const sellers = await DB.getAll('catalog_sellers') || [];
            
            // Verificar que los códigos de barras se lean correctamente
            sellers.forEach(seller => {
                if (Utils.isBarcodeEmpty(seller.barcode)) {
                    console.log(`Vendedor ${seller.id} (${seller.name}) sin código de barras`);
                }
            });

            content.innerHTML = `
                <table class="cart-table">
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Regla Comisión</th>
                            <th>Barcode</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${sellers.length === 0 ? '<tr><td colspan="5" style="text-align: center; padding: var(--spacing-md);">No hay vendedores</td></tr>' : sellers.map(seller => {
                            const barcode = Utils.isBarcodeEmpty(seller.barcode) ? 'Sin código' : seller.barcode;
                            return `
                            <tr>
                                <td>${seller.name || 'N/A'}</td>
                                <td>${seller.commission_rule || 'N/A'}</td>
                                <td>${barcode}</td>
                                <td>${seller.active !== false ? 'Activo' : 'Inactivo'}</td>
                                <td>
                                    <button class="btn-secondary btn-sm" onclick="window.Employees.editSeller('${seller.id}')">Editar</button>
                                    <button class="btn-secondary btn-sm" onclick="window.Employees.generateSellerBarcode('${seller.id}')">Barcode</button>
                                </td>
                            </tr>
                        `;
                        }).join('')}
                    </tbody>
                </table>
            `;
        } catch (e) {
            console.error('Error loading sellers:', e);
            content.innerHTML = '<p style="text-align: center; padding: var(--spacing-md);">Error al cargar vendedores</p>';
        }
    },

    async showAddSellerForm(sellerId = null) {
        const seller = sellerId ? await DB.get('catalog_sellers', sellerId) : null;
        const commissionRules = await DB.getAll('commission_rules') || [];
        const sellerRules = commissionRules.filter(r => r.entity_type === 'seller');

        const body = `
            <form id="seller-form">
                <div class="form-group">
                    <label>Nombre *</label>
                    <input type="text" id="seller-name" class="form-input" value="${seller?.name || ''}" required>
                </div>
                <div class="form-group">
                    <label>Regla de Comisión</label>
                    <select id="seller-commission-rule" class="form-select">
                        <option value="">Sin regla</option>
                        ${sellerRules.map(rule => `
                            <option value="${rule.id}" ${seller?.commission_rule === rule.id ? 'selected' : ''}>
                                ${rule.id} (${rule.discount_pct}% desc, ${rule.multiplier}x)
                            </option>
                        `).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Código de Barras</label>
                    <input type="text" id="seller-barcode" class="form-input" value="${seller?.barcode || ''}">
                    <button type="button" class="btn-secondary" onclick="window.Employees.generateSellerBarcodeForForm()" style="margin-top: 5px;">Generar</button>
                </div>
                <div class="form-group">
                    <label>Estado</label>
                    <select id="seller-active" class="form-select">
                        <option value="true" ${seller?.active !== false ? 'selected' : ''}>Activo</option>
                        <option value="false" ${seller?.active === false ? 'selected' : ''}>Inactivo</option>
                    </select>
                </div>
                ${seller?.barcode ? `
                <div style="text-align: center; margin: var(--spacing-md) 0;">
                    <svg id="seller-barcode-preview"></svg>
                </div>
                ` : ''}
            </form>
        `;

        const footer = `
            <button class="btn-secondary" onclick="UI.closeModal()">Cancelar</button>
            <button class="btn-primary" onclick="window.Employees.saveSeller('${sellerId || ''}')">Guardar</button>
        `;

        UI.showModal(sellerId ? 'Editar Vendedor' : 'Nuevo Vendedor', body, footer);

        if (seller?.barcode) {
            setTimeout(() => {
                BarcodeManager.generateCode128(seller.barcode, 'seller-barcode-preview');
            }, 100);
        }
    },

    generateSellerBarcodeForForm() {
        const name = document.getElementById('seller-name').value;
        if (!name) {
            Utils.showNotification('Ingresa un nombre primero', 'error');
            return;
        }
        const seller = { name: name };
        const barcode = Utils.generateSellerBarcode(seller);
        document.getElementById('seller-barcode').value = barcode;
    },

    async saveSeller(sellerId) {
        const form = document.getElementById('seller-form');
        if (!form) return;

        const name = document.getElementById('seller-name')?.value.trim();
        if (!name) {
            Utils.showNotification('El nombre es requerido', 'error');
            return;
        }

        try {
            // Obtener el registro existente si existe para preservar todas las propiedades
            const existing = sellerId ? await DB.get('catalog_sellers', sellerId) : null;
            
            const seller = existing ? {
                ...existing, // Preservar todas las propiedades existentes
                id: sellerId,
                name: name,
                commission_rule: document.getElementById('seller-commission-rule')?.value || null,
                active: document.getElementById('seller-active')?.value === 'true',
                updated_at: new Date().toISOString()
            } : {
                id: sellerId || `seller_${Date.now()}`,
                name: name,
                commission_rule: document.getElementById('seller-commission-rule')?.value || null,
                active: document.getElementById('seller-active')?.value === 'true',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            // Manejar código de barras: usar el del formulario o generar uno nuevo
            const formBarcode = document.getElementById('seller-barcode')?.value.trim();
            if (formBarcode && formBarcode !== '') {
                seller.barcode = formBarcode;
            } else if (!seller.barcode || Utils.isBarcodeEmpty(seller.barcode)) {
                // Generar código usando la función centralizada
                seller.barcode = Utils.generateSellerBarcode(seller);
            }

            console.log('Guardando vendedor:', seller);
            await DB.put('catalog_sellers', seller);
            
            // Verificar que se guardó correctamente
            const saved = await DB.get('catalog_sellers', seller.id);
            if (!saved || saved.barcode !== seller.barcode) {
                console.error('Error: El código de barras no se guardó correctamente', { saved, expected: seller.barcode });
                throw new Error('Error al guardar código de barras');
            }
            Utils.showNotification(sellerId ? 'Vendedor actualizado' : 'Vendedor creado', 'success');
            UI.closeModal();
            await this.loadSellers();
            
            // Agregar a cola de sincronización
            await SyncManager.addToQueue('catalog_seller', seller.id);
        } catch (e) {
            console.error('Error saving seller:', e);
            Utils.showNotification('Error al guardar vendedor', 'error');
        }
    },

    async editSeller(sellerId) {
        await this.showAddSellerForm(sellerId);
    },

    async generateSellerBarcode(sellerId) {
        try {
            const seller = await DB.get('catalog_sellers', sellerId);
            if (!seller) {
                Utils.showNotification('Vendedor no encontrado', 'error');
                return;
            }

            seller.barcode = Utils.generateSellerBarcode(seller);
            await DB.put('catalog_sellers', seller);
            Utils.showNotification('Código de barras generado', 'success');
            await this.loadSellers();
        } catch (e) {
            console.error('Error generating seller barcode:', e);
            Utils.showNotification('Error al generar código de barras', 'error');
        }
    },

    async exportSellers() {
        try {
            const sellers = await DB.getAll('catalog_sellers') || [];
            const exportData = sellers.map(s => ({
                'ID': s.id,
                'Nombre': s.name,
                'Regla Comisión': s.commission_rule || 'N/A',
                'Código de Barras': s.barcode || 'Sin código',
                'Estado': s.active !== false ? 'Activo' : 'Inactivo',
                'Creado': Utils.formatDate(s.created_at, 'DD/MM/YYYY HH:mm'),
                'Actualizado': Utils.formatDate(s.updated_at, 'DD/MM/YYYY HH:mm')
            }));

            const format = prompt('Formato de exportación:\n1. CSV\n2. Excel\n3. PDF', '2');
            const date = new Date().toISOString().split('T')[0];
            
            if (format === '1') {
                Utils.exportToCSV(exportData, `vendedores_${date}.csv`);
            } else if (format === '2') {
                Utils.exportToExcel(exportData, `vendedores_${date}.xlsx`);
            } else {
                Utils.exportToPDF(exportData, `vendedores_${date}.pdf`, 'Vendedores');
            }
        } catch (e) {
            console.error('Error exporting sellers:', e);
            Utils.showNotification('Error al exportar', 'error');
        }
    },

    // ========== GUÍAS ==========
    async loadGuides() {
        const content = document.getElementById('employees-content');
        if (!content) return;

        try {
            const guides = await DB.getAll('catalog_guides') || [];
            const agencies = await DB.getAll('catalog_agencies') || [];
            
            // Verificar que los códigos de barras se lean correctamente
            guides.forEach(guide => {
                if (Utils.isBarcodeEmpty(guide.barcode)) {
                    console.log(`Guía ${guide.id} (${guide.name}) sin código de barras`);
                }
            });

            content.innerHTML = `
                <table class="cart-table">
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Agencia</th>
                            <th>Regla Comisión</th>
                            <th>Barcode</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${guides.length === 0 ? '<tr><td colspan="6" style="text-align: center; padding: var(--spacing-md);">No hay guías</td></tr>' : guides.map(guide => {
                            const agency = agencies.find(a => a.id === guide.agency_id);
                            const barcode = Utils.isBarcodeEmpty(guide.barcode) ? 'Sin código' : guide.barcode;
                            return `
                                <tr>
                                    <td>${guide.name || 'N/A'}</td>
                                    <td>${agency?.name || 'N/A'}</td>
                                    <td>${guide.commission_rule || 'N/A'}</td>
                                    <td>${barcode}</td>
                                    <td>${guide.active !== false ? 'Activo' : 'Inactivo'}</td>
                                    <td>
                                        <button class="btn-secondary btn-sm" onclick="window.Employees.editGuide('${guide.id}')">Editar</button>
                                        <button class="btn-secondary btn-sm" onclick="window.Employees.generateGuideBarcode('${guide.id}')">Barcode</button>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            `;
        } catch (e) {
            console.error('Error loading guides:', e);
            content.innerHTML = '<p style="text-align: center; padding: var(--spacing-md);">Error al cargar guías</p>';
        }
    },

    async showAddGuideForm(guideId = null) {
        const guide = guideId ? await DB.get('catalog_guides', guideId) : null;
        const agencies = await DB.getAll('catalog_agencies') || [];
        const commissionRules = await DB.getAll('commission_rules') || [];
        const guideRules = commissionRules.filter(r => r.entity_type === 'guide');

        const body = `
            <form id="guide-form">
                <div class="form-group">
                    <label>Nombre *</label>
                    <input type="text" id="guide-name" class="form-input" value="${guide?.name || ''}" required>
                </div>
                <div class="form-group">
                    <label>Agencia *</label>
                    <select id="guide-agency-id" class="form-select" required>
                        <option value="">Seleccionar agencia</option>
                        ${agencies.filter(a => a.active !== false).map(agency => `
                            <option value="${agency.id}" ${guide?.agency_id === agency.id ? 'selected' : ''}>
                                ${agency.name}
                            </option>
                        `).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Regla de Comisión</label>
                    <select id="guide-commission-rule" class="form-select">
                        <option value="">Sin regla</option>
                        ${guideRules.map(rule => `
                            <option value="${rule.id}" ${guide?.commission_rule === rule.id ? 'selected' : ''}>
                                ${rule.id} (${rule.discount_pct}% desc, ${rule.multiplier}x)
                            </option>
                        `).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Código de Barras</label>
                    <input type="text" id="guide-barcode" class="form-input" value="${guide?.barcode || ''}">
                    <button type="button" class="btn-secondary" onclick="window.Employees.generateGuideBarcodeForForm()" style="margin-top: 5px;">Generar</button>
                </div>
                <div class="form-group">
                    <label>Estado</label>
                    <select id="guide-active" class="form-select">
                        <option value="true" ${guide?.active !== false ? 'selected' : ''}>Activo</option>
                        <option value="false" ${guide?.active === false ? 'selected' : ''}>Inactivo</option>
                    </select>
                </div>
                ${guide?.barcode ? `
                <div style="text-align: center; margin: var(--spacing-md) 0;">
                    <svg id="guide-barcode-preview"></svg>
                </div>
                ` : ''}
            </form>
        `;

        const footer = `
            <button class="btn-secondary" onclick="UI.closeModal()">Cancelar</button>
            <button class="btn-primary" onclick="window.Employees.saveGuide('${guideId || ''}')">Guardar</button>
        `;

        UI.showModal(guideId ? 'Editar Guía' : 'Nuevo Guía', body, footer);

        if (guide?.barcode) {
            setTimeout(() => {
                BarcodeManager.generateCode128(guide.barcode, 'guide-barcode-preview');
            }, 100);
        }
    },

    generateGuideBarcodeForForm() {
        const name = document.getElementById('guide-name').value;
        if (!name) {
            Utils.showNotification('Ingresa un nombre primero', 'error');
            return;
        }
        const guide = { name: name };
        const barcode = Utils.generateGuideBarcode(guide);
        document.getElementById('guide-barcode').value = barcode;
    },

    async saveGuide(guideId) {
        const form = document.getElementById('guide-form');
        if (!form) return;

        const name = document.getElementById('guide-name')?.value.trim();
        const agencyId = document.getElementById('guide-agency-id')?.value;
        
        if (!name) {
            Utils.showNotification('El nombre es requerido', 'error');
            return;
        }
        if (!agencyId) {
            Utils.showNotification('La agencia es requerida', 'error');
            return;
        }

        try {
            // Obtener el registro existente si existe para preservar todas las propiedades
            const existing = guideId ? await DB.get('catalog_guides', guideId) : null;
            
            const guide = existing ? {
                ...existing, // Preservar todas las propiedades existentes
                id: guideId,
                name: name,
                agency_id: agencyId,
                commission_rule: document.getElementById('guide-commission-rule')?.value || null,
                active: document.getElementById('guide-active')?.value === 'true',
                updated_at: new Date().toISOString()
            } : {
                id: guideId || `guide_${Date.now()}`,
                name: name,
                agency_id: agencyId,
                commission_rule: document.getElementById('guide-commission-rule')?.value || null,
                active: document.getElementById('guide-active')?.value === 'true',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            // Manejar código de barras: usar el del formulario o generar uno nuevo
            const formBarcode = document.getElementById('guide-barcode')?.value.trim();
            if (formBarcode && formBarcode !== '') {
                guide.barcode = formBarcode;
            } else if (!guide.barcode || Utils.isBarcodeEmpty(guide.barcode)) {
                // Generar código usando la función centralizada
                guide.barcode = Utils.generateGuideBarcode(guide);
            }

            console.log('Guardando guía:', guide);
            await DB.put('catalog_guides', guide);
            
            // Verificar que se guardó correctamente
            const saved = await DB.get('catalog_guides', guide.id);
            if (!saved || saved.barcode !== guide.barcode) {
                console.error('Error: El código de barras no se guardó correctamente', { saved, expected: guide.barcode });
                throw new Error('Error al guardar código de barras');
            }
            Utils.showNotification(guideId ? 'Guía actualizado' : 'Guía creado', 'success');
            UI.closeModal();
            await this.loadGuides();
            
            // Agregar a cola de sincronización
            await SyncManager.addToQueue('catalog_guide', guide.id);
        } catch (e) {
            console.error('Error saving guide:', e);
            Utils.showNotification('Error al guardar guía', 'error');
        }
    },

    async editGuide(guideId) {
        await this.showAddGuideForm(guideId);
    },

    async generateGuideBarcode(guideId) {
        try {
            const guide = await DB.get('catalog_guides', guideId);
            if (!guide) {
                Utils.showNotification('Guía no encontrado', 'error');
                return;
            }

            guide.barcode = Utils.generateGuideBarcode(guide);
            await DB.put('catalog_guides', guide);
            Utils.showNotification('Código de barras generado', 'success');
            await this.loadGuides();
        } catch (e) {
            console.error('Error generating guide barcode:', e);
            Utils.showNotification('Error al generar código de barras', 'error');
        }
    },

    async exportGuides() {
        try {
            const guides = await DB.getAll('catalog_guides') || [];
            const agencies = await DB.getAll('catalog_agencies') || [];
            const exportData = guides.map(g => {
                const agency = agencies.find(a => a.id === g.agency_id);
                return {
                    'ID': g.id,
                    'Nombre': g.name,
                    'Agencia': agency?.name || 'N/A',
                    'Regla Comisión': g.commission_rule || 'N/A',
                    'Código de Barras': g.barcode || 'Sin código',
                    'Estado': g.active !== false ? 'Activo' : 'Inactivo',
                    'Creado': Utils.formatDate(g.created_at, 'DD/MM/YYYY HH:mm'),
                    'Actualizado': Utils.formatDate(g.updated_at, 'DD/MM/YYYY HH:mm')
                };
            });

            const format = prompt('Formato de exportación:\n1. CSV\n2. Excel\n3. PDF', '2');
            const date = new Date().toISOString().split('T')[0];
            
            if (format === '1') {
                Utils.exportToCSV(exportData, `guias_${date}.csv`);
            } else if (format === '2') {
                Utils.exportToExcel(exportData, `guias_${date}.xlsx`);
            } else {
                Utils.exportToPDF(exportData, `guias_${date}.pdf`, 'Guías');
            }
        } catch (e) {
            console.error('Error exporting guides:', e);
            Utils.showNotification('Error al exportar', 'error');
        }
    },

    // ========== AGENCIAS ==========
    async loadAgencies() {
        const content = document.getElementById('employees-content');
        if (!content) return;

        try {
            const agencies = await DB.getAll('catalog_agencies') || [];
            
            // Verificar que los códigos de barras se lean correctamente
            agencies.forEach(agency => {
                if (Utils.isBarcodeEmpty(agency.barcode)) {
                    console.log(`Agencia ${agency.id} (${agency.name}) sin código de barras`);
                }
            });

            content.innerHTML = `
                <table class="cart-table">
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Barcode</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${agencies.length === 0 ? '<tr><td colspan="4" style="text-align: center; padding: var(--spacing-md);">No hay agencias</td></tr>' : agencies.map(agency => {
                            const barcode = Utils.isBarcodeEmpty(agency.barcode) ? 'Sin código' : agency.barcode;
                            return `
                            <tr>
                                <td>${agency.name || 'N/A'}</td>
                                <td>${barcode}</td>
                                <td>${agency.active !== false ? 'Activo' : 'Inactivo'}</td>
                                <td>
                                    <button class="btn-secondary btn-sm" onclick="window.Employees.editAgency('${agency.id}')">Editar</button>
                                    <button class="btn-secondary btn-sm" onclick="window.Employees.generateAgencyBarcode('${agency.id}')">Barcode</button>
                                </td>
                            </tr>
                        `;
                        }).join('')}
                    </tbody>
                </table>
            `;
        } catch (e) {
            console.error('Error loading agencies:', e);
            content.innerHTML = '<p style="text-align: center; padding: var(--spacing-md);">Error al cargar agencias</p>';
        }
    },

    async showAddAgencyForm(agencyId = null) {
        const agency = agencyId ? await DB.get('catalog_agencies', agencyId) : null;

        const body = `
            <form id="agency-form">
                <div class="form-group">
                    <label>Nombre *</label>
                    <input type="text" id="agency-name" class="form-input" value="${agency?.name || ''}" required>
                </div>
                <div class="form-group">
                    <label>Código de Barras</label>
                    <input type="text" id="agency-barcode" class="form-input" value="${agency?.barcode || ''}">
                    <button type="button" class="btn-secondary" onclick="window.Employees.generateAgencyBarcodeForForm()" style="margin-top: 5px;">Generar</button>
                </div>
                <div class="form-group">
                    <label>Estado</label>
                    <select id="agency-active" class="form-select">
                        <option value="true" ${agency?.active !== false ? 'selected' : ''}>Activo</option>
                        <option value="false" ${agency?.active === false ? 'selected' : ''}>Inactivo</option>
                    </select>
                </div>
                ${agency?.barcode ? `
                <div style="text-align: center; margin: var(--spacing-md) 0;">
                    <svg id="agency-barcode-preview"></svg>
                </div>
                ` : ''}
            </form>
        `;

        const footer = `
            <button class="btn-secondary" onclick="UI.closeModal()">Cancelar</button>
            <button class="btn-primary" onclick="window.Employees.saveAgency('${agencyId || ''}')">Guardar</button>
        `;

        UI.showModal(agencyId ? 'Editar Agencia' : 'Nueva Agencia', body, footer);

        if (agency?.barcode) {
            setTimeout(() => {
                BarcodeManager.generateCode128(agency.barcode, 'agency-barcode-preview');
            }, 100);
        }
    },

    generateAgencyBarcodeForForm() {
        const name = document.getElementById('agency-name').value;
        if (!name) {
            Utils.showNotification('Ingresa un nombre primero', 'error');
            return;
        }
        const agency = { name: name };
        const barcode = Utils.generateAgencyBarcode(agency);
        document.getElementById('agency-barcode').value = barcode;
    },

    async saveAgency(agencyId) {
        const form = document.getElementById('agency-form');
        if (!form) return;

        const name = document.getElementById('agency-name')?.value.trim();
        if (!name) {
            Utils.showNotification('El nombre es requerido', 'error');
            return;
        }

        try {
            // Obtener el registro existente si existe para preservar todas las propiedades
            const existing = agencyId ? await DB.get('catalog_agencies', agencyId) : null;
            
            const agency = existing ? {
                ...existing, // Preservar todas las propiedades existentes
                id: agencyId,
                name: name,
                active: document.getElementById('agency-active')?.value === 'true',
                updated_at: new Date().toISOString()
            } : {
                id: agencyId || `ag${Date.now()}`,
                name: name,
                active: document.getElementById('agency-active')?.value === 'true',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            // Manejar código de barras: usar el del formulario o generar uno nuevo
            const formBarcode = document.getElementById('agency-barcode')?.value.trim();
            if (formBarcode && formBarcode !== '') {
                agency.barcode = formBarcode;
            } else if (!agency.barcode || Utils.isBarcodeEmpty(agency.barcode)) {
                // Generar código usando la función centralizada
                agency.barcode = Utils.generateAgencyBarcode(agency);
            }

            console.log('Guardando agencia:', agency);
            await DB.put('catalog_agencies', agency);
            
            // Verificar que se guardó correctamente
            const saved = await DB.get('catalog_agencies', agency.id);
            if (!saved || saved.barcode !== agency.barcode) {
                console.error('Error: El código de barras no se guardó correctamente', { saved, expected: agency.barcode });
                throw new Error('Error al guardar código de barras');
            }
            Utils.showNotification(agencyId ? 'Agencia actualizada' : 'Agencia creada', 'success');
            UI.closeModal();
            await this.loadAgencies();
            
            // Agregar a cola de sincronización
            await SyncManager.addToQueue('catalog_agency', agency.id);
        } catch (e) {
            console.error('Error saving agency:', e);
            Utils.showNotification('Error al guardar agencia', 'error');
        }
    },

    async editAgency(agencyId) {
        await this.showAddAgencyForm(agencyId);
    },

    async generateAgencyBarcode(agencyId) {
        try {
            const agency = await DB.get('catalog_agencies', agencyId);
            if (!agency) {
                Utils.showNotification('Agencia no encontrada', 'error');
                return;
            }

            agency.barcode = Utils.generateAgencyBarcode(agency);
            await DB.put('catalog_agencies', agency);
            Utils.showNotification('Código de barras generado', 'success');
            await this.loadAgencies();
        } catch (e) {
            console.error('Error generating agency barcode:', e);
            Utils.showNotification('Error al generar código de barras', 'error');
        }
    },

    async exportAgencies() {
        try {
            const agencies = await DB.getAll('catalog_agencies') || [];
            const exportData = agencies.map(a => ({
                'ID': a.id,
                'Nombre': a.name,
                'Código de Barras': a.barcode || 'Sin código',
                'Estado': a.active !== false ? 'Activo' : 'Inactivo',
                'Creado': Utils.formatDate(a.created_at, 'DD/MM/YYYY HH:mm'),
                'Actualizado': Utils.formatDate(a.updated_at, 'DD/MM/YYYY HH:mm')
            }));

            const format = prompt('Formato de exportación:\n1. CSV\n2. Excel\n3. PDF', '2');
            const date = new Date().toISOString().split('T')[0];
            
            if (format === '1') {
                Utils.exportToCSV(exportData, `agencias_${date}.csv`);
            } else if (format === '2') {
                Utils.exportToExcel(exportData, `agencias_${date}.xlsx`);
            } else {
                Utils.exportToPDF(exportData, `agencias_${date}.pdf`, 'Agencias');
            }
        } catch (e) {
            console.error('Error exporting agencies:', e);
            Utils.showNotification('Error al exportar', 'error');
        }
    },

    async exportEmployees() {
        try {
            const employees = await DB.getAll('employees');
            const branches = await DB.getAll('catalog_branches');
            
            const exportData = employees.map(emp => {
                const branch = branches.find(b => b.id === emp.branch_id);
                return {
                    Nombre: emp.name,
                    Rol: emp.role,
                    Sucursal: branch?.name || '',
                    Barcode: emp.barcode || '',
                    Estado: emp.active ? 'Activo' : 'Inactivo'
                };
            });

            const format = prompt('Formato:\n1. CSV\n2. Excel\n3. PDF', '2');
            const date = Utils.formatDate(new Date(), 'YYYYMMDD');
            
            if (format === '1') {
                Utils.exportToCSV(exportData, `empleados_${date}.csv`);
            } else if (format === '2') {
                Utils.exportToExcel(exportData, `empleados_${date}.xlsx`, 'Empleados');
            } else if (format === '3') {
                Utils.exportToPDF(exportData, `empleados_${date}.pdf`, 'Empleados');
            }
        } catch (e) {
            console.error('Error exporting employees:', e);
            Utils.showNotification('Error al exportar', 'error');
        }
    },

    // ========================================
    // FUNCIONALIDADES AVANZADAS EMPLEADOS
    // ========================================

    async showEmployeePerformance(employeeId) {
        const employee = await DB.get('employees', employeeId);
        if (!employee) {
            Utils.showNotification('Empleado no encontrado', 'error');
            return;
        }

        const sales = await DB.getAll('sales') || [];
        const employeeSales = sales.filter(s => s.employee_id === employeeId && s.status === 'completada');
        
        // Calcular métricas de desempeño
        const totalSales = employeeSales.length;
        const totalRevenue = employeeSales.reduce((sum, s) => sum + (s.total || 0), 0);
        const avgTicket = totalSales > 0 ? totalRevenue / totalSales : 0;
        
        // Ventas por mes (últimos 6 meses)
        const monthlySales = {};
        employeeSales.forEach(sale => {
            const date = new Date(sale.created_at);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            if (!monthlySales[monthKey]) {
                monthlySales[monthKey] = { count: 0, revenue: 0 };
            }
            monthlySales[monthKey].count += 1;
            monthlySales[monthKey].revenue += sale.total || 0;
        });

        const monthlyData = Object.entries(monthlySales)
            .map(([month, stats]) => ({ month, ...stats }))
            .sort((a, b) => a.month.localeCompare(b.month))
            .slice(-6);

        // Calcular comisiones
        const commissionRules = await DB.getAll('commission_rules');
        const employeeRule = commissionRules.find(r => r.entity_type === 'employee' && r.entity_id === employeeId);
        let totalCommissions = 0;
        if (employeeRule) {
            employeeSales.forEach(sale => {
                const commission = (sale.total || 0) * (employeeRule.discount_pct || 0) / 100;
                totalCommissions += commission;
            });
        }

        const body = `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-lg);">
                <div>
                    <h4 style="margin-bottom: var(--spacing-sm);">Métricas de Desempeño</h4>
                    <div class="dashboard-grid" style="margin-bottom: var(--spacing-md);">
                        <div class="kpi-card">
                            <div class="kpi-label">Total Ventas</div>
                            <div class="kpi-value">${totalSales}</div>
                        </div>
                        <div class="kpi-card">
                            <div class="kpi-label">Ingresos Generados</div>
                            <div class="kpi-value" style="font-size: 18px;">${Utils.formatCurrency(totalRevenue)}</div>
                        </div>
                        <div class="kpi-card">
                            <div class="kpi-label">Ticket Promedio</div>
                            <div class="kpi-value" style="font-size: 18px;">${Utils.formatCurrency(avgTicket)}</div>
                        </div>
                        <div class="kpi-card">
                            <div class="kpi-label">Comisiones</div>
                            <div class="kpi-value" style="font-size: 18px; color: var(--color-success);">${Utils.formatCurrency(totalCommissions)}</div>
                        </div>
                    </div>

                    <h4 style="margin-bottom: var(--spacing-sm);">Información del Empleado</h4>
                    <div style="background: var(--color-bg-secondary); padding: var(--spacing-md); border-radius: var(--radius-md);">
                        <p><strong>Nombre:</strong> ${employee.name}</p>
                        <p><strong>Rol:</strong> ${employee.role || 'N/A'}</p>
                        <p><strong>Estado:</strong> <span class="status-badge status-${employee.active ? 'activo' : 'inactivo'}">${employee.active ? 'Activo' : 'Inactivo'}</span></p>
                        ${employee.barcode ? `<p><strong>Código de Barras:</strong> ${employee.barcode}</p>` : ''}
                    </div>
                </div>

                <div>
                    <h4 style="margin-bottom: var(--spacing-sm);">Tendencia de Ventas</h4>
                    <div style="background: var(--color-bg-secondary); padding: var(--spacing-md); border-radius: var(--radius-md); margin-bottom: var(--spacing-md);">
                        ${monthlyData.length > 0 ? `
                            <div style="display: flex; align-items: flex-end; gap: 4px; height: 150px;">
                                ${monthlyData.map(month => {
                                    const maxRevenue = Math.max(...monthlyData.map(m => m.revenue), 1);
                                    const height = (month.revenue / maxRevenue) * 100;
                                    const monthName = new Date(month.month + '-01').toLocaleDateString('es', { month: 'short' });
                                    return `
                                        <div style="flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px;">
                                            <div style="flex: 1; display: flex; align-items: flex-end; width: 100%;">
                                                <div style="width: 100%; background: linear-gradient(180deg, var(--color-primary) 0%, var(--color-accent) 100%); 
                                                    border-radius: var(--radius-xs) var(--radius-xs) 0 0; height: ${height}%; min-height: ${month.revenue > 0 ? '4px' : '0'};"></div>
                                            </div>
                                            <div style="font-size: 9px; color: var(--color-text-secondary); text-align: center;">
                                                <div>${monthName}</div>
                                                <div style="font-weight: 600; margin-top: 2px;">${month.count}</div>
                                            </div>
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        ` : '<p style="text-align: center; color: var(--color-text-secondary);">No hay datos</p>'}
                    </div>
                </div>
            </div>
        `;

        const self = this;
        UI.showModal(`Desempeño: ${employee.name}`, body, [
            { text: 'Cerrar', class: 'btn-primary', onclick: () => UI.closeModal() }
        ]);
    },

    async calculateEmployeeCommissions(employeeId, startDate, endDate) {
        const sales = await DB.getAll('sales');
        const filteredSales = sales.filter(s => {
            const saleDate = new Date(s.created_at);
            return s.seller_id === employeeId && 
                   s.status === 'completada' &&
                   saleDate >= new Date(startDate) &&
                   saleDate <= new Date(endDate);
        });

        const commissionRules = await DB.getAll('commission_rules');
        const employeeRule = commissionRules.find(r => r.entity_type === 'employee' && r.entity_id === employeeId);
        
        let totalCommissions = 0;
        const commissionDetails = [];

        filteredSales.forEach(sale => {
            let commission = 0;
            if (employeeRule) {
                commission = (sale.total || 0) * (employeeRule.discount_pct || 0) / 100;
            }
            totalCommissions += commission;
            commissionDetails.push({
                folio: sale.folio,
                date: sale.created_at,
                amount: sale.total,
                commission: commission
            });
        });

        return { totalCommissions, commissionDetails, salesCount: filteredSales.length };
    }
};

window.Employees = Employees;

