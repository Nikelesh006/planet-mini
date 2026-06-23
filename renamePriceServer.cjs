const fs = require('fs');
const path = require('path');

const files = [
  path.resolve(__dirname, 'server/storage.ts'),
  path.resolve(__dirname, 'server/routes.ts')
];

let updatedCount = 0;

files.forEach(f => {
  if (!fs.existsSync(f)) return;
  
  let content = fs.readFileSync(f, 'utf8');
  let original = content;

  // Replacements
  content = content.replace(/\bprice: item\.price\b/g, 'sellingPrice: item.sellingPrice');
  content = content.replace(/\bprice: 2999\b/g, 'sellingPrice: 2999');
  content = content.replace(/\bprice: 1599\b/g, 'sellingPrice: 1599');
  content = content.replace(/\bprice: 0\b/g, 'sellingPrice: 0');
  content = content.replace(/\bitem\.price\b/g, 'item.sellingPrice');
  content = content.replace(/\bproduct\.price\b/g, 'product.sellingPrice');
  content = content.replace(/\bproduct\.originalPrice\b/g, 'product.mrp');
  
  if (content !== original) {
    fs.writeFileSync(f, content, 'utf8');
    console.log(`Updated: ${path.relative(__dirname, f)}`);
    updatedCount++;
  }
});

console.log(`Total server files updated: ${updatedCount}`);
