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

check('news link is always underlined', /text-decoration:\s*underline/.test(link));
check('news link underline is not hover-only', !/text-decoration:\s*underline/.test(hover) && !/border-bottom-color/.test(hover));
check('news link has no extra margin around it', /margin:\s*0;/.test(link));
check('one space remains before the venue', source.includes('</a> ${content.venue}'));
check('briefcase news uses a work icon', source.includes("text.includes('💼')") && source.includes('fa-briefcase') && source.includes('/[🔥🎉📖💼🎤]/'));

const news = JSON.parse(readFileSync(join(root, 'data/news.json'), 'utf8')).news.flatMap((item) => item.content);
check('paradoox role uses a briefcase', news.some((item) => item.text.startsWith('💼 Joined Paradoox')));
check('idea internship uses a briefcase', news.some((item) => item.text.startsWith('💼 Receive internship offer')));
check('study milestones keep the book icon', news.some((item) => item.text.startsWith('📖 Start my M.Phil. journey')) && news.some((item) => item.text.startsWith('📖 Receive Research Postgraduate')));

if (failed) {
  console.log(`FAILED: ${failed}`);
  process.exit(1);
}
console.log('ALL PASSED');
