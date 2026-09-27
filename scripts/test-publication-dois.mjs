import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const pubs = JSON.parse(readFileSync(join(root, 'data/publications.json'), 'utf8')).publications;
const home = readFileSync(join(root, 'js/components/PublicationList.js'), 'utf8');

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

const detailed = readFileSync(join(root, 'js/components/DetailedPublicationList.js'), 'utf8');
const itemStart = home.indexOf('renderPublicationItem(pub)');
const itemSlice = home.slice(itemStart, itemStart + 2500);
const venuePos = itemSlice.indexOf('publication-venue');
const linksPos = itemSlice.indexOf('publication-links');
const footerPos = itemSlice.indexOf('publication-footer');
const bibtexPos = itemSlice.indexOf('<span>Bibtex</span>');

assert(pubs.every((p) => p.doi), 'every publication needs a doi');
assert(footerPos >= 0 && venuePos > footerPos, 'venue should be inside footer again');
assert(linksPos > venuePos, 'links should follow venue in the same footer row');
assert(bibtexPos >= 0, 'Bibtex link should remain');
assert(!home.includes('publication-doi'), 'should not use large DOI block');
assert(/const showDoiBadge = false/.test(home), 'home list should hide DOI badge');
assert(/const showDoiBadge = false/.test(detailed), 'detailed list should hide DOI badge');
assert(/showDoiBadge && pub\.doi/.test(home) && /showDoiBadge && pub\.doi/.test(detailed), 'DOI markup should stay gated for later');

console.log(JSON.stringify({
  ok: true,
  venueInsideFooter: venuePos > footerPos,
  doiDataKept: pubs.every((p) => Boolean(p.doi)),
  doiBadgeHidden: true,
}, null, 2));
