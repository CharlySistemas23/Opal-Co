# Script para subir archivos a GitHub usando la API REST
# Requiere: Token de acceso personal de GitHub

param(
    [Parameter(Mandatory=$true)]
    [string]$GitHubToken,
    
    [Parameter(Mandatory=$false)]
    [string]$RepoOwner = "CharlySistemas23",
    
    [Parameter(Mandatory=$false)]
    [string]$RepoName = "Opal-Co",
    
    [Parameter(Mandatory=$false)]
    [string]$Branch = "main"
)

$ErrorActionPreference = "Stop"

Write-Host "🚀 Subiendo archivos a GitHub..." -ForegroundColor Cyan
Write-Host "📦 Repositorio: $RepoOwner/$RepoName" -ForegroundColor Gray
Write-Host "🌿 Rama: $Branch" -ForegroundColor Gray

# Directorio del proyecto
$projectDir = $PSScriptRoot
if (-not $projectDir) {
    $projectDir = Get-Location
}

# Función para obtener el contenido SHA de un archivo existente
function Get-FileSHA {
    param([string]$Path, [string]$Token, [string]$Owner, [string]$Repo, [string]$Branch)
    
    $relativePath = $Path.Replace($projectDir, "").TrimStart("\")
    $relativePath = $relativePath.Replace("\", "/")
    
    $url = "https://api.github.com/repos/$Owner/$Repo/contents/$relativePath?ref=$Branch"
    $headers = @{
        "Authorization" = "token $Token"
        "Accept" = "application/vnd.github.v3+json"
    }
    
    try {
        $response = Invoke-RestMethod -Uri $url -Headers $headers -Method Get
        return $response.sha
    } catch {
        return $null
    }
}

# Función para subir un archivo
function Upload-File {
    param(
        [string]$FilePath,
        [string]$Token,
        [string]$Owner,
        [string]$Repo,
        [string]$Branch
    )
    
    $relativePath = $FilePath.Replace($projectDir, "").TrimStart("\")
    $relativePath = $relativePath.Replace("\", "/")
    
    Write-Host "  📄 Subiendo: $relativePath" -ForegroundColor Yellow
    
    # Leer contenido del archivo
    $content = [System.IO.File]::ReadAllBytes($FilePath)
    $base64Content = [System.Convert]::ToBase64String($content)
    
    # Obtener SHA si el archivo existe
    $sha = Get-FileSHA -Path $FilePath -Token $Token -Owner $Owner -Repo $Repo -Branch $Branch
    
    # Preparar el cuerpo de la petición
    $body = @{
        message = "Actualizar $relativePath"
        content = $base64Content
        branch = $Branch
    }
    
    if ($sha) {
        $body.sha = $sha
    }
    
    $url = "https://api.github.com/repos/$Owner/$Repo/contents/$relativePath"
    $headers = @{
        "Authorization" = "token $Token"
        "Accept" = "application/vnd.github.v3+json"
    }
    
    try {
        $jsonBody = $body | ConvertTo-Json
        $response = Invoke-RestMethod -Uri $url -Headers $headers -Method Put -Body $jsonBody -ContentType "application/json"
        Write-Host "    ✅ Subido exitosamente" -ForegroundColor Green
        return $true
    } catch {
        Write-Host "    ❌ Error: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Archivos a subir (excluyendo algunos)
$excludePatterns = @(
    "*.md",
    "*.txt",
    "*.bat",
    "*.ps1",
    ".git",
    "node_modules",
    ".vercel"
)

# Obtener todos los archivos
$files = Get-ChildItem -Path $projectDir -Recurse -File | Where-Object {
    $shouldInclude = $true
    foreach ($pattern in $excludePatterns) {
        if ($_.Name -like $pattern -or $_.FullName -like "*\$pattern\*") {
            $shouldInclude = $false
            break
        }
    }
    $shouldInclude
}

Write-Host "`n📋 Archivos a subir: $($files.Count)" -ForegroundColor Cyan

$successCount = 0
$failCount = 0

foreach ($file in $files) {
    if (Upload-File -FilePath $file.FullName -Token $GitHubToken -Owner $RepoOwner -Repo $RepoName -Branch $Branch) {
        $successCount++
    } else {
        $failCount++
    }
    Start-Sleep -Milliseconds 500  # Rate limiting
}

Write-Host "`n✅ Proceso completado!" -ForegroundColor Green
Write-Host "   Exitosos: $successCount" -ForegroundColor Green
Write-Host "   Fallidos: $failCount" -ForegroundColor $(if ($failCount -gt 0) { "Red" } else { "Green" })

