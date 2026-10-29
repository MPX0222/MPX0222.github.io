import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import vm from 'node:vm';

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

const fallbackMatch = html.match(/\/\/ 不蒜子统计：[\s\S]*?\(\(\) => \{[\s\S]*?\}\)\(\);/);
check('includes busuanzi cache + auto-retry fallback block', Boolean(fallbackMatch));

if (fallbackMatch) {
  // Scenario 1: Initial load times out -> shows cached value first -> retry succeeds and updates DOM + cache
  const elements = {
    busuanzi_site_uv: { innerText: '' },
    busuanzi_site_pv: { innerText: '' },
  };
  const storage = new Map([
    ['busuanzi_cache_v1', JSON.stringify({ busuanzi_site_uv: '10', busuanzi_site_pv: '25' })],
  ]);
  const scheduled = [];
  let fetchCalls = 0;

  const ctx = {
    document: {
      getElementById: (id) => elements[id] || null,
      referrer: '',
    },
    location: { href: 'https://mpx0222.github.io/' },
    localStorage: {
      getItem: (k) => (storage.has(k) ? storage.get(k) : null),
      setItem: (k, v) => storage.set(k, String(v)),
    },
    setTimeout: (fn) => {
      scheduled.push(fn);
      return scheduled.length;
    },
    fetch: async () => {
      fetchCalls += 1;
      if (fetchCalls === 1) {
        return { ok: false, status: 524 };
      }
      return {
        ok: true,
        status: 200,
        json: async () => ({ busuanzi_site_uv: 42, busuanzi_site_pv: 108 }),
      };
    },
  };

  vm.createContext(ctx);
  vm.runInContext(fallbackMatch[0], ctx);

  // Trigger the 4000ms fallback check
  const mainTimer = scheduled.shift();
  const promise = mainTimer();
  check(
    'populates cached values immediately when initial request timed out',
    elements.busuanzi_site_uv.innerText === '10' && elements.busuanzi_site_pv.innerText === '25'
  );

  // Flush retry delay timer
  await new Promise((r) => setImmediate(r));
  while (scheduled.length) {
    scheduled.shift()();
    await new Promise((r) => setImmediate(r));
  }
  await promise;

  check(
    'retries in background and updates DOM when retry succeeds',
    fetchCalls === 2 && elements.busuanzi_site_uv.innerText === '42' && elements.busuanzi_site_pv.innerText === '108'
  );
  check(
    'persists latest live values into localStorage',
    JSON.parse(storage.get('busuanzi_cache_v1')).busuanzi_site_pv === '108'
  );
}

if (failed) {
  console.log(`FAILED: ${failed}`);
  process.exit(1);
}
console.log('ALL PASSED');
