# Script para organizar y ordenar los archivos del sistema
# Ejecutar desde la raíz del proyecto

Write-Host "📁 Organizando archivos del sistema..." -ForegroundColor Cyan

$rootPath = $PSScriptRoot
if (-not $rootPath) {
    $rootPath = Get-Location
}

# Crear carpetas si no existen
$folders = @("docs", "scripts", "config")
foreach ($folder in $folders) {
    $folderPath = Join-Path $rootPath $folder
    if (-not (Test-Path $folderPath)) {
        New-Item -ItemType Directory -Path $folderPath -Force | Out-Null
        Write-Host "✅ Creada carpeta: $folder" -ForegroundColor Green
    }
}

# Mover archivos .md a docs/ (excepto README.md)
Write-Host "`n📄 Moviendo documentación..." -ForegroundColor Yellow
Get-ChildItem -Path $rootPath -Filter "*.md" -File | Where-Object { $_.Name -ne "README.md" } | ForEach-Object {
    $dest = Join-Path (Join-Path $rootPath "docs") $_.Name
    Move-Item -Path $_.FullName -Destination $dest -Force
    Write-Host "  ✅ $($_.Name)" -ForegroundColor Gray
}

# Mover scripts PowerShell a scripts/
Write-Host "`n🔧 Moviendo scripts PowerShell..." -ForegroundColor Yellow
Get-ChildItem -Path $rootPath -Filter "*.ps1" -File | ForEach-Object {
    $dest = Join-Path (Join-Path $rootPath "scripts") $_.Name
    Move-Item -Path $_.FullName -Destination $dest -Force
    Write-Host "  ✅ $($_.Name)" -ForegroundColor Gray
}

# Mover script .sh a scripts/
Write-Host "`n🔧 Moviendo scripts Shell..." -ForegroundColor Yellow
Get-ChildItem -Path $rootPath -Filter "*.sh" -File | ForEach-Object {
    $dest = Join-Path (Join-Path $rootPath "scripts") $_.Name
    Move-Item -Path $_.FullName -Destination $dest -Force
    Write-Host "  ✅ $($_.Name)" -ForegroundColor Gray
}

# Mover archivos de configuración a config/
Write-Host "`n⚙️ Moviendo archivos de configuración..." -ForegroundColor Yellow
$configFiles = @("vercel.json", "google_apps_script.js")
foreach ($file in $configFiles) {
    $source = Join-Path $rootPath $file
    if (Test-Path $source) {
        $dest = Join-Path (Join-Path $rootPath "config") $file
        Move-Item -Path $source -Destination $dest -Force
        Write-Host "  ✅ $file" -ForegroundColor Gray
    }
}

# Mover script de libs/ a scripts/
Write-Host "`n🔧 Moviendo scripts de libs/..." -ForegroundColor Yellow
$libsScript = Join-Path $rootPath "libs\descargar_jspdf.ps1"
if (Test-Path $libsScript) {
    $dest = Join-Path (Join-Path $rootPath "scripts") "descargar_jspdf.ps1"
    Move-Item -Path $libsScript -Destination $dest -Force
    Write-Host "  ✅ descargar_jspdf.ps1" -ForegroundColor Gray
}

Write-Host "`n✨ ¡Organización completada!" -ForegroundColor Green
Write-Host "`n📂 Estructura final:" -ForegroundColor Cyan
Write-Host "  📁 docs/          - Documentación (.md)" -ForegroundColor White
Write-Host "  📁 scripts/       - Scripts de automatización (.ps1, .sh)" -ForegroundColor White
Write-Host "  📁 config/        - Archivos de configuración" -ForegroundColor White
Write-Host "  📁 js/            - Código JavaScript" -ForegroundColor White
Write-Host "  📁 css/           - Estilos CSS" -ForegroundColor White
Write-Host "  📁 libs/          - Librerías externas" -ForegroundColor White
Write-Host "  📁 assets/        - Recursos (imágenes, etc.)" -ForegroundColor White
Write-Host "  📁 printer/       - Archivos de impresora" -ForegroundColor White
Write-Host "  📄 index.html     - Página principal" -ForegroundColor White
Write-Host "  📄 README.md      - Documentación principal" -ForegroundColor White

