import { createServer } from 'http';
import { spawn } from 'child_process';
import { existsSync, readFileSync, mkdirSync } from 'fs';
import { extname, join } from 'path';
import { tmpdir } from 'os';
import { fileURLToPath } from 'url';

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..');

let failed = 0;
function check(name, cond, detail) {
  console.log(`${cond ? 'PASS' : 'FAIL'}: ${name}${detail ? ' [' + detail + ']' : ''}`);
  if (!cond) failed += 1;
}

const types = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.ico': 'image/x-icon', '.svg': 'image/svg+xml'
};

const server = createServer((req, res) => {
  const pathname = decodeURIComponent(new URL(req.url, 'http://127.0.0.1').pathname);
  const file = join(root, pathname.replace(/^[/\\]+/, ''));
  if (!file.startsWith(root) || !existsSync(file)) { res.writeHead(404); res.end('missing'); return; }
  res.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream' });
  res.end(readFileSync(file));
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const port = server.address().port;

const debugPort = 20000 + Math.floor(Math.random() * 20000);
const profile = join(tmpdir(), `pub-search-${Date.now()}`);
mkdirSync(profile, { recursive: true });
const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new', '--no-sandbox', '--disable-gpu', '--no-first-run',
  '--window-size=1280,2400', '--remote-allow-origins=*', `--remote-debugging-port=${debugPort}`,
  `--user-data-dir=${profile}`, `http://127.0.0.1:${port}/pages/publications.html`
], { stdio: 'ignore' });

const send = (ws, method, params = {}) => new Promise((resolve, reject) => {
  const id = send.nextId = (send.nextId || 0) + 1;
  const timer = setTimeout(() => reject(new Error('CDP timeout')), 10000);
  const onMessage = (event) => {
    const message = JSON.parse(String(event.data));
    if (message.id !== id) return;
    clearTimeout(timer);
    ws.removeEventListener('message', onMessage);
    if (message.error) reject(new Error(JSON.stringify(message.error)));
    else resolve(message.result);
  };
  ws.addEventListener('message', onMessage);
  ws.send(JSON.stringify({ id, method, params }));
});

let ws;
try {
  let page;
  for (let i = 0; i < 40; i += 1) {
    try {
      const listed = await fetch(`http://127.0.0.1:${debugPort}/json/list`).then((r) => r.json());
      page = listed.find((e) => e.type === 'page');
      if (page) break;
    } catch { }
    await new Promise((r) => setTimeout(r, 250));
  }
  if (!page) throw new Error('no page');
  ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.addEventListener('open', resolve, { once: true });
    ws.addEventListener('error', reject, { once: true });
  });
  await send(ws, 'Page.enable');

  for (let i = 0; i < 60; i += 1) {
    try {
      const r = await send(ws, 'Runtime.evaluate', {
        expression: `(() => { const h = document.querySelector('detailed-publication-list'); return Boolean(h && h.shadowRoot && h.shadowRoot.querySelector('.publication-item')); })()`,
        returnByValue: true
      });
      if (r.result.value) break;
    } catch (error) {
      if (!/destroyed|context/i.test(error.message)) throw error;
    }
    await new Promise((r) => setTimeout(r, 250));
  }

  const state = await send(ws, 'Runtime.evaluate', {
    returnByValue: true,
    expression: `(() => ({
      subtitleGone: !document.querySelector('.publications-header p:not(.publication-search-empty)'),
      headerDividerGone: (() => { const h = document.querySelector('.publications-header'); return h && getComputedStyle(h).borderBottomStyle === 'none'; })(),
      searchPresent: Boolean(document.getElementById('publication-search-input')),
      totalItems: (() => { const h = document.querySelector('detailed-publication-list'); return h.shadowRoot.querySelectorAll('.publication-item').length; })()
    }))()`
  });
  const s0 = state.result.value;
  console.log('INIT:', JSON.stringify(s0));
  check('old subtitle paragraph removed', s0.subtitleGone);
  check('header divider line removed', s0.headerDividerGone);
  check('search box is present', s0.searchPresent);
  check('all publications render initially', s0.totalItems === 11, String(s0.totalItems));

  // 逐字段搜索：标题 / 作者 / venue / 年份
  async function search(term) {
    const r = await send(ws, 'Runtime.evaluate', {
      awaitPromise: true,
      returnByValue: true,
      expression: `(async () => {
        const input = document.getElementById('publication-search-input');
        input.value = ${JSON.stringify(term)};
        input.dispatchEvent(new Event('input', { bubbles: true }));
        await new Promise((r) => setTimeout(r, 400));
        const h = document.querySelector('detailed-publication-list');
        return {
          count: h.shadowRoot.querySelectorAll('.publication-item').length,
          firstTitle: h.shadowRoot.querySelector('.publication-item .publication-title')?.textContent.trim() || '',
          clearVisible: !document.getElementById('publication-search-clear').hidden
        };
      })()`
    });
    return r.result.value;
  }

  const byTitle = await search('SQL-R1');
  console.log('TITLE:', JSON.stringify(byTitle));
  check('search by title matches', byTitle.count === 1 && byTitle.firstTitle.includes('SQL-R1'), byTitle.firstTitle);
  check('clear button appears while searching', byTitle.clearVisible);

  const byAuthor = await search('Nakov');
  check('search by author matches', byAuthor.count === 1, `${byAuthor.count} item(s)`);

  const byVenue = await search('TKDE');
  check('search by venue matches', byVenue.count === 1, `${byVenue.count} item(s)`);

  const byYear = await search('2023');
  check('search by year matches', byYear.count === 1, `${byYear.count} item(s)`);

  // 空结果提示
  const none = await search('zzz-no-such-paper');
  const emptyShown = await send(ws, 'Runtime.evaluate', {
    returnByValue: true,
    expression: `!document.getElementById('publication-search-empty').hidden`
  });
  check('no-match query shows empty hint', none.count === 0 && emptyShown.result.value);

  // 清除按钮
  const cleared = await send(ws, 'Runtime.evaluate', {
    awaitPromise: true,
    returnByValue: true,
    expression: `(async () => {
      document.getElementById('publication-search-clear').click();
      await new Promise((r) => setTimeout(r, 300));
      const h = document.querySelector('detailed-publication-list');
      return {
        count: h.shadowRoot.querySelectorAll('.publication-item').length,
        inputEmpty: document.getElementById('publication-search-input').value === '',
        clearHidden: document.getElementById('publication-search-clear').hidden,
        emptyHidden: document.getElementById('publication-search-empty').hidden
      };
    })()`
  });
  const c = cleared.result.value;
  check('clear button restores the full list', c.count === 11 && c.inputEmpty, String(c.count));
  check('clear button hides itself and the empty hint', c.clearHidden && c.emptyHidden);

  // 搜索 + 过滤联动：先选 Conference，再搜 SQL-R1（NeurIPS conference 论文，应保留）
  const combo = await send(ws, 'Runtime.evaluate', {
    awaitPromise: true,
    returnByValue: true,
    expression: `(async () => {
      document.querySelector('.filter-button[data-filter="conference"]').click();
      await new Promise((r) => setTimeout(r, 300));
      const h = document.querySelector('detailed-publication-list');
      const confOnly = h.shadowRoot.querySelectorAll('.publication-item').length;
      const input = document.getElementById('publication-search-input');
      input.value = 'SQL-R1';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      await new Promise((r) => setTimeout(r, 400));
      const confPlusSearch = h.shadowRoot.querySelectorAll('.publication-item').length;
      // Alzheimer 是 journal 论文，在 Conference 过滤下应被排除
      input.value = 'Alzheimer';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      await new Promise((r) => setTimeout(r, 400));
      const confPlusJournal = h.shadowRoot.querySelectorAll('.publication-item').length;
      document.querySelector('.filter-button[data-filter="all"]').click();
      await new Promise((r) => setTimeout(r, 300));
      const allPlusJournal = h.shadowRoot.querySelectorAll('.publication-item').length;
      return { confOnly, confPlusSearch, confPlusJournal, allPlusJournal };
    })()`
  });
  const cb = combo.result.value;
  console.log('COMBO:', JSON.stringify(cb));
  check('venue filter works alone', cb.confOnly >= 3, String(cb.confOnly));
  check('search combines with venue filter (SQL-R1 is conference → kept)', cb.confPlusSearch === 1, String(cb.confPlusSearch));
  check('journal paper excluded under conference filter (→ 0)', cb.confPlusJournal === 0, String(cb.confPlusJournal));
  check('switching to All restores the journal paper (→ 1)', cb.allPlusJournal === 1, String(cb.allPlusJournal));

  // 移动端搜索框可用性
  await send(ws, 'Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  await new Promise((r) => setTimeout(r, 300));
  const mobile = await send(ws, 'Runtime.evaluate', {
    returnByValue: true,
    expression: `(() => { const i = document.getElementById('publication-search-input'); const r = i.getBoundingClientRect(); return { visible: r.width > 200 && r.height >= 30, overflow: r.right > document.documentElement.clientWidth + 1 }; })()`
  });
  const m = mobile.result.value;
  check('mobile: search box is visible and does not overflow', m.visible && !m.overflow);
  await send(ws, 'Emulation.clearDeviceMetricsOverride');
} catch (error) {
  console.log(`FAIL: ${error.message}`);
  failed += 1;
} finally {
  ws?.close();
  server.close();
  spawn('taskkill', ['/PID', String(chrome.pid), '/T', '/F'], { stdio: 'ignore' });
}

if (failed) {
  console.log(`FAILED: ${failed}`);
  process.exit(1);
}
console.log('ALL PASSED');
