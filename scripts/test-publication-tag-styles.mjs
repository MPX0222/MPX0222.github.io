import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const home = readFileSync(join(root, 'js/components/PublicationList.js'), 'utf8');
const detailed = readFileSync(join(root, 'js/components/DetailedPublicationList.js'), 'utf8');
const styles = readFileSync(join(root, 'css/styles.css'), 'utf8');
const detailedMarkup = detailed.slice(0, detailed.indexOf('<style>'));

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
const homePreprint = extractRule(home, '.venue-tag.preprint.arXiv');
const homeJournal = extractRule(home, '.venue-tag.journal');
const detailedConference = extractRule(detailed, '.venue-tag.conference');
const stylesheetVenue = extractRule(styles, '.venue-tag');
const detailedVenue = extractRule(detailed, '.venue-tag');
const detailedCategory = extractRule(detailed, '.category-tag');

check('homepage conference venue keeps green text without a fill', !/background-color:\s*#f0fdf4/.test(homeConference) && /color:\s*#16a34a/.test(homeConference));
check('homepage arXiv venue keeps red text without a fill', !/background-color/.test(homePreprint) && /color:\s*#dc2626/.test(homePreprint));
check('homepage journal venue keeps blue text without a fill', !/background-color/.test(homeJournal) && /color:\s*#2563eb/.test(homeJournal));
check('shared stylesheet venue tag has no fill', /background-color:\s*transparent/.test(stylesheetVenue) && !/background-color:\s*#/.test(stylesheetVenue));
check('homepage venue row has no vertical offset against links', /class="publication-venue"[\s\S]*?\.publication-venue\s*\{[^}]*margin:\s*0;/.test(home) && /\.publication-links\s*\{[^}]*margin:\s*0;/.test(home));
check('detailed conference venue keeps green text without a fill', !/background-color:\s*#f0fdf4/.test(detailedConference) && /color:\s*#16a34a/.test(detailedConference));
check('detailed venue no longer uses a left border', !/border-left/.test(detailedVenue + detailedConference));
check('detailed category sits on the thumbnail as a bookmark', /publication-thumbnail[\s\S]*category-tag[\s\S]*<\/div>/.test(detailed) && /position:\s*absolute/.test(detailedCategory) && /top:\s*10px/.test(detailedCategory) && /left:\s*0/.test(detailedCategory));
check('detailed category bookmark is left-attached', /border-radius:\s*0 4px 4px 0/.test(detailedCategory));
check('detailed category is not rendered beside the venue tag', !/venue-tag[\s\S]{0,120}category-tag/.test(detailedMarkup));
check('homepage dark conference venue keeps muted green text without a fill', /\[data-theme="dark"\] \.venue-tag\.conference\s*\{[^}]*color:\s*#86efac/.test(home) && !/\[data-theme="dark"\] \.venue-tag\.conference\s*\{[^}]*background-color/.test(home));
check('detailed dark conference venue keeps muted green text without a fill', /\.publications-list\.is-dark \.venue-tag\.conference\s*\{[^}]*color:\s*#86efac/.test(detailed) && !/\.publications-list\.is-dark \.venue-tag\.conference\s*\{[^}]*background-color/.test(detailed));
check('detailed applies is-dark after render', detailed.includes('classList.toggle(\'is-dark\'') && detailed.includes('this.syncThemeFromDocument()'));

if (failed) {
  console.log(`FAILED: ${failed}`);
  process.exit(1);
}
console.log('ALL PASSED');
