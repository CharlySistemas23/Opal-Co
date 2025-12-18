# 📊 Métricas y Ganancias - Cómo se Relacionan los Datos

## 🎯 Resumen Ejecutivo

El sistema calcula **ganancias diarias** combinando datos de **3 fuentes principales**:
1. **Ventas (POS)** → Ingresos (Revenue)
2. **Llegadas** → Costos de llegadas (Arrival Costs)
3. **Costos** → Costos operativos (Operating Costs)

**Fórmula de Ganancia:**
```
Utilidad Bruta = Ingresos - Costo de Mercancía Vendida (COGS) - Costos de Llegadas - Costos Operativos
Utilidad Neta = Utilidad Bruta - Comisiones - Comisiones Bancarias
```

**Donde:**
- **Costo de Mercancía Vendida (COGS)** = Suma de (costo de adquisición × cantidad) de todos los productos vendidos
- **Comisiones Bancarias** = Suma de comisiones aplicadas a pagos con TPV (tarjeta) según banco y tipo (nacional/internacional)

---

## 📈 FLUJO DE DATOS PARA CÁLCULO DE GANANCIAS

### 1. **INGRESOS (Revenue)** - Del Módulo POS

**Origen:** Cada venta completada en el POS

**Datos que se capturan automáticamente:**
```
Venta #1:
  - Total: $1,500 MXN (precio de venta)
  - Productos: 
    • Anillo: Precio venta $800, Costo $400
    • Collar: Precio venta $700, Costo $350
  - Vendedor: Carlos
  - Guía: Juan (TANITOURS)
  - Pagos: $1,000 Cash MXN, $500 TPV

Venta #2:
  - Total: $2,200 USD (precio de venta)
  - Productos:
    • Pulsera: Precio venta $2,200 USD, Costo $1,100 USD
  - Vendedor: María
  - Guía: Pedro (TRAVELEX)
  - Pagos: $2,200 Cash USD
```

**Cálculo diario:**
```javascript
// Sistema suma todas las ventas del día (precio de venta)
Revenue = Suma de todos los totales de ventas completadas
         = $1,500 + $2,200 USD (convertido a MXN)
         = $1,500 + ($2,200 × 20.00 tipo de cambio)
         = $1,500 + $44,000
         = $45,500 MXN
```

**Dónde se guarda:**
- Tabla: `sales` (cada venta individual con total)
- Tabla: `sale_items` (cada item con precio de venta Y costo)
- Tabla: `daily_profit_reports` (suma del día)

---

### 1.5. **COSTO DE MERCADERÍA VENDIDA (COGS)** - Del Módulo POS

**Origen:** Costo de adquisición de cada pieza vendida

**Datos que se capturan automáticamente:**
```
Cada item vendido guarda:
  - item_id: ID del producto
  - price: Precio de venta (ej: $800)
  - cost: Costo de adquisición (ej: $400) ← NUEVO
  - quantity: Cantidad vendida
```

**Ejemplo:**
```
Venta #1:
  - Anillo: Precio venta $800, Costo $400, Cantidad 1
  - Collar: Precio venta $700, Costo $350, Cantidad 1
  → COGS de esta venta = ($400 × 1) + ($350 × 1) = $750

Venta #2:
  - Pulsera: Precio venta $2,200 USD, Costo $1,100 USD, Cantidad 1
  → COGS de esta venta = ($1,100 × 20 tipo cambio) = $22,000 MXN
```

**Cálculo diario:**
```javascript
// Sistema suma el costo de todos los items vendidos
COGS = Suma de (costo × cantidad) de todos los sale_items del día
     = ($400 × 1) + ($350 × 1) + ($1,100 USD × 20 × 1)
     = $750 + $22,000
     = $22,750 MXN
```

**Dónde se guarda:**
- Tabla: `sale_items` (cada item con su costo)
- Tabla: `daily_profit_reports` (suma del día como `merchandise_cost`)

---

### 2. **COSTOS DE LLEGADAS (Arrival Costs)** - Del Módulo de Llegadas

**Origen:** Registro manual de llegadas por agencia

**Datos que se capturan:**
```
Llegada TANITOURS:
  - Pasajeros: 12 PAX
  - Unidades: 1 Van
  - Tipo: Van
  - Costo calculado: $1,200 (según tabulador)

Llegada TRAVELEX:
  - Pasajeros: 8 PAX
  - Unidades: 1 Sprinter
  - Tipo: Sprinter
  - Costo calculado: $800 (según tabulador)

Llegada VERANOS:
  - Pasajeros: 15 PAX
  - Unidades: 2 Vans
  - Tipo: Van
  - Costo calculado: $1,500 (según tabulador)
```

**Cálculo diario:**
```javascript
// Sistema suma todos los costos de llegadas del día
Arrival Costs = Suma de todos los arrival_fee registrados
              = $1,200 + $800 + $1,500
              = $3,500 MXN
```

**Dónde se guarda:**
- Tabla: `agency_arrivals` (cada llegada individual)
- Tabla: `daily_profit_reports` (suma del día)

---

### 3. **COSTOS OPERATIVOS (Operating Costs)** - Del Módulo de Costos

**Origen:** Registro de costos fijos y variables

**Tipos de costos:**
```
Costos Fijos (recurrentes):
  - Nómina semanal: $5,000
  - Renta mensual: $15,000
  - Luz mensual: $2,000

Costos Variables (del día):
  - Materiales: $500
  - Servicios: $300
  - Otros: $200
```

**Cálculo diario:**
```javascript
// Sistema prorratea costos recurrentes y suma variables
Operating Costs = Costos variables del día
                + (Nómina semanal / 7 días)
                + (Renta mensual / días del mes)
                + (Luz mensual / días del mes)
                = $500 + $300 + $200
                + ($5,000 / 7)
                + ($15,000 / 30)
                + ($2,000 / 30)
                = $1,000 + $714 + $500 + $67
                = $2,281 MXN
```

**Dónde se guarda:**
- Tabla: `cost_entries` (cada costo individual)
- Tabla: `daily_profit_reports` (suma prorrateada del día)

---

### 4. **COMISIONES (Commissions)** - Calculadas de las Ventas

**Origen:** Calculadas automáticamente de cada venta según reglas

**Cálculo por venta:**
```javascript
// Para cada venta, sistema calcula:
Comisión Vendedor = Total venta × % comisión vendedor
Comisión Guía = Total venta × % comisión guía

Ejemplo:
  Venta $1,500:
    - Comisión Carlos (vendedor 5%): $1,500 × 0.05 = $75
    - Comisión Juan (guía 3%): $1,500 × 0.03 = $45
    - Total comisiones: $120
```

**Cálculo diario:**
```javascript
// Sistema suma todas las comisiones del día
Commissions = Suma de comisiones de vendedores
            + Suma de comisiones de guías
            = $75 + $45 + (comisiones de otras ventas...)
            = $1,200 MXN (ejemplo)
```

**Dónde se guarda:**
- Tabla: `sale_items` (comisión por item vendido)
- Tabla: `daily_profit_reports` (suma del día)

---

### 4.5. **COMISIONES BANCARIAS (Bank Commissions)** - De Pagos con TPV

**Origen:** Calculadas automáticamente de cada pago con tarjeta según banco y tipo

**Configuración de comisiones:**
```
Banamex:
  - Nacional: 2.32% (con IVA incluido)
  - Internacional: 4.06% (con IVA incluido)

Santander:
  - Nacional: 2.00% (con IVA incluido)
  - Internacional: 2.55% (con IVA incluido)
```

**Cálculo por pago:**
```javascript
// Para cada pago con TPV, sistema calcula:
Comisión Bancaria = Monto del pago × % comisión según banco y tipo

Ejemplo:
  Pago Visa $1,000 (Banamex, Nacional):
    - Comisión: $1,000 × 0.0232 = $23.20

  Pago Amex $2,000 (Santander, Internacional):
    - Comisión: $2,000 × 0.0255 = $51.00
```

**Cálculo diario:**
```javascript
// Sistema suma todas las comisiones bancarias del día
Bank Commissions = Suma de comisiones bancarias de todos los pagos TPV
                 = $23.20 + $51.00 + (otras comisiones...)
                 = $500 MXN (ejemplo)
```

**Dónde se guarda:**
- Tabla: `payments` (cada pago con `bank_commission`)
- Tabla: `daily_profit_reports` (suma del día como `bank_commissions`)

---

## 💰 CÁLCULO FINAL DE GANANCIAS

### Reporte de Utilidad Diaria

El sistema genera automáticamente un **Reporte de Utilidad Diaria** que combina todos los datos:

```javascript
// Datos del día (ejemplo)
Revenue (Ingresos):           $45,500 MXN
Arrival Costs (Costos llegadas): -$3,500 MXN
Operating Costs (Costos operativos): -$2,281 MXN
─────────────────────────────────────────────
Gross Profit (Utilidad Bruta):  $39,719 MXN
Commissions (Comisiones):      -$1,200 MXN
─────────────────────────────────────────────
Net Profit (Utilidad Neta):    $38,519 MXN
```

**Fórmulas:**
```
Utilidad Bruta = Ingresos - Costos de Llegadas - Costos Operativos
Utilidad Neta = Utilidad Bruta - Comisiones
```

---

## 📊 DÓNDE SE VEN LAS MÉTRICAS

### 1. **Dashboard Principal**

Muestra resumen del día actual:
```
┌─────────────────────────────────────┐
│ UTILIDAD DEL DÍA                    │
├─────────────────────────────────────┤
│ Ingresos:        $45,500            │
│ Costos Llegadas: -$3,500            │
│ Costos Operativos: -$2,281          │
│ ─────────────────────────────────── │
│ Utilidad Bruta:  $39,719            │
│ Comisiones:      -$1,200            │
│ ─────────────────────────────────── │
│ Utilidad Neta:   $38,519 ✅         │
└─────────────────────────────────────┘
```

### 2. **Módulo de Reportes**

Análisis detallado:
- Ventas por día/semana/mes
- Costos de llegadas por agencia
- Costos operativos por categoría
- Comisiones por vendedor/guía
- Utilidad bruta y neta
- Gráficos y tendencias

### 3. **Google Sheets (Sincronización)**

Se sincroniza automáticamente:
- Hoja `SALES`: Todas las ventas
- Hoja `AGENCY_ARRIVALS`: Todas las llegadas
- Hoja `COSTS`: Todos los costos
- Hoja `DAILY_PROFIT_REPORTS`: Reportes de utilidad diaria

---

## 🔗 RELACIÓN ENTRE VENTAS Y LLEGADAS

### ¿Cómo se relacionan?

**NO se relacionan directamente por registro**, sino por **análisis agregado**:

1. **Ventas (POS):**
   - Cada venta tiene: `agency_id`, `guide_id`, `seller_id`
   - Se pueden agrupar por agencia para análisis

2. **Llegadas:**
   - Cada llegada tiene: `agency_id`, `passengers`, `arrival_fee`
   - Se pueden agrupar por agencia para análisis

3. **Análisis combinado:**
   ```
   Para TANITOURS del día:
     - Ventas totales: $25,000 (de todas las ventas con agency_id = TANITOURS)
     - Costo de llegadas: $1,200 (de la llegada registrada)
     - Utilidad de TANITOURS: $25,000 - $1,200 = $23,800
   ```

### Métricas que se pueden calcular:

#### Por Agencia:
```
Agencia: TANITOURS
  - Ventas totales: $25,000
  - Costo llegadas: $1,200
  - Comisiones: $1,500
  - Utilidad: $25,000 - $1,200 - $1,500 = $22,300
```

#### Por Guía:
```
Guía: Juan Pérez (TANITOURS)
  - Ventas: $15,000 (todas las ventas con guide_id = Juan)
  - Comisión guía: $450 (3% de $15,000)
  - Pasajeros traídos: 12 PAX (de la llegada)
  - Ticket promedio: $15,000 / 12 = $1,250 por pasajero
```

#### Por Vendedor:
```
Vendedor: Carlos
  - Ventas: $20,000 (todas las ventas con seller_id = Carlos)
  - Comisión vendedor: $1,000 (5% de $20,000)
  - Número de ventas: 15
  - Ticket promedio: $20,000 / 15 = $1,333 por venta
```

#### Por Día:
```
Día: 2024-01-15
  - Ingresos totales: $45,500
  - Costos llegadas: $3,500
  - Costos operativos: $2,281
  - Comisiones: $1,200
  - Utilidad neta: $38,519
  - Total pasajeros: 35 PAX
  - Ticket promedio general: $45,500 / 35 = $1,300 por pasajero
```

---

## 📈 MÉTRICAS CLAVE DEL SISTEMA

### 1. **Métricas de Ventas (POS)**
- Total vendido del día
- Número de ventas
- Ticket promedio
- Ventas por agencia
- Ventas por vendedor
- Ventas por guía
- Distribución por método de pago
- Productos más vendidos

### 2. **Métricas de Llegadas**
- Total pasajeros del día
- Total costos de llegadas
- Llegadas por agencia
- Costo promedio por pasajero
- Tipo de unidad más usado

### 3. **Métricas de Rentabilidad**
- Utilidad bruta diaria
- Utilidad neta diaria
- Margen de utilidad (%)
- ROI por agencia
- Eficiencia de costos

### 4. **Métricas de Comisiones**
- Comisiones totales vendedores
- Comisiones totales guías
- Comisión promedio por venta
- Top vendedores por comisión
- Top guías por comisión

---

## 🔄 PROCESO AUTOMÁTICO DE CÁLCULO

### Al Finalizar el Día

El sistema puede generar automáticamente el reporte de utilidad:

```javascript
1. Obtener todas las ventas del día (status = 'completada')
   → Calcular: Revenue, Commissions

2. Obtener todas las llegadas del día
   → Calcular: Arrival Costs

3. Obtener todos los costos del día (prorrateados)
   → Calcular: Operating Costs

4. Calcular costo de mercancía vendida (COGS):
   → Merchandise Cost = Suma de (costo × cantidad) de todos los sale_items del día

5. Calcular métricas:
   → Gross Profit = Revenue - Merchandise Cost - Arrival Costs - Operating Costs
   → Net Profit = Gross Profit - Commissions

5. Guardar en daily_profit_reports
   → Sincronizar con Google Sheets
```

### Vista en Tiempo Real

El Dashboard muestra métricas en tiempo real:
- Se actualizan conforme se registran ventas
- Se actualizan conforme se registran llegadas
- Se actualizan conforme se registran costos

---

## 📋 EJEMPLO COMPLETO DE UN DÍA

### Datos del Día: 15 de Enero, 2024

#### Ventas Registradas (POS):
```
Venta 1: $1,500 (TANITOURS, Guía Juan, Vendedor Carlos)
  - Productos: Anillo $800 (costo $400), Collar $700 (costo $350)
  - COGS: $750

Venta 2: $2,200 USD = $44,000 MXN (TRAVELEX, Guía Pedro, Vendedor María)
  - Productos: Pulsera $2,200 USD (costo $1,100 USD = $22,000 MXN)
  - COGS: $22,000 MXN

Venta 3: $800 (VERANOS, Guía Ana, Vendedor Carlos)
  - Productos: Aretes $800 (costo $400)
  - COGS: $400
─────────────────────────────────────────────────────
Total Ingresos: $46,300 MXN
Total COGS: $23,150 MXN
```

#### Llegadas Registradas:
```
TANITOURS: 12 PAX, 1 Van → Costo: $1,200
TRAVELEX: 8 PAX, 1 Sprinter → Costo: $800
VERANOS: 15 PAX, 2 Vans → Costo: $1,500
─────────────────────────────────────────────────────
Total Costos Llegadas: $3,500 MXN
Total Pasajeros: 35 PAX
```

#### Costos Operativos:
```
Nómina (prorrateo semanal): $714
Renta (prorrateo mensual): $500
Luz (prorrateo mensual): $67
Materiales del día: $500
Servicios del día: $300
─────────────────────────────────────────────────────
Total Costos Operativos: $2,081 MXN
```

#### Comisiones Calculadas:
```
Venta 1: $1,500
  - Comisión Carlos (5%): $75
  - Comisión Juan (3%): $45

Venta 2: $44,000
  - Comisión María (5%): $2,200
  - Comisión Pedro (3%): $1,320

Venta 3: $800
  - Comisión Carlos (5%): $40
  - Comisión Ana (3%): $24
─────────────────────────────────────────────────────
Total Comisiones: $3,704 MXN
```

### Cálculo Final:

```
┌─────────────────────────────────────────┐
│ REPORTE DE UTILIDAD - 15 Enero 2024    │
├─────────────────────────────────────────┤
│ INGRESOS (Revenue)                      │
│   Ventas totales:        $46,300       │
│                                         │
│ COSTOS                                  │
│   Costo mercancía (COGS): -$22,750     │ ← NUEVO
│   Costos de llegadas:    -$3,500       │
│   Costos operativos:     -$2,081       │
│   ───────────────────────────────────── │
│   Total costos:          -$28,331       │
│                                         │
│ UTILIDAD BRUTA                          │
│   Ingresos - Costos:      $17,969       │
│                                         │
│ COMISIONES                              │
│   Vendedores + Guías:     -$3,704       │
│   Comisiones Bancarias:   -$500         │ ← NUEVO
│                                         │
│ UTILIDAD NETA                           │
│   Bruta - Comisiones:     $13,765 ✅    │
│                                         │
│ MÉTRICAS ADICIONALES                    │
│   Total pasajeros:        35 PAX       │
│   Ticket promedio:        $1,323       │
│   Margen de utilidad:     31%          │
│   Margen bruto:          39%           │
└─────────────────────────────────────────┘
```

**Nota importante:** Ahora la utilidad neta refleja la ganancia real, restando el costo de adquisición de la mercancía vendida.

---

## 🎯 ANÁLISIS POR AGENCIA

### Ejemplo: Análisis de TANITOURS

```
AGENCIA: TANITOURS
─────────────────────────────────────────
VENTAS:
  - Total vendido: $25,000
  - Número de ventas: 8
  - Ticket promedio: $3,125

LLEGADAS:
  - Pasajeros: 12 PAX
  - Costo llegada: $1,200
  - Costo por pasajero: $100

COMISIONES:
  - Comisiones vendedores: $1,250
  - Comisiones guías: $750
  - Total: $2,000

RENTABILIDAD:
  - Ingresos: $25,000
  - Costo mercancía: -$12,500 (costo de adquisición de piezas vendidas)
  - Costos llegadas: -$1,200
  - Comisiones: -$2,000
  - Utilidad: $9,300
  - Margen: 37.2% (utilidad real)
```

---

## 📱 DÓNDE VER ESTAS MÉTRICAS

### 1. **Dashboard Principal**
- Métricas del día actual
- Gráficos de tendencias
- Comparativas con días anteriores

### 2. **Módulo de Reportes**
- Reportes detallados por período
- Análisis por agencia, vendedor, guía
- Exportación a Excel/PDF

### 3. **Google Sheets (Sincronizado)**
- Hoja `DAILY_PROFIT_REPORTS`
- Análisis avanzado con fórmulas
- Gráficos personalizados

---

## ✅ RESUMEN

### Los datos se relacionan así:

1. **Ventas (POS)** → Generan **INGRESOS** (precio de venta)
2. **Ventas (POS)** → Generan **COSTO DE MERCADERÍA** (costo de adquisición de cada pieza)
3. **Llegadas** → Generan **COSTOS de llegadas**
4. **Costos** → Generan **COSTOS operativos**
5. **Comisiones** → Se calculan de las **VENTAS**

### La ganancia se calcula:

```
Utilidad Bruta = Ingresos - Costo Mercancía - Costos de Llegadas - Costos Operativos
Utilidad Neta = Utilidad Bruta - Comisiones - Comisiones Bancarias
```

**Ejemplo:**
```
Ingresos: $45,500
Costo Mercancía: -$22,750 (lo que costó comprar las piezas)
Costos Llegadas: -$3,500
Costos Operativos: -$2,281
─────────────────────────────
Utilidad Bruta: $16,969
Comisiones: -$1,200 (vendedores + guías)
Comisiones Bancarias: -$500 (pagos con tarjeta)
─────────────────────────────
Utilidad Neta: $15,269 ✅ (ganancia real)
```

### Todo se integra automáticamente:

- ✅ Cada venta se registra automáticamente en POS
- ✅ Cada llegada se registra manualmente en módulo Llegadas
- ✅ El sistema calcula todo automáticamente
- ✅ Las métricas se ven en Dashboard y Reportes
- ✅ Todo se sincroniza con Google Sheets

**No hay duplicación, todo está conectado y se calcula automáticamente.**

