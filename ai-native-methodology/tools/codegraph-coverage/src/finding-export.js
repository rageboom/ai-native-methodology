// finding-export.js — ★ codegraph wiring STEP 2 (DEC-2026-06-03-codegraph-deliverable-wiring §5 STEP 2 / 순수 / I/O 없음).
//   "finding 채널 (codegraph→finding-list)" 의 정직한 minimal core (research 수렴 / Senior 0.80):
//     (1) coverage-hole(STEP 1 F-CGCOV) → finding-system shape **promote-ready 레코드** (discoverer:'codegraph' + code_graph_ref).
//     (2) handler-set reading-aid (implements/extends 전수 / ecommerce 1-도메인 정직표기 / error-mapping 보조).
//   ★ trust 경계 (불변): 출력 = reference-lens.
//     · decision (c) — 자동 seed(F-CGCOV+code_graph_ref)는 산출물에 두고, finding-system F-XXX ledger promote 는 **사람 수동**.
//       → 본 모듈은 finding_id 를 절대 부여하지 않음(사람이 promote 시 F-XXX 배정). seed_id(F-CGCOV-NNN)로만 추적.
//     · severity ceiling low|medium 만 (render.js SEVERITY_CEILING/pinSeverity 재사용 — 상위 차단등급 코드 강제 배제).
//     · 결정적 gate(gate-eval/findings-aggregator) inject ❌ — REQUIRED_VALIDATORS_PER_STAGE 미등록 + gate 모듈 import 0.
//   ★ cycle/orphan seed 는 STEP 2 범위 밖 (양 도메인 실측 false-positive 압도 / call provenance 미해소 → STEP 3+ carry).

import { SEVERITY_CEILING, pinSeverity } from './render.js';

// route → 'api' / method → 'quality' / module → 'architecture' (finding-system.schema.json phase enum 정합).
const AXIS_PHASE = { route: 'api', method: 'quality', module: 'architecture' };

function dateOf(report) {
  const ts = report?.meta?.generated_at;
  return typeof ts === 'string' && ts.length >= 10 ? ts.slice(0, 10) : null;
}

const SPEC_GAP = {
  route: 'openapi.yaml / acceptance-criteria.openapi_path / discovery-spec / impl-spec / test-spec 중 본 endpoint 미참조 (코드 route 有 / 산출물 ref 無).',
  method: 'impl-spec.source_files / test-spec / acceptance-criteria.code_pointers 중 본 public 메서드 미참조 (production-impl 有 / 산출물 ref 無 / noise-prone).',
  module: 'architecture.json dependencies[] 에 본 module→module 의존 미문서화 (codegraph cross-file edge 有 / arch.json 의존그래프 不完全). 결정론 corroboration lens.',
};

/**
 * coverage-hole findings(F-CGCOV / code_graph_ref 보유) → finding-system shape **promote-ready 레코드**.
 *   ★ finding_id 부재 = 의도 (사람이 promote 시 F-XXX 배정). discoverer:'codegraph' + code_graph_ref + status:'candidate'.
 * @param {Object} report  cli.js 가 만든 report (findings[] + codegraph.db_path)
 * @returns {Array<Object>}
 */
export function toPromoteReadyFindings(report) {
  const findings = Array.isArray(report?.findings) ? report.findings : [];
  const discovered_at = dateOf(report);
  const dbPath = report?.codegraph?.db_path ?? null;
  const out = [];
  for (const f of findings) {
    const sev = pinSeverity(f.severity); // ★ ceiling 강제 — low|medium 외 throw.
    const ref = f.code_graph_ref ? { ...f.code_graph_ref, ...(dbPath ? { db_path: dbPath } : {}) } : undefined;
    const rec = {
      seed_id: f.id,                      // F-CGCOV-NNN (추적용 / finding_id 아님)
      discoverer: 'codegraph',            // ★ 자유텍스트 관례값 (enum 격상 ❌ / 권위 누출 회피)
      phase: AXIS_PHASE[f.axis] ?? 'quality',
      ...(discovered_at ? { discovered_at } : {}),
      description: f.message,
      spec_gap: SPEC_GAP[f.axis] ?? SPEC_GAP.method,
      decision_made: 'reference-lens auto-seed (codegraph set-diff 결정론). 사람 검토 후 F-XXX 배정하여 finding-list 로 promote (또는 reject). 최종 evidence = 실코드 grep.',
      severity: sev,
      status: 'candidate',
      ...(ref ? { code_graph_ref: ref } : {}),
      ...(Array.isArray(f.evidence) && f.evidence.length ? { evidence_files: f.evidence.map((p) => ({ path: p })) } : {}),
    };
    out.push(rec);
  }
  return out;
}

// handler-set reading-aid noise 필터 — test base class / test 파일 기원 edge 제외 (RealWorld extends=TestWithCurrentUser/DbTestBase noise).
function isTestNoise(edge) {
  const sName = String(edge?.source?.name ?? '');
  const tName = String(edge?.target?.name ?? '');
  const sFile = String(edge?.source?.file ?? '');
  if (/test/i.test(sFile)) return true;                 // test 디렉토리/파일 기원
  if (/Test\b|TestBase|DbTest|AbstractTest/.test(sName)) return true;
  if (/Test\b|TestBase|DbTest|AbstractTest|WithCurrentUser/.test(tName)) return true;
  return false;
}

// error-mapping 관련 edge 인가 (handler↔exception 의미) — reading-aid 태깅용.
function isHandlerRelevant(edge) {
  const t = String(edge?.target?.name ?? '');
  const s = String(edge?.source?.name ?? '');
  return /Exception|Error|Handler|Filter|Advice/.test(t) || /Exception|Error|Handler|Filter/.test(s);
}

/**
 * implements/extends edge → handler-set reading-aid (결정적 열거 / finding 아님 / gate inject ❌).
 *   ★ ecommerce(NestJS) 1-도메인만 깨끗 (implements ExceptionHandler 등) — error-mapping 보조. 2-도메인 주장 ❌ (정직표기).
 * @param {{implements?:Array, extends?:Array}} edgesByKind  enumerateEdges 결과 byKind
 */
export function buildHandlerSet(edgesByKind = {}) {
  const impl = (edgesByKind.implements ?? []).filter((e) => !isTestNoise(e));
  const ext = (edgesByKind.extends ?? []).filter((e) => !isTestNoise(e));
  const mapEdge = (e) => ({
    source: e.source?.qualified_name || e.source?.name || null,
    target: e.target?.name || null,
    file: e.source?.file || null,
    handler_relevant: isHandlerRelevant(e),
  });
  const implementsList = impl.map(mapEdge);
  const extendsList = ext.map(mapEdge);
  return {
    channel: 'reading-aid',
    note: 'handler-set = implements/extends 결정적 열거 (reading-aid / finding 아님 / 결정적 gate inject ❌). ★ ecommerce(NestJS) 1-도메인 corroborated (implements *ExceptionHandler 등) — error-mapping 보조. RealWorld(Spring) implements=Repository / extends=test-base noise(필터됨). error-mapping http_status·mechanism(@ControllerAdvice vs @Catch) 분기 = semantic carry. 최종 evidence = 실코드 grep.',
    implements: implementsList,
    extends: extendsList,
    handler_relevant_count: implementsList.filter((x) => x.handler_relevant).length + extendsList.filter((x) => x.handler_relevant).length,
  };
}

// promote-ready 레코드 + handler-set → 사람-눈 markdown (사람이 검토 후 finding-list 로 paste / display-only).
export function renderPromoteFindingsMarkdown(records, handlerSet, report) {
  const L = [];
  L.push('# codegraph → finding-list — [promote-ready / reference-lens]');
  L.push('');
  L.push(`> ★ trust: reference-lens / 비차단(severity ${SEVERITY_CEILING.join('|')}) / 결정적 gate inject ❌. discoverer:'codegraph'.`);
  L.push("> ★ promote: 아래는 **자동 seed (finding_id 미부여)**. 사람 검토 후 F-XXX 배정하여 finding-list(poc-findings.md) 로 이식 (또는 reject). 최종 evidence = 실코드 grep.");
  L.push(`> target: \`${report?.target ?? '?'}\` · seeds: ${records.length}`);
  L.push('');
  if (!records.length) {
    L.push('_promote-ready coverage-hole seed 없음 (모든 code route/method 가 산출물에 커버됨)._');
  }
  for (const r of records) {
    L.push(`## ${r.seed_id} — ${r.severity} / phase=${r.phase}`);
    L.push(`- discoverer: \`codegraph\`  · status: ${r.status}`);
    L.push(`- description: ${r.description}`);
    L.push(`- spec_gap: ${r.spec_gap}`);
    if (r.code_graph_ref) L.push(`- code_graph_ref: \`${r.code_graph_ref.kind}\` ${r.code_graph_ref.symbol ?? ''}${r.code_graph_ref.file ? ' (' + r.code_graph_ref.file + ')' : ''}`);
    L.push(`- decision_made: ${r.decision_made}`);
    L.push('');
  }
  if (handlerSet && (handlerSet.implements.length || handlerSet.extends.length)) {
    L.push('## handler-set (reading-aid / implements·extends / ecommerce 1-도메인 정직표기)');
    L.push(`> ${handlerSet.note}`);
    for (const e of handlerSet.implements) L.push(`- implements: \`${e.source}\` ▸ \`${e.target}\`${e.handler_relevant ? '  ⟵ handler-relevant' : ''}  (${e.file ?? '?'})`);
    for (const e of handlerSet.extends) L.push(`- extends: \`${e.source}\` ▸ \`${e.target}\`${e.handler_relevant ? '  ⟵ handler-relevant' : ''}  (${e.file ?? '?'})`);
    L.push('');
  } else if (handlerSet) {
    L.push('## handler-set (reading-aid)');
    L.push(`> ${handlerSet.note}`);
    L.push('_implements/extends edge 없음 (또는 전부 test-base noise 필터됨)._');
    L.push('');
  }
  return L.join('\n').trimEnd();
}
