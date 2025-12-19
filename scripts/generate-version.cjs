const fs = require('fs');
const path = require('path');

const pkgPath = path.resolve(__dirname, '../package.json');

const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
const version = pkg.version;

const out = `export const version: string = "${version}";\n`;

const outputPath = path.resolve(__dirname, '../src/_version.ts');

fs.writeFileSync(outputPath, out);

console.log(`✅ Generated ${outputPath} (version: ${version})`);
