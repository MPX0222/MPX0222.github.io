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

async function launchChrome(target) {
  const debugPort = 20000 + Math.floor(Math.random() * 20000);
  const profile = join(tmpdir(), `badge-color-${Date.now()}-${Math.floor(Math.random() * 1e6)}`);
  mkdirSync(profile, { recursive: true });
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new', '--no-sandbox', '--disable-gpu', '--no-first-run',
    '--window-size=1280,2400',
    '--remote-allow-origins=*', `--remote-debugging-port=${debugPort}`,
    `--user-data-dir=${profile}`,
    target
  ], { stdio: 'ignore' });
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
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.addEventListener('open', resolve, { once: true });
    ws.addEventListener('error', reject, { once: true });
  });
  return { chrome, ws };
}

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

async function waitAndProbe(ws, readyExpr, probeExpr) {
  for (let i = 0; i < 60; i += 1) {
    try {
      const result = await send(ws, 'Runtime.evaluate', { expression: readyExpr, returnByValue: true });
      if (result.result.value) break;
    } catch (error) {
      if (!/destroyed|context/i.test(error.message)) throw error;
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  await new Promise((r) => setTimeout(r, 600));
  const data = await send(ws, 'Runtime.evaluate', { expression: probeExpr, returnByValue: true });
  return data.result.value;
}

const probeExpr = `(expr) => { const el = expr; const cs = getComputedStyle(el); return {
  text: el.textContent.trim(),
  color: cs.color,
  bg: cs.backgroundColor,
  radius: cs.borderRadius
}; }`;

// ---- 首页（light DOM，受 .card-content a 影响）----
const home = await launchChrome(`http://127.0.0.1:${port}/index.html`);
let homeBadge = null;
try {
  homeBadge = await waitAndProbe(
    home.ws,
    `Boolean(document.querySelector('publication-list .highlight-badge'))`,
    `(() => { const el = document.querySelector('publication-list .highlight-badge'); const cs = getComputedStyle(el); return { text: el.textContent.trim(), color: cs.color, bg: cs.backgroundColor, radius: cs.borderRadius, decoration: cs.textDecorationLine }; })()`
  );
  console.log('HOME badge:', JSON.stringify(homeBadge));
  check('homepage badge text is amber-800 (not purple #6c5ce7)', homeBadge.color === 'rgb(180, 83, 9)', homeBadge.color);
  check('homepage badge keeps pill amber background', homeBadge.bg === 'rgb(254, 243, 199)', homeBadge.bg);
  check('homepage badge is pill-shaped', parseFloat(homeBadge.radius) >= 100, homeBadge.radius);
  check('homepage badge has no underline', homeBadge.decoration === 'none', homeBadge.decoration);
} catch (e) {
  check('homepage probe succeeded', false, e.message);
} finally {
  home.ws.close();
  spawn('taskkill', ['/PID', String(home.chrome.pid), '/T', '/F'], { stdio: 'ignore' });
}

// ---- pub 页（Shadow DOM）----
const pub = await launchChrome(`http://127.0.0.1:${port}/pages/publications.html`);
let pubBadge = null;
try {
  pubBadge = await waitAndProbe(
    pub.ws,
    `(() => { const h = document.querySelector('detailed-publication-list'); return Boolean(h && h.shadowRoot && h.shadowRoot.querySelector('.highlight-badge')); })()`,
    `(() => { const h = document.querySelector('detailed-publication-list'); const el = h.shadowRoot.querySelector('.highlight-badge'); const cs = getComputedStyle(el); return { text: el.textContent.trim(), color: cs.color, bg: cs.backgroundColor, radius: cs.borderRadius }; })()`
  );
  console.log('PUB badge:', JSON.stringify(pubBadge));
  check('pub page badge text is amber-800', pubBadge.color === 'rgb(180, 83, 9)', pubBadge.color);
} catch (e) {
  check('pub page probe succeeded', false, e.message);
} finally {
  pub.ws.close();
  spawn('taskkill', ['/PID', String(pub.chrome.pid), '/T', '/F'], { stdio: 'ignore' });
}

// ---- 两页颜色一致 ----
check('home and pub badge colors match exactly', homeBadge && pubBadge && homeBadge.color === pubBadge.color, `${homeBadge?.color} vs ${pubBadge?.color}`);

server.close();
if (failed) {
  console.log(`FAILED: ${failed}`);
  process.exit(1);
}
console.log('ALL PASSED');
