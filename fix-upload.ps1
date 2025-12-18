# Script simple para subir archivos criticos a GitHub
$ErrorActionPreference = "Continue"

Write-Host "Subiendo archivos a GitHub..." -ForegroundColor Cyan

# Configuracion
$RepoOwner = "CharlySistemas23"
$RepoName = "Opal-Co"
$Branch = "main"

# Obtener token de GitHub CLI
$ghPath = "C:\Program Files\GitHub CLI\gh.exe"
if (-not (Test-Path $ghPath)) {
    Write-Host "GitHub CLI no encontrado en: $ghPath" -ForegroundColor Red
    exit 1
}

Write-Host "Obteniendo token de GitHub CLI..." -ForegroundColor Yellow
$token = & $ghPath auth token 2>$null
if (-not $token) {
    Write-Host "No se pudo obtener el token. Ejecuta: gh auth login" -ForegroundColor Red
    exit 1
}
Write-Host "Token obtenido correctamente" -ForegroundColor Green

# Directorio del proyecto
$projectDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Write-Host "Directorio: $projectDir" -ForegroundColor Gray

# Funcion para subir un archivo
function Upload-GitHubFile {
    param([string]$LocalPath, [string]$RemotePath)
    
    Write-Host "Subiendo: $RemotePath" -ForegroundColor Yellow
    
    # Leer contenido
    $content = [System.IO.File]::ReadAllBytes($LocalPath)
    $base64 = [System.Convert]::ToBase64String($content)
    
    # Obtener SHA existente
    $url = "https://api.github.com/repos/$RepoOwner/$RepoName/contents/$RemotePath"
    $headers = @{
        "Authorization" = "token $token"
        "Accept" = "application/vnd.github.v3+json"
        "User-Agent" = "PowerShell"
    }
    
    $sha = $null
    try {
        $existing = Invoke-RestMethod -Uri "$url`?ref=$Branch" -Headers $headers -Method Get -ErrorAction SilentlyContinue
        $sha = $existing.sha
        Write-Host "  Archivo existe, SHA: $sha" -ForegroundColor Gray
    } catch {
        Write-Host "  Archivo nuevo" -ForegroundColor Gray
    }
    
    # Preparar body
    $body = @{
        message = "Actualizar $RemotePath - fix vercel config"
        content = $base64
        branch = $Branch
    }
    if ($sha) { $body.sha = $sha }
    
    # Subir
    try {
        $jsonBody = $body | ConvertTo-Json -Compress -Depth 10
        $result = Invoke-RestMethod -Uri $url -Headers $headers -Method Put -Body $jsonBody -ContentType "application/json; charset=utf-8"
        Write-Host "  OK - Subido correctamente" -ForegroundColor Green
        return $true
    } catch {
        Write-Host "  ERROR: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.ErrorDetails.Message) {
            Write-Host "  Detalles: $($_.ErrorDetails.Message)" -ForegroundColor Red
        }
        return $false
    }
}

# Archivos a subir
$filesToUpload = @(
    @{ Local = "vercel.json"; Remote = "vercel.json" },
    @{ Local = "index.html"; Remote = "index.html" },
    @{ Local = "css\styles.css"; Remote = "css/styles.css" },
    @{ Local = "assets\logo.png"; Remote = "assets/logo.png" },
    @{ Local = "libs\jspdf.umd.min.js"; Remote = "libs/jspdf.umd.min.js" },
    @{ Local = "libs\xlsx.full.min.js"; Remote = "libs/xlsx.full.min.js" },
    @{ Local = "libs\JsBarcode.all.min.js"; Remote = "libs/JsBarcode.all.min.js" },
    @{ Local = "js\db.js"; Remote = "js/db.js" },
    @{ Local = "js\users.js"; Remote = "js/users.js" },
    @{ Local = "js\utils.js"; Remote = "js/utils.js" },
    @{ Local = "js\ui.js"; Remote = "js/ui.js" },
    @{ Local = "js\sync.js"; Remote = "js/sync.js" },
    @{ Local = "js\inventory.js"; Remote = "js/inventory.js" },
    @{ Local = "js\backup.js"; Remote = "js/backup.js" },
    @{ Local = "js\barcodes.js"; Remote = "js/barcodes.js" },
    @{ Local = "js\customers.js"; Remote = "js/customers.js" },
    @{ Local = "js\employees.js"; Remote = "js/employees.js" },
    @{ Local = "js\dashboard.js"; Remote = "js/dashboard.js" },
    @{ Local = "js\reports.js"; Remote = "js/reports.js" },
    @{ Local = "js\repairs.js"; Remote = "js/repairs.js" },
    @{ Local = "js\pos.js"; Remote = "js/pos.js" },
    @{ Local = "js\tourist_report.js"; Remote = "js/tourist_report.js" },
    @{ Local = "js\printer.js"; Remote = "js/printer.js" },
    @{ Local = "js\costs.js"; Remote = "js/costs.js" },
    @{ Local = "js\cash.js"; Remote = "js/cash.js" },
    @{ Local = "js\settings.js"; Remote = "js/settings.js" },
    @{ Local = "js\sync_ui.js"; Remote = "js/sync_ui.js" },
    @{ Local = "js\barcodes_module.js"; Remote = "js/barcodes_module.js" },
    @{ Local = "js\app.js"; Remote = "js/app.js" },
    @{ Local = "js\arrival_rules.js"; Remote = "js/arrival_rules.js" },
    @{ Local = "js\profit.js"; Remote = "js/profit.js" }
)

$success = 0
$fail = 0

foreach ($file in $filesToUpload) {
    $localPath = Join-Path $projectDir $file.Local
    if (Test-Path $localPath) {
        if (Upload-GitHubFile -LocalPath $localPath -RemotePath $file.Remote) {
            $success++
        } else {
            $fail++
        }
        Start-Sleep -Milliseconds 500
    } else {
        Write-Host "Archivo no encontrado: $($file.Local)" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "=== COMPLETADO ===" -ForegroundColor Cyan
Write-Host "Exitosos: $success" -ForegroundColor Green
Write-Host "Fallidos: $fail" -ForegroundColor $(if ($fail -gt 0) { "Red" } else { "Green" })
Write-Host ""
Write-Host "Vercel redesplegara automaticamente en 1-2 minutos" -ForegroundColor Cyan
Write-Host "URL: https://opal-co.vercel.app" -ForegroundColor Cyan

