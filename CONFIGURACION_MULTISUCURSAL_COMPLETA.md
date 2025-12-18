# Configuración Completa Multisucursal - Guía Definitiva

## 📋 Resumen de lo Implementado

### ✅ Componentes Core
1. **BranchManager** - Gestión centralizada de sucursales
2. **BranchValidator** - Validaciones y correcciones automáticas
3. **Filtrado automático en DB** - `getAll()` y `query()` filtran por branch_id
4. **Asignación automática** - `add()` y `put()` agregan branch_id automáticamente

### ✅ Módulos Actualizados
- ✅ Dashboard - Vista consolidada y filtrado por sucursal
- ✅ POS - Asignación automática de branch_id
- ✅ Inventory - Filtrado y asignación automática
- ✅ Reports - Soporte para reportes consolidados
- ✅ Profit - Cálculos por sucursal con validaciones
- ✅ Cash - Filtrado por sucursal
- ✅ Arrivals - Filtrado por sucursal
- ✅ Costs - Filtrado por sucursal
- ✅ Transfers - Módulo completo de transferencias

### ✅ Funcionalidades
- ✅ Selector de sucursal en topbar (admin)
- ✅ Gestión completa de sucursales (CRUD)
- ✅ Asignación de empleados a sucursales
- ✅ Validación automática al iniciar
- ✅ Migración automática de datos sin branch_id
- ✅ Sincronización con Google Sheets separada por sucursal

## 🔧 Configuración Inicial Requerida

### Paso 1: Crear Sucursales
1. Ve a **Configuración → Catálogos → Gestionar Sucursales**
2. Haz clic en **"Agregar Sucursal"**
3. Completa:
   - **Nombre**: Ej: "Sucursal Centro", "Tienda Plaza"
   - **Dirección**: (Opcional)
   - **Teléfono**: (Opcional)
   - **Estado**: Activa
4. Guarda

**IMPORTANTE**: Crea al menos una sucursal antes de usar el sistema.

### Paso 2: Asignar Empleados
1. En **Gestionar Sucursales**, haz clic en **"Asignar Empleados"**
2. Selecciona los empleados que trabajarán en esa sucursal
3. Haz clic en **"Asignar"**

**NOTA**: Los administradores no necesitan sucursal asignada (pueden ver todas).

### Paso 3: Validar Sistema
1. Ve a **Configuración → Catálogos**
2. Haz clic en **"Validar Sistema Multisucursal"**
3. Revisa el reporte:
   - **Problemas**: Corrígelos según las indicaciones
   - **Datos sin sucursal**: Se corrigen automáticamente
   - **Recomendaciones**: Sigue las sugerencias

## ⚠️ Validaciones Automáticas

### Al Iniciar la Aplicación
- ✅ Verifica que exista al menos una sucursal
- ✅ Verifica que haya al menos una sucursal activa
- ✅ Establece sucursal por defecto si no existe
- ✅ Muestra advertencia si falta configuración

### Al Crear Registros
- ✅ Asigna `branch_id` automáticamente si no existe
- ✅ Valida que la sucursal exista (en módulos críticos)
- ✅ Filtra datos por sucursal automáticamente

### Al Consultar Datos
- ✅ Filtra por sucursal del usuario actual
- ✅ Administradores ven todas las sucursales
- ✅ Usuarios normales solo ven su sucursal

## 🔍 Validación Manual

### Función de Validación Completa
**Ubicación**: Configuración → Catálogos → **"Validar Sistema Multisucursal"**

**Qué hace**:
1. Verifica configuración de sucursales
2. Identifica datos sin `branch_id`
3. Corrige automáticamente datos sin sucursal
4. Genera reporte completo

**Cuándo usarla**:
- Después de crear nuevas sucursales
- Si sospechas de datos mezclados
- Después de migrar datos antiguos
- Periódicamente para mantenimiento

## 📊 Métricas y Estadísticas

### Dashboard
- **Vista Individual**: Muestra solo datos de la sucursal actual
- **Vista Consolidada** (Admin): Muestra todas las sucursales con desglose
- **Toggle**: Botón "Ver Todas" para cambiar entre vistas

### Reportes
- **Filtro de Sucursal**: Selector "Todas" para administradores
- **Reportes Consolidados**: Opción para ver todas las sucursales
- **Filtrado Automático**: Por defecto filtra por sucursal actual

### Cálculos de Utilidad
- **Por Sucursal**: Cada sucursal calcula su utilidad independientemente
- **Validación**: Verifica que todas las ventas tengan branch_id
- **Corrección Automática**: Asigna branch_id si falta

## 🔗 Conexiones entre Módulos

### Flujo de Datos
```
Usuario → BranchManager → DB (filtrado) → Módulos
                ↓
         Validación automática
                ↓
         Asignación de branch_id
```

### Módulos Interconectados
1. **POS → Sales**: Asigna branch_id automáticamente
2. **Sales → Profit**: Filtra por branch_id
3. **Arrivals → Profit**: Filtra por branch_id
4. **Costs → Profit**: Filtra por branch_id
5. **Inventory → Transfers**: Valida branch_id origen/destino
6. **All → Sync**: Incluye branch_id en sincronización

## 🛡️ Protecciones Implementadas

### Validaciones de Seguridad
- ✅ Usuario solo ve datos de su sucursal (excepto admin)
- ✅ Validación de acceso antes de operaciones críticas
- ✅ Validación de existencia de sucursal antes de crear registros
- ✅ Corrección automática de datos sin branch_id

### Manejo de Errores
- ✅ Si no hay sucursal, crea una por defecto
- ✅ Si falta branch_id, lo asigna automáticamente
- ✅ Si la sucursal no existe, muestra error claro
- ✅ Logs de advertencias para debugging

## 📝 Checklist de Configuración

### Antes de Usar el Sistema
- [ ] Crear al menos una sucursal
- [ ] Activar la(s) sucursal(es)
- [ ] Asignar empleados a sucursales
- [ ] Ejecutar "Validar Sistema Multisucursal"
- [ ] Verificar que no haya problemas

### Después de Crear Datos
- [ ] Verificar que todos los registros tengan branch_id
- [ ] Revisar que los datos se filtren correctamente
- [ ] Probar cambio de sucursal (admin)
- [ ] Verificar sincronización con Google Sheets

### Mantenimiento Periódico
- [ ] Ejecutar validación mensualmente
- [ ] Revisar datos sin sucursal
- [ ] Verificar que las sincronizaciones incluyan branch_id
- [ ] Revisar logs de errores relacionados con sucursales

## 🚨 Problemas Comunes y Soluciones

### Problema: "No hay sucursales registradas"
**Solución**: 
1. Ve a Configuración → Catálogos → Gestionar Sucursales
2. Crea al menos una sucursal
3. Actívala

### Problema: "Datos sin sucursal"
**Solución**:
1. Ejecuta "Validar Sistema Multisucursal"
2. Los datos se corrigen automáticamente
3. Se asigna la sucursal actual a los datos sin branch_id

### Problema: "Usuario no puede ver datos"
**Solución**:
1. Verifica que el empleado tenga sucursal asignada
2. O asigna permisos de administrador
3. Verifica que la sucursal esté activa

### Problema: "Datos mezclados entre sucursales"
**Solución**:
1. Ejecuta "Validar Sistema Multisucursal"
2. Revisa el reporte de datos sin sucursal
3. Los datos se corrigen automáticamente

## 📈 Métricas por Sucursal

### Dashboard Individual
- Ventas del día
- Pasajeros del día
- Utilidad diaria
- Top vendedores
- Top productos

### Dashboard Consolidado (Admin)
- Desglose por sucursal
- Comparativas
- Totales consolidados
- Métricas por sucursal

## 🔄 Sincronización

### Google Sheets
- **Hojas Separadas**: Cada sucursal tiene sus propias hojas
- **Formato**: `SALES_BRANCH_branchId`, `INVENTORY_BRANCH_branchId`, etc.
- **Incluye branch_id**: Todos los registros incluyen branch_id en la columna

### Sincronización Automática
- ✅ Incluye branch_id en todos los registros
- ✅ Agrupa por sucursal en Google Sheets
- ✅ No mezcla datos entre sucursales

## ✅ Estado Final

El sistema está **completamente configurado** para multisucursal con:
- ✅ Validaciones automáticas
- ✅ Correcciones automáticas
- ✅ Filtrado automático
- ✅ Asignación automática de branch_id
- ✅ Herramientas de validación manual
- ✅ Protecciones contra errores
- ✅ Sincronización separada por sucursal

**Solo falta**: Crear las sucursales y asignar empleados. El resto funciona automáticamente.

