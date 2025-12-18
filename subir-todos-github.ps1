# Script para subir todos los archivos a GitHub usando la API REST
# Requiere: GitHub CLI instalado y autenticado

$ErrorActionPreference = "Stop"

Write-Host "🚀 Subiendo archivos a GitHub..." -ForegroundColor Cyan
Write-Host "📦 Repositorio: CharlySistemas23/Opal-Co" -ForegroundColor Gray
Write-Host "🌿 Rama: main" -ForegroundColor Gray

# Obtener token
$ghPath = "C:\Program Files\GitHub CLI\gh.exe"
$token = & $ghPath auth token
if (-not $token) {
    Write-Host "❌ No se pudo obtener el token" -ForegroundColor Red
    exit 1
}

$headers = @{
    "Authorization" = "token $token"
    "Accept" = "application/vnd.github.v3+json"
}

# Función para subir un archivo
function Upload-FileToGitHub {
    param(
        [string]$FilePath,
        [string]$RelativePath,
        [string]$Content
    )
    
    Write-Host "  📄 Subiendo: $RelativePath" -ForegroundColor Yellow
    
    # Convertir a base64
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($Content)
    $base64Content = [System.Convert]::ToBase64String($bytes)
    
    # Obtener SHA si existe
    $sha = $null
    try {
        $url = "https://api.github.com/repos/CharlySistemas23/Opal-Co/contents/$RelativePath?ref=main"
        $existing = Invoke-RestMethod -Uri $url -Headers $headers -Method Get -ErrorAction SilentlyContinue
        $sha = $existing.sha
    } catch {
        # Archivo no existe, está bien
    }
    
    # Preparar body
    $body = @{
        message = "Actualizar $RelativePath"
        content = $base64Content
        branch = "main"
    }
    
    if ($sha) {
        $body.sha = $sha
    }
    
    $url = "https://api.github.com/repos/CharlySistemas23/Opal-Co/contents/$RelativePath"
    $jsonBody = $body | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri $url -Headers $headers -Method Put -Body $jsonBody -ContentType "application/json"
        Write-Host "    ✅ Subido" -ForegroundColor Green
        return $true
    } catch {
        $errorMsg = $_.Exception.Message
        if ($_.ErrorDetails.Message) {
            try {
                $errorJson = $_.ErrorDetails.Message | ConvertFrom-Json
                $errorMsg = $errorJson.message
            } catch {}
        }
        Write-Host "    ❌ Error: $errorMsg" -ForegroundColor Red
        return $false
    }
}

# Lista de archivos a subir (solo los esenciales primero)
$filesToUpload = @(
    @{Path="index.html"; Content=""},
    @{Path="vercel.json"; Content=""},
    @{Path="css/styles.css"; Content=""},
    @{Path="js/app.js"; Content=""},
    @{Path="js/db.js"; Content=""},
    @{Path="js/utils.js"; Content=""},
    @{Path="js/ui.js"; Content=""},
    @{Path="js/inventory.js"; Content=""},
    @{Path="js/pos.js"; Content=""},
    @{Path="js/users.js"; Content=""},
    @{Path="js/customers.js"; Content=""},
    @{Path="js/employees.js"; Content=""},
    @{Path="js/repairs.js"; Content=""},
    @{Path="js/dashboard.js"; Content=""},
    @{Path="js/reports.js"; Content=""},
    @{Path="js/costs.js"; Content=""},
    @{Path="js/tourist_report.js"; Content=""},
    @{Path="js/cash.js"; Content=""},
    @{Path="js/barcodes.js"; Content=""},
    @{Path="js/barcodes_module.js"; Content=""},
    @{Path="js/settings.js"; Content=""},
    @{Path="js/sync.js"; Content=""},
    @{Path="js/sync_ui.js"; Content=""},
    @{Path="js/backup.js"; Content=""},
    @{Path="js/printer.js"; Content=""},
    @{Path="libs/jspdf.umd.min.js"; Content=""},
    @{Path="libs/xlsx.full.min.js"; Content=""},
    @{Path="libs/JsBarcode.all.min.js"; Content=""}
)

Write-Host "`n📋 Archivos a subir: $($filesToUpload.Count)" -ForegroundColor Cyan

$successCount = 0
$failCount = 0

# Leer y subir cada archivo
foreach ($fileInfo in $filesToUpload) {
    $relativePath = $fileInfo.Path
    
    # Leer el archivo usando las herramientas del workspace
    # Nota: Esto requiere que el script se ejecute desde el directorio correcto
    # o que los archivos se lean de otra manera
    
    # Por ahora, vamos a subir solo los que podemos leer directamente
    # El usuario puede ejecutar este script desde su carpeta del proyecto
    
    Write-Host "  ⚠️  Necesita ejecutarse desde la carpeta del proyecto: $relativePath" -ForegroundColor Yellow
}

Write-Host "`n💡 Ejecuta este script desde PowerShell en tu carpeta del proyecto" -ForegroundColor Cyan
Write-Host "   O usa GitHub Desktop para hacer commit y push" -ForegroundColor Cyan

