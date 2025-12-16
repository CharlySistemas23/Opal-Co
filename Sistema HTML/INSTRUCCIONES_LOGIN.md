# Instrucciones de Login - Sistema POS Opal & Co

## 🔐 Credenciales de Acceso

### Usuario Administrador
- **Usuario**: `admin`
- **PIN**: `1234`
- **O también puedes usar**: Nombre "Admin" o código "EMP001"

### Usuario Vendedor
- **Usuario**: `vendedor1`
- **PIN**: `1234`
- **O también puedes usar**: Nombre "Vendedor 1" o código "EMP002"

## 📝 Formas de Iniciar Sesión

### Opción 1: Por Username (Más Fácil)
1. Escribe: `admin`
2. Presiona Tab o haz clic en el campo PIN
3. Escribe: `1234`
4. Click en "Iniciar Sesión"

### Opción 2: Por Nombre de Empleado
1. Escribe: `Admin` o `Vendedor 1`
2. Escribe el PIN: `1234`
3. Click en "Iniciar Sesión"

### Opción 3: Por Código de Barras
1. Escanea o escribe: `EMP001` (para admin) o `EMP002` (para vendedor)
2. Escribe el PIN: `1234`
3. Click en "Iniciar Sesión"

## ⚠️ Si No Puedes Iniciar Sesión

### Problema: "Empleado no encontrado"
**Solución**: 
1. Abre la consola del navegador (F12)
2. Verifica que los datos demo se cargaron
3. Intenta escribir exactamente: `admin` (en minúsculas)

### Problema: "Usuario no encontrado"
**Solución**:
1. Limpia el localStorage: En consola ejecuta `localStorage.clear()`
2. Recarga la página (F5)
3. Espera a que se carguen los datos demo
4. Intenta login de nuevo

### Problema: "PIN incorrecto"
**Solución**:
- El PIN es exactamente: `1234` (sin espacios)
- Asegúrate de que el campo PIN esté visible
- Si no aparece, escribe primero el usuario y presiona Tab

## 🔧 Verificar que los Datos Están Cargados

Abre la consola del navegador (F12) y ejecuta:

```javascript
// Verificar usuarios
DB.getAll('users').then(users => console.log('Usuarios:', users));

// Verificar empleados
DB.getAll('employees').then(emps => console.log('Empleados:', emps));
```

Deberías ver al menos 2 usuarios y 2 empleados.

## 🆘 Reset Completo

Si nada funciona:

1. Abre la consola (F12)
2. Ejecuta:
```javascript
indexedDB.deleteDatabase('opal_pos_db');
localStorage.clear();
location.reload();
```

Esto eliminará todos los datos y los recreará desde cero.

## ✅ Login Exitoso

Cuando inicies sesión correctamente verás:
- El Dashboard con KPIs
- Tu nombre en la barra superior
- Acceso a todos los módulos del menú lateral

---

**Nota**: Los datos demo se cargan automáticamente la primera vez que abres el sistema.

