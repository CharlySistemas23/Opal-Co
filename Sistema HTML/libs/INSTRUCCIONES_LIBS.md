# Instrucciones para Descargar Librerías

✅ **TODAS LAS LIBRERÍAS YA ESTÁN DESCARGADAS**

Las siguientes librerías ya están en esta carpeta (`/libs/`):

## 1. jsPDF

**URL**: https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js

**Método 1 (Navegador)**:
1. Abre la URL en tu navegador
2. Guarda la página como `jspdf.umd.min.js` en esta carpeta

**Método 2 (PowerShell)**:
```powershell
Invoke-WebRequest -Uri "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js" -OutFile "jspdf.umd.min.js"
```

## 2. SheetJS (xlsx)

**URL**: https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js

**Método 1 (Navegador)**:
1. Abre la URL en tu navegador
2. Guarda la página como `xlsx.full.min.js` en esta carpeta

**Método 2 (PowerShell)**:
```powershell
Invoke-WebRequest -Uri "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js" -OutFile "xlsx.full.min.js"
```

## 3. JsBarcode

**URL**: https://cdnjs.cloudflare.com/ajax/libs/jsbarcode/3.11.5/JsBarcode.all.min.js

**Método 1 (Navegador)**:
1. Abre la URL en tu navegador
2. Guarda la página como `JsBarcode.all.min.js` en esta carpeta

**Método 2 (PowerShell)**:
```powershell
Invoke-WebRequest -Uri "https://cdnjs.cloudflare.com/ajax/libs/jsbarcode/3.11.5/JsBarcode.all.min.js" -OutFile "JsBarcode.all.min.js"
```

## Script Automático (PowerShell)

Ejecuta este script en PowerShell desde la carpeta raíz del proyecto:

```powershell
cd libs
Invoke-WebRequest -Uri "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js" -OutFile "jspdf.umd.min.js"
Invoke-WebRequest -Uri "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js" -OutFile "xlsx.full.min.js"
Invoke-WebRequest -Uri "https://cdnjs.cloudflare.com/ajax/libs/jsbarcode/3.11.5/JsBarcode.all.min.js" -OutFile "JsBarcode.all.min.js"
cd ..
```

## Verificación

Después de descargar, verifica que los archivos existan:
- `libs/jspdf.umd.min.js`
- `libs/xlsx.full.min.js`
- `libs/JsBarcode.all.min.js`

El sistema no funcionará correctamente sin estas librerías.

