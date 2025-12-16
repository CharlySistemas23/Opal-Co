// Printer Manager - Thermal Printer EC Line 58110

const Printer = {
    printerName: 'Ec line 58110',

    async printTicket(sale) {
        try {
            // Get sale items
            const items = await DB.query('sale_items', 'sale_id', sale.id);
            const payments = await DB.query('payments', 'sale_id', sale.id);
            
            // Get branch info
            const branch = await DB.get('catalog_branches', sale.branch_id);
            const seller = await DB.get('catalog_sellers', sale.seller_id);

            // Build ticket HTML
            const ticketHTML = this.buildTicketHTML(sale, items, payments, branch, seller);

            // Open print window
            const printWindow = window.open('', '_blank');
            printWindow.document.write(ticketHTML);
            printWindow.document.close();

            // Wait for content to load, then print
            printWindow.onload = () => {
                setTimeout(() => {
                    printWindow.print();
                    printWindow.close();
                }, 250);
            };
        } catch (e) {
            console.error('Error printing ticket:', e);
            Utils.showNotification('Error al imprimir ticket', 'error');
        }
    },

    buildTicketHTML(sale, items, payments, branch, seller) {
        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Ticket ${sale.folio}</title>
    <style>
        @page {
            size: 58mm auto;
            margin: 0;
        }
        body {
            margin: 0;
            padding: 4mm;
            font-family: 'Courier New', monospace;
            font-size: 10pt;
            width: 58mm;
        }
        .ticket-header {
            text-align: center;
            border-bottom: 1px dashed #000;
            padding-bottom: 4mm;
            margin-bottom: 4mm;
        }
        .ticket-header h1 {
            font-size: 14pt;
            margin: 0 0 2mm 0;
            font-weight: bold;
        }
        .ticket-header p {
            margin: 1mm 0;
            font-size: 8pt;
        }
        .ticket-body {
            margin-bottom: 4mm;
        }
        .ticket-line {
            display: flex;
            justify-content: space-between;
            margin-bottom: 2mm;
            font-size: 9pt;
        }
        .ticket-line-item {
            margin-bottom: 3mm;
            padding-bottom: 2mm;
            border-bottom: 1px dotted #ccc;
        }
        .ticket-line-item-name {
            font-weight: bold;
            margin-bottom: 1mm;
        }
        .ticket-totals {
            border-top: 1px dashed #000;
            padding-top: 4mm;
            margin-top: 4mm;
        }
        .ticket-total-line {
            display: flex;
            justify-content: space-between;
            margin-bottom: 2mm;
            font-size: 11pt;
        }
        .ticket-total-final {
            font-weight: bold;
            font-size: 12pt;
            border-top: 1px solid #000;
            padding-top: 2mm;
            margin-top: 2mm;
        }
        .ticket-footer {
            border-top: 1px dashed #000;
            padding-top: 4mm;
            margin-top: 4mm;
            text-align: center;
            font-size: 8pt;
        }
        .ticket-payments {
            margin-top: 4mm;
            padding-top: 4mm;
            border-top: 1px dashed #000;
        }
    </style>
</head>
<body>
    <div class="ticket-print">
        <div class="ticket-header">
            <h1>OPAL & CO</h1>
            <p>${branch?.name || 'Tienda'}</p>
            <p>Folio: ${sale.folio}</p>
            <p>${Utils.formatDate(sale.created_at, 'DD/MM/YYYY HH:mm')}</p>
            <p>Vendedor: ${seller?.name || ''}</p>
        </div>
        <div class="ticket-body">
            ${items.map(item => `
                <div class="ticket-line-item">
                    <div class="ticket-line-item-name">${item.name || 'Pieza'}</div>
                    <div class="ticket-line">
                        <span>${item.quantity}x ${Utils.formatCurrency(item.price)}</span>
                        <span>${Utils.formatCurrency(item.subtotal)}</span>
                    </div>
                    ${item.discount > 0 ? `<div class="ticket-line" style="font-size: 8pt; color: #666;">Desc: ${item.discount}%</div>` : ''}
                </div>
            `).join('')}
        </div>
        <div class="ticket-totals">
            <div class="ticket-line">
                <span>Subtotal:</span>
                <span>${Utils.formatCurrency(sale.subtotal)}</span>
            </div>
            ${sale.discount > 0 ? `
            <div class="ticket-line">
                <span>Descuento:</span>
                <span>${Utils.formatCurrency(sale.discount)}</span>
            </div>
            ` : ''}
            <div class="ticket-total-line ticket-total-final">
                <span>TOTAL:</span>
                <span>${Utils.formatCurrency(sale.total)} ${sale.currency}</span>
            </div>
        </div>
        <div class="ticket-payments">
            <p style="font-weight: bold; margin-bottom: 2mm;">PAGOS:</p>
            ${payments.map(p => `
                <div class="ticket-line" style="font-size: 9pt;">
                    <span>${this.getPaymentMethodName(p.method_id)}:</span>
                    <span>${Utils.formatCurrency(p.amount, p.currency)}</span>
                </div>
            `).join('')}
        </div>
        ${sale.notes ? `
        <div style="margin-top: 4mm; padding-top: 4mm; border-top: 1px dashed #000;">
            <p style="font-size: 8pt;"><strong>Notas:</strong></p>
            <p style="font-size: 8pt;">${sale.notes}</p>
        </div>
        ` : ''}
        <div class="ticket-footer">
            <p>Gracias por su compra</p>
            <p>${Utils.formatDate(new Date(), 'DD/MM/YYYY HH:mm')}</p>
        </div>
    </div>
</body>
</html>
        `;
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

    buildRepairTicketHTML(repair, customer, item) {
        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Ticket Reparación ${repair.folio}</title>
    <style>
        @page { size: 58mm auto; margin: 0; }
        body { margin: 0; padding: 4mm; font-family: 'Courier New', monospace; font-size: 10pt; width: 58mm; }
        .ticket-header { text-align: center; border-bottom: 1px dashed #000; padding-bottom: 4mm; margin-bottom: 4mm; }
        .ticket-header h1 { font-size: 14pt; margin: 0 0 2mm 0; font-weight: bold; }
        .ticket-body { margin-bottom: 4mm; }
        .ticket-line { display: flex; justify-content: space-between; margin-bottom: 2mm; font-size: 9pt; }
        .ticket-footer { border-top: 1px dashed #000; padding-top: 4mm; margin-top: 4mm; text-align: center; font-size: 8pt; }
    </style>
</head>
<body>
    <div class="ticket-print">
        <div class="ticket-header">
            <h1>OPAL & CO</h1>
            <p>REPARACIÓN</p>
            <p>Folio: ${repair.folio}</p>
            <p>${Utils.formatDate(repair.created_at, 'DD/MM/YYYY HH:mm')}</p>
        </div>
        <div class="ticket-body">
            <div class="ticket-line"><span>Cliente:</span><span>${customer?.name || 'N/A'}</span></div>
            <div class="ticket-line"><span>Pieza:</span><span>${item ? `${item.sku} - ${item.name}` : 'N/A'}</span></div>
            <div class="ticket-line"><span>Estado:</span><span>${repair.status}</span></div>
            <div class="ticket-line"><span>Costo:</span><span>${Utils.formatCurrency(repair.cost)}</span></div>
            <div style="margin-top: 4mm; padding-top: 4mm; border-top: 1px dashed #000;">
                <p><strong>Descripción:</strong></p>
                <p style="font-size: 8pt;">${repair.description}</p>
            </div>
        </div>
        <div class="ticket-footer">
            <p>Gracias por su preferencia</p>
        </div>
    </div>
</body>
</html>
        `;
    }
};

