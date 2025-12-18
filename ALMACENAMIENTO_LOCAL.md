# 📦 Almacenamiento Local - Dónde se Guardan los Datos

## 🔍 Resumen

Cuando el sistema **NO está sincronizado** o está funcionando **sin conexión a internet**, todos los datos se guardan **localmente en tu navegador** usando **IndexedDB**.

---

## 📍 Ubicación Física de los Datos

### En Windows:
```
C:\Users\[TU_USUARIO]\AppData\Local\[NAVEGADOR]\User Data\Default\IndexedDB\
```

**Rutas específicas por navegador:**

#### Chrome/Edge (Chromium):
```
C:\Users\[TU_USUARIO]\AppData\Local\Google\Chrome\User Data\Default\IndexedDB\http_localhost_0.indexeddb.leveldb\
```

#### Firefox:
```
C:\Users\[TU_USUARIO]\AppData\Roaming\Mozilla\Firefox\Profiles\[PERFIL]\storage\default\http+++localhost\idb\
```

### En Mac:
```
~/Library/Application Support/[NAVEGADOR]/Default/IndexedDB/
```

### En Linux:
```
~/.config/[NAVEGADOR]/Default/IndexedDB/
```

---

## 🗄️ Base de Datos Local

El sistema crea una base de datos llamada: **`opal_pos_db`**

Esta base de datos contiene **todas las tablas (object stores)** con todos tus datos:

### Tablas Almacenadas Localmente:

1. **`sales`** - Todas las ventas
2. **`sale_items`** - Items de cada venta
3. **`payments`** - Pagos realizados
4. **`inventory_items`** - Productos del inventario
5. **`inventory_log`** - Historial de movimientos de inventario
6. **`customers`** - Clientes
7. **`employees`** - Empleados
8. **`users`** - Usuarios del sistema
9. **`repairs`** - Reparaciones
10. **`cost_entries`** - Costos
11. **`catalog_agencies`** - Agencias
12. **`catalog_guides`** - Guías
13. **`catalog_sellers`** - Vendedores
14. **`catalog_branches`** - Sucursales
15. **`tourist_reports`** - Reportes turísticos
16. **`tourist_report_lines`** - Líneas de reportes turísticos
17. **`arrival_rate_rules`** - Reglas de llegadas
18. **`agency_arrivals`** - Llegadas de agencias
19. **`daily_profit_reports`** - Reportes de utilidad diaria
20. **`exchange_rates_daily`** - Tipos de cambio diarios
21. **`inventory_transfers`** - Transferencias de inventario
22. **`inventory_transfer_items`** - Items de transferencias
23. **`sync_queue`** - Cola de sincronización (datos pendientes de enviar)
24. **`settings`** - Configuraciones del sistema
25. **`device`** - Información del dispositivo
26. **`audit_log`** - Log de auditoría

---

## 🔄 Cómo Funciona el Almacenamiento

### 1. **Funcionamiento Normal (Con/Sin Internet)**

```
Usuario realiza acción (venta, agregar producto, etc.)
    ↓
Datos se guardan INMEDIATAMENTE en IndexedDB (local)
    ↓
Sistema intenta sincronizar con Google Sheets
    ↓
Si hay conexión → Se envía a Google Sheets
Si NO hay conexión → Se guarda en sync_queue para sincronizar después
```

### 2. **Cuando NO hay Sincronización**

- ✅ **Los datos se guardan normalmente** en IndexedDB
- ✅ **El sistema funciona completamente offline**
- ✅ **Todos los módulos funcionan** (POS, Inventario, Reportes, etc.)
- ✅ **Los datos están seguros** en tu navegador
- ⚠️ **Los datos NO se envían a Google Sheets** hasta que haya conexión

### 3. **Cola de Sincronización (`sync_queue`)**

Cuando no hay conexión, los datos nuevos se marcan como **"pending"** en la tabla `sync_queue`:

- **Estado:** `pending` (pendiente de sincronizar)
- **Cuando hay conexión:** Se sincronizan automáticamente
- **Si falla:** Se reintenta hasta 5 veces
- **Si falla 5 veces:** Se marca como `failed`

---

## 🔍 Cómo Ver los Datos Almacenados

### Opción 1: Desde el Navegador (Herramientas de Desarrollador)

1. Abre el sistema en tu navegador
2. Presiona **F12** (o clic derecho → Inspeccionar)
3. Ve a la pestaña **"Application"** (Chrome/Edge) o **"Storage"** (Firefox)
4. En el menú lateral, expande **"IndexedDB"**
5. Click en **`opal_pos_db`**
6. Verás todas las tablas con sus datos

### Opción 2: Desde la Consola del Navegador

1. Presiona **F12**
2. Ve a la pestaña **"Console"**
3. Ejecuta estos comandos:

```javascript
// Ver todas las ventas guardadas
const sales = await DB.getAll('sales');
console.log('Ventas:', sales);

// Ver inventario
const inventory = await DB.getAll('inventory_items');
console.log('Inventario:', inventory);

// Ver cola de sincronización
const syncQueue = await DB.getAll('sync_queue');
console.log('Pendientes de sincronizar:', syncQueue.filter(s => s.status === 'pending'));

// Ver configuración
const settings = await DB.getAll('settings');
console.log('Configuración:', settings);
```

---

## 💾 Capacidad de Almacenamiento

### Límites de IndexedDB:

- **Chrome/Edge:** ~60% del espacio libre del disco
- **Firefox:** ~50% del espacio libre del disco
- **Safari:** ~1 GB (puede pedir permiso para más)

En la práctica, puedes guardar **cientos de miles de registros** sin problemas.

---

## 🔐 Seguridad y Privacidad

### Ventajas:
- ✅ Los datos están **solo en tu navegador**
- ✅ **No se envían a ningún servidor** (excepto cuando sincronizas)
- ✅ **Funciona completamente offline**
- ✅ Los datos **persisten** aunque cierres el navegador

### Importante:
- ⚠️ Si borras los datos del navegador, **se pierden los datos**
- ⚠️ Los datos están **asociados a tu perfil de navegador**
- ⚠️ Si cambias de navegador, **no verás los datos** (a menos que sincronices)
- ⚠️ Si borras la caché/datos del sitio, **se pierden los datos**

---

## 🔄 Sincronización Automática

El sistema tiene sincronización automática configurable:

1. **Ve a Configuración → Sincronización**
2. Configura la frecuencia:
   - Cada 5 minutos
   - Cada 15 minutos
   - Cada 30 minutos
   - Cada hora

Cuando hay conexión, el sistema:
1. Busca datos pendientes en `sync_queue`
2. Los envía a Google Sheets
3. Los marca como `synced`

---

## 📊 Verificar Estado de Sincronización

### Desde el Sistema:

1. Ve al módulo **Sincronización** (si está disponible)
2. Verás:
   - ✅ Datos sincronizados
   - ⏳ Datos pendientes
   - ❌ Datos con error

### Desde la Consola:

```javascript
// Ver estado de sincronización
const syncQueue = await DB.getAll('sync_queue');
const stats = {
  total: syncQueue.length,
  synced: syncQueue.filter(s => s.status === 'synced').length,
  pending: syncQueue.filter(s => s.status === 'pending').length,
  failed: syncQueue.filter(s => s.status === 'failed').length
};
console.log('Estado de sincronización:', stats);
```

---

## 🛠️ Resolución de Problemas

### Si los datos no aparecen:

1. **Verifica que IndexedDB esté habilitado:**
   - Chrome: Configuración → Privacidad → Cookies → Permitir todos los cookies
   - Firefox: Configuración → Privacidad → Cookies y datos del sitio

2. **Verifica el espacio disponible:**
   ```javascript
   navigator.storage.estimate().then(estimate => {
     console.log('Espacio usado:', estimate.usage);
     console.log('Espacio disponible:', estimate.quota);
   });
   ```

3. **Limpia y reinicia:**
   - Presiona F12 → Application → Clear storage → Clear site data

### Si la sincronización no funciona:

1. Verifica la conexión a internet
2. Verifica la URL y Token en Configuración
3. Revisa los registros en el módulo de Sincronización
4. Ejecuta sincronización manual

---

## 📝 Resumen Ejecutivo

**Pregunta:** ¿Dónde se guardan los archivos si no está sincronizado?

**Respuesta:** 
- Se guardan en **IndexedDB** del navegador
- Base de datos: **`opal_pos_db`**
- Ubicación física: Carpeta del navegador en tu disco duro
- **Funciona completamente offline**
- Los datos pendientes se sincronizan automáticamente cuando hay conexión

**Conclusión:** Tus datos están **seguros y accesibles** aunque no tengas conexión a internet. El sistema funciona completamente offline y solo necesita internet para sincronizar con Google Sheets.

