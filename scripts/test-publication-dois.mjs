import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const pubs = JSON.parse(readFileSync(join(root, 'data/publications.json'), 'utf8')).publications;
const home = readFileSync(join(root, 'js/components/PublicationList.js'), 'utf8');

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

const itemStart = home.indexOf('renderPublicationItem(pub)');
const itemSlice = home.slice(itemStart, itemStart + 2500);
const venuePos = itemSlice.indexOf('publication-venue');
const linksPos = itemSlice.indexOf('publication-links');
const footerPos = itemSlice.indexOf('publication-footer');
const doiPos = itemSlice.indexOf('doi-link');
const bibtexPos = itemSlice.indexOf('<span>Bibtex</span>');

assert(pubs.every((p) => p.doi), 'every publication needs a doi');
assert(footerPos >= 0 && venuePos > footerPos, 'venue should be inside footer again');
assert(linksPos > venuePos, 'links should follow venue in the same footer row');
assert(doiPos > bibtexPos, 'DOI tag should follow Bibtex');
assert(!home.includes('publication-doi'), 'should not use large DOI block');

console.log(JSON.stringify({
  ok: true,
  venueInsideFooter: venuePos > footerPos,
  doiAfterBibtex: doiPos > bibtexPos,
}, null, 2));
