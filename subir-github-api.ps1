# Script para subir archivos a GitHub usando GitHub CLI
# Requiere: GitHub CLI instalado y autenticado

param(
    [Parameter(Mandatory=$false)]
    [string]$RepoOwner = "CharlySistemas23",
    
    [Parameter(Mandatory=$false)]
    [string]$RepoName = "Opal-Co",
    
    [Parameter(Mandatory=$false)]
    [string]$Branch = "main"
)

$ErrorActionPreference = "Stop"

Write-Host "🚀 Subiendo archivos a GitHub usando API..." -ForegroundColor Cyan
Write-Host "📦 Repositorio: $RepoOwner/$RepoName" -ForegroundColor Gray
Write-Host "🌿 Rama: $Branch" -ForegroundColor Gray

# Directorio del proyecto
$projectDir = $PSScriptRoot
if (-not $projectDir) {
    $projectDir = Get-Location
}

# Obtener token de GitHub CLI
$ghPath = "C:\Program Files\GitHub CLI\gh.exe"
if (-not (Test-Path $ghPath)) {
    Write-Host "❌ GitHub CLI no encontrado" -ForegroundColor Red
    exit 1
}

try {
    $token = & $ghPath auth token
    if (-not $token) {
        Write-Host "❌ No se pudo obtener el token. Ejecuta: gh auth login" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Error obteniendo token: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Función para obtener el SHA de un archivo existente
function Get-FileSHA {
    param([string]$RelativePath, [string]$Token, [string]$Owner, [string]$Repo, [string]$Branch)
    
    $url = "https://api.github.com/repos/$Owner/$Repo/contents/$RelativePath?ref=$Branch"
    $headers = @{
        "Authorization" = "token $Token"
        "Accept" = "application/vnd.github.v3+json"
    }
    
    try {
        $response = Invoke-RestMethod -Uri $url -Headers $headers -Method Get -ErrorAction SilentlyContinue
        return $response.sha
    } catch {
        return $null
    }
}

# Función para subir un archivo
function Upload-File {
    param(
        [string]$FilePath,
        [string]$RelativePath,
        [string]$Token,
        [string]$Owner,
        [string]$Repo,
        [string]$Branch
    )
    
    Write-Host "  📄 Subiendo: $RelativePath" -ForegroundColor Yellow
    
    # Leer contenido del archivo
    try {
        $content = [System.IO.File]::ReadAllBytes($FilePath)
        $base64Content = [System.Convert]::ToBase64String($content)
    } catch {
        Write-Host "    ❌ Error leyendo archivo: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
    
    # Obtener SHA si el archivo existe
    $sha = Get-FileSHA -RelativePath $RelativePath -Token $Token -Owner $Owner -Repo $Repo -Branch $Branch
    
    # Preparar el cuerpo de la petición
    $body = @{
        message = "Actualizar $RelativePath"
        content = $base64Content
        branch = $Branch
    }
    
    if ($sha) {
        $body.sha = $sha
    }
    
    $url = "https://api.github.com/repos/$Owner/$Repo/contents/$RelativePath"
    $headers = @{
        "Authorization" = "token $Token"
        "Accept" = "application/vnd.github.v3+json"
    }
    
    try {
        $jsonBody = $body | ConvertTo-Json -Compress
        $response = Invoke-RestMethod -Uri $url -Headers $headers -Method Put -Body $jsonBody -ContentType "application/json"
        Write-Host "    ✅ Subido exitosamente" -ForegroundColor Green
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

# Archivos a subir (excluyendo algunos)
$excludePatterns = @(
    "*.md",
    "*.txt", 
    "*.bat",
    "deploy-vercel.ps1",
    "subir-github*.ps1",
    ".git",
    "node_modules",
    ".vercel"
)

# Obtener todos los archivos
$allFiles = Get-ChildItem -Path $projectDir -Recurse -File
$files = $allFiles | Where-Object {
    $shouldInclude = $true
    $relativePath = $_.FullName.Replace($projectDir, "").TrimStart("\")
    
    # Excluir archivos según patrones
    foreach ($pattern in $excludePatterns) {
        if ($_.Name -like $pattern -or $relativePath -like "*\$pattern\*" -or $relativePath -like "*/$pattern/*") {
            $shouldInclude = $false
            break
        }
    }
    
    # Excluir archivos en carpetas específicas
    if ($relativePath -like "printer\*" -or $relativePath -like "libs\*.ps1" -or $relativePath -like "libs\*.md" -or $relativePath -like "libs\*.txt") {
        $shouldInclude = $false
    }
    
    $shouldInclude
}

Write-Host "`n📋 Archivos a subir: $($files.Count)" -ForegroundColor Cyan

$successCount = 0
$failCount = 0
$skippedCount = 0

foreach ($file in $files) {
    $relativePath = $file.FullName.Replace($projectDir, "").TrimStart("\")
    $relativePath = $relativePath.Replace("\", "/")
    
    # Verificar tamaño (GitHub tiene límite de 100MB por archivo, pero mejor limitar a 50MB)
    if ($file.Length -gt 50MB) {
        Write-Host "  ⚠️  Saltando (muy grande): $relativePath ($([math]::Round($file.Length/1MB, 2)) MB)" -ForegroundColor Yellow
        $skippedCount++
        continue
    }
    
    if (Upload-File -FilePath $file.FullName -RelativePath $relativePath -Token $token -Owner $RepoOwner -Repo $RepoName -Branch $Branch) {
        $successCount++
    } else {
        $failCount++
    }
    
    # Rate limiting - esperar un poco entre requests
    Start-Sleep -Milliseconds 300
}

Write-Host "`n✅ Proceso completado!" -ForegroundColor Green
Write-Host "   ✅ Exitosos: $successCount" -ForegroundColor Green
Write-Host "   ❌ Fallidos: $failCount" -ForegroundColor $(if ($failCount -gt 0) { "Red" } else { "Green" })
Write-Host "   ⚠️  Saltados: $skippedCount" -ForegroundColor $(if ($skippedCount -gt 0) { "Yellow" } else { "Green" })

if ($successCount -gt 0) {
    Write-Host "`n🌐 Verifica en: https://github.com/$RepoOwner/$RepoName" -ForegroundColor Cyan
    Write-Host "🚀 Vercel redesplegará automáticamente en unos segundos" -ForegroundColor Cyan
}

