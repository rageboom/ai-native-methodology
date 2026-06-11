// analysis-extraction-validator core (v11.0.3)
// 입력: analysis stage extract 산출물 (figma-extract.json 또는 plan-doc-extract.json)
// 목적: F-162/F-163 의 구조적 비대칭 해소 — discovery-extraction-validator 의 source-grounded
//       hard gate 를 analysis stage 입력 어댑터 산출물에도 대칭 적용.
// 검증:
//   1. (figma) node_type=TEXT 노드는 text_content 필수 (verbatim 담을 곳 비움 = F-162 핵심) → critical
//   2. (figma) TEXT 노드 provenance=inferred → high (가시 텍스트 추론 금지)
//   3. (figma TEXT / plan-doc uc_candidates·glossary) provenance 필드 누락 → high (silent 통과 차단)
//   4. (공통) provenance 보유 entry 중 inferred 비율 > threshold → medium (사용자 확인 권고)

import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

const DEFAULT_INFERRED_RATIO_THRESHOLD = 0.5;

// extract 산출물의 adapter 종류 감지 (schema title 또는 키 구조 기반)
export function detectAdapterType(extract) {
  if (!extract || typeof extract !== 'object') return 'unknown';
  if (Array.isArray(extract.components) || Array.isArray(extract.screens)) return 'figma';
  // prompt-extract 도 uc_candidates 를 갖지만 confidence 메커니즘(assumptions[].confidence)이라 source-grounded 검증 대상 외.
  // raw_prompt 시그니처로 plan-doc 보다 먼저 분류 → plan-doc 오분류 false-positive 차단 (C21 / README §32 코드 승격).
  if (typeof extract.raw_prompt === 'string') return 'prompt';
  if (Array.isArray(extract.uc_candidates) || Array.isArray(extract.glossary)) return 'plan-doc';
  return 'unknown';
}

// provenance 를 가질 수 있는 가시 entry 를 adapter 별로 수집 → { kind, id, nodeType?, hasProvenance, provenance, hasContent }
function collectProvenanceEntries(extract, adapter) {
  const entries = [];
  if (adapter === 'figma') {
    for (const c of extract.components ?? []) {
      // 가시 텍스트 노드만 source-grounded 의무 대상
      if (c.node_type === 'TEXT') {
        entries.push({
          kind: 'figma.text',
          id: c.id ?? c.name ?? '(unnamed)',
          nodeType: 'TEXT',
          hasProvenance: typeof c.provenance === 'string',
          provenance: c.provenance,
          hasContent: typeof c.text_content === 'string' && c.text_content.length > 0,
        });
      }
    }
  } else if (adapter === 'plan-doc') {
    for (const uc of extract.uc_candidates ?? []) {
      entries.push({
        kind: 'plan-doc.uc',
        id: uc.name ?? '(unnamed)',
        hasProvenance: typeof uc.provenance === 'string',
        provenance: uc.provenance,
        hasContent: typeof uc.source_excerpt === 'string' && uc.source_excerpt.length > 0,
      });
    }
    for (const g of extract.glossary ?? []) {
      entries.push({
        kind: 'plan-doc.glossary',
        id: g.term ?? '(unnamed)',
        hasProvenance: typeof g.provenance === 'string',
        provenance: g.provenance,
        hasContent: typeof g.definition === 'string' && g.definition.length > 0,
      });
    }
  }
  return entries;
}

export function validateAnalysisExtraction(extract, opts = {}) {
  const threshold = opts.inferredRatioThreshold ?? DEFAULT_INFERRED_RATIO_THRESHOLD;
  const findings = [];
  const adapter = detectAdapterType(extract);

  if (adapter === 'unknown') {
    findings.push({
      kind: 'analysis.adapter.unknown',
      severity: 'medium',
      message: 'extract 산출물의 adapter 종류를 감지하지 못함 (figma=components/screens, plan-doc=uc_candidates/glossary). source-grounded 검증 skip.',
    });
    return {
      adapter,
      findings,
      coverage: { verbatim_ratio: null },
      summary: summarize(findings),
    };
  }

  // prompt-extract = confidence 메커니즘 (source-grounded provenance 검증 대상 외 / README §32) — false-positive 방지 위해 명시 skip.
  if (adapter === 'prompt') {
    return {
      adapter,
      findings: [],
      coverage: { verbatim_ratio: null },
      summary: summarize([]),
    };
  }

  const entries = collectProvenanceEntries(extract, adapter);

  // 1. figma TEXT 노드 text_content 의무 (F-162 핵심)
  if (adapter === 'figma') {
    for (const e of entries) {
      if (!e.hasContent) {
        findings.push({
          kind: 'analysis.figma.text_content_missing',
          severity: 'critical',
          id: e.id,
          message: `TEXT 노드 ${e.id} 에 text_content (verbatim 표시 텍스트) 부재 — name(레이어명)을 텍스트로 오인 / 추론 fallback 위험 (F-162)`,
        });
      }
    }
  }

  // 2~3. provenance 검증 (공통)
  let inferredCount = 0;
  let provenanceCount = 0;
  for (const e of entries) {
    if (!e.hasProvenance) {
      findings.push({
        kind: 'analysis.provenance.missing',
        severity: 'high',
        id: e.id,
        entry_kind: e.kind,
        message: `${e.kind} ${e.id} 에 provenance 필드 부재 — verbatim/inferred 미구분 silent 통과 차단 (F-163)`,
      });
      continue;
    }
    provenanceCount++;
    if (e.provenance === 'inferred') {
      inferredCount++;
      // figma 가시 텍스트는 inferred 금지 (no-simulation)
      if (e.kind === 'figma.text') {
        findings.push({
          kind: 'analysis.figma.text_inferred',
          severity: 'high',
          id: e.id,
          message: `TEXT 노드 ${e.id} provenance=inferred — 가시 라벨/버튼/헤더 텍스트는 verbatim 의무 (추론 금지 / get_design_context 재호출 또는 scope_out 명시)`,
        });
      }
    } else if (e.provenance !== 'verbatim') {
      findings.push({
        kind: 'analysis.provenance.invalid',
        severity: 'medium',
        id: e.id,
        message: `${e.kind} ${e.id} provenance="${e.provenance}" 는 유효하지 않음 (verbatim|inferred 만 허용)`,
      });
    }
  }

  // 4. inferred 비율 임계 (사용자 확인 권고)
  const totalWithProvenance = provenanceCount;
  const inferredRatio = totalWithProvenance > 0 ? inferredCount / totalWithProvenance : 0;
  if (totalWithProvenance > 0 && inferredRatio > threshold) {
    findings.push({
      kind: 'analysis.inferred_ratio.high',
      severity: 'medium',
      ratio: inferredRatio,
      threshold,
      message: `inferred 비율 ${(inferredRatio * 100).toFixed(0)}% > 임계 ${(threshold * 100).toFixed(0)}% — verbatim 보강 권고 / GO-STOP gate 사용자 확인 의무 (${inferredCount}/${totalWithProvenance})`,
    });
  }

  const verbatimRatio = totalWithProvenance > 0
    ? (totalWithProvenance - inferredCount) / totalWithProvenance
    : (entries.length === 0 ? null : 0);

  return {
    adapter,
    findings,
    coverage: {
      verbatim_ratio: verbatimRatio,
      entries_total: entries.length,
      provenance_present: provenanceCount,
      inferred: inferredCount,
    },
    summary: summarize(findings),
  };
}

function summarize(findings) {
  return {
    total_findings: findings.length,
    critical: findings.filter(f => f.severity === 'critical').length,
    high: findings.filter(f => f.severity === 'high').length,
    medium: findings.filter(f => f.severity === 'medium').length,
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

// ── evidence-scan 모드 (F-DOGFOOD-014 / ep-fe-mis dogfood P0) ──
// analysis 산출물(LLM 생성)의 {file, line} 증거 인용 실재성 결정론 검사.
// 배경: 날조 source_evidence(존재하지 않는 파일:라인)가 schema/br-cross/gate#0 전 검증을 통과 —
//   analysis-only scope 는 artifact-graph 부재로 code-pointer-validator 불가 → 분석 단계 전용 실재성 게이트.
// 대상 shape: 객체 안 `file`(string) [+ `line`(integer)] 페어 한정 (deep-walk) —
//   business-rules source_evidence / domain invariants·value_objects evidence 등.
//   shape 한정 = false-positive 억제 (tool_stdout_path 류 다른 키는 비대상).
// 판정: 상대경로 file 부재 → critical (fabrication-grade) / line 범위 밖 → high /
//   절대경로 → info (머신 종속 비이식 — 존재검사 skip / 정직 표기).

function isAbsolutePathLike(p) {
  return p.startsWith('/') || /^[A-Za-z]:[\\/]/.test(p);
}

function collectFileLineRefs(node, jsonPath, out) {
  if (Array.isArray(node)) {
    node.forEach((v, i) => collectFileLineRefs(v, `${jsonPath}[${i}]`, out));
    return;
  }
  if (!node || typeof node !== 'object') return;
  if (typeof node.file === 'string' && node.file.length > 0) {
    out.push({
      jsonPath,
      file: node.file,
      line: Number.isInteger(node.line) ? node.line : null,
    });
  }
  for (const [k, v] of Object.entries(node)) {
    if (v && typeof v === 'object') collectFileLineRefs(v, `${jsonPath}.${k}`, out);
  }
}

function listJsonFilesRecursive(dir) {
  const out = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...listJsonFilesRecursive(p));
    // findings-*.json = aggregator 자기 출력 (증거 인용 산출물 아님) — scan 제외
    else if (e.name.endsWith('.json') && !e.name.startsWith('findings-')) out.push(p);
  }
  return out;
}

export function validateEvidenceExistence(outputDir, repoRoot) {
  const findings = [];
  const lineCountCache = new Map();
  const coverage = {
    artifacts_scanned: 0,
    refs_total: 0,
    refs_ok: 0,
    refs_absolute: 0,
    refs_missing: 0,
    refs_line_out_of_range: 0,
  };

  if (!existsSync(outputDir)) {
    findings.push({
      kind: 'evidence.output_dir_missing',
      severity: 'medium',
      message: `analysis output dir 부재: ${outputDir}`,
    });
    return { adapter: 'evidence-scan', findings, coverage, summary: summarize(findings) };
  }

  for (const artifactPath of listJsonFilesRecursive(outputDir)) {
    let json;
    try {
      json = JSON.parse(readFileSync(artifactPath, 'utf-8'));
    } catch {
      continue; // parse 불가 = schema-validator 소관 (이중 보고 회피)
    }
    coverage.artifacts_scanned += 1;
    const refs = [];
    collectFileLineRefs(json, '$', refs);
    for (const ref of refs) {
      coverage.refs_total += 1;
      if (isAbsolutePathLike(ref.file)) {
        coverage.refs_absolute += 1;
        findings.push({
          kind: 'evidence.absolute_path',
          severity: 'info',
          message: `절대경로 증거 인용 (머신 종속 — 비이식 / 존재검사 skip): ${ref.file}`,
          artifact: artifactPath,
          json_path: ref.jsonPath,
        });
        continue;
      }
      // 상대경로 해석: repo-root 기준 우선, 산출물 자신의 디렉토리 기준 fallback —
      //   증거 인용은 repo-relative / index 류(bc_files[].file)는 artifact-relative (둘 다 정당).
      const candidates = [
        resolve(repoRoot, ref.file),
        resolve(artifactPath, '..', ref.file),
      ];
      let abs = null;
      for (const c of candidates) {
        try {
          if (statSync(c).isFile()) {
            abs = c;
            break;
          }
        } catch {
          /* 다음 후보 */
        }
      }
      if (!abs) {
        coverage.refs_missing += 1;
        findings.push({
          kind: 'evidence.file_missing',
          severity: 'critical',
          message: `증거 인용 파일 부재 (fabrication-grade): ${ref.file}${ref.line != null ? ':' + ref.line : ''}`,
          artifact: artifactPath,
          json_path: ref.jsonPath,
        });
        continue;
      }
      if (ref.line != null) {
        let count = lineCountCache.get(abs);
        if (count == null) {
          count = readFileSync(abs, 'utf-8').split('\n').length;
          lineCountCache.set(abs, count);
        }
        if (ref.line < 1 || ref.line > count) {
          coverage.refs_line_out_of_range += 1;
          findings.push({
            kind: 'evidence.line_out_of_range',
            severity: 'high',
            message: `증거 인용 라인 범위 밖: ${ref.file}:${ref.line} (파일 ${count} 라인)`,
            artifact: artifactPath,
            json_path: ref.jsonPath,
          });
          continue;
        }
      }
      coverage.refs_ok += 1;
    }
  }
  return { adapter: 'evidence-scan', findings, coverage, summary: summarize(findings) };
}
