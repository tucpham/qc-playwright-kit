#!/usr/bin/env node
// Turn test-results/results.json into metrics for dashboards and quality gates.
// Usage:
//   npm run metrics                       write metrics/latest.json + summary
//   npm run metrics -- --gate release     also enforce the gate (exit 1 if it fails)
// Gate thresholds (env overrides): MIN_PASS_RATE, MAX_FLAKY_RATE, MAX_DURATION_MIN
import fs from 'node:fs';
import path from 'node:path';
import { arg, summary, walkReport, writeJson } from './lib.mjs';

const reportFile = arg('report', path.join('test-results', 'results.json'));
if (!fs.existsSync(reportFile)) {
  console.error(`${reportFile} not found. Run the tests first.`);
  process.exit(1);
}
const report = JSON.parse(fs.readFileSync(reportFile, 'utf8'));
const tests = [...walkReport(report)].filter((t) => t.project !== 'setup');

const count = (s) => tests.filter((t) => t.status === s).length;
const executed = tests.filter((t) => t.status !== 'skipped').length;
const passed = count('expected');
const flaky = count('flaky');
const failed = count('unexpected');
const pct = (n) => (executed ? Math.round((n / executed) * 1000) / 10 : 0);
const failedTests = tests.filter((t) => t.status === 'unexpected');
const criticalFailed = failedTests.filter((t) => t.tags.includes('critical'));

const metrics = {
  project: report.config?.metadata?.project ?? 'unknown',
  env: report.config?.metadata?.env ?? process.env.TEST_ENV ?? 'unknown',
  commit: process.env.GITHUB_SHA ?? process.env.CI_COMMIT_SHA ?? '',
  generatedAt: new Date().toISOString(),
  total: tests.length,
  executed,
  passed,
  flaky,
  failed,
  skipped: count('skipped'),
  passRatePct: pct(passed + flaky),
  flakyRatePct: pct(flaky),
  durationMin: Math.round(((report.stats?.duration ?? 0) / 60000) * 10) / 10,
  failedTests: failedTests.map((t) => `${t.file}:${t.line} ${t.title}`),
  flakyTests: tests.filter((t) => t.status === 'flaky').map((t) => `${t.file}:${t.line} ${t.title}`),
  criticalFailed: criticalFailed.map((t) => t.title),
};

writeJson(path.join('metrics', 'latest.json'), metrics);
writeJson(path.join('metrics', 'history', `${metrics.generatedAt.replace(/[:.]/g, '-')}.json`), metrics);

const gate = arg('gate', false);
const gates = {
  // PR: smoke must be green, a little flakiness tolerated but reported
  pr: { minPass: 100, maxFlaky: 5, maxDuration: 10 },
  // Nightly: track trends, fail loudly on criticals
  nightly: { minPass: 95, maxFlaky: 3, maxDuration: 60 },
  // Release: no failures, no criticals, flakiness under control
  release: { minPass: 100, maxFlaky: 2, maxDuration: 90 },
};
const g = gate ? { ...gates[gate] } : null;
if (gate && !g) {
  console.error(`Unknown gate "${gate}". Use: ${Object.keys(gates).join(', ')}`);
  process.exit(1);
}
if (g) {
  g.minPass = Number(process.env.MIN_PASS_RATE ?? g.minPass);
  g.maxFlaky = Number(process.env.MAX_FLAKY_RATE ?? g.maxFlaky);
  g.maxDuration = Number(process.env.MAX_DURATION_MIN ?? g.maxDuration);
}
const checks = g
  ? [
      ['No @critical failures', criticalFailed.length === 0, `${criticalFailed.length} failed`],
      [`Pass rate >= ${g.minPass}%`, metrics.passRatePct >= g.minPass, `${metrics.passRatePct}%`],
      [`Flaky rate <= ${g.maxFlaky}%`, metrics.flakyRatePct <= g.maxFlaky, `${metrics.flakyRatePct}%`],
      [`Duration <= ${g.maxDuration} min`, metrics.durationMin <= g.maxDuration, `${metrics.durationMin} min`],
    ]
  : [];

summary(
  [
    `### Test run: ${metrics.project} @ ${metrics.env}`,
    '| Total | Passed | Flaky | Failed | Skipped | Pass rate | Flaky rate | Duration |',
    '|---|---|---|---|---|---|---|---|',
    `| ${metrics.total} | ${passed} | ${flaky} | ${failed} | ${metrics.skipped} | ${metrics.passRatePct}% | ${metrics.flakyRatePct}% | ${metrics.durationMin} min |`,
    ...(metrics.failedTests.length ? ['', '**Failed**', ...metrics.failedTests.map((t) => `- ${t}`)] : []),
    ...(metrics.flakyTests.length ? ['', '**Flaky (passed on retry, needs fixing)**', ...metrics.flakyTests.map((t) => `- ${t}`)] : []),
    ...(g ? ['', `**Quality gate: ${gate}**`, '| Check | Result | Value |', '|---|---|---|', ...checks.map(([n, ok, v]) => `| ${n} | ${ok ? '✅' : '❌'} | ${v} |`)] : []),
  ].join('\n'),
);

if (g && checks.some(([, ok]) => !ok)) process.exit(1);
