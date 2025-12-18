# Guía de Gestión de Sucursales

## ¿Cómo acceder a la gestión de sucursales?

### Opción 1: Desde Configuración (Recomendado)
1. Ve al módulo **"Configuración"** (ícono de engranaje en el menú lateral)
2. Haz clic en la pestaña **"Catálogos"**
3. Busca la sección **"Sucursales"**
4. Haz clic en el botón **"Gestionar Sucursales"**

### Opción 2: Desde el Topbar (Solo Administradores)
- Si eres administrador, verás un **selector de sucursal** en el topbar (parte superior)
- Puedes cambiar entre sucursales directamente desde ahí

## Funcionalidades Disponibles

### 1. Ver Lista de Sucursales
- **Tabla completa** con todas las sucursales
- **Información mostrada:**
  - Nombre de la sucursal
  - Dirección
  - Cantidad de empleados asignados
  - Estado (Activa/Inactiva)
  - Acciones disponibles

### 2. Crear Nueva Sucursal
1. Haz clic en **"Agregar Sucursal"**
2. Completa el formulario:
   - **Nombre** (requerido): Ej: "Sucursal Centro", "Tienda Plaza"
   - **Dirección** (opcional): Dirección física
   - **Teléfono** (opcional): Número de contacto
   - **Estado**: Activa/Inactiva (por defecto activa)
3. Haz clic en **"Guardar"**

### 3. Editar Sucursal Existente
1. En la lista de sucursales, haz clic en el botón **"Editar"** (ícono de lápiz)
2. Modifica los campos que necesites
3. Haz clic en **"Guardar"**

### 4. Asignar Empleados a una Sucursal
1. En la lista de sucursales, haz clic en el botón **"Asignar Empleados"** (ícono de usuario con +)
2. Verás dos secciones:
   - **Empleados Asignados**: Lista de empleados que ya están en esta sucursal
   - **Asignar Empleados**: Lista de empleados disponibles para asignar
3. Para asignar: Haz clic en **"Asignar"** junto al empleado
4. Para quitar: Haz clic en **"Quitar"** junto al empleado asignado

### 5. Ver Empleados de una Sucursal
- Haz clic en el botón **"Ver empleados"** (ícono de usuarios) en la columna de empleados
- Se mostrará un modal con todos los empleados asignados a esa sucursal

### 6. Activar/Desactivar Sucursal
- **Activar**: Haz clic en el botón verde **"Activar"** (ícono de check)
- **Desactivar**: Haz clic en el botón rojo **"Desactivar"** (ícono de ban)
- Las sucursales inactivas no aparecerán en los selectores del sistema

### 7. Buscar y Filtrar
- **Búsqueda**: Escribe en el campo de búsqueda para filtrar por nombre o dirección
- **Filtros rápidos**:
  - **Todas**: Muestra todas las sucursales
  - **Activas**: Solo sucursales activas
  - **Inactivas**: Solo sucursales inactivas

## Asignación de Empleados

### ¿Cómo funciona?
- Cada empleado puede estar asignado a **una sola sucursal**
- Si asignas un empleado a una sucursal nueva, se quita automáticamente de la anterior
- Los empleados sin sucursal asignada pueden ver todas las sucursales (solo si son administradores)

### Pasos para Asignar:
1. Ve a **Configuración → Catálogos → Gestionar Sucursales**
2. Haz clic en **"Asignar Empleados"** en la sucursal deseada
3. En la sección **"Asignar Empleados"**, busca el empleado
4. Haz clic en **"Asignar"**
5. El empleado ahora está asignado a esa sucursal

### Verificar Asignación:
- En la tabla de sucursales, verás la cantidad de empleados asignados
- Haz clic en el ícono de usuarios para ver la lista completa

## Importante

### Permisos
- **Administradores**: Pueden gestionar todas las sucursales y ver todas
- **Empleados normales**: Solo ven y gestionan datos de su sucursal asignada

### Sincronización
- Los cambios se sincronizan automáticamente con Google Sheets
- Si no hay conexión, los cambios se guardan localmente y se sincronizan cuando haya conexión

### Datos Requeridos
- **Nombre**: Obligatorio para crear una sucursal
- **Dirección y Teléfono**: Opcionales pero recomendados

## Ejemplo de Uso

### Escenario: Crear una nueva sucursal y asignar empleados

1. **Crear la sucursal:**
   - Configuración → Catálogos → Gestionar Sucursales
   - Clic en "Agregar Sucursal"
   - Nombre: "Sucursal Norte"
   - Dirección: "Av. Principal #456, Col. Norte"
   - Teléfono: "(999) 456-7890"
   - Estado: Activa
   - Guardar

2. **Asignar empleados:**
   - En la lista, clic en "Asignar Empleados" de "Sucursal Norte"
   - Buscar empleado "Juan Pérez"
   - Clic en "Asignar"
   - Repetir para otros empleados

3. **Verificar:**
   - En la tabla, verás "2 empleado(s)" en la columna de empleados
   - Los empleados asignados ahora solo verán datos de "Sucursal Norte"

## Solución de Problemas

### No veo el botón "Gestionar Sucursales"
- Verifica que tengas permisos de administrador
- Asegúrate de estar en la pestaña "Catálogos" en Configuración

### No puedo asignar un empleado
- Verifica que el empleado exista en el sistema
- Algunos empleados pueden estar asignados a otra sucursal (se moverán automáticamente)

### La sucursal no aparece en los selectores
- Verifica que la sucursal esté marcada como "Activa"
- Recarga la página si es necesario

