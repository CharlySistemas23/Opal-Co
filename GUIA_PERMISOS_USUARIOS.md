# Guía: Cómo Ver y Gestionar Permisos de Usuarios

## 📍 Dónde Ver los Permisos

### **Opción 1: Desde Configuración (Recomendado)**

1. **Inicia sesión como Administrador**
   - Solo los administradores pueden gestionar permisos

2. **Ve a: Configuración → Seguridad → Gestionar Permisos**
   - O busca el botón "Gestionar Permisos" en la sección de "Permisos y Roles"

3. **Verás una tabla con:**
   - **Usuario**: Nombre de usuario y empleado asociado
   - **Rol**: admin, manager, seller, cashier
   - **Permisos**: Cantidad de permisos o "Acceso Total" para admins
   - **Acciones**: Botón "Editar" para personalizar permisos

---

## 🔍 Cómo Interpretar los Permisos

### **Tipos de Asignación de Permisos**

#### **1. Administrador (admin)**
```
Permisos: Acceso Total
Razón: Los administradores tienen acceso completo al sistema
No necesita configuración: Siempre tiene todos los permisos
```

#### **2. Otros Roles (manager, seller, cashier)**
```
Permisos: [Lista de permisos específicos]
Razón: Se asignan automáticamente según el perfil predefinido del rol
Personalizable: Puedes agregar o quitar permisos individuales
```

---

## 📋 Perfiles Predefinidos por Rol

### **GERENTE (manager)**
**Permisos incluidos:**
- ✅ **OPERACIONES**: Ver POS, crear/editar ventas, aplicar descuentos, ver caja, abrir/cerrar sesión
- ✅ **INVENTARIO**: Ver, agregar, editar, actualizar stock, ver/editar costos, transferencias
- ✅ **CLIENTES Y SERVICIOS**: Todos los permisos (ver, agregar, editar, eliminar)
- ✅ **ADMINISTRACIÓN**: Ver empleados, ver usuarios, **ver sucursales** (`branches.view`)
- ✅ **REPORTES**: Todos los permisos (ver, generar, exportar, ver utilidades, ver costos)
- ✅ **CONFIGURACIÓN**: Ver, editar general, gestionar catálogos, ver auditoría, sincronizar

**Restricciones:**
- ❌ No puede eliminar items de inventario
- ❌ No puede gestionar permisos de otros usuarios
- ❌ No puede acceder a QA/Autopruebas
- ❌ No puede eliminar empleados/usuarios
- ❌ **No puede gestionar sucursales** (crear, editar, eliminar, asignar empleados) - Solo puede verlas
- ❌ **No puede ver todas las sucursales** en dashboard - Solo ve su sucursal asignada

---

### **VENDEDOR (seller)**
**Permisos incluidos:**
- ✅ **OPERACIONES**: Ver POS, crear ventas, aplicar descuentos (limitados)
- ✅ **INVENTARIO**: Solo ver inventario y stock
- ✅ **CLIENTES Y SERVICIOS**: Ver clientes, agregar clientes, ver reparaciones
- ✅ **REPORTES**: Ver reportes básicos, ver dashboard (solo de su sucursal)

**Restricciones:**
- ❌ No puede cancelar ventas
- ❌ No puede editar costos
- ❌ No puede ver utilidades
- ❌ No puede acceder a administración
- ❌ No puede acceder a configuración
- ❌ No puede ver costos
- ❌ **No puede ver ni gestionar sucursales** - Solo trabaja con su sucursal asignada
- ❌ **No puede ver todas las sucursales** - Solo ve datos de su sucursal

---

### **CAJERO (cashier)**
**Permisos incluidos:**
- ✅ **OPERACIONES**: Ver POS, crear ventas, ver caja
- ✅ **INVENTARIO**: Solo ver inventario
- ✅ **CLIENTES Y SERVICIOS**: Ver clientes, agregar clientes
- ✅ **REPORTES**: Ver reportes de caja, ver dashboard (solo de su sucursal)

**Restricciones:**
- ❌ No puede aplicar descuentos
- ❌ No puede cancelar ventas
- ❌ No puede editar items
- ❌ No puede ver costos
- ❌ No puede acceder a administración
- ❌ No puede acceder a configuración
- ❌ **No puede ver ni gestionar sucursales** - Solo trabaja con su sucursal asignada
- ❌ **No puede ver todas las sucursales** - Solo ve datos de su sucursal

---

## 🎨 Cómo Ver los Permisos Detallados de un Usuario

### **Paso 1: Abrir la Gestión de Permisos**
1. Ve a **Configuración → Seguridad → Gestionar Permisos**
2. Verás la lista de todos los usuarios

### **Paso 2: Editar Permisos de un Usuario**
1. Haz clic en el botón **"Editar"** junto al usuario
2. Se abrirá un modal con todas las categorías de permisos

### **Paso 3: Ver Permisos por Categoría**
El modal muestra 6 categorías:

#### **📊 OPERACIONES**
- Ver POS
- Crear Ventas
- Editar Ventas
- Cancelar Ventas
- Aplicar Descuentos
- Ver Caja
- Abrir/Cerrar Sesión
- Generar/Imprimir Códigos de Barras

#### **📦 INVENTARIO**
- Ver Inventario
- Agregar Items
- Editar Items
- Eliminar Items
- Actualizar Stock
- Ver Costos
- Editar Costos
- Transferencias

#### **👥 CLIENTES Y SERVICIOS**
- Ver/Agregar/Editar/Eliminar Clientes
- Ver/Crear/Editar/Completar Reparaciones
- Ver/Registrar/Editar Llegadas

#### **👔 ADMINISTRACIÓN**
- Ver/Agregar/Editar/Eliminar Empleados
- Ver/Crear/Editar Usuarios
- Restablecer PINs
- **Ver Sucursales** (`branches.view`) - Ver lista de sucursales y sus datos
- **Gestionar Sucursales** (`branches.manage`) - Crear, editar, eliminar sucursales y asignar empleados

#### **📈 REPORTES Y ANÁLISIS**
- Ver/Generar/Exportar Reportes
- Ver Utilidades
- Ver Costos en Reportes
- Ver Análisis Avanzados
- Ver Dashboard
- **Ver Todas las Sucursales** (`dashboard.view_all_branches`) - Ver datos consolidados de todas las sucursales en dashboard y reportes

#### **⚙️ CONFIGURACIÓN**
- Ver Configuración
- Editar Configuración General/Financiera
- Gestionar Catálogos
- Gestionar Permisos
- Ver Auditoría
- Sincronizar Datos
- Acceso a QA/Autopruebas

---

## 🏢 Permisos del Módulo Multisucursal

### **Permisos Disponibles:**

#### **1. Ver Sucursales** (`branches.view`)
**¿Qué permite?**
- Ver la lista de todas las sucursales
- Ver información de cada sucursal (nombre, dirección, teléfono)
- Ver empleados asignados a cada sucursal
- Ver estadísticas básicas de cada sucursal

**¿Quién lo tiene por defecto?**
- ✅ **Administrador**: Acceso total (incluye este permiso)
- ✅ **Gerente**: Tiene este permiso
- ❌ **Vendedor**: No tiene este permiso
- ❌ **Cajero**: No tiene este permiso

**Acciones que requieren este permiso:**
- Acceder a **Configuración → Catálogos → Gestionar Sucursales**
- Ver la lista de sucursales
- Ver detalles de una sucursal

---

#### **2. Gestionar Sucursales** (`branches.manage`)
**¿Qué permite?**
- Crear nuevas sucursales
- Editar información de sucursales existentes
- Eliminar sucursales
- **Asignar empleados a sucursales** (acción importante)
- Cambiar asignación de empleados entre sucursales
- Activar/desactivar sucursales

**¿Quién lo tiene por defecto?**
- ✅ **Administrador**: Acceso total (incluye este permiso)
- ❌ **Gerente**: NO tiene este permiso (solo puede ver)
- ❌ **Vendedor**: No tiene este permiso
- ❌ **Cajero**: No tiene este permiso

**Acciones que requieren este permiso:**
- Crear nueva sucursal
- Editar sucursal existente
- Eliminar sucursal
- **Asignar empleados a sucursales** (botón "Asignar Empleados")
- Cambiar empleado de una sucursal a otra

**⚠️ IMPORTANTE:**
- Si un usuario NO tiene `branches.manage`, **NO puede asignar empleados a sucursales**
- Esta es una acción crítica para configurar el sistema multisucursal
- Solo los administradores pueden realizar esta acción por defecto

---

#### **3. Ver Todas las Sucursales** (`dashboard.view_all_branches`)
**¿Qué permite?**
- Ver datos consolidados de todas las sucursales en el dashboard
- Ver reportes consolidados de todas las sucursales
- Cambiar entre sucursales usando el selector en el topbar (solo admins)
- Ver comparativas entre sucursales

**¿Quién lo tiene por defecto?**
- ✅ **Administrador**: Acceso total (incluye este permiso)
- ❌ **Gerente**: NO tiene este permiso (solo ve su sucursal)
- ❌ **Vendedor**: No tiene este permiso (solo ve su sucursal)
- ❌ **Cajero**: No tiene este permiso (solo ve su sucursal)

**Acciones que requieren este permiso:**
- Ver selector de sucursal en el topbar
- Cambiar de sucursal en el dashboard
- Ver reportes consolidados de todas las sucursales
- Ver comparativas entre sucursales

**⚠️ IMPORTANTE:**
- Sin este permiso, los usuarios solo ven datos de su propia sucursal asignada
- El selector de sucursal en el topbar solo aparece para usuarios con este permiso

---

### **Resumen de Permisos por Rol en Multisucursal:**

| Rol | Ver Sucursales | Gestionar Sucursales | Ver Todas las Sucursales |
|-----|----------------|----------------------|--------------------------|
| **Administrador** | ✅ | ✅ | ✅ |
| **Gerente** | ✅ | ❌ | ❌ |
| **Vendedor** | ❌ | ❌ | ❌ |
| **Cajero** | ❌ | ❌ | ❌ |

---

### **Ejemplo Práctico: Asignar Empleados a Sucursales**

**Escenario:** Un gerente intenta asignar un empleado a una sucursal

1. **Gerente accede a:** Configuración → Catálogos → Gestionar Sucursales
   - ✅ Puede ver la lista de sucursales (tiene `branches.view`)

2. **Gerente hace clic en "Asignar Empleados"**
   - ❌ **NO puede realizar esta acción** (no tiene `branches.manage`)
   - El botón puede estar oculto o deshabilitado
   - Si intenta hacerlo, verá un mensaje: "No tienes permiso para gestionar sucursales"

3. **Solución:**
   - Un administrador debe asignar los empleados
   - O el administrador puede otorgar el permiso `branches.manage` al gerente desde "Gestionar Permisos"

---

### **Cómo Otorgar Permisos Multisucursal a un Usuario**

1. Ve a **Configuración → Seguridad → Gestionar Permisos**
2. Haz clic en **"Editar"** junto al usuario
3. En la sección **"ADMINISTRACIÓN"**, marca:
   - ☑ **Ver Sucursales** (para ver la lista)
   - ☑ **Gestionar Sucursales** (para crear, editar, eliminar y asignar empleados)
4. En la sección **"REPORTES Y ANÁLISIS"**, marca:
   - ☑ **Ver Todas las Sucursales** (para ver datos consolidados)
5. Haz clic en **"Guardar"**

---

## 🔄 Cómo Funciona la Asignación Automática

### **Al Crear un Usuario Nuevo**

1. **El sistema asigna permisos automáticamente según el rol:**
   ```javascript
   - Si es 'admin' → Permisos: ['all'] (acceso total)
   - Si es 'manager' → Permisos: [lista completa de permisos de gerente]
   - Si es 'seller' → Permisos: [lista de permisos de vendedor]
   - Si es 'cashier' → Permisos: [lista de permisos de cajero]
   ```

2. **Esto sucede en:**
   - `js/employees.js` → Función `createUserForEmployee()`
   - `js/users.js` → Función `login()` → `ensureUserPermissions()`

### **Al Hacer Login**

1. **El sistema verifica si el usuario tiene permisos:**
   - Si NO tiene permisos definidos → Asigna según su rol
   - Si YA tiene permisos → Los mantiene (personalizados)

2. **Esto permite:**
   - Usuarios antiguos sin permisos → Se asignan automáticamente
   - Usuarios con permisos personalizados → Se mantienen

---

## ✏️ Cómo Personalizar Permisos

### **Paso 1: Editar Permisos**
1. Ve a **Configuración → Seguridad → Gestionar Permisos**
2. Haz clic en **"Editar"** junto al usuario

### **Paso 2: Modificar Permisos**
1. En el modal, verás checkboxes para cada permiso
2. Marca/desmarca los permisos que quieras
3. Los permisos están organizados por categorías

### **Paso 3: Guardar**
1. Haz clic en **"Guardar"**
2. Los cambios se aplican inmediatamente
3. Si el usuario está logueado, verá los cambios al recargar

### **Paso 4: Restablecer a Perfil de Rol**
1. Si quieres volver al perfil predefinido del rol
2. Haz clic en **"Restablecer a Perfil de Rol"**
3. Se eliminarán todos los permisos personalizados
4. Se asignarán los permisos predefinidos del rol

---

## 🔍 Cómo Verificar los Permisos en el Código

### **Desde la Consola del Navegador (F12)**

```javascript
// Ver permisos del usuario actual
console.log('Usuario actual:', UserManager.currentUser);
console.log('Permisos:', UserManager.currentUser?.permissions);

// Verificar un permiso específico
PermissionManager.hasPermission('pos.create_sale'); // true/false

// Ver todos los permisos disponibles
PermissionManager.getAllPermissions();

// Ver permisos predefinidos de un rol
PermissionManager.getRolePermissions('manager');
```

---

## 📊 Ejemplo Práctico: Ver Permisos de un Usuario

### **Escenario: Verificar permisos de "Juan Pérez" (Gerente)**

1. **Desde la Interfaz:**
   - Configuración → Seguridad → Gestionar Permisos
   - Buscar "Juan Pérez" en la tabla
   - Ver: Rol = "manager", Permisos = "X permiso(s)"
   - Clic en "Editar" para ver detalle

2. **Desde el Código (si eres desarrollador):**
   ```javascript
   const user = await DB.get('users', 'user_id_de_juan');
   console.log('Permisos de Juan:', user.permissions);
   ```

3. **Verificar en Tiempo Real:**
   - Si Juan está logueado, puedes verificar:
   ```javascript
   PermissionManager.hasPermission('inventory.delete'); // false (gerente no puede eliminar)
   PermissionManager.hasPermission('reports.view_profits'); // true (gerente puede ver utilidades)
   ```

---

## ⚠️ Notas Importantes

### **1. Administradores Siempre Tienen Acceso Total**
- No importa qué permisos tenga configurados
- El sistema siempre verifica: `if (role === 'admin') return true;`

### **2. Permisos Personalizados Sobrescriben el Perfil**
- Si personalizas permisos, se guardan en `user.permissions`
- El perfil predefinido del rol ya no se aplica
- Para volver al perfil: Usa "Restablecer a Perfil de Rol"

### **3. Los Permisos se Verifican en Múltiples Capas**
- **Al cargar módulos**: Verifica si puede ver el módulo
- **Al mostrar botones**: Oculta botones sin permiso
- **Al ejecutar acciones**: Verifica antes de ejecutar

### **4. Cambios Requieren Recarga**
- Si cambias permisos de un usuario logueado
- El usuario debe recargar la página para ver los cambios
- El sistema muestra una notificación informando esto

---

## 🎯 Resumen Rápido

| Acción | Dónde |
|--------|-------|
| **Ver lista de usuarios y permisos** | Configuración → Seguridad → Gestionar Permisos |
| **Ver permisos detallados** | Clic en "Editar" junto al usuario |
| **Personalizar permisos** | Marcar/desmarcar checkboxes en el modal de edición |
| **Restablecer a perfil de rol** | Botón "Restablecer a Perfil de Rol" en el modal |
| **Ver permisos en código** | `UserManager.currentUser?.permissions` |
| **Verificar permiso específico** | `PermissionManager.hasPermission('permiso')` |

### **Permisos Multisucursal - Resumen:**

| Permiso | Código | Permite | Tiene por defecto |
|---------|--------|---------|-------------------|
| **Ver Sucursales** | `branches.view` | Ver lista de sucursales | Admin, Gerente |
| **Gestionar Sucursales** | `branches.manage` | Crear, editar, eliminar, **asignar empleados** | Solo Admin |
| **Ver Todas las Sucursales** | `dashboard.view_all_branches` | Ver datos consolidados, selector de sucursal | Solo Admin |

---

## ❓ Preguntas Frecuentes

**P: ¿Por qué un usuario tiene ciertos permisos?**
R: Se asignan automáticamente según su rol. Puedes personalizarlos desde "Gestionar Permisos".

**P: ¿Puedo crear un rol personalizado?**
R: No directamente, pero puedes personalizar los permisos de cada usuario individualmente.

**P: ¿Los cambios de permisos afectan inmediatamente?**
R: Sí, pero el usuario debe recargar la página para ver los cambios en la UI.

**P: ¿Qué pasa si elimino todos los permisos de un usuario?**
R: El usuario no podrá acceder a ningún módulo. Se recomienda mantener al menos los permisos básicos de su rol.

**P: ¿Cómo sé qué permisos necesita un usuario?**
R: Revisa los perfiles predefinidos en este documento o consulta `PROPUESTA_SISTEMA_PERMISOS.md`.

**P: ¿Por qué un gerente no puede asignar empleados a sucursales?**
R: Por defecto, los gerentes solo tienen el permiso `branches.view` (ver sucursales), pero NO tienen `branches.manage` (gestionar sucursales). Para asignar empleados, se necesita el permiso `branches.manage`. Un administrador puede otorgar este permiso desde "Gestionar Permisos".

**P: ¿Por qué no veo el selector de sucursal en el topbar?**
R: El selector de sucursal solo aparece para usuarios con el permiso `dashboard.view_all_branches`. Por defecto, solo los administradores tienen este permiso. Si eres gerente o vendedor, solo verás datos de tu sucursal asignada.

**P: ¿Puedo darle a un vendedor permiso para ver todas las sucursales?**
R: Sí, puedes otorgar el permiso `dashboard.view_all_branches` desde "Gestionar Permisos", pero no es recomendable ya que los vendedores normalmente solo necesitan ver datos de su propia sucursal.

**P: ¿Qué permiso necesito para asignar empleados a sucursales?**
R: Necesitas el permiso `branches.manage` (Gestionar Sucursales). Este permiso permite crear, editar, eliminar sucursales y asignar empleados. Por defecto, solo los administradores lo tienen.

---

**¿Necesitas ayuda con algo específico? Revisa la documentación o contacta al administrador del sistema.**

