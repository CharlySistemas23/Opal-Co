// Utilidades generales

const Utils = {
    // Formato de moneda
    formatCurrency(amount, currency = 'MXN') {
        const symbols = {
            'MXN': '$',
            'USD': 'US$',
            'EUR': '€',
            'CAD': 'C$'
        };
        const symbol = symbols[currency] || '$';
        return `${symbol}${parseFloat(amount || 0).toFixed(2)}`;
    },

    // Formato de fecha
    formatDate(date, format = 'YYYY-MM-DD') {
        if (!date) return '';
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        
        return format
            .replace('YYYY', year)
            .replace('MM', month)
            .replace('DD', day)
            .replace('HH', hours)
            .replace('mm', minutes);
    },

    // Generar ID único
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    // Generar folio
    generateFolio(branchCode, date = new Date()) {
        const dateStr = this.formatDate(date, 'YYYYMMDD');
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        return `${branchCode}-${dateStr}-${random}`;
    },

    // Hash simple para PIN
    async hashPin(pin) {
        const encoder = new TextEncoder();
        const data = encoder.encode(pin);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    },

    // Validar PIN
    async validatePin(inputPin, storedHash) {
        const inputHash = await this.hashPin(inputPin);
        return inputHash === storedHash;
    },

    // Debounce
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Mostrar notificación
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            padding: 8px 14px;
            background: ${type === 'error' ? '#d32f2f' : type === 'success' ? '#388e3c' : '#2c2c2c'};
            color: white;
            border-radius: 8px;
            box-shadow: 0 4px 16px rgba(0,0,0,0.2);
            z-index: 2000;
            animation: slideIn 0.3s ease;
        `;
        document.body.appendChild(notification);
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    },

    // Confirmar acción
    async confirm(message) {
        return new Promise((resolve) => {
            const modal = document.createElement('div');
            modal.className = 'modal-overlay';
            modal.style.display = 'flex';
            modal.innerHTML = `
                <div class="modal modal-small">
                    <div class="modal-header">
                        <h3>Confirmar</h3>
                        <button class="modal-close" onclick="this.closest('.modal-overlay').remove(); resolve(false);">&times;</button>
                    </div>
                    <div class="modal-body">
                        <p>${message}</p>
                    </div>
                    <div class="modal-footer">
                        <button class="btn-secondary" onclick="this.closest('.modal-overlay').remove(); resolve(false);">Cancelar</button>
                        <button class="btn-primary" onclick="this.closest('.modal-overlay').remove(); resolve(true);">Confirmar</button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
        });
    },

    // Cargar imagen como Blob
    async loadImageAsBlob(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    },

    // Crear thumbnail
    async createThumbnail(imageBlob, maxWidth = 200, maxHeight = 200) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                
                if (width > height) {
                    if (width > maxWidth) {
                        height *= maxWidth / width;
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width *= maxHeight / height;
                        height = maxHeight;
                    }
                }
                
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', 0.8));
            };
            img.src = imageBlob;
        });
    },

    // Exportar a CSV
    exportToCSV(data, filename) {
        if (!data || data.length === 0) return;
        
        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','),
            ...data.map(row => headers.map(header => {
                const value = row[header] || '';
                return `"${String(value).replace(/"/g, '""')}"`;
            }).join(','))
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
    },

    // Exportar a Excel (requiere SheetJS)
    exportToExcel(data, filename, sheetName = 'Sheet1') {
        if (typeof XLSX === 'undefined') {
            this.showNotification('SheetJS no está cargado', 'error');
            return;
        }
        
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, sheetName);
        XLSX.writeFile(wb, filename);
    },

    // Verificar disponibilidad de jsPDF
    checkJsPDF() {
        // Intentar múltiples formas de acceso
        if (typeof window.jspdf !== 'undefined') {
            return window.jspdf;
        }
        if (typeof window.jsPDF !== 'undefined') {
            return { jsPDF: window.jsPDF };
        }
        if (typeof jsPDF !== 'undefined') {
            return { jsPDF: jsPDF };
        }
        return null;
    },

    // Exportar a PDF (requiere jsPDF)
    exportToPDF(data, filename, title = 'Reporte', options = {}) {
        const jspdfLib = this.checkJsPDF();
        
        if (!jspdfLib) {
            this.showNotification('jsPDF no está cargado. Por favor, verifica que el archivo libs/jspdf.umd.min.js esté incluido en index.html.', 'error');
            console.error('jsPDF no disponible. Verifica:', {
                'window.jspdf': typeof window.jspdf,
                'window.jsPDF': typeof window.jsPDF,
                'jsPDF global': typeof jsPDF
            });
            return;
        }
        
        const { jsPDF } = jspdfLib;
        const doc = new jsPDF({
            orientation: options.orientation || 'portrait',
            unit: 'mm',
            format: options.format || 'a4'
        });

        // Header
        doc.setFillColor(29, 29, 31);
        doc.rect(0, 0, doc.internal.pageSize.getWidth(), 30, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text('OPAL & CO', 14, 15);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text(title, 14, 22);
        
        // Reset text color
        doc.setTextColor(0, 0, 0);
        
        let y = 40;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        
        if (data && data.length > 0) {
            const headers = Object.keys(data[0]);
            const pageWidth = doc.internal.pageSize.getWidth();
            const margin = 14;
            const colWidth = (pageWidth - margin * 2) / headers.length;
            
            // Table header background
            doc.setFillColor(245, 246, 248);
            doc.rect(margin, y - 5, pageWidth - margin * 2, 8, 'F');
            
            // Headers
            doc.setFont('helvetica', 'bold');
            let x = margin;
            headers.forEach((header, i) => {
                doc.text(header, x + 2, y);
                x += colWidth;
            });
            
            y += 8;
            doc.setFont('helvetica', 'normal');
            
            // Data rows
            data.forEach((row, idx) => {
                if (y > 270) {
                    doc.addPage();
                    y = 20;
                }
                
                // Alternate row colors
                if (idx % 2 === 0) {
                    doc.setFillColor(250, 250, 250);
                    doc.rect(margin, y - 4, pageWidth - margin * 2, 6, 'F');
                }
                
                x = margin;
                headers.forEach((header, i) => {
                    const value = String(row[header] || '').substring(0, 25);
                    doc.text(value, x + 2, y);
                    x += colWidth;
                });
                y += 6;
            });
        }
        
        // Footer
        const totalPages = doc.internal.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(128, 128, 128);
            doc.text(
                `Página ${i} de ${totalPages}`,
                pageWidth / 2,
                doc.internal.pageSize.getHeight() - 10,
                { align: 'center' }
            );
            doc.text(
                `Generado: ${this.formatDate(new Date(), 'DD/MM/YYYY HH:mm')}`,
                pageWidth - margin,
                doc.internal.pageSize.getHeight() - 10,
                { align: 'right' }
            );
        }
        
        doc.save(filename);
    },

    // Detectar escaneo vs tecleo (velocidad)
    createBarcodeScanner(callback, minSpeed = 50) {
        let buffer = '';
        let lastKeyTime = 0;
        let timeout;
        
        return (event) => {
            const now = Date.now();
            const timeSinceLastKey = now - lastKeyTime;
            lastKeyTime = now;
            
            if (event.key === 'Enter') {
                if (buffer.length > 0 && timeSinceLastKey < minSpeed) {
                    // Probable escaneo
                    callback(buffer.trim());
                    buffer = '';
                }
                clearTimeout(timeout);
                return;
            }
            
            if (event.key.length === 1) {
                buffer += event.key;
                clearTimeout(timeout);
                timeout = setTimeout(() => {
                    buffer = '';
                }, 200);
            }
        };
    },

    // Calcular comisión
    calculateCommission(amount, discountPct, multiplier) {
        const afterDiscount = amount * (1 - (discountPct || 0) / 100);
        return afterDiscount * (multiplier || 0) / 100;
    },

    // Generar código de barras para vendedor
    generateSellerBarcode(seller) {
        if (seller.barcode && seller.barcode.trim() !== '' && seller.barcode !== 'Sin código') {
            return seller.barcode;
        }
        // Usar ID o nombre para generar código único
        const base = seller.id ? seller.id.replace(/[^A-Z0-9]/gi, '').substring(0, 8).toUpperCase() : 
                     seller.name ? seller.name.replace(/[^A-Z0-9]/gi, '').substring(0, 8).toUpperCase() : 
                     Date.now().toString().slice(-6);
        return `SELL${base}`;
    },

    // Generar código de barras para guía
    generateGuideBarcode(guide) {
        if (guide.barcode && guide.barcode.trim() !== '' && guide.barcode !== 'Sin código') {
            return guide.barcode;
        }
        // Usar ID o nombre para generar código único
        const base = guide.id ? guide.id.replace(/[^A-Z0-9]/gi, '').substring(0, 8).toUpperCase() : 
                     guide.name ? guide.name.replace(/[^A-Z0-9]/gi, '').substring(0, 8).toUpperCase() : 
                     Date.now().toString().slice(-6);
        return `GUIDE${base}`;
    },

    // Generar código de barras para agencia
    generateAgencyBarcode(agency) {
        if (agency.barcode && agency.barcode.trim() !== '' && agency.barcode !== 'Sin código') {
            return agency.barcode;
        }
        // Usar ID o nombre para generar código único
        const base = agency.id ? agency.id.replace(/[^A-Z0-9]/gi, '').substring(0, 8).toUpperCase() : 
                     agency.name ? agency.name.replace(/[^A-Z0-9]/gi, '').substring(0, 8).toUpperCase() : 
                     Date.now().toString().slice(-6);
        return `AG${base}`;
    },

    // Validar si un código de barras está vacío o inválido
    isBarcodeEmpty(barcode) {
        return !barcode || barcode.trim() === '' || barcode === 'Sin código' || barcode === 'N/A';
    },

    // Confirmación
    async confirm(message) {
        return new Promise((resolve) => {
            const confirmed = window.confirm(message);
            resolve(confirmed);
        });
    },

    // Exportar a Excel
    exportToExcel(data, filename, sheetName = 'Sheet1') {
        if (typeof XLSX === 'undefined') {
            this.showNotification('SheetJS no está disponible', 'error');
            return;
        }

        try {
            const ws = XLSX.utils.json_to_sheet(data);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, sheetName);
            XLSX.writeFile(wb, filename);
        } catch (e) {
            console.error('Error exporting to Excel:', e);
            this.showNotification('Error al exportar Excel', 'error');
        }
    },

    // Exportar a CSV
    exportToCSV(data, filename) {
        if (!data || data.length === 0) {
            this.showNotification('No hay datos para exportar', 'warning');
            return;
        }

        try {
            const headers = Object.keys(data[0]);
            const csvRows = [
                headers.join(','),
                ...data.map(row => 
                    headers.map(header => {
                        const value = row[header];
                        if (value === null || value === undefined) return '';
                        const stringValue = String(value);
                        return stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')
                            ? `"${stringValue.replace(/"/g, '""')}"`
                            : stringValue;
                    }).join(',')
                )
            ];

            const csvContent = csvRows.join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            
            link.setAttribute('href', url);
            link.setAttribute('download', filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (e) {
            console.error('Error exporting to CSV:', e);
            this.showNotification('Error al exportar CSV', 'error');
        }
    },

    // Obtener tipos de cambio desde internet (USD y CAD)
    async fetchExchangeRates() {
        try {
            // Usar API gratuita de exchangerate-api.com (sin API key necesario)
            const response = await fetch('https://api.exchangerate-api.com/v4/latest/MXN');
            
            if (!response.ok) {
                throw new Error('Error al obtener tipos de cambio');
            }
            
            const data = await response.json();
            
            // Obtener USD y CAD desde MXN
            const usd = data.rates?.USD ? (1 / data.rates.USD) : null;
            const cad = data.rates?.CAD ? (1 / data.rates.CAD) : null;
            
            if (!usd || !cad) {
                throw new Error('No se pudieron obtener todos los tipos de cambio');
            }
            
            return {
                usd: parseFloat(usd.toFixed(4)),
                cad: parseFloat(cad.toFixed(4)),
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('Error fetching exchange rates:', error);
            this.showNotification('No se pudo obtener tipos de cambio. Usando valores guardados.', 'warning');
            return null;
        }
    }
};

// Agregar estilos de animación si no existen
if (!document.getElementById('notification-styles')) {
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

