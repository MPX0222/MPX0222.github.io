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

check('role and org are on one byline with @', /profile-vcard-role">Researcher[\s\S]*profile-vcard-at[\s\S]*@[\s\S]*profile-vcard-org">Paradoox AI Research/.test(html));
check('role is not forced uppercase', /\.profile-vcard-role\s*\{[^}]*text-transform:\s*none/.test(css));
check('no vcard corner borders', !/\.profile-vcard::before/.test(css) && !/--vcard-line/.test(css));
check('email is two address lines with bold label', /profile-email-label[\s\S]*Email/.test(html) && html.includes('pma929[at]connect.hkust-gz.edu.cn') && html.includes('mpx0222[at]paradoox.ai') && /\.profile-email-addresses\s*\{[^}]*flex-direction:\s*column/.test(css) && /\.profile-email-label\s*\{[^}]*font-weight:\s*700/.test(css));
check('profile-email id kept for highlight', /id="profile-email"/.test(html));
check('vcard background stays transparent', /\.profile-vcard\s*\{[^}]*background:\s*transparent/.test(css));
check('gradient line sits between vcard and tags', /\.profile-vcard\s*\{[^}]*background-image:\s*linear-gradient\(to right/.test(css) && /\.profile-vcard\s*\{[^}]*background-size:[^}]*1px/.test(css));
check('byline and email fonts are mid-size', /\.profile-vcard-byline\s*\{[^}]*font-size:\s*1\.05rem/.test(css) && /\.profile-email\s*\{[^}]*font-size:\s*0\.98rem/.test(css));

if (failed) {
  console.log(`FAILED: ${failed}`);
  process.exit(1);
}
console.log('ALL PASSED');
