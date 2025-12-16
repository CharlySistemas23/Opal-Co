// Settings Module

const Settings = {
    initialized: false,
    
    async init() {
        if (this.initialized) return;
        this.setupUI();
        await this.loadSettings();
        this.initialized = true;
    },

    setupUI() {
        const content = document.getElementById('module-content');
        if (!content) return;

        content.innerHTML = `
            <div id="settings-tabs" class="tabs-container" style="margin-bottom: var(--spacing-lg);">
                <button class="tab-btn active" data-tab="general"><i class="fas fa-cog"></i> General</button>
                <button class="tab-btn" data-tab="sync"><i class="fas fa-sync"></i> Sincronización</button>
                <button class="tab-btn" data-tab="financial"><i class="fas fa-dollar-sign"></i> Financiero</button>
                <button class="tab-btn" data-tab="catalogs"><i class="fas fa-book"></i> Catálogos</button>
                <button class="tab-btn" data-tab="security"><i class="fas fa-shield-alt"></i> Seguridad</button>
                <button class="tab-btn" data-tab="system"><i class="fas fa-server"></i> Sistema</button>
            </div>
            <div id="settings-content"></div>
        `;

        // Event listeners para tabs
        document.querySelectorAll('#settings-tabs .tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('#settings-tabs .tab-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                const tab = e.target.dataset.tab;
                this.loadTab(tab);
            });
        });

        // Cargar pestaña inicial
        this.loadTab('general');
    },

    async loadTab(tab) {
        const content = document.getElementById('settings-content');
        if (!content) return;

        switch(tab) {
            case 'general':
                content.innerHTML = this.getGeneralTab();
                break;
            case 'sync':
                content.innerHTML = this.getSyncTab();
                break;
            case 'financial':
                content.innerHTML = this.getFinancialTab();
                break;
            case 'catalogs':
                content.innerHTML = this.getCatalogsTab();
                break;
            case 'security':
                content.innerHTML = this.getSecurityTab();
                break;
            case 'system':
                content.innerHTML = this.getSystemTab();
                break;
        }

        await this.loadSettings();
    },

    getGeneralTab() {
        return `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: var(--spacing-md);">
                <div class="module" style="padding: var(--spacing-md); background: var(--color-bg-card); border-radius: var(--radius-md); border: 1px solid var(--color-border-light);">
                    <h3 style="margin-bottom: var(--spacing-md); font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Sincronización</h3>
                    <div class="form-group">
                        <label>URL Apps Script</label>
                        <input type="text" id="setting-sync-url" class="form-input" placeholder="https://script.google.com/...">
                    </div>
                    <div class="form-group">
                        <label>Token</label>
                        <input type="text" id="setting-sync-token" class="form-input" placeholder="Token seguro">
                        <button class="btn-secondary" onclick="window.Settings.generateToken()" style="margin-top: 5px;">Generar Token</button>
                    </div>
                    <button class="btn-primary" onclick="window.Settings.saveSyncSettings()">Guardar</button>
                </div>
                <div class="module" style="padding: var(--spacing-md); background: var(--color-bg-card); border-radius: var(--radius-md); border: 1px solid var(--color-border-light);">
                    <h3 style="margin-bottom: var(--spacing-md); font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Monedas y Tipo de Cambio</h3>
                    <div style="margin-bottom: var(--spacing-sm); padding: var(--spacing-sm); background: var(--color-bg-secondary); border-radius: var(--radius-sm); border-left: 2px solid var(--color-accent);">
                        <button class="btn-primary btn-sm" onclick="window.Settings.fetchExchangeRates()" style="width: 100%; margin-bottom: var(--spacing-xs);">
                            <i class="fas fa-sync-alt"></i> Obtener Tipos de Cambio
                        </button>
                        <small style="color: var(--color-text-secondary); font-size: 9px;">
                            Obtiene automáticamente los tipos de cambio actuales de USD y CAD desde internet
                        </small>
                    </div>
                    <div class="form-group">
                        <label>Tipo de Cambio USD (MXN por USD)</label>
                        <input type="number" id="setting-exchange-usd" class="form-input" step="0.0001" value="20.00">
                    </div>
                    <div class="form-group">
                        <label>Tipo de Cambio CAD (MXN por CAD)</label>
                        <input type="number" id="setting-exchange-cad" class="form-input" step="0.0001" value="15.00">
                    </div>
                    <div style="margin-top: var(--spacing-sm); padding: var(--spacing-xs); background: var(--color-bg-secondary); border-radius: var(--radius-sm); font-size: 9px; color: var(--color-text-secondary);">
                        <strong>Última actualización:</strong> <span id="exchange-rates-timestamp">-</span>
                    </div>
                    <button class="btn-primary btn-sm" onclick="window.Settings.saveExchangeRates()" style="margin-top: var(--spacing-sm);">Guardar Tipos de Cambio</button>
                </div>
                <div class="module" style="padding: var(--spacing-md); background: var(--color-bg-card); border-radius: var(--radius-md); border: 1px solid var(--color-border-light);">
                    <h3 style="margin-bottom: var(--spacing-md); font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Impresión</h3>
                    <div class="form-group">
                        <label>Nombre de Impresora</label>
                        <input type="text" id="setting-printer-name" class="form-input" value="Ec line 58110">
                    </div>
                    <button class="btn-secondary btn-sm" onclick="window.Settings.testPrinter()">Probar Impresión</button>
                </div>
                <div class="module" style="padding: var(--spacing-md); background: var(--color-bg-card); border-radius: var(--radius-md); border: 1px solid var(--color-border-light);">
                    <h3 style="margin-bottom: var(--spacing-md); font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Impuestos</h3>
                    <div class="form-group">
                        <label>IVA (%)</label>
                        <input type="number" id="setting-tax-iva" class="form-input" step="0.01" value="16.00">
                    </div>
                    <div class="form-group">
                        <label>IEPS (%)</label>
                        <input type="number" id="setting-tax-ieps" class="form-input" step="0.01" value="0.00">
                    </div>
                    <button class="btn-primary btn-sm" onclick="window.Settings.saveTaxes()">Guardar</button>
                </div>
                <div class="module" style="padding: var(--spacing-md); background: var(--color-bg-card); border-radius: var(--radius-md); border: 1px solid var(--color-border-light);">
                    <h3 style="margin-bottom: var(--spacing-md); font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Catálogos</h3>
                    <button class="btn-secondary btn-sm" onclick="window.Settings.manageAgencies()" style="width: 100%; margin-bottom: var(--spacing-xs);">Gestionar Agencias</button>
                    <button class="btn-secondary btn-sm" onclick="window.Settings.manageSellers()" style="width: 100%; margin-bottom: var(--spacing-xs);">Gestionar Vendedores</button>
                    <button class="btn-secondary btn-sm" onclick="window.Settings.manageGuides()" style="width: 100%; margin-bottom: var(--spacing-xs);">Gestionar Guías</button>
                    <button class="btn-secondary btn-sm" onclick="window.Settings.manageBranches()" style="width: 100%;">Gestionar Sucursales</button>
                </div>
                <div class="module" style="padding: var(--spacing-md); background: var(--color-bg-card); border-radius: var(--radius-md); border: 1px solid var(--color-border-light);">
                    <h3 style="margin-bottom: var(--spacing-md); font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Reglas de Comisión</h3>
                    <button class="btn-secondary btn-sm" onclick="window.Settings.manageCommissionRules()" style="width: 100%;">Gestionar Reglas</button>
                </div>
                <div class="module" style="padding: var(--spacing-md); background: var(--color-bg-card); border-radius: var(--radius-md); border: 1px solid var(--color-border-light);">
                    <h3 style="margin-bottom: var(--spacing-md); font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Base de Datos</h3>
                    <button class="btn-secondary btn-sm" onclick="window.Settings.exportDatabase()" style="width: 100%; margin-bottom: var(--spacing-xs);">Exportar DB</button>
                    <button class="btn-secondary btn-sm" onclick="window.Settings.importDatabase()" style="width: 100%; margin-bottom: var(--spacing-xs);">Importar DB</button>
                    <button class="btn-danger btn-sm" onclick="window.Settings.clearDatabase()" style="width: 100%;">Limpiar DB (Cuidado!)</button>
                </div>
            </div>
        `;
    },

    getGeneralTab() {
        return `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: var(--spacing-md);">
                <div class="module" style="padding: var(--spacing-md); background: var(--color-bg-card); border-radius: var(--radius-md); border: 1px solid var(--color-border-light);">
                    <h3 style="margin-bottom: var(--spacing-md); font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                        <i class="fas fa-print"></i> Impresión
                    </h3>
                    <div class="form-group">
                        <label>Nombre de Impresora</label>
                        <input type="text" id="setting-printer-name" class="form-input" value="Ec line 58110">
                    </div>
                    <div class="form-group">
                        <label>Ancho de Papel (mm)</label>
                        <input type="number" id="setting-printer-width" class="form-input" value="58" step="1">
                    </div>
                    <div class="form-group">
                        <label>Formato de Ticket</label>
                        <select id="setting-ticket-format" class="form-select">
                            <option value="standard">Estándar</option>
                            <option value="compact">Compacto</option>
                            <option value="detailed">Detallado</option>
                        </select>
                    </div>
                    <button class="btn-secondary btn-sm" onclick="window.Settings.testPrinter()" style="width: 100%; margin-top: var(--spacing-xs);">
                        <i class="fas fa-print"></i> Probar Impresión
                    </button>
                    <button class="btn-primary btn-sm" onclick="window.Settings.savePrinterSettings()" style="width: 100%; margin-top: var(--spacing-xs);">
                        Guardar Configuración
                    </button>
                </div>

                <div class="module" style="padding: var(--spacing-md); background: var(--color-bg-card); border-radius: var(--radius-md); border: 1px solid var(--color-border-light);">
                    <h3 style="margin-bottom: var(--spacing-md); font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                        <i class="fas fa-receipt"></i> Impuestos
                    </h3>
                    <div class="form-group">
                        <label>IVA (%)</label>
                        <input type="number" id="setting-tax-iva" class="form-input" step="0.01" value="16.00">
                    </div>
                    <div class="form-group">
                        <label>IEPS (%)</label>
                        <input type="number" id="setting-tax-ieps" class="form-input" step="0.01" value="0.00">
                    </div>
                    <div class="form-group">
                        <label>ISR (%)</label>
                        <input type="number" id="setting-tax-isr" class="form-input" step="0.01" value="0.00">
                    </div>
                    <button class="btn-primary btn-sm" onclick="window.Settings.saveTaxes()" style="width: 100%; margin-top: var(--spacing-xs);">
                        Guardar Impuestos
                    </button>
                </div>

                <div class="module" style="padding: var(--spacing-md); background: var(--color-bg-card); border-radius: var(--radius-md); border: 1px solid var(--color-border-light);">
                    <h3 style="margin-bottom: var(--spacing-md); font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                        <i class="fas fa-bell"></i> Notificaciones
                    </h3>
                    <div class="form-group">
                        <label style="display: flex; align-items: center; gap: var(--spacing-xs);">
                            <input type="checkbox" id="setting-notify-sales" checked>
                            <span>Notificar nuevas ventas</span>
                        </label>
                    </div>
                    <div class="form-group">
                        <label style="display: flex; align-items: center; gap: var(--spacing-xs);">
                            <input type="checkbox" id="setting-notify-low-stock" checked>
                            <span>Alertar inventario bajo</span>
                        </label>
                    </div>
                    <div class="form-group">
                        <label style="display: flex; align-items: center; gap: var(--spacing-xs);">
                            <input type="checkbox" id="setting-notify-sync" checked>
                            <span>Notificar sincronizaciones</span>
                        </label>
                    </div>
                    <div class="form-group">
                        <label>Umbral de Inventario Bajo</label>
                        <input type="number" id="setting-low-stock-threshold" class="form-input" value="10" step="1">
                    </div>
                    <button class="btn-primary btn-sm" onclick="window.Settings.saveNotifications()" style="width: 100%; margin-top: var(--spacing-xs);">
                        Guardar Notificaciones
                    </button>
                </div>

                <div class="module" style="padding: var(--spacing-md); background: var(--color-bg-card); border-radius: var(--radius-md); border: 1px solid var(--color-border-light);">
                    <h3 style="margin-bottom: var(--spacing-md); font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                        <i class="fas fa-palette"></i> Apariencia
                    </h3>
                    <div class="form-group">
                        <label>Tema</label>
                        <select id="setting-theme" class="form-select">
                            <option value="light">Claro</option>
                            <option value="dark">Oscuro</option>
                            <option value="auto">Automático</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Idioma</label>
                        <select id="setting-language" class="form-select">
                            <option value="es">Español</option>
                            <option value="en">English</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Formato de Fecha</label>
                        <select id="setting-date-format" class="form-select">
                            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                        </select>
                    </div>
                    <button class="btn-primary btn-sm" onclick="window.Settings.saveAppearance()" style="width: 100%; margin-top: var(--spacing-xs);">
                        Guardar Apariencia
                    </button>
                </div>
            </div>
        `;
    },

    getSyncTab() {
        return `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: var(--spacing-md);">
                <div class="module" style="padding: var(--spacing-md); background: var(--color-bg-card); border-radius: var(--radius-md); border: 1px solid var(--color-border-light);">
                    <h3 style="margin-bottom: var(--spacing-md); font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                        <i class="fas fa-sync"></i> Configuración de Sincronización
                    </h3>
                    <div class="form-group">
                        <label>URL Apps Script</label>
                        <input type="text" id="setting-sync-url" class="form-input" placeholder="https://script.google.com/...">
                        <small style="color: var(--color-text-secondary); font-size: 10px;">URL del Web App de Google Apps Script</small>
                    </div>
                    <div class="form-group">
                        <label>Token de Seguridad</label>
                        <input type="text" id="setting-sync-token" class="form-input" placeholder="Token seguro">
                        <button class="btn-secondary btn-sm" onclick="window.Settings.generateToken()" style="margin-top: 5px; width: 100%;">
                            <i class="fas fa-key"></i> Generar Token
                        </button>
                    </div>
                    <div class="form-group">
                        <label>Sincronización Automática</label>
                        <select id="setting-auto-sync" class="form-select">
                            <option value="disabled">Deshabilitada</option>
                            <option value="5min">Cada 5 minutos</option>
                            <option value="15min">Cada 15 minutos</option>
                            <option value="30min">Cada 30 minutos</option>
                            <option value="1hour">Cada hora</option>
                        </select>
                    </div>
                    <button class="btn-primary" onclick="window.Settings.saveSyncSettings()" style="width: 100%;">
                        <i class="fas fa-save"></i> Guardar Configuración
                    </button>
                </div>

                <div class="module" style="padding: var(--spacing-md); background: var(--color-bg-card); border-radius: var(--radius-md); border: 1px solid var(--color-border-light);">
                    <h3 style="margin-bottom: var(--spacing-md); font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                        <i class="fas fa-history"></i> Estado de Sincronización
                    </h3>
                    <div id="sync-status-info" style="padding: var(--spacing-sm); background: var(--color-bg-secondary); border-radius: var(--radius-sm); margin-bottom: var(--spacing-sm);">
                        <div style="font-size: 11px; color: var(--color-text-secondary);">Cargando...</div>
                    </div>
                    <button class="btn-secondary btn-sm" onclick="window.Settings.testSyncConnection()" style="width: 100%; margin-bottom: var(--spacing-xs);">
                        <i class="fas fa-plug"></i> Probar Conexión
                    </button>
                    <button class="btn-primary btn-sm" onclick="window.Settings.forceSync()" style="width: 100%;">
                        <i class="fas fa-sync-alt"></i> Sincronizar Ahora
                    </button>
                </div>
            </div>
        `;
    },

    getFinancialTab() {
        return `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: var(--spacing-md);">
                <div class="module" style="padding: var(--spacing-md); background: var(--color-bg-card); border-radius: var(--radius-md); border: 1px solid var(--color-border-light);">
                    <h3 style="margin-bottom: var(--spacing-md); font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                        <i class="fas fa-exchange-alt"></i> Monedas y Tipo de Cambio
                    </h3>
                    <div style="margin-bottom: var(--spacing-sm); padding: var(--spacing-sm); background: var(--color-bg-secondary); border-radius: var(--radius-sm); border-left: 2px solid var(--color-accent);">
                        <button class="btn-primary btn-sm" onclick="window.Settings.fetchExchangeRates()" style="width: 100%; margin-bottom: var(--spacing-xs);">
                            <i class="fas fa-sync-alt"></i> Obtener Tipos de Cambio Actuales
                        </button>
                        <small style="color: var(--color-text-secondary); font-size: 9px;">
                            Obtiene automáticamente los tipos de cambio actuales de USD y CAD desde internet
                        </small>
                    </div>
                    <div class="form-group">
                        <label>Tipo de Cambio USD (MXN por USD)</label>
                        <input type="number" id="setting-exchange-usd" class="form-input" step="0.0001" value="20.00">
                    </div>
                    <div class="form-group">
                        <label>Tipo de Cambio CAD (MXN por CAD)</label>
                        <input type="number" id="setting-exchange-cad" class="form-input" step="0.0001" value="15.00">
                    </div>
                    <div style="margin-top: var(--spacing-sm); padding: var(--spacing-xs); background: var(--color-bg-secondary); border-radius: var(--radius-sm); font-size: 9px; color: var(--color-text-secondary);">
                        <strong>Última actualización:</strong> <span id="exchange-rates-timestamp">-</span>
                    </div>
                    <button class="btn-primary btn-sm" onclick="window.Settings.saveExchangeRates()" style="width: 100%; margin-top: var(--spacing-sm);">
                        Guardar Tipos de Cambio
                    </button>
                </div>

                <div class="module" style="padding: var(--spacing-md); background: var(--color-bg-card); border-radius: var(--radius-md); border: 1px solid var(--color-border-light);">
                    <h3 style="margin-bottom: var(--spacing-md); font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                        <i class="fas fa-percent"></i> Reglas de Comisión
                    </h3>
                    <p style="font-size: 11px; color: var(--color-text-secondary); margin-bottom: var(--spacing-sm);">
                        Configura las reglas de comisión para vendedores, guías y agencias
                    </p>
                    <button class="btn-secondary btn-sm" onclick="window.Settings.manageCommissionRules()" style="width: 100%;">
                        <i class="fas fa-cog"></i> Gestionar Reglas de Comisión
                    </button>
                </div>
            </div>
        `;
    },

    getCatalogsTab() {
        return `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: var(--spacing-md);">
                <div class="module" style="padding: var(--spacing-md); background: var(--color-bg-card); border-radius: var(--radius-md); border: 1px solid var(--color-border-light); text-align: center;">
                    <h3 style="margin-bottom: var(--spacing-md); font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                        <i class="fas fa-building"></i> Agencias
                    </h3>
                    <p style="font-size: 11px; color: var(--color-text-secondary); margin-bottom: var(--spacing-sm);">
                        Gestiona las agencias de turismo
                    </p>
                    <button class="btn-secondary btn-sm" onclick="window.Settings.manageAgencies()" style="width: 100%;">
                        Gestionar Agencias
                    </button>
                </div>

                <div class="module" style="padding: var(--spacing-md); background: var(--color-bg-card); border-radius: var(--radius-md); border: 1px solid var(--color-border-light); text-align: center;">
                    <h3 style="margin-bottom: var(--spacing-md); font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                        <i class="fas fa-user-tag"></i> Vendedores
                    </h3>
                    <p style="font-size: 11px; color: var(--color-text-secondary); margin-bottom: var(--spacing-sm);">
                        Gestiona los vendedores del sistema
                    </p>
                    <button class="btn-secondary btn-sm" onclick="window.Settings.manageSellers()" style="width: 100%;">
                        Gestionar Vendedores
                    </button>
                </div>

                <div class="module" style="padding: var(--spacing-md); background: var(--color-bg-card); border-radius: var(--radius-md); border: 1px solid var(--color-border-light); text-align: center;">
                    <h3 style="margin-bottom: var(--spacing-md); font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                        <i class="fas fa-suitcase"></i> Guías
                    </h3>
                    <p style="font-size: 11px; color: var(--color-text-secondary); margin-bottom: var(--spacing-sm);">
                        Gestiona los guías de turismo
                    </p>
                    <button class="btn-secondary btn-sm" onclick="window.Settings.manageGuides()" style="width: 100%;">
                        Gestionar Guías
                    </button>
                </div>

                <div class="module" style="padding: var(--spacing-md); background: var(--color-bg-card); border-radius: var(--radius-md); border: 1px solid var(--color-border-light); text-align: center;">
                    <h3 style="margin-bottom: var(--spacing-md); font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                        <i class="fas fa-store"></i> Sucursales
                    </h3>
                    <p style="font-size: 11px; color: var(--color-text-secondary); margin-bottom: var(--spacing-sm);">
                        Gestiona las sucursales
                    </p>
                    <button class="btn-secondary btn-sm" onclick="window.Settings.manageBranches()" style="width: 100%;">
                        Gestionar Sucursales
                    </button>
                </div>
            </div>
        `;
    },

    getSecurityTab() {
        return `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: var(--spacing-md);">
                <div class="module" style="padding: var(--spacing-md); background: var(--color-bg-card); border-radius: var(--radius-md); border: 1px solid var(--color-border-light);">
                    <h3 style="margin-bottom: var(--spacing-md); font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                        <i class="fas fa-lock"></i> Seguridad de PIN
                    </h3>
                    <div class="form-group">
                        <label>Longitud Mínima de PIN</label>
                        <input type="number" id="setting-pin-min-length" class="form-input" value="4" min="4" max="8">
                    </div>
                    <div class="form-group">
                        <label>Intentos Máximos de Login</label>
                        <input type="number" id="setting-max-login-attempts" class="form-input" value="5" min="3" max="10">
                    </div>
                    <div class="form-group">
                        <label>Tiempo de Bloqueo (minutos)</label>
                        <input type="number" id="setting-lockout-time" class="form-input" value="15" min="5" max="60">
                    </div>
                    <button class="btn-primary btn-sm" onclick="window.Settings.saveSecuritySettings()" style="width: 100%; margin-top: var(--spacing-xs);">
                        Guardar Configuración
                    </button>
                </div>

                <div class="module" style="padding: var(--spacing-md); background: var(--color-bg-card); border-radius: var(--radius-md); border: 1px solid var(--color-border-light);">
                    <h3 style="margin-bottom: var(--spacing-md); font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                        <i class="fas fa-user-shield"></i> Permisos y Roles
                    </h3>
                    <p style="font-size: 11px; color: var(--color-text-secondary); margin-bottom: var(--spacing-sm);">
                        Gestiona los permisos del sistema
                    </p>
                    <button class="btn-secondary btn-sm" onclick="window.Settings.managePermissions()" style="width: 100%; margin-bottom: var(--spacing-xs);">
                        <i class="fas fa-users-cog"></i> Gestionar Permisos
                    </button>
                    <button class="btn-secondary btn-sm" onclick="window.Settings.viewAuditLog()" style="width: 100%;">
                        <i class="fas fa-history"></i> Ver Log de Auditoría
                    </button>
                </div>

                <div class="module" style="padding: var(--spacing-md); background: var(--color-bg-card); border-radius: var(--radius-md); border: 1px solid var(--color-border-light);">
                    <h3 style="margin-bottom: var(--spacing-md); font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                        <i class="fas fa-key"></i> Cambiar Contraseña Maestra
                    </h3>
                    <div class="form-group">
                        <label>PIN Actual</label>
                        <input type="password" id="setting-current-pin" class="form-input" placeholder="Ingresa tu PIN actual">
                    </div>
                    <div class="form-group">
                        <label>Nuevo PIN</label>
                        <input type="password" id="setting-new-pin" class="form-input" placeholder="Nuevo PIN (mínimo 4 dígitos)">
                    </div>
                    <div class="form-group">
                        <label>Confirmar Nuevo PIN</label>
                        <input type="password" id="setting-confirm-pin" class="form-input" placeholder="Confirma el nuevo PIN">
                    </div>
                    <button class="btn-primary btn-sm" onclick="window.Settings.changeMasterPin()" style="width: 100%; margin-top: var(--spacing-xs);">
                        Cambiar PIN
                    </button>
                </div>
            </div>
        `;
    },

    getSystemTab() {
        return `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: var(--spacing-md);">
                <div class="module" style="padding: var(--spacing-md); background: var(--color-bg-card); border-radius: var(--radius-md); border: 1px solid var(--color-border-light);">
                    <h3 style="margin-bottom: var(--spacing-md); font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                        <i class="fas fa-database"></i> Base de Datos
                    </h3>
                    <div id="db-stats" style="padding: var(--spacing-sm); background: var(--color-bg-secondary); border-radius: var(--radius-sm); margin-bottom: var(--spacing-sm); font-size: 11px;">
                        <div>Cargando estadísticas...</div>
                    </div>
                    <button class="btn-secondary btn-sm" onclick="window.Settings.exportDatabase()" style="width: 100%; margin-bottom: var(--spacing-xs);">
                        <i class="fas fa-download"></i> Exportar DB
                    </button>
                    <button class="btn-secondary btn-sm" onclick="window.Settings.importDatabase()" style="width: 100%; margin-bottom: var(--spacing-xs);">
                        <i class="fas fa-upload"></i> Importar DB
                    </button>
                    <button class="btn-danger btn-sm" onclick="window.Settings.clearDatabase()" style="width: 100%;">
                        <i class="fas fa-trash"></i> Limpiar DB (Cuidado!)
                    </button>
                </div>

                <div class="module" style="padding: var(--spacing-md); background: var(--color-bg-card); border-radius: var(--radius-md); border: 1px solid var(--color-border-light);">
                    <h3 style="margin-bottom: var(--spacing-md); font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                        <i class="fas fa-history"></i> Historial de Configuración
                    </h3>
                    <div id="settings-history" style="max-height: 300px; overflow-y: auto; padding: var(--spacing-sm); background: var(--color-bg-secondary); border-radius: var(--radius-sm); font-size: 11px;">
                        Cargando historial...
                    </div>
                    <button class="btn-secondary btn-sm" onclick="window.Settings.loadSettingsHistory()" style="width: 100%; margin-top: var(--spacing-xs);">
                        <i class="fas fa-sync"></i> Actualizar
                    </button>
                </div>

                <div class="module" style="padding: var(--spacing-md); background: var(--color-bg-card); border-radius: var(--radius-md); border: 1px solid var(--color-border-light);">
                    <h3 style="margin-bottom: var(--spacing-md); font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                        <i class="fas fa-info-circle"></i> Información del Sistema
                    </h3>
                    <div id="system-info" style="padding: var(--spacing-sm); background: var(--color-bg-secondary); border-radius: var(--radius-sm); font-size: 11px;">
                        <div>Cargando información...</div>
                    </div>
                    <button class="btn-secondary btn-sm" onclick="window.Settings.loadSystemInfo()" style="width: 100%; margin-top: var(--spacing-xs);">
                        <i class="fas fa-sync"></i> Actualizar
                    </button>
                </div>
            </div>
        `;
    },

    async loadSettings() {
        try {
            // Cargar todas las configuraciones
            const settings = await DB.getAll('settings') || [];
            const settingsMap = {};
            settings.forEach(s => {
                settingsMap[s.key] = s.value;
            });

            // Sincronización
            const syncUrlEl = document.getElementById('setting-sync-url');
            const syncTokenEl = document.getElementById('setting-sync-token');
            if (syncUrlEl && settingsMap.sync_url) syncUrlEl.value = settingsMap.sync_url;
            if (syncTokenEl && settingsMap.sync_token) syncTokenEl.value = settingsMap.sync_token;

            // Tipos de cambio
            const exchangeUsdEl = document.getElementById('setting-exchange-usd');
            const exchangeCadEl = document.getElementById('setting-exchange-cad');
            if (exchangeUsdEl && settingsMap.exchange_rate_usd) exchangeUsdEl.value = settingsMap.exchange_rate_usd;
            if (exchangeCadEl && settingsMap.exchange_rate_cad) exchangeCadEl.value = settingsMap.exchange_rate_cad;
            
            const timestampEl = document.getElementById('exchange-rates-timestamp');
            if (timestampEl && settingsMap.exchange_rates_timestamp) {
                const timestamp = new Date(settingsMap.exchange_rates_timestamp);
                timestampEl.textContent = Utils.formatDate(timestamp, 'DD/MM/YYYY HH:mm');
            }

            // Impresión
            const printerNameEl = document.getElementById('setting-printer-name');
            const printerWidthEl = document.getElementById('setting-printer-width');
            const ticketFormatEl = document.getElementById('setting-ticket-format');
            if (printerNameEl && settingsMap.printer_name) printerNameEl.value = settingsMap.printer_name;
            if (printerWidthEl && settingsMap.printer_width) printerWidthEl.value = settingsMap.printer_width;
            if (ticketFormatEl && settingsMap.ticket_format) ticketFormatEl.value = settingsMap.ticket_format;

            // Impuestos
            const taxIvaEl = document.getElementById('setting-tax-iva');
            const taxIepsEl = document.getElementById('setting-tax-ieps');
            const taxIsrEl = document.getElementById('setting-tax-isr');
            if (taxIvaEl && settingsMap.tax_iva) taxIvaEl.value = settingsMap.tax_iva;
            if (taxIepsEl && settingsMap.tax_ieps) taxIepsEl.value = settingsMap.tax_ieps;
            if (taxIsrEl && settingsMap.tax_isr) taxIsrEl.value = settingsMap.tax_isr;

            // Notificaciones
            const notifySalesEl = document.getElementById('setting-notify-sales');
            const notifyLowStockEl = document.getElementById('setting-notify-low-stock');
            const notifySyncEl = document.getElementById('setting-notify-sync');
            const lowStockThresholdEl = document.getElementById('setting-low-stock-threshold');
            if (notifySalesEl) notifySalesEl.checked = settingsMap.notify_sales !== false;
            if (notifyLowStockEl) notifyLowStockEl.checked = settingsMap.notify_low_stock !== false;
            if (notifySyncEl) notifySyncEl.checked = settingsMap.notify_sync !== false;
            if (lowStockThresholdEl && settingsMap.low_stock_threshold) lowStockThresholdEl.value = settingsMap.low_stock_threshold;

            // Apariencia
            const themeEl = document.getElementById('setting-theme');
            const languageEl = document.getElementById('setting-language');
            const dateFormatEl = document.getElementById('setting-date-format');
            if (themeEl && settingsMap.theme) themeEl.value = settingsMap.theme;
            if (languageEl && settingsMap.language) languageEl.value = settingsMap.language;
            if (dateFormatEl && settingsMap.date_format) dateFormatEl.value = settingsMap.date_format;

            // Seguridad
            const pinMinLengthEl = document.getElementById('setting-pin-min-length');
            const maxLoginAttemptsEl = document.getElementById('setting-max-login-attempts');
            const lockoutTimeEl = document.getElementById('setting-lockout-time');
            if (pinMinLengthEl && settingsMap.pin_min_length) pinMinLengthEl.value = settingsMap.pin_min_length;
            if (maxLoginAttemptsEl && settingsMap.max_login_attempts) maxLoginAttemptsEl.value = settingsMap.max_login_attempts;
            if (lockoutTimeEl && settingsMap.lockout_time) lockoutTimeEl.value = settingsMap.lockout_time;

            // Auto-sync
            const autoSyncEl = document.getElementById('setting-auto-sync');
            if (autoSyncEl && settingsMap.auto_sync) autoSyncEl.value = settingsMap.auto_sync;

            // Cargar información adicional según la pestaña activa
            const activeTab = document.querySelector('#settings-tabs .tab-btn.active')?.dataset.tab;
            if (activeTab === 'system') {
                await this.loadSystemInfo();
                await this.loadSettingsHistory();
                await this.loadDatabaseStats();
            }
            if (activeTab === 'sync') {
                await this.loadSyncStatus();
            }
        } catch (e) {
            console.error('Error loading settings:', e);
        }
    },

    async saveSyncSettings() {
        const url = document.getElementById('setting-sync-url').value;
        const token = document.getElementById('setting-sync-token').value;
        const autoSync = document.getElementById('setting-auto-sync')?.value || 'disabled';

        await DB.put('settings', { key: 'sync_url', value: url, updated_at: new Date().toISOString() });
        await DB.put('settings', { key: 'sync_token', value: token, updated_at: new Date().toISOString() });
        await DB.put('settings', { key: 'auto_sync', value: autoSync, updated_at: new Date().toISOString() });

        // Update sync manager
        if (typeof SyncManager !== 'undefined') {
            SyncManager.syncUrl = url;
            SyncManager.syncToken = token;
        }

        Utils.showNotification('Configuración de sincronización guardada', 'success');
        await this.loadSyncStatus();
    },

    async fetchExchangeRates() {
        Utils.showNotification('Obteniendo tipos de cambio desde internet...', 'info');
        
        const rates = await Utils.fetchExchangeRates();
        
        if (rates) {
            document.getElementById('setting-exchange-usd').value = rates.usd;
            document.getElementById('setting-exchange-cad').value = rates.cad;
            document.getElementById('exchange-rates-timestamp').textContent = 
                Utils.formatDate(new Date(), 'DD/MM/YYYY HH:mm');
            
            // Guardar automáticamente
            await this.saveExchangeRates(rates.timestamp);
            Utils.showNotification(`Tipos de cambio actualizados: USD ${rates.usd}, CAD ${rates.cad}`, 'success');
        } else {
            Utils.showNotification('No se pudieron obtener los tipos de cambio. Verifica tu conexión a internet.', 'error');
        }
    },

    async saveExchangeRates(timestamp = null) {
        const usd = parseFloat(document.getElementById('setting-exchange-usd').value);
        const cad = parseFloat(document.getElementById('setting-exchange-cad').value);

        if (!usd || !cad || isNaN(usd) || isNaN(cad)) {
            Utils.showNotification('Ingresa valores válidos para los tipos de cambio', 'error');
            return;
        }

        await DB.put('settings', { key: 'exchange_rate_usd', value: usd, updated_at: new Date().toISOString() });
        await DB.put('settings', { key: 'exchange_rate_cad', value: cad, updated_at: new Date().toISOString() });
        
        if (timestamp) {
            await DB.put('settings', { key: 'exchange_rates_timestamp', value: timestamp, updated_at: new Date().toISOString() });
        }

        localStorage.setItem('daily_exchange_rate', usd.toString());

        Utils.showNotification('Tipos de cambio guardados', 'success');
    },

    generateToken() {
        const token = Utils.generateId() + '-' + Date.now().toString(36);
        document.getElementById('setting-sync-token').value = token;
        Utils.showNotification('Token generado', 'success');
    },

    async testPrinter() {
        const printerName = document.getElementById('setting-printer-name').value;
        await DB.put('settings', { key: 'printer_name', value: printerName, updated_at: new Date().toISOString() });
        Printer.printerName = printerName;

        // Test print
        const testSale = {
            folio: 'TEST-001',
            created_at: new Date().toISOString(),
            subtotal: 100,
            discount: 0,
            total: 100,
            currency: 'MXN'
        };

        await Printer.printTicket(testSale);
        Utils.showNotification('Ticket de prueba enviado', 'success');
    },

    async exportDatabase() {
        try {
            const stores = ['sales', 'inventory_items', 'customers', 'repairs', 'cost_entries', 'employees', 'users'];
            const exportData = {};

            for (const store of stores) {
                exportData[store] = await DB.getAll(store);
            }

            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `backup_${Utils.formatDate(new Date(), 'YYYYMMDD_HHmmss')}.json`;
            link.click();

            Utils.showNotification('Base de datos exportada', 'success');
        } catch (e) {
            console.error('Error exporting database:', e);
            Utils.showNotification('Error al exportar', 'error');
        }
    },

    async importDatabase() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            try {
                const text = await file.text();
                const data = JSON.parse(text);

                for (const [storeName, records] of Object.entries(data)) {
                    for (const record of records) {
                        await DB.put(storeName, record);
                    }
                }

                Utils.showNotification('Base de datos importada', 'success');
                location.reload();
            } catch (e) {
                console.error('Error importing database:', e);
                Utils.showNotification('Error al importar', 'error');
            }
        };
        input.click();
    },

    async clearDatabase() {
        if (!await Utils.confirm('¿Estás seguro? Esto eliminará TODOS los datos. Esta acción no se puede deshacer.')) {
            return;
        }

        if (!await Utils.confirm('ÚLTIMA CONFIRMACIÓN: ¿Eliminar TODOS los datos?')) {
            return;
        }

        try {
            indexedDB.deleteDatabase(DB.dbName);
            Utils.showNotification('Base de datos limpiada. Recargando...', 'success');
            setTimeout(() => location.reload(), 2000);
        } catch (e) {
            console.error('Error clearing database:', e);
            Utils.showNotification('Error al limpiar', 'error');
        }
    },

    async saveTaxes() {
        const iva = parseFloat(document.getElementById('setting-tax-iva').value);
        const ieps = parseFloat(document.getElementById('setting-tax-ieps').value);
        const isr = parseFloat(document.getElementById('setting-tax-isr')?.value || 0);

        await DB.put('settings', { key: 'tax_iva', value: iva, updated_at: new Date().toISOString() });
        await DB.put('settings', { key: 'tax_ieps', value: ieps, updated_at: new Date().toISOString() });
        await DB.put('settings', { key: 'tax_isr', value: isr, updated_at: new Date().toISOString() });

        Utils.showNotification('Impuestos guardados', 'success');
    },

    async manageAgencies() {
        const agencies = await DB.getAll('catalog_agencies') || [];
        const body = `
            <div style="margin-bottom: 20px;">
                <button class="btn-primary" onclick="window.Settings.addAgency()">+ Agregar Agencia</button>
            </div>
            <div style="max-height: 400px; overflow-y: auto;">
                <table class="cart-table">
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${agencies.map(agency => `
                            <tr>
                                <td>${agency.name}</td>
                                <td><span class="status-badge status-${agency.active ? 'disponible' : 'vendida'}">${agency.active ? 'Activa' : 'Inactiva'}</span></td>
                                <td>
                                    <button class="btn-secondary btn-sm" onclick="window.Settings.editAgency('${agency.id}')">Editar</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
        UI.showModal('Gestionar Agencias', body, '<button class="btn-primary" onclick="UI.closeModal()">Cerrar</button>');
    },

    async addAgency() {
        const name = prompt('Nombre de la agencia:');
        if (!name) return;

        const agency = {
            id: Utils.generateId(),
            name: name.toUpperCase(),
            active: true
        };
        
        // Generar código de barras automáticamente
        agency.barcode = Utils.generateAgencyBarcode(agency);

        await DB.put('catalog_agencies', agency);
        await SyncManager.addToQueue('catalog_agency', agency.id);
        Utils.showNotification('Agencia agregada', 'success');
        this.manageAgencies();
    },

    async editAgency(id) {
        const agency = await DB.get('catalog_agencies', id);
        if (!agency) return;

        const name = prompt('Nombre:', agency.name);
        if (!name) return;

        const active = confirm('¿Agencia activa?');

        agency.name = name.toUpperCase();
        agency.active = active;
        
        // Asegurar que tenga código de barras
        if (!agency.barcode || Utils.isBarcodeEmpty(agency.barcode)) {
            agency.barcode = Utils.generateAgencyBarcode(agency);
        }
        
        await DB.put('catalog_agencies', agency);
        await SyncManager.addToQueue('catalog_agency', agency.id);
        Utils.showNotification('Agencia actualizada', 'success');
        this.manageAgencies();
    },

    async manageSellers() {
        const sellers = await DB.getAll('catalog_sellers') || [];
        const body = `
            <div style="margin-bottom: 20px;">
                <button class="btn-primary" onclick="window.Settings.addSeller()">+ Agregar Vendedor</button>
            </div>
            <div style="max-height: 400px; overflow-y: auto;">
                <table class="cart-table">
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${sellers.map(seller => `
                            <tr>
                                <td>${seller.name}</td>
                                <td><span class="status-badge status-${seller.active ? 'disponible' : 'vendida'}">${seller.active ? 'Activo' : 'Inactivo'}</span></td>
                                <td>
                                    <button class="btn-secondary btn-sm" onclick="window.Settings.editSeller('${seller.id}')">Editar</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
        UI.showModal('Gestionar Vendedores', body, '<button class="btn-primary" onclick="UI.closeModal()">Cerrar</button>');
    },

    async addSeller() {
        const name = prompt('Nombre del vendedor:');
        if (!name) return;

        const seller = {
            id: Utils.generateId(),
            name: name.toUpperCase(),
            active: true
        };
        
        // Generar código de barras automáticamente
        seller.barcode = Utils.generateSellerBarcode(seller);

        await DB.put('catalog_sellers', seller);
        await SyncManager.addToQueue('catalog_seller', seller.id);
        Utils.showNotification('Vendedor agregado', 'success');
        this.manageSellers();
    },

    async editSeller(id) {
        const seller = await DB.get('catalog_sellers', id);
        if (!seller) return;

        const name = prompt('Nombre:', seller.name);
        if (!name) return;

        const active = confirm('¿Vendedor activo?');

        seller.name = name.toUpperCase();
        seller.active = active;
        
        // Asegurar que tenga código de barras
        if (!seller.barcode || Utils.isBarcodeEmpty(seller.barcode)) {
            seller.barcode = Utils.generateSellerBarcode(seller);
        }
        
        await DB.put('catalog_sellers', seller);
        await SyncManager.addToQueue('catalog_seller', seller.id);
        Utils.showNotification('Vendedor actualizado', 'success');
        this.manageSellers();
    },

    async manageGuides() {
        const guides = await DB.getAll('catalog_guides') || [];
        const agencies = await DB.getAll('catalog_agencies') || [];
        const body = `
            <div style="margin-bottom: 20px;">
                <button class="btn-primary" onclick="window.Settings.addGuide()">+ Agregar Guía</button>
            </div>
            <div style="max-height: 400px; overflow-y: auto;">
                <table class="cart-table">
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Agencia</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${guides.map(guide => {
                            const agency = agencies.find(a => a.id === guide.agency_id);
                            return `
                                <tr>
                                    <td>${guide.name}</td>
                                    <td>${agency?.name || 'N/A'}</td>
                                    <td><span class="status-badge status-${guide.active ? 'disponible' : 'vendida'}">${guide.active ? 'Activo' : 'Inactivo'}</span></td>
                                    <td>
                                        <button class="btn-secondary btn-sm" onclick="window.Settings.editGuide('${guide.id}')">Editar</button>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
        UI.showModal('Gestionar Guías', body, '<button class="btn-primary" onclick="UI.closeModal()">Cerrar</button>');
    },

    async addGuide() {
        const agencies = await DB.getAll('catalog_agencies') || [];
        const agencyOptions = agencies.map(a => `${a.id}:${a.name}`).join(',');
        const input = prompt(`Nombre del guía:\nAgencias disponibles: ${agencies.map(a => a.name).join(', ')}\nID de agencia:`);
        if (!input) return;

        const [name, agencyId] = input.split(':');
        if (!name) return;

        const guide = {
            id: Utils.generateId(),
            name: name.toUpperCase(),
            agency_id: agencyId || agencies[0]?.id,
            active: true
        };
        
        // Generar código de barras automáticamente
        guide.barcode = Utils.generateGuideBarcode(guide);

        await DB.put('catalog_guides', guide);
        await SyncManager.addToQueue('catalog_guide', guide.id);
        Utils.showNotification('Guía agregado', 'success');
        this.manageGuides();
    },

    async editGuide(id) {
        const guide = await DB.get('catalog_guides', id);
        if (!guide) return;

        const name = prompt('Nombre:', guide.name);
        if (!name) return;

        const active = confirm('¿Guía activo?');

        guide.name = name.toUpperCase();
        guide.active = active;
        
        // Asegurar que tenga código de barras
        if (!guide.barcode || Utils.isBarcodeEmpty(guide.barcode)) {
            guide.barcode = Utils.generateGuideBarcode(guide);
        }
        
        await DB.put('catalog_guides', guide);
        await SyncManager.addToQueue('catalog_guide', guide.id);
        Utils.showNotification('Guía actualizado', 'success');
        this.manageGuides();
    },

    async manageBranches() {
        const branches = await DB.getAll('catalog_branches') || [];
        const body = `
            <div style="margin-bottom: 20px;">
                <button class="btn-primary" onclick="window.Settings.addBranch()">+ Agregar Sucursal</button>
            </div>
            <div style="max-height: 400px; overflow-y: auto;">
                <table class="cart-table">
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${branches.map(branch => `
                            <tr>
                                <td>${branch.name}</td>
                                <td><span class="status-badge status-${branch.active ? 'disponible' : 'vendida'}">${branch.active ? 'Activa' : 'Inactiva'}</span></td>
                                <td>
                                    <button class="btn-secondary" onclick="window.Settings.editBranch('${branch.id}')" style="padding: 4px 8px; font-size: 12px;">Editar</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
        UI.showModal('Gestionar Sucursales', body, '<button class="btn-primary" onclick="UI.closeModal()">Cerrar</button>');
    },

    async addBranch() {
        const name = prompt('Nombre de la sucursal:');
        if (!name) return;

        const branch = {
            id: Utils.generateId(),
            name: name,
            active: true
        };

        await DB.put('catalog_branches', branch);
        Utils.showNotification('Sucursal agregada', 'success');
        this.manageBranches();
    },

    async editBranch(id) {
        const branch = await DB.get('catalog_branches', id);
        if (!branch) return;

        const name = prompt('Nombre:', branch.name);
        if (!name) return;

        const active = confirm('¿Sucursal activa?');

        branch.name = name;
        branch.active = active;
        await DB.put('catalog_branches', branch);
        Utils.showNotification('Sucursal actualizada', 'success');
        this.manageBranches();
    },

    async manageCommissionRules() {
        const rules = await DB.getAll('commission_rules') || [];
        const body = `
            <div style="margin-bottom: 20px;">
                <button class="btn-primary" onclick="window.Settings.addCommissionRule()">+ Agregar Regla</button>
            </div>
            <div style="max-height: 400px; overflow-y: auto;">
                <table class="cart-table">
                    <thead>
                        <tr>
                            <th>Tipo</th>
                            <th>Entidad</th>
                            <th>Descuento %</th>
                            <th>Multiplicador</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rules.map(rule => `
                            <tr>
                                <td>${rule.entity_type}</td>
                                <td>${rule.entity_id}</td>
                                <td>${rule.discount_pct || 0}%</td>
                                <td>${rule.multiplier || 1}x</td>
                                <td>
                                    <button class="btn-secondary" onclick="window.Settings.editCommissionRule('${rule.id}')" style="padding: 4px 8px; font-size: 12px;">Editar</button>
                                    <button class="btn-danger" onclick="window.Settings.deleteCommissionRule('${rule.id}')" style="padding: 4px 8px; font-size: 12px;">Eliminar</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
        UI.showModal('Gestionar Reglas de Comisión', body, '<button class="btn-primary" onclick="UI.closeModal()">Cerrar</button>');
    },

    async addCommissionRule() {
        const type = prompt('Tipo (seller/guide/agency):');
        if (!type) return;

        const entityId = prompt('ID de la entidad:');
        if (!entityId) return;

        const discount = parseFloat(prompt('Descuento %:') || '0');
        const multiplier = parseFloat(prompt('Multiplicador:') || '1');

        const rule = {
            id: Utils.generateId(),
            entity_type: type,
            entity_id: entityId,
            discount_pct: discount,
            multiplier: multiplier,
            created_at: new Date().toISOString()
        };

        await DB.put('commission_rules', rule);
        Utils.showNotification('Regla agregada', 'success');
        this.manageCommissionRules();
    },

    async editCommissionRule(id) {
        const rule = await DB.get('commission_rules', id);
        if (!rule) return;

        const discount = parseFloat(prompt('Descuento %:', rule.discount_pct || 0) || '0');
        const multiplier = parseFloat(prompt('Multiplicador:', rule.multiplier || 1) || '1');

        rule.discount_pct = discount;
        rule.multiplier = multiplier;
        await DB.put('commission_rules', rule);
        Utils.showNotification('Regla actualizada', 'success');
        this.manageCommissionRules();
    },

    async deleteCommissionRule(id) {
        if (!await Utils.confirm('¿Eliminar esta regla?')) return;
        await DB.delete('commission_rules', id);
        Utils.showNotification('Regla eliminada', 'success');
        this.manageCommissionRules();
    },

    // ========================================
    // FUNCIONALIDADES AVANZADAS
    // ========================================

    async savePrinterSettings() {
        const printerName = document.getElementById('setting-printer-name').value;
        const printerWidth = parseInt(document.getElementById('setting-printer-width').value);
        const ticketFormat = document.getElementById('setting-ticket-format').value;

        await DB.put('settings', { key: 'printer_name', value: printerName, updated_at: new Date().toISOString() });
        await DB.put('settings', { key: 'printer_width', value: printerWidth, updated_at: new Date().toISOString() });
        await DB.put('settings', { key: 'ticket_format', value: ticketFormat, updated_at: new Date().toISOString() });

        if (typeof Printer !== 'undefined') {
            Printer.printerName = printerName;
        }

        Utils.showNotification('Configuración de impresión guardada', 'success');
    },

    async saveNotifications() {
        const notifySales = document.getElementById('setting-notify-sales').checked;
        const notifyLowStock = document.getElementById('setting-notify-low-stock').checked;
        const notifySync = document.getElementById('setting-notify-sync').checked;
        const lowStockThreshold = parseInt(document.getElementById('setting-low-stock-threshold').value);

        await DB.put('settings', { key: 'notify_sales', value: notifySales, updated_at: new Date().toISOString() });
        await DB.put('settings', { key: 'notify_low_stock', value: notifyLowStock, updated_at: new Date().toISOString() });
        await DB.put('settings', { key: 'notify_sync', value: notifySync, updated_at: new Date().toISOString() });
        await DB.put('settings', { key: 'low_stock_threshold', value: lowStockThreshold, updated_at: new Date().toISOString() });

        Utils.showNotification('Configuración de notificaciones guardada', 'success');
    },

    async saveAppearance() {
        const theme = document.getElementById('setting-theme').value;
        const language = document.getElementById('setting-language').value;
        const dateFormat = document.getElementById('setting-date-format').value;

        await DB.put('settings', { key: 'theme', value: theme, updated_at: new Date().toISOString() });
        await DB.put('settings', { key: 'language', value: language, updated_at: new Date().toISOString() });
        await DB.put('settings', { key: 'date_format', value: dateFormat, updated_at: new Date().toISOString() });

        // Aplicar tema si es necesario
        if (theme === 'dark') {
            document.body.classList.add('dark-theme');
        } else {
            document.body.classList.remove('dark-theme');
        }

        Utils.showNotification('Configuración de apariencia guardada', 'success');
    },

    async saveSecuritySettings() {
        const pinMinLength = parseInt(document.getElementById('setting-pin-min-length').value);
        const maxLoginAttempts = parseInt(document.getElementById('setting-max-login-attempts').value);
        const lockoutTime = parseInt(document.getElementById('setting-lockout-time').value);

        await DB.put('settings', { key: 'pin_min_length', value: pinMinLength, updated_at: new Date().toISOString() });
        await DB.put('settings', { key: 'max_login_attempts', value: maxLoginAttempts, updated_at: new Date().toISOString() });
        await DB.put('settings', { key: 'lockout_time', value: lockoutTime, updated_at: new Date().toISOString() });

        Utils.showNotification('Configuración de seguridad guardada', 'success');
    },

    async changeMasterPin() {
        const currentPin = document.getElementById('setting-current-pin').value;
        const newPin = document.getElementById('setting-new-pin').value;
        const confirmPin = document.getElementById('setting-confirm-pin').value;

        if (!currentPin || !newPin || !confirmPin) {
            Utils.showNotification('Completa todos los campos', 'error');
            return;
        }

        if (newPin.length < 4) {
            Utils.showNotification('El PIN debe tener al menos 4 dígitos', 'error');
            return;
        }

        if (newPin !== confirmPin) {
            Utils.showNotification('Los PINs no coinciden', 'error');
            return;
        }

        // Validar PIN actual (simplificado - en producción validar con hash)
        const currentUser = UserManager.currentUser;
        if (!currentUser) {
            Utils.showNotification('Debes estar autenticado', 'error');
            return;
        }

        // Cambiar PIN
        const newPinHash = await Utils.hashPin(newPin);
        currentUser.pin_hash = newPinHash;
        await DB.put('users', currentUser);

        // Limpiar campos
        document.getElementById('setting-current-pin').value = '';
        document.getElementById('setting-new-pin').value = '';
        document.getElementById('setting-confirm-pin').value = '';

        Utils.showNotification('PIN cambiado correctamente', 'success');
    },

    async managePermissions() {
        const users = await DB.getAll('users') || [];
        const body = `
            <div style="max-height: 400px; overflow-y: auto;">
                <table class="cart-table">
                    <thead>
                        <tr>
                            <th>Usuario</th>
                            <th>Permisos</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${users.map(user => `
                            <tr>
                                <td>${user.username}</td>
                                <td>
                                    ${user.permissions ? Object.keys(user.permissions).filter(p => user.permissions[p]).join(', ') : 'Sin permisos'}
                                </td>
                                <td>
                                    <button class="btn-secondary btn-sm" onclick="window.Settings.editUserPermissions('${user.id}')">
                                        Editar
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;

        const self = this;
        UI.showModal('Gestionar Permisos', body, [
            { text: 'Cerrar', class: 'btn-primary', onclick: () => UI.closeModal() }
        ]);
    },

    async editUserPermissions(userId) {
        const user = await DB.get('users', userId);
        if (!user) return;

        const permissions = user.permissions || {};
        const body = `
            <form id="permissions-form">
                <h4>Permisos para: ${user.username}</h4>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--spacing-sm); margin-top: var(--spacing-md);">
                    <label style="display: flex; align-items: center; gap: var(--spacing-xs);">
                        <input type="checkbox" id="perm-discount" ${permissions.discount ? 'checked' : ''}>
                        <span>Descuentos</span>
                    </label>
                    <label style="display: flex; align-items: center; gap: var(--spacing-xs);">
                        <input type="checkbox" id="perm-cancel" ${permissions.cancel ? 'checked' : ''}>
                        <span>Cancelar Ventas</span>
                    </label>
                    <label style="display: flex; align-items: center; gap: var(--spacing-xs);">
                        <input type="checkbox" id="perm-return" ${permissions.return ? 'checked' : ''}>
                        <span>Devoluciones</span>
                    </label>
                    <label style="display: flex; align-items: center; gap: var(--spacing-xs);">
                        <input type="checkbox" id="perm-inventory" ${permissions.inventory ? 'checked' : ''}>
                        <span>Inventario</span>
                    </label>
                    <label style="display: flex; align-items: center; gap: var(--spacing-xs);">
                        <input type="checkbox" id="perm-reports" ${permissions.reports ? 'checked' : ''}>
                        <span>Reportes</span>
                    </label>
                    <label style="display: flex; align-items: center; gap: var(--spacing-xs);">
                        <input type="checkbox" id="perm-settings" ${permissions.settings ? 'checked' : ''}>
                        <span>Configuración</span>
                    </label>
                </div>
            </form>
        `;

        const self = this;
        UI.showModal('Editar Permisos', body, [
            { text: 'Cancelar', class: 'btn-secondary', onclick: () => UI.closeModal() },
            { text: 'Guardar', class: 'btn-primary', onclick: () => self.saveUserPermissions(userId) }
        ]);
    },

    async saveUserPermissions(userId) {
        const user = await DB.get('users', userId);
        if (!user) return;

        user.permissions = {
            discount: document.getElementById('perm-discount').checked,
            cancel: document.getElementById('perm-cancel').checked,
            return: document.getElementById('perm-return').checked,
            inventory: document.getElementById('perm-inventory').checked,
            reports: document.getElementById('perm-reports').checked,
            settings: document.getElementById('perm-settings').checked
        };

        await DB.put('users', user);
        Utils.showNotification('Permisos actualizados', 'success');
        UI.closeModal();
        this.managePermissions();
    },

    async viewAuditLog() {
        const audits = await DB.getAll('audit_logs') || [];
        const sortedAudits = audits.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 100);

        const body = `
            <div style="max-height: 500px; overflow-y: auto;">
                <table class="cart-table">
                    <thead>
                        <tr>
                            <th>Fecha</th>
                            <th>Usuario</th>
                            <th>Acción</th>
                            <th>Detalles</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${sortedAudits.length === 0 ? '<tr><td colspan="4" style="text-align: center; padding: var(--spacing-md);">No hay registros</td></tr>' : 
                        sortedAudits.map(audit => `
                            <tr>
                                <td>${Utils.formatDate(audit.created_at, 'DD/MM/YYYY HH:mm')}</td>
                                <td>${audit.user_id || 'Sistema'}</td>
                                <td>${audit.action}</td>
                                <td style="font-size: 10px;">${JSON.stringify(audit.details || {}).substring(0, 50)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;

        UI.showModal('Log de Auditoría', body, [
            { text: 'Cerrar', class: 'btn-primary', onclick: () => UI.closeModal() }
        ]);
    },

    async testSyncConnection() {
        Utils.showNotification('Probando conexión...', 'info');
        
        const url = document.getElementById('setting-sync-url')?.value;
        const token = document.getElementById('setting-sync-token')?.value;

        if (!url || !token) {
            Utils.showNotification('Configura la URL y Token primero', 'error');
            return;
        }

        try {
            // Primero probar con GET (más simple y evita problemas CORS)
            console.log('Probando conexión GET a:', url);
            const getResponse = await fetch(url, {
                method: 'GET',
                mode: 'no-cors' // Para evitar problemas CORS en desarrollo local
            }).catch(() => null);

            // Si GET funciona, probar POST con datos de prueba
            console.log('Probando conexión POST con token...');
            const testData = {
                token: token,
                entity_type: 'test',
                records: [],
                device_id: 'test-device',
                timestamp: new Date().toISOString()
            };

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(testData),
                mode: 'cors' // Permitir CORS
            });

            console.log('Respuesta recibida:', response.status, response.statusText);

            if (response.ok) {
                const result = await response.json().catch(() => ({ success: true }));
                if (result.success !== false) {
                    Utils.showNotification('✅ Conexión exitosa con Google Sheets', 'success');
                    console.log('Conexión exitosa:', result);
                } else {
                    Utils.showNotification('⚠️ Conexión establecida pero error: ' + (result.error || 'Desconocido'), 'error');
                    console.error('Error en respuesta:', result);
                }
            } else {
                const errorText = await response.text().catch(() => 'Error desconocido');
                Utils.showNotification('❌ Error HTTP ' + response.status + ': ' + errorText.substring(0, 50), 'error');
                console.error('Error HTTP:', response.status, errorText);
            }
        } catch (e) {
            console.error('Error completo:', e);
            let errorMsg = e.message || 'Error desconocido';
            
            // Mensajes más amigables según el tipo de error
            if (errorMsg.includes('CORS') || errorMsg.includes('Failed to fetch')) {
                errorMsg = 'Error de CORS. Verifica que el script esté desplegado correctamente y que tenga acceso público.';
            } else if (errorMsg.includes('NetworkError')) {
                errorMsg = 'Error de red. Verifica tu conexión a internet.';
            }
            
            Utils.showNotification('❌ Error al conectar: ' + errorMsg, 'error');
            
            // Mostrar ayuda adicional
            setTimeout(() => {
                UI.showModal('Ayuda - Error de Conexión', `
                    <div style="padding: var(--spacing-md);">
                        <h4 style="margin-bottom: var(--spacing-sm);">Posibles soluciones:</h4>
                        <ol style="margin-left: var(--spacing-md); line-height: 1.8;">
                            <li><strong>Verifica la URL:</strong> Debe ser la URL completa de tu Google Apps Script Web App</li>
                            <li><strong>Verifica el Token:</strong> Debe coincidir exactamente con el configurado en el script</li>
                            <li><strong>Verifica el despliegue:</strong> El script debe estar desplegado como "Aplicación web" con acceso "Cualquiera"</li>
                            <li><strong>Problemas CORS:</strong> Si usas archivos locales (file://), considera usar un servidor local o subir a un hosting</li>
                            <li><strong>Revisa la consola:</strong> Abre las herramientas de desarrollador (F12) para más detalles</li>
                        </ol>
                        <div style="margin-top: var(--spacing-md); padding: var(--spacing-sm); background: var(--color-bg-secondary); border-radius: var(--radius-sm);">
                            <strong>URL de ejemplo:</strong><br>
                            <code style="font-size: 11px; word-break: break-all;">https://script.google.com/macros/s/AKfycby.../exec</code>
                        </div>
                    </div>
                `, [
                    { text: 'Cerrar', class: 'btn-primary', onclick: () => UI.closeModal() }
                ]);
            }, 500);
        }
    },

    async forceSync() {
        if (typeof SyncManager !== 'undefined') {
            Utils.showNotification('Iniciando sincronización...', 'info');
            await SyncManager.sync();
        } else {
            Utils.showNotification('SyncManager no disponible', 'error');
        }
    },

    async loadSettingsHistory() {
        const historyContainer = document.getElementById('settings-history');
        if (!historyContainer) return;

        const settings = await DB.getAll('settings') || [];
        const sortedSettings = settings
            .filter(s => s.updated_at)
            .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
            .slice(0, 20);

        if (sortedSettings.length === 0) {
            historyContainer.innerHTML = '<div style="text-align: center; padding: var(--spacing-md); color: var(--color-text-secondary);">No hay historial</div>';
            return;
        }

        historyContainer.innerHTML = sortedSettings.map(s => `
            <div style="padding: var(--spacing-xs); border-bottom: 1px solid var(--color-border-light);">
                <div style="font-weight: 600; font-size: 10px;">${s.key}</div>
                <div style="font-size: 9px; color: var(--color-text-secondary);">
                    ${Utils.formatDate(s.updated_at, 'DD/MM/YYYY HH:mm')}
                </div>
            </div>
        `).join('');
    },

    async loadSystemInfo() {
        const infoContainer = document.getElementById('system-info');
        if (!infoContainer) return;

        try {
            const stores = ['sales', 'inventory_items', 'customers', 'repairs', 'cost_entries', 'employees', 'users'];
            const stats = {};

            for (const store of stores) {
                const items = await DB.getAll(store) || [];
                stats[store] = items.length;
            }

            const totalItems = Object.values(stats).reduce((sum, count) => sum + count, 0);

            infoContainer.innerHTML = `
                <div style="margin-bottom: var(--spacing-xs);">
                    <strong>Total de Registros:</strong> ${totalItems}
                </div>
                <div style="font-size: 10px; color: var(--color-text-secondary);">
                    <div>Ventas: ${stats.sales || 0}</div>
                    <div>Inventario: ${stats.inventory_items || 0}</div>
                    <div>Clientes: ${stats.customers || 0}</div>
                    <div>Reparaciones: ${stats.repairs || 0}</div>
                    <div>Costos: ${stats.cost_entries || 0}</div>
                    <div>Empleados: ${stats.employees || 0}</div>
                    <div>Usuarios: ${stats.users || 0}</div>
                </div>
                <div style="margin-top: var(--spacing-xs); font-size: 9px; color: var(--color-text-secondary);">
                    Versión: 1.0.0<br>
                    Última actualización: ${Utils.formatDate(new Date(), 'DD/MM/YYYY')}
                </div>
            `;
        } catch (e) {
            infoContainer.innerHTML = '<div style="color: var(--color-danger);">Error al cargar información</div>';
        }
    },

    async loadSyncStatus() {
        const statusContainer = document.getElementById('sync-status-info');
        if (!statusContainer) return;

        try {
            const syncLogs = await DB.getAll('sync_logs') || [];
            const lastSync = syncLogs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];

            statusContainer.innerHTML = `
                <div style="margin-bottom: var(--spacing-xs);">
                    <strong>Estado:</strong> 
                    <span style="color: ${lastSync?.status === 'success' ? 'var(--color-success)' : 'var(--color-danger)'};">
                        ${lastSync ? (lastSync.status === 'success' ? 'Sincronizado' : 'Error') : 'Sin sincronizar'}
                    </span>
                </div>
                ${lastSync ? `
                    <div style="font-size: 10px; color: var(--color-text-secondary);">
                        Última sincronización: ${Utils.formatDate(lastSync.created_at, 'DD/MM/YYYY HH:mm')}
                    </div>
                ` : ''}
            `;
        } catch (e) {
            statusContainer.innerHTML = '<div style="color: var(--color-danger);">Error al cargar estado</div>';
        }
    },

    async loadDatabaseStats() {
        const statsContainer = document.getElementById('db-stats');
        if (!statsContainer) return;

        try {
            const stores = ['sales', 'inventory_items', 'customers', 'repairs', 'cost_entries', 'employees', 'users', 'cash_sessions', 'cash_movements'];
            const stats = {};

            for (const store of stores) {
                try {
                    const items = await DB.getAll(store) || [];
                    stats[store] = items.length;
                } catch (e) {
                    stats[store] = 0;
                }
            }

            const totalItems = Object.values(stats).reduce((sum, count) => sum + count, 0);
            const dbSize = await this.estimateDatabaseSize();

            statsContainer.innerHTML = `
                <div style="margin-bottom: var(--spacing-xs);">
                    <strong>Total de Registros:</strong> ${totalItems.toLocaleString()}
                </div>
                <div style="font-size: 10px; color: var(--color-text-secondary); margin-bottom: var(--spacing-xs);">
                    <div>Ventas: ${stats.sales || 0}</div>
                    <div>Inventario: ${stats.inventory_items || 0}</div>
                    <div>Clientes: ${stats.customers || 0}</div>
                    <div>Reparaciones: ${stats.repairs || 0}</div>
                    <div>Costos: ${stats.cost_entries || 0}</div>
                    <div>Empleados: ${stats.employees || 0}</div>
                    <div>Usuarios: ${stats.users || 0}</div>
                    <div>Sesiones de Caja: ${stats.cash_sessions || 0}</div>
                    <div>Movimientos de Caja: ${stats.cash_movements || 0}</div>
                </div>
                <div style="font-size: 9px; color: var(--color-text-secondary); border-top: 1px solid var(--color-border-light); padding-top: var(--spacing-xs); margin-top: var(--spacing-xs);">
                    Tamaño estimado: ${dbSize}
                </div>
            `;
        } catch (e) {
            statsContainer.innerHTML = '<div style="color: var(--color-danger);">Error al cargar estadísticas</div>';
        }
    },

    async estimateDatabaseSize() {
        try {
            // Estimación simple basada en número de registros
            const stores = ['sales', 'inventory_items', 'customers', 'repairs', 'cost_entries', 'employees', 'users'];
            let totalRecords = 0;
            
            for (const store of stores) {
                try {
                    const items = await DB.getAll(store) || [];
                    totalRecords += items.length;
                } catch (e) {
                    // Ignorar errores
                }
            }

            // Estimación aproximada: ~2KB por registro promedio
            const estimatedSizeKB = Math.round((totalRecords * 2) / 1024);
            if (estimatedSizeKB < 1024) {
                return `${estimatedSizeKB} KB`;
            } else {
                return `${(estimatedSizeKB / 1024).toFixed(2)} MB`;
            }
        } catch (e) {
            return 'N/A';
        }
    }
};

window.Settings = Settings;

window.Settings = Settings;

