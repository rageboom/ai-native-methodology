// sql-inventory-extractor core
// 검증 (★ ADR-CHAIN-007 phase 4.8 + ADR-CHAIN-009 migration_priority 정합):
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

import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
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
  const { coverageBaselinePath = null, writeBaseline = false } = options;
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
    ratchet_trend: null
  };

  // 1. sql-inventory.json read
  const entryPath = join(targetDir, 'sql-inventory.json');
  if (!existsSync(entryPath)) {
    findings.push({
      kind: 'inventory.entry_missing',
      severity: 'critical',
      message: `${entryPath} not found — phase 4.8 sql-inventory 산출 부재`
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

  return finalize(findings, summary);
}

function finalize(findings, summary) {
  summary.total_findings = findings.length;
  summary.critical = findings.filter(f => f.severity === 'critical').length;
  summary.high = findings.filter(f => f.severity === 'high').length;
  summary.medium = findings.filter(f => f.severity === 'medium').length;
  return { findings, summary };
}
