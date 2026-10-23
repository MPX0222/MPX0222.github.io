import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';
import vm from 'node:vm';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const helperSource = readFileSync(join(root, 'js/components/huggingfaceProjectName.js'), 'utf8');
const home = readFileSync(join(root, 'js/components/PublicationList.js'), 'utf8');
const detailed = readFileSync(join(root, 'js/components/DetailedPublicationList.js'), 'utf8');
const workflow = readFileSync(join(root, '.github/workflows/update-hf-downloads.yml'), 'utf8');
const publications = JSON.parse(readFileSync(join(root, 'data/publications.json'), 'utf8'));

let failed = 0;
function check(name, cond) {
  console.log(`${cond ? 'PASS' : 'FAIL'}: ${name}`);
  if (!cond) failed += 1;
}

const context = { URL, decodeURIComponent };
vm.createContext(context);
vm.runInContext(helperSource, context);
const stat = context.huggingfaceDownloadStat;

const sample = stat({
  stats: {
    huggingface: {
      downloads: 8936,
      repos: [
        { id: 'MPX0222forHF/SQL-R1-7B', type: 'model', downloads: 2490 },
        { id: 'MPX0222forHF/SynSQL-Complex-5K', type: 'dataset', downloads: 2793 },
      ],
    },
  },
});
check('formats the cumulative total', sample.includes('>8,936</span>'));
check('omits the downloads word', !/>[^<]*download/i.test(sample));
check('tooltip lists each repo', sample.includes('MPX0222forHF/SQL-R1-7B (model): 2,490') && sample.includes('SynSQL-Complex-5K (dataset): 2,793'));
check('uses a line break between repos', sample.includes('&#10;'));
check('shows the number without a word', stat({ stats: { huggingface: { downloads: 1, repos: [] } } }).includes('>1</span>'));
check('missing stats render nothing', stat({ stats: { citations: 4 } }) === '');
check('escapes tooltip text', stat({
  stats: { huggingface: { downloads: 2, repos: [{ id: 'org/a<b>', type: 'model', downloads: 2 }] } },
}).includes('org/a&lt;b&gt;'));

for (const [name, source] of [['home', home], ['detailed', detailed]]) {
  const statsAt = source.indexOf('huggingfaceDownloadStat(pub)');
  const citationsAt = source.indexOf('class="citation-count"', statsAt);
  check(`${name} renders downloads before citations`, statsAt !== -1 && citationsAt > statsAt);
  check(`${name} styles the download stat`, source.includes('.hf-downloads'));
  check(`${name} citation is an icon and a number`, source.includes('fa-quote-left') && source.includes("toLocaleString('en-US')}</span>") && !source.includes('citations</span>'));
}

check('workflow runs at 00:30 Asia/Shanghai', workflow.includes("cron: '30 16 * * *'"));
check('workflow can be triggered manually', workflow.includes('workflow_dispatch:'));
check('workflow updates publications.json', workflow.includes('python scripts/update_hf_downloads.py') && workflow.includes('data/publications.json'));

for (const pub of publications.publications) {
  const linked = Boolean(pub.links && pub.links.huggingface);
  const hf = pub.stats && pub.stats.huggingface;
  if (!linked) {
    check(`${pub.title} has no download total`, !hf);
    continue;
  }
  const sum = (hf.repos || []).reduce((total, repo) => total + repo.downloads, 0);
  check(`${pub.title} total matches its repos`, hf && hf.downloads === sum && hf.downloads > 0);
}

const python = spawnSync('python3', ['scripts/test_hf_downloads.py'], { cwd: root, encoding: 'utf8' });
if (python.stdout) process.stdout.write(python.stdout);
if (python.stderr) process.stderr.write(python.stderr);
check('python aggregation tests pass', python.status === 0);

if (failed) {
  console.log(`FAILED: ${failed}`);
  process.exit(1);
}
console.log('ALL PASSED');
