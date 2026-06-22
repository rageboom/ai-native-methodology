// unit-spec-oracle-validator — node:test 단위 + CLI 통합 (v0.69.0 / DEC-2026-06-22-unit-spec-oracle-symmetry)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  validateUnitOracle,
  oracleCount,
  snapshotIdSet,
  summarize,
  ORACLE_MISSING_SEVERITY,
} from '../src/validator.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CLI = join(__dirname, '..', 'src', 'cli.js');

// ── fixture 헬퍼 ──
function unit(over = {}) {
  return {
    id: over.id ?? 'UNIT-X-001',
    provenance: over.provenance ?? 'designed_from_spec',
    kind: 'function',
    code_pointer: { path: 'x.js', anchor_type: 'ast_symbol', symbol: 'x' },
    unit_test_obligation: over.unit_test_obligation ?? 'required',
    ...over,
  };
}
function spec(units) {
  return { meta: {}, derivation_source: { domain_path: 'd.json' }, units };
}

// ── 1~3. oracle 3채널 각각 ≥1 → 0 finding ──
test('required + invariant_refs≥1 → 0 finding', () => {
  const r = validateUnitOracle(spec([unit({ invariant_refs: ['INV-A-001'] })]));
  assert.equal(r.applicable, true);
  assert.equal(r.findings.length, 0);
});
test('required + property_test_refs≥1 → 0 finding', () => {
  const r = validateUnitOracle(spec([unit({ property_test_refs: ['PT-A-001'] })]));
  assert.equal(r.findings.length, 0);
});
test('required + characterization_snapshot_refs≥1 → 0 finding', () => {
  const r = validateUnitOracle(spec([unit({ characterization_snapshot_refs: ['SNAP-A-001'] })]));
  assert.equal(r.findings.length, 0);
});

// ── 4. required + oracle 0 + oracle_waiver → 0 finding (정직 면제) ──
test('required + oracle 0 + oracle_waiver → 0 finding', () => {
  const r = validateUnitOracle(spec([unit({ oracle_waiver: 'trivial 포맷터 / 불변식 불요' })]));
  assert.equal(r.findings.length, 0);
});

// ── 5. required + oracle 0 + waiver 부재 → 1 medium (unit.oracle.missing) ──
test('required + oracle 0 + waiver 부재 → 1 medium finding', () => {
  const r = validateUnitOracle(spec([unit({ id: 'UNIT-BARE-001' })]));
  assert.equal(r.findings.length, 1);
  const f = r.findings[0];
  assert.equal(f.kind, 'unit.oracle.missing');
  assert.equal(f.severity, 'medium');
  assert.equal(f.unit_id, 'UNIT-BARE-001');
});

// ── 6. 빈 문자열 oracle_waiver 는 면제로 인정 ❌ (trim 0) → finding ──
test('빈/공백 oracle_waiver 는 면제 아님 → finding', () => {
  const r = validateUnitOracle(spec([unit({ oracle_waiver: '   ' })]));
  assert.equal(r.findings.length, 1);
  assert.equal(r.findings[0].kind, 'unit.oracle.missing');
});

// ── 7. waived → 대상 아님 (oracle 0 이어도 finding 없음) ──
test('waived UNIT → 검사 대상 아님', () => {
  const r = validateUnitOracle(spec([unit({ unit_test_obligation: 'waived', waiver_reason: 'data holder' })]));
  assert.equal(r.findings.length, 0);
});

// ── 8. characterization_only → 대상 아님 (보수 / 승인 범위=required) ──
test('characterization_only UNIT → 검사 대상 아님 (carry)', () => {
  const r = validateUnitOracle(spec([unit({ unit_test_obligation: 'characterization_only' })]));
  assert.equal(r.findings.length, 0);
});

// ── 9. soft 불변: 모든 finding severity=medium (high 0) ──
test('soft 불변 — 모든 finding medium / high 0', () => {
  const r = validateUnitOracle(spec([unit({ id: 'UNIT-A-001' }), unit({ id: 'UNIT-B-001' })]));
  assert.equal(r.summary.high, 0);
  assert.equal(r.summary.medium, 2);
  assert.ok(r.findings.every((f) => f.severity === 'medium'));
  assert.equal(ORACLE_MISSING_SEVERITY, 'medium'); // frontier 상수 = soft
});

// ── 10. dangling snapshot ref (charObj 주어짐 / ref 부재) → medium ──
test('dangling characterization_snapshot_ref → medium', () => {
  const char = { snapshots: [{ snapshot_id: 'SNAP-REAL-001' }] };
  const r = validateUnitOracle(
    spec([unit({ characterization_snapshot_refs: ['SNAP-GHOST-999'] })]),
    char,
  );
  const f = r.findings.find((x) => x.kind === 'unit.oracle.dangling_snapshot_ref');
  assert.ok(f);
  assert.equal(f.severity, 'medium');
});

// ── 11. valid snapshot ref (charObj / ref 존재) → 0 ──
test('valid snapshot ref → 0 finding', () => {
  const char = { snapshots: [{ snapshot_id: 'SNAP-REAL-001' }] };
  const r = validateUnitOracle(spec([unit({ characterization_snapshot_refs: ['SNAP-REAL-001'] })]), char);
  assert.equal(r.findings.length, 0);
});

// ── 12. charObj 없으면 dead-ref 검증 skip (snapshot_refs≥1 로 oracle pass) ──
test('charObj 없으면 dead-ref 검증 skip', () => {
  const r = validateUnitOracle(spec([unit({ characterization_snapshot_refs: ['SNAP-X-001'] })]), null);
  assert.equal(r.findings.length, 0);
  assert.equal(snapshotIdSet(null), null);
});

// ── 13. units[] 부재 → applicable false ──
test('units[] 부재 → applicable false', () => {
  const r = validateUnitOracle({ meta: {} });
  assert.equal(r.applicable, false);
  assert.equal(r.findings.length, 0);
});

// ── 14. 다중 unit 혼합 카운트 ──
test('혼합 — pass 2 / waiver 1 / missing 2 → 2 finding', () => {
  const r = validateUnitOracle(
    spec([
      unit({ id: 'U1', invariant_refs: ['INV-1'] }), // pass
      unit({ id: 'U2', property_test_refs: ['PT-1'] }), // pass
      unit({ id: 'U3', oracle_waiver: '사유' }), // waiver pass
      unit({ id: 'U4' }), // missing
      unit({ id: 'U5', unit_test_obligation: 'waived', waiver_reason: 'r' }), // skip
      unit({ id: 'U6' }), // missing
    ]),
  );
  assert.equal(r.findings.length, 2);
  assert.deepEqual(r.findings.map((f) => f.unit_id).sort(), ['U4', 'U6']);
});

// ── 15. oracleCount / summarize 단위 ──
test('oracleCount union 합산', () => {
  assert.equal(oracleCount({ invariant_refs: ['a'], property_test_refs: ['b', 'c'], characterization_snapshot_refs: ['d'] }), 4);
  assert.equal(oracleCount({}), 0);
  assert.equal(oracleCount({ invariant_refs: 'not-array' }), 0);
});
test('summarize high/medium 카운트', () => {
  const s = summarize([{ severity: 'medium' }, { severity: 'medium' }, { severity: 'high' }]);
  assert.deepEqual(s, { total_findings: 3, high: 1, medium: 2 });
});

// ── 16~18. CLI 통합 ──
test('CLI: 파일 부재 → exit 0 + applicable false (N/A)', () => {
  const out = execFileSync('node', [CLI, '/no/such/unit-spec.json', '--json'], { encoding: 'utf-8' });
  const j = JSON.parse(out);
  assert.equal(j.applicable, false);
  assert.equal(j.summary.total_findings, 0);
});

test('CLI: baseline (required oracle 0) → medium, exit 0 (soft)', () => {
  const dir = mkdtempSync(join(tmpdir(), 'uso-'));
  try {
    const p = join(dir, 'unit-spec.json');
    writeFileSync(p, JSON.stringify(spec([unit({ id: 'UNIT-BARE-001' })])));
    // soft → exit 0 (medium 만)
    const out = execFileSync('node', [CLI, p, '--json'], { encoding: 'utf-8' });
    const j = JSON.parse(out);
    assert.equal(j.summary.medium, 1);
    assert.equal(j.summary.high, 0);
    assert.equal(j.findings[0].kind, 'unit.oracle.missing');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('CLI: --json 출력은 파싱 가능 + findings 배열', () => {
  const dir = mkdtempSync(join(tmpdir(), 'uso-'));
  try {
    const p = join(dir, 'unit-spec.json');
    writeFileSync(p, JSON.stringify(spec([unit({ invariant_refs: ['INV-1'] })])));
    const out = execFileSync('node', [CLI, p, '--json'], { encoding: 'utf-8' });
    const j = JSON.parse(out);
    assert.equal(j.applicable, true);
    assert.ok(Array.isArray(j.findings));
    assert.equal(j.findings.length, 0);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
