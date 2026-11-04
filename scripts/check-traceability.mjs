#!/usr/bin/env node
// Traceability check: specs/*.md <-> tests.
// Errors (exit 1): test without TC ID, unknown TC, TC not approved, duplicate, missing required tags.
// Warnings: approved TC without a test (coverage gap).
// Usage: npm run trace:check [-- --strict]   (--strict also fails on coverage gaps)
import path from 'node:path';
import { arg, listTests, readSpecs, summary, TC_ID, writeJson } from './lib.mjs';

const strict = arg('strict', false) === true;
const specs = readSpecs();
const tests = listTests().filter((t) => t.project !== 'setup');
const errors = [];
const warnings = [];

const specById = new Map();
for (const tc of specs) {
  if (specById.has(tc.id)) errors.push(`Duplicate TC ID ${tc.id} in ${specById.get(tc.id).file} and ${tc.file}`);
  specById.set(tc.id, tc);
  if (!['draft', 'approved', 'deprecated'].includes(tc.status)) {
    errors.push(`${tc.id} (${tc.file}): Status must be draft | approved | deprecated, got "${tc.status}"`);
  }
}

const testsById = new Map();
for (const t of tests) {
  const where = `${t.file}:${t.line}`;
  if (t.title.startsWith('[SEED]')) continue;
  const id = TC_ID.exec(t.title)?.[0];
  if (!id || !t.title.startsWith(`[${id}]`)) {
    errors.push(`${where} "${t.title}": title must start with [TC-XXX-NNN]`);
    continue;
  }
  if (!t.tags.includes('smoke') && !t.tags.includes('regression')) {
    errors.push(`${where} ${id}: needs @smoke or @regression`);
  }
  // same TC in several browser projects is fine; same TC in two different tests is not
  const key = `${t.file}:${t.line}`;
  const seen = testsById.get(id) ?? new Set();
  seen.add(key);
  testsById.set(id, seen);
  if (seen.size > 1) errors.push(`${id} is implemented by more than one test: ${[...seen].join(', ')}`);

  const tc = specById.get(id);
  if (!tc) {
    errors.push(`${where} ${id}: not found in specs/`);
    continue;
  }
  if (tc.status !== 'approved') errors.push(`${where} ${id}: spec status is "${tc.status}", only approved TCs may have tests`);
  for (const tag of tc.tags) {
    if (!t.tags.includes(tag)) errors.push(`${where} ${id}: spec requires @${tag}`);
  }
}

const approved = specs.filter((tc) => tc.status === 'approved');
const covered = approved.filter((tc) => testsById.has(tc.id));
for (const tc of approved.filter((x) => !testsById.has(x.id))) {
  warnings.push(`${tc.id} (${tc.file}, ${tc.priority}): approved but has no test`);
}
const drafts = specs.filter((tc) => tc.status === 'draft');
const coverage = approved.length ? Math.round((covered.length / approved.length) * 1000) / 10 : 0;

writeJson(path.join('metrics', 'traceability.json'), {
  generatedAt: new Date().toISOString(),
  specs: specs.length,
  approved: approved.length,
  draft: drafts.length,
  automated: covered.length,
  coveragePct: coverage,
  uncovered: approved.filter((x) => !testsById.has(x.id)).map((x) => x.id),
});

summary(
  [
    '### Traceability',
    `| Test cases | Approved | Draft | Automated | Coverage of approved |`,
    `|---|---|---|---|---|`,
    `| ${specs.length} | ${approved.length} | ${drafts.length} | ${covered.length} | ${coverage}% |`,
    '',
    ...errors.map((e) => `- ❌ ${e}`),
    ...warnings.map((w) => `- ⚠️ ${w}`),
  ].join('\n'),
);

if (errors.length || (strict && warnings.length)) {
  console.error(`\nTraceability check failed: ${errors.length} error(s), ${warnings.length} warning(s).`);
  process.exit(1);
}
