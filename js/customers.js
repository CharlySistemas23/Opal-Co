// Customers Module (CRM)

const Customers = {
    initialized: false,
    
    async init() {
        if (this.initialized) return;
        this.setupEventListeners();
        await this.loadCustomers();
        this.initialized = true;
    },

    setupEventListeners() {
        // Listen for demo data loaded event
        window.addEventListener('demo-data-loaded', () => {
            if (this.initialized) {
                this.loadCustomers();
            }
        });
        
        const content = document.getElementById('module-content');
        if (!content) return;

        content.innerHTML = `
            <div class="module-actions" style="margin-bottom: var(--spacing-md);">
                <button class="btn-primary" id="customer-add-btn">Nuevo Cliente</button>
                <button class="btn-secondary" id="customer-export-btn">Exportar</button>
            </div>
            <div class="inventory-filters" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
                <div class="form-group">
                    <label>Búsqueda</label>
                    <input type="text" id="customer-search" class="form-input" placeholder="Nombre, email, teléfono...">
                </div>
                <div class="form-group">
                    <label>Segmento</label>
                    <select id="customer-segment-filter" class="form-select">
                        <option value="">Todos</option>
                        <option value="VIP">VIP</option>
                        <option value="Premium">Premium</option>
                        <option value="Regular">Regular</option>
                        <option value="Nuevo">Nuevo</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>País</label>
                    <select id="customer-country-filter" class="form-select">
                        <option value="">Todos</option>
                        <option value="México">México</option>
                        <option value="Estados Unidos">Estados Unidos</option>
                        <option value="Canadá">Canadá</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Ordenar por</label>
                    <select id="customer-sort" class="form-select">
                        <option value="value">Valor Total</option>
                        <option value="purchases">Número de Compras</option>
                        <option value="recent">Más Recientes</option>
                        <option value="name">Nombre</option>
                    </select>
                </div>
            </div>
            <div id="customers-list" class="customers-list"></div>
        `;

        document.getElementById('customer-add-btn')?.addEventListener('click', () => this.showAddForm());
        document.getElementById('customer-export-btn')?.addEventListener('click', () => this.exportCustomers());
        document.getElementById('customer-search')?.addEventListener('input', Utils.debounce(() => this.loadCustomers(), 300));
        document.getElementById('customer-segment-filter')?.addEventListener('change', () => this.loadCustomers());
        document.getElementById('customer-country-filter')?.addEventListener('change', () => this.loadCustomers());
        document.getElementById('customer-sort')?.addEventListener('change', () => this.loadCustomers());
    },

    async loadCustomers() {
        try {
            let customers = await DB.getAll('customers');
            
            const search = document.getElementById('customer-search')?.value.toLowerCase() || '';
            if (search) {
                customers = customers.filter(c => 
                    c.name?.toLowerCase().includes(search) ||
                    c.lastname?.toLowerCase().includes(search) ||
                    c.email?.toLowerCase().includes(search) ||
                    c.phone?.includes(search) ||
                    c.tags?.toLowerCase().includes(search)
                );
            }

            // Aplicar filtros
            const segmentFilter = document.getElementById('customer-segment-filter')?.value;
            if (segmentFilter) {
                customers = customers.filter(c => c.segment === segmentFilter);
            }

            const countryFilter = document.getElementById('customer-country-filter')?.value;
            if (countryFilter) {
                customers = customers.filter(c => c.country === countryFilter);
            }

            // Ordenar
            const sortBy = document.getElementById('customer-sort')?.value || 'value';
            const sales = await DB.getAll('sales') || [];
            const customersWithStats = await Promise.all(customers.map(async customer => {
                const customerSales = sales.filter(s => s.customer_id === customer.id && s.status === 'completada');
                const totalSpent = customerSales.reduce((sum, s) => sum + (s.total || 0), 0);
                const lastPurchase = customerSales.length > 0 
                    ? customerSales.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0]
                    : null;
                
                return {
                    ...customer,
                    purchaseCount: customerSales.length,
                    totalSpent,
                    lastPurchaseDate: lastPurchase ? lastPurchase.created_at : null,
                    avgPurchase: customerSales.length > 0 ? totalSpent / customerSales.length : 0
                };
            }));

            // Aplicar ordenamiento
            if (sortBy === 'value') {
                customersWithStats.sort((a, b) => b.totalSpent - a.totalSpent);
            } else if (sortBy === 'purchases') {
                customersWithStats.sort((a, b) => b.purchaseCount - a.purchaseCount);
            } else if (sortBy === 'recent') {
                customersWithStats.sort((a, b) => {
                    const dateA = a.lastPurchaseDate ? new Date(a.lastPurchaseDate) : new Date(0);
                    const dateB = b.lastPurchaseDate ? new Date(b.lastPurchaseDate) : new Date(0);
                    return dateB - dateA;
                });
            } else if (sortBy === 'name') {
                customersWithStats.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
            }

            this.displayCustomers(customersWithStats);
        } catch (e) {
            console.error('Error loading customers:', e);
            Utils.showNotification('Error al cargar clientes', 'error');
        }
    },

    async displayCustomers(customers) {
        const container = document.getElementById('customers-list');
        if (!container) return;

        if (customers.length === 0) {
            container.innerHTML = '<p style="text-align: center; padding: 40px;">No hay clientes</p>';
            return;
        }
        
        // Obtener estadísticas de ventas para cada cliente
        const sales = await DB.getAll('sales') || [];
        const customersWithStats = await Promise.all(customers.map(async customer => {
            const customerSales = sales.filter(s => s.customer_id === customer.id && s.status === 'completada');
            const totalSpent = customerSales.reduce((sum, s) => sum + (s.total || 0), 0);
            const lastPurchase = customerSales.length > 0 
                ? customerSales.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0]
                : null;
            
            return {
                ...customer,
                purchaseCount: customerSales.length,
                totalSpent,
                lastPurchaseDate: lastPurchase ? lastPurchase.created_at : null,
                avgPurchase: customerSales.length > 0 ? totalSpent / customerSales.length : 0
            };
        }));
        
        // Mostrar estadísticas generales
        await this.displayCustomerStats(customersWithStats);

        container.innerHTML = customersWithStats.map(customer => `
            <div class="inventory-card" data-customer-id="${customer.id}">
                <div class="inventory-card-info">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: var(--spacing-sm);">
                        <div style="flex: 1;">
                            <h4 style="margin: 0 0 4px 0;">${customer.name || 'Sin nombre'} ${customer.lastname || ''}</h4>
                            ${customer.segment ? `<span class="status-badge" style="background: ${customer.segment === 'VIP' ? 'var(--color-success)' : customer.segment === 'Premium' ? 'var(--color-info)' : 'var(--color-text-secondary)'}; color: white; font-size: 9px; padding: 2px 8px; border-radius: 12px;">${customer.segment}</span>` : ''}
                        </div>
                        ${customer.totalSpent > 0 ? `
                            <div style="text-align: right;">
                                <div style="font-size: 18px; font-weight: 700; color: var(--color-primary);">
                                    ${Utils.formatCurrency(customer.totalSpent)}
                                </div>
                                <div style="font-size: 11px; color: var(--color-text-secondary);">
                                    ${customer.purchaseCount} compras
                                </div>
                            </div>
                        ` : ''}
                    </div>
                    <p style="font-size: 12px;"><strong>Email:</strong> ${customer.email || 'N/A'}</p>
                    <p style="font-size: 12px;"><strong>Teléfono:</strong> ${customer.phone || 'N/A'}</p>
                    ${customer.country ? `<p style="font-size: 12px;"><strong>Ubicación:</strong> ${customer.city ? customer.city + ', ' : ''}${customer.country}</p>` : ''}
                    ${customer.lastPurchaseDate ? `
                        <p style="font-size: 11px; color: var(--color-text-secondary); margin-top: 4px;">
                            <i class="fas fa-calendar"></i> Última compra: ${Utils.formatDate(customer.lastPurchaseDate, 'DD/MM/YYYY')}
                            ${this.daysSinceLastPurchase(customer.lastPurchaseDate) > 90 ? 
                                `<span style="color: var(--color-warning); margin-left: 8px;"><i class="fas fa-exclamation-triangle"></i> Inactivo</span>` : ''}
                        </p>
                    ` : '<p style="font-size: 11px; color: var(--color-text-secondary);"><i class="fas fa-info-circle"></i> Cliente nuevo</p>'}
                    ${customer.tags ? `<p style="font-size: 11px; margin-top: 4px;">${customer.tags.split(',').map(t => `<span style="background: var(--color-bg-secondary); padding: 2px 6px; border-radius: 10px; margin-right: 4px; font-size: 9px;">${t.trim()}</span>`).join('')}</p>` : ''}
                    ${customer.notes ? `<p style="font-size: 11px; color: var(--color-text-secondary); margin-top: 4px;"><strong>Notas:</strong> ${customer.notes.substring(0, 50)}${customer.notes.length > 50 ? '...' : ''}</p>` : ''}
                    <div style="margin-top: 10px; display: flex; gap: 5px;">
                        <button class="btn-secondary" onclick="window.Customers.showCustomer360('${customer.id}')" style="flex: 1; padding: 6px; font-size: 11px;"><i class="fas fa-chart-line"></i> 360°</button>
                        <button class="btn-secondary" onclick="window.Customers.showDetails('${customer.id}')" style="flex: 1; padding: 6px; font-size: 11px;">Ver</button>
                        <button class="btn-secondary" onclick="window.Customers.editCustomer('${customer.id}')" style="flex: 1; padding: 6px; font-size: 11px;">Editar</button>
                    </div>
                </div>
            </div>
        `).join('');
    },
    
    async displayCustomerStats(customers) {
        let statsContainer = document.getElementById('customers-stats');
        if (!statsContainer) {
            const moduleContent = document.getElementById('module-content');
            if (moduleContent) {
                statsContainer = document.createElement('div');
                statsContainer.id = 'customers-stats';
                statsContainer.style.marginBottom = 'var(--spacing-xl)';
                const listContainer = document.getElementById('customers-list');
                if (listContainer && listContainer.parentNode) {
                    listContainer.parentNode.insertBefore(statsContainer, listContainer);
                }
            }
        }
        
        if (!statsContainer) return;
        
        const totalCustomers = customers.length;
        const activeCustomers = customers.filter(c => c.purchaseCount > 0).length;
        const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0);
        const avgCustomerValue = activeCustomers > 0 ? totalRevenue / activeCustomers : 0;
        
        // Top clientes
        const topCustomers = customers
            .filter(c => c.totalSpent > 0)
            .slice(0, 5);
        
        const maxCustomerValue = Math.max(...topCustomers.map(c => c.totalSpent), 1);
        
        statsContainer.innerHTML = `
            <div class="dashboard-grid" style="margin-bottom: var(--spacing-lg);">
                <div class="kpi-card">
                    <div class="kpi-label">Total Clientes</div>
                    <div class="kpi-value">${totalCustomers}</div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-label">Clientes Activos</div>
                    <div class="kpi-value">${activeCustomers}</div>
                    <div style="font-size: 9px; color: var(--color-text-secondary); margin-top: var(--spacing-xs);">
                        ${totalCustomers > 0 ? ((activeCustomers / totalCustomers) * 100).toFixed(1) : 0}% del total
                    </div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-label">Ingresos Totales</div>
                    <div class="kpi-value">${Utils.formatCurrency(totalRevenue)}</div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-label">Valor Promedio</div>
                    <div class="kpi-value">${Utils.formatCurrency(avgCustomerValue)}</div>
                </div>
            </div>
            
            ${topCustomers.length > 0 ? `
                <div class="dashboard-section">
                    <h3>Top Clientes</h3>
                    <div style="background: var(--color-bg-secondary); padding: var(--spacing-md); border-radius: var(--radius-md); margin-top: var(--spacing-sm);">
                        ${topCustomers.map((customer, idx) => {
                            const width = maxCustomerValue > 0 ? (customer.totalSpent / maxCustomerValue * 100) : 0;
                            return `
                                <div style="margin-bottom: var(--spacing-sm);">
                                    <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                                        <div>
                                            <span style="font-weight: 600; color: var(--color-primary); font-size: 10px;">#${idx + 1}</span>
                                            <span style="margin-left: var(--spacing-xs); font-weight: 600; font-size: 11px;">${customer.name}</span>
                                            <div style="font-size: 9px; color: var(--color-text-secondary);">
                                                ${customer.purchaseCount} compras • Prom: ${Utils.formatCurrency(customer.avgPurchase)}
                                            </div>
                                        </div>
                                        <div style="font-size: 14px; font-weight: 600;">
                                            ${Utils.formatCurrency(customer.totalSpent)}
                                        </div>
                                    </div>
                                    <div style="width: 100%; height: 18px; background: var(--color-border-light); border-radius: var(--radius-full); overflow: hidden;">
                                        <div style="width: ${width}%; height: 100%; background: linear-gradient(90deg, var(--color-primary) 0%, var(--color-accent) 100%);"></div>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            ` : ''}
        `;
    },

    async showDetails(customerId) {
        const customer = await DB.get('customers', customerId);
        if (!customer) {
            Utils.showNotification('Cliente no encontrado', 'error');
            return;
        }

        // Get sales history
        const sales = await DB.query('sales', 'customer_id', customerId);
        const completedSales = sales.filter(s => s.status === 'completada');
        const totalSpent = completedSales.reduce((sum, s) => sum + (s.total || 0), 0);
        const avgPurchase = completedSales.length > 0 ? totalSpent / completedSales.length : 0;
        const lastPurchase = completedSales.length > 0 
            ? completedSales.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0]
            : null;

        const body = `
            <div style="margin-bottom: var(--spacing-md);">
                <div class="dashboard-grid">
                    <div class="kpi-card">
                        <div class="kpi-label">Total Compras</div>
                        <div class="kpi-value">${completedSales.length}</div>
                    </div>
                    <div class="kpi-card">
                        <div class="kpi-label">Total Gastado</div>
                        <div class="kpi-value">${Utils.formatCurrency(totalSpent)}</div>
                    </div>
                    <div class="kpi-card">
                        <div class="kpi-label">Ticket Promedio</div>
                        <div class="kpi-value">${Utils.formatCurrency(avgPurchase)}</div>
                    </div>
                    ${lastPurchase ? `
                        <div class="kpi-card">
                            <div class="kpi-label">Última Compra</div>
                            <div class="kpi-value" style="font-size: 14px;">${Utils.formatDate(lastPurchase.created_at, 'DD/MM/YYYY')}</div>
                        </div>
                    ` : ''}
                </div>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                <div>
                    <h4>Información</h4>
                    <p><strong>Nombre:</strong> ${customer.name || 'N/A'}</p>
                    <p><strong>Email:</strong> ${customer.email || 'N/A'}</p>
                    <p><strong>Teléfono:</strong> ${customer.phone || 'N/A'}</p>
                    <p><strong>Notas:</strong> ${customer.notes || 'N/A'}</p>
                    <p><strong>Creado:</strong> ${Utils.formatDate(customer.created_at, 'DD/MM/YYYY')}</p>
                </div>
                <div>
                    <h4>Historial de Ventas</h4>
                    <div style="max-height: 200px; overflow-y: auto;">
                        ${sales.length === 0 ? '<p>No hay ventas</p>' : sales.map(sale => `
                            <div style="padding: var(--spacing-xs); border-bottom: 1px solid var(--color-border-light);">
                                <div style="display: flex; justify-content: space-between;">
                                    <div>
                                        <strong>${sale.folio}</strong>
                                        <div style="font-size: 11px; color: var(--color-text-secondary);">
                                            ${Utils.formatDate(sale.created_at, 'DD/MM/YYYY HH:mm')}
                                        </div>
                                    </div>
                                    <div style="text-align: right;">
                                        <div style="font-weight: 600;">${Utils.formatCurrency(sale.total)}</div>
                                        <span class="status-badge status-${sale.status}" style="font-size: 10px;">${sale.status}</span>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

        const footer = `
            <button class="btn-secondary" onclick="window.Customers.editCustomer('${customer.id}')">Editar</button>
            <button class="btn-primary" onclick="UI.closeModal()">Cerrar</button>
        `;

        UI.showModal(`Cliente: ${customer.name}`, body, footer);
    },

    async showAddForm(customerId = null) {
        const customer = customerId ? await DB.get('customers', customerId) : null;

        const body = `
            <form id="customer-form">
                <div class="form-row">
                    <div class="form-group">
                        <label>Nombre *</label>
                        <input type="text" id="customer-name" class="form-input" value="${customer?.name || ''}" required>
                    </div>
                    <div class="form-group">
                        <label>Apellidos</label>
                        <input type="text" id="customer-lastname" class="form-input" value="${customer?.lastname || ''}">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Email</label>
                        <input type="email" id="customer-email" class="form-input" value="${customer?.email || ''}">
                    </div>
                    <div class="form-group">
                        <label>Teléfono</label>
                        <input type="text" id="customer-phone" class="form-input" value="${customer?.phone || ''}" placeholder="+52 123 456 7890">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Fecha de Nacimiento</label>
                        <input type="date" id="customer-birthdate" class="form-input" value="${customer?.birthdate || ''}">
                    </div>
                    <div class="form-group">
                        <label>Segmento</label>
                        <select id="customer-segment" class="form-select">
                            <option value="">Seleccionar...</option>
                            <option value="VIP" ${customer?.segment === 'VIP' ? 'selected' : ''}>VIP</option>
                            <option value="Premium" ${customer?.segment === 'Premium' ? 'selected' : ''}>Premium</option>
                            <option value="Regular" ${customer?.segment === 'Regular' ? 'selected' : ''}>Regular</option>
                            <option value="Nuevo" ${customer?.segment === 'Nuevo' ? 'selected' : ''}>Nuevo</option>
                        </select>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>País</label>
                        <select id="customer-country" class="form-select">
                            <option value="">Seleccionar...</option>
                            <option value="México" ${customer?.country === 'México' ? 'selected' : ''}>México</option>
                            <option value="Estados Unidos" ${customer?.country === 'Estados Unidos' ? 'selected' : ''}>Estados Unidos</option>
                            <option value="Canadá" ${customer?.country === 'Canadá' ? 'selected' : ''}>Canadá</option>
                            <option value="Otro" ${customer?.country === 'Otro' ? 'selected' : ''}>Otro</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Ciudad</label>
                        <input type="text" id="customer-city" class="form-input" value="${customer?.city || ''}">
                    </div>
                </div>
                <div class="form-group">
                    <label>Dirección</label>
                    <textarea id="customer-address" class="form-textarea" rows="2">${customer?.address || ''}</textarea>
                </div>
                <div class="form-group">
                    <label>Preferencias</label>
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--spacing-xs);">
                        <label style="display: flex; align-items: center; gap: var(--spacing-xs); font-weight: normal;">
                            <input type="checkbox" id="customer-pref-email" ${customer?.preferences?.email ? 'checked' : ''}>
                            <span>Recibir emails promocionales</span>
                        </label>
                        <label style="display: flex; align-items: center; gap: var(--spacing-xs); font-weight: normal;">
                            <input type="checkbox" id="customer-pref-sms" ${customer?.preferences?.sms ? 'checked' : ''}>
                            <span>Recibir SMS</span>
                        </label>
                        <label style="display: flex; align-items: center; gap: var(--spacing-xs); font-weight: normal;">
                            <input type="checkbox" id="customer-pref-whatsapp" ${customer?.preferences?.whatsapp ? 'checked' : ''}>
                            <span>Recibir WhatsApp</span>
                        </label>
                        <label style="display: flex; align-items: center; gap: var(--spacing-xs); font-weight: normal;">
                            <input type="checkbox" id="customer-pref-newsletter" ${customer?.preferences?.newsletter ? 'checked' : ''}>
                            <span>Newsletter</span>
                        </label>
                    </div>
                </div>
                <div class="form-group">
                    <label>Notas</label>
                    <textarea id="customer-notes" class="form-textarea" rows="4" placeholder="Notas adicionales sobre el cliente...">${customer?.notes || ''}</textarea>
                </div>
                <div class="form-group">
                    <label>Etiquetas</label>
                    <input type="text" id="customer-tags" class="form-input" value="${customer?.tags || ''}" placeholder="Ej: joyería fina, anillos, exclusivo (separadas por comas)">
                    <small style="color: var(--color-text-secondary); font-size: 11px;">Separa las etiquetas con comas</small>
                </div>
            </form>
        `;

        const footer = `
            <button class="btn-secondary" onclick="UI.closeModal()">Cancelar</button>
            <button class="btn-primary" onclick="window.Customers.saveCustomer('${customerId || ''}')">Guardar</button>
        `;

        UI.showModal(customerId ? 'Editar Cliente' : 'Nuevo Cliente', body, footer);
    },

    async saveCustomer(customerId) {
        const form = document.getElementById('customer-form');
        if (!form || !form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const customer = {
            id: customerId || Utils.generateId(),
            name: document.getElementById('customer-name').value,
            lastname: document.getElementById('customer-lastname')?.value || '',
            email: document.getElementById('customer-email').value,
            phone: document.getElementById('customer-phone').value,
            birthdate: document.getElementById('customer-birthdate')?.value || null,
            segment: document.getElementById('customer-segment')?.value || '',
            country: document.getElementById('customer-country')?.value || '',
            city: document.getElementById('customer-city')?.value || '',
            address: document.getElementById('customer-address')?.value || '',
            preferences: {
                email: document.getElementById('customer-pref-email')?.checked || false,
                sms: document.getElementById('customer-pref-sms')?.checked || false,
                whatsapp: document.getElementById('customer-pref-whatsapp')?.checked || false,
                newsletter: document.getElementById('customer-pref-newsletter')?.checked || false
            },
            tags: document.getElementById('customer-tags')?.value || '',
            notes: document.getElementById('customer-notes').value,
            created_at: customerId ? (await DB.get('customers', customerId))?.created_at : new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        await DB.put('customers', customer);
        await SyncManager.addToQueue('customer', customer.id);

        Utils.showNotification(customerId ? 'Cliente actualizado' : 'Cliente agregado', 'success');
        UI.closeModal();
        this.loadCustomers();
    },

    async editCustomer(customerId) {
        UI.closeModal();
        await this.showAddForm(customerId);
    },

    async exportCustomers() {
        try {
            const customers = await DB.getAll('customers');
            const exportData = customers.map(c => ({
                Nombre: c.name,
                Email: c.email,
                Teléfono: c.phone,
                Notas: c.notes,
                'Fecha Creación': Utils.formatDate(c.created_at, 'DD/MM/YYYY')
            }));

            const format = prompt('Formato:\n1. CSV\n2. Excel\n3. PDF', '2');
            const date = Utils.formatDate(new Date(), 'YYYYMMDD');
            
            if (format === '1') {
                Utils.exportToCSV(exportData, `clientes_${date}.csv`);
            } else if (format === '2') {
                Utils.exportToExcel(exportData, `clientes_${date}.xlsx`, 'Clientes');
            } else if (format === '3') {
                Utils.exportToPDF(exportData, `clientes_${date}.pdf`, 'Clientes');
            }
        } catch (e) {
            console.error('Error exporting customers:', e);
            Utils.showNotification('Error al exportar', 'error');
        }
    },

    daysSinceLastPurchase(lastPurchaseDate) {
        const lastPurchase = new Date(lastPurchaseDate);
        const today = new Date();
        const diffTime = Math.abs(today - lastPurchase);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    },

    // ========================================
    // FUNCIONALIDADES AVANZADAS CRM
    // ========================================

    async showCustomer360(customerId) {
        const customer = await DB.get('customers', customerId);
        if (!customer) {
            Utils.showNotification('Cliente no encontrado', 'error');
            return;
        }

        const sales = await DB.query('sales', 'customer_id', customerId);
        const completedSales = sales.filter(s => s.status === 'completada');
        const repairs = await DB.query('repairs', 'customer_id', customerId);
        
        const totalSpent = completedSales.reduce((sum, s) => sum + (s.total || 0), 0);
        const avgPurchase = completedSales.length > 0 ? totalSpent / completedSales.length : 0;
        const lifetimeValue = totalSpent;
        const purchaseFrequency = this.calculatePurchaseFrequency(completedSales);
        const lastPurchaseDays = customer.lastPurchaseDate ? this.daysSinceLastPurchase(customer.lastPurchaseDate) : null;
        const customerSegment = this.calculateCustomerSegment(totalSpent, completedSales.length, lastPurchaseDays);
        
        const saleItems = await DB.getAll('sale_items');
        const items = await DB.getAll('inventory_items');
        const preferredProducts = this.analyzePreferredProducts(completedSales, saleItems, items);
        
        const customerScore = this.calculateCustomerScore(totalSpent, completedSales.length, lastPurchaseDays, avgPurchase);

        const body = `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-lg);">
                <div>
                    <div class="dashboard-grid" style="margin-bottom: var(--spacing-md);">
                        <div class="kpi-card">
                            <div class="kpi-label">Valor de Vida</div>
                            <div class="kpi-value" style="font-size: 20px;">${Utils.formatCurrency(lifetimeValue)}</div>
                        </div>
                        <div class="kpi-card">
                            <div class="kpi-label">Score Cliente</div>
                            <div class="kpi-value" style="font-size: 20px; color: ${customerScore >= 80 ? 'var(--color-success)' : customerScore >= 60 ? 'var(--color-warning)' : 'var(--color-danger)'};">
                                ${customerScore}/100
                            </div>
                        </div>
                        <div class="kpi-card">
                            <div class="kpi-label">Segmento</div>
                            <div class="kpi-value" style="font-size: 16px;">${customerSegment}</div>
                        </div>
                        <div class="kpi-card">
                            <div class="kpi-label">Frecuencia</div>
                            <div class="kpi-value" style="font-size: 16px;">${purchaseFrequency}</div>
                        </div>
                    </div>
                    
                    <h4 style="margin-bottom: var(--spacing-sm);">Información del Cliente</h4>
                    <div style="background: var(--color-bg-secondary); padding: var(--spacing-md); border-radius: var(--radius-md); margin-bottom: var(--spacing-md);">
                        <p><strong>Nombre:</strong> ${customer.name} ${customer.lastname || ''}</p>
                        <p><strong>Email:</strong> ${customer.email || 'N/A'}</p>
                        <p><strong>Teléfono:</strong> ${customer.phone || 'N/A'}</p>
                        ${customer.birthdate ? `<p><strong>Fecha de Nacimiento:</strong> ${Utils.formatDate(customer.birthdate, 'DD/MM/YYYY')}</p>` : ''}
                        ${customer.country ? `<p><strong>Ubicación:</strong> ${customer.city ? customer.city + ', ' : ''}${customer.country}</p>` : ''}
                        <p><strong>Cliente desde:</strong> ${Utils.formatDate(customer.created_at, 'DD/MM/YYYY')}</p>
                        ${lastPurchaseDays !== null ? `<p><strong>Última compra:</strong> Hace ${lastPurchaseDays} días</p>` : '<p><strong>Última compra:</strong> Nunca</p>'}
                    </div>
                </div>
                <div>
                    <h4 style="margin-bottom: var(--spacing-sm);">Análisis de Compras</h4>
                    <div style="background: var(--color-bg-secondary); padding: var(--spacing-md); border-radius: var(--radius-md); margin-bottom: var(--spacing-md);">
                        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--spacing-sm);">
                            <div><div style="font-size: 11px; color: var(--color-text-secondary);">Total Compras</div><div style="font-size: 18px; font-weight: 700;">${completedSales.length}</div></div>
                            <div><div style="font-size: 11px; color: var(--color-text-secondary);">Ticket Promedio</div><div style="font-size: 18px; font-weight: 700;">${Utils.formatCurrency(avgPurchase)}</div></div>
                        </div>
                    </div>
                    ${preferredProducts.length > 0 ? `
                    <h4 style="margin-bottom: var(--spacing-sm);">Productos Preferidos</h4>
                    <div style="background: var(--color-bg-secondary); padding: var(--spacing-md); border-radius: var(--radius-md); margin-bottom: var(--spacing-md);">
                        ${preferredProducts.slice(0, 5).map((product, idx) => `
                            <div style="display: flex; justify-content: space-between; padding: var(--spacing-xs) 0; border-bottom: 1px solid var(--color-border-light);">
                                <div><span style="font-weight: 600; color: var(--color-primary);">#${idx + 1}</span> <span style="margin-left: var(--spacing-xs);">${product.name}</span></div>
                                <div><span style="font-weight: 600;">${product.count}x</span> <span style="color: var(--color-text-secondary); margin-left: var(--spacing-xs);">${Utils.formatCurrency(product.revenue)}</span></div>
                            </div>
                        `).join('')}
                    </div>
                    ` : ''}
                    <h4 style="margin-bottom: var(--spacing-sm);">Historial de Ventas</h4>
                    <div style="max-height: 300px; overflow-y: auto; background: var(--color-bg-secondary); padding: var(--spacing-md); border-radius: var(--radius-md);">
                        ${completedSales.length === 0 ? '<p style="text-align: center; color: var(--color-text-secondary);">No hay ventas</p>' : 
                        completedSales.slice(0, 10).map(sale => `
                            <div style="padding: var(--spacing-sm); border-bottom: 1px solid var(--color-border-light);">
                                <div style="display: flex; justify-content: space-between;">
                                    <div><strong>${sale.folio}</strong><div style="font-size: 11px; color: var(--color-text-secondary);">${Utils.formatDate(sale.created_at, 'DD/MM/YYYY HH:mm')}</div></div>
                                    <div style="text-align: right;"><div style="font-weight: 600;">${Utils.formatCurrency(sale.total)}</div></div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

        const self = this;
        UI.showModal(`Vista 360°: ${customer.name}`, body, [
            { text: 'Editar', class: 'btn-secondary', onclick: () => { UI.closeModal(); this.editCustomer(customerId); } },
            { text: 'Cerrar', class: 'btn-primary', onclick: () => UI.closeModal() }
        ]);
    },

    calculatePurchaseFrequency(sales) {
        if (sales.length < 2) return 'Nueva';
        const sortedSales = sales.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        const daysBetween = [];
        for (let i = 1; i < sortedSales.length; i++) {
            const days = this.daysSinceLastPurchase(sortedSales[i-1].created_at);
            daysBetween.push(days);
        }
        const avgDays = daysBetween.reduce((sum, d) => sum + d, 0) / daysBetween.length;
        if (avgDays <= 30) return 'Alta';
        if (avgDays <= 90) return 'Media';
        return 'Baja';
    },

    calculateCustomerSegment(totalSpent, purchaseCount, lastPurchaseDays) {
        if (purchaseCount === 0) return 'Nuevo';
        if (totalSpent >= 50000 && purchaseCount >= 5 && (!lastPurchaseDays || lastPurchaseDays <= 90)) return 'VIP';
        if (totalSpent >= 20000 && purchaseCount >= 3) return 'Premium';
        if (totalSpent >= 5000) return 'Regular';
        return 'Ocasional';
    },

    analyzePreferredProducts(sales, saleItems, items) {
        const productStats = {};
        sales.forEach(sale => {
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
        return Object.values(productStats).sort((a, b) => b.count - a.count);
    },

    calculateCustomerScore(totalSpent, purchaseCount, lastPurchaseDays, avgPurchase) {
        let score = 0;
        if (totalSpent >= 50000) score += 40;
        else if (totalSpent >= 20000) score += 30;
        else if (totalSpent >= 5000) score += 20;
        else if (totalSpent >= 1000) score += 10;
        
        if (purchaseCount >= 10) score += 30;
        else if (purchaseCount >= 5) score += 20;
        else if (purchaseCount >= 2) score += 10;
        
        if (lastPurchaseDays === null) score += 0;
        else if (lastPurchaseDays <= 30) score += 20;
        else if (lastPurchaseDays <= 90) score += 10;
        else if (lastPurchaseDays <= 180) score += 5;
        
        if (avgPurchase >= 5000) score += 10;
        else if (avgPurchase >= 2000) score += 7;
        else if (avgPurchase >= 1000) score += 5;
        
        return Math.min(100, score);
    }
};

window.Customers = Customers;

