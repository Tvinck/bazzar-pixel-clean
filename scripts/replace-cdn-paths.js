import fs from 'fs';
import path from 'path';

const files = [
  'src/views/HomeView.jsx',
  'src/views/TemplateView.jsx',
  'src/components/TemplateDrawer.jsx',
  'src/views/AdminView.jsx'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf-8');
  let original = content;

  // Add import if not exists
  if (!content.includes('getCDNUrl')) {
    // find a good place to insert import: after the first set of imports, or just near top
    const importRegex = /(import .*? from .*?;?\n+)/g;
    let match;
    let lastIndex = 0;
    while ((match = importRegex.exec(content)) !== null) {
        lastIndex = importRegex.lastIndex;
    }
    
    // figure out depth
    const depth = file.split('/').length - 2;
    const prefix = depth === 1 ? '../' : '../../';
    
    const importStatement = `import { getCDNUrl } from '${prefix}hooks/useCDN';\n`;
    content = content.slice(0, lastIndex) + importStatement + content.slice(lastIndex);
  }

  // Replacements
  // <img src={item.src} 
  content = content.replace(/src=\{item\.src\}/g, 'src={getCDNUrl(item.src)} loading="lazy" decoding="async"');
  // <img src={t.src} 
  content = content.replace(/src=\{t\.src\}/g, 'src={getCDNUrl(t.src)} loading="lazy" decoding="async"');
  // <img src={template.src} 
  content = content.replace(/src=\{template\.src\}/g, 'src={getCDNUrl(template.src)} loading="lazy" decoding="async"');
  // src={previewUrls[i]}
  content = content.replace(/src=\{previewUrls\[i\]\}/g, 'src={getCDNUrl(previewUrls[i])} loading="lazy" decoding="async"');
  // <video src={`${t.src}#t=0.0,0.1`}
  content = content.replace(/src=\{`\$\{t\.src\}#t=0\.0,0\.1`\}/g, 'src={`${getCDNUrl(t.src)}#t=0.0,0.1`}');
  // <video src={editingTemplate.src}
  content = content.replace(/src=\{editingTemplate\.src\}/g, 'src={getCDNUrl(editingTemplate.src)}');

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf-8');
    console.log(`Updated ${file}`);
  }
}
