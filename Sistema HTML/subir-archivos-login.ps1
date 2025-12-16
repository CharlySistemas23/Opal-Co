# Script para subir archivos actualizados a GitHub
$token = & "C:\Program Files\GitHub CLI\gh.exe" auth token
$headers = @{
    "Authorization" = "token $token"
    "Accept" = "application/vnd.github.v3+json"
}

$repo = "CharlySistemas23/Opal-Co"
$branch = "main"

# Función para subir archivo
function Upload-File {
    param(
        [string]$FilePath,
        [string]$GitHubPath,
        [string]$Message
    )
    
    Write-Host "Subiendo $GitHubPath..." -ForegroundColor Cyan
    
    # Leer contenido del archivo
    $content = Get-Content $FilePath -Raw -Encoding UTF8
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($content)
    $base64 = [System.Convert]::ToBase64String($bytes)
    
    # Obtener SHA si existe
    $sha = $null
    try {
        $existing = Invoke-RestMethod -Uri "https://api.github.com/repos/$repo/contents/$GitHubPath?ref=$branch" -Headers $headers -ErrorAction SilentlyContinue
        $sha = $existing.sha
    } catch {
        # Archivo no existe, crear nuevo
    }
    
    # Preparar body
    $body = @{
        message = $Message
        content = $base64
        branch = $branch
    }
    
    if ($sha) {
        $body.sha = $sha
    }
    
    $jsonBody = $body | ConvertTo-Json -Depth 10
    
    # Subir
    try {
        $response = Invoke-RestMethod -Uri "https://api.github.com/repos/$repo/contents/$GitHubPath" -Method Put -Headers $headers -Body $jsonBody -ContentType "application/json"
        Write-Host "✅ $GitHubPath subido exitosamente" -ForegroundColor Green
        Write-Host "   Commit: $($response.commit.sha)" -ForegroundColor Gray
        return $true
    } catch {
        Write-Host "❌ Error subiendo $GitHubPath : $_" -ForegroundColor Red
        return $false
    }
}

# Obtener ruta del workspace
$workspacePath = "C:\Users\Panda\OneDrive\Imágenes\Sistema HTML"

# Subir archivos
Upload-File -FilePath "$workspacePath\index.html" -GitHubPath "index.html" -Message "Mejorar acceso directo y botón de login"
Upload-File -FilePath "$workspacePath\js\app.js" -GitHubPath "js/app.js" -Message "Mejorar bypassLogin para crear usuarios automáticamente"
Upload-File -FilePath "$workspacePath\js\users.js" -GitHubPath "js/users.js" -Message "Mejorar creación automática de usuarios en login"

Write-Host "`n✅ Proceso completado" -ForegroundColor Green
Write-Host "⏳ Vercel está redesplegando automáticamente..." -ForegroundColor Yellow
Write-Host "Espera 1-2 minutos y luego recarga la página (F5)" -ForegroundColor Cyan

