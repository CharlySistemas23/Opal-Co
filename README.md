# Opal & Co - Sistema POS Multisucursal

Sistema de punto de venta (POS) completo con soporte multisucursal, gestión de inventario, reportes de utilidad, y sincronización con Google Sheets.

## 🚀 Características Principales

- ✅ **Multisucursal**: Gestión completa de múltiples sucursales con separación de datos
- ✅ **POS Avanzado**: Venta de productos con escaneo de códigos de barras
- ✅ **Inventario**: Gestión completa de inventario con transferencias entre sucursales
- ✅ **Reportes de Utilidad**: Cálculo automático de utilidad diaria (bruta y neta)
- ✅ **Llegadas de Pasajeros**: Registro de llegadas por agencia con cálculo automático de tarifas
- ✅ **Sincronización**: Sincronización automática con Google Sheets
- ✅ **Dashboard**: Vista consolidada de métricas por sucursal
- ✅ **Validación Automática**: Validación y corrección automática de datos multisucursal

## 📋 Requisitos Previos

- Navegador moderno (Chrome, Firefox, Edge, Safari)
- Cuenta de Google (para Google Sheets)
- Acceso a Google Apps Script

## 🔧 Instalación y Configuración

### 1. Clonar o Descargar el Repositorio

```bash
git clone <tu-repositorio>
cd "Sistema HTML"
```

### 2. Configurar Google Apps Script

1. Abre [Google Apps Script](https://script.google.com/)
2. Crea un nuevo proyecto
3. Copia el contenido completo de `google_apps_script.js`
4. Pega el código en el editor
5. Guarda el proyecto (Ctrl+S o Cmd+S)
6. Ve a **Implementar → Nueva implementación**
7. Tipo: **Aplicación web**
8. Ejecutar como: **Yo**
9. Quién tiene acceso: **Cualquiera**
10. Haz clic en **Implementar**
11. **Copia la URL de la aplicación web** (la necesitarás después)
12. **Genera un TOKEN seguro**:
    - En la consola de Apps Script, ejecuta: `Utilities.getUuid()`
    - Copia el token generado
    - Actualiza `CONFIG.TOKEN` en `google_apps_script.js` con este token

### 3. Configurar el Sistema

1. Abre `index.html` en tu navegador
2. Ve a **Configuración → Sincronización**
3. Ingresa:
   - **URL de sincronización**: La URL que copiaste del paso anterior
   - **Token**: El token que generaste
4. Guarda la configuración

### 4. Configurar Sucursales

1. Ve a **Configuración → Catálogos → Gestionar Sucursales**
2. Crea al menos una sucursal
3. Actívala
4. Asigna empleados a las sucursales
5. Ejecuta **"Validar Sistema Multisucursal"** para verificar la configuración

## 🌐 Despliegue en Vercel

### Opción 1: Desde GitHub (Recomendado)

1. **Sube tu código a GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin <tu-repositorio-github>
   git push -u origin main
   ```

2. **Conecta con Vercel**:
   - Ve a [Vercel](https://vercel.com/)
   - Inicia sesión con GitHub
   - Haz clic en **"New Project"**
   - Selecciona tu repositorio
   - Vercel detectará automáticamente la configuración
   - Haz clic en **"Deploy"**

3. **Configuración automática**:
   - Vercel usará `vercel.json` para la configuración
   - El proyecto se desplegará automáticamente

### Opción 2: Desde CLI de Vercel

```bash
# Instalar Vercel CLI
npm i -g vercel

# Desplegar
vercel

# Para producción
vercel --prod
```

## 📁 Estructura del Proyecto

```
Sistema HTML/
├── index.html              # Página principal
├── css/
│   └── styles.css          # Estilos principales
├── js/
│   ├── app.js              # Punto de entrada
│   ├── db.js               # Gestión de IndexedDB
│   ├── branch_manager.js   # Gestión multisucursal
│   ├── branch_validator.js # Validaciones multisucursal
│   ├── pos.js              # Módulo POS
│   ├── inventory.js        # Gestión de inventario
│   ├── dashboard.js        # Dashboard principal
│   ├── profit.js           # Cálculo de utilidad
│   ├── transfers.js        # Transferencias entre sucursales
│   └── ...                 # Otros módulos
├── google_apps_script.js   # Script para Google Sheets
├── vercel.json             # Configuración de Vercel
└── README.md               # Este archivo
```

## 🔐 Configuración de Seguridad

### Token de Sincronización

El token en `google_apps_script.js` debe ser único y seguro. Para generar uno nuevo:

```javascript
// En la consola de Google Apps Script
Utilities.getUuid()
```

### Variables de Entorno (Opcional)

Si usas variables de entorno en Vercel:

- `SYNC_URL`: URL de Google Apps Script
- `SYNC_TOKEN`: Token de sincronización

## 📊 Google Sheets

El sistema crea automáticamente hojas separadas por sucursal:

- `SALES_BRANCH_branchId` - Ventas por sucursal
- `INVENTORY_BRANCH_branchId` - Inventario por sucursal
- `AGENCY_ARRIVALS_BRANCH_branchId` - Llegadas por sucursal
- Y más...

## 🛠️ Desarrollo

### Ejecutar Localmente

Simplemente abre `index.html` en tu navegador. No requiere servidor.

### Estructura de Datos

Los datos se almacenan localmente en IndexedDB y se sincronizan con Google Sheets.

## 📝 Documentación Adicional

- `GUIA_SUCURSALES.md` - Guía de gestión de sucursales
- `CONFIGURACION_MULTISUCURSAL_COMPLETA.md` - Configuración completa
- `CHECKLIST_MULTISUCURSAL.md` - Checklist de verificación
- `METRICAS_Y_GANANCIAS.md` - Explicación de métricas y ganancias
- `FLUJO_SISTEMA.md` - Flujo del sistema

## 🐛 Solución de Problemas

### El sistema no sincroniza

1. Verifica que la URL de Google Apps Script sea correcta
2. Verifica que el token coincida en ambos lugares
3. Revisa la consola del navegador para errores
4. Verifica los logs en Google Apps Script

### No se ven datos en Google Sheets

1. Verifica que el script esté desplegado correctamente
2. Revisa los permisos de la aplicación web
3. Verifica que el spreadsheet se haya creado

### Problemas con multisucursal

1. Ejecuta "Validar Sistema Multisucursal" en Configuración
2. Verifica que exista al menos una sucursal activa
3. Verifica que los empleados tengan sucursal asignada

## 📄 Licencia

Este proyecto es privado y de uso interno.

## 👥 Soporte

Para soporte, contacta al equipo de desarrollo.

---

**Versión**: 2.0.0  
**Última actualización**: 2024
