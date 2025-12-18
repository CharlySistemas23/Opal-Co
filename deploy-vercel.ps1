# Script para desplegar en Vercel
# Ejecutar desde PowerShell en la carpeta del proyecto

$ErrorActionPreference = "Stop"

# Cambiar al directorio del script
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

Write-Host "📦 Preparando despliegue en Vercel..." -ForegroundColor Cyan
Write-Host "📂 Directorio: $scriptPath" -ForegroundColor Gray

# Verificar que los archivos necesarios existan
if (-not (Test-Path "vercel.json")) {
    Write-Host "❌ Error: No se encuentra vercel.json" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path "index.html")) {
    Write-Host "❌ Error: No se encuentra index.html" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Archivos verificados" -ForegroundColor Green

# Ejecutar vercel
Write-Host "`n🚀 Iniciando despliegue..." -ForegroundColor Cyan
Write-Host "   (Sigue las instrucciones en pantalla)`n" -ForegroundColor Yellow

vercel --yes

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Despliegue completado exitosamente!" -ForegroundColor Green
    Write-Host "`n💡 Para desplegar a producción, ejecuta: vercel --prod" -ForegroundColor Yellow
} else {
    Write-Host "`n❌ Error en el despliegue" -ForegroundColor Red
    exit 1
}

