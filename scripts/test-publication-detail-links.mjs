import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

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

check('detailed keeps GitHub star badge', detailed.includes('github-stats') && detailed.includes('img.shields.io/github/stars'));
check('detailed still hides DOI badge', /const showDoiBadge = false/.test(detailed));
check('detailed binds cite buttons after render', detailed.includes('bindCiteButtons()') && detailed.includes('.cite-button'));

if (failed) {
  console.log(`FAILED: ${failed}`);
  process.exit(1);
}
console.log('ALL PASSED');
