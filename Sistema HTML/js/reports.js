// Reports Module - Gestión Avanzada de Reportes

const Reports = {
    initialized: false,
    currentTab: 'reports',
    
    async init() {
        if (this.initialized) {
            const activeTab = document.querySelector('#reports-tabs .tab-btn.active')?.dataset.tab || 'reports';
            await this.loadTab(activeTab);
            return;
        }
        this.setupUI();
        await this.loadTab('reports');
        this.initialized = true;
    },

    setupUI() {
        const content = document.getElementById('module-content');
        if (!content) return;

        // Crear estructura de tabs
        content.innerHTML = `
            <div id="reports-tabs" class="tabs-container" style="margin-bottom: var(--spacing-lg);">
                <button class="tab-btn active" data-tab="reports"><i class="fas fa-chart-bar"></i> Reportes</button>
                <button class="tab-btn" data-tab="overview"><i class="fas fa-chart-line"></i> Resumen</button>
                <button class="tab-btn" data-tab="analysis"><i class="fas fa-brain"></i> Análisis</button>
                <button class="tab-btn" data-tab="compare"><i class="fas fa-balance-scale"></i> Comparativas</button>
                <button class="tab-btn" data-tab="history"><i class="fas fa-history"></i> Historial</button>
            </div>
            <div id="reports-content"></div>
        `;

        // Event listeners para tabs
        document.querySelectorAll('#reports-tabs .tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const clickedBtn = e.target.closest('.tab-btn');
                if (!clickedBtn) return;
                
                document.querySelectorAll('#reports-tabs .tab-btn').forEach(b => b.classList.remove('active'));
                clickedBtn.classList.add('active');
                const tab = clickedBtn.dataset.tab;
                this.loadTab(tab);
            });
        });
    },

    async loadTab(tab) {
        const content = document.getElementById('reports-content');
        if (!content) return;

        this.currentTab = tab;

        try {
            content.innerHTML = '<div style="text-align: center; padding: 40px;"><i class="fas fa-spinner fa-spin"></i> Cargando...</div>';

            switch(tab) {
                case 'reports':
                    content.innerHTML = await this.getReportsTab();
                    this.setupPresetRanges();
                    await this.loadCatalogs();
                    break;
                case 'overview':
                    content.innerHTML = await this.getOverviewTab();
                    await this.loadOverview();
                    break;
                case 'analysis':
                    content.innerHTML = await this.getAnalysisTab();
                    await this.loadAnalysis();
                    break;
                case 'compare':
                    content.innerHTML = await this.getCompareTab();
                    break;
                case 'history':
                    content.innerHTML = await this.getHistoryTab();
                    await this.loadHistory();
                    break;
                default:
                    content.innerHTML = '<p>Pestaña no encontrada</p>';
            }
        } catch (e) {
            console.error(`Error loading tab ${tab}:`, e);
            content.innerHTML = `
                <div style="padding: var(--spacing-md); background: var(--color-danger); color: white; border-radius: var(--radius-md);">
                    <strong>Error al cargar:</strong> ${e.message}
                </div>
            `;
        }
    },

    async getReportsTab() {
        return `
            <div class="report-filters" style="background: var(--color-bg-secondary); padding: var(--spacing-md); border-radius: var(--radius-md); margin-bottom: var(--spacing-md); width: 100%; max-width: 100%; box-sizing: border-box;">
                <h3 style="margin-bottom: var(--spacing-md); font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Filtros Avanzados</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: var(--spacing-md); width: 100%; box-sizing: border-box;">
                    <div class="form-group" style="min-width: 0;">
                        <label>Fecha Desde</label>
                        <input type="date" id="report-date-from" class="form-input" value="${Utils.formatDate(new Date(Date.now() - 30*24*60*60*1000), 'YYYY-MM-DD')}" style="width: 100%;">
                    </div>
                    <div class="form-group" style="min-width: 0;">
                        <label>Fecha Hasta</label>
                        <input type="date" id="report-date-to" class="form-input" value="${Utils.formatDate(new Date(), 'YYYY-MM-DD')}" style="width: 100%;">
                    </div>
                    <div class="form-group" style="min-width: 0;">
                        <label>Rango Predefinido</label>
                        <select id="report-preset-range" class="form-select" style="width: 100%;">
                            <option value="">Personalizado</option>
                            <option value="today">Hoy</option>
                            <option value="yesterday">Ayer</option>
                            <option value="week">Esta Semana</option>
                            <option value="lastweek">Semana Pasada</option>
                            <option value="month">Este Mes</option>
                            <option value="lastmonth">Mes Pasado</option>
                            <option value="quarter">Este Trimestre</option>
                            <option value="year">Este Año</option>
                        </select>
                    </div>
                    <div class="form-group" style="min-width: 0;">
                        <label>Sucursal</label>
                        <select id="report-branch" class="form-select" style="width: 100%;">
                            <option value="">Todas</option>
                        </select>
                    </div>
                    <div class="form-group" style="min-width: 0;">
                        <label>Vendedor</label>
                        <select id="report-seller" class="form-select" style="width: 100%;">
                            <option value="">Todos</option>
                        </select>
                    </div>
                    <div class="form-group" style="min-width: 0;">
                        <label>Agencia</label>
                        <select id="report-agency" class="form-select" style="width: 100%;">
                            <option value="">Todas</option>
                        </select>
                    </div>
                    <div class="form-group" style="min-width: 0;">
                        <label>Guía</label>
                        <select id="report-guide" class="form-select" style="width: 100%;">
                            <option value="">Todos</option>
                        </select>
                    </div>
                    <div class="form-group" style="min-width: 0;">
                        <label>Estado</label>
                        <select id="report-status" class="form-select" style="width: 100%;">
                            <option value="">Todos</option>
                            <option value="completada">Completada</option>
                            <option value="apartada">Apartada</option>
                            <option value="cancelada">Cancelada</option>
                        </select>
                    </div>
                    <div class="form-group" style="min-width: 0;">
                        <label>Monto Mínimo</label>
                        <input type="number" id="report-min-amount" class="form-input" step="0.01" placeholder="0" style="width: 100%;">
                    </div>
                    <div class="form-group" style="min-width: 0;">
                        <label>Monto Máximo</label>
                        <input type="number" id="report-max-amount" class="form-input" step="0.01" placeholder="Sin límite" style="width: 100%;">
                    </div>
                    <div class="form-group" style="min-width: 0;">
                        <label>Tipo de Análisis</label>
                        <select id="report-analysis-type" class="form-select" style="width: 100%;">
                            <option value="summary">Resumen General</option>
                            <option value="daily">Por Día</option>
                            <option value="seller">Por Vendedor</option>
                            <option value="agency">Por Agencia</option>
                            <option value="product">Por Producto</option>
                        </select>
                    </div>
                </div>
                <div style="margin-top: var(--spacing-md); display: flex; gap: var(--spacing-sm); flex-wrap: wrap; width: 100%;">
                    <button class="btn-primary" onclick="window.Reports.generateReport()" style="white-space: nowrap;">
                        <i class="fas fa-chart-bar"></i> Generar Reporte
                    </button>
                    <button class="btn-secondary" onclick="window.Reports.generateAdvancedAnalytics()" style="white-space: nowrap;">
                        <i class="fas fa-brain"></i> Análisis Avanzado
                    </button>
                    <button class="btn-secondary" onclick="window.Reports.exportReport()" style="white-space: nowrap;">
                        <i class="fas fa-download"></i> Exportar
                    </button>
                </div>
            </div>
            <div id="report-results" style="width: 100%; max-width: 100%; box-sizing: border-box;"></div>
        `;
    },

    async getOverviewTab() {
        return `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: var(--spacing-md); margin-bottom: var(--spacing-lg); width: 100%; max-width: 100%; box-sizing: border-box;">
                <div class="kpi-card" style="min-width: 0; width: 100%; box-sizing: border-box;">
                    <div class="kpi-label">Ventas Totales</div>
                    <div class="kpi-value" id="overview-total-sales">$0.00</div>
                </div>
                <div class="kpi-card" style="min-width: 0; width: 100%; box-sizing: border-box;">
                    <div class="kpi-label">Número de Ventas</div>
                    <div class="kpi-value" id="overview-sales-count">0</div>
                </div>
                <div class="kpi-card" style="min-width: 0; width: 100%; box-sizing: border-box;">
                    <div class="kpi-label">Ticket Promedio</div>
                    <div class="kpi-value" id="overview-avg-ticket">$0.00</div>
                </div>
                <div class="kpi-card" style="min-width: 0; width: 100%; box-sizing: border-box;">
                    <div class="kpi-label">Total Pasajeros</div>
                    <div class="kpi-value" id="overview-passengers">0</div>
                </div>
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: var(--spacing-md); width: 100%; max-width: 100%; box-sizing: border-box;">
                <div class="module" style="padding: var(--spacing-md); background: var(--color-bg-card); border-radius: var(--radius-md); border: 1px solid var(--color-border-light); min-width: 0; width: 100%; box-sizing: border-box;">
                    <h3 style="font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: var(--spacing-sm);">
                        <i class="fas fa-chart-line"></i> Tendencia de Ventas
                    </h3>
                    <div id="sales-trend-chart" style="min-height: 300px; width: 100%; overflow: hidden;">
                        Cargando gráfico...
                    </div>
                </div>

                <div class="module" style="padding: var(--spacing-md); background: var(--color-bg-card); border-radius: var(--radius-md); border: 1px solid var(--color-border-light); min-width: 0; width: 100%; box-sizing: border-box;">
                    <h3 style="font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: var(--spacing-sm);">
                        <i class="fas fa-user-tag"></i> Top Vendedores
                    </h3>
                    <div id="top-sellers-chart" style="min-height: 300px; width: 100%; overflow: hidden;">
                        Cargando gráfico...
                    </div>
                </div>

                <div class="module" style="padding: var(--spacing-md); background: var(--color-bg-card); border-radius: var(--radius-md); border: 1px solid var(--color-border-light); min-width: 0; width: 100%; box-sizing: border-box;">
                    <h3 style="font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: var(--spacing-sm);">
                        <i class="fas fa-building"></i> Top Agencias
                    </h3>
                    <div id="top-agencies-chart" style="min-height: 200px; width: 100%; overflow: hidden;">
                        Cargando gráfico...
                    </div>
                </div>

                <div class="module" style="padding: var(--spacing-md); background: var(--color-bg-card); border-radius: var(--radius-md); border: 1px solid var(--color-border-light); min-width: 0; width: 100%; box-sizing: border-box;">
                    <h3 style="font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: var(--spacing-sm);">
                        <i class="fas fa-box"></i> Top Productos
                    </h3>
                    <div id="top-products-chart" style="min-height: 200px; width: 100%; overflow: hidden;">
                        Cargando gráfico...
                    </div>
                </div>
            </div>
        `;
    },

    async getAnalysisTab() {
        return `
            <div class="filters-bar-compact" style="margin-bottom: var(--spacing-md); width: 100%; max-width: 100%; box-sizing: border-box; flex-wrap: wrap;">
                <div class="form-group" style="flex: 1; min-width: 200px;">
                    <label>Período de Análisis</label>
                    <select id="analysis-period" class="form-select" style="width: 100%;">
                        <option value="last3months">Últimos 3 meses</option>
                        <option value="last6months" selected>Últimos 6 meses</option>
                        <option value="last12months">Últimos 12 meses</option>
                        <option value="thisyear">Este año</option>
                    </select>
                </div>
                <div class="form-group" style="flex-shrink: 0;">
                    <label>&nbsp;</label>
                    <button class="btn-primary" onclick="window.Reports.runAdvancedAnalysis()" style="white-space: nowrap;">
                        <i class="fas fa-brain"></i> Ejecutar Análisis
                    </button>
                </div>
            </div>
            <div id="analysis-results" style="min-height: 400px; width: 100%; max-width: 100%; box-sizing: border-box; overflow-x: auto;">
                <div class="empty-state">Selecciona un período y ejecuta el análisis</div>
            </div>
        `;
    },

    async getCompareTab() {
        return `
            <div class="filters-bar-compact" style="margin-bottom: var(--spacing-md); width: 100%; max-width: 100%; box-sizing: border-box; flex-wrap: wrap;">
                <div class="form-group" style="flex: 1; min-width: 200px;">
                    <label>Período 1 - Desde</label>
                    <input type="date" id="compare-period1-from" class="form-input" style="width: 100%;">
                </div>
                <div class="form-group" style="flex: 1; min-width: 200px;">
                    <label>Período 1 - Hasta</label>
                    <input type="date" id="compare-period1-to" class="form-input" style="width: 100%;">
                </div>
                <div class="form-group" style="flex: 1; min-width: 200px;">
                    <label>Período 2 - Desde</label>
                    <input type="date" id="compare-period2-from" class="form-input" style="width: 100%;">
                </div>
                <div class="form-group" style="flex: 1; min-width: 200px;">
                    <label>Período 2 - Hasta</label>
                    <input type="date" id="compare-period2-to" class="form-input" style="width: 100%;">
                </div>
                <div class="form-group" style="flex-shrink: 0;">
                    <label>&nbsp;</label>
                    <button class="btn-primary" onclick="window.Reports.comparePeriods()" style="white-space: nowrap;">
                        <i class="fas fa-balance-scale"></i> Comparar
                    </button>
                </div>
            </div>
            <div id="compare-results" style="min-height: 400px; width: 100%; max-width: 100%; box-sizing: border-box;">
                <div class="empty-state">Selecciona los períodos y ejecuta la comparación</div>
            </div>
        `;
    },

    async getHistoryTab() {
        return `
            <div class="filters-bar-compact" style="margin-bottom: var(--spacing-md); width: 100%; max-width: 100%; box-sizing: border-box; flex-wrap: wrap;">
                <div class="form-group" style="flex: 1; min-width: 200px;">
                    <input type="text" id="history-search" class="form-input" placeholder="Buscar por folio, vendedor..." style="width: 100%;">
                </div>
                <div class="form-group" style="width: 150px; min-width: 120px;">
                    <select id="history-status-filter" class="form-select" style="width: 100%;">
                        <option value="">Todos</option>
                        <option value="completada">Completada</option>
                        <option value="apartada">Apartada</option>
                        <option value="cancelada">Cancelada</option>
                    </select>
                </div>
                <div class="form-group" style="width: 150px; min-width: 120px;">
                    <input type="date" id="history-date-from" class="form-input" placeholder="Desde" style="width: 100%;">
                </div>
                <div class="form-group" style="width: 150px; min-width: 120px;">
                    <input type="date" id="history-date-to" class="form-input" placeholder="Hasta" style="width: 100%;">
                </div>
                <button class="btn-secondary btn-sm" id="history-export" style="white-space: nowrap; flex-shrink: 0;"><i class="fas fa-download"></i> Exportar</button>
            </div>
            <div id="history-list" style="max-height: 600px; overflow-y: auto; width: 100%; overflow-x: auto;">
                <div class="empty-state">Cargando historial...</div>
            </div>
        `;
    },

    async loadOverview() {
        await this.renderOverviewStats();
        await this.renderSalesTrend();
        await this.renderTopSellers();
        await this.renderTopAgencies();
        await this.renderTopProducts();
    },

    async renderOverviewStats() {
        const sales = await DB.getAll('sales') || [];
        const completedSales = sales.filter(s => s.status === 'completada');
        
        const totalSales = completedSales.reduce((sum, s) => sum + (s.total || 0), 0);
        const totalPassengers = completedSales.reduce((sum, s) => sum + (s.passengers || 1), 0);
        const avgTicket = totalPassengers > 0 ? totalSales / totalPassengers : 0;

        document.getElementById('overview-total-sales').textContent = Utils.formatCurrency(totalSales);
        document.getElementById('overview-sales-count').textContent = completedSales.length;
        document.getElementById('overview-avg-ticket').textContent = Utils.formatCurrency(avgTicket);
        document.getElementById('overview-passengers').textContent = totalPassengers;
    },

    async renderSalesTrend() {
        const container = document.getElementById('sales-trend-chart');
        if (!container) return;

        const sales = await DB.getAll('sales') || [];
        const completedSales = sales.filter(s => s.status === 'completada');
        
        const last30Days = completedSales
            .filter(s => {
                const saleDate = new Date(s.created_at);
                const daysAgo = (Date.now() - saleDate.getTime()) / (1000 * 60 * 60 * 24);
                return daysAgo <= 30;
            })
            .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

        const dailyTotals = {};
        last30Days.forEach(sale => {
            const date = sale.created_at.split('T')[0];
            if (!dailyTotals[date]) {
                dailyTotals[date] = 0;
            }
            dailyTotals[date] += sale.total || 0;
        });

        const dates = Object.keys(dailyTotals).sort();
        const maxValue = Math.max(...Object.values(dailyTotals), 1);

        if (dates.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--color-text-secondary);">No hay datos</p>';
            return;
        }

        container.innerHTML = `
            <div style="display: flex; align-items: flex-end; gap: 4px; height: 250px; width: 100%; min-width: 0; overflow-x: auto;">
                ${dates.map(date => {
                    const value = dailyTotals[date];
                    const height = (value / maxValue) * 100;
                    return `
                        <div style="flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px; min-width: 0; flex-shrink: 0;">
                            <div style="flex: 1; display: flex; align-items: flex-end; width: 100%; min-width: 0;">
                                <div style="width: 100%; background: var(--gradient-accent); 
                                    border-radius: var(--radius-xs) var(--radius-xs) 0 0; 
                                    height: ${height}%; 
                                    min-height: ${value > 0 ? '3px' : '0'};"></div>
                            </div>
                            <div style="font-size: 9px; color: var(--color-text-secondary); text-align: center; white-space: nowrap;">
                                <div>${Utils.formatDate(date, 'DD/MM')}</div>
                                <div style="font-weight: 600; color: var(--color-text); margin-top: 2px; font-size: 10px;">${Utils.formatCurrency(value)}</div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    },

    async renderTopSellers() {
        const container = document.getElementById('top-sellers-chart');
        if (!container) return;

        const sales = await DB.getAll('sales') || [];
        const completedSales = sales.filter(s => s.status === 'completada');
        const sellers = await DB.getAll('catalog_sellers') || [];
        
        const sellerStats = {};
        completedSales.forEach(sale => {
            if (sale.seller_id) {
                if (!sellerStats[sale.seller_id]) {
                    sellerStats[sale.seller_id] = { total: 0, count: 0 };
                }
                sellerStats[sale.seller_id].total += sale.total || 0;
                sellerStats[sale.seller_id].count += 1;
            }
        });

        const sellerData = Object.entries(sellerStats)
            .map(([id, stats]) => ({
                name: sellers.find(s => s.id === id)?.name || 'N/A',
                ...stats
            }))
            .sort((a, b) => b.total - a.total)
            .slice(0, 5);

        const maxTotal = Math.max(...sellerData.map(s => s.total), 1);

        if (sellerData.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--color-text-secondary);">No hay datos</p>';
            return;
        }

        container.innerHTML = `
            <div style="display: flex; flex-direction: column; gap: var(--spacing-sm); width: 100%; min-width: 0;">
                ${sellerData.map(seller => {
                    const percentage = (seller.total / maxTotal) * 100;
                    return `
                        <div style="min-width: 0; width: 100%;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: var(--spacing-xs); font-size: 11px; min-width: 0;">
                                <span style="min-width: 0; overflow: hidden; text-overflow: ellipsis;"><strong>${seller.name}</strong></span>
                                <span style="font-weight: 600; white-space: nowrap; margin-left: var(--spacing-xs);">${Utils.formatCurrency(seller.total)}</span>
                            </div>
                            <div style="height: 8px; background: var(--color-bg-secondary); border-radius: 4px; overflow: hidden; width: 100%;">
                                <div style="height: 100%; width: ${percentage}%; background: var(--gradient-accent); transition: width 0.3s;"></div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    },

    async renderTopAgencies() {
        const container = document.getElementById('top-agencies-chart');
        if (!container) return;

        const sales = await DB.getAll('sales') || [];
        const completedSales = sales.filter(s => s.status === 'completada');
        const agencies = await DB.getAll('catalog_agencies') || [];
        
        const agencyStats = {};
        completedSales.forEach(sale => {
            if (sale.agency_id) {
                if (!agencyStats[sale.agency_id]) {
                    agencyStats[sale.agency_id] = { total: 0, count: 0 };
                }
                agencyStats[sale.agency_id].total += sale.total || 0;
                agencyStats[sale.agency_id].count += 1;
            }
        });

        const agencyData = Object.entries(agencyStats)
            .map(([id, stats]) => ({
                name: agencies.find(a => a.id === id)?.name || 'N/A',
                ...stats
            }))
            .sort((a, b) => b.total - a.total)
            .slice(0, 5);

        const maxTotal = Math.max(...agencyData.map(a => a.total), 1);

        if (agencyData.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--color-text-secondary);">No hay datos</p>';
            return;
        }

        container.innerHTML = `
            <div style="display: flex; flex-direction: column; gap: var(--spacing-xs); width: 100%; min-width: 0;">
                ${agencyData.map(agency => {
                    const percentage = (agency.total / maxTotal) * 100;
                    return `
                        <div style="min-width: 0; width: 100%;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 2px; font-size: 11px; min-width: 0;">
                                <span style="min-width: 0; overflow: hidden; text-overflow: ellipsis;">${agency.name}</span>
                                <span style="font-weight: 600; white-space: nowrap; margin-left: var(--spacing-xs);">${Utils.formatCurrency(agency.total)}</span>
                            </div>
                            <div style="height: 6px; background: var(--color-bg-secondary); border-radius: 3px; overflow: hidden; width: 100%;">
                                <div style="height: 100%; width: ${percentage}%; background: var(--gradient-accent); transition: width 0.3s;"></div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    },

    async renderTopProducts() {
        const container = document.getElementById('top-products-chart');
        if (!container) return;

        const sales = await DB.getAll('sales') || [];
        const completedSales = sales.filter(s => s.status === 'completada');
        const saleItems = await DB.getAll('sale_items') || [];
        const items = await DB.getAll('inventory_items') || [];
        
        const productStats = {};
        completedSales.forEach(sale => {
            const itemsForSale = saleItems.filter(si => si.sale_id === sale.id);
            itemsForSale.forEach(si => {
                const item = items.find(i => i.id === si.item_id);
                if (item) {
                    if (!productStats[item.id]) {
                        productStats[item.id] = { name: item.name || item.sku, revenue: 0, count: 0 };
                    }
                    productStats[item.id].revenue += (si.price || 0) * (si.quantity || 1);
                    productStats[item.id].count += si.quantity || 1;
                }
            });
        });

        const productData = Object.values(productStats)
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5);

        const maxRevenue = Math.max(...productData.map(p => p.revenue), 1);

        if (productData.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--color-text-secondary);">No hay datos</p>';
            return;
        }

        container.innerHTML = `
            <div style="display: flex; flex-direction: column; gap: var(--spacing-xs); width: 100%; min-width: 0;">
                ${productData.map(product => {
                    const percentage = (product.revenue / maxRevenue) * 100;
                    return `
                        <div style="min-width: 0; width: 100%;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 2px; font-size: 11px; min-width: 0;">
                                <span style="min-width: 0; overflow: hidden; text-overflow: ellipsis;">${product.name}</span>
                                <span style="font-weight: 600; white-space: nowrap; margin-left: var(--spacing-xs);">${Utils.formatCurrency(product.revenue)}</span>
                            </div>
                            <div style="height: 6px; background: var(--color-bg-secondary); border-radius: 3px; overflow: hidden; width: 100%;">
                                <div style="height: 100%; width: ${percentage}%; background: var(--gradient-accent); transition: width 0.3s;"></div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    },

    async loadAnalysis() {
        // Esta función se ejecuta cuando el usuario hace clic en "Ejecutar Análisis"
    },

    async runAdvancedAnalysis() {
        await this.generateAdvancedAnalytics();
    },

    async loadHistory() {
        const container = document.getElementById('history-list');
        if (!container) return;

        const search = document.getElementById('history-search')?.value.toLowerCase() || '';
        const statusFilter = document.getElementById('history-status-filter')?.value || '';
        const dateFrom = document.getElementById('history-date-from')?.value || '';
        const dateTo = document.getElementById('history-date-to')?.value || '';

        let sales = await DB.getAll('sales') || [];
        const branches = await DB.getAll('catalog_branches') || [];
        const sellers = await DB.getAll('catalog_sellers') || [];
        const agencies = await DB.getAll('catalog_agencies') || [];
        const guides = await DB.getAll('catalog_guides') || [];

        // Aplicar filtros
        if (statusFilter) {
            sales = sales.filter(s => s.status === statusFilter);
        }
        if (search) {
            sales = sales.filter(s => 
                (s.folio || '').toLowerCase().includes(search) ||
                sellers.find(sel => sel.id === s.seller_id)?.name?.toLowerCase().includes(search)
            );
        }
        if (dateFrom) {
            sales = sales.filter(s => s.created_at >= dateFrom);
        }
        if (dateTo) {
            sales = sales.filter(s => s.created_at <= dateTo + 'T23:59:59');
        }

        sales.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        if (sales.length === 0) {
            container.innerHTML = '<div class="empty-state">No se encontraron ventas</div>';
            return;
        }

        container.innerHTML = `
            <table class="cart-table" style="width: 100%; max-width: 100%; table-layout: auto; min-width: 800px;">
                <thead>
                    <tr>
                        <th>Folio</th>
                        <th>Fecha</th>
                        <th>Sucursal</th>
                        <th>Vendedor</th>
                        <th>Agencia</th>
                        <th>Guía</th>
                        <th>Total</th>
                        <th>Estado</th>
                    </tr>
                </thead>
                <tbody>
                    ${sales.map(sale => {
                        const branch = branches.find(b => b.id === sale.branch_id);
                        const seller = sellers.find(s => s.id === sale.seller_id);
                        const agency = agencies.find(a => a.id === sale.agency_id);
                        const guide = guides.find(g => g.id === sale.guide_id);
                        return `
                            <tr>
                                <td>${sale.folio || 'N/A'}</td>
                                <td>${Utils.formatDate(sale.created_at, 'DD/MM/YYYY')}</td>
                                <td>${branch?.name || 'N/A'}</td>
                                <td>${seller?.name || 'N/A'}</td>
                                <td>${agency?.name || 'N/A'}</td>
                                <td>${guide?.name || 'N/A'}</td>
                                <td style="font-weight: 600;">${Utils.formatCurrency(sale.total)}</td>
                                <td><span class="status-badge status-${sale.status === 'completada' ? 'disponible' : sale.status === 'apartada' ? 'reservado' : 'cancelado'}">${sale.status}</span></td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        `;

        // Event listeners
        document.getElementById('history-search')?.addEventListener('input', Utils.debounce(() => this.loadHistory(), 300));
        document.getElementById('history-status-filter')?.addEventListener('change', () => this.loadHistory());
        document.getElementById('history-date-from')?.addEventListener('change', () => this.loadHistory());
        document.getElementById('history-date-to')?.addEventListener('change', () => this.loadHistory());
        document.getElementById('history-export')?.addEventListener('click', () => this.exportHistory());
    },

    async exportHistory() {
        const search = document.getElementById('history-search')?.value.toLowerCase() || '';
        const statusFilter = document.getElementById('history-status-filter')?.value || '';
        const dateFrom = document.getElementById('history-date-from')?.value || '';
        const dateTo = document.getElementById('history-date-to')?.value || '';

        let sales = await DB.getAll('sales') || [];
        const branches = await DB.getAll('catalog_branches') || [];
        const sellers = await DB.getAll('catalog_sellers') || [];
        const agencies = await DB.getAll('catalog_agencies') || [];
        const guides = await DB.getAll('catalog_guides') || [];

        // Aplicar mismos filtros que en loadHistory
        if (statusFilter) {
            sales = sales.filter(s => s.status === statusFilter);
        }
        if (search) {
            sales = sales.filter(s => 
                (s.folio || '').toLowerCase().includes(search) ||
                sellers.find(sel => sel.id === s.seller_id)?.name?.toLowerCase().includes(search)
            );
        }
        if (dateFrom) {
            sales = sales.filter(s => s.created_at >= dateFrom);
        }
        if (dateTo) {
            sales = sales.filter(s => s.created_at <= dateTo + 'T23:59:59');
        }

        const exportData = sales.map(sale => {
            const branch = branches.find(b => b.id === sale.branch_id);
            const seller = sellers.find(s => s.id === sale.seller_id);
            const agency = agencies.find(a => a.id === sale.agency_id);
            const guide = guides.find(g => g.id === sale.guide_id);
            return {
                'Folio': sale.folio || '',
                'Fecha': Utils.formatDate(sale.created_at, 'DD/MM/YYYY'),
                'Sucursal': branch?.name || '',
                'Vendedor': seller?.name || '',
                'Agencia': agency?.name || '',
                'Guía': guide?.name || '',
                'Total': sale.total || 0,
                'Estado': sale.status || ''
            };
        });

        const date = Utils.formatDate(new Date(), 'YYYYMMDD');
        Utils.exportToExcel(exportData, `historial_ventas_${date}.xlsx`, 'Historial Ventas');
        Utils.showNotification(`Exportadas ${exportData.length} ventas`, 'success');
    },

    async loadCatalogs() {
        const branches = await DB.getAll('catalog_branches');
        const sellers = await DB.getAll('catalog_sellers');
        const agencies = await DB.getAll('catalog_agencies');
        const guides = await DB.getAll('catalog_guides');

        const branchSelect = document.getElementById('report-branch');
        const sellerSelect = document.getElementById('report-seller');
        const agencySelect = document.getElementById('report-agency');
        const guideSelect = document.getElementById('report-guide');

        if (branchSelect) {
            branchSelect.innerHTML = '<option value="">Todas</option>' + branches.map(b => `<option value="${b.id}">${b.name}</option>`).join('');
        }
        if (sellerSelect) {
            sellerSelect.innerHTML = '<option value="">Todos</option>' + sellers.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
        }
        if (agencySelect) {
            agencySelect.innerHTML = '<option value="">Todas</option>' + agencies.map(a => `<option value="${a.id}">${a.name}</option>`).join('');
        }
        if (guideSelect) {
            guideSelect.innerHTML = '<option value="">Todos</option>' + guides.map(g => `<option value="${g.id}">${g.name}</option>`).join('');
        }
    },

    setupPresetRanges() {
        const presetSelect = document.getElementById('report-preset-range');
        const dateFrom = document.getElementById('report-date-from');
        const dateTo = document.getElementById('report-date-to');
        
        presetSelect?.addEventListener('change', () => {
            const today = new Date();
            const preset = presetSelect.value;
            
            let fromDate = new Date();
            let toDate = new Date();
            
            switch(preset) {
                case 'today':
                    fromDate = new Date(today);
                    toDate = new Date(today);
                    break;
                case 'yesterday':
                    fromDate = new Date(today);
                    fromDate.setDate(fromDate.getDate() - 1);
                    toDate = new Date(fromDate);
                    break;
                case 'week':
                    fromDate = new Date(today);
                    fromDate.setDate(fromDate.getDate() - today.getDay());
                    break;
                case 'lastweek':
                    fromDate = new Date(today);
                    fromDate.setDate(fromDate.getDate() - today.getDay() - 7);
                    toDate = new Date(fromDate);
                    toDate.setDate(toDate.getDate() + 6);
                    break;
                case 'month':
                    fromDate = new Date(today.getFullYear(), today.getMonth(), 1);
                    break;
                case 'lastmonth':
                    fromDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                    toDate = new Date(today.getFullYear(), today.getMonth(), 0);
                    break;
                case 'quarter':
                    const quarter = Math.floor(today.getMonth() / 3);
                    fromDate = new Date(today.getFullYear(), quarter * 3, 1);
                    break;
                case 'year':
                    fromDate = new Date(today.getFullYear(), 0, 1);
                    break;
            }
            
            if (dateFrom) dateFrom.value = Utils.formatDate(fromDate, 'YYYY-MM-DD');
            if (dateTo) dateTo.value = Utils.formatDate(toDate, 'YYYY-MM-DD');
        });
    },

    async generateReport() {
        const dateFrom = document.getElementById('report-date-from')?.value;
        const dateTo = document.getElementById('report-date-to')?.value;
        const branchId = document.getElementById('report-branch')?.value;
        const sellerId = document.getElementById('report-seller')?.value;
        const agencyId = document.getElementById('report-agency')?.value;
        const guideId = document.getElementById('report-guide')?.value;
        const status = document.getElementById('report-status')?.value;
        const minAmount = parseFloat(document.getElementById('report-min-amount')?.value || '0');
        const maxAmount = parseFloat(document.getElementById('report-max-amount')?.value || '999999999');
        const analysisType = document.getElementById('report-analysis-type')?.value || 'summary';

        try {
            let sales = await DB.getAll('sales');
            const saleItems = await DB.getAll('sale_items') || [];
            const items = await DB.getAll('inventory_items') || [];

            // Apply filters
            if (dateFrom) {
                sales = sales.filter(s => s.created_at >= dateFrom);
            }
            if (dateTo) {
                sales = sales.filter(s => s.created_at <= dateTo + 'T23:59:59');
            }
            if (branchId) {
                sales = sales.filter(s => s.branch_id === branchId);
            }
            if (sellerId) {
                sales = sales.filter(s => s.seller_id === sellerId);
            }
            if (agencyId) {
                sales = sales.filter(s => s.agency_id === agencyId);
            }
            if (guideId) {
                sales = sales.filter(s => s.guide_id === guideId);
            }
            if (status) {
                sales = sales.filter(s => s.status === status);
            }
            sales = sales.filter(s => (s.total || 0) >= minAmount && (s.total || 0) <= maxAmount);

            // Generate report based on analysis type
            switch(analysisType) {
                case 'daily':
                    await this.displayDailyReport(sales);
                    break;
                case 'seller':
                    await this.displaySellerReport(sales);
                    break;
                case 'agency':
                    await this.displayAgencyReport(sales);
                    break;
                case 'product':
                    await this.displayProductReport(sales, saleItems, items);
                    break;
                default:
                    await this.displayReport(sales, saleItems, items);
            }
            
            window.currentReportData = sales;
        } catch (e) {
            console.error('Error generating report:', e);
            Utils.showNotification('Error al generar reporte', 'error');
        }
    },

    async displayReport(sales, saleItems = [], items = []) {
        const container = document.getElementById('report-results');
        if (!container) return;

        const branches = await DB.getAll('catalog_branches');
        const sellers = await DB.getAll('catalog_sellers');
        const agencies = await DB.getAll('catalog_agencies');
        const guides = await DB.getAll('catalog_guides');

        const totalSales = sales.reduce((sum, s) => sum + (s.total || 0), 0);
        const totalPassengers = sales.reduce((sum, s) => sum + (s.passengers || 1), 0);
        const avgTicket = totalPassengers > 0 ? totalSales / totalPassengers : 0;
        const closeRate = totalPassengers > 0 ? (sales.length / totalPassengers) * 100 : 0;
        
        // Ventas por día
        const dailyStats = {};
        sales.forEach(sale => {
            const date = sale.created_at.split('T')[0];
            if (!dailyStats[date]) {
                dailyStats[date] = { total: 0, count: 0 };
            }
            dailyStats[date].total += sale.total || 0;
            dailyStats[date].count += 1;
        });
        
        const dailyData = Object.entries(dailyStats)
            .map(([date, stats]) => ({ date, ...stats }))
            .sort((a, b) => a.date.localeCompare(b.date));
        
        const maxDaily = Math.max(...dailyData.map(d => d.total), 1);

        container.innerHTML = `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: var(--spacing-md); margin-bottom: var(--spacing-lg); width: 100%; max-width: 100%; box-sizing: border-box;">
                <div class="kpi-card" style="min-width: 0; width: 100%; box-sizing: border-box;">
                    <div class="kpi-label">Total Ventas</div>
                    <div class="kpi-value">${Utils.formatCurrency(totalSales)}</div>
                </div>
                <div class="kpi-card" style="min-width: 0; width: 100%; box-sizing: border-box;">
                    <div class="kpi-label">Número de Ventas</div>
                    <div class="kpi-value">${sales.length}</div>
                </div>
                <div class="kpi-card" style="min-width: 0; width: 100%; box-sizing: border-box;">
                    <div class="kpi-label">Ticket Promedio</div>
                    <div class="kpi-value">${Utils.formatCurrency(avgTicket)}</div>
                </div>
                <div class="kpi-card" style="min-width: 0; width: 100%; box-sizing: border-box;">
                    <div class="kpi-label">% Cierre</div>
                    <div class="kpi-value">${closeRate.toFixed(1)}%</div>
                </div>
                <div class="kpi-card" style="min-width: 0; width: 100%; box-sizing: border-box;">
                    <div class="kpi-label">Total Pasajeros</div>
                    <div class="kpi-value">${totalPassengers}</div>
                </div>
                <div class="kpi-card" style="min-width: 0; width: 100%; box-sizing: border-box;">
                    <div class="kpi-label">Promedio por Venta</div>
                    <div class="kpi-value">${sales.length > 0 ? Utils.formatCurrency(totalSales / sales.length) : '$0'}</div>
                </div>
            </div>
            
            ${dailyData.length > 0 ? `
                <div class="dashboard-section" style="margin-bottom: var(--spacing-lg); width: 100%; max-width: 100%; box-sizing: border-box;">
                    <h3 style="font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: var(--spacing-sm);">Ventas por Día</h3>
                    <div style="background: var(--color-bg-secondary); padding: var(--spacing-md); border-radius: var(--radius-md); margin-top: var(--spacing-sm); width: 100%; overflow-x: auto;">
                        <div style="display: flex; align-items: flex-end; gap: 4px; height: 200px; min-width: 0; width: 100%;">
                            ${dailyData.map(day => {
                                const height = maxDaily > 0 ? (day.total / maxDaily * 100) : 0;
                                return `
                                    <div style="flex: 1; display: flex; flex-direction: column; align-items: center; gap: 6px; min-width: 0; flex-shrink: 0;">
                                        <div style="flex: 1; display: flex; align-items: flex-end; width: 100%; min-width: 0;">
                                            <div style="width: 100%; background: var(--gradient-accent); 
                                                border-radius: var(--radius-xs) var(--radius-xs) 0 0; 
                                                height: ${height}%; 
                                                min-height: ${day.total > 0 ? '4px' : '0'};"></div>
                                        </div>
                                        <div style="font-size: 9px; color: var(--color-text-secondary); text-align: center; white-space: nowrap;">
                                            <div>${Utils.formatDate(day.date, 'DD/MM')}</div>
                                            <div style="font-weight: 600; color: var(--color-text); margin-top: 2px; font-size: 10px;">${Utils.formatCurrency(day.total)}</div>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                </div>
            ` : ''}
            
            <div class="dashboard-section" style="width: 100%; max-width: 100%; box-sizing: border-box;">
                <h3 style="font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: var(--spacing-sm);">Detalle de Ventas</h3>
                <div style="overflow-x: auto; width: 100%;">
                    <table class="cart-table" style="width: 100%; max-width: 100%; table-layout: auto; min-width: 1000px;">
                        <thead>
                            <tr>
                                <th>Folio</th>
                                <th>Fecha</th>
                                <th>Sucursal</th>
                                <th>Vendedor</th>
                                <th>Agencia</th>
                                <th>Guía</th>
                                <th>Pasajeros</th>
                                <th>Total</th>
                                <th>Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${sales.map(sale => {
                                const branch = branches.find(b => b.id === sale.branch_id);
                                const seller = sellers.find(s => s.id === sale.seller_id);
                                const agency = agencies.find(a => a.id === sale.agency_id);
                                const guide = guides.find(g => g.id === sale.guide_id);
                                return `
                                    <tr>
                                        <td>${sale.folio || 'N/A'}</td>
                                        <td>${Utils.formatDate(sale.created_at, 'DD/MM/YYYY')}</td>
                                        <td>${branch?.name || 'N/A'}</td>
                                        <td>${seller?.name || 'N/A'}</td>
                                        <td>${agency?.name || 'N/A'}</td>
                                        <td>${guide?.name || 'N/A'}</td>
                                        <td>${sale.passengers || 1}</td>
                                        <td style="font-weight: 600;">${Utils.formatCurrency(sale.total)}</td>
                                        <td><span class="status-badge status-${sale.status === 'completada' ? 'disponible' : sale.status === 'apartada' ? 'reservado' : 'cancelado'}">${sale.status}</span></td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    },
    
    async displayDailyReport(sales) {
        const container = document.getElementById('report-results');
        if (!container) return;
        
        const dailyStats = {};
        sales.forEach(sale => {
            const date = sale.created_at.split('T')[0];
            if (!dailyStats[date]) {
                dailyStats[date] = { total: 0, count: 0, passengers: 0 };
            }
            dailyStats[date].total += sale.total || 0;
            dailyStats[date].count += 1;
            dailyStats[date].passengers += sale.passengers || 1;
        });
        
        const dailyData = Object.entries(dailyStats)
            .map(([date, stats]) => ({ date, ...stats, avg: stats.passengers > 0 ? stats.total / stats.passengers : 0 }))
            .sort((a, b) => a.date.localeCompare(b.date));
        
        container.innerHTML = `
            <div class="dashboard-section" style="width: 100%; max-width: 100%; box-sizing: border-box;">
                <h3 style="font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: var(--spacing-sm);">Análisis por Día</h3>
                <div style="overflow-x: auto; width: 100%;">
                    <table class="cart-table" style="width: 100%; max-width: 100%; table-layout: auto; min-width: 800px;">
                        <thead>
                            <tr>
                                <th>Fecha</th>
                                <th>Ventas</th>
                                <th>Total</th>
                                <th>Pasajeros</th>
                                <th>Ticket Promedio</th>
                                <th>% Cierre</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${dailyData.map(day => `
                                <tr>
                                    <td>${Utils.formatDate(day.date, 'DD/MM/YYYY')}</td>
                                    <td>${day.count}</td>
                                    <td style="font-weight: 600;">${Utils.formatCurrency(day.total)}</td>
                                    <td>${day.passengers}</td>
                                    <td>${Utils.formatCurrency(day.avg)}</td>
                                    <td>${day.passengers > 0 ? ((day.count / day.passengers) * 100).toFixed(1) : 0}%</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    },
    
    async displaySellerReport(sales) {
        const container = document.getElementById('report-results');
        if (!container) return;
        
        const sellers = await DB.getAll('catalog_sellers') || [];
        const sellerStats = {};
        
        sales.forEach(sale => {
            if (sale.seller_id) {
                if (!sellerStats[sale.seller_id]) {
                    sellerStats[sale.seller_id] = { total: 0, count: 0, passengers: 0 };
                }
                sellerStats[sale.seller_id].total += sale.total || 0;
                sellerStats[sale.seller_id].count += 1;
                sellerStats[sale.seller_id].passengers += sale.passengers || 1;
            }
        });
        
        const sellerData = Object.entries(sellerStats)
            .map(([id, stats]) => {
                const seller = sellers.find(s => s.id === id);
                return {
                    id,
                    name: seller?.name || 'N/A',
                    ...stats,
                    avg: stats.passengers > 0 ? stats.total / stats.passengers : 0
                };
            })
            .sort((a, b) => b.total - a.total);
        
        const maxTotal = Math.max(...sellerData.map(s => s.total), 1);
        
        container.innerHTML = `
            <div class="dashboard-section" style="width: 100%; max-width: 100%; box-sizing: border-box;">
                <h3 style="font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: var(--spacing-sm);">Análisis por Vendedor</h3>
                <div style="background: var(--color-bg-secondary); padding: var(--spacing-md); border-radius: var(--radius-md); margin-top: var(--spacing-sm); width: 100%; box-sizing: border-box;">
                    ${sellerData.map(seller => {
                        const width = maxTotal > 0 ? (seller.total / maxTotal * 100) : 0;
                        return `
                            <div style="margin-bottom: var(--spacing-sm); min-width: 0; width: 100%; box-sizing: border-box;">
                                <div style="display: flex; justify-content: space-between; margin-bottom: 4px; min-width: 0;">
                                    <div style="min-width: 0; overflow: hidden; text-overflow: ellipsis;">
                                        <strong style="font-size: 11px;">${seller.name}</strong>
                                        <div style="font-size: 9px; color: var(--color-text-secondary);">
                                            ${seller.count} ventas • ${seller.passengers} pasajeros
                                        </div>
                                    </div>
                                    <div style="text-align: right; white-space: nowrap; margin-left: var(--spacing-xs);">
                                        <div style="font-size: 14px; font-weight: 600;">${Utils.formatCurrency(seller.total)}</div>
                                        <div style="font-size: 9px; color: var(--color-text-secondary);">
                                            ${Utils.formatCurrency(seller.avg)} prom
                                        </div>
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
        `;
    },
    
    async displayAgencyReport(sales) {
        const container = document.getElementById('report-results');
        if (!container) return;
        
        const agencies = await DB.getAll('catalog_agencies') || [];
        const agencyStats = {};
        
        sales.forEach(sale => {
            if (sale.agency_id) {
                if (!agencyStats[sale.agency_id]) {
                    agencyStats[sale.agency_id] = { total: 0, count: 0, passengers: 0 };
                }
                agencyStats[sale.agency_id].total += sale.total || 0;
                agencyStats[sale.agency_id].count += 1;
                agencyStats[sale.agency_id].passengers += sale.passengers || 1;
            }
        });
        
        const agencyData = Object.entries(agencyStats)
            .map(([id, stats]) => {
                const agency = agencies.find(a => a.id === id);
                return {
                    id,
                    name: agency?.name || 'N/A',
                    ...stats,
                    avg: stats.passengers > 0 ? stats.total / stats.passengers : 0
                };
            })
            .sort((a, b) => b.total - a.total);
        
        container.innerHTML = `
            <div class="dashboard-section" style="width: 100%; max-width: 100%; box-sizing: border-box;">
                <h3 style="font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: var(--spacing-sm);">Análisis por Agencia</h3>
                <div style="overflow-x: auto; width: 100%;">
                    <table class="cart-table" style="width: 100%; max-width: 100%; table-layout: auto; min-width: 700px;">
                        <thead>
                            <tr>
                                <th>Agencia</th>
                                <th>Ventas</th>
                                <th>Total</th>
                                <th>Pasajeros</th>
                                <th>Ticket Promedio</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${agencyData.map(agency => `
                                <tr>
                                    <td><strong>${agency.name}</strong></td>
                                    <td>${agency.count}</td>
                                    <td style="font-weight: 600;">${Utils.formatCurrency(agency.total)}</td>
                                    <td>${agency.passengers}</td>
                                    <td>${Utils.formatCurrency(agency.avg)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    },
    
    async displayProductReport(sales, saleItems, items) {
        const container = document.getElementById('report-results');
        if (!container) return;
        
        const productStats = {};
        const saleIds = sales.map(s => s.id);
        
        saleItems
            .filter(si => saleIds.includes(si.sale_id))
            .forEach(si => {
                const item = items.find(i => i.id === si.item_id);
                if (item) {
                    if (!productStats[item.id]) {
                        productStats[item.id] = {
                            name: item.name || item.sku,
                            qty: 0,
                            revenue: 0,
                            cost: 0
                        };
                    }
                    productStats[item.id].qty += si.quantity || 1;
                    productStats[item.id].revenue += (si.price || 0) * (si.quantity || 1);
                    productStats[item.id].cost += (item.cost || 0) * (si.quantity || 1);
                }
            });
        
        const productData = Object.values(productStats)
            .map(p => ({ ...p, profit: p.revenue - p.cost, margin: p.revenue > 0 ? (p.profit / p.revenue * 100) : 0 }))
            .sort((a, b) => b.revenue - a.revenue);
        
        container.innerHTML = `
            <div class="dashboard-section" style="width: 100%; max-width: 100%; box-sizing: border-box;">
                <h3 style="font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: var(--spacing-sm);">Análisis por Producto</h3>
                <div style="overflow-x: auto; width: 100%;">
                    <table class="cart-table" style="width: 100%; max-width: 100%; table-layout: auto; min-width: 900px;">
                        <thead>
                            <tr>
                                <th>Producto</th>
                                <th>Cantidad</th>
                                <th>Ingresos</th>
                                <th>Costo</th>
                                <th>Utilidad</th>
                                <th>Margen</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${productData.map(product => `
                                <tr>
                                    <td><strong>${product.name}</strong></td>
                                    <td>${product.qty}</td>
                                    <td style="font-weight: 600;">${Utils.formatCurrency(product.revenue)}</td>
                                    <td>${Utils.formatCurrency(product.cost)}</td>
                                    <td style="color: ${product.profit >= 0 ? 'var(--color-success)' : 'var(--color-danger)'}; font-weight: 600;">
                                        ${Utils.formatCurrency(product.profit)}
                                    </td>
                                    <td style="color: ${product.margin >= 0 ? 'var(--color-success)' : 'var(--color-danger)'}; font-weight: 600;">
                                        ${product.margin.toFixed(1)}%
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    },
    
    async comparePeriods() {
        // Intentar obtener fechas de la pestaña de comparación primero
        let dateFrom = document.getElementById('compare-period1-from')?.value;
        let dateTo = document.getElementById('compare-period1-to')?.value;
        let dateFrom2 = document.getElementById('compare-period2-from')?.value;
        let dateTo2 = document.getElementById('compare-period2-to')?.value;
        
        // Si no están en la pestaña de comparación, usar las del reporte principal
        if (!dateFrom || !dateTo) {
            dateFrom = document.getElementById('report-date-from')?.value;
            dateTo = document.getElementById('report-date-to')?.value;
        }
        
        if (!dateFrom || !dateTo) {
            Utils.showNotification('Selecciona un rango de fechas primero', 'error');
            return;
        }
        
        const container = document.getElementById('compare-results');
        if (!container) {
            Utils.showNotification('Error: contenedor no encontrado', 'error');
            return;
        }

        container.innerHTML = '<div style="text-align: center; padding: 40px;"><i class="fas fa-spinner fa-spin"></i> Comparando períodos...</div>';
        
        try {
            const fromDate = new Date(dateFrom);
            const toDate = new Date(dateTo);
            
            let prevFromDate, prevToDate;
            
            // Si hay un segundo período definido, usarlo; si no, calcular automáticamente
            if (dateFrom2 && dateTo2) {
                prevFromDate = new Date(dateFrom2);
                prevToDate = new Date(dateTo2);
            } else {
                const daysDiff = Math.ceil((toDate - fromDate) / (1000 * 60 * 60 * 24));
                prevFromDate = new Date(fromDate);
                prevFromDate.setDate(prevFromDate.getDate() - daysDiff - 1);
                prevToDate = new Date(fromDate);
                prevToDate.setDate(prevToDate.getDate() - 1);
            }
            
            const prevFromStr = Utils.formatDate(prevFromDate, 'YYYY-MM-DD');
            const prevToStr = Utils.formatDate(prevToDate, 'YYYY-MM-DD');
            
            let currentSales = await DB.getAll('sales') || [];
            let previousSales = await DB.getAll('sales') || [];
            
            currentSales = currentSales.filter(s => s.created_at >= dateFrom && s.created_at <= dateTo + 'T23:59:59');
            previousSales = previousSales.filter(s => s.created_at >= prevFromStr && s.created_at <= prevToStr + 'T23:59:59');
            
            const currentTotal = currentSales.reduce((sum, s) => sum + (s.total || 0), 0);
            const previousTotal = previousSales.reduce((sum, s) => sum + (s.total || 0), 0);
            const currentCount = currentSales.length;
            const previousCount = previousSales.length;
            const change = previousTotal > 0 ? ((currentTotal - previousTotal) / previousTotal * 100) : 0;
            const countChange = previousCount > 0 ? ((currentCount - previousCount) / previousCount * 100) : 0;
            
            container.innerHTML = `
                <div style="width: 100%; max-width: 100%; box-sizing: border-box;">
                    <h3 style="font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: var(--spacing-md);">Comparativa de Períodos</h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: var(--spacing-md); margin-bottom: var(--spacing-md); width: 100%; box-sizing: border-box;">
                        <div style="background: var(--color-bg-secondary); padding: var(--spacing-md); border-radius: var(--radius-md); min-width: 0; width: 100%; box-sizing: border-box;">
                            <h4 style="font-size: 12px; margin-bottom: var(--spacing-xs); font-weight: 600;">Período Actual</h4>
                            <div style="font-size: 24px; font-weight: 700; margin: var(--spacing-xs) 0; color: var(--color-primary);">
                                ${Utils.formatCurrency(currentTotal)}
                            </div>
                            <div style="color: var(--color-text-secondary); font-size: 11px; margin-bottom: var(--spacing-xs);">
                                ${currentCount} ventas
                            </div>
                            <div style="margin-top: var(--spacing-xs); font-size: 10px; color: var(--color-text-secondary);">
                                ${Utils.formatDate(dateFrom, 'DD/MM/YYYY')} - ${Utils.formatDate(dateTo, 'DD/MM/YYYY')}
                            </div>
                        </div>
                        <div style="background: var(--color-bg-secondary); padding: var(--spacing-md); border-radius: var(--radius-md); min-width: 0; width: 100%; box-sizing: border-box;">
                            <h4 style="font-size: 12px; margin-bottom: var(--spacing-xs); font-weight: 600;">Período Anterior</h4>
                            <div style="font-size: 24px; font-weight: 700; margin: var(--spacing-xs) 0; color: var(--color-text-secondary);">
                                ${Utils.formatCurrency(previousTotal)}
                            </div>
                            <div style="color: var(--color-text-secondary); font-size: 11px; margin-bottom: var(--spacing-xs);">
                                ${previousCount} ventas
                            </div>
                            <div style="margin-top: var(--spacing-xs); font-size: 10px; color: var(--color-text-secondary);">
                                ${Utils.formatDate(prevFromStr, 'DD/MM/YYYY')} - ${Utils.formatDate(prevToStr, 'DD/MM/YYYY')}
                            </div>
                        </div>
                    </div>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: var(--spacing-md); width: 100%; box-sizing: border-box;">
                        <div style="background: ${change >= 0 ? 'rgba(52, 199, 89, 0.1)' : 'rgba(255, 59, 48, 0.1)'}; 
                            padding: var(--spacing-md); border-radius: var(--radius-md);
                            border-left: 3px solid ${change >= 0 ? 'var(--color-success)' : 'var(--color-danger)'}; min-width: 0; width: 100%; box-sizing: border-box;">
                            <div style="font-size: 11px; color: var(--color-text-secondary); margin-bottom: var(--spacing-xs);">Cambio en Ventas</div>
                            <div style="font-size: 20px; font-weight: 700; color: ${change >= 0 ? 'var(--color-success)' : 'var(--color-danger)'};">
                                ${change >= 0 ? '+' : ''}${change.toFixed(1)}%
                            </div>
                            <div style="color: var(--color-text-secondary); margin-top: var(--spacing-xs); font-size: 10px;">
                                Diferencia: ${Utils.formatCurrency(Math.abs(currentTotal - previousTotal))}
                            </div>
                        </div>
                        <div style="background: ${countChange >= 0 ? 'rgba(52, 199, 89, 0.1)' : 'rgba(255, 59, 48, 0.1)'}; 
                            padding: var(--spacing-md); border-radius: var(--radius-md);
                            border-left: 3px solid ${countChange >= 0 ? 'var(--color-success)' : 'var(--color-danger)'}; min-width: 0; width: 100%; box-sizing: border-box;">
                            <div style="font-size: 11px; color: var(--color-text-secondary); margin-bottom: var(--spacing-xs);">Cambio en Cantidad</div>
                            <div style="font-size: 20px; font-weight: 700; color: ${countChange >= 0 ? 'var(--color-success)' : 'var(--color-danger)'};">
                                ${countChange >= 0 ? '+' : ''}${countChange.toFixed(1)}%
                            </div>
                            <div style="color: var(--color-text-secondary); margin-top: var(--spacing-xs); font-size: 10px;">
                                Diferencia: ${Math.abs(currentCount - previousCount)} ventas
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } catch (e) {
            console.error('Error comparing periods:', e);
            container.innerHTML = `
                <div style="padding: var(--spacing-md); background: var(--color-danger); color: white; border-radius: var(--radius-md);">
                    <strong>Error:</strong> ${e.message}
                </div>
            `;
        }
    },

    async exportReport() {
        if (!window.currentReportData || window.currentReportData.length === 0) {
            Utils.showNotification('Genera un reporte primero', 'error');
            return;
        }

        const branches = await DB.getAll('catalog_branches');
        const sellers = await DB.getAll('catalog_sellers');
        const agencies = await DB.getAll('catalog_agencies');
        const guides = await DB.getAll('catalog_guides');

        const exportData = window.currentReportData.map(sale => {
            const branch = branches.find(b => b.id === sale.branch_id);
            const seller = sellers.find(s => s.id === sale.seller_id);
            const agency = agencies.find(a => a.id === sale.agency_id);
            const guide = guides.find(g => g.id === sale.guide_id);
            return {
                Folio: sale.folio,
                Fecha: Utils.formatDate(sale.created_at, 'DD/MM/YYYY'),
                Sucursal: branch?.name || '',
                Vendedor: seller?.name || '',
                Agencia: agency?.name || '',
                Guía: guide?.name || '',
                Pasajeros: sale.passengers || 1,
                Total: sale.total,
                Estado: sale.status
            };
        });

        const format = prompt('Formato:\n1. CSV\n2. Excel\n3. PDF', '2');
        const date = Utils.formatDate(new Date(), 'YYYYMMDD');
        
        if (format === '1') {
            Utils.exportToCSV(exportData, `reporte_${date}.csv`);
        } else if (format === '2') {
            Utils.exportToExcel(exportData, `reporte_${date}.xlsx`, 'Reporte Ventas');
        } else if (format === '3') {
            Utils.exportToPDF(exportData, `reporte_${date}.pdf`, 'Reporte de Ventas');
        }
    },

    // ========================================
    // FUNCIONALIDADES AVANZADAS REPORTES
    // ========================================

    async generateAdvancedAnalytics() {
        const sales = await DB.getAll('sales');
        const completedSales = sales.filter(s => s.status === 'completada');
        
        // Análisis de tendencias
        const trends = this.analyzeTrends(completedSales);
        
        // Análisis de productos
        const productAnalysis = await this.analyzeProducts();
        
        // Análisis de clientes
        const customerAnalysis = await this.analyzeCustomers();
        
        // Análisis de rentabilidad
        const profitability = await this.analyzeProfitability();

        // Mostrar en la pestaña de análisis si está disponible
        const analysisContainer = document.getElementById('analysis-results');
        if (analysisContainer) {
            analysisContainer.innerHTML = `
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: var(--spacing-md); width: 100%; max-width: 100%; box-sizing: border-box;">
                    <div style="min-width: 0; width: 100%; box-sizing: border-box;">
                        <h4 style="margin-bottom: var(--spacing-sm); font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Análisis de Tendencias</h4>
                        <div style="background: var(--color-bg-secondary); padding: var(--spacing-md); border-radius: var(--radius-md); margin-bottom: var(--spacing-md); width: 100%; box-sizing: border-box;">
                            <div style="margin-bottom: var(--spacing-sm);">
                                <div style="font-size: 11px; color: var(--color-text-secondary);">Tendencia General</div>
                                <div style="font-size: 18px; font-weight: 700; color: ${trends.general === 'creciente' ? 'var(--color-success)' : trends.general === 'decreciente' ? 'var(--color-danger)' : 'var(--color-warning)'};">
                                    ${trends.general === 'creciente' ? '↗ Creciente' : trends.general === 'decreciente' ? '↘ Decreciente' : '→ Estable'}
                                </div>
                            </div>
                            <div style="margin-bottom: var(--spacing-sm);">
                                <div style="font-size: 11px; color: var(--color-text-secondary);">Crecimiento Mensual</div>
                                <div style="font-size: 16px; font-weight: 600;">${trends.monthlyGrowth.toFixed(1)}%</div>
                            </div>
                        </div>

                        <h4 style="margin-bottom: var(--spacing-sm); font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Análisis de Rentabilidad</h4>
                        <div style="background: var(--color-bg-secondary); padding: var(--spacing-md); border-radius: var(--radius-md); width: 100%; box-sizing: border-box;">
                            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: var(--spacing-sm);">
                                <div style="min-width: 0;">
                                    <div style="font-size: 11px; color: var(--color-text-secondary);">Margen Bruto</div>
                                    <div style="font-size: 18px; font-weight: 700;">${profitability.grossMargin.toFixed(1)}%</div>
                                </div>
                                <div style="min-width: 0;">
                                    <div style="font-size: 11px; color: var(--color-text-secondary);">ROI Estimado</div>
                                    <div style="font-size: 18px; font-weight: 700;">${profitability.roi.toFixed(1)}%</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style="min-width: 0; width: 100%; box-sizing: border-box;">
                        <h4 style="margin-bottom: var(--spacing-sm); font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Top Productos</h4>
                        <div style="background: var(--color-bg-secondary); padding: var(--spacing-md); border-radius: var(--radius-md); margin-bottom: var(--spacing-md); width: 100%; box-sizing: border-box;">
                            ${productAnalysis.topProducts.slice(0, 5).map((product, idx) => `
                                <div style="display: flex; justify-content: space-between; padding: var(--spacing-xs) 0; border-bottom: 1px solid var(--color-border-light); min-width: 0;">
                                    <div style="min-width: 0; overflow: hidden; text-overflow: ellipsis;">
                                        <span style="font-weight: 600; color: var(--color-primary);">#${idx + 1}</span>
                                        <span style="margin-left: var(--spacing-xs);">${product.name}</span>
                                    </div>
                                    <div style="white-space: nowrap; margin-left: var(--spacing-xs);">
                                        <span style="font-weight: 600;">${Utils.formatCurrency(product.revenue)}</span>
                                        <span style="color: var(--color-text-secondary); margin-left: var(--spacing-xs); font-size: 11px;">${product.count}x</span>
                                    </div>
                                </div>
                            `).join('')}
                        </div>

                        <h4 style="margin-bottom: var(--spacing-sm); font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Segmentación de Clientes</h4>
                        <div style="background: var(--color-bg-secondary); padding: var(--spacing-md); border-radius: var(--radius-md); width: 100%; box-sizing: border-box;">
                            ${Object.entries(customerAnalysis.segments).map(([segment, data]) => `
                                <div style="display: flex; justify-content: space-between; padding: var(--spacing-xs) 0; border-bottom: 1px solid var(--color-border-light); min-width: 0;">
                                    <div style="min-width: 0; overflow: hidden; text-overflow: ellipsis;">
                                        <strong>${segment}</strong>
                                        <div style="font-size: 10px; color: var(--color-text-secondary);">${data.count} clientes</div>
                                    </div>
                                    <div style="text-align: right; white-space: nowrap; margin-left: var(--spacing-xs);">
                                        <div style="font-weight: 600;">${Utils.formatCurrency(data.revenue)}</div>
                                        <div style="font-size: 10px; color: var(--color-text-secondary);">${data.percentage.toFixed(1)}%</div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
                <div style="margin-top: var(--spacing-md); display: flex; gap: var(--spacing-sm); flex-wrap: wrap;">
                    <button class="btn-secondary" onclick="window.Reports.exportAdvancedAnalytics()" style="white-space: nowrap;">
                        <i class="fas fa-download"></i> Exportar Análisis
                    </button>
                </div>
            `;
            return;
        }

        // Si no hay pestaña de análisis, mostrar modal
        const body = `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: var(--spacing-md); width: 100%; max-width: 100%; box-sizing: border-box;">
                <div style="min-width: 0; width: 100%; box-sizing: border-box;">
                    <h4 style="margin-bottom: var(--spacing-sm); font-size: 13px; font-weight: 600;">Análisis de Tendencias</h4>
                    <div style="background: var(--color-bg-secondary); padding: var(--spacing-md); border-radius: var(--radius-md); margin-bottom: var(--spacing-md); width: 100%; box-sizing: border-box;">
                        <div style="margin-bottom: var(--spacing-sm);">
                            <div style="font-size: 11px; color: var(--color-text-secondary);">Tendencia General</div>
                            <div style="font-size: 18px; font-weight: 700; color: ${trends.general === 'creciente' ? 'var(--color-success)' : trends.general === 'decreciente' ? 'var(--color-danger)' : 'var(--color-warning)'};">
                                ${trends.general === 'creciente' ? '↗ Creciente' : trends.general === 'decreciente' ? '↘ Decreciente' : '→ Estable'}
                            </div>
                        </div>
                        <div style="margin-bottom: var(--spacing-sm);">
                            <div style="font-size: 11px; color: var(--color-text-secondary);">Crecimiento Mensual</div>
                            <div style="font-size: 16px; font-weight: 600;">${trends.monthlyGrowth.toFixed(1)}%</div>
                        </div>
                    </div>

                    <h4 style="margin-bottom: var(--spacing-sm); font-size: 13px; font-weight: 600;">Análisis de Rentabilidad</h4>
                    <div style="background: var(--color-bg-secondary); padding: var(--spacing-md); border-radius: var(--radius-md); width: 100%; box-sizing: border-box;">
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: var(--spacing-sm);">
                            <div style="min-width: 0;">
                                <div style="font-size: 11px; color: var(--color-text-secondary);">Margen Bruto</div>
                                <div style="font-size: 18px; font-weight: 700;">${profitability.grossMargin.toFixed(1)}%</div>
                            </div>
                            <div style="min-width: 0;">
                                <div style="font-size: 11px; color: var(--color-text-secondary);">ROI Estimado</div>
                                <div style="font-size: 18px; font-weight: 700;">${profitability.roi.toFixed(1)}%</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div style="min-width: 0; width: 100%; box-sizing: border-box;">
                    <h4 style="margin-bottom: var(--spacing-sm); font-size: 13px; font-weight: 600;">Top Productos</h4>
                    <div style="background: var(--color-bg-secondary); padding: var(--spacing-md); border-radius: var(--radius-md); margin-bottom: var(--spacing-md); width: 100%; box-sizing: border-box;">
                        ${productAnalysis.topProducts.slice(0, 5).map((product, idx) => `
                            <div style="display: flex; justify-content: space-between; padding: var(--spacing-xs) 0; border-bottom: 1px solid var(--color-border-light); min-width: 0;">
                                <div style="min-width: 0; overflow: hidden; text-overflow: ellipsis;">
                                    <span style="font-weight: 600; color: var(--color-primary);">#${idx + 1}</span>
                                    <span style="margin-left: var(--spacing-xs);">${product.name}</span>
                                </div>
                                <div style="white-space: nowrap; margin-left: var(--spacing-xs);">
                                    <span style="font-weight: 600;">${Utils.formatCurrency(product.revenue)}</span>
                                    <span style="color: var(--color-text-secondary); margin-left: var(--spacing-xs); font-size: 11px;">${product.count}x</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>

                    <h4 style="margin-bottom: var(--spacing-sm); font-size: 13px; font-weight: 600;">Segmentación de Clientes</h4>
                    <div style="background: var(--color-bg-secondary); padding: var(--spacing-md); border-radius: var(--radius-md); width: 100%; box-sizing: border-box;">
                        ${Object.entries(customerAnalysis.segments).map(([segment, data]) => `
                            <div style="display: flex; justify-content: space-between; padding: var(--spacing-xs) 0; border-bottom: 1px solid var(--color-border-light); min-width: 0;">
                                <div style="min-width: 0; overflow: hidden; text-overflow: ellipsis;">
                                    <strong>${segment}</strong>
                                    <div style="font-size: 10px; color: var(--color-text-secondary);">${data.count} clientes</div>
                                </div>
                                <div style="text-align: right; white-space: nowrap; margin-left: var(--spacing-xs);">
                                    <div style="font-weight: 600;">${Utils.formatCurrency(data.revenue)}</div>
                                    <div style="font-size: 10px; color: var(--color-text-secondary);">${data.percentage.toFixed(1)}%</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

        UI.showModal('Análisis Avanzado', body, [
            { text: 'Exportar', class: 'btn-secondary', onclick: () => this.exportAdvancedAnalytics() },
            { text: 'Cerrar', class: 'btn-primary', onclick: () => UI.closeModal() }
        ]);
    },

    analyzeTrends(sales) {
        const monthlyData = {};
        sales.forEach(sale => {
            const date = new Date(sale.created_at);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            if (!monthlyData[monthKey]) {
                monthlyData[monthKey] = { count: 0, total: 0 };
            }
            monthlyData[monthKey].count += 1;
            monthlyData[monthKey].total += sale.total || 0;
        });

        const sortedMonths = Object.entries(monthlyData)
            .sort((a, b) => a[0].localeCompare(b[0]))
            .slice(-3);

        if (sortedMonths.length < 2) {
            return { general: 'estable', monthlyGrowth: 0 };
        }

        const lastMonth = sortedMonths[sortedMonths.length - 1][1].total;
        const prevMonth = sortedMonths[sortedMonths.length - 2][1].total;
        const growth = prevMonth > 0 ? ((lastMonth - prevMonth) / prevMonth) * 100 : 0;

        return {
            general: growth > 5 ? 'creciente' : growth < -5 ? 'decreciente' : 'estable',
            monthlyGrowth: growth
        };
    },

    async analyzeProducts() {
        const sales = await DB.getAll('sales');
        const saleItems = await DB.getAll('sale_items');
        const items = await DB.getAll('inventory_items');
        
        const productStats = {};
        sales.filter(s => s.status === 'completada').forEach(sale => {
            const itemsForSale = saleItems.filter(si => si.sale_id === sale.id);
            itemsForSale.forEach(si => {
                const item = items.find(i => i.id === si.item_id);
                if (item) {
                    if (!productStats[item.id]) {
                        productStats[item.id] = { name: item.name, count: 0, revenue: 0 };
                    }
                    productStats[item.id].count += si.quantity || 1;
                    productStats[item.id].revenue += (si.price || 0) * (si.quantity || 1);
                }
            });
        });

        return {
            topProducts: Object.values(productStats).sort((a, b) => b.revenue - a.revenue).slice(0, 10)
        };
    },

    async analyzeCustomers() {
        const customers = await DB.getAll('customers');
        const sales = await DB.getAll('sales');
        
        const segments = { VIP: { count: 0, revenue: 0 }, Premium: { count: 0, revenue: 0 }, Regular: { count: 0, revenue: 0 }, Ocasional: { count: 0, revenue: 0 } };
        
        customers.forEach(customer => {
            const customerSales = sales.filter(s => s.customer_id === customer.id && s.status === 'completada');
            const totalSpent = customerSales.reduce((sum, s) => sum + (s.total || 0), 0);
            const segment = this.calculateCustomerSegment(totalSpent, customerSales.length);
            
            if (segments[segment]) {
                segments[segment].count += 1;
                segments[segment].revenue += totalSpent;
            }
        });

        const totalRevenue = Object.values(segments).reduce((sum, s) => sum + s.revenue, 0);
        Object.keys(segments).forEach(segment => {
            segments[segment].percentage = totalRevenue > 0 ? (segments[segment].revenue / totalRevenue) * 100 : 0;
        });

        return { segments };
    },

    calculateCustomerSegment(totalSpent, purchaseCount) {
        if (purchaseCount === 0) return 'Ocasional';
        if (totalSpent >= 50000 && purchaseCount >= 5) return 'VIP';
        if (totalSpent >= 20000 && purchaseCount >= 3) return 'Premium';
        if (totalSpent >= 5000) return 'Regular';
        return 'Ocasional';
    },

    async analyzeProfitability() {
        const sales = await DB.getAll('sales');
        const completedSales = sales.filter(s => s.status === 'completada');
        const totalRevenue = completedSales.reduce((sum, s) => sum + (s.total || 0), 0);
        
        const costs = await DB.getAll('cost_entries');
        const totalCosts = costs.reduce((sum, c) => sum + (c.amount || 0), 0);
        
        const grossProfit = totalRevenue - totalCosts;
        const grossMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
        const roi = totalCosts > 0 ? (grossProfit / totalCosts) * 100 : 0;

        return { grossMargin, roi, grossProfit, totalRevenue, totalCosts };
    },

    async exportAdvancedAnalytics() {
        const analytics = {
            trends: this.analyzeTrends(await DB.getAll('sales').then(s => s.filter(s => s.status === 'completada'))),
            products: await this.analyzeProducts(),
            customers: await this.analyzeCustomers(),
            profitability: await this.analyzeProfitability()
        };

        const exportData = [{
            'Análisis': 'Tendencias',
            'Tendencia General': analytics.trends.general,
            'Crecimiento Mensual': `${analytics.trends.monthlyGrowth.toFixed(1)}%`,
            'Margen Bruto': `${analytics.profitability.grossMargin.toFixed(1)}%`,
            'ROI': `${analytics.profitability.roi.toFixed(1)}%`
        }];

        Utils.exportToExcel(exportData, `analisis_avanzado_${Utils.formatDate(new Date(), 'YYYYMMDD')}.xlsx`, 'Análisis Avanzado');
        Utils.showNotification('Análisis exportado', 'success');
    }
};

window.Reports = Reports;
