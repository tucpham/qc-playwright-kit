#!/usr/bin/env node
// Convert test cases exported from Excel/Google Sheets/Jira (CSV, UTF-8) into specs/<slug>.md.
// Usage: npm run tc:import -- testcases.csv tasks [--feature TASK]
// Recognized columns (case-insensitive, VN/EN): ID, Title, Priority, Role, Preconditions, Steps,
// Expected, Status, Tags. Unknown columns are ignored. Result is a starting point: review it, or
// clean it up with ai/prompts/05-import-testcases.md.
import fs from 'node:fs';
import path from 'node:path';
import { arg } from './lib.mjs';

const [csvFile, slug] = process.argv.slice(2).filter((a) => !a.startsWith('--'));
if (!csvFile || !slug) {
  console.error('Usage: npm run tc:import -- <file.csv> <feature-slug> [--feature CODE]');
  process.exit(1);
}
const feature = String(arg('feature', slug)).toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10);

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let quoted = false;
  text = text.replace(/^﻿/, '');
  const sep = (text.split('\n')[0].match(/;/g)?.length ?? 0) > (text.split('\n')[0].match(/,/g)?.length ?? 0) ? ';' : ',';
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (c === '"') quoted = false;
      else cell += c;
    } else if (c === '"') quoted = true;
    else if (c === sep) { row.push(cell); cell = ''; }
    else if (c === '\n') { row.push(cell.replace(/\r$/, '')); rows.push(row); row = []; cell = ''; }
    else cell += c;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows.filter((r) => r.some((x) => x.trim()));
}

const aliases = {
  id: ['id', 'tc id', 'test case id', 'mã', 'mã tc', 'ma tc'],
  title: ['title', 'name', 'summary', 'test case', 'tên', 'tiêu đề', 'mô tả'],
  priority: ['priority', 'độ ưu tiên', 'ưu tiên'],
  role: ['role', 'vai trò', 'user role'],
  pre: ['preconditions', 'precondition', 'pre-condition', 'điều kiện', 'điều kiện tiên quyết'],
  steps: ['steps', 'test steps', 'các bước', 'bước thực hiện'],
  expected: ['expected', 'expected result', 'kết quả mong đợi', 'kết quả mong muốn'],
  status: ['status', 'trạng thái'],
  tags: ['tags', 'tag', 'labels'],
};

const [header, ...data] = parseCsv(fs.readFileSync(csvFile, 'utf8'));
const col = {};
header.forEach((h, i) => {
  const key = Object.entries(aliases).find(([, names]) => names.includes(h.trim().toLowerCase()))?.[0];
  if (key && col[key] === undefined) col[key] = i;
});
if (col.title === undefined || col.steps === undefined || col.expected === undefined) {
  console.error(`Need at least Title, Steps, Expected columns. Found headers: ${header.join(' | ')}`);
  process.exit(1);
}

const get = (r, k) => (col[k] === undefined ? '' : (r[col[k]] ?? '').trim());
const lines = (s) => s.split(/\r?\n/).map((x) => x.replace(/^\s*(\d+[.)]|[-*•])\s*/, '').trim()).filter(Boolean);
const priority = (p) => (/1|high|cao|critical/i.test(p) ? 'P1' : /3|low|thấp/i.test(p) ? 'P3' : 'P2');

const out = [`# ${slug}`, '', `Owner: <fill in>`, `Requirement: <fill in>`, `Imported from: ${path.basename(csvFile)} on ${new Date().toISOString().slice(0, 10)}`, ''];
data.forEach((r, i) => {
  const id = `TC-${feature}-${String(i + 1).padStart(3, '0')}`;
  const p = priority(get(r, 'priority'));
  const tags = new Set(['@regression', ...(get(r, 'tags').match(/@\w+/g) ?? [])]);
  const status = /approv|duyệt|ready/i.test(get(r, 'status')) ? 'approved' : 'draft';
  const expected = lines(get(r, 'expected'));
  const vague = expected.some((e) => /correct|properly|normally|đúng|bình thường|thành công$/i.test(e));
  out.push(
    `## ${id} ${get(r, 'title') || '<no title>'}`,
    '',
    `- Status: ${vague ? 'draft' : status}`,
    `- Priority: ${p}`,
    `- Tags: ${[...tags].join(' ')}`,
    `- Role: ${get(r, 'role') || '<fill in>'}`,
    ...(get(r, 'pre') ? ['- Preconditions:', ...lines(get(r, 'pre')).map((x) => `  - ${x}`)] : []),
    '- Steps:',
    ...lines(get(r, 'steps')).map((x, n) => `  ${n + 1}. ${x}`),
    '- Expected:',
    ...expected.map((x) => `  - ${x}`),
    ...(vague ? ['  - [NEEDS CONFIRMATION - expected result not specific]'] : []),
    ...(get(r, 'id') ? [`- Notes: legacy ID ${get(r, 'id')}`] : []),
    '',
  );
});

const target = path.join('specs', `${slug}.md`);
if (fs.existsSync(target)) {
  console.error(`${target} already exists. Choose another slug or merge manually.`);
  process.exit(1);
}
fs.writeFileSync(target, out.join('\n'));
console.log(`Wrote ${data.length} test case(s) to ${target}. Review statuses before generating tests.`);
