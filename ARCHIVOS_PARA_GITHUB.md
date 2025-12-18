# 📦 Archivos para Subir a GitHub (Despliegue Vercel)

Esta guía lista **únicamente los archivos esenciales** que debes subir a GitHub para que el sistema funcione correctamente en Vercel.

## ✅ ARCHIVOS ESENCIALES (DEBEN SUBIRSE)

### 📄 Archivos Raíz
```
✅ index.html              - Página principal del sistema
✅ vercel.json             - Configuración de Vercel (routing, headers)
✅ README.md               - Documentación principal (opcional pero recomendado)
✅ .gitignore              - Archivos a ignorar en Git
```

### 📁 Carpeta `css/`
```
✅ css/styles.css          - Estilos principales del sistema
```

### 📁 Carpeta `js/` (TODOS los archivos)
```
✅ js/app.js
✅ js/arrival_rules.js
✅ js/backup.js
✅ js/barcodes_module.js
✅ js/barcodes.js
✅ js/branch_manager.js
✅ js/branch_validator.js
✅ js/cash.js
✅ js/costs.js
✅ js/customers.js
✅ js/dashboard.js
✅ js/db.js
✅ js/employees.js
✅ js/exchange_rates.js
✅ js/inventory.js
✅ js/permission_manager.js
✅ js/pos.js
✅ js/printer.js
✅ js/profit.js
✅ js/qa.js
✅ js/repairs.js
✅ js/reports.js
✅ js/settings.js
✅ js/sync_ui.js
✅ js/sync.js
✅ js/tourist_report.js
✅ js/transfers.js
✅ js/ui.js
✅ js/users.js
✅ js/utils.js
```

### 📁 Carpeta `assets/`
```
✅ assets/logo.png         - Logo de la empresa
```

### 📁 Carpeta `libs/` (Librerías externas)
```
✅ libs/JsBarcode.all.min.js    - Generación de códigos de barras
✅ libs/jspdf.umd.min.js        - Generación de PDFs
✅ libs/xlsx.full.min.js        - Generación de archivos Excel
```

### 📁 Carpeta `printer/` (Opcional - solo si se usa)
```
✅ printer/install_EC_LINE_58110.bat  - Instalador de impresora (opcional)
✅ printer/test_ticket.txt            - Archivo de prueba (opcional)
```

---

## ❌ ARCHIVOS QUE NO DEBEN SUBIRSE

### 🔧 Scripts de Automatización (NO necesarios en producción)
```
❌ scripts/*.ps1           - Scripts PowerShell (solo para desarrollo local)
❌ scripts/*.sh            - Scripts Shell (solo para desarrollo local)
❌ *.bat                   - Scripts batch (solo para desarrollo local)
```

### 📚 Documentación Técnica (Opcional - no necesaria para funcionamiento)
```
❌ docs/*.md               - Documentación técnica (opcional subir)
   (Puedes subirlos si quieres documentación en GitHub, pero no son necesarios)
```

### ⚙️ Archivos de Configuración Local
```
❌ google_apps_script.js   - Este archivo va a Google Apps Script, NO a GitHub
❌ .vercel/                - Carpeta de configuración local de Vercel
❌ .env*.local             - Variables de entorno locales
❌ organizar-archivos.ps1 - Script temporal de organización
```

### 🗑️ Archivos Temporales y del Sistema
```
❌ *.tmp, *.temp           - Archivos temporales
❌ *.log                   - Archivos de log
❌ .DS_Store               - Archivos del sistema macOS
❌ Thumbs.db               - Archivos del sistema Windows
❌ desktop.ini             - Archivos del sistema Windows
```

---

## 📋 Resumen Rápido

### ✅ SUBIR ESTOS ARCHIVOS/CARPETAS:
1. `index.html`
2. `vercel.json`
3. `README.md` (opcional)
4. `.gitignore`
5. `css/` (carpeta completa)
6. `js/` (carpeta completa - todos los .js)
7. `assets/` (carpeta completa)
8. `libs/` (carpeta completa - solo los .js)
9. `printer/` (opcional)

### ❌ NO SUBIR:
- `scripts/` (carpeta completa)
- `docs/` (carpeta completa - opcional)
- `config/` (si existe)
- `google_apps_script.js` (va a Google Apps Script)
- Cualquier archivo `.ps1`, `.sh`, `.bat`
- Archivos temporales o del sistema

---

## 🚀 Comandos para Subir a GitHub

### Opción 1: Subir Todo (Git detectará .gitignore)
```bash
git add .
git commit -m "Initial commit - Sistema POS"
git push origin main
```

### Opción 2: Subir Solo Archivos Esenciales (Manual)
```bash
# Agregar archivos específicos
git add index.html
git add vercel.json
git add README.md
git add .gitignore
git add css/
git add js/
git add assets/
git add libs/
git add printer/

# Commit y push
git commit -m "Sistema POS - Archivos esenciales"
git push origin main
```

---

## ⚠️ IMPORTANTE

1. **`google_apps_script.js`**: Este archivo NO va a GitHub. Debes copiarlo manualmente a Google Apps Script.

2. **`.gitignore`**: Asegúrate de que tu `.gitignore` incluya:
   ```
   .vercel
   .env*.local
   *.ps1
   *.sh
   *.bat
   *.tmp
   *.log
   ```

3. **Vercel detectará automáticamente**: Una vez conectado con GitHub, Vercel detectará `vercel.json` y configurará el proyecto automáticamente.

4. **Librerías**: Las librerías en `libs/` son necesarias. Asegúrate de subirlas.

---

## ✅ Verificación Final

Antes de hacer push, verifica que tengas:
- ✅ `index.html` en la raíz
- ✅ `vercel.json` en la raíz
- ✅ Carpeta `css/` con `styles.css`
- ✅ Carpeta `js/` con todos los archivos JavaScript
- ✅ Carpeta `assets/` con el logo
- ✅ Carpeta `libs/` con las 3 librerías (.js)
- ✅ `.gitignore` configurado correctamente

---

**¿Listo para subir?** Usa los comandos de la sección "Comandos para Subir a GitHub" arriba.

