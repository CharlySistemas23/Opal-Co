# Verificar respuesta de Vercel
Write-Host "=== Verificando respuesta de Vercel ===" -ForegroundColor Cyan

$urls = @(
    "https://opal-co.vercel.app/js/db.js",
    "https://opal-co.vercel.app/vercel.json",
    "https://opal-co.vercel.app/libs/jspdf.umd.min.js"
)

foreach ($url in $urls) {
    Write-Host "`nURL: $url" -ForegroundColor Yellow
    try {
        $response = Invoke-WebRequest -Uri $url -Method Head -UseBasicParsing -ErrorAction Stop
        Write-Host "  Status: $($response.StatusCode)" -ForegroundColor Green
        Write-Host "  Content-Type: $($response.Headers['Content-Type'])" -ForegroundColor Gray
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "  Status: $statusCode" -ForegroundColor Red
        Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Verificar si Vercel CLI está disponible
Write-Host "`n=== Verificando Vercel CLI ===" -ForegroundColor Cyan
$vercelPath = "C:\Users\Panda\AppData\Roaming\npm\vercel.cmd"
if (Test-Path $vercelPath) {
    Write-Host "Vercel CLI encontrado" -ForegroundColor Green
    & $vercelPath --version
} else {
    Write-Host "Vercel CLI no encontrado en npm global" -ForegroundColor Yellow
    # Intentar con npx
    Write-Host "Intentando con npx..." -ForegroundColor Yellow
}

