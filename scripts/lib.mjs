// Shared helpers for kit scripts. No dependencies.
import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

export const ROOT = process.cwd();
export const SPECS_DIR = path.join(ROOT, 'specs');
export const TC_ID = /TC-[A-Z0-9]+-\d{3}/;

const isWin = process.platform === 'win32';
export const npx = isWin ? 'npx.cmd' : 'npx';

/** Parse all specs/*.md into { id, title, status, priority, tags[], role, file } */
export function readSpecs() {
  if (!fs.existsSync(SPECS_DIR)) return [];
  const cases = [];
  for (const file of fs.readdirSync(SPECS_DIR).filter((f) => f.endsWith('.md') && !f.startsWith('_'))) {
    const text = fs.readFileSync(path.join(SPECS_DIR, file), 'utf8');
    const blocks = text.split(/^## /m).slice(1);
    for (const block of blocks) {
      const head = /^(TC-[A-Z0-9]+-\d{3})\s+(.+)$/m.exec(block);
      if (!head) continue;
      const field = (name) => new RegExp(`^- ${name}:\\s*(.+)$`, 'mi').exec(block)?.[1]?.trim() ?? '';
      cases.push({
        id: head[1],
        title: head[2].trim(),
        status: field('Status').toLowerCase(),
        priority: field('Priority'),
        tags: (field('Tags').match(/@\w+/g) ?? []).map((t) => t.slice(1)),
        role: field('Role'),
        file: `specs/${file}`,
      });
    }
  }
  return cases;
}

/** List tests via Playwright (no browser, no web server): [{ title, tags[], file, project }] */
export function listTests(extraArgs = []) {
  const out = execFileSync(npx, ['playwright', 'test', '--list', '--reporter=json', ...extraArgs], {
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
    stdio: ['ignore', 'pipe', 'inherit'],
  });
  const json = JSON.parse(out);
  const tests = [];
  const walk = (suite) => {
    for (const spec of suite.specs ?? []) {
      for (const t of spec.tests) {
        tests.push({ title: spec.title, tags: spec.tags ?? [], file: `tests/${spec.file}`, line: spec.line, project: t.projectName });
      }
    }
    (suite.suites ?? []).forEach(walk);
  };
  json.suites.forEach(walk);
  return tests;
}

/** Walk a Playwright JSON report. Yields { title, tags, file, project, status, results } per test. */
export function* walkReport(report) {
  function* walk(suite) {
    for (const spec of suite.specs ?? []) {
      for (const t of spec.tests) {
        yield { title: spec.title, tags: spec.tags ?? [], file: spec.file, line: spec.line, project: t.projectName, status: t.status, results: t.results };
      }
    }
    for (const s of suite.suites ?? []) yield* walk(s);
  }
  for (const s of report.suites ?? []) yield* walk(s);
}

export function git(args) {
  const r = spawnSync('git', args, { encoding: 'utf8' });
  if (r.status !== 0) throw new Error(`git ${args.join(' ')} failed: ${r.stderr.trim()}`);
  return r.stdout;
}

export function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  if (i < 0) return fallback;
  const next = process.argv[i + 1];
  return next && !next.startsWith('--') ? next : true;
}

export function writeJson(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

export function summary(markdown) {
  console.log(markdown);
  if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${markdown}\n`);
}
