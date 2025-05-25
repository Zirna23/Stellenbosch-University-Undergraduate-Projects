// fix-imports.js
const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'dist');

function fixImports(dirPath) {
  fs.readdirSync(dirPath).forEach(file => {
    const fullPath = path.join(dirPath, file);

    if (fs.lstatSync(fullPath).isDirectory()) {
      fixImports(fullPath); // Recursively fix imports in subdirectories
    } else if (file.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      // Add `.js` to all relative imports, handling both single and double quotes
      content = content.replace(/(from\s+["]\..+?)["]/g, '$1.js"').replace(/(from\s+[']\..+?)[']/g, '$1.js\'');
      fs.writeFileSync(fullPath, content, 'utf8');
    }
  });
}

fixImports(directoryPath);
console.log('Imports fixed with .js extensions.');
