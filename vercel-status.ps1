# Verificar estado del proyecto en Vercel
$vercelPath = "C:\Users\Panda\AppData\Roaming\npm\vercel.cmd"

Write-Host "=== Estado del proyecto Vercel ===" -ForegroundColor Cyan

# Listar proyectos
Write-Host "`nProyectos vinculados:" -ForegroundColor Yellow
& $vercelPath ls 2>&1

# Ver el proyecto actual
Write-Host "`nProyecto actual:" -ForegroundColor Yellow
& $vercelPath project ls 2>&1

# Ver deployments recientes
Write-Host "`nDeployments recientes:" -ForegroundColor Yellow
& $vercelPath ls opal-co 2>&1

