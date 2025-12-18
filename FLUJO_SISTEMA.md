# Flujo del Sistema - Versión Simplificada

## 📋 Resumen de Cambios

El sistema ahora tiene **dos flujos independientes** que trabajan en paralelo:
1. **Flujo de Ventas (POS)**: Registra automáticamente todas las ventas con toda su información
2. **Flujo de Llegadas**: Registra únicamente las llegadas por pasajeros por día

**Ya no hay duplicación de trabajo** - cada módulo tiene su propósito específico.

---

## 🛒 FLUJO 1: VENTAS EN POS (Punto de Venta)

### Paso a Paso:

#### 1. **Inicio de Venta**
- Usuario abre módulo **POS**
- Sistema carga: sucursal activa, catálogos (productos, guías, vendedores, agencias)

#### 2. **Configuración de Venta (por Escaneo)**
El sistema detecta automáticamente qué se escanea:

**a) Escanear GUÍA:**
```
- Escanea código de barras del guía
- Sistema busca en catálogo de guías
- Si encuentra: carga guía y su agencia asociada
- Muestra: "Guía [Nombre] cargado. Ahora escanea el VENDEDOR."
```

**b) Escanear VENDEDOR:**
```
- Escanea código de barras del vendedor
- Sistema busca en catálogo de vendedores
- Si encuentra: asigna vendedor a la venta
- Muestra: "Vendedor [Nombre] asignado. Ahora escanea los PRODUCTOS."
```

**c) Escanear PRODUCTOS:**
```
- Escanea código de barras de cada pieza
- Sistema busca en inventario
- Valida que esté disponible
- Agrega al carrito automáticamente
- Muestra: "[Pieza] agregada al carrito"
- Repetir para cada pieza
```

#### 3. **Visualización de Información**
En la pantalla POS se muestra:
- **Guía actual**: [Nombre del guía]
- **Agencia**: [Nombre de la agencia] (se carga automáticamente del guía)
- **Vendedor**: [Nombre del vendedor]
- **Carrito**: Lista de productos escaneados con precios

#### 4. **Configuración Adicional (Opcional)**
- Seleccionar cliente (búsqueda manual)
- Aplicar descuento general
- Ajustar precios individuales si es necesario

#### 5. **Pago**
Usuario ingresa pagos en múltiples métodos:
- **Cash USD**: $______
- **Cash MXN**: $______
- **Cash CAD**: $______
- **TPV VISA-MC**: $______
- **TPV AMEX**: $______

Sistema valida que: **Suma de pagos = Total**

#### 6. **Completar Venta**
Al hacer clic en "Completar Venta":
```
✓ Genera folio único: SUC-YYYYMMDD-0001
✓ Calcula comisiones automáticamente:
  - Comisión vendedor (según regla del vendedor)
  - Comisión guía (según regla del guía)
✓ Actualiza inventario:
  - Cambia status de productos a "vendida"
  - Reduce stock
  - Crea log de inventario
✓ Guarda venta completa con:
  - seller_id (vendedor)
  - guide_id (guía)
  - agency_id (agencia)
  - customer_id (cliente, si aplica)
  - products (todos los items del carrito)
  - payments (todos los métodos de pago)
  - totals (subtotal, descuentos, total)
  - comisiones (vendedor y guía)
✓ Imprime ticket (58mm)
✓ Agrega a cola de sincronización
✓ Limpia carrito y prepara para siguiente venta
```

#### 7. **Datos Guardados Automáticamente**
Cada venta queda registrada con:
- ✅ Vendedor
- ✅ Guía
- ✅ Agencia
- ✅ Productos vendidos
- ✅ Precios y cantidades
- ✅ Métodos de pago
- ✅ Comisiones calculadas
- ✅ Fecha y hora
- ✅ Folio único

**NO es necesario registrar nada manualmente en otro módulo.**

---

## ✈️ FLUJO 2: LLEGADAS POR PASAJEROS

### Propósito
Registrar únicamente las **llegadas de pasajeros por agencia por día** para calcular costos de llegadas según el tabulador.

### Paso a Paso:

#### 1. **Abrir Módulo de Llegadas**
- Usuario abre módulo **"Llegadas"** (antes "Reporte Turistas")
- Sistema muestra tabla de agencias objetivo:
  - TRAVELEX
  - VERANOS
  - TANITOURS
  - DISCOVERY
  - TB
  - TTF

#### 2. **Seleccionar Fecha**
- Por defecto muestra el día actual
- Usuario puede cambiar la fecha si necesita registrar llegadas de otro día

#### 3. **Registrar Llegadas por Agencia**
Para cada agencia en la tabla:

**a) Ingresar Pasajeros (PAX):**
```
- Campo: PAX
- Ingresar número de pasajeros que llegaron
```

**b) Ingresar Unidades:**
```
- Campo: UNIDADES
- Ingresar número de unidades (vehículos) que llegaron
```

**c) Seleccionar Tipo de Unidad:**
```
- Dropdown con opciones:
  • Cualquiera
  • City Tour
  • Sprinter
  • Van
  • Camiones (nuevo)
```

**d) Sistema Calcula Automáticamente:**
```
- Consulta tabulador de llegadas (en Configuración)
- Busca regla que aplique según:
  • Agencia
  • Sucursal
  • Número de pasajeros
  • Tipo de unidad
- Calcula costo según tarifa configurada
- Muestra costo en campo "COSTO"
```

**e) Override Manual (si es necesario):**
```
- Si no hay regla aplicable o se necesita ajuste
- Click en botón de editar (ícono lápiz)
- Ingresar monto manual
- Ingresar motivo del override
- Guardar
```

**f) Notas (opcional):**
```
- Campo: NOTAS
- Agregar observaciones sobre la llegada
```

**g) Guardar:**
```
- Click en botón "Guardar"
- Sistema guarda llegada con:
  • Fecha
  • Sucursal
  • Agencia
  • Pasajeros
  • Unidades
  • Tipo de unidad
  • Costo calculado o override
  • Notas
```

#### 4. **Visualización de Totales**
El sistema muestra automáticamente:
- **TOTAL PAX GENERAL**: Suma de todos los pasajeros registrados
- **TOTAL $ LLEGADAS**: Suma de todos los costos de llegadas

#### 5. **Nota Informativa**
El módulo muestra una nota:
> "Las ventas se registran automáticamente en el módulo POS al escanear piezas, guías y vendedores. Este módulo solo maneja el registro de llegadas por pasajeros por día."

---

## 🔄 RELACIÓN ENTRE LOS DOS FLUJOS

### Datos Independientes
- **Ventas (POS)**: Se registran automáticamente al completar ventas
- **Llegadas**: Se registran manualmente por agencia por día

### No Hay Duplicación
- ❌ **NO** es necesario registrar ventas en el módulo de llegadas
- ❌ **NO** es necesario ingresar vendedor, guía, productos en llegadas
- ✅ Las ventas ya tienen toda la información necesaria
- ✅ Las llegadas solo registran pasajeros y costos

### Reportes y Análisis
Los reportes se pueden generar desde:
- **Módulo de Reportes**: Análisis de ventas del POS
- **Módulo de Llegadas**: Análisis de llegadas y costos
- **Dashboard**: Resumen general de ambos

---

## 📊 FLUJO COMPLETO DE UN DÍA TÍPICO

### Mañana (Apertura)
1. **Abrir módulo Llegadas**
2. **Registrar llegadas del día** según van llegando las agencias
3. **Sistema calcula costos automáticamente**

### Durante el Día (Operación)
1. **Cada venta en POS:**
   - Escanear guía → Escanear vendedor → Escanear productos
   - Ingresar pagos
   - Completar venta
   - **Todo se guarda automáticamente**

2. **No es necesario hacer nada más**

### Tarde/Noche (Cierre)
1. **Verificar llegadas registradas** en módulo Llegadas
2. **Revisar ventas del día** en módulo POS o Reportes
3. **Generar reportes** si es necesario
4. **Sincronizar datos** con Google Sheets

---

## 🎯 VENTAJAS DEL NUEVO FLUJO

### ✅ Eficiencia
- **Un solo registro**: La información se captura una vez en el POS
- **Sin duplicación**: No hay que ingresar datos dos veces
- **Automático**: El sistema detecta guías, vendedores y productos por escaneo

### ✅ Precisión
- **Menos errores**: Al escanear, no hay errores de tipeo
- **Datos completos**: Cada venta tiene toda la información necesaria
- **Trazabilidad**: Folio único para cada venta

### ✅ Simplicidad
- **Flujo claro**: Ventas en POS, Llegadas en módulo de Llegadas
- **Separación de responsabilidades**: Cada módulo hace una cosa bien
- **Fácil de usar**: El escaneo hace el trabajo pesado

### ✅ Reportes Mejorados
- **Ventas**: Se pueden analizar desde el módulo de Reportes
- **Llegadas**: Se pueden analizar desde el módulo de Llegadas
- **Sin confusión**: Cada dato tiene su lugar

---

## 📝 EJEMPLO PRÁCTICO

### Escenario: Venta a un turista

**1. En POS:**
```
- Escanea código del guía "Juan Pérez" (TANITOURS)
  → Sistema carga: Guía = Juan Pérez, Agencia = TANITOURS
  
- Escanea código del vendedor "Carlos"
  → Sistema asigna: Vendedor = Carlos
  
- Escanea anillo de oro (SKU: AN001)
  → Sistema agrega al carrito
  
- Escanea collar de plata (SKU: COL002)
  → Sistema agrega al carrito
  
- Ingresa pagos: $500 USD cash, $200 MXN cash
  
- Click "Completar Venta"
  → Sistema guarda TODO automáticamente
  → Imprime ticket
  → Listo para siguiente venta
```

**2. En Llegadas (más tarde en el día):**
```
- Abre módulo Llegadas
- Busca TANITOURS en la tabla
- Ingresa: PAX = 12, Unidades = 1, Tipo = Van
- Sistema calcula costo automáticamente: $1,200
- Click "Guardar"
- Listo
```

**Resultado:**
- ✅ Venta registrada con toda la información (vendedor, guía, productos, pagos)
- ✅ Llegada registrada con pasajeros y costo
- ✅ Sin duplicación de trabajo
- ✅ Todo en su lugar correcto

---

## 🔧 CONFIGURACIÓN NECESARIA

### Para que funcione correctamente:

1. **Catálogos completos:**
   - Guías con códigos de barras
   - Vendedores con códigos de barras
   - Productos con códigos de barras
   - Agencias configuradas

2. **Tabulador de Llegadas:**
   - Reglas configuradas en Configuración → Tabulador Llegadas
   - Tarifas por agencia, sucursal, pasajeros, tipo de unidad

3. **Reglas de Comisiones:**
   - Comisiones de vendedores configuradas
   - Comisiones de guías configuradas

---

## 📱 INTERFAZ VISUAL

### Módulo POS
```
┌─────────────────────────────────────┐
│  GUÍA: Juan Pérez                   │
│  AGENCIA: TANITOURS                 │
│  VENDEDOR: Carlos                   │
├─────────────────────────────────────┤
│  CARRITO:                           │
│  • Anillo de oro        $500        │
│  • Collar de plata      $200        │
│  ────────────────────────────────  │
│  TOTAL: $700                        │
├─────────────────────────────────────┤
│  PAGOS:                             │
│  Cash USD: [500]                    │
│  Cash MXN: [200]                    │
│  ────────────────────────────────  │
│  [Completar Venta]                  │
└─────────────────────────────────────┘
```

### Módulo Llegadas
```
┌─────────────────────────────────────┐
│  DÍA: [2024-01-15]  TIENDA: Tienda 1│
├─────────────────────────────────────┤
│  LLEGADAS / PASAJEROS POR AGENCIA  │
├─────────────────────────────────────┤
│  AGENCIA    │ PAX │ UNID │ TIPO │ $ │
│  TANITOURS  │ [12]│ [1]  │ [Van]│$1200│
│  TRAVELEX   │ [8] │ [1]  │[Spr]│$800 │
│  VERANOS    │ [15]│ [2]  │[Van]│$1500│
├─────────────────────────────────────┤
│  TOTAL PAX: 35                       │
│  TOTAL $: $3,500                     │
└─────────────────────────────────────┘
```

---

## ✅ CHECKLIST DIARIO

### Al Iniciar el Día
- [ ] Verificar que el módulo POS esté funcionando
- [ ] Verificar que el módulo de Llegadas esté funcionando
- [ ] Revisar tipo de cambio del día

### Durante el Día
- [ ] Registrar llegadas conforme van llegando
- [ ] Realizar ventas normalmente en POS (todo automático)

### Al Cerrar el Día
- [ ] Verificar que todas las llegadas estén registradas
- [ ] Revisar ventas del día en POS/Reportes
- [ ] Sincronizar datos si es necesario

---

**Este flujo elimina la duplicación de trabajo y hace el sistema más eficiente y fácil de usar.**

