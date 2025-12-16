// Inventory Module

const Inventory = {
    initialized: false,
    
    async init() {
        if (this.initialized) return;
        await this.setupEventListeners();
        await this.loadInventory();
        this.initialized = true;
    },

    async setupEventListeners() {
        document.getElementById('inventory-add-btn')?.addEventListener('click', () => this.showAddForm());
        document.getElementById('inventory-import-btn')?.addEventListener('click', () => this.importCSV());
        document.getElementById('inventory-export-btn')?.addEventListener('click', () => this.exportInventory());
        
        const searchInput = document.getElementById('inventory-search');
        if (searchInput) {
            searchInput.addEventListener('input', Utils.debounce(() => this.loadInventory(), 300));
        }

        const statusFilter = document.getElementById('inventory-status-filter');
        if (statusFilter) {
            statusFilter.addEventListener('change', () => this.loadInventory());
        }

        const branchFilter = document.getElementById('inventory-branch-filter');
        if (branchFilter) {
            const branches = await DB.getAll('catalog_branches') || [];
            branchFilter.innerHTML = '<option value="">Todas las sucursales</option>' + 
                branches.map(b => `<option value="${b.id}">${b.name}</option>`).join('');
            branchFilter.addEventListener('change', () => this.loadInventory());
        }

        const metalFilter = document.getElementById('inventory-metal-filter');
        if (metalFilter) {
            metalFilter.addEventListener('change', () => this.loadInventory());
        }

        const stoneTypeFilter = document.getElementById('inventory-stone-type-filter');
        if (stoneTypeFilter) {
            stoneTypeFilter.addEventListener('change', () => this.loadInventory());
        }

        const certificateFilter = document.getElementById('inventory-certificate-filter');
        if (certificateFilter) {
            certificateFilter.addEventListener('change', () => this.loadInventory());
        }

        const minPrice = document.getElementById('inventory-min-price');
        if (minPrice) {
            minPrice.addEventListener('input', Utils.debounce(() => this.loadInventory(), 500));
        }

        const maxPrice = document.getElementById('inventory-max-price');
        if (maxPrice) {
            maxPrice.addEventListener('input', Utils.debounce(() => this.loadInventory(), 500));
        }
    },

    async loadInventory() {
        try {
            let items = await DB.getAll('inventory_items') || [];
            
            // Apply search filter
            const search = document.getElementById('inventory-search')?.value.toLowerCase() || '';
            if (search) {
                items = items.filter(item => 
                    item.sku?.toLowerCase().includes(search) ||
                    item.name?.toLowerCase().includes(search) ||
                    item.barcode?.includes(search) ||
                    item.metal?.toLowerCase().includes(search) ||
                    item.stone?.toLowerCase().includes(search)
                );
            }

            // Apply status filter
            const statusFilter = document.getElementById('inventory-status-filter')?.value;
            if (statusFilter) {
                items = items.filter(item => item.status === statusFilter);
            }

            // Apply branch filter
            const branchFilter = document.getElementById('inventory-branch-filter')?.value;
            if (branchFilter) {
                items = items.filter(item => item.branch_id === branchFilter);
            }

            // Apply cost range filter (ya no hay precio de venta)
            const minPrice = parseFloat(document.getElementById('inventory-min-price')?.value || '0');
            const maxPrice = parseFloat(document.getElementById('inventory-max-price')?.value || '999999999');
            items = items.filter(item => (item.cost || 0) >= minPrice && (item.cost || 0) <= maxPrice);

            // Apply metal filter
            const metalFilter = document.getElementById('inventory-metal-filter')?.value;
            if (metalFilter) {
                items = items.filter(item => item.metal === metalFilter);
            }

            // Apply stone type filter
            const stoneTypeFilter = document.getElementById('inventory-stone-type-filter')?.value;
            if (stoneTypeFilter) {
                items = items.filter(item => item.stone_type === stoneTypeFilter);
            }

            // Apply certificate filter
            const certificateFilter = document.getElementById('inventory-certificate-filter')?.value;
            if (certificateFilter === 'yes') {
                items = items.filter(item => item.certificate_type && item.certificate_number);
            } else if (certificateFilter === 'no') {
                items = items.filter(item => !item.certificate_type || !item.certificate_number);
            }

            this.displayInventory(items);
        } catch (e) {
            console.error('Error loading inventory:', e);
            Utils.showNotification('Error al cargar inventario', 'error');
        }
    },

    async displayInventory(items) {
        const container = document.getElementById('inventory-list');
        if (!container) return;
        
        // Mostrar estadísticas si hay items
        await this.displayInventoryStats(items);

        if (items.length === 0) {
            container.innerHTML = '<p style="text-align: center; padding: 40px;">No hay piezas en inventario</p>';
            return;
        }

        // Load photos for items
        const itemsWithPhotos = await Promise.all(items.map(async (item) => {
            const photos = await DB.query('inventory_photos', 'item_id', item.id);
            return { ...item, photo: photos[0]?.thumbnail_blob || null };
        }));

        container.innerHTML = itemsWithPhotos.map(item => {
            const hasCertificate = item.certificate_type && item.certificate_number;
            const stoneInfo = item.stone_type ? `${item.stone_type}${item.carats ? ` ${item.carats}ct` : ''}${item.color ? ` ${item.color}` : ''}${item.clarity ? ` ${item.clarity}` : ''}` : (item.stone || 'N/A');
            
            return `
            <div class="inventory-card" data-item-id="${item.id}">
                ${item.photo ? `<img src="${item.photo}" alt="${item.name}" class="inventory-card-photo">` : 
                  '<div class="inventory-card-photo" style="display: flex; align-items: center; justify-content: center; color: #999; background: var(--color-bg-secondary);"><i class="fas fa-gem" style="font-size: 48px; opacity: 0.3;"></i></div>'}
                <div class="inventory-card-info">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
                        <h4 style="margin: 0; flex: 1;">${item.name || item.sku}</h4>
                        ${hasCertificate ? '<span class="cert-badge" title="Certificado"><i class="fas fa-certificate"></i></span>' : ''}
                    </div>
                    <p style="font-size: 12px; color: var(--color-text-secondary); margin-bottom: 4px;"><strong>SKU:</strong> ${item.sku}</p>
                    <p style="font-size: 12px; margin-bottom: 4px;"><strong>Metal:</strong> ${item.metal || 'N/A'}</p>
                    <p style="font-size: 12px; margin-bottom: 4px;"><strong>Piedra:</strong> ${stoneInfo}</p>
                    ${item.total_carats ? `<p style="font-size: 12px; margin-bottom: 4px;"><strong>Quilates Totales:</strong> ${item.total_carats}ct</p>` : ''}
                    <p style="font-size: 12px; margin-bottom: 4px;"><strong>Peso:</strong> ${item.weight_g}g</p>
                    <p style="font-size: 13px; font-weight: 600; color: var(--color-primary); margin: 8px 0;"><strong>Costo:</strong> ${Utils.formatCurrency(item.cost || 0)}</p>
                    ${item.suggested_price ? `<p style="font-size: 12px; color: var(--color-success); margin-bottom: 4px;"><strong>Precio Sugerido:</strong> ${Utils.formatCurrency(item.suggested_price)}</p>` : ''}
                    ${item.collection ? `<p style="font-size: 11px; color: var(--color-text-secondary); margin-bottom: 4px;"><i class="fas fa-tag"></i> ${item.collection}</p>` : ''}
                    <p style="margin-top: 8px;"><strong>Estado:</strong> <span class="status-badge status-${item.status}">${item.status}</span></p>
                    <div style="margin-top: 10px; display: flex; gap: 5px;">
                        <button class="btn-secondary" onclick="window.Inventory.showItemDetails('${item.id}')" style="flex: 1; padding: 6px; font-size: 11px;">Ver Detalles</button>
                        <button class="btn-secondary" onclick="window.Inventory.printLabel('${item.id}')" style="flex: 1; padding: 6px; font-size: 11px;"><i class="fas fa-print"></i></button>
                    </div>
                </div>
            </div>
        `;
        }).join('');
    },

    async showItemDetails(itemId) {
        const item = await DB.get('inventory_items', itemId);
        if (!item) {
            Utils.showNotification('Pieza no encontrada', 'error');
            return;
        }

        const photos = await DB.query('inventory_photos', 'item_id', itemId);

        const certificate = item.certificate_type && item.certificate_number ? 
            await DB.query('inventory_certificates', 'item_id', itemId).then(certs => certs[0]) : null;
        const priceHistory = await DB.query('inventory_price_history', 'item_id', itemId);

        const body = `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                <div>
                    <h4 style="border-bottom: 2px solid var(--color-border-light); padding-bottom: 8px; margin-bottom: 12px;">Información General</h4>
                    <div style="display: grid; gap: 8px;">
                        <div><strong>SKU:</strong> ${item.sku}</div>
                        <div><strong>Código de Barras:</strong> ${item.barcode || 'N/A'}</div>
                        <div><strong>Nombre:</strong> ${item.name}</div>
                        <div><strong>Metal:</strong> ${item.metal || 'N/A'}</div>
                        ${item.stone_type ? `<div><strong>Tipo de Piedra:</strong> ${item.stone_type}</div>` : ''}
                        ${item.stone ? `<div><strong>Piedra:</strong> ${item.stone}</div>` : ''}
                        ${item.carats ? `<div><strong>Quilates:</strong> ${item.carats}ct</div>` : ''}
                        ${item.total_carats ? `<div><strong>Quilates Totales:</strong> ${item.total_carats}ct</div>` : ''}
                        ${item.color ? `<div><strong>Color:</strong> ${item.color}</div>` : ''}
                        ${item.clarity ? `<div><strong>Claridad:</strong> ${item.clarity}</div>` : ''}
                        ${item.cut ? `<div><strong>Corte:</strong> ${item.cut}</div>` : ''}
                        <div><strong>Talla/Tamaño:</strong> ${item.size || 'N/A'}</div>
                        <div><strong>Peso:</strong> ${item.weight_g}g</div>
                        <div><strong>Medidas:</strong> ${item.measures || 'N/A'}</div>
                        <div><strong>Costo:</strong> ${Utils.formatCurrency(item.cost || 0)}</div>
                        ${item.suggested_price ? `<div><strong>Precio Sugerido:</strong> ${Utils.formatCurrency(item.suggested_price)}</div>` : ''}
                        ${item.collection ? `<div><strong>Colección:</strong> ${item.collection}</div>` : ''}
                        ${item.supplier ? `<div><strong>Proveedor:</strong> ${item.supplier}</div>` : ''}
                        ${item.origin_country ? `<div><strong>País de Origen:</strong> ${item.origin_country}</div>` : ''}
                        ${item.year ? `<div><strong>Año:</strong> ${item.year}</div>` : ''}
                        <div><strong>Ubicación:</strong> ${item.location || 'N/A'}</div>
                        <div><strong>Estado:</strong> <span class="status-badge status-${item.status}">${item.status}</span></div>
                        ${item.tags ? `<div><strong>Etiquetas:</strong> ${item.tags.split(',').map(t => `<span style="background: var(--color-bg-secondary); padding: 2px 8px; border-radius: 12px; font-size: 11px; margin-right: 4px;">${t.trim()}</span>`).join('')}</div>` : ''}
                        ${item.notes ? `<div style="margin-top: 8px;"><strong>Notas:</strong><br><div style="background: var(--color-bg-secondary); padding: 8px; border-radius: 4px; font-size: 12px; margin-top: 4px;">${item.notes}</div></div>` : ''}
                    </div>
                    ${certificate ? `
                    <div style="margin-top: 16px; padding: 12px; background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%); border-radius: 8px; border-left: 4px solid var(--color-success);">
                        <h5 style="margin: 0 0 8px 0; display: flex; align-items: center; gap: 8px;">
                            <i class="fas fa-certificate" style="color: var(--color-success);"></i>
                            Certificado
                        </h5>
                        <div><strong>Tipo:</strong> ${certificate.certificate_type}</div>
                        <div><strong>Número:</strong> ${certificate.certificate_number}</div>
                    </div>
                    ` : ''}
                    ${priceHistory.length > 0 ? `
                    <div style="margin-top: 16px;">
                        <h5 style="margin: 0 0 8px 0;">Historial de Precios</h5>
                        <div style="max-height: 150px; overflow-y: auto;">
                            ${priceHistory.slice(0, 5).map(ph => `
                                <div style="padding: 6px; border-bottom: 1px solid var(--color-border-light); font-size: 12px;">
                                    ${Utils.formatDate(ph.date, 'YYYY-MM-DD')}: 
                                    ${Utils.formatCurrency(ph.old_price)} → ${Utils.formatCurrency(ph.new_price)}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    ` : ''}
                </div>
                <div>
                    <h4 style="border-bottom: 2px solid var(--color-border-light); padding-bottom: 8px; margin-bottom: 12px;">Fotos</h4>
                    ${photos.length > 0 ? `
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 20px;">
                        ${photos.map(photo => `
                            <img src="${photo.photo_blob}" alt="Foto" style="width: 100%; border-radius: 4px; cursor: pointer;" onclick="window.open('${photo.photo_blob}', '_blank')">
                        `).join('')}
                    </div>
                    ` : '<p style="color: var(--color-text-secondary); text-align: center; padding: 20px;">No hay fotos disponibles</p>'}
                    <div id="barcode-preview" style="margin-top: 20px; text-align: center; padding: 16px; background: var(--color-bg-secondary); border-radius: 8px;">
                        <div style="margin-bottom: 8px; font-weight: 600;">Código de Barras</div>
                        <svg id="barcode-svg-${item.id}"></svg>
                        <div style="margin-top: 8px; font-size: 12px; color: var(--color-text-secondary);">${item.barcode}</div>
                    </div>
                </div>
            </div>
        `;

        const footer = `
            <button class="btn-secondary" onclick="window.Inventory.editItem('${item.id}')">Editar</button>
            <button class="btn-secondary" onclick="window.Inventory.printLabel('${item.id}')">Imprimir Etiqueta</button>
            <button class="btn-primary" onclick="UI.closeModal()">Cerrar</button>
        `;

        UI.showModal(`Pieza: ${item.name}`, body, footer);

        // Generate barcode preview
        if (item.barcode && typeof JsBarcode !== 'undefined') {
            setTimeout(() => {
                BarcodeManager.generateCode128(item.barcode, `barcode-svg-${item.id}`);
            }, 100);
        }
    },

    async showAddForm(itemId = null) {
        const item = itemId ? await DB.get('inventory_items', itemId) : null;

        const body = `
            <form id="inventory-form">
                <div class="form-row">
                    <div class="form-group">
                        <label>SKU *</label>
                        <input type="text" id="inv-sku" class="form-input" value="${item?.sku || ''}" required>
                    </div>
                    <div class="form-group">
                        <label>Código de Barras</label>
                        <div style="display: flex; gap: var(--spacing-xs); align-items: flex-start;">
                            <input type="text" id="inv-barcode" class="form-input" value="${item?.barcode || ''}" placeholder="Se generará automáticamente desde SKU" style="flex: 1;">
                            <button type="button" class="btn-secondary btn-sm" onclick="window.Inventory.generateBarcode()" title="Generar código de barras desde SKU" style="white-space: nowrap; margin-top: 0;">
                                <i class="fas fa-barcode"></i> Generar
                            </button>
                        </div>
                        <small style="color: var(--color-text-secondary); font-size: 11px; display: block; margin-top: var(--spacing-xs);">
                            El código de barras se genera automáticamente. Si hay SKU, se usará el SKU; si no, se generará un código único. Puedes editarlo manualmente si es necesario.
                        </small>
                    </div>
                </div>
                <div class="form-group">
                    <label>Nombre *</label>
                    <input type="text" id="inv-name" class="form-input" value="${item?.name || ''}" required>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Metal *</label>
                        <select id="inv-metal" class="form-select" required>
                            <option value="">Seleccionar...</option>
                            <option value="Oro 18k" ${item?.metal === 'Oro 18k' ? 'selected' : ''}>Oro 18k</option>
                            <option value="Oro 14k" ${item?.metal === 'Oro 14k' ? 'selected' : ''}>Oro 14k</option>
                            <option value="Oro 10k" ${item?.metal === 'Oro 10k' ? 'selected' : ''}>Oro 10k</option>
                            <option value="Plata 925" ${item?.metal === 'Plata 925' ? 'selected' : ''}>Plata 925</option>
                            <option value="Plata Sterling" ${item?.metal === 'Plata Sterling' ? 'selected' : ''}>Plata Sterling</option>
                            <option value="Platino" ${item?.metal === 'Platino' ? 'selected' : ''}>Platino</option>
                            <option value="Paladio" ${item?.metal === 'Paladio' ? 'selected' : ''}>Paladio</option>
                            <option value="Titanio" ${item?.metal === 'Titanio' ? 'selected' : ''}>Titanio</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Tipo de Piedra</label>
                        <select id="inv-stone-type" class="form-select">
                            <option value="">Ninguna</option>
                            <option value="Diamante" ${item?.stone_type === 'Diamante' ? 'selected' : ''}>Diamante</option>
                            <option value="Rubí" ${item?.stone_type === 'Rubí' ? 'selected' : ''}>Rubí</option>
                            <option value="Zafiro" ${item?.stone_type === 'Zafiro' ? 'selected' : ''}>Zafiro</option>
                            <option value="Esmeralda" ${item?.stone_type === 'Esmeralda' ? 'selected' : ''}>Esmeralda</option>
                            <option value="Perla" ${item?.stone_type === 'Perla' ? 'selected' : ''}>Perla</option>
                            <option value="Amatista" ${item?.stone_type === 'Amatista' ? 'selected' : ''}>Amatista</option>
                            <option value="Topacio" ${item?.stone_type === 'Topacio' ? 'selected' : ''}>Topacio</option>
                            <option value="Citrino" ${item?.stone_type === 'Citrino' ? 'selected' : ''}>Citrino</option>
                            <option value="Aguamarina" ${item?.stone_type === 'Aguamarina' ? 'selected' : ''}>Aguamarina</option>
                            <option value="Tanzanita" ${item?.stone_type === 'Tanzanita' ? 'selected' : ''}>Tanzanita</option>
                            <option value="Otra" ${item?.stone_type === 'Otra' ? 'selected' : ''}>Otra</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Talla/Tamaño</label>
                        <input type="text" id="inv-size" class="form-input" value="${item?.size || ''}" placeholder="Ej: 6, 7, 8...">
                    </div>
                </div>
                <div class="form-row" id="diamond-specs-row" style="display: none;">
                    <div class="form-group">
                        <label>Quilates (ct)</label>
                        <input type="number" id="inv-carats" class="form-input" step="0.01" value="${item?.carats || ''}" placeholder="0.00">
                    </div>
                    <div class="form-group">
                        <label>Color</label>
                        <select id="inv-color" class="form-select">
                            <option value="">N/A</option>
                            <option value="D" ${item?.color === 'D' ? 'selected' : ''}>D (Incoloro)</option>
                            <option value="E" ${item?.color === 'E' ? 'selected' : ''}>E</option>
                            <option value="F" ${item?.color === 'F' ? 'selected' : ''}>F</option>
                            <option value="G" ${item?.color === 'G' ? 'selected' : ''}>G</option>
                            <option value="H" ${item?.color === 'H' ? 'selected' : ''}>H</option>
                            <option value="I" ${item?.color === 'I' ? 'selected' : ''}>I</option>
                            <option value="J" ${item?.color === 'J' ? 'selected' : ''}>J</option>
                            <option value="K-Z" ${item?.color === 'K-Z' ? 'selected' : ''}>K-Z</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Claridad</label>
                        <select id="inv-clarity" class="form-select">
                            <option value="">N/A</option>
                            <option value="FL" ${item?.clarity === 'FL' ? 'selected' : ''}>FL (Flawless)</option>
                            <option value="IF" ${item?.clarity === 'IF' ? 'selected' : ''}>IF (Internally Flawless)</option>
                            <option value="VVS1" ${item?.clarity === 'VVS1' ? 'selected' : ''}>VVS1</option>
                            <option value="VVS2" ${item?.clarity === 'VVS2' ? 'selected' : ''}>VVS2</option>
                            <option value="VS1" ${item?.clarity === 'VS1' ? 'selected' : ''}>VS1</option>
                            <option value="VS2" ${item?.clarity === 'VS2' ? 'selected' : ''}>VS2</option>
                            <option value="SI1" ${item?.clarity === 'SI1' ? 'selected' : ''}>SI1</option>
                            <option value="SI2" ${item?.clarity === 'SI2' ? 'selected' : ''}>SI2</option>
                            <option value="I1" ${item?.clarity === 'I1' ? 'selected' : ''}>I1</option>
                            <option value="I2" ${item?.clarity === 'I2' ? 'selected' : ''}>I2</option>
                            <option value="I3" ${item?.clarity === 'I3' ? 'selected' : ''}>I3</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Corte</label>
                        <select id="inv-cut" class="form-select">
                            <option value="">N/A</option>
                            <option value="Excelente" ${item?.cut === 'Excelente' ? 'selected' : ''}>Excelente</option>
                            <option value="Muy Bueno" ${item?.cut === 'Muy Bueno' ? 'selected' : ''}>Muy Bueno</option>
                            <option value="Bueno" ${item?.cut === 'Bueno' ? 'selected' : ''}>Bueno</option>
                            <option value="Regular" ${item?.cut === 'Regular' ? 'selected' : ''}>Regular</option>
                        </select>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Piedra (Descripción)</label>
                        <input type="text" id="inv-stone" class="form-input" value="${item?.stone || ''}" placeholder="Descripción detallada de la piedra">
                    </div>
                    <div class="form-group">
                        <label>Quilates Totales</label>
                        <input type="number" id="inv-total-carats" class="form-input" step="0.01" value="${item?.total_carats || ''}" placeholder="0.00">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Peso (g) *</label>
                        <input type="number" id="inv-weight" class="form-input" step="0.01" value="${item?.weight_g || ''}" required>
                    </div>
                    <div class="form-group">
                        <label>Medidas</label>
                        <input type="text" id="inv-measures" class="form-input" value="${item?.measures || ''}">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Costo *</label>
                        <input type="number" id="inv-cost" class="form-input" step="0.01" value="${item?.cost || ''}" required>
                        <small style="color: var(--color-text-secondary); font-size: 11px;">Costo de adquisición</small>
                    </div>
                    <div class="form-group">
                        <label>Precio Sugerido</label>
                        <input type="number" id="inv-suggested-price" class="form-input" step="0.01" value="${item?.suggested_price || ''}">
                        <small style="color: var(--color-text-secondary); font-size: 11px;">Precio sugerido de venta</small>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Colección/Serie</label>
                        <input type="text" id="inv-collection" class="form-input" value="${item?.collection || ''}" placeholder="Ej: Colección Primavera 2024">
                    </div>
                    <div class="form-group">
                        <label>Proveedor/Fabricante</label>
                        <input type="text" id="inv-supplier" class="form-input" value="${item?.supplier || ''}" placeholder="Nombre del proveedor">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>País de Origen</label>
                        <select id="inv-origin-country" class="form-select">
                            <option value="">Seleccionar...</option>
                            <option value="México" ${item?.origin_country === 'México' ? 'selected' : ''}>México</option>
                            <option value="Italia" ${item?.origin_country === 'Italia' ? 'selected' : ''}>Italia</option>
                            <option value="Estados Unidos" ${item?.origin_country === 'Estados Unidos' ? 'selected' : ''}>Estados Unidos</option>
                            <option value="India" ${item?.origin_country === 'India' ? 'selected' : ''}>India</option>
                            <option value="Tailandia" ${item?.origin_country === 'Tailandia' ? 'selected' : ''}>Tailandia</option>
                            <option value="China" ${item?.origin_country === 'China' ? 'selected' : ''}>China</option>
                            <option value="Bélgica" ${item?.origin_country === 'Bélgica' ? 'selected' : ''}>Bélgica</option>
                            <option value="Israel" ${item?.origin_country === 'Israel' ? 'selected' : ''}>Israel</option>
                            <option value="Otro" ${item?.origin_country === 'Otro' ? 'selected' : ''}>Otro</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Año de Fabricación</label>
                        <input type="number" id="inv-year" class="form-input" value="${item?.year || ''}" placeholder="2024" min="1900" max="2100">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Ubicación</label>
                        <input type="text" id="inv-location" class="form-input" value="${item?.location || ''}" placeholder="Ej: Vitrina 1, Estante A">
                    </div>
                    <div class="form-group">
                        <label>Estado</label>
                        <select id="inv-status" class="form-select">
                            <option value="disponible" ${item?.status === 'disponible' ? 'selected' : ''}>Disponible</option>
                            <option value="apartada" ${item?.status === 'apartada' ? 'selected' : ''}>Apartada</option>
                            <option value="vendida" ${item?.status === 'vendida' ? 'selected' : ''}>Vendida</option>
                            <option value="reparacion" ${item?.status === 'reparacion' ? 'selected' : ''}>En Reparación</option>
                            <option value="exhibicion" ${item?.status === 'exhibicion' ? 'selected' : ''}>En Exhibición</option>
                            <option value="reservado" ${item?.status === 'reservado' ? 'selected' : ''}>Reservado</option>
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label>Etiquetas/Categorías</label>
                    <input type="text" id="inv-tags" class="form-input" value="${item?.tags || ''}" placeholder="Ej: exclusivo, limitado, vintage, moderno (separadas por comas)">
                    <small style="color: var(--color-text-secondary); font-size: 11px;">Separa las etiquetas con comas</small>
                </div>
                <div class="form-group">
                    <label>Notas Adicionales</label>
                    <textarea id="inv-notes" class="form-input" rows="3" placeholder="Información adicional sobre la pieza...">${item?.notes || ''}</textarea>
                </div>
                <div class="form-group">
                    <label>Certificado</label>
                    <div class="form-row">
                        <div class="form-group" style="flex: 1;">
                            <select id="inv-certificate-type" class="form-select">
                                <option value="">Sin certificado</option>
                                <option value="GIA" ${item?.certificate_type === 'GIA' ? 'selected' : ''}>GIA (Gemological Institute of America)</option>
                                <option value="IGI" ${item?.certificate_type === 'IGI' ? 'selected' : ''}>IGI (International Gemological Institute)</option>
                                <option value="AGS" ${item?.certificate_type === 'AGS' ? 'selected' : ''}>AGS (American Gem Society)</option>
                                <option value="HRD" ${item?.certificate_type === 'HRD' ? 'selected' : ''}>HRD (Hoge Raad voor Diamant)</option>
                                <option value="EGL" ${item?.certificate_type === 'EGL' ? 'selected' : ''}>EGL (European Gemological Laboratory)</option>
                                <option value="Otro" ${item?.certificate_type === 'Otro' ? 'selected' : ''}>Otro</option>
                            </select>
                        </div>
                        <div class="form-group" style="flex: 1;">
                            <input type="text" id="inv-certificate-number" class="form-input" value="${item?.certificate_number || ''}" placeholder="Número de certificado">
                        </div>
                    </div>
                </div>
                <div class="form-group">
                    <label>Fotos</label>
                    <input type="file" id="inv-photos" class="form-input" multiple accept="image/*">
                    <div id="inv-photos-preview" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-top: 10px;"></div>
                </div>
                <div class="form-group" id="barcode-preview-container" style="display: none; margin-top: var(--spacing-md); padding: var(--spacing-md); background: var(--color-bg-secondary); border-radius: var(--radius-sm);">
                    <label style="margin-bottom: var(--spacing-xs);">Vista Previa del Código de Barras</label>
                    <div style="text-align: center;">
                        <svg id="barcode-preview-svg" style="max-width: 100%; height: auto;"></svg>
                    </div>
                </div>
            </form>
        `;

        const footer = `
            <button class="btn-secondary" onclick="UI.closeModal()">Cancelar</button>
            <button class="btn-primary" onclick="window.Inventory.saveItem('${itemId || ''}')">Guardar</button>
        `;

        UI.showModal(itemId ? 'Editar Pieza' : 'Nueva Pieza', body, footer);

        // Mostrar/ocultar campos de especificaciones de diamante
        const stoneTypeSelect = document.getElementById('inv-stone-type');
        const diamondSpecsRow = document.getElementById('diamond-specs-row');
        if (stoneTypeSelect && diamondSpecsRow) {
            stoneTypeSelect.addEventListener('change', () => {
                diamondSpecsRow.style.display = stoneTypeSelect.value === 'Diamante' ? 'flex' : 'none';
            });
            // Mostrar si ya es un diamante
            if (item?.stone_type === 'Diamante') {
                diamondSpecsRow.style.display = 'flex';
            }
        }

        // Photo preview
        document.getElementById('inv-photos')?.addEventListener('change', (e) => {
            this.previewPhotos(e.target.files);
        });
        
        // Auto-generar código de barras cuando se escribe el SKU (si no hay código existente)
        const skuInput = document.getElementById('inv-sku');
        const barcodeInput = document.getElementById('inv-barcode');
        if (skuInput && barcodeInput && !item?.barcode) {
            skuInput.addEventListener('blur', () => {
                const sku = skuInput.value.trim();
                const barcode = barcodeInput.value.trim();
                if (sku && !barcode) {
                    // Auto-generar si hay SKU pero no hay código de barras
                    barcodeInput.value = sku;
                    barcodeInput.dispatchEvent(new Event('input'));
                }
            });
        }
        
        // Mostrar preview del código de barras si existe
        if (item?.barcode && typeof JsBarcode !== 'undefined') {
            const previewContainer = document.getElementById('barcode-preview-container');
            if (previewContainer) {
                previewContainer.style.display = 'block';
                setTimeout(() => {
                    try {
                        BarcodeManager.generateCode128(item.barcode, 'barcode-preview-svg');
                    } catch (e) {
                        console.log('No se pudo generar preview:', e);
                    }
                }, 100);
            }
        }
        
        // Actualizar preview cuando cambia el código de barras
        if (barcodeInput) {
            barcodeInput.addEventListener('input', () => {
                const barcode = barcodeInput.value.trim();
                const previewContainer = document.getElementById('barcode-preview-container');
                if (barcode && previewContainer && typeof JsBarcode !== 'undefined') {
                    previewContainer.style.display = 'block';
                    setTimeout(() => {
                        try {
                            BarcodeManager.generateCode128(barcode, 'barcode-preview-svg');
                        } catch (e) {
                            console.log('No se pudo actualizar preview:', e);
                        }
                    }, 100);
                } else if (previewContainer) {
                    previewContainer.style.display = 'none';
                }
            });
        }
    },

    previewPhotos(files) {
        const preview = document.getElementById('inv-photos-preview');
        if (!preview) return;

        preview.innerHTML = '';
        Array.from(files).forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = document.createElement('img');
                img.src = e.target.result;
                img.style.width = '100%';
                img.style.borderRadius = '4px';
                preview.appendChild(img);
            };
            reader.readAsDataURL(file);
        });
    },

    async generateBarcode() {
        const skuInput = document.getElementById('inv-sku');
        const barcodeInput = document.getElementById('inv-barcode');
        
        if (!barcodeInput) {
            Utils.showNotification('Error: Campo de código de barras no encontrado', 'error');
            return;
        }
        
        // Generar código de barras: usar SKU si existe, sino generar código único
        let barcode = '';
        if (skuInput && skuInput.value.trim()) {
            barcode = skuInput.value.trim();
        } else {
            // Generar código único automáticamente
            const timestamp = Date.now().toString(36).toUpperCase();
            const random = Math.random().toString(36).substring(2, 8).toUpperCase();
            barcode = `ITEM${timestamp}${random}`.substring(0, 20); // Máximo 20 caracteres
        }
        
        barcodeInput.value = barcode;
        Utils.showNotification('Código de barras generado', 'success');
        
        // Generar visualización del código de barras si JsBarcode está disponible
        if (typeof JsBarcode !== 'undefined') {
            const previewContainer = document.getElementById('barcode-preview-container');
            const previewSvg = document.getElementById('barcode-preview-svg');
            if (previewContainer && previewSvg) {
                previewContainer.style.display = 'block';
                setTimeout(() => {
                    try {
                        BarcodeManager.generateCode128(barcode, 'barcode-preview-svg');
                    } catch (e) {
                        console.log('No se pudo generar preview del código de barras:', e);
                    }
                }, 100);
            }
        }
        
        // Disparar evento input para actualizar el preview automáticamente
        barcodeInput.dispatchEvent(new Event('input'));
    },

    async saveItem(itemId) {
        const form = document.getElementById('inventory-form');
        if (!form || !form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const branchId = localStorage.getItem('current_branch_id') || 'default';

        const formBarcode = document.getElementById('inv-barcode').value.trim();
        const formSku = document.getElementById('inv-sku').value.trim();
        
        // Generar código de barras automáticamente si no existe
        let finalBarcode = formBarcode;
        if (!finalBarcode) {
            if (formSku) {
                // Usar SKU si está disponible
                finalBarcode = formSku;
            } else {
                // Generar código único automáticamente
                const timestamp = Date.now().toString(36).toUpperCase();
                const random = Math.random().toString(36).substring(2, 8).toUpperCase();
                finalBarcode = `ITEM${timestamp}${random}`.substring(0, 20);
            }
        }
        
        const item = {
            id: itemId || Utils.generateId(),
            sku: formSku,
            barcode: finalBarcode,
            name: document.getElementById('inv-name').value,
            metal: document.getElementById('inv-metal').value,
            stone: document.getElementById('inv-stone').value,
            stone_type: document.getElementById('inv-stone-type')?.value || '',
            carats: parseFloat(document.getElementById('inv-carats')?.value || 0),
            total_carats: parseFloat(document.getElementById('inv-total-carats')?.value || 0),
            color: document.getElementById('inv-color')?.value || '',
            clarity: document.getElementById('inv-clarity')?.value || '',
            cut: document.getElementById('inv-cut')?.value || '',
            size: document.getElementById('inv-size').value,
            weight_g: parseFloat(document.getElementById('inv-weight').value),
            measures: document.getElementById('inv-measures').value,
            cost: parseFloat(document.getElementById('inv-cost').value),
            suggested_price: parseFloat(document.getElementById('inv-suggested-price')?.value || 0),
            price: 0, // Precio de venta se asigna manualmente en el POS
            collection: document.getElementById('inv-collection')?.value || '',
            supplier: document.getElementById('inv-supplier')?.value || '',
            origin_country: document.getElementById('inv-origin-country')?.value || '',
            year: parseInt(document.getElementById('inv-year')?.value || 0) || null,
            location: document.getElementById('inv-location').value,
            tags: document.getElementById('inv-tags')?.value || '',
            notes: document.getElementById('inv-notes')?.value || '',
            certificate_type: document.getElementById('inv-certificate-type')?.value || '',
            certificate_number: document.getElementById('inv-certificate-number')?.value || '',
            status: document.getElementById('inv-status').value,
            branch_id: branchId,
            created_at: itemId ? (await DB.get('inventory_items', itemId))?.created_at : new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        // Guardar certificado si existe
        if (item.certificate_type && item.certificate_number) {
            const existingCert = itemId ? await DB.query('inventory_certificates', 'item_id', itemId).then(certs => certs[0]) : null;
            const certificate = {
                id: existingCert?.id || Utils.generateId(),
                item_id: item.id,
                certificate_type: item.certificate_type,
                certificate_number: item.certificate_number,
                created_at: existingCert?.created_at || new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            if (existingCert) {
                await DB.put('inventory_certificates', certificate);
            } else {
                await DB.add('inventory_certificates', certificate);
            }
        }

        // Guardar historial de precio si cambió
        if (itemId) {
            const oldItem = await DB.get('inventory_items', itemId);
            if (oldItem && oldItem.cost !== item.cost) {
                await DB.add('inventory_price_history', {
                    id: Utils.generateId(),
                    item_id: item.id,
                    old_price: oldItem.cost,
                    new_price: item.cost,
                    date: new Date().toISOString(),
                    notes: 'Actualización de costo'
                });
            }
        }

        await DB.put('inventory_items', item);

        // Handle photos
        const photoInput = document.getElementById('inv-photos');
        if (photoInput && photoInput.files.length > 0) {
            for (const file of photoInput.files) {
                const photoBlob = await Utils.loadImageAsBlob(file);
                const thumbnailBlob = await Utils.createThumbnail(photoBlob);

                await DB.add('inventory_photos', {
                    id: Utils.generateId(),
                    item_id: item.id,
                    photo_blob: photoBlob,
                    thumbnail_blob: thumbnailBlob,
                    created_at: new Date().toISOString()
                });
            }
        }

        // Log inventory change
        await DB.add('inventory_logs', {
            id: Utils.generateId(),
            item_id: item.id,
            action: itemId ? 'actualizada' : 'alta',
            quantity: 1,
            notes: itemId ? 'Pieza actualizada' : 'Nueva pieza',
            created_at: new Date().toISOString()
        });

        // Add to sync queue
        await SyncManager.addToQueue('inventory_item', item.id);

        Utils.showNotification(itemId ? 'Pieza actualizada' : 'Pieza agregada', 'success');
        UI.closeModal();
        this.loadInventory();
    },

    async editItem(itemId) {
        UI.closeModal();
        await this.showAddForm(itemId);
    },

    async printLabel(itemId) {
        const item = await DB.get('inventory_items', itemId);
        if (item) {
            await BarcodeManager.printBarcodeLabel(item);
        }
    },

    async importCSV() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.csv';
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            try {
                const text = await file.text();
                const lines = text.split('\n').filter(l => l.trim());
                const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
                
                const preview = [];
                for (let i = 1; i < Math.min(lines.length, 6); i++) {
                    const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
                    const row = {};
                    headers.forEach((h, idx) => {
                        row[h] = values[idx] || '';
                    });
                    preview.push(row);
                }

                const body = `
                    <p>Se encontraron ${lines.length - 1} registros. Vista previa:</p>
                    <div style="max-height: 300px; overflow-y: auto; margin: 10px 0;">
                        <table class="cart-table">
                            <thead>
                                <tr>
                                    ${headers.map(h => `<th>${h}</th>`).join('')}
                                </tr>
                            </thead>
                            <tbody>
                                ${preview.map(row => `
                                    <tr>
                                        ${headers.map(h => `<td>${row[h] || ''}</td>`).join('')}
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                    <p><small>Se importarán todos los registros. ¿Continuar?</small></p>
                `;

                const footer = `
                    <button class="btn-secondary" onclick="UI.closeModal()">Cancelar</button>
                    <button class="btn-primary" onclick="window.Inventory.processCSVImport(${JSON.stringify(lines).replace(/"/g, '&quot;')}, ${JSON.stringify(headers).replace(/"/g, '&quot;')})">Importar</button>
                `;

                UI.showModal('Vista Previa de Importación CSV', body, footer);
            } catch (e) {
                console.error('Error reading CSV:', e);
                Utils.showNotification('Error al leer archivo CSV', 'error');
            }
        };
        input.click();
    },

    async processCSVImport(lines, headers) {
        try {
            const branchId = localStorage.getItem('current_branch_id') || 'default';
            let imported = 0;
            let errors = 0;

            for (let i = 1; i < lines.length; i++) {
                try {
                    const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
                    const row = {};
                    headers.forEach((h, idx) => {
                        row[h] = values[idx] || '';
                    });

                    // Map CSV columns to inventory fields
                    const csvSku = (row['SKU'] || row['sku'] || Utils.generateId().substring(0, 8)).trim();
                    const csvBarcode = (row['Barcode'] || row['barcode'] || '').trim();
                    const item = {
                        id: Utils.generateId(),
                        sku: csvSku,
                        barcode: csvBarcode || csvSku, // Usar código de barras del CSV, o SKU como fallback
                        name: row['Nombre'] || row['nombre'] || row['Name'] || row['name'] || 'Sin nombre',
                        metal: row['Metal'] || row['metal'] || '',
                        stone: row['Piedra'] || row['piedra'] || row['Stone'] || '',
                        size: row['Talla'] || row['talla'] || row['Size'] || '',
                        weight_g: parseFloat(row['Peso (g)'] || row['Peso'] || row['weight_g'] || 0),
                        measures: row['Medidas'] || row['medidas'] || row['Measures'] || '',
                        cost: parseFloat(row['Costo'] || row['costo'] || row['Cost'] || 0),
                        price: 0, // Precio de venta se asigna manualmente en el POS
                        location: row['Ubicación'] || row['ubicacion'] || row['Location'] || '',
                        status: row['Estado'] || row['estado'] || row['Status'] || 'disponible',
                        branch_id: branchId,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    };

                    await DB.put('inventory_items', item);
                    await DB.add('inventory_logs', {
                        id: Utils.generateId(),
                        item_id: item.id,
                        action: 'alta',
                        quantity: 1,
                        notes: 'Importado desde CSV',
                        created_at: new Date().toISOString()
                    });
                    imported++;
                } catch (e) {
                    console.error(`Error importing row ${i}:`, e);
                    errors++;
                }
            }

            UI.closeModal();
            Utils.showNotification(`Importación completada: ${imported} importados, ${errors} errores`, imported > 0 ? 'success' : 'error');
            this.loadInventory();
        } catch (e) {
            console.error('Error processing CSV import:', e);
            Utils.showNotification('Error al procesar importación', 'error');
        }
    },

    async exportInventory() {
        try {
            const items = await DB.getAll('inventory_items');
            const exportData = items.map(item => ({
                SKU: item.sku,
                'Código de Barras': item.barcode,
                Nombre: item.name,
                Metal: item.metal,
                'Tipo de Piedra': item.stone_type || '',
                Piedra: item.stone || '',
                'Quilates': item.carats || '',
                'Quilates Totales': item.total_carats || '',
                Color: item.color || '',
                Claridad: item.clarity || '',
                Corte: item.cut || '',
                Talla: item.size || '',
                'Peso (g)': item.weight_g,
                Medidas: item.measures || '',
                Costo: item.cost,
                'Precio Sugerido': item.suggested_price || '',
                Colección: item.collection || '',
                Proveedor: item.supplier || '',
                'País de Origen': item.origin_country || '',
                Año: item.year || '',
                Ubicación: item.location || '',
                Etiquetas: item.tags || '',
                'Tipo de Certificado': item.certificate_type || '',
                'Número de Certificado': item.certificate_number || '',
                Estado: item.status,
                'Fecha de Creación': Utils.formatDate(item.created_at, 'YYYY-MM-DD'),
                'Última Actualización': Utils.formatDate(item.updated_at, 'YYYY-MM-DD')
            }));

            const format = prompt('Formato de exportación:\n1. CSV\n2. Excel\n3. PDF', '2');
            const date = Utils.formatDate(new Date(), 'YYYYMMDD');
            
            if (format === '1') {
                Utils.exportToCSV(exportData, `inventario_${date}.csv`);
            } else if (format === '2') {
                Utils.exportToExcel(exportData, `inventario_${date}.xlsx`, 'Inventario');
            } else if (format === '3') {
                Utils.exportToPDF(exportData, `inventario_${date}.pdf`, 'Inventario');
            }
        } catch (e) {
            console.error('Error exporting inventory:', e);
            Utils.showNotification('Error al exportar', 'error');
        }
    },

    highlightItem(itemId) {
        const card = document.querySelector(`[data-item-id="${itemId}"]`);
        if (card) {
            card.scrollIntoView({ behavior: 'smooth', block: 'center' });
            card.style.boxShadow = '0 0 0 3px #388e3c';
            setTimeout(() => {
                card.style.boxShadow = '';
            }, 2000);
        }
    },

    async displayInventoryStats(items) {
        // Esta función se puede implementar más adelante para mostrar estadísticas
        const stats = {
            total: items.length,
            disponible: items.filter(i => i.status === 'disponible').length,
            vendida: items.filter(i => i.status === 'vendida').length,
            apartada: items.filter(i => i.status === 'apartada').length,
            totalValue: items.reduce((sum, i) => sum + (i.cost || 0), 0),
            withCertificates: items.filter(i => i.certificate_type && i.certificate_number).length
        };
        return stats;
    }
};

window.Inventory = Inventory;

