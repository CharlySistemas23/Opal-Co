/**
 * Google Apps Script Web App para sincronización Opal & Co POS
 * 
 * INSTRUCCIONES DE DEPLOY:
 * 1. Abre Google Sheets
 * 2. Ve a Extensiones → Apps Script
 * 3. Pega este código completo
 * 4. Guarda el proyecto (Ctrl+S)
 * 5. Ve a Implementar → Nueva implementación
 * 6. Tipo: Aplicación web
 * 7. Ejecutar como: Yo
 * 8. Quién tiene acceso: Cualquiera
 * 9. Click en Implementar
 * 10. Copia la URL de la aplicación web
 * 11. Genera un TOKEN seguro (puedes usar: Utilities.getUuid() en la consola)
 * 12. Configura la URL y TOKEN en el sistema POS
 */

// CONFIGURACIÓN
const CONFIG = {
  TOKEN: 'TU_TOKEN_SEGURO_AQUI', // Cambia esto por un token seguro
  SPREADSHEET_ID: null // Se creará automáticamente o especifica uno
};

// Nombres de hojas
const SHEETS = {
  SALES: 'SALES',
  ITEMS: 'ITEMS',
  INVENTORY: 'INVENTORY',
  INVENTORY_LOG: 'INVENTORY_LOG',
  EMPLOYEES: 'EMPLOYEES',
  USERS: 'USERS',
  REPAIRS: 'REPAIRS',
  COSTS: 'COSTS',
  AUDIT_LOG: 'AUDIT_LOG',
  TOURIST_DAILY_REPORTS: 'TOURIST_DAILY_REPORTS',
  TOURIST_DAILY_LINES: 'TOURIST_DAILY_LINES'
};

/**
 * Headers CORS para permitir peticiones desde cualquier origen
 */
function getCorsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  };
}

/**
 * Función para manejar peticiones GET (preflight CORS y pruebas)
 */
function doGet(e) {
  // Respuesta simple para pruebas de conexión
  const response = {
    success: true,
    message: 'Google Apps Script funcionando correctamente',
    timestamp: new Date().toISOString(),
    version: '1.0'
  };
  
  return ContentService.createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeaders({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
}

/**
 * Función principal que recibe las peticiones POST
 */
function doPost(e) {
  try {
    // Headers CORS para permitir peticiones desde cualquier origen
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    };
    
    // Manejar peticiones OPTIONS (preflight CORS)
    // Los navegadores envían OPTIONS antes de POST para verificar CORS
    if (!e.postData) {
      return ContentService.createTextOutput('')
        .setMimeType(ContentService.MimeType.TEXT)
        .setHeaders(headers);
    }
    
    // Validar que hay datos POST
    if (!e.postData || !e.postData.contents) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: 'No se recibieron datos'
      }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders(headers);
    }
    
    const data = JSON.parse(e.postData.contents);
    
    // Validar token
    if (!data.token || data.token !== CONFIG.TOKEN) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: 'Token inválido o no proporcionado'
      }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders(headers);
    }
    
    const entityType = data.entity_type;
    const records = data.records || [];
    const deviceId = data.device_id || 'unknown';
    
    // Obtener o crear spreadsheet
    const ss = getOrCreateSpreadsheet();
    
    // Procesar según tipo de entidad
    let result;
    switch (entityType) {
      case 'sale':
        result = processSales(ss, records);
        break;
      case 'inventory_item':
        result = processInventory(ss, records);
        break;
      case 'employee':
        result = processEmployees(ss, records);
        break;
      case 'repair':
        result = processRepairs(ss, records);
        break;
      case 'cost_entry':
        result = processCosts(ss, records);
        break;
      case 'tourist_report':
        result = processTouristReports(ss, records);
        break;
      default:
        result = { success: false, error: 'Tipo de entidad no reconocido: ' + entityType };
    }
    
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders(headers);
      
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString(),
      stack: error.stack
    }))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeaders({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
  }
}

/**
 * Obtener o crear el spreadsheet
 */
function getOrCreateSpreadsheet() {
  if (CONFIG.SPREADSHEET_ID) {
    try {
      return SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    } catch (e) {
      // Si falla, crear uno nuevo
    }
  }
  
  // Crear nuevo spreadsheet
  const ss = SpreadsheetApp.create('Opal & Co - Sincronización POS');
  const ssId = ss.getId();
  
  // Crear todas las hojas
  createAllSheets(ss);
  
  // Guardar el ID (deberías actualizar CONFIG.SPREADSHEET_ID con este valor)
  Logger.log('Spreadsheet ID: ' + ssId);
  Logger.log('URL: ' + ss.getUrl());
  
  return ss;
}

/**
 * Crear todas las hojas necesarias con formato bonito
 */
function createAllSheets(ss) {
  const sheetNames = Object.values(SHEETS);
  
  sheetNames.forEach(sheetName => {
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      // Agregar headers según la hoja (esto también aplica el formato)
      addHeaders(sheet, sheetName);
    } else {
      // Si la hoja ya existe, asegurar que tenga formato
      const numColumns = sheet.getLastColumn() || 1;
      if (numColumns > 0) {
        applySheetFormatting(sheet, sheetName, numColumns);
      }
    }
  });
  
  // Eliminar hoja por defecto si existe
  const defaultSheet = ss.getSheetByName('Hoja 1');
  if (defaultSheet && sheetNames.length > 0) {
    ss.deleteSheet(defaultSheet);
  }
  
  // Crear hoja de índice/dashboard (opcional)
  createIndexSheet(ss);
}

/**
 * Crear hoja índice con información del sistema
 */
function createIndexSheet(ss) {
  let indexSheet = ss.getSheetByName('📊 ÍNDICE');
  if (!indexSheet) {
    indexSheet = ss.insertSheet('📊 ÍNDICE', 0); // Insertar al inicio
    
    const title = 'OPAL & CO - SISTEMA POS';
    const subtitle = 'Panel de Control y Sincronización';
    
    // Título principal
    indexSheet.getRange(1, 1).setValue(title);
    indexSheet.getRange(1, 1).setFontSize(24);
    indexSheet.getRange(1, 1).setFontWeight('bold');
    indexSheet.getRange(1, 1).setFontColor('#1a1a1a');
    indexSheet.getRange(1, 1, 1, 3).merge();
    indexSheet.setRowHeight(1, 40);
    
    // Subtítulo
    indexSheet.getRange(2, 1).setValue(subtitle);
    indexSheet.getRange(2, 1).setFontSize(14);
    indexSheet.getRange(2, 1).setFontColor('#6c757d');
    indexSheet.getRange(2, 1, 1, 3).merge();
    indexSheet.setRowHeight(2, 30);
    
    // Información de hojas
    indexSheet.getRange(4, 1).setValue('HOJAS DISPONIBLES');
    indexSheet.getRange(4, 1).setFontSize(16);
    indexSheet.getRange(4, 1).setFontWeight('bold');
    indexSheet.getRange(4, 1, 1, 3).merge();
    indexSheet.setRowHeight(4, 35);
    
    // Lista de hojas con descripciones
    const sheetsInfo = [
      ['SALES', 'Ventas realizadas en el sistema POS'],
      ['ITEMS', 'Detalle de productos vendidos en cada venta'],
      ['INVENTORY', 'Catálogo completo de productos en inventario'],
      ['INVENTORY_LOG', 'Historial de movimientos de inventario'],
      ['EMPLOYEES', 'Lista de empleados del sistema'],
      ['USERS', 'Usuarios con acceso al sistema POS'],
      ['REPAIRS', 'Registro de reparaciones realizadas'],
      ['COSTS', 'Registro de costos fijos y variables'],
      ['AUDIT_LOG', 'Log de auditoría de acciones del sistema'],
      ['TOURIST_DAILY_REPORTS', 'Reportes diarios de ventas a turistas'],
      ['TOURIST_DAILY_LINES', 'Líneas detalladas de reportes turistas']
    ];
    
    // Headers de la tabla
    indexSheet.getRange(5, 1).setValue('Hoja');
    indexSheet.getRange(5, 2).setValue('Descripción');
    indexSheet.getRange(5, 3).setValue('Total Registros');
    
    const headerRange = indexSheet.getRange(5, 1, 1, 3);
    headerRange.setBackground('#4285F4');
    headerRange.setFontColor('#FFFFFF');
    headerRange.setFontWeight('bold');
    headerRange.setHorizontalAlignment('center');
    headerRange.setBorder(true, true, true, true, true, true);
    
    // Datos de las hojas
    sheetsInfo.forEach((info, index) => {
      const row = index + 6;
      indexSheet.getRange(row, 1).setValue(info[0]);
      indexSheet.getRange(row, 2).setValue(info[1]);
      
      // Contar registros en cada hoja
      const targetSheet = ss.getSheetByName(info[0]);
      if (targetSheet) {
        const rowCount = Math.max(0, targetSheet.getLastRow() - 1); // -1 por el header
        indexSheet.getRange(row, 3).setValue(rowCount);
        indexSheet.getRange(row, 3).setNumberFormat('#,##0');
      } else {
        indexSheet.getRange(row, 3).setValue(0);
      }
      
      // Formato alternado de filas
      const rowRange = indexSheet.getRange(row, 1, 1, 3);
      if (index % 2 === 0) {
        rowRange.setBackground('#F8F9FA');
      } else {
        rowRange.setBackground('#FFFFFF');
      }
      rowRange.setBorder(null, null, null, null, null, true, '#E0E0E0', SpreadsheetApp.BorderStyle.SOLID);
    });
    
    // Ajustar anchos de columna
    indexSheet.setColumnWidth(1, 200);
    indexSheet.setColumnWidth(2, 400);
    indexSheet.setColumnWidth(3, 120);
    
    // Información adicional
    const infoRow = sheetsInfo.length + 8;
    indexSheet.getRange(infoRow, 1).setValue('📌 NOTA:');
    indexSheet.getRange(infoRow, 1).setFontWeight('bold');
    indexSheet.getRange(infoRow, 2).setValue('Las hojas se actualizan automáticamente cuando se sincroniza el sistema POS.');
    indexSheet.getRange(infoRow, 2, 1, 2).merge();
    indexSheet.setRowHeight(infoRow, 30);
    
    // Congelar filas superiores
    indexSheet.setFrozenRows(5);
  }
}

/**
 * Agregar headers a cada hoja con formato bonito
 */
function addHeaders(sheet, sheetName) {
  let headers = [];
  
  switch (sheetName) {
    case SHEETS.SALES:
      headers = ['ID', 'Folio', 'Sucursal', 'Vendedor', 'Agencia', 'Guía', 'Pasajeros', 
                'Moneda', 'Tipo Cambio', 'Subtotal', 'Descuento', 'Total', 'Estado', 
                'Notas', 'Fecha Creación', 'Fecha Actualización', 'Dispositivo', 'Sincronizado'];
      break;
    case SHEETS.ITEMS:
      headers = ['ID', 'ID Venta', 'ID Producto', 'Cantidad', 'Precio', 'Descuento', 'Subtotal', 'Fecha Creación'];
      break;
    case SHEETS.INVENTORY:
      headers = ['ID', 'SKU', 'Código Barras', 'Nombre', 'Metal', 'Piedra', 'Talla', 'Peso (g)', 
                'Medidas', 'Costo', 'Precio', 'Ubicación', 'Estado', 'Sucursal', 
                'Fecha Creación', 'Fecha Actualización', 'Dispositivo', 'Sincronizado'];
      break;
    case SHEETS.INVENTORY_LOG:
      headers = ['ID', 'ID Producto', 'Acción', 'Cantidad', 'Notas', 'Fecha'];
      break;
    case SHEETS.EMPLOYEES:
      headers = ['ID', 'Nombre', 'Rol', 'Sucursal', 'Activo', 'Código Barras', 'Fecha Creación'];
      break;
    case SHEETS.USERS:
      headers = ['ID', 'Usuario', 'ID Empleado', 'Rol', 'Activo', 'Fecha Creación'];
      break;
    case SHEETS.REPAIRS:
      headers = ['ID', 'Folio', 'ID Cliente', 'ID Pieza', 'Descripción', 'Estado', 
                'Costo', 'Fecha Creación', 'Fecha Actualización', 'Dispositivo', 'Sincronizado'];
      break;
    case SHEETS.COSTS:
      headers = ['ID', 'Tipo', 'Categoría', 'Monto', 'Sucursal', 'Fecha', 'Notas', 
                'Fecha Creación', 'Dispositivo', 'Sincronizado'];
      break;
    case SHEETS.AUDIT_LOG:
      headers = ['ID', 'ID Usuario', 'Acción', 'Tipo Entidad', 'ID Entidad', 'Detalles', 'Fecha'];
      break;
    case SHEETS.TOURIST_DAILY_REPORTS:
      headers = ['ID', 'Fecha', 'Sucursal', 'Tipo Cambio', 'Estado', 'Observaciones',
                'Total Cash USD', 'Total Cash MXN', 'Subtotal', 'Adicional', 'Total',
                'Fecha Creación', 'Fecha Actualización', 'Dispositivo', 'Sincronizado'];
      break;
    case SHEETS.TOURIST_DAILY_LINES:
      headers = ['ID', 'ID Reporte', 'ID Venta', 'Identificación', 'Vendedor', 'Guía', 
                'Agencia', 'Cantidad', 'Peso (g)', 'Productos', 'Tipo Cambio',
                'Cash EUR', 'Cash CAD', 'Cash USD', 'Cash MXN', 'TPV Visa/MC', 'TPV Amex',
                'Total', 'Fecha Creación'];
      break;
  }
  
  if (headers.length > 0) {
    // Agregar headers
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    
    // Aplicar formato bonito
    applySheetFormatting(sheet, sheetName, headers.length);
  }
}

/**
 * Aplicar formato bonito a las hojas
 */
function applySheetFormatting(sheet, sheetName, numColumns) {
  // Formato del header (fila 1)
  const headerRange = sheet.getRange(1, 1, 1, numColumns);
  
  // Colores según el tipo de hoja
  let headerColor = '#4285F4'; // Azul por defecto
  let headerTextColor = '#FFFFFF';
  
  switch (sheetName) {
    case SHEETS.SALES:
      headerColor = '#34A853'; // Verde para ventas
      break;
    case SHEETS.ITEMS:
      headerColor = '#EA4335'; // Rojo para items
      break;
    case SHEETS.INVENTORY:
      headerColor = '#FBBC04'; // Amarillo para inventario
      break;
    case SHEETS.INVENTORY_LOG:
      headerColor = '#FF9800'; // Naranja para logs
      break;
    case SHEETS.EMPLOYEES:
      headerColor = '#9C27B0'; // Morado para empleados
      break;
    case SHEETS.USERS:
      headerColor = '#673AB7'; // Morado oscuro para usuarios
      break;
    case SHEETS.REPAIRS:
      headerColor = '#F44336'; // Rojo para reparaciones
      break;
    case SHEETS.COSTS:
      headerColor = '#FF5722'; // Rojo oscuro para costos
      break;
    case SHEETS.AUDIT_LOG:
      headerColor = '#607D8B'; // Gris azulado para auditoría
      break;
    case SHEETS.TOURIST_DAILY_REPORTS:
      headerColor = '#00BCD4'; // Cyan para reportes turistas
      break;
    case SHEETS.TOURIST_DAILY_LINES:
      headerColor = '#009688'; // Verde azulado para líneas
      break;
  }
  
  // Estilo del header
  headerRange.setBackground(headerColor);
  headerRange.setFontColor(headerTextColor);
  headerRange.setFontWeight('bold');
  headerRange.setFontSize(11);
  headerRange.setHorizontalAlignment('center');
  headerRange.setVerticalAlignment('middle');
  headerRange.setWrap(true);
  
  // Bordes del header
  headerRange.setBorder(true, true, true, true, true, true);
  headerRange.setBorderColor('#FFFFFF');
  
  // Congelar primera fila
  sheet.setFrozenRows(1);
  
  // Ajustar ancho de columnas según el tipo de dato
  adjustColumnWidths(sheet, sheetName, numColumns);
  
  // Formato de columnas numéricas y fechas
  applyDataFormatting(sheet, sheetName, numColumns);
  
  // Alternar colores de filas para mejor legibilidad
  const dataRange = sheet.getRange(2, 1, 1000, numColumns);
  const conditionalFormatRules = sheet.getConditionalFormatRules();
  
  // Regla: filas pares con fondo claro
  conditionalFormatRules.push(
    SpreadsheetApp.newConditionalFormatRule()
      .setRanges([dataRange])
      .whenFormulaSatisfied('=MOD(ROW(),2)=0')
      .setBackground('#F8F9FA')
      .build()
  );
  
  // Regla: filas impares sin fondo especial (blanco)
  conditionalFormatRules.push(
    SpreadsheetApp.newConditionalFormatRule()
      .setRanges([dataRange])
      .whenFormulaSatisfied('=MOD(ROW(),2)=1')
      .setBackground('#FFFFFF')
      .build()
  );
  
  sheet.setConditionalFormatRules(conditionalFormatRules);
  
  // Proteger header (opcional, comentado por ahora)
  // const protection = headerRange.protect().setDescription('Header protegido');
  // protection.removeEditors(protection.getEditors());
  // if (protection.canDomainEdit()) {
  //   protection.setDomainEdit(false);
  // }
}

/**
 * Ajustar anchos de columnas según el tipo de dato
 */
function adjustColumnWidths(sheet, sheetName, numColumns) {
  const defaultWidth = 100;
  const widths = [];
  
  switch (sheetName) {
    case SHEETS.SALES:
      widths = [80, 120, 100, 120, 120, 100, 80, 80, 100, 100, 100, 100, 100, 200, 150, 150, 100, 150];
      break;
    case SHEETS.ITEMS:
      widths = [80, 100, 100, 80, 100, 100, 100, 150];
      break;
    case SHEETS.INVENTORY:
      widths = [80, 100, 120, 200, 100, 100, 80, 80, 150, 100, 100, 100, 100, 100, 150, 150, 100, 150];
      break;
    case SHEETS.INVENTORY_LOG:
      widths = [80, 100, 120, 80, 200, 150];
      break;
    case SHEETS.EMPLOYEES:
      widths = [80, 200, 120, 100, 80, 120, 150];
      break;
    case SHEETS.USERS:
      widths = [80, 150, 100, 120, 80, 150];
      break;
    case SHEETS.REPAIRS:
      widths = [80, 120, 100, 100, 300, 100, 100, 150, 150, 100, 150];
      break;
    case SHEETS.COSTS:
      widths = [80, 100, 150, 100, 100, 100, 200, 150, 100, 150];
      break;
    case SHEETS.AUDIT_LOG:
      widths = [80, 100, 150, 120, 100, 300, 150];
      break;
    case SHEETS.TOURIST_DAILY_REPORTS:
      widths = [80, 100, 100, 100, 100, 300, 120, 120, 100, 100, 100, 150, 150, 100, 150];
      break;
    case SHEETS.TOURIST_DAILY_LINES:
      widths = [80, 100, 100, 120, 120, 100, 120, 80, 80, 200, 100, 100, 100, 100, 100, 100, 100, 100, 150];
      break;
    default:
      // Ancho por defecto para todas las columnas
      for (let i = 0; i < numColumns; i++) {
        widths.push(defaultWidth);
      }
  }
  
  // Aplicar anchos
  for (let i = 0; i < Math.min(widths.length, numColumns); i++) {
    sheet.setColumnWidth(i + 1, widths[i]);
  }
  
  // Si hay más columnas que anchos definidos, usar ancho por defecto
  for (let i = widths.length; i < numColumns; i++) {
    sheet.setColumnWidth(i + 1, defaultWidth);
  }
}

/**
 * Aplicar formato a columnas de datos (números, fechas, etc.)
 */
function applyDataFormatting(sheet, sheetName, numColumns) {
  // Obtener headers para identificar columnas
  const headers = sheet.getRange(1, 1, 1, numColumns).getValues()[0];
  
  headers.forEach((header, index) => {
    const colIndex = index + 1;
    const headerLower = header.toString().toLowerCase();
    
    // Columnas de moneda (precio, costo, total, monto, etc.)
    if (headerLower.includes('precio') || headerLower.includes('costo') || 
        headerLower.includes('total') || headerLower.includes('monto') ||
        headerLower.includes('subtotal') || headerLower.includes('descuento') ||
        headerLower.includes('cash') || headerLower.includes('tpv')) {
      const dataRange = sheet.getRange(2, colIndex, 10000, 1);
      dataRange.setNumberFormat('$#,##0.00');
    }
    
    // Columnas de porcentaje
    if (headerLower.includes('tipo cambio') || headerLower.includes('exchange_rate')) {
      const dataRange = sheet.getRange(2, colIndex, 10000, 1);
      dataRange.setNumberFormat('#,##0.00');
    }
    
    // Columnas de cantidad
    if (headerLower.includes('cantidad') || headerLower.includes('quantity') ||
        headerLower.includes('pasajeros') || headerLower.includes('passengers')) {
      const dataRange = sheet.getRange(2, colIndex, 10000, 1);
      dataRange.setNumberFormat('#,##0');
    }
    
    // Columnas de peso
    if (headerLower.includes('peso') || headerLower.includes('weight')) {
      const dataRange = sheet.getRange(2, colIndex, 10000, 1);
      dataRange.setNumberFormat('#,##0.00" g"');
    }
    
    // Columnas de fecha
    if (headerLower.includes('fecha') || headerLower.includes('date') ||
        headerLower.includes('created_at') || headerLower.includes('updated_at') ||
        headerLower.includes('sincronizado') || headerLower.includes('sync_at')) {
      const dataRange = sheet.getRange(2, colIndex, 10000, 1);
      // Formato de fecha y hora
      dataRange.setNumberFormat('yyyy-mm-dd hh:mm:ss');
    }
    
    // Columnas booleanas (activo/inactivo)
    if (headerLower.includes('activo') || headerLower.includes('active')) {
      const dataRange = sheet.getRange(2, colIndex, 10000, 1);
      dataRange.setNumberFormat('"Sí";"No"');
    }
  });
  
  // Formato general para todas las celdas de datos
  const dataRange = sheet.getRange(2, 1, 10000, numColumns);
  dataRange.setFontSize(10);
  dataRange.setVerticalAlignment('middle');
  dataRange.setWrap(false);
  
  // Bordes sutiles para datos
  dataRange.setBorder(null, null, null, null, null, true, '#E0E0E0', SpreadsheetApp.BorderStyle.SOLID);
}

/**
 * Procesar ventas
 */
function processSales(ss, records) {
  const sheet = ss.getSheetByName(SHEETS.SALES);
  const itemsSheet = ss.getSheetByName(SHEETS.ITEMS);
  
  if (!sheet || !itemsSheet) {
    return { success: false, error: 'Hojas no encontradas' };
  }
  
  let added = 0;
  let updated = 0;
  let skipped = 0;
  
  records.forEach(record => {
    // Verificar si ya existe (por folio)
    const folioCol = getColumnIndex(sheet, 'folio');
    const existingRow = findRowByValue(sheet, folioCol, record.folio);
    
    const rowData = [
      record.id,
      record.folio,
      record.branch_id || '',
      record.seller_id || '',
      record.agency_id || '',
      record.guide_id || '',
      record.passengers || 1,
      record.currency || 'MXN',
      record.exchange_rate || 1,
      record.subtotal || 0,
      record.discount || 0,
      record.total || 0,
      record.status || 'completada',
      record.notes || '',
      record.created_at || '',
      record.updated_at || '',
      record.device_id || 'unknown',
      new Date().toISOString()
    ];
    
    if (existingRow > 0) {
      // Actualizar
      sheet.getRange(existingRow, 1, 1, rowData.length).setValues([rowData]);
      updated++;
    } else {
      // Agregar
      sheet.appendRow(rowData);
      added++;
    }
    
    // Procesar items de la venta
    if (record.items && Array.isArray(record.items)) {
      record.items.forEach(item => {
        const itemRow = [
          item.id,
          record.id, // sale_id
          item.item_id,
          item.quantity || 1,
          item.price || 0,
          item.discount || 0,
          item.subtotal || 0,
          item.created_at || ''
        ];
        itemsSheet.appendRow(itemRow);
      });
    }
  });
  
  return { success: true, added, updated, skipped };
}

/**
 * Procesar inventario
 */
function processInventory(ss, records) {
  const sheet = ss.getSheetByName(SHEETS.INVENTORY);
  if (!sheet) {
    return { success: false, error: 'Hoja INVENTORY no encontrada' };
  }
  
  let added = 0;
  let updated = 0;
  
  records.forEach(record => {
    const skuCol = getColumnIndex(sheet, 'sku');
    const existingRow = findRowByValue(sheet, skuCol, record.sku);
    
    const rowData = [
      record.id,
      record.sku,
      record.barcode || '',
      record.name || '',
      record.metal || '',
      record.stone || '',
      record.size || '',
      record.weight_g || 0,
      record.measures || '',
      record.cost || 0,
      record.price || 0,
      record.location || '',
      record.status || 'disponible',
      record.branch_id || '',
      record.created_at || '',
      record.updated_at || '',
      record.device_id || 'unknown',
      new Date().toISOString()
    ];
    
    if (existingRow > 0) {
      sheet.getRange(existingRow, 1, 1, rowData.length).setValues([rowData]);
      updated++;
    } else {
      sheet.appendRow(rowData);
      added++;
    }
  });
  
  return { success: true, added, updated };
}

/**
 * Procesar empleados
 */
function processEmployees(ss, records) {
  const sheet = ss.getSheetByName(SHEETS.EMPLOYEES);
  if (!sheet) return { success: false, error: 'Hoja no encontrada' };
  
  records.forEach(record => {
    const idCol = getColumnIndex(sheet, 'id');
    const existingRow = findRowByValue(sheet, idCol, record.id);
    
    const rowData = [
      record.id,
      record.name || '',
      record.role || '',
      record.branch_id || '',
      record.active !== false,
      record.barcode || '',
      record.created_at || ''
    ];
    
    if (existingRow > 0) {
      sheet.getRange(existingRow, 1, 1, rowData.length).setValues([rowData]);
    } else {
      sheet.appendRow(rowData);
    }
  });
  
  return { success: true };
}

/**
 * Procesar reparaciones
 */
function processRepairs(ss, records) {
  const sheet = ss.getSheetByName(SHEETS.REPAIRS);
  if (!sheet) return { success: false, error: 'Hoja no encontrada' };
  
  records.forEach(record => {
    const folioCol = getColumnIndex(sheet, 'folio');
    const existingRow = findRowByValue(sheet, folioCol, record.folio);
    
    const rowData = [
      record.id,
      record.folio,
      record.customer_id || '',
      record.item_id || '',
      record.description || '',
      record.status || '',
      record.cost || 0,
      record.created_at || '',
      record.updated_at || '',
      record.device_id || 'unknown',
      new Date().toISOString()
    ];
    
    if (existingRow > 0) {
      sheet.getRange(existingRow, 1, 1, rowData.length).setValues([rowData]);
    } else {
      sheet.appendRow(rowData);
    }
  });
  
  return { success: true };
}

/**
 * Procesar costos
 */
function processCosts(ss, records) {
  const sheet = ss.getSheetByName(SHEETS.COSTS);
  if (!sheet) return { success: false, error: 'Hoja no encontrada' };
  
  records.forEach(record => {
    const rowData = [
      record.id,
      record.type || '',
      record.category || '',
      record.amount || 0,
      record.branch_id || '',
      record.date || '',
      record.notes || '',
      record.created_at || '',
      record.device_id || 'unknown',
      new Date().toISOString()
    ];
    
    sheet.appendRow(rowData);
  });
  
  return { success: true };
}

/**
 * Procesar reportes turistas
 */
function processTouristReports(ss, records) {
  const reportSheet = ss.getSheetByName(SHEETS.TOURIST_DAILY_REPORTS);
  const linesSheet = ss.getSheetByName(SHEETS.TOURIST_DAILY_LINES);
  
  if (!reportSheet || !linesSheet) {
    return { success: false, error: 'Hojas no encontradas' };
  }
  
  records.forEach(record => {
    const idCol = getColumnIndex(reportSheet, 'id');
    const existingRow = findRowByValue(reportSheet, idCol, record.id);
    
    const reportRow = [
      record.id,
      record.date || '',
      record.branch_id || '',
      record.exchange_rate || 0,
      record.status || '',
      record.observations || '',
      record.total_cash_usd || 0,
      record.total_cash_mxn || 0,
      record.subtotal || 0,
      record.additional || 0,
      record.total || 0,
      record.created_at || '',
      record.updated_at || '',
      record.device_id || 'unknown',
      new Date().toISOString()
    ];
    
    if (existingRow > 0) {
      reportSheet.getRange(existingRow, 1, 1, reportRow.length).setValues([reportRow]);
    } else {
      reportSheet.appendRow(reportRow);
    }
    
    // Procesar líneas
    if (record.lines && Array.isArray(record.lines)) {
      record.lines.forEach(line => {
        const lineRow = [
          line.id,
          record.id, // report_id
          line.sale_id || '',
          line.identification || '',
          line.seller_id || '',
          line.guide_id || '',
          line.agency_id || '',
          line.quantity || 0,
          line.weight_g || 0,
          line.products || '',
          line.exchange_rate || 0,
          line.cash_eur || 0,
          line.cash_cad || 0,
          line.cash_usd || 0,
          line.cash_mxn || 0,
          line.tpv_visa_mc || 0,
          line.tpv_amex || 0,
          line.total || 0,
          line.created_at || ''
        ];
        linesSheet.appendRow(lineRow);
      });
    }
  });
  
  return { success: true };
}

/**
 * Utilidades
 */
function getColumnIndex(sheet, columnName) {
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  return headers.indexOf(columnName) + 1;
}

function findRowByValue(sheet, columnIndex, value) {
  if (columnIndex === 0) return 0;
  const data = sheet.getRange(2, columnIndex, sheet.getLastRow() - 1, 1).getValues();
  for (let i = 0; i < data.length; i++) {
    if (data[i][0] === value) {
      return i + 2; // +2 porque empieza en fila 2 (después del header)
    }
  }
  return 0;
}

