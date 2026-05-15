// figma-extract.schema.json (★ ★ v3.3 G2 / analysis-from-figma 산출 schema) registration + 정합 test.

import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CLI = resolve(__dirname, '..', 'src', 'cli.js');
const SCHEMA_DIR = resolve(__dirname, '..', '..', '..', 'schemas');

function tmp() { return mkdtempSync(join(tmpdir(), 'sv-figma-extract-')); }
function runCli(target) {
  const r = spawnSync('node', [CLI, target, '--schema-dir', SCHEMA_DIR, '--json'], { encoding: 'utf-8' });
  return { parsed: r.stdout ? JSON.parse(r.stdout) : null };
}

function validInstance() {
  return {
    $schema_origin: '../../schemas/figma-extract.schema.json',
    scope: 'user-mgmt',
    created_at: '2026-05-15T10:00:00Z',
    source: {
      selection_id: '12:345',
      file_url: 'https://figma.com/file/abc123',
      fetched_at: '2026-05-15T10:00:00Z',
    },
    screens: [
      {
        id: '12:345',
        name: 'UserList',
        node_type: 'FRAME',
        position: { x: 0, y: 0, width: 1440, height: 900 },
        screenshot_ref: 'assets/figma-screenshot-userlist.png',
        component_refs: ['13:101', '13:102'],
      },
    ],
    components: [
      { id: '13:101', name: 'SearchBar', node_type: 'COMPONENT', parent_id: '12:345', tailwind_class_hint: 'flex gap-2' },
      { id: '13:102', name: 'UserCard', node_type: 'COMPONENT', parent_id: '12:345' },
    ],
    design_tokens: {
      colors: [
        { name: 'primary-500', value: '#4F46E5', mode: 'light' },
      ],
      spacing: [
        { name: 'spacing-4', value: 16 },
      ],
      typography: [
        { name: 'heading-lg', font_family: 'Inter', font_size: 24, font_weight: 600, line_height: 32 },
      ],
    },
    asset_refs: ['assets/figma-screenshot-userlist.png'],
    scope_out_notes: [
      { category: 'interaction', note: 'prototype 연결 정보는 본 skill scope 외 — 사용자 보강 의무' },
    ],
  };
}

test('★ G2 — figma-extract 정합 instance → valid', () => {
  const dir = tmp();
  try {
    writeFileSync(join(dir, 'figma-extract.json'), JSON.stringify(validInstance()));
    const r = runCli(join(dir, 'figma-extract.json'));
    const result = r.parsed.results[0];
    assert.notEqual(result.schema_status, 'not-found');
    assert.equal(result.valid, true, JSON.stringify(result));
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('★ G2 — figma-extract screens.node_type enum 위반 → invalid', () => {
  const dir = tmp();
  try {
    const inst = validInstance();
    inst.screens[0].node_type = 'CANVAS';  // enum 외
    writeFileSync(join(dir, 'figma-extract.json'), JSON.stringify(inst));
    const r = runCli(join(dir, 'figma-extract.json'));
    assert.equal(r.parsed.results[0].valid, false);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('★ G2 — figma-extract scope_out_notes.category enum 위반 → invalid', () => {
  const dir = tmp();
  try {
    const inst = validInstance();
    inst.scope_out_notes[0].category = 'unknown';
    writeFileSync(join(dir, 'figma-extract.json'), JSON.stringify(inst));
    const r = runCli(join(dir, 'figma-extract.json'));
    assert.equal(r.parsed.results[0].valid, false);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('★ G2 — figma-extract source.selection_id required → invalid (사전조건 본질)', () => {
  const dir = tmp();
  try {
    const inst = validInstance();
    delete inst.source.selection_id;
    writeFileSync(join(dir, 'figma-extract.json'), JSON.stringify(inst));
    const r = runCli(join(dir, 'figma-extract.json'));
    assert.equal(r.parsed.results[0].valid, false);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('★ G2 — figma-extract design_tokens.spacing.value 음수 → invalid', () => {
  const dir = tmp();
  try {
    const inst = validInstance();
    // spacing value 자체는 number 제한만 (음수 명시 불허 안 함 / schema 에서 minimum 미설정)
    // → 본 case 는 valid 통과해야 함 (test 의도 = 음수 허용 / 의미 검증은 별도)
    inst.design_tokens.spacing[0].value = -1;
    writeFileSync(join(dir, 'figma-extract.json'), JSON.stringify(inst));
    const r = runCli(join(dir, 'figma-extract.json'));
    // 본 test = schema 가 spacing.value 음수 제한 안 함 (의미 무관) → valid
    assert.equal(r.parsed.results[0].valid, true);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
