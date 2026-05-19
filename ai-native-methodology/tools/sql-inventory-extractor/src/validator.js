// sql-inventory-extractor core
// 검증 (★ ADR-CHAIN-007 phase sql-inventory + ADR-CHAIN-009 migration_priority 정합):
//   1. inventory[].sql_id + mapper_xml + business_meaning + dependent_tables + intent_vs_bug_classification + confidence 의무
//   2. inventory[].statement_type ∈ [PREPARED, CALLABLE, STATEMENT] (★ default PREPARED / Agent 1 강 권고)
//   3. inventory[].carry_flags ⊂ enum 8종
//   4. inventory[].confidence ∈ [0.0, 1.0]
//   5. inventory[].carry_flags 에 external_call_out_of_scope 또는 DBA-read 시 confidence ≤ 0.80 (★ if/then)
//   6. inventory[].intent_vs_bug_classification 본문에 (intent / bug / ambiguous / self_recognized) 4 분류 키워드 ≥ 1
//   7. extraction_automation.auto_ratio_external_6 형식 검증 + threshold ≥ 0.50 (default)
//   8. ★ inventory[].migration_priority (optional) ∈ [P0, P1, P2, P3] (★ v2.3.0-rc1 / ADR-CHAIN-009 / backward-compat 의무)
//   9. ★ inventory[].dynamic_branch[].tag_type (optional) ∈ enum (★ v2.3.1 PATCH / C-v2.2.0-7 / iBATIS 2 + MyBatis 3 + SQL native sub-classification)
//  10. ★ extraction_automation.auto_ratio_external_6 baseline ratchet trend (★ v2.3.1 PATCH / C-v2.2.0-2 / characterization-coverage-validator mirror)

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { readCoverageBaseline, writeCoverageBaseline, coverageTrendCheck } from '../../_shared/baseline.js';

export function loadJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

const VALID_STATEMENT_TYPE = new Set(['PREPARED', 'CALLABLE', 'STATEMENT']);
const VALID_CARRY_FLAGS = new Set([
  'DBA-read',
  'proc-body',
  'external_call_out_of_scope',
  'domain-expert-review',
  'domain-expert',
  'scope-decision-carry',
  'cross-domain',
  'DRY-violation'
]);
const HIGH_CONFIDENCE_BLOCKING_FLAGS = new Set(['external_call_out_of_scope', 'DBA-read']);
const INTENT_KEYWORDS = ['intent', 'bug', 'ambiguous', 'self_recognized'];
const VALID_MIGRATION_PRIORITY = new Set(['P0', 'P1', 'P2', 'P3']);
const VALID_TAG_TYPE = new Set([
  // iBATIS 2 dynamic tags (C-v2.2.0-7 / ADR-CHAIN-008 spectrum sub-classification)
  'ibatis2:dynamic', 'ibatis2:iterate',
  'ibatis2:isNull', 'ibatis2:isNotNull',
  'ibatis2:isEmpty', 'ibatis2:isNotEmpty',
  'ibatis2:isEqual', 'ibatis2:isNotEqual',
  'ibatis2:isGreaterThan', 'ibatis2:isGreaterEqual',
  'ibatis2:isLessThan', 'ibatis2:isLessEqual',
  'ibatis2:isPropertyAvailable', 'ibatis2:isNotPropertyAvailable',
  'ibatis2:isParameterPresent', 'ibatis2:isNotParameterPresent',
  // MyBatis 3 dynamic tags
  'mybatis3:if', 'mybatis3:choose-when', 'mybatis3:choose-otherwise',
  'mybatis3:where', 'mybatis3:set', 'mybatis3:trim',
  'mybatis3:foreach', 'mybatis3:bind',
  // SQL native + other
  'sql:case_when',
  'other'
]);

export function validateSqlInventory(targetDir, thresholdAutoRatio = 0.50, options = {}) {
  const {
    coverageBaselinePath = null,
    writeBaseline = false,
    legacyXmlDir = null,
    legacyMismatchHighThreshold = 0.30,
    legacyMismatchCriticalThreshold = 0.70,
    evidenceDir = null,
  } = options;
  const findings = [];
  const summary = {
    inventory_count: 0,
    total_findings: 0,
    critical: 0,
    high: 0,
    medium: 0,
    auto_ratio_external_6: null,
    statement_type_distribution: { PREPARED: 0, CALLABLE: 0, STATEMENT: 0 },
    carry_flags_count: 0,
    migration_priority_distribution: { P0: 0, P1: 0, P2: 0, P3: 0, unspecified: 0 },
    tag_type_distribution: {},
    ratchet_trend: null,
    legacy_cross_check: null,
    evidence_cross_check: null,
  };

  // 1. sql-inventory.json read
  const entryPath = join(targetDir, 'sql-inventory.json');
  if (!existsSync(entryPath)) {
    findings.push({
      kind: 'inventory.entry_missing',
      severity: 'critical',
      message: `${entryPath} not found — phase sql-inventory 산출 부재`
    });
    return finalize(findings, summary);
  }

  let entry;
  try {
    entry = loadJson(entryPath);
  } catch (e) {
    findings.push({
      kind: 'inventory.parse_error',
      severity: 'critical',
      message: `Cannot parse sql-inventory.json: ${e.message}`
    });
    return finalize(findings, summary);
  }

  // 2. inventory array 의무
  const inventory = Array.isArray(entry.inventory) ? entry.inventory : null;
  if (!inventory || inventory.length === 0) {
    findings.push({
      kind: 'inventory.array_missing',
      severity: 'critical',
      message: `inventory[] missing or empty`
    });
    return finalize(findings, summary);
  }
  summary.inventory_count = inventory.length;

  // 3. record 검증
  for (let i = 0; i < inventory.length; i++) {
    const rec = inventory[i];
    const path = `inventory[${i}]`;

    // 필수 필드
    const requiredFields = ['sql_id', 'mapper_xml', 'business_meaning', 'dependent_tables', 'intent_vs_bug_classification', 'confidence'];
    for (const f of requiredFields) {
      if (rec[f] === undefined || rec[f] === null) {
        findings.push({
          kind: 'record.missing_required_field',
          severity: 'critical',
          path,
          message: `${path}: '${f}' 필드 누락`
        });
      }
    }

    // statement_type enum
    if (rec.statement_type !== undefined) {
      if (!VALID_STATEMENT_TYPE.has(rec.statement_type)) {
        findings.push({
          kind: 'record.statement_type_invalid',
          severity: 'critical',
          path,
          message: `${path}.statement_type='${rec.statement_type}' invalid (must be PREPARED|CALLABLE|STATEMENT)`
        });
      } else {
        summary.statement_type_distribution[rec.statement_type] += 1;
      }
    } else {
      summary.statement_type_distribution.PREPARED += 1; // default
    }

    // carry_flags enum
    if (Array.isArray(rec.carry_flags)) {
      for (const cf of rec.carry_flags) {
        if (!VALID_CARRY_FLAGS.has(cf)) {
          findings.push({
            kind: 'record.carry_flag_invalid',
            severity: 'critical',
            path,
            message: `${path}.carry_flags contains '${cf}' (not in enum 8종)`
          });
        }
        summary.carry_flags_count += 1;
      }
    }

    // confidence range
    if (typeof rec.confidence === 'number') {
      if (rec.confidence < 0 || rec.confidence > 1) {
        findings.push({
          kind: 'record.confidence_out_of_range',
          severity: 'critical',
          path,
          message: `${path}.confidence=${rec.confidence} out of [0.0, 1.0]`
        });
      }
    }

    // ★ if/then — external_call_out_of_scope 또는 DBA-read carry 시 confidence ≤ 0.80 의무
    if (Array.isArray(rec.carry_flags) && typeof rec.confidence === 'number') {
      const hasBlocking = rec.carry_flags.some(cf => HIGH_CONFIDENCE_BLOCKING_FLAGS.has(cf));
      if (hasBlocking && rec.confidence > 0.80) {
        findings.push({
          kind: 'record.high_confidence_with_external_call',
          severity: 'high',
          path,
          message: `${path}.confidence=${rec.confidence} > 0.80 but carry_flags contains external_call_out_of_scope or DBA-read (must be ≤ 0.80 per ADR-CHAIN-007)`
        });
      }
    }

    // intent_vs_bug_classification 4 분류 키워드 ≥ 1
    if (typeof rec.intent_vs_bug_classification === 'string') {
      const lower = rec.intent_vs_bug_classification.toLowerCase();
      const hasKeyword = INTENT_KEYWORDS.some(kw => lower.includes(kw));
      if (!hasKeyword) {
        findings.push({
          kind: 'record.intent_vs_bug_no_keyword',
          severity: 'high',
          path,
          message: `${path}.intent_vs_bug_classification 본문에 (intent / bug / ambiguous / self_recognized) 4 분류 키워드 ≥ 1 의무`
        });
      }
    }

    // ★ migration_priority enum (optional / ADR-CHAIN-009)
    if (rec.migration_priority !== undefined) {
      if (!VALID_MIGRATION_PRIORITY.has(rec.migration_priority)) {
        findings.push({
          kind: 'record.migration_priority_invalid',
          severity: 'critical',
          path,
          message: `${path}.migration_priority='${rec.migration_priority}' invalid (must be P0|P1|P2|P3 per ADR-CHAIN-009)`
        });
      } else {
        summary.migration_priority_distribution[rec.migration_priority] += 1;
      }
    } else {
      summary.migration_priority_distribution.unspecified += 1;
    }

    // ★ dynamic_branch[].tag_type enum (optional / v2.3.1 PATCH / C-v2.2.0-7)
    if (Array.isArray(rec.dynamic_branch)) {
      for (let j = 0; j < rec.dynamic_branch.length; j++) {
        const db = rec.dynamic_branch[j];
        if (db.tag_type !== undefined) {
          if (!VALID_TAG_TYPE.has(db.tag_type)) {
            findings.push({
              kind: 'record.tag_type_invalid',
              severity: 'critical',
              path: `${path}.dynamic_branch[${j}]`,
              message: `${path}.dynamic_branch[${j}].tag_type='${db.tag_type}' invalid (must be in enum / iBATIS 2 + MyBatis 3 + sql:* + other / C-v2.2.0-7)`
            });
          } else {
            summary.tag_type_distribution[db.tag_type] = (summary.tag_type_distribution[db.tag_type] ?? 0) + 1;
          }
        }
      }
    }
  }

  // 4. extraction_automation 검증
  const ea = entry.extraction_automation;
  if (!ea) {
    findings.push({
      kind: 'extraction_automation.missing',
      severity: 'critical',
      message: `extraction_automation object missing`
    });
  } else {
    const autoRatioStr = ea.auto_ratio_external_6;
    if (typeof autoRatioStr !== 'string') {
      findings.push({
        kind: 'extraction_automation.auto_ratio_missing',
        severity: 'critical',
        message: `extraction_automation.auto_ratio_external_6 missing`
      });
    } else {
      // 형식 검증: "N/6 = X.X%"
      const m = autoRatioStr.match(/^(\d+)\/6\s*=\s*(\d+(?:\.\d+)?)%/);
      if (!m) {
        findings.push({
          kind: 'extraction_automation.auto_ratio_format_invalid',
          severity: 'high',
          message: `extraction_automation.auto_ratio_external_6='${autoRatioStr}' invalid format (expected 'N/6 = X.X%')`
        });
      } else {
        const ratio = parseFloat(m[2]) / 100;
        summary.auto_ratio_external_6 = ratio;
        if (ratio < thresholdAutoRatio) {
          findings.push({
            kind: 'extraction_automation.below_threshold',
            severity: 'medium',
            message: `auto_ratio_external_6=${(ratio * 100).toFixed(1)}% < threshold ${(thresholdAutoRatio * 100).toFixed(0)}% (≥ 50% pass per ADR-CHAIN-007)`
          });
        }
      }
    }
  }

  // ★ ratchet trend (★ v2.3.1 PATCH / C-v2.2.0-2 / characterization-coverage-validator mirror)
  if (coverageBaselinePath && summary.auto_ratio_external_6 !== null) {
    const baseline = readCoverageBaseline(coverageBaselinePath);
    const trend = coverageTrendCheck(summary.auto_ratio_external_6, baseline);
    summary.ratchet_trend = trend;
    if (!trend.pass) {
      findings.push({
        kind: 'extraction_automation.ratchet_trend_negative',
        severity: 'high',
        message: `auto_ratio_external_6 ratchet trend negative — ${trend.message}`
      });
    }
    if (writeBaseline) {
      writeCoverageBaseline(coverageBaselinePath, {
        coverage_ratio: summary.auto_ratio_external_6,
        coverage_strategy: 'ratchet',
        project_id: entry.project_id ?? null
      });
    }
  } else if (writeBaseline && coverageBaselinePath && summary.auto_ratio_external_6 !== null) {
    // write-only path (baseline 부재 + write 의무)
    writeCoverageBaseline(coverageBaselinePath, {
      coverage_ratio: summary.auto_ratio_external_6,
      coverage_strategy: 'ratchet',
      project_id: entry.project_id ?? null
    });
  }

  // ★ Layer 3 (v8.7+) — evidence cross-check (실 tool invocation log 와 auto_ratio_external_6 claim cross-check)
  // R15 silent enabler fix: AI 자기 보고 metric 의 실 외부 도구 invocation evidence 정량 검증.
  if (evidenceDir) {
    const claimedN = parseClaimedAutoCount(entry?.extraction_automation?.auto_ratio_external_6);
    const crossCheck = crossCheckEvidence(evidenceDir, claimedN);
    summary.evidence_cross_check = crossCheck;

    if (crossCheck.status === 'dir_missing') {
      findings.push({
        kind: 'evidence_cross_check.dir_missing',
        severity: 'high',
        message: `--evidence-dir '${evidenceDir}' not found or not a directory`
      });
    } else if (crossCheck.status === 'no_evidence_files') {
      findings.push({
        kind: 'evidence_cross_check.no_evidence_files',
        severity: 'high',
        message: `--evidence-dir '${evidenceDir}' has no *.jsonl evidence files — sql-inventory.json 의 auto_ratio_external_6 claim 검증 불가 (R15 silent enabler unverified)`
      });
    } else if (crossCheck.status === 'ok') {
      const { evidence_tool_count, claimed_count, total_invocations } = crossCheck;
      if (claimedN === null) {
        findings.push({
          kind: 'evidence_cross_check.claim_unparseable',
          severity: 'medium',
          message: `auto_ratio_external_6 string 의 N parse 실패 → evidence cross-check skip (evidence_tool_count=${evidence_tool_count} / total_invocations=${total_invocations})`
        });
      } else if (evidence_tool_count < claimedN) {
        findings.push({
          kind: 'evidence_cross_check.invocation_count_mismatch',
          severity: 'critical',
          message: `★ R15 silent simulation 의심 — auto_ratio_external_6 claim=${claimedN}/6 vs evidence_tool_count=${evidence_tool_count} (실 invocation 의 unique tool 개수 부족). AI 자기 보고 metric 가능성 / 실 외부 도구 invocation 의무.`
        });
      }
    }
  }

  // ★ Layer 2 (v8.7+) — legacy XML cross-check (xmllint XPath count vs inventory_count)
  // R15 silent enabler fix: AI hypothesis sql-inventory.json 이 실 legacy XML 의 SQL count 와 ★ 정량 cross-check.
  if (legacyXmlDir) {
    const crossCheck = crossCheckLegacyXml(legacyXmlDir, summary.inventory_count);
    summary.legacy_cross_check = crossCheck;

    if (crossCheck.status === 'xmllint_unavailable') {
      findings.push({
        kind: 'legacy_cross_check.xmllint_unavailable',
        severity: 'medium',
        message: `xmllint command not found in PATH — legacy XML cross-check skipped (--legacy-xml-dir ${legacyXmlDir}). 본 도구 의 R15 silent simulation 차단 의무 = xmllint 가용 환경 권고.`
      });
    } else if (crossCheck.status === 'dir_missing') {
      findings.push({
        kind: 'legacy_cross_check.dir_missing',
        severity: 'high',
        message: `--legacy-xml-dir '${legacyXmlDir}' not found or not a directory`
      });
    } else if (crossCheck.status === 'no_xml_files') {
      findings.push({
        kind: 'legacy_cross_check.no_xml_files',
        severity: 'medium',
        message: `--legacy-xml-dir '${legacyXmlDir}' has no .xml files (recursive scan / iBATIS/MyBatis SQL mapper 기대)`
      });
    } else if (crossCheck.status === 'ok') {
      const { xmllint_total, mismatch_ratio } = crossCheck;
      if (xmllint_total === 0) {
        findings.push({
          kind: 'legacy_cross_check.zero_xmllint_count',
          severity: 'medium',
          message: `xmllint XPath count = 0 across ${crossCheck.files_scanned} .xml files (no select/insert/update/delete tags) — legacy XML 이 iBATIS/MyBatis mapper 아닐 가능성`
        });
      } else if (mismatch_ratio >= legacyMismatchCriticalThreshold) {
        findings.push({
          kind: 'legacy_cross_check.mismatch_critical',
          severity: 'critical',
          message: `★ R15 silent simulation 의심 — inventory_count=${summary.inventory_count} vs xmllint_total=${xmllint_total} (mismatch ${(mismatch_ratio * 100).toFixed(1)}% ≥ ${(legacyMismatchCriticalThreshold * 100).toFixed(0)}% critical threshold). AI hypothesis 가능성 큼 / 실 legacy XML grep 의무.`
        });
      } else if (mismatch_ratio >= legacyMismatchHighThreshold) {
        findings.push({
          kind: 'legacy_cross_check.mismatch_high',
          severity: 'high',
          message: `inventory_count=${summary.inventory_count} vs xmllint_total=${xmllint_total} (mismatch ${(mismatch_ratio * 100).toFixed(1)}% ≥ ${(legacyMismatchHighThreshold * 100).toFixed(0)}% high threshold). 일부 SQL 누락 가능성 / 실 legacy XML 추가 추출 권고.`
        });
      }
    }
  }

  return finalize(findings, summary);
}

// ★ Layer 3 helper — claimedAutoCount parse from "N/6 = X.X%" format
function parseClaimedAutoCount(autoRatioStr) {
  if (typeof autoRatioStr !== 'string') return null;
  const m = autoRatioStr.match(/^(\d+)\/6\b/);
  return m ? parseInt(m[1], 10) : null;
}

// ★ Layer 3 helper — evidence cross-check (실 tool invocation log file 의 unique tool count)
function crossCheckEvidence(evidenceDir, claimedN) {
  if (!existsSync(evidenceDir)) {
    return { status: 'dir_missing', evidence_dir: evidenceDir };
  }
  let st;
  try { st = statSync(evidenceDir); } catch { return { status: 'dir_missing', evidence_dir: evidenceDir }; }
  if (!st.isDirectory()) return { status: 'dir_missing', evidence_dir: evidenceDir };

  // *.jsonl file scan (recursive 한 layer만 — common case)
  const entries = readdirSync(evidenceDir);
  const jsonlFiles = entries
    .filter(f => f.endsWith('.jsonl'))
    .map(f => join(evidenceDir, f));

  if (jsonlFiles.length === 0) {
    return { status: 'no_evidence_files', evidence_dir: evidenceDir, files_scanned: 0 };
  }

  // JSON Lines parse → unique tool extract
  const tools = new Set();
  let totalInvocations = 0;
  let parseErrors = 0;
  const perFile = [];

  for (const f of jsonlFiles) {
    let content;
    try { content = readFileSync(f, 'utf8'); } catch { perFile.push({ file: f, status: 'read_error' }); continue; }
    const lines = content.split('\n').filter(l => l.trim().length > 0);
    let fileInvocations = 0;
    let fileTools = new Set();
    for (const line of lines) {
      let rec;
      try { rec = JSON.parse(line); } catch { parseErrors++; continue; }
      if (typeof rec.tool === 'string') {
        tools.add(rec.tool);
        fileTools.add(rec.tool);
        totalInvocations++;
        fileInvocations++;
      }
    }
    perFile.push({ file: f, invocations: fileInvocations, unique_tools: [...fileTools] });
  }

  return {
    status: 'ok',
    evidence_dir: evidenceDir,
    files_scanned: jsonlFiles.length,
    total_invocations: totalInvocations,
    evidence_tool_count: tools.size,
    unique_tools: [...tools].sort(),
    claimed_count: claimedN,
    parse_errors: parseErrors,
    per_file: perFile,
  };
}

// ★ Layer 2 helper — xmllint XPath SQL count cross-check
function crossCheckLegacyXml(legacyXmlDir, inventoryCount) {
  // 1. xmllint 가용성 확인
  const probe = spawnSync('xmllint', ['--version'], { encoding: 'utf8' });
  if (probe.error || probe.status !== 0) {
    return { status: 'xmllint_unavailable', xmllint_version: null };
  }
  const xmllintVersion = (probe.stderr || probe.stdout || '').split('\n')[0];

  // 2. legacy dir 존재 확인
  if (!existsSync(legacyXmlDir)) {
    return { status: 'dir_missing' };
  }
  let st;
  try { st = statSync(legacyXmlDir); } catch { return { status: 'dir_missing' }; }
  if (!st.isDirectory()) return { status: 'dir_missing' };

  // 3. *.xml file 재귀 수집
  const xmlFiles = collectXmlFiles(legacyXmlDir);
  if (xmlFiles.length === 0) {
    return { status: 'no_xml_files', files_scanned: 0 };
  }

  // 4. 각 file 에 xmllint XPath count 실행
  let xmllintTotal = 0;
  const perFile = [];
  for (const f of xmlFiles) {
    const xpath = 'count(//select) + count(//insert) + count(//update) + count(//delete)';
    const res = spawnSync('xmllint', ['--xpath', xpath, f], { encoding: 'utf8' });
    if (res.status !== 0) {
      perFile.push({ file: f, status: 'xmllint_error', count: 0, error: (res.stderr || '').slice(0, 200) });
      continue;
    }
    const count = parseInt((res.stdout || '0').trim(), 10) || 0;
    xmllintTotal += count;
    perFile.push({ file: f, status: 'ok', count });
  }

  // mismatch ratio (symmetric / larger 기준 — small inventory 에서 small xmllint 도 정합 처리)
  const denominator = Math.max(xmllintTotal, inventoryCount);
  const mismatchRatio = denominator > 0
    ? Math.abs(xmllintTotal - inventoryCount) / denominator
    : 0;

  return {
    status: 'ok',
    xmllint_version: xmllintVersion,
    legacy_xml_dir: legacyXmlDir,
    files_scanned: xmlFiles.length,
    xmllint_total: xmllintTotal,
    inventory_count: inventoryCount,
    mismatch_ratio: mismatchRatio,
    per_file: perFile,
  };
}

function collectXmlFiles(dir) {
  const out = [];
  const stack = [dir];
  while (stack.length) {
    const cur = stack.pop();
    let entries;
    try { entries = readdirSync(cur); } catch { continue; }
    for (const name of entries) {
      if (name === 'node_modules' || name.startsWith('.')) continue;
      const full = join(cur, name);
      let s;
      try { s = statSync(full); } catch { continue; }
      if (s.isDirectory()) stack.push(full);
      else if (name.endsWith('.xml')) out.push(full);
    }
  }
  return out;
}

function finalize(findings, summary) {
  summary.total_findings = findings.length;
  summary.critical = findings.filter(f => f.severity === 'critical').length;
  summary.high = findings.filter(f => f.severity === 'high').length;
  summary.medium = findings.filter(f => f.severity === 'medium').length;
  return { findings, summary };
}
