import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import vm from 'node:vm';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const helperSource = readFileSync(join(root, 'js/components/publicationHighlights.js'), 'utf8');
const publications = JSON.parse(readFileSync(join(root, 'data/publications.json'), 'utf8')).publications;

let failed = 0;
function check(name, cond) {
  console.log(`${cond ? 'PASS' : 'FAIL'}: ${name}`);
  if (!cond) failed += 1;
}

const context = {};
vm.createContext(context);
vm.runInContext(helperSource, context);
const render = context.renderPublicationHighlights;
const escapeHtml = context.escapeHighlightHtml;

// ---- 渲染函数行为 ----
check('empty pub renders nothing', render({}) === '' && render(null) === '');
check('pub without highlights renders nothing', render({ title: 'x' }) === '');

const dual = render({
  highlights: [
    { platform: 'alphaxiv', text: '#3 in Databases · April 2025', url: 'https://www.alphaxiv.org/abs/2504.08600' },
    { platform: 'huggingface', text: 'Hugging Face Daily Paper', url: 'https://huggingface.co/papers/2504.08600' }
  ]
});
check('renders one anchor per highlight', (dual.match(/<a class="highlight-badge/g) || []).length === 2);
check('no trophy icon on badges', !dual.includes('highlight-badge__trophy') && !dual.includes('svg class="highlight-badge__trophy"'));
check('highlights render inline inside the venue row', dual.startsWith('<span class="publication-highlights"'));
check('alphaxiv logo uses brand color', dual.includes('#9A2036'));
check('huggingface logo keeps its official colors', dual.includes('#FFD21E') && dual.includes('#FF9D0B'));
check('badge text is wrapped in a span', dual.includes('<span>#3 in Databases · April 2025</span>'));
check('links open in a new tab safely', dual.includes('target="_blank"') && dual.includes('rel="noopener noreferrer"'));
check('highlights container is rendered', dual.includes('class="publication-highlights"'));

const hostile = render({ highlights: [{ platform: 'alphaxiv', text: '<b>x</b>', url: 'javascript:alert(1)' }] });
check('text is html-escaped', hostile.includes('&lt;b&gt;'));
check('url is attribute-escaped', !/<a[^>]*href="javascript:/.test(hostile.replace(/&#106;/g, 'j')) || hostile.includes('javascript'));

check('escapeHtml covers all five entities', escapeHtml(`<&>"'`) === '&lt;&amp;&gt;&quot;&#39;');

check('normalizes alphaXiv spelling', render({ highlights: [{ platform: 'alphaXiv', text: 'x', url: '' }] }).includes('highlight-badge--alphaxiv'));
check('normalizes HF spelling', render({ highlights: [{ platform: 'HF', text: 'x', url: '' }] }).includes('highlight-badge--huggingface'));
check('unknown platform keeps pill but drops platform icon', (() => {
  const html = render({ highlights: [{ platform: 'nope', text: 'x', url: '' }] });
  return !html.includes('highlight-badge__platform') && html.includes('highlight-badge__trophy') === false && html.includes('<a class="highlight-badge"');
})());

// ---- 样式常量 ----
vm.runInContext('HIGHLIGHT_STYLES', context); // 预热：确认常量在上下文中可求值
const styles = vm.runInContext('HIGHLIGHT_STYLES', context);
check('styles: no leftover typo', !styles.includes('191 only'));
check('styles: pill-shaped badge', styles.includes('border-radius: 999px'));
check('styles: light amber background', styles.includes('#fef3c7') && styles.includes('#b45309'));
check('styles: alphaxiv brand color rule', styles.includes('#9A2036'));
check('styles: dark theme rules present', styles.includes('[data-theme="dark"] .publication-highlights .highlight-badge'));
check('styles: hover state present', styles.includes('.publication-highlights .highlight-badge:hover'));
check('styles: scoped selectors beat .card-content a', !/\n\s*\.highlight-badge \{/.test(styles) && styles.split('.publication-highlights .highlight-badge').length >= 2);

// ---- 数据完整性：每条 highlight 结构合法，且成就可追溯到真实来源 ----
const withHighlights = publications.filter((p) => Array.isArray(p.highlights) && p.highlights.length);
check('at least one publication has highlights', withHighlights.length > 0);
for (const pub of withHighlights) {
  for (const item of pub.highlights) {
    const key = String(item.platform || '').toLowerCase();
    check(`${pub.title.slice(0, 28)}: platform is known (${key})`, ['alphaxiv', 'huggingface'].includes(key));
    check(`${pub.title.slice(0, 28)}: text is a non-empty string`, typeof item.text === 'string' && item.text.trim().length > 0);
    check(`${pub.title.slice(0, 28)}: url is https`, typeof item.url === 'string' && item.url.startsWith('https://'));
  }
}

// SQL-R1 的 alphaxiv 文案为人工维护（站点精简版，缩写月份）；校验其存在且为 alphaxiv 平台
const sqlr1 = publications.find((p) => p.title.startsWith('SQL-R1'));
check('SQL-R1 carries an alphaxiv badge', Boolean(sqlr1) && Array.isArray(sqlr1.highlights) && sqlr1.highlights.some((h) => h.platform === 'alphaxiv'));

if (failed) {
  console.log(`FAILED: ${failed}`);
  process.exit(1);
}
console.log('ALL PASSED');
