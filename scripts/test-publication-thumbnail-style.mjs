import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const home = readFileSync(join(root, 'js/components/PublicationList.js'), 'utf8');
const detailed = readFileSync(join(root, 'js/components/DetailedPublicationList.js'), 'utf8');
const css = readFileSync(join(root, 'css/styles.css'), 'utf8');

let failed = 0;
function check(name, cond) {
  console.log(`${cond ? 'PASS' : 'FAIL'}: ${name}`);
  if (!cond) failed += 1;
}

function extractRule(source, selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = source.match(new RegExp(`${escaped}\\s*\\{([\\s\\S]*?)\\n\\s*\\}`));
  return match ? match[1] : '';
}

const homeBox = extractRule(home, '.publication-thumbnail');
const detailedBox = extractRule(detailed, '.publication-thumbnail');
const globalBox = extractRule(css, '.publication-thumbnail');
const homeImg = extractRule(home, '.publication-thumbnail img');
const detailedImg = extractRule(detailed, '.publication-thumbnail img');
const globalImg = extractRule(css, '.publication-thumbnail img');

check('home thumbnail uses 2:1 landscape box', /aspect-ratio:\s*2\s*\/\s*1/.test(homeBox));
check('detailed thumbnail uses 2:1 landscape box', /aspect-ratio:\s*2\s*\/\s*1/.test(detailedBox));
check('global thumbnail uses 2:1 landscape box', /aspect-ratio:\s*2\s*\/\s*1/.test(globalBox));

check('home thumbnail img uses contain', /object-fit:\s*contain/.test(homeImg));
check('detailed thumbnail img uses contain', /object-fit:\s*contain/.test(detailedImg));
check('global thumbnail img uses contain', /object-fit:\s*contain/.test(globalImg));

check('home thumbnail img has 3pt inner padding', /padding:\s*3pt/.test(homeImg) && !/padding:\s*0\.5rem/.test(homeImg));
check('detailed thumbnail img has 3pt inner padding', /padding:\s*3pt/.test(detailedImg) && !/padding:\s*0\.5rem/.test(detailedImg));
check('global thumbnail img has 3pt inner padding', /padding:\s*3pt/.test(globalImg) && !/padding:\s*0\.5rem/.test(globalImg));

check('home thumbnail img is centered', /object-position:\s*center/.test(homeImg));
check('detailed thumbnail img is centered', /object-position:\s*center/.test(detailedImg));
check('global thumbnail img is centered', /object-position:\s*center/.test(globalImg));

check('no cover cropping on publication thumbnails', !/\.publication-thumbnail img[\s\S]{0,220}object-fit:\s*cover/.test(home + detailed + css));
check('global CSS no longer pads publication thumbnails', !/\.publication-thumbnail img[\s\S]{0,240}padding:\s*0\.5rem/.test(css));
check('home thumbnail does not use a short fixed height', !/height:\s*90px/.test(home) && !/height:\s*100px/.test(home) && !/height:\s*80px/.test(home));

if (failed) {
  console.log(`FAILED: ${failed}`);
  process.exit(1);
}
console.log('ALL PASSED');
