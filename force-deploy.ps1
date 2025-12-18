# Forzar deploy a Vercel
$vercelPath = "C:\Users\Panda\AppData\Roaming\npm\vercel.cmd"

Write-Host "=== Forzando deploy a Vercel ===" -ForegroundColor Cyan
Write-Host "Desplegando al proyecto opal-co..." -ForegroundColor Yellow

# Primero vincular al proyecto existente
Write-Host "`nVinculando al proyecto opal-co..." -ForegroundColor Yellow
& $vercelPath link --project opal-co --yes 2>&1

# Deploy a produccion
Write-Host "`nDesplegando a produccion..." -ForegroundColor Yellow
& $vercelPath deploy --prod --yes 2>&1

Write-Host "`n=== Deploy completado ===" -ForegroundColor Green
Write-Host "Espera 30 segundos y visita: https://opal-co.vercel.app" -ForegroundColor Cyan

