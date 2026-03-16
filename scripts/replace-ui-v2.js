import fs from 'fs';
import path from 'path';

function walkDir(dir, callback) {
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

const replacements = [
  { from: /bg-\[\#1c1c1e\]/g, to: 'bg-bg-secondary' },
  { from: /bg-\[\#2c2c2e\]/g, to: 'bg-bg-elevated' },
  { from: /rounded-\[14px\]/g, to: 'rounded-card' },
  { from: /rounded-\[10px\]/g, to: 'rounded-input' },
  { from: /rounded-\[16px\]/g, to: 'rounded-card' },
  { from: /rounded-\[12px\]/g, to: 'rounded-input' },
  { from: /rounded-\[20px\]/g, to: 'rounded-card' }, // Overlap, but better than literal
  { from: /bg-\[\#007aff\]/g, to: 'bg-accent-blue' },
  { from: /text-\[\#007aff\]/g, to: 'text-accent-blue' },
  { from: /border-\[\#007aff\]/g, to: 'border-accent-blue' },
  { from: /bg-purple-500/g, to: 'bg-accent-purple' },
  { from: /text-purple-500/g, to: 'text-accent-purple' },
  { from: /hover:bg-blue-600/g, to: 'hover:bg-accent-blue' }
];

walkDir('./src', function(filePath) {
  if (filePath.endsWith('.js') || filePath.endsWith('.jsx') || filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    if (filePath.includes('src/components/ui/')) return;
    
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    replacements.forEach(r => {
      content = content.replace(r.from, r.to);
    });

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Updated', filePath);
    }
  }
});
