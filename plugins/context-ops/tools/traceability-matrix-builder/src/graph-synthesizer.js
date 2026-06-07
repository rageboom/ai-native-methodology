// graph-synthesizer.js
// 25 Tier-1 artifact (chain 6 + analysis 15 + aspect 4) → artifact-graph.json
//   ★ v11.0.0 paradigm — chain 6 layer = UC→BHV→AC→TASK→TC→IMPL (discovery→spec→plan→test→implement)
//   + plan 조직 노드 3종 (EPIC/STORY/OP) = task-plan 내부 cross-cut/screen anchor (catalog total 외 / 그래프 노드)
//   (plan-dep-graph-v11-paradigm-cascade.md §8 DESIGN)
// ★ state machine 내장 (active/drift/propose/deprecated transition table)
// ★ S5 정합: derived_from + do_not_edit_manually:true (matrix-builder header 규약 따름)
//
// 운영 plan: docs/dependency-graph.md
//   - §2 (그래프 모델): 2-tier 노드 + confidence 엣지 + 4-state
//   - §3 P1 (도구 맵): state machine 부분 (BFS·DFS cycle 은 별도 모듈)
// schemas: artifact-graph-node.schema.json + artifact-graph-edge.schema.json + code-pointer.schema.json

import { readFileSync, existsSync } from 'node:fs';
import { join, isAbsolute } from 'node:path';

// ============================================================================
// State machine (결정 1) — 4 state × event 전이표
// 외부 도구가 event 트리거:
//   - SessionStart drift 감지 → 'content_changed'
//   - 결정 5 정책 hook → 'deprecate_confirmed' / 'user_accept' / 'user_reject'
//   - release-readiness 통과 → 'revalidated'
// ============================================================================

export const NODE_STATES = Object.freeze(['active', 'drift', 'propose', 'deprecated']);

// TRANSITIONS[state][event] = nextState | null (null = 노드 삭제)
const TRANSITIONS = Object.freeze({
  active: Object.freeze({
    content_changed: 'drift',
    deprecate_confirmed: 'deprecated',
  }),
  drift: Object.freeze({
    revalidated: 'active',
    deprecate_confirmed: 'deprecated',
  }),
  propose: Object.freeze({
    user_accept: 'active',
    user_reject: null,
  }),
  deprecated: Object.freeze({
    purge: null,
  }),
});

export function transition(currentState, event) {
  if (!TRANSITIONS[currentState]) {
    throw new Error(`state-machine: unknown state '${currentState}'`);
  }
  if (!(event in TRANSITIONS[currentState])) {
    throw new Error(`state-machine: event '${event}' invalid from state '${currentState}'`);
  }
  return TRANSITIONS[currentState][event];
}

// ============================================================================
// Edge confidence (결정 1) — hard 4종 / soft 2종
// graph-integrity-validator 가 edge_type ↔ confidence 일관성 검증 (불일치 = fail)
// ============================================================================

// ★ v11.0.0 — conforms_to (artifact→contract leaf, hard) + groups (조직 layer 포함, soft) 신설.
const HARD_EDGE_TYPES = new Set(['derived_from', 'implements', 'tests', 'depends_on', 'conforms_to']);
const SOFT_EDGE_TYPES = new Set(['cross_reference', 'informs', 'groups']);

// 통계/stats 순회용 권위 목록 (schema edge_type enum 과 1:1)
const ALL_EDGE_TYPES = Object.freeze([
  'derived_from', 'implements', 'tests', 'depends_on', 'conforms_to',
  'cross_reference', 'informs', 'groups',
]);

export function confidenceFor(edgeType) {
  if (HARD_EDGE_TYPES.has(edgeType)) return 'hard';
  if (SOFT_EDGE_TYPES.has(edgeType)) return 'soft';
  throw new Error(`unknown edge_type: '${edgeType}'`);
}

// ============================================================================
// Tier-1 카탈로그 (25 = 6 chain + 15 analysis + 4 aspect)
// methodology-spec/deliverables 와 1:1 (22-traceability-matrix 는 derived 산출물이므로 제외)
// ★ v11.0.0 — chain +TASK (plan stage / task-plan.json 산출물).
// ============================================================================

const CHAIN_SUBKINDS = Object.freeze(['UC', 'BHV', 'AC', 'TASK', 'TC', 'IMPL']);

// ★ v11.0.0 plan 조직 노드 (task-plan 내부 entity / catalog total 외 — 별도 deliverable 아님).
//   EPIC = FE 화면 단위 / STORY = cross-cut anchor / OP = Story sibling 운영 task.
//   (DEC-2026-05-26-ticket-plan-단일)
const PLAN_SUBKINDS = Object.freeze(['EPIC', 'STORY', 'OP']);

export const ANALYSIS_SUBKINDS = Object.freeze([
  'architecture', 'domain', 'api', 'db-schema', 'formal-spec',
  'business-rules', 'antipatterns', 'ui-ux', 'state-map', 'visual-manifest',
  'form-validation-spec', 'type-spec', 'error-mapping-spec',
  'characterization-spec', 'sql-inventory',
]);

// ★ v11.x (F-ECOM-004) — analysis 산출물 basename → kind 역매핑.
//   cross_links.to_analysis_artifacts (spec-level generic path 리스트) 의 Layer 4 edge 합성용.
//   ANALYSIS_FILENAMES (cli.js) 와 정합 — 파일명 ≠ kind 인 경우(api / db-schema / ui-ux) + alias(openapi.yaml / db-schema.json) 포함.
//   guard test: 모든 ANALYSIS_SUBKINDS 가 ≥1 basename 으로 매핑 (drift 차단 / graph-synthesizer.test.js).
export const ANALYSIS_BASENAME_TO_KIND = Object.freeze({
  'architecture.json': 'architecture',
  'domain.json': 'domain',
  'openapi-extension.json': 'api',
  'openapi.yaml': 'api',
  'schema.json': 'db-schema',
  'db-schema.json': 'db-schema',
  'formal-spec.json': 'formal-spec',
  'business-rules.json': 'business-rules',
  'antipatterns.json': 'antipatterns',
  'ui-spec.json': 'ui-ux',
  'state-map.json': 'state-map',
  'visual-manifest.json': 'visual-manifest',
  'form-validation-spec.json': 'form-validation-spec',
  'type-spec.json': 'type-spec',
  'error-mapping-spec.json': 'error-mapping-spec',
  'characterization-spec.json': 'characterization-spec',
  'sql-inventory.json': 'sql-inventory',
});

const ASPECT_SUBKINDS = Object.freeze([
  'a11y', 'i18n', 'static-security', 'legacy-spectrum',
]);

// chain 인스턴스가 참조하는 analysis kind 매핑.
// "chain artifact 의 어떤 필드가 어느 analysis kind 를 가리키는가" 의 권위 표.
// 새 필드 발견 시 본 표만 갱신 (drift 재발 방지 — conventions §9 기계적 동작).
const CHAIN_TO_ANALYSIS_REFS = Object.freeze({
  BHV: { br_refs: 'business-rules' },
  AC: { related_brs: 'business-rules', related_aps: 'antipatterns' },
});

// ★ v11.2.0 (ADR-CHAIN-013) — analysis instance 가 chain artifact 로 가지는 자체 ref 권위 표.
// "analysis kind 의 어떤 path 가 어떤 chain artifact id 를 가리키는가" — yield chain ids per analysis data.
// graph-synthesizer 가 analysis-{kind} → chain instance 로 cross_reference (soft) edge 합성.
// dangling 가드: chain node 존재 시만 emit.
const ANALYSIS_TO_CHAIN_REFS = Object.freeze({
  'formal-spec': [
    (d) => (d?.sequences ?? []).map((s) => s.uc_id).filter(Boolean),
  ],
  'characterization-spec': [
    (d) => (d?.snapshots ?? []).map((s) => s.use_case).filter(Boolean),
  ],
  api: [
    (d) => (d?.operations ?? []).map((op) => op.related_use_case_id).filter(Boolean),
  ],
  'ui-ux': [
    (d) => (d?.pages ?? []).flatMap((p) => p.related_use_cases ?? []),
    (d) => (d?.components ?? []).flatMap((c) => c.related_use_cases ?? []),
  ],
  'sql-inventory': [
    (d) => (d?.inventory ?? []).map((i) => i.uc_link).filter(Boolean),
  ],
  domain: [
    (d) => (d?.bounded_contexts ?? []).flatMap((bc) =>
      (bc.aggregates ?? []).flatMap((a) => a.related_use_cases ?? []),
    ),
  ],
});

// ============================================================================
// Node 헬퍼
// ============================================================================

function chainNodeFromItem(item, subkind, source_path) {
  const node = {
    id: item.id,
    artifact_kind: 'chain',
    artifact_subkind: subkind,
    source_path,
    state: 'active',
  };
  const title = item.name ?? item.title ?? item.description;
  if (title) node.title = title;
  // ★ v11.0.0 BE/FE axis — layer 속성 (TASK 등). 그래프 폭증 회피 (§2): 별도 노드 아닌 속성.
  if (typeof item.layer === 'string') node.layer = item.layer;
  if (Array.isArray(item.code_pointers) && item.code_pointers.length > 0) {
    node.code_pointers = item.code_pointers;
  }
  if (item.code_pointers_na === true) {
    node.code_pointers_na = true;
  }
  return node;
}

// ★ v11.0.0 — Story 내부 id 규약 (Jira 비종속). behavior_ref 'BHV-USER-001' → 'STORY-USER-001'.
function storyIdFromBehaviorRef(behaviorRef) {
  if (typeof behaviorRef !== 'string') return null;
  const m = behaviorRef.match(/^BHV-(.+)$/);
  return m ? `STORY-${m[1]}` : null;
}

// ★ v11.0.0 — contract leaf target id 합성 (conforms_to 의 leaf target / IMPL→코드 implements 와 동형).
function openapiContractLeafId(ref) {
  if (!ref || typeof ref !== 'object') return null;
  const method = (ref.method ?? '').toString().toUpperCase();
  const path = ref.path ?? ref.operationId ?? '';
  if (!path) return null;
  return `contract:openapi:${method ? method + ' ' : ''}${path}`;
}
function componentContractLeafId(ref) {
  if (!ref || typeof ref !== 'object') return null;
  const name = ref.name ?? ref.package;
  if (!name) return null;
  return `contract:component:${ref.package ? ref.package + '/' : ''}${ref.name ?? ''}`;
}
function visualContractLeafId(ref) {
  if (!ref || typeof ref !== 'object') return null;
  if (!ref.screen) return null;
  return `contract:visual:${ref.screen}`;
}

function kindNode({ artifact_kind, subkind, source_path, title, data }) {
  const node = {
    id: `${artifact_kind}-${subkind}`,
    artifact_kind,
    artifact_subkind: subkind,
    source_path,
    state: 'active',
  };
  if (title) node.title = title;
  if (Array.isArray(data?.code_pointers) && data.code_pointers.length > 0) {
    node.code_pointers = data.code_pointers;
  }
  if (data?.code_pointers_na === true) {
    node.code_pointers_na = true;
  }
  return node;
}

// IMPL.source_files (string[]) → code_pointers (strict_path) 평탄화.
// frontmatter 가 본격 도입되면(P2) impl.code_pointers 를 우선 사용하고 source_files fallback.
function implCodePointers(impl) {
  if (Array.isArray(impl.code_pointers) && impl.code_pointers.length > 0) {
    return impl.code_pointers;
  }
  return (impl.source_files ?? []).map(p => {
    const ptr = { path: p, anchor_type: 'strict_path' };
    if (impl.commit_hash) ptr.commit_hash = impl.commit_hash;
    return ptr;
  });
}

// ★ v11.x (F-DOGFOOD-009) — 의도/집계 노드 code_pointers_na 기본값 backstop.
// 노드 조립 완료 후 1회 호출하는 정규화 패스. UC/BHV/AC/TASK + analysis/aspect 는 본질이
// 의도/집계 노드 → 코드 anchor 없음이 정상 = na=true 가 정직한 상태 (code_pointer-validator 결정 3).
// IMPL/TC 제외 — source_files/source_file fallback 이 code_pointers 를 채움. 없으면 의도적 flagged
//   (code-bearing 노드인데 코드 없음 = 실 결함이므로 missing 으로 노출 유지).
// ★ Senior REVISE — state==='active' 게이트 (신규 노드만). carry-over deprecated/propose 노드는
//   payload 무변조 (재합성 시 silent content drift 회피 / synthesizeGraph 내 drift state 부재).
const CODE_BEARING_SUBKINDS = new Set(['IMPL', 'TC']);
function defaultNaForIntentNodes(nodes) {
  for (const n of nodes) {
    if (n.state !== 'active') continue;
    if (!['chain', 'analysis', 'aspect'].includes(n.artifact_kind)) continue;
    if (CODE_BEARING_SUBKINDS.has(n.artifact_subkind)) continue;
    const hasPtr = Array.isArray(n.code_pointers) && n.code_pointers.length > 0;
    if (!hasPtr && n.code_pointers_na !== true) n.code_pointers_na = true;
  }
}

// ============================================================================
// ★ v11.x (F-DF-ANCHOR-002 / v11.23.0 Slice 2 C-codepointer-analysis-aspect-enrich) —
//   analysis instance evidence → node code_pointers derive.
//   "이미 analysis 산출물에 존재하는 file/dir evidence 를 그래프 node code_pointers 로 surface"
//   (Sourcegraph SCIP auto-derive 동형 / best-effort / §2 research wf_07929e3d + wf_8a8aa7ef).
//   ★ per-kind 명시 config — 자동 *.java 재귀 ❌ (persisted_to 테이블명·부수 문자열 오수집 회피 / Senior REVISE).
//
//   config[kind] = { mode, accessor, prefixes? }:
//     mode 'file' = strict_path 단일 파일. hasCodeExtension 게이트 + prefixes 순서대로 첫 존재 경로 해소.
//       ★ prefixes 는 kind-specific 명시 선언 (전역 기본값 의존 ❌ / REVISE-B). 기존 3 kind = [''] = raw 그대로
//         (byte-identical 보존 / business-rules 의 mapper-prefix 류는 미해소 유지 = test 4/5 동형).
//     mode 'dir'  = glob anchor (glob 필드 부재 → validator existsSync(dir) 매칭 / commit_hash 미스탬프 → A2 제외).
//       LSP 3.17 dir-level glob + IntelliJ content-root=module dir isomorphic (research wf_8a8aa7ef).
//   accessor(data) → 경로 후보 string[] (schema-canonical evidence 필드).
// ============================================================================
const ANALYSIS_TO_CODE_POINTERS = Object.freeze({
  'business-rules': {
    mode: 'file', prefixes: [''],
    accessor: (d) => (d?.business_rules ?? []).flatMap((br) =>
      (br?.source_evidence ?? []).map((e) => e?.file)),
  },
  domain: {
    mode: 'file', prefixes: [''],
    accessor: (d) => (d?.bounded_contexts ?? []).flatMap((bc) => [
      ...(bc?.aggregates ?? []).flatMap((a) =>
        (a?.invariants ?? []).flatMap((inv) =>
          (inv?.evidence ?? []).map((e) => e?.file))),
      ...(bc?.value_objects ?? []).flatMap((vo) =>
        (vo?.evidence ?? []).map((e) => e?.file)),
    ]),
  },
  'error-mapping-spec': {
    mode: 'file', prefixes: [''],
    accessor: (d) => [
      ...(d?.exception_handlers ?? []).map((h) => h?.source_file),
      ...(d?.http_status_mapping ?? []).map((m) => m?.evidence_file),
    ],
  },
  // ★ v11.24.0 Slice 3 — antipatterns: evidence[].file (full repo-relative path / .sql DDL·소스 파일).
  //   business-rules 와 동형 (prefixes=[''] / strict_path / commit_hash 스탬프 → A2 가 DDL·schema migration 변경 탐지).
  antipatterns: {
    mode: 'file', prefixes: [''],
    accessor: (d) => (d?.antipatterns ?? []).flatMap((ap) =>
      (ap?.evidence ?? []).map((e) => e?.file)),
  },
  // ★ v11.23.0 Slice 2 — sql-inventory: mapper_xml 논리경로('mapper/X.xml') → resource-prefix 역산 strict_path.
  //   prefixes 순서 = bare → Maven classpath root → mybatis variant (첫 존재 채택 / existence-gate false-positive 0).
  //   Spring PathMatchingResourcePatternResolver / Maven Standard Layout isomorphic (research wf_8a8aa7ef).
  //   sentinel 'inline'/'jpa'/'typeorm'/'prisma' = 확장자 없음 → hasCodeExtension 자동 필터.
  //   src/main/java/ 임베디드 XML(비표준) = 의도적 scope-out (existence-gate→na 정직 / REVISE-A).
  'sql-inventory': {
    mode: 'file', prefixes: ['', 'src/main/resources/', 'src/main/resources/mybatis/'],
    accessor: (d) => (d?.inventory ?? []).map((r) => r?.mapper_xml),
  },
  // ★ v11.23.0 Slice 2 — architecture: modules[].path(디렉토리) → glob anchor.
  architecture: {
    mode: 'dir',
    accessor: (d) => (d?.modules ?? []).map((m) => m?.path),
  },
  // ★ v11.26.0 Slice 4 — db-schema: source_files[](스키마가 추출된 DDL/migration .sql) → strict_path.
  //   db-schema = DDL 의 semantic owner → A2 가 DDL 변경 시 db-schema 노드 drift 탐지 (접근 C / carry ③).
  //   business-rules 동형(file / prefixes ['']). .sql ∈ CODE_FILE_EXTENSIONS / erd .mmd·미존재 = 게이트 skip → 0 해소 시 na.
  //   ★ §8.1 정직: RealWorld 단일 도메인에선 antipatterns(Slice 3)가 같은 DDL 앵커 = A2 탐지 겹침 / 독립 가치 = ≥2 도메인 carry.
  'db-schema': {
    mode: 'file', prefixes: [''],
    accessor: (d) => d?.source_files ?? [],
  },
  // ★ v11.x (F-FE-ANCHOR-001) FE kinds — type-spec/ui-ux/form-validation source_file → strict_path.
  //   실 FE 프로젝트(React/TS) dogfood 표면화: FE 산출물은 source_file 보유하나 미배선 → na. BE slice 2~4 의 FE 대응.
  //   mode 'file' / prefixes [''] (source_file = repo-relative .ts/.tsx). state-map/visual-manifest = source 필드 부재 → 영구 na (미배선 유지).
  'type-spec': {
    mode: 'file', prefixes: [''],
    accessor: (d) => (d?.types ?? []).map((t) => t?.source_file),
  },
  'ui-ux': {
    mode: 'file', prefixes: [''],
    accessor: (d) => [
      ...(d?.pages ?? []).map((p) => p?.source_file),
      ...(d?.components ?? []).map((c) => c?.source_file),
    ],
  },
  'form-validation-spec': {
    mode: 'file', prefixes: [''],
    accessor: (d) => (d?.validations ?? []).map((v) => v?.source_file),
  },
});

// 확장자 화이트리스트 — strict_path emit 前 게이트 (table-name·dir·dotted-class false-anchor 차단 / Senior REVISE).
const CODE_FILE_EXTENSIONS = Object.freeze(new Set([
  '.java', '.kt', '.kts', '.xml', '.ts', '.tsx', '.js', '.jsx',
  '.py', '.sql', '.go', '.rb', '.cs', '.php', '.scala', '.vue',
]));
export function hasCodeExtension(p) {
  if (typeof p !== 'string') return false;
  const slash = Math.max(p.lastIndexOf('/'), p.lastIndexOf('\\'));
  const base = slash >= 0 ? p.slice(slash + 1) : p;
  const dot = base.lastIndexOf('.');
  if (dot <= 0) return false; // 확장자 없음 (디렉토리) 또는 dotfile
  return CODE_FILE_EXTENSIONS.has(base.slice(dot).toLowerCase());
}

const ANALYSIS_DERIVE_CAP = 10; // 노드당 derive 앵커 상한 (그래프 폭증 회피 / §2).

// per-anchor 해소 — mode 별 pointer 생성. 미해소/미존재/확장자외 → null (→ backstop 가 na 처리).
//   file: hasCodeExtension 게이트 → prefixes 순서대로 첫 existsFn-통과 candidate (kind-specific prefix / REVISE-B).
//         existsFn 미주입 = no-gate best-effort 첫 후보 (synthesizeGraph 는 항상 effectiveExistsFn 주입).
//   dir : 확장자 게이트 skip (디렉토리는 확장자 없음) → existsFn 게이트 → glob anchor (glob 필드 부재 / A2 제외).
function resolveAnchor(raw, cfg, existsFn) {
  if (typeof raw !== 'string' || raw.length === 0) return null;
  const hasGate = typeof existsFn === 'function';
  if (cfg.mode === 'dir') {
    if (hasGate && !existsFn(raw)) return null;        // existence-gate (정직 불변식)
    return { path: raw, anchor_type: 'glob' };
  }
  // mode 'file' (default)
  if (!hasCodeExtension(raw)) return null;             // 확장자 화이트리스트 (table-name·dir·sentinel 차단)
  for (const pfx of (cfg.prefixes ?? [''])) {
    const candidate = pfx ? pfx + raw : raw;           // prefix 는 trailing '/' 포함 (resource-prefix 역산)
    if (!hasGate || existsFn(candidate)) return { path: candidate, anchor_type: 'strict_path' };
  }
  return null;                                         // 어떤 prefix 도 미해소
}

// derive 패스 — defaultNaForIntentNodes 直前 호출. active analysis 노드 + code_pointers 부재 일 때만.
//   existsFn 으로 미검증 경로 차단 (정직 불변식: 미검증 경로 emit ❌ → 후속 backstop 가 na 처리).
//   commit_hash 는 하류 스탬프 루프(strict_path + graph commitHash)가 부여 (IMPL/TC 와 동형 / glob=미스탬프=A2 제외).
export function deriveAnalysisCodePointers(nodes, analysis, { existsFn } = {}) {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  for (const [kind, cfg] of Object.entries(ANALYSIS_TO_CODE_POINTERS)) {
    const data = analysis?.[kind];
    if (!data) continue;
    const node = byId.get(`analysis-${kind}`);
    if (!node || node.state !== 'active') continue;
    if (Array.isArray(node.code_pointers) && node.code_pointers.length > 0) continue; // 이미 보유 = 무변경
    const seen = new Set();
    const pointers = [];
    for (const raw of cfg.accessor(data)) {
      const ptr = resolveAnchor(raw, cfg, existsFn);   // mode-aware (file=strict_path+prefix / dir=glob)
      if (!ptr) continue;                              // 미해소/미존재/확장자외 → skip
      if (seen.has(ptr.path)) continue;                // dedup (해소 경로 기준)
      seen.add(ptr.path);
      pointers.push(ptr);
      if (pointers.length >= ANALYSIS_DERIVE_CAP) break; // cap
    }
    if (pointers.length > 0) node.code_pointers = pointers;
  }
  // Phase 4 additive: business-rules per-BC child nodes get code_pointers from ONLY that BC's rules'
  // source_evidence. Parent keeps whole-file pointers (coarse); children = BC subset (precise A2 drift).
  // Same gating (resolveAnchor / extension whitelist / prefixes / cap) as the parent pass.
  const _brData = analysis?.['business-rules'];
  if (_brData) {
    const _cfg = ANALYSIS_TO_CODE_POINTERS['business-rules'];
    for (const node of nodes) {
      if (node.artifact_kind !== 'analysis' || node.artifact_subkind !== 'business-rules') continue;
      if (typeof node.bounded_context !== 'string') continue; // parent (no bc field) skipped
      if (typeof node.business_rule_id === 'string') continue; // S6: per-BR = 별도 패스
      if (node.state !== 'active') continue;
      if (Array.isArray(node.code_pointers) && node.code_pointers.length > 0) continue;
      const _rules = (_brData.business_rules ?? []).filter((r) => r?.bounded_context === node.bounded_context);
      const _seen = new Set();
      const _pointers = [];
      for (const raw of _cfg.accessor({ business_rules: _rules })) {
        const ptr = resolveAnchor(raw, _cfg, existsFn);
        if (!ptr) continue;
        if (_seen.has(ptr.path)) continue;
        _seen.add(ptr.path);
        _pointers.push(ptr);
        if (_pointers.length >= ANALYSIS_DERIVE_CAP) break;
      }
      if (_pointers.length > 0) node.code_pointers = _pointers;
    }
  }
  // S6 (v0.16.0) additive: per-BR 노드 code_pointers = 그 rule 의 source_evidence 만 (per-BC subset 보다 정밀).
  if (_brData) {
    const _cfgBr = ANALYSIS_TO_CODE_POINTERS['business-rules'];
    for (const node of nodes) {
      if (node.artifact_kind !== 'analysis' || node.artifact_subkind !== 'business-rules') continue;
      if (typeof node.business_rule_id !== 'string') continue; // per-BR 만
      if (node.state !== 'active') continue;
      if (Array.isArray(node.code_pointers) && node.code_pointers.length > 0) continue;
      const _rules = (_brData.business_rules ?? []).filter((r) => r?.id === node.business_rule_id);
      const _seen = new Set();
      const _pointers = [];
      for (const raw of _cfgBr.accessor({ business_rules: _rules })) {
        const ptr = resolveAnchor(raw, _cfgBr, existsFn);
        if (!ptr) continue;
        if (_seen.has(ptr.path)) continue;
        _seen.add(ptr.path);
        _pointers.push(ptr);
        if (_pointers.length >= ANALYSIS_DERIVE_CAP) break;
      }
      if (_pointers.length > 0) node.code_pointers = _pointers;
    }
  }
}

// ============================================================================
// Edge 헬퍼
// ============================================================================

function makeEdge(source, target, edge_type, extra = {}) {
  return {
    source,
    target,
    edge_type,
    confidence: confidenceFor(edge_type),
    ...extra,
  };
}

// ============================================================================
// 메인 합성 함수
// ============================================================================

/**
 * @param {Object} input
 * @param {Object|null} input.discovery     discovery-spec.json (use_cases[]) ★ v11.0.0 (planning-spec 개칭)
 * @param {Object|null} input.planning      ★ backward-compat alias of `discovery`
 * @param {Object|null} input.behavior      behavior-spec.json (behaviors[])
 * @param {Object|null} input.acceptance    acceptance-criteria.json (criteria[])
 * @param {Object|null} input.taskPlan      task-plan.json (tasks[] + epic_refs/story_refs/op_task_refs) ★ v11.0.0 plan stage
 * @param {Object|null} input.operationalTask  operational-task.json (op_tasks[]) ★ v11.0.0 (optional / OP 보강)
 * @param {Object|null} input.testSpec      test-spec.json (test_cases[])
 * @param {Object|null} input.implSpec      impl-spec.json (modules[])
 * @param {Object} [input.analysis]         { [kind]: json } — ANALYSIS_SUBKINDS 중
 * @param {Object} [input.aspect]           { [kind]: json } — ASPECT_SUBKINDS 중
 * @param {Object} [input.sourcePaths]      { discovery, behavior, acceptance, taskPlan, testSpec, implSpec, analysis:{[k]:p}, aspect:{[k]:p} }
 * @param {Object|null} [input.previousGraph]  이전 artifact-graph.json (state carry-over 용)
 * @param {string} [input.scopeId]
 * @param {string} [input.commitHash]
 * @returns {Object} artifact-graph (nodes/edges/stats + header)
 */
export function synthesizeGraph(input) {
  const {
    discovery = null,
    planning = null,
    behavior = null,
    acceptance = null,
    taskPlan = null,
    operationalTask = null,
    testSpec = null,
    implSpec = null,
    analysis = {},
    aspect = {},
    sourcePaths = {},
    previousGraph = null,
    scopeId,
    commitHash,
    repoRoot,
    existsFn,
  } = input;

  // ★ v11.0.0 — discovery 우선, planning 은 backward-compat alias.
  const discoverySpec = discovery ?? planning;
  const discoveryPath = sourcePaths.discovery ?? sourcePaths.planning;

  // ★ v11.x (F-DF-ANCHOR-002) — derive existence-gate predicate.
  //   주입 existsFn 우선 (test 결정성) / 미주입 시 repoRoot(또는 cwd) 기준 실 existsSync.
  //   미존재 경로는 derive 가 emit 안 함 → backstop 이 정직하게 na 처리 (Senior 정직 불변식).
  const effectiveExistsFn = typeof existsFn === 'function'
    ? existsFn
    : (p) => {
        try { return existsSync(isAbsolute(p) ? p : join(repoRoot ?? process.cwd(), p)); }
        catch { return false; }
      };

  const nodes = [];
  const edges = [];
  const nodeIds = new Set();

  function pushNode(node) {
    if (nodeIds.has(node.id)) return; // 중복 ingest 방어
    nodes.push(node);
    nodeIds.add(node.id);
  }

  // ★ v11.0.0 — TASK layer index. tcCoveredByTask = TASK 가 점유한 TC id 집합
  //   (AC→TC shortcut 억제용 / matrix-builder taskByAC 정합 / task-plan 부재 시 빈 set → AC→TC fallback).
  const tasks = taskPlan?.tasks ?? [];
  const tcCoveredByTask = new Set();
  for (const t of tasks) for (const tcRef of t.tc_refs ?? []) tcCoveredByTask.add(tcRef);

  // --- chain instance 노드 + chain forward 엣지 ---
  for (const uc of discoverySpec?.use_cases ?? []) {
    pushNode(chainNodeFromItem(uc, 'UC', discoveryPath ?? '(discovery)'));
  }
  for (const b of behavior?.behaviors ?? []) {
    pushNode(chainNodeFromItem(b, 'BHV', sourcePaths.behavior ?? '(behavior)'));
    for (const ucRef of b.use_case_refs ?? []) {
      edges.push(makeEdge(ucRef, b.id, 'derived_from'));
    }
  }
  for (const ac of acceptance?.criteria ?? []) {
    pushNode(chainNodeFromItem(ac, 'AC', sourcePaths.acceptance ?? '(acceptance)'));
    if (ac.behavior_ref) {
      edges.push(makeEdge(ac.behavior_ref, ac.id, 'derived_from'));
    }
  }
  // ★ v11.0.0 plan stage — TASK 노드 + chain forward (AC→TASK, TASK→TC) + layer 속성.
  for (const task of tasks) {
    pushNode(chainNodeFromItem(task, 'TASK', sourcePaths.taskPlan ?? '(task-plan)'));
    // backward chain link: AC → TASK (task.ac_refs)
    for (const acRef of task.ac_refs ?? []) {
      edges.push(makeEdge(acRef, task.id, 'derived_from'));
    }
    // forward chain link: TASK → TC (task.tc_refs)
    for (const tcRef of task.tc_refs ?? []) {
      edges.push(makeEdge(task.id, tcRef, 'derived_from'));
    }
  }
  for (const tc of testSpec?.test_cases ?? []) {
    const tcNode = chainNodeFromItem(tc, 'TC', sourcePaths.testSpec ?? '(testSpec)');
    // TC.source_file (단수, 실 test 코드) → code_pointers (strict_path) 평탄화. IMPL.source_files 와 정합.
    // frontmatter code_pointers 가 이미 있으면 그것을 우선 (chainNodeFromItem 이 처리).
    if (!tcNode.code_pointers && tc.source_file) {
      const ptr = { path: tc.source_file, anchor_type: 'strict_path' };
      tcNode.code_pointers = [ptr];
    }
    pushNode(tcNode);
    // ★ v11.0.0 — TASK 가 이 TC 를 점유하면 AC→TASK→TC 가 정식 경로이므로 직접 AC→TC shortcut 억제.
    //   (점유 안 됨 = task-plan 부재/부분 → AC→TC fallback 보존 = backward compat)
    if (tc.ac_ref && !tcCoveredByTask.has(tc.id)) {
      edges.push(makeEdge(tc.ac_ref, tc.id, 'derived_from'));
    }
  }
  for (const impl of implSpec?.modules ?? []) {
    const implNode = chainNodeFromItem(impl, 'IMPL', sourcePaths.implSpec ?? '(implSpec)');
    const pointers = implCodePointers(impl);
    if (pointers.length > 0) implNode.code_pointers = pointers;
    pushNode(implNode);
    // TC → IMPL: tests (TC 가 IMPL 동작을 검증)
    for (const tcRef of impl.tc_refs ?? []) {
      edges.push(makeEdge(tcRef, impl.id, 'tests'));
    }
    // IMPL → 코드 파일: implements (hard, Tier-2 leaf 이므로 노드 추가 안 함)
    for (const ptr of pointers) {
      const extra = {};
      if (ptr.commit_hash) extra.commit_hash = ptr.commit_hash;
      edges.push(makeEdge(impl.id, ptr.path, 'implements', extra));
    }
  }

  // --- ★ v11.0.0 plan 조직 노드 (EPIC / STORY / OP) + groups 엣지 ---
  // EPIC = FE 화면 단위 / STORY = cross-cut anchor / OP = Story sibling 운영 task.
  // 노드 id 규약: Epic = screen_id||jira_id / Story = STORY-<BHV suffix> / OP = op_task_id.
  // groups (soft): Epic→Story (story.epic_ref) / Story→TASK (task.story_ref) / OP→TASK (task.op_task_ref).
  const taskPlanPath = sourcePaths.taskPlan ?? '(task-plan)';
  for (const ep of taskPlan?.epic_refs ?? []) {
    const id = ep.screen_id ?? ep.jira_id;
    if (!id) continue;
    pushNode({
      id, artifact_kind: 'plan', artifact_subkind: 'EPIC',
      source_path: taskPlanPath, state: 'active',
      ...(ep.title ? { title: ep.title } : {}),
    });
  }
  for (const st of taskPlan?.story_refs ?? []) {
    const id = storyIdFromBehaviorRef(st.behavior_ref) ?? st.jira_id;
    if (!id) continue;
    pushNode({
      id, artifact_kind: 'plan', artifact_subkind: 'STORY',
      source_path: taskPlanPath, state: 'active',
      ...(st.title ? { title: st.title } : {}),
    });
    // Epic → Story (조직 포함). 양 끝 노드 존재 시만 (dangling 방지는 합성 후 일괄 — 여기선 source 존재만 보장).
    if (st.epic_ref) edges.push(makeEdge(st.epic_ref, id, 'groups'));
  }
  // OP 노드 — task-plan.op_task_refs[] + (선택) operational-task.op_tasks[]
  for (const op of taskPlan?.op_task_refs ?? []) {
    const id = op.op_task_id;
    if (!id) continue;
    pushNode({
      id, artifact_kind: 'plan', artifact_subkind: 'OP',
      source_path: taskPlanPath, state: 'active',
      ...(op.title ? { title: op.title } : {}),
    });
  }
  for (const op of operationalTask?.op_tasks ?? []) {
    if (!op.id) continue;
    pushNode({
      id: op.id, artifact_kind: 'plan', artifact_subkind: 'OP',
      source_path: sourcePaths.operationalTask ?? '(operational-task)', state: 'active',
      ...(op.title ? { title: op.title } : {}),
    });
  }
  // Story→TASK / OP→TASK (조직 포함) + TASK contract conforms_to (leaf hard).
  for (const task of tasks) {
    if (task.story_ref) edges.push(makeEdge(task.story_ref, task.id, 'groups'));
    if (task.op_task_ref) edges.push(makeEdge(task.op_task_ref, task.id, 'groups'));
    // ★ contract 강제 양 axis (DEC #8) — TASK → contract leaf (BE openapi / FE component).
    const beLeaf = openapiContractLeafId(task.openapi_endpoint_ref);
    if (beLeaf) edges.push(makeEdge(task.id, beLeaf, 'conforms_to'));
    const feLeaf = componentContractLeafId(task.component_ref);
    if (feLeaf) edges.push(makeEdge(task.id, feLeaf, 'conforms_to'));
  }
  // TC contract conforms_to (leaf hard) — BE openapi_contract / FE visual_regression.
  for (const tc of testSpec?.test_cases ?? []) {
    const beLeaf = openapiContractLeafId(tc.openapi_contract_ref);
    if (beLeaf) edges.push(makeEdge(tc.id, beLeaf, 'conforms_to'));
    const visLeaf = visualContractLeafId(tc.visual_regression_ref);
    if (visLeaf) edges.push(makeEdge(tc.id, visLeaf, 'conforms_to'));
  }

  // --- analysis kind 노드 (15) ---
  const analysisLoaded = new Set();
  for (const subkind of ANALYSIS_SUBKINDS) {
    const data = analysis[subkind];
    if (!data) continue;
    pushNode(kindNode({
      artifact_kind: 'analysis',
      subkind,
      source_path: sourcePaths.analysis?.[subkind] ?? `(analysis-${subkind})`,
      title: data.meta?.title ?? data.title,
      data,
    }));
    analysisLoaded.add(subkind);
  }

  // Phase 4 (v0.12.0) additive per-BC business-rules child nodes.
  // Keep parent analysis-business-rules (file-level / unchanged). Add one child
  // analysis-business-rules-<BC> per distinct bounded_context. Children carry per-BC
  // cross_reference (emitAnalysisCrossRefs) + per-BC code_pointers (deriveAnalysisCodePointers)
  // = precise dependency surface. No BC => no children (full backward-compat).
  // Consumer rewiring (route per-BC dispatch) + parent coarse-edge retirement = S1..S5 (deferred).
  const brById = new Map();   // BR id -> bounded_context
  const brBCs = [];           // distinct BC, sorted (determinism / F-m2)
  if (analysisLoaded.has('business-rules')) {
    const seenBC = new Set();
    for (const r of analysis['business-rules']?.business_rules ?? []) {
      if (!r || typeof r.id !== 'string') continue;
      if (typeof r.bounded_context !== 'string' || r.bounded_context.length === 0) continue;
      brById.set(r.id, r.bounded_context);
      if (!seenBC.has(r.bounded_context)) { seenBC.add(r.bounded_context); brBCs.push(r.bounded_context); }
    }
    brBCs.sort(); // deterministic synthesize-twice (F-m2)
    const brSourcePath = sourcePaths.analysis?.['business-rules'] ?? '(analysis-business-rules)';
    const brTitle = analysis['business-rules']?.meta?.title ?? 'business-rules';
    for (const bc of brBCs) {
      pushNode({
        id: `analysis-business-rules-${bc}`,
        artifact_kind: 'analysis',
        artifact_subkind: 'business-rules',
        bounded_context: bc,
        source_path: brSourcePath,
        state: 'active',
        title: `${brTitle} (${bc})`,
      });
      // parent -> child (organizational / soft). No closure impact (2-hop soft dropped => parent stays coarse by design).
      edges.push(makeEdge('analysis-business-rules', `analysis-business-rules-${bc}`, 'groups'));
    }
    // S6 (v0.16.0) additive per-BR 노드: BC 보유 BR 당 1 노드 (per-BC 하위 / route·impact precise origin).
    // per-BC 엣지/노드 유지(무회귀) + per-BR 추가 = additive (Phase 4 동형). BC-less BR = per-BR 없음(parent fallback).
    const brIds = [...brById.keys()].sort(); // 결정성
    for (const brId of brIds) {
      const _bc = brById.get(brId);
      pushNode({
        id: `analysis-business-rules-${brId}`,
        artifact_kind: 'analysis',
        artifact_subkind: 'business-rules',
        bounded_context: _bc,
        business_rule_id: brId,
        source_path: brSourcePath,
        state: 'active',
        title: `${brTitle} (${brId})`,
      });
      edges.push(makeEdge(`analysis-business-rules-${_bc}`, `analysis-business-rules-${brId}`, 'groups'));
    }
  }

  // --- aspect kind 노드 (4) ---
  for (const subkind of ASPECT_SUBKINDS) {
    const data = aspect[subkind];
    if (!data) continue;
    pushNode(kindNode({
      artifact_kind: 'aspect',
      subkind,
      source_path: sourcePaths.aspect?.[subkind] ?? `(aspect-${subkind})`,
      title: data.meta?.title ?? data.title,
      data,
    }));
  }

  // --- cross_reference (soft, analysis ↔ chain) ---
  // chain artifact 내부 ref 필드가 가리키는 analysis kind 매핑 표(CHAIN_TO_ANALYSIS_REFS)에 따라 자동 도출.
  // 양 끝 노드가 모두 로드돼 있을 때만 emit (dangling 방지).
  function emitAnalysisCrossRefs(items, subkind) {
    const refMap = CHAIN_TO_ANALYSIS_REFS[subkind];
    if (!refMap) return;
    for (const item of items ?? []) {
      for (const [field, analysisKind] of Object.entries(refMap)) {
        if (!analysisLoaded.has(analysisKind)) continue;
        const emittedChild = new Set(); // per (item,field) per-BC child dedup
        const emittedBr = new Set(); // S6: per (item,field) per-BR dedup
        for (const _ref of item[field] ?? []) {
          // S5 (v0.15.0) 진짜 분할: per-rule 참조는 per-BC 자식으로만 라우팅 (부모 coarse 은퇴).
          // 3-tier fail-open: (1) BR-ref→BC + 자식 실재 → 자식 precise 엣지만(coarse 은퇴) /
          // (2) BC-less BR·자식 부재 / (3) non-business-rules kind → 부모 coarse fallback(무회귀 / silent false-health 차단).
          // whole-artifact 참조(Layer 3/4 meta.related_chain_ids·to_analysis_artifacts)는 per-rule id 부재라 부모 coarse 유지가 정답.
          let precise = false;
          if (analysisKind === 'business-rules') {
            const bc = brById.get(_ref);
            if (bc) {
              // S6 (v0.16.0) additive per-BR: _ref = BR id → per-BR 노드 (정밀 origin / per-BC 와 공존 / route 가 per-BR 우선).
              const brNodeId = `analysis-business-rules-${_ref}`;
              if (nodeIds.has(brNodeId) && !emittedBr.has(_ref)) {
                emittedBr.add(_ref);
                edges.push(makeEdge(brNodeId, item.id, 'cross_reference'));
              }
              const childId = `analysis-business-rules-${bc}`;
              if (nodeIds.has(childId)) {
                precise = true;
                if (!emittedChild.has(bc)) {
                  emittedChild.add(bc);
                  edges.push(makeEdge(childId, item.id, 'cross_reference'));
                }
              }
            }
          }
          // analysis kind 노드 → 개별 chain instance: SHOULD 전파 (precise 자식이 대체하면 은퇴)
          if (!precise) edges.push(makeEdge(`analysis-${analysisKind}`, item.id, 'cross_reference'));
        }
      }
    }
  }
  emitAnalysisCrossRefs(behavior?.behaviors, 'BHV');
  emitAnalysisCrossRefs(acceptance?.criteria, 'AC');

  // --- ★ v11.2.0 cross_reference (soft, analysis instance → chain) — ADR-CHAIN-013 Layer 2 ---
  // analysis 산출물 안 자체 ref 필드 (sequences[].uc_id / snapshots[].use_case / operations[].related_use_case_id /
  //  pages[].related_use_cases / inventory[].uc_link / bounded_contexts[].aggregates[].related_use_cases)
  // 가 가리키는 chain id 로 cross_reference edge 합성. dangling 가드: nodeIds.has(target).
  for (const [analysisKind, accessors] of Object.entries(ANALYSIS_TO_CHAIN_REFS)) {
    if (!analysisLoaded.has(analysisKind)) continue;
    const data = analysis[analysisKind];
    if (!data) continue;
    for (const accessor of accessors) {
      for (const target of accessor(data)) {
        if (!nodeIds.has(target)) continue;
        edges.push(makeEdge(`analysis-${analysisKind}`, target, 'cross_reference'));
      }
    }
  }

  // --- ★ v11.2.0 cross_reference (soft, analysis → chain) — ADR-CHAIN-013 Layer 3 meta fallback ---
  // 5 schemas (architecture / db-schema / state-map / type-spec / error-mapping-spec) 가 자체 ref 필드 부재.
  // meta.related_chain_ids[] 가 있으면 fallback 으로 cross_reference 합성 (aspect informs 동형).
  // 모든 analysis kind 가 본 경로 활용 가능 (3중 fallback / DRY).
  for (const subkind of ANALYSIS_SUBKINDS) {
    const data = analysis[subkind];
    if (!data) continue;
    for (const target of data.meta?.related_chain_ids ?? []) {
      if (!nodeIds.has(target)) continue;
      edges.push(makeEdge(`analysis-${subkind}`, target, 'cross_reference'));
    }
  }

  // --- ★ v11.x (F-ECOM-004) Layer 4 cross_reference (soft, analysis → chain) — spec-level to_analysis_artifacts ---
  //   discovery/behavior/operational-task 의 cross_links.to_analysis_artifacts (generic 산출물 path 리스트)를
  //   basename→kind 역매핑(ANALYSIS_BASENAME_TO_KIND) 후 cross_reference edge 합성. Layer 1~3 (특정 ref 필드)이
  //   못 잡는 산출물(architecture/db-schema/domain 등 = 특정 ref 부재)을 연결 → graph-integrity orphan 해소.
  //   spec-level(coarse) 이므로 layer anchor 1개(정렬 첫 id)에만 연결 = fan-out 회피 (per-item 정밀 edge 는 Layer 1).
  //   guard: analysisLoaded.has(kind) + nodeIds.has(anchor) (dangling) + 기존 cross_reference edge 중복 회피 (dedup).
  {
    const xrefKeys = new Set(
      edges.filter((e) => e.edge_type === 'cross_reference').map((e) => `${e.source} ${e.target}`)
    );
    const anchorOf = (items) => {
      const ids = (items ?? [])
        .map((it) => it?.id)
        .filter((id) => typeof id === 'string' && nodeIds.has(id))
        .sort();
      return ids[0] ?? null;
    };
    const specLayers = [
      [discoverySpec, discoverySpec?.use_cases],
      [behavior, behavior?.behaviors],
      [operationalTask, operationalTask?.op_tasks],
    ];
    for (const [spec, layerItems] of specLayers) {
      const refs = spec?.cross_links?.to_analysis_artifacts;
      if (!Array.isArray(refs) || refs.length === 0) continue;
      const anchor = anchorOf(layerItems);
      if (!anchor) continue;
      for (const raw of refs) {
        const base = String(raw).split(/[\\/]/).pop();
        const kind = ANALYSIS_BASENAME_TO_KIND[base];
        if (!kind || !analysisLoaded.has(kind)) continue; // dangling guard
        const src = `analysis-${kind}`;
        const key = `${src} ${anchor}`;
        if (xrefKeys.has(key)) continue; // dedup (Layer 1~3 / 자기 중복)
        xrefKeys.add(key);
        edges.push(makeEdge(src, anchor, 'cross_reference'));
      }
    }
  }

  // --- informs (soft, aspect → chain) ---
  // aspect 산출물이 어떤 chain 노드에 권고를 거는지의 명시적 schema 필드가 아직 없음.
  // P1 1차 cut: aspect.meta.related_chain_ids[] 가 있으면 사용, 없으면 emit 안 함.
  // P2 이후: aspect schema 에 명시 필드 신설 시 본 분기 갱신.
  for (const subkind of ASPECT_SUBKINDS) {
    const data = aspect[subkind];
    if (!data) continue;
    for (const target of data.meta?.related_chain_ids ?? []) {
      if (!nodeIds.has(target)) continue;
      edges.push(makeEdge(`aspect-${subkind}`, target, 'informs'));
    }
  }

  // --- state carry-over (previousGraph 기반) ---
  // propose / deprecated 는 외부 정책이 부여한 상태이므로 보존.
  // drift / active 는 매 합성마다 'active' 로 reset (drift 는 SessionStart hook 이 재부여).
  if (previousGraph?.nodes) {
    const prevById = new Map(previousGraph.nodes.map(n => [n.id, n]));
    for (const n of nodes) {
      const prev = prevById.get(n.id);
      if (!prev) continue;
      if (prev.state === 'propose' || prev.state === 'deprecated') {
        n.state = prev.state;
        if (prev.drift_reason) n.drift_reason = prev.drift_reason;
      }
    }
    // 이전 그래프에 있었으나 이번 입력에 없는 노드 = 삭제 후보. deprecated 로 보존(N step purge 는 외부 정책).
    for (const prev of previousGraph.nodes) {
      if (nodeIds.has(prev.id)) continue;
      if (prev.state === 'deprecated') {
        // 이미 deprecated 였다면 그대로 보존 (purge 외부 결정)
        pushNode({ ...prev });
      } else {
        pushNode({ ...prev, state: 'deprecated', drift_reason: 'source removed' });
      }
    }
  }

  // --- ★ v11.0.0 groups dangling prune ---
  // groups (조직 포함) 엣지는 leaf 예외가 아니므로 양 끝 노드가 모두 존재할 때만 보존
  // (cross_reference/informs 와 동일 정책 / dangling 시 graph-integrity unknown_edge fail 회피).
  // conforms_to 는 leaf(contract) target 이므로 prune 제외 (implements 와 동형 / integrity 예외).
  for (let i = edges.length - 1; i >= 0; i--) {
    const e = edges[i];
    if (e.edge_type !== 'groups') continue;
    if (!nodeIds.has(e.source) || !nodeIds.has(e.target)) edges.splice(i, 1);
  }

  // --- ★ v11.x (F-DF-ANCHOR-002) analysis evidence → code_pointers derive (backstop 直前) ---
  // 실 src 앵커 surface → A2 content-drift 가 production 코드 변경 탐지. 추출0/미검증 경로 → 아래 backstop na.
  deriveAnalysisCodePointers(nodes, analysis, { existsFn: effectiveExistsFn });

  // --- ★ v11.x (F-DOGFOOD-009) 의도 노드 code_pointers_na 기본 backstop ---
  // carry-over (deprecated/propose 재추가) + IMPL/TC inline pointer 부여 + analysis derive 이후 시점. active 노드만 정규화.
  defaultNaForIntentNodes(nodes);

  // --- commit_hash / scope_id 스탬프 ---
  for (const n of nodes) {
    if (commitHash && !n.commit_hash) n.commit_hash = commitHash;
    if (scopeId && !n.scope_id) n.scope_id = scopeId;
    // ★ A2 content-drift baseline (DEC-2026-06-01 dogfood F-DF-A2-001) — strict_path pointer 에
    //   commit_hash 스탬프 → code-pointer-validator A2 가 `git diff <hash> HEAD -- path` baseline 확보.
    //   uniform synth-time HEAD frame (SLSA provenance 동형 / 공식 docs 검증). 없을 때만 = 상류 :214
    //   impl.commit_hash 보존. strict_path 만 (glob/ast_symbol/doc_link 제외 = git diff -- path 무의미 → false-drift 회피).
    if (commitHash && Array.isArray(n.code_pointers)) {
      for (const ptr of n.code_pointers) {
        if (ptr.anchor_type === 'strict_path' && !ptr.commit_hash) ptr.commit_hash = commitHash;
      }
    }
  }
  for (const e of edges) {
    if (commitHash && !e.commit_hash) e.commit_hash = commitHash;
  }

  // --- 통계 ---
  const stats = {
    node_count: nodes.length,
    edge_count: edges.length,
    by_kind: {
      chain: nodes.filter(n => n.artifact_kind === 'chain').length,
      plan: nodes.filter(n => n.artifact_kind === 'plan').length,
      analysis: nodes.filter(n => n.artifact_kind === 'analysis').length,
      aspect: nodes.filter(n => n.artifact_kind === 'aspect').length,
    },
    by_state: Object.fromEntries(
      NODE_STATES.map(s => [s, nodes.filter(n => n.state === s).length])
    ),
    by_edge_type: ALL_EDGE_TYPES
      .reduce((acc, t) => {
        acc[t] = edges.filter(e => e.edge_type === t).length;
        return acc;
      }, {}),
  };

  // --- header (★ S5 정합) ---
  const derivedFromList = [];
  for (const key of ['discovery', 'planning', 'behavior', 'acceptance', 'taskPlan', 'operationalTask', 'testSpec', 'implSpec']) {
    if (sourcePaths[key]) derivedFromList.push(sourcePaths[key]);
  }
  for (const p of Object.values(sourcePaths.analysis ?? {})) if (p) derivedFromList.push(p);
  for (const p of Object.values(sourcePaths.aspect ?? {})) if (p) derivedFromList.push(p);

  const graph = {
    derived_from: derivedFromList,
    do_not_edit_manually: true,
    schema: {
      node: 'artifact-graph-node.schema.json',
      edge: 'artifact-graph-edge.schema.json',
    },
    synthesized_at: new Date().toISOString(),
    nodes,
    edges,
    stats,
  };
  if (scopeId) graph.scope_id = scopeId;
  if (commitHash) graph.commit_hash = commitHash;

  return graph;
}

// ============================================================================
// 입력 로드 헬퍼 (matrix-builder loadJson 정합)
// ============================================================================

export function loadJson(path) {
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, 'utf-8'));
  } catch (e) {
    throw new Error(`JSON parse error at ${path}: ${e.message}`);
  }
}

// 카탈로그 export — graph-integrity-validator / dep-graph-navigator 에서 재사용
// ★ v11.0.0 — chain 6 (UC/BHV/AC/TASK/TC/IMPL) + analysis 15 + aspect 4 = 25 deliverable.
//   plan 조직 노드 (EPIC/STORY/OP) = task-plan 내부 entity / deliverable total 외 (별도 노출).
export const TIER1_CATALOG = Object.freeze({
  chain: CHAIN_SUBKINDS,
  plan: PLAN_SUBKINDS,
  analysis: ANALYSIS_SUBKINDS,
  aspect: ASPECT_SUBKINDS,
  total: CHAIN_SUBKINDS.length + ANALYSIS_SUBKINDS.length + ASPECT_SUBKINDS.length, // = 25
});
