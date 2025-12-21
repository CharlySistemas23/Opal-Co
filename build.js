const fs = require('fs');
const path = require('path');

// Crear directorio public si no existe
const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Función para copiar archivos y directorios
function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  
  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach(childItemName => {
      copyRecursiveSync(
        path.join(src, childItemName),
        path.join(dest, childItemName)
      );
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

// Archivos y directorios a copiar
const itemsToCopy = [
  'index.html',
  'css',
  'js',
  'libs',
  'assets'
];

// Copiar cada item
itemsToCopy.forEach(item => {
  const src = path.join(__dirname, item);
  const dest = path.join(publicDir, item);
  
  if (fs.existsSync(src)) {
    console.log(`Copiando ${item}...`);
    copyRecursiveSync(src, dest);
  } else {
    console.warn(`Advertencia: ${item} no existe, omitiendo...`);
  }
});

console.log('Build completado. Archivos copiados a public/');

