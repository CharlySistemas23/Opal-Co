// Barcode Manager - Code 128 generation and scanning

const BarcodeManager = {
    init() {
        this.setupScanner();
    },

    setupScanner() {
        // Global barcode scanner handler
        const scanner = Utils.createBarcodeScanner((barcode) => {
            this.handleBarcodeScan(barcode);
        });
        
        document.addEventListener('keydown', (e) => {
            // Only process if not in input field (unless it's the barcode input)
            if (e.target.tagName === 'INPUT' && e.target.id !== 'employee-barcode-input' && !e.target.classList.contains('barcode-input')) {
                return;
            }
            scanner(e);
        });
    },

    async handleBarcodeScan(barcode) {
        const context = this.getScanContext();
        
        switch (context) {
            case 'login':
                await this.handleLoginScan(barcode);
                break;
            case 'pos':
                await this.handlePOSScan(barcode);
                break;
            case 'inventory':
                await this.handleInventoryScan(barcode);
                break;
            case 'tourist-report':
                await this.handleTouristReportScan(barcode);
                break;
            default:
                // Try to find item by barcode
                await this.handleGenericScan(barcode);
        }
    },

    getScanContext() {
        // Determine context based on active module and focused element
        const activeModule = UI.currentModule;
        const focused = document.activeElement;
        
        if (activeModule === 'login' || focused?.id === 'employee-barcode-input') {
            return 'login';
        }
        if (activeModule === 'pos' || focused?.classList.contains('pos-scan-input')) {
            return 'pos';
        }
        if (activeModule === 'inventory') {
            return 'inventory';
        }
        if (activeModule === 'tourist-report') {
            return 'tourist-report';
        }
        return 'generic';
    },

    async handleLoginScan(barcode) {
        try {
            const employee = await DB.getByIndex('employees', 'barcode', barcode);
            if (employee && employee.active) {
                document.getElementById('employee-barcode-input').value = employee.name;
                document.getElementById('pin-group').style.display = 'block';
                document.getElementById('pin-input').focus();
                // Store employee for login
                window.currentEmployee = employee;
            } else {
                Utils.showNotification('Empleado no encontrado', 'error');
            }
        } catch (e) {
            console.error('Error scanning employee:', e);
            Utils.showNotification('Error al buscar empleado', 'error');
        }
    },

    async handlePOSScan(barcode) {
        try {
            // Primero verificar si es un guía
            const guide = await DB.getByIndex('catalog_guides', 'barcode', barcode);
            if (guide && guide.active) {
                // Es un guía, cargar agencia automáticamente
                if (window.POS && window.POS.setGuide) {
                    await window.POS.setGuide(guide);
                    return;
                }
            }
            
            // Si no es guía, buscar producto
            // Pero primero verificar que ya se haya escaneado un guía
            if (window.POS && !window.POS.currentGuide) {
                Utils.showNotification('Primero escanea el código de barras del GUÍA', 'error');
                return;
            }
            
            const item = await DB.getByIndex('inventory_items', 'barcode', barcode);
            if (item) {
                if (item.status === 'disponible') {
                    // Agregar directamente al carrito
                    if (window.POS && window.POS.selectProduct) {
                        await window.POS.selectProduct(item.id);
                    }
                } else {
                    Utils.showNotification(`Pieza ${item.status}`, 'error');
                }
            } else {
                Utils.showNotification('Pieza no encontrada', 'error');
            }
        } catch (e) {
            console.error('Error scanning item:', e);
            Utils.showNotification('Error al buscar pieza', 'error');
        }
    },

    async handleInventoryScan(barcode) {
        try {
            const item = await DB.getByIndex('inventory_items', 'barcode', barcode);
            if (item && window.Inventory && window.Inventory.showItemDetails) {
                window.Inventory.showItemDetails(item);
            } else {
                Utils.showNotification('Pieza no encontrada', 'error');
            }
        } catch (e) {
            console.error('Error scanning item:', e);
        }
    },

    async handleTouristReportScan(barcode) {
        // Handle scan in tourist report line
        const activeLine = document.querySelector('.tourist-line-active');
        if (activeLine && window.TouristReport && window.TouristReport.addItemToLine) {
            try {
                const item = await DB.getByIndex('inventory_items', 'barcode', barcode);
                if (item) {
                    window.TouristReport.addItemToLine(activeLine.dataset.lineId, item);
                }
            } catch (e) {
                console.error('Error scanning for tourist report:', e);
            }
        }
    },

    async handleGenericScan(barcode) {
        // Record scan in history
        if (window.BarcodesModule && window.BarcodesModule.recordScan) {
            await window.BarcodesModule.recordScan(barcode, 'generic', null, 'item');
        }

        // Try to find in inventory
        try {
            const item = await DB.getByIndex('inventory_items', 'barcode', barcode);
            if (item) {
                Utils.showNotification(`Pieza encontrada: ${item.name}`, 'success');
                // Switch to inventory module
                UI.showModule('inventory');
                if (window.Inventory) {
                    window.Inventory.highlightItem(item.id);
                }
            } else {
                Utils.showNotification('Código no encontrado', 'warning');
            }
        } catch (e) {
            console.error('Error in generic scan:', e);
        }
    },

    // Generate barcode with format support
    generateBarcode(value, elementId, format = 'CODE128', options = {}) {
        if (typeof JsBarcode === 'undefined') {
            console.error('JsBarcode no está cargado');
            return;
        }
        
        try {
            const defaultOptions = {
                format: format,
                width: options.width || 2,
                height: options.height || 50,
                displayValue: options.displayValue !== false,
                fontSize: options.fontSize || 12
            };

            JsBarcode(`#${elementId}`, value, defaultOptions);
        } catch (e) {
            console.error('Error generating barcode:', e);
        }
    },

    // Generate Code 128 barcode (backward compatibility)
    generateCode128(value, elementId) {
        this.generateBarcode(value, elementId, 'CODE128');
    },

    // Generate barcode image as data URL with format support
    async generateBarcodeImage(value, format = 'CODE128', options = {}) {
        return new Promise((resolve, reject) => {
            if (typeof JsBarcode === 'undefined') {
                reject(new Error('JsBarcode no está cargado'));
                return;
            }
            
            const canvas = document.createElement('canvas');
            try {
                const defaultOptions = {
                    format: format,
                    width: options.width || 2,
                    height: options.height || 50,
                    displayValue: options.displayValue !== false,
                    fontSize: options.fontSize || 12
                };

                JsBarcode(canvas, value, defaultOptions);
                resolve(canvas.toDataURL('image/png'));
            } catch (e) {
                reject(e);
            }
        });
    },

    // Print barcode label
    async printBarcodeLabel(item) {
        const printWindow = window.open('', '_blank');
        const barcodeImg = await this.generateBarcodeImage(item.barcode || item.sku);
        
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Etiqueta ${item.sku}</title>
                <style>
                    body {
                        margin: 0;
                        padding: 10mm;
                        font-family: Arial, sans-serif;
                        font-size: 10pt;
                    }
                    .label {
                        width: 58mm;
                        text-align: center;
                    }
                    .label h3 {
                        margin: 5mm 0;
                        font-size: 12pt;
                    }
                    .label img {
                        max-width: 100%;
                        height: auto;
                    }
                    .label .price {
                        margin-top: 5mm;
                        font-size: 14pt;
                        font-weight: bold;
                    }
                    @media print {
                        @page {
                            size: 58mm auto;
                            margin: 0;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="label">
                    <h3>${item.name || item.sku}</h3>
                    <img src="${barcodeImg}" alt="Barcode">
                    <div class="price">${Utils.formatCurrency(item.price, 'MXN')}</div>
                    <div>SKU: ${item.sku}</div>
                </div>
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    }
};

