import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'css/styles.css'), 'utf8');

let failed = 0;
function check(name, cond) {
  console.log(`${cond ? 'PASS' : 'FAIL'}: ${name}`);
  if (!cond) failed += 1;
}

check('role and org are on one byline with a pipe', /profile-vcard-role">Researcher<\/span>\s*<span class="profile-vcard-at" aria-hidden="true">\|<\/span>\s*<span class="profile-vcard-org">Paradoox AI Research<\/span>/.test(html));
check('role is not forced uppercase', /\.profile-vcard-role\s*\{[^}]*text-transform:\s*none/.test(css));
check('no vcard corner borders', !/\.profile-vcard::before/.test(css) && !/--vcard-line/.test(css));
check('each email line has its own envelope icon', (html.match(/class="profile-email-label"[^>]*>\s*<i class="far fa-envelope"/g) || []).length === 2 && html.includes('aria-label="Academic email"') && html.includes('aria-label="Business email"') && html.includes('pma929@connect.hkust-gz.edu.cn') && html.includes('mpx0222@paradoox.ai') && /\.profile-email-addresses\s*\{[^}]*display:\s*grid/.test(css));
check('purpose label comes before each email', /For Academic[\s\S]*profile-email-at[\s\S]*pma929@connect\.hkust-gz\.edu\.cn[\s\S]*For Business[\s\S]*mpx0222@paradoox\.ai/.test(html) && /\.profile-email-use\s*\{[^}]*font-weight:\s*600/.test(css) && /\.profile-email-addresses\s*\{[^}]*grid-template-columns:\s*auto auto auto 1fr/.test(css));
check('profile-email id kept for highlight', /id="profile-email"/.test(html));
check('vcard background stays transparent', /\.profile-vcard\s*\{[^}]*background:\s*transparent/.test(css));
check('gradient line sits between vcard and tags', /\.profile-vcard::after/.test(css) && /min\(34rem/.test(css));
check('byline and email fonts are mid-size', /\.profile-vcard-byline\s*\{[^}]*font-size:\s*1\.05rem/.test(css) && /\.profile-email\s*\{[^}]*font-size:\s*0\.98rem/.test(css));
check('profile photo stretches to the social tags', /\.profile-card\s*\{[^}]*align-items:\s*stretch/.test(css) && /\.profile-image img\s*\{[^}]*position:\s*absolute/.test(css) && /\.profile-image img\s*\{[^}]*inset:\s*0/.test(css));

if (failed) {
  console.log(`FAILED: ${failed}`);
  process.exit(1);
}
console.log('ALL PASSED');
