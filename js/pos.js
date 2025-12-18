// POS Module - Point of Sale - Versión Avanzada

const POS = {
    initialized: false,
    listenersAttached: false,
    isProcessingSale: false,
    currentSale: null,
    cart: [],
    currentGuide: null,
    currentAgency: null,
    currentSeller: null,
    currentCustomer: null,
    currentDiscount: 0,
    favorites: [],
    pendingSales: [],
    lastSale: null,
    clockInterval: null,
    autoSaveInterval: null,
    isFullscreen: false,

    async init() {
        // Verificar permiso
        if (typeof PermissionManager !== 'undefined' && !PermissionManager.hasPermission('pos.view')) {
            const content = document.getElementById('module-content');
            if (content) {
                content.innerHTML = '<div style="padding: var(--spacing-lg); text-align: center; color: var(--color-text-secondary);">No tienes permiso para ver el módulo POS</div>';
            }
            return;
        }

        if (this.initialized) return;
        
        // Solo configurar listeners una vez
        if (!this.listenersAttached) {
            this.setupEventListeners();
            this.setupKeyboardShortcuts();
            this.listenersAttached = true;
        }
        
        await this.loadCatalogs();
        await this.ensureDemoProducts();
        await this.loadFavorites();
        await this.loadPendingSales();
        this.startClock();
        this.startAutoSave();
        this.restoreCart();
        await this.updateTodaySalesCount();
        this.initialized = true;
        console.log('POS Avanzado inicializado');
    },

    // ==================== CONFIGURACIÓN ====================

    setupEventListeners() {
        // Nota: El botón completar venta usa onclick en HTML, no agregar listener aquí
        
        // Payment inputs
        ['cash-usd', 'cash-mxn', 'cash-cad', 'tpv-visa', 'tpv-amex'].forEach(id => {
            const input = document.getElementById(`payment-${id}`);
            if (input) {
                input.addEventListener('input', () => this.calculatePayments());
                input.addEventListener('focus', function() { this.select(); });
            }
        });

        // Categorías con chips
        document.querySelectorAll('.pos-category-chip').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.pos-category-chip').forEach(b => b.classList.remove('active'));
                e.currentTarget.classList.add('active');
                this.loadProducts();
            });
        });

        // Vista toggle
        document.querySelectorAll('.pos-view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.pos-view-btn').forEach(b => b.classList.remove('active'));
                e.currentTarget.classList.add('active');
                this.changeView(e.currentTarget.dataset.view);
            });
        });

        // Búsqueda de productos
        const searchInput = document.getElementById('pos-product-search');
        if (searchInput) {
            searchInput.addEventListener('input', Utils.debounce(() => this.loadProducts(), 300));
            searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.quickAddBySearch(searchInput.value);
                }
            });
        }

        // Búsqueda de cliente
        const customerInput = document.getElementById('pos-customer-search');
        if (customerInput) {
            customerInput.addEventListener('input', Utils.debounce(() => this.searchCustomer(), 300));
        }

        // Filtros avanzados
        ['pos-metal-filter', 'pos-stone-filter', 'pos-min-price', 'pos-max-price'].forEach(id => {
            document.getElementById(id)?.addEventListener('change', () => this.loadProducts());
        });

        // Ordenamiento
        document.getElementById('pos-sort-by')?.addEventListener('change', () => this.loadProducts());

        // Recargar cuando se muestre el módulo
        window.addEventListener('module-loaded', (e) => {
            if (e.detail && e.detail.module === 'pos') {
                setTimeout(() => {
                    this.loadProducts();
                    this.updateTodaySalesCount();
                }, 100);
            }
        });

        // Chips de descuento
        document.querySelectorAll('.pos-discount-chip[data-discount]').forEach(chip => {
            chip.addEventListener('click', () => {
                const discount = parseInt(chip.dataset.discount);
                this.applyQuickDiscount(discount);
            });
        });
    },

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Solo si estamos en el módulo POS
            const posModule = document.getElementById('module-pos');
            if (!posModule || posModule.style.display === 'none') return;

            // F1 - Enfocar búsqueda
            if (e.key === 'F1') {
                e.preventDefault();
                document.getElementById('pos-product-search')?.focus();
            }
            // F2 - Favoritos
            if (e.key === 'F2') {
                e.preventDefault();
                this.showFavorites();
            }
            // F3 - Ventas pendientes
            if (e.key === 'F3') {
                e.preventDefault();
                this.showPendingSales();
            }
            // F4 - Historial
            if (e.key === 'F4') {
                e.preventDefault();
                this.showHistory();
            }
            // F5 - Pausar venta
            if (e.key === 'F5') {
                e.preventDefault();
                this.holdSale();
            }
            // F11 - Pantalla completa
            if (e.key === 'F11') {
                e.preventDefault();
                this.toggleFullscreen();
            }
            // F12 - Completar venta
            if (e.key === 'F12') {
                e.preventDefault();
                this.completeSale();
            }
            // Escape - Cerrar modales
            if (e.key === 'Escape') {
                this.closeQuickView();
                this.closeSuccessOverlay();
            }
            // ? - Mostrar atajos
            if (e.key === '?' && !e.ctrlKey && !e.altKey) {
                const activeElement = document.activeElement;
                if (activeElement.tagName !== 'INPUT' && activeElement.tagName !== 'TEXTAREA') {
                    e.preventDefault();
                    this.showShortcuts();
                }
            }
        });
    },

    // ==================== RELOJ Y CONTADORES ====================

    startClock() {
        const updateClock = () => {
            const now = new Date();
            const timeStr = now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            const clockEl = document.getElementById('pos-clock');
            if (clockEl) clockEl.textContent = timeStr;
        };
        updateClock();
        this.clockInterval = setInterval(updateClock, 1000);
    },

    async updateTodaySalesCount() {
        try {
            const sales = await DB.getAll('sales') || [];
            const today = new Date().toISOString().split('T')[0];
            const todaySales = sales.filter(s => 
                s.created_at?.startsWith(today) && s.status === 'completada'
            );
            const countEl = document.getElementById('pos-today-sales');
            if (countEl) countEl.textContent = todaySales.length;
        } catch (e) {
            console.error('Error actualizando contador:', e);
        }
    },

    // ==================== AUTO-GUARDADO ====================

    startAutoSave() {
        this.autoSaveInterval = setInterval(() => {
            if (this.cart.length > 0) {
                this.saveCartToStorage();
            }
        }, 30000); // Cada 30 segundos
    },

    saveCartToStorage() {
        try {
            const cartData = {
                cart: this.cart,
                guide: this.currentGuide,
                agency: this.currentAgency,
                seller: this.currentSeller,
                customer: this.currentCustomer,
                discount: this.currentDiscount,
                timestamp: Date.now()
            };
            localStorage.setItem('pos_cart_backup', JSON.stringify(cartData));
        } catch (e) {
            console.error('Error guardando carrito:', e);
        }
    },

    restoreCart() {
        try {
            const savedData = localStorage.getItem('pos_cart_backup');
            if (savedData) {
                const data = JSON.parse(savedData);
                // Solo restaurar si es del mismo día
                const savedDate = new Date(data.timestamp).toDateString();
                const today = new Date().toDateString();
                if (savedDate === today && data.cart?.length > 0) {
                    this.cart = data.cart;
                    this.currentGuide = data.guide;
                    this.currentAgency = data.agency;
                    this.currentSeller = data.seller;
                    this.currentCustomer = data.customer;
                    this.currentDiscount = data.discount || 0;
                    this.updateCartDisplay();
                    this.calculateTotals();
                    this.updateCustomerDisplay();
                    Utils.showNotification('Carrito restaurado', 'info');
                }
            }
        } catch (e) {
            console.error('Error restaurando carrito:', e);
        }
    },

    clearCartStorage() {
        localStorage.removeItem('pos_cart_backup');
    },

    // ==================== CATÁLOGOS Y PRODUCTOS ====================

    async loadCatalogs() {
        // Los catálogos se cargan bajo demanda
    },

    async ensureDemoProducts() {
        try {
            let items = await DB.getAll('inventory_items') || [];
            if (items.length === 0) {
                if (window.App && window.App.loadDemoInventory) {
                    await window.App.loadDemoInventory();
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
            }
            await this.loadProducts();
        } catch (e) {
            console.error('Error asegurando productos demo:', e);
            await this.loadProducts();
        }
    },

    async loadProducts() {
        const container = document.getElementById('pos-products-list');
        if (!container) return;

        // Mostrar loading
        container.innerHTML = `
            <div class="pos-loading-products">
                <div class="pos-loader"></div>
                <span>Cargando productos...</span>
            </div>
        `;

        try {
            const search = document.getElementById('pos-product-search')?.value.toLowerCase() || '';
            const category = document.querySelector('.pos-category-chip.active')?.dataset.category || 'all';
            const metalFilter = document.getElementById('pos-metal-filter')?.value || '';
            const stoneFilter = document.getElementById('pos-stone-filter')?.value || '';
            const minPrice = parseFloat(document.getElementById('pos-min-price')?.value) || 0;
            const maxPrice = parseFloat(document.getElementById('pos-max-price')?.value) || Infinity;
            const sortBy = document.getElementById('pos-sort-by')?.value || 'name';

            // Obtener items filtrados por sucursal (con fallback a items sin branch_id)
            let items = await DB.getAll('inventory_items', null, null, { 
                filterByBranch: true, 
                branchIdField: 'branch_id',
                includeNull: true  // Incluir items sin branch_id como fallback
            }) || [];
            
            // Filtrar solo disponibles
            items = items.filter(item => item && item.status === 'disponible');

            // Filtro de búsqueda
            if (search) {
                items = items.filter(item => 
                    item.sku?.toLowerCase().includes(search) ||
                    item.name?.toLowerCase().includes(search) ||
                    item.barcode?.includes(search) ||
                    item.metal?.toLowerCase().includes(search) ||
                    item.stone?.toLowerCase().includes(search)
                );
            }

            // Filtro de categoría
            if (category && category !== 'all') {
                items = items.filter(item => 
                    item.category?.toLowerCase() === category.toLowerCase() ||
                    item.name?.toLowerCase().includes(category.toLowerCase())
                );
            }

            // Filtro de metal
            if (metalFilter) {
                items = items.filter(item => item.metal === metalFilter);
            }

            // Filtro de piedra
            if (stoneFilter) {
                items = items.filter(item => item.stone === stoneFilter);
            }

            // Filtro de precio
            items = items.filter(item => {
                const price = item.cost || 0;
                return price >= minPrice && price <= maxPrice;
            });

            // Ordenar
            items.sort((a, b) => {
                switch (sortBy) {
                    case 'price-asc': return (a.cost || 0) - (b.cost || 0);
                    case 'price-desc': return (b.cost || 0) - (a.cost || 0);
                    case 'recent': return new Date(b.created_at || 0) - new Date(a.created_at || 0);
                    default: return (a.name || '').localeCompare(b.name || '');
                }
            });

            // Actualizar contador
            const countEl = document.getElementById('pos-products-count');
            if (countEl) countEl.textContent = `${items.length} producto${items.length !== 1 ? 's' : ''} encontrado${items.length !== 1 ? 's' : ''}`;

            if (items.length === 0) {
                container.innerHTML = `
                    <div class="pos-loading-products">
                        <i class="fas fa-search" style="font-size: 48px; opacity: 0.3; margin-bottom: 16px;"></i>
                        <span>No se encontraron productos</span>
                    </div>
                `;
                return;
            }

            // Cargar fotos
            const itemsWithPhotos = await Promise.all(items.map(async (item) => {
                try {
                    const photos = await DB.query('inventory_photos', 'item_id', item.id);
                    const photo = photos && photos.length > 0 ? photos[0] : null;
                    return { ...item, photo: photo?.thumbnail_blob || photo?.photo_blob || null };
                } catch (e) {
                    return { ...item, photo: null };
                }
            }));

            // Renderizar productos
            container.innerHTML = itemsWithPhotos.map(item => this.renderProductCard(item)).join('');

        } catch (e) {
            console.error('Error loading products:', e);
            container.innerHTML = `
                <div class="pos-loading-products">
                    <i class="fas fa-exclamation-triangle" style="font-size: 48px; color: #ef4444; margin-bottom: 16px;"></i>
                    <span>Error al cargar productos: ${e.message}</span>
                </div>
            `;
        }
    },

    renderProductCard(item) {
        const isInCart = this.cart.find(c => c.id === item.id);
                const itemId = String(item.id).replace(/'/g, "\\'");
                const itemName = (item.name || 'Sin nombre').replace(/'/g, "&#39;").replace(/"/g, "&quot;");
        const itemSku = (item.sku || item.barcode || 'N/A').replace(/'/g, "&#39;");
                
                return `
            <div class="pos-product-card ${isInCart ? 'in-cart' : ''}" data-item-id="${itemId}">
                <div class="pos-product-card-image" onclick="window.POS.showQuickView('${itemId}')">
                            ${item.photo ? 
                        `<img src="${item.photo}" alt="${itemName}" onerror="this.parentElement.innerHTML='<div class=\\'pos-product-card-placeholder\\'><i class=\\'fas fa-gem\\'></i></div>'">` :
                        `<div class="pos-product-card-placeholder"><i class="fas fa-gem"></i></div>`
                            }
                    ${item.certificate ? '<div class="pos-product-card-badge">Certificado</div>' : ''}
                        </div>
                <div class="pos-product-card-body">
                    <div class="pos-product-card-name">${itemName}</div>
                    <div class="pos-product-card-sku">${itemSku}</div>
                    <div class="pos-product-card-details">
                        ${item.metal ? `<span class="pos-product-card-tag">${item.metal}</span>` : ''}
                        ${item.stone && item.stone !== 'Sin piedra' ? `<span class="pos-product-card-tag">${item.stone}</span>` : ''}
                        ${item.size ? `<span class="pos-product-card-tag">Talla ${item.size}</span>` : ''}
                    </div>
                    ${(() => {
                        const stockActual = item.stock_actual ?? 1;
                        const stockMin = item.stock_min ?? 1;
                        const stockStatus = stockActual <= 0 ? 'out' : (stockActual < stockMin ? 'low' : 'ok');
                        const stockBadgeClass = stockStatus === 'out' ? 'stock-badge-out' : (stockStatus === 'low' ? 'stock-badge-low' : 'stock-badge-ok');
                        const stockText = stockActual <= 0 ? 'Agotado' : (stockActual < stockMin ? 'Stock Bajo' : `Stock: ${stockActual}`);
                        return `
                        <div class="pos-product-card-stock" style="margin: 4px 0; font-size: 10px;">
                            <span class="stock-badge ${stockBadgeClass}" style="padding: 2px 6px;">${stockText}</span>
                        </div>
                        `;
                    })()}
                    <div class="pos-product-card-price">
                        ${Utils.formatCurrency(item.cost || 0)}
                        <small>costo</small>
                    </div>
                    <div class="pos-product-card-actions">
                        <button class="pos-product-quick-add" onclick="event.stopPropagation(); window.POS.selectProduct('${itemId}')">
                            <i class="fas fa-plus"></i> Agregar
                        </button>
                        <button class="pos-product-quick-view" onclick="event.stopPropagation(); window.POS.showQuickView('${itemId}')" title="Vista Rápida">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                        </div>
                    </div>
                `;
    },

    changeView(view) {
        const container = document.getElementById('pos-products-list');
        if (!container) return;
        
        if (view === 'list') {
            container.style.gridTemplateColumns = '1fr';
        } else {
            container.style.gridTemplateColumns = 'repeat(auto-fill, minmax(180px, 1fr))';
        }
    },

    // ==================== CARRITO ====================

    async selectProduct(itemId) {
        try {
            const item = await DB.get('inventory_items', itemId);
            if (!item) {
                Utils.showNotification('Producto no encontrado', 'error');
                return;
            }

            // Verificar si ya está en el carrito
            if (this.cart.find(c => c.id === item.id)) {
                Utils.showNotification('La pieza ya está en el carrito', 'warning');
                return;
            }

            // Verificar disponibilidad y stock
            if (item.status !== 'disponible') {
                Utils.showNotification(`Pieza ${item.status}`, 'error');
                return;
            }
            
            // Verificar stock disponible
            const stockActual = item.stock_actual ?? 1;
            if (stockActual <= 0) {
                Utils.showNotification('Producto sin stock disponible', 'error');
                return;
            }

            // Cargar foto
            let photo = null;
            try {
                const photos = await DB.query('inventory_photos', 'item_id', item.id);
                photo = photos && photos.length > 0 ? photos[0]?.thumbnail_blob || photos[0]?.photo_blob : null;
            } catch (e) {}

            // Agregar al carrito
            const cartItem = {
                ...item,
                photo: photo,
                price: item.cost || 0,
                quantity: 1,
                discount: this.currentDiscount,
                subtotal: (item.cost || 0) * (1 - this.currentDiscount / 100)
            };

            this.cart.push(cartItem);
            this.updateCartDisplay();
            this.calculateTotals();
            this.updateProductCard(item.id, true);
            this.saveCartToStorage();
            
            // Animación de éxito
            Utils.showNotification(`${item.name || 'Pieza'} agregada al carrito`, 'success');

        } catch (e) {
            console.error('Error selecting product:', e);
            Utils.showNotification('Error al agregar producto', 'error');
        }
    },

    async quickAddBySearch(query) {
        if (!query) return;
        
        try {
            const items = await DB.getAll('inventory_items') || [];
            const match = items.find(item => 
                item.status === 'disponible' && (
                    item.sku?.toLowerCase() === query.toLowerCase() ||
                    item.barcode === query
                )
            );

            if (match) {
                await this.selectProduct(match.id);
                document.getElementById('pos-product-search').value = '';
            } else {
                Utils.showNotification('Producto no encontrado', 'warning');
            }
        } catch (e) {
            console.error('Error en búsqueda rápida:', e);
        }
    },

    updateProductCard(itemId, inCart) {
        const card = document.querySelector(`.pos-product-card[data-item-id="${itemId}"]`);
        if (card) {
            if (inCart) {
                card.classList.add('in-cart');
            } else {
                card.classList.remove('in-cart');
            }
        }
    },

    removeFromCart(itemId) {
        const index = this.cart.findIndex(c => c.id === itemId);
        if (index > -1) {
            this.cart.splice(index, 1);
        this.updateCartDisplay();
        this.calculateTotals();
            this.updateProductCard(itemId, false);
            this.saveCartToStorage();
        }
    },

    async clearCart() {
        if (this.cart.length === 0) return;
        
        if (await Utils.confirm('¿Estás seguro de vaciar el carrito?')) {
            const itemIds = this.cart.map(c => c.id);
            this.cart = [];
            this.updateCartDisplay();
            this.calculateTotals();
            itemIds.forEach(id => this.updateProductCard(id, false));
            this.clearCartStorage();
            Utils.showNotification('Carrito vaciado', 'info');
        }
    },

    updateCartDisplay() {
        const container = document.getElementById('pos-cart-items');
        const countEl = document.getElementById('pos-cart-count');
        
        if (countEl) countEl.textContent = `(${this.cart.length})`;
        
        if (!container) return;

        if (this.cart.length === 0) {
            container.innerHTML = `
                <div class="pos-cart-empty">
                    <i class="fas fa-shopping-basket"></i>
                    <p>El carrito está vacío</p>
                    <span>Selecciona productos para agregar</span>
                </div>
            `;
            return;
        }

        container.innerHTML = this.cart.map(item => `
            <div class="pos-cart-item-advanced" data-item-id="${item.id}">
                <div class="pos-cart-item-main">
                    <div class="pos-cart-item-image">
                        ${item.photo ? 
                            `<img src="${item.photo}" alt="${item.name}">` :
                            `<div class="pos-cart-item-image-placeholder"><i class="fas fa-gem"></i></div>`
                        }
                        </div>
                    <div class="pos-cart-item-info">
                        <div class="pos-cart-item-name">${item.name || 'Sin nombre'}</div>
                        <div class="pos-cart-item-sku">${item.sku || item.barcode || 'N/A'}</div>
                        <div class="pos-cart-item-price-row">
                            <div class="pos-cart-item-qty">
                        <button onclick="window.POS.updateQuantity('${item.id}', ${item.quantity - 1})">-</button>
                        <input type="number" value="${item.quantity}" min="1" 
                               onchange="window.POS.updateQuantity('${item.id}', parseInt(this.value))">
                        <button onclick="window.POS.updateQuantity('${item.id}', ${item.quantity + 1})">+</button>
                    </div>
                            <input type="number" class="pos-cart-item-price-input" value="${item.price}" step="0.01" min="0"
                                   onchange="window.POS.updateItemPrice('${item.id}', parseFloat(this.value))"
                                   placeholder="Precio">
                            <div class="pos-cart-item-total">${Utils.formatCurrency(item.subtotal)}</div>
                    </div>
                </div>
                    <button class="pos-cart-item-remove" onclick="window.POS.removeFromCart('${item.id}')" title="Eliminar">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        `).join('');
    },

    updateQuantity(itemId, newQuantity) {
        if (newQuantity < 1) {
            this.removeFromCart(itemId);
            return;
        }
        const item = this.cart.find(c => c.id === itemId);
        if (item) {
            item.quantity = newQuantity;
            item.subtotal = item.price * item.quantity * (1 - (item.discount || 0) / 100);
            this.updateCartDisplay();
            this.calculateTotals();
            this.saveCartToStorage();
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
            this.saveCartToStorage();
        }
    },

    // ==================== DESCUENTOS ====================

    applyQuickDiscount(percent) {
        if (percent > 0 && typeof PermissionManager !== 'undefined' && !PermissionManager.hasPermission('pos.apply_discount')) {
            Utils.showNotification('No tienes permiso para aplicar descuentos', 'error');
            return;
        }
        
        this.currentDiscount = percent;
        
        // Actualizar chips de descuento
        document.querySelectorAll('.pos-discount-chip[data-discount]').forEach(chip => {
            const chipDiscount = parseInt(chip.dataset.discount);
            if (chipDiscount === percent) {
                chip.classList.add('active');
            } else {
                chip.classList.remove('active');
            }
        });

        // Aplicar a todos los items
        this.cart.forEach(item => {
            item.discount = percent;
            item.subtotal = item.price * item.quantity * (1 - percent / 100);
        });

        this.updateCartDisplay();
        this.calculateTotals();
        this.saveCartToStorage();

        if (percent > 0) {
        Utils.showNotification(`Descuento del ${percent}% aplicado`, 'success');
        }
    },

    removeDiscount() {
        this.applyQuickDiscount(0);
        Utils.showNotification('Descuentos removidos', 'info');
    },

    async showCustomDiscount() {
        const percent = await Utils.prompt('Ingrese el porcentaje de descuento (0-100):', '', 'Descuento personalizado');
        if (percent !== null) {
            const value = parseInt(percent);
            if (!isNaN(value) && value >= 0 && value <= 100) {
                this.applyQuickDiscount(value);
        } else {
                Utils.showNotification('Porcentaje inválido', 'error');
            }
        }
    },

    // ==================== CÁLCULOS ====================

    calculateTotals() {
        const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const discountAmount = this.cart.reduce((sum, item) => sum + (item.price * item.quantity * (item.discount || 0) / 100), 0);
        const total = subtotal - discountAmount;

        // Actualizar displays
        const subtotalEl = document.getElementById('pos-subtotal');
        const totalEl = document.getElementById('pos-total');
        const discountDisplay = document.getElementById('pos-discount-display');
        const discountPercentEl = document.getElementById('pos-discount-percent');
        const discountAmountEl = document.getElementById('pos-discount-amount');

        if (subtotalEl) subtotalEl.textContent = Utils.formatCurrency(subtotal);
        if (totalEl) totalEl.textContent = Utils.formatCurrency(total);

        // Mostrar/ocultar fila de descuento
        if (discountDisplay) {
            if (this.currentDiscount > 0) {
                discountDisplay.style.display = 'flex';
                if (discountPercentEl) discountPercentEl.textContent = this.currentDiscount;
                if (discountAmountEl) discountAmountEl.textContent = Utils.formatCurrency(discountAmount);
            } else {
                discountDisplay.style.display = 'none';
            }
        }
    },

    async calculatePayments() {
        try {
            const cashUsd = parseFloat(document.getElementById('payment-cash-usd')?.value || 0);
            const cashMxn = parseFloat(document.getElementById('payment-cash-mxn')?.value || 0);
            const cashCad = parseFloat(document.getElementById('payment-cash-cad')?.value || 0);
            const tpvVisa = parseFloat(document.getElementById('payment-tpv-visa')?.value || 0);
            const tpvAmex = parseFloat(document.getElementById('payment-tpv-amex')?.value || 0);

            // Obtener tipos de cambio del día actual
            const today = Utils.formatDate(new Date(), 'YYYY-MM-DD');
            const exchangeRates = await ExchangeRates.getExchangeRate(today);
            const exchangeRate = exchangeRates.usd;
            const exchangeRateCadValue = exchangeRates.cad;

            // Convertir todo a MXN
            let totalPayments = 0;
            totalPayments += cashUsd * exchangeRate;
            totalPayments += cashMxn;
            totalPayments += cashCad * exchangeRateCadValue;
            totalPayments += tpvVisa;
            totalPayments += tpvAmex;

            const total = this.cart.reduce((sum, item) => sum + item.subtotal, 0);
            const difference = totalPayments - total;

            // Actualizar displays
            const paymentsTotalEl = document.getElementById('payments-total');
            const diffEl = document.getElementById('payments-difference');
            const labelEl = document.getElementById('pos-change-label');

            if (paymentsTotalEl) paymentsTotalEl.textContent = Utils.formatCurrency(totalPayments);
            
            if (diffEl) {
                diffEl.textContent = Utils.formatCurrency(Math.abs(difference));
                diffEl.classList.remove('negative', 'positive', 'exact');
                
                if (difference === 0) {
                    diffEl.classList.add('exact');
                    if (labelEl) labelEl.textContent = 'Exacto:';
                } else if (difference > 0) {
                    diffEl.classList.add('positive');
                    if (labelEl) labelEl.textContent = 'Cambio:';
                } else {
                    diffEl.classList.add('negative');
                    if (labelEl) labelEl.textContent = 'Faltante:';
                }
            }
        } catch (e) {
            console.error('Error calculating payments:', e);
        }
    },

    async payExact(currency) {
        const total = this.cart.reduce((sum, item) => sum + item.subtotal, 0);
        
        if (currency === 'USD') {
            // Obtener tipo de cambio del día actual
            const today = Utils.formatDate(new Date(), 'YYYY-MM-DD');
            const exchangeRates = await ExchangeRates.getExchangeRate(today);
            const rate = exchangeRates.usd;
            const usdAmount = total / rate;
            document.getElementById('payment-cash-usd').value = usdAmount.toFixed(2);
        } else {
            document.getElementById('payment-cash-mxn').value = total.toFixed(2);
        }
        
        this.calculatePayments();
    },

    // ==================== PAGOS Y VENTAS ====================

    togglePayments() {
        const content = document.getElementById('pos-payments-content');
        const toggle = document.getElementById('pos-payments-toggle');
        
        if (content) {
            content.classList.toggle('open');
            if (toggle) {
                toggle.style.transform = content.classList.contains('open') ? 'rotate(180deg)' : 'rotate(0)';
            }
        }
    },

    async completeSale() {
        // Verificar permiso
        if (typeof PermissionManager !== 'undefined' && !PermissionManager.hasPermission('pos.create_sale')) {
            Utils.showNotification('No tienes permiso para crear ventas', 'error');
            return;
        }

        // Evitar llamadas múltiples simultáneas
        if (this.isProcessingSale) {
            console.log('Venta ya en proceso, ignorando llamada duplicada');
            return;
        }
        
        if (this.cart.length === 0) {
            Utils.showNotification('El carrito está vacío', 'error');
            return;
        }

        this.isProcessingSale = true;
        
        try {
        // Validar pagos
        await this.calculatePayments();
        const total = this.cart.reduce((sum, item) => sum + item.subtotal, 0);
        const totalPayments = parseFloat(document.getElementById('payments-total')?.textContent.replace(/[^0-9.-]/g, '') || 0);
        
        if (Math.abs(totalPayments - total) > 0.01 && totalPayments < total) {
            if (!await Utils.confirm(`Falta ${Utils.formatCurrency(total - totalPayments)} por pagar. ¿Continuar de todos modos?`)) {
                return;
            }
        }

        // Notificaciones informativas (no bloquean la venta)
        const warnings = [];
        if (!this.currentGuide) warnings.push('Sin guía');
        if (!this.currentSeller) warnings.push('Sin vendedor');
        if (!this.currentAgency) warnings.push('Sin agencia');
        
        if (warnings.length > 0) {
            Utils.showNotification(`Venta ${warnings.join(', ')}`, 'warning');
        }

        // Obtener datos
        const branchId = typeof BranchManager !== 'undefined' 
            ? BranchManager.getCurrentBranchId() 
            : localStorage.getItem('current_branch_id') || 'default';
        // Usar vendedor escaneado, o si no hay, el usuario logueado como fallback
        const sellerId = this.currentSeller?.id || UserManager.currentUser?.employee_id || null;
        const agencyId = this.currentAgency?.id || null;
        const guideId = this.currentGuide?.id || null;
        const customerId = this.currentCustomer?.id || null;
        const currency = 'MXN';
        // Obtener tipo de cambio del día actual
        const today = Utils.formatDate(new Date(), 'YYYY-MM-DD');
        const exchangeRates = await ExchangeRates.getExchangeRate(today);
        const exchangeRate = exchangeRates.usd;

        // Generar folio
        const branch = await DB.get('catalog_branches', branchId);
        const branchCode = branch?.name.replace(/\s+/g, '').substring(0, 3).toUpperCase() || 'SUC';
        const folio = Utils.generateFolio(branchCode);

        // Crear venta
        const sale = {
            id: Utils.generateId(),
            folio: folio,
            branch_id: branchId,
            seller_id: sellerId,
            agency_id: agencyId,
            guide_id: guideId,
            passengers: 1,
            customer_id: customerId,
            currency: currency,
            exchange_rate: exchangeRate,
            subtotal: this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
            discount: this.cart.reduce((sum, item) => sum + (item.price * item.quantity * (item.discount || 0) / 100), 0),
            total: total,
            status: 'completada',
            notes: '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            sync_status: 'pending'
        };

        await DB.add('sales', sale);

        // Crear items de venta
        for (const item of this.cart) {
            // Obtener item actualizado de la BD para obtener el costo
            const currentItem = await DB.get('inventory_items', item.id);
            const itemCost = currentItem?.cost || 0; // Costo de adquisición del item
            
            await DB.add('sale_items', {
                id: Utils.generateId(),
                sale_id: sale.id,
                item_id: item.id,
                quantity: item.quantity,
                price: item.price, // Precio de venta
                cost: itemCost, // Costo de adquisición (COGS)
                discount: item.discount,
                subtotal: item.subtotal,
                created_at: new Date().toISOString()
            });

            // Obtener item actualizado de la BD (ya lo tenemos arriba, pero lo mantenemos para consistencia)
            if (!currentItem) continue;
            
            // Actualizar stock y estado del inventario
            const newStock = Math.max(0, (currentItem.stock_actual ?? 1) - item.quantity);
            await DB.put('inventory_items', {
                ...currentItem,
                stock_actual: newStock,
                status: 'vendida',
                updated_at: new Date().toISOString()
            });

            // Log de inventario con información de stock
            await DB.add('inventory_logs', {
                id: Utils.generateId(),
                item_id: item.id,
                action: 'vendida',
                quantity: item.quantity,
                stock_before: currentItem.stock_actual ?? 1,
                stock_after: newStock,
                reason: 'venta',
                notes: `Venta ${folio} - Cantidad: ${item.quantity}`,
                created_at: new Date().toISOString()
            });
        }

        // Crear pagos
        await this.savePayments(sale.id);

        // Agregar a cola de sincronización
        await SyncManager.addToQueue('sale', sale.id);

        // Guardar última venta
        this.lastSale = sale;

        // Imprimir ticket (siempre intentar, incluso si hay errores)
        try {
            await Printer.printTicket(sale);
        } catch (e) {
            console.error('Error crítico al imprimir ticket:', e);
            // No bloquear la venta por error de impresión
            Utils.showNotification('Venta completada, pero hubo un error al imprimir. Puedes reimprimir desde el historial.', 'warning');
        }

        // Mostrar overlay de éxito
        this.showSuccessOverlay(sale);

        // Reset
        const itemIds = this.cart.map(c => c.id);
        this.resetForm();
        itemIds.forEach(id => this.updateProductCard(id, false));
        await this.updateTodaySalesCount();
        await this.loadProducts();

        // Las ventas ya contienen toda la información (vendedor, guía, agencia, productos, pagos)
        // No es necesario agregar al módulo de llegadas, ya que las llegadas se registran por separado
        } finally {
            this.isProcessingSale = false;
        }
    },

    async savePayments(saleId) {
        const cashUsd = parseFloat(document.getElementById('payment-cash-usd')?.value || 0);
        const cashMxn = parseFloat(document.getElementById('payment-cash-mxn')?.value || 0);
        const cashCad = parseFloat(document.getElementById('payment-cash-cad')?.value || 0);
        const tpvVisa = parseFloat(document.getElementById('payment-tpv-visa')?.value || 0);
        const tpvAmex = parseFloat(document.getElementById('payment-tpv-amex')?.value || 0);
        const tpvVisaBank = document.getElementById('payment-tpv-visa-bank')?.value || 'banamex';
        const tpvVisaType = document.getElementById('payment-tpv-visa-type')?.value || 'national';
        const tpvAmexBank = document.getElementById('payment-tpv-amex-bank')?.value || 'banamex';
        const tpvAmexType = document.getElementById('payment-tpv-amex-type')?.value || 'national';

        const paymentMethods = await DB.getAll('payment_methods') || [];
        const getMethodId = (code) => paymentMethods.find(m => m.code === code)?.id || code;

        // Función para calcular comisión bancaria
        const calculateBankCommission = async (amount, bank, paymentType) => {
            if (amount <= 0) return 0;
            
            const bankKey = `bank_commission_${bank}_${paymentType}`;
            const commissionSetting = await DB.get('settings', bankKey);
            const commissionRate = commissionSetting?.value || 0;
            
            return (amount * commissionRate) / 100;
        };

        if (cashUsd > 0) {
            await DB.add('payments', { 
                id: Utils.generateId(), 
                sale_id: saleId, 
                method_id: getMethodId('CASH_USD'), 
                amount: cashUsd, 
                currency: 'USD', 
                created_at: new Date().toISOString() 
            });
        }
        if (cashMxn > 0) {
            await DB.add('payments', { 
                id: Utils.generateId(), 
                sale_id: saleId, 
                method_id: getMethodId('CASH_MXN'), 
                amount: cashMxn, 
                currency: 'MXN', 
                created_at: new Date().toISOString() 
            });
        }
        if (cashCad > 0) {
            await DB.add('payments', { 
                id: Utils.generateId(), 
                sale_id: saleId, 
                method_id: getMethodId('CASH_CAD'), 
                amount: cashCad, 
                currency: 'CAD', 
                created_at: new Date().toISOString() 
            });
        }
        if (tpvVisa > 0) {
            const bankCommission = await calculateBankCommission(tpvVisa, tpvVisaBank, tpvVisaType);
            await DB.add('payments', { 
                id: Utils.generateId(), 
                sale_id: saleId, 
                method_id: getMethodId('TPV_VISA'), 
                amount: tpvVisa, 
                currency: 'MXN',
                bank: tpvVisaBank,
                payment_type: tpvVisaType,
                bank_commission: bankCommission,
                created_at: new Date().toISOString() 
            });
        }
        if (tpvAmex > 0) {
            const bankCommission = await calculateBankCommission(tpvAmex, tpvAmexBank, tpvAmexType);
            await DB.add('payments', { 
                id: Utils.generateId(), 
                sale_id: saleId, 
                method_id: getMethodId('TPV_AMEX'), 
                amount: tpvAmex, 
                currency: 'MXN',
                bank: tpvAmexBank,
                payment_type: tpvAmexType,
                bank_commission: bankCommission,
                created_at: new Date().toISOString() 
            });
        }
    },

    showSuccessOverlay(sale) {
        const overlay = document.getElementById('pos-success-overlay');
        const folioEl = document.getElementById('pos-success-folio');
        const totalEl = document.getElementById('pos-success-total');

        if (overlay) {
            if (folioEl) folioEl.textContent = `Folio: ${sale.folio}`;
            if (totalEl) totalEl.textContent = Utils.formatCurrency(sale.total);
            overlay.style.display = 'flex';
        }
    },

    closeSuccessOverlay() {
        const overlay = document.getElementById('pos-success-overlay');
        if (overlay) overlay.style.display = 'none';
    },

    async printLastTicket() {
        if (this.lastSale) {
            await Printer.printTicket(this.lastSale);
        }
        this.closeSuccessOverlay();
    },

    // ==================== BORRADOR Y APARTAR ====================

    async saveDraft() {
        if (this.cart.length === 0) {
            Utils.showNotification('El carrito está vacío', 'error');
            return;
        }

        const branchId = typeof BranchManager !== 'undefined' 
            ? BranchManager.getCurrentBranchId() 
            : localStorage.getItem('current_branch_id') || 'default';
        const branch = await DB.get('catalog_branches', branchId);
        const branchCode = branch?.name.replace(/\s+/g, '').substring(0, 3).toUpperCase() || 'SUC';
        const folio = Utils.generateFolio(branchCode);
        const total = this.cart.reduce((sum, item) => sum + item.subtotal, 0);

        const sale = {
            id: Utils.generateId(),
            folio: folio,
            branch_id: branchId,
            seller_id: UserManager.currentUser?.employee_id || null,
            agency_id: this.currentAgency?.id || null,
            guide_id: this.currentGuide?.id || null,
            customer_id: this.currentCustomer?.id || null,
            total: total,
            status: 'borrador',
            cart_data: JSON.stringify(this.cart),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            sync_status: 'pending'
        };

        await DB.add('sales', sale);
        await SyncManager.addToQueue('sale', sale.id);
        
        Utils.showNotification(`Borrador guardado: ${folio}`, 'success');
        this.resetForm();
        await this.loadPendingSales();
    },

    async reserveSale() {
        if (this.cart.length === 0) {
            Utils.showNotification('El carrito está vacío', 'error');
            return;
        }

        // Validar pagos (anticipo)
        await this.calculatePayments();
        const totalPayments = parseFloat(document.getElementById('payments-total')?.textContent.replace(/[^0-9.-]/g, '') || 0);
        
        if (totalPayments <= 0) {
            if (!await Utils.confirm('No hay anticipo registrado. ¿Continuar?')) {
                return;
            }
        }

        const branchId = typeof BranchManager !== 'undefined' 
            ? BranchManager.getCurrentBranchId() 
            : localStorage.getItem('current_branch_id') || 'default';
        const branch = await DB.get('catalog_branches', branchId);
        const branchCode = branch?.name.replace(/\s+/g, '').substring(0, 3).toUpperCase() || 'SUC';
        const folio = Utils.generateFolio(branchCode);
        const total = this.cart.reduce((sum, item) => sum + item.subtotal, 0);

        const sale = {
            id: Utils.generateId(),
            folio: folio,
            branch_id: branchId,
            seller_id: UserManager.currentUser?.employee_id || null,
            agency_id: this.currentAgency?.id || null,
            guide_id: this.currentGuide?.id || null,
            customer_id: this.currentCustomer?.id || null,
            subtotal: this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
            discount: this.cart.reduce((sum, item) => sum + (item.price * item.quantity * (item.discount || 0) / 100), 0),
            total: total,
            status: 'apartada',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            sync_status: 'pending'
        };

        await DB.add('sales', sale);

        // Guardar items y actualizar inventario
        for (const item of this.cart) {
            // Obtener item actualizado para obtener el costo
            const currentItem = await DB.get('inventory_items', item.id);
            const itemCost = currentItem?.cost || 0; // Costo de adquisición del item
            
            await DB.add('sale_items', {
                id: Utils.generateId(),
                sale_id: sale.id,
                item_id: item.id,
                quantity: item.quantity,
                price: item.price, // Precio de venta
                cost: itemCost, // Costo de adquisición (COGS)
                discount: item.discount,
                subtotal: item.subtotal,
                created_at: new Date().toISOString()
            });

            // Obtener item actualizado (ya lo tenemos arriba, pero lo mantenemos para consistencia)
            if (currentItem) {
                // No reducimos stock al apartar, solo cambiamos estado
                await DB.put('inventory_items', { 
                    ...currentItem, 
                    status: 'apartada',
                    updated_at: new Date().toISOString()
                });
                
                // Log de apartado
                await DB.add('inventory_logs', {
                    id: Utils.generateId(),
                    item_id: item.id,
                    action: 'apartada',
                    quantity: 0,
                    notes: `Apartado ${folio}`,
                    created_at: new Date().toISOString()
                });
            }
        }

        // Guardar pagos (anticipo)
        await this.savePayments(sale.id);

        await SyncManager.addToQueue('sale', sale.id);
        Utils.showNotification(`Apartado creado: ${folio}`, 'success');
        
        const itemIds = this.cart.map(c => c.id);
        this.resetForm();
        itemIds.forEach(id => this.updateProductCard(id, false));
        await this.loadProducts();
    },

    // ==================== PAUSAR/RETOMAR VENTAS ====================

    async holdSale() {
        if (this.cart.length === 0) {
            Utils.showNotification('El carrito está vacío', 'info');
            return;
        }

        const pendingSale = {
            id: Utils.generateId(),
            cart: [...this.cart],
            guide: this.currentGuide,
            agency: this.currentAgency,
            seller: this.currentSeller,
            customer: this.currentCustomer,
            discount: this.currentDiscount,
            timestamp: Date.now()
        };

        this.pendingSales.push(pendingSale);
        await this.savePendingSales();
        this.updatePendingCount();

        Utils.showNotification('Venta pausada', 'success');
        
        const itemIds = this.cart.map(c => c.id);
        this.resetForm();
        itemIds.forEach(id => this.updateProductCard(id, false));
    },

    async resumeSale(saleId) {
        const sale = this.pendingSales.find(s => s.id === saleId);
        if (!sale) return;

        // Restaurar carrito
        this.cart = sale.cart;
        this.currentGuide = sale.guide;
        this.currentAgency = sale.agency;
        this.currentSeller = sale.seller;
        this.currentCustomer = sale.customer;
        this.currentDiscount = sale.discount || 0;

        // Remover de pendientes
        this.pendingSales = this.pendingSales.filter(s => s.id !== saleId);
        await this.savePendingSales();
        this.updatePendingCount();

        // Actualizar UI
        this.updateCartDisplay();
        this.calculateTotals();
        this.updateCustomerDisplay();
        this.cart.forEach(item => this.updateProductCard(item.id, true));

        Utils.showNotification('Venta retomada', 'success');
        UI.closeModal();
    },

    async deletePendingSale(saleId) {
        if (!await Utils.confirm('¿Eliminar esta venta pendiente?')) return;
        
        this.pendingSales = this.pendingSales.filter(s => s.id !== saleId);
        await this.savePendingSales();
        this.updatePendingCount();
        this.showPendingSales();
    },

    async savePendingSales() {
        localStorage.setItem('pos_pending_sales', JSON.stringify(this.pendingSales));
    },

    async loadPendingSales() {
        try {
            const saved = localStorage.getItem('pos_pending_sales');
            this.pendingSales = saved ? JSON.parse(saved) : [];
            this.updatePendingCount();
        } catch (e) {
            this.pendingSales = [];
        }
    },

    updatePendingCount() {
        const el = document.getElementById('pending-count');
        if (el) {
            el.textContent = this.pendingSales.length;
            el.style.display = this.pendingSales.length > 0 ? 'flex' : 'none';
        }
    },

    showPendingSales() {
        if (this.pendingSales.length === 0) {
            Utils.showNotification('No hay ventas pendientes', 'info');
            return;
        }

        const body = `
            <div style="max-height: 400px; overflow-y: auto;">
                ${this.pendingSales.map(sale => `
                    <div style="padding: 16px; background: var(--color-bg-secondary); border-radius: 8px; margin-bottom: 12px; border: 1px solid var(--color-border-light);">
                        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
                            <div>
                                <strong>${sale.cart.length} producto${sale.cart.length !== 1 ? 's' : ''}</strong>
                                <div style="font-size: 11px; color: var(--color-text-secondary); margin-top: 4px;">
                                    ${new Date(sale.timestamp).toLocaleString('es-MX')}
                                </div>
                            </div>
                            <strong style="color: var(--color-primary);">
                                ${Utils.formatCurrency(sale.cart.reduce((sum, item) => sum + item.subtotal, 0))}
                            </strong>
                        </div>
                        <div style="font-size: 12px; color: var(--color-text-secondary); margin-bottom: 12px;">
                            ${sale.cart.map(item => item.name || item.sku).join(', ')}
                        </div>
                        <div style="display: flex; gap: 8px;">
                            <button class="btn-primary btn-sm" onclick="window.POS.resumeSale('${sale.id}')">
                                <i class="fas fa-play"></i> Retomar
                            </button>
                            <button class="btn-danger btn-sm" onclick="window.POS.deletePendingSale('${sale.id}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        UI.showModal('Ventas Pendientes', body, '<button class="btn-secondary" onclick="UI.closeModal()">Cerrar</button>');
    },

    // ==================== FAVORITOS ====================

    async loadFavorites() {
        try {
            const saved = localStorage.getItem('pos_favorites');
            this.favorites = saved ? JSON.parse(saved) : [];
        } catch (e) {
            this.favorites = [];
        }
    },

    async addToFavorites(itemId) {
        if (!this.favorites.includes(itemId)) {
            this.favorites.push(itemId);
            localStorage.setItem('pos_favorites', JSON.stringify(this.favorites));
            Utils.showNotification('Agregado a favoritos', 'success');
        }
    },

    async removeFromFavorites(itemId) {
        this.favorites = this.favorites.filter(id => id !== itemId);
        localStorage.setItem('pos_favorites', JSON.stringify(this.favorites));
    },

    async showFavorites() {
        if (this.favorites.length === 0) {
            Utils.showNotification('No hay favoritos guardados', 'info');
            return;
        }

        try {
            const items = await Promise.all(this.favorites.map(id => DB.get('inventory_items', id)));
            const validItems = items.filter(item => item && item.status === 'disponible');

            if (validItems.length === 0) {
                Utils.showNotification('No hay favoritos disponibles', 'info');
                return;
            }

            const body = `
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 12px; max-height: 400px; overflow-y: auto;">
                    ${validItems.map(item => `
                        <div style="padding: 12px; background: var(--color-bg-secondary); border-radius: 8px; text-align: center; cursor: pointer; border: 1px solid var(--color-border-light); transition: all 0.2s;"
                             onclick="window.POS.selectProduct('${item.id}'); UI.closeModal();">
                            <div style="font-size: 32px; margin-bottom: 8px; color: var(--color-primary);"><i class="fas fa-gem"></i></div>
                            <div style="font-size: 12px; font-weight: 600; margin-bottom: 4px;">${item.name || 'Sin nombre'}</div>
                            <div style="font-size: 10px; color: var(--color-text-secondary);">${item.sku || 'N/A'}</div>
                            <div style="font-size: 14px; font-weight: 700; color: var(--color-primary); margin-top: 8px;">
                                ${Utils.formatCurrency(item.cost || 0)}
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;

            UI.showModal('Favoritos', body, '<button class="btn-secondary" onclick="UI.closeModal()">Cerrar</button>');
        } catch (e) {
            console.error('Error loading favorites:', e);
        }
    },

    // ==================== VISTA RÁPIDA ====================

    async showQuickView(itemId) {
        try {
            const item = await DB.get('inventory_items', itemId);
            if (!item) return;

            let photo = null;
            try {
                const photos = await DB.query('inventory_photos', 'item_id', item.id);
                photo = photos && photos.length > 0 ? photos[0]?.photo_blob || photos[0]?.thumbnail_blob : null;
            } catch (e) {}

            const modal = document.getElementById('pos-quick-view');
            const body = document.getElementById('pos-quick-view-body');

            if (modal && body) {
                body.innerHTML = `
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
                        <div>
                            <div style="width: 100%; height: 250px; background: var(--color-bg-secondary); border-radius: 12px; display: flex; align-items: center; justify-content: center; overflow: hidden;">
                                ${photo ? 
                                    `<img src="${photo}" style="width: 100%; height: 100%; object-fit: cover;">` :
                                    `<i class="fas fa-gem" style="font-size: 72px; color: var(--color-primary);"></i>`
                                }
                            </div>
                        </div>
                        <div>
                            <h3 style="font-size: 20px; margin-bottom: 8px;">${item.name || 'Sin nombre'}</h3>
                            <p style="color: var(--color-text-secondary); font-family: monospace; margin-bottom: 16px;">${item.sku || item.barcode || 'N/A'}</p>
                            
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 24px;">
                                ${item.metal ? `<div><strong>Metal:</strong><br>${item.metal}</div>` : ''}
                                ${item.stone ? `<div><strong>Piedra:</strong><br>${item.stone}</div>` : ''}
                                ${item.weight_g ? `<div><strong>Peso:</strong><br>${item.weight_g}g</div>` : ''}
                                ${item.size ? `<div><strong>Talla:</strong><br>${item.size}</div>` : ''}
                                ${item.measures ? `<div><strong>Medidas:</strong><br>${item.measures}</div>` : ''}
                                ${item.certificate ? `<div><strong>Certificado:</strong><br><span style="color: #22c55e;">✓ Sí</span></div>` : ''}
                            </div>
                            
                            <div style="font-size: 28px; font-weight: 700; color: #1a1a1a; margin-bottom: 24px;">
                                ${Utils.formatCurrency(item.cost || 0)}
                            </div>
                            
                            <div style="display: flex; gap: 12px;">
                                <button class="btn-primary" style="flex: 1;" onclick="window.POS.selectProduct('${item.id}'); window.POS.closeQuickView();">
                                    <i class="fas fa-plus"></i> Agregar al Carrito
                                </button>
                                <button class="btn-secondary" onclick="window.POS.addToFavorites('${item.id}')" title="Agregar a Favoritos">
                                    <i class="fas fa-star"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                `;
                modal.style.display = 'flex';
            }
        } catch (e) {
            console.error('Error showing quick view:', e);
        }
    },

    closeQuickView() {
        const modal = document.getElementById('pos-quick-view');
        if (modal) modal.style.display = 'none';
    },

    // ==================== GUÍA/AGENCIA/CLIENTE ====================

    async setGuide(guide) {
        this.currentGuide = guide;
        
        if (guide.agency_id) {
            const agency = await DB.get('catalog_agencies', guide.agency_id);
            this.currentAgency = agency;
        }
        
        this.updateCustomerDisplay();
        Utils.showNotification(`Guía ${guide.name} cargado. Ahora escanea el VENDEDOR.`, 'success');
    },

    async setSeller(seller) {
        this.currentSeller = seller;
        this.updateCustomerDisplay();
        Utils.showNotification(`Vendedor ${seller.name} asignado. Ahora escanea los PRODUCTOS.`, 'success');
    },

    clearGuide() {
        this.currentGuide = null;
        this.currentAgency = null;
        this.updateCustomerDisplay();
        Utils.showNotification('Guía y agencia limpiados', 'info');
    },

    clearSeller() {
        this.currentSeller = null;
        this.updateCustomerDisplay();
        Utils.showNotification('Vendedor limpiado', 'info');
    },

    clearSaleInfo() {
        this.currentGuide = null;
        this.currentAgency = null;
        this.currentSeller = null;
        this.currentCustomer = null;
        this.updateCustomerDisplay();
        Utils.showNotification('Información de venta limpiada', 'info');
    },

    updateCustomerDisplay() {
        const guideEl = document.getElementById('pos-current-guide');
        const agencyEl = document.getElementById('pos-current-agency');
        const sellerEl = document.getElementById('pos-current-seller');
        
        if (guideEl) {
            guideEl.innerHTML = this.currentGuide ? 
                `<span style="font-weight: 600;">${this.currentGuide.name}</span>` : 
                '<span class="pos-placeholder">Sin guía</span>';
        }
        
        if (agencyEl) {
            agencyEl.innerHTML = this.currentAgency ? 
                `<span style="font-weight: 600;">${this.currentAgency.name}</span>` : 
                '<span class="pos-placeholder">Sin agencia</span>';
        }

        if (sellerEl) {
            sellerEl.innerHTML = this.currentSeller ? 
                `<span style="font-weight: 600;">${this.currentSeller.name}</span>` : 
                '<span class="pos-placeholder">Sin vendedor</span>';
        }
    },

    async searchCustomer() {
        const query = document.getElementById('pos-customer-search')?.value.trim();
        if (!query || query.length < 2) return;

        try {
            const customers = await DB.getAll('customers') || [];
            const matches = customers.filter(c => 
                c.name?.toLowerCase().includes(query.toLowerCase()) ||
                c.email?.toLowerCase().includes(query.toLowerCase()) ||
                c.phone?.includes(query)
            );

            if (matches.length === 1) {
                this.currentCustomer = matches[0];
                document.getElementById('pos-customer-search').value = matches[0].name;
                Utils.showNotification(`Cliente: ${matches[0].name}`, 'success');
            } else if (matches.length > 1) {
                this.showCustomerResults(matches);
            }
        } catch (e) {
            console.error('Error searching customers:', e);
        }
    },

    showCustomerResults(customers) {
        const body = customers.map(c => `
            <div style="padding: 12px; border-bottom: 1px solid var(--color-border-light); cursor: pointer;"
                 onclick="window.POS.selectCustomer('${c.id}'); UI.closeModal();">
                <strong>${c.name}</strong>
                ${c.phone ? `<br><small>${c.phone}</small>` : ''}
                ${c.email ? `<br><small>${c.email}</small>` : ''}
            </div>
        `).join('');

        UI.showModal('Seleccionar Cliente', body, '<button class="btn-secondary" onclick="UI.closeModal()">Cerrar</button>');
    },

    async selectCustomer(customerId) {
        const customer = await DB.get('customers', customerId);
        if (customer) {
            this.currentCustomer = customer;
            document.getElementById('pos-customer-search').value = customer.name;
        }
    },

    async quickAddCustomer() {
        const name = await Utils.prompt('Nombre del cliente:', '', 'Nuevo Cliente');
        if (!name) return;

        const phone = await Utils.prompt('Teléfono (opcional):', '', 'Nuevo Cliente');
        const email = await Utils.prompt('Email (opcional):', '', 'Nuevo Cliente');

        const customer = {
            id: Utils.generateId(),
            name: name,
            phone: phone || '',
            email: email || '',
            created_at: new Date().toISOString()
        };

        await DB.add('customers', customer);
        this.currentCustomer = customer;
        document.getElementById('pos-customer-search').value = customer.name;
        Utils.showNotification('Cliente creado', 'success');
    },

    // ==================== HISTORIAL ====================

    async showHistory() {
        try {
            const sales = await DB.getAll('sales') || [];
            const recentSales = sales
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                .slice(0, 50);

            const sellers = await DB.getAll('catalog_sellers') || [];
            const branches = await DB.getAll('catalog_branches') || [];
            
            const today = new Date().toISOString().split('T')[0];
            const todaySales = recentSales.filter(s => s.created_at?.startsWith(today) && s.status === 'completada');
            const todayTotal = todaySales.reduce((sum, s) => sum + (s.total || 0), 0);

            const body = `
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 20px;">
                        <div class="kpi-card">
                            <div class="kpi-label">Ventas Hoy</div>
                            <div class="kpi-value">${todaySales.length}</div>
                        </div>
                        <div class="kpi-card">
                        <div class="kpi-label">Total Hoy</div>
                        <div class="kpi-value">${Utils.formatCurrency(todayTotal)}</div>
                        </div>
                        <div class="kpi-card">
                            <div class="kpi-label">Ticket Promedio</div>
                        <div class="kpi-value">${Utils.formatCurrency(todaySales.length > 0 ? todayTotal / todaySales.length : 0)}</div>
                        </div>
                        </div>
                <div style="max-height: 400px; overflow-y: auto;">
                    <table class="cart-table" style="min-width: 100%;">
                        <thead>
                            <tr>
                                <th>Folio</th>
                                <th>Fecha</th>
                                <th>Total</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${recentSales.map(sale => {
                                const seller = sellers.find(s => s.id === sale.seller_id);
                                return `
                                    <tr>
                                        <td><strong>${sale.folio}</strong></td>
                                        <td>${Utils.formatDate(sale.created_at, 'DD/MM HH:mm')}</td>
                                        <td>${Utils.formatCurrency(sale.total)}</td>
                                        <td><span class="status-badge status-${sale.status}">${sale.status}</span></td>
                                        <td>
                                            <button class="btn-secondary btn-xs" onclick="window.POS.viewSale('${sale.id}')">Ver</button>
                                            ${sale.status === 'completada' ? `
                                                <button class="btn-secondary btn-xs" onclick="window.POS.reprintTicket('${sale.id}')">
                                                    <i class="fas fa-print"></i>
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

            UI.showModal('Historial de Ventas', body, '<button class="btn-primary" onclick="UI.closeModal()">Cerrar</button>');
        } catch (e) {
            console.error('Error loading history:', e);
            Utils.showNotification('Error al cargar historial', 'error');
        }
    },

    async viewSale(saleId) {
        const sale = await DB.get('sales', saleId);
        if (!sale) return;

        const items = await DB.query('sale_items', 'sale_id', saleId) || [];
        const payments = await DB.query('payments', 'sale_id', saleId) || [];
        
        const inventoryItems = await Promise.all(items.map(async item => {
            const inv = await DB.get('inventory_items', item.item_id);
            return { ...item, inventory: inv };
        }));

        const body = `
            <div style="display: grid; gap: 16px;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                <div>
                        <h4 style="margin-bottom: 12px;">Información</h4>
                    <p><strong>Folio:</strong> ${sale.folio}</p>
                    <p><strong>Fecha:</strong> ${Utils.formatDate(sale.created_at, 'DD/MM/YYYY HH:mm')}</p>
                    <p><strong>Estado:</strong> <span class="status-badge status-${sale.status}">${sale.status}</span></p>
                </div>
                <div>
                        <h4 style="margin-bottom: 12px;">Totales</h4>
                        <p><strong>Subtotal:</strong> ${Utils.formatCurrency(sale.subtotal)}</p>
                        <p><strong>Descuento:</strong> ${Utils.formatCurrency(sale.discount)}</p>
                        <p style="font-size: 18px;"><strong>Total:</strong> ${Utils.formatCurrency(sale.total)}</p>
                            </div>
                    </div>
                <div>
                    <h4 style="margin-bottom: 12px;">Productos</h4>
                    <div style="max-height: 150px; overflow-y: auto;">
                        ${inventoryItems.map(item => `
                            <div style="display: flex; justify-content: space-between; padding: 8px; background: var(--color-bg-secondary); border-radius: 4px; margin-bottom: 4px;">
                                <span>${item.inventory?.name || 'N/A'} x${item.quantity}</span>
                                <span>${Utils.formatCurrency(item.subtotal)}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

        const footer = `
            ${sale.status === 'completada' ? `
                <button class="btn-secondary" onclick="window.POS.reprintTicket('${sale.id}')">
                    <i class="fas fa-print"></i> Reimprimir
                </button>
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

    // ==================== UTILIDADES ====================

    toggleAdvancedFilters() {
        const filters = document.getElementById('pos-advanced-filters');
        const chevron = document.getElementById('pos-filters-chevron');
        
        if (filters) {
            const isOpen = filters.style.display !== 'none';
            filters.style.display = isOpen ? 'none' : 'block';
            if (chevron) {
                chevron.style.transform = isOpen ? 'rotate(0)' : 'rotate(180deg)';
            }
        }
    },

    clearSearch() {
        const input = document.getElementById('pos-product-search');
        if (input) {
            input.value = '';
            this.loadProducts();
        }
    },

    startBarcodeScanner() {
        const input = document.getElementById('pos-product-search');
        if (input) {
            input.focus();
            input.select();
        }
        Utils.showNotification('Escanea el código de barras', 'info');
    },

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(e => {
                Utils.showNotification('No se pudo activar pantalla completa', 'warning');
            });
            this.isFullscreen = true;
        } else {
            document.exitFullscreen();
            this.isFullscreen = false;
        }
    },

    showShortcuts() {
        const body = `
            <div style="display: grid; gap: 8px;">
                <div style="display: flex; justify-content: space-between; padding: 8px; background: var(--color-bg-secondary); border-radius: 4px;">
                    <span>Buscar producto</span>
                    <kbd style="background: var(--color-bg-tertiary); padding: 2px 8px; border-radius: 4px; font-family: monospace;">F1</kbd>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px; background: var(--color-bg-secondary); border-radius: 4px;">
                    <span>Favoritos</span>
                    <kbd style="background: var(--color-bg-tertiary); padding: 2px 8px; border-radius: 4px; font-family: monospace;">F2</kbd>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px; background: var(--color-bg-secondary); border-radius: 4px;">
                    <span>Ventas pendientes</span>
                    <kbd style="background: var(--color-bg-tertiary); padding: 2px 8px; border-radius: 4px; font-family: monospace;">F3</kbd>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px; background: var(--color-bg-secondary); border-radius: 4px;">
                    <span>Historial</span>
                    <kbd style="background: var(--color-bg-tertiary); padding: 2px 8px; border-radius: 4px; font-family: monospace;">F4</kbd>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px; background: var(--color-bg-secondary); border-radius: 4px;">
                    <span>Pausar venta</span>
                    <kbd style="background: var(--color-bg-tertiary); padding: 2px 8px; border-radius: 4px; font-family: monospace;">F5</kbd>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px; background: var(--color-bg-secondary); border-radius: 4px;">
                    <span>Pantalla completa</span>
                    <kbd style="background: var(--color-bg-tertiary); padding: 2px 8px; border-radius: 4px; font-family: monospace;">F11</kbd>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px; background: var(--color-bg-secondary); border-radius: 4px;">
                    <span>Completar venta</span>
                    <kbd style="background: var(--color-bg-tertiary); padding: 2px 8px; border-radius: 4px; font-family: monospace;">F12</kbd>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px; background: var(--color-bg-secondary); border-radius: 4px;">
                    <span>Cerrar modal</span>
                    <kbd style="background: var(--color-bg-tertiary); padding: 2px 8px; border-radius: 4px; font-family: monospace;">Esc</kbd>
                </div>
            </div>
        `;

        UI.showModal('Atajos de Teclado', body, '<button class="btn-primary" onclick="UI.closeModal()">Entendido</button>');
    },

    resetForm() {
        this.cart = [];
        this.currentDiscount = 0;
        this.currentCustomer = null;
        // Limpiar guía, agencia y vendedor para nueva venta
        this.currentGuide = null;
        this.currentAgency = null;
        this.currentSeller = null;
        
        this.updateCartDisplay();
        this.calculateTotals();
        this.updateCustomerDisplay();
        this.clearCartStorage();

        // Limpiar inputs de pago
        ['cash-usd', 'cash-mxn', 'cash-cad', 'tpv-visa', 'tpv-amex'].forEach(id => {
            const input = document.getElementById(`payment-${id}`);
            if (input) input.value = '0';
        });
        
        this.calculatePayments();

        // Limpiar cliente
        const customerInput = document.getElementById('pos-customer-search');
        if (customerInput) customerInput.value = '';

        // Resetear chips de descuento
        document.querySelectorAll('.pos-discount-chip').forEach(chip => {
            chip.classList.remove('active');
            if (chip.dataset.discount === '0') chip.classList.add('active');
        });
    },

    // ==================== IMPRESORA ====================

    async togglePrinter() {
        if (window.Printer && window.Printer.connected) {
            // Ya conectada, mostrar opciones
            const action = await this.showPrinterMenu();
            if (action === 'disconnect') {
                await window.Printer.disconnect();
                this.updatePrinterStatus();
            } else if (action === 'test') {
                await window.Printer.testPrint();
            } else if (action === 'reconnect') {
                await window.Printer.disconnect();
                await window.Printer.connectWithConfig();
                this.updatePrinterStatus();
            }
        } else {
            // No conectada, mostrar opciones de conexión
            const action = await this.showPrinterConnectMenu();
            if (action === 'connect') {
                await window.Printer.connect();
                this.updatePrinterStatus();
            } else if (action === 'config') {
                await window.Printer.connectWithConfig();
                this.updatePrinterStatus();
            }
        }
    },

    async showPrinterConnectMenu() {
        return new Promise((resolve) => {
            const savedBaud = localStorage.getItem('printer_baud_rate') || '9600';
            const body = `
                <div style="display: flex; flex-direction: column; gap: 12px;">
                    <div style="text-align: center; padding: 16px; background: #fff3cd; border-radius: 8px;">
                        <i class="fas fa-print" style="font-size: 32px; color: #856404; margin-bottom: 8px;"></i>
                        <div style="font-weight: 600; color: #856404;">Impresora No Conectada</div>
                        <small style="color: #856404;">Selecciona tu impresora USB (puede aparecer como USB, COM, etc.)</small>
                    </div>
                    <button class="btn-primary" onclick="window._printerAction='connect'; UI.closeModal();" style="padding: 14px; font-size: 14px;">
                        <i class="fas fa-plug"></i> Conectar Rápido (${savedBaud} baud)
                    </button>
                    <button class="btn-secondary" onclick="window._printerAction='config'; UI.closeModal();" style="padding: 12px;">
                        <i class="fas fa-cog"></i> Configurar Velocidad
                    </button>
                    <div style="padding: 12px; background: var(--color-bg-secondary); border-radius: 8px; font-size: 11px; color: var(--color-text-secondary);">
                        <strong>💡 Tip:</strong> Si la impresora no responde, prueba con otra velocidad (baud rate). 
                        Las más comunes son 9600 y 115200.
                    </div>
                    <button class="btn-secondary" onclick="window._printerAction='cancel'; UI.closeModal();" style="padding: 10px;">
                        Cancelar
                    </button>
                </div>
            `;
            
            window._printerAction = 'cancel';
            UI.showModal('🖨️ Conectar Impresora', body, '');
            
            const checkAction = setInterval(() => {
                const modal = document.getElementById('modal-container');
                if (!modal || modal.style.display === 'none') {
                    clearInterval(checkAction);
                    resolve(window._printerAction);
                }
            }, 100);
        });
    },

    async showPrinterMenu() {
        return new Promise((resolve) => {
            const baudRate = window.Printer?.currentBaudRate || 9600;
            const body = `
                <div style="display: flex; flex-direction: column; gap: 12px;">
                    <div style="text-align: center; padding: 16px; background: #d4edda; border-radius: 8px;">
                        <i class="fas fa-check-circle" style="font-size: 32px; color: #28a745; margin-bottom: 8px;"></i>
                        <div style="font-weight: 600; color: #28a745;">Impresora Conectada</div>
                        <small style="color: #28a745;">${baudRate} baud</small>
                    </div>
                    <button class="btn-primary" onclick="window._printerAction='test'; UI.closeModal();" style="padding: 12px;">
                        <i class="fas fa-print"></i> Imprimir Prueba
                    </button>
                    <button class="btn-secondary" onclick="window._printerAction='reconnect'; UI.closeModal();" style="padding: 12px;">
                        <i class="fas fa-sync"></i> Cambiar Configuración
                    </button>
                    <button class="btn-danger" onclick="window._printerAction='disconnect'; UI.closeModal();" style="padding: 12px;">
                        <i class="fas fa-unlink"></i> Desconectar
                    </button>
                    <button class="btn-secondary" onclick="window._printerAction='cancel'; UI.closeModal();" style="padding: 10px;">
                        Cancelar
                    </button>
                </div>
            `;
            
            window._printerAction = 'cancel';
            UI.showModal('🖨️ Impresora', body, '');
            
            const checkAction = setInterval(() => {
                const modal = document.getElementById('modal-container');
                if (!modal || modal.style.display === 'none') {
                    clearInterval(checkAction);
                    resolve(window._printerAction);
                }
            }, 100);
        });
    },

    updatePrinterStatus() {
        const btn = document.getElementById('btn-printer-connect');
        if (btn) {
            if (window.Printer && window.Printer.connected) {
                btn.classList.add('printer-connected');
                btn.title = 'Impresora Conectada - Click para opciones';
            } else {
                btn.classList.remove('printer-connected');
                btn.title = 'Conectar Impresora';
            }
        }
    }
};

// Exponer POS globalmente
window.POS = POS;
