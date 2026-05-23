// code-pointer-validator core
// ★ operation.md 결정 3 + P2 — artifact ↔ code 연관 강제.
//   "24 artifact 100% code_pointers 또는 명시적 N/A" (P2 완료 기준).
//
// 검증 (release-readiness #12 게이트):
//   1. 각 Tier-1 노드 (chain instance + analysis kind + aspect kind, state ∈ {active, drift})
//      에 code_pointers ≥ 1 또는 code_pointers_na=true 가 있어야 함.
//   2. 각 code_pointer 의 anchor_type 별 검증:
//      - strict_path: path 가 repo-root 기준 존재
//      - glob: path 또는 path+glob 패턴이 ≥ 1 매칭 (간이 검사 — '*' 가 있으면 readdir 매칭 시도)
//      - ast_symbol: warn-only (AST parser 외부)
//      - doc_link: warn-only (네트워크 외부)
//   3. stale 플래그 보존 — pointer.stale=true 면 informational finding emit.
//
// 입력: artifact-graph.json (graph-synthesizer 산출). code_pointers 가 node 에 평탄화돼 있음.
// 출력: { findings, coverage, summary }

import { existsSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, basename, isAbsolute, resolve } from 'node:path';

const TRAVERSABLE_STATES = new Set(['active', 'drift']);
const VALID_ANCHOR_TYPES = new Set(['strict_path', 'glob', 'ast_symbol', 'doc_link']);

// 간이 glob — '*' 1개를 와일드카드로. 깊이 1 디렉토리 + 단일 와일드카드만 처리.
// 복잡한 패턴(**, [class], 등)은 fast-glob 같은 외부 라이브러리에 위임 (현 구현은 dependency-free).
function simpleGlobMatch(repoRoot, p) {
  const full = isAbsolute(p) ? p : join(repoRoot, p);
  if (!p.includes('*')) {
    return existsSync(full) ? [full] : [];
  }
  // 와일드카드 위치 분리
  const dir = dirname(full);
  const pat = basename(full);
  if (!existsSync(dir)) return [];
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return [];
  }
  const regex = new RegExp('^' + pat.replace(/\./g, '\\.').replace(/\*/g, '.*') + '$');
  return entries.filter(e => regex.test(e)).map(e => join(dir, e));
}

function validateOnePointer(pointer, { repoRoot, opts = {} }) {
  const findings = [];
  const { anchor_type, path, glob, symbol, stale } = pointer;

  if (!VALID_ANCHOR_TYPES.has(anchor_type)) {
    findings.push({
      kind: 'code_pointer.invalid_anchor_type',
      severity: 'high',
      anchor_type,
      message: `unknown anchor_type '${anchor_type}' (allowed: strict_path/glob/ast_symbol/doc_link)`,
    });
    return findings;
  }

  if (stale === true) {
    findings.push({
      kind: 'code_pointer.stale_flag',
      severity: 'medium',
      anchor_type, path,
      message: `pointer 가 stale=true 로 표시됨${pointer.suggested_path ? ` (suggested: ${pointer.suggested_path})` : ''} — 결정 5 매트릭스에 따라 갱신 필요`,
    });
  }

  if (anchor_type === 'strict_path') {
    const full = isAbsolute(path) ? path : join(repoRoot, path);
    if (!existsSync(full)) {
      findings.push({
        kind: 'code_pointer.path_missing',
        severity: opts.strict ? 'high' : 'medium',
        anchor_type, path,
        resolved_path: full,
        message: `strict_path '${path}' 가 존재하지 않음`,
      });
    }
    return findings;
  }

  if (anchor_type === 'glob') {
    const pat = glob ?? path; // glob 필드 우선, 없으면 path 사용 (synthesizer 가 strict_path 만 평탄화하는 1차 cut 대응)
    const matches = simpleGlobMatch(repoRoot, pat);
    if (matches.length === 0) {
      findings.push({
        kind: 'code_pointer.glob_no_match',
        severity: opts.strict ? 'high' : 'medium',
        anchor_type, path, glob: pat,
        message: `glob '${pat}' 매칭 파일 없음`,
      });
    }
    return findings;
  }

  if (anchor_type === 'ast_symbol') {
    if (!symbol) {
      findings.push({
        kind: 'code_pointer.ast_symbol_missing_symbol',
        severity: 'high',
        anchor_type, path,
        message: `ast_symbol 인데 symbol 필드 비어있음`,
      });
    }
    // path 가 있으면 존재성 정도는 확인 (best-effort)
    if (path) {
      const full = isAbsolute(path) ? path : join(repoRoot, path);
      if (!existsSync(full)) {
        findings.push({
          kind: 'code_pointer.ast_symbol_path_missing',
          severity: 'medium',
          anchor_type, path, symbol,
          message: `ast_symbol path '${path}' 가 존재하지 않음 — symbol 검증은 AST parser 외부 (warn-only)`,
        });
      }
    }
    return findings;
  }

  if (anchor_type === 'doc_link') {
    // 네트워크 검증 외부. URL 패턴 형식만 sanity check.
    const looksLikeUrl = /^(https?:\/\/|\/\/)/.test(path);
    if (!looksLikeUrl && !existsSync(isAbsolute(path) ? path : join(repoRoot, path))) {
      findings.push({
        kind: 'code_pointer.doc_link_unreachable',
        severity: 'low',
        anchor_type, path,
        message: `doc_link '${path}' 가 URL 도 아니고 로컬 경로도 존재하지 않음 — 사용자 검증 필요 (warn-only)`,
      });
    }
    return findings;
  }

  return findings;
}

function isTier1Node(node) {
  return node && typeof node.id === 'string'
    && (node.artifact_kind === 'chain' || node.artifact_kind === 'analysis' || node.artifact_kind === 'aspect');
}

export function validateCodePointers(graph, { repoRoot = process.cwd(), opts = {} } = {}) {
  const findings = [];
  const nodes = Array.isArray(graph?.nodes) ? graph.nodes : [];
  const tier1Nodes = nodes.filter(isTier1Node);

  let covered = 0; // code_pointers ≥ 1
  let explicitNA = 0; // code_pointers_na=true
  let missing = 0; // 둘 다 없음
  let pointersChecked = 0;

  for (const node of tier1Nodes) {
    if (!TRAVERSABLE_STATES.has(node.state)) continue; // propose/deprecated 는 coverage 대상 제외

    const pointers = Array.isArray(node.code_pointers) ? node.code_pointers : [];
    const na = node.code_pointers_na === true;

    if (pointers.length === 0 && !na) {
      missing++;
      findings.push({
        kind: 'code_pointer.coverage_missing',
        severity: opts.strict ? 'high' : 'medium',
        artifact_id: node.id,
        artifact_kind: node.artifact_kind,
        artifact_subkind: node.artifact_subkind,
        message: `${node.id} (${node.artifact_kind}/${node.artifact_subkind}) 에 code_pointers 가 없고 code_pointers_na=true 도 없음 — 결정 3 위반`,
      });
      continue;
    }

    if (na && pointers.length > 0) {
      // 모순: N/A 인데 pointer 있음 — operator 의도 모호 → 정보성
      findings.push({
        kind: 'code_pointer.na_conflict',
        severity: 'low',
        artifact_id: node.id,
        message: `${node.id} 는 code_pointers_na=true 이면서 code_pointers ${pointers.length} 개 보유 — 의도 모호`,
      });
    }

    if (na) {
      explicitNA++;
      continue; // pointer 검증 skip
    }

    covered++;
    for (const pointer of pointers) {
      pointersChecked++;
      const pointerFindings = validateOnePointer(pointer, { repoRoot, opts });
      for (const f of pointerFindings) {
        findings.push({ ...f, artifact_id: node.id });
      }
    }
  }

  const traversableCount = covered + explicitNA + missing;
  const coverageRatio = traversableCount === 0 ? 1.0 : (covered + explicitNA) / traversableCount;

  return {
    findings,
    coverage: {
      covered, explicit_na: explicitNA, missing,
      tier1_traversable: traversableCount,
      ratio: coverageRatio,
      threshold: 1.0, // P2 완료 기준 = 100%
    },
    summary: {
      total_findings: findings.length,
      high: findings.filter(f => f.severity === 'high').length,
      medium: findings.filter(f => f.severity === 'medium').length,
      low: findings.filter(f => f.severity === 'low').length,
      pointers_checked: pointersChecked,
    },
  };
}
