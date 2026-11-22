import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'css/styles.css'), 'utf8');
const navbar = fs.readFileSync(path.join(root, 'js/components/Navbar.js'), 'utf8');

let failed = 0;
function check(name, cond) {
  console.log(`${cond ? 'PASS' : 'FAIL'}: ${name}`);
  if (!cond) failed += 1;
}

check('role and org are on one byline with a pipe', /profile-vcard-role">Researcher<\/span>\s*<span class="profile-vcard-at" aria-hidden="true">\|<\/span>\s*<span class="profile-vcard-org">Paradoox AI Research<\/span>/.test(html));
check('role is not forced uppercase', /\.profile-vcard-role\s*\{[^}]*text-transform:\s*none/.test(css));
check('no vcard corner borders', !/\.profile-vcard::before/.test(css) && !/--vcard-line/.test(css));
check('each email line has its own envelope icon', (html.match(/class="profile-email-label"[^>]*>\s*<i class="far fa-envelope"/g) || []).length === 2 && html.includes('aria-label="Academic email"') && html.includes('aria-label="Business email"') && html.includes('pma929@connect.hkust-gz.edu.cn') && html.includes('mpx0222@paradoox.ai') && /\.profile-email-addresses\s*\{[^}]*display:\s*grid/.test(css));
check('purpose label comes before each email', /For Academic[\s\S]*profile-email-at[\s\S]*pma929@connect\.hkust-gz\.edu\.cn[\s\S]*For Business[\s\S]*mpx0222@paradoox\.ai/.test(html) && /\.profile-email-use\s*\{[^}]*font-weight:\s*600/.test(css) && /\.profile-email-use\s*\{[^}]*text-transform:\s*uppercase/.test(css) && /\.profile-email-addresses\s*\{[^}]*grid-template-columns:\s*1\.2rem\s+calc\(var\(--vcard-key-col\)\s*-\s*1\.2rem\)\s+var\(--vcard-sep-col\)\s+1fr/.test(css));
check('bylines and emails share unified Swiss grid column variables', /\.profile-vcard\s*\{[^}]*--vcard-key-col:/.test(css) && /\.profile-vcard-byline\s*\{[^}]*grid-template-columns:\s*var\(--vcard-key-col\)\s+var\(--vcard-sep-col\)\s+minmax\(0,\s*1fr\)/.test(css));
check('all non-name header elements unify on Sansation font', /\.profile-vcard-byline\s*\{[^}]*font-family:\s*var\(--font-sansation\)/.test(css) && /\.profile-vcard-role\s*\{[^}]*font-family:\s*var\(--font-sansation\)/.test(css) && /\.profile-vcard-org\s*\{[^}]*font-family:\s*var\(--font-sansation\)/.test(css) && /\.profile-email\s*\{[^}]*font-family:\s*var\(--font-sansation\)/.test(css) && /\.profile-email-use\s*\{[^}]*font-family:\s*var\(--font-sansation\)/.test(css));
check('profile-name preserves Playfair Display and gradient color design', /\.profile-name\s*\{[^}]*font-family:\s*'Playfair Display',\s*serif/.test(css) && /\.profile-name\s*\{[^}]*background:\s*linear-gradient\(to right,\s*var\(--text-color\),\s*var\(--primary-color\),\s*var\(--primary-light\)\)/.test(css));
check('profile-email id kept for highlight', /id="profile-email"/.test(html));
check('vcard background stays transparent', /\.profile-vcard\s*\{[^}]*background:\s*transparent/.test(css));
check('no horizontal rule under name and portrait sits on right', /\.profile-vcard::after\s*\{[^}]*display:\s*none/.test(css) && /\.profile-image\s*\{[^}]*grid-column:\s*2/.test(css) && /\.profile-info\s*\{[^}]*grid-column:\s*1/.test(css));
check('byline and email fonts are mid-size', /\.profile-vcard-byline\s*\{[^}]*font-size:\s*1\.05rem/.test(css) && /\.profile-email\s*\{[^}]*font-size:\s*0\.98rem/.test(css));
check('profile photo stretches to the social tags', /\.profile-card\s*\{[^}]*align-items:\s*stretch/.test(css) && /\.profile-image img\s*\{[^}]*position:\s*absolute/.test(css) && /\.profile-image img\s*\{[^}]*inset:\s*0/.test(css));
check('Navbar Mail button smoothly scrolls back to top without highlight query', /<a href="\.\.\/index\.html" class="nav-contact">/.test(navbar) && !navbar.includes('focusEmail') && /window\.scrollTo\(\{\s*top:\s*0,\s*behavior:\s*'smooth'\s*\}\)/.test(navbar));

if (failed) {
  console.log(`FAILED: ${failed}`);
  process.exit(1);
}
console.log('ALL PASSED');
