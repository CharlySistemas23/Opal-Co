// Profit Calculation Module - Cálculo de Utilidad Diaria

const ProfitCalculator = {
    /**
     * Calcula la utilidad diaria antes de impuestos para una fecha y tienda específica
     * @param {string} dateYYYYMMDD - Fecha en formato YYYY-MM-DD
     * @param {string} branchId - ID de la tienda
     * @returns {Promise<Object>} Objeto con todos los cálculos y el reporte guardado
     */
    async calculateDailyProfit(dateYYYYMMDD, branchId) {
        try {
            // Validar que branchId exista
            if (!branchId) {
                throw new Error('branchId es requerido para calcular utilidad');
            }
            const branch = await DB.get('catalog_branches', branchId);
            if (!branch) {
                throw new Error(`Sucursal ${branchId} no encontrada`);
            }

            // 1. REVENUE: Suma de ventas completadas del día (filtradas por sucursal)
            const allSales = await DB.getAll('sales', null, null, { 
                filterByBranch: false, // Desactivar filtrado automático porque ya filtramos manualmente
                branchIdField: 'branch_id' 
            }) || [];
            const daySales = allSales.filter(s => {
                if (!s.created_at) return false;
                const saleDate = s.created_at.split('T')[0];
                return saleDate === dateYYYYMMDD && 
                       s.branch_id === branchId && 
                       s.status === 'completada';
            });
            
            const revenueSalesTotal = daySales.reduce((sum, s) => sum + (s.total || 0), 0);

            // 2. COGS: Costo de productos vendidos (filtrados por sucursal)
            let cogsTotal = 0;
            const saleItems = await DB.getAll('sale_items') || [];
            const inventoryItems = await DB.getAll('inventory_items', null, null, { 
                filterByBranch: false, // Desactivar porque los items pueden estar en diferentes sucursales
                branchIdField: 'branch_id' 
            }) || [];
            
            for (const sale of daySales) {
                const items = saleItems.filter(si => si.sale_id === sale.id);
                for (const item of items) {
                    const invItem = inventoryItems.find(i => i.id === item.item_id);
                    if (invItem && invItem.cost) {
                        cogsTotal += (invItem.cost || 0) * (item.quantity || 1);
                    } else {
                        console.warn(`Costo faltante para item ${item.item_id} en venta ${sale.id}`);
                    }
                }
            }

            // 3. COMISIONES: Vendedores y guías
            let commissionsSellersTotal = 0;
            let commissionsGuidesTotal = 0;
            
            const sellers = await DB.getAll('catalog_sellers') || [];
            const guides = await DB.getAll('catalog_guides') || [];
            const commissionRules = await DB.getAll('commission_rules') || [];
            
            // Validar que todas las ventas tengan branch_id
            const salesWithoutBranch = daySales.filter(s => !s.branch_id);
            if (salesWithoutBranch.length > 0) {
                console.warn(`${salesWithoutBranch.length} ventas sin branch_id encontradas. Asignando branch_id automáticamente...`);
                for (const sale of salesWithoutBranch) {
                    sale.branch_id = branchId;
                    await DB.put('sales', sale);
                }
            }

            for (const sale of daySales) {
                // Comisión vendedor
                if (sale.seller_id) {
                    // Si ya está calculada en la venta, usarla
                    if (sale.seller_commission !== undefined) {
                        commissionsSellersTotal += sale.seller_commission;
                    } else {
                        // Calcular con reglas
                        const seller = sellers.find(s => s.id === sale.seller_id);
                        if (seller) {
                            const rule = commissionRules.find(r => 
                                r.entity_type === 'seller' && r.entity_id === seller.id
                            );
                            if (rule) {
                                const commission = Utils.calculateCommission(
                                    sale.total, 
                                    rule.discount_pct, 
                                    rule.multiplier
                                );
                                commissionsSellersTotal += commission;
                                
                                // Guardar en la venta para futuras consultas
                                sale.seller_commission = commission;
                                await DB.put('sales', sale);
                            }
                        }
                    }
                }

                // Comisión guía
                if (sale.guide_id) {
                    if (sale.guide_commission !== undefined) {
                        commissionsGuidesTotal += sale.guide_commission;
                    } else {
                        const guide = guides.find(g => g.id === sale.guide_id);
                        if (guide) {
                            const rule = commissionRules.find(r => 
                                r.entity_type === 'guide' && r.entity_id === guide.id
                            );
                            if (rule) {
                                const commission = Utils.calculateCommission(
                                    sale.total, 
                                    rule.discount_pct, 
                                    rule.multiplier
                                );
                                commissionsGuidesTotal += commission;
                                
                                sale.guide_commission = commission;
                                await DB.put('sales', sale);
                            }
                        }
                    }
                }
            }

            // 4. LLEGADAS: Costo de llegadas por agencia (solo llegadas válidas: pasajeros > 0 y unidades > 0)
            // 4. LLEGADAS: Costos de llegadas del día (filtradas por sucursal)
            const arrivals = await DB.query('agency_arrivals', 'date', dateYYYYMMDD, { 
                filterByBranch: false, // Desactivar porque ya filtramos manualmente
                branchIdField: 'branch_id' 
            }) || [];
            const dayArrivals = arrivals.filter(a => a.branch_id === branchId);
            
            // Validar que todas las llegadas tengan branch_id
            const arrivalsWithoutBranch = arrivals.filter(a => !a.branch_id && a.date === dateYYYYMMDD);
            if (arrivalsWithoutBranch.length > 0) {
                console.warn(`${arrivalsWithoutBranch.length} llegadas sin branch_id encontradas. Asignando branch_id automáticamente...`);
                for (const arrival of arrivalsWithoutBranch) {
                    arrival.branch_id = branchId;
                    await DB.put('agency_arrivals', arrival);
                }
            }
            
            // Solo llegadas válidas: pasajeros > 0 y unidades > 0
            const branchArrivals = dayArrivals.filter(a => 
                a.passengers > 0 &&
                a.units > 0
            );
            
            const arrivalsTotal = branchArrivals.reduce((sum, a) => sum + (a.arrival_fee || 0), 0);
            const passengersTotal = branchArrivals.reduce((sum, a) => sum + (a.passengers || 0), 0);

            // 5. COSTOS OPERATIVOS: Costos del día (filtrados por sucursal)
            const allCosts = await DB.getAll('cost_entries', null, null, { 
                filterByBranch: false, // Desactivar porque ya filtramos manualmente
                branchIdField: 'branch_id' 
            }) || [];
            
            // Costos mensuales prorrateados
            const monthlyCosts = allCosts.filter(c => {
                const costDate = new Date(c.date || c.created_at);
                const targetDate = new Date(dateYYYYMMDD);
                return c.branch_id === branchId && 
                       c.period_type === 'monthly' && 
                       c.recurring === true &&
                       costDate.getMonth() === targetDate.getMonth() &&
                       costDate.getFullYear() === targetDate.getFullYear();
            });
            
            for (const cost of monthlyCosts) {
                const costDate = new Date(cost.date || cost.created_at);
                const daysInMonth = new Date(costDate.getFullYear(), costDate.getMonth() + 1, 0).getDate();
                fixedCostsDaily += (cost.amount || 0) / daysInMonth;
            }

            // Costos semanales prorrateados
            const weeklyCosts = allCosts.filter(c => {
                const costDate = new Date(c.date || c.created_at);
                const targetDate = new Date(dateYYYYMMDD);
                return c.branch_id === branchId && 
                       c.period_type === 'weekly' && 
                       c.recurring === true &&
                       this.isSameWeek(costDate, targetDate);
            });
            
            for (const cost of weeklyCosts) {
                fixedCostsDaily += (cost.amount || 0) / 7;
            }

            // Costos anuales prorrateados
            const annualCosts = allCosts.filter(c => {
                const costDate = new Date(c.date || c.created_at);
                const targetDate = new Date(dateYYYYMMDD);
                return c.branch_id === branchId && 
                       c.period_type === 'annual' && 
                       c.recurring === true &&
                       costDate.getFullYear() === targetDate.getFullYear();
            });
            
            for (const cost of annualCosts) {
                const daysInYear = this.isLeapYear(new Date(dateYYYYMMDD).getFullYear()) ? 366 : 365;
                fixedCostsDaily += (cost.amount || 0) / daysInYear;
            }

            // Costos variables/diarios del día específico
            const variableCostsDaily = allCosts
                .filter(c => {
                    const costDate = c.date || c.created_at;
                    const costDateStr = costDate.split('T')[0];
                    return costDateStr === dateYYYYMMDD && 
                           c.branch_id === branchId &&
                           (c.period_type === 'one_time' || c.period_type === 'daily' || !c.period_type);
                })
                .reduce((sum, c) => sum + (c.amount || 0), 0);

            // 6. UTILIDAD OPERATIVA ANTES DE IMPUESTOS
            const profitBeforeTaxes = revenueSalesTotal - 
                                     (cogsTotal + 
                                      commissionsSellersTotal + 
                                      commissionsGuidesTotal + 
                                      arrivalsTotal + 
                                      fixedCostsDaily + 
                                      variableCostsDaily);

            // 7. MARGEN
            const profitMargin = revenueSalesTotal > 0 
                ? (profitBeforeTaxes / revenueSalesTotal) * 100 
                : 0;

            // 8. TIPO DE CAMBIO DEL DÍA (usar el tipo de cambio guardado para esa fecha)
            const exchangeRates = await ExchangeRates.getExchangeRate(dateYYYYMMDD);
            const exchangeRate = exchangeRates.usd;

            // 9. GUARDAR REPORTE (idempotente por date+branch_id)
            const existingReports = await DB.query('daily_profit_reports', 'date', dateYYYYMMDD, { 
                filterByBranch: false, // Desactivar porque ya filtramos manualmente
                branchIdField: 'branch_id' 
            }) || [];
            const existingReport = existingReports.find(r => r.branch_id === branchId);

            const report = {
                id: existingReport?.id || Utils.generateId(),
                date: dateYYYYMMDD,
                branch_id: branchId,
                revenue_sales_total: revenueSalesTotal,
                cogs_total: cogsTotal,
                commissions_sellers_total: commissionsSellersTotal,
                commissions_guides_total: commissionsGuidesTotal,
                arrivals_total: arrivalsTotal,
                fixed_costs_daily: fixedCostsDaily,
                variable_costs_daily: variableCostsDaily,
                profit_before_taxes: profitBeforeTaxes,
                profit_margin: profitMargin,
                passengers_total: passengersTotal,
                exchange_rate: exchangeRate,
                created_at: existingReport?.created_at || new Date().toISOString(),
                updated_at: new Date().toISOString(),
                sync_status: 'pending'
            };

            await DB.put('daily_profit_reports', report);
            await SyncManager.addToQueue('daily_profit_report', report.id);

            return {
                report,
                calculations: {
                    revenue: revenueSalesTotal,
                    cogs: cogsTotal,
                    commissionsSellers: commissionsSellersTotal,
                    commissionsGuides: commissionsGuidesTotal,
                    arrivals: arrivalsTotal,
                    fixedCosts: fixedCostsDaily,
                    variableCosts: variableCostsDaily,
                    profit: profitBeforeTaxes,
                    margin: profitMargin,
                    passengers: passengersTotal
                }
            };
        } catch (e) {
            console.error('Error calculating daily profit:', e);
            throw e;
        }
    },

    /**
     * Verifica si dos fechas están en la misma semana
     */
    isSameWeek(date1, date2) {
        const d1 = new Date(date1);
        const d2 = new Date(date2);
        d1.setHours(0, 0, 0, 0);
        d2.setHours(0, 0, 0, 0);
        
        const day1 = d1.getDay();
        const day2 = d2.getDay();
        const diff1 = d1.getDate() - day1;
        const diff2 = d2.getDate() - day2;
        
        const week1 = new Date(d1.setDate(diff1));
        const week2 = new Date(d2.setDate(diff2));
        
        return week1.getTime() === week2.getTime();
    },

    /**
     * Verifica si un año es bisiesto
     */
    isLeapYear(year) {
        return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
    },

    /**
     * Obtiene un reporte de utilidad diaria existente
     */
    async getDailyProfitReport(dateYYYYMMDD, branchId) {
        const reports = await DB.query('daily_profit_reports', 'date', dateYYYYMMDD);
        return reports.find(r => r.branch_id === branchId) || null;
    },

    /**
     * Obtiene reportes de utilidad en un rango de fechas
     */
    async getProfitReportsRange(dateFrom, dateTo, branchId = null) {
        const allReports = await DB.getAll('daily_profit_reports') || [];
        return allReports.filter(r => {
            const reportDate = r.date;
            const matchesDate = reportDate >= dateFrom && reportDate <= dateTo;
            const matchesBranch = !branchId || r.branch_id === branchId;
            return matchesDate && matchesBranch;
        }).sort((a, b) => a.date.localeCompare(b.date));
    }
};

window.ProfitCalculator = ProfitCalculator;

