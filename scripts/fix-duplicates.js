import fs from 'fs';
import path from 'path';

function removeComponentDef(file, regex) {
  let content = fs.readFileSync(file, 'utf8');
  let newContent = content.replace(regex, '');
  if (content !== newContent) {
    fs.writeFileSync(file, newContent, 'utf8');
    console.log('Fixed', file);
  }
}

// HomeView
removeComponentDef('src/views/HomeView.jsx', /\/\/ Generic Row\nconst BlockRow[\s\S]*?<\/[bB]utton>\n\);\n/g);
removeComponentDef('src/views/HomeView.jsx', /\/\/ Generic Block\nconst Block[\s\S]*?<\/div>\n\);\n/g);

// ProfileView
removeComponentDef('src/views/ProfileView.jsx', /\/\/ iOS-style List Row\nconst ListRow[\s\S]*?<\/[bB]utton>\n\);\n/g);
removeComponentDef('src/views/ProfileView.jsx', /\/\/ iOS-style List Block\nconst ListBlock[\s\S]*?<\/div>\n\);\n/g);

// CreateView - just in case
removeComponentDef('src/views/CreateView.jsx', /\/\/ Generic Row\nconst BlockRow[\s\S]*?<\/[bB]utton>\n\);\n/g);
