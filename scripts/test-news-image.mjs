import { createServer } from 'http';
import { spawn, spawnSync } from 'child_process';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { extname, join, dirname } from 'path';
import { tmpdir } from 'os';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const source = readFileSync(join(root, 'js/components/NewsList.js'), 'utf8');
const news = JSON.parse(readFileSync(join(root, 'data/news.json'), 'utf8')).news;

let failed = 0;
function check(name, cond) {
  console.log(`${cond ? 'PASS' : 'FAIL'}: ${name}`);
  if (!cond) failed += 1;
}

function extractFunction(name) {
  const match = source.match(new RegExp(`const ${name} = \\(([^)]*)\\) => \\{([\\s\\S]*?)\\n    \\};`));
  if (!match) return null;
  return new Function(match[1], match[2]);
}

const newsImage = extractFunction('newsImage');
const escapeAttr = extractFunction('escapeAttr');

check('newsImage ignores a missing field', newsImage({}) === '' && newsImage(null) === '');
check('newsImage ignores blank values', newsImage({ image: '' }) === '' && newsImage({ image: '   ' }) === '');
check('newsImage keeps a real path', newsImage({ image: ' images/sqlr1.png ' }) === 'images/sqlr1.png');
check('image attributes are escaped', escapeAttr(`a&b"c<d`) === 'a&amp;b&quot;c&lt;d');

check('every news item has an image field', news.every((item) => Object.prototype.hasOwnProperty.call(item, 'image') && typeof item.image === 'string'));

const filled = news.filter((item) => item.image.trim());
const blank = news.filter((item) => !item.image.trim());
check('some news keep the text-only layout', blank.length > 0);
check('filled image paths exist', filled.length > 0 && filled.every((item) => existsSync(join(root, item.image.trim()))));

const renderContent = source.slice(source.indexOf('const renderContent'), source.indexOf('const recentNews'));
check('thumbnail is rendered only when image data exists', renderContent.includes('newsImage(content)') && renderContent.includes('const imageHtml = imageSrc'));
check('thumbnail stays inside its own news row', /class="news-text-wrapper"[\s\S]*\$\{imageHtml\}/.test(renderContent));
check('a shared month image only attaches to the first news', renderContent.includes('index === 0') && renderContent.includes('!item.content.some((entry) => newsImage(entry))'));
check('a news item without image data does not emit a thumb', /imageSrc[\s\S]*\?[\s\S]*class="news-thumb"[\s\S]*:\s*''/.test(renderContent));

const itemRule = source.match(/\.news-item\s*\{([\s\S]*?)\n        \}/)[1];
const textRule = source.match(/\.news-text-wrapper\s*\{[\s\S]*?font-size:\s*var\(--news-text-size\);[\s\S]*?\}/);
const thumbRule = source.match(/\.news-thumb\s*\{([\s\S]*?)\n        \}/)[1];
check('text and thumbnail share the same line metrics', /--news-text-size:\s*0\.95rem/.test(itemRule) && /--news-text-leading:\s*1\.6/.test(itemRule) && textRule);
const thumbImageRule = source.match(/\.news-thumb img\s*\{([\s\S]*?)\n        \}/)[1];
check('thumbnail height follows the text block', /align-self:\s*stretch/.test(thumbRule) && /position:\s*absolute/.test(thumbImageRule) && /inset:\s*0/.test(thumbImageRule) && source.includes('fitNewsImages()'));
check('thumbnail keeps a little inner padding', /padding:\s*3px/.test(thumbImageRule));
check('thumbnail frame stays at the row end', /max-width:\s*42%/.test(thumbRule) && /object-position:\s*center/.test(thumbImageRule));

const layoutExpression = `(() => {
  return [...document.querySelectorAll('news-list .news-item')].map((item) => {
    const img = item.querySelector('.news-thumb img');
    const content = item.querySelector('.news-content');
    const contentBox = content.getBoundingClientRect();
    const main = item.querySelector('.news-main').getBoundingClientRect();
    const rows = [...content.querySelectorAll('.news-content-row')];
    const lines = [...item.querySelectorAll('.news-text-wrapper')].reduce((sum, wrapper) => {
      const range = document.createRange();
      range.selectNodeContents(wrapper);
      return sum + range.getClientRects().length;
    }, 0);
    const date = item.querySelector('.news-date-month').textContent.trim();
    const year = item.querySelector('.news-date-year')?.textContent.trim() || '';
    if (!img) {
      return {
        label: date + ' ' + year,
        hasImage: false,
        textFillsRow: Math.abs(contentBox.right - main.right) < 1.5
      };
    }
    const row = img.closest('.news-content-row');
    const textNode = row.querySelector('.news-text-wrapper');
    const textBox = textNode.getBoundingClientRect();
    const box = img.getBoundingClientRect();
    const style = getComputedStyle(img);
    const padding = parseFloat(style.paddingTop);
    const padL = parseFloat(style.paddingLeft);
    const padR = parseFloat(style.paddingRight);
    const padT = parseFloat(style.paddingTop);
    const padB = parseFloat(style.paddingBottom);
    const borderX = parseFloat(style.borderLeftWidth) + parseFloat(style.borderRightWidth);
    const borderY = parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth);
    const contentW = box.width - padL - padR - borderX;
    const contentH = box.height - padT - padB - borderY;
    const ratio = img.naturalWidth > 0 && img.naturalHeight > 0 ? img.naturalWidth / img.naturalHeight : 0;
    const fittedW = ratio ? Math.min(contentW, contentH * ratio) : contentW;
    const extraX = Math.max(contentW - fittedW, 0);
    return {
      label: date + ' ' + year,
      hasImage: true,
      src: img.getAttribute('src'),
      imageRightOfText: box.left >= textBox.right - 1,
      alignedToRowEnd: Math.abs(box.right - main.right) < 1.5,
      height: box.height,
      width: box.width,
      textHeight: textBox.height,
      groupHeight: contentBox.height,
      rowCount: rows.length,
      lines,
      padding,
      borderX,
      leftGap: padL + extraX / 2,
      rightGap: padR + extraX / 2,
      heightDelta: Math.abs(box.height - textBox.height)
    };
  });
})()`;

function resolveChromeBinary() {
  const candidates = [
    process.env.CHROME_PATH,
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
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

async function measureLayout() {
  const types = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.webmanifest': 'application/manifest+json'
  };
  const fixture = `<!DOCTYPE html>
    <html><head><meta charset="utf-8">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <link rel="stylesheet" href="/css/styles.css"></head>
    <body><main class="container"><div id="news" class="card"><news-list></news-list></div></main>
    <script src="/js/components/NewsList.js"></script></body></html>`;
  const server = createServer((req, res) => {
    const pathname = decodeURIComponent(new URL(req.url, 'http://127.0.0.1').pathname);
    if (pathname === '/news-fixture.html') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(fixture);
      return;
    }
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
  const profile = join(tmpdir(), `news-image-chrome-${Date.now()}`);
  mkdirSync(profile, { recursive: true });
  const chrome = spawn(resolveChromeBinary(), [
    '--headless=new',
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-gpu',
    '--no-first-run',
    '--window-size=1200,1000',
    '--remote-allow-origins=*',
    `--remote-debugging-port=${debugPort}`,
    `--user-data-dir=${profile}`,
    `http://127.0.0.1:${port}/news-fixture.html`
  ], { stdio: 'ignore' });

  const send = (ws, method, params = {}) => new Promise((resolve, reject) => {
    const id = send.nextId = (send.nextId || 0) + 1;
    const timer = setTimeout(() => {
      ws.removeEventListener('message', onMessage);
      reject(new Error(`CDP timeout: ${method}`));
    }, 8000);
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

  try {
    let page;
    for (let i = 0; i < 40; i += 1) {
      try {
        const listed = await fetch(`http://127.0.0.1:${debugPort}/json/list`, { signal: AbortSignal.timeout(1000) }).then((response) => response.json());
        page = listed.find((entry) => entry.type === 'page' && entry.url.includes('news-fixture.html'));
        if (page) break;
      } catch {
        // Chrome is still starting.
      }
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
    if (!page) throw new Error('Chrome did not open the news page');

    const ws = new WebSocket(page.webSocketDebuggerUrl);
    await new Promise((resolve, reject) => {
      ws.addEventListener('open', resolve, { once: true });
      ws.addEventListener('error', reject, { once: true });
    });

    await send(ws, 'Page.enable');
    let ready = false;
    for (let i = 0; i < 40; i += 1) {
      try {
        const result = await send(ws, 'Runtime.evaluate', {
          expression: `Boolean(document.querySelector('news-list .news-item'))`,
          returnByValue: true
        });
        if (result.result.value) {
          ready = true;
          break;
        }
      } catch (error) {
        if (!/destroyed|context/i.test(error.message)) throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
    if (!ready) throw new Error('News list did not render');

    const waitForImages = `Promise.race([
      Promise.all([...document.querySelectorAll('news-list img')].map((img) => img.complete ? null : new Promise((resolve) => { img.onload = img.onerror = resolve; }))),
      new Promise((resolve) => setTimeout(resolve, 4000))
    ])`;
    await send(ws, 'Runtime.evaluate', { expression: waitForImages, awaitPromise: true, returnByValue: true });
    await send(ws, 'Runtime.evaluate', {
      expression: `(() => {
        document.querySelector('.news-more')?.click();
        const earlier = document.querySelector('.news-earlier');
        const clip = earlier?.querySelector('.news-earlier-clip');
        if (earlier) earlier.style.transition = 'none';
        if (clip) clip.style.transition = 'none';
        earlier?.classList.add('is-open');
        return Boolean(document.querySelector('news-list .news-item .news-content-row + .news-content-row'));
      })()`,
      returnByValue: true
    });
    await send(ws, 'Runtime.evaluate', { expression: waitForImages, awaitPromise: true, returnByValue: true });

    const desktop = await send(ws, 'Runtime.evaluate', {
      expression: layoutExpression,
      returnByValue: true
    });
    await send(ws, 'Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 1,
      mobile: true
    });
    await new Promise((resolve) => setTimeout(resolve, 300));
    const mobile = await send(ws, 'Runtime.evaluate', {
      expression: layoutExpression,
      returnByValue: true
    });
    const mobileShot = await send(ws, 'Page.captureScreenshot', { format: 'png' });
    writeFileSync(join(tmpdir(), 'news-image-preview-mobile.png'), Buffer.from(mobileShot.data, 'base64'));
    await send(ws, 'Emulation.clearDeviceMetricsOverride');
    await send(ws, 'Runtime.evaluate', {
      expression: `document.querySelector('#news').scrollIntoView({ block: 'start' })`,
      returnByValue: true
    });
    const clip = await send(ws, 'Runtime.evaluate', {
      expression: `(() => { const rect = document.querySelector('#news').getBoundingClientRect(); return { x: rect.x, y: Math.max(rect.y, 0), width: rect.width, height: Math.min(rect.height, 900), scale: 1 }; })()`,
      returnByValue: true
    });
    const shot = await send(ws, 'Page.captureScreenshot', {
      format: 'png',
      clip: clip.result.value,
      captureBeyondViewport: true
    });
    const shotPath = join(tmpdir(), 'news-image-preview.png');
    writeFileSync(shotPath, Buffer.from(shot.data, 'base64'));
    console.log(`SCREENSHOT: ${shotPath}`);
    ws.close();
    return { desktop: desktop.result.value, mobile: mobile.result.value };
  } finally {
    server.close();
    if (process.platform === 'win32') {
      spawn('taskkill', ['/PID', String(chrome.pid), '/T', '/F'], { stdio: 'ignore' });
    } else {
      try {
        chrome.kill('SIGKILL');
      } catch {
        // Ignore if already exited.
      }
    }
  }
}

const layout = await measureLayout();
for (const [viewport, rows] of Object.entries(layout)) {
  const withImage = rows.filter((row) => row.hasImage);
  const withoutImage = rows.filter((row) => !row.hasImage);
  check(`${viewport}: preview contains both image and text-only news`, withImage.length > 0 && withoutImage.length > 0);
  const lineCounts = new Set(withImage.map((row) => Math.round(row.textHeight)));
  check(`${viewport}: images sit to the right of the text`, withImage.every((row) => row.imageRightOfText && row.alignedToRowEnd));
  const multi = withImage.filter((row) => row.rowCount > 1);
  check(`${viewport}: image frame matches the text block`, withImage.every((row) => row.heightDelta < 1.5 && row.height > 8 && row.width > 16));
  check(`${viewport}: a shared month image matches only its own news`, multi.length > 0 && multi.every((row) => row.groupHeight - row.height > 8));
  check(`${viewport}: image has inner padding`, withImage.every((row) => row.padding === 3));
  check(`${viewport}: light theme has no image border`, withImage.every((row) => row.borderX === 0));
  check(`${viewport}: left inner gap matches the right`, withImage.every((row) => Math.abs(row.leftGap - row.rightGap) < 1 && row.leftGap < 6));
  check(`${viewport}: image height changes with the line count`, lineCounts.size > 1);
  check(`${viewport}: text-only news still fill the row`, withoutImage.every((row) => row.textFillsRow));
  console.log(viewport, JSON.stringify(rows.map((row) => ({
    label: row.label,
    hasImage: row.hasImage,
    lines: row.lines,
    height: row.height ? Number(row.height.toFixed(2)) : undefined,
    width: row.width ? Number(row.width.toFixed(2)) : undefined,
    textHeight: row.textHeight ? Number(row.textHeight.toFixed(2)) : undefined,
    groupHeight: row.groupHeight ? Number(row.groupHeight.toFixed(2)) : undefined,
    rowCount: row.rowCount,
    heightDelta: row.heightDelta ? Number(row.heightDelta.toFixed(2)) : undefined,
    leftGap: row.leftGap ? Number(row.leftGap.toFixed(2)) : undefined,
    rightGap: row.rightGap ? Number(row.rightGap.toFixed(2)) : undefined
  }))));
}

const desktopBy = Object.fromEntries(layout.desktop.filter((row) => row.hasImage).map((row) => [row.label, row]));
const mobileBy = Object.fromEntries(layout.mobile.filter((row) => row.hasImage).map((row) => [row.label, row]));
const changedRows = Object.keys(desktopBy).filter((label) => mobileBy[label] && Math.abs(desktopBy[label].textHeight - mobileBy[label].textHeight) > 8);
check('image height follows a line-count change', changedRows.length > 0 && changedRows.every((label) => {
  const textDelta = mobileBy[label].textHeight - desktopBy[label].textHeight;
  const imageDelta = mobileBy[label].height - desktopBy[label].height;
  return Math.abs(imageDelta - textDelta) < 2;
}));

if (failed) {
  console.log(`FAILED: ${failed}`);
  process.exit(1);
}
console.log('ALL PASSED');
