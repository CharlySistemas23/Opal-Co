# Instalación Impresora Térmica EC Line 58110

## Instalación Automática

1. Ejecuta `install_EC_LINE_58110.bat` como Administrador
2. El script configurará la impresora con el nombre exacto "Ec line 58110"
3. Se imprimirá un ticket de prueba

## Instalación Manual (si el script falla)

### Windows 10/11

1. Abre **Configuración** → **Dispositivos** → **Impresoras y escáneres**
2. Click en **"Agregar impresora o escáner"**
3. Selecciona **"La impresora que busco no está en la lista"**
4. Selecciona **"Agregar una impresora local o de red con configuración manual"**
5. Selecciona **"Usar un puerto existente"** → **"FILE:"** (o el puerto USB/Serial de tu impresora)
6. En **"Fabricante"** selecciona **"Generic"**
7. En **"Impresoras"** selecciona **"Generic / Text Only"**
8. Nombre de impresora: **"Ec line 58110"** (EXACTO, respetando mayúsculas/minúsculas)
9. Finaliza la instalación

### Configuración del Puerto

- Si es USB: Selecciona el puerto USB correspondiente (ej: USB001)
- Si es Serial: Selecciona COM1, COM2, etc.
- Si es Red: Ingresa la IP de la impresora

### Configuración de Papel

1. Abre **Configuración de impresora** → **"Ec line 58110"**
2. Ve a **"Preferencias"** → **"Avanzado"**
3. Configura el tamaño de papel: **58mm x rollo continuo**
4. Guarda los cambios

## Verificación

1. Abre el Bloc de notas
2. Escribe cualquier texto
3. Archivo → Imprimir → Selecciona "Ec line 58110"
4. Debe imprimir correctamente

## Solución de Problemas

### La impresora no aparece en el sistema
- Verifica que esté encendida y conectada
- Revisa los drivers en el sitio del fabricante
- Intenta con el driver genérico "Generic / Text Only"

### No imprime desde la aplicación
- Verifica que el nombre sea exactamente "Ec line 58110"
- Verifica que la impresora esté configurada como predeterminada (opcional)
- Revisa la cola de impresión en Windows

### El formato del ticket no es correcto
- Ajusta el tamaño de papel a 58mm en las preferencias
- Verifica que el CSS de impresión esté correcto en el código

## Notas

- El nombre "Ec line 58110" es crítico y debe coincidir exactamente
- El sistema usa impresión HTML con CSS @media print
- El tamaño de papel debe ser 58mm para tickets térmicos

