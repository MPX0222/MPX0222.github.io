import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const edu = JSON.parse(fs.readFileSync(path.join(root, 'data/education.json'), 'utf8')).education;
const internships = JSON.parse(fs.readFileSync(path.join(root, 'data/internships.json'), 'utf8')).internships;
const js = fs.readFileSync(path.join(root, 'js/components/EducationList.js'), 'utf8');
const internJs = fs.readFileSync(path.join(root, 'js/components/InternshipList.js'), 'utf8');
const css = fs.readFileSync(path.join(root, 'css/styles.css'), 'utf8');

let failed = 0;
function check(name, cond) {
  console.log(`${cond ? 'PASS' : 'FAIL'}: ${name}`);
  if (!cond) failed += 1;
}

check(
  'education compact keeps school and date on the header row',
  /compact-title">\$\{edu\.school\}<\/span>/.test(js)
    && /compact-date">\$\{edu\.period\}<\/span>/.test(js)
);
check(
  'internship compact keeps company and date on the header row',
  /compact-title">\$\{intern\.company\}<\/span>/.test(internJs)
    && /compact-date">\$\{intern\.period\}<\/span>/.test(internJs)
);

edu.forEach((item, i) => {
  check(`education ${i} has school + period`, Boolean(item.school && item.period));
});
internships.forEach((item, i) => {
  check(`internship ${i} has company + period`, Boolean(item.company && item.period));
});

check(
  'Education and Employment columns are equal width',
  /\.compact-section\s*\{[^}]*flex:\s*1 1 0/.test(css)
    && /\.compact-section\s*\{[^}]*min-width:\s*0/.test(css)
);
check(
  'school/company title is allowed to wrap',
  /white-space:\s*normal/.test(css)
    && /overflow-wrap:\s*break-word/.test(css)
    && /max-width:\s*70%/.test(css)
);
check(
  'dates stay nowrap so they remain on the right',
  /\.compact-date\s*\{[^}]*white-space:\s*nowrap/.test(css)
);

if (failed) {
  console.log(`FAILED: ${failed}`);
  process.exit(1);
}
console.log('ALL PASSED');
