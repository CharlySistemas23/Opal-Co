# Verificar contenido del repositorio en GitHub
$ghPath = "C:\Program Files\GitHub CLI\gh.exe"
$token = & $ghPath auth token

$headers = @{
    "Authorization" = "token $token"
    "Accept" = "application/vnd.github.v3+json"
}

Write-Host "=== Contenido del repositorio ===" -ForegroundColor Cyan

# Raiz
Write-Host "`nRaiz:" -ForegroundColor Yellow
$root = Invoke-RestMethod -Uri "https://api.github.com/repos/CharlySistemas23/Opal-Co/contents/" -Headers $headers
$root | ForEach-Object { Write-Host "  $($_.type): $($_.name)" }

# js/
Write-Host "`njs/:" -ForegroundColor Yellow
try {
    $js = Invoke-RestMethod -Uri "https://api.github.com/repos/CharlySistemas23/Opal-Co/contents/js" -Headers $headers
    $js | ForEach-Object { Write-Host "  $($_.name)" }
} catch {
    Write-Host "  NO EXISTE" -ForegroundColor Red
}

# libs/
Write-Host "`nlibs/:" -ForegroundColor Yellow
try {
    $libs = Invoke-RestMethod -Uri "https://api.github.com/repos/CharlySistemas23/Opal-Co/contents/libs" -Headers $headers
    $libs | ForEach-Object { Write-Host "  $($_.name)" }
} catch {
    Write-Host "  NO EXISTE" -ForegroundColor Red
}

# assets/
Write-Host "`nassets/:" -ForegroundColor Yellow
try {
    $assets = Invoke-RestMethod -Uri "https://api.github.com/repos/CharlySistemas23/Opal-Co/contents/assets" -Headers $headers
    $assets | ForEach-Object { Write-Host "  $($_.name)" }
} catch {
    Write-Host "  NO EXISTE" -ForegroundColor Red
}

# Verificar vercel.json
Write-Host "`n=== Contenido de vercel.json ===" -ForegroundColor Cyan
try {
    $vercel = Invoke-RestMethod -Uri "https://api.github.com/repos/CharlySistemas23/Opal-Co/contents/vercel.json" -Headers $headers
    $content = [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($vercel.content))
    Write-Host $content
} catch {
    Write-Host "NO EXISTE" -ForegroundColor Red
}

# Verificar deployments de Vercel
Write-Host "`n=== Ultimo commit ===" -ForegroundColor Cyan
$commits = Invoke-RestMethod -Uri "https://api.github.com/repos/CharlySistemas23/Opal-Co/commits?per_page=3" -Headers $headers
$commits | ForEach-Object {
    Write-Host "  $($_.sha.Substring(0,7)): $($_.commit.message)" -ForegroundColor Gray
}

