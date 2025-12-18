@echo off
echo ========================================
echo Instalacion Impresora EC Line 58110
echo ========================================
echo.

REM Detener el servicio de spooler de impresion
echo Deteniendo servicio de impresion...
net stop spooler
timeout /t 2 /nobreak >nul

REM Agregar impresora con nombre exacto "Ec line 58110"
echo Agregando impresora "Ec line 58110"...
rundll32 printui.dll,PrintUIEntry /if /b "Ec line 58110" /f "C:\Windows\System32\drivers\unidrv.dll" /r "FILE:" /m "Generic / Text Only"

REM Si el comando anterior falla, intentar metodo alternativo
if errorlevel 1 (
    echo Metodo alternativo: Agregando impresora generica...
    rundll32 printui.dll,PrintUIEntry /if /b "Ec line 58110" /f "C:\Windows\System32\drivers\unidrv.dll" /r "LPT1:" /m "Generic / Text Only"
)

REM Reiniciar el servicio de spooler
echo Reiniciando servicio de impresion...
net start spooler
timeout /t 2 /nobreak >nul

REM Configurar impresora como predeterminada (opcional)
echo Configurando como impresora predeterminada...
rundll32 printui.dll,PrintUIEntry /y /n "Ec line 58110"

REM Probar impresion
echo.
echo Imprimiendo ticket de prueba...
echo.
type test_ticket.txt > "\\localhost\Ec line 58110"

echo.
echo ========================================
echo Instalacion completada
echo ========================================
echo.
echo Si la impresora no se instalo correctamente:
echo 1. Abre "Configuracion" - "Dispositivos" - "Impresoras y escaneres"
echo 2. Click en "Agregar impresora o escaner"
echo 3. Selecciona "La impresora que busco no esta en la lista"
echo 4. Selecciona "Agregar una impresora local o de red con configuracion manual"
echo 5. Selecciona "Usar un puerto existente" - "FILE:"
echo 6. En "Fabricante" selecciona "Generic"
echo 7. En "Impresoras" selecciona "Generic / Text Only"
echo 8. Nombre: "Ec line 58110"
echo 9. Finaliza la instalacion
echo.
pause

