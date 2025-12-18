# Script para descargar jsPDF
# Ejecutar en PowerShell como Administrador si es necesario

Write-Host "Descargando jsPDF v2.5.1..." -ForegroundColor Yellow

$url = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"
$output = "jspdf.umd.min.js"

try {
    Invoke-WebRequest -Uri $url -OutFile $output -UseBasicParsing
    Write-Host "✅ jsPDF descargado correctamente: $output" -ForegroundColor Green
    
    # Verificar que el archivo existe y tiene contenido
    if (Test-Path $output) {
        $fileSize = (Get-Item $output).Length
        Write-Host "   Tamaño del archivo: $fileSize bytes" -ForegroundColor Cyan
        if ($fileSize -gt 1000) {
            Write-Host "✅ Archivo válido" -ForegroundColor Green
        } else {
            Write-Host "⚠️ El archivo parece muy pequeño, puede estar corrupto" -ForegroundColor Yellow
        }
    }
} catch {
    Write-Host "❌ Error al descargar jsPDF: $_" -ForegroundColor Red
    Write-Host "   Intenta descargarlo manualmente desde:" -ForegroundColor Yellow
    Write-Host "   $url" -ForegroundColor Cyan
    Write-Host "   Y guárdalo como: jspdf.umd.min.js" -ForegroundColor Yellow
}

