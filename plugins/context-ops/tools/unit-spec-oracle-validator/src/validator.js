// unit-spec-oracle-validator core (v0.69.0 / DEC-2026-06-22-unit-spec-oracle-symmetry)
// 목적: unit-spec.json 의 unit_test_obligation=required UNIT 이 검증 oracle 을 ≥1 가리키는지 검사.
//   behavior 의 acceptance-criteria `verifiable=true ⇒ test_case_refs≥1`(schema if/then hard) 짝 규칙을
//   unit 층에 대칭으로 채운다. oracle 채널 3종: invariant_refs(formal 불변식 / designed_from_spec) ·
//   property_test_refs · characterization_snapshot_refs(S2 AS-IS / characterized_from_code).
//   required 인데 oracle 0건이고 oracle_waiver(정직 면제 사유)도 없으면 = "합격선 미상" → medium finding
//   (soft / 게이트 미차단). test 단계에서 합격선을 발명하는 거짓 GREEN 의 선제 차단.
// 스코프(보수 / 승인 범위 = required): unit_test_obligation=required UNIT 만 검사. waived(테스트 면제) /
//   characterization_only(별도 carry — STATUS frontier)는 본 규칙 대상 아님. soft → ≥2 도메인 입증 후 hard
//   격상(별도 promotion DEC).
// soft 불변: 모든 finding severity=medium 고정. high 경로는 ORACLE_MISSING_SEVERITY 상수로만 남겨 hard 격상
//   시 1-edit(medium→high) 전환 — 현재 high emit 0 (cli exit 0 보장 / gate-eval REQUIRED.spec 미등재와 이중 가드).

import { readFileSync, existsSync } from 'node:fs';

// hard 격상 frontier — 현재 soft(medium). ≥2 도메인 입증 후 promotion DEC 에서 'high' flip + REQUIRED.spec 등재.
export const ORACLE_MISSING_SEVERITY = 'medium';

// oracle 채널 3종 union 길이 (배열 아닌 값은 0 처리).
export function oracleCount(unit) {
  const len = (a) => (Array.isArray(a) ? a.length : 0);
  return (
    len(unit.invariant_refs) +
    len(unit.property_test_refs) +
    len(unit.characterization_snapshot_refs)
  );
}

// characterization-spec 에서 snapshot_id 집합 추출 (dead-ref 검증용 / charObj 없으면 null = 검증 skip).
export function snapshotIdSet(charObj) {
  if (!charObj || !Array.isArray(charObj.snapshots)) return null;
  return new Set(
    charObj.snapshots.map((s) => s?.snapshot_id).filter((x) => x != null),
  );
}

// 단일 unit-spec 검사. charObj(선택) 주어지면 characterization_snapshot_refs dead-ref 도 검사.
export function validateUnitOracle(unitSpec, charObj = null) {
  if (!unitSpec || !Array.isArray(unitSpec.units)) {
    return { applicable: false, findings: [], summary: summarize([]) };
  }
  const findings = [];
  const snapIds = snapshotIdSet(charObj);

  for (const unit of unitSpec.units) {
    if (unit?.unit_test_obligation !== 'required') continue; // waived / characterization_only = 대상 아님
    const id = unit.id ?? '(no-id)';

    // 1. oracle≥1 OR oracle_waiver(정직 면제 / 빈 사유 = schema minLength:1 이 차단)
    if (oracleCount(unit) === 0) {
      const waiver =
        typeof unit.oracle_waiver === 'string' &&
        unit.oracle_waiver.trim().length > 0;
      if (!waiver) {
        findings.push({
          kind: 'unit.oracle.missing',
          severity: ORACLE_MISSING_SEVERITY,
          unit_id: id,
          path: `units[id=${id}]`,
          message: `required UNIT "${id}" 가 검증 oracle 0건 (invariant_refs / property_test_refs / characterization_snapshot_refs 모두 비어있음) + oracle_waiver 부재. 합격선 미상 → test 단계 거짓 GREEN 위험. oracle ref 를 채우거나 oracle_waiver(정직 사유)를 명시하라.`,
        });
      }
    }

    // 2. characterization_snapshot_refs dead-ref (charObj 주어진 경우만).
    if (snapIds && Array.isArray(unit.characterization_snapshot_refs)) {
      for (const ref of unit.characterization_snapshot_refs) {
        if (!snapIds.has(ref)) {
          findings.push({
            kind: 'unit.oracle.dangling_snapshot_ref',
            severity: ORACLE_MISSING_SEVERITY,
            unit_id: id,
            path: `units[id=${id}].characterization_snapshot_refs`,
            message: `UNIT "${id}" 의 characterization_snapshot_refs "${ref}" 가 characterization-spec.snapshots 에 없음 (dead-ref).`,
          });
        }
      }
    }
  }
  return { applicable: true, findings, summary: summarize(findings) };
}

export function summarize(findings) {
  return {
    total_findings: findings.length,
    high: findings.filter((f) => f.severity === 'high').length,
    medium: findings.filter((f) => f.severity === 'medium').length,
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
