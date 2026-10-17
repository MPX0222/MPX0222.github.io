import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import vm from 'node:vm';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const home = readFileSync(join(root, 'js/components/PublicationList.js'), 'utf8');
const detailed = readFileSync(join(root, 'js/components/DetailedPublicationList.js'), 'utf8');

let failed = 0;
function check(name, cond) {
  console.log(`${cond ? 'PASS' : 'FAIL'}: ${name}`);
  if (!cond) failed += 1;
}

const linkMarkers = [
  ['Paper', 'ai ai-arxiv', 'pdf-link'],
  ['Code', 'fab fa-github', 'code-link'],
  ['Website', 'fas fa-globe', 'web-link'],
  ['Bibtex', 'fas fa-paperclip', 'cite-button'],
];

for (const [label, icon, cls] of linkMarkers) {
  check(`home has ${label} link`, home.includes(label) && home.includes(icon) && home.includes(cls));
  check(`detailed has ${label} link like home`, detailed.includes(label) && detailed.includes(icon) && detailed.includes(cls));
}

const labelSource = readFileSync(join(root, 'js/components/huggingfaceProjectName.js'), 'utf8');
const context = { URL, decodeURIComponent };
vm.createContext(context);
vm.runInContext(labelSource, context);
const projectName = context.huggingfaceProjectName;

check('model url uses the repo name', projectName('https://huggingface.co/MPX0222forHF/SQL-R1-7B') === 'SQL-R1-7B');
check('dataset url skips the datasets prefix', projectName('https://huggingface.co/datasets/org/TradeLens/') === 'TradeLens');
check('space url skips the spaces prefix', projectName('https://huggingface.co/spaces/org/demo?duplicate=true') === 'demo');
check('invalid url falls back to Hugging Face', projectName('not a url') === 'Hugging Face');
check('project name escapes html', projectName('https://huggingface.co/org/a%3Cb%3E%26c') === 'a&lt;b&gt;&amp;c');

for (const source of [home, detailed]) {
  check('huggingface link uses the extracted project name', source.includes('pub.links.huggingface ?') && source.includes('simple-icons:huggingface') && source.includes('huggingfaceProjectName(pub.links.huggingface)'));
}
check('homepage loads the huggingface name helper', readFileSync(join(root, 'index.html'), 'utf8').includes('js/components/huggingfaceProjectName.js'));
check('publications page loads the huggingface name helper', readFileSync(join(root, 'pages/publications.html'), 'utf8').includes('js/components/huggingfaceProjectName.js'));
check('huggingface link uses the same purple link color', (readFileSync(join(root, 'css/styles.css'), 'utf8').match(/\.pub-link\.hf-link/g) || []).length >= 3);
check('detailed keeps GitHub star badge', detailed.includes('github-stats') && detailed.includes('img.shields.io/github/stars'));
check('detailed still hides DOI badge', /const showDoiBadge = false/.test(detailed));
check('detailed binds cite buttons after render', detailed.includes('bindCiteButtons()') && detailed.includes('.cite-button'));

if (failed) {
  console.log(`FAILED: ${failed}`);
  process.exit(1);
}
console.log('ALL PASSED');
