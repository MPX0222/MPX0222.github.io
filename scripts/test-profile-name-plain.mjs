import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'css/styles.css'), 'utf8');

let failed = 0;
function check(name, cond) {
  console.log(`${cond ? 'PASS' : 'FAIL'}: ${name}`);
  if (!cond) failed += 1;
}

check('heading is English only', /<h1 class="profile-name">Peixian Ma<\/h1>/.test(html));
check('Chinese name markup is gone', !html.includes('profile-name-zh') && !html.includes('马培贤</span>'));
check('Chinese name styles are gone', !css.includes('.profile-name-zh') && !css.includes('.profile-name-sep'));
check('homepage no longer loads Noto Serif SC for the name', !html.includes('Noto+Serif+SC'));

if (failed) {
  console.log(`FAILED: ${failed}`);
  process.exit(1);
}
console.log('ALL PASSED');
