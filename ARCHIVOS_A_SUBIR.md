# 📦 Archivos a Subir a GitHub/Vercel

## ✅ ARCHIVOS ESENCIALES (OBLIGATORIOS)

### Raíz del Proyecto
```
✅ index.html                    # Página principal (OBLIGATORIO)
✅ vercel.json                   # Configuración de Vercel (OBLIGATORIO)
✅ .gitignore                    # Archivos a ignorar (OBLIGATORIO)
✅ google_apps_script.js         # Script para Google Sheets (OBLIGATORIO)
```

### Carpeta `css/`
```
✅ css/styles.css                # Estilos principales (OBLIGATORIO)
```

### Carpeta `js/` (TODOS los archivos)
```
✅ js/app.js                     # Punto de entrada principal
✅ js/db.js                      # Base de datos IndexedDB
✅ js/utils.js                   # Utilidades generales
✅ js/ui.js                      # Interfaz de usuario
✅ js/users.js                   # Gestión de usuarios
✅ js/branch_manager.js          # Gestión multisucursal
✅ js/branch_validator.js       # Validaciones multisucursal
✅ js/pos.js                     # Módulo POS
✅ js/inventory.js               # Gestión de inventario
✅ js/dashboard.js               # Dashboard principal
✅ js/profit.js                  # Cálculo de utilidad
✅ js/cash.js                    # Gestión de caja
✅ js/costs.js                   # Gestión de costos
✅ js/reports.js                 # Reportes
✅ js/settings.js                # Configuración
✅ js/sync.js                    # Sincronización
✅ js/sync_ui.js                 # UI de sincronización
✅ js/employees.js               # Gestión de empleados
✅ js/customers.js               # Gestión de clientes
✅ js/repairs.js                 # Reparaciones
✅ js/tourist_report.js          # Reportes de llegadas
✅ js/arrival_rules.js           # Reglas de llegadas
✅ js/exchange_rates.js          # Tipos de cambio
✅ js/transfers.js               # Transferencias entre sucursales
✅ js/backup.js                  # Backups automáticos
✅ js/barcodes.js                # Códigos de barras
✅ js/barcodes_module.js         # Módulo de códigos de barras
✅ js/printer.js                 # Impresora
✅ js/qa.js                      # Control de calidad
```

### Carpeta `libs/` (Bibliotecas externas)
```
✅ libs/JsBarcode.all.min.js     # Generación de códigos de barras
✅ libs/jspdf.umd.min.js         # Generación de PDFs
✅ libs/xlsx.full.min.js         # Manejo de Excel
```

### Carpeta `assets/` (Opcional pero recomendado)
```
✅ assets/logo.png               # Logo de la empresa (si existe)
```

## 📄 ARCHIVOS DE DOCUMENTACIÓN (Opcionales pero recomendados)

```
📄 README.md                     # Documentación principal
📄 DEPLOY_INSTRUCTIONS.md        # Instrucciones de despliegue
📄 CONFIGURACION_MULTISUCURSAL_COMPLETA.md
📄 GUIA_SUCURSALES.md
📄 CHECKLIST_MULTISUCURSAL.md
📄 METRICAS_Y_GANANCIAS.md
📄 FLUJO_SISTEMA.md
```

## ❌ ARCHIVOS QUE NO DEBES SUBIR

```
❌ *.ps1                          # Scripts de PowerShell (solo para desarrollo local)
❌ *.bat                          # Scripts batch (solo para desarrollo local)
❌ .vercel/                       # Carpeta de Vercel (se crea automáticamente)
❌ .env*.local                    # Variables de entorno locales
❌ *.log                          # Archivos de log
❌ *.tmp, *.temp                  # Archivos temporales
❌ .DS_Store, Thumbs.db           # Archivos del sistema
❌ .vscode/, .idea/               # Configuración de editores
```

## 🚀 RESUMEN RÁPIDO

### Mínimo necesario para funcionar:
1. `index.html`
2. `vercel.json`
3. `.gitignore`
4. `css/styles.css`
5. Todos los archivos en `js/`
6. Todos los archivos en `libs/`
7. `google_apps_script.js`

### Total de archivos esenciales: ~35 archivos

## 📋 Checklist de Subida

- [ ] `index.html`
- [ ] `vercel.json`
- [ ] `.gitignore`
- [ ] `google_apps_script.js`
- [ ] `css/styles.css`
- [ ] Todos los archivos `js/*.js` (28 archivos)
- [ ] Todos los archivos `libs/*.js` (3 archivos)
- [ ] `assets/logo.png` (si existe)
- [ ] `README.md` (recomendado)

## ⚠️ IMPORTANTE

1. **NO subas archivos `.ps1` o `.bat`** - Son solo para desarrollo local
2. **NO subas la carpeta `.vercel`** - Se crea automáticamente
3. **SÍ sube todos los `.js`** - Son esenciales para el funcionamiento
4. **SÍ sube `google_apps_script.js`** - Necesario para sincronización

