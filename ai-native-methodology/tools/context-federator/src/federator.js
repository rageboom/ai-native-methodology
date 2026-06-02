// context-federator core
// ★ dep-graph(의미) × codegraph(코드 구조) federation → .aimd/output/context-cache.json (reference-lens).
//   사용자 P0: prompt → dep-graph 검색 → codegraph 연동 → 통합 컨텍스트 회수·재사용 ("다시 작업 안 하기").
//   DEC-2026-06-02-context-federation (Phase 1 = read-only federate 코어 / gate 무개입).
//
//   ★ ★ trust 모델 (DEC-2026-05-28 §4.2 / DEC-2026-06-01 §2 trust 선):
//     codegraph = 휴리스틱 신호 → reference-lens / finding-only / 어떤 결정론 gate 에도 inject ❌.
//     context-cache.json = meta.trust_note 필수 + non-gating (release-readiness 미배선) + 소비 전용.
//
//   ★ axis 분리 (feedback_chain_driver_deterministic_axis / STRONG-STOP):
//     본 도구 = 결정론 only. navigate(BFS/centrality) + codegraph(static index) 의 결정론 출력을 join 만 한다.
//     자연어 의미매핑(임베딩)은 propose-only carry — 본 Phase 미포함 (결정론 토큰/path 매칭은 Phase 3).
//
//   ★ no-simulation (feedback_no_static_tool_simulation): codegraph 부재 = codegraph.available=false 정직 표기.
//     LLM 추론으로 코드 구조를 날조 ❌. 환경 부재 = graceful (dep 반쪽은 그대로 emit).
//
//   ★ 도구→도구 import 회피 (workspace 컨벤션 = _shared 만 공유):
//     navigate/codegraph 는 CLI black-box 로 shell-out (makeNavigateRunner/makeCodegraphAdapter / cli.js 주입).
//     core(federate)는 runner 주입 = pure & testable (gitRunner 주입 패턴 동형 / code-pointer-validator).

import { resolve, relative, isAbsolute, basename, extname, join } from 'node:path';
import { execSync, execFileSync } from 'node:child_process';
import { existsSync, statSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { createHash } from 'node:crypto';

const require = createRequire(import.meta.url);
// node:sqlite = Node 22.5+ (실험). 부재(구 Node) = null → 호출부 graceful fallback.
function loadSqlite() { try { return require('node:sqlite'); } catch { return null; } }

const TRAVERSABLE_STATES = new Set(['active', 'drift']);
const TIER1_KINDS = new Set(['chain', 'analysis', 'aspect']);
// 코드 blast-radius 비대상 노드 종류 (file/import 노드는 심볼 아님).
const DROP_NODE_KINDS = new Set(['file', 'import']);

// origin 후보 = Tier-1(chain/analysis/aspect) + state active|drift + code_pointers ≥ 1.
//   (propose/deprecated 제외 = navigate/centrality 의 nonTraversableStates 와 동형 / code_pointers_na 는 join 대상 아님)
export function isAnchoredOrigin(node) {
  return !!node && typeof node.id === 'string'
    && TIER1_KINDS.has(node.artifact_kind)
    && TRAVERSABLE_STATES.has(node.state)
    && Array.isArray(node.code_pointers) && node.code_pointers.length > 0;
}

export function selectOriginNodes(graph, originIds = null) {
  const nodes = Array.isArray(graph?.nodes) ? graph.nodes : [];
  let picked = nodes.filter(isAnchoredOrigin);
  if (Array.isArray(originIds) && originIds.length) {
    const want = new Set(originIds);
    picked = picked.filter(n => want.has(n.id));
  }
  return picked;
}

// ── Phase 3 — prompt → dep-graph 노드 결정론 매칭 (자연어 진입) ────────────────
//   ★ 결정론 only: prompt 안에 등장하는 식별자(node id / code_pointer 파일·심볼)를 substring 매칭해 후보 랭킹.
//     의미·동의어·임베딩(예: "로그인"↔"login") 매칭 ❌ = propose-only carry (결정론 vs LLM axis 분리 / STRONG-STOP).
//   ★ 한글 산문만 있고 식별자 0 → 빈 결과 (정직 / 호출부가 --origin 안내 또는 임베딩 carry).
//   반환: [{ node_id, score, matched:[reasons] }] score desc, 동점 id asc (결정성).
export function resolvePromptToNodes(prompt, graph, { topN = 5, originIds = null } = {}) {
  const p = String(prompt ?? '').toLowerCase();
  if (!p.trim()) return [];
  const candidates = selectOriginNodes(graph, originIds);
  const scored = [];
  for (const node of candidates) {
    let score = 0;
    const matched = [];
    const idLc = node.id.toLowerCase();
    if (p.includes(idLc)) {
      score += 5; matched.push(`id:${node.id}`);
    } else {
      for (const part of idLc.split(/[-_./]/).filter(x => x.length >= 3)) {
        if (p.includes(part)) { score += 1; matched.push(`id-part:${part}`); }
      }
    }
    for (const cp of (node.code_pointers ?? [])) {
      if (cp?.symbol) {
        const s = cp.symbol.toLowerCase();
        if (s.length >= 3 && p.includes(s)) { score += 3; matched.push(`symbol:${cp.symbol}`); }
      }
      if (cp?.path) {
        const base = basename(cp.path).toLowerCase();
        const stem = basename(cp.path, extname(cp.path)).toLowerCase();
        if (base.length >= 3 && p.includes(base)) { score += 2; matched.push(`file:${base}`); }
        else if (stem.length >= 3 && p.includes(stem)) { score += 2; matched.push(`file:${stem}`); }
      }
    }
    if (score > 0) scored.push({ node_id: node.id, score, matched });
  }
  scored.sort((a, b) => b.score - a.score || a.node_id.localeCompare(b.node_id));
  return scored.slice(0, topN);
}

// ── Phase 1.5 — legacy 데이터 반쪽 (분석 산출물 sql-inventory + db-schema) ───────
//   ★ codegraph 가 못 보는 legacy SQL/테이블 층을 분석 산출물에서 채운다.
//     sql-inventory item = { sql_id, mapper_xml, statement_type, dependent_tables[], uc_link, business_meaning }.
//     uc_link → 그래프 UC 노드 직접 조인(code_pointers 0 인 legacy 도 연결) / mapper_xml → code_pointer 파일 조인.
//   ★ trust: 분석 산출물 = LLM 추출 → data_refs 도 reference-lens / non-gating (codegraph 와 동일).
//   ★ no-simulation: 산출물 부재 = available:false (빈 인덱스 / data_refs 없음).
function defaultReadJson(p) {
  try { return JSON.parse(readFileSync(p, 'utf-8')); } catch { return null; }
}
function sourcePathOf(graph, nodeId, repoRoot, existsFn = existsSync) {
  const n = (graph?.nodes ?? []).find(x => x?.id === nodeId);
  if (!n?.source_path) return null;
  const full = isAbsolute(n.source_path) ? n.source_path : resolve(repoRoot, n.source_path);
  return existsFn(full) ? full : null;
}
function pushMap(map, key, val) {
  if (key == null) return;
  if (!map.has(key)) map.set(key, []);
  map.get(key).push(val);
}

// 데이터 소스 로딩 (CLI 가 호출 = fs read / readJson 주입 testable). 자동 발견 = analysis 노드 source_path.
export function loadLegacyDataSource(graph, { repoRoot = process.cwd(), sqlInventoryPath = null, dbSchemaPath = null, readJson = defaultReadJson, existsFn = existsSync } = {}) {
  const sqlPath = sqlInventoryPath ?? sourcePathOf(graph, 'analysis-sql-inventory', repoRoot, existsFn);
  const dbPath = dbSchemaPath ?? sourcePathOf(graph, 'analysis-db-schema', repoRoot, existsFn);
  const byUc = new Map();
  const byMapper = new Map();
  const tableByName = new Map();
  let sqlLoaded = false, dbLoaded = false;

  const inv = sqlPath ? readJson(sqlPath) : null;
  if (inv && Array.isArray(inv.inventory)) {
    sqlLoaded = true;
    for (const e of inv.inventory) {
      if (e?.uc_link) pushMap(byUc, e.uc_link, e);
      if (e?.mapper_xml) pushMap(byMapper, basename(e.mapper_xml), e);
    }
  }
  const db = dbPath ? readJson(dbPath) : null;
  if (db && Array.isArray(db.tables)) {
    dbLoaded = true;
    for (const t of db.tables) if (t?.name) tableByName.set(t.name, t);
  }
  return {
    available: sqlLoaded,
    byUc, byMapper, tableByName,
    sql_inventory_path: sqlPath, db_schema_path: dbPath,
    sql_loaded: sqlLoaded, db_loaded: dbLoaded,
  };
}

// 노드 → data_refs (sql-inventory entries / uc_link + mapper_xml 조인 / dependent_tables db-schema 컬럼 보강).
function buildDataRefs(node, dataSource) {
  if (!dataSource || !dataSource.available) return [];
  const refs = [];
  const seen = new Set();
  const add = (e) => {
    const key = `${e?.mapper_xml ?? ''}#${e?.sql_id ?? ''}`;
    if (seen.has(key)) return;
    seen.add(key);
    refs.push({
      sql_id: e?.sql_id ?? null,
      statement_type: e?.statement_type ?? null,
      mapper_xml: e?.mapper_xml ?? null,
      business_meaning: e?.business_meaning ?? null,
      dependent_tables: (e?.dependent_tables ?? []).map(t => ({
        name: t,
        columns: (dataSource.tableByName.get(t)?.columns ?? []).map(c => ({ name: c?.name ?? null, type: c?.type ?? null })),
      })),
      source: 'sql-inventory',
    });
  };
  for (const e of (dataSource.byUc.get(node.id) ?? [])) add(e);
  for (const cp of (node.code_pointers ?? [])) {
    if (cp?.path) for (const e of (dataSource.byMapper.get(basename(cp.path)) ?? [])) add(e);
  }
  return refs;
}

function absFile(base, p) {
  return isAbsolute(p) ? resolve(p) : resolve(base, p);
}

// codegraph filePath(인덱스 프로젝트 상대) 가 anchor.path(repoRoot 상대) 와 동일 파일을 가리키나.
function sameFile(cgFilePath, anchorPath, { repoRoot, codegraphProjectDir }) {
  if (!cgFilePath || !anchorPath) return false;
  return absFile(codegraphProjectDir, cgFilePath) === absFile(repoRoot, anchorPath);
}

function mapSymbolNode(n) {
  return {
    name: n?.name ?? null,
    kind: n?.kind ?? null,
    file_path: n?.filePath ?? null,
    start_line: typeof n?.startLine === 'number' ? n.startLine : null,
  };
}

// 심볼 1개에 codegraph callers/impact 를 부착 (read 실패 = 생략 / no-sim: 날조 ❌).
function attachCallersImpact(sym, symbolName, { codegraph, withCallers }) {
  if (withCallers) {
    try {
      const c = codegraph.callers(symbolName);
      sym.callers = (c?.callers ?? []).map(mapSymbolNode);
    } catch { /* codegraph read 실패 → callers 생략 */ }
  }
  try {
    const im = codegraph.impact(symbolName);
    if (im && typeof im.nodeCount === 'number') {
      sym.impact = { node_count: im.nodeCount, affected: (im.affected ?? []).map(mapSymbolNode) };
    }
  } catch { /* impact 생략 */ }
}

// anchor 1개 → codegraph 코드 ref.
//   ast_symbol 앵커 = 심볼 직행(callers/impact). strict_path = 파일명 stem query → 같은 파일 심볼만 필터.
//   codegraph 부재 또는 미해결(legacy SQL 층 등) = unresolved:true 정직 표기 (반쪽 비는 것을 숨기지 않음).
function codeRefForAnchor(anchor, ctx) {
  const { codegraph, repoRoot, codegraphProjectDir, withCallers, maxSymbols } = ctx;
  const ref = { anchor_path: anchor?.path ?? null, anchor_type: anchor?.anchor_type ?? null, symbols: [], unresolved: false, note: null };

  if (!codegraph.available) {
    ref.unresolved = true;
    ref.note = `codegraph unavailable (${codegraph.reason ?? 'no adapter'}) — 코드 반쪽 비어있음 (no-simulation 정직 표기)`;
    return ref;
  }

  // ast_symbol 앵커 = 심볼 직행
  if (anchor.symbol) {
    const sym = { name: anchor.symbol, kind: 'ast_symbol', file_path: anchor.path ?? null, start_line: null };
    attachCallersImpact(sym, anchor.symbol, { codegraph, withCallers });
    ref.symbols.push(sym);
    return ref;
  }

  // strict_path 파일 앵커 = 파일의 심볼 나열.
  //   1차(신뢰): codegraph 인덱스 DB 직접 read (symbolsInFile) — 파일→심볼 결정론 나열 (CLI 미지원).
  //   2차(best-effort): 파일명 stem query → sameFile 필터 (DB 미가용/구 Node 시 / filenames=ASCII → 한글 0매칭 회피).
  //   둘 다 0 = unresolved 정직 표기 (legacy SQL 층 / 미인덱싱 / 다른 언어 = 코드 반쪽 비어있음).
  if (anchor.anchor_type === 'strict_path' && anchor.path) {
    const cgRel = relative(codegraphProjectDir, absFile(repoRoot, anchor.path));
    let nodes = null;
    if (typeof codegraph.symbolsInFile === 'function') {
      try { nodes = codegraph.symbolsInFile(cgRel); } catch { nodes = null; }
    }
    if (nodes === null) {
      const stem = basename(anchor.path, extname(anchor.path));
      try {
        nodes = (codegraph.query(stem) ?? [])
          .map(h => h?.node ?? h)
          .filter(n => sameFile(n?.filePath, anchor.path, { repoRoot, codegraphProjectDir }));
      } catch { nodes = []; }
    }
    const real = (nodes ?? []).filter(n => n && n.name && !DROP_NODE_KINDS.has(n.kind)).slice(0, maxSymbols);
    for (const n of real) {
      const sym = mapSymbolNode(n);
      if (withCallers && sym.name) attachCallersImpact(sym, sym.name, { codegraph, withCallers });
      ref.symbols.push(sym);
    }
    if (ref.symbols.length === 0) {
      ref.unresolved = true;
      ref.note = 'codegraph 가 이 파일의 심볼을 해석하지 못함 (legacy SQL 층 / 미인덱싱 / 다른 언어) — 코드 반쪽 비어있음 (no-simulation 정직 표기)';
    }
    return ref;
  }

  ref.unresolved = true;
  ref.note = `anchor_type '${anchor?.anchor_type}' 는 Phase 1 join 비대상 (glob/doc_link 등)`;
  return ref;
}

// ── Phase 2 델타 헬퍼 ─────────────────────────────────────────────────────────
function sha256(s) { return createHash('sha256').update(String(s)).digest('hex'); }
const defaultStampFn = (o) => sha256(JSON.stringify(o));

// 노드의 코드-side 입력 지문 (state + code_pointers 정규화). 바뀌면 code_refs 재계산 필요.
function anchorStampOf(node, stampFn) {
  const anchors = (Array.isArray(node.code_pointers) ? node.code_pointers : [])
    .map(a => ({ path: a?.path ?? null, anchor_type: a?.anchor_type ?? null, symbol: a?.symbol ?? null, commit_hash: a?.commit_hash ?? null }))
    .sort((x, y) => String(x.path).localeCompare(String(y.path)));
  return stampFn({ state: node.state ?? null, anchors });
}

function buildDepPart(nav) {
  const byGrade = nav?.impact?.by_grade ?? { MUST: [], SHOULD: [], FYI: [] };
  return {
    dep_impact: { must: byGrade.MUST ?? [], should: byGrade.SHOULD ?? [], fyi: byGrade.FYI ?? [] },
    top_impact_roots: Array.isArray(nav?.top_impact_roots) ? nav.top_impact_roots : [],
  };
}

function buildCodePart(node, ctx) {
  const anchors = Array.isArray(node.code_pointers) ? node.code_pointers : [];
  return {
    code_anchors: anchors.map(a => ({
      path: a?.path ?? null, anchor_type: a?.anchor_type ?? null, symbol: a?.symbol ?? null, commit_hash: a?.commit_hash ?? null,
    })),
    code_refs: anchors.map(a => codeRefForAnchor(a, ctx)),
  };
}

// 캐시 신선도 — 2축. graph_stamp 변경 = dep 재계산 / codegraph index 변경 = code 재계산.
//   prevCache 부재 = 전부 stale. (hook/CLI 가 "재federate 필요?" 판단에 사용)
export function cacheStaleness(prevCache, { graphStamp = null, codegraphIndexedAt = null } = {}) {
  if (!prevCache || !prevCache.meta) return { stale: true, dep_stale: true, code_stale: true, reasons: ['no prior cache'] };
  const dep_stale = prevCache.meta.graph_stamp !== graphStamp;
  const code_stale = prevCache.meta.codegraph_indexed_at !== codegraphIndexedAt;
  const reasons = [];
  if (dep_stale) reasons.push(`graph 변경 (dep 재계산 / ${String(prevCache.meta.graph_stamp).slice(0, 8)} → ${String(graphStamp).slice(0, 8)})`);
  if (code_stale) reasons.push(`codegraph index 변경 (code 재계산 / ${prevCache.meta.codegraph_indexed_at} → ${codegraphIndexedAt})`);
  return { stale: dep_stale || code_stale, dep_stale, code_stale, reasons };
}

// ── core: federate ──────────────────────────────────────────────────────────
//   graph + navigate(주입) + codegraph(주입) → context-cache 객체. pure (fs/process 직접 접근 ❌).
//   ★ Phase 2 델타: prevCache 주입 시 2축 carry — graph 무변경 → dep verbatim carry(navigate 미호출) /
//     codegraph index 무변경 + anchor_stamp 동일 → code verbatim carry(codegraph 미호출 = 비싼 부분 절감).
//     "다시 작업 안 하기" = 바뀐 노드만 재계산. (baseline+delta 운영모델 동형)
export function federate(graph, opts = {}) {
  const {
    repoRoot = process.cwd(),
    codegraphProjectDir = repoRoot,
    navigate,                  // (originId) => { node, impact:{by_grade}, top_impact_roots }
    codegraph = { available: false, version: null, reason: 'no codegraph adapter injected' },
    originIds = null,
    withCallers = true,
    maxSymbols = 12,
    graphPath = null,
    now = () => new Date().toISOString(),
    prevCache = null,
    graphStamp = null,
    codegraphIndexedAt = null,
    stampFn = defaultStampFn,
    dataSource = null,
  } = opts;

  if (typeof navigate !== 'function') {
    throw new Error('federate: navigate runner 가 필요합니다 (opts.navigate / makeNavigateRunner)');
  }

  // origin = code-anchored(code_pointers) ∪ data-anchored(sql-inventory uc_link / Phase 1.5).
  //   → code_pointers 0 인 legacy 노드도 sql-inventory 로 federate 대상 편입.
  const picked = new Map();
  for (const n of selectOriginNodes(graph, originIds)) picked.set(n.id, n);
  let dataAnchoredCount = 0;
  if (dataSource && dataSource.available) {
    const want = (Array.isArray(originIds) && originIds.length) ? new Set(originIds) : null;
    for (const n of (graph?.nodes ?? [])) {
      if (!n || picked.has(n.id) || !TRAVERSABLE_STATES.has(n.state)) continue;
      if (!dataSource.byUc.has(n.id)) continue;
      if (want && !want.has(n.id)) continue;
      picked.set(n.id, n);
      dataAnchoredCount++;
    }
  }
  const origins = [...picked.values()];
  const ctx = { codegraph, repoRoot, codegraphProjectDir, withCallers, maxSymbols };
  const prevPacks = new Map((prevCache?.packs ?? []).map(p => [p.node_id, p]));
  // 2축 무효화: prevCache 없거나 stamp 불일치 = 변경으로 간주 (보수적).
  const graphChanged = !prevCache || prevCache.meta?.graph_stamp == null || prevCache.meta.graph_stamp !== graphStamp;
  const codegraphChanged = !prevCache || prevCache.meta?.codegraph_indexed_at !== codegraphIndexedAt;

  const packs = [];
  let symbolsResolved = 0, anchorsUnresolved = 0;
  let depRecomputed = 0, codeRecomputed = 0, carriedPacks = 0, dataRefsCount = 0;

  for (const node of origins) {
    const anchorStamp = anchorStampOf(node, stampFn);
    const prev = prevPacks.get(node.id);
    const carryDep = !!prev && !graphChanged;
    const carryCode = !!prev && !codegraphChanged && prev.anchor_stamp === anchorStamp;

    let depPart;
    if (carryDep) { depPart = { dep_impact: prev.dep_impact, top_impact_roots: prev.top_impact_roots }; }
    else { depPart = buildDepPart(navigate(node.id) ?? {}); depRecomputed++; }

    let codePart;
    if (carryCode) { codePart = { code_anchors: prev.code_anchors, code_refs: prev.code_refs }; }
    else { codePart = buildCodePart(node, ctx); codeRecomputed++; }

    // ★ Phase 1.5 data_refs = sql-inventory/db-schema (legacy 데이터 반쪽). 항상 fresh (cheap in-memory lookup / IO 는 loadLegacyDataSource 가 사전 처리).
    const dataRefs = buildDataRefs(node, dataSource);
    dataRefsCount += dataRefs.length;

    if (carryDep && carryCode) carriedPacks++;
    for (const r of codePart.code_refs) { symbolsResolved += r.symbols.length; if (r.unresolved) anchorsUnresolved++; }

    packs.push({
      node_id: node.id,
      artifact_kind: node.artifact_kind,
      artifact_subkind: node.artifact_subkind ?? null,
      state: node.state,
      ...depPart,
      ...codePart,
      data_refs: dataRefs,
      anchor_stamp: anchorStamp,
    });
  }

  return {
    meta: {
      schema: 'context-cache.schema.json',
      generated_by: 'context-federator',
      do_not_edit_manually: true,
      trust_note: 'reference-lens / NOT gate-injected — codegraph 휴리스틱 신호 = finding-only / 어떤 결정론 gate 에도 inject ❌ (DEC-2026-06-02 / DEC-2026-05-28 §4.2)',
      derived_from: graphPath ? [graphPath] : [],
      synthesized_at: now(),
      graph_stamp: graphStamp ?? null,
      codegraph_indexed_at: codegraphIndexedAt ?? null,
    },
    target: {
      graph_path: graphPath,
      repo_root: repoRoot,
      codegraph_project_dir: codegraphProjectDir,
      sql_inventory_path: dataSource?.sql_inventory_path ?? null,
      db_schema_path: dataSource?.db_schema_path ?? null,
    },
    codegraph: {
      available: !!codegraph.available,
      version: codegraph.version ?? null,
      reason: codegraph.reason ?? null,
    },
    packs,
    stats: {
      pack_count: packs.length,
      anchored_nodes: origins.length,
      symbols_resolved: symbolsResolved,
      anchors_unresolved: anchorsUnresolved,
      codegraph_available: !!codegraph.available,
      dep_recomputed: depRecomputed,
      code_recomputed: codeRecomputed,
      carried_packs: carriedPacks,
      data_anchored_nodes: dataAnchoredCount,
      data_refs_count: dataRefsCount,
      data_source_available: !!(dataSource && dataSource.available),
    },
  };
}

// ── default runners (CLI 가 주입 / 도구→도구 import 회피 = CLI black-box shell-out) ─────────────

// navigate runner = chain-driver navigate --json 를 child process 로 호출 (결정론 black-box).
export function makeNavigateRunner({ graphPath, chainDriverCli, repoRoot = process.cwd(), timeout = 30_000 }) {
  return (originId) => {
    const out = execFileSync('node', [chainDriverCli, 'navigate', '--graph', graphPath, '--origin', originId, '--json'], {
      cwd: repoRoot, encoding: 'utf-8', timeout, maxBuffer: 32 * 1024 * 1024, windowsHide: true,
    });
    return JSON.parse(out.trim());
  };
}

// codegraph read 어댑터 (self-contained / 도구→도구 import 회피).
//   ★ codegraph-runner 의 q/cgExec 패턴 동형 (cross-platform shell 경유 / quoting). WRITE/index 경로(7-field evidence)는
//     codegraph-runner 단독 소유 — 본 어댑터는 READ(query/callers/impact)만.
//   ★ no-simulation: --version 부재 = { available:false, reason } 정직 반환 (throw 아님 / federate 가 graceful).
function cgQuote(p) { return `"${String(p).replace(/"/g, '')}"`; }
function cgReadJson(exec, argString, timeout = 30_000) {
  const out = execSync(`${exec} ${argString}`, { encoding: 'utf-8', timeout, maxBuffer: 64 * 1024 * 1024 });
  const t = out.trim();
  // --json 출력은 첫 '[' 또는 '{' 부터 파싱 (혹시 모를 log prefix 방어)
  const idxs = ['[', '{'].map(c => t.indexOf(c)).filter(i => i >= 0);
  const start = idxs.length ? Math.min(...idxs) : -1;
  return JSON.parse(start >= 0 ? t.slice(start) : (t || 'null'));
}
export function makeCodegraphAdapter({ codegraphProjectDir, exec = 'codegraph' } = {}) {
  let version = null;
  try {
    version = execSync(`${exec} --version`, { encoding: 'utf-8', timeout: 10_000 }).trim().split('\n')[0];
  } catch (err) {
    return { available: false, version: null, reason: `codegraph 환경 부재: ${err?.message ?? String(err)}` };
  }
  const P = cgQuote(codegraphProjectDir);
  const dbPath = join(codegraphProjectDir, '.codegraph', 'codegraph.db');
  return {
    available: true,
    version,
    reason: null,
    query: (s) => cgReadJson(exec, `query ${cgQuote(s)} -p ${P} --json`),
    callers: (s) => cgReadJson(exec, `callers ${cgQuote(s)} -p ${P} --json`),
    impact: (s) => cgReadJson(exec, `impact ${cgQuote(s)} -p ${P} --json`),
    // ★ 파일→심볼 = codegraph 인덱스 DB(.codegraph/codegraph.db) 직접 read (CLI 미지원 / reference-lens).
    //   node:sqlite 부재·DB 부재·스키마 불일치 = null (graceful → 호출부 stem-query fallback).
    //   ★ codegraph 내부 schema 결합 = carry (codegraph 버전 변경 시 재검증 / DEC-2026-06-02 §5).
    symbolsInFile: (cgRelPath) => {
      const sqlite = loadSqlite();
      if (!sqlite || !existsSync(dbPath)) return null;
      try {
        const db = new sqlite.DatabaseSync(dbPath, { readOnly: true });
        const rows = db.prepare(
          'SELECT name, kind, file_path AS filePath, start_line AS startLine FROM nodes WHERE file_path = ?',
        ).all(cgRelPath);
        db.close();
        return rows.map(r => ({ name: r.name, kind: r.kind, filePath: r.filePath, startLine: r.startLine }));
      } catch { return null; }
    },
    // ★ Phase 2 — codegraph 인덱스 시점 (DB mtime). 재인덱싱 시 변경 → code-side 무효화 축.
    indexedAt: () => { try { return existsSync(dbPath) ? String(statSync(dbPath).mtimeMs) : null; } catch { return null; } },
  };
}
