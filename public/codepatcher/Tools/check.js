// تشغيل: node public/codepatcher/Tools/check.js
// يفحص صياغة ملفات JavaScript، تسجيلها في index.html وsw.js، وتكرار الأسماء العامة.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const html = read('index.html');
const sw = read('sw.js');
let bad = 0;
const fail = message => { bad++; console.error('✗ ' + message); };
const jsFiles = fs.readdirSync(path.join(root, 'js')).filter(file => file.endsWith('.js')).sort();
const cssFiles = fs.readdirSync(path.join(root, 'css')).filter(file => file.endsWith('.css'));
const seen = Object.create(null);

for (const file of jsFiles) {
  const result = spawnSync(process.execPath, ['--check', path.join(root, 'js', file)], { encoding: 'utf8' });
  if (result.error || result.status !== 0) {
    fail(file + ': خطأ صياغة\\n' + String(result.stderr || result.error || '').split('\\n').slice(0, 4).join('\\n'));
  }
  if (!html.includes(`src="js/${file}"`)) fail(file + ': غير مضاف في index.html');
  if (!sw.includes(`./js/${file}`)) fail(file + ': غير مضاف في قائمة sw.js');
  for (const match of read('js/' + file).matchAll(/^(?:async function|function|class|const|let|var) +([A-Za-z_$][\\w$]*)/gm)) {
    const name = match[1];
    if (seen[name]) fail(`الاسم ${name} مكرر: ${seen[name]} و ${file}`);
    else seen[name] = file;
  }
}

const order = [...html.matchAll(/src="js\\/([^"]+)"/g)].map(match => match[1]);
if (order.join() !== jsFiles.join()) fail('ترتيب script في index.html لا يطابق ترتيب أسماء الملفات');
for (const file of cssFiles) {
  if (!html.includes(`css/${file}`)) fail(file + ': غير مضاف في index.html');
  if (!sw.includes(`./css/${file}`)) fail(file + ': غير مضاف في sw.js');
}

console.log(bad ? `\\n${bad} مشكلة` : `✓ سليم: ${jsFiles.length} ملف JS و ${cssFiles.length} ملف CSS`);
process.exit(bad ? 1 : 0);
