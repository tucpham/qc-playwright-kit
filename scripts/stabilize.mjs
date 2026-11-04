#!/usr/bin/env node
// Stabilization gate: a new or changed test must pass N times in a row with no retries.
// Usage:
//   npm run stabilize -- tests/regression/tasks.spec.ts [--runs 5]
//   npm run stabilize:changed [-- --base origin/main]   (only spec files changed vs base)
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { arg, git, npx, summary, walkReport } from './lib.mjs';

const runs = Number(arg('runs', process.env.STABILIZE_RUNS ?? 5));
let files = process.argv.slice(2).filter((a, i, all) => !a.startsWith('--') && !all[i - 1]?.match(/^--(runs|base)$/));

if (arg('changed', false)) {
  const base = arg('base', process.env.STABILIZE_BASE ?? 'origin/main');
  const changed = git(['diff', '--name-only', '--diff-filter=AM', `${base}...HEAD`]).split('\n');
  const untracked = git(['ls-files', '--others', '--exclude-standard']).split('\n');
  files = [...new Set([...changed, ...untracked])].filter((f) => /^tests\/.*\.spec\.ts$/.test(f) && fs.existsSync(f));
}

if (!files.length) {
  console.log('No test files to stabilize.');
  process.exit(0);
}

const out = path.join('test-results', 'stabilize.json');
console.log(`Stabilizing ${files.length} file(s) x ${runs} runs, retries=0:\n  ${files.join('\n  ')}\n`);
const run = spawnSync(
  npx,
  ['playwright', 'test', ...files, `--repeat-each=${runs}`, '--retries=0', '--reporter=dot,json'],
  { stdio: ['ignore', 'inherit', 'inherit'], env: { ...process.env, PLAYWRIGHT_JSON_OUTPUT_NAME: out } },
);

if (!fs.existsSync(out)) {
  console.error('No JSON report produced. Playwright exit code:', run.status);
  process.exit(run.status || 1);
}

const byTest = new Map();
for (const t of walkReport(JSON.parse(fs.readFileSync(out, 'utf8')))) {
  if (t.project === 'setup') continue;
  const key = `${t.file}:${t.line} ${t.title}`;
  const s = byTest.get(key) ?? { pass: 0, fail: 0 };
  if (t.status === 'expected') s.pass++;
  else if (t.status !== 'skipped') s.fail++;
  byTest.set(key, s);
}

const icon = (s) => (s.fail ? '❌' : s.pass ? '✅' : '⏭️ skipped');
const rows = [...byTest].map(([k, s]) => `| ${icon(s)} | ${s.pass}/${s.pass + s.fail} | ${k} |`);
const unstable = [...byTest.values()].filter((s) => s.fail).length;
summary(['### Stabilization', '| | Passed | Test |', '|---|---|---|', ...rows, '', unstable ? `**${unstable} unstable test(s). Do not merge.**` : `All tests stable over ${runs} runs.`].join('\n'));
process.exit(unstable || run.status ? 1 : 0);
