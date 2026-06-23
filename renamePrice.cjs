const fs = require('fs');
const path = require('path');

function walkSync(dir, filelist = []) {
  fs.readdirSync(dir).forEach(file => {
    const dirFile = path.join(dir, file);
    try {
      filelist = fs.statSync(dirFile).isDirectory()
        ? walkSync(dirFile, filelist)
        : filelist.concat(dirFile);
    } catch (err) {
      if (err.code === 'ENOENT' || err.code === 'EACCES') {
        console.warn(`Cannot access ${dirFile}`);
      } else {
        throw err;
      }
    }
  });
  return filelist;
}

const targetDir = path.resolve(__dirname, 'client/src/pages');
const files = walkSync(targetDir).filter(f => f.endsWith('.tsx') || f.endsWith('.ts'));

let updatedCount = 0;

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  let original = content;

  // Replacements
  content = content.replace(/\bproduct\.price\b/g, 'product.sellingPrice');
  content = content.replace(/\bproduct\.originalPrice\b/g, 'product.mrp');
  content = content.replace(/\bitem\.price\b/g, 'item.sellingPrice');
  content = content.replace(/\bitem\.originalPrice\b/g, 'item.mrp');
  content = content.replace(/\bformData\.price\b/g, 'formData.sellingPrice');
  content = content.replace(/\bformData\.originalPrice\b/g, 'formData.mrp');
  
  // Specific declarations
  content = content.replace(/\bprice: Number\(/g, 'sellingPrice: Number(');
  content = content.replace(/\boriginalPrice: product\./g, 'mrp: product.');
  content = content.replace(/price: (\d+)/g, 'sellingPrice: $1');
  
  // Interface/Type definitions
  content = content.replace(/price: number/g, 'sellingPrice: number');
  
  if (content !== original) {
    fs.writeFileSync(f, content, 'utf8');
    console.log(`Updated: ${path.relative(targetDir, f)}`);
    updatedCount++;
  }
});

console.log(`Total pages updated: ${updatedCount}`);
