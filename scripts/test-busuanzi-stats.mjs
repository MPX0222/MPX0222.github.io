import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(join(root, 'index.html'), 'utf8');
const css = readFileSync(join(root, 'css/styles.css'), 'utf8');

let failed = 0;
function check(name, cond) {
  console.log(`${cond ? 'PASS' : 'FAIL'}: ${name}`);
  if (!cond) failed += 1;
}

check('homepage does not load the busuanzi script', !/busuanzi/i.test(html));
check('homepage does not render visitor stats', !html.includes('visitor-stats') && !html.includes('Visitors') && !html.includes('Views'));
check('stylesheet no longer styles visitor stats', !css.includes('visitor-stats') && !/busuanzi/i.test(css));

if (failed) {
  console.log(`FAILED: ${failed}`);
  process.exit(1);
}
console.log('ALL PASSED');
