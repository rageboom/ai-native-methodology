// check-phase-skills.js — manifest ↔ workflow ↔ skills 3-way layout 검증.
// v1.4.4 신설 (plan-v144-manifest-ssot.md / methodology-spec/skills-axis.md 정합).
// ★ v2.5.1 PATCH — skills 1-depth + category prefix paradigm 정합 갱신 (post-v2.5.1 meta cleanup).
// ★ ★ ★ v3.0.0 MAJOR — depends_on 그래프 무결성 검증 추가 (위상정렬 + 순환 검출 / D-3 paradigm).
// 검증:
//   1. manifest.phases[].spec_file → methodology-spec/workflow/ 안에 존재
//   2. manifest.phases[].depends_on → 그래프 무결성 (DAG / unknown phase 0 / ★ v3.0)
//   3. manifest.phases[].skills[] → skills/<skill>/SKILL.md 보유 (★ skill name 자체가 'analysis-' prefix 포함)
//   4. cross_cutting.aspects.skills[] → skills/<skill>/SKILL.md 보유
//   5. 역방향 — skills/ 안 'analysis-' prefix SKILL.md 디렉토리가 manifest 의 어디든 등록 (★ orphan 0)

import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { checkDependencyGraph } from './topological-sort.js';

const MANIFEST_REL = 'flows/analysis.phase-flow.json';
const WORKFLOW_REL = 'methodology-spec/workflow';
const SKILLS_REL = 'skills';  // ★ v2.5.1 1-depth root (옛 'skills/analysis' 2-depth 폐기)
const ANALYSIS_PREFIX = 'analysis-';  // ★ category prefix paradigm

export function checkPhaseSkills(workspaceRoot) {
  const diffs = [];

  // 1. manifest 존재 확인
  const manifestPath = join(workspaceRoot, MANIFEST_REL);
  if (!existsSync(manifestPath)) {
    return {
      ok: false,
      diffs: [{ severity: 'breaking', kind: 'manifest.missing', message: `${MANIFEST_REL} not found at ${manifestPath}` }],
      counts: { phases_checked: 0, skills_declared: 0 },
    };
  }

  let manifest;
  try {
    manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));
  } catch (err) {
    return {
      ok: false,
      diffs: [{ severity: 'breaking', kind: 'manifest.parse-error', message: `${MANIFEST_REL} parse error: ${err.message}` }],
      counts: { phases_checked: 0, skills_declared: 0 },
    };
  }

  // 2. workflow spec_file 정합
  const workflowDir = join(workspaceRoot, WORKFLOW_REL);
  for (const phase of manifest.phases ?? []) {
    if (!phase.spec_file) continue;
    const path = join(workflowDir, phase.spec_file);
    if (!existsSync(path)) {
      diffs.push({
        severity: 'breaking',
        kind: 'manifest-workflow.missing-spec',
        phase_id: phase.id,
        spec_file: phase.spec_file,
        message: `phase '${phase.id}' references spec_file '${phase.spec_file}' but not found in ${WORKFLOW_REL}/`,
      });
    }
  }

  // ★ v3.0.0 — depends_on 그래프 무결성 (DAG 의무 + unknown phase 0)
  diffs.push(...checkDependencyGraph(manifest.phases ?? []));

  // 3. skills/aspects 정합 + declared set 누적
  const skillsDir = join(workspaceRoot, SKILLS_REL);
  const declaredSkills = new Set();

  for (const phase of manifest.phases ?? []) {
    for (const skill of phase.skills ?? []) {
      declaredSkills.add(skill);
      const skillPath = join(skillsDir, skill);
      if (!existsSync(skillPath)) {
        diffs.push({
          severity: 'breaking',
          kind: 'manifest-skills.missing-skill-dir',
          phase_id: phase.id,
          skill,
          message: `phase '${phase.id}' references skill '${skill}' but directory not found at ${SKILLS_REL}/${skill}`,
        });
        continue;
      }
      const skillMd = join(skillPath, 'SKILL.md');
      if (!existsSync(skillMd)) {
        diffs.push({
          severity: 'breaking',
          kind: 'manifest-skills.missing-SKILL.md',
          phase_id: phase.id,
          skill,
          message: `skill '${skill}' directory exists but SKILL.md missing at ${SKILLS_REL}/${skill}/SKILL.md`,
        });
      }
    }
  }

  const aspectsSkills = manifest.cross_cutting?.aspects?.skills ?? [];
  for (const skill of aspectsSkills) {
    declaredSkills.add(skill);
    const skillPath = join(skillsDir, skill);
    if (!existsSync(skillPath)) {
      diffs.push({
        severity: 'breaking',
        kind: 'manifest-aspects.missing-skill-dir',
        skill,
        message: `cross_cutting aspect '${skill}' directory not found at ${SKILLS_REL}/${skill}`,
      });
      continue;
    }
    const skillMd = join(skillPath, 'SKILL.md');
    if (!existsSync(skillMd)) {
      diffs.push({
        severity: 'breaking',
        kind: 'manifest-aspects.missing-SKILL.md',
        skill,
        message: `aspect '${skill}' SKILL.md missing at ${SKILLS_REL}/${skill}/SKILL.md`,
      });
    }
  }

  // 4. 역방향 — disk skill 이 manifest 에 등록 (orphan 0)
  // ★ v2.5.1 1-depth flatten 후 — skills/ 안 'analysis-' prefix 디렉토리만 본 manifest scope.
  // (★ _base-/planning-/spec-/test-/implement- prefix 는 별도 chain stage 영역 → 본 검사 면제)
  if (existsSync(skillsDir)) {
    let entries = [];
    try { entries = readdirSync(skillsDir); } catch { /* empty */ }
    for (const name of entries) {
      if (!name.startsWith(ANALYSIS_PREFIX)) continue;  // ★ analysis manifest scope 한정
      const full = join(skillsDir, name);
      try {
        if (!statSync(full).isDirectory()) continue;
      } catch { continue; }
      if (!existsSync(join(full, 'SKILL.md'))) continue;
      if (!declaredSkills.has(name)) {
        diffs.push({
          severity: 'breaking',
          kind: 'skills-manifest.orphan-skill',
          skill: name,
          message: `skill '${name}' has SKILL.md but is not declared in any manifest.phases[].skills[] or cross_cutting.aspects.skills[]`,
        });
      }
    }
  }

  return {
    ok: diffs.length === 0,
    diffs,
    counts: {
      phases_checked: manifest.phases?.length ?? 0,
      skills_declared: declaredSkills.size,
    },
  };
}

export function summarizeLayoutCheck(result) {
  const { ok, diffs, counts } = result;
  if (ok) {
    return `✅ layout check passed — ${counts.phases_checked} phases / ${counts.skills_declared} skills declared / 0 orphans / 0 missing`;
  }
  const breaking = diffs.filter((d) => d.severity === 'breaking').length;
  return `❌ layout check failed — ${breaking} breaking / ${diffs.length} total findings`;
}

// ★ ★ v2.0 sub-plan-4 신설 — chain stage layout 검증.
// flows/{planning,spec,test,implement}.phase-flow.json + flows/sdlc-4stage-flow.json + skills/ (1-depth).
// analysis stage 와 별도 axis (skills-axis.md §4 v2.0 chain stage axis + §7 v2.5.1 category prefix paradigm).
// ★ v2.5.1 PATCH — skills 1-depth + category prefix paradigm 정합 (옛 'skills/{stage}/' 2-depth 폐기).

// ★ v9.0 6-stage (analysis→discovery→spec→plan→test→implement / DEC-2026-05-21).
// planning→discovery 개칭 + plan 신설. analysis 는 별도 axis (위 주석).
const CHAIN_STAGES = [
  { stage: 'discovery', flow_file: 'flows/discovery.phase-flow.json', prefix: 'discovery-' },
  { stage: 'spec',      flow_file: 'flows/spec.phase-flow.json',      prefix: 'spec-' },
  { stage: 'plan',      flow_file: 'flows/plan.phase-flow.json',      prefix: 'plan-' },
  { stage: 'test',      flow_file: 'flows/test.phase-flow.json',      prefix: 'test-' },
  { stage: 'implement', flow_file: 'flows/implement.phase-flow.json', prefix: 'implement-' },
];

const CHAIN_SKILLS_DIR = 'skills';  // ★ v2.5.1 1-depth root

export function checkChainStageLayout(workspaceRoot) {
  const diffs = [];
  let phasesChecked = 0;
  const allDeclaredSkills = new Map();  // skill_name → first stage that declared it

  // sdlc-4stage-flow.json 존재 확인
  const sdlcPath = join(workspaceRoot, 'flows/sdlc-4stage-flow.json');
  if (!existsSync(sdlcPath)) {
    diffs.push({
      severity: 'breaking',
      kind: 'chain-flow.missing-sdlc-4stage',
      message: 'flows/sdlc-4stage-flow.json not found (★ master plan SSOT 의무 / sub-plan-4)',
    });
  }

  // 4 chain stage flow + skill 정합 검증
  for (const cs of CHAIN_STAGES) {
    const flowPath = join(workspaceRoot, cs.flow_file);
    if (!existsSync(flowPath)) {
      diffs.push({
        severity: 'breaking',
        kind: 'chain-flow.missing',
        stage: cs.stage,
        message: `${cs.flow_file} not found`,
      });
      continue;
    }

    let flow;
    try { flow = JSON.parse(readFileSync(flowPath, 'utf-8')); }
    catch (err) {
      diffs.push({
        severity: 'breaking',
        kind: 'chain-flow.parse-error',
        stage: cs.stage,
        message: `${cs.flow_file} parse error: ${err.message}`,
      });
      continue;
    }

    // ★ v2.5.1 — skill name 자체가 category prefix 포함 → 단일 'skills/<skill>/SKILL.md' lookup.
    // (옛 phase.skills_dir 필드 = lifecycle organize 사상 흔적 / runtime axis 와 무관 / 무시)
    for (const phase of flow.phases ?? []) {
      phasesChecked++;
      for (const skill of phase.skills ?? []) {
        const skillMd = join(workspaceRoot, CHAIN_SKILLS_DIR, skill, 'SKILL.md');
        if (!existsSync(skillMd)) {
          diffs.push({
            severity: 'breaking',
            kind: 'chain-flow.missing-skill-dir',
            stage: cs.stage,
            phase_id: phase.id,
            skill,
            message: `chain '${cs.stage}' phase '${phase.id}' skill '${skill}' SKILL.md not found at ${CHAIN_SKILLS_DIR}/${skill}/SKILL.md`,
          });
          continue;
        }
        allDeclaredSkills.set(skill, cs.stage);
      }
    }
  }

  // 역방향 — disk skill 이 어느 chain stage 에서도 등록되지 ❌ (orphan).
  // ★ v2.5.1 — skills/ 안 chain prefix (planning-/spec-/test-/implement-) 인 entry 만 본 검사 영역.
  // (★ _base-/analysis- prefix 는 별도 axis → 본 검사 면제)
  const fullDir = join(workspaceRoot, CHAIN_SKILLS_DIR);
  if (existsSync(fullDir)) {
    let entries = [];
    try { entries = readdirSync(fullDir); } catch { /* empty */ }
    for (const name of entries) {
      const matchingStage = CHAIN_STAGES.find((cs) => name.startsWith(cs.prefix));
      if (!matchingStage) continue;  // _base-/analysis- = 본 검사 영역 외
      const full = join(fullDir, name);
      try { if (!statSync(full).isDirectory()) continue; } catch { continue; }
      if (!existsSync(join(full, 'SKILL.md'))) continue;
      if (!allDeclaredSkills.has(name)) {
        diffs.push({
          severity: 'breaking',
          kind: 'chain-skills.orphan',
          skill: name,
          stage: matchingStage.stage,
          message: `chain skill '${name}' (prefix '${matchingStage.prefix}') has SKILL.md but not declared in any chain flow's phases[].skills[] (★ orphan / sub-plan-4 정합)`,
        });
      }
    }
  }

  return {
    ok: diffs.length === 0,
    diffs,
    counts: {
      chain_stages: CHAIN_STAGES.length,
      phases_checked: phasesChecked,
      skills_declared: allDeclaredSkills.size,
    },
  };
}

export function summarizeChainLayoutCheck(result) {
  const { ok, diffs, counts } = result;
  if (ok) {
    return `✅ chain layout check passed — ${counts.chain_stages} stages / ${counts.phases_checked} phases / ${counts.skills_declared} skills declared / 0 orphans / 0 missing`;
  }
  const breaking = diffs.filter((d) => d.severity === 'breaking').length;
  return `❌ chain layout check failed — ${breaking} breaking / ${diffs.length} total findings`;
}

// ★ ★ ★ sub-plan-6 (sp5-c7 carry / Senior F8) — state.schema.json `current_chain` enum
//     ↔ flows/sdlc-4stage-flow.json `stages[].id` 정합 build-time 검증.
const STATE_SCHEMA_PATH = 'schemas/state.schema.json';
const SDLC_FLOW_PATH = 'flows/sdlc-4stage-flow.json';
const STATE_EXTRA_VALUES = ['revisit_pending']; // not a stage; runtime-only state

export function checkStateFlowConsistency(workspaceRoot) {
  const diffs = [];

  const schemaPath = join(workspaceRoot, STATE_SCHEMA_PATH);
  const flowPath = join(workspaceRoot, SDLC_FLOW_PATH);
  if (!existsSync(schemaPath)) {
    diffs.push({
      severity: 'breaking',
      kind: 'state-flow.missing-state-schema',
      message: `${STATE_SCHEMA_PATH} not found (sub-plan-5 신설 / sub-plan-6 검증 의무)`,
    });
    return summary(diffs, 0, 0);
  }
  if (!existsSync(flowPath)) {
    diffs.push({
      severity: 'breaking',
      kind: 'state-flow.missing-sdlc-flow',
      message: `${SDLC_FLOW_PATH} not found`,
    });
    return summary(diffs, 0, 0);
  }
  const schema = JSON.parse(readFileSync(schemaPath, 'utf-8'));
  const flow = JSON.parse(readFileSync(flowPath, 'utf-8'));

  const enumValues = schema?.properties?.current_chain?.enum;
  if (!Array.isArray(enumValues)) {
    diffs.push({
      severity: 'breaking',
      kind: 'state-flow.no-current-chain-enum',
      message: 'state.schema.json properties.current_chain.enum missing or not an array',
    });
    return summary(diffs, 0, 0);
  }
  const flowStageIds = (flow?.stages || []).map((s) => s.id);

  const stageStrict = enumValues.filter((v) => !STATE_EXTRA_VALUES.includes(v));
  const enumSet = new Set(stageStrict);
  const flowSet = new Set(flowStageIds);

  for (const v of enumSet) {
    if (!flowSet.has(v)) {
      diffs.push({
        severity: 'breaking',
        kind: 'state-flow.enum-not-in-flow',
        message: `state.schema enum value '${v}' has no matching flow stage`,
      });
    }
  }
  for (const id of flowSet) {
    if (!enumSet.has(id)) {
      diffs.push({
        severity: 'breaking',
        kind: 'state-flow.flow-stage-not-in-enum',
        message: `flow stage id '${id}' missing from state.schema enum`,
      });
    }
  }

  return summary(diffs, enumSet.size, flowSet.size);

  function summary(diffs, enumCount, flowCount) {
    return {
      ok: diffs.length === 0,
      diffs,
      counts: {
        enum_strict_stages: enumCount,
        flow_stages: flowCount,
        state_extra_values: STATE_EXTRA_VALUES.length,
      },
    };
  }
}

export function summarizeStateFlowConsistency(result) {
  const { ok, diffs, counts } = result;
  if (ok) {
    return `✅ state-flow consistency passed — ${counts.flow_stages} flow stages / ${counts.enum_strict_stages} enum stages match / +${counts.state_extra_values} runtime-only enum values (e.g. revisit_pending)`;
  }
  const breaking = diffs.filter((d) => d.severity === 'breaking').length;
  return `❌ state-flow consistency failed — ${breaking} breaking / ${diffs.length} total findings`;
}
