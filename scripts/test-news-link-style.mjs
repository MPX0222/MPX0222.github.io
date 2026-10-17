import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const source = readFileSync(join(root, 'js/components/NewsList.js'), 'utf8');

let failed = 0;
function check(name, cond) {
  console.log(`${cond ? 'PASS' : 'FAIL'}: ${name}`);
  if (!cond) failed += 1;
}

function extractRule(selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = source.match(new RegExp(`${escaped}\\s*\\{([\\s\\S]*?)\\n\\s*\\}`));
  return match ? match[1] : '';
}

const link = extractRule('a.news-link');
const hover = extractRule('a.news-link:hover');

check('news link is underlined', /text-decoration:\s*underline/.test(link));
check('news link is not bold', /font-weight:\s*400/.test(link) && !/font-weight:\s*(600|700|bold)/.test(link));
check('news link hover keeps the underline', !/text-decoration:\s*none/.test(hover));
check('news link has no extra margin around it', /margin:\s*0;/.test(link));
check('one space remains before the venue', source.includes('</a> ${content.venue}'));

const cleanTextSource = source.match(/const cleanText = \(text\) => \{([\s\S]*?)\n    \};/);
const cleanText = new Function('text', cleanTextSource[1]);
check('emoji prefix does not leave a leading space', cleanText('🔥 We release ') === 'We release ' && cleanText('🔥') === '');
check('briefcase news uses a work icon', source.includes("text.includes('💼')") && source.includes('fa-briefcase') && source.includes('/[🔥🎉📖💼🎤]/'));

const news = JSON.parse(readFileSync(join(root, 'data/news.json'), 'utf8')).news.flatMap((item) => item.content);
const demoPaper = news.find((item) => item.title && item.title.startsWith('NextFund'));
const demoText = demoPaper ? cleanText(demoPaper.text) : '';
check('demo paper keeps its trailing space', Boolean(demoPaper) && demoPaper.text.endsWith(' ') && demoText.endsWith(' ') && !demoText.startsWith(' '));
check('paradoox role uses a briefcase', news.some((item) => item.text.startsWith('💼 Joined Paradoox')));
check('idea internship uses a briefcase', news.some((item) => item.text.startsWith('💼 Receive internship offer')));
check('study milestones keep the book icon', news.some((item) => item.text.startsWith('📖 Start my M.Phil. journey')) && news.some((item) => item.text.startsWith('📖 Receive Research Postgraduate')));
check('news list is no longer a fixed scroll window', !source.includes('max-height: 600px') && !source.includes('overflow-y: auto'));
check('news previews the first eight dates', source.includes('this.previewCount = 8') && source.includes('news.slice(0, this.previewCount)') && source.includes('news.slice(this.previewCount)'));
check('earlier news can expand and collapse', source.includes('Earlier news') && source.includes('Show recent') && source.includes('collapseNews()'));
check('earlier news draws open from the left', source.includes('clip-path: inset(0 100% 0 0)') && source.includes('clip-path: inset(0 0 0 0)') && source.includes("classList.add('is-open')"));

if (failed) {
  console.log(`FAILED: ${failed}`);
  process.exit(1);
}
console.log('ALL PASSED');
