# 💼 Guía Financiera y Contable para Administradores

Guía completa para entender y analizar los datos empresariales, financieros, contables y fiscales del sistema POS Opal & Co.

---

## 📑 Tabla de Contenidos

1. [Estructura Financiera del Sistema](#estructura-financiera-del-sistema)
2. [Ingresos (Revenue)](#ingresos-revenue)
3. [Egresos y Costos](#egresos-y-costos)
4. [Utilidades y Rentabilidad](#utilidades-y-rentabilidad)
5. [Métricas Financieras](#métricas-financieras)
6. [Aspectos Fiscales y Contables](#aspectos-fiscales-y-contables)
7. [Valoración de la Empresa](#valoración-de-la-empresa)
8. [Reportes y Análisis](#reportes-y-análisis)
9. [Interpretación de Datos](#interpretación-de-datos)
10. [Mejores Prácticas](#mejores-prácticas)

---

## 🏗️ Estructura Financiera del Sistema

### Flujo de Datos Financieros

```
INGRESOS (Revenue)
    ├── Ventas de Productos
    │   └── Métodos de Pago (Cash USD/MXN/CAD, TPV VISA/MC, TPV AMEX)
    └── Otras Fuentes (si aplica)

EGRESOS (Costs)
    ├── Costo de Productos Vendidos (COGS)
    ├── Comisiones
    │   ├── Vendedores
    │   └── Guías
    ├── Costos de Llegadas (Agencias)
    └── Costos Operativos
        ├── Costos Fijos (prorrateados diariamente)
        └── Costos Variables

UTILIDAD OPERATIVA = INGRESOS - EGRESOS

UTILIDAD NETA = UTILIDAD OPERATIVA - IMPUESTOS (si aplica)
```

### Base de Datos Financiera

El sistema guarda todos los datos financieros en:
- **IndexedDB Local**: Base de datos `opal_pos_db`
- **Google Sheets**: Sincronización automática (si está configurada)

---

## 💰 Ingresos (Revenue)

### 1. Definición

Los **ingresos** son el dinero que entra a la empresa por la venta de productos o servicios.

### 2. Fuentes de Ingresos

#### A. Ventas de Productos

**Cálculo:**
```
Ingreso Total por Ventas = Suma de todas las ventas completadas
```

**Componentes de una Venta:**
- **Total de la venta**: Precio × Cantidad de cada producto
- **Descuentos aplicados**: Se restan del total
- **Subtotal**: Total antes de impuestos
- **Impuestos**: (Si aplica en tu región)
- **Total Final**: Monto que el cliente paga

**Ejemplo:**
```
Venta #1234:
- Producto A: $100 × 2 = $200
- Producto B: $50 × 1 = $50
- Descuento: -$25
- Subtotal: $225
- Total: $225
```

#### B. Métodos de Pago

El sistema registra ingresos por cada método de pago:

- **Efectivo USD**: Ventas pagadas en dólares estadounidenses
- **Efectivo MXN**: Ventas pagadas en pesos mexicanos
- **Efectivo CAD**: Ventas pagadas en dólares canadienses
- **TPV VISA/MC**: Ventas con tarjeta VISA o MasterCard
- **TPV AMEX**: Ventas con tarjeta American Express

**Importante**: Todos los ingresos se registran en la moneda original, pero se pueden convertir usando el tipo de cambio del día.

### 3. Cómo Ver los Ingresos

#### Desde el Dashboard:
1. Ve a **Dashboard**
2. Verás métricas de ingresos:
   - **Ventas del Día**: Suma de ventas completadas hoy
   - **Ventas del Mes**: Suma de ventas completadas este mes
   - **Ticket Promedio**: Ventas del día / Número de ventas

#### Desde Reportes:
1. Ve a **Reportes**
2. Selecciona **"Reportes"** o **"Resumen"**
3. Selecciona rango de fechas
4. Verás:
   - Ingresos totales por período
   - Ingresos por sucursal
   - Ingresos por vendedor
   - Ingresos por método de pago
   - Tendencias de ingresos

#### Desde Utilidad:
1. Ve a **Utilidad** (si está disponible)
2. Selecciona fecha
3. Verás el **Revenue (Ingresos)** del día

### 4. Análisis de Ingresos

**Métricas Clave:**
- **Ingresos Totales**: Suma de todos los ingresos
- **Ingresos Promedio Diario**: Ingresos totales / Días
- **Crecimiento de Ingresos**: Comparación período actual vs anterior
- **Ingresos por Sucursal**: Comparar performance de sucursales
- **Ingresos por Producto**: Identificar productos más rentables

---

## 💸 Egresos y Costos

### 1. Definición

Los **egresos** son el dinero que sale de la empresa para operar el negocio. Se dividen en varios tipos.

### 2. Tipos de Egresos

#### A. Costo de Productos Vendidos (COGS - Cost of Goods Sold)

**Definición**: El costo directo de los productos que se vendieron.

**Cálculo:**
```
COGS = Suma de (Costo del producto × Cantidad vendida)
```

**Ejemplo:**
```
Venta #1234:
- Producto A: Costo $60 × 2 unidades = $120
- Producto B: Costo $30 × 1 unidad = $30
- COGS Total: $150
```

**Importante**: 
- Se calcula usando el costo registrado de cada producto
- Si un producto no tiene costo registrado, se muestra una advertencia
- El COGS se resta directamente de los ingresos

#### B. Comisiones

##### Comisiones de Vendedores

**Definición**: Pago a vendedores por cada venta realizada.

**Cálculo:**
```
Comisión Vendedor = Total de Venta × (Porcentaje de Descuento / 100) × Multiplicador
```

**Ejemplo:**
```
Venta: $100
Regla de comisión: 10% de descuento, multiplicador 1.5
Comisión = $100 × (10/100) × 1.5 = $15
```

**Reglas de Comisión:**
- Cada vendedor puede tener una regla de comisión diferente
- Se configuran en **Configuración → Catálogos → Reglas de Comisión**
- Se aplican automáticamente a cada venta

##### Comisiones de Guías

**Definición**: Pago a guías turísticos por ventas relacionadas con turistas.

**Cálculo**: Similar a las comisiones de vendedores

**Aplicación**: Solo en ventas que tienen un guía asignado

#### C. Costos de Llegadas (Arrivals)

**Definición**: Costo de recibir grupos de turistas de agencias.

**Cálculo:**
```
Costo de Llegadas = Suma de (Tarifa de llegada × Número de llegadas válidas)
```

**Llegadas Válidas:**
- Deben tener `passengers > 0`
- Deben tener `units > 0`
- Se filtran por sucursal

**Ejemplo:**
```
Llegada #1: 20 pasajeros, tarifa $50 = $50
Llegada #2: 15 pasajeros, tarifa $40 = $40
Costo Total: $90
```

**Tarifas:**
- Se calculan automáticamente usando las reglas de llegada
- Dependen del número de pasajeros y la agencia
- Se configuran en **Configuración → Reglas de Llegadas**

#### D. Costos Operativos

##### Costos Fijos

**Definición**: Costos que no cambian independientemente de las ventas.

**Ejemplos:**
- Renta del local
- Salarios fijos de empleados
- Servicios (luz, agua, internet)
- Seguros
- Licencias

**Prorrateo Diario:**
Los costos fijos se prorratean (dividen) por día:

**Mensuales:**
```
Costo Diario = Costo Mensual / Días del Mes
```

**Ejemplo:**
```
Renta mensual: $3,000
Días del mes: 30
Costo diario: $3,000 / 30 = $100/día
```

**Semanales:**
```
Costo Diario = Costo Semanal / 7
```

**Ejemplo:**
```
Limpieza semanal: $350
Costo diario: $350 / 7 = $50/día
```

**Anuales:**
```
Costo Diario = Costo Anual / Días del Año (365 o 366)
```

**Ejemplo:**
```
Seguro anual: $12,000
Costo diario: $12,000 / 365 = $32.88/día
```

##### Costos Variables

**Definición**: Costos que cambian según las ventas o actividad.

**Ejemplos:**
- Materiales de empaque
- Combustible
- Comisiones variables
- Gastos de marketing puntuales
- Reparaciones y mantenimiento

**Cálculo:**
```
Costo Variable del Día = Suma de todos los costos variables registrados ese día
```

**Registro:**
- Se registran en **Costos → Agregar Costo**
- Se selecciona tipo: **Variable**
- Se registra la fecha específica

### 3. Clasificación de Costos en el Sistema

#### Por Tipo:
- **Fijo**: Costos recurrentes que no dependen de ventas
- **Variable**: Costos que dependen de la actividad

#### Por Categoría:
- Renta
- Servicios
- Salarios
- Marketing
- Mantenimiento
- Impuestos
- Otros

#### Por Período:
- **One-time**: Costo único (ej: reparación)
- **Daily**: Costo diario recurrente
- **Weekly**: Costo semanal recurrente
- **Monthly**: Costo mensual recurrente
- **Annual**: Costo anual recurrente

### 4. Cómo Registrar Costos

1. Ve a **Costos**
2. Click en **"Agregar Costo"**
3. Completa:
   - **Tipo**: Fijo o Variable
   - **Categoría**: Selecciona o crea una nueva
   - **Monto**: Cantidad del costo
   - **Fecha**: Fecha del costo
   - **Período**: Si es recurrente (daily, weekly, monthly, annual)
   - **Sucursal**: Sucursal a la que pertenece
   - **Notas**: Descripción adicional
4. Click en **"Guardar"**

### 5. Cómo Ver los Egresos

#### Desde Utilidad:
1. Ve a **Utilidad**
2. Selecciona fecha
3. Verás desglose de todos los egresos:
   - COGS
   - Comisiones Vendedores
   - Comisiones Guías
   - Costos de Llegadas
   - Costos Fijos (prorrateados)
   - Costos Variables

#### Desde Costos:
1. Ve a **Costos**
2. Verás lista de todos los costos
3. Puedes filtrar por:
   - Tipo (Fijo/Variable)
   - Categoría
   - Fecha
   - Sucursal

---

## 📈 Utilidades y Rentabilidad

### 1. Definición

**Utilidad (Profit)**: El dinero que queda después de restar todos los egresos de los ingresos.

### 2. Cálculo de Utilidad

#### Fórmula Básica:
```
UTILIDAD OPERATIVA = INGRESOS - EGRESOS

Donde:
EGRESOS = COGS + Comisiones + Costos de Llegadas + Costos Operativos
```

#### Cálculo Detallado:

```
1. INGRESOS (Revenue)
   = Suma de todas las ventas completadas del día

2. EGRESOS (Total Costs)
   = COGS
   + Comisiones Vendedores
   + Comisiones Guías
   + Costos de Llegadas
   + Costos Fijos (prorrateados)
   + Costos Variables

3. UTILIDAD OPERATIVA (Profit Before Taxes)
   = INGRESOS - EGRESOS

4. MARGEN DE UTILIDAD (Profit Margin)
   = (UTILIDAD / INGRESOS) × 100
```

### 3. Ejemplo de Cálculo

**Escenario de un día:**

```
INGRESOS:
- Ventas del día: $5,000

EGRESOS:
- COGS: $2,000
- Comisiones Vendedores: $300
- Comisiones Guías: $100
- Costos de Llegadas: $150
- Costos Fijos (prorrateados): $200
- Costos Variables: $50
- TOTAL EGRESOS: $2,800

UTILIDAD OPERATIVA:
$5,000 - $2,800 = $2,200

MARGEN DE UTILIDAD:
($2,200 / $5,000) × 100 = 44%
```

### 4. Interpretación de Utilidades

#### Utilidad Positiva:
✅ La empresa está generando ganancias
- Ingresos > Egresos
- Margen positivo indica salud financiera

#### Utilidad Negativa (Pérdida):
⚠️ La empresa está perdiendo dinero
- Ingresos < Egresos
- Requiere análisis y ajustes

#### Punto de Equilibrio:
El punto donde Ingresos = Egresos
- No hay ganancia ni pérdida
- Importante calcular para planificación

### 5. Cómo Calcular y Ver Utilidades

#### Desde el Módulo de Utilidad:
1. Ve a **Utilidad** (si está disponible en tu menú)
2. Selecciona fecha
3. Click en **"Calcular Utilidad"**
4. Verás:
   - Ingresos totales
   - Desglose de todos los egresos
   - Utilidad operativa
   - Margen de utilidad

#### Desde Reportes:
1. Ve a **Reportes → Análisis**
2. Selecciona rango de fechas
3. Verás análisis de utilidad por período

#### Desde Google Sheets:
Si tienes sincronización configurada:
1. Abre Google Sheets
2. Ve a la hoja **DAILY_PROFIT_REPORTS_BRANCH_[Sucursal]**
3. Verás reportes de utilidad diaria históricos

---

## 📊 Métricas Financieras

### 1. Métricas de Rentabilidad

#### A. Margen de Utilidad Bruta (Gross Profit Margin)

**Fórmula:**
```
Margen Bruto = ((Ingresos - COGS) / Ingresos) × 100
```

**Interpretación:**
- **>50%**: Excelente margen
- **30-50%**: Buen margen
- **20-30%**: Margen aceptable
- **<20%**: Margen bajo, requiere atención

**Ejemplo:**
```
Ingresos: $5,000
COGS: $2,000
Margen Bruto = (($5,000 - $2,000) / $5,000) × 100 = 60%
```

#### B. Margen de Utilidad Operativa (Operating Profit Margin)

**Fórmula:**
```
Margen Operativo = (Utilidad Operativa / Ingresos) × 100
```

**Interpretación:**
- Mide la eficiencia operativa
- Incluye todos los costos operativos
- Indica cuánto queda después de todos los gastos

#### C. Retorno sobre Ventas (ROS - Return on Sales)

**Fórmula:**
```
ROS = (Utilidad / Ingresos) × 100
```

**Es igual al margen de utilidad operativa**

### 2. Métricas de Eficiencia

#### A. Ticket Promedio (Average Ticket)

**Fórmula:**
```
Ticket Promedio = Ingresos Totales / Número de Ventas
```

**Interpretación:**
- Indica el valor promedio de cada venta
- Mayor ticket promedio = más ingresos por cliente
- Se puede mejorar con upselling o mejores productos

**Ejemplo:**
```
Ingresos del día: $5,000
Ventas del día: 25
Ticket Promedio = $5,000 / 25 = $200
```

#### B. Rotación de Inventario

**Fórmula:**
```
Rotación = Costo de Productos Vendidos / Inventario Promedio
```

**Interpretación:**
- Indica cuántas veces se vende el inventario
- Mayor rotación = mejor uso del capital
- Baja rotación = inventario estancado

#### C. Días de Inventario

**Fórmula:**
```
Días de Inventario = (Inventario / COGS) × Días del Período
```

**Interpretación:**
- Indica cuántos días durará el inventario actual
- Menor = mejor gestión de inventario

### 3. Métricas de Crecimiento

#### A. Crecimiento de Ingresos (Revenue Growth)

**Fórmula:**
```
Crecimiento = ((Ingresos Período Actual - Ingresos Período Anterior) / Ingresos Período Anterior) × 100
```

**Ejemplo:**
```
Mes Actual: $150,000
Mes Anterior: $120,000
Crecimiento = (($150,000 - $120,000) / $120,000) × 100 = 25%
```

#### B. Crecimiento de Utilidades

**Fórmula:**
```
Crecimiento Utilidad = ((Utilidad Actual - Utilidad Anterior) / Utilidad Anterior) × 100
```

### 4. Métricas por Sucursal

#### A. Ingresos por Sucursal
- Compara performance entre sucursales
- Identifica sucursales líderes y rezagadas

#### B. Utilidad por Sucursal
- Mide rentabilidad individual
- Ayuda a tomar decisiones de expansión o cierre

#### C. Eficiencia por Sucursal
```
Eficiencia = Utilidad / Costos Operativos
```

**Interpretación:**
- Mayor = mejor uso de recursos
- Menor = requiere optimización

### 5. Métricas de Liquidez

#### A. Flujo de Caja Operativo

**Cálculo:**
```
Flujo de Caja = Ingresos en Efectivo - Egresos en Efectivo
```

**Importante**: 
- TPV (tarjetas) no es efectivo inmediato
- Se liquida en 1-3 días hábiles

#### B. Disponible en Caja

**Cálculo:**
```
Disponible = Apertura de Caja + Ingresos en Efectivo - Salidas de Efectivo
```

### 6. Cómo Ver las Métricas

#### Desde Dashboard:
- Ingresos del día/mes
- Ticket promedio
- Top productos
- Top vendedores

#### Desde Reportes:
1. Ve a **Reportes → Análisis**
2. Verás:
   - Métricas consolidadas
   - Comparativas por período
   - Tendencias

#### Desde Google Sheets:
- Exporta datos para análisis avanzado
- Crea gráficos personalizados
- Realiza análisis de tendencias

---

## 🧾 Aspectos Fiscales y Contables

### 1. Registro de Transacciones

#### Ventas (Ingresos)

**Registro Contable:**
```
Fecha: [Fecha de venta]
Concepto: Venta de productos
Debe: Caja/Bancos: $XXX
Haber: Ventas: $XXX
```

**Documentos:**
- **Ticket de Venta**: Comprobante para el cliente
- **Registro en Sistema**: Para control interno
- **Factura** (si aplica): Para fines fiscales

#### Compras de Inventario (Egresos)

**Registro Contable:**
```
Fecha: [Fecha de compra]
Concepto: Compra de mercancía
Debe: Inventario: $XXX
Haber: Proveedores/Caja: $XXX
```

#### Costos Operativos

**Registro Contable:**
```
Fecha: [Fecha del costo]
Concepto: [Descripción del costo]
Debe: Gastos de Operación: $XXX
Haber: Caja/Bancos/Proveedores: $XXX
```

### 2. Estados Financieros Básicos

#### A. Estado de Resultados (Income Statement)

**Estructura:**
```
INGRESOS
- Ventas: $XXX
= INGRESOS TOTALES: $XXX

EGRESOS
- Costo de Productos Vendidos: $XXX
- Comisiones: $XXX
- Costos de Llegadas: $XXX
- Costos Operativos: $XXX
= EGRESOS TOTALES: $XXX

UTILIDAD OPERATIVA
= INGRESOS - EGRESOS: $XXX

IMPUESTOS (si aplica)
- Impuesto sobre la Renta: $XXX
- Otros impuestos: $XXX

UTILIDAD NETA
= UTILIDAD OPERATIVA - IMPUESTOS: $XXX
```

**Cómo Generarlo:**
1. Ve a **Reportes**
2. Selecciona rango de fechas (mes, trimestre, año)
3. Click en **"Generar Reporte"**
4. Exporta como Excel o PDF

#### B. Flujo de Efectivo (Cash Flow)

**Estructura:**
```
FLUJO DE EFECTIVO OPERATIVO
+ Ingresos en Efectivo: $XXX
- Egresos en Efectivo: $XXX
= FLUJO NETO: $XXX

FLUJO DE EFECTIVO DE INVERSIÓN
- Compras de Activos: $XXX
= FLUJO NETO: $XXX

FLUJO DE EFECTIVO DE FINANCIAMIENTO
+ Préstamos: $XXX
- Pagos de Préstamos: $XXX
= FLUJO NETO: $XXX
```

**Importante**: El sistema registra TPV por separado (no es efectivo inmediato).

### 3. Contabilidad por Sucursal

#### Registro Separado

Cada sucursal debe tener:
- Registro de ingresos independiente
- Registro de egresos independiente
- Cálculo de utilidad independiente

**Ventajas:**
- Control individual por ubicación
- Identificación de sucursales rentables
- Toma de decisiones basada en datos

#### Consolidación

Para reportes consolidados:
1. Suma ingresos de todas las sucursales
2. Suma egresos de todas las sucursales
3. Calcula utilidad total

### 4. Aspectos Fiscales

#### A. Impuestos sobre Ventas (IVA/ISR según tu país)

**Registro:**
- El sistema no calcula impuestos automáticamente
- Debes agregar manualmente si aplica
- Se pueden registrar como costos variables

**Recomendación:**
- Consulta con un contador
- Registra impuestos en el módulo de Costos
- Mantén documentación separada

#### B. Retenciones

**Tipos comunes:**
- Retención de ISR (Ingresos)
- Retención de IVA (si aplica)
- Retención de nómina

**Registro:**
- Se registran como costos variables
- Fecha: Fecha de retención
- Categoría: "Retenciones" o "Impuestos"

#### C. Declaraciones Fiscales

**Información Necesaria:**
1. **Ingresos Totales**: Desde Reportes
2. **Egresos Totales**: Desde Costos
3. **Utilidad Neta**: Desde Utilidad o Reportes
4. **Inventario Final**: Desde Inventario
5. **Movimientos de Caja**: Desde Caja

**Cómo Obtener:**
1. Genera reportes por período fiscal
2. Exporta a Excel
3. Consolida información
4. Entrega a contador

### 5. Conciliación Contable

#### A. Conciliación de Caja

**Pasos:**
1. Ve a **Caja → Conciliar con POS**
2. El sistema compara:
   - Ventas registradas en POS
   - Efectivo físico en caja
   - Diferencias (si hay)
3. Registra diferencias si existen

#### B. Conciliación de Inventario

**Pasos:**
1. Realiza conteo físico
2. Compara con inventario del sistema
3. Ajusta diferencias
4. Registra ajustes como costos si es pérdida

### 6. Documentación Necesaria

#### Para Fines Fiscales:
- ✅ Estados de resultados mensuales
- ✅ Reportes de ingresos por período
- ✅ Reportes de egresos detallados
- ✅ Comprobantes de costos
- ✅ Tickets de venta (conservar)
- ✅ Facturas de compras

#### Para Fines Contables:
- ✅ Libro de ventas diarias
- ✅ Libro de compras
- ✅ Registro de costos operativos
- ✅ Estados financieros consolidados
- ✅ Conciliaciones bancarias

---

## 💎 Valoración de la Empresa

### 1. Métodos de Valoración

#### A. Método de Múltiplos de Utilidades

**Fórmula:**
```
Valor de la Empresa = Utilidad Anual Promedio × Múltiplo de la Industria
```

**Ejemplo:**
```
Utilidad Anual: $120,000
Múltiplo de la Industria (retail): 5x
Valor = $120,000 × 5 = $600,000
```

**Múltiplos Típicos:**
- Retail: 3-8x utilidades
- Servicios: 2-5x utilidades
- Tecnología: 5-15x utilidades

#### B. Método de Flujo de Caja Descontado (DCF)

**Fórmula:**
```
Valor = Σ (Flujo de Caja Futuro / (1 + Tasa de Descuento)^Año)
```

**Componentes:**
- Proyección de flujos futuros (3-5 años)
- Tasa de descuento (WACC)
- Valor terminal

**Recomendación**: Usar con ayuda de un analista financiero.

#### C. Método de Activos Netos

**Fórmula:**
```
Valor = Activos - Pasivos
```

**Componentes:**
- Activos: Inventario, Equipos, Efectivo
- Pasivos: Deudas, Obligaciones

### 2. Indicadores de Valor

#### A. EBITDA (Earnings Before Interest, Taxes, Depreciation, Amortization)

**Cálculo Aproximado:**
```
EBITDA = Utilidad Operativa + Depreciación + Amortización
```

**Interpretación:**
- Mide capacidad de generar efectivo
- Usado comúnmente en valoraciones

#### B. Valor por Sucursal

**Cálculo:**
```
Valor Sucursal = Utilidad Anual Sucursal × Múltiplo
```

**Uso:**
- Valoración individual de cada ubicación
- Decisiones de expansión o cierre

#### C. Crecimiento Orgánico

**Indicadores:**
- Crecimiento de ingresos año sobre año
- Crecimiento de utilidades
- Expansión de sucursales
- Aumento de ticket promedio

**Interpretación:**
- Mayor crecimiento = Mayor valor
- Crecimiento sostenido = Empresa saludable

### 3. Análisis de Rentabilidad para Valoración

#### A. Margen de Utilidad Histórico

**Cálculo:**
```
Promedio de Márgenes últimos 12 meses
```

**Importante:**
- Márgenes consistentes = Valor más estable
- Márgenes crecientes = Valor en aumento

#### B. Rentabilidad por Sucursal

**Análisis:**
- Identificar sucursales más rentables
- Optimizar o cerrar sucursales menos rentables
- Valor total = Suma de valores individuales

#### C. Estacionalidad

**Análisis:**
- Identificar temporadas altas y bajas
- Ajustar proyecciones según estacionalidad
- Valorar capacidad de generar utilidad todo el año

### 4. Factores que Afectan el Valor

#### Positivos:
- ✅ Crecimiento constante de ingresos
- ✅ Márgenes de utilidad altos y estables
- ✅ Múltiples sucursales rentables
- ✅ Diversificación de productos
- ✅ Base de clientes sólida
- ✅ Sistemas y procesos automatizados

#### Negativos:
- ❌ Ingresos decrecientes
- ✅ Márgenes bajos o negativos
- ✅ Dependencia de una sola sucursal
- ✅ Alta rotación de personal
- ✅ Deudas excesivas
- ✅ Problemas legales o fiscales

### 5. Cómo Generar Reportes para Valoración

#### Reporte de Utilidades Históricas:
1. Ve a **Reportes**
2. Selecciona últimos 12 meses
3. Exporta como Excel
4. Calcula promedios y tendencias

#### Reporte Consolidado:
1. Selecciona todas las sucursales
2. Genera reporte consolidado
3. Exporta datos financieros completos

#### Análisis de Tendencias:
1. Compara períodos (mes a mes, año a año)
2. Identifica patrones de crecimiento
3. Proyecta tendencias futuras

---

## 📋 Reportes y Análisis

### 1. Reportes Disponibles

#### A. Reporte Diario de Utilidad

**Ubicación**: Módulo de Utilidad

**Contiene:**
- Ingresos del día
- Egresos detallados
- Utilidad operativa
- Margen de utilidad
- Pasajeros totales (si aplica)
- Tipo de cambio del día

#### B. Reporte de Ventas

**Ubicación**: Reportes → Reportes

**Filtros:**
- Fecha desde/hasta
- Sucursal
- Vendedor
- Agencia
- Estado de venta

**Contiene:**
- Lista de ventas
- Totales por filtro
- Métodos de pago
- Productos vendidos

#### C. Reporte de Costos

**Ubicación**: Costos → Historial

**Filtros:**
- Tipo (Fijo/Variable)
- Categoría
- Fecha
- Sucursal

**Contiene:**
- Lista de costos
- Totales por categoría
- Comparativas

#### D. Reporte de Análisis

**Ubicación**: Reportes → Análisis

**Contiene:**
- Métricas consolidadas
- Comparativas por período
- Tendencias
- Gráficos

### 2. Exportación de Datos

#### Formatos Disponibles:
- **Excel**: Para análisis avanzado
- **PDF**: Para impresión o presentación

#### Cómo Exportar:
1. Genera el reporte
2. Click en **"Exportar"**
3. Selecciona formato
4. El archivo se descarga

#### Uso de Datos Exportados:
- Análisis en Excel
- Creación de gráficos
- Presentaciones ejecutivas
- Entregas a contadores
- Proyecciones financieras

### 3. Sincronización con Google Sheets

#### Ventajas:
- Acceso desde cualquier lugar
- Compartir con equipo
- Análisis avanzado con fórmulas
- Creación de dashboards personalizados
- Backup automático

#### Hojas Disponibles:
- **SALES**: Todas las ventas
- **ITEMS**: Productos vendidos
- **PAYMENTS**: Pagos por venta
- **INVENTORY**: Inventario actual
- **COSTS**: Todos los costos
- **DAILY_PROFIT_REPORTS**: Reportes de utilidad diaria
- Y más...

---

## 🔍 Interpretación de Datos

### 1. Análisis de Tendencias

#### Ingresos Crecientes:
✅ **Positivo**: Empresa en crecimiento
- Analizar qué está causando el crecimiento
- Identificar factores de éxito
- Replicar en otras sucursales

#### Ingresos Decrecientes:
⚠️ **Alerta**: Requiere atención
- Identificar causas
- Revisar competencia
- Analizar productos/servicios
- Considerar cambios de estrategia

#### Utilidades Variables:
- Analizar estacionalidad
- Identificar períodos problemáticos
- Planificar para temporadas bajas

### 2. Comparativas

#### Por Sucursal:
- Identificar líderes y rezagadas
- Analizar diferencias
- Replicar mejores prácticas
- Optimizar sucursales débiles

#### Por Período:
- Comparar mes a mes
- Comparar año a año
- Identificar mejoras o deterioros
- Ajustar estrategias

#### Por Producto:
- Identificar productos estrella
- Eliminar productos poco rentables
- Optimizar mix de productos
- Mejorar márgenes

### 3. Puntos de Atención

#### Margen de Utilidad Bajo:
- Revisar precios de venta
- Negociar costos de productos
- Reducir costos operativos
- Optimizar comisiones

#### COGS Alto:
- Negociar con proveedores
- Buscar proveedores alternativos
- Optimizar compras
- Revisar mermas/robos

#### Costos Operativos Crecientes:
- Identificar costos que aumentan
- Analizar si son necesarios
- Buscar alternativas más baratas
- Optimizar procesos

---

## 💡 Mejores Prácticas

### 1. Registro de Datos

#### Ingresos:
- ✅ Registra todas las ventas inmediatamente
- ✅ Verifica que los totales sean correctos
- ✅ Mantén tickets/comprobantes
- ✅ Registra métodos de pago correctamente

#### Costos:
- ✅ Registra costos tan pronto ocurran
- ✅ Clasifica correctamente (Fijo/Variable)
- ✅ Asigna a la sucursal correcta
- ✅ Incluye notas descriptivas

#### Inventario:
- ✅ Mantén costos de productos actualizados
- ✅ Registra movimientos de inventario
- ✅ Realiza conteos periódicos
- ✅ Ajusta diferencias inmediatamente

### 2. Revisión Periódica

#### Diario:
- Revisar ventas del día
- Verificar cierre de caja
- Revisar utilidad del día

#### Semanal:
- Analizar tendencias de ventas
- Revisar costos registrados
- Comparar con semanas anteriores

#### Mensual:
- Generar estados financieros
- Analizar utilidades mensuales
- Comparar con meses anteriores
- Proyectar mes siguiente

#### Anual:
- Generar reportes anuales
- Comparar con años anteriores
- Planificar presupuesto
- Valorar la empresa

### 3. Toma de Decisiones Basada en Datos

#### Uso de Métricas:
- No tomar decisiones solo por "feeling"
- Analizar datos antes de decidir
- Comparar opciones con números
- Medir resultados de decisiones

#### Establecer Objetivos:
- Basados en datos históricos
- Realistas pero ambiciosos
- Medibles y específicos
- Con plazos definidos

### 4. Documentación

#### Mantener Registros:
- Todos los comprobantes
- Estados financieros periódicos
- Análisis y reportes importantes
- Decisiones importantes con justificación

#### Backup:
- Sincronizar regularmente con Google Sheets
- Exportar reportes importantes
- Guardar copias de seguridad
- Documentar procesos importantes

---

## 📞 Glosario Financiero

### Términos Clave:

- **Ingresos (Revenue)**: Dinero que entra a la empresa
- **Egresos (Expenses)**: Dinero que sale de la empresa
- **COGS**: Costo de productos vendidos
- **Utilidad (Profit)**: Ingresos - Egresos
- **Margen**: Porcentaje de utilidad sobre ingresos
- **Ticket Promedio**: Valor promedio de una venta
- **EBITDA**: Utilidad antes de intereses, impuestos, depreciación y amortización
- **Flujo de Caja**: Movimiento de efectivo en la empresa
- **ROI**: Retorno sobre inversión
- **Punto de Equilibrio**: Nivel de ventas donde Ingresos = Egresos

---

## 📊 Ejemplos Prácticos

### Ejemplo 1: Análisis de un Mes

```
ENERO 2024 - Sucursal Principal

INGRESOS:
- Ventas: $45,000
- Total Ingresos: $45,000

EGRESOS:
- COGS: $18,000 (40% de ingresos)
- Comisiones: $2,700 (6% de ingresos)
- Costos de Llegadas: $1,500
- Costos Fijos: $8,000
- Costos Variables: $2,300
- Total Egresos: $32,500

UTILIDAD:
- Utilidad Operativa: $12,500
- Margen: 27.8%

ANÁLISIS:
✅ Margen saludable (27.8%)
✅ Costos bajo control
✅ Utilidad positiva
```

### Ejemplo 2: Comparativa de Sucursales

```
COMPARATIVA MENSUAL:

Sucursal A:
- Ingresos: $45,000
- Utilidad: $12,500
- Margen: 27.8%

Sucursal B:
- Ingresos: $38,000
- Utilidad: $9,500
- Margen: 25.0%

ANÁLISIS:
- Sucursal A genera más ingresos
- Ambas tienen márgenes similares
- Sucursal A es más eficiente
```

### Ejemplo 3: Proyección de Valoración

```
VALORACIÓN DE LA EMPRESA:

Utilidad Anual Promedio (últimos 3 años):
- Año 1: $120,000
- Año 2: $135,000
- Año 3: $150,000
- Promedio: $135,000

Múltiplo de la Industria (Retail): 5x

Valor Estimado:
$135,000 × 5 = $675,000

FACTORES A CONSIDERAR:
- Crecimiento constante: +25% año sobre año
- 2 sucursales operativas
- Márgenes estables (25-30%)
- Sistema automatizado
```

---

**Versión de la Guía**: 1.0.0  
**Última actualización**: 2024

---

*Esta guía es para uso administrativo y contable. Para información operativa, consulta la GUIA_USUARIO_DEFINITIVA.md*

