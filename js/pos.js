// POS Module - Point of Sale

const POS = {
    initialized: false,
    currentSale: null,
    cart: [],
    currentGuide: null,
    currentAgency: null,

    async init() {
        if (this.initialized) return;
        this.setupEventListeners();
        await this.loadCatalogs();
        // Asegurar que hay productos demo
        await this.ensureDemoProducts();
        this.initialized = true;
    },

    async ensureDemoProducts() {
        try {
            let items = await DB.getAll('inventory_items') || [];
            console.log(`Productos encontrados: ${items.length}`);
            
            if (items.length === 0) {
                console.log('No hay productos, cargando datos demo...');
                if (window.App && window.App.loadDemoInventory) {
                    await window.App.loadDemoInventory();
                    // Esperar un momento y recargar
                    await new Promise(resolve => setTimeout(resolve, 100));
                    items = await DB.getAll('inventory_items') || [];
                    console.log(`Productos después de cargar demo: ${items.length}`);
                }
            }
            
            // Cargar productos después de asegurar que existen
            await this.loadProducts();
        } catch (e) {
            console.error('Error asegurando productos demo:', e);
            // Intentar cargar productos de todas formas
            await this.loadProducts();
        }
    },

    setupEventListeners() {
        document.getElementById('pos-complete-btn')?.addEventListener('click', () => this.completeSale());
        document.getElementById('pos-history-btn')?.addEventListener('click', () => this.showHistory());
        
        // Payment inputs (solo USD, MXN, CAD)
        ['cash-usd', 'cash-mxn', 'cash-cad', 'tpv-visa', 'tpv-amex'].forEach(id => {
            const input = document.getElementById(`payment-${id}`);
            if (input) {
                input.addEventListener('input', () => {
                    this.calculatePayments().catch(e => console.error('Error calculating payments:', e));
                });
            }
        });

        // Categorías
        document.querySelectorAll('.pos-category-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.pos-category-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.loadProducts();
            });
        });

        // Activar primera categoría por defecto
        const firstCategory = document.querySelector('.pos-category-btn');
        if (firstCategory) firstCategory.classList.add('active');

        // Búsqueda de productos
        document.getElementById('pos-product-search')?.addEventListener('input', Utils.debounce(() => this.loadProducts(), 300));
        document.getElementById('pos-category-filter')?.addEventListener('change', () => this.loadProducts());

        // Recargar productos cuando se muestre el módulo
        window.addEventListener('module-loaded', (e) => {
            if (e.detail && e.detail.module === 'pos') {
                console.log('Módulo POS mostrado, recargando productos...');
                setTimeout(() => this.loadProducts(), 100);
            }
        });
    },

    async loadCatalogs() {
        // Los catálogos ya no se cargan en selects, se usan al escanear
    },

    async setGuide(guide) {
        // Cargar guía y agencia automáticamente
        this.currentGuide = guide;
        
        if (guide.agency_id) {
            const agency = await DB.get('catalog_agencies', guide.agency_id);
            this.currentAgency = agency;
            
            // Actualizar UI
            const guideEl = document.getElementById('pos-current-guide');
            const agencyEl = document.getElementById('pos-current-agency');
            const statusEl = document.getElementById('pos-scanner-status');
            
            if (guideEl) guideEl.textContent = guide.name;
            if (agencyEl) agencyEl.textContent = agency?.name || '-';
            // No mostrar barra de escáner
            
            Utils.showNotification(`Guía ${guide.name} - Agencia ${agency?.name} cargados`, 'success');
        } else {
            Utils.showNotification('El guía no tiene agencia asignada', 'error');
        }
    },

    clearGuide() {
        this.currentGuide = null;
        this.currentAgency = null;
        const guideEl = document.getElementById('pos-current-guide');
        const agencyEl = document.getElementById('pos-current-agency');
        const statusEl = document.getElementById('pos-scanner-status');
        
        if (guideEl) guideEl.textContent = '-';
        if (agencyEl) agencyEl.textContent = '-';
        // No mostrar barra de escáner
        Utils.showNotification('Guía y agencia limpiados', 'info');
    },

    async selectProduct(itemId) {
        try {
            const item = await DB.get('inventory_items', itemId);
            if (!item) {
                Utils.showNotification('Producto no encontrado', 'error');
                return;
            }

            // Verificar si ya está en el carrito
            if (this.cart.find(c => c.id === item.id)) {
                Utils.showNotification('La pieza ya está en el carrito', 'error');
                return;
            }

            // Verificar disponibilidad
            if (item.status !== 'disponible') {
                Utils.showNotification(`Pieza ${item.status}`, 'error');
                return;
            }

            // Agregar directamente al carrito con precio inicial (costo o 0)
            const initialPrice = item.cost || 0;
            const cartItem = {
                ...item,
                price: initialPrice, // Precio inicial (se puede editar en el carrito)
                quantity: 1,
                discount: 0,
                subtotal: initialPrice
            };

            this.cart.push(cartItem);
            this.updateCartDisplay();
            this.calculateTotals();
            Utils.showNotification('Pieza agregada al carrito', 'success');
        } catch (e) {
            console.error('Error selecting product:', e);
            Utils.showNotification('Error al agregar producto', 'error');
        }
    },

    async loadProducts() {
        const container = document.getElementById('pos-products-list');
        if (!container) {
            console.warn('Container pos-products-list no encontrado');
            return;
        }

        try {
            const search = document.getElementById('pos-product-search')?.value.toLowerCase() || '';
            const category = document.querySelector('.pos-category-btn.active')?.dataset.category || 'all';
            const categoryFilter = document.getElementById('pos-category-filter')?.value || '';

            let items = await DB.getAll('inventory_items') || [];
            console.log(`Total items en DB: ${items.length}`);
            
            items = items.filter(item => {
                if (!item) return false;
                return item.status === 'disponible';
            });
            
            console.log(`Items disponibles: ${items.length}`);

            if (search) {
                items = items.filter(item => 
                    item.sku?.toLowerCase().includes(search) ||
                    item.name?.toLowerCase().includes(search) ||
                    item.barcode?.includes(search)
                );
            }

            if (categoryFilter) {
                // Filtrar por categoría si está implementado
            }

            if (items.length === 0) {
                container.innerHTML = '<div class="pos-empty-state">No se encontraron productos</div>';
                console.log('No hay productos para mostrar');
                return;
            }

            console.log(`Mostrando ${items.length} productos`);
            
            // Cargar fotos para cada producto
            const itemsWithPhotos = await Promise.all(items.map(async (item) => {
                try {
                    const photos = await DB.query('inventory_photos', 'item_id', item.id);
                    const photo = photos && photos.length > 0 ? photos[0] : null;
                    return { ...item, photo: photo?.thumbnail_blob || photo?.photo_blob || null };
                } catch (e) {
                    console.error(`Error loading photo for item ${item.id}:`, e);
                    return { ...item, photo: null };
                }
            }));

            container.innerHTML = itemsWithPhotos.map(item => {
                // Escapar comillas para evitar errores de sintaxis
                const itemId = String(item.id).replace(/'/g, "\\'");
                const itemName = (item.name || 'Sin nombre').replace(/'/g, "&#39;").replace(/"/g, "&quot;");
                const itemSku = (item.sku || item.barcode || 'N/A').replace(/'/g, "&#39;").replace(/"/g, "&quot;");
                const itemMetal = (item.metal || '').replace(/'/g, "&#39;").replace(/"/g, "&quot;");
                const itemStone = (item.stone || '').replace(/'/g, "&#39;").replace(/"/g, "&quot;");
                const itemWeight = item.weight_g || 0;
                const itemMeasures = (item.measures || '').replace(/'/g, "&#39;").replace(/"/g, "&quot;");
                const itemSize = (item.size || '').replace(/'/g, "&#39;").replace(/"/g, "&quot;");
                
                return `
                    <div class="pos-product-item" data-item-id="${itemId}" onclick="if(window.POS && window.POS.selectProduct){window.POS.selectProduct('${itemId}');}">
                        <div class="pos-product-image">
                            ${item.photo ? 
                                `<img src="${item.photo}" alt="${itemName}" onerror="this.parentElement.innerHTML='<div class=\\'pos-product-image-placeholder\\'>💎</div>'">` :
                                `<div class="pos-product-image-placeholder">💎</div>`
                            }
                        </div>
                        <div class="pos-product-info">
                            <div class="pos-product-name">${itemName}</div>
                            <div class="pos-product-sku">SKU: ${itemSku}</div>
                            ${itemMetal ? `<div class="pos-product-detail"><span class="pos-detail-label">Metal:</span> ${itemMetal}</div>` : ''}
                            ${itemStone && itemStone !== 'Sin piedra' ? `<div class="pos-product-detail"><span class="pos-detail-label">Piedra:</span> ${itemStone}</div>` : ''}
                            ${itemSize ? `<div class="pos-product-detail"><span class="pos-detail-label">Talla:</span> ${itemSize}</div>` : ''}
                            ${itemWeight > 0 ? `<div class="pos-product-detail"><span class="pos-detail-label">Peso:</span> ${itemWeight}g</div>` : ''}
                            ${itemMeasures ? `<div class="pos-product-detail"><span class="pos-detail-label">Medidas:</span> ${itemMeasures}</div>` : ''}
                            <div class="pos-product-cost">Costo: ${Utils.formatCurrency(item.cost || 0)}</div>
                        </div>
                    </div>
                `;
            }).join('');
        } catch (e) {
            console.error('Error loading products:', e);
            container.innerHTML = '<div class="pos-empty-state">Error al cargar productos: ' + e.message + '</div>';
        }
    },

    startScanning() {
        Utils.showNotification('Escanea el código de barras de la pieza', 'info');
        // Focus will be handled by barcode scanner
    },

    async searchItem() {
        const query = prompt('Buscar pieza por SKU, nombre o barcode:');
        if (!query) return;

        try {
            const items = await DB.getAll('inventory_items');
            const matches = items.filter(item => 
                item.sku?.toLowerCase().includes(query.toLowerCase()) ||
                item.name?.toLowerCase().includes(query.toLowerCase()) ||
                item.barcode?.includes(query)
            );

            if (matches.length === 0) {
                Utils.showNotification('No se encontraron piezas', 'error');
                return;
            }

            if (matches.length === 1) {
                this.addItemToCart(matches[0]);
            } else {
                // Show selection modal
                this.showItemSelection(matches);
            }
        } catch (e) {
            console.error('Error searching items:', e);
            Utils.showNotification('Error al buscar piezas', 'error');
        }
    },

    showItemSelection(items) {
        const body = items.map(item => {
            const itemId = String(item.id).replace(/'/g, "\\'");
            return `
                <div class="item-option" style="padding: var(--spacing-sm); border-bottom: 1px solid var(--color-border-light); cursor: pointer;" 
                     onclick="if(window.POS && window.POS.selectProduct){window.POS.selectProduct('${itemId}');} UI.closeModal();">
                    <strong>${item.sku || 'N/A'}</strong> - ${item.name || 'Sin nombre'}
                    <br><small>${item.status} | Peso: ${item.weight_g || 0}g | Costo: ${Utils.formatCurrency(item.cost || 0)}</small>
                </div>
            `;
        }).join('');

        UI.showModal('Seleccionar Pieza', body, '');
    },

    addItemToCart(item) {
        // Agregar directamente al carrito (sin modal)
        if (item && item.id) {
            this.selectProduct(item.id);
        }
    },

    removeFromCart(itemId) {
        this.cart = this.cart.filter(c => c.id !== itemId);
        this.updateCartDisplay();
        this.calculateTotals();
    },

    updateCartDisplay() {
        const container = document.getElementById('pos-cart-items');
        if (!container) return;

        if (this.cart.length === 0) {
            container.innerHTML = '<div class="pos-empty-cart">El carrito está vacío</div>';
            return;
        }

        container.innerHTML = this.cart.map(item => `
            <div class="pos-cart-item" data-item-id="${item.id}">
                <div class="pos-cart-item-header">
                    <div>
                        <div class="pos-cart-item-name">
                            💎 ${item.name}
                        </div>
                        <div class="pos-cart-item-code">${item.sku || item.barcode || 'N/A'}</div>
                    </div>
                    <button class="pos-cart-item-remove" onclick="window.POS.removeFromCart('${item.id}')">Eliminar</button>
                </div>
                <div class="pos-cart-item-controls">
                    <div class="pos-cart-item-quantity">
                        <button onclick="window.POS.updateQuantity('${item.id}', ${item.quantity - 1})">-</button>
                        <input type="number" value="${item.quantity}" min="1" 
                               onchange="window.POS.updateQuantity('${item.id}', parseInt(this.value))">
                        <button onclick="window.POS.updateQuantity('${item.id}', ${item.quantity + 1})">+</button>
                    </div>
                    <div class="pos-cart-item-price">
                        <label>Precio de Venta:</label>
                        <input type="number" value="${item.price}" step="0.01" min="0"
                               onchange="window.POS.updateItemPrice('${item.id}', parseFloat(this.value))">
                    </div>
                </div>
                <div class="pos-cart-item-total">
                    ${Utils.formatCurrency(item.subtotal)}
                </div>
            </div>
        `).join('');
    },

    updateQuantity(itemId, newQuantity) {
        if (newQuantity < 1) return;
        const item = this.cart.find(c => c.id === itemId);
        if (item) {
            item.quantity = newQuantity;
            item.subtotal = item.price * item.quantity * (1 - (item.discount || 0) / 100);
            this.updateCartDisplay();
            this.calculateTotals();
        }
    },

    updateItemPrice(itemId, newPrice) {
        if (newPrice < 0) return;
        const item = this.cart.find(c => c.id === itemId);
        if (item) {
            item.price = newPrice;
            item.subtotal = item.price * item.quantity * (1 - (item.discount || 0) / 100);
            this.updateCartDisplay();
            this.calculateTotals();
        }
    },

    applyQuickDiscount(percent) {
        if (!UserManager.hasPermission('descuentos')) {
            Utils.showNotification('No tienes permiso para aplicar descuentos', 'error');
            return;
        }
        this.cart.forEach(item => {
            item.discount = percent;
            item.subtotal = item.price * item.quantity * (1 - percent / 100);
        });
        this.updateCartDisplay();
        this.calculateTotals();
        Utils.showNotification(`Descuento del ${percent}% aplicado`, 'success');
    },

    removeDiscount() {
        this.cart.forEach(item => {
            item.discount = 0;
            item.subtotal = item.price * item.quantity;
        });
        this.updateCartDisplay();
        this.calculateTotals();
        Utils.showNotification('Descuentos removidos', 'info');
    },

    togglePayments() {
        const content = document.getElementById('pos-payments-content');
        const toggle = document.getElementById('pos-payments-toggle');
        if (content.style.display === 'none') {
            content.style.display = 'block';
            toggle.textContent = '▲';
        } else {
            content.style.display = 'none';
            toggle.textContent = '▼';
        }
    },

    async updateItemDiscount(itemId, discount) {
        // Validar permisos
        if (!UserManager.hasPermission('descuentos') && parseFloat(discount) > 0) {
            Utils.showNotification('No tienes permiso para aplicar descuentos', 'error');
            const item = this.cart.find(c => c.id === itemId);
            if (item) {
                // Restaurar valor anterior
                const input = document.querySelector(`input[onchange*="${itemId}"]`);
                if (input) input.value = item.discount;
            }
            return;
        }

        const item = this.cart.find(c => c.id === itemId);
        if (item) {
            item.discount = parseFloat(discount) || 0;
            item.subtotal = item.price * (1 - item.discount / 100);
            this.updateCartDisplay();
            this.calculateTotals();
        }
    },

    calculateTotals() {
        const total = this.cart.reduce((sum, item) => sum + item.subtotal, 0);
        const totalEl = document.getElementById('pos-total');
        if (totalEl) {
            totalEl.textContent = Utils.formatCurrency(total);
        }
    },

    async calculatePayments() {
        try {
            const cashUsd = parseFloat(document.getElementById('payment-cash-usd')?.value || 0);
            const cashMxn = parseFloat(document.getElementById('payment-cash-mxn')?.value || 0);
            const cashCad = parseFloat(document.getElementById('payment-cash-cad')?.value || 0);
            const tpvVisa = parseFloat(document.getElementById('payment-tpv-visa')?.value || 0);
            const tpvAmex = parseFloat(document.getElementById('payment-tpv-amex')?.value || 0);

            // Get exchange rates from settings
            const exchangeRateUsd = await DB.get('settings', 'exchange_rate_usd');
            const exchangeRateCad = await DB.get('settings', 'exchange_rate_cad');
            const exchangeRate = parseFloat(exchangeRateUsd?.value || localStorage.getItem('daily_exchange_rate') || '20.00');
            const exchangeRateCadValue = parseFloat(exchangeRateCad?.value || '15.00');

            // Convert all to base currency (MXN)
            let totalPayments = 0;
            totalPayments += cashUsd * exchangeRate;
            totalPayments += cashMxn;
            totalPayments += cashCad * exchangeRateCadValue;
            totalPayments += tpvVisa;
            totalPayments += tpvAmex;

            const total = this.cart.reduce((sum, item) => sum + item.subtotal, 0);
            const difference = totalPayments - total;

            const paymentsTotalEl = document.getElementById('payments-total');
            if (paymentsTotalEl) paymentsTotalEl.textContent = Utils.formatCurrency(totalPayments);
            
            const diffEl = document.getElementById('payments-difference');
            if (diffEl) {
                diffEl.textContent = Utils.formatCurrency(Math.abs(difference));
                if (diffEl.parentElement) {
                    diffEl.parentElement.style.color = difference === 0 ? 'green' : (difference > 0 ? 'orange' : 'red');
                }
            }
        } catch (e) {
            console.error('Error calculating payments:', e);
        }
    },

    async completeSale() {
        if (this.cart.length === 0) {
            Utils.showNotification('El carrito está vacío', 'error');
            return;
        }

        // Validate payments
        await this.calculatePayments();
        const total = this.cart.reduce((sum, item) => sum + item.subtotal, 0);
        const totalPayments = parseFloat(document.getElementById('payments-total')?.textContent.replace(/[^0-9.-]/g, '') || 0);
        
        if (Math.abs(totalPayments - total) > 0.01) {
            if (!await Utils.confirm(`La diferencia es ${Utils.formatCurrency(Math.abs(totalPayments - total))}. ¿Continuar?`)) {
                return;
            }
        }

        // Validar que haya guía escaneado
        if (!this.currentGuide) {
            Utils.showNotification('Primero debes escanear el código de barras del GUÍA', 'error');
            return;
        }

        // Obtener datos automáticamente
        const branchId = localStorage.getItem('current_branch_id') || 'default';
        const sellerId = UserManager.currentUser?.employee_id || null; // Vendedor es el usuario actual
        const agencyId = this.currentAgency?.id || null;
        const guideId = this.currentGuide?.id || null;
        const passengers = 1; // Por defecto
        const currency = 'MXN'; // Por defecto
        const exchangeRateUsd = await DB.get('settings', 'exchange_rate_usd');
        const exchangeRate = parseFloat(exchangeRateUsd?.value || localStorage.getItem('daily_exchange_rate') || '20.00');
        const notes = '';

        // Generate folio
        const branch = await DB.get('catalog_branches', branchId);
        const branchCode = branch?.name.replace(/\s+/g, '').substring(0, 3).toUpperCase() || 'SUC';
        const folio = Utils.generateFolio(branchCode);

        // Create sale
        const sale = {
            id: Utils.generateId(),
            folio: folio,
            branch_id: branchId,
            seller_id: sellerId,
            agency_id: agencyId || null,
            guide_id: guideId || null,
            passengers: passengers,
            customer_id: await this.getSelectedCustomerId(),
            currency: currency,
            exchange_rate: exchangeRate,
            subtotal: this.cart.reduce((sum, item) => sum + item.price, 0),
            discount: this.cart.reduce((sum, item) => sum + (item.price * item.discount / 100), 0),
            total: total,
            status: 'completada',
            notes: notes,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            sync_status: 'pending'
        };

        await DB.add('sales', sale);

        // Create sale items
        for (const item of this.cart) {
            await DB.add('sale_items', {
                id: Utils.generateId(),
                sale_id: sale.id,
                item_id: item.id,
                quantity: item.quantity,
                price: item.price,
                discount: item.discount,
                subtotal: item.subtotal,
                created_at: new Date().toISOString()
            });

            // Update inventory status
            await DB.put('inventory_items', {
                ...item,
                status: 'vendida'
            });

            // Log inventory change
            await DB.add('inventory_logs', {
                id: Utils.generateId(),
                item_id: item.id,
                action: 'vendida',
                quantity: 1,
                notes: `Venta ${folio}`,
                created_at: new Date().toISOString()
            });
        }

        // Create payments
        const cashUsd = parseFloat(document.getElementById('payment-cash-usd')?.value || 0);
        const cashMxn = parseFloat(document.getElementById('payment-cash-mxn')?.value || 0);
        const cashCad = parseFloat(document.getElementById('payment-cash-cad')?.value || 0);
        const tpvVisa = parseFloat(document.getElementById('payment-tpv-visa')?.value || 0);
        const tpvAmex = parseFloat(document.getElementById('payment-tpv-amex')?.value || 0);

        const paymentMethods = await DB.getAll('payment_methods');
        const getMethodId = (code) => paymentMethods.find(m => m.code === code)?.id || null;

        if (cashUsd > 0) await DB.add('payments', { id: Utils.generateId(), sale_id: sale.id, method_id: getMethodId('CASH_USD'), amount: cashUsd, currency: 'USD', created_at: new Date().toISOString() });
        if (cashMxn > 0) await DB.add('payments', { id: Utils.generateId(), sale_id: sale.id, method_id: getMethodId('CASH_MXN'), amount: cashMxn, currency: 'MXN', created_at: new Date().toISOString() });
        if (cashCad > 0) await DB.add('payments', { id: Utils.generateId(), sale_id: sale.id, method_id: getMethodId('CASH_CAD'), amount: cashCad, currency: 'CAD', created_at: new Date().toISOString() });
        if (tpvVisa > 0) await DB.add('payments', { id: Utils.generateId(), sale_id: sale.id, method_id: getMethodId('TPV_VISA'), amount: tpvVisa, currency: 'MXN', created_at: new Date().toISOString() });
        if (tpvAmex > 0) await DB.add('payments', { id: Utils.generateId(), sale_id: sale.id, method_id: getMethodId('TPV_AMEX'), amount: tpvAmex, currency: 'MXN', created_at: new Date().toISOString() });

        // Calculate and store commissions
        await this.calculateCommissions(sale);

        // Add to sync queue
        await SyncManager.addToQueue('sale', sale.id);

        // Print ticket
        await Printer.printTicket(sale);

        Utils.showNotification(`Venta completada: ${folio}`, 'success');

        // Reset form
        this.resetForm();

        // Agregar automáticamente al Reporte Turistas
        if (window.TouristReport && guideId) {
            await window.TouristReport.addSaleToReport(sale.id);
        }
    },

    async calculateCommissions(sale) {
        // Get seller commission rule
        if (sale.seller_id) {
            const seller = await DB.get('catalog_sellers', sale.seller_id);
            if (seller && seller.commission_rule) {
                const rule = await DB.get('commission_rules', seller.commission_rule);
                if (rule) {
                    const commission = Utils.calculateCommission(sale.total, rule.discount_pct, rule.multiplier);
                    // Store commission (can be in sale or separate table)
                }
            }
        }

        // Get guide commission rule
        if (sale.guide_id) {
            const guide = await DB.get('catalog_guides', sale.guide_id);
            if (guide && guide.commission_rule) {
                const rule = await DB.get('commission_rules', guide.commission_rule);
                if (rule) {
                    const commission = Utils.calculateCommission(sale.total, rule.discount_pct, rule.multiplier);
                    // Store commission
                }
            }
        }
    },

    async saveDraft() {
        if (this.cart.length === 0) {
            Utils.showNotification('El carrito está vacío', 'error');
            return;
        }

        const branchId = localStorage.getItem('current_branch_id') || 'default';
        const sellerId = UserManager.currentUser?.employee_id || null;
        const agencyId = this.currentAgency?.id || null;
        const guideId = this.currentGuide?.id || null;
        const passengers = 1;
        const currency = 'MXN';
        const exchangeRateUsd = await DB.get('settings', 'exchange_rate_usd');
        const exchangeRate = parseFloat(exchangeRateUsd?.value || localStorage.getItem('daily_exchange_rate') || '20.00');
        const notes = '';

        const branch = await DB.get('catalog_branches', branchId);
        const branchCode = branch?.name.replace(/\s+/g, '').substring(0, 3).toUpperCase() || 'SUC';
        const folio = Utils.generateFolio(branchCode);

        const total = this.cart.reduce((sum, item) => sum + item.subtotal, 0);

        const sale = {
            id: Utils.generateId(),
            folio: folio,
            branch_id: branchId,
            seller_id: sellerId,
            agency_id: agencyId || null,
            guide_id: guideId || null,
            passengers: passengers,
            customer_id: null,
            currency: currency,
            exchange_rate: exchangeRate,
            subtotal: this.cart.reduce((sum, item) => sum + item.price, 0),
            discount: this.cart.reduce((sum, item) => sum + (item.price * item.discount / 100), 0),
            total: total,
            status: 'borrador',
            notes: notes,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            sync_status: 'pending'
        };

        await DB.add('sales', sale);

        for (const item of this.cart) {
            await DB.add('sale_items', {
                id: Utils.generateId(),
                sale_id: sale.id,
                item_id: item.id,
                quantity: item.quantity,
                price: item.price,
                discount: item.discount,
                subtotal: item.subtotal,
                created_at: new Date().toISOString()
            });
        }

        await SyncManager.addToQueue('sale', sale.id);
        Utils.showNotification(`Borrador guardado: ${folio}`, 'success');
        this.resetForm();
    },

    async reserveSale() {
        if (this.cart.length === 0) {
            Utils.showNotification('El carrito está vacío', 'error');
            return;
        }

        // Validate payments
        await this.calculatePayments();
        const total = this.cart.reduce((sum, item) => sum + item.subtotal, 0);
        const totalPayments = parseFloat(document.getElementById('payments-total')?.textContent.replace(/[^0-9.-]/g, '') || 0);
        
        if (Math.abs(totalPayments - total) > 0.01) {
            if (!await Utils.confirm(`La diferencia es ${Utils.formatCurrency(Math.abs(totalPayments - total))}. ¿Continuar?`)) {
                return;
            }
        }

        const branchId = localStorage.getItem('current_branch_id') || 'default';
        const sellerId = UserManager.currentUser?.employee_id || null;
        const agencyId = this.currentAgency?.id || null;
        const guideId = this.currentGuide?.id || null;
        const passengers = 1;
        const currency = 'MXN';
        const exchangeRateUsd = await DB.get('settings', 'exchange_rate_usd');
        const exchangeRate = parseFloat(exchangeRateUsd?.value || localStorage.getItem('daily_exchange_rate') || '20.00');
        const notes = '';

        const branch = await DB.get('catalog_branches', branchId);
        const branchCode = branch?.name.replace(/\s+/g, '').substring(0, 3).toUpperCase() || 'SUC';
        const folio = Utils.generateFolio(branchCode);

        // total already calculated above at line 487, reuse it

        const sale = {
            id: Utils.generateId(),
            folio: folio,
            branch_id: branchId,
            seller_id: sellerId,
            agency_id: agencyId || null,
            guide_id: guideId || null,
            passengers: passengers,
            customer_id: null,
            currency: currency,
            exchange_rate: exchangeRate,
            subtotal: this.cart.reduce((sum, item) => sum + item.price, 0),
            discount: this.cart.reduce((sum, item) => sum + (item.price * item.discount / 100), 0),
            total: total,
            status: 'apartada',
            notes: notes,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            sync_status: 'pending'
        };

        await DB.add('sales', sale);

        for (const item of this.cart) {
            await DB.add('sale_items', {
                id: Utils.generateId(),
                sale_id: sale.id,
                item_id: item.id,
                quantity: item.quantity,
                price: item.price,
                discount: item.discount,
                subtotal: item.subtotal,
                created_at: new Date().toISOString()
            });

            // Update inventory status
            await DB.put('inventory_items', {
                ...item,
                status: 'apartada'
            });

            await DB.add('inventory_logs', {
                id: Utils.generateId(),
                item_id: item.id,
                action: 'apartada',
                quantity: 1,
                notes: `Apartado ${folio}`,
                created_at: new Date().toISOString()
            });
        }

        // Create payments
        const cashUsd = parseFloat(document.getElementById('payment-cash-usd')?.value || 0);
        const cashMxn = parseFloat(document.getElementById('payment-cash-mxn')?.value || 0);
        const cashCad = parseFloat(document.getElementById('payment-cash-cad')?.value || 0);
        const tpvVisa = parseFloat(document.getElementById('payment-tpv-visa')?.value || 0);
        const tpvAmex = parseFloat(document.getElementById('payment-tpv-amex')?.value || 0);

        const paymentMethods = await DB.getAll('payment_methods');
        const getMethodId = (code) => paymentMethods.find(m => m.code === code)?.id || null;

        if (cashUsd > 0) await DB.add('payments', { id: Utils.generateId(), sale_id: sale.id, method_id: getMethodId('CASH_USD'), amount: cashUsd, currency: 'USD', created_at: new Date().toISOString() });
        if (cashMxn > 0) await DB.add('payments', { id: Utils.generateId(), sale_id: sale.id, method_id: getMethodId('CASH_MXN'), amount: cashMxn, currency: 'MXN', created_at: new Date().toISOString() });
        if (cashCad > 0) await DB.add('payments', { id: Utils.generateId(), sale_id: sale.id, method_id: getMethodId('CASH_CAD'), amount: cashCad, currency: 'CAD', created_at: new Date().toISOString() });
        if (tpvVisa > 0) await DB.add('payments', { id: Utils.generateId(), sale_id: sale.id, method_id: getMethodId('TPV_VISA'), amount: tpvVisa, currency: 'MXN', created_at: new Date().toISOString() });
        if (tpvAmex > 0) await DB.add('payments', { id: Utils.generateId(), sale_id: sale.id, method_id: getMethodId('TPV_AMEX'), amount: tpvAmex, currency: 'MXN', created_at: new Date().toISOString() });

        await SyncManager.addToQueue('sale', sale.id);
        Utils.showNotification(`Apartado creado: ${folio}`, 'success');
        this.resetForm();
    },

    async cancelSale() {
        if (this.cart.length === 0) {
            Utils.showNotification('No hay venta para cancelar', 'info');
            return;
        }

        if (!UserManager.hasPermission('cancelaciones')) {
            Utils.showNotification('No tienes permiso para cancelar ventas', 'error');
            return;
        }

        // Pedir PIN
        const pin = prompt('Ingresa tu PIN para cancelar:');
        if (!pin) return;

        const isValid = await Utils.validatePin(pin, UserManager.currentUser.pin_hash);
        if (!isValid) {
            Utils.showNotification('PIN incorrecto', 'error');
            return;
        }

        // Pedir motivo
        const motivo = prompt('Motivo de cancelación:');
        if (!motivo) return;

        // Si hay una venta guardada, cancelarla
        if (this.currentSale) {
            this.currentSale.status = 'cancelada';
            this.currentSale.notes = `CANCELADA: ${motivo}`;
            this.currentSale.updated_at = new Date().toISOString();
            await DB.put('sales', this.currentSale);

            // Revertir inventario
            const items = await DB.query('sale_items', 'sale_id', this.currentSale.id);
            for (const item of items) {
                const invItem = await DB.get('inventory_items', item.item_id);
                if (invItem) {
                    invItem.status = 'disponible';
                    await DB.put('inventory_items', invItem);
                }
            }

            await SyncManager.addToQueue('sale', this.currentSale.id);
            Utils.showNotification('Venta cancelada', 'success');
        }

        this.resetForm();
    },

    async showHistory() {
        try {
            const sales = await DB.getAll('sales');
            const recentSales = sales
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                .slice(0, 100);

            const sellers = await DB.getAll('catalog_sellers');
            const branches = await DB.getAll('catalog_branches');
            
            // Estadísticas del historial
            const today = new Date().toISOString().split('T')[0];
            const todaySales = recentSales.filter(s => s.created_at?.startsWith(today));
            const todayTotal = todaySales.reduce((sum, s) => sum + (s.total || 0), 0);
            const completedSales = recentSales.filter(s => s.status === 'completada');
            const completedTotal = completedSales.reduce((sum, s) => sum + (s.total || 0), 0);
            const avgSale = completedSales.length > 0 ? completedTotal / completedSales.length : 0;

            const body = `
                <div style="margin-bottom: var(--spacing-lg);">
                    <div class="dashboard-grid" style="margin-bottom: var(--spacing-md);">
                        <div class="kpi-card">
                            <div class="kpi-label">Ventas Hoy</div>
                            <div class="kpi-value">${todaySales.length}</div>
                            <div style="font-size: 12px; color: var(--color-text-secondary); margin-top: var(--spacing-xs);">
                                ${Utils.formatCurrency(todayTotal)}
                            </div>
                        </div>
                        <div class="kpi-card">
                            <div class="kpi-label">Total Completadas</div>
                            <div class="kpi-value">${completedSales.length}</div>
                            <div style="font-size: 12px; color: var(--color-text-secondary); margin-top: var(--spacing-xs);">
                                ${Utils.formatCurrency(completedTotal)}
                            </div>
                        </div>
                        <div class="kpi-card">
                            <div class="kpi-label">Ticket Promedio</div>
                            <div class="kpi-value">${Utils.formatCurrency(avgSale)}</div>
                        </div>
                        <div class="kpi-card">
                            <div class="kpi-label">Total Registros</div>
                            <div class="kpi-value">${recentSales.length}</div>
                        </div>
                    </div>
                    <div style="display: flex; gap: var(--spacing-sm); margin-bottom: var(--spacing-md);">
                        <input type="text" id="history-search" class="form-input" placeholder="Buscar por folio..." style="flex: 1;">
                        <select id="history-status-filter" class="form-select" style="width: 200px;">
                            <option value="">Todos los estados</option>
                            <option value="completada">Completada</option>
                            <option value="apartada">Apartada</option>
                            <option value="borrador">Borrador</option>
                            <option value="cancelada">Cancelada</option>
                        </select>
                        <button class="btn-secondary btn-sm" onclick="window.POS.showPOSStats()">
                            <i class="fas fa-chart-line"></i> Estadísticas
                        </button>
                    </div>
                </div>
                <div style="max-height: 500px; overflow-y: auto;">
                    <table class="cart-table">
                        <thead>
                            <tr>
                                <th>Folio</th>
                                <th>Fecha</th>
                                <th>Sucursal</th>
                                <th>Vendedor</th>
                                <th>Total</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody id="history-tbody">
                            ${recentSales.map(sale => {
                                const seller = sellers.find(s => s.id === sale.seller_id);
                                const branch = branches.find(b => b.id === sale.branch_id);
                                return `
                                    <tr>
                                        <td><strong>${sale.folio}</strong></td>
                                        <td>${Utils.formatDate(sale.created_at, 'DD/MM/YYYY HH:mm')}</td>
                                        <td>${branch?.name || 'N/A'}</td>
                                        <td>${seller?.name || 'N/A'}</td>
                                        <td>${Utils.formatCurrency(sale.total)}</td>
                                        <td><span class="status-badge status-${sale.status}">${sale.status}</span></td>
                                        <td>
                                            <button class="btn-secondary btn-sm" onclick="window.POS.viewSale('${sale.id}')">Ver</button>
                                            ${sale.status === 'completada' ? `
                                                <button class="btn-secondary btn-sm" onclick="window.POS.reprintTicket('${sale.id}')">Reimprimir</button>
                                            ` : ''}
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            `;

            UI.showModal('Historial de Ventas', body, '<button class="btn-primary" onclick="UI.closeModal()">Cerrar</button>');

            // Setup filters
            document.getElementById('history-search')?.addEventListener('input', (e) => {
                this.filterHistory(e.target.value, document.getElementById('history-status-filter')?.value);
            });

            document.getElementById('history-status-filter')?.addEventListener('change', (e) => {
                this.filterHistory(document.getElementById('history-search')?.value, e.target.value);
            });

            window.currentHistorySales = recentSales;
        } catch (e) {
            console.error('Error loading history:', e);
            Utils.showNotification('Error al cargar historial', 'error');
        }
    },

    async filterHistory(search, statusFilter) {
        let filtered = window.currentHistorySales || [];
        
        if (search) {
            filtered = filtered.filter(s => s.folio?.toLowerCase().includes(search.toLowerCase()));
        }
        
        if (statusFilter) {
            filtered = filtered.filter(s => s.status === statusFilter);
        }

        const tbody = document.getElementById('history-tbody');
        if (!tbody) return;

        const sellers = await DB.getAll('catalog_sellers') || [];
        const branches = await DB.getAll('catalog_branches') || [];

        tbody.innerHTML = filtered.map(sale => {
            const seller = sellers.find(s => s.id === sale.seller_id);
            const branch = branches.find(b => b.id === sale.branch_id);
            return `
                <tr>
                    <td><strong>${sale.folio}</strong></td>
                    <td>${Utils.formatDate(sale.created_at, 'DD/MM/YYYY HH:mm')}</td>
                    <td>${branch?.name || 'N/A'}</td>
                    <td>${seller?.name || 'N/A'}</td>
                    <td>${Utils.formatCurrency(sale.total)}</td>
                    <td><span class="status-badge status-${sale.status}">${sale.status}</span></td>
                    <td>
                        <button class="btn-secondary" onclick="window.POS.viewSale('${sale.id}')" style="padding: 4px 8px; font-size: 12px;">Ver</button>
                        ${sale.status === 'completada' ? `
                            <button class="btn-secondary" onclick="window.POS.reprintTicket('${sale.id}')" style="padding: 4px 8px; font-size: 12px;">Reimprimir</button>
                        ` : ''}
                    </td>
                </tr>
            `;
        }).join('');
    },

    async viewSale(saleId) {
        const sale = await DB.get('sales', saleId);
        if (!sale) return;

        const items = await DB.query('sale_items', 'sale_id', saleId);
        const payments = await DB.query('payments', 'sale_id', saleId);
        const seller = await DB.get('catalog_sellers', sale.seller_id);
        const branch = await DB.get('catalog_branches', sale.branch_id);
        const agency = sale.agency_id ? await DB.get('catalog_agencies', sale.agency_id) : null;
        const guide = sale.guide_id ? await DB.get('catalog_guides', sale.guide_id) : null;

        const inventoryItems = [];
        for (const item of items) {
            const invItem = await DB.get('inventory_items', item.item_id);
            if (invItem) inventoryItems.push({ ...item, inventory: invItem });
        }

        const body = `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                <div>
                    <h4>Información de la Venta</h4>
                    <p><strong>Folio:</strong> ${sale.folio}</p>
                    <p><strong>Fecha:</strong> ${Utils.formatDate(sale.created_at, 'DD/MM/YYYY HH:mm')}</p>
                    <p><strong>Sucursal:</strong> ${branch?.name || 'N/A'}</p>
                    <p><strong>Vendedor:</strong> ${seller?.name || 'N/A'}</p>
                    <p><strong>Agencia:</strong> ${agency?.name || 'N/A'}</p>
                    <p><strong>Guía:</strong> ${guide?.name || 'N/A'}</p>
                    <p><strong>Pasajeros:</strong> ${sale.passengers || 1}</p>
                    <p><strong>Estado:</strong> <span class="status-badge status-${sale.status}">${sale.status}</span></p>
                    <p><strong>Moneda:</strong> ${sale.currency}</p>
                    <p><strong>Tipo Cambio:</strong> ${sale.exchange_rate}</p>
                    ${sale.notes ? `<p><strong>Notas:</strong> ${sale.notes}</p>` : ''}
                </div>
                <div>
                    <h4>Piezas Vendidas</h4>
                    <div style="max-height: 200px; overflow-y: auto; margin-bottom: 20px;">
                        ${inventoryItems.map(item => `
                            <div style="padding: var(--spacing-xs); border-bottom: 1px solid var(--color-border-light);">
                                <strong>${item.inventory.sku}</strong> - ${item.inventory.name}<br>
                                <small>${item.quantity}x ${Utils.formatCurrency(item.price)} = ${Utils.formatCurrency(item.subtotal)}</small>
                            </div>
                        `).join('')}
                    </div>
                    <h4>Pagos</h4>
                    <div style="max-height: 150px; overflow-y: auto;">
                        ${payments.map(p => `
                            <div style="padding: var(--spacing-xs); border-bottom: 1px solid var(--color-border-light);">
                                <strong>${this.getPaymentMethodName(p.method_id)}</strong>: ${Utils.formatCurrency(p.amount, p.currency)}
                            </div>
                        `).join('')}
                    </div>
                    <div style="margin-top: 20px; padding-top: 20px; border-top: 2px solid #e0e0e0;">
                        <p><strong>Subtotal:</strong> ${Utils.formatCurrency(sale.subtotal)}</p>
                        <p><strong>Descuento:</strong> ${Utils.formatCurrency(sale.discount)}</p>
                        <p><strong style="font-size: 16px;">Total:</strong> ${Utils.formatCurrency(sale.total)}</p>
                    </div>
                </div>
            </div>
        `;

        const footer = `
            ${sale.status === 'completada' ? `
                <button class="btn-secondary" onclick="window.POS.reprintTicket('${sale.id}')">Reimprimir Ticket</button>
            ` : ''}
            ${sale.status === 'completada' && UserManager.hasPermission('devoluciones') ? `
                <button class="btn-secondary" onclick="window.POS.processReturn('${sale.id}')">Procesar Devolución</button>
            ` : ''}
            <button class="btn-primary" onclick="UI.closeModal()">Cerrar</button>
        `;

        UI.showModal(`Venta: ${sale.folio}`, body, footer);
    },

    async reprintTicket(saleId) {
        const sale = await DB.get('sales', saleId);
        if (sale) {
            await Printer.printTicket(sale);
        }
    },

    getPaymentMethodName(methodId) {
        const methods = {
            'CASH_USD': 'Efectivo USD',
            'CASH_MXN': 'Efectivo MXN',
            'CASH_EUR': 'Efectivo EUR',
            'CASH_CAD': 'Efectivo CAD',
            'TPV_VISA': 'Visa/MC',
            'TPV_AMEX': 'Amex'
        };
        return methods[methodId] || 'Otro';
    },

    async processReturn(saleId) {
        if (!UserManager.hasPermission('devoluciones')) {
            Utils.showNotification('No tienes permiso para procesar devoluciones', 'error');
            return;
        }

        const sale = await DB.get('sales', saleId);
        if (!sale) return;

        const motivo = prompt('Motivo de devolución:');
        if (!motivo) return;

        const pin = prompt('Ingresa tu PIN:');
        if (!pin) return;

        const isValid = await Utils.validatePin(pin, UserManager.currentUser.pin_hash);
        if (!isValid) {
            Utils.showNotification('PIN incorrecto', 'error');
            return;
        }

        // Crear venta de devolución
        const returnSale = {
            id: Utils.generateId(),
            folio: `DEV-${sale.folio}`,
            branch_id: sale.branch_id,
            seller_id: sale.seller_id,
            agency_id: sale.agency_id,
            guide_id: sale.guide_id,
            passengers: sale.passengers,
            customer_id: sale.customer_id,
            currency: sale.currency,
            exchange_rate: sale.exchange_rate,
            subtotal: -sale.subtotal,
            discount: 0,
            total: -sale.total,
            status: 'devolucion',
            notes: `Devolución de ${sale.folio}. Motivo: ${motivo}`,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            sync_status: 'pending'
        };

        await DB.add('sales', returnSale);

        // Revertir items
        const items = await DB.query('sale_items', 'sale_id', saleId);
        for (const item of items) {
            await DB.add('sale_items', {
                id: Utils.generateId(),
                sale_id: returnSale.id,
                item_id: item.item_id,
                quantity: -item.quantity,
                price: item.price,
                discount: 0,
                subtotal: -item.subtotal,
                created_at: new Date().toISOString()
            });

            // Revertir inventario
            const invItem = await DB.get('inventory_items', item.item_id);
            if (invItem) {
                invItem.status = 'disponible';
                await DB.put('inventory_items', invItem);
            }
        }

        await SyncManager.addToQueue('sale', returnSale.id);
        Utils.showNotification(`Devolución procesada: ${returnSale.folio}`, 'success');
        UI.closeModal();
    },

    async searchCustomer() {
        const query = document.getElementById('pos-customer')?.value.trim();
        if (!query || query.length < 2) return;

        try {
            const customers = await DB.getAll('customers');
            const matches = customers.filter(c => 
                c.name?.toLowerCase().includes(query.toLowerCase()) ||
                c.email?.toLowerCase().includes(query.toLowerCase()) ||
                c.phone?.includes(query)
            );

            if (matches.length > 0) {
                this.showCustomerResults(matches);
            }
        } catch (e) {
            console.error('Error searching customers:', e);
        }
    },

    showCustomerSearch() {
        // Could show dropdown with recent customers
    },

    showCustomerResults(customers) {
        // Simple implementation - could be enhanced with dropdown
        if (customers.length === 1) {
            document.getElementById('pos-customer').value = customers[0].name;
            window.currentCustomerId = customers[0].id;
        }
    },

    async getSelectedCustomerId() {
        const customerName = document.getElementById('pos-customer')?.value.trim();
        if (!customerName) return null;

        try {
            const customers = await DB.getAll('customers');
            const customer = customers.find(c => c.name === customerName);
            return customer?.id || null;
        } catch (e) {
            return null;
        }
    },

    resetForm() {
        this.cart = [];
        this.updateCartDisplay();
        this.calculateTotals();
        window.currentCustomerId = null;
        ['cash-usd', 'cash-mxn', 'cash-cad', 'tpv-visa', 'tpv-amex'].forEach(id => {
            const input = document.getElementById(`payment-${id}`);
            if (input) input.value = '0';
        });
        this.calculatePayments().catch(e => console.error('Error calculating payments:', e));
        // NO limpiar guía/agencia - se mantienen hasta que se limpie manualmente
    },
    
    async showPOSStats() {
        try {
            const sales = await DB.getAll('sales');
            const saleItems = await DB.getAll('sale_items') || [];
            const items = await DB.getAll('inventory_items') || [];
            const sellers = await DB.getAll('catalog_sellers') || [];
            
            const today = new Date();
            const todayStr = today.toISOString().split('T')[0];
            const thisWeek = [];
            const thisMonth = [];
            
            for (let i = 0; i < 7; i++) {
                const date = new Date(today);
                date.setDate(date.getDate() - i);
                const dateStr = date.toISOString().split('T')[0];
                const daySales = sales.filter(s => s.created_at?.startsWith(dateStr) && s.status === 'completada');
                thisWeek.push({
                    date: Utils.formatDate(date, 'DD/MM'),
                    total: daySales.reduce((sum, s) => sum + (s.total || 0), 0),
                    count: daySales.length
                });
            }
            thisWeek.reverse();
            
            const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
            const monthSales = sales.filter(s => {
                const saleDate = new Date(s.created_at);
                return saleDate >= monthStart && s.status === 'completada';
            });
            
            // Top productos del mes
            const productStats = {};
            monthSales.forEach(sale => {
                const saleItemsForSale = saleItems.filter(si => si.sale_id === sale.id);
                saleItemsForSale.forEach(si => {
                    const item = items.find(i => i.id === si.item_id);
                    if (item) {
                        if (!productStats[item.id]) {
                            productStats[item.id] = { name: item.name || item.sku, qty: 0, revenue: 0 };
                        }
                        productStats[item.id].qty += si.quantity || 1;
                        productStats[item.id].revenue += (si.price || 0) * (si.quantity || 1);
                    }
                });
            });
            
            const topProducts = Object.values(productStats)
                .sort((a, b) => b.revenue - a.revenue)
                .slice(0, 5);
            
            // Top vendedores del mes
            const sellerStats = {};
            monthSales.forEach(sale => {
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
                    return { id, name: seller?.name || 'N/A', ...stats };
                })
                .sort((a, b) => b.total - a.total)
                .slice(0, 5);
            
            const maxWeek = Math.max(...thisWeek.map(d => d.total), 1);
            const maxSeller = topSellers[0]?.total || 1;
            
            const body = `
                <div class="dashboard-section">
                    <h3>Ventas Últimos 7 Días</h3>
                    <div style="background: var(--color-bg-secondary); padding: var(--spacing-lg); border-radius: var(--radius-md); margin-top: var(--spacing-md);">
                        <div style="display: flex; align-items: flex-end; gap: 3px; height: 140px;">
                            ${thisWeek.map(day => {
                                const height = maxWeek > 0 ? (day.total / maxWeek * 100) : 0;
                                return `
                                    <div style="flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px;">
                                        <div style="flex: 1; display: flex; align-items: flex-end; width: 100%;">
                                            <div style="width: 100%; background: linear-gradient(180deg, var(--color-primary) 0%, var(--color-accent) 100%); 
                                                border-radius: var(--radius-xs) var(--radius-xs) 0 0; 
                                                height: ${height}%; 
                                                min-height: ${day.total > 0 ? '3px' : '0'};"></div>
                                        </div>
                                        <div style="font-size: 9px; color: var(--color-text-secondary); text-align: center;">
                                            <div>${day.date}</div>
                                            <div style="font-weight: 600; color: var(--color-text); margin-top: 2px; font-size: 10px;">${Utils.formatCurrency(day.total)}</div>
                                            <div style="font-size: 8px; color: var(--color-text-secondary);">${day.count}</div>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-lg); margin-top: var(--spacing-xl);">
                    <div>
                        <h3>Top Vendedores del Mes</h3>
                        <div style="background: var(--color-bg-secondary); padding: var(--spacing-md); border-radius: var(--radius-md); margin-top: var(--spacing-sm);">
                            ${topSellers.length > 0 ? topSellers.map((seller, idx) => {
                                const width = maxSeller > 0 ? (seller.total / maxSeller * 100) : 0;
                                return `
                                    <div style="margin-bottom: var(--spacing-sm);">
                                        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                                            <div>
                                                <span style="font-weight: 600; color: var(--color-primary); font-size: 10px;">#${idx + 1}</span>
                                                <span style="margin-left: var(--spacing-xs); font-weight: 600; font-size: 11px;">${seller.name}</span>
                                            </div>
                                            <span style="font-size: 12px; font-weight: 600;">${Utils.formatCurrency(seller.total)}</span>
                                        </div>
                                        <div style="width: 100%; height: 18px; background: var(--color-border-light); border-radius: var(--radius-full); overflow: hidden; position: relative;">
                                            <div style="width: ${width}%; height: 100%; background: linear-gradient(90deg, var(--color-primary) 0%, var(--color-accent) 100%);"></div>
                                            <div style="position: absolute; right: var(--spacing-xs); top: 50%; transform: translateY(-50%); font-size: 9px; color: var(--color-text-secondary);">
                                                ${seller.count}
                                            </div>
                                        </div>
                                    </div>
                                `;
                            }).join('') : '<p style="text-align: center; color: var(--color-text-secondary); padding: var(--spacing-md); font-size: 11px;">No hay datos</p>'}
                        </div>
                    </div>
                    
                    <div>
                        <h3>Top Productos del Mes</h3>
                        <div style="background: var(--color-bg-secondary); padding: var(--spacing-md); border-radius: var(--radius-md); margin-top: var(--spacing-sm);">
                            ${topProducts.length > 0 ? topProducts.map((product, idx) => {
                                const maxProduct = topProducts[0].revenue;
                                const width = maxProduct > 0 ? (product.revenue / maxProduct * 100) : 0;
                                return `
                                    <div style="margin-bottom: var(--spacing-sm);">
                                        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                                            <div>
                                                <span style="font-weight: 600; color: var(--color-accent); font-size: 10px;">#${idx + 1}</span>
                                                <span style="margin-left: var(--spacing-xs); font-weight: 600; font-size: 11px;">${product.name}</span>
                                            </div>
                                            <span style="font-size: 12px; font-weight: 600;">${Utils.formatCurrency(product.revenue)}</span>
                                        </div>
                                        <div style="width: 100%; height: 18px; background: var(--color-border-light); border-radius: var(--radius-full); overflow: hidden; position: relative;">
                                            <div style="width: ${width}%; height: 100%; background: linear-gradient(90deg, var(--color-accent) 0%, var(--color-primary) 100%);"></div>
                                            <div style="position: absolute; right: var(--spacing-xs); top: 50%; transform: translateY(-50%); font-size: 9px; color: var(--color-text-secondary);">
                                                ${product.qty}
                                            </div>
                                        </div>
                                    </div>
                                `;
                            }).join('') : '<p style="text-align: center; color: var(--color-text-secondary); padding: var(--spacing-md); font-size: 11px;">No hay datos</p>'}
                        </div>
                    </div>
                </div>
            `;
            
            UI.showModal('Estadísticas POS', body, '<button class="btn-primary" onclick="UI.closeModal()">Cerrar</button>');
        } catch (e) {
            console.error('Error showing POS stats:', e);
            Utils.showNotification('Error al cargar estadísticas', 'error');
        }
    }
};

// Exponer POS globalmente
window.POS = POS;

