# Sistema POS Opal & Co

Sistema POS completo para joyería de lujo, funcionando 100% offline con sincronización a Google Sheets.

## Características

- ✅ **100% Offline**: Funciona sin conexión a internet
- ✅ **IndexedDB**: Persistencia local robusta
- ✅ **Códigos de Barras**: Generación Code 128 y escaneo HID
- ✅ **Impresora Térmica**: Soporte para EC Line 58110 (58mm)
- ✅ **Múltiples Módulos**: POS, Inventario, Reportes, Costos, Reporte Turistas, etc.
- ✅ **Sincronización**: Google Sheets mediante Apps Script
- ✅ **Exportaciones**: PDF, Excel, CSV
- ✅ **Diseño Premium**: UI elegante blanco/gris minimalista

## Instalación

1. Descarga todos los archivos del proyecto
2. Abre `index.html` con doble clic (o desde un navegador)
3. El sistema se inicializará automáticamente

## Primera Configuración

### 1. Login Inicial

- **Usuario demo**: `admin`
- **PIN demo**: `1234`
- O escanea el código de barras del empleado: `EMP001`

### 2. Configurar Sincronización

1. Ve a **Configuración** → **Sincronización**
2. Sigue las instrucciones en `google_apps_script.js` para crear el Web App
3. Copia la URL y genera un TOKEN seguro
4. Ingresa la URL y TOKEN en la configuración

### 3. Configurar Impresora

1. Ejecuta `printer/install_EC_LINE_58110.bat` como Administrador
2. O sigue las instrucciones en `printer/README_printer.md`

## Estructura de Archivos

```
/
├── index.html              # Página principal
├── css/
│   └── styles.css          # Estilos principales
├── js/
│   ├── app.js             # Inicialización de la app
│   ├── db.js               # IndexedDB manager
│   ├── ui.js               # UI manager
│   ├── utils.js            # Utilidades
│   ├── barcodes.js         # Gestión de códigos de barras
│   ├── sync.js             # Sincronización
│   ├── users.js            # Autenticación
│   ├── pos.js              # Módulo POS
│   ├── inventory.js        # Módulo Inventario
│   ├── repairs.js          # Módulo Reparaciones
│   ├── reports.js          # Módulo Reportes
│   ├── costs.js            # Módulo Costos
│   ├── tourist_report.js   # Módulo Reporte Turistas
│   └── printer.js          # Gestión de impresión
├── libs/                   # Librerías externas (descargar)
│   ├── jspdf.umd.min.js
│   ├── xlsx.full.min.js
│   └── JsBarcode.all.min.js
├── assets/                 # Imágenes y recursos
│   └── logo.png
├── printer/                # Archivos de impresora
│   ├── install_EC_LINE_58110.bat
│   ├── test_ticket.txt
│   └── README_printer.md
├── google_apps_script.js   # Script para Google Sheets
└── README.md              # Este archivo
```

## Librerías Requeridas

Descarga las siguientes librerías y colócalas en `/libs/`:

1. **jsPDF**: https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js
2. **SheetJS (xlsx)**: https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js
3. **JsBarcode**: https://cdnjs.cloudflare.com/ajax/libs/jsbarcode/3.11.5/JsBarcode.all.min.js

## Uso

### POS (Punto de Venta)

1. Selecciona sucursal, vendedor, agencia, guía
2. Agrega piezas al carrito (búsqueda o escaneo)
3. Ingresa pagos (múltiples métodos/monedas)
4. Completa la venta
5. Se imprime el ticket automáticamente

### Inventario

1. Agrega nuevas piezas con fotos
2. Genera códigos de barras automáticamente
3. Imprime etiquetas
4. Exporta a Excel/PDF/CSV

### Reporte Turistas

1. Se crea automáticamente un reporte por día
2. Agrega renglones manualmente o desde ventas POS
3. Escanea piezas para agregar a renglones
4. Calcula totales automáticamente
5. Cierra y concilia el reporte

### Sincronización

- Automática cada 5 minutos si hay conexión
- Manual desde el botón de sincronización
- Cola offline con reintentos automáticos

## Catálogos Precargados

### Agencias
TRAVELEX, VERANOS, TANITOURS, DISCOVERY, TB, TTF

### Vendedores
SEBASTIAN, CALI, SAULA, ANDRES, ANGEL, SR ANGEL, RAMSES, ISAURA, CARLOS, PACO, FRANCISCO, OMAR, PANDA, KARLA, JUAN CARLOS, NADIA, JASON, ROBERTO, PEDRO, ANA, JOVA, EDITH, VERO, POCHIS, RAMON, ALDAIR, CLAUDIA, SERGIO, MANUEL

### Reglas de Comisión

- **SEBASTIAN**: *10 DIRECTO
- **OMAR y JUAN CARLOS**: -20% *7%
- **Todos los demás**: -5% *9%
- **Guías (general)**: -18% *10%
- **MARINA**: *10 DIRECTO

## Métricas

- **Ticket Promedio** = Venta Total / Número de Pasajeros / Tipo de Cambio
- **% Cierre** = (Número de Ventas Totales / Número de Pasajeros) * 100

## Soporte

Para problemas o preguntas, revisa:
- `ARQUITECTURA.md` - Documentación técnica
- `printer/README_printer.md` - Solución de problemas de impresora
- `google_apps_script.js` - Instrucciones de deploy

## Licencia

Sistema propietario para Opal & Co.

