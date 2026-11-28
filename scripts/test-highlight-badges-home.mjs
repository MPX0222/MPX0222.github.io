import { createServer } from 'http';
import { spawn } from 'child_process';
import { existsSync, readFileSync, mkdirSync, writeFileSync } from 'fs';
import { extname, join } from 'path';
import { tmpdir } from 'os';
import { fileURLToPath } from 'url';

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..');

let failed = 0;
function check(name, cond) {
  console.log(`${cond ? 'PASS' : 'FAIL'}: ${name}`);
  if (!cond) failed += 1;
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
const profile = join(tmpdir(), `home-badge-chrome-${Date.now()}`);
mkdirSync(profile, { recursive: true });
const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new', '--no-sandbox', '--disable-gpu', '--no-first-run',
  '--window-size=1280,2400',
  '--remote-allow-origins=*', `--remote-debugging-port=${debugPort}`,
  `--user-data-dir=${profile}`,
  `http://127.0.0.1:${port}/index.html`
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
      page = listed.find((e) => e.type === 'page' && e.url.includes('index.html'));
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

  // 首页只显示 showInHome !== false 的论文（3 篇带 highlights 中 DecisionPivot 是 false，所以首页应只有 3 个徽章）
  let ready = false;
  for (let i = 0; i < 40; i += 1) {
    try {
      const result = await send(ws, 'Runtime.evaluate', {
        expression: `Boolean(document.querySelector('publication-list .publication-item'))`,
        returnByValue: true
      });
      if (result.result.value) { ready = true; break; }
    } catch (error) {
      if (!/destroyed|context/i.test(error.message)) throw error;
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  if (!ready) throw new Error('homepage publication list did not render');
  await new Promise((r) => setTimeout(r, 600));

  const light = await send(ws, 'Runtime.evaluate', {
    returnByValue: true,
    expression: `(() => {
      const badges = [...document.querySelectorAll('publication-list .highlight-badge')];
      const first = badges[0];
      const cs = first ? getComputedStyle(first) : null;
      const venueRow = first ? first.closest('.publication-venue') : null;
      const highlightsRow = first ? first.closest('.publication-highlights') : null;
      let sameLineAsVenue = false;
      if (venueRow && highlightsRow) {
        const status = venueRow.querySelector('.status-tag');
        const venueBox = (status || venueRow).getBoundingClientRect();
        const box = highlightsRow.getBoundingClientRect();
        sameLineAsVenue = venueRow.contains(highlightsRow) &&
          Math.abs((venueBox.top + venueBox.height / 2) - (box.top + box.height / 2)) < venueBox.height;
      }
      return {
        count: badges.length,
        texts: badges.map((b) => b.textContent.trim()),
        bg: cs?.backgroundColor,
        radius: cs?.borderRadius,
        anyTrophy: badges.some((b) => b.querySelector('.highlight-badge__trophy')),
        platformCount: first ? first.querySelectorAll('.highlight-badge__platform-svg').length : 0,
        inlineInVenueRow: Boolean(venueRow && highlightsRow && venueRow.contains(highlightsRow)),
        sameLineAsVenue
      };
    })()`
  });
  const lv = light.result.value;
  console.log('LIGHT:', JSON.stringify(lv));
  check('homepage renders 1 badge (SQL-R1 alphaxiv)', lv.count === 1);
  check('homepage badge text is the alphaxiv ranking', lv.texts.length === 1 && lv.texts[0].includes('#3 in Databases'));
  check('homepage badge is pill with amber bg', lv.bg === 'rgb(254, 243, 199)' && lv.radius === '999px');
  check('homepage badges have no trophy icon', !lv.anyTrophy);
  check('homepage badge has platform icon', lv.platformCount === 1);
  check('homepage highlights share the venue line', lv.inlineInVenueRow && lv.sameLineAsVenue);

  // 暗色主题
  await send(ws, 'Runtime.evaluate', {
    returnByValue: true,
    expression: `document.documentElement.setAttribute('data-theme', 'dark'); true`
  });
  await new Promise((r) => setTimeout(r, 600));
  const dark = await send(ws, 'Runtime.evaluate', {
    returnByValue: true,
    expression: `(() => {
      const first = document.querySelector('publication-list .highlight-badge');
      const cs = first ? getComputedStyle(first) : null;
      return { bg: cs?.backgroundColor, color: cs?.color };
    })()`
  });
  const dv = dark.result.value;
  console.log('DARK:', JSON.stringify(dv));
  check('dark theme switches to translucent amber bg', dv.bg === 'rgba(251, 191, 36, 0.14)');
  check('dark theme uses light amber text', dv.color === 'rgb(252, 211, 77)');

  // 恢复亮色后截图首页 SQL-R1
  await send(ws, 'Runtime.evaluate', {
    returnByValue: true,
    expression: `document.documentElement.setAttribute('data-theme', 'light'); true`
  });
  await new Promise((r) => setTimeout(r, 600));
  const clip = await send(ws, 'Runtime.evaluate', {
    returnByValue: true,
    expression: `(() => { const row = [...document.querySelectorAll('publication-list .publication-item')].find((r) => r.textContent.includes('SQL-R1')); const rect = row.getBoundingClientRect(); return { x: 0, y: Math.max(rect.y - 16, 0), width: Math.min(1100, document.documentElement.clientWidth), height: rect.height + 50, scale: 1 }; })()`
  });
  const shot = await send(ws, 'Page.captureScreenshot', { format: 'png', clip: clip.result.value, captureBeyondViewport: true });
  const shotPath = join(root, 'badge_preview_home.png');
  writeFileSync(shotPath, Buffer.from(shot.data, 'base64'));
  console.log(`SCREENSHOT: ${shotPath}`);
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
