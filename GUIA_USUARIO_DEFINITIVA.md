# 📘 Guía Definitiva del Usuario - Opal & Co POS

Guía completa para usar el Sistema POS Multisucursal de Opal & Co.

---

## 📑 Tabla de Contenidos

1. [Primeros Pasos](#primeros-pasos)
2. [Inicio de Sesión](#inicio-de-sesión)
3. [Navegación del Sistema](#navegación-del-sistema)
4. [Módulos Principales](#módulos-principales)
5. [Operaciones Diarias](#operaciones-diarias)
6. [Gestión de Inventario](#gestión-de-inventario)
7. [Reportes y Análisis](#reportes-y-análisis)
8. [Sincronización](#sincronización)
9. [Configuración](#configuración)
10. [Solución de Problemas](#solución-de-problemas)

---

## 🚀 Primeros Pasos

### Requisitos

- Navegador moderno (Chrome, Firefox, Edge, Safari)
- Conexión a internet (opcional - el sistema funciona offline)
- Cuenta de usuario creada por el administrador

### Acceso al Sistema

1. Abre el sistema en tu navegador
2. Ingresa tu **usuario** y **contraseña**
3. Selecciona tu **sucursal** (si tienes acceso a múltiples)
4. Click en **"Iniciar Sesión"**

### Primera Vez

Si es tu primera vez usando el sistema:
- El administrador debe crear tu usuario
- Debes tener asignada una sucursal
- Debes tener los permisos necesarios para tu rol

---

## 🔐 Inicio de Sesión

### Proceso de Login

1. **Usuario**: Ingresa tu nombre de usuario
2. **Contraseña**: Ingresa tu contraseña
3. **Sucursal**: Si tienes acceso a múltiples sucursales, selecciona una
4. Click en **"Iniciar Sesión"**

### Cambiar de Sucursal

Si tienes acceso a múltiples sucursales:
1. Click en el nombre de la sucursal en la barra superior
2. Selecciona la sucursal deseada
3. El sistema se recargará con los datos de esa sucursal

### Cerrar Sesión

Click en el ícono de **"Cerrar Sesión"** (esquina superior derecha)

---

## 🧭 Navegación del Sistema

### Barra Superior

- **Logo y Nombre**: Muestra el logo de Opal & Co
- **Sucursal Actual**: Muestra la sucursal en la que estás trabajando
- **Usuario Actual**: Muestra tu nombre de usuario
- **Búsqueda Global**: Busca productos, clientes, ventas, etc.
- **Estado de Sincronización**: Muestra si estás online/offline
- **Botón de Sincronización**: Sincroniza manualmente con Google Sheets
- **Cerrar Sesión**: Cierra tu sesión

### Menú Lateral

El menú está organizado en secciones:

#### 📊 OPERACIONES
- **Dashboard**: Vista general del sistema
- **POS**: Punto de venta
- **Caja**: Gestión de caja
- **Códigos de Barras**: Gestión de códigos de barras

#### 📦 INVENTARIO
- **Inventario**: Gestión de productos
- **Transferencias**: Transferencias entre sucursales

#### 👥 CLIENTES Y SERVICIOS
- **Clientes**: Base de datos de clientes
- **Reparaciones**: Gestión de reparaciones

#### 📈 REPORTES
- **Reportes**: Reportes detallados
- **Utilidad**: Cálculo de utilidad
- **Reportes Turísticos**: Reportes de llegadas

#### ⚙️ ADMINISTRACIÓN
- **Empleados**: Gestión de empleados
- **Usuarios**: Gestión de usuarios (solo admin)
- **Configuración**: Configuración del sistema (solo admin)

---

## 💰 Módulos Principales

### 1. Dashboard

**Qué es**: Vista general de métricas y estadísticas del sistema.

**Qué puedes hacer**:
- Ver ventas del día y del mes
- Ver llegadas de pasajeros
- Ver estado del inventario
- Ver costos del mes
- Ver desglose por sucursal (solo admin)

**Cómo usar**:
1. Se abre automáticamente al iniciar sesión
2. Los datos se actualizan automáticamente
3. Click en cualquier métrica para ver detalles

### 2. POS (Punto de Venta)

**Qué es**: Módulo para realizar ventas de productos.

**Qué puedes hacer**:
- Buscar productos por nombre, SKU o código de barras
- Escanear códigos de barras
- Agregar productos al carrito
- Aplicar descuentos
- Seleccionar métodos de pago
- Completar ventas
- Ver historial de ventas

**Cómo usar**:

1. **Buscar Producto**:
   - Escribe en la barra de búsqueda
   - O escanea el código de barras
   - O selecciona de las categorías

2. **Agregar al Carrito**:
   - Click en el producto
   - O presiona Enter después de buscar
   - Ajusta la cantidad si es necesario

3. **Aplicar Descuento** (si tienes permiso):
   - Click en "Descuento"
   - Ingresa el porcentaje o monto
   - Click en "Aplicar"

4. **Completar Venta**:
   - Revisa el total
   - Selecciona métodos de pago
   - Click en "Completar Venta"
   - Se genera el ticket automáticamente

**Atajos de Teclado**:
- **F1**: Enfocar búsqueda
- **F2**: Favoritos
- **F3**: Ventas pendientes
- **F4**: Historial
- **F5**: Pausar venta
- **F12**: Completar venta
- **Escape**: Cerrar modales

### 3. Inventario

**Qué es**: Gestión completa de productos del inventario.

**Qué puedes hacer**:
- Ver todos los productos
- Agregar nuevos productos
- Editar productos existentes
- Cambiar estado de productos
- Ver historial de movimientos
- Filtrar por categoría, estado, sucursal
- Buscar productos

**Cómo usar**:

1. **Ver Productos**:
   - Los productos se muestran automáticamente
   - Usa los filtros para buscar específicos
   - Click en un producto para ver detalles

2. **Agregar Producto**:
   - Click en "Agregar"
   - Completa el formulario:
     - Nombre
     - SKU (opcional)
     - Código de barras (opcional)
     - Precio
     - Costo
     - Categoría
     - Stock inicial
   - Click en "Guardar"

3. **Editar Producto**:
   - Click en el producto
   - Click en "Editar"
   - Modifica los campos
   - Click en "Guardar"

4. **Cambiar Estado**:
   - Click en el producto
   - Selecciona el nuevo estado:
     - **Disponible**: Producto disponible para venta
     - **Reservado**: Producto reservado
     - **Vendida**: Producto vendido
   - Click en "Guardar"

### 4. Transferencias

**Qué es**: Transferir productos entre sucursales.

**Qué puedes hacer**:
- Crear transferencias
- Ver transferencias pendientes
- Aprobar transferencias (si tienes permiso)
- Completar transferencias
- Cancelar transferencias

**Cómo usar**:

1. **Crear Transferencia**:
   - Click en "Nueva Transferencia"
   - Selecciona sucursal origen
   - Selecciona sucursal destino
   - Busca y agrega productos
   - Ingresa cantidades
   - Click en "Crear Transferencia"

2. **Aprobar Transferencia** (si tienes permiso):
   - Ve a la lista de transferencias
   - Click en "Aprobar" en la transferencia pendiente

3. **Completar Transferencia**:
   - Cuando recibes productos de otra sucursal
   - Ve a la transferencia
   - Verifica los productos
   - Click en "Completar"

### 5. Reportes

**Qué es**: Análisis detallado de ventas y operaciones.

**Qué puedes hacer**:
- Ver resumen general
- Generar reportes por fecha
- Filtrar por sucursal, vendedor, agencia
- Ver top vendedores
- Ver top productos
- Ver tendencias de ventas
- Exportar reportes

**Cómo usar**:

1. **Ver Resumen**:
   - Se muestra automáticamente al abrir
   - Incluye métricas principales

2. **Generar Reporte**:
   - Selecciona rango de fechas
   - Aplica filtros (sucursal, vendedor, etc.)
   - Click en "Generar Reporte"
   - El reporte se muestra en pantalla

3. **Exportar**:
   - Después de generar el reporte
   - Click en "Exportar"
   - Selecciona formato (PDF, Excel)
   - El archivo se descarga

### 6. Caja

**Qué es**: Gestión de caja y sesiones de caja.

**Qué puedes hacer**:
- Abrir sesión de caja
- Cerrar sesión de caja
- Ver movimientos de caja
- Registrar entradas/salidas
- Ver resumen de caja

**Cómo usar**:

1. **Abrir Sesión**:
   - Click en "Abrir Sesión"
   - Ingresa monto inicial
   - Selecciona moneda
   - Click en "Abrir"

2. **Cerrar Sesión**:
   - Click en "Cerrar Sesión"
   - Verifica el conteo
   - Ingresa montos por moneda
   - Click en "Cerrar"

---

## 📦 Gestión de Inventario

### Agregar Productos

1. Ve a **Inventario**
2. Click en **"Agregar"**
3. Completa:
   - **Nombre**: Nombre del producto
   - **SKU**: Código interno (opcional)
   - **Código de Barras**: Código de barras (opcional)
   - **Precio**: Precio de venta
   - **Costo**: Costo del producto
   - **Categoría**: Categoría del producto
   - **Stock Inicial**: Cantidad inicial
   - **Sucursal**: Sucursal donde está el producto
4. Click en **"Guardar"**

### Editar Productos

1. Busca el producto
2. Click en el producto
3. Click en **"Editar"**
4. Modifica los campos necesarios
5. Click en **"Guardar"**

### Cambiar Estado

- **Disponible**: Producto disponible para venta
- **Reservado**: Producto reservado (no se puede vender)
- **Vendida**: Producto vendido (se marca automáticamente al vender)

### Transferir Productos

Ver sección [Transferencias](#4-transferencias)

---

## 📊 Reportes y Análisis

### Tipos de Reportes

1. **Resumen General**: Métricas principales del día/mes
2. **Ventas por Fecha**: Ventas en un rango de fechas
3. **Ventas por Vendedor**: Ventas agrupadas por vendedor
4. **Ventas por Agencia**: Ventas agrupadas por agencia
5. **Top Productos**: Productos más vendidos
6. **Utilidad**: Cálculo de utilidad bruta y neta

### Generar Reportes

1. Ve a **Reportes**
2. Selecciona el tipo de análisis
3. Aplica filtros:
   - Rango de fechas
   - Sucursal
   - Vendedor
   - Agencia
   - Estado de venta
4. Click en **"Generar Reporte"**

### Exportar Reportes

1. Después de generar el reporte
2. Click en **"Exportar"**
3. Selecciona formato:
   - **PDF**: Para imprimir o compartir
   - **Excel**: Para análisis en Excel
4. El archivo se descarga automáticamente

---

## 🔄 Sincronización

### ¿Qué es la Sincronización?

La sincronización envía tus datos a Google Sheets para respaldo y análisis.

### Estado de Sincronización

En la barra superior verás:
- 🟢 **Online**: Conectado y sincronizando
- 🔴 **Offline**: Sin conexión (los datos se guardan localmente)

### Sincronización Automática

El sistema sincroniza automáticamente según la configuración:
- Cada 5 minutos
- Cada 15 minutos
- Cada 30 minutos
- Cada hora

### Sincronización Manual

1. Click en el botón de **sincronización** (🔄) en la barra superior
2. Espera a que termine
3. Verás una notificación de éxito o error

### Datos Pendientes

Si no hay conexión, los datos se guardan localmente y se sincronizan cuando haya conexión.

Para ver datos pendientes:
1. Ve a **Sincronización** (si está disponible)
2. Verás la lista de datos pendientes
3. Se sincronizarán automáticamente cuando haya conexión

---

## ⚙️ Configuración

### Acceso a Configuración

Solo usuarios con permisos de administrador pueden acceder a Configuración.

### Opciones de Configuración

1. **Sincronización**:
   - URL de Google Apps Script
   - Token de seguridad
   - Frecuencia de sincronización

2. **Catálogos**:
   - Gestionar Sucursales
   - Gestionar Agencias
   - Gestionar Vendedores
   - Gestionar Guías

3. **Sistema**:
   - Validar Sistema Multisucursal
   - Configuraciones avanzadas

---

## 🔧 Solución de Problemas

### No puedo iniciar sesión

1. Verifica que tu usuario y contraseña sean correctos
2. Verifica que tu usuario esté activo
3. Contacta al administrador si el problema persiste

### No veo productos en el inventario

1. Verifica que estés en la sucursal correcta
2. Verifica que los productos tengan estado "Disponible"
3. Verifica que tengas permisos para ver inventario
4. Usa la búsqueda para encontrar productos específicos

### No puedo realizar ventas

1. Verifica que tengas permisos para usar el POS
2. Verifica que haya productos disponibles
3. Verifica que la sesión de caja esté abierta (si es requerido)

### Los datos no se sincronizan

1. Verifica tu conexión a internet
2. Verifica la URL y Token en Configuración
3. Click en "Probar Conexión" en Configuración
4. Revisa la consola del navegador (F12) para errores

### No veo datos de otras sucursales

- Esto es normal si no eres administrador
- Solo verás datos de tu sucursal asignada
- Los administradores pueden ver todas las sucursales

### El sistema está lento

1. Cierra otras pestañas del navegador
2. Limpia la caché del navegador
3. Reinicia el navegador
4. Verifica tu conexión a internet

### Perdí mis datos

1. Los datos están guardados localmente en tu navegador
2. Si borraste los datos del navegador, se perdieron los datos locales
3. Si sincronizaste antes, los datos están en Google Sheets
4. Contacta al administrador para recuperar desde Google Sheets

---

## 💡 Consejos y Mejores Prácticas

### Para Vendedores

- ✅ Siempre verifica el producto antes de completar la venta
- ✅ Usa el escáner de códigos de barras cuando sea posible
- ✅ Revisa el total antes de completar
- ✅ Mantén la sesión de caja abierta durante tu turno

### Para Administradores

- ✅ Revisa los reportes regularmente
- ✅ Valida el sistema multisucursal periódicamente
- ✅ Verifica que la sincronización esté funcionando
- ✅ Mantén los catálogos actualizados

### Para Gestión de Inventario

- ✅ Actualiza los precios regularmente
- ✅ Marca productos como "Vendida" cuando se vendan
- ✅ Usa transferencias para mover productos entre sucursales
- ✅ Revisa el historial de movimientos

### Para Sincronización

- ✅ Verifica la conexión regularmente
- ✅ Sincroniza manualmente antes de cerrar si es importante
- ✅ Los datos se guardan localmente aunque no haya conexión
- ✅ La sincronización automática funciona en segundo plano

---

## 📞 Soporte

### ¿Necesitas Ayuda?

1. **Consulta esta guía** primero
2. **Revisa la sección de Solución de Problemas**
3. **Contacta al administrador** del sistema
4. **Revisa los logs** en la consola del navegador (F12)

### Información para Reportar Problemas

Cuando reportes un problema, incluye:
- Descripción del problema
- Pasos para reproducirlo
- Captura de pantalla (si es posible)
- Mensajes de error (consola F12)
- Tu usuario y sucursal

---

## 📝 Notas Importantes

### Almacenamiento Local

- Todos los datos se guardan localmente en tu navegador
- Funciona completamente offline
- Los datos persisten aunque cierres el navegador
- Si borras los datos del navegador, se pierden los datos locales

### Sincronización

- La sincronización es opcional pero recomendada
- Los datos se sincronizan automáticamente cuando hay conexión
- Si no hay conexión, los datos se guardan localmente y se sincronizan después

### Multisucursal

- Solo verás datos de tu sucursal asignada (a menos que seas admin)
- Los administradores pueden ver todas las sucursales
- Las transferencias requieren aprobación (según permisos)

### Permisos

- Cada usuario tiene permisos específicos según su rol
- Si no puedes hacer algo, es probable que no tengas el permiso
- Contacta al administrador para solicitar permisos adicionales

---

**Versión de la Guía**: 2.0.0  
**Última actualización**: 2024

---

*Esta guía cubre las funcionalidades principales del sistema. Para información técnica, consulta el README.md*

