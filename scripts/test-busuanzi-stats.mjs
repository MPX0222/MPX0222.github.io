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

check(
  'loads busuanzi.cc 3.6.9 script with defer',
  /<script\b[^>]*src=["'](?:https?:)?\/\/cdn\.busuanzi\.cc\/busuanzi\/3\.6\.9\/busuanzi(?:\.abbr)?\.min\.js["'][^>]*\bdefer\b/i.test(html)
);
check(
  'uses busuanzi_site_uv and busuanzi_site_pv ids',
  html.includes('id="busuanzi_site_uv"') && html.includes('id="busuanzi_site_pv"')
);
check(
  'does not use legacy busuanzi_value_* ids',
  !html.includes('busuanzi_value_site_uv') && !html.includes('busuanzi_value_site_pv')
);
check(
  'does not hardcode display:none on busuanzi containers',
  !/id="busuanzi_container_site_(?:uv|pv)"[^>]*display\s*:\s*none/i.test(html)
);
check(
  'styles busuanzi_site_* value spans and hides empty containers',
  css.includes('.visitor-stats span[id^="busuanzi_site_"]') &&
    css.includes('.visitor-stats > span:has(> span:empty)')
);

if (failed) {
  console.log(`FAILED: ${failed}`);
  process.exit(1);
}
console.log('ALL PASSED');
