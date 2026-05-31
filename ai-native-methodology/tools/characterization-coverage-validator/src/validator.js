// characterization-coverage-validator core
// 검증 (★ ADR-CHAIN-006 phase characterization 정합):
//   1. snapshot 4 필수 필드 (given / when / then / intent_classification)
//   2. intent_classification.type enum (intent / bug / ambiguous / self_recognized)
//   3. named_classified_ratio ≥ threshold (default 0.80)
//   4. ambiguous > 0 시 ambiguous_carry 명시 의무 (intentVsBug 또는 intent-vs-bug.md grep)
//   5. coverage_strategy ratchet 시 trend_required = true 의무
//   6. coverage_target / coverage_minimum_legacy 적용
//   7. UC 유일성 (snapshot 의 use_case 가 matrix 에 존재)
//   8. data_source_status: code_only 시 carry note 권장 (medium finding)

import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { readCoverageBaseline, writeCoverageBaseline, coverageTrendCheck } from '../../_shared/baseline.js';
import { crossCheckEvidence } from '../../_shared/evidence-cross-check.js';

export function loadJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

const VALID_TYPE = new Set(['intent', 'bug', 'ambiguous', 'self_recognized']);
const VALID_STRATEGY = new Set(['absolute', 'ratchet']);

export function validateCharacterization(targetDir, threshold = 0.80, options = {}) {
  const { coverageBaselinePath = null, writeBaseline = false, evidenceDir = null } = options;
  const findings = [];
  const summary = {
    snapshot_count: 0,
    scenario_count: 0,
    total_findings: 0,
    critical: 0,
    high: 0,
    medium: 0,
    named_classified_ratio: null,
    coverage_strategy: null,
    coverage_target: null,
    actual_coverage_ratio: null,
    evidence_cross_check: null
  };

  // 1. snapshots/UC-*.json read
  const snapshotsDir = join(targetDir, 'snapshots');
  let snapshots = [];
  if (existsSync(snapshotsDir)) {
    const files = readdirSync(snapshotsDir).filter(f => f.endsWith('.json'));
    for (const f of files) {
      try {
        snapshots.push({ file: f, data: loadJson(join(snapshotsDir, f)) });
      } catch (e) {
        findings.push({
          kind: 'snapshot.parse_error',
          severity: 'critical',
          file: f,
          message: `Cannot parse ${f}: ${e.message}`
        });
      }
    }
  } else {
    findings.push({
      kind: 'snapshot.dir_missing',
      severity: 'critical',
      message: `${snapshotsDir} not found — phase characterization 산출 부재`
    });
  }
  summary.snapshot_count = snapshots.length;

  // 2. snapshot 4 필수 필드 + intent_classification.type enum
  const ucIdsInSnapshots = new Set();
  for (const s of snapshots) {
    const d = s.data;
    if (!d.snapshot_id) {
      findings.push({ kind: 'snapshot.missing_id', severity: 'high', file: s.file, message: `${s.file}: snapshot_id missing` });
    }
    if (!d.use_case) {
      findings.push({ kind: 'snapshot.missing_use_case', severity: 'high', file: s.file, message: `${s.file}: use_case missing (★ discovery-spec UC link 의무)` });
    } else {
      ucIdsInSnapshots.add(d.use_case);
    }

    if (d.data_source_status === 'code_only') {
      // ★ v8.7 PATCH — severity 격상 (medium → high) / R15 silent enabler partial defense 강화
      // F-CYCLE3-005: snapshot 이 AI 가 코드만 보고 작성된 hypothesis 시 도메인 expert 검증 의무 / silent pass 차단
      findings.push({
        kind: 'snapshot.code_only_carry_required',
        severity: 'high',
        file: s.file,
        message: `${s.file}: data_source_status='code_only' — 도메인 expert 검증 의무 (R15 silent enabler 차단 / AI hypothesis 가능성 시 코드만 기반 snapshot 은 도메인 정합 보장 불가)`
      });
    }

    const scenarios = d.scenarios ?? [];
    summary.scenario_count += scenarios.length;
    if (scenarios.length === 0) {
      findings.push({ kind: 'snapshot.no_scenarios', severity: 'high', file: s.file, message: `${s.file}: scenarios[] empty (≥ 1 의무)` });
    }
    for (const sc of scenarios) {
      // 4 필수 필드
      for (const required of ['id', 'name', 'given', 'when', 'then', 'intent_classification']) {
        if (sc[required] === undefined || sc[required] === null) {
          findings.push({
            kind: 'scenario.missing_required',
            severity: 'critical',
            file: s.file,
            scenario: sc.id ?? '<unknown>',
            field: required,
            message: `${s.file} / scenario ${sc.id ?? '<unknown>'}: required field "${required}" missing`
          });
        }
      }
      // intent_classification.type enum
      const ic = Array.isArray(sc.intent_classification) ? sc.intent_classification : [];
      if (ic.length === 0) {
        findings.push({
          kind: 'scenario.intent_classification_empty',
          severity: 'critical',
          file: s.file,
          scenario: sc.id,
          message: `${s.file} / scenario ${sc.id}: intent_classification empty (≥ 1 의무)`
        });
      }
      let scenarioHasAmbiguous = false;
      for (const cls of ic) {
        if (!cls.rule) {
          findings.push({ kind: 'scenario.classification_missing_rule', severity: 'high', file: s.file, scenario: sc.id, message: `intent_classification entry missing 'rule'` });
        }
        if (!VALID_TYPE.has(cls.type)) {
          findings.push({
            kind: 'scenario.classification_type_invalid',
            severity: 'critical',
            file: s.file,
            scenario: sc.id,
            type: cls.type,
            message: `${s.file} / ${sc.id}: type="${cls.type}" not in [intent, bug, ambiguous, self_recognized]`
          });
        }
        if (cls.type === 'ambiguous') scenarioHasAmbiguous = true;
      }
      // ambiguous 시 behavior_likely_bug 또는 behavior_to_preserve 둘 중 하나 의무
      if (scenarioHasAmbiguous) {
        const hasLikelyBug = Array.isArray(sc.behavior_likely_bug) && sc.behavior_likely_bug.length > 0;
        const hasPreserve = Array.isArray(sc.behavior_to_preserve) && sc.behavior_to_preserve.length > 0;
        if (!hasLikelyBug && !hasPreserve) {
          findings.push({
            kind: 'scenario.ambiguous_no_behavior_note',
            severity: 'high',
            file: s.file,
            scenario: sc.id,
            message: `${s.file} / ${sc.id}: ambiguous 분류인데 behavior_likely_bug + behavior_to_preserve 둘 다 빈 배열`
          });
        }
      }
    }
  }

  // 3. coverage.json read + strategy 검증
  const coveragePath = join(targetDir, 'coverage.json');
  let coverage = null;
  if (existsSync(coveragePath)) {
    try {
      coverage = loadJson(coveragePath);
    } catch (e) {
      findings.push({ kind: 'coverage.parse_error', severity: 'critical', message: `coverage.json: ${e.message}` });
    }
  } else {
    findings.push({ kind: 'coverage.missing', severity: 'high', message: `${coveragePath} not found` });
  }

  if (coverage) {
    summary.coverage_strategy = coverage.coverage_strategy ?? 'absolute';
    summary.coverage_target = coverage.coverage_target ?? 0.80;

    if (!VALID_STRATEGY.has(summary.coverage_strategy)) {
      findings.push({
        kind: 'coverage.strategy_invalid',
        severity: 'critical',
        message: `coverage_strategy="${summary.coverage_strategy}" not in [absolute, ratchet]`
      });
    }
    // ratchet → trend_required 의무
    if (summary.coverage_strategy === 'ratchet') {
      if (coverage.trend_required !== true) {
        findings.push({
          kind: 'coverage.ratchet_trend_required_missing',
          severity: 'critical',
          message: `coverage_strategy=ratchet 시 trend_required=true 의무 (schema if/then 정합)`
        });
      }
      if (coverage.coverage_minimum_legacy === undefined) {
        findings.push({
          kind: 'coverage.ratchet_minimum_missing',
          severity: 'high',
          message: `coverage_strategy=ratchet 시 coverage_minimum_legacy 의무`
        });
      }
    }

    // matrix 의 UC 가 snapshot 의 use_case 와 정합 (snapshot=✅ 항목만)
    const matrix = Array.isArray(coverage.matrix) ? coverage.matrix : [];
    let coveredCount = 0;
    let totalCount = 0;
    for (const m of matrix) {
      if (!m.uc) continue;
      totalCount++;
      if (m.snapshot === '✅') {
        coveredCount++;
        if (!ucIdsInSnapshots.has(m.uc) && !m.uc.startsWith('(')) {
          // (supplementary) 같은 plain text uc 는 skip
          findings.push({
            kind: 'coverage.matrix_snapshot_missing',
            severity: 'high',
            uc: m.uc,
            message: `matrix UC ${m.uc}: snapshot=✅ 인데 snapshots/ 디렉토리에 매칭 file 없음`
          });
        }
      }
    }
    summary.actual_coverage_ratio = totalCount === 0 ? null : coveredCount / totalCount;

    // strategy 별 threshold 검증
    if (summary.actual_coverage_ratio !== null) {
      if (summary.coverage_strategy === 'absolute') {
        if (summary.actual_coverage_ratio < summary.coverage_target) {
          findings.push({
            kind: 'coverage.below_target_absolute',
            severity: 'high',
            actual: summary.actual_coverage_ratio,
            target: summary.coverage_target,
            message: `coverage ${(summary.actual_coverage_ratio * 100).toFixed(1)}% < target ${(summary.coverage_target * 100).toFixed(0)}% (absolute)`
          });
        }
      } else if (summary.coverage_strategy === 'ratchet') {
        const min = coverage.coverage_minimum_legacy ?? 0.40;
        if (summary.actual_coverage_ratio < min) {
          findings.push({
            kind: 'coverage.below_minimum_ratchet',
            severity: 'high',
            actual: summary.actual_coverage_ratio,
            minimum_legacy: min,
            message: `coverage ${(summary.actual_coverage_ratio * 100).toFixed(1)}% < ratchet minimum ${(min * 100).toFixed(0)}%`
          });
        }
        // ★ v2.1.0 carry C-v2.1.0-5 — trend_required = true 시 baseline 비교 자동 검증
        if (coverage.trend_required === true && coverageBaselinePath !== null) {
          const baseline = readCoverageBaseline(coverageBaselinePath);
          const trend = coverageTrendCheck(summary.actual_coverage_ratio, baseline);
          summary.coverage_trend = trend;
          if (!trend.pass) {
            findings.push({
              kind: 'coverage.trend_negative_ratchet',
              severity: 'high',
              actual: trend.current,
              baseline: trend.baseline,
              delta: trend.delta,
              message: trend.message
            });
          }
          if (writeBaseline) {
            writeCoverageBaseline(coverageBaselinePath, {
              coverage_ratio: summary.actual_coverage_ratio,
              coverage_strategy: summary.coverage_strategy,
              project_id: coverage.project_id ?? entry?.project_id ?? null,
            });
            summary.coverage_baseline_written = coverageBaselinePath;
          }
        }
      }
    }
  }

  // 4. intent-vs-bug.md ambiguous_carry grep
  const intentVsBugPath = join(targetDir, 'intent-vs-bug.md');
  let intentVsBugContent = '';
  if (existsSync(intentVsBugPath)) {
    intentVsBugContent = readFileSync(intentVsBugPath, 'utf8');
  } else {
    findings.push({ kind: 'intent_vs_bug.missing', severity: 'high', message: `${intentVsBugPath} not found` });
  }

  // 5. characterization-spec.json read (선택 / entry file / 통합 검증용)
  const entryPath = join(targetDir, 'characterization-spec.json');
  let entry = null;
  if (existsSync(entryPath)) {
    try {
      entry = loadJson(entryPath);
    } catch (e) {
      findings.push({ kind: 'entry.parse_error', severity: 'medium', message: `characterization-spec.json: ${e.message}` });
    }
  }

  // 6. named_classified_ratio 계산 + threshold 검증
  // entry.intent_vs_bug 우선 / 부재 시 snapshots 자체에서 집계
  let total = 0, named = 0, ambiguousCount = 0;
  if (entry?.intent_vs_bug) {
    const iv = entry.intent_vs_bug;
    total = (iv.br_total ?? 0) + (iv.ap_total ?? 0);
    named = (iv.br_intent ?? 0) + (iv.br_bug ?? 0) + (iv.br_self_recognized ?? 0)
          + (iv.ap_intent ?? 0) + (iv.ap_bug ?? 0) + (iv.ap_self_recognized ?? 0);
    ambiguousCount = (iv.br_ambiguous ?? 0) + (iv.ap_ambiguous ?? 0);
    if (iv.named_classified_ratio !== undefined) {
      summary.named_classified_ratio = iv.named_classified_ratio;
    }
  } else {
    // snapshots 직접 집계
    for (const s of snapshots) {
      for (const sc of (s.data.scenarios ?? [])) {
        for (const cls of (sc.intent_classification ?? [])) {
          total++;
          if (cls.type === 'ambiguous') ambiguousCount++;
          else if (VALID_TYPE.has(cls.type)) named++;
        }
      }
    }
    summary.named_classified_ratio = total === 0 ? 1.0 : named / total;
  }

  if (summary.named_classified_ratio !== null && summary.named_classified_ratio < threshold) {
    findings.push({
      kind: 'classification.named_ratio_below_threshold',
      severity: 'high',
      actual: summary.named_classified_ratio,
      threshold,
      message: `named_classified_ratio ${(summary.named_classified_ratio * 100).toFixed(1)}% < threshold ${(threshold * 100).toFixed(0)}% — ambiguous 영역 ↑ / 도메인 expert 결단 carry 의무`
    });
  }

  // 7. ambiguous > 0 시 ambiguous_carry 명시 의무 (entry.intent_vs_bug.ambiguous_carry 또는 intent-vs-bug.md grep)
  if (ambiguousCount > 0) {
    const entryHasCarry = Array.isArray(entry?.intent_vs_bug?.ambiguous_carry) && entry.intent_vs_bug.ambiguous_carry.length > 0;
    const mdHasCarry = /ambiguous/i.test(intentVsBugContent) && /carry|결단|expert/i.test(intentVsBugContent);
    if (!entryHasCarry && !mdHasCarry) {
      findings.push({
        kind: 'classification.ambiguous_carry_missing',
        severity: 'critical',
        ambiguous_count: ambiguousCount,
        message: `ambiguous ${ambiguousCount}건 — ambiguous_carry 명시 의무 (intent_vs_bug.ambiguous_carry 배열 또는 intent-vs-bug.md 본문 grep)`
      });
    }
  }

  // ★ Layer 3 (v8.7+) — evidence cross-check (실 tool invocation log 와 real-source snapshot count claim cross-check)
  // R15 silent enabler fix (sql-inventory-validator Layer 3 mirror): AI 가 data_source_status 만 'real_db' /
  // 'real_environment' / 'domain_expert_interview' 로 자기 기입한 silent simulation 차단. 실 외부 도구 invocation
  // evidence (JSON Lines log) 의 unique tool count 와 정량 cross-check.
  if (evidenceDir) {
    const claimedN = countRealSourceSnapshots(snapshots);
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
        message: `--evidence-dir '${evidenceDir}' has no *.jsonl evidence files — characterization-spec.json 의 real-source snapshot claim 검증 불가 (R15 silent enabler unverified)`
      });
    } else if (crossCheck.status === 'ok') {
      const { evidence_tool_count, claimed_count, total_invocations } = crossCheck;
      if (claimedN === 0) {
        findings.push({
          kind: 'evidence_cross_check.claim_empty',
          severity: 'medium',
          message: `real-source snapshot 0 (data_source_status real_db/real_environment/domain_expert_interview 명시 부재) → evidence cross-check skip (evidence_tool_count=${evidence_tool_count} / total_invocations=${total_invocations})`
        });
      } else if (evidence_tool_count < claimedN) {
        findings.push({
          kind: 'evidence_cross_check.invocation_count_mismatch',
          severity: 'critical',
          message: `★ R15 silent simulation 의심 — real-source snapshot claim=${claimedN} vs evidence_tool_count=${evidence_tool_count} (실 invocation 의 unique tool 개수 부족). data_source_status='real_*' AI 자기 보고 가능성 / 실 외부 도구 invocation 의무.`
        });
      }
    }
  }

  // tally
  for (const f of findings) {
    summary.total_findings++;
    if (f.severity === 'critical') summary.critical++;
    else if (f.severity === 'high') summary.high++;
    else if (f.severity === 'medium') summary.medium++;
  }

  return { summary, findings };
}

// ★ Layer 3 helper — real-source snapshot count (data_source_status 가 실 evidence source 명시)
// (crossCheckEvidence 는 v8.7 PATCH refactor 로 _shared/evidence-cross-check.js 로 추출 / 본 도구별 claim 계산만 보존)
const REAL_SOURCE_STATUSES = new Set(['real_db', 'real_environment', 'domain_expert_interview']);
function countRealSourceSnapshots(snapshots) {
  let n = 0;
  for (const s of snapshots) {
    if (REAL_SOURCE_STATUSES.has(s.data?.data_source_status)) n++;
  }
  return n;
}
