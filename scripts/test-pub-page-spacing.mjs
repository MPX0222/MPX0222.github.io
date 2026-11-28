import { createServer } from 'http';
import { spawn } from 'child_process';
import { existsSync, readFileSync, mkdirSync } from 'fs';
import { extname, join } from 'path';
import { tmpdir } from 'os';
import { fileURLToPath } from 'url';

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const tmp = tmpdir;

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

async function launchChrome(target) {
  const debugPort = 20000 + Math.floor(Math.random() * 20000);
  const profile = join(tmp(), `spacing-${Date.now()}-${Math.floor(Math.random() * 1e6)}`);
  mkdirSync(profile, { recursive: true });
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new', '--no-sandbox', '--disable-gpu', '--no-first-run',
    '--window-size=1280,2400', '--remote-allow-origins=*', `--remote-debugging-port=${debugPort}`,
    `--user-data-dir=${profile}`, target
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

async function waitReady(ws, expr) {
  for (let i = 0; i < 60; i += 1) {
    try {
      const r = await send(ws, 'Runtime.evaluate', { expression: expr, returnByValue: true });
      if (r.result.value) return;
    } catch (error) {
      if (!/destroyed|context/i.test(error.message)) throw error;
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error('page did not become ready');
}

async function measure(ws, scopeExpr) {
  const expr = `(() => {
    ${scopeExpr}
    const row = ${'__ROW__'};
    const title = row.querySelector('.publication-title');
    const authors = row.querySelector('.publication-meta, .publication-authors');
    const venue = row.querySelector('.publication-venue');
    const actions = row.querySelector('.publication-actions');
    const links = row.querySelector('.publication-links');
    const tb = title.getBoundingClientRect();
    const ab = authors.getBoundingClientRect();
    const vb = venue.getBoundingClientRect();
    const lb = links.getBoundingClientRect();
    const tStyle = getComputedStyle(title);
    const aStyle = getComputedStyle(authors);
    return {
      titleLineHeight: tStyle.lineHeight,
      titleFontSize: tStyle.fontSize,
      authorsLineHeight: aStyle.lineHeight,
      titleToAuthors: Math.round((ab.top - tb.bottom) * 10) / 10,
      authorsToVenue: Math.round((vb.top - ab.bottom) * 10) / 10,
      venueToLinks: Math.round((lb.top - vb.bottom) * 10) / 10
    };
  })()`;
  // __ROW__ 占位由调用方替换
  return expr;
}

// ---- 主页测量 ----
const home = await launchChrome(`http://127.0.0.1:${port}/index.html`);
let homeM;
try {
  await waitReady(home.ws, `Boolean(document.querySelector('publication-list .publication-item .publication-title'))`);
  await new Promise((r) => setTimeout(r, 600));
  const result = await send(home.ws, 'Runtime.evaluate', {
    returnByValue: true,
    expression: `(() => {
      const row = [...document.querySelectorAll('publication-list .publication-item')].find((r) => r.querySelector('.publication-title') && r.querySelector('.publication-venue'));
      const title = row.querySelector('.publication-title');
      const authors = row.querySelector('.publication-authors');
      const venue = row.querySelector('.publication-venue');
      const links = row.querySelector('.publication-links');
      const tb = title.getBoundingClientRect();
      const ab = authors.getBoundingClientRect();
      const vb = venue.getBoundingClientRect();
      const lb = links.getBoundingClientRect();
      return {
        titleLineHeightRatio: (parseFloat(getComputedStyle(title).lineHeight) / parseFloat(getComputedStyle(title).fontSize)).toFixed(2),
        authorsLineHeightRatio: (parseFloat(getComputedStyle(authors).lineHeight) / parseFloat(getComputedStyle(authors).fontSize)).toFixed(2),
        titleToAuthors: Math.round((ab.top - tb.bottom) * 10) / 10,
        authorsToVenue: Math.round((vb.top - ab.bottom) * 10) / 10,
        venueToLinks: Math.round((lb.top - vb.bottom) * 10) / 10
      };
    })()`
  });
  homeM = result.result.value;
  console.log('HOME:', JSON.stringify(homeM));
} finally {
  home.ws.close();
  spawn('taskkill', ['/PID', String(home.chrome.pid), '/T', '/F'], { stdio: 'ignore' });
}

// ---- pub 页测量（DecisionPivot 行：有 venue + links，与主页条目结构对齐）----
const pub = await launchChrome(`http://127.0.0.1:${port}/pages/publications.html`);
let pubM;
try {
  await waitReady(pub.ws, `(() => { const h = document.querySelector('detailed-publication-list'); return Boolean(h && h.shadowRoot && h.shadowRoot.querySelector('.publication-item .publication-title')); })()`);
  await new Promise((r) => setTimeout(r, 600));
  const result = await send(pub.ws, 'Runtime.evaluate', {
    returnByValue: true,
    expression: `(() => {
      const host = document.querySelector('detailed-publication-list');
      const row = [...host.shadowRoot.querySelectorAll('.publication-item')].find((r) => r.querySelector('.publication-title') && r.querySelector('.publication-venue'));
      const title = row.querySelector('.publication-title');
      const authors = row.querySelector('.publication-meta');
      const venue = row.querySelector('.publication-venue');
      const links = row.querySelector('.publication-links');
      const tb = title.getBoundingClientRect();
      const ab = authors.getBoundingClientRect();
      const vb = venue.getBoundingClientRect();
      const lb = links.getBoundingClientRect();
      return {
        titleLineHeightRatio: (parseFloat(getComputedStyle(title).lineHeight) / parseFloat(getComputedStyle(title).fontSize)).toFixed(2),
        authorsLineHeightRatio: (parseFloat(getComputedStyle(authors).lineHeight) / parseFloat(getComputedStyle(authors).fontSize)).toFixed(2),
        titleToAuthors: Math.round((ab.top - tb.bottom) * 10) / 10,
        authorsToVenue: Math.round((vb.top - ab.bottom) * 10) / 10,
        venueToLinks: Math.round((lb.top - vb.bottom) * 10) / 10
      };
    })()`
  });
  pubM = result.result.value;
  console.log('PUB:', JSON.stringify(pubM));
} finally {
  pub.ws.close();
  spawn('taskkill', ['/PID', String(pub.chrome.pid), '/T', '/F'], { stdio: 'ignore' });
}

check('title line-height ratio matches home', pubM.titleLineHeightRatio === homeM.titleLineHeightRatio, `${homeM.titleLineHeightRatio} vs ${pubM.titleLineHeightRatio}`);
check('authors line-height ratio matches home', pubM.authorsLineHeightRatio === homeM.authorsLineHeightRatio, `${homeM.authorsLineHeightRatio} vs ${pubM.authorsLineHeightRatio}`);
check('title→authors gap matches home (±1px)', Math.abs(pubM.titleToAuthors - homeM.titleToAuthors) <= 1, `${homeM.titleToAuthors} vs ${pubM.titleToAuthors}`);
check('authors→venue gap matches home (±1px)', Math.abs(pubM.authorsToVenue - homeM.authorsToVenue) <= 1, `${homeM.authorsToVenue} vs ${pubM.authorsToVenue}`);
check('venue→links gap matches home (±1.5px)', Math.abs(pubM.venueToLinks - homeM.venueToLinks) <= 1.5, `${homeM.venueToLinks} vs ${pubM.venueToLinks}`);

server.close();
if (failed) {
  console.log(`FAILED: ${failed}`);
  process.exit(1);
}
console.log('ALL PASSED');
