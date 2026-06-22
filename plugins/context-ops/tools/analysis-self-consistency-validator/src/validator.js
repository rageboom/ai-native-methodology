// analysis-self-consistency-validator core (v0.66.0)
// 입력: analysis 산출물 (type-spec / static-security-spec / antipatterns / a11y-spec /
//       form-validation-spec / i18n-spec / visual-manifest / business-rules).
// 목적: 산출물 자신의 summary/count 필드가 자기 backing 배열과 정합하는지 결정론 검사.
//       DEC-2026-06-13-append-catalog-rulecount-ssot 의 "count = 배열의 비정규화 캐시 /
//       배열 = SSOT / LLM 정수 불신" 원칙을 13 산출물로 일반화 (append-catalog.js 한 곳에만
//       있던 강제를 analysis-agent 직접 산출물로 확장).
// 스코프 한계(중요): **구조적 summary/count 필드만** 검사한다. prose/free-text(meta.warnings·
//       description 등)에 박힌 숫자는 NLP 영역 = groundedness skeptic 담당. 본 도구는 skeptic
//       대체가 아니라 그 앞단의 싼 선제 필터.
// 안전(false-positive 0 지향): summary 필드 + backing 배열이 둘 다 존재할 때만 검사. 배열 item 이
//       discriminator 필드를 전혀 안 가지면 해당 partition 은 N/A(skip). derived metric(missing_per_locale
//       등 의미 판정 필요)은 INVARIANTS 미등록.

import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

// ── 불변식 선언 (kind → 자기정합 규칙). 하드코딩 맵 — gate-eval.REQUIRED_VALIDATORS_PER_STAGE /
//    graph-synthesizer.CHAIN_TO_ANALYSIS_REFS 와 동일한 본 방법론 관용. schema 무수정.
//    detect: 파일명 아닌 산출물 shape 로 kind 식별 (analysis-extraction-validator.detectAdapterType 관용).
//    sev: 'fail'=high(exit 1) / 'warn'=medium(exit 0).
export const INVARIANTS = {
  'type-spec': {
    detect: (o) => Array.isArray(o?.types) && o?.summary && typeof o.summary === 'object',
    scalar: [
      { path: 'summary.total_types', array: 'types', sev: 'fail' },
      { path: 'summary.scope_internal_type_count', array: 'types', sev: 'warn' }, // 관례상 scope-internal 만 캡처
    ],
    partition: [{ path: 'summary.per_kind', array: 'types', by: 'kind', sev: 'fail' }],
    filtered: [
      { path: 'summary.framework_coupled_count', array: 'types', where: (t) => Number(t?.framework_coupling_score) > 0, sev: 'fail' },
    ],
    custom: [{ path: 'summary.domain_linked_count', reducer: 'uniqCrossLinkFromType', sev: 'fail' }],
  },
  'static-security-spec': {
    detect: (o) => Array.isArray(o?.findings) && o?.summary && o.summary.total_findings != null,
    scalar: [{ path: 'summary.total_findings', array: 'findings', sev: 'fail' }],
    partition: [
      { path: 'summary.per_severity', array: 'findings', by: 'severity', sev: 'fail' },
      { path: 'summary.per_category', array: 'findings', by: 'category', sev: 'fail' },
    ],
    filtered: [
      { path: 'summary.runtime_check_required_count', array: 'findings', where: (f) => f?.runtime_check_required === true, sev: 'warn' },
    ],
  },
  antipatterns: {
    detect: (o) => Array.isArray(o?.antipatterns) && o?.summary && typeof o.summary === 'object',
    scalar: [{ path: 'summary.total_count', array: 'antipatterns', sev: 'fail' }],
    partition: [{ path: 'summary.by_category', array: 'antipatterns', by: 'category', countAt: 'count', sev: 'fail' }],
    filtered: [{ path: 'summary.critical_count', array: 'antipatterns', where: (a) => a?.severity === 'critical', sev: 'fail' }],
  },
  'a11y-spec': {
    detect: (o) => Array.isArray(o?.violations) && o?.summary && o.summary.total_violations != null,
    scalar: [{ path: 'summary.total_violations', array: 'violations', sev: 'fail' }],
    partition: [
      { path: 'summary.per_impact', array: 'violations', by: 'impact', sev: 'fail' },
      { path: 'summary.per_wcag_level', array: 'violations', by: 'wcag_level', sev: 'fail' },
    ],
  },
  'form-validation-spec': {
    detect: (o) => Array.isArray(o?.validations) && o?.summary && o.summary.total_validations != null,
    scalar: [{ path: 'summary.total_validations', array: 'validations', sev: 'fail' }],
    partition: [
      { path: 'summary.per_library', array: 'validations', by: 'source_format', sev: 'fail' },
      { path: 'summary.per_validation_type', array: 'validations', by: 'validation_type', sev: 'fail' },
    ],
    filtered: [
      { path: 'summary.framework_coupled_count', array: 'validations', where: (v) => v?.framework_coupled === true, sev: 'fail' },
    ],
  },
  'i18n-spec': {
    detect: (o) => Array.isArray(o?.resources) && o?.summary && o.summary.total_keys != null,
    scalar: [{ path: 'summary.total_keys', array: 'resources', sev: 'fail' }],
    custom: [{ path: 'summary.total_translations', reducer: 'sumTranslations', sev: 'warn' }],
    // missing_per_locale / untranslated_per_locale = derived(의미 판정) → 미등록 (skeptic 담당)
  },
  'visual-manifest': {
    detect: (o) => Array.isArray(o?.snapshots) && o?.manifest_summary && typeof o.manifest_summary === 'object',
    scalar: [{ path: 'manifest_summary.total_snapshots', array: 'snapshots', sev: 'fail' }],
    // diff_status / captured_by breakdown: 비어있지 않은 인스턴스 부재로 enum 값 미검증 → carry(미등록).
  },
  'business-rules': {
    detect: (o) => Array.isArray(o?.business_rules),
    scalar: [
      { path: 'br_count', array: 'business_rules', sev: 'fail', optional: true },
      { path: 'summary.br_count', array: 'business_rules', sev: 'fail', optional: true },
    ],
    partition: [{ path: 'summary.by_category', array: 'business_rules', by: 'category', sev: 'fail' }],
  },
};

// ── path 유틸 ──
export function getPath(obj, path) {
  return path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);
}
function setPath(obj, path, value) {
  const keys = path.split('.');
  const last = keys.pop();
  const parent = keys.reduce((o, k) => (o[k] ??= {}), obj);
  parent[last] = value;
}

// ── group-by (discriminator 미보유 item 은 undef 로 분리 — false-positive 차단) ──
export function groupByCount(arr, byField) {
  const dist = {};
  let undef = 0;
  for (const item of arr) {
    const v = item == null ? undefined : item[byField];
    if (v === undefined || v === null) { undef++; continue; }
    const key = String(v);
    dist[key] = (dist[key] || 0) + 1;
  }
  return { dist, undef, defined: arr.length - undef };
}

// summary partition 객체에서 키별 선언값 추출 (countAt = 중첩 {count} 경로).
function declaredFor(summaryObj, key, countAt) {
  const v = summaryObj?.[key];
  if (countAt) return v && typeof v === 'object' ? v[countAt] : undefined;
  return v;
}

// 키 합집합 + 0-default 비교 — 명시적 0(per_severity {critical:0})은 0==0 으로 통과(orphan 오탐 차단).
export function comparePartition(summaryObj, dist, { countAt, path, sev } = {}) {
  const findings = [];
  const keys = new Set([...Object.keys(summaryObj || {}), ...Object.keys(dist || {})]);
  for (const k of keys) {
    const actual = dist[k] || 0; // 배열 = SSOT
    const declaredRaw = declaredFor(summaryObj, k, countAt);
    const declared = declaredRaw == null ? 0 : declaredRaw;
    if (declared !== actual) {
      findings.push({
        kind: 'count.partition_mismatch',
        severity: sev === 'warn' ? 'medium' : 'high',
        path: `${path}.${k}`,
        declared,
        actual,
        message: `${path}[${k}] 선언값 ${declared} ≠ 실제 배열 분포 ${actual} (배열=SSOT). count 는 배열의 비정규화 캐시 — 재집계 필요.`,
      });
    }
  }
  return findings;
}

const REDUCERS = {
  uniqCrossLinkFromType: (o) => new Set((o.cross_links || []).map((c) => c?.from_type).filter((x) => x != null)).size,
  sumTranslations: (o) => (o.resources || []).reduce((s, r) => s + (Array.isArray(r?.translations) ? r.translations.length : 0), 0),
};

// ── kind 식별 (shape 기반) ──
export function detectKind(obj) {
  if (!obj || typeof obj !== 'object') return null;
  for (const [kind, spec] of Object.entries(INVARIANTS)) {
    if (spec.detect(obj)) return kind;
  }
  return null;
}

// ── 단일 산출물 검사 ──
export function validateSelfConsistency(obj) {
  const kind = detectKind(obj);
  if (!kind) return { kind: null, applicable: false, findings: [], summary: summarize([]) };
  const spec = INVARIANTS[kind];
  const findings = [];

  // scalar: total 류 == 배열 length
  for (const s of spec.scalar || []) {
    const declared = getPath(obj, s.path);
    if (declared == null) { if (!s.optional) {/* 필드 부재 = schema-validator 소관 */} continue; }
    const arr = obj[s.array];
    if (!Array.isArray(arr)) continue;
    if (declared !== arr.length) {
      findings.push({
        kind: 'count.scalar_mismatch',
        severity: s.sev === 'warn' ? 'medium' : 'high',
        path: s.path,
        declared,
        actual: arr.length,
        message: `${s.path} 선언값 ${declared} ≠ ${s.array}[] 배열 length ${arr.length} (배열=SSOT). count 는 비정규화 캐시 — 재집계 필요.`,
      });
    }
  }

  // partition: group-by 양방향
  for (const p of spec.partition || []) {
    const summaryObj = getPath(obj, p.path);
    const arr = obj[p.array];
    if (summaryObj == null || typeof summaryObj !== 'object' || !Array.isArray(arr)) continue;
    const { dist, defined } = groupByCount(arr, p.by);
    if (arr.length > 0 && defined === 0) continue; // 모든 item 이 discriminator 미보유 = N/A (schema-validator 소관)
    findings.push(...comparePartition(summaryObj, dist, { countAt: p.countAt, path: p.path, sev: p.sev }));
  }

  // filtered scalar: count(arr where predicate)
  for (const f of spec.filtered || []) {
    const declared = getPath(obj, f.path);
    if (declared == null) continue;
    const arr = obj[f.array];
    if (!Array.isArray(arr)) continue;
    const actual = arr.filter(f.where).length;
    if (declared !== actual) {
      findings.push({
        kind: 'count.filtered_mismatch',
        severity: f.sev === 'warn' ? 'medium' : 'high',
        path: f.path,
        declared,
        actual,
        message: `${f.path} 선언값 ${declared} ≠ ${f.array}[] 조건부 count ${actual} (배열=SSOT).`,
      });
    }
  }

  // custom reducer
  for (const c of spec.custom || []) {
    const declared = getPath(obj, c.path);
    if (declared == null) continue;
    const reducer = REDUCERS[c.reducer];
    if (!reducer) continue;
    const actual = reducer(obj);
    if (declared !== actual) {
      findings.push({
        kind: 'count.derived_mismatch',
        severity: c.sev === 'warn' ? 'medium' : 'high',
        path: c.path,
        declared,
        actual,
        message: `${c.path} 선언값 ${declared} ≠ 파생계산값 ${actual} (${c.reducer}). 배열=SSOT.`,
      });
    }
  }

  return { kind, applicable: true, findings, summary: summarize(findings) };
}

// ── --fix: 배열=SSOT 가정 하 count 재계산 (in-place). scalar/partition-값/filtered/custom 만.
//    배열 자체 누락은 못 고침(skeptic 담당) — 호출부가 stdout 경고 출력.
export function applyFix(obj) {
  const kind = detectKind(obj);
  if (!kind) return { kind: null, changed: 0 };
  const spec = INVARIANTS[kind];
  let changed = 0;

  for (const s of spec.scalar || []) {
    if (getPath(obj, s.path) == null) continue;
    const arr = obj[s.array];
    if (!Array.isArray(arr)) continue;
    if (getPath(obj, s.path) !== arr.length) { setPath(obj, s.path, arr.length); changed++; }
  }
  for (const p of spec.partition || []) {
    const summaryObj = getPath(obj, p.path);
    const arr = obj[p.array];
    if (summaryObj == null || typeof summaryObj !== 'object' || !Array.isArray(arr)) continue;
    const { dist, defined } = groupByCount(arr, p.by);
    if (arr.length > 0 && defined === 0) continue;
    const keys = new Set([...Object.keys(summaryObj), ...Object.keys(dist)]);
    for (const k of keys) {
      const actual = dist[k] || 0;
      if (p.countAt) {
        if (summaryObj[k] && typeof summaryObj[k] === 'object') {
          if (summaryObj[k][p.countAt] !== actual) { summaryObj[k][p.countAt] = actual; changed++; }
        } // 키 신설(중첩 객체)은 위험 → carry (값만 교정)
      } else if ((summaryObj[k] ?? 0) !== actual) {
        summaryObj[k] = actual;
        changed++;
      }
    }
  }
  for (const f of spec.filtered || []) {
    if (getPath(obj, f.path) == null) continue;
    const arr = obj[f.array];
    if (!Array.isArray(arr)) continue;
    const actual = arr.filter(f.where).length;
    if (getPath(obj, f.path) !== actual) { setPath(obj, f.path, actual); changed++; }
  }
  for (const c of spec.custom || []) {
    if (getPath(obj, c.path) == null) continue;
    const reducer = REDUCERS[c.reducer];
    if (!reducer) continue;
    const actual = reducer(obj);
    if (getPath(obj, c.path) !== actual) { setPath(obj, c.path, actual); changed++; }
  }
  return { kind, changed };
}

export function summarize(findings) {
  return {
    total_findings: findings.length,
    high: findings.filter((f) => f.severity === 'high').length,
    medium: findings.filter((f) => f.severity === 'medium').length,
  };
}

export function loadJson(path) {
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, 'utf-8'));
  } catch (e) {
    throw new Error(`JSON parse error at ${path}: ${e.message}`);
  }
}

// dir 재귀 — analysis 산출물 .json 수집 (findings-*.json = aggregator 자기출력 제외).
export function listAnalysisJson(dir) {
  const out = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...listAnalysisJson(p));
    else if (e.name.endsWith('.json') && !e.name.startsWith('findings-')) out.push(p);
  }
  return out;
}
