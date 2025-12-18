// Transfers Module - Transferencias entre Sucursales

const Transfers = {
    initialized: false,
    
    async init() {
        if (this.initialized) {
            await this.loadTransfers();
            return;
        }
        this.setupUI();
        await this.loadTransfers();
        this.initialized = true;
    },

    setupUI() {
        const content = document.getElementById('module-content');
        if (!content) return;

        content.innerHTML = `
            <div style="max-width: 100%;">
                <!-- Header con acciones -->
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--spacing-lg); flex-wrap: wrap; gap: var(--spacing-md);">
                    <h2 style="margin: 0; font-size: 18px; font-weight: 700;">Transferencias entre Sucursales</h2>
                    <button class="btn-primary" onclick="window.Transfers.showNewTransferModal()">
                        <i class="fas fa-exchange-alt"></i> Nueva Transferencia
                    </button>
                </div>

                <!-- Filtros -->
                <div class="module" style="padding: var(--spacing-md); background: var(--color-bg-card); border-radius: var(--radius-md); border: 1px solid var(--color-border-light); margin-bottom: var(--spacing-lg);">
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: var(--spacing-md);">
                        <div class="form-group">
                            <label>Sucursal Origen</label>
                            <select id="transfer-filter-from" class="form-select">
                                <option value="">Todas</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Sucursal Destino</label>
                            <select id="transfer-filter-to" class="form-select">
                                <option value="">Todas</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Estado</label>
                            <select id="transfer-filter-status" class="form-select">
                                <option value="">Todos</option>
                                <option value="pending">Pendiente</option>
                                <option value="in_transit">En Tránsito</option>
                                <option value="completed">Completada</option>
                                <option value="cancelled">Cancelada</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Fecha Desde</label>
                            <input type="date" id="transfer-filter-date-from" class="form-input">
                        </div>
                        <div class="form-group">
                            <label>Fecha Hasta</label>
                            <input type="date" id="transfer-filter-date-to" class="form-input">
                        </div>
                    </div>
                    <button class="btn-secondary btn-sm" onclick="window.Transfers.loadTransfers()" style="margin-top: var(--spacing-sm);">
                        <i class="fas fa-filter"></i> Filtrar
                    </button>
                </div>

                <!-- Lista de transferencias -->
                <div id="transfers-list-container"></div>
            </div>
        `;

        this.setupEventListeners();
    },

    async setupEventListeners() {
        // Cargar sucursales en filtros
        const branches = await DB.getAll('catalog_branches') || [];
        const activeBranches = branches.filter(b => b.active);
        
        const fromSelect = document.getElementById('transfer-filter-from');
        const toSelect = document.getElementById('transfer-filter-to');
        
        if (fromSelect) {
            fromSelect.innerHTML = '<option value="">Todas</option>' + 
                activeBranches.map(b => `<option value="${b.id}">${b.name}</option>`).join('');
        }
        if (toSelect) {
            toSelect.innerHTML = '<option value="">Todas</option>' + 
                activeBranches.map(b => `<option value="${b.id}">${b.name}</option>`).join('');
        }
    },

    async loadTransfers() {
        const container = document.getElementById('transfers-list-container');
        if (!container) return;

        try {
            // Obtener todas las transferencias (filtradas por sucursal si no es admin)
            const allTransfers = await DB.getAll('inventory_transfers', null, null, { 
                filterByBranch: true, 
                branchIdField: 'from_branch_id',
                includeNull: true
            }) || [];

            // Aplicar filtros
            const fromFilter = document.getElementById('transfer-filter-from')?.value;
            const toFilter = document.getElementById('transfer-filter-to')?.value;
            const statusFilter = document.getElementById('transfer-filter-status')?.value;
            const dateFrom = document.getElementById('transfer-filter-date-from')?.value;
            const dateTo = document.getElementById('transfer-filter-date-to')?.value;

            let filtered = allTransfers;

            if (fromFilter) {
                filtered = filtered.filter(t => t.from_branch_id === fromFilter);
            }
            if (toFilter) {
                filtered = filtered.filter(t => t.to_branch_id === toFilter);
            }
            if (statusFilter) {
                filtered = filtered.filter(t => t.status === statusFilter);
            }
            if (dateFrom) {
                filtered = filtered.filter(t => {
                    const transferDate = t.created_at?.split('T')[0] || '';
                    return transferDate >= dateFrom;
                });
            }
            if (dateTo) {
                filtered = filtered.filter(t => {
                    const transferDate = t.created_at?.split('T')[0] || '';
                    return transferDate <= dateTo;
                });
            }

            // Ordenar por fecha más reciente
            filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

            // Obtener información de sucursales
            const branches = await DB.getAll('catalog_branches') || [];
            const getBranchName = (id) => branches.find(b => b.id === id)?.name || id;

            if (filtered.length === 0) {
                container.innerHTML = `
                    <div class="module" style="padding: var(--spacing-xl); text-align: center; background: var(--color-bg-card); border-radius: var(--radius-md); border: 1px solid var(--color-border-light);">
                        <i class="fas fa-exchange-alt" style="font-size: 48px; color: var(--color-text-secondary); margin-bottom: var(--spacing-md);"></i>
                        <p style="color: var(--color-text-secondary);">No hay transferencias registradas</p>
                        <button class="btn-primary" onclick="window.Transfers.showNewTransferModal()" style="margin-top: var(--spacing-md);">
                            <i class="fas fa-plus"></i> Crear Primera Transferencia
                        </button>
                    </div>
                `;
                return;
            }

            container.innerHTML = `
                <div class="module" style="padding: var(--spacing-md); background: var(--color-bg-card); border-radius: var(--radius-md); border: 1px solid var(--color-border-light);">
                    <h3 style="margin-bottom: var(--spacing-md); font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                        <i class="fas fa-list"></i> Transferencias (${filtered.length})
                    </h3>
                    <div style="overflow-x: auto;">
                        <table class="data-table" style="width: 100%;">
                            <thead>
                                <tr>
                                    <th>Folio</th>
                                    <th>Desde</th>
                                    <th>Hacia</th>
                                    <th>Items</th>
                                    <th>Estado</th>
                                    <th>Fecha</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${filtered.map(transfer => {
                                    const statusColors = {
                                        'pending': 'warning',
                                        'in_transit': 'info',
                                        'completed': 'success',
                                        'cancelled': 'danger'
                                    };
                                    const statusLabels = {
                                        'pending': 'Pendiente',
                                        'in_transit': 'En Tránsito',
                                        'completed': 'Completada',
                                        'cancelled': 'Cancelada'
                                    };
                                    return `
                                        <tr>
                                            <td><strong>${transfer.folio || transfer.id.substring(0, 8)}</strong></td>
                                            <td>${getBranchName(transfer.from_branch_id)}</td>
                                            <td>${getBranchName(transfer.to_branch_id)}</td>
                                            <td>${transfer.items_count || 0} pieza(s)</td>
                                            <td>
                                                <span class="status-badge status-${statusColors[transfer.status] || 'secondary'}">
                                                    ${statusLabels[transfer.status] || transfer.status}
                                                </span>
                                            </td>
                                            <td>${Utils.formatDate(new Date(transfer.created_at), 'DD/MM/YYYY HH:mm')}</td>
                                            <td>
                                                <button class="btn-secondary btn-sm" onclick="window.Transfers.viewTransfer('${transfer.id}')" title="Ver detalles">
                                                    <i class="fas fa-eye"></i>
                                                </button>
                                                ${transfer.status === 'pending' ? `
                                                    <button class="btn-primary btn-sm" onclick="window.Transfers.completeTransfer('${transfer.id}')" title="Completar">
                                                        <i class="fas fa-check"></i>
                                                    </button>
                                                    <button class="btn-danger btn-sm" onclick="window.Transfers.cancelTransfer('${transfer.id}')" title="Cancelar">
                                                        <i class="fas fa-times"></i>
                                                    </button>
                                                ` : ''}
                                            </td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        } catch (e) {
            console.error('Error loading transfers:', e);
            Utils.showNotification('Error al cargar transferencias: ' + e.message, 'error');
        }
    },

    async showNewTransferModal() {
        const branches = await DB.getAll('catalog_branches') || [];
        const activeBranches = branches.filter(b => b.active);
        const currentBranchId = BranchManager.getCurrentBranchId();
        
        // Obtener inventario de la sucursal actual
        const inventory = await DB.getAll('inventory_items', null, null, { 
            filterByBranch: true, 
            branchIdField: 'branch_id' 
        }) || [];
        const availableItems = inventory.filter(i => i.status === 'disponible' && (i.stock_actual ?? 1) > 0);

        const body = `
            <form id="new-transfer-form">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-md); margin-bottom: var(--spacing-md);">
                    <div class="form-group">
                        <label>Sucursal Origen <span style="color: var(--color-danger);">*</span></label>
                        <select id="transfer-from-branch" class="form-select" required>
                            ${activeBranches.map(b => 
                                `<option value="${b.id}" ${b.id === currentBranchId ? 'selected' : ''}>${b.name}</option>`
                            ).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Sucursal Destino <span style="color: var(--color-danger);">*</span></label>
                        <select id="transfer-to-branch" class="form-select" required>
                            ${activeBranches.filter(b => b.id !== currentBranchId).map(b => 
                                `<option value="${b.id}">${b.name}</option>`
                            ).join('')}
                        </select>
                    </div>
                </div>

                <div class="form-group" style="margin-bottom: var(--spacing-md);">
                    <label>Buscar Pieza</label>
                    <input type="text" id="transfer-search-item" class="form-input" placeholder="Buscar por SKU, código de barras o nombre..." 
                           oninput="window.Transfers.searchItemForTransfer(this.value)">
                </div>

                <div id="transfer-items-list" style="max-height: 300px; overflow-y: auto; border: 1px solid var(--color-border-light); border-radius: var(--radius-sm); padding: var(--spacing-sm);">
                    <p style="text-align: center; color: var(--color-text-secondary); padding: var(--spacing-md);">
                        Busca piezas para agregar a la transferencia
                    </p>
                </div>

                <div id="transfer-selected-items" style="margin-top: var(--spacing-md); padding: var(--spacing-sm); background: var(--color-bg-secondary); border-radius: var(--radius-sm); min-height: 50px;">
                    <p style="text-align: center; color: var(--color-text-secondary); font-size: 12px;">
                        No hay items seleccionados
                    </p>
                </div>

                <div class="form-group" style="margin-top: var(--spacing-md);">
                    <label>Notas (opcional)</label>
                    <textarea id="transfer-notes" class="form-textarea" rows="3" placeholder="Notas sobre la transferencia..."></textarea>
                </div>
            </form>
        `;

        UI.showModal('Nueva Transferencia', body, [
            { text: 'Cancelar', class: 'btn-secondary', onclick: 'UI.closeModal()' },
            { text: 'Crear Transferencia', class: 'btn-primary', onclick: 'window.Transfers.createTransfer()' }
        ]);

        // Inicializar lista de items disponibles
        this.transferSelectedItems = [];
        this.updateTransferSelectedItems();
    },

    async searchItemForTransfer(query) {
        if (!query || query.length < 2) {
            document.getElementById('transfer-items-list').innerHTML = 
                '<p style="text-align: center; color: var(--color-text-secondary); padding: var(--spacing-md);">Busca piezas para agregar a la transferencia</p>';
            return;
        }

        const fromBranchId = document.getElementById('transfer-from-branch')?.value;
        if (!fromBranchId) return;

        // Buscar items en la sucursal origen
        const allItems = await DB.getAll('inventory_items', null, null, { 
            filterByBranch: false 
        }) || [];
        const branchItems = allItems.filter(i => 
            i.branch_id === fromBranchId && 
            i.status === 'disponible' && 
            (i.stock_actual ?? 1) > 0 &&
            (i.sku?.toLowerCase().includes(query.toLowerCase()) ||
             i.barcode?.includes(query) ||
             i.name?.toLowerCase().includes(query.toLowerCase()))
        );

        const container = document.getElementById('transfer-items-list');
        if (branchItems.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--color-text-secondary); padding: var(--spacing-md);">No se encontraron piezas</p>';
            return;
        }

        container.innerHTML = branchItems.map(item => {
            const alreadySelected = this.transferSelectedItems.find(ti => ti.id === item.id);
            return `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: var(--spacing-sm); border-bottom: 1px solid var(--color-border-light);">
                    <div style="flex: 1;">
                        <div style="font-weight: 600; font-size: 13px;">${item.name}</div>
                        <div style="font-size: 11px; color: var(--color-text-secondary);">
                            SKU: ${item.sku || 'N/A'} | Stock: ${item.stock_actual ?? 1}
                        </div>
                    </div>
                    ${alreadySelected ? `
                        <span style="color: var(--color-success); font-size: 12px;">
                            <i class="fas fa-check"></i> Agregado (${alreadySelected.quantity})
                        </span>
                    ` : `
                        <button class="btn-primary btn-sm" onclick="window.Transfers.addItemToTransfer('${item.id}')">
                            <i class="fas fa-plus"></i> Agregar
                        </button>
                    `}
                </div>
            `;
        }).join('');
    },

    async addItemToTransfer(itemId) {
        const item = await DB.get('inventory_items', itemId);
        if (!item) return;

        const existing = this.transferSelectedItems.find(ti => ti.id === itemId);
        if (existing) {
            if (existing.quantity < (item.stock_actual ?? 1)) {
                existing.quantity++;
            } else {
                Utils.showNotification('No hay suficiente stock disponible', 'warning');
                return;
            }
        } else {
            this.transferSelectedItems.push({
                id: item.id,
                name: item.name,
                sku: item.sku,
                quantity: 1,
                maxQuantity: item.stock_actual ?? 1
            });
        }

        this.updateTransferSelectedItems();
        await this.searchItemForTransfer(document.getElementById('transfer-search-item')?.value || '');
    },

    updateTransferSelectedItems() {
        const container = document.getElementById('transfer-selected-items');
        if (!container) return;

        if (this.transferSelectedItems.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--color-text-secondary); font-size: 12px;">No hay items seleccionados</p>';
            return;
        }

        container.innerHTML = `
            <div style="margin-bottom: var(--spacing-sm); font-weight: 600; font-size: 12px;">
                Items Seleccionados (${this.transferSelectedItems.length})
            </div>
            ${this.transferSelectedItems.map((item, index) => `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: var(--spacing-xs); background: var(--color-bg); border-radius: var(--radius-xs); margin-bottom: var(--spacing-xs);">
                    <div style="flex: 1;">
                        <div style="font-size: 12px; font-weight: 600;">${item.name}</div>
                        <div style="font-size: 10px; color: var(--color-text-secondary);">SKU: ${item.sku}</div>
                    </div>
                    <div style="display: flex; align-items: center; gap: var(--spacing-xs);">
                        <button class="btn-secondary btn-sm" onclick="window.Transfers.decreaseTransferQuantity(${index})" ${item.quantity <= 1 ? 'disabled' : ''}>
                            <i class="fas fa-minus"></i>
                        </button>
                        <span style="min-width: 30px; text-align: center; font-weight: 600;">${item.quantity}</span>
                        <button class="btn-secondary btn-sm" onclick="window.Transfers.increaseTransferQuantity(${index})" ${item.quantity >= item.maxQuantity ? 'disabled' : ''}>
                            <i class="fas fa-plus"></i>
                        </button>
                        <button class="btn-danger btn-sm" onclick="window.Transfers.removeItemFromTransfer(${index})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `).join('')}
        `;
    },

    decreaseTransferQuantity(index) {
        if (this.transferSelectedItems[index].quantity > 1) {
            this.transferSelectedItems[index].quantity--;
            this.updateTransferSelectedItems();
        }
    },

    increaseTransferQuantity(index) {
        if (this.transferSelectedItems[index].quantity < this.transferSelectedItems[index].maxQuantity) {
            this.transferSelectedItems[index].quantity++;
            this.updateTransferSelectedItems();
        }
    },

    removeItemFromTransfer(index) {
        this.transferSelectedItems.splice(index, 1);
        this.updateTransferSelectedItems();
        const query = document.getElementById('transfer-search-item')?.value || '';
        if (query) {
            this.searchItemForTransfer(query);
        }
    },

    async createTransfer() {
        try {
            const fromBranchId = document.getElementById('transfer-from-branch')?.value;
            const toBranchId = document.getElementById('transfer-to-branch')?.value;
            const notes = document.getElementById('transfer-notes')?.value || '';

            if (!fromBranchId || !toBranchId) {
                Utils.showNotification('Selecciona sucursal origen y destino', 'error');
                return;
            }

            if (fromBranchId === toBranchId) {
                Utils.showNotification('La sucursal origen y destino no pueden ser la misma', 'error');
                return;
            }

            if (!this.transferSelectedItems || this.transferSelectedItems.length === 0) {
                Utils.showNotification('Agrega al menos un item a la transferencia', 'error');
                return;
            }

            // Generar folio
            const branches = await DB.getAll('catalog_branches') || [];
            const fromBranch = branches.find(b => b.id === fromBranchId);
            const branchCode = fromBranch?.name.replace(/\s+/g, '').substring(0, 3).toUpperCase() || 'TRF';
            const folio = `TRF-${branchCode}-${Date.now().toString().slice(-6)}`;

            // Crear transferencia
            const transfer = {
                id: Utils.generateId(),
                folio: folio,
                from_branch_id: fromBranchId,
                to_branch_id: toBranchId,
                status: 'pending',
                items_count: this.transferSelectedItems.length,
                notes: notes,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                created_by: UserManager.currentUser?.id || null,
                sync_status: 'pending'
            };

            await DB.add('inventory_transfers', transfer);

            // Crear items de transferencia
            for (const item of this.transferSelectedItems) {
                await DB.add('inventory_transfer_items', {
                    id: Utils.generateId(),
                    transfer_id: transfer.id,
                    item_id: item.id,
                    quantity: item.quantity,
                    created_at: new Date().toISOString()
                });
            }

            // Agregar a cola de sincronización
            if (typeof SyncManager !== 'undefined') {
                await SyncManager.addToQueue('inventory_transfer', transfer.id);
            }

            Utils.showNotification(`Transferencia ${folio} creada exitosamente`, 'success');
            UI.closeModal();
            await this.loadTransfers();
        } catch (e) {
            console.error('Error creating transfer:', e);
            Utils.showNotification('Error al crear transferencia: ' + e.message, 'error');
        }
    },

    async viewTransfer(transferId) {
        const transfer = await DB.get('inventory_transfers', transferId);
        if (!transfer) {
            Utils.showNotification('Transferencia no encontrada', 'error');
            return;
        }

        const transferItems = await DB.query('inventory_transfer_items', 'transfer_id', transferId) || [];
        const branches = await DB.getAll('catalog_branches') || [];
        const fromBranch = branches.find(b => b.id === transfer.from_branch_id);
        const toBranch = branches.find(b => b.id === transfer.to_branch_id);

        const statusLabels = {
            'pending': 'Pendiente',
            'in_transit': 'En Tránsito',
            'completed': 'Completada',
            'cancelled': 'Cancelada'
        };

        // Obtener detalles de items
        const itemsDetails = [];
        for (const ti of transferItems) {
            const item = await DB.get('inventory_items', ti.item_id);
            if (item) {
                itemsDetails.push({
                    ...ti,
                    item: item
                });
            }
        }

        const body = `
            <div style="max-width: 100%;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-md); margin-bottom: var(--spacing-md);">
                    <div>
                        <div style="font-size: 11px; color: var(--color-text-secondary); margin-bottom: var(--spacing-xs);">Folio</div>
                        <div style="font-weight: 600; font-size: 14px;">${transfer.folio}</div>
                    </div>
                    <div>
                        <div style="font-size: 11px; color: var(--color-text-secondary); margin-bottom: var(--spacing-xs);">Estado</div>
                        <div><span class="status-badge status-${transfer.status === 'completed' ? 'success' : transfer.status === 'cancelled' ? 'danger' : 'warning'}">${statusLabels[transfer.status] || transfer.status}</span></div>
                    </div>
                    <div>
                        <div style="font-size: 11px; color: var(--color-text-secondary); margin-bottom: var(--spacing-xs);">Desde</div>
                        <div style="font-weight: 600;">${fromBranch?.name || transfer.from_branch_id}</div>
                    </div>
                    <div>
                        <div style="font-size: 11px; color: var(--color-text-secondary); margin-bottom: var(--spacing-xs);">Hacia</div>
                        <div style="font-weight: 600;">${toBranch?.name || transfer.to_branch_id}</div>
                    </div>
                    <div>
                        <div style="font-size: 11px; color: var(--color-text-secondary); margin-bottom: var(--spacing-xs);">Fecha Creación</div>
                        <div>${Utils.formatDate(new Date(transfer.created_at), 'DD/MM/YYYY HH:mm')}</div>
                    </div>
                    ${transfer.updated_at !== transfer.created_at ? `
                    <div>
                        <div style="font-size: 11px; color: var(--color-text-secondary); margin-bottom: var(--spacing-xs);">Última Actualización</div>
                        <div>${Utils.formatDate(new Date(transfer.updated_at), 'DD/MM/YYYY HH:mm')}</div>
                    </div>
                    ` : ''}
                </div>

                ${transfer.notes ? `
                <div style="margin-bottom: var(--spacing-md); padding: var(--spacing-sm); background: var(--color-bg-secondary); border-radius: var(--radius-sm);">
                    <div style="font-size: 11px; color: var(--color-text-secondary); margin-bottom: var(--spacing-xs);">Notas</div>
                    <div>${Utils.escapeHtml(transfer.notes)}</div>
                </div>
                ` : ''}

                <div style="margin-bottom: var(--spacing-md);">
                    <div style="font-size: 12px; font-weight: 600; margin-bottom: var(--spacing-sm);">Items (${itemsDetails.length})</div>
                    <div style="max-height: 300px; overflow-y: auto; border: 1px solid var(--color-border-light); border-radius: var(--radius-sm);">
                        <table class="data-table" style="width: 100%;">
                            <thead>
                                <tr>
                                    <th>SKU</th>
                                    <th>Nombre</th>
                                    <th>Cantidad</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${itemsDetails.map(detail => `
                                    <tr>
                                        <td>${detail.item.sku || 'N/A'}</td>
                                        <td>${detail.item.name}</td>
                                        <td style="text-align: center; font-weight: 600;">${detail.quantity}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;

        const buttons = [
            { text: 'Cerrar', class: 'btn-secondary', onclick: 'UI.closeModal()' }
        ];

        if (transfer.status === 'pending') {
            buttons.push(
                { text: 'Completar', class: 'btn-primary', onclick: `window.Transfers.completeTransfer('${transfer.id}')` },
                { text: 'Cancelar', class: 'btn-danger', onclick: `window.Transfers.cancelTransfer('${transfer.id}')` }
            );
        }

        UI.showModal(`Transferencia ${transfer.folio}`, body, buttons);
    },

    async completeTransfer(transferId) {
        const confirmed = await Utils.confirm(
            '¿Completar transferencia?',
            'Esto moverá los items de la sucursal origen a la sucursal destino. Esta acción no se puede deshacer.',
            'Completar',
            'Cancelar'
        );

        if (!confirmed) return;

        try {
            const transfer = await DB.get('inventory_transfers', transferId);
            if (!transfer) {
                Utils.showNotification('Transferencia no encontrada', 'error');
                return;
            }

            if (transfer.status !== 'pending') {
                Utils.showNotification('Solo se pueden completar transferencias pendientes', 'error');
                return;
            }

            // Obtener items de la transferencia
            const transferItems = await DB.query('inventory_transfer_items', 'transfer_id', transferId) || [];

            // Verificar stock y mover items
            for (const ti of transferItems) {
                const item = await DB.get('inventory_items', ti.item_id);
                if (!item) continue;

                // Verificar que el item esté en la sucursal origen
                if (item.branch_id !== transfer.from_branch_id) {
                    Utils.showNotification(`El item ${item.name} no está en la sucursal origen`, 'error');
                    return;
                }

                // Verificar stock disponible
                const currentStock = item.stock_actual ?? 1;
                if (currentStock < ti.quantity) {
                    Utils.showNotification(`Stock insuficiente para ${item.name}`, 'error');
                    return;
                }

                // Actualizar item: cambiar sucursal y reducir stock
                item.branch_id = transfer.to_branch_id;
                item.stock_actual = Math.max(0, currentStock - ti.quantity);
                item.updated_at = new Date().toISOString();

                await DB.put('inventory_items', item);

                // Registrar movimiento en log
                await DB.add('inventory_logs', {
                    id: Utils.generateId(),
                    item_id: item.id,
                    action: 'transferencia',
                    quantity: -ti.quantity,
                    notes: `Transferencia ${transfer.folio} a ${transfer.to_branch_id}`,
                    created_at: new Date().toISOString()
                });
            }

            // Actualizar estado de transferencia
            transfer.status = 'completed';
            transfer.completed_at = new Date().toISOString();
            transfer.updated_at = new Date().toISOString();
            await DB.put('inventory_transfers', transfer);

            // Sincronizar
            if (typeof SyncManager !== 'undefined') {
                await SyncManager.addToQueue('inventory_transfer', transfer.id);
            }

            Utils.showNotification('Transferencia completada exitosamente', 'success');
            UI.closeModal();
            await this.loadTransfers();
        } catch (e) {
            console.error('Error completing transfer:', e);
            Utils.showNotification('Error al completar transferencia: ' + e.message, 'error');
        }
    },

    async cancelTransfer(transferId) {
        const confirmed = await Utils.confirm(
            '¿Cancelar transferencia?',
            'Esta acción cancelará la transferencia. Los items permanecerán en la sucursal origen.',
            'Cancelar Transferencia',
            'No Cancelar'
        );

        if (!confirmed) return;

        try {
            const transfer = await DB.get('inventory_transfers', transferId);
            if (!transfer) {
                Utils.showNotification('Transferencia no encontrada', 'error');
                return;
            }

            if (transfer.status !== 'pending') {
                Utils.showNotification('Solo se pueden cancelar transferencias pendientes', 'error');
                return;
            }

            transfer.status = 'cancelled';
            transfer.updated_at = new Date().toISOString();
            await DB.put('inventory_transfers', transfer);

            // Sincronizar
            if (typeof SyncManager !== 'undefined') {
                await SyncManager.addToQueue('inventory_transfer', transfer.id);
            }

            Utils.showNotification('Transferencia cancelada', 'success');
            UI.closeModal();
            await this.loadTransfers();
        } catch (e) {
            console.error('Error cancelling transfer:', e);
            Utils.showNotification('Error al cancelar transferencia: ' + e.message, 'error');
        }
    }
};

window.Transfers = Transfers;

