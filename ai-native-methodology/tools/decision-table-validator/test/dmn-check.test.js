import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { checkDecisionTable } from '../src/dmn-check.js';
import { checkJsonSanity } from '../src/json-sanity.js';
import { parseMarkdownTables } from '../src/parse-md-table.js';

test('parser extracts simple bool decision table', () => {
  const md = `
| 입력: A | 입력: B | 결과 |
|:---:|:---:|---|
| Y | Y | a-and-b |
| Y | N | a-only |
| N | * | nothing |
`;
  const tables = parseMarkdownTables(md);
  assert.equal(tables.length, 1);
  assert.equal(tables[0].rows.length, 3);
});

test('dmn-check detects gap (missing combination)', () => {
  const md = `
| 입력: A | 입력: B | 결과 |
|:---:|:---:|---|
| Y | Y | both |
| N | N | none |
`;
  const t = parseMarkdownTables(md)[0];
  const f = checkDecisionTable(t);
  assert.ok(f.some((x) => x.kind === 'rule.gap'), `expected gap finding, got: ${JSON.stringify(f)}`);
});

test('dmn-check detects conflict (same input, different output)', () => {
  const md = `
| 입력: A | 결과 |
|:---:|---|
| Y | first |
| Y | second |
`;
  const t = parseMarkdownTables(md)[0];
  const f = checkDecisionTable(t);
  assert.ok(f.some((x) => x.kind === 'rule.conflict'), `expected conflict finding, got: ${JSON.stringify(f)}`);
});

test('dmn-check detects duplicate (same input, same output)', () => {
  const md = `
| 입력: A | 결과 |
|:---:|---|
| Y | go |
| Y | go |
`;
  const t = parseMarkdownTables(md)[0];
  const f = checkDecisionTable(t);
  assert.ok(f.some((x) => x.kind === 'rule.duplicate'), `expected duplicate finding, got: ${JSON.stringify(f)}`);
});

test('dmn-check detects overlap (wildcard ambiguous with specific)', () => {
  const md = `
| 입력: A | 결과 |
|:---:|---|
| * | first |
| Y | second |
`;
  const t = parseMarkdownTables(md)[0];
  const f = checkDecisionTable(t);
  assert.ok(f.some((x) => x.kind === 'rule.overlap'), `expected overlap finding, got: ${JSON.stringify(f)}`);
});

test('dmn-check accepts complete table — only allowed findings', () => {
  const md = `
| 입력: A | 입력: B | 결과 |
|:---:|:---:|---|
| Y | Y | both |
| Y | N | a |
| N | Y | b |
| N | N | none |
`;
  const t = parseMarkdownTables(md)[0];
  const f = checkDecisionTable(t);
  assert.ok(!f.some((x) => x.severity === 'breaking'), `should have no breaking, got: ${JSON.stringify(f)}`);
});

test('json sanity flags missing required fields', () => {
  const f = checkJsonSanity({ br_id: 'BR-X', condition: 'foo' });
  assert.ok(f.some((x) => x.field === 'trigger'), 'missing trigger detected');
  assert.ok(f.some((x) => x.field === 'http_status'), 'missing http_status detected');
});
