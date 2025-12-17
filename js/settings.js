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
                <button class="tab-btn" data-tab="arrival-rates"><i class="fas fa-table"></i> Tabulador Llegadas</button>
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
            case 'arrival-rates':
                content.innerHTML = this.getArrivalRatesTab();
                await this.loadArrivalRates();
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
                    <button class="btn-primary btn-sm" onclick="window.Settings.loadDemoData()" style="width: 100%; margin-bottom: var(--spacing-xs); background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; font-weight: 600; border: none;">
                        <i class="fas fa-database"></i> Cargar 20 Datos Demo
                    </button>
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
                    <button class="btn-primary btn-sm" onclick="window.Settings.loadDemoData()" style="width: 100%; margin-bottom: var(--spacing-xs); background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; font-weight: 600; border: none;">
                        <i class="fas fa-database"></i> Cargar 20 Datos Demo
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
    },

    getArrivalRatesTab() {
        return `
            <div style="margin-bottom: var(--spacing-md);">
                <button class="btn-primary" id="arrival-rate-add-btn">
                    <i class="fas fa-plus"></i> Nueva Regla de Llegadas
                </button>
            </div>
            <div id="arrival-rates-list" style="max-height: 600px; overflow-y: auto; width: 100%; overflow-x: auto;"></div>
        `;
    },

    async loadArrivalRates() {
        document.getElementById('arrival-rate-add-btn')?.addEventListener('click', () => this.showArrivalRateForm());

        try {
            const rules = await DB.getAll('arrival_rate_rules') || [];
            const agencies = await DB.getAll('catalog_agencies') || [];
            const branches = await DB.getAll('catalog_branches') || [];
            
            // Ordenar de manera organizada: Agencia > Sucursal > Pasajeros Mín > Tipo Unidad > Vigencia
            rules.sort((a, b) => {
                // 1. Por agencia (alfabético)
                const agencyA = agencies.find(ag => ag.id === a.agency_id);
                const agencyB = agencies.find(ag => ag.id === b.agency_id);
                const agencyNameA = agencyA?.name || a.agency_id || '';
                const agencyNameB = agencyB?.name || b.agency_id || '';
                if (agencyNameA !== agencyNameB) {
                    return agencyNameA.localeCompare(agencyNameB);
                }
                
                // 2. Por sucursal (alfabético, "Todas" al final)
                const branchA = branches.find(br => br.id === a.branch_id);
                const branchB = branches.find(br => br.id === b.branch_id);
                const branchNameA = branchA?.name || (a.branch_id ? a.branch_id : 'ZZZ_Todas');
                const branchNameB = branchB?.name || (b.branch_id ? b.branch_id : 'ZZZ_Todas');
                if (branchNameA !== branchNameB) {
                    return branchNameA.localeCompare(branchNameB);
                }
                
                // 3. Por pasajeros mínimos (ascendente)
                const minPaxA = a.min_passengers || 0;
                const minPaxB = b.min_passengers || 0;
                if (minPaxA !== minPaxB) {
                    return minPaxA - minPaxB;
                }
                
                // 4. Por tipo de unidad (alfabético, null al final)
                const unitTypeA = a.unit_type || 'zzz_cualquiera';
                const unitTypeB = b.unit_type || 'zzz_cualquiera';
                if (unitTypeA !== unitTypeB) {
                    return unitTypeA.localeCompare(unitTypeB);
                }
                
                // 5. Por vigencia desde (más reciente primero)
                const dateA = new Date(a.active_from || 0);
                const dateB = new Date(b.active_from || 0);
                return dateB - dateA;
            });

            this.displayArrivalRates(rules);
        } catch (e) {
            console.error('Error loading arrival rates:', e);
            Utils.showNotification('Error al cargar reglas de llegadas', 'error');
        }
    },

    async displayArrivalRates(rules) {
        const container = document.getElementById('arrival-rates-list');
        if (!container) return;

        if (rules.length === 0) {
            container.innerHTML = '<div class="empty-state">No hay reglas de llegadas registradas</div>';
            return;
        }

        const agencies = await DB.getAll('catalog_agencies') || [];
        const branches = await DB.getAll('catalog_branches') || [];

        // Agrupar por agencia para mejor visualización
        const groupedByAgency = {};
        rules.forEach(rule => {
            const agencyId = rule.agency_id || 'sin_agencia';
            if (!groupedByAgency[agencyId]) {
                groupedByAgency[agencyId] = [];
            }
            groupedByAgency[agencyId].push(rule);
        });

        container.innerHTML = `
            <table class="cart-table" style="width: 100%; max-width: 100%; table-layout: auto; min-width: 800px;">
                <thead>
                    <tr style="background: var(--color-bg-secondary);">
                        <th style="font-weight: 600;">Agencia</th>
                        <th style="font-weight: 600;">Sucursal</th>
                        <th style="font-weight: 600;">Pasajeros</th>
                        <th style="font-weight: 600;">Tipo Unidad</th>
                        <th style="font-weight: 600;">Tarifa por PAX</th>
                        <th style="font-weight: 600;">Vigencia Desde</th>
                        <th style="font-weight: 600;">Vigencia Hasta</th>
                        <th style="font-weight: 600;">Activa</th>
                        <th style="font-weight: 600;">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    ${Object.keys(groupedByAgency).map(agencyId => {
                        const agencyRules = groupedByAgency[agencyId];
                        const agency = agencies.find(a => a.id === agencyId);
                        const agencyName = agency?.name || agencyId;
                        
                        return agencyRules.map((rule, index) => {
                        const agency = agencies.find(a => a.id === rule.agency_id);
                        const branch = branches.find(b => b.id === rule.branch_id);
                        const unitTypeLabels = {
                            'city_tour': 'City Tour',
                            'sprinter': 'Sprinter',
                            'van': 'Van',
                            null: 'Cualquiera'
                        };
                        const isActive = !rule.active_until || new Date(rule.active_until) >= new Date();
                        const isFirstInGroup = index === 0;
                        
                        // Determinar cómo mostrar la tarifa
                        let feeDisplay = '';
                        if (rule.fee_type === 'flat' || rule.flat_fee) {
                            feeDisplay = Utils.formatCurrency(rule.flat_fee || 0);
                            if (rule.extra_per_passenger && rule.extra_per_passenger > 0) {
                                feeDisplay += ` <small style="color: var(--color-accent);">+${Utils.formatCurrency(rule.extra_per_passenger)}/PAX extra</small>`;
                            }
                        } else {
                            feeDisplay = `${Utils.formatCurrency(rule.rate_per_passenger || 0)}/PAX`;
                        }

                        return `
                            <tr style="${isFirstInGroup ? 'border-top: 2px solid var(--color-primary);' : ''}">
                                <td style="${isFirstInGroup ? 'font-weight: 600; background: var(--color-bg-secondary);' : ''}">
                                    ${isFirstInGroup ? agencyName : ''}
                                </td>
                                <td>${branch?.name || rule.branch_id || 'Todas'}</td>
                                <td>${rule.min_passengers || 1} - ${rule.max_passengers || '∞'}</td>
                                <td>${unitTypeLabels[rule.unit_type] || 'Cualquiera'}</td>
                                <td style="font-weight: 600;">${feeDisplay}</td>
                                <td>${Utils.formatDate(rule.active_from, 'DD/MM/YYYY')}</td>
                                <td>${rule.active_until ? Utils.formatDate(rule.active_until, 'DD/MM/YYYY') : 'Sin límite'}</td>
                                <td>${isActive ? '<span class="status-badge status-disponible">Sí</span>' : '<span class="status-badge status-reservado">No</span>'}</td>
                                <td style="white-space: nowrap;">
                                    <button class="btn-secondary btn-xs" onclick="window.Settings.editArrivalRate('${rule.id}')">
                                        <i class="fas fa-edit"></i> Editar
                                    </button>
                                    <button class="btn-danger btn-xs" onclick="window.Settings.deleteArrivalRate('${rule.id}')">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        `;
                        }).join('')}).join('')}
                </tbody>
            </table>
        `;
    },

    async showArrivalRateForm(ruleId = null) {
        const rule = ruleId ? await DB.get('arrival_rate_rules', ruleId) : null;
        const agencies = await DB.getAll('catalog_agencies') || [];
        const branches = await DB.getAll('catalog_branches') || [];

        const body = `
            <form id="arrival-rate-form" style="max-width: 600px;">
                <div class="form-group">
                    <label>Agencia *</label>
                    <select id="arrival-rate-agency" class="form-select" required>
                        <option value="">Seleccionar...</option>
                        ${agencies.map(a => `<option value="${a.id}" ${rule?.agency_id === a.id ? 'selected' : ''}>${a.name}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Sucursal</label>
                    <select id="arrival-rate-branch" class="form-select">
                        <option value="">Todas</option>
                        ${branches.map(b => `<option value="${b.id}" ${rule?.branch_id === b.id ? 'selected' : ''}>${b.name}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Pasajeros Mínimos</label>
                    <input type="number" id="arrival-rate-min-pax" class="form-input" value="${rule?.min_passengers || 1}" min="1" required>
                </div>
                <div class="form-group">
                    <label>Pasajeros Máximos</label>
                    <input type="number" id="arrival-rate-max-pax" class="form-input" value="${rule?.max_passengers || ''}" min="1" placeholder="Sin límite">
                </div>
                <div class="form-group">
                    <label>Tipo de Unidad</label>
                    <select id="arrival-rate-unit-type" class="form-select">
                        <option value="">Cualquiera</option>
                        <option value="city_tour" ${rule?.unit_type === 'city_tour' ? 'selected' : ''}>City Tour</option>
                        <option value="sprinter" ${rule?.unit_type === 'sprinter' ? 'selected' : ''}>Sprinter</option>
                        <option value="van" ${rule?.unit_type === 'van' ? 'selected' : ''}>Van</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Tipo de Tarifa *</label>
                    <select id="arrival-rate-fee-type" class="form-select" required>
                        <option value="flat" ${rule?.fee_type === 'flat' || rule?.flat_fee ? 'selected' : ''}>Tarifa Fija</option>
                        <option value="per_passenger" ${rule?.fee_type === 'per_passenger' || (!rule?.fee_type && !rule?.flat_fee) ? 'selected' : ''}>Por Pasajero</option>
                    </select>
                </div>
                <div class="form-group" id="arrival-rate-flat-fee-group" style="${rule?.fee_type === 'flat' || rule?.flat_fee ? '' : 'display: none;'}">
                    <label>Tarifa Fija (MXN) *</label>
                    <input type="number" id="arrival-rate-flat-fee" class="form-input" step="0.01" value="${rule?.flat_fee || 0}" min="0">
                </div>
                <div class="form-group" id="arrival-rate-per-pax-group" style="${rule?.fee_type === 'per_passenger' || (!rule?.fee_type && !rule?.flat_fee) ? '' : 'display: none;'}">
                    <label>Tarifa por Pasajero (MXN) *</label>
                    <input type="number" id="arrival-rate-amount" class="form-input" step="0.01" value="${rule?.rate_per_passenger || 0}" min="0">
                </div>
                <div class="form-group">
                    <label>Extra por Pasajero Adicional (MXN)</label>
                    <input type="number" id="arrival-rate-extra-per-pax" class="form-input" step="0.01" value="${rule?.extra_per_passenger || 0}" min="0" placeholder="0">
                    <small style="color: var(--color-text-secondary); font-size: 10px;">Se aplica cuando se excede el máximo de pasajeros del rango</small>
                </div>
                <div class="form-group">
                    <label>Vigencia Desde *</label>
                    <input type="date" id="arrival-rate-from" class="form-input" value="${rule?.active_from ? Utils.formatDate(rule.active_from, 'YYYY-MM-DD') : Utils.formatDate(new Date(), 'YYYY-MM-DD')}" required>
                </div>
                <div class="form-group">
                    <label>Vigencia Hasta</label>
                    <input type="date" id="arrival-rate-until" class="form-input" value="${rule?.active_until ? Utils.formatDate(rule.active_until, 'YYYY-MM-DD') : ''}" placeholder="Sin límite">
                </div>
                <div class="form-group">
                    <label>Notas</label>
                    <textarea id="arrival-rate-notes" class="form-input" rows="3" style="resize: vertical;">${rule?.notes || ''}</textarea>
                </div>
            </form>
        `;

        UI.showModal(ruleId ? 'Editar Regla de Llegadas' : 'Nueva Regla de Llegadas', body, [
            { text: 'Cancelar', class: 'btn-secondary', onclick: () => UI.closeModal() },
            { text: 'Guardar', class: 'btn-primary', onclick: () => this.saveArrivalRate(ruleId) }
        ]);
        
        // Event listener para mostrar/ocultar campos según tipo de tarifa
        const feeTypeSelect = document.getElementById('arrival-rate-fee-type');
        const flatFeeGroup = document.getElementById('arrival-rate-flat-fee-group');
        const perPaxGroup = document.getElementById('arrival-rate-per-pax-group');
        
        if (feeTypeSelect) {
            feeTypeSelect.addEventListener('change', () => {
                const feeType = feeTypeSelect.value;
                if (feeType === 'flat') {
                    flatFeeGroup.style.display = 'block';
                    perPaxGroup.style.display = 'none';
                    document.getElementById('arrival-rate-flat-fee')?.setAttribute('required', 'required');
                    document.getElementById('arrival-rate-amount')?.removeAttribute('required');
                } else {
                    flatFeeGroup.style.display = 'none';
                    perPaxGroup.style.display = 'block';
                    document.getElementById('arrival-rate-amount')?.setAttribute('required', 'required');
                    document.getElementById('arrival-rate-flat-fee')?.removeAttribute('required');
                }
            });
            // Trigger inicial
            feeTypeSelect.dispatchEvent(new Event('change'));
        }
    },

    async saveArrivalRate(ruleId = null) {
        try {
            const form = document.getElementById('arrival-rate-form');
            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }

            const feeType = document.getElementById('arrival-rate-fee-type').value;
            const flatFee = feeType === 'flat' ? parseFloat(document.getElementById('arrival-rate-flat-fee').value) : 0;
            const ratePerPax = feeType === 'per_passenger' ? parseFloat(document.getElementById('arrival-rate-amount').value) : 0;
            const extraPerPax = parseFloat(document.getElementById('arrival-rate-extra-per-pax').value) || 0;

            const rule = {
                id: ruleId || Utils.generateId(),
                agency_id: document.getElementById('arrival-rate-agency').value,
                branch_id: document.getElementById('arrival-rate-branch').value || null,
                min_passengers: parseInt(document.getElementById('arrival-rate-min-pax').value) || 1,
                max_passengers: document.getElementById('arrival-rate-max-pax').value ? parseInt(document.getElementById('arrival-rate-max-pax').value) : null,
                unit_type: document.getElementById('arrival-rate-unit-type').value || null,
                fee_type: feeType,
                rate_per_passenger: ratePerPax,
                flat_fee: flatFee,
                extra_per_passenger: extraPerPax > 0 ? extraPerPax : null,
                active_from: document.getElementById('arrival-rate-from').value,
                active_until: document.getElementById('arrival-rate-until').value || null,
                notes: document.getElementById('arrival-rate-notes').value || '',
                created_at: ruleId ? (await DB.get('arrival_rate_rules', ruleId))?.created_at : new Date().toISOString(),
                updated_at: new Date().toISOString(),
                sync_status: 'pending'
            };

            await DB.put('arrival_rate_rules', rule);
            await SyncManager.addToQueue('arrival_rate_rule', rule.id);
            
            Utils.showNotification('Regla de llegadas guardada', 'success');
            UI.closeModal();
            await this.loadArrivalRates();
        } catch (e) {
            console.error('Error saving arrival rate:', e);
            Utils.showNotification('Error al guardar regla de llegadas', 'error');
        }
    },

    async editArrivalRate(ruleId) {
        await this.showArrivalRateForm(ruleId);
    },

    async deleteArrivalRate(ruleId) {
        if (!confirm('¿Estás seguro de eliminar esta regla de llegadas?')) return;

        try {
            await DB.delete('arrival_rate_rules', ruleId);
            await SyncManager.addToQueue('arrival_rate_rule', ruleId, 'delete');
            Utils.showNotification('Regla eliminada', 'success');
            await this.loadArrivalRates();
        } catch (e) {
            console.error('Error deleting arrival rate:', e);
            Utils.showNotification('Error al eliminar regla', 'error');
        }
    },

    /**
     * Carga 20 datos demo completos para validar todo el flujo del sistema
     */
    async loadDemoData() {
        if (!confirm('¿Cargar datos demo completos? Esto creará datos para todos los módulos del sistema.\n\n¿Continuar?')) {
            return;
        }

        try {
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/d085ffd8-d37f-46dc-af23-0f9fbbe46595',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'settings.js:1889',message:'loadDemoData START',data:{timestamp:new Date().toISOString()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
            // #endregion

            // Verificar que los módulos necesarios estén disponibles
            if (typeof ArrivalRules === 'undefined') {
                // #region agent log
                fetch('http://127.0.0.1:7242/ingest/d085ffd8-d37f-46dc-af23-0f9fbbe46595',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'settings.js:1896',message:'ArrivalRules undefined',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
                // #endregion
                Utils.showNotification('Error: Módulo ArrivalRules no está disponible', 'error');
                return;
            }
            if (typeof SyncManager === 'undefined') {
                // #region agent log
                fetch('http://127.0.0.1:7242/ingest/d085ffd8-d37f-46dc-af23-0f9fbbe46595',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'settings.js:1900',message:'SyncManager undefined',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
                // #endregion
                Utils.showNotification('Error: Módulo SyncManager no está disponible', 'error');
                return;
            }

            Utils.showNotification('Cargando datos demo...', 'info');
            const branchId = localStorage.getItem('current_branch_id') || 'branch1';
            const today = new Date();
            const actions = [];
            
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/d085ffd8-d37f-46dc-af23-0f9fbbe46595',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'settings.js:1906',message:'Parameters initialized',data:{branchId,today:today.toISOString()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
            // #endregion

            // 1. Reglas de tarifas de llegadas (5 reglas)
            const agencies = await DB.getAll('catalog_agencies') || [];
            const branches = await DB.getAll('catalog_branches') || [];
            const targetAgencies = ['TRAVELEX', 'VERANOS', 'TANITOURS', 'DISCOVERY', 'TB'];
            
            for (let i = 0; i < 5; i++) {
                const agency = agencies.find(a => targetAgencies.includes(a.name.toUpperCase())) || agencies[0];
                const branch = branches[i % branches.length] || branches[0];
                
                const rule = {
                    id: Utils.generateId(),
                    agency_id: agency?.id || 'agency1',
                    branch_id: branch?.id || branchId,
                    min_passengers: [1, 5, 10, 15, 20][i],
                    max_passengers: [4, 9, 14, 19, null][i],
                    unit_type: ['city_tour', 'sprinter', 'van', null, 'city_tour'][i],
                    rate_per_passenger: [150, 120, 100, 90, 150][i],
                    active_from: Utils.formatDate(new Date(today.getTime() - (i * 30 * 24 * 60 * 60 * 1000)), 'YYYY-MM-DD'),
                    active_until: i === 0 ? null : Utils.formatDate(new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000)), 'YYYY-MM-DD'),
                    notes: `Regla demo ${i + 1} - ${agency?.name || 'Agencia'} - ${branch?.name || 'Sucursal'}`,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    sync_status: 'pending'
                };
                await DB.put('arrival_rate_rules', rule);
                await SyncManager.addToQueue('arrival_rate_rule', rule.id);
                actions.push(`✓ Regla de tarifa ${i + 1} creada`);
            }

            // 2. Llegadas de agencias (5 llegadas)
            for (let i = 0; i < 5; i++) {
                const date = new Date(today);
                date.setDate(date.getDate() - i);
                const dateStr = Utils.formatDate(date, 'YYYY-MM-DD');
                const agency = agencies.find(a => targetAgencies.includes(a.name.toUpperCase())) || agencies[i % agencies.length];
                const passengers = [15, 25, 30, 20, 35][i];
                const unitType = ['city_tour', 'sprinter', 'van', 'city_tour', 'sprinter'][i];
                
                // Calcular tarifa
                const calculation = await ArrivalRules.calculateArrivalFee(
                    agency?.id || 'agency1',
                    branchId,
                    passengers,
                    unitType,
                    dateStr
                );
                
                const arrival = {
                    id: Utils.generateId(),
                    date: dateStr,
                    branch_id: branchId,
                    agency_id: agency?.id || 'agency1',
                    passengers: passengers,
                    units: Math.ceil(passengers / 15),
                    unit_type: unitType,
                    calculated_fee: calculation.calculatedFee || (passengers * 120),
                    override: false,
                    arrival_fee: calculation.calculatedFee || (passengers * 120),
                    notes: `Llegada demo ${i + 1} - ${agency?.name || 'Agencia'}`,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    sync_status: 'pending'
                };
                await DB.put('agency_arrivals', arrival);
                await SyncManager.addToQueue('agency_arrival', arrival.id);
                actions.push(`✓ Llegada ${i + 1} (${passengers} PAX) creada`);
            }

            // 3. Reportes de utilidad diaria (3 reportes)
            for (let i = 0; i < 3; i++) {
                const date = new Date(today);
                date.setDate(date.getDate() - i);
                const dateStr = Utils.formatDate(date, 'YYYY-MM-DD');
                
                // Obtener llegadas del día
                const dayArrivals = await DB.query('agency_arrivals', 'date', dateStr) || [];
                const dayArrivalsFiltered = dayArrivals.filter(a => a.branch_id === branchId || !a.branch_id);
                const arrivalCosts = dayArrivalsFiltered.reduce((sum, a) => sum + (a.arrival_fee || 0), 0);
                const totalPassengers = dayArrivalsFiltered.reduce((sum, a) => sum + (a.passengers || 0), 0);
                
                // Obtener ventas del día
                const allSales = await DB.getAll('sales') || [];
                const daySales = allSales.filter(s => {
                    if (!s.created_at) return false;
                    const saleDate = s.created_at.split('T')[0];
                    return saleDate === dateStr && s.branch_id === branchId && s.status === 'completada';
                });
                const revenue = daySales.reduce((sum, s) => sum + (s.total || 0), 0);
                
                // Obtener costos del día (prorrateados)
                const allCosts = await DB.getAll('cost_entries') || [];
                const dayCosts = allCosts.filter(c => {
                    const costDate = new Date(c.date || c.created_at);
                    return costDate.toISOString().split('T')[0] === dateStr && 
                           (c.branch_id === branchId || !c.branch_id);
                });
                let operatingCosts = dayCosts.reduce((sum, c) => sum + (c.amount || 0), 0);
                
                // Agregar prorrateo de costos recurrentes
                const recurringCosts = allCosts.filter(c => c.recurring === true);
                for (const cost of recurringCosts) {
                    if (cost.branch_id && cost.branch_id !== branchId) continue;
                    
                    let dailyProrate = 0;
                    if (cost.period_type === 'daily') {
                        dailyProrate = cost.amount || 0;
                    } else if (cost.period_type === 'weekly') {
                        dailyProrate = (cost.amount || 0) / 7;
                    } else if (cost.period_type === 'monthly') {
                        const costDate = new Date(cost.date || cost.created_at);
                        const daysInMonth = new Date(costDate.getFullYear(), costDate.getMonth() + 1, 0).getDate();
                        dailyProrate = (cost.amount || 0) / daysInMonth;
                    }
                    operatingCosts += dailyProrate;
                }
                
                // Calcular comisiones
                const saleItems = await DB.getAll('sale_items') || [];
                let commissions = 0;
                for (const sale of daySales) {
                    const items = saleItems.filter(si => si.sale_id === sale.id);
                    for (const item of items) {
                        if (item.commission_amount) {
                            commissions += item.commission_amount;
                        }
                    }
                }
                
                const grossProfit = revenue - arrivalCosts - operatingCosts;
                const netProfit = grossProfit - commissions;
                
                const profitReport = {
                    id: Utils.generateId(),
                    date: dateStr,
                    branch_id: branchId,
                    revenue: revenue,
                    arrival_costs: arrivalCosts,
                    operating_costs: operatingCosts,
                    commissions: commissions,
                    gross_profit: grossProfit,
                    net_profit: netProfit,
                    total_passengers: totalPassengers,
                    total_sales: daySales.length,
                    notes: `Reporte demo ${i + 1} - ${dateStr}`,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    sync_status: 'pending'
                };
                await DB.put('daily_profit_reports', profitReport);
                await SyncManager.addToQueue('daily_profit_report', profitReport.id);
                actions.push(`✓ Reporte utilidad ${i + 1} (${Utils.formatCurrency(netProfit)}) creado`);
            }

            // 4. Costos recurrentes (3 costos)
            const recurringCategories = ['nomina', 'renta', 'luz'];
            for (let i = 0; i < 3; i++) {
                const cost = {
                    id: Utils.generateId(),
                    type: 'fijo',
                    category: recurringCategories[i],
                    amount: [5000, 15000, 2000][i],
                    branch_id: i === 0 ? branchId : null, // Nómina por tienda, otros generales
                    date: Utils.formatDate(today, 'YYYY-MM-DD'),
                    period_type: i === 0 ? 'weekly' : 'monthly',
                    recurring: true,
                    auto_generate: true,
                    notes: `Costo recurrente demo ${i + 1} - ${recurringCategories[i]}`,
                    created_at: new Date().toISOString(),
                    sync_status: 'pending'
                };
                await DB.put('cost_entries', cost);
                await SyncManager.addToQueue('cost_entry', cost.id);
                actions.push(`✓ Costo recurrente ${i + 1} (${recurringCategories[i]}) creado`);
            }

            // 5. Costos normales (2 costos)
            for (let i = 0; i < 2; i++) {
                const cost = {
                    id: Utils.generateId(),
                    type: 'variable',
                    category: ['despensa', 'mantenimiento'][i],
                    amount: [800, 1200][i],
                    branch_id: branchId,
                    date: Utils.formatDate(new Date(today.getTime() - (i * 2 * 24 * 60 * 60 * 1000)), 'YYYY-MM-DD'),
                    period_type: 'one_time',
                    recurring: false,
                    notes: `Costo demo ${i + 1} - ${['despensa', 'mantenimiento'][i]}`,
                    created_at: new Date().toISOString(),
                    sync_status: 'pending'
                };
                await DB.put('cost_entries', cost);
                await SyncManager.addToQueue('cost_entry', cost.id);
                actions.push(`✓ Costo normal ${i + 1} creado`);
            }

            // 6. Productos de inventario (5 productos)
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/d085ffd8-d37f-46dc-af23-0f9fbbe46595',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'settings.js:2105',message:'Starting inventory items generation',data:{count:5},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
            // #endregion
            const metals = ['Oro', 'Plata', 'Oro Rosa'];
            const stones = ['Diamante', 'Zafiro', 'Rubí', 'Esmeralda', 'Perla'];
            const sizes = ['6', '7', '8', '9', '10'];
            
            for (let i = 0; i < 5; i++) {
                try {
                    const inventoryItem = {
                        id: Utils.generateId(),
                        sku: `DEMO-${String(1000 + i)}`,
                        barcode: `DEMO${String(1000 + i).padStart(8, '0')}`,
                        name: `${metals[i % metals.length]} con ${stones[i % stones.length]} - Demo ${i + 1}`,
                        metal: metals[i % metals.length],
                        stone: stones[i % stones.length],
                        size: sizes[i % sizes.length],
                        weight_g: [5.5, 8.2, 12.3, 15.7, 20.1][i],
                        measurements: `${[10, 12, 14, 16, 18][i]}mm x ${[8, 10, 12, 14, 16][i]}mm`,
                        cost: [2000, 3500, 5000, 7500, 10000][i],
                        price: [5000, 8000, 12000, 18000, 25000][i],
                        location: `Estante ${i + 1}`,
                        status: 'disponible',
                        branch_id: branchId,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                        sync_status: 'pending'
                    };
                    await DB.put('inventory_items', inventoryItem);
                    // #region agent log
                    fetch('http://127.0.0.1:7242/ingest/d085ffd8-d37f-46dc-af23-0f9fbbe46595',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'settings.js:2120',message:'Inventory item saved',data:{id:inventoryItem.id,sku:inventoryItem.sku},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
                    // #endregion
                    await SyncManager.addToQueue('inventory_item', inventoryItem.id);
                    actions.push(`✓ Producto ${i + 1} (${inventoryItem.name}) creado`);
                } catch (e) {
                    // #region agent log
                    fetch('http://127.0.0.1:7242/ingest/d085ffd8-d37f-46dc-af23-0f9fbbe46595',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'settings.js:2125',message:'Error creating inventory item',data:{index:i,error:e.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
                    // #endregion
                    console.error(`Error creating inventory item ${i + 1}:`, e);
                }
            }

            // 7. Clientes (3 clientes)
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/d085ffd8-d37f-46dc-af23-0f9fbbe46595',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'settings.js:2130',message:'Starting customers generation',data:{count:3},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
            // #endregion
            const customerNames = ['María González', 'Juan Pérez', 'Ana Martínez'];
            const customerPhones = ['3312345678', '3323456789', '3334567890'];
            const customerEmails = ['maria@demo.com', 'juan@demo.com', 'ana@demo.com'];
            
            for (let i = 0; i < 3; i++) {
                try {
                    const customer = {
                        id: Utils.generateId(),
                        name: customerNames[i],
                        phone: customerPhones[i],
                        email: customerEmails[i],
                        address: `Calle Demo ${i + 1} #${100 + i}, Guadalajara`,
                        notes: `Cliente demo ${i + 1}`,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                        sync_status: 'pending'
                    };
                    await DB.put('customers', customer);
                    // #region agent log
                    fetch('http://127.0.0.1:7242/ingest/d085ffd8-d37f-46dc-af23-0f9fbbe46595',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'settings.js:2145',message:'Customer saved',data:{id:customer.id,name:customer.name},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
                    // #endregion
                    await SyncManager.addToQueue('customer', customer.id);
                    actions.push(`✓ Cliente ${i + 1} (${customer.name}) creado`);
                } catch (e) {
                    // #region agent log
                    fetch('http://127.0.0.1:7242/ingest/d085ffd8-d37f-46dc-af23-0f9fbbe46595',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'settings.js:2150',message:'Error creating customer',data:{index:i,error:e.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
                    // #endregion
                    console.error(`Error creating customer ${i + 1}:`, e);
                }
            }

            // 8. Reparaciones (2 reparaciones)
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/d085ffd8-d37f-46dc-af23-0f9fbbe46595',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'settings.js:2155',message:'Starting repairs generation',data:{count:2},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
            // #endregion
            const allCustomers = await DB.getAll('customers') || [];
            const allInventoryItems = await DB.getAll('inventory_items') || [];
            
            for (let i = 0; i < 2; i++) {
                try {
                    const customer = allCustomers[i % allCustomers.length] || allCustomers[0];
                    const item = allInventoryItems[i % allInventoryItems.length] || allInventoryItems[0];
                    
                    const repair = {
                        id: Utils.generateId(),
                        folio: `REP-DEMO-${String(Date.now()).slice(-6)}-${i + 1}`,
                        customer_id: customer?.id || null,
                        item_id: item?.id || null,
                        description: `Reparación demo ${i + 1}: ${['Ajuste de talla', 'Soldadura de eslabón'][i]}`,
                        status: ['en_proceso', 'completada'][i],
                        cost: [500, 800][i],
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                        sync_status: 'pending'
                    };
                    await DB.put('repairs', repair);
                    await SyncManager.addToQueue('repair', repair.id);
                    actions.push(`✓ Reparación ${i + 1} (${repair.folio}) creada`);
                } catch (e) {
                    // #region agent log
                    fetch('http://127.0.0.1:7242/ingest/d085ffd8-d37f-46dc-af23-0f9fbbe46595',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'settings.js:2175',message:'Error creating repair',data:{index:i,error:e.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
                    // #endregion
                    console.error(`Error creating repair ${i + 1}:`, e);
                }
            }

            // 9. Ventas relacionadas (3 ventas con pagos e items)
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/d085ffd8-d37f-46dc-af23-0f9fbbe46595',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'settings.js:2180',message:'Starting sales generation',data:{count:3},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
            // #endregion
            const sellers = await DB.getAll('catalog_sellers') || [];
            const guides = await DB.getAll('catalog_guides') || [];
            const inventoryItems = await DB.getAll('inventory_items') || [];
            
            for (let i = 0; i < 3; i++) {
                try {
                    const saleDate = new Date(today);
                    saleDate.setDate(saleDate.getDate() - i);
                    const saleDateStr = saleDate.toISOString();
                    
                    const seller = sellers[i % sellers.length] || sellers[0];
                    const guide = guides[i % guides.length] || guides[0];
                    const agency = agencies[i % agencies.length] || agencies[0];
                    const customer = allCustomers[i % allCustomers.length] || allCustomers[0];
                    
                    const sale = {
                        id: Utils.generateId(),
                        folio: `DEMO-${String(Date.now()).slice(-6)}-${i + 1}`,
                        branch_id: branchId,
                        seller_id: seller?.id || null,
                        guide_id: guide?.id || null,
                        agency_id: agency?.id || null,
                        customer_id: customer?.id || null,
                        passengers: [2, 4, 3][i],
                        currency: 'MXN',
                        exchange_rate: 1,
                        subtotal: [5000, 8000, 6000][i],
                        discount: 0,
                        total: [5000, 8000, 6000][i],
                        status: 'completada',
                        notes: `Venta demo ${i + 1}`,
                        created_at: saleDateStr,
                        updated_at: saleDateStr,
                        sync_status: 'pending'
                    };
                    await DB.put('sales', sale);
                    // #region agent log
                    fetch('http://127.0.0.1:7242/ingest/d085ffd8-d37f-46dc-af23-0f9fbbe46595',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'settings.js:2215',message:'Sale saved',data:{id:sale.id,folio:sale.folio,total:sale.total},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
                    // #endregion
                    await SyncManager.addToQueue('sale', sale.id);
                    
                    // Agregar items de venta
                    if (inventoryItems.length > 0) {
                        const item = inventoryItems[i % inventoryItems.length];
                        const saleItem = {
                            id: Utils.generateId(),
                            sale_id: sale.id,
                            item_id: item.id,
                            quantity: 1,
                            price: sale.subtotal,
                            discount: 0,
                            subtotal: sale.subtotal,
                            commission_amount: sale.subtotal * 0.05,
                            created_at: saleDateStr
                        };
                        await DB.put('sale_items', saleItem);
                    }
                    
                    // Agregar pago
                    const payment = {
                        id: Utils.generateId(),
                        sale_id: sale.id,
                        method: ['cash', 'card', 'cash'][i],
                        amount: sale.total,
                        currency: 'MXN',
                        exchange_rate: 1,
                        created_at: saleDateStr,
                        sync_status: 'pending'
                    };
                    await DB.put('payments', payment);
                    await SyncManager.addToQueue('payment', payment.id);
                    
                    actions.push(`✓ Venta ${i + 1} (${Utils.formatCurrency(sale.total)}) con pago creada`);
                } catch (e) {
                    // #region agent log
                    fetch('http://127.0.0.1:7242/ingest/d085ffd8-d37f-46dc-af23-0f9fbbe46595',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'settings.js:2235',message:'Error creating sale',data:{index:i,error:e.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
                    // #endregion
                    console.error(`Error creating sale ${i + 1}:`, e);
                }
            }

            // 10. Reportes turistas completos (2 reportes con líneas)
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/d085ffd8-d37f-46dc-af23-0f9fbbe46595',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'settings.js:2240',message:'Starting tourist reports generation',data:{count:2},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
            // #endregion
            const allSales = await DB.getAll('sales') || [];
            
            for (let i = 0; i < 2; i++) {
                try {
                    const date = new Date(today);
                    date.setDate(date.getDate() - i);
                    const dateStr = Utils.formatDate(date, 'YYYY-MM-DD');
                    
                    const report = {
                        id: Utils.generateId(),
                        date: dateStr,
                        branch_id: branchId,
                        exchange_rate: 20.0,
                        status: 'completado',
                        observations: `Reporte demo ${i + 1}`,
                        total_cash_usd: [100, 150][i],
                        total_cash_mxn: [2000, 3000][i],
                        total_cash_cad: 0,
                        subtotal: [2000, 3000][i],
                        additional: 0,
                        total: [2000, 3000][i],
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                        sync_status: 'pending'
                    };
                    await DB.put('tourist_reports', report);
                    await SyncManager.addToQueue('tourist_report', report.id);
                    
                    // Agregar líneas del reporte
                    const reportSales = allSales.filter(s => {
                        if (!s.created_at) return false;
                        return s.created_at.split('T')[0] === dateStr;
                    }).slice(0, 2);
                    
                    for (const sale of reportSales) {
                        const line = {
                            id: Utils.generateId(),
                            report_id: report.id,
                            sale_id: sale.id,
                            identification: `DEMO-${i + 1}-${sale.id.slice(0, 6)}`,
                            seller_id: sale.seller_id,
                            guide_id: sale.guide_id,
                            agency_id: sale.agency_id,
                            quantity: sale.passengers || 1,
                            weight_g: 0,
                            products: 'Producto demo',
                            exchange_rate: 20.0,
                            cash_eur: 0,
                            cash_cad: 0,
                            cash_usd: [50, 75][i],
                            cash_mxn: [1000, 1500][i],
                            tpv_visa_mc: 0,
                            tpv_amex: 0,
                            total: sale.total || 0,
                            created_at: new Date().toISOString()
                        };
                        await DB.put('tourist_report_lines', line);
                    }
                    
                    actions.push(`✓ Reporte turista ${i + 1} con ${reportSales.length} líneas creado`);
                } catch (e) {
                    // #region agent log
                    fetch('http://127.0.0.1:7242/ingest/d085ffd8-d37f-46dc-af23-0f9fbbe46595',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'settings.js:2290',message:'Error creating tourist report',data:{index:i,error:e.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
                    // #endregion
                    console.error(`Error creating tourist report ${i + 1}:`, e);
                }
            }

            // 11. Sesiones de caja (2 sesiones)
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/d085ffd8-d37f-46dc-af23-0f9fbbe46595',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'settings.js:2295',message:'Starting cash sessions generation',data:{count:2},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
            // #endregion
            const users = await DB.getAll('users') || [];
            const currentUser = users[0] || { id: 'user1' };
            
            for (let i = 0; i < 2; i++) {
                try {
                    const sessionDate = new Date(today);
                    sessionDate.setDate(sessionDate.getDate() - i);
                    const sessionDateStr = sessionDate.toISOString();
                    
                    const session = {
                        id: Utils.generateId(),
                        branch_id: branchId,
                        user_id: currentUser.id,
                        opened_at: sessionDateStr,
                        closed_at: i === 0 ? null : new Date(sessionDate.getTime() + (8 * 60 * 60 * 1000)).toISOString(),
                        initial_cash_usd: [100, 150][i],
                        initial_cash_mxn: [2000, 3000][i],
                        initial_cash_cad: 0,
                        final_cash_usd: i === 0 ? null : [150, 200][i],
                        final_cash_mxn: i === 0 ? null : [4000, 5000][i],
                        final_cash_cad: i === 0 ? null : 0,
                        status: i === 0 ? 'open' : 'closed',
                        notes: `Sesión demo ${i + 1}`,
                        created_at: sessionDateStr,
                        updated_at: sessionDateStr,
                        sync_status: 'pending'
                    };
                    await DB.put('cash_sessions', session);
                    await SyncManager.addToQueue('cash_session', session.id);
                    
                    // Agregar movimientos de caja para sesiones cerradas
                    if (i === 1) {
                        const movement = {
                            id: Utils.generateId(),
                            session_id: session.id,
                            type: 'income',
                            amount: 2000,
                            currency: 'MXN',
                            description: 'Movimiento demo',
                            created_at: sessionDateStr,
                            sync_status: 'pending'
                        };
                        await DB.put('cash_movements', movement);
                        await SyncManager.addToQueue('cash_movement', movement.id);
                    }
                    
                    actions.push(`✓ Sesión de caja ${i + 1} (${session.status}) creada`);
                } catch (e) {
                    // #region agent log
                    fetch('http://127.0.0.1:7242/ingest/d085ffd8-d37f-46dc-af23-0f9fbbe46595',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'settings.js:2335',message:'Error creating cash session',data:{index:i,error:e.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
                    // #endregion
                    console.error(`Error creating cash session ${i + 1}:`, e);
                }
            }
            
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/d085ffd8-d37f-46dc-af23-0f9fbbe46595',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'settings.js:2340',message:'loadDemoData COMPLETE',data:{totalActions:actions.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
            // #endregion

            // Verificar que los datos se guardaron correctamente
            const verifyInventory = await DB.getAll('inventory_items') || [];
            const verifyCustomers = await DB.getAll('customers') || [];
            const verifySales = await DB.getAll('sales') || [];
            const verifyRepairs = await DB.getAll('repairs') || [];
            const verifyTouristReports = await DB.getAll('tourist_reports') || [];
            const verifyCashSessions = await DB.getAll('cash_sessions') || [];
            const verifyArrivals = await DB.getAll('agency_arrivals') || [];
            const verifyArrivalRules = await DB.getAll('arrival_rate_rules') || [];
            const verifyProfitReports = await DB.getAll('daily_profit_reports') || [];
            const verifyCosts = await DB.getAll('cost_entries') || [];
            
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/d085ffd8-d37f-46dc-af23-0f9fbbe46595',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'settings.js:2452',message:'Data verification',data:{inventory:verifyInventory.length,customers:verifyCustomers.length,sales:verifySales.length,repairs:verifyRepairs.length,touristReports:verifyTouristReports.length,cashSessions:verifyCashSessions.length,arrivals:verifyArrivals.length,arrivalRules:verifyArrivalRules.length,profitReports:verifyProfitReports.length,costs:verifyCosts.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
            // #endregion

            // Mostrar resumen con verificación
            const summary = `
                <div style="padding: var(--spacing-md); max-height: 400px; overflow-y: auto;">
                    <h3 style="margin-bottom: var(--spacing-md); color: var(--color-success);">
                        <i class="fas fa-check-circle"></i> Datos Demo Cargados Exitosamente
                    </h3>
                    <div style="background: var(--color-bg-secondary); padding: var(--spacing-sm); border-radius: var(--radius-sm); margin-bottom: var(--spacing-md);">
                        <strong>Total de acciones:</strong> ${actions.length}
                    </div>
                    <div style="background: var(--color-bg-secondary); padding: var(--spacing-sm); border-radius: var(--radius-sm); margin-bottom: var(--spacing-md); font-size: 11px;">
                        <strong>Verificación en BD:</strong><br>
                        • Inventario: ${verifyInventory.length} productos<br>
                        • Clientes: ${verifyCustomers.length} clientes<br>
                        • Ventas: ${verifySales.length} ventas<br>
                        • Reparaciones: ${verifyRepairs.length} reparaciones<br>
                        • Reportes Turistas: ${verifyTouristReports.length} reportes<br>
                        • Sesiones Caja: ${verifyCashSessions.length} sesiones<br>
                        • Llegadas: ${verifyArrivals.length} llegadas<br>
                        • Reglas Tarifas: ${verifyArrivalRules.length} reglas<br>
                        • Reportes Utilidad: ${verifyProfitReports.length} reportes<br>
                        • Costos: ${verifyCosts.length} costos
                    </div>
                    <div style="display: flex; flex-direction: column; gap: var(--spacing-xs);">
                        ${actions.map(action => `
                            <div style="padding: var(--spacing-xs); background: var(--color-bg-card); border-radius: var(--radius-xs); font-size: 12px;">
                                ${action}
                            </div>
                        `).join('')}
                    </div>
                    <div style="margin-top: var(--spacing-md); padding: var(--spacing-sm); background: var(--color-accent); color: white; border-radius: var(--radius-sm); font-size: 11px;">
                        <strong>💡 Siguiente paso:</strong> Revisa todos los módulos del sistema (Inventario, Clientes, Reparaciones, Ventas, Reporte Turistas, Caja, Costos, Dashboard) para validar el flujo completo.
                    </div>
                </div>
            `;

            UI.showModal('Datos Demo Cargados', summary, [
                { text: 'Cerrar', class: 'btn-primary', onclick: () => UI.closeModal() }
            ]);

            Utils.showNotification(`${actions.length} datos demo cargados exitosamente`, 'success');
            
            // Refrescar módulos activos manualmente
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/d085ffd8-d37f-46dc-af23-0f9fbbe46595',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'settings.js:2509',message:'Refreshing modules',data:{currentModule:localStorage.getItem('current_module')},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
            // #endregion
            
            // Refrescar módulos según cuál esté activo
            try {
                const currentModule = localStorage.getItem('current_module') || '';
                if (currentModule === 'inventory' && typeof Inventory !== 'undefined' && Inventory.initialized) {
                    await Inventory.loadInventory();
                }
                if (currentModule === 'customers' && typeof Customers !== 'undefined' && Customers.initialized) {
                    await Customers.loadCustomers();
                }
                if (currentModule === 'repairs' && typeof Repairs !== 'undefined' && Repairs.initialized) {
                    await Repairs.loadRepairs();
                }
                if (currentModule === 'pos' && typeof POS !== 'undefined' && POS.initialized) {
                    await POS.loadProducts();
                }
                if (currentModule === 'costs' && typeof Costs !== 'undefined' && Costs.initialized) {
                    await Costs.loadCosts();
                }
                if (currentModule === 'cash' && typeof Cash !== 'undefined' && Cash.initialized) {
                    await Cash.loadCurrentSession();
                }
                if (currentModule === 'dashboard' && typeof Dashboard !== 'undefined' && Dashboard.initialized) {
                    await Dashboard.loadDashboard();
                }
            } catch (refreshError) {
                // #region agent log
                fetch('http://127.0.0.1:7242/ingest/d085ffd8-d37f-46dc-af23-0f9fbbe46595',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'settings.js:2535',message:'Error refreshing modules',data:{error:refreshError.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
                // #endregion
                console.error('Error refreshing modules:', refreshError);
            }
            
            // Disparar evento para otros listeners
            window.dispatchEvent(new CustomEvent('demo-data-loaded'));
            
        } catch (e) {
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/d085ffd8-d37f-46dc-af23-0f9fbbe46595',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'settings.js:2455',message:'Error in loadDemoData',data:{error:e.message,stack:e.stack},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
            // #endregion
            console.error('Error loading demo data:', e);
            Utils.showNotification('Error al cargar datos demo: ' + e.message, 'error');
        }
    }
};

window.Settings = Settings;

