const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory() && !fullPath.includes('node_modules') && !fullPath.includes('.git') && !fullPath.includes('.expo')) {
      results = results.concat(walk(fullPath));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.jsx') || file.endsWith('.js')) {
      results.push(fullPath);
    }
  });
  return results;
}

const files = walk(path.join(__dirname, '../app')).concat(walk(path.join(__dirname, '../components')));
let modified = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('import {') && content.includes('react-native') && content.includes('Text')) {
    // 1. Calculate relative path to components/ui/Text
    const relativePath = path.relative(path.dirname(file), path.join(__dirname, '../components/ui/Text')).replace(/\\/g, '/');
    const importPath = relativePath.startsWith('.') ? relativePath : './' + relativePath;

    // 2. We don't want to modify the custom Text component itself
    if (file.endsWith('Text.tsx') && file.includes('components\\ui')) return;

    // 3. Simple hack: If we find import { ... Text ... } from "react-native", we add our own import below it.
    // BUT we must avoid conflict. We can't have `import { Text }` from both.
    // Instead of parsing, let's just use regex to remove Text and TextInput from react-native imports.
    let changed = false;

    // Find the react-native import block
    const rnImportRegex = /import\s+\{([^}]+)\}\s+from\s+['"]react-native['"];?/g;
    content = content.replace(rnImportRegex, (match, importsStr) => {
      let imports = importsStr.split(',').map(s => s.trim()).filter(Boolean);
      
      const hasText = imports.includes('Text');
      const hasTextInput = imports.includes('TextInput');
      
      if (!hasText && !hasTextInput) return match;

      imports = imports.filter(i => i !== 'Text' && i !== 'TextInput');
      changed = true;
      
      let newRnImport = '';
      if (imports.length > 0) {
        newRnImport = `import { ${imports.join(', ')} } from "react-native";\n`;
      }
      
      let customImports = [];
      if (hasText) customImports.push('Text');
      if (hasTextInput) customImports.push('TextInput');
      
      return newRnImport + `import { ${customImports.join(', ')} } from "${importPath}";`;
    });

    if (changed) {
      fs.writeFileSync(file, content, 'utf8');
      modified++;
    }
  }
});

console.log(`Updated ${modified} files.`);
