# 📖 Guía del Usuario - Sistema Opal & Co

## Bienvenido al Sistema

Esta guía te ayudará a entender cómo funciona el sistema de punto de venta de Opal & Co. Está diseñada para ser fácil de entender, sin términos técnicos complicados.

---

## 🎯 ¿Qué hace este sistema?

El sistema te ayuda a:
- **Vender productos** de manera rápida y organizada
- **Llevar el control de inventario** (qué productos tienes y cuántos)
- **Registrar llegadas de turistas** por agencia
- **Calcular ganancias** automáticamente
- **Generar reportes** de ventas y operaciones
- **Gestionar empleados y permisos**

---

## 🚪 Cómo Iniciar Sesión

1. Abre el sistema en tu navegador
2. Ingresa tu **usuario** (el nombre que te asignaron)
3. Ingresa tu **PIN** (contraseña de 4 dígitos)
4. Haz clic en **"Iniciar Sesión"**

**Nota importante:** La primera vez que inicies sesión, el sistema te pedirá cambiar tu PIN por seguridad.

---

## 🔄 ¿Cómo Funcionan los Módulos Juntos?

Antes de explicar cada módulo, es importante entender que **todos trabajan juntos** y la información fluye automáticamente entre ellos.

### El Flujo Principal:

```
1. INVENTARIO → Tienes productos disponibles
   ↓
2. POS → Vendes productos (se actualiza inventario automáticamente)
   ↓
3. CAJA → El dinero de las ventas se registra en caja
   ↓
4. LLEGADAS → Registras llegadas de turistas (para calcular costos)
   ↓
5. COSTOS → Registras gastos del día (luz, agua, etc.)
   ↓
6. REPORTES → Ves todas las ventas, llegadas y costos juntos
   ↓
7. DASHBOARD → Ves un resumen de todo (ganancias, ventas, etc.)
```

### ¿Qué significa esto en la práctica?

- **Cuando vendes en POS:** El inventario se actualiza solo, la caja se actualiza sola, y los reportes se actualizan solos.
- **Cuando registras llegadas:** Los costos se calculan solos y aparecen en los reportes automáticamente.
- **Cuando registras costos:** Aparecen en los reportes y se usan para calcular ganancias automáticamente.
- **No necesitas copiar información** de un módulo a otro - todo se conecta automáticamente.

---

## 📱 Módulos Principales

### 1. Dashboard (Panel Principal)

**¿Qué es?** Es la pantalla principal donde ves un resumen de todo.

**¿Qué muestra?**
- Ventas del día
- Productos más vendidos
- Ganancias del día
- Resumen de operaciones

**¿Cuándo usarlo?** Al inicio del día para ver cómo va todo, o al final para revisar resultados.

---

### 2. POS (Punto de Venta)

**¿Qué es?** Es donde realizas las ventas a los clientes. Es el módulo más importante del sistema.

**¿Cómo se relaciona con otros módulos?**
- **Lee del Inventario:** Muestra los productos disponibles para vender
- **Actualiza el Inventario:** Cuando vendes, marca los productos como vendidos automáticamente
- **Actualiza la Caja:** El dinero de la venta se suma a la caja automáticamente
- **Crea Reportes:** Cada venta aparece automáticamente en los reportes
- **Calcula Comisiones:** Usa las reglas de comisiones de vendedores y guías

**¿Cómo funciona?**

#### Paso 1: Escanear la Guía
- Usa el escáner para leer el código de barras del guía
- El sistema detecta automáticamente qué guía es y su agencia
- Verás en pantalla: "Guía [Nombre] cargado"

#### Paso 2: Escanear el Vendedor
- Escanea el código de barras del vendedor
- El sistema asigna el vendedor a esta venta
- Verás: "Vendedor [Nombre] asignado"

#### Paso 3: Escanear los Productos
- Escanea cada producto que el cliente quiere comprar
- Cada producto se agrega automáticamente al carrito
- Puedes ver el precio y la cantidad en pantalla

**Nota:** También puedes agregar productos haciendo clic en ellos desde la lista, sin necesidad de escanear.

#### Paso 4: Revisar el Carrito
- Verás todos los productos seleccionados
- Puedes ver el precio de cada uno
- Puedes quitar productos si es necesario
- El sistema calcula el total automáticamente

#### Paso 5: Aplicar Descuentos (Opcional)
- Si el cliente tiene descuento, puedes aplicarlo
- Puede ser un descuento general o por producto

#### Paso 6: Ingresar el Pago
- El cliente puede pagar de diferentes formas:
  - Efectivo en dólares (USD)
  - Efectivo en pesos (MXN)
  - Efectivo en dólares canadienses (CAD)
  - Tarjeta de crédito (Visa/Mastercard)
  - Tarjeta American Express
- Puedes dividir el pago entre varios métodos
- El sistema te avisa cuando el pago está completo

#### Paso 7: Completar la Venta
- Haz clic en **"Completar Venta"**
- El sistema:
  - Genera un número de folio único
  - Calcula las comisiones del vendedor y guía automáticamente
  - Actualiza el inventario (marca los productos como vendidos)
  - Imprime el ticket
  - Guarda toda la información
- ¡Listo! Puedes empezar una nueva venta

**¿Qué información se guarda automáticamente?**
- Quién fue el vendedor
- Quién fue el guía
- Qué agencia trajo al cliente
- Qué productos se vendieron
- Cuánto se pagó y en qué forma
- Las comisiones calculadas
- La fecha y hora

**No necesitas escribir nada manualmente** - todo se guarda solo.

**¿Qué pasa automáticamente cuando completas una venta?**
1. ✅ El producto se marca como "vendida" en el inventario
2. ✅ El dinero se suma a la caja
3. ✅ La venta aparece en los reportes
4. ✅ Las comisiones se calculan y guardan
5. ✅ El ticket se imprime
6. ✅ Todo se sincroniza con Google Sheets (si está configurado)

---

### 3. Inventario

**¿Qué es?** Es donde ves y gestionas todos los productos que tienes en la tienda.

**¿Cómo se relaciona con otros módulos?**
- **Alimenta al POS:** El POS muestra los productos que están en inventario
- **Se actualiza desde el POS:** Cuando vendes, el inventario se actualiza automáticamente
- **Aparece en Reportes:** Puedes ver qué productos se vendieron más
- **Se usa para calcular ganancias:** El sistema usa el costo del producto para calcular cuánto ganaste

**¿Qué puedes hacer?**
- Ver todos los productos disponibles
- Agregar nuevos productos
- Editar información de productos existentes
- Ver cuántos productos tienes de cada tipo
- Ver el costo y precio de cada producto
- Actualizar el stock (cantidad disponible)

**¿Cuándo usarlo?**
- Cuando llegan productos nuevos
- Cuando necesitas ver qué productos tienes
- Cuando necesitas actualizar precios o cantidades

**Importante:** Cuando agregas un producto, automáticamente estará disponible en el POS para vender.

---

### 4. Llegadas

**¿Qué es?** Es donde registras cuántos turistas llegaron cada día por cada agencia.

**¿Cómo se relaciona con otros módulos?**
- **Es independiente del POS:** Las llegadas son diferentes de las ventas
- **Calcula costos automáticamente:** Usa las tarifas configuradas para calcular cuánto cuesta cada llegada
- **Aparece en Reportes:** Puedes ver cuántas llegadas hubo y cuánto costaron
- **Se usa para calcular ganancias:** Los costos de llegadas se restan de las ganancias

**¿Cómo funciona?**

1. Abre el módulo de **"Llegadas"**
2. Selecciona el día (por defecto muestra el día de hoy)
3. Para cada agencia en la lista:
   - Ingresa cuántos **pasajeros** llegaron (PAX)
   - Ingresa cuántas **unidades** (vehículos) llegaron
   - Selecciona el **tipo de unidad** (Van, Sprinter, City Tour, etc.)
   - El sistema calcula automáticamente el costo según las tarifas configuradas
   - Si necesitas ajustar el costo, puedes hacerlo manualmente
   - Agrega notas si es necesario
   - Haz clic en **"Guardar"**

**¿Qué muestra el sistema?**
- Total de pasajeros del día
- Total de costos de llegadas
- Lista de todas las agencias con sus llegadas

**Importante:** 
- Este módulo solo es para registrar llegadas. Las ventas se registran automáticamente en el POS cuando escaneas los productos.
- Las llegadas y las ventas son cosas diferentes:
  - **Llegadas** = Cuántos turistas llegaron (para calcular costos)
  - **Ventas** = Qué productos se vendieron (se registran en el POS)

---

### 5. Caja

**¿Qué es?** Es donde controlas el dinero en efectivo de la tienda.

**¿Cómo se relaciona con otros módulos?**
- **Se actualiza desde el POS:** Cada venta suma dinero a la caja automáticamente
- **Aparece en Reportes:** Puedes ver cuánto dinero entró y salió
- **Se usa para el Dashboard:** El balance de caja aparece en el resumen

**¿Qué puedes hacer?**
- Abrir una sesión de caja (al iniciar el día)
- Ver cuánto dinero hay en caja
- Registrar movimientos de dinero (entradas y salidas)
- Cerrar la sesión de caja (al final del día)
- Ver reportes de caja

**¿Cuándo usarlo?**
- Al inicio del día: abrir caja
- Durante el día: registrar movimientos importantes (retiros, depósitos)
- Al final del día: cerrar caja y hacer el conteo

**Importante:** Cuando completas una venta en el POS, el dinero se suma automáticamente a la caja. No necesitas registrarlo manualmente.

---

### 6. Clientes

**¿Qué es?** Es donde guardas información de tus clientes.

**¿Qué puedes hacer?**
- Ver lista de todos los clientes
- Agregar nuevos clientes
- Editar información de clientes
- Buscar clientes por nombre
- Ver historial de compras de un cliente

**¿Cuándo usarlo?**
- Cuando un cliente nuevo quiere comprar
- Cuando necesitas buscar información de un cliente
- Cuando quieres ver qué ha comprado un cliente

---

### 7. Empleados

**¿Qué es?** Es donde gestionas la información de los empleados.

**¿Qué puedes hacer?**
- Ver lista de empleados
- Agregar nuevos empleados
- Editar información de empleados
- Asignar empleados a sucursales
- Ver qué empleados trabajan en cada sucursal

**Nota:** Solo los administradores pueden gestionar empleados.

---

### 8. Reportes

**¿Qué es?** Es donde ves análisis y estadísticas de las ventas y operaciones.

**¿Cómo se relaciona con otros módulos?**
- **Lee del POS:** Muestra todas las ventas realizadas
- **Lee de Llegadas:** Muestra todas las llegadas registradas
- **Lee de Costos:** Muestra todos los gastos registrados
- **Lee del Inventario:** Muestra qué productos se vendieron
- **Calcula Ganancias:** Combina ventas, costos y llegadas para calcular ganancias

**¿Qué reportes puedes ver?**
- Reportes de ventas (por día, semana, mes)
- Reportes de productos más vendidos
- Reportes de vendedores (quién vendió más)
- Reportes de ganancias (bruta y neta)
- Reportes de llegadas
- Reportes de costos

**¿Cuándo usarlo?**
- Al final del día para ver resultados
- Al final de la semana para análisis
- Cuando necesitas información específica

**Importante:** Los reportes se generan automáticamente con la información de todos los módulos. No necesitas hacer nada especial - solo selecciona las fechas que quieres ver.

---

### 9. Costos

**¿Qué es?** Es donde registras los gastos operativos de la tienda.

**¿Cómo se relaciona con otros módulos?**
- **Aparece en Reportes:** Todos los costos se muestran en los reportes
- **Se usa para calcular ganancias:** Los costos se restan de las ganancias
- **Aparece en el Dashboard:** El total de costos aparece en el resumen

**¿Qué puedes hacer?**
- Agregar costos del día (renta, servicios, etc.)
- Ver lista de costos
- Editar o eliminar costos
- Ver total de costos por día

**¿Cuándo usarlo?**
- Cuando hay un gasto que registrar (luz, agua, renta, etc.)
- Para llevar control de todos los gastos

**Tipos de costos que puedes registrar:**
- Gastos fijos (renta, servicios)
- Gastos variables (materiales, reparaciones)
- Gastos de llegadas (ya se calculan automáticamente en el módulo de Llegadas)

---

### 10. Configuración

**¿Qué es?** Es donde se configuran las opciones del sistema.

**¿Qué puedes configurar?**
- Información de la empresa (nombre, dirección, teléfono)
- Catálogos (guías, vendedores, agencias, productos)
- Sucursales
- Permisos de usuarios
- Impresora
- Sincronización con Google Sheets
- Y más opciones avanzadas

**Nota:** La mayoría de opciones de configuración solo están disponibles para administradores.

---

## 🔍 Búsqueda Global

En la parte superior del sistema hay una barra de búsqueda que te permite buscar:
- Productos por nombre o código
- Clientes por nombre
- Ventas por folio
- Y más

Solo escribe lo que buscas y el sistema te mostrará los resultados.

---

## 🔄 Sincronización

El sistema puede sincronizar los datos con Google Sheets automáticamente.

**¿Qué significa esto?**
- Los datos se guardan en el sistema
- También se pueden enviar a una hoja de cálculo en Google
- Esto permite tener respaldo y análisis adicionales

**¿Cuándo se sincroniza?**
- Automáticamente cuando completas una venta
- Automáticamente cuando registras una llegada
- También puedes sincronizar manualmente haciendo clic en el botón de sincronización

---

## 📊 Cómo se Calculan las Ganancias

El sistema calcula las ganancias automáticamente combinando información de varios módulos:

### ¿De dónde viene cada dato?

1. **Ingresos** → Del módulo **POS** (todas las ventas del día)
2. **Costos de productos** → Del módulo **Inventario** (cuánto costó cada producto que vendiste)
3. **Costos de llegadas** → Del módulo **Llegadas** (cuánto se pagó por las llegadas de turistas)
4. **Costos operativos** → Del módulo **Costos** (gastos del día como luz, agua, renta, etc.)
5. **Comisiones** → Del módulo **POS** (comisiones de vendedores y guías calculadas automáticamente)

### Fórmula simple:
```
Ganancia Bruta = Ingresos - Costos de productos - Costos de llegadas - Costos operativos

Ganancia Neta = Ganancia Bruta - Comisiones de vendedores - Comisiones de guías
```

### ¿Cómo funciona en la práctica?

1. **Vendes productos en el POS** → El sistema suma los ingresos
2. **El sistema busca en el Inventario** → Ve cuánto costó cada producto
3. **Registras llegadas** → El sistema calcula los costos de llegadas
4. **Registras costos** → El sistema suma todos los gastos
5. **El sistema calcula automáticamente** → Resta todos los costos de los ingresos
6. **Ves el resultado** → En el Dashboard o en Reportes

**No necesitas hacer cálculos manuales** - el sistema hace todo automáticamente usando la información de todos los módulos.

---

## 🏢 Sucursales

Si trabajas en una empresa con múltiples tiendas (sucursales), el sistema puede manejar cada una por separado.

**¿Qué significa esto?**
- Cada sucursal tiene su propio inventario
- Cada sucursal tiene sus propios empleados
- Los reportes se pueden ver por sucursal o todos juntos
- Los administradores pueden cambiar entre sucursales

**¿Cómo cambio de sucursal?**
- Si eres administrador, verás un selector en la parte superior
- Selecciona la sucursal que quieres ver
- El sistema mostrará solo los datos de esa sucursal

---

## 🔐 Permisos y Roles

El sistema tiene diferentes tipos de usuarios con diferentes permisos:

### Administrador
- Acceso completo a todo el sistema
- Puede configurar todo
- Puede gestionar usuarios y permisos
- Puede ver todas las sucursales

### Gerente
- Puede ver y gestionar ventas
- Puede ver inventario y reportes
- Puede gestionar empleados
- Puede ver costos y ganancias

### Vendedor
- Puede realizar ventas en el POS
- Puede ver inventario
- Puede ver sus propias ventas
- Acceso limitado a otras funciones

### Cajero
- Puede realizar ventas en el POS
- Puede gestionar la caja
- Acceso muy limitado a otras funciones

**Nota:** Si no puedes hacer algo, es porque tu rol no tiene ese permiso. Pregunta a tu administrador si necesitas acceso adicional.

---

## 🖨️ Impresión de Tickets

Cuando completas una venta, el sistema imprime automáticamente un ticket.

**¿Qué muestra el ticket?**
- Nombre de la empresa
- Folio de la venta
- Fecha y hora
- Vendedor
- Guía y agencia (si aplica)
- Lista de productos vendidos
- Precios y totales
- Formas de pago
- Mensaje de agradecimiento

**Si no se imprime:**
- Verifica que la impresora esté conectada
- Verifica que la impresora esté encendida
- Puedes reimprimir el ticket desde el historial de ventas

---

## ❓ Preguntas Frecuentes

### ¿Qué hago si escaneo un producto que no está en el inventario?
El sistema te avisará. Puedes agregar el producto al inventario primero o continuar con la venta y agregarlo después.

### ¿Puedo cancelar una venta?
Sí, pero solo los administradores y gerentes pueden cancelar ventas. Busca la venta en el historial y selecciona "Cancelar".

### ¿Qué pasa si el cliente paga con varios métodos de pago?
No hay problema. Ingresa cada método de pago en su campo correspondiente. El sistema suma todo automáticamente.

### ¿Cómo sé cuánto dinero hay en caja?
Abre el módulo de "Caja" y verás el balance actual.

### ¿Puedo ver las ventas de días anteriores?
Sí, en el módulo de "Reportes" puedes seleccionar cualquier rango de fechas.

### ¿Qué hago si olvidé mi PIN?
Contacta a tu administrador para que te asigne un nuevo PIN.

### ¿Los datos se guardan automáticamente?
Sí, todo se guarda automáticamente. No necesitas hacer clic en "Guardar" después de cada venta.

### ¿Puedo usar el sistema sin internet?
Sí, el sistema funciona sin internet. Los datos se guardan localmente y se sincronizan cuando hay conexión.

---

## 💡 Consejos para Usar el Sistema

1. **Siempre escanea primero:** Usa el escáner para guías, vendedores y productos. Es más rápido y evita errores.

2. **Revisa antes de completar:** Antes de completar la venta, revisa que todo esté correcto (productos, precios, pagos).

3. **Registra llegadas diariamente:** No olvides registrar las llegadas de turistas cada día en el módulo de Llegadas.

4. **Cierra la caja al final del día:** Siempre cierra la sesión de caja al terminar tu turno.

5. **Usa la búsqueda:** Si no encuentras algo, usa la barra de búsqueda global.

6. **Revisa los reportes:** Los reportes te ayudan a entender cómo va el negocio.

---

## 🆘 ¿Necesitas Ayuda?

Si tienes problemas o preguntas:
1. Revisa esta guía primero
2. Pregunta a tu supervisor o gerente
3. Contacta al administrador del sistema

---

## 📝 Resumen Rápido del Flujo Diario

### Al Iniciar el Día:
1. **Inicia sesión** en el sistema
2. **Abre la caja** (módulo Caja)
3. **Verifica el Dashboard** para ver el estado general
4. **Verifica que el POS** esté funcionando y muestre productos

### Durante el Día:

#### Para cada venta:
1. **Abre el módulo POS**
2. **Escanea guía** → El sistema carga guía y agencia automáticamente
3. **Escanea vendedor** → El sistema asigna el vendedor
4. **Escanea productos** → Se agregan al carrito automáticamente
5. **Ingresa pagos** → El sistema valida que el pago esté completo
6. **Completa la venta** → El sistema:
   - Actualiza el inventario (marca productos como vendidos)
   - Suma dinero a la caja
   - Calcula comisiones
   - Imprime ticket
   - Guarda todo automáticamente

#### Para las llegadas:
1. **Abre el módulo Llegadas**
2. **Registra llegadas** conforme van llegando las agencias
3. **El sistema calcula costos** automáticamente

#### Para gastos:
1. **Abre el módulo Costos**
2. **Registra gastos** cuando ocurran (luz, agua, etc.)

### Al Final del Día:
1. **Revisa el Dashboard** para ver resumen del día
2. **Verifica en Llegadas** que todas estén registradas
3. **Revisa en Costos** que todos los gastos estén registrados
4. **Revisa en Reportes** las ventas y ganancias del día
5. **Cierra la caja** (módulo Caja) y haz el conteo físico
6. **Sincroniza datos** si es necesario (botón de sincronización)

### Flujo Visual Simplificado:

```
INICIO DEL DÍA
    ↓
ABRIR CAJA
    ↓
┌─────────────────────────────────────┐
│  DURANTE EL DÍA                     │
│                                     │
│  VENTAS (POS)                       │
│    ↓                                │
│  Actualiza: Inventario, Caja        │
│                                     │
│  LLEGADAS                           │
│    ↓                                │
│  Calcula costos automáticamente     │
│                                     │
│  COSTOS                             │
│    ↓                                │
│  Registra gastos                    │
└─────────────────────────────────────┘
    ↓
FIN DEL DÍA
    ↓
REVISAR DASHBOARD Y REPORTES
    ↓
CERRAR CAJA
```

**Recuerda:** Todo se conecta automáticamente. Solo necesitas:
- Vender en el POS
- Registrar llegadas
- Registrar costos

El sistema hace el resto automáticamente.

---

**¡Eso es todo! El sistema está diseñado para ser fácil de usar. Con la práctica, todo será muy rápido y natural.**

