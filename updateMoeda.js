const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'interface', 'src');

function findAndReplaceFiles(dir, regex, replacement) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      findAndReplaceFiles(filePath, regex, replacement);
    } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
      let content = fs.readFileSync(filePath, 'utf8');
      if (regex.test(content)) {
        content = content.replace(regex, replacement);
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated: ${filePath}`);
      }
    }
  }
}

// Regex to find the formatarMoeda function (matching `const formatarMoeda = (valor) => { ... }`)
// We'll replace it with a fixed one that divides by 100.
const formatRegex = /const formatarMoeda\s*=\s*\([a-zA-Z_]+\)\s*=>\s*\{\s*return new Intl\.NumberFormat\('pt-BR',\s*\{\s*style:\s*'currency',\s*currency:\s*'BRL'\s*\}\)\.format\(Number\([a-zA-Z_]+\)\);\s*\}/g;

const newFormat = `const formatarMoeda = (valorCents) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(Number(valorCents) / 100);
}`;

findAndReplaceFiles(srcDir, formatRegex, newFormat);
console.log('Update completed for formatarMoeda.');

// Custom for VisaoClientes
const visaoClientesPath = path.join(srcDir, 'componentes', 'Paineis', 'VisaoClientes.jsx');
let vcContent = fs.readFileSync(visaoClientesPath, 'utf8');
vcContent = vcContent.replace(/Number\(h\.valorTotal\)\.toFixed\(2\)/g, '(Number(h.valorTotal) / 100).toFixed(2)');
vcContent = vcContent.replace(/reduce\(\(acc, current\) => acc \+ Number\(current\.valorTotal\), 0\)\.toFixed\(2\)/g, 'reduce((acc, current) => acc + (Number(current.valorTotal) / 100), 0).toFixed(2)');
fs.writeFileSync(visaoClientesPath, vcContent, 'utf8');

console.log('Update completed for VisaoClientes.');
