# 📤 Guía para Subir el Sistema a GitHub

Esta guía te mostrará cómo subir tu sistema completo a GitHub de forma sencilla.

## 📋 Opción 1: Método Manual con Git (Recomendado)

### Paso 1: Instalar Git (si no lo tienes)

1. Descarga Git desde: https://git-scm.com/download/win
2. Instálalo con las opciones por defecto
3. Abre PowerShell o Git Bash

### Paso 2: Inicializar el Repositorio

Abre PowerShell en la carpeta del proyecto y ejecuta:

```powershell
# Navegar a la carpeta del proyecto
cd "C:\Users\Panda\OneDrive\Imágenes\Sistema HTML"

# Inicializar Git
git init

# Verificar que .gitignore existe
# (Ya debería existir en tu proyecto)
```

### Paso 3: Agregar Archivos

```powershell
# Agregar todos los archivos
git add .

# Verificar qué archivos se van a subir
git status
```

### Paso 4: Hacer el Primer Commit

```powershell
# Crear el commit inicial
git commit -m "Initial commit: Sistema POS Opal & Co completo"
```

### Paso 5: Crear Repositorio en GitHub

1. Ve a https://github.com
2. Inicia sesión (o crea una cuenta)
3. Haz clic en el botón **"+"** (arriba derecha) → **"New repository"**
4. Completa:
   - **Repository name**: `opal-co-pos` (o el nombre que prefieras)
   - **Description**: "Sistema POS Multisucursal para Opal & Co"
   - **Visibility**: Elige **Public** o **Private**
   - **NO marques** "Initialize with README" (ya tienes uno)
5. Haz clic en **"Create repository"**

### Paso 6: Conectar y Subir

GitHub te mostrará comandos. Ejecuta estos en PowerShell:

```powershell
# Agregar el repositorio remoto (reemplaza TU_USUARIO y TU_REPO)
git remote add origin https://github.com/TU_USUARIO/TU_REPO.git

# Cambiar a la rama main (si es necesario)
git branch -M main

# Subir el código
git push -u origin main
```

Si te pide credenciales:
- **Usuario**: Tu nombre de usuario de GitHub
- **Contraseña**: Usa un **Personal Access Token** (no tu contraseña normal)

### Paso 7: Crear Personal Access Token (si es necesario)

1. Ve a: https://github.com/settings/tokens
2. Haz clic en **"Generate new token"** → **"Generate new token (classic)"**
3. Dale un nombre: `Sistema POS Upload`
4. Selecciona el scope: **`repo`** (marca todo)
5. Haz clic en **"Generate token"**
6. **COPIA EL TOKEN** (solo se muestra una vez)
7. Úsalo como contraseña cuando Git te la pida

---

## 📋 Opción 2: Usar el Script PowerShell Existente

Ya tienes un script `subir-github.ps1` en tu proyecto. Úsalo así:

### Paso 1: Crear el Repositorio en GitHub

Sigue los pasos 5 y 7 de la Opción 1 para crear el repo y el token.

### Paso 2: Ejecutar el Script

```powershell
# Navegar a la carpeta del proyecto
cd "C:\Users\Panda\OneDrive\Imágenes\Sistema HTML"

# Ejecutar el script (reemplaza TU_TOKEN con tu Personal Access Token)
.\subir-github.ps1 -GitHubToken "TU_TOKEN" -RepoOwner "TU_USUARIO" -RepoName "TU_REPO"
```

---

## 📋 Opción 3: Usar GitHub Desktop (Más Fácil)

### Paso 1: Instalar GitHub Desktop

1. Descarga desde: https://desktop.github.com/
2. Instálalo e inicia sesión con tu cuenta de GitHub

### Paso 2: Agregar el Repositorio

1. En GitHub Desktop: **File** → **Add Local Repository**
2. Haz clic en **"Choose..."** y selecciona tu carpeta del proyecto
3. Si te pregunta si quieres crear un repo, di que **No** (ya lo inicializaste)

### Paso 3: Hacer Commit y Push

1. Verás todos tus archivos en la lista
2. Escribe un mensaje de commit: `"Initial commit: Sistema POS completo"`
3. Haz clic en **"Commit to main"**
4. Haz clic en **"Publish repository"**
5. Elige el nombre y visibilidad
6. Haz clic en **"Publish repository"**

---

## ✅ Verificar que se Subió Correctamente

1. Ve a tu repositorio en GitHub: `https://github.com/TU_USUARIO/TU_REPO`
2. Deberías ver todos tus archivos:
   - `index.html`
   - Carpeta `js/` con todos los archivos
   - Carpeta `css/`
   - Carpeta `libs/`
   - `README.md`
   - etc.

---

## 🔄 Actualizar el Repositorio (Después del Primer Push)

Cada vez que hagas cambios, actualiza así:

### Con Git en PowerShell:

```powershell
# Ver qué archivos cambiaron
git status

# Agregar los cambios
git add .

# Hacer commit
git commit -m "Descripción de los cambios"

# Subir los cambios
git push
```

### Con GitHub Desktop:

1. Abre GitHub Desktop
2. Verás los archivos modificados
3. Escribe un mensaje de commit
4. Haz clic en **"Commit to main"**
5. Haz clic en **"Push origin"**

---

## 📝 Archivos que NO se Suben (Gracias a .gitignore)

Tu `.gitignore` ya está configurado para NO subir:
- `.DS_Store` (macOS)
- `Thumbs.db` (Windows)
- `.vscode/` (configuración del editor)
- `*.log` (archivos de log)
- `.vercel` (configuración de Vercel)
- Archivos temporales

**Todos los archivos importantes SÍ se suben**, incluyendo:
- ✅ Todo el código HTML, CSS, JavaScript
- ✅ Librerías (jsPDF, XLSX, JsBarcode)
- ✅ Documentación (.md)
- ✅ Configuración (vercel.json, google_apps_script.js)

---

## 🆘 Solución de Problemas

### Error: "remote origin already exists"
```powershell
# Eliminar el remoto existente
git remote remove origin

# Agregar el nuevo
git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
```

### Error: "Authentication failed"
- Asegúrate de usar un **Personal Access Token**, no tu contraseña
- El token debe tener permisos de `repo`

### Error: "Large files"
Si tienes archivos muy grandes (imágenes grandes, videos):
- Considera usar [Git LFS](https://git-lfs.github.com/)
- O comprime las imágenes antes de subirlas

### Verificar qué se va a subir
```powershell
# Ver archivos que se agregarán
git status

# Ver archivos que NO se subirán (por .gitignore)
git status --ignored
```

---

## 📚 Recursos Adicionales

- [Documentación oficial de Git](https://git-scm.com/doc)
- [Guía de GitHub](https://guides.github.com/)
- [Crear Personal Access Token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)

---

## ✨ ¡Listo!

Una vez subido, tu código estará en GitHub y podrás:
- Compartirlo con otros
- Hacer backup automático
- Desplegarlo en Vercel u otros servicios
- Colaborar con otros desarrolladores
- Ver el historial de cambios

