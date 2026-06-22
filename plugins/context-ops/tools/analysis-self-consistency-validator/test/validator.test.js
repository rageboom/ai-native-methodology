// analysis-self-consistency-validator — node:test 단위 + CLI 통합 (v0.66.0)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  validateSelfConsistency,
  applyFix,
  detectKind,
  groupByCount,
  comparePartition,
} from '../src/validator.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CLI = join(__dirname, '..', 'src', 'cli.js');

// ── fixture 헬퍼 ──
function typeSpec({ total, perKind, types, domainLinked, crossLinks, fwCoupled, scopeInternal }) {
  return {
    summary: {
      total_types: total,
      per_kind: perKind,
      domain_linked_count: domainLinked,
      framework_coupled_count: fwCoupled,
      scope_internal_type_count: scopeInternal,
    },
    types,
    cross_links: crossLinks,
  };
}
function mkTypes(spec) {
  // spec = {interface:N, type_alias:M, ...} → 평탄 배열
  const out = [];
  for (const [kind, n] of Object.entries(spec)) for (let i = 0; i < n; i++) out.push({ id: `T-${kind}-${i}`, kind, framework_coupling_score: 0 });
  return out;
}

// ── 1. valid (6th 교정본 형태: 53==53) → 0 finding ──
test('valid type-spec: summary 가 배열과 정합 → 0 finding', () => {
  const types = mkTypes({ interface: 41, type_alias: 7, union: 4, enum: 1 }); // 53
  const r = validateSelfConsistency(
    typeSpec({
      total: 53,
      perKind: { interface: 41, type_alias: 7, union: 4, enum: 1 },
      types,
      domainLinked: 2,
      crossLinks: [{ from_type: 'A' }, { from_type: 'B' }, { from_type: 'A' }], // uniq=2
      fwCoupled: 0,
      scopeInternal: 53,
    }),
  );
  assert.equal(r.kind, 'type-spec');
  assert.equal(r.findings.length, 0, JSON.stringify(r.findings));
});

// ── 2. invalid scalar (work-system 6th 원버그 재현: total 45 vs 배열 48) → high ──
test('6th 원버그 재현: total_types=45 vs types 48 → scalar_mismatch high', () => {
  const types = mkTypes({ interface: 40, type_alias: 6, union: 2 }); // 48
  const r = validateSelfConsistency(
    typeSpec({ total: 45, perKind: { interface: 40, type_alias: 6, union: 2 }, types, domainLinked: 0, crossLinks: [], fwCoupled: 0, scopeInternal: 45 }),
  );
  const f = r.findings.find((x) => x.path === 'summary.total_types');
  assert.ok(f, 'total_types mismatch 미검출');
  assert.equal(f.severity, 'high');
  assert.equal(f.declared, 45);
  assert.equal(f.actual, 48);
  // scope_internal_type_count(45)도 배열48과 불일치 → medium(warn)
  assert.ok(r.findings.some((x) => x.path === 'summary.scope_internal_type_count' && x.severity === 'medium'));
});

// ── 3. partition 빠진 키 (per_kind 에 union 누락, 배열엔 union 2) → mismatch ──
test('partition 빠진 키: per_kind 에 union 없음 → partition_mismatch', () => {
  const types = mkTypes({ interface: 40, type_alias: 6, union: 2 }); // 48
  const r = validateSelfConsistency(
    typeSpec({ total: 48, perKind: { interface: 40, type_alias: 6 }, types, domainLinked: 0, crossLinks: [], fwCoupled: 0, scopeInternal: 48 }),
  );
  const f = r.findings.find((x) => x.path === 'summary.per_kind.union');
  assert.ok(f, 'union 누락 미검출');
  assert.equal(f.declared, 0);
  assert.equal(f.actual, 2);
});

// ── 4. partition 값 불일치 ──
test('partition 값 불일치: per_kind.interface 10 vs 실제 12 → mismatch', () => {
  const types = mkTypes({ interface: 12, type_alias: 2 }); // 14
  const r = validateSelfConsistency(
    typeSpec({ total: 14, perKind: { interface: 10, type_alias: 2 }, types, domainLinked: 0, crossLinks: [], fwCoupled: 0, scopeInternal: 14 }),
  );
  const f = r.findings.find((x) => x.path === 'summary.per_kind.interface');
  assert.ok(f);
  assert.equal(f.declared, 10);
  assert.equal(f.actual, 12);
});

// ── 5. 잉여 키 (per_kind.enum=3 인데 배열엔 enum 0) → mismatch ──
test('잉여 키: per_kind.enum 3 vs 실제 0 → mismatch', () => {
  const types = mkTypes({ interface: 5 });
  const r = validateSelfConsistency(
    typeSpec({ total: 5, perKind: { interface: 5, enum: 3 }, types, domainLinked: 0, crossLinks: [], fwCoupled: 0, scopeInternal: 5 }),
  );
  const f = r.findings.find((x) => x.path === 'summary.per_kind.enum');
  assert.ok(f);
  assert.equal(f.declared, 3);
  assert.equal(f.actual, 0);
});

// ── 6. antipatterns 중첩 count (by_category[c].count drift) ──
test('antipatterns by_category 중첩 count drift → mismatch', () => {
  const obj = {
    summary: {
      total_count: 4,
      by_category: { ARCH: { count: 1 }, FE: { count: 3 } }, // FE 선언 3, 실제 2 = drift
      critical_count: 0,
    },
    antipatterns: [
      { id: 'AP-ARCH-001', category: 'ARCH', severity: 'high' },
      { id: 'AP-FE-001', category: 'FE', severity: 'medium' },
      { id: 'AP-FE-002', category: 'FE', severity: 'low' },
      { id: 'AP-MAINT-001', category: 'MAINTAINABILITY', severity: 'info' }, // total 4 맞음
    ],
  };
  const r = validateSelfConsistency(obj);
  // total_count(4)==배열(4) OK / by_category.FE 3 vs 2 mismatch / MAINTAINABILITY 누락(0 vs 1) mismatch
  assert.equal(r.kind, 'antipatterns');
  const fe = r.findings.find((x) => x.path === 'summary.by_category.FE');
  assert.ok(fe && fe.declared === 3 && fe.actual === 2, 'FE 중첩 count drift 미검출');
  const maint = r.findings.find((x) => x.path === 'summary.by_category.MAINTAINABILITY');
  assert.ok(maint && maint.actual === 1, 'MAINTAINABILITY 누락 미검출');
});

// ── 7. presence-gated N/A (count 필드 없는 산출물 = domain/state-map) → not applicable ──
test('count 필드 없는 산출물(domain류) → not applicable, 0 finding', () => {
  const r = validateSelfConsistency({ bounded_contexts: [{ id: 'BC-X' }], entities: [{ id: 'E-1' }] });
  assert.equal(r.applicable, false);
  assert.equal(r.kind, null);
  assert.equal(r.findings.length, 0);
});

// ── 8. derived metric 스코프 제외 (i18n missing_per_locale 틀려도 finding 0) ──
test('derived 제외: i18n missing_per_locale 오류여도 total_keys 정합이면 0 finding', () => {
  const obj = {
    summary: {
      total_keys: 2,
      total_translations: 4,
      missing_per_locale: { 'ko-KR': 99, 'en-US': 99 }, // 일부러 틀린 derived 값
    },
    resources: [
      { key: 'a', translations: [{ locale: 'ko-KR' }, { locale: 'en-US' }] },
      { key: 'b', translations: [{ locale: 'ko-KR' }, { locale: 'en-US' }] },
    ],
  };
  const r = validateSelfConsistency(obj);
  assert.equal(r.kind, 'i18n-spec');
  // total_keys(2)==resources(2) OK / total_translations(4)==sum(2+2) OK / missing_per_locale 는 미검사
  assert.equal(r.findings.length, 0, JSON.stringify(r.findings));
});

// ── 9. 명시적 0 회귀 (per_severity 전부 0 + findings 빈 배열 → orphan 오탐 0) ──
test('명시적 0 회귀: static-security per_severity 모두 0 + findings 빈 → 0 finding', () => {
  const obj = {
    summary: { total_findings: 0, per_severity: { critical: 0, high: 0, medium: 0, low: 0 }, per_category: {} },
    findings: [],
  };
  const r = validateSelfConsistency(obj);
  assert.equal(r.kind, 'static-security-spec');
  assert.equal(r.findings.length, 0, JSON.stringify(r.findings));
});

// ── 10. --fix round-trip (invalid → fix → 재검증 0) ──
test('--fix round-trip: 미스카운트 교정 후 0 finding', () => {
  const types = mkTypes({ interface: 40, type_alias: 6, union: 2 }); // 48
  const obj = typeSpec({ total: 45, perKind: { interface: 38, type_alias: 5 }, types, domainLinked: 9, crossLinks: [{ from_type: 'A' }, { from_type: 'B' }], fwCoupled: 0, scopeInternal: 45 });
  const before = validateSelfConsistency(obj);
  assert.ok(before.findings.length > 0);
  const { changed } = applyFix(obj);
  assert.ok(changed > 0);
  const after = validateSelfConsistency(obj);
  assert.equal(after.findings.length, 0, JSON.stringify(after.findings));
  assert.equal(obj.summary.total_types, 48);
  assert.equal(obj.summary.per_kind.union, 2);
  assert.equal(obj.summary.domain_linked_count, 2); // uniq from_type
});

// ── 11. 헬퍼 단위 ──
test('groupByCount: discriminator 미보유 item 은 undef 분리', () => {
  const { dist, undef, defined } = groupByCount([{ kind: 'a' }, { kind: 'a' }, { kind: 'b' }, {}], 'kind');
  assert.deepEqual(dist, { a: 2, b: 1 });
  assert.equal(undef, 1);
  assert.equal(defined, 3);
});
test('comparePartition: 0-default 키 합집합 비교', () => {
  const f = comparePartition({ a: 2, b: 0 }, { a: 1, c: 1 }, { path: 'p' });
  // a: 2vs1 mismatch / b: 0vs0 OK / c: 0vs1 mismatch
  assert.equal(f.length, 2);
  assert.ok(f.find((x) => x.path === 'p.a'));
  assert.ok(f.find((x) => x.path === 'p.c'));
});

// ── 12. CLI 통합: exit code / --dry-run / --json / dir scan ──
test('CLI: invalid 산출물 → exit 1', () => {
  const dir = mkdtempSync(join(tmpdir(), 'ascv-'));
  try {
    const types = mkTypes({ interface: 40, type_alias: 6, union: 2 });
    const f = join(dir, 'type-spec.json');
    writeFileSync(f, JSON.stringify(typeSpec({ total: 45, perKind: { interface: 40, type_alias: 6, union: 2 }, types, domainLinked: 0, crossLinks: [], fwCoupled: 0, scopeInternal: 48 })));
    let code = 0;
    try { execFileSync('node', [CLI, f], { encoding: 'utf8' }); } catch (e) { code = e.status; }
    assert.equal(code, 1);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('CLI: --dry-run 은 finding 있어도 exit 0', () => {
  const dir = mkdtempSync(join(tmpdir(), 'ascv-'));
  try {
    const types = mkTypes({ interface: 40, type_alias: 6, union: 2 });
    const f = join(dir, 'type-spec.json');
    writeFileSync(f, JSON.stringify(typeSpec({ total: 45, perKind: { interface: 40, type_alias: 6, union: 2 }, types, domainLinked: 0, crossLinks: [], fwCoupled: 0, scopeInternal: 48 })));
    const out = execFileSync('node', [CLI, f, '--dry-run', '--json'], { encoding: 'utf8' });
    const parsed = JSON.parse(out);
    assert.ok(parsed.summary.total_findings > 0);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('CLI: --fix 후 파일 재검증 0 + dir scan', () => {
  const dir = mkdtempSync(join(tmpdir(), 'ascv-'));
  try {
    const types = mkTypes({ interface: 40, type_alias: 6, union: 2 });
    const f = join(dir, 'type-spec.json');
    writeFileSync(f, JSON.stringify(typeSpec({ total: 45, perKind: { interface: 38, type_alias: 5 }, types, domainLinked: 0, crossLinks: [], fwCoupled: 0, scopeInternal: 48 }), null, 2) + '\n');
    execFileSync('node', [CLI, f, '--fix'], { encoding: 'utf8' });
    // dir scan 재검증 → exit 0
    const out = execFileSync('node', [CLI, dir, '--json'], { encoding: 'utf8' });
    const parsed = JSON.parse(out);
    assert.equal(parsed.summary.total_findings, 0, out);
    // indent 보존 확인 (2-space)
    assert.ok(readFileSync(f, 'utf8').includes('\n  "summary"'));
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('CLI: count 필드 없는 산출물만 있으면 exit 0', () => {
  const dir = mkdtempSync(join(tmpdir(), 'ascv-'));
  try {
    writeFileSync(join(dir, 'domain.json'), JSON.stringify({ bounded_contexts: [{ id: 'BC-X' }] }));
    const out = execFileSync('node', [CLI, dir, '--json'], { encoding: 'utf8' });
    assert.equal(JSON.parse(out).summary.total_findings, 0);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
