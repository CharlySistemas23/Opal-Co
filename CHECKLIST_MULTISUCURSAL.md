# Checklist de Configuración Multisucursal

## ✅ Lo que YA está implementado

1. **BranchManager** - Gestión centralizada de sucursales
2. **Filtrado automático en DB** - `getAll()` y `query()` filtran por branch_id
3. **Asignación automática** - `add()` y `put()` agregan branch_id automáticamente
4. **Selector de sucursal** - En topbar para administradores
5. **Dashboard consolidado** - Vista de todas las sucursales
6. **Reportes consolidados** - Opción para ver todas las sucursales
7. **Transferencias** - Módulo completo de transferencias entre sucursales
8. **Gestión de sucursales** - CRUD completo en Configuración → Catálogos

## ⚠️ Lo que FALTA y puede causar errores

### 1. **Validaciones de branch_id**
- ❌ No se valida que branch_id exista antes de crear registros
- ❌ No se valida que el usuario tenga acceso a la sucursal
- ❌ Datos existentes sin branch_id pueden causar problemas

### 2. **Módulos sin filtrado por branch**
- ⚠️ `profit.js` - Algunas consultas no usan filtrado automático
- ⚠️ `cash.js` - Algunas consultas no filtran por branch
- ⚠️ `repairs.js` - Puede no estar filtrando correctamente
- ⚠️ `customers.js` - Puede no estar filtrando correctamente

### 3. **Datos demo sin branch_id**
- ❌ `loadDemoData()` puede crear datos sin branch_id correcto
- ❌ Necesita asegurar que todos los datos demo tengan branch_id

### 4. **Sincronización**
- ⚠️ `sync.js` - Necesita asegurar que branch_id se incluya en todos los registros
- ⚠️ Google Apps Script - Necesita procesar branch_id en todas las entidades

### 5. **Métricas y estadísticas**
- ⚠️ Algunas métricas pueden no estar filtrando por branch
- ⚠️ Estadísticas globales pueden mezclar datos de diferentes sucursales

### 6. **Migración de datos existentes**
- ❌ Datos creados antes de multisucursal no tienen branch_id
- ❌ Necesita herramienta de migración

### 7. **Configuración inicial**
- ❌ No hay validación de que exista al menos una sucursal
- ❌ No hay validación de que el usuario tenga sucursal asignada

## 🔧 Correcciones Necesarias

### Prioridad ALTA (Pueden causar errores críticos)

1. **Validar branch_id antes de crear registros**
2. **Asegurar que todos los módulos filtren por branch**
3. **Migrar datos existentes sin branch_id**
4. **Validar que exista al menos una sucursal activa**

### Prioridad MEDIA (Pueden causar inconsistencias)

1. **Actualizar datos demo para incluir branch_id**
2. **Asegurar sincronización con branch_id**
3. **Validar acceso del usuario a la sucursal**

### Prioridad BAJA (Mejoras)

1. **Métricas consolidadas por sucursal**
2. **Reportes comparativos entre sucursales**
3. **Dashboard de administrador con todas las sucursales**

