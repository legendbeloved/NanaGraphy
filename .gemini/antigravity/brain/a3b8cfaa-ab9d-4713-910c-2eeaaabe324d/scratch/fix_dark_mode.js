const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? 
      walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

function processFile(filePath) {
  if (!filePath.endsWith('.tsx')) return;
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Skip if we already added dark:bg-cream to these specific strings to avoid duplicates
  if (content.includes('bg-ink text-cream dark:bg-cream')) return;
  
  let newContent = content.replace(/bg-ink text-cream/g, 'bg-ink text-cream dark:bg-cream dark:text-ink');
  
  if (content !== newContent) {
    fs.writeFileSync(filePath, newContent, 'utf-8');
    console.log('Fixed:', filePath);
  }
}

walkDir(path.join(__dirname, '../../../../src'), processFile);
console.log('Done!');
