# Script para mover archivos de "Sistema HTML" a la raíz del repositorio
$token = & "C:\Program Files\GitHub CLI\gh.exe" auth token
$headers = @{
    "Authorization" = "token $token"
    "Accept" = "application/vnd.github.v3+json"
}

function Move-FileToRoot {
    param([string]$SourcePath, [string]$DestPath)
    
    Write-Host "Moviendo: $SourcePath -> $DestPath" -ForegroundColor Yellow
    
    try {
        $file = Invoke-RestMethod -Uri "https://api.github.com/repos/CharlySistemas23/Opal-Co/contents/$SourcePath?ref=main" -Headers $headers
        $content = [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($file.content))
        $base64 = [System.Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($content))
        
        $sha = $null
        try {
            $existing = Invoke-RestMethod -Uri "https://api.github.com/repos/CharlySistemas23/Opal-Co/contents/$DestPath?ref=main" -Headers $headers -ErrorAction SilentlyContinue
            $sha = $existing.sha
        } catch {}
        
        $body = @{
            message = "Mover $SourcePath a $DestPath"
            content = $base64
            branch = "main"
        }
        if ($sha) { $body.sha = $sha }
        
        $jsonBody = $body | ConvertTo-Json
        Invoke-RestMethod -Uri "https://api.github.com/repos/CharlySistemas23/Opal-Co/contents/$DestPath" -Method Put -Headers $headers -Body $jsonBody -ContentType "application/json" | Out-Null
        Write-Host "  ✅ Movido" -ForegroundColor Green
        return $true
    } catch {
        Write-Host "  ❌ Error: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Mover archivos JS
Write-Host "`n📁 Moviendo archivos JS..." -ForegroundColor Cyan
$jsFiles = Invoke-RestMethod -Uri "https://api.github.com/repos/CharlySistemas23/Opal-Co/contents/Sistema%20HTML/js?ref=main" -Headers $headers
foreach ($file in $jsFiles) {
    if ($file.type -eq "file") {
        Move-FileToRoot -SourcePath "Sistema HTML/js/$($file.name)" -DestPath "js/$($file.name)"
    }
}

# Mover archivos de libs
Write-Host "`n📁 Moviendo archivos de libs..." -ForegroundColor Cyan
$libsFiles = Invoke-RestMethod -Uri "https://api.github.com/repos/CharlySistemas23/Opal-Co/contents/Sistema%20HTML/libs?ref=main" -Headers $headers
foreach ($file in $libsFiles) {
    if ($file.type -eq "file") {
        Move-FileToRoot -SourcePath "Sistema HTML/libs/$($file.name)" -DestPath "libs/$($file.name)"
    }
}

# Mover assets (solo logo.png si existe)
Write-Host "`n📁 Moviendo assets..." -ForegroundColor Cyan
try {
    $assetsFiles = Invoke-RestMethod -Uri "https://api.github.com/repos/CharlySistemas23/Opal-Co/contents/Sistema%20HTML/assets?ref=main" -Headers $headers
    foreach ($file in $assetsFiles) {
        if ($file.type -eq "file") {
            Move-FileToRoot -SourcePath "Sistema HTML/assets/$($file.name)" -DestPath "assets/$($file.name)"
        }
    }
} catch {
    Write-Host "  ⚠️ No se encontró carpeta assets" -ForegroundColor Yellow
}

Write-Host "`n✅ Proceso completado" -ForegroundColor Green

