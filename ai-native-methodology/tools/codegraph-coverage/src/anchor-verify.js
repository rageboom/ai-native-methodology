// anchor-verify.js — ★ codegraph wiring STEP 4 (DEC-2026-06-03-codegraph-deliverable-wiring §5 STEP 4 / 순수 / I/O 없음).
//   "함수단위 추적성" 의 정직한 minimal core = STEP 1~3 coverage-hole 의 **역방향 set-diff**:
//     산출물 ast_symbol 앵커(provenance) ∖ codegraph 심볼 인덱스 = **stale/dangling anchor** ("산출물 앵커有 / 코드 심볼無").
//   ★ negative-space (실코드): code-pointer-validator 는 ast_symbol 의 path 존재만 보고 **symbol 실재는 검증 안 함**
//     (validator.js: "symbol 검증은 AST parser 외부 / warn-only"). codegraph = AST 심볼 인덱스 보유 → 그 공백을 reference-lens 로 채움.
//   ★ ★ trust 경계 (불변 / DEC §2 / check37):
//     · 출력 = reference-lens / 비차단(severity low|medium ceiling) / 결정적 gate inject ❌ / 최종 evidence = 실코드 grep.
//     · 안전 분기 = stale-anchor (file 이 codegraph 에 인덱싱됐는데 symbol 부재 = 진짜 dangling) → finding.
//     · 정직 분기 = informational (앵커 file 이 codegraph 미인덱스 = codegraph 사각: iBATIS2 sql/xml·동적·미지원 언어·freshness stale).
//       부재 ≠ 거짓 → severity 필드 부재 / finding 채널 진입 절대 ❌ (STEP 3 informational_notes 패턴 동형 / Senior).
//   ★ ast_symbol 앵커 0 = unverified note (method-axis 'impl-spec 부재=unverified' 동형 / false-health 회피).
//   ★ (α) "파일앵커→함수 제안"은 federator symbolsInFile 소관 = 본 모듈 범위 밖 (Senior jurisdiction / 중복 회피).

import { normalizeSymbol, normalizeFile, fileMatches } from './normalize.js';
import { SEVERITY_CEILING, pinSeverity } from './render.js';

// ast_symbol 앵커가 가리킬 수 있는 codegraph 심볼 kind (공식 NODE_KINDS 부분집합 / 실 DB probe 확인: Java class/interface/method, TS class/method/function/type_alias).
export const SYMBOL_KINDS = Object.freeze(['class', 'interface', 'function', 'method', 'enum', 'type_alias']);

// 심볼 노드 → 매칭 인덱스 2종.
//   byQn2 = normalizeSymbol(qualified_name) (끝 2 세그먼트 = "Class.method") — 2-세그 앵커("SignupService.checkDup") 매칭.
//   byName = node.name (bare) — 1-세그 앵커("SignupService" 클래스명) 매칭.
//   ★ 2-세그 앵커는 byQn2 정확매칭만 (bare 메서드명 fallback ❌ — "method" 가 아무 메서드나 매칭하는 false-live 회피).
export function buildSymbolIndex(symbolNodesByKind = {}) {
  const byQn2 = new Set();
  const byName = new Set();
  let nodeCount = 0;
  const kinds = [];
  for (const kind of Object.keys(symbolNodesByKind)) {
    const nodes = symbolNodesByKind[kind] || [];
    if (nodes.length) kinds.push(kind);
    for (const n of nodes) {
      nodeCount++;
      const q = normalizeSymbol(n.qualified_name || '');
      if (q) byQn2.add(q);
      if (typeof n.name === 'string' && n.name) byName.add(n.name);
      // qn 부재(null) 시 name 의 정규화도 보강 (단일 세그 = name 과 동일).
      const qn = normalizeSymbol(n.name || '');
      if (qn) byQn2.add(qn);
    }
  }
  return { byQn2, byName, size: byQn2.size + byName.size, node_count: nodeCount, kinds: kinds.sort() };
}

// 앵커 symbol 이 codegraph 인덱스에 실재하는가. 결정론.
function anchorMatches(anchorSymbol, index) {
  if (typeof anchorSymbol !== 'string' || !anchorSymbol) return false;
  const segs = anchorSymbol.replace(/::/g, '.').replace(/#/g, '.').split('.').filter(Boolean);
  if (segs.length >= 2) {
    return index.byQn2.has(normalizeSymbol(anchorSymbol));
  }
  // 단일 세그먼트(클래스/함수명) — bare name 정확매칭.
  return index.byName.has(segs[0]);
}

// 앵커 file 이 codegraph 에 인덱싱됐는가 (suffix 매칭). 미인덱스 = codegraph 사각 (informational).
function fileIndexed(anchorPath, indexedFilesNorm) {
  if (!anchorPath) return false;
  return indexedFilesNorm.some((f) => fileMatches(f, anchorPath));
}

/**
 * 역방향 검증: 산출물 ast_symbol 앵커 ∖ codegraph 심볼 = stale-anchor.
 * @param {Object} args
 * @param {Array}  args.anchors          collectSymbolAnchors().anchors
 * @param {Object} args.symbolNodesByKind enumerateNodes(SYMBOL_KINDS).byKind
 * @param {string[]} args.indexedFiles    distinctFiles(db) (codegraph 인덱스 파일 — file-indexed 게이트)
 * @param {Object} [args.freshness]       checkIndexFreshness 결과 (stale 시 caveat)
 * @returns {Object} code-anchor-verify.schema.json anchor_verify 섹션 형태
 */
export function buildAnchorVerify({ anchors = [], symbolNodesByKind = {}, indexedFiles = [], freshness = null }) {
  const index = buildSymbolIndex(symbolNodesByKind);
  const indexedFilesNorm = (indexedFiles || []).map((f) => normalizeFile(f)).filter(Boolean);

  // ★ 앵커 0 = unverified (검증 대상 부재 / false-health 회피 — method-axis 게이트 동형).
  if (!anchors.length) {
    return {
      state: 'unverified',
      reason: 'ast_symbol 앵커 부재 — 산출물 code_pointers 가 전부 file-level(strict_path/glob)이라 함수단위 검증 대상 없음 (false-health 회피). codegraph 가 채울 stale-anchor 입력이 0.',
      indexed_kinds: index.kinds,
      symbol_index_size: index.size,
      total: 0, live: 0, stale: 0, informational: 0,
      live_anchors: [], stale_anchors: [], informational_notes: [],
    };
  }

  const live = [];
  const stale = [];
  const informational = [];
  for (const a of anchors) {
    if (anchorMatches(a.symbol, index)) {
      live.push({ symbol: a.symbol, artifact: a.artifact, file: a.anchor_path || null });
      continue;
    }
    // 미발견 — file-indexed 게이트로 stale vs informational 분기.
    if (fileIndexed(a.anchor_path, indexedFilesNorm)) {
      stale.push({ symbol: a.symbol, normalized: a.normalized, artifact: a.artifact, file: a.anchor_path || null });
    } else {
      informational.push({
        symbol: a.symbol, artifact: a.artifact, file: a.anchor_path || null,
        reason: a.anchor_path
          ? 'codegraph 미인덱스 file — codegraph 사각(iBATIS2 sql/xml·동적·미지원 언어·freshness stale 가능). 부재 ≠ stale.'
          : 'anchor path 부재 — file-indexed 게이트 적용 불가 → stale 단정 보류 (부재 ≠ stale).',
      });
    }
  }
  live.sort((x, y) => x.symbol.localeCompare(y.symbol));
  stale.sort((x, y) => x.symbol.localeCompare(y.symbol));
  informational.sort((x, y) => x.symbol.localeCompare(y.symbol));

  return {
    state: 'verified',
    indexed_kinds: index.kinds,
    symbol_index_size: index.size,
    total: anchors.length,
    live: live.length,
    stale: stale.length,
    informational: informational.length,
    ...(freshness?.available && freshness.stale ? { freshness_caveat: 'codegraph 인덱스 stale — 일부 stale-anchor 는 인덱싱 이후 추가/이동된 심볼일 수 있음. 재인덱싱 후 재확인 권고.' } : {}),
    live_anchors: live,
    stale_anchors: stale,
    informational_notes: informational,
  };
}

/**
 * stale-anchor → finding (reference-lens / 비차단 / 사람 검토 후 promote).
 *   ★ informational_notes 는 절대 순회 ❌ (codegraph 사각 = 부재≠거짓 / finding 채널 진입 차단 / Senior).
 * @returns {Array<{id,axis,severity,message,evidence,code_graph_ref}>}
 */
export function toAnchorFindings(verify, dbPath = null) {
  const findings = [];
  if (!verify || verify.state !== 'verified' || !Array.isArray(verify.stale_anchors)) return findings;
  let seq = 1;
  const next = () => `F-CGANCH-${String(seq++).padStart(3, '0')}`;
  for (const s of verify.stale_anchors) {
    findings.push({
      id: next(),
      axis: 'anchor',
      severity: pinSeverity('medium'), // file 인덱싱됨 + symbol 부재 = 깨끗한 dangling 판정 (비차단 ceiling 내).
      message: `ast_symbol 앵커 '${s.symbol}' (${s.artifact}) 가 가리키는 심볼이 codegraph 인덱스에 부재 — 파일은 인덱싱됐으나 심볼 없음 = stale/dangling anchor (코드 리네임/삭제 추정 / 사람 확인). 최종 evidence = 실코드 grep.`,
      evidence: s.file ? [s.file] : [],
      code_graph_ref: { kind: 'ast_symbol', symbol: s.symbol, ...(s.file ? { file: s.file } : {}), ...(dbPath ? { db_path: dbPath } : {}) },
    });
  }
  return findings;
}

// freshness 배너 (render.js 패턴 / display-only).
function freshnessBanner(fresh) {
  if (!fresh || !fresh.available) return null;
  if (!fresh.stale) return `🟢 codegraph 인덱스 fresh (indexed_at=${fresh.indexed_at})`;
  return `⚠️ STALE — codegraph 인덱스(${fresh.indexed_at}) 이후 source ${fresh.stale_count}개 변경 → stale-anchor 부정확 가능. 재인덱싱: \`codegraph index\``;
}

export function renderAnchorVerifyMarkdown(report) {
  const v = report.anchor_verify;
  const L = [];
  L.push('# codegraph ast_symbol anchor verify — [artifact→code / reference-lens]');
  L.push('');
  const banner = freshnessBanner(report.codegraph?.freshness);
  if (banner) { L.push(`> ${banner}`); L.push(''); }
  L.push(`> ★ trust: reference-lens / 비차단(severity ${SEVERITY_CEILING.join('|')}) / 결정적 gate inject ❌. 최종 evidence = 실코드 grep.`);
  L.push(`> ★ 역방향 검증 — 산출물 ast_symbol 앵커 ∖ codegraph 심볼 = stale/dangling anchor. code-pointer-validator 가 못 하는 symbol 실재 검증.`);
  L.push(`> target: \`${report.target}\` · stack: ${report.stack?.language ?? '?'}`);
  L.push('');

  if (v.state === 'unverified') {
    L.push(`## anchor verify — unverified`);
    L.push(`_${v.reason}_`);
    L.push('');
    L.push(`(codegraph 심볼 인덱스 = ${v.symbol_index_size} keys / kinds: ${(v.indexed_kinds || []).join(', ') || 'none'} — 앵커가 생기면 즉시 검증 가능.)`);
    return L.join('\n').trimEnd();
  }

  L.push(`## anchor verify (total=${v.total} live=${v.live} **stale=${v.stale}** informational=${v.informational} / index=${v.symbol_index_size} keys, kinds: ${(v.indexed_kinds || []).join(',')})`);
  if (v.freshness_caveat) L.push(`> ⚠ ${v.freshness_caveat}`);
  if (v.stale === 0) L.push('_stale-anchor 없음 — 모든 ast_symbol 앵커가 codegraph 심볼에 실재(또는 codegraph 사각=informational)._');
  for (const s of v.stale_anchors.slice(0, 80)) L.push(`- ⚠ \`${s.symbol}\`  (${s.artifact} / ${s.file ?? '?'}) — 심볼 부재 (파일 인덱싱됨)`);
  if (v.stale_anchors.length > 80) L.push(`- … (+${v.stale_anchors.length - 80} more)`);
  L.push('');

  // ★ informational (codegraph 사각) — 결함 보고 ❌ / severity 부재 / finding 채널 진입 ❌.
  if (v.informational_notes?.length) {
    L.push('### informational notes (앵커 file 이 codegraph 미인덱스 = codegraph 사각 — ★ not a defect / 부재 ≠ stale)');
    L.push('> codegraph 가 못 본 file 의 심볼(iBATIS2 sql/xml·동적·미지원 언어·freshness stale 등). 결함 아님 — stale-anchor/finding 으로 보고 ❌. 최종 판단 = 사람.');
    for (const n of v.informational_notes.slice(0, 60)) L.push(`- \`${n.symbol}\`  (${n.artifact} / ${n.file ?? '?'}) — ${n.reason}`);
    if (v.informational_notes.length > 60) L.push(`- … (+${v.informational_notes.length - 60} more)`);
    L.push('');
  }
  if (v.live && v.live > 0) {
    L.push(`### live anchors (${v.live}) — 심볼 실재 확인 (함수단위 추적성 corroborated)`);
    for (const a of v.live_anchors.slice(0, 40)) L.push(`- ✓ \`${a.symbol}\`  (${a.artifact})`);
    if (v.live_anchors.length > 40) L.push(`- … (+${v.live_anchors.length - 40} more)`);
    L.push('');
  }
  return L.join('\n').trimEnd();
}
