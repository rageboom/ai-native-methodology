// check-phase-skills.js — manifest ↔ workflow ↔ skills 3-way layout 검증.
// v1.4.4 신설 (plan-v144-manifest-ssot.md / methodology-spec/skills-axis.md 정합).
// 검증:
//   1. manifest.phases[].spec_file → methodology-spec/workflow/ 안에 존재
//   2. manifest.phases[].skills[] → skills/analysis/ 안에 SKILL.md 보유
//   3. cross_cutting.aspects.skills[] → skills/analysis/ 안에 SKILL.md 보유
//   4. 역방향 — skills/analysis/ 안 모든 SKILL.md 디렉토리가 manifest 의 어디든 등록 (★ orphan 0)

import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';

const MANIFEST_REL = 'flows/analysis.phase-flow.json';
const WORKFLOW_REL = 'methodology-spec/workflow';
const SKILLS_REL = 'skills/analysis';

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
  if (existsSync(skillsDir)) {
    let entries = [];
    try { entries = readdirSync(skillsDir); } catch { /* empty */ }
    for (const name of entries) {
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
// flows/{planning,spec,test,implement}.phase-flow.json + flows/sdlc-4stage-flow.json + skills/{_base,planning,spec,test,implement}/.
// analysis stage 와 별도 axis (skills-axis.md §4 v2.0 chain stage axis).

const CHAIN_STAGES = [
  { stage: 'planning',  flow_file: 'flows/planning.phase-flow.json',  skills_dir: 'skills/planning' },
  { stage: 'spec',      flow_file: 'flows/spec.phase-flow.json',      skills_dir: 'skills/spec' },
  { stage: 'test',      flow_file: 'flows/test.phase-flow.json',      skills_dir: 'skills/test' },
  { stage: 'implement', flow_file: 'flows/implement.phase-flow.json', skills_dir: 'skills/implement' },
];

const BASE_SKILLS_DIR = 'skills/_base';

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

    // 본 stage 의 phases[] 의 skills 를 walk. 각 skill 은 phase.skills_dir 우선,
    // 없으면 cs.skills_dir, 그래도 없으면 known dir 중 어디에 있는지 search.
    const KNOWN_DIRS = [BASE_SKILLS_DIR, ...CHAIN_STAGES.map(s => s.skills_dir)];
    for (const phase of flow.phases ?? []) {
      phasesChecked++;
      for (const skill of phase.skills ?? []) {
        const overrideDir = (phase.skills_dir ?? cs.skills_dir).replace(/\/+$/, '');
        // 1) phase.skills_dir 우선
        let foundDir = null;
        if (existsSync(join(workspaceRoot, overrideDir, skill, 'SKILL.md'))) {
          foundDir = overrideDir;
        } else {
          // 2) fallback — known dir 중 어디에 있는지
          for (const d of KNOWN_DIRS) {
            if (existsSync(join(workspaceRoot, d, skill, 'SKILL.md'))) {
              foundDir = d;
              break;
            }
          }
        }
        if (!foundDir) {
          diffs.push({
            severity: 'breaking',
            kind: 'chain-flow.missing-skill-dir',
            stage: cs.stage,
            phase_id: phase.id,
            skill,
            skills_dir: overrideDir,
            message: `chain '${cs.stage}' phase '${phase.id}' skill '${skill}' SKILL.md not found in any known dir (${overrideDir} / ${KNOWN_DIRS.join(', ')})`,
          });
          continue;
        }
        allDeclaredSkills.set(`${foundDir}/${skill}`, cs.stage);
      }
    }
  }

  // 역방향 — disk skill 이 어느 chain stage 또는 analysis 에서도 등록되지 ❌ (orphan).
  // ★ skills/_base/ 는 cross-cutting (모든 stage 공용) → orphan 검사 면제 (등록 의무 ❌).
  // skills/{planning,spec,test,implement}/ 만 orphan 강제.
  const chainSubdirs = CHAIN_STAGES.map(cs => cs.skills_dir);
  for (const subdir of chainSubdirs) {
    const fullDir = join(workspaceRoot, subdir);
    if (!existsSync(fullDir)) continue;
    let entries = [];
    try { entries = readdirSync(fullDir); } catch { /* empty */ }
    for (const name of entries) {
      const full = join(fullDir, name);
      try { if (!statSync(full).isDirectory()) continue; } catch { continue; }
      if (!existsSync(join(full, 'SKILL.md'))) continue;
      const declaredKey = `${subdir}/${name}`;
      if (!allDeclaredSkills.has(declaredKey)) {
        diffs.push({
          severity: 'breaking',
          kind: 'chain-skills.orphan',
          skill: name,
          skills_dir: subdir,
          message: `chain skill '${subdir}/${name}/SKILL.md' exists but not declared in any chain flow's phases[].skills[] (★ orphan / sub-plan-4 정합)`,
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
