import fs from 'fs';
import path from 'path';

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir('./src', function(filePath) {
  if (filePath.endsWith('.js') || filePath.endsWith('.jsx') || filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    if (filePath.includes('src/components/ui/')) return; // Skip new UI kit
    
    let originalListRowPath = null;
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    content = content.replace(/bg-\[\#1c1c1e\]/g, 'bg-bg-secondary');
    content = content.replace(/bg-\[\#2c2c2e\]/g, 'bg-bg-elevated');
    content = content.replace(/rounded-\[14px\]/g, 'rounded-card');
    content = content.replace(/rounded-\[10px\]/g, 'rounded-input');
    
    // Replace BlockRow with ListRow component usage
    if (content.includes('<BlockRow')) {
        content = content.replace(/<BlockRow/g, '<ListRow');
        content = content.replace(/<\/BlockRow>/g, '</ListRow>');
    }
    
    // Fix imports if BlockRow was used or ListRow was locally defined
    // We can't automatically fix all imports easily, but we'll try to add the auto-import if ListRow is used.
    if (content.includes('<ListRow') && !content.includes('import { ListRow }') && !content.includes('import ListRow')) {
        // Quick check: if the file defines ListRow (like in ProfileView), we might need to remove it or let user manually fix it.
        // The prompt says "заменит BlockRow и ListRow". In HomeView it was BlockRow.
        const depth = filePath.split('/').length - 2;
        const prefix = depth === 1 ? '../' : '../../';
        // Add import { ListRow } from ...
        // Wait, the index export is `export { default as ListRow } from './ListRow';`
        const importStatement = `import { ListRow } from '${prefix}components/ui';\n`;
        const importRegex = /(import .*? from .*?;?\n)/;
        content = content.replace(importRegex, `$1${importStatement}`);
    }

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Updated', filePath);
    }
  }
});
