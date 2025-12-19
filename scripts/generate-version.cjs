const fs = require('fs');
const path = require('path');

const pkgPath = path.resolve(__dirname, '../package.json');

const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
const version = pkg.version;

const out = `// This file is auto-generated
export const version: string = "${version}";
export const sdkName: string = "${pkg.name}";\n`;

const outputPath = path.resolve(__dirname, '../src/_version.ts');

fs.writeFileSync(outputPath, out);

console.log(`✅ Generated ${outputPath} (version: ${version})`);
