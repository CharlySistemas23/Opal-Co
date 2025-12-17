// Dashboard Module - Versión Avanzada

const Dashboard = {
    initialized: false,
    
    async init() {
        if (this.initialized) return;
        await this.loadDashboard();
        this.initialized = true;
    },
    
    async loadDashboard() {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const todayStr = today.toISOString().split('T')[0];
            
            // Obtener todas las ventas
            const allSales = await DB.getAll('sales') || [];
            const todaySales = allSales.filter(s => s.created_at && s.created_at.startsWith(todayStr));
            const thisMonthSales = allSales.filter(s => {
                const saleDate = new Date(s.created_at);
                return saleDate.getMonth() === today.getMonth() && saleDate.getFullYear() === today.getFullYear();
            });
            const lastMonthSales = allSales.filter(s => {
                const saleDate = new Date(s.created_at);
                const lastMonth = new Date(today);
                lastMonth.setMonth(lastMonth.getMonth() - 1);
                return saleDate.getMonth() === lastMonth.getMonth() && saleDate.getFullYear() === lastMonth.getFullYear();
            });
            
            // Obtener Total PAX de llegadas del día (solo llegadas válidas: pasajeros > 0 y unidades > 0)
            const branchId = localStorage.getItem('current_branch_id') || 'branch1';
            const arrivals = await DB.query('agency_arrivals', 'date', todayStr) || [];
            const todayArrivals = arrivals.filter(a => 
                (a.branch_id === branchId || !a.branch_id) &&
                (a.passengers > 0 && a.units > 0) // Solo llegadas válidas
            );
            const todayPassengers = todayArrivals.reduce((sum, a) => sum + (a.passengers || 0), 0);
            
            // Calcular KPIs
            const todayTotal = todaySales.reduce((sum, s) => sum + (s.total || 0), 0);
            const todayTickets = todaySales.length;
            const avgTicket = todayPassengers > 0 ? todayTotal / todayPassengers : 0;
            const closeRate = todayPassengers > 0 ? (todayTickets / todayPassengers) * 100 : 0;
            
            // Obtener utilidad diaria
            let dailyProfit = null;
            try {
                const profitReports = await DB.query('daily_profit_reports', 'date', todayStr) || [];
                const todayProfit = profitReports.find(p => p.branch_id === branchId);
                if (todayProfit) {
                    dailyProfit = {
                        revenue: todayProfit.revenue_sales_total || todayProfit.revenue || 0,
                        arrival_costs: todayProfit.arrivals_total || todayProfit.arrival_costs || 0,
                        operating_costs: (todayProfit.fixed_costs_daily || 0) + (todayProfit.variable_costs_daily || 0),
                        commissions: (todayProfit.commissions_sellers_total || 0) + (todayProfit.commissions_guides_total || 0),
                        gross_profit: (todayProfit.revenue_sales_total || 0) - (todayProfit.arrivals_total || 0) - ((todayProfit.fixed_costs_daily || 0) + (todayProfit.variable_costs_daily || 0)),
                        net_profit: todayProfit.profit_before_taxes || todayProfit.net_profit || 0,
                        total_passengers: todayProfit.passengers_total || 0
                    };
                }
            } catch (e) {
                console.error('Error loading daily profit:', e);
            }
            
            const monthTotal = thisMonthSales.reduce((sum, s) => sum + (s.total || 0), 0);
            const lastMonthTotal = lastMonthSales.reduce((sum, s) => sum + (s.total || 0), 0);
            const monthGrowth = lastMonthTotal > 0 ? ((monthTotal - lastMonthTotal) / lastMonthTotal * 100) : 0;
            
            // Ventas últimos 30 días
            const last30Days = [];
            for (let i = 29; i >= 0; i--) {
                const date = new Date(today);
                date.setDate(date.getDate() - i);
                const dateStr = date.toISOString().split('T')[0];
                const daySales = allSales.filter(s => s.created_at && s.created_at.startsWith(dateStr));
                const dayTotal = daySales.reduce((sum, s) => sum + (s.total || 0), 0);
                last30Days.push({
                    date: Utils.formatDate(date, 'DD/MM'),
                    fullDate: dateStr,
                    total: dayTotal,
                    count: daySales.length
                });
            }
            
            // Top vendedores del mes
            const sellers = await DB.getAll('catalog_sellers') || [];
            const sellerStats = {};
            thisMonthSales.forEach(sale => {
                if (sale.seller_id) {
                    if (!sellerStats[sale.seller_id]) {
                        sellerStats[sale.seller_id] = { total: 0, count: 0 };
                    }
                    sellerStats[sale.seller_id].total += sale.total || 0;
                    sellerStats[sale.seller_id].count += 1;
                }
            });
            
            const topSellers = Object.entries(sellerStats)
                .map(([id, stats]) => {
                    const seller = sellers.find(s => s.id === id);
                    return {
                        id,
                        name: seller?.name || 'N/A',
                        total: stats.total,
                        count: stats.count
                    };
                })
                .sort((a, b) => b.total - a.total)
                .slice(0, 5);
            
            // Top productos del mes
            const saleItems = await DB.getAll('sale_items') || [];
            const items = await DB.getAll('inventory_items') || [];
            const productStats = {};
            thisMonthSales.forEach(sale => {
                const itemsForSale = saleItems.filter(si => si.sale_id === sale.id);
                itemsForSale.forEach(si => {
                    const item = items.find(i => i.id === si.item_id);
                    if (item) {
                        if (!productStats[item.id]) {
                            productStats[item.id] = { name: item.name, qty: 0, revenue: 0 };
                        }
                        productStats[item.id].qty += si.quantity || 1;
                        productStats[item.id].revenue += (si.price || 0) * (si.quantity || 1);
                    }
                });
            });
            
            const topProducts = Object.values(productStats)
                .sort((a, b) => b.revenue - a.revenue)
                .slice(0, 5);
            
            // Ventas por día de la semana
            const dayOfWeekStats = {};
            thisMonthSales.forEach(sale => {
                const saleDate = new Date(sale.created_at);
                const dayName = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'][saleDate.getDay()];
                if (!dayOfWeekStats[dayName]) {
                    dayOfWeekStats[dayName] = { total: 0, count: 0 };
                }
                dayOfWeekStats[dayName].total += sale.total || 0;
                dayOfWeekStats[dayName].count += 1;
            });
            
            // Ventas por hora del día
            const hourStats = {};
            thisMonthSales.forEach(sale => {
                const saleDate = new Date(sale.created_at);
                const hour = saleDate.getHours();
                const hourKey = `${hour}:00`;
                if (!hourStats[hourKey]) {
                    hourStats[hourKey] = { total: 0, count: 0 };
                }
                hourStats[hourKey].total += sale.total || 0;
                hourStats[hourKey].count += 1;
            });
            
            // Inventario
            const inventoryItems = await DB.getAll('inventory_items') || [];
            const availableItems = inventoryItems.filter(i => i.status === 'disponible').length;
            const soldItems = inventoryItems.filter(i => i.status === 'vendida').length;
            const inventoryValue = inventoryItems
                .filter(i => i.status === 'disponible')
                .reduce((sum, i) => sum + (i.cost || 0), 0);
            
            // Costos del mes
            const costs = await DB.getAll('cost_entries') || [];
            const thisMonthCosts = costs.filter(c => {
                const costDate = new Date(c.date || c.created_at);
                return costDate.getMonth() === today.getMonth() && costDate.getFullYear() === today.getFullYear();
            });
            const totalCosts = thisMonthCosts.reduce((sum, c) => sum + (c.amount || 0), 0);
            const profit = monthTotal - totalCosts;
            const profitMargin = monthTotal > 0 ? (profit / monthTotal * 100) : 0;
            
            this.renderDashboard({
                todayTotal,
                todayTickets,
                todayPassengers,
                avgTicket,
                closeRate,
                monthTotal,
                lastMonthTotal,
                monthGrowth,
                last30Days,
                topSellers,
                topProducts,
                dayOfWeekStats,
                hourStats,
                availableItems,
                soldItems,
                inventoryValue,
                totalCosts,
                profit,
                profitMargin,
                dailyProfit
            });
            
        } catch (e) {
            console.error('Error loading dashboard:', e);
            Utils.showNotification('Error al cargar dashboard', 'error');
        }
    },
    
    renderDashboard(data) {
        const container = document.getElementById('module-dashboard');
        if (!container) return;
        
        const maxSales = Math.max(...data.last30Days.map(d => d.total), 1);
        const maxDayOfWeek = Math.max(...Object.values(data.dayOfWeekStats).map(s => s.total), 1);
        const maxHour = Math.max(...Object.values(data.hourStats).map(s => s.total), 1);
        
        container.innerHTML = `
            <div class="module-header">
                <h2>Dashboard Avanzado</h2>
                <div class="module-actions">
                    <button class="btn-secondary btn-sm" onclick="window.Dashboard.showPredictions()">
                        <i class="fas fa-crystal-ball"></i> Predicciones
                    </button>
                    <button class="btn-secondary btn-sm" onclick="window.Dashboard.refresh()">
                        <i class="fas fa-sync"></i> Actualizar
                    </button>
                    <button class="btn-secondary btn-sm" onclick="window.Dashboard.exportDashboard()">
                        <i class="fas fa-download"></i> Exportar
                    </button>
                </div>
            </div>
            
            <!-- KPIs Principales -->
            <div class="dashboard-grid" style="margin-bottom: var(--spacing-xl);">
                <div class="kpi-card" style="position: relative; overflow: hidden;">
                    <div class="kpi-label">Ventas Hoy</div>
                    <div class="kpi-value">${Utils.formatCurrency(data.todayTotal)}</div>
                    <div style="position: absolute; top: var(--spacing-xs); right: var(--spacing-xs); font-size: 24px; opacity: 0.1;">
                        <i class="fas fa-dollar-sign"></i>
                    </div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-label">Tickets Hoy</div>
                    <div class="kpi-value">${data.todayTickets}</div>
                    <div style="font-size: 12px; color: var(--color-text-secondary); margin-top: var(--spacing-xs);">
                        ${data.todayPassengers} pasajeros
                    </div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-label">Ticket Promedio</div>
                    <div class="kpi-value">${Utils.formatCurrency(data.avgTicket)}</div>
                    <div style="font-size: 12px; color: var(--color-text-secondary); margin-top: var(--spacing-xs);">
                        % Cierre: ${data.closeRate.toFixed(1)}%
                    </div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-label">Ventas del Mes</div>
                    <div class="kpi-value">${Utils.formatCurrency(data.monthTotal)}</div>
                    <div style="font-size: 12px; color: ${data.monthGrowth >= 0 ? 'var(--color-success)' : 'var(--color-danger)'}; margin-top: var(--spacing-xs);">
                        ${data.monthGrowth >= 0 ? '+' : ''}${data.monthGrowth.toFixed(1)}% vs mes anterior
                    </div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-label">Utilidad del Mes</div>
                    <div class="kpi-value" style="color: ${data.profit >= 0 ? 'var(--color-success)' : 'var(--color-danger)'};">
                        ${Utils.formatCurrency(data.profit)}
                    </div>
                    <div style="font-size: 12px; color: var(--color-text-secondary); margin-top: var(--spacing-xs);">
                        Margen: ${data.profitMargin.toFixed(1)}%
                    </div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-label">Inventario Disponible</div>
                    <div class="kpi-value">${data.availableItems}</div>
                    <div style="font-size: 12px; color: var(--color-text-secondary); margin-top: var(--spacing-xs);">
                        Valor: ${Utils.formatCurrency(data.inventoryValue)}
                    </div>
                </div>
            </div>
            
            ${data.dailyProfit ? `
            <!-- Utilidad Diaria -->
            <div class="dashboard-section" style="background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%); padding: var(--spacing-lg); border-radius: var(--radius-md); margin-bottom: var(--spacing-xl); color: white;">
                <h3 style="color: white; margin-bottom: var(--spacing-md);">Utilidad Diaria (Antes de Impuestos)</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: var(--spacing-md);">
                    <div style="background: rgba(255,255,255,0.15); padding: var(--spacing-sm); border-radius: var(--radius-sm); backdrop-filter: blur(10px);">
                        <div style="font-size: 11px; opacity: 0.9; margin-bottom: 4px;">Revenue</div>
                        <div style="font-size: 18px; font-weight: 600;">${Utils.formatCurrency(data.dailyProfit.revenue)}</div>
                    </div>
                    <div style="background: rgba(255,255,255,0.15); padding: var(--spacing-sm); border-radius: var(--radius-sm); backdrop-filter: blur(10px);">
                        <div style="font-size: 11px; opacity: 0.9; margin-bottom: 4px;">Costos Llegadas</div>
                        <div style="font-size: 18px; font-weight: 600;">${Utils.formatCurrency(data.dailyProfit.arrival_costs)}</div>
                    </div>
                    <div style="background: rgba(255,255,255,0.15); padding: var(--spacing-sm); border-radius: var(--radius-sm); backdrop-filter: blur(10px);">
                        <div style="font-size: 11px; opacity: 0.9; margin-bottom: 4px;">Costos Operativos</div>
                        <div style="font-size: 18px; font-weight: 600;">${Utils.formatCurrency(data.dailyProfit.operating_costs)}</div>
                    </div>
                    <div style="background: rgba(255,255,255,0.15); padding: var(--spacing-sm); border-radius: var(--radius-sm); backdrop-filter: blur(10px);">
                        <div style="font-size: 11px; opacity: 0.9; margin-bottom: 4px;">Comisiones</div>
                        <div style="font-size: 18px; font-weight: 600;">${Utils.formatCurrency(data.dailyProfit.commissions)}</div>
                    </div>
                    <div style="background: rgba(255,255,255,0.25); padding: var(--spacing-sm); border-radius: var(--radius-sm); backdrop-filter: blur(10px); border: 2px solid rgba(255,255,255,0.3);">
                        <div style="font-size: 11px; opacity: 0.9; margin-bottom: 4px;">Utilidad Bruta</div>
                        <div style="font-size: 20px; font-weight: 700;">${Utils.formatCurrency(data.dailyProfit.gross_profit)}</div>
                    </div>
                    <div style="background: rgba(255,255,255,0.3); padding: var(--spacing-sm); border-radius: var(--radius-sm); backdrop-filter: blur(10px); border: 2px solid rgba(255,255,255,0.5);">
                        <div style="font-size: 11px; opacity: 0.9; margin-bottom: 4px;">Utilidad Neta</div>
                        <div style="font-size: 22px; font-weight: 700; color: ${data.dailyProfit.net_profit >= 0 ? '#4ade80' : '#f87171'};">${Utils.formatCurrency(data.dailyProfit.net_profit)}</div>
                    </div>
                </div>
            </div>
            ` : ''}
            
            <!-- Gráfico de Ventas Últimos 30 Días -->
            <div class="dashboard-section">
                <h3>Ventas Últimos 30 Días</h3>
                <div style="background: var(--color-bg-secondary); padding: var(--spacing-md); border-radius: var(--radius-md); margin-top: var(--spacing-sm);">
                    <div style="display: flex; align-items: flex-end; gap: 3px; height: 160px; position: relative;">
                        ${data.last30Days.map((day, idx) => {
                            const height = maxSales > 0 ? (day.total / maxSales * 100) : 0;
                            const isToday = idx === data.last30Days.length - 1;
                            return `
                                <div style="flex: 1; display: flex; flex-direction: column; align-items: center; gap: 6px; position: relative;">
                                    <div style="flex: 1; display: flex; align-items: flex-end; width: 100%; position: relative;">
                                        <div style="width: 100%; background: ${isToday ? 'linear-gradient(180deg, var(--color-primary) 0%, var(--color-accent) 100%)' : 'linear-gradient(180deg, var(--color-accent) 0%, var(--color-primary) 100%)'}; 
                                            border-radius: var(--radius-xs) var(--radius-xs) 0 0; 
                                            height: ${height}%; 
                                            min-height: ${day.total > 0 ? '4px' : '0'}; 
                                            transition: all 0.3s;
                                            cursor: pointer;
                                            position: relative;"
                                            onmouseover="this.style.opacity='0.8'; this.nextElementSibling.style.display='block';"
                                            onmouseout="this.style.opacity='1'; this.nextElementSibling.style.display='none';">
                                        </div>
                                        <div style="position: absolute; top: -30px; left: 50%; transform: translateX(-50%); 
                                            background: var(--color-text); color: white; padding: 4px 8px; 
                                            border-radius: var(--radius-xs); font-size: 10px; white-space: nowrap; 
                                            display: none; z-index: 10; pointer-events: none;">
                                            ${Utils.formatCurrency(day.total)}<br>
                                            <small>${day.count} ventas</small>
                                        </div>
                                    </div>
                                    <div style="font-size: 8px; color: var(--color-text-secondary); text-align: center; transform: rotate(-45deg); transform-origin: center; white-space: nowrap;">
                                        ${day.date}
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            </div>
            
            <!-- Gráficos Comparativos -->
            <div class="dashboard-section" style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-lg);">
                <div>
                    <h3>Ventas por Día de la Semana</h3>
                    <div style="background: var(--color-bg-secondary); padding: var(--spacing-md); border-radius: var(--radius-md); margin-top: var(--spacing-sm);">
                        <div style="display: flex; flex-direction: column; gap: var(--spacing-xs);">
                            ${['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(day => {
                                const stats = data.dayOfWeekStats[day] || { total: 0, count: 0 };
                                const width = maxDayOfWeek > 0 ? (stats.total / maxDayOfWeek * 100) : 0;
                                return `
                                    <div>
                                        <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
                                            <span style="font-size: 10px; font-weight: 600;">${day}</span>
                                            <span style="font-size: 10px; color: var(--color-text-secondary);">
                                                ${Utils.formatCurrency(stats.total)} (${stats.count})
                                            </span>
                                        </div>
                                        <div style="width: 100%; height: 16px; background: var(--color-border-light); border-radius: var(--radius-full); overflow: hidden;">
                                            <div style="width: ${width}%; height: 100%; background: linear-gradient(90deg, var(--color-primary) 0%, var(--color-accent) 100%); transition: width 0.5s;"></div>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                </div>
                
                <div>
                    <h3>Ventas por Hora del Día</h3>
                    <div style="background: var(--color-bg-secondary); padding: var(--spacing-md); border-radius: var(--radius-md); margin-top: var(--spacing-sm);">
                        <div style="display: flex; flex-direction: column; gap: var(--spacing-xs);">
                            ${Array.from({length: 24}, (_, i) => {
                                const hourKey = `${i}:00`;
                                const stats = data.hourStats[hourKey] || { total: 0, count: 0 };
                                const width = maxHour > 0 ? (stats.total / maxHour * 100) : 0;
                                if (stats.total === 0) return '';
                                return `
                                    <div>
                                        <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
                                            <span style="font-size: 10px; font-weight: 600;">${hourKey}</span>
                                            <span style="font-size: 10px; color: var(--color-text-secondary);">
                                                ${Utils.formatCurrency(stats.total)}
                                            </span>
                                        </div>
                                        <div style="width: 100%; height: 14px; background: var(--color-border-light); border-radius: var(--radius-full); overflow: hidden;">
                                            <div style="width: ${width}%; height: 100%; background: linear-gradient(90deg, var(--color-accent) 0%, var(--color-primary) 100%); transition: width 0.5s;"></div>
                                        </div>
                                    </div>
                                `;
                            }).filter(h => h).join('')}
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Top Vendedores y Productos -->
            <div class="dashboard-section" style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-lg);">
                <div>
                    <h3>Top Vendedores del Mes</h3>
                    <div style="background: var(--color-bg-secondary); padding: var(--spacing-md); border-radius: var(--radius-md); margin-top: var(--spacing-sm);">
                        ${data.topSellers.length > 0 ? `
                            <div style="display: flex; flex-direction: column; gap: var(--spacing-sm);">
                                ${data.topSellers.map((seller, idx) => {
                                    const maxSeller = data.topSellers[0].total;
                                    const width = maxSeller > 0 ? (seller.total / maxSeller * 100) : 0;
                                    return `
                                        <div>
                                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                                                <div>
                                                    <span style="font-weight: 600; color: var(--color-primary); font-size: 10px;">#${idx + 1}</span>
                                                    <span style="margin-left: var(--spacing-xs); font-weight: 600; font-size: 11px;">${seller.name}</span>
                                                </div>
                                                <span style="font-size: 12px; font-weight: 600;">${Utils.formatCurrency(seller.total)}</span>
                                            </div>
                                            <div style="width: 100%; height: 18px; background: var(--color-border-light); border-radius: var(--radius-full); overflow: hidden; position: relative;">
                                                <div style="width: ${width}%; height: 100%; background: linear-gradient(90deg, var(--color-primary) 0%, var(--color-accent) 100%); transition: width 0.5s;"></div>
                                                <div style="position: absolute; right: var(--spacing-xs); top: 50%; transform: translateY(-50%); font-size: 9px; color: var(--color-text-secondary);">
                                                    ${seller.count} ventas
                                                </div>
                                            </div>
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        ` : '<p style="text-align: center; color: var(--color-text-secondary); padding: var(--spacing-md); font-size: 11px;">No hay datos</p>'}
                    </div>
                </div>
                
                <div>
                    <h3>Top Productos del Mes</h3>
                    <div style="background: var(--color-bg-secondary); padding: var(--spacing-md); border-radius: var(--radius-md); margin-top: var(--spacing-sm);">
                        ${data.topProducts.length > 0 ? `
                            <div style="display: flex; flex-direction: column; gap: var(--spacing-sm);">
                                ${data.topProducts.map((product, idx) => {
                                    const maxProduct = data.topProducts[0].revenue;
                                    const width = maxProduct > 0 ? (product.revenue / maxProduct * 100) : 0;
                                    return `
                                        <div>
                                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                                                <div>
                                                    <span style="font-weight: 600; color: var(--color-accent); font-size: 10px;">#${idx + 1}</span>
                                                    <span style="margin-left: var(--spacing-xs); font-weight: 600; font-size: 11px;">${product.name}</span>
                                                </div>
                                                <span style="font-size: 12px; font-weight: 600;">${Utils.formatCurrency(product.revenue)}</span>
                                            </div>
                                            <div style="width: 100%; height: 18px; background: var(--color-border-light); border-radius: var(--radius-full); overflow: hidden; position: relative;">
                                                <div style="width: ${width}%; height: 100%; background: linear-gradient(90deg, var(--color-accent) 0%, var(--color-primary) 100%); transition: width 0.5s;"></div>
                                                <div style="position: absolute; right: var(--spacing-xs); top: 50%; transform: translateY(-50%); font-size: 9px; color: var(--color-text-secondary);">
                                                    ${product.qty} unidades
                                                </div>
                                            </div>
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        ` : '<p style="text-align: center; color: var(--color-text-secondary); padding: var(--spacing-md); font-size: 11px;">No hay datos</p>'}
                    </div>
                </div>
            </div>
            
            <!-- Resumen Financiero -->
            <div class="dashboard-section">
                <h3>Resumen Financiero del Mes</h3>
                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--spacing-sm); margin-top: var(--spacing-sm);">
                    <div style="background: var(--color-bg-secondary); padding: var(--spacing-sm); border-radius: var(--radius-md); text-align: center;">
                        <div style="font-size: 9px; color: var(--color-text-secondary); margin-bottom: var(--spacing-xs);">Ingresos</div>
                        <div style="font-size: 16px; font-weight: 700; color: var(--color-success);">${Utils.formatCurrency(data.monthTotal)}</div>
                    </div>
                    <div style="background: var(--color-bg-secondary); padding: var(--spacing-sm); border-radius: var(--radius-md); text-align: center;">
                        <div style="font-size: 9px; color: var(--color-text-secondary); margin-bottom: var(--spacing-xs);">Costos</div>
                        <div style="font-size: 16px; font-weight: 700; color: var(--color-danger);">${Utils.formatCurrency(data.totalCosts)}</div>
                    </div>
                    <div style="background: var(--color-bg-secondary); padding: var(--spacing-sm); border-radius: var(--radius-md); text-align: center;">
                        <div style="font-size: 9px; color: var(--color-text-secondary); margin-bottom: var(--spacing-xs);">Utilidad</div>
                        <div style="font-size: 16px; font-weight: 700; color: ${data.profit >= 0 ? 'var(--color-success)' : 'var(--color-danger)'};">
                            ${Utils.formatCurrency(data.profit)}
                        </div>
                    </div>
                    <div style="background: var(--color-bg-secondary); padding: var(--spacing-sm); border-radius: var(--radius-md); text-align: center;">
                        <div style="font-size: 9px; color: var(--color-text-secondary); margin-bottom: var(--spacing-xs);">Margen</div>
                        <div style="font-size: 16px; font-weight: 700; color: ${data.profitMargin >= 0 ? 'var(--color-success)' : 'var(--color-danger)'};">
                            ${data.profitMargin.toFixed(1)}%
                        </div>
                    </div>
                </div>
            </div>

            <!-- Alertas Inteligentes -->
            <div class="dashboard-section" id="dashboard-alerts-section">
                <h3>Alertas y Recomendaciones</h3>
                <div id="dashboard-alerts-content" style="background: var(--color-bg-secondary); padding: var(--spacing-md); border-radius: var(--radius-md); margin-top: var(--spacing-sm);">
                    ${this.generateAlertsSync(data)}
                </div>
            </div>
        `;
    },
    
    async refresh() {
        this.initialized = false;
        await this.init();
        Utils.showNotification('Dashboard actualizado', 'success');
    },
    
    async exportDashboard() {
        try {
            // Recargar datos para exportación completa
            await this.loadDashboard();
            
            const today = new Date();
            const allSales = await DB.getAll('sales') || [];
            const todaySales = allSales.filter(s => {
                const saleDate = new Date(s.created_at);
                return saleDate.toDateString() === today.toDateString();
            });
            
            const dashboardData = {
                fecha: Utils.formatDate(new Date(), 'DD/MM/YYYY'),
                ventas_hoy: todaySales.reduce((sum, s) => sum + (s.total || 0), 0),
                tickets_hoy: todaySales.length,
                ventas_mes: allSales.filter(s => {
                    const saleDate = new Date(s.created_at);
                    return saleDate.getMonth() === today.getMonth() && saleDate.getFullYear() === today.getFullYear();
                }).reduce((sum, s) => sum + (s.total || 0), 0)
            };
            
            const format = prompt('Formato de exportación:\n1. PDF\n2. Excel', '1');
            const date = Utils.formatDate(new Date(), 'YYYYMMDD');
            
            if (format === '1') {
                Utils.exportToPDF([dashboardData], `dashboard_${date}.pdf`, 'Dashboard');
            } else if (format === '2') {
                Utils.exportToExcel([dashboardData], `dashboard_${date}.xlsx`, 'Dashboard');
            }
        } catch (e) {
            console.error('Error exporting dashboard:', e);
            Utils.showNotification('Error al exportar', 'error');
        }
    },

    // Predicción de ventas basada en tendencias
    async predictSales() {
        const sales = await DB.getAll('sales');
        const completedSales = sales.filter(s => s.status === 'completada');
        
        // Calcular promedio de ventas por día de la semana
        const dayOfWeekAverages = {};
        completedSales.forEach(sale => {
            const saleDate = new Date(sale.created_at);
            const dayName = saleDate.getDay();
            if (!dayOfWeekAverages[dayName]) {
                dayOfWeekAverages[dayName] = { total: 0, count: 0 };
            }
            dayOfWeekAverages[dayName].total += sale.total || 0;
            dayOfWeekAverages[dayName].count += 1;
        });

        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowDay = tomorrow.getDay();
        const tomorrowAvg = dayOfWeekAverages[tomorrowDay] ? 
            dayOfWeekAverages[tomorrowDay].total / dayOfWeekAverages[tomorrowDay].count : 0;

        // Calcular promedio semanal
        const weeklyTotal = Object.values(dayOfWeekAverages).reduce((sum, day) => sum + day.total, 0);
        const weeklyAvg = weeklyTotal / 7;

        // Calcular promedio mensual
        const monthlySales = {};
        completedSales.forEach(sale => {
            const date = new Date(sale.created_at);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            if (!monthlySales[monthKey]) {
                monthlySales[monthKey] = { total: 0, count: 0 };
            }
            monthlySales[monthKey].total += sale.total || 0;
            monthlySales[monthKey].count += 1;
        });

        const monthlyValues = Object.values(monthlySales);
        const avgMonthly = monthlyValues.length > 0 ?
            monthlyValues.reduce((sum, m) => sum + m.total, 0) / monthlyValues.length : 0;

        return {
            tomorrow: tomorrowAvg,
            nextWeek: weeklyAvg * 7,
            nextMonth: avgMonthly,
            confidence: completedSales.length > 30 ? 85 : completedSales.length > 10 ? 70 : 50
        };
    },

    async showPredictions() {
        const predictions = await this.predictSales();
        
        const body = `
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--spacing-md);">
                <div class="kpi-card">
                    <div class="kpi-label">Predicción Mañana</div>
                    <div class="kpi-value" style="font-size: 20px;">${Utils.formatCurrency(predictions.tomorrow)}</div>
                    <div style="font-size: 11px; color: var(--color-text-secondary); margin-top: var(--spacing-xs);">
                        Confianza: ${predictions.confidence}%
                    </div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-label">Predicción Próxima Semana</div>
                    <div class="kpi-value" style="font-size: 20px;">${Utils.formatCurrency(predictions.nextWeek)}</div>
                    <div style="font-size: 11px; color: var(--color-text-secondary); margin-top: var(--spacing-xs);">
                        Basado en promedios históricos
                    </div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-label">Predicción Próximo Mes</div>
                    <div class="kpi-value" style="font-size: 20px;">${Utils.formatCurrency(predictions.nextMonth)}</div>
                    <div style="font-size: 11px; color: var(--color-text-secondary); margin-top: var(--spacing-xs);">
                        Tendencia mensual
                    </div>
                </div>
            </div>
            <div style="margin-top: var(--spacing-md); padding: var(--spacing-md); background: var(--color-bg-secondary); border-radius: var(--radius-md);">
                <p style="font-size: 12px; color: var(--color-text-secondary); margin: 0;">
                    <i class="fas fa-info-circle"></i> Las predicciones se basan en análisis de tendencias históricas y pueden variar según condiciones del mercado.
                </p>
            </div>
        `;

        UI.showModal('Predicciones de Ventas', body, [
            { text: 'Cerrar', class: 'btn-primary', onclick: () => UI.closeModal() }
        ]);
    },

    generateAlertsSync(data) {
        const alerts = [];
        
        // Alerta de margen bajo
        if (data.profitMargin < 10 && data.profitMargin > 0) {
            alerts.push({
                type: 'warning',
                icon: 'fa-exclamation-triangle',
                title: 'Margen de Utilidad Bajo',
                message: `El margen actual es ${data.profitMargin.toFixed(1)}%. Considera revisar costos o ajustar precios.`
            });
        }

        // Alerta de pérdidas
        if (data.profit < 0) {
            alerts.push({
                type: 'danger',
                icon: 'fa-times-circle',
                title: 'Pérdidas Detectadas',
                message: `Hay pérdidas de ${Utils.formatCurrency(Math.abs(data.profit))}. Revisa costos urgentemente.`
            });
        }

        // Alerta de inventario bajo
        if (data.availableItems < 20) {
            alerts.push({
                type: 'warning',
                icon: 'fa-box',
                title: 'Inventario Bajo',
                message: `Solo quedan ${data.availableItems} piezas disponibles. Considera reponer inventario.`
            });
        }

        // Alerta de ventas bajas
        if (data.todayTickets === 0) {
            alerts.push({
                type: 'info',
                icon: 'fa-info-circle',
                title: 'Sin Ventas Hoy',
                message: 'No se han registrado ventas hoy. Revisa estrategias de ventas.'
            });
        }

        // Alerta positiva de buen desempeño
        if (data.profitMargin > 30 && data.profit > 0) {
            alerts.push({
                type: 'success',
                icon: 'fa-check-circle',
                title: 'Excelente Desempeño',
                message: `Margen de ${data.profitMargin.toFixed(1)}% y utilidad de ${Utils.formatCurrency(data.profit)}. ¡Sigue así!`
            });
        }

        if (alerts.length === 0) {
            return '<p style="text-align: center; color: var(--color-success); padding: var(--spacing-md);"><i class="fas fa-check-circle"></i> Todo en orden</p>';
        }

        return alerts.map(alert => `
            <div style="padding: var(--spacing-sm); margin-bottom: var(--spacing-xs); background: var(--color-bg); border-left: 4px solid var(--color-${alert.type}); border-radius: var(--radius-sm);">
                <div style="display: flex; align-items: start; gap: var(--spacing-sm);">
                    <i class="fas ${alert.icon}" style="color: var(--color-${alert.type}); font-size: 18px; margin-top: 2px;"></i>
                    <div style="flex: 1;">
                        <div style="font-weight: 600; font-size: 12px; margin-bottom: 4px;">${alert.title}</div>
                        <div style="font-size: 11px; color: var(--color-text-secondary);">${alert.message}</div>
                    </div>
                </div>
            </div>
        `).join('');
    }
};

window.Dashboard = Dashboard;

window.Dashboard = Dashboard;

