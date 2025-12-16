# 📊 Instrucciones de Configuración - Google Sheets Sync

## 📋 Resumen

Este documento explica cómo configurar la sincronización automática entre el sistema POS Opal & Co y Google Sheets.

---

## 🗂️ Hojas que se Crean Automáticamente

El script creará automáticamente las siguientes **12 hojas** en Google Sheets (11 de datos + 1 índice):

### 📊 ÍNDICE (Hoja de Control)
**Descripción:** Hoja de inicio con información general del sistema, lista de todas las hojas disponibles y contador de registros en cada una.

**Características:**
- Título y subtítulo con formato destacado
- Tabla con todas las hojas y sus descripciones
- Contador automático de registros por hoja
- Formato alternado de filas para mejor legibilidad

---

### Hojas de Datos (11 hojas):

### 1. **SALES** (Ventas)
**Columnas:**
- `id`, `folio`, `branch_id`, `seller_id`, `agency_id`, `guide_id`, `passengers`
- `currency`, `exchange_rate`, `subtotal`, `discount`, `total`, `status`
- `notes`, `created_at`, `updated_at`, `device_id`, `sync_at`

**Descripción:** Registro de todas las ventas realizadas en el sistema POS.

---

### 2. **ITEMS** (Items de Venta)
**Columnas:**
- `id`, `sale_id`, `item_id`, `quantity`, `price`, `discount`, `subtotal`, `created_at`

**Descripción:** Detalle de productos vendidos en cada venta. Relacionado con SALES mediante `sale_id`.

---

### 3. **INVENTORY** (Inventario)
**Columnas:**
- `id`, `sku`, `barcode`, `name`, `metal`, `stone`, `size`, `weight_g`
- `measures`, `cost`, `price`, `location`, `status`, `branch_id`
- `created_at`, `updated_at`, `device_id`, `sync_at`

**Descripción:** Catálogo completo de productos en inventario.

---

### 4. **INVENTORY_LOG** (Registro de Inventario)
**Columnas:**
- `id`, `item_id`, `action`, `quantity`, `notes`, `created_at`

**Descripción:** Historial de movimientos de inventario (entradas, salidas, ajustes).

---

### 5. **EMPLOYEES** (Empleados)
**Columnas:**
- `id`, `name`, `role`, `branch_id`, `active`, `barcode`, `created_at`

**Descripción:** Lista de empleados del sistema.

---

### 6. **USERS** (Usuarios)
**Columnas:**
- `id`, `username`, `employee_id`, `role`, `active`, `created_at`

**Descripción:** Usuarios del sistema con acceso al POS.

---

### 7. **REPAIRS** (Reparaciones)
**Columnas:**
- `id`, `folio`, `customer_id`, `item_id`, `description`, `status`
- `cost`, `created_at`, `updated_at`, `device_id`, `sync_at`

**Descripción:** Registro de reparaciones realizadas.

---

### 8. **COSTS** (Costos)
**Columnas:**
- `id`, `type`, `category`, `amount`, `branch_id`, `date`, `notes`
- `created_at`, `device_id`, `sync_at`

**Descripción:** Registro de costos fijos y variables.

---

### 9. **AUDIT_LOG** (Log de Auditoría)
**Columnas:**
- `id`, `user_id`, `action`, `entity_type`, `entity_id`, `details`, `created_at`

**Descripción:** Registro de acciones realizadas en el sistema para auditoría.

---

### 10. **TOURIST_DAILY_REPORTS** (Reportes Turistas Diarios)
**Columnas:**
- `id`, `date`, `branch_id`, `exchange_rate`, `status`, `observations`
- `total_cash_usd`, `total_cash_mxn`, `subtotal`, `additional`, `total`
- `created_at`, `updated_at`, `device_id`, `sync_at`

**Descripción:** Reportes diarios de ventas a turistas.

---

### 11. **TOURIST_DAILY_LINES** (Líneas de Reportes Turistas)
**Columnas:**
- `id`, `report_id`, `sale_id`, `identification`, `seller_id`, `guide_id`, `agency_id`
- `quantity`, `weight_g`, `products`, `exchange_rate`
- `cash_eur`, `cash_cad`, `cash_usd`, `cash_mxn`, `tpv_visa_mc`, `tpv_amex`
- `total`, `created_at`

**Descripción:** Detalle de cada línea dentro de un reporte turista. Relacionado con TOURIST_DAILY_REPORTS mediante `report_id`.

---

## 🚀 Pasos para Configurar Google Apps Script

### Paso 1: Crear el Proyecto de Apps Script

1. Abre tu navegador y ve a [Google Sheets](https://sheets.google.com)
2. Crea una nueva hoja de cálculo (o usa una existente)
3. Ve a **Extensiones** → **Apps Script**
4. Se abrirá el editor de Apps Script

---

### Paso 2: Pegar el Código

1. En el editor de Apps Script, **borra todo el código** que viene por defecto
2. Abre el archivo `google_apps_script.js` de este proyecto
3. **Copia todo el contenido** del archivo
4. **Pega el código** en el editor de Apps Script
5. **Guarda el proyecto** (Ctrl+S o Cmd+S)
   - Dale un nombre como: "Opal & Co - Sync Script"

---

### Paso 3: Configurar el TOKEN

1. En el código, busca la línea:
   ```javascript
   const CONFIG = {
     TOKEN: 'TU_TOKEN_SEGURO_AQUI',
     SPREADSHEET_ID: null
   };
   ```

2. Para generar un TOKEN seguro:
   - En el editor de Apps Script, ve a la **consola** (menú superior → Ver → Ejecutar)
   - O simplemente ejecuta esta función en la consola:
   ```javascript
   Utilities.getUuid()
   ```
   - Copia el UUID generado (ejemplo: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`)

3. Reemplaza `'TU_TOKEN_SEGURO_AQUI'` con tu token:
   ```javascript
   const CONFIG = {
     TOKEN: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
     SPREADSHEET_ID: null
   };
   ```

4. **Guarda nuevamente** el proyecto

---

### Paso 4: Desplegar como Aplicación Web

1. En el editor de Apps Script, haz clic en **Implementar** → **Nueva implementación**
2. Haz clic en el ícono de **engranaje** (⚙️) junto a "Tipo" y selecciona **Aplicación web**
3. Configura los siguientes campos:
   - **Descripción:** "Opal & Co POS Sync v1.0"
   - **Ejecutar como:** Yo (tu cuenta de Google)
   - **Quién tiene acceso:** Cualquiera
4. Haz clic en **Implementar**
5. **Autoriza los permisos** cuando se te solicite:
   - Haz clic en "Revisar permisos"
   - Selecciona tu cuenta de Google
   - Haz clic en "Avanzado" → "Ir a [nombre del proyecto] (no seguro)"
   - Haz clic en "Permitir"
6. **Copia la URL de la aplicación web** que aparece después de implementar
   - Ejemplo: `https://script.google.com/macros/s/AKfycby.../exec`

---

### Paso 5: Configurar en el Sistema POS

1. Abre el sistema POS Opal & Co
2. Ve al módulo **Configuración** (⚙️)
3. Ve a la pestaña **Sincronización**
4. Ingresa:
   - **URL de Sincronización:** La URL que copiaste en el Paso 4
     - ⚠️ **IMPORTANTE:** Asegúrate de que termine en `/exec` (no `/dev`)
   - **Token:** El TOKEN que configuraste en el Paso 3
5. Haz clic en **Guardar Configuración**

**⚠️ NOTA IMPORTANTE SOBRE CORS:**
- Si abres el sistema desde archivos locales (`file:///`), los navegadores bloquean las peticiones CORS
- **Solución recomendada:** Usa un servidor local o sube el sistema a un hosting
- Ver la sección "Solución de Problemas" más abajo para más detalles

---

### Paso 6: Probar la Conexión

1. En el sistema POS, ve al módulo **Configuración** (⚙️)
2. Ve a la pestaña **Sincronización**
3. Haz clic en **Probar Conexión**
4. Deberías ver un mensaje de éxito: "✅ Conexión exitosa con Google Sheets"
5. Si hay errores, revisa la sección "Solución de Problemas" más abajo

### Paso 7: Probar la Sincronización

1. En el sistema POS, ve al módulo **Sincronización** (🔄)
2. Haz clic en **Sincronizar Ahora**
3. Verifica que aparezca el mensaje de éxito
4. Regresa a Google Sheets y verifica que:
   - Se hayan creado las 12 hojas automáticamente (11 de datos + 1 índice)
   - Los datos se hayan sincronizado correctamente
   - Las hojas tengan formato bonito aplicado

---

## 🎨 Formato Automático Aplicado

El script aplica automáticamente formato profesional a todas las hojas:

### ✨ Características de Formato:

1. **Headers Coloridos:**
   - Cada tipo de hoja tiene un color único en el encabezado
   - Texto en blanco y negrita para mejor visibilidad
   - Bordes blancos para separación visual

2. **Anchos de Columna Optimizados:**
   - Columnas ajustadas según el tipo de dato
   - Columnas de texto más anchas (200-300px)
   - Columnas numéricas más estrechas (80-120px)

3. **Formato de Datos:**
   - **Monedas:** Formato `$#,##0.00` (ej: $1,234.56)
   - **Cantidades:** Formato `#,##0` (ej: 1,234)
   - **Fechas:** Formato `yyyy-mm-dd hh:mm:ss`
   - **Porcentajes:** Formato numérico con 2 decimales
   - **Pesos:** Formato `#,##0.00" g"` (ej: 15.50 g)

4. **Filas Alternadas:**
   - Filas pares con fondo gris claro (#F8F9FA)
   - Filas impares con fondo blanco
   - Mejora la legibilidad en tablas grandes

5. **Primera Fila Congelada:**
   - El header siempre visible al hacer scroll
   - Facilita la navegación en hojas grandes

6. **Colores por Tipo de Hoja:**
   - 🟢 **SALES:** Verde (#34A853)
   - 🔴 **ITEMS:** Rojo (#EA4335)
   - 🟡 **INVENTORY:** Amarillo (#FBBC04)
   - 🟠 **INVENTORY_LOG:** Naranja (#FF9800)
   - 🟣 **EMPLOYEES:** Morado (#9C27B0)
   - 🟣 **USERS:** Morado oscuro (#673AB7)
   - 🔴 **REPAIRS:** Rojo (#F44336)
   - 🔴 **COSTS:** Rojo oscuro (#FF5722)
   - ⚫ **AUDIT_LOG:** Gris azulado (#607D8B)
   - 🔵 **TOURIST_DAILY_REPORTS:** Cyan (#00BCD4)
   - 🔵 **TOURIST_DAILY_LINES:** Verde azulado (#009688)

---

## 📝 Notas Importantes

### ⚠️ Seguridad
- **NUNCA compartas tu TOKEN** con personas no autorizadas
- El TOKEN actúa como contraseña para acceder a tu sincronización
- Si sospechas que tu TOKEN fue comprometido, genera uno nuevo

### 🔄 Sincronización Automática
- Puedes configurar la sincronización automática desde el módulo de Sincronización
- Opciones disponibles:
  - Cada 5 minutos
  - Cada 15 minutos
  - Cada 30 minutos
  - Cada hora
  - Deshabilitada (solo manual)

### 📊 Límites de Google Sheets
- Google Sheets tiene un límite de **10 millones de celdas** por hoja de cálculo
- Si alcanzas este límite, considera crear un nuevo spreadsheet
- El script puede manejar múltiples spreadsheets cambiando `SPREADSHEET_ID`

### 🔍 Verificar Sincronización
- Revisa la columna `sync_at` en cada hoja para ver cuándo se sincronizó cada registro
- La columna `device_id` indica desde qué dispositivo se sincronizó

---

## 🛠️ Solución de Problemas

### ❌ Error: "CORS policy" o "Access-Control-Allow-Origin"

**Síntomas:**
- Error en consola: "has been blocked by CORS policy"
- No se puede probar la conexión
- La sincronización falla

**Soluciones:**

1. **Verifica el despliegue del script:**
   - Asegúrate de que el script esté desplegado como **"Aplicación web"**
   - El acceso debe ser **"Cualquiera"** (no solo "Yo")
   - Después de cambiar el acceso, **redespliega** el script

2. **Problema con archivos locales (file://):**
   - Si abres el sistema desde `file:///`, los navegadores bloquean CORS
   - **Solución 1:** Usa un servidor local:
     ```bash
     # Instala http-server (si tienes Node.js)
     npm install -g http-server
     # Luego ejecuta en la carpeta del proyecto
     http-server -p 8080
     # Abre: http://localhost:8080
     ```
   - **Solución 2:** Usa Python (si lo tienes instalado):
     ```bash
     # Python 3
     python -m http.server 8080
     # Abre: http://localhost:8080
     ```
   - **Solución 3:** Sube el sistema a un hosting (GitHub Pages, Netlify, etc.)

3. **Verifica que el script tenga los headers CORS:**
   - El script actualizado ya incluye manejo de CORS
   - Asegúrate de tener la versión más reciente del script
   - Si no funciona, verifica que la función `doGet()` y `doPost()` incluyan los headers

4. **Prueba manualmente:**
   - Abre la URL del script directamente en el navegador
   - Deberías ver: `{"success":true,"message":"Google Apps Script funcionando correctamente",...}`
   - Si ves esto, el script funciona correctamente

### ❌ Error: "Token inválido"
- Verifica que el TOKEN en el script coincida con el TOKEN en el sistema POS
- Asegúrate de no tener espacios extra al copiar/pegar
- El TOKEN es case-sensitive (distingue mayúsculas y minúsculas)

### ❌ Error: "Hojas no encontradas"
- El script crea las hojas automáticamente la primera vez
- Si el error persiste, ejecuta manualmente la función `createAllSheets()` en el editor de Apps Script
- Verifica que tengas permisos para crear hojas en el spreadsheet

### ❌ No se sincronizan los datos
- Verifica que la URL de sincronización sea correcta (debe terminar en `/exec`)
- Verifica que tengas conexión a internet
- Revisa la consola del navegador (F12) para ver errores detallados
- Verifica que el TOKEN sea correcto

### ❌ Las hojas no se crean automáticamente
- Ejecuta manualmente la función `getOrCreateSpreadsheet()` en el editor de Apps Script
- Verifica que tengas permisos para crear hojas en el spreadsheet
- Verifica que el script tenga permisos para editar el spreadsheet

### ❌ Error: "Failed to fetch" o "NetworkError"
- Verifica tu conexión a internet
- Verifica que la URL del script sea accesible
- Intenta abrir la URL directamente en el navegador
- Verifica que no haya un firewall bloqueando la conexión

### ⚠️ El formato no se aplica
- El formato se aplica cuando se crean las hojas por primera vez
- Si las hojas ya existían, ejecuta manualmente `createAllSheets()` en el editor
- O elimina las hojas y deja que el script las recree con formato

---

## 📞 Soporte

Si tienes problemas con la configuración, verifica:
1. ✅ Que el código esté completo y sin errores
2. ✅ Que el TOKEN esté configurado correctamente
3. ✅ Que la URL de la aplicación web sea correcta
4. ✅ Que tengas permisos en Google Sheets
5. ✅ Que la conexión a internet funcione

---

## 📄 Archivo del Script

El código completo está en: `google_apps_script.js`

**¡Listo!** Tu sistema POS ahora está sincronizado con Google Sheets. 🎉

