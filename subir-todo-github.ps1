# Script PowerShell para subir todos los archivos esenciales a GitHub
# Ejecutar: .\subir-todo-github.ps1

Write-Host "🚀 Subiendo Sistema POS a GitHub..." -ForegroundColor Cyan

# Asegurar que estamos en la raíz del proyecto
Set-Location $PSScriptRoot

# Verificar que git está inicializado
if (-not (Test-Path .git)) {
    Write-Host "❌ Git no está inicializado. Ejecuta primero: git init" -ForegroundColor Red
    exit 1
}

# Agregar archivos esenciales
Write-Host "📦 Agregando archivos esenciales..." -ForegroundColor Yellow

# Archivos raíz
git add index.html
git add vercel.json
git add .gitignore
git add google_apps_script.js
git add README.md
git add DEPLOY_INSTRUCTIONS.md

# CSS
git add css/styles.css

# JavaScript (todos los archivos)
Get-ChildItem -Path js -Filter "*.js" | ForEach-Object {
    git add $_.FullName
    Write-Host "  ✓ $($_.Name)" -ForegroundColor Green
}

# Librerías
Get-ChildItem -Path libs -Filter "*.js" | ForEach-Object {
    git add $_.FullName
    Write-Host "  ✓ $($_.Name)" -ForegroundColor Green
}

# Assets (si existe)
if (Test-Path "assets/logo.png") {
    git add assets/logo.png
    Write-Host "  ✓ logo.png" -ForegroundColor Green
}

# Documentación (opcional - solo archivos .md importantes)
$importantDocs = @(
    "README.md",
    "DEPLOY_INSTRUCTIONS.md",
    "CONFIGURACION_MULTISUCURSAL_COMPLETA.md",
    "GUIA_SUCURSALES.md",
    "CHECKLIST_MULTISUCURSAL.md",
    "METRICAS_Y_GANANCIAS.md",
    "FLUJO_SISTEMA.md"
)

foreach ($doc in $importantDocs) {
    if (Test-Path $doc) {
        git add $doc
        Write-Host "  ✓ $doc" -ForegroundColor Green
    }
}

# Commit
Write-Host "💾 Creando commit..." -ForegroundColor Yellow
$commitMessage = @"
Sistema POS Multisucursal - Versión Completa

- Sistema multisucursal completo
- Sincronización con Google Sheets
- Dashboard consolidado
- Transferencias entre sucursales
- Validaciones automáticas
- Listo para producción
"@

git commit -m $commitMessage

# Push
Write-Host "⬆️ Subiendo a GitHub..." -ForegroundColor Yellow
git push origin main

Write-Host ""
Write-Host "✅ ¡Subida completada!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Próximos pasos:" -ForegroundColor Cyan
Write-Host "1. Ve a Vercel y conecta el repositorio"
Write-Host "2. Configura Google Apps Script"
Write-Host "3. Configura la sincronización en el sistema"

