# 🔧 Solución para Problemas de CORS con Google Sheets

## 🚨 Problema Común

Si ves errores como estos en la consola del navegador:
```
Access to fetch at 'https://script.google.com/...' from origin 'null' 
has been blocked by CORS policy
```

Esto ocurre porque estás abriendo el sistema desde archivos locales (`file:///`).

---

## ✅ Soluciones

### Solución 1: Usar un Servidor Local (Recomendado)

#### Opción A: Con Python (Más fácil)

1. Abre una terminal en la carpeta del proyecto
2. Ejecuta uno de estos comandos:

**Python 3:**
```bash
python -m http.server 8080
```

**Python 2:**
```bash
python -m SimpleHTTPServer 8080
```

3. Abre tu navegador en: `http://localhost:8080`
4. Ahora el sistema funcionará sin problemas de CORS

#### Opción B: Con Node.js

1. Instala http-server globalmente:
```bash
npm install -g http-server
```

2. En la carpeta del proyecto, ejecuta:
```bash
http-server -p 8080
```

3. Abre tu navegador en: `http://localhost:8080`

#### Opción C: Con PHP

Si tienes PHP instalado:
```bash
php -S localhost:8080
```

---

### Solución 2: Usar Extensiones del Navegador (Solo para desarrollo)

⚠️ **NO recomendado para producción**

Puedes usar extensiones como:
- **CORS Unblock** (Chrome)
- **CORS Everywhere** (Firefox)

**Desventajas:** Solo funcionan en tu navegador, no es una solución permanente.

---

### Solución 3: Subir a un Hosting

Sube el sistema completo a:
- **GitHub Pages** (gratis)
- **Netlify** (gratis)
- **Vercel** (gratis)
- Cualquier hosting estático

Esto eliminará completamente los problemas de CORS.

---

## 🔍 Verificar que el Script Funciona

### Paso 1: Probar la URL directamente

1. Copia la URL de tu Google Apps Script
2. Ábrela directamente en el navegador
3. Deberías ver algo como:
```json
{
  "success": true,
  "message": "Google Apps Script funcionando correctamente",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "version": "1.0"
}
```

Si ves esto, el script funciona correctamente ✅

### Paso 2: Verificar el Despliegue

1. Ve al editor de Google Apps Script
2. Click en **Implementar** → **Gestionar implementaciones**
3. Verifica que:
   - Tipo: **Aplicación web**
   - Ejecutar como: **Yo**
   - Quién tiene acceso: **Cualquiera** ⚠️ (MUY IMPORTANTE)

Si dice "Solo yo", cambia a "Cualquiera" y redespliega.

---

## 🛠️ Pasos para Redesplegar Correctamente

1. En Google Apps Script, ve a **Implementar** → **Gestionar implementaciones**
2. Click en el ícono de **editar** (lápiz) de tu implementación actual
3. Cambia **"Quién tiene acceso"** a **"Cualquiera"**
4. Click en **Implementar**
5. Copia la nueva URL (puede cambiar)
6. Actualiza la URL en el sistema POS

---

## 📝 Checklist de Verificación

Antes de reportar un problema, verifica:

- [ ] El script está desplegado como "Aplicación web"
- [ ] El acceso está configurado como "Cualquiera"
- [ ] La URL termina en `/exec` (no `/dev`)
- [ ] El TOKEN coincide exactamente en ambos lados
- [ ] Estás usando un servidor local (no `file:///`)
- [ ] La URL del script funciona al abrirla directamente en el navegador
- [ ] Tienes conexión a internet
- [ ] No hay errores en la consola del navegador (F12)

---

## 💡 Consejos Adicionales

1. **Usa siempre un servidor local durante desarrollo**
   - Es más seguro
   - Evita problemas de CORS
   - Simula mejor el entorno de producción

2. **Guarda la URL y TOKEN en un lugar seguro**
   - Puedes crear un archivo `config.local.js` (no subirlo a Git)
   - O usar variables de entorno

3. **Prueba primero con GET**
   - Abre la URL directamente en el navegador
   - Si funciona, el problema es solo de CORS en POST
   - El script ya está configurado para manejar ambos

---

## 🆘 Si Nada Funciona

1. Verifica que el script tenga la versión más reciente con manejo de CORS
2. Revisa los logs en Google Apps Script:
   - Ve a **Ver** → **Registros de ejecución**
   - Busca errores relacionados
3. Prueba crear un nuevo despliegue desde cero
4. Verifica que no haya un firewall o proxy bloqueando

---

## 📞 Información para Reportar Problemas

Si sigues teniendo problemas, proporciona:

1. Mensaje de error completo de la consola (F12)
2. URL de tu Google Apps Script (puedes ocultar parte)
3. Tipo de servidor que estás usando (local, hosting, etc.)
4. Navegador y versión
5. Captura de pantalla de la configuración del despliegue

---

**¡Con estas soluciones deberías poder conectar sin problemas!** 🎉

