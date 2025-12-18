# Instrucciones de Despliegue - Opal & Co POS

## 📋 Pasos para Desplegar

### 1. Configurar Google Apps Script

1. **Abre Google Apps Script**:
   - Ve a [script.google.com](https://script.google.com/)
   - Inicia sesión con tu cuenta de Google

2. **Crea un nuevo proyecto**:
   - Haz clic en **"Nuevo proyecto"**
   - Dale un nombre (ej: "Opal POS Sync")

3. **Copia el código**:
   - Abre el archivo `google_apps_script.js` de este proyecto
   - Copia **TODO** el contenido (Ctrl+A, Ctrl+C)

4. **Pega en Apps Script**:
   - Pega el código en el editor de Apps Script
   - Guarda (Ctrl+S o Cmd+S)

5. **Genera un TOKEN seguro**:
   - En la consola de Apps Script (ver → Ejecutar), ejecuta:
     ```javascript
     Utilities.getUuid()
     ```
   - Copia el token generado (ej: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`)
   - **IMPORTANTE**: Actualiza `CONFIG.TOKEN` en la línea 21 del código con este token

6. **Despliega la aplicación web**:
   - Ve a **"Implementar" → "Nueva implementación"**
   - Tipo: **"Aplicación web"**
   - Descripción: "Sincronización POS"
   - Ejecutar como: **"Yo"**
   - Quién tiene acceso: **"Cualquiera"**
   - Haz clic en **"Implementar"**

7. **Copia la URL**:
   - Se generará una URL (ej: `https://script.google.com/macros/s/AKfycby.../exec`)
   - **Copia esta URL completa** - la necesitarás en el paso 3

### 2. Subir a GitHub

1. **Inicializa Git** (si no lo has hecho):
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Sistema POS Multisucursal"
   ```

2. **Crea un repositorio en GitHub**:
   - Ve a [github.com](https://github.com)
   - Crea un nuevo repositorio (público o privado)
   - **NO** inicialices con README, .gitignore o licencia

3. **Conecta y sube**:
   ```bash
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/TU_REPOSITORIO.git
   git push -u origin main
   ```

### 3. Desplegar en Vercel

#### Opción A: Desde la Web (Recomendado)

1. **Ve a Vercel**:
   - Abre [vercel.com](https://vercel.com)
   - Inicia sesión con GitHub

2. **Importa proyecto**:
   - Haz clic en **"Add New Project"** o **"Import Project"**
   - Selecciona tu repositorio de GitHub
   - Vercel detectará automáticamente la configuración

3. **Configuración**:
   - Framework Preset: **"Other"** (o déjalo en auto)
   - Root Directory: **"."** (raíz)
   - Build Command: **dejar vacío**
   - Output Directory: **"."**
   - Install Command: **dejar vacío**

4. **Despliega**:
   - Haz clic en **"Deploy"**
   - Espera a que termine (1-2 minutos)
   - Obtendrás una URL (ej: `tu-proyecto.vercel.app`)

#### Opción B: Desde CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# En la carpeta del proyecto
vercel

# Seguir las instrucciones
# Para producción:
vercel --prod
```

### 4. Configurar el Sistema

1. **Abre tu aplicación desplegada**:
   - Ve a la URL de Vercel (ej: `tu-proyecto.vercel.app`)

2. **Configura sincronización**:
   - Ve a **Configuración → Sincronización**
   - **URL de sincronización**: Pega la URL de Google Apps Script (del paso 1.7)
   - **Token**: Pega el token que generaste (del paso 1.5)
   - Haz clic en **"Guardar"**

3. **Prueba la conexión**:
   - Haz clic en **"Probar Conexión"**
   - Debe mostrar "Conexión exitosa"

### 5. Configurar Sucursales

1. **Crea sucursales**:
   - Ve a **Configuración → Catálogos → Gestionar Sucursales**
   - Haz clic en **"Agregar Sucursal"**
   - Completa los datos y guarda

2. **Valida el sistema**:
   - En la misma sección, haz clic en **"Validar Sistema Multisucursal"**
   - Revisa el reporte y corrige cualquier problema

3. **Asigna empleados** (opcional):
   - En "Gestionar Sucursales", haz clic en **"Asignar Empleados"**
   - Asigna empleados a cada sucursal

## ✅ Verificación Final

### Verificar Google Sheets

1. **Abre Google Drive**
2. Busca el archivo **"Opal & Co - Sincronización POS"**
3. Deberías ver:
   - Hoja "📊 ÍNDICE"
   - Hojas por sucursal (ej: `SALES_BRANCH_branch1`)
   - Todas las hojas configuradas

### Verificar Sincronización

1. **Crea una venta de prueba** en el sistema
2. Ve a **Sincronización → Sincronizar Ahora**
3. Verifica en Google Sheets que la venta aparezca

## 🔧 Solución de Problemas

### Error: "Token inválido"
- Verifica que el token en `google_apps_script.js` coincida con el del sistema
- Regenera el token si es necesario

### Error: "No se puede conectar"
- Verifica que la URL de Google Apps Script sea correcta
- Verifica que la aplicación web esté desplegada
- Verifica que "Quién tiene acceso" sea "Cualquiera"

### No aparecen datos en Google Sheets
- Verifica los logs en Google Apps Script (Ver → Ejecuciones)
- Verifica que el spreadsheet se haya creado
- Revisa la consola del navegador para errores

### Problemas con Vercel
- Verifica que `vercel.json` esté en la raíz
- Verifica que todos los archivos estén en GitHub
- Revisa los logs de despliegue en Vercel

## 📝 Notas Importantes

- **Token**: Mantén el token seguro y no lo compartas
- **URL de Apps Script**: Guárdala en un lugar seguro
- **Backups**: El sistema hace backups automáticos cada 10 minutos
- **Sincronización**: Se sincroniza automáticamente cada 5 minutos

## 🎉 ¡Listo!

Tu sistema está desplegado y funcionando. Ahora puedes:
- Usar el sistema desde cualquier dispositivo
- Los datos se sincronizan automáticamente
- Puedes acceder a los datos desde Google Sheets

---

**¿Necesitas ayuda?** Revisa la documentación en `README.md` o los archivos de guía en el proyecto.

