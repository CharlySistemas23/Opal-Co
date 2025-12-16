// User Management and Authentication

const UserManager = {
    currentUser: null,
    currentEmployee: null,

    async init() {
        this.setupLogin();
        this.checkAuth();
    },

    setupLogin() {
        const barcodeInput = document.getElementById('employee-barcode-input');
        const pinInput = document.getElementById('pin-input');
        const loginBtn = document.getElementById('login-btn');

        if (barcodeInput) {
            barcodeInput.addEventListener('input', async (e) => {
                const barcode = e.target.value.trim();
                if (barcode.length > 0) {
                    await this.handleBarcodeInput(barcode);
                }
            });
        }

        if (loginBtn) {
            loginBtn.addEventListener('click', () => this.handleLogin());
        }

        if (pinInput) {
            pinInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleLogin();
                }
            });
        }
    },

    async handleBarcodeInput(barcode) {
        try {
            // Try to find employee by barcode
            const employee = await DB.getByIndex('employees', 'barcode', barcode);
            if (employee && employee.active) {
                document.getElementById('employee-barcode-input').value = employee.name;
                document.getElementById('pin-group').style.display = 'block';
                document.getElementById('pin-input').focus();
                window.currentEmployee = employee;
                return;
            }
            
            // Try to find by username
            const users = await DB.getAll('users') || [];
            if (Array.isArray(users)) {
                const user = users.find(u => u && u.username && u.username.toLowerCase() === barcode.toLowerCase() && u.active);
                if (user) {
                    const emp = await DB.get('employees', user.employee_id);
                    if (emp && emp.active) {
                        document.getElementById('employee-barcode-input').value = user.username;
                        document.getElementById('pin-group').style.display = 'block';
                        document.getElementById('pin-input').focus();
                        window.currentEmployee = emp;
                    }
                }
            }
        } catch (e) {
            console.error('Error finding employee:', e);
        }
    },

    async handleLogin() {
        try {
            console.log('=== INICIANDO LOGIN ===');
            const barcodeInput = document.getElementById('employee-barcode-input');
            const pinInput = document.getElementById('pin-input');
            const errorEl = document.getElementById('login-error');

            if (!barcodeInput || !pinInput) {
                console.error('Campos de login no encontrados');
                this.showError('Error: Campos de login no encontrados. Recarga la página.');
                return;
            }

            // Ensure DB is ready
            if (!DB.db) {
                console.log('Esperando DB...');
                await new Promise(resolve => setTimeout(resolve, 500));
            }

            let employee = window.currentEmployee;
            let user = null;

            // Try to find by username first (easier login)
            const inputValue = barcodeInput.value.trim();
            const pinValue = pinInput.value.trim();
            
            console.log('Input usuario:', inputValue);
            console.log('PIN ingresado:', pinValue ? '***' : '(vacío)');

            if (!inputValue) {
                this.showError('Ingresa un usuario');
                return;
            }

            if (!pinValue || pinValue.length < 4) {
                this.showError('PIN inválido (mínimo 4 dígitos)');
                return;
            }

            // Get all users and employees
            const allUsers = await DB.getAll('users') || [];
            const allEmployees = await DB.getAll('employees') || [];
            
            console.log('Usuarios en DB:', Array.isArray(allUsers) ? allUsers.length : 'ERROR - no es array');
            console.log('Empleados en DB:', Array.isArray(allEmployees) ? allEmployees.length : 'ERROR - no es array');
            
            if (!Array.isArray(allUsers)) {
                console.error('allUsers no es un array:', typeof allUsers, allUsers);
                this.showError('Error cargando usuarios. Recarga la página.');
                return;
            }
            
            if (!Array.isArray(allEmployees)) {
                console.error('allEmployees no es un array:', typeof allEmployees, allEmployees);
                this.showError('Error cargando empleados. Recarga la página.');
                return;
            }

            // Try to find by username first
            if (inputValue && Array.isArray(allUsers)) {
                user = allUsers.find(u => 
                    u && u.username && u.username.toLowerCase() === inputValue.toLowerCase() && u.active
                );
                
                if (user) {
                    console.log('Usuario encontrado por username:', user.username);
                    employee = await DB.get('employees', user.employee_id);
                    if (employee) {
                        console.log('Empleado encontrado:', employee.name);
                    }
                }
            }

            // If no user found by username, try by employee name or barcode
            if (!employee && inputValue && Array.isArray(allEmployees)) {
                employee = allEmployees.find(e => 
                    e && (
                        (e.name && e.name.toLowerCase() === inputValue.toLowerCase()) ||
                        (e.employee_code && e.employee_code.toLowerCase() === inputValue.toLowerCase()) ||
                        e.barcode === inputValue
                    )
                );
                
                if (employee) {
                    console.log('Empleado encontrado por nombre/barcode:', employee.name);
                    if (Array.isArray(allUsers)) {
                        user = allUsers.find(u => u && u.employee_id === employee.id && u.active);
                    }
                }
            }

            // If still no employee, try currentEmployee from barcode scan
            if (!employee) {
                employee = window.currentEmployee;
                if (employee && Array.isArray(allUsers)) {
                    console.log('Usando currentEmployee:', employee.name);
                    user = allUsers.find(u => u && u.employee_id === employee.id && u.active);
                }
            }

            if (!employee) {
                console.error('Empleado no encontrado');
                this.showError('Empleado no encontrado. Verifica que los datos demo se cargaron.');
                // Try to create users
                if (typeof window.createDemoUsers === 'function') {
                    console.log('Intentando crear usuarios demo...');
                    await window.createDemoUsers();
                    this.showError('Usuarios creados. Intenta login de nuevo.');
                }
                return;
            }

            if (!employee.active) {
                console.warn('Empleado inactivo, activándolo...');
                // Auto-activate employee for demo
                employee.active = true;
                await DB.put('employees', employee);
                console.log('Empleado activado:', employee.name);
            }

            if (!user) {
                console.error('Usuario no encontrado para empleado:', employee.name);
                this.showError('Usuario no encontrado. Creando usuarios...');
                // Try to create users
                if (typeof window.createDemoUsers === 'function') {
                    await window.createDemoUsers();
                // Try again
                const newUsers = await DB.getAll('users') || [];
                if (Array.isArray(newUsers)) {
                    user = newUsers.find(u => u && u.employee_id === employee.id && u.active);
                }
                    if (!user) {
                        this.showError('Error creando usuarios. Recarga la página.');
                        return;
                    }
                } else {
                    return;
                }
            }

            console.log('Validando PIN...');
            // Validate PIN - also allow direct PIN check for demo
            let isValid = false;
            if (user.pin_hash) {
                isValid = await Utils.validatePin(pinValue, user.pin_hash);
                console.log('PIN válido (hash):', isValid);
            } else {
                // Fallback: if no hash, accept 1234 for demo
                isValid = pinValue === '1234';
                console.log('PIN válido (fallback):', isValid);
            }

            if (!isValid) {
                console.error('PIN incorrecto. Hash esperado:', user.pin_hash?.substring(0, 20));
                this.showError('PIN incorrecto. Intenta: 1234');
                return;
            }

            console.log('=== LOGIN EXITOSO ===');
            // Login successful
            this.currentUser = user;
            this.currentEmployee = employee;
            
            // Store in localStorage
            localStorage.setItem('current_user_id', user.id);
            localStorage.setItem('current_employee_id', employee.id);

            // Update UI
            if (UI && UI.updateUserInfo) {
                UI.updateUserInfo(employee);
            }
            
            // Load branch
            if (employee.branch_id) {
                const branch = await DB.get('catalog_branches', employee.branch_id);
                if (branch && UI && UI.updateBranchInfo) {
                    UI.updateBranchInfo(branch);
                    localStorage.setItem('current_branch_id', branch.id);
                }
            }

            // Hide login, show app
            const loginScreen = document.getElementById('login-screen');
            if (loginScreen) {
                loginScreen.style.display = 'none';
            } else {
                console.error('login-screen no encontrado');
            }

            // Hide all modules first
            document.querySelectorAll('.module').forEach(mod => {
                mod.style.display = 'none';
            });

            // Show dashboard
            const dashboard = document.getElementById('module-dashboard');
            if (dashboard) {
                dashboard.style.display = 'block';
            }

            // Update navigation
            document.querySelectorAll('.nav-item').forEach(item => {
                item.classList.remove('active');
                if (item.dataset.module === 'dashboard') {
                    item.classList.add('active');
                }
            });

            if (UI && UI.showModule) {
                try {
                    UI.showModule('dashboard');
                } catch (e) {
                    console.error('Error showing module:', e);
                }
            }

            // Log audit
            try {
                await this.logAudit('login', 'user', user.id, { employee_id: employee.id });
            } catch (e) {
                console.error('Error logging audit:', e);
            }

            if (Utils && Utils.showNotification) {
                Utils.showNotification(`Bienvenido, ${employee.name}`, 'success');
            }

            console.log('Login completado exitosamente');
        } catch (error) {
            console.error('Error en handleLogin:', error);
            this.showError(`Error: ${error.message}. Abre la consola (F12) para más detalles.`);
        }
    },

    showError(message) {
        const errorEl = document.getElementById('login-error');
        if (errorEl) {
            errorEl.textContent = message;
            errorEl.style.display = 'block';
        }
    },

    async checkAuth() {
        try {
            const userId = localStorage.getItem('current_user_id');
            if (userId) {
                try {
                    const user = await DB.get('users', userId);
                    if (user && user.active) {
                        const employee = await DB.get('employees', user.employee_id);
                        if (employee && employee.active) {
                            this.currentUser = user;
                            this.currentEmployee = employee;
                            
                            if (UI && UI.updateUserInfo) {
                                UI.updateUserInfo(employee);
                            }
                            
                            const branchId = localStorage.getItem('current_branch_id');
                            if (branchId) {
                                const branch = await DB.get('catalog_branches', branchId);
                                if (branch && UI && UI.updateBranchInfo) {
                                    UI.updateBranchInfo(branch);
                                }
                            }
                            
                            const loginScreen = document.getElementById('login-screen');
                            if (loginScreen) {
                                loginScreen.style.display = 'none';
                            }
                            
                            // Restaurar módulo guardado o mostrar dashboard
                            const savedModule = localStorage.getItem('current_module');
                            const moduleToShow = savedModule || 'dashboard';
                            
                            if (UI && UI.showModule) {
                                UI.showModule(moduleToShow);
                            } else {
                                // Fallback
                                const moduleEl = document.getElementById(`module-${moduleToShow}`);
                                if (moduleEl) {
                                    moduleEl.style.display = 'block';
                                } else {
                                    const dashboard = document.getElementById('module-dashboard');
                                    if (dashboard) {
                                        dashboard.style.display = 'block';
                                    }
                                }
                            }
                            return;
                        }
                    }
                } catch (e) {
                    console.error('Error checking auth:', e);
                }
            }
        } catch (e) {
            console.error('Error in checkAuth:', e);
        }
        
        // Show login - ensure it's visible
        const loginScreen = document.getElementById('login-screen');
        if (loginScreen) {
            loginScreen.style.display = 'flex';
        } else {
            console.error('login-screen element not found!');
        }
    },

    async logout() {
        await this.logAudit('logout', 'user', this.currentUser?.id);
        
        this.currentUser = null;
        this.currentEmployee = null;
        localStorage.removeItem('current_user_id');
        localStorage.removeItem('current_employee_id');
        localStorage.removeItem('current_branch_id');
        
        document.getElementById('login-screen').style.display = 'flex';
        document.getElementById('employee-barcode-input').value = '';
        document.getElementById('pin-input').value = '';
        document.getElementById('pin-group').style.display = 'none';
        document.getElementById('login-error').style.display = 'none';
    },

    async logAudit(action, entityType, entityId, details = {}) {
        try {
            await DB.add('audit_log', {
                id: Utils.generateId(),
                user_id: this.currentUser?.id || 'system',
                action: action,
                entity_type: entityType,
                entity_id: entityId,
                details: details,
                created_at: new Date().toISOString()
            });
        } catch (e) {
            console.error('Error logging audit:', e);
        }
    },

    hasPermission(permission) {
        if (!this.currentUser) return false;
        if (this.currentUser.role === 'admin') return true;
        return this.currentUser.permissions?.includes(permission) || false;
    }
};

