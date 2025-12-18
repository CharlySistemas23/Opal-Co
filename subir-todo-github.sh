#!/bin/bash
# Script para subir todos los archivos esenciales a GitHub

echo "🚀 Subiendo Sistema POS a GitHub..."

# Asegurar que estamos en la raíz del proyecto
cd "$(dirname "$0")"

# Agregar archivos esenciales
echo "📦 Agregando archivos esenciales..."

# Archivos raíz
git add index.html
git add vercel.json
git add .gitignore
git add google_apps_script.js
git add README.md
git add DEPLOY_INSTRUCTIONS.md

# CSS
git add css/styles.css

# JavaScript (todos los archivos)
git add js/*.js

# Librerías
git add libs/*.js

# Assets (si existe)
if [ -f "assets/logo.png" ]; then
    git add assets/logo.png
fi

# Documentación (opcional)
git add *.md 2>/dev/null || true

# Commit
echo "💾 Creando commit..."
git commit -m "Sistema POS Multisucursal - Versión Completa

- Sistema multisucursal completo
- Sincronización con Google Sheets
- Dashboard consolidado
- Transferencias entre sucursales
- Validaciones automáticas
- Listo para producción"

# Push
echo "⬆️ Subiendo a GitHub..."
git push origin main

echo "✅ ¡Subida completada!"
echo ""
echo "📝 Próximos pasos:"
echo "1. Ve a Vercel y conecta el repositorio"
echo "2. Configura Google Apps Script"
echo "3. Configura la sincronización en el sistema"

