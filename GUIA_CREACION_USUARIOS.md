# Guía: Crear Usuarios/Logins para Empleados

## 📋 ¿Cómo Crear Logins para cada Empleado?

Hay **DOS formas** de crear usuarios para que los empleados puedan iniciar sesión:

---

## 🎯 MÉTODO 1: Creación Automática al Crear Empleado (RECOMENDADO)

### Pasos:
1. Ve a **Empleados** → Pestaña **"Empleados"**
2. Haz clic en **"Nuevo Empleado"** (botón verde con +)
3. Completa el formulario:
   - **Nombre Completo**: Ej: "Juan Pérez García"
   - **Rol**: Selecciona el rol (Vendedor, Administrador, Gerente, Cajero)
   - **Sucursal**: Selecciona la sucursal donde trabajará
   - **Código de Barras**: Se genera automáticamente o puedes ingresarlo
   - **Estado**: Activo/Inactivo
4. Haz clic en **"Guardar"**
5. **Aparecerá un mensaje preguntando**: "¿Deseas crear un usuario (login) para este empleado ahora?"
6. Haz clic en **"Confirmar"** (o "Sí")

### ✅ ¿Qué se crea automáticamente?

El sistema genera automáticamente:
- **Username**: Basado en el nombre del empleado (ej: "juanperezgarcia")
- **PIN inicial**: `1234` (debe cambiarse después del primer login)
- **Rol**: El mismo que el empleado
- **Permisos**: Según el rol:
  - **Admin**: Todos los permisos
  - **Otros roles**: Permisos básicos (POS, ver inventario)

### ⚠️ IMPORTANTE:
- El PIN inicial es **1234** para TODOS los usuarios nuevos
- **DEBES cambiar el PIN** después del primer login por seguridad
- El username se genera automáticamente y puede modificarse después

---

## 🎯 MÉTODO 2: Crear Usuario Manualmente

Si ya creaste el empleado y no creaste el usuario, puedes hacerlo manualmente:

### Pasos:
1. Ve a **Empleados** → Pestaña **"Usuarios"**
2. Haz clic en **"Nuevo"** (botón verde con +)
3. Completa el formulario:
   - **Username**: Ej: "juan.perez" (debe ser único)
   - **Empleado**: Selecciona el empleado de la lista
   - **Rol**: Selecciona el rol (debe coincidir con el del empleado)
   - **PIN**: Ingresa un PIN de 4-6 dígitos (ej: "1234")
   - **Permisos**: Marca los permisos necesarios
   - **Estado**: Activo/Inactivo
4. Haz clic en **"Guardar"**

### Ventajas del método manual:
- Puedes personalizar el username
- Puedes establecer un PIN personalizado desde el inicio
- Puedes asignar permisos específicos

---

## 🔐 Información de Login

### ¿Cómo inician sesión los empleados?

#### Opción 1: Username + PIN
- En la pantalla de login, ingresa:
  - **Username**: El username creado
  - **PIN**: El PIN (inicialmente 1234)

#### Opción 2: Nombre del Empleado + PIN
- También pueden ingresar:
  - **Nombre del empleado**: Ej: "Juan Pérez García"
  - **PIN**: El PIN asignado

#### Opción 3: Código de Barras del Empleado
- Si tienen un lector de códigos de barras:
  - Escanean el código de barras del empleado
  - Ingresan el PIN

---

## 📝 Ejemplo Práctico

### Escenario: Crear usuario para "María González"

#### Paso 1: Crear el Empleado
1. Empleados → Nuevo Empleado
2. Nombre: "María González"
3. Rol: "Vendedor"
4. Sucursal: "L Vallarta"
5. Guardar → Confirmar creación de usuario

#### Paso 2: Usuario Creado Automáticamente
- **Username**: `mariagonzalez`
- **PIN**: `1234`
- **Rol**: Vendedor

#### Paso 3: Primera Sesión de María
1. María inicia sesión con:
   - Username: `mariagonzalez`
   - PIN: `1234`
2. **Cambiar PIN**: El sistema le pedirá cambiar el PIN
3. Nuevo PIN: María ingresa su PIN personal (ej: "5678")

#### Paso 4: Sesiones Futuras
- María inicia sesión con:
  - Username: `mariagonzalez`
  - PIN: `5678` (el nuevo PIN que configuró)

---

## 🔄 Cambiar PIN de un Usuario

### Como Administrador:
1. Ve a **Empleados** → Pestaña **"Usuarios"**
2. Busca el usuario en la lista
3. Haz clic en el botón **"Restablecer PIN"** (ícono de llave 🔑)
4. Ingresa el nuevo PIN (4-6 dígitos)
5. El usuario podrá usar el nuevo PIN en el siguiente login

---

## ❓ Preguntas Frecuentes

### ¿Qué pasa si creo un empleado pero no creo su usuario?
- El empleado existe en el sistema pero **NO puede iniciar sesión**
- Puedes crear el usuario después usando el Método 2

### ¿Puedo tener varios usuarios para un mismo empleado?
- **No**, cada empleado solo puede tener **un usuario** asociado

### ¿Qué pasa si olvido el PIN?
- Como administrador, puedes **restablecer el PIN** desde la lista de usuarios
- Haz clic en "Restablecer PIN" y asigna uno nuevo

### ¿Puedo cambiar el username después de crearlo?
- **Sí**, puedes editar el usuario y cambiar el username
- Haz clic en "Editar" (ícono de lápiz) en la lista de usuarios

### ¿Los usuarios tienen que estar en la misma sucursal que el empleado?
- No necesariamente, pero es recomendable
- El sistema filtra automáticamente por la sucursal asignada al empleado
- Si un empleado cambia de sucursal, también cambia su acceso

### ¿Qué permisos tiene cada rol?
- **Administrador**: Acceso completo a todo el sistema
- **Gerente**: Acceso amplio, puede ver reportes y configuraciones
- **Vendedor**: Acceso a POS, inventario básico, ventas
- **Cajero**: Acceso limitado, principalmente a caja

---

## ✅ Lista de Verificación para Nuevo Empleado

- [ ] Empleado creado en el sistema
- [ ] Usuario/login creado (automático o manual)
- [ ] Empleado asignado a una sucursal
- [ ] PIN inicial establecido (1234 por defecto)
- [ ] Usuario probó login y cambió el PIN
- [ ] Usuario puede acceder a los módulos correctos

---

## 🚨 Seguridad

### Recomendaciones:
1. **Cambiar PIN después del primer login**: Es obligatorio
2. **PINs únicos**: Cada empleado debe tener su propio PIN
3. **No compartir PINs**: Cada usuario debe mantener su PIN privado
4. **Usuarios inactivos**: Si un empleado ya no trabaja, desactiva su usuario
5. **Restablecer PIN**: Si sospechas que el PIN fue comprometido, restablécelo

---

## 📊 Ver Usuarios Existentes

Para ver todos los usuarios creados:
1. Ve a **Empleados** → Pestaña **"Usuarios"**
2. Verás una tabla con:
   - Username
   - Empleado asociado
   - Rol
   - Número de permisos
   - Estado (Activo/Inactivo)
   - Acciones (Editar, Restablecer PIN)

---

## 💡 Tips

- **Nombres de usuario simples**: Usa nombres fáciles de recordar
- **PINs seguros**: Evita PINs obvios como "1111", "1234" (después del inicial)
- **Verificar asignación**: Asegúrate de que cada empleado esté asignado a la sucursal correcta
- **Probar login**: Después de crear un usuario, prueba que pueda iniciar sesión

---

## 🎯 Resumen Rápido

1. **Crear empleado** → Sistema pregunta si quieres crear usuario → **Sí** → Usuario creado con PIN 1234
2. **Usuario inicia sesión** con username y PIN 1234
3. **Usuario cambia PIN** en el primer login
4. **Sesiones futuras** con el nuevo PIN personal

¡Listo! Ya puedes crear usuarios para todos tus empleados. 🎉

