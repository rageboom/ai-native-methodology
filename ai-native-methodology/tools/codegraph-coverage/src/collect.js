// collect.js — 산출물 JSON 에서 code-ref 전수 수집 (순수 / 이미 파싱된 객체 입력 / cli 가 fs read).
//   ★ set-diff 의 "오른쪽" — 코드 엔티티가 어떤 산출물 ref 와도 안 맞으면 hole.
//   refs 종류: paths(정규화 openapi path) / files(정규화 파일경로) / symbols(정규화 Class.method) / operationIds.
//   ★ 무의존성: openapi.yaml(YAML) 직접 파싱 대신 JSON 산출물(AC openapi_path / discovery source_grounded_evidence /
//     impl-spec source_files / test-spec / behavior code_pointers)에서 ref 수집 — openapi verb-단위 직접 diff 는 carry.

import { normalizePath, normalizeFile, normalizeSymbol } from './normalize.js';

function eatCodePointers(cps, refs) {
  if (!Array.isArray(cps)) return;
  for (const cp of cps) {
    if (!cp || typeof cp !== 'object') continue;
    if (cp.path && cp.anchor_type !== 'glob') refs.files.add(normalizeFile(cp.path));
    if (cp.symbol) refs.symbols.add(normalizeSymbol(cp.symbol));
  }
}

// source_grounded_evidence 문자열 배열: "file.ext:line" / "openapi.yaml#opId" / "x.json#ID".
function eatEvidenceStrings(arr, refs) {
  if (!Array.isArray(arr)) return;
  for (const e of arr) {
    if (typeof e !== 'string') continue;
    const op = e.match(/openapi\.ya?ml#(\S+)/i);
    if (op) { refs.operationIds.add(op[1]); continue; }
    const fm = e.match(/^([^#\s]+\.[A-Za-z0-9]+)(?::|$)/); // "Foo.java:43" 또는 "Foo.java"
    if (fm && !/\.(json|md)$/i.test(fm[1])) refs.files.add(normalizeFile(fm[1]));
  }
}

/**
 * @param {Object<string,Object>} deliverables  { 'acceptance-criteria':obj, 'discovery-spec':obj, 'impl-spec':obj, 'test-spec':obj, 'behavior-spec':obj }
 * @returns {{paths:Set<string>, files:string[], symbols:Set<string>, operationIds:Set<string>, sources:string[]}}
 */
export function collectRefs(deliverables = {}) {
  const refs = { paths: new Set(), files: new Set(), symbols: new Set(), operationIds: new Set() };
  const sources = [];
  const present = (k) => { if (deliverables[k]) { sources.push(k); return deliverables[k]; } return null; };

  const ac = present('acceptance-criteria');
  for (const c of (ac?.criteria ?? ac?.acceptance_criteria ?? [])) {
    if (c?.openapi_path) refs.paths.add(normalizePath(c.openapi_path));
    if (c?.operationId) refs.operationIds.add(c.operationId);
    if (c?.openapi_contract_ref?.path) refs.paths.add(normalizePath(c.openapi_contract_ref.path));
    eatCodePointers(c?.code_pointers, refs);
  }

  const ds = present('discovery-spec');
  for (const u of (ds?.use_cases ?? [])) {
    eatEvidenceStrings(u?.source_grounded_evidence, refs);
    eatCodePointers(u?.code_pointers, refs);
  }

  const bs = present('behavior-spec');
  for (const b of (bs?.behaviors ?? [])) {
    eatEvidenceStrings(b?.source_grounded_evidence, refs);
    eatCodePointers(b?.code_pointers, refs);
  }

  const is = present('impl-spec');
  for (const m of (is?.modules ?? [])) {
    for (const f of (m?.source_files ?? [])) refs.files.add(normalizeFile(f));
    eatCodePointers(m?.code_pointers, refs);
  }

  const ts = present('test-spec');
  for (const tc of (ts?.test_cases ?? [])) {
    if (tc?.source_file) refs.files.add(normalizeFile(tc.source_file));
    if (tc?.openapi_contract_ref?.path) refs.paths.add(normalizePath(tc.openapi_contract_ref.path));
    if (tc?.openapi_contract_ref?.operationId) refs.operationIds.add(tc.openapi_contract_ref.operationId);
    eatCodePointers(tc?.code_pointers, refs);
  }

  return { paths: refs.paths, files: [...refs.files], symbols: refs.symbols, operationIds: refs.operationIds, sources };
}

// ★ v12.12.0 STEP 4 — ast_symbol 앵커를 provenance 보존하여 수집 (collectRefs 의 Set 평탄화는 출처 소실 → 역방향 검증 불가).
//   "역방향 set-diff" (산출물 앵커 ∖ codegraph 심볼 = stale-anchor) 의 "왼쪽" 입력. collectRefs 와 별개 함수 = 무회귀.
//   symbol 보유 code_pointer 만 (anchor_type==='ast_symbol' 정합 / symbol 부재 = 검증 대상 아님). anchor_path = symbol 이 속한 파일.
function eatSymbolAnchors(cps, artifact, out, seen) {
  if (!Array.isArray(cps)) return;
  for (const cp of cps) {
    if (!cp || typeof cp !== 'object' || typeof cp.symbol !== 'string' || !cp.symbol.trim()) continue;
    // anchor_type 이 명시되면 ast_symbol 만 (strict_path/glob 에 우연히 symbol 이 있어도 검증 대상 아님). 미명시 = symbol 존재로 수용.
    if (cp.anchor_type && cp.anchor_type !== 'ast_symbol') continue;
    const symbol = cp.symbol.trim();
    const anchorPath = typeof cp.path === 'string' ? normalizeFile(cp.path) : null;
    const key = `${artifact}|${symbol}|${anchorPath || ''}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ symbol, normalized: normalizeSymbol(symbol), artifact, anchor_path: anchorPath, anchor_type: cp.anchor_type || 'ast_symbol' });
  }
}

/**
 * 산출물의 ast_symbol code_pointer 를 provenance 보존 수집.
 * @param {Object<string,Object>} deliverables  collectRefs 와 동일 입력
 * @returns {{anchors:Array<{symbol,normalized,artifact,anchor_path,anchor_type}>, sources:string[]}}
 */
export function collectSymbolAnchors(deliverables = {}) {
  const anchors = [];
  const seen = new Set();
  const sources = [];
  const present = (k) => { if (deliverables[k]) { sources.push(k); return deliverables[k]; } return null; };

  const ac = present('acceptance-criteria');
  for (const c of (ac?.criteria ?? ac?.acceptance_criteria ?? [])) eatSymbolAnchors(c?.code_pointers, 'acceptance-criteria', anchors, seen);

  const ds = present('discovery-spec');
  for (const u of (ds?.use_cases ?? [])) eatSymbolAnchors(u?.code_pointers, 'discovery-spec', anchors, seen);

  const bs = present('behavior-spec');
  for (const b of (bs?.behaviors ?? [])) eatSymbolAnchors(b?.code_pointers, 'behavior-spec', anchors, seen);

  const is = present('impl-spec');
  for (const m of (is?.modules ?? [])) eatSymbolAnchors(m?.code_pointers, 'impl-spec', anchors, seen);

  const ts = present('test-spec');
  for (const tc of (ts?.test_cases ?? [])) eatSymbolAnchors(tc?.code_pointers, 'test-spec', anchors, seen);

  anchors.sort((a, b) => a.artifact.localeCompare(b.artifact) || a.symbol.localeCompare(b.symbol));
  return { anchors, sources };
}
