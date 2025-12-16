# MAPA DE INTEGRACIÓN - Sistema POS Opal & Co

## 📋 ÍNDICE
1. [Arquitectura y Estructura](#1-arquitectura-y-estructura)
2. [Mapa de Módulos](#2-mapa-de-módulos)
3. [Base de Datos Local](#3-base-de-datos-local-indexeddb--localstorage)
4. [Flujo de Caja, Costos y Utilidad](#4-flujo-de-caja-costos-y-utilidad)
5. [Tabuladores y Reglas](#5-tabuladores-y-reglas-comisiones--llegadas)
6. [Reporte Turistas](#6-reporte-turistas)
7. [Exportaciones y Sincronización](#7-exportaciones-y-sincronización)
8. [Barcode / Scanner / Impresora](#8-barcode--scanner--impresora)
9. [Mapa de Integración](#9-mapa-de-integración)

---

## 1. ARQUITECTURA Y ESTRUCTURA

### 1.1 Árbol de Archivos y Carpetas

```
Sistema HTML/
├── index.html                    # Entrypoint - SPA única página
├── css/
│   └── styles.css               # Estilos globales
├── js/
│   ├── app.js                   # Router principal y inicialización
│   ├── db.js                    # IndexedDB manager (versión 5)
│   ├── ui.js                    # Navegación y UI manager
│   ├── utils.js                 # Utilidades generales
│   ├── users.js                 # Autenticación y usuarios
│   ├── dashboard.js             # Dashboard principal
│   ├── pos.js                   # Módulo POS
│   ├── inventory.js             # Gestión de inventario
│   ├── customers.js             # CRM de clientes
│   ├── repairs.js               # Reparaciones
│   ├── employees.js             # Empleados y catálogos
│   ├── reports.js               # Reportes avanzados
│   ├── costs.js                 # Gestión de costos
│   ├── tourist_report.js        # Reporte de turistas
│   ├── cash.js                  # Módulo de caja
│   ├── barcodes.js              # Scanner HID
│   ├── barcodes_module.js       # Gestión de códigos de barras
│   ├── sync.js                  # Sincronización Google Sheets
│   ├── sync_ui.js               # UI de sincronización
│   ├── settings.js              # Configuración
│   ├── printer.js               # Impresión térmica
│   └── backup.js                # Backups automáticos
├── libs/
│   ├── jspdf.umd.min.js         # Exportación PDF
│   ├── xlsx.full.min.js         # Exportación Excel
│   └── JsBarcode.all.min.js     # Generación Code128
├── assets/
│   └── logo.png
├── printer/
│   ├── install_EC_LINE_58110.bat
│   └── README_printer.md
└── google_apps_script.js        # Backend Google Sheets
```

### 1.2 Tipo de Aplicación

**SPA (Single Page Application)**
- **Entrypoint**: `index.html` (línea 1)
- **Inicialización**: `js/app.js` → `App.init()` (línea 4)
- **Router**: No hay router externo, usa sistema de módulos con `UI.showModule()` en `js/ui.js`
- **Navegación**: 
  - Sidebar con `data-module` attributes (líneas 48-99 de `index.html`)
  - Event listeners en `js/ui.js` (línea 47) que muestran/ocultan divs con `id="module-{nombre}"`
  - Estado guardado en `localStorage.getItem('current_module')`

### 1.3 Inicialización

**Flujo de arranque** (`js/app.js` líneas 4-287):
1. `App.init()` se ejecuta al cargar DOM
2. `DB.init()` → Inicializa IndexedDB (versión 5)
3. `UI.init()` → Configura navegación
4. `BarcodeManager.init()` → Configura scanner HID
5. `SyncManager.init()` → Configura sincronización
6. `UserManager.init()` → Verifica autenticación
7. `BackupManager.init()` → Backups automáticos cada 10 min
8. Carga datos demo si no existen
9. Restaura último módulo visitado desde localStorage

---

## 2. MAPA DE MÓDULOS

### 2.1 Dashboard
- **Archivo**: `js/dashboard.js`
- **Ruta**: `data-module="dashboard"` → `#module-dashboard` (línea 136 de `index.html`)
- **Datos que lee**:
  - `sales` (ventas del día)
  - `sale_items` (items vendidos)
  - `inventory_items` (piezas disponibles)
  - `inventory_photos` (fotos faltantes)
  - `sync_queue` (pendientes de sync)
  - `catalog_sellers` (top vendedores)
- **Datos que guarda**: Ninguno (solo lectura)
- **Funciones principales**:
  - `Dashboard.loadDashboard()` → Calcula KPIs (ventas hoy, tickets, promedio, % cierre)
  - Muestra gráfico últimos 7 días
  - Top productos y vendedores
  - Alertas (piezas sin foto, sync pendiente)

### 2.2 POS
- **Archivo**: `js/pos.js`
- **Ruta**: `data-module="pos"` → `#module-pos` (línea 184 de `index.html`)
- **Datos que lee**:
  - `inventory_items` (productos disponibles)
  - `catalog_sellers`, `catalog_guides`, `catalog_agencies`
  - `commission_rules` (para calcular comisiones)
  - `payment_methods`
- **Datos que guarda**:
  - `sales` (venta completa)
  - `sale_items` (items de la venta)
  - `payments` (pagos múltiples/monedas)
  - Actualiza `inventory_items.status = 'vendida'`
  - Agrega a `sync_queue`
- **Funciones principales**:
  - `POS.selectProduct()` → Agrega al carrito
  - `POS.completeSale()` → Guarda venta, calcula comisiones, imprime ticket
  - `POS.calculateCommissions()` → Calcula comisiones vendedor/guía
  - `POS.setGuide()` → Carga guía y agencia automáticamente
  - Soporta borradores y apartados

### 2.3 Inventario
- **Archivo**: `js/inventory.js`
- **Ruta**: `data-module="inventory"` → `#module-inventory` (línea 316 de `index.html`)
- **Datos que lee**: `inventory_items`, `inventory_photos`, `inventory_certificates`
- **Datos que guarda**: 
  - `inventory_items` (CRUD completo)
  - `inventory_photos` (blobs de imágenes)
  - `inventory_logs` (historial de cambios)
  - `inventory_price_history` (historial de precios)
- **Funciones principales**:
  - Alta/edición de piezas con fotos
  - Generación de códigos de barras Code128
  - Importación CSV
  - Exportación PDF/Excel

### 2.4 Clientes
- **Archivo**: `js/customers.js`
- **Ruta**: `data-module="customers"` → Carga dinámica en `#module-placeholder`
- **Datos que lee/guarda**: `customers` (CRM básico)

### 2.5 Reparaciones
- **Archivo**: `js/repairs.js`
- **Ruta**: `data-module="repairs"` → Carga dinámica
- **Datos que lee/guarda**: `repairs`, `repair_photos`

### 2.6 Empleados
- **Archivo**: `js/employees.js`
- **Ruta**: `data-module="employees"` → Carga dinámica
- **Datos que lee/guarda**: 
  - `employees`, `users`
  - `catalog_sellers`, `catalog_guides`, `catalog_agencies`
  - `commission_rules`
- **Funciones principales**: Gestión de catálogos y reglas de comisión

### 2.7 Reportes
- **Archivo**: `js/reports.js`
- **Ruta**: `data-module="reports"` → Carga dinámica
- **Datos que lee**: `sales`, `sale_items`, `inventory_items`, catálogos
- **Funciones principales**:
  - Reportes por día, vendedor, agencia, producto
  - Análisis avanzado (tendencias, rentabilidad)
  - Comparativas de períodos
  - Exportación PDF/Excel/CSV

### 2.8 Costos
- **Archivo**: `js/costs.js`
- **Ruta**: `data-module="costs"` → Carga dinámica
- **Datos que lee/guarda**: `cost_entries`
- **Categorías existentes**:
  - `luz`, `agua`, `renta`, `nomina`, `comisiones`, `despensa`, `linea_amarilla`, `licencias`, `pago_llegadas`
- **Funciones principales**:
  - CRUD de costos (variable/fijo)
  - Análisis por categoría, sucursal, tendencia mensual
  - Presupuestos (parcialmente implementado)
  - **Cálculo de utilidad**: `getCostStats()` (línea 598) calcula:
    - `profit = totalRevenue - totalCosts`
    - `margin = (profit / totalRevenue) * 100`
    - **NO calcula utilidad diaria antes de impuestos** (solo total acumulado)

### 2.9 Reporte Turistas
- **Archivo**: `js/tourist_report.js`
- **Ruta**: `data-module="tourist-report"` → `#module-tourist-report` (línea 80 de `index.html`)
- **Datos que lee**:
  - `tourist_reports` (reporte del día)
  - `tourist_report_lines` (renglones)
  - `catalog_sellers`, `catalog_guides`, `catalog_agencies`
  - `commission_rules` (calcula comisiones)
- **Datos que guarda**:
  - `tourist_reports` (uno por día/sucursal)
  - `tourist_report_lines` (renglones con ventas)
  - Agrega a `sync_queue`
- **Funciones principales**:
  - `TouristReport.parseAndAddLine()` → Entrada rápida por texto
  - `TouristReport.calculateTotals()` → Calcula comisiones y totales
  - `TouristReport.reconcile()` → Compara vs POS
  - Exportación PDF/Excel
  - **NO tiene tabulador de llegadas por agencia/tienda** (solo renglones manuales)

### 2.10 Caja
- **Archivo**: `js/cash.js`
- **Ruta**: `data-module="cash"` → Carga dinámica
- **Datos que lee**:
  - `cash_sessions` (sesión del día)
  - `cash_movements` (entradas/salidas)
  - `sales` (para conciliación)
  - `payments` (para calcular efectivo esperado)
- **Datos que guarda**:
  - `cash_sessions` (apertura/cierre)
  - `cash_movements` (movimientos manuales, arqueos parciales)
- **Funciones principales**:
  - `Cash.processOpenCash()` → Abre caja con montos iniciales (USD/MXN/CAD)
  - `Cash.processCloseCash()` → Cierra caja con arqueo
  - `Cash.calculateCurrentTotals()` → Calcula efectivo actual
  - `Cash.reconcileWithPOS()` → Compara efectivo vs ventas POS
  - `Cash.showPartialCountForm()` → Arqueo parcial
  - **NO guarda llegadas por agencia/tienda** (solo efectivo total)

### 2.11 Códigos de Barras
- **Archivo**: `js/barcodes_module.js`
- **Ruta**: `data-module="barcodes"` → `#module-barcodes` (línea 172 de `index.html`)
- **Funciones**: Gestión de códigos, plantillas, historial de escaneos

### 2.12 Sincronización
- **Archivo**: `js/sync_ui.js` (UI) + `js/sync.js` (lógica)
- **Ruta**: `data-module="sync"` → Carga dinámica
- **Funciones**: Ver estado, forzar sync, logs, configuración

### 2.13 Configuración
- **Archivo**: `js/settings.js`
- **Ruta**: `data-module="settings"` → Carga dinámica
- **Funciones**: Configuración general, reglas de comisión, tipos de cambio

---

## 3. BASE DE DATOS LOCAL (IndexedDB / LocalStorage)

### 3.1 IndexedDB Schema

**Nombre**: `opal_pos_db`  
**Versión**: 5  
**Archivo**: `js/db.js` (líneas 5-6)

#### Object Stores y Esquemas

| Store | KeyPath | Índices | Descripción |
|-------|---------|---------|-------------|
| `settings` | `key` | - | Configuración general |
| `device` | `id` | - | Información del dispositivo |
| `audit_log` | `id` (auto) | `user_id`, `created_at` | Log de auditoría |
| `employees` | `id` | `barcode` (unique), `branch_id` | Empleados |
| `users` | `id` | `username` (unique), `employee_id` | Usuarios del sistema |
| `catalog_agencies` | `id` | `barcode` | Agencias de turismo |
| `catalog_guides` | `id` | `agency_id`, `barcode` | Guías por agencia |
| `catalog_sellers` | `id` | `barcode` | Vendedores |
| `catalog_branches` | `id` | - | Sucursales/Tiendas |
| `payment_methods` | `id` | - | Métodos de pago |
| `commission_rules` | `id` | `entity_type`, `entity_id` | Reglas de comisión |
| `inventory_items` | `id` | `sku` (unique), `barcode` (unique), `branch_id`, `status` | Piezas de inventario |
| `inventory_photos` | `id` | `item_id` | Fotos de piezas (Blob) |
| `inventory_logs` | `id` | `item_id`, `created_at` | Historial de cambios |
| `inventory_certificates` | `id` | `item_id`, `certificate_number` | Certificados |
| `inventory_price_history` | `id` | `item_id`, `date` | Historial de precios |
| `sales` | `id` | `folio` (unique), `branch_id`, `seller_id`, `agency_id`, `guide_id`, `created_at`, `status`, `sync_status` | Ventas |
| `sale_items` | `id` | `sale_id`, `item_id` | Items de venta |
| `payments` | `id` | `sale_id` | Pagos (múltiples métodos/monedas) |
| `customers` | `id` | - | Clientes |
| `repairs` | `id` | `folio` (unique), `status`, `sync_status` | Reparaciones |
| `repair_photos` | `id` | `repair_id` | Fotos de reparaciones |
| `cost_entries` | `id` | `branch_id`, `date`, `sync_status` | Costos (variable/fijo) |
| `sync_queue` | `id` | `entity_type`, `status`, `created_at` | Cola de sincronización |
| `sync_logs` | `id` | `type`, `status`, `created_at` | Logs de sincronización |
| `tourist_reports` | `id` | `date`, `branch_id`, `status`, `sync_status` | Reportes de turistas |
| `tourist_report_lines` | `id` | `report_id`, `sale_id` | Renglones del reporte |
| `cash_sessions` | `id` | `branch_id`, `user_id`, `date`, `status`, `created_at` | Sesiones de caja |
| `cash_movements` | `id` | `session_id`, `type`, `created_at` | Movimientos de efectivo |
| `barcode_scan_history` | `id` | `barcode`, `timestamp`, `context` | Historial de escaneos |
| `barcode_print_templates` | `id` | - | Plantillas de impresión |

### 3.2 Ejemplos de Registros

#### `sales`
```json
{
  "id": "sale_123",
  "folio": "T1-20240115-0001",
  "branch_id": "branch1",
  "seller_id": "seller_1",
  "agency_id": "ag1",
  "guide_id": "guide_1",
  "customer_id": "cust1",
  "passengers": 2,
  "currency": "USD",
  "exchange_rate": 20.50,
  "subtotal": 5000,
  "discount": 500,
  "total": 4500,
  "status": "completada",
  "notes": "",
  "created_at": "2024-01-15T10:30:00.000Z",
  "updated_at": "2024-01-15T10:30:00.000Z",
  "sync_status": "pending"
}
```

#### `cost_entries`
```json
{
  "id": "cost_123",
  "type": "fijo",
  "category": "renta",
  "amount": 15000,
  "branch_id": "branch1",
  "date": "2024-01-15",
  "notes": "Renta mensual",
  "created_at": "2024-01-15T08:00:00.000Z",
  "sync_status": "pending"
}
```

#### `commission_rules`
```json
{
  "id": "seller_default",
  "entity_type": "seller",
  "entity_id": null,
  "discount_pct": 5,
  "multiplier": 9,
  "active": true
}
```

#### `cash_sessions`
```json
{
  "id": "cash_123",
  "branch_id": "branch1",
  "user_id": "user1",
  "user_name": "Admin",
  "date": "2024-01-15T00:00:00.000Z",
  "initial_usd": 100,
  "initial_mxn": 2000,
  "initial_cad": 50,
  "final_usd": 0,
  "final_mxn": 0,
  "final_cad": 0,
  "status": "abierta",
  "notes": "",
  "created_at": "2024-01-15T08:00:00.000Z",
  "updated_at": "2024-01-15T08:00:00.000Z"
}
```

#### `tourist_report_lines`
```json
{
  "id": "line_123",
  "report_id": "report_123",
  "sale_id": null,
  "identification": "",
  "seller_id": "seller_1",
  "guide_id": "guide_1",
  "agency_id": "ag1",
  "quantity": 2,
  "weight_g": 12.5,
  "products": "Anillo de diamantes",
  "exchange_rate": 20.50,
  "cash_eur": 0,
  "cash_cad": 0,
  "cash_usd": 100,
  "cash_mxn": 0,
  "tpv_visa_mc": 0,
  "tpv_amex": 0,
  "total": 2050,
  "created_at": "2024-01-15T10:30:00.000Z"
}
```

### 3.3 LocalStorage

**Keys utilizadas**:
- `current_user_id` → ID del usuario autenticado
- `current_employee_id` → ID del empleado actual
- `current_branch_id` → ID de la sucursal activa
- `current_module` → Módulo activo (para restaurar al recargar)
- `daily_exchange_rate` → Tipo de cambio USD del día
- `barcode_current_template` → Plantilla de código de barras activa
- `backup_metadata` → Metadatos de backups
- `backup_{timestamp}` → Backups individuales

---

## 4. FLUJO DE CAJA, COSTOS Y UTILIDAD

### 4.1 Cálculo de Utilidad

**Estado actual**: ✅ **EXISTE PARCIALMENTE**

**Ubicación**:
- `js/costs.js` → `getCostStats()` (línea 598)
- `js/reports.js` → `analyzeProfitability()` (línea 1662)

**Cálculo actual**:
```javascript
// En costs.js línea 636-638
const totalRevenue = completedSales.reduce((sum, s) => sum + (s.total || 0), 0);
const profit = totalRevenue - totalCosts;
const margin = totalRevenue > 0 ? (profit / totalRevenue * 100) : 0;
```

**Campos utilizados**:
- `sales.total` (ventas completadas)
- `cost_entries.amount` (todos los costos acumulados)

**Limitaciones**:
- ❌ **NO calcula utilidad diaria** (solo total acumulado)
- ❌ **NO calcula antes de impuestos** (no hay campo de impuestos)
- ❌ **NO desglosa por sucursal/tienda** en reporte diario
- ❌ **NO incluye comisiones** en el cálculo de costos

### 4.2 Módulo Caja

**Estado**: ✅ **COMPLETO**

**Ubicación**: `js/cash.js`

**Funcionalidades**:
- Apertura/cierre de caja con montos iniciales (USD/MXN/CAD)
- Movimientos de efectivo (entrada/salida)
- Arqueo parcial
- Conciliación con POS
- Historial de sesiones

**Datos guardados**:
- `cash_sessions`: Una sesión por día/sucursal
- `cash_movements`: Movimientos dentro de la sesión

**Limitaciones**:
- ❌ **NO guarda llegadas por agencia/tienda** (solo efectivo total)
- ❌ **NO tiene tabulador de llegadas** (pasajeros/unidad)

### 4.3 Módulo Costos

**Estado**: ✅ **COMPLETO**

**Ubicación**: `js/costs.js`

**Categorías existentes**:
- `luz`, `agua`, `renta`, `nomina`, `comisiones`, `despensa`, `linea_amarilla`, `licencias`, `pago_llegadas`

**Funcionalidades**:
- CRUD de costos (variable/fijo)
- Filtros por tipo, categoría, fecha, sucursal
- Análisis por categoría, sucursal, tendencia mensual
- Presupuestos (parcial)

**Limitaciones**:
- ❌ **NO tiene nómina semanal por tienda** (solo costos generales)
- ❌ **NO tiene costos fijos mensuales estructurados** (solo categorías libres)
- ❌ **NO calcula automáticamente costos fijos mensuales** por tienda

---

## 5. TABULADORES Y REGLAS (COMISIONES / LLEGADAS)

### 5.1 Reglas de Comisión

**Estado**: ✅ **EXISTE**

**Ubicación**: 
- Store: `commission_rules` (IndexedDB)
- Gestión: `js/settings.js` → `manageCommissionRules()` (línea 1082)
- Cálculo: `js/utils.js` → `calculateCommission()` (línea 350)

**Estructura**:
```json
{
  "id": "seller_default",
  "entity_type": "seller|guide",
  "entity_id": "seller_1" | null,
  "discount_pct": 5,
  "multiplier": 9,
  "active": true
}
```

**Reglas predefinidas** (`js/app.js` líneas 860-866):
- `seller_sebastian`: 0% descuento, multiplicador 10
- `seller_omar_jc`: 20% descuento, multiplicador 7
- `seller_default`: 5% descuento, multiplicador 9
- `guide_marina`: 0% descuento, multiplicador 10
- `guide_default`: 18% descuento, multiplicador 10

**Cálculo** (`js/utils.js` línea 350):
```javascript
calculateCommission(amount, discountPct, multiplier) {
  const afterDiscount = amount * (1 - discountPct / 100);
  return afterDiscount * (multiplier / 10);
}
```

**Uso**:
- Se calcula en `POS.calculateCommissions()` (línea 615)
- Se calcula en `TouristReport.calculateTotals()` (línea 881)
- **NO se guarda en tabla separada** (solo se calcula al momento)

### 5.2 Tabulador de Llegadas

**Estado**: ❌ **NO EXISTE**

**Búsqueda realizada**:
- ❌ No existe store `arrivals` o `agency_arrivals`
- ❌ No existe campo `arrivals` en `tourist_reports`
- ❌ No existe módulo de llegadas
- ✅ Existe categoría `pago_llegadas` en `cost_entries` (solo como costo manual)

**Conclusión**: **NO existe tabulador de llegadas por agencia/tienda/pasajeros/unidad**

---

## 6. REPORTE TURISTAS

### 6.1 Estado Actual

**Archivo**: `js/tourist_report.js`

**Estructura**:
- `tourist_reports`: Un reporte por día/sucursal
- `tourist_report_lines`: Renglones con ventas

**Campos actuales** (`tourist_report_lines`):
- `seller_id`, `guide_id`, `agency_id`
- `quantity` (cantidad de piezas)
- `weight_g` (peso)
- `products` (descripción)
- `cash_cad`, `cash_usd`, `cash_mxn`
- `tpv_visa_mc`, `tpv_amex`
- `total`

**Funcionalidades**:
- Entrada rápida por texto (parseAndAddLine)
- Cálculo automático de comisiones
- Conciliación vs POS
- Exportación PDF/Excel

**Limitaciones**:
- ❌ **NO tiene tabulador de llegadas** (solo renglones de ventas)
- ❌ **NO guarda pasajeros/unidad por agencia**
- ❌ **NO calcula "pago de llegadas" automáticamente**

### 6.2 Integración con Dashboard/Caja

**Dashboard**: 
- ✅ Lee `tourist_reports` para estadísticas
- ❌ NO muestra llegadas

**Caja**:
- ❌ NO lee llegadas de reporte turistas
- ✅ Solo concilia efectivo vs POS

---

## 7. EXPORTACIONES Y SINCRONIZACIÓN

### 7.1 Exportaciones

**Librerías**:
- **PDF**: `libs/jspdf.umd.min.js` (jsPDF)
- **Excel**: `libs/xlsx.full.min.js` (SheetJS)
- **CSV**: Nativo (Blob + download)

**Módulos que exportan**:
- **Reportes** (`js/reports.js`): PDF/Excel/CSV de ventas
- **Costos** (`js/costs.js`): PDF/Excel/CSV de costos
- **Reporte Turistas** (`js/tourist_report.js`): PDF/Excel/CSV
- **Caja** (`js/cash.js`): PDF/CSV de reporte de caja
- **Inventario** (`js/inventory.js`): CSV de productos

### 7.2 Sincronización Google Sheets

**Archivo**: `js/sync.js` + `google_apps_script.js`

**Configuración**:
- URL: Guardada en `settings.sync_url`
- Token: Guardado en `settings.sync_token`
- Device ID: Generado automáticamente

**Payload** (`js/sync.js` línea 336-342):
```javascript
{
  token: this.syncToken,
  entity_type: 'sale|inventory_item|cost_entry|tourist_report|...',
  records: [...],
  device_id: await this.getDeviceId(),
  timestamp: new Date().toISOString()
}
```

**Entidades sincronizadas**:
- `sale` (con `items` y `payments` anidados)
- `inventory_item`
- `employee`
- `repair`
- `cost_entry`
- `tourist_report` (con `lines` anidados)
- `catalog_seller`, `catalog_guide`, `catalog_agency`
- `customer`
- `user`

**Cola offline**:
- Store: `sync_queue`
- Estados: `pending`, `synced`, `failed`
- Reintentos: Máximo 5 (configurable)
- Auto-sync: Configurable (5min, 15min, 30min, 1h)

**Apps Script** (`google_apps_script.js`):
- Valida token
- Procesa por tipo de entidad
- Escribe en hojas específicas
- Idempotencia por folio/SKU/id

---

## 8. BARCODE / SCANNER / IMPRESORA

### 8.1 Scanner HID

**Archivo**: `js/barcodes.js` + `js/utils.js`

**Detección** (`js/utils.js` línea 319):
- Detecta velocidad de teclas (< 50ms entre teclas)
- Buffer de caracteres hasta Enter
- Si velocidad < umbral → escaneo HID

**Formato**: Code128 (generado con JsBarcode)

**Contextos** (`js/barcodes.js` línea 45):
- `login`: Escanea código de empleado
- `pos`: Escanea guía → producto
- `inventory`: Busca producto
- `tourist-report`: Escanea piezas

**Flujo POS**:
1. Escanea código de guía → Carga guía y agencia automáticamente
2. Escanea código de producto → Agrega al carrito

### 8.2 Impresora

**Archivo**: `js/printer.js`

**Impresora**: EC Line 58110 (58mm térmica)

**Método**: 
- Genera HTML con CSS `@page { size: 58mm auto; }`
- Abre ventana de impresión (`window.print()`)
- Usa `printWindow.print()` para imprimir

**Formato**:
- Ticket de venta (58mm)
- Header con logo, folio, fecha
- Items con precio
- Totales y pagos
- Footer

**Configuración**: 
- No hay configuración de impresora en settings
- Solo usa impresión web estándar

---

## 9. MAPA DE INTEGRACIÓN

### 9.1 Dónde Agregar: Tabulador de Llegadas

**NUEVO STORE**: `agency_arrivals`

**Estructura propuesta**:
```javascript
{
  id: Utils.generateId(),
  date: '2024-01-15',
  branch_id: 'branch1',
  agency_id: 'ag1',
  guide_id: 'guide_1',
  passengers: 25,
  units: 2, // unidades/camiones
  arrival_fee_per_passenger: 50, // o por unidad
  arrival_fee_total: 1250,
  notes: '',
  created_at: new Date().toISOString(),
  sync_status: 'pending'
}
```

**Índices**:
- `date`, `branch_id`, `agency_id`, `guide_id`

**Archivos a modificar**:
1. **`js/db.js`** (línea 25):
   - Agregar creación de store `agency_arrivals` en `createStores()`
   - Versión DB: 5 → 6

2. **NUEVO ARCHIVO**: `js/arrivals.js`
   - Módulo completo de gestión de llegadas
   - CRUD de llegadas
   - Tabulador por agencia/tienda
   - Cálculo automático de pago de llegadas

3. **`index.html`** (línea 46):
   - Agregar item en sidebar: `<a href="#" class="nav-item" data-module="arrivals">`

4. **`js/app.js`** (línea 289):
   - Agregar case `'arrivals'` en `loadModule()`

5. **`js/costs.js`**:
   - Integrar llegadas en cálculo de costos
   - Opción de crear `cost_entry` automático desde llegadas

6. **`js/tourist_report.js`**:
   - Mostrar llegadas del día en reporte
   - Vincular llegadas con renglones de venta

7. **`js/sync.js`** (línea 259):
   - Agregar case `'agency_arrival'` en `prepareRecords()`

8. **`google_apps_script.js`**:
   - Agregar función `processArrivals()`

### 9.2 Dónde Agregar: Nómina Semanal por Tienda

**NUEVO STORE**: `payroll_entries`

**Estructura propuesta**:
```javascript
{
  id: Utils.generateId(),
  branch_id: 'branch1',
  week_start: '2024-01-15', // Lunes de la semana
  week_end: '2024-01-21',   // Domingo
  employee_id: 'emp1',
  hours_worked: 40,
  hourly_rate: 150,
  base_salary: 6000,
  commissions: 500,
  bonuses: 0,
  deductions: 0,
  total: 6500,
  status: 'pending|paid',
  notes: '',
  created_at: new Date().toISOString(),
  sync_status: 'pending'
}
```

**Índices**:
- `branch_id`, `week_start`, `employee_id`, `status`

**Archivos a modificar**:
1. **`js/db.js`**:
   - Agregar store `payroll_entries`
   - Versión DB: 5 → 6

2. **`js/costs.js`**:
   - Agregar pestaña "Nómina" en tabs
   - Función `loadPayrollTab()` → Lista nóminas semanales
   - Función `addPayrollEntry()` → Alta de nómina
   - Integrar con `cost_entries` (crear costo automático tipo "nomina")

3. **`js/employees.js`**:
   - Agregar sección de nómina en detalle de empleado
   - Historial de pagos

4. **`js/sync.js`**:
   - Agregar `'payroll_entry'` en `prepareRecords()`

5. **`google_apps_script.js`**:
   - Agregar `processPayroll()`

### 9.3 Dónde Agregar: Costos Fijos Mensuales por Tienda

**MODIFICAR STORE EXISTENTE**: `cost_entries`

**Mejoras necesarias**:
- Agregar campo `period_type`: `'one_time'|'monthly'|'weekly'|'annual'`
- Agregar campo `recurring`: `true|false`
- Agregar campo `auto_generate`: `true|false` (para generar automáticamente cada mes)

**Estructura mejorada**:
```javascript
{
  id: Utils.generateId(),
  type: 'fijo',
  category: 'renta|agua|luz|linea_amarilla|licencias|despensa|mantenimiento',
  amount: 15000,
  branch_id: 'branch1',
  period_type: 'monthly',
  recurring: true,
  auto_generate: true,
  date: '2024-01-15',
  notes: '',
  created_at: new Date().toISOString(),
  sync_status: 'pending'
}
```

**Archivos a modificar**:
1. **`js/db.js`**:
   - Agregar campos a `cost_entries` (requiere migración o nuevos campos opcionales)

2. **`js/costs.js`**:
   - Agregar pestaña "Costos Fijos" en tabs
   - Función `loadFixedCostsTab()` → Lista costos fijos por tienda
   - Función `setupRecurringCosts()` → Configurar costos recurrentes
   - Función `generateMonthlyCosts()` → Generar automáticamente al inicio del mes
   - Agregar categorías: `mantenimiento` (ya existe: renta, agua, luz, linea_amarilla, licencias, despensa)

3. **`js/app.js`**:
   - Agregar job diario que verifique si hay costos fijos pendientes de generar

### 9.4 Dónde Agregar: Reglas de Comisiones Vendedores y Guías

**Estado**: ✅ **YA EXISTE COMPLETO**

**No requiere cambios**, solo verificar que:
- `commission_rules` store está completo
- `Utils.calculateCommission()` funciona correctamente
- Se calcula en POS y Reporte Turistas

**Mejora opcional**:
- Agregar comisiones acumuladas en tabla `employee_commissions` para historial

### 9.5 Dónde Agregar: Reporte de Utilidad Diaria Antes de Impuestos

**NUEVO STORE**: `daily_profit_reports`

**Estructura propuesta**:
```javascript
{
  id: Utils.generateId(),
  date: '2024-01-15',
  branch_id: 'branch1',
  revenue: {
    sales_total: 50000,
    cash_usd: 1000,
    cash_mxn: 20000,
    cash_cad: 500,
    tpv_visa_mc: 15000,
    tpv_amex: 5000
  },
  costs: {
    fixed: 5000,
    variable: 2000,
    payroll: 8000,
    commissions_sellers: 2500,
    commissions_guides: 1500,
    arrivals: 1000,
    total: 20000
  },
  profit_before_taxes: 30000,
  profit_margin: 60, // %
  taxes: 0, // Para futuro
  profit_after_taxes: 30000,
  created_at: new Date().toISOString(),
  sync_status: 'pending'
}
```

**Archivos a modificar**:
1. **`js/db.js`**:
   - Agregar store `daily_profit_reports`
   - Versión DB: 5 → 6

2. **NUEVO ARCHIVO**: `js/profit_report.js`
   - Módulo de reporte de utilidad diaria
   - Función `calculateDailyProfit()` → Calcula ingresos - costos - comisiones
   - Función `generateDailyReport()` → Genera reporte automático al cierre del día
   - Vista con desglose completo

3. **`index.html`**:
   - Agregar item en sidebar: `<a href="#" class="nav-item" data-module="profit-report">`

4. **`js/app.js`**:
   - Agregar case `'profit-report'` en `loadModule()`

5. **`js/cash.js`**:
   - Al cerrar caja, opción de generar reporte de utilidad
   - Integrar cálculo de utilidad en cierre

6. **`js/costs.js`**:
   - Función `getDailyCosts()` → Obtiene costos del día por tienda
   - Integrar con reporte de utilidad

7. **`js/sync.js`**:
   - Agregar `'daily_profit_report'` en `prepareRecords()`

8. **`google_apps_script.js`**:
   - Agregar `processDailyProfitReports()`

### 9.6 Resumen de Archivos a Tocar

#### Archivos Nuevos
1. `js/arrivals.js` → Módulo de llegadas
2. `js/profit_report.js` → Módulo de utilidad diaria

#### Archivos a Modificar
1. **`js/db.js`**:
   - Agregar stores: `agency_arrivals`, `payroll_entries`, `daily_profit_reports`
   - Versión: 5 → 6
   - Agregar campos a `cost_entries` (opcional, puede ser migración)

2. **`index.html`**:
   - Agregar items en sidebar: `arrivals`, `profit-report`

3. **`js/app.js`**:
   - Agregar cases en `loadModule()`: `'arrivals'`, `'profit-report'`

4. **`js/costs.js`**:
   - Agregar pestaña "Nómina"
   - Agregar pestaña "Costos Fijos"
   - Función `generateMonthlyCosts()`
   - Función `getDailyCosts()`

5. **`js/tourist_report.js`**:
   - Mostrar llegadas del día
   - Vincular llegadas con renglones

6. **`js/cash.js`**:
   - Integrar cálculo de utilidad en cierre
   - Mostrar llegadas del día

7. **`js/sync.js`**:
   - Agregar casos: `'agency_arrival'`, `'payroll_entry'`, `'daily_profit_report'`

8. **`google_apps_script.js`**:
   - Agregar funciones: `processArrivals()`, `processPayroll()`, `processDailyProfitReports()`

### 9.7 Stores a Crear

| Store | KeyPath | Índices | Propósito |
|-------|---------|---------|-----------|
| `agency_arrivals` | `id` | `date`, `branch_id`, `agency_id`, `guide_id` | Llegadas por agencia/tienda |
| `payroll_entries` | `id` | `branch_id`, `week_start`, `employee_id`, `status` | Nómina semanal |
| `daily_profit_reports` | `id` | `date`, `branch_id` | Utilidad diaria |

### 9.8 Pantallas a Agregar/Modificar

#### Nuevas Pantallas
1. **Módulo Llegadas** (`js/arrivals.js`):
   - Lista de llegadas del día
   - Formulario alta llegada (agencia, guía, pasajeros, unidades)
   - Tabulador por agencia/tienda
   - Cálculo automático de pago de llegadas

2. **Módulo Utilidad Diaria** (`js/profit_report.js`):
   - Reporte del día con desglose completo
   - Ingresos vs Costos vs Comisiones
   - Utilidad antes/después de impuestos
   - Gráficos de tendencia

#### Pantallas a Modificar
1. **Costos** (`js/costs.js`):
   - Agregar pestaña "Nómina" → Lista nóminas semanales
   - Agregar pestaña "Costos Fijos" → Lista costos fijos recurrentes
   - Agregar función de generación automática mensual

2. **Caja** (`js/cash.js`):
   - Mostrar llegadas del día en panel
   - Agregar botón "Generar Reporte Utilidad" al cerrar

3. **Reporte Turistas** (`js/tourist_report.js`):
   - Mostrar llegadas del día en header
   - Vincular llegadas con renglones de venta

---

## 10. RECOMENDACIONES FINALES

### 10.1 Orden de Implementación Sugerido

1. **Fase 1: Costos Fijos Mensuales**
   - Modificar `cost_entries` para soportar recurrentes
   - Agregar pestaña en Costos
   - Generación automática mensual

2. **Fase 2: Nómina Semanal**
   - Crear store `payroll_entries`
   - Agregar pestaña en Costos
   - Integrar con empleados

3. **Fase 3: Tabulador de Llegadas**
   - Crear store `agency_arrivals`
   - Crear módulo `arrivals.js`
   - Integrar con Reporte Turistas y Costos

4. **Fase 4: Utilidad Diaria**
   - Crear store `daily_profit_reports`
   - Crear módulo `profit_report.js`
   - Integrar con Caja y Costos

### 10.2 Consideraciones Técnicas

- **Migración de BD**: Al agregar stores, incrementar versión en `db.js` (5 → 6)
- **Compatibilidad**: Los nuevos campos en `cost_entries` deben ser opcionales para no romper datos existentes
- **Sincronización**: Agregar nuevos tipos en `sync.js` y `google_apps_script.js`
- **Validaciones**: Agregar validaciones de permisos para módulos financieros

### 10.3 Datos de Prueba

- Crear llegadas demo para agencias existentes
- Crear nóminas demo para empleados
- Configurar costos fijos recurrentes demo
- Generar reportes de utilidad de prueba

---

**Documento generado**: $(Get-Date -Format "dd/MM/yyyy HH:mm")
**Versión del sistema analizado**: IndexedDB v5, App v1.0

