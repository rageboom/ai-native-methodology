// skill-citation-validator — 결정적 내부 인용 정합 검사 (AI 추론 0%).
//
// 대상 인용 class (low-FP / 실결함 입증된 것만 — Senior F3 content-aware 정합):
//   1. schema     : `<name>.schema.json`  → schemas/<name>.schema.json 실존 의무
//   2. repo-path  : (methodology-spec|flows|templates|schemas|docs/adr)/...(.md|.json|.yaml|.mermaid) 실존 의무
//   3. ADR        : ADR-(<NS>-)?<n>  → docs/adr/ 매칭 파일 실존 의무 (단 동일 라인 "부재/absent/대체" = 의도적 부재 → skip)
//   4. DEC        : DEC-YYYY-MM-DD-<slug>  → decisions/ 또는 INDEX-HISTORY 실존 의무 (.md 접미 정규화)
//
// scope 외 (의도적 — FP 높고 drift-validator/manifest 가 이미 커버):
//   - bare skill-name / tool-name backtick 인용 (carry/future/별도 prose 다수 = FP)
//
// 사용: node src/cli.js [--json] [--root <repoRoot>]

import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

function listSkillMd(root) {
  const skillsDir = join(root, 'skills');
  const out = [];
  for (const d of readdirSync(skillsDir)) {
    const f = join(skillsDir, d, 'SKILL.md');
    if (existsSync(f)) out.push({ skill: d, file: f });
  }
  return out.sort((a, b) => a.skill.localeCompare(b.skill));
}

function buildGroundTruth(root) {
  const schemas = new Set(
    existsSync(join(root, 'schemas'))
      ? readdirSync(join(root, 'schemas')).filter((f) => f.endsWith('.json'))
      : []
  );
  const adrRaw = existsSync(join(root, 'docs/adr'))
    ? readdirSync(join(root, 'docs/adr')).join('\n')
    : '';
  const decIds = new Set();
  if (existsSync(join(root, 'decisions'))) {
    for (const f of readdirSync(join(root, 'decisions'))) {
      if (f.startsWith('DEC-')) decIds.add(f.replace(/\.md$/, ''));
    }
    for (const hist of ['INDEX-HISTORY.md', 'STATUS-HISTORY.md']) {
      const p = join(root, 'decisions', hist);
      if (existsSync(p)) {
        const t = readFileSync(p, 'utf-8');
        for (const m of t.matchAll(/DEC-\d{4}-\d{2}-\d{2}-[^\s)\]|`,]+/g)) {
          decIds.add(m[0].replace(/\.md$/, ''));
        }
      }
    }
  }
  return { schemas, adrRaw, decIds };
}

const ABSENCE_CTX = /부재|absent|대체|폐기|없음|deprecated|미존재/i;

export function checkCitations(root) {
  root = resolve(root);
  const gt = buildGroundTruth(root);
  const findings = [];
  const add = (skill, line, kind, ref, why) =>
    findings.push({ skill, line, kind, ref, why });

  for (const { skill, file } of listSkillMd(root)) {
    const text = readFileSync(file, 'utf-8');
    const lines = text.split(/\r?\n/);
    for (let i = 0; i < lines.length; i++) {
      const ln = lines[i];
      const lineNo = i + 1;

      // 1. schema citations
      for (const m of ln.matchAll(/([a-z0-9][a-z0-9-]*\.schema\.json)/g)) {
        if (!gt.schemas.has(m[1])) {
          add(skill, lineNo, 'schema', m[1], 'schemas/ 부재 (rename drift 의심)');
        }
      }

      // 2. repo file paths
      for (const m of ln.matchAll(
        /\b(methodology-spec|flows|templates|schemas|docs\/adr)\/[A-Za-z0-9._/가-힣-]+\.(?:md|json|yaml|mermaid)\b/g
      )) {
        const rel = m[0];
        if (rel.includes('*')) continue;
        if (!existsSync(join(root, rel))) {
          add(skill, lineNo, 'repo-path', rel, '실파일 부재 (재구조화 drift 의심)');
        }
      }

      // 3. ADR ids (부재-context = 의도적 → skip)
      for (const m of ln.matchAll(/\bADR-(?:[A-Z]+-)?\d{1,3}\b/g)) {
        if (ABSENCE_CTX.test(ln)) continue;
        if (!gt.adrRaw.includes(m[0])) {
          add(skill, lineNo, 'adr', m[0], 'docs/adr/ 부재');
        }
      }

      // 4. DEC ids (.md 정규화 + decisions/ + history)
      for (const m of ln.matchAll(/\bDEC-\d{4}-\d{2}-\d{2}-[^\s)\]|`,]+/g)) {
        const id = m[0].replace(/\.md$/, '').replace(/[.,]$/, '');
        if (!gt.decIds.has(id)) {
          add(skill, lineNo, 'dec', id, 'decisions/ + INDEX-HISTORY 부재');
        }
      }
    }
  }
  return {
    root,
    skill_count: listSkillMd(root).length,
    finding_count: findings.length,
    findings,
  };
}
