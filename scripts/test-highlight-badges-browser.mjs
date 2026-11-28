import { createServer } from 'http';
import { spawn, spawnSync } from 'child_process';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { extname, join, dirname } from 'path';
import { tmpdir } from 'os';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

let failed = 0;
function check(name, cond) {
  console.log(`${cond ? 'PASS' : 'FAIL'}: ${name}`);
  if (!cond) failed += 1;
}

function resolveChromeBinary() {
  const candidates = [
    process.env.CHROME_PATH,
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser'
  ].filter(Boolean);
  for (const candidate of candidates) {
    if (existsSync(candidate)) return candidate;
  }
  for (const bin of ['google-chrome', 'google-chrome-stable', 'chromium', 'chromium-browser', 'chrome']) {
    const probe = spawnSync(process.platform === 'win32' ? 'where' : 'which', [bin], { encoding: 'utf8' });
    if (probe.status === 0 && probe.stdout.trim()) {
      return probe.stdout.trim().split(/\r?\n/)[0];
    }
  }
  throw new Error('Chrome binary not found');
}

const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.svg': 'image/svg+xml'
};

const server = createServer((req, res) => {
  const pathname = decodeURIComponent(new URL(req.url, 'http://127.0.0.1').pathname);
  const file = join(root, pathname.replace(/^[/\\]+/, ''));
  if (!file.startsWith(root) || !existsSync(file)) {
    res.writeHead(404);
    res.end('missing');
    return;
  }
  res.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream' });
  res.end(readFileSync(file));
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const port = server.address().port;

const debugPort = 20000 + Math.floor(Math.random() * 20000);
const profile = join(tmpdir(), `highlight-badge-chrome-${Date.now()}`);
mkdirSync(profile, { recursive: true });
const chrome = spawn(resolveChromeBinary(), [
  '--headless=new',
  '--no-sandbox',
  '--disable-setuid-sandbox',
  '--disable-dev-shm-usage',
  '--disable-gpu',
  '--no-first-run',
  '--window-size=1280,2400',
  '--remote-allow-origins=*',
  `--remote-debugging-port=${debugPort}`,
  `--user-data-dir=${profile}`,
  `http://127.0.0.1:${port}/pages/publications.html`
], { stdio: 'ignore' });

const send = (ws, method, params = {}) => new Promise((resolve, reject) => {
  const id = send.nextId = (send.nextId || 0) + 1;
  const timer = setTimeout(() => {
    ws.removeEventListener('message', onMessage);
    reject(new Error(`CDP timeout: ${method}`));
  }, 10000);
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
      const listed = await fetch(`http://127.0.0.1:${debugPort}/json/list`, { signal: AbortSignal.timeout(1000) }).then((r) => r.json());
      page = listed.find((entry) => entry.type === 'page' && entry.url.includes('publications.html'));
      if (page) break;
    } catch { /* Chrome still starting */ }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  if (!page) throw new Error('Chrome did not open publications page');

  ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.addEventListener('open', resolve, { once: true });
    ws.addEventListener('error', reject, { once: true });
  });
  await send(ws, 'Page.enable');

  let ready = false;
  for (let i = 0; i < 40; i += 1) {
    try {
      const result = await send(ws, 'Runtime.evaluate', {
        expression: `(() => { const host = document.querySelector('detailed-publication-list'); return Boolean(host && host.shadowRoot && host.shadowRoot.querySelector('.publication-item')); })()`,
        returnByValue: true
      });
      if (result.result.value) { ready = true; break; }
    } catch (error) {
      if (!/destroyed|context/i.test(error.message)) throw error;
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  if (!ready) throw new Error('publications list did not render');

  const data = await send(ws, 'Runtime.evaluate', {
    awaitPromise: true,
    returnByValue: true,
    expression: `(async () => {
      // 等字体/图片稳定
      await Promise.race([new Promise((r) => setTimeout(r, 800)), Promise.resolve()]);

      const host = document.querySelector('detailed-publication-list');
      const rows = [...host.shadowRoot.querySelectorAll('.publication-item')];
      const badges = [...host.shadowRoot.querySelectorAll('.highlight-badge')];
      const first = badges[0];

      function describe(el) {
        if (!el) return null;
        const cs = getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        return {
          text: el.textContent.trim(),
          href: el.getAttribute('href'),
          bg: cs.backgroundColor,
          color: cs.color,
          radius: cs.borderRadius,
          fontSize: cs.fontSize,
          fontWeight: cs.fontWeight,
          padding: cs.padding,
          width: Math.round(rect.width),
          height: Math.round(rect.height),
          platformSvg: Boolean(el.querySelector('.highlight-badge__platform-svg')),
          alphaxivBrand: (() => { const p = el.querySelector('.highlight-badge__platform-svg'); if (!p) return null; return getComputedStyle(p).color; })()
        };
      }

      // 徽章位置：应内嵌于 venue 行内（与会议信息同行）
      const sqlRow = rows.find((row) => row.textContent.includes('SQL-R1'));
      const venueRow = sqlRow?.querySelector('.publication-venue');
      const highlightsRow = sqlRow?.querySelector('.publication-highlights');
      const orderOk = sqlRow && venueRow && highlightsRow &&
        venueRow.contains(highlightsRow) &&
        (venueRow.compareDocumentPosition(highlightsRow) & Node.DOCUMENT_POSITION_FOLLOWING);

      // 同行检测：徽章与 status-tag 垂直居中对齐且处于同一水平线
      let sameLineAsVenue = false;
      if (sqlRow && venueRow && highlightsRow) {
        const status = venueRow.querySelector('.status-tag');
        const venueBox = status ? status.getBoundingClientRect() : venueRow.getBoundingClientRect();
        const box = highlightsRow.getBoundingClientRect();
        sameLineAsVenue = Math.abs((venueBox.top + venueBox.height / 2) - (box.top + box.height / 2)) < venueBox.height;
      }

      // hover 效果：模拟 hover 前后背景变化
      let hoverBg = null;
      if (first) {
        const before = getComputedStyle(first).backgroundColor;
        first.classList.add('__hover_probe__');
        const styleEl = host.shadowRoot.querySelector('style');
        const probe = document.createElement('style');
        probe.textContent = '.highlight-badge.__hover_probe__ { background-color: #fde68a; }';
        host.shadowRoot.appendChild(probe);
        hoverBg = getComputedStyle(first).backgroundColor;
        probe.remove();
        first.classList.remove('__hover_probe__');
        void before;
      }

      return {
        badgeCount: badges.length,
        first: describe(first),
        second: describe(badges[1]),
        pillRadius: first ? getComputedStyle(first).borderRadius : null,
        isLink: first ? first.tagName === 'A' : false,
        opensNewTab: first ? first.getAttribute('target') === '_blank' && (first.getAttribute('rel') || '').includes('noopener') : false,
        inlineInVenueRow: Boolean(orderOk),
        sameLineAsVenue,
        hoverBg,
        sqlRowHasBadges: Boolean(highlightsRow),
        anyTrophy: badges.some((b) => b.querySelector('.highlight-badge__trophy')),
        texts: badges.map((b) => b.textContent.trim())
      };
    })()`
  });

  const v = data.result.value;
  console.log(JSON.stringify(v, null, 1));

  check('detailed page renders the SQL-R1 alphaxiv badge', v.badgeCount === 1 && v.first.text.includes('#3 in Databases'));
  check('badges are clickable links opening in a new tab', v.isLink && v.opensNewTab);
  check('badge is pill-shaped (large border radius)', parseFloat(v.pillRadius) >= 100);
  check('badge has light amber background', v.first.bg === 'rgb(254, 243, 199)');
  check('badge text uses amber-800 tone', v.first.color === 'rgb(180, 83, 9)');
  check('badges have no trophy icon', !v.anyTrophy);
  check('badge shows platform icon', v.first.platformSvg);
  check('alphaxiv icon is tinted with brand red', v.first && v.first.alphaxivBrand === 'rgb(154, 32, 54)');
  check('badge font is small and medium-weight', v.first.fontSize === '12px' && v.first.fontWeight === '500');
  check('highlights render inside the venue row', v.inlineInVenueRow);
  check('highlights share one line with venue info', v.sameLineAsVenue);
  check('SQL-R1 row shows the alphaxiv badge', v.sqlRowHasBadges && v.texts.some((t) => t.includes('#3 in Databases')));

  // ---- 移动端视口不破版 ----
  await send(ws, 'Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  await new Promise((resolve) => setTimeout(resolve, 300));
  const mobile = await send(ws, 'Runtime.evaluate', {
    returnByValue: true,
    expression: `(() => {
      const host = document.querySelector('detailed-publication-list');
      const badges = [...host.shadowRoot.querySelectorAll('.highlight-badge')];
      const item = badges[0]?.closest('.publication-item');
      const badgeRects = badges.map((b) => { const r = b.getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height) }; });
      const overflow = badges.some((b) => b.getBoundingClientRect().right > document.documentElement.clientWidth + 1);
      return { count: badges.length, badgeRects, overflow, itemW: Math.round(item?.getBoundingClientRect().width || 0) };
    })()`
  });
  const m = mobile.result.value;
  check('mobile: the badge still renders', m.count === 1);
  check('mobile: badges do not overflow the viewport', !m.overflow);
  check('mobile: badges keep readable size', m.badgeRects.every((r) => r.h >= 18 && r.h <= 40));

  // ---- 截图留档 ----
  const clip = await send(ws, 'Runtime.evaluate', {
    returnByValue: true,
    expression: `(() => { const host = document.querySelector('detailed-publication-list'); const row = [...host.shadowRoot.querySelectorAll('.publication-item')].find((r) => r.textContent.includes('SQL-R1')); const rect = row.getBoundingClientRect(); return { x: 0, y: Math.max(rect.y - 20, 0), width: Math.min(document.documentElement.clientWidth, 1100), height: rect.height + 60, scale: 1 }; })()`
  });
  await send(ws, 'Emulation.clearDeviceMetricsOverride');
  await new Promise((resolve) => setTimeout(resolve, 300));
  const shot = await send(ws, 'Page.captureScreenshot', { format: 'png', clip: clip.result.value, captureBeyondViewport: true });
  const shotPath = join(root, 'badge_preview.png');
  writeFileSync(shotPath, Buffer.from(shot.data, 'base64'));
  console.log(`SCREENSHOT: ${shotPath}`);
} catch (error) {
  console.log(`FAIL: ${error.message}`);
  failed += 1;
} finally {
  ws?.close();
  server.close();
  if (process.platform === 'win32') {
    spawn('taskkill', ['/PID', String(chrome.pid), '/T', '/F'], { stdio: 'ignore' });
  } else {
    try { chrome.kill('SIGKILL'); } catch { /* already exited */ }
  }
}

if (failed) {
  console.log(`FAILED: ${failed}`);
  process.exit(1);
}
console.log('ALL PASSED');
