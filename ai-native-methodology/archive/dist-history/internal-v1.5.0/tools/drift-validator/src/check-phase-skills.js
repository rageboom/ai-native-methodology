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
