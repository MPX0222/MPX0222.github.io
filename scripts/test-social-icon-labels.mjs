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

const labels = ['GitHub', 'Google Scholar', 'LinkedIn', 'CV'];
labels.forEach((label) => {
  check(`label ${label}`, html.includes(`class="social-icon-label">${label}</span>`));
});
check('exactly 4 social labels', (html.match(/class="social-icon-label"/g) || []).length === 4);
check(
  'label uses Sansation like research-unit',
  /\.social-icon-label\s*\{[^}]*font-family:\s*var\(--font-sansation\)/.test(css)
    && /\.research-unit\s*\{[^}]*font-family:\s*var\(--font-sansation\)/.test(css)
);
check(
  'social icons stay on one row',
  /\.social-icons-grid\s*\{[^}]*flex-wrap:\s*nowrap/.test(css)
    && /max-width:\s*none\s*!important/.test(css)
);

if (failed) {
  console.log(`FAILED: ${failed}`);
  process.exit(1);
}
console.log('ALL PASSED');
