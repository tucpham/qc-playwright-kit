#!/usr/bin/env node
// Guard against "healing" that hides bugs. Flags changes that weaken tests:
//   removed assertions, changed expected values, new skip/fixme/only/fail, force clicks,
//   .or() fallbacks, custom timeouts, hard waits.
// Exit 1 when something is flagged, unless QC_APPROVED=1 (set by CI when a QC lead adds the
// "qc-approved" label to the PR). Usage: npm run guard [-- --base origin/main]
import { arg, git, summary } from './lib.mjs';

const base = arg('base', process.env.GUARD_BASE ?? 'origin/main');
const diff = git(['diff', '--unified=0', `${base}...HEAD`, '--', 'tests', 'project']);

const findings = [];
let file = '';
let removedExpects = [];
const flush = () => {
  for (const line of removedExpects) findings.push({ file, kind: 'assertion removed or changed', line });
  removedExpects = [];
};

const addedRules = [
  [/\btest(\.describe)?\.(skip|fixme|fail|only)\(/, 'skip/fixme/fail/only added'],
  [/force:\s*true/, 'force option added'],
  [/\.or\(/, '.or() fallback added (can hide the real behavior)'],
  [/timeout:\s*\d/, 'custom timeout added'],
  [/waitForTimeout|networkidle/, 'hard wait added'],
  [/toContainText\(/, 'partial text match added (check the spec does not require exact text)'],
];

for (const raw of diff.split('\n')) {
  if (raw.startsWith('diff --git')) {
    flush();
    file = raw.split(' b/')[1] ?? '';
    continue;
  }
  if (raw.startsWith('@@')) {
    flush();
    continue;
  }
  if (raw.startsWith('---') || raw.startsWith('+++')) continue;
  const line = raw.slice(1).trim();
  if (raw.startsWith('-') && /\bexpect(\.poll|\.soft)?\(/.test(line)) removedExpects.push(line);
  if (raw.startsWith('+')) {
    // an identical assertion re-added in the same hunk (e.g. moved) cancels a removal
    const same = removedExpects.indexOf(line);
    if (same >= 0) removedExpects.splice(same, 1);
    for (const [re, kind] of addedRules) if (re.test(line)) findings.push({ file, kind, line });
  }
}
flush();

const approved = process.env.QC_APPROVED === '1';
summary(
  [
    '### Test change guard',
    findings.length
      ? ['| File | Finding | Line |', '|---|---|---|', ...findings.map((f) => `| ${f.file} | ${f.kind} | \`${f.line.replace(/\|/g, '\\|')}\` |`)].join('\n')
      : 'No weakening changes found.',
    findings.length && !approved ? '\n**Needs QC lead approval (label `qc-approved`) after checking each finding against the spec.**' : '',
    findings.length && approved ? '\nApproved by QC lead (QC_APPROVED=1).' : '',
  ].join('\n'),
);
process.exit(findings.length && !approved ? 1 : 0);
