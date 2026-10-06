import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  applyLastUpdated,
  formatLastUpdated,
  selectContentCommit,
} from './update-last-updated.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const workflow = fs.readFileSync(
  path.join(root, '.github/workflows/update-last-updated.yml'),
  'utf8'
);

let failed = 0;
function check(name, cond) {
  console.log(`${cond ? 'PASS' : 'FAIL'}: ${name}`);
  if (!cond) failed += 1;
}

const footer = '<span class="last-updated">Last Updated: September 2026</span>';

check(
  'Shanghai month rolls at UTC 16:00',
  formatLastUpdated('2026-09-30T15:59:00Z') === 'September 2026' &&
    formatLastUpdated('2026-09-30T16:00:00Z') === 'October 2026'
);
check(
  'keeps an explicit +0800 date in that month',
  formatLastUpdated('2026-10-04T10:13:31+08:00') === 'October 2026'
);
check(
  'skips citation bot commits',
  selectContentCommit([
    { author: 'GitHub Actions', email: 'action@github.com', iso: '2026-10-05T11:19:23Z' },
    { author: 'MPX0222', email: '614147525@qq.com', iso: '2026-10-04T02:13:31Z' },
  ]) === '2026-10-04T02:13:31Z'
);
check(
  'skips the bot when only the email matches',
  selectContentCommit([
    { author: 'someone', email: 'action@github.com', iso: '2026-11-01T00:00:00Z' },
    { author: 'MPX0222', email: '614147525@qq.com', iso: '2026-10-04T02:13:31Z' },
  ]) === '2026-10-04T02:13:31Z'
);

const updated = applyLastUpdated(footer, 'October 2026');
check('rewrites the month token', updated.changed && updated.html.includes('Last Updated: October 2026'));
check('leaves a matching month untouched', applyLastUpdated(footer, 'September 2026').changed === false);

let missing = false;
try {
  applyLastUpdated('<footer></footer>', 'October 2026');
} catch (error) {
  missing = error.message.includes('last-updated span not found');
}
check('fails when the footer span is missing', missing);

check(
  'homepage still has one last-updated span',
  (html.match(/<span class="last-updated">Last Updated: [A-Z][a-z]+ \d{4}<\/span>/g) || []).length === 1
);
check('workflow ignores citation-only pushes', workflow.includes('data/publications.json'));
check('workflow reads full history', workflow.includes('fetch-depth: 0'));
check('workflow commits with skip ci', workflow.includes('[skip ci]'));
check('workflow commits as GitHub Actions', workflow.includes('GitHub Actions'));

if (failed) {
  console.log(`FAILED: ${failed}`);
  process.exit(1);
}
console.log('ALL PASSED');
