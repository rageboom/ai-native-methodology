import { test } from 'node:test';
import assert from 'node:assert/strict';
import { emitYaml, _internals } from '../src/yaml-emit.js';

const { isPlainSafe, quoteString } = _internals;

test('scalar object — flat keys', () => {
  const out = emitYaml({ openapi: '3.0.3', a: 1, b: true, c: null });
  assert.equal(out, 'openapi: 3.0.3\na: 1\nb: true\nc: null\n');
});

test('nested object indents 2 spaces', () => {
  const out = emitYaml({ info: { title: 'X', version: '1.0.0' } });
  assert.equal(out, 'info:\n  title: X\n  version: 1.0.0\n');
});

test('array of scalars', () => {
  const out = emitYaml({ tags: ['a', 'b'] });
  assert.equal(out, 'tags:\n  - a\n  - b\n');
});

test('array of objects — first key inline with dash', () => {
  const out = emitYaml({ servers: [{ url: 'http://x', description: 'prod' }] });
  assert.equal(out, 'servers:\n  - url: http://x\n    description: prod\n');
});

test('empty object and empty array use flow notation', () => {
  assert.equal(emitYaml({ paths: {}, tags: [] }), 'paths: {}\ntags: []\n');
});

test('strings that look like numbers/bools get quoted', () => {
  // 응답 코드 키 "200" 은 키 / 값으로 "3.0" 같은 값.
  const out = emitYaml({ v: '3.0', flag: 'true', n: '007' });
  assert.equal(out, 'v: "3.0"\nflag: "true"\nn: "007"\n');
});

test('strings with yaml indicators get quoted', () => {
  assert.equal(quoteString('a: b'), '"a: b"');
  assert.equal(quoteString('#hash'), '"#hash"');
  assert.equal(quoteString('- dash'), '"- dash"');
  assert.equal(quoteString('plain_safe.value/x'), 'plain_safe.value/x');
});

test('isPlainSafe rules', () => {
  assert.equal(isPlainSafe('User'), true);
  assert.equal(isPlainSafe('#/components/schemas/User'), false); // contains # and /
  assert.equal(isPlainSafe(''), false);
  assert.equal(isPlainSafe('123'), false);
  assert.equal(isPlainSafe('null'), false);
});

test('$ref pointer string is quoted (contains # and slash)', () => {
  const out = emitYaml({ schema: { $ref: '#/components/schemas/User' } });
  assert.equal(out, 'schema:\n  $ref: "#/components/schemas/User"\n');
});

test('multiline/control chars escaped in double quotes', () => {
  assert.equal(quoteString('line1\nline2'), '"line1\\nline2"');
  assert.equal(quoteString('tab\there'), '"tab\\there"');
});

test('response-code map keys preserved and quoted when numeric-looking', () => {
  const out = emitYaml({ responses: { '200': { description: 'OK' } } });
  assert.equal(out, 'responses:\n  "200":\n    description: OK\n');
});
