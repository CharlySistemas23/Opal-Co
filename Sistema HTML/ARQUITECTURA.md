# ARQUITECTURA - Sistema POS Opal & Co

## 1. DIAGRAMA DE STORES IndexedDB

```
┌─────────────────────────────────────────────────────────────┐
│                    INDEXEDDB: opal_pos_db                   │
│                      Version: 1                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   settings      │  │     device      │  │   audit_log     │
│─────────────────│  │─────────────────│  │─────────────────│
│ key (PK)        │  │ id (PK)         │  │ id (PK)         │
│ value           │  │ name            │  │ user_id         │
│ updated_at      │  │ branch_id       │  │ action          │
└─────────────────┘  │ sync_token      │  │ entity_type     │
                     │ last_sync       │  │ entity_id       │
                     └─────────────────┘  │ details         │
                                          │ created_at      │
┌─────────────────┐  ┌─────────────────┐  └─────────────────┘
│   employees     │  │     users       │
│─────────────────│  │─────────────────│
│ id (PK)         │  │ id (PK)         │
│ name            │  │ username        │
│ role            │  │ pin_hash        │
│ branch_id       │  │ employee_id     │
│ active          │  │ role            │
│ barcode         │  │ permissions     │
│ commission_rule │  │ active          │
│ created_at      │  │ created_at      │
└─────────────────┘  └─────────────────┘

┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│ catalog_agencies│  │ catalog_guides  │  │ catalog_sellers │
│─────────────────│  │─────────────────│  │─────────────────│
│ id (PK)         │  │ id (PK)         │  │ id (PK)         │
│ name            │  │ name            │  │ name            │
│ active          │  │ agency_id       │  │ commission_rule │
└─────────────────┘  │ commission_rule │  │ active          │
                     │ active          │  └─────────────────┘
                     └─────────────────┘
┌─────────────────┐  ┌─────────────────┐
│catalog_branches │  │payment_methods  │
│─────────────────│  │─────────────────│
│ id (PK)         │  │ id (PK)         │
│ name            │  │ name            │
│ address         │  │ code            │
│ active          │  │ active          │
└─────────────────┘  └─────────────────┘

┌─────────────────┐  ┌─────────────────┐
│commission_rules │  │ inventory_items │
│─────────────────│  │─────────────────│
│ id (PK)         │  │ id (PK)         │
│ entity_type     │  │ sku            │
│ entity_id       │  │ barcode        │
│ discount_pct    │  │ name           │
│ multiplier      │  │ metal          │
│ active          │  │ stone          │
└─────────────────┘  │ size           │
                     │ weight_g       │
┌─────────────────┐  │ measures       │
│inventory_photos │  │ cost           │
│─────────────────│  │ price          │
│ id (PK)         │  │ location       │
│ item_id         │  │ status         │
│ photo_blob      │  │ branch_id      │
│ thumbnail_blob  │  │ created_at     │
│ created_at      │  │ updated_at     │
└─────────────────┘  └─────────────────┘

┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│ inventory_logs  │  │     sales       │  │   sale_items    │
│─────────────────│  │─────────────────│  │─────────────────│
│ id (PK)         │  │ id (PK)         │  │ id (PK)         │
│ item_id         │  │ folio           │  │ sale_id         │
│ action          │  │ branch_id       │  │ item_id         │
│ quantity        │  │ seller_id       │  │ quantity        │
│ notes           │  │ agency_id       │  │ price           │
│ created_at      │  │ guide_id        │  │ discount        │
└─────────────────┘  │ passengers      │  │ subtotal        │
                     │ customer_id     │  │ created_at      │
                     │ currency        │  └─────────────────┘
                     │ exchange_rate   │
                     │ subtotal        │
                     │ discount        │
                     │ total           │
                     │ status          │
                     │ notes           │
                     │ created_at      │
                     │ updated_at      │
                     │ sync_status     │
                     └─────────────────┘

┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│    payments     │  │   customers     │  │    repairs      │
│─────────────────│  │─────────────────│  │─────────────────│
│ id (PK)         │  │ id (PK)         │  │ id (PK)         │
│ sale_id         │  │ name            │  │ folio           │
│ method_id       │  │ email           │  │ customer_id     │
│ amount          │  │ phone           │  │ item_id         │
│ currency        │  │ notes           │  │ description     │
│ created_at      │  │ created_at      │  │ status          │
└─────────────────┘  └─────────────────┘  │ cost            │
                                          │ photos          │
┌─────────────────┐  ┌─────────────────┐  │ created_at      │
│  repair_photos  │  │  cost_entries   │  │ updated_at      │
│─────────────────│  │─────────────────│  │ sync_status     │
│ id (PK)         │  │ id (PK)         │  └─────────────────┘
│ repair_id       │  │ type            │
│ photo_blob      │  │ category        │
│ thumbnail_blob  │  │ amount          │
│ created_at      │  │ branch_id       │
└─────────────────┘  │ date            │
                     │ notes           │
                     │ created_at      │
                     │ sync_status     │
                     └─────────────────┘

┌─────────────────┐  ┌─────────────────┐
│   sync_queue    │  │tourist_reports  │
│─────────────────│  │─────────────────│
│ id (PK)         │  │ id (PK)         │
│ entity_type     │  │ date            │
│ entity_id       │  │ branch_id       │
│ action          │  │ exchange_rate   │
│ payload         │  │ status          │
│ retries         │  │ observations    │
│ last_attempt    │  │ total_cash_usd  │
│ status          │  │ total_cash_mxn  │
│ created_at      │  │ subtotal        │
└─────────────────┘  │ additional      │
                     │ total           │
                     │ created_at      │
                     │ updated_at      │
                     │ sync_status     │
                     └─────────────────┘

┌─────────────────┐
│tourist_lines    │
│─────────────────│
│ id (PK)         │
│ report_id       │
│ sale_id         │
│ identification  │
│ seller_id       │
│ guide_id        │
│ agency_id       │
│ quantity        │
│ weight_g        │
│ products        │
│ exchange_rate   │
│ cash_eur        │
│ cash_cad        │
│ cash_usd        │
│ cash_mxn        │
│ tpv_visa_mc     │
│ tpv_amex        │
│ total           │
│ created_at      │
└─────────────────┘

ÍNDICES CLAVE:
- sales: folio, branch_id, seller_id, agency_id, guide_id, date, status, sync_status
- inventory_items: sku, barcode, branch_id, status
- employees: barcode, branch_id, active
- tourist_reports: date, branch_id, status
- sync_queue: entity_type, status, created_at
```

## 2. WIREFRAMES UI - Diseño Blanco Elegante

### Layout Global
```
┌─────────────────────────────────────────────────────────────┐
│ TOPBAR: [Logo] Sucursal | Usuario | [Online/Offline] | Sync │
│         [🔍 Buscador Global]                                 │
├──────────────┬──────────────────────────────────────────────┤
│              │                                              │
│  SIDEBAR     │              CONTENT AREA                    │
│              │                                              │
│  📊 Dashboard│  ┌──────────────────────────────────────┐   │
│  💰 POS      │  │                                      │   │
│  📦 Inventario│  │     Módulo activo                   │   │
│  👥 Clientes │  │                                      │   │
│  🔧 Reparac. │  │                                      │   │
│  👤 Empleados│  │                                      │   │
│  📈 Reportes │  │                                      │   │
│  💵 Costos   │  │                                      │   │
│  🧳 Turistas │  │                                      │   │
│  🔄 Sync     │  │                                      │   │
│  ⚙️ Config   │  │                                      │   │
│              │  └──────────────────────────────────────┘   │
│              │                                              │
└──────────────┴──────────────────────────────────────────────┘
```

### Módulo POS
```
┌─────────────────────────────────────────────────────────────┐
│ POS - Nueva Venta                                            │
├─────────────────────────────────────────────────────────────┤
│ Sucursal: [Tienda 1 ▼] Vendedor: [SEBASTIAN ▼]            │
│ Agencia: [TRAVELEX ▼] Guía: [MIGUEL SUAREZ ▼]              │
│ Pasajeros: [2] Cliente: [Buscar...] Moneda: [USD ▼]        │
│ Tipo Cambio: [20.50] Notas: [________________]             │
├─────────────────────────────────────────────────────────────┤
│ CARRITO                                                      │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ SKU | Pieza | Peso | Precio | Desc | Total | [X]       ││
│ │ 001 | Anillo| 5.2g | $150  | -10% | $135  | [X]       ││
│ └─────────────────────────────────────────────────────────┘│
│                                                              │
│ [Escanear] [Buscar Pieza]                                   │
│                                                              │
│ Subtotal: $135 | Descuento: $0 | Total: $135               │
├─────────────────────────────────────────────────────────────┤
│ PAGOS                                                        │
│ Efectivo USD: [____] Efectivo MXN: [____]                   │
│ TPV Visa/MC: [____] TPV Amex: [____]                        │
│ Total Pagos: $135 | Diferencia: $0                          │
│                                                              │
│ [Guardar Borrador] [Apartar] [Completar Venta] [Cancelar]  │
└─────────────────────────────────────────────────────────────┘
```

### Módulo Reporte Turistas
```
┌─────────────────────────────────────────────────────────────┐
│ Reporte Turistas - Día: [2024-01-15] Tienda: [1 ▼]         │
│ Tipo Cambio: [20.50] Estado: [Abierto ▼]                   │
├─────────────────────────────────────────────────────────────┤
│ TABLA PRINCIPAL                                              │
│ ┌───┬──────────┬──────┬──────┬─────┬──────┬──────────────┐ │
│ │ID │Vendedor  │Guía  │Agencia│CANT│PESO │PRODUCTOS     │ │
│ ├───┼──────────┼──────┼──────┼─────┼──────┼──────────────┤ │
│ │001│SEBASTIAN │MIGUEL│TRAVEX│ 2  │10.4g│Anillo, Pulsera│ │
│ │   │          │      │      │    │     │[Escanear]     │ │
│ └───┴──────────┴──────┴──────┴─────┴──────┴──────────────┘ │
│                                                              │
│ PAGOS POR RENGLÓN:                                          │
│ CASH EUR: [__] CAD: [__] USD: [__] PESOS: [__]             │
│ TPV VISA-MC: [__] TPV AMEX: [__] TOTAL: [__]               │
│                                                              │
│ [Agregar Renglón] [Escanear Piezas]                         │
├─────────────────────────────────────────────────────────────┤
│ TOTALES INFERIORES                                          │
│ TARJETAS: AMEX [__] DISCOVERY [__]                         │
│ OBSERVACIONES: [________________________]                   │
│ Comisiones Vendedores: $XX | Comisiones Guías: $XX          │
│ TOTAL CASH USD: $XX | TOTAL CASH PESOS: $XX                 │
│ SUBTOTAL: $XX | ADICIONALES: [__] | TOTAL: $XX              │
│                                                              │
│ [Conciliar vs POS] [Cerrar Reporte] [Export PDF/Excel]      │
└─────────────────────────────────────────────────────────────┘
```

## 3. FLUJOS PRINCIPALES

### Flujo POS Completo
```
1. Usuario selecciona módulo POS
2. Sistema carga: sucursal activa, vendedor, catálogos
3. Usuario configura: agencia, guía (filtrado), pasajeros, cliente
4. Agregar piezas:
   a. Escaneo barcode → busca en inventario → valida disponible → agrega
   b. Búsqueda manual → selecciona → agrega
5. Sistema calcula: subtotal, descuentos, total
6. Usuario ingresa pagos (múltiples métodos/monedas)
7. Validación: suma pagos = total
8. Guardar venta:
   - Genera folio: SUC-YYYYMMDD-0001
   - Calcula comisiones (vendedor/guía)
   - Actualiza inventario (status = vendida)
   - Crea registros en sale_items, payments
   - Agrega a sync_queue
9. Imprimir ticket (58mm)
10. Opcional: crear renglón en Reporte Turistas
```

### Flujo Inventario con Fotos
```
1. Usuario selecciona "Alta Pieza"
2. Formulario: SKU, nombre, metal, piedra, talla, peso, medidas, costo, precio
3. Fotos:
   a. Click "Agregar Fotos" → file input múltiple
   b. Preview miniaturas
   c. Al guardar: convierte a Blob → guarda en inventory_photos
   d. Genera thumbnail (canvas resize)
4. Barcode:
   a. Si no existe, genera Code128 desde SKU
   b. Preview barcode
   c. Opción "Imprimir Etiqueta"
5. Guardar:
   - Crea inventory_item
   - Guarda fotos (Blob + thumbnail)
   - Crea inventory_log (alta)
   - Agrega a sync_queue
6. Export/Imprimir etiqueta con barcode
```

### Flujo Login con Barcode
```
1. Pantalla login muestra campo "Escanear código empleado"
2. Usuario escanea barcode con scanner HID
3. Sistema detecta escaneo (velocidad teclas > umbral)
4. Busca employee por barcode en IndexedDB
5. Si existe y activo:
   - Muestra nombre empleado
   - Solicita PIN
   - Valida PIN hash
   - Carga permisos
   - Inicia sesión
6. Si no existe: error "Empleado no encontrado"
```

### Flujo Reporte Turistas
```
1. Usuario abre módulo "Reporte Turistas"
2. Sistema verifica si existe reporte del día para sucursal
   - Si no: crea nuevo (status: abierto)
   - Si sí: carga existente
3. Agregar renglones:
   a. AUTO desde POS: al completar venta, opción "Agregar a Reporte Turistas"
   b. MANUAL: click "Agregar Renglón" → formulario
4. Escaneo en renglón:
   - Click "Escanear Piezas" en renglón
   - Escanea barcodes → busca piezas → suma CANT y PESO
   - Muestra miniaturas
5. Usuario completa: pagos por moneda/TPV, identificación
6. Sistema calcula totales automáticos
7. Cerrar reporte:
   - Valida totales
   - Cambia status a "cerrado"
   - Calcula comisiones
   - Agrega a sync_queue
8. Conciliación:
   - Compara vs ventas POS del día
   - Compara vs caja (pagos)
   - Muestra diferencias
9. Export: PDF/Excel/CSV + Sync Sheets
```

### Flujo Sincronización
```
1. Sistema detecta conexión (online/offline)
2. Usuario puede forzar "Sync Ahora"
3. Proceso:
   a. Obtiene registros de sync_queue (status: pending)
   b. Agrupa por entity_type
   c. Para cada grupo:
      - Prepara payload
      - POST a Google Apps Script Web App (con TOKEN)
      - Apps Script valida token, procesa, responde
   d. Si éxito: marca sync_status = synced, elimina de cola
   e. Si error: incrementa retries, actualiza last_attempt
4. Idempotencia:
   - Apps Script verifica si existe (por folio/SKU/id)
   - Si existe: actualiza, no duplica
5. Usuario ve: estado por entidad, errores, reintentos
```

