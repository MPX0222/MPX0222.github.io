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

function extractRule(source, selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = source.match(new RegExp(`${escaped}\\s*\\{([\\s\\S]*?)\\n\\s*\\}`));
  return match ? match[1] : '';
}

const homeConference = extractRule(home, '.venue-tag.conference');
const detailedConference = extractRule(detailed, '.venue-tag.conference');
const detailedVenue = extractRule(detailed, '.venue-tag');
const detailedCategory = extractRule(detailed, '.category-tag');

check('homepage conference venue is a filled green pill', /background-color:\s*#f0fdf4/.test(homeConference) && /color:\s*#16a34a/.test(homeConference));
check('detailed conference venue matches homepage filled pill', /background-color:\s*#f0fdf4/.test(detailedConference) && /color:\s*#16a34a/.test(detailedConference));
check('detailed venue no longer uses a left border', !/border-left/.test(detailedVenue + detailedConference));
check('detailed category sits on the thumbnail as a bookmark', /publication-thumbnail[\s\S]*category-tag[\s\S]*<\/div>/.test(detailed) && /position:\s*absolute/.test(detailedCategory) && /top:\s*10px/.test(detailedCategory) && /left:\s*0/.test(detailedCategory));
check('detailed category bookmark is left-attached', /border-radius:\s*0 4px 4px 0/.test(detailedCategory));
check('detailed category is not rendered beside the venue tag', !/venue-tag[\s\S]{0,120}category-tag/.test(detailed));
check('homepage dark conference venue uses muted green', /\[data-theme="dark"\] \.venue-tag\.conference\s*\{[^}]*rgba\(34, 197, 94, 0\.15\)[^}]*#86efac/.test(home));
check('detailed dark conference venue matches homepage without host-context', /\.publications-list\.is-dark \.venue-tag\.conference\s*\{[^}]*rgba\(34, 197, 94, 0\.15\)[^}]*#86efac/.test(detailed));
check('detailed applies is-dark after render', detailed.includes('classList.toggle(\'is-dark\'') && detailed.includes('this.syncThemeFromDocument()'));

if (failed) {
  console.log(`FAILED: ${failed}`);
  process.exit(1);
}
console.log('ALL PASSED');
