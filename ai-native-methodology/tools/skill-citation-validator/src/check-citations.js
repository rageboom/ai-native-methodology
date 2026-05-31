// skill-citation-validator — 결정적 내부 인용 정합 검사 (AI 추론 0%).
//
// scope = repo-wide **active shipped 표면** (v8.1.1 — SKILL.md 한정 → 전 활성 doc 확장).
//   대상 확장자: .md / .mermaid
//   EXCLUDE (역사 보존 LL-i-52 / 생성물 / 외부): node_modules·.git·.aimd·.claude·.github·briefing·dist·examples·archive
//             + CHANGELOG*·*HISTORY*·decisions/DEC-*·decisions/STATUS*·decisions/INDEX*(과거 DEC 서술 = history-summary)
//
// 검사 class (low-FP / 실결함 입증):
//   1. schema    : `<name>.schema.json`  → schemas/<name>.schema.json 실존
//   2. repo-path : (methodology-spec|flows|templates|schemas|docs|tools|skills|agents|scripts|guides)/….(md|json|yaml|yml|mermaid|js|ts) 실존
//   3. ADR       : ADR-(<NS>-)?<n>  → docs/adr/ 파일이 해당 id 로 **시작**(prefix) (단 동일 라인 부재-context → skip)
//   4. DEC       : DEC-YYYY-MM-DD-<slug>  → decisions/ 또는 history-index 의 DEC 가 해당 id 로 **시작**(prefix / 파일명 서술 suffix 흡수)
//
// ★ v8.1.1 — ADR/DEC = exact-match → **prefix-match** 교정 (파일명 descriptive suffix 때문에 단축 id 인용 FP 였음).
// scope 외 (의도적): bare skill/tool 이름 backtick (drift-validator·manifest 커버 / FP 高).
//
// 사용: node src/cli.js [--json] [--root <repoRoot>]

import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join, resolve, extname, relative, sep } from 'node:path';

const SCAN_EXT = new Set(['.md', '.mermaid']);
const SKIP_DIR = new Set([
  'node_modules', '.git', '.aimd', '.claude', '.github', 'briefing',
  'dist', 'examples', 'archive',
]);
// history-class / 의도적 구 이름 보존 (LL-i-52) — 검사 제외:
//  - CHANGELOG* / *HISTORY* / decisions/STATUS* / decisions/DEC-* / decisions/INDEX*
//  - decisions/INSPECTION-* = 워크스페이스 점검 리포트 (★ F-X02 — finding-quote 안 decision-time stale 경로 인용 / shipped SSOT ❌ / DEC·STATUS 동류). 점검 산출물이 자기 dead-link 도입 회피.
//  - docs/adr/  = ADR = accepted immutable decision record (decision-time 인용 / DEC·CHANGELOG 와 동일 rationale)
//  - templates/adoption/ = downstream-project scaffold (placeholder 예시 content 설계 / methodology SSOT ❌)
const HISTORY_FILE =
  /(^|\/)CHANGELOG|HISTORY|(^|\/)decisions\/STATUS|(^|\/)decisions\/DEC-|(^|\/)decisions\/INDEX|(^|\/)decisions\/INSPECTION-|(^|\/)docs\/adr\/|(^|\/)templates\/adoption\//;
// 명백 FP (외부 URL fragment / placeholder).
const FP_LINE = /docs\/en\/|poc-NN|poc-\{|\bNN-layer|<[a-z-]+>/;
// 의도적 부재 / supersession / future-carry — 현재-dead-link 주장 아님 → skip.
// 의도적 부재 / supersession / future-carry / 흡수(제거된 구 자산 historical mapping LL-i-52) — 현재-dead-link 주장 아님 → skip.
const ABSENCE_CTX = /부재|absent|대체|폐기|없음|deprecated|미존재|scope-out|retract|격상|승격|supersed|\bcarry\b|후보|candidate|예정|미생성|\bfuture\b|흡수/i;

function buildGroundTruth(root) {
  const schemas = new Set(
    existsSync(join(root, 'schemas'))
      ? readdirSync(join(root, 'schemas')).filter((f) => f.endsWith('.json'))
      : []
  );
  const adrFiles = existsSync(join(root, 'docs/adr'))
    ? readdirSync(join(root, 'docs/adr')).filter((f) => f.endsWith('.md'))
    : [];
  // DEC ids (파일 + history index 안 인용) — prefix 매칭용 정렬 배열.
  const decFiles = [];
  const decDir = join(root, 'decisions');
  if (existsSync(decDir)) {
    for (const f of readdirSync(decDir)) {
      if (f.startsWith('DEC-')) decFiles.push(f.replace(/\.md$/, ''));
    }
    for (const idx of ['INDEX-HISTORY.md', 'STATUS-HISTORY.md', 'INDEX.md']) {
      const p = join(decDir, idx);
      if (existsSync(p)) {
        const t = readFileSync(p, 'utf-8');
        for (const m of t.matchAll(/DEC-\d{4}-\d{2}-\d{2}-[^\s)\]|`,]+/g)) {
          decFiles.push(m[0].replace(/\.md$/, ''));
        }
      }
    }
  }
  return { schemas, adrFiles, decFiles };
}

const adrResolves = (gt, id) => gt.adrFiles.some((f) => f.startsWith(id));
const decResolves = (gt, id) => gt.decFiles.some((f) => f === id || f.startsWith(id));

function listScanFiles(root) {
  const out = [];
  const stack = [root];
  while (stack.length) {
    const d = stack.pop();
    let entries;
    try { entries = readdirSync(d, { withFileTypes: true }); } catch { continue; }
    for (const e of entries) {
      const full = join(d, e.name);
      if (e.isDirectory()) {
        if (!SKIP_DIR.has(e.name)) stack.push(full);
        continue;
      }
      if (!SCAN_EXT.has(extname(e.name))) continue;
      const rel = relative(root, full).split(sep).join('/');
      if (HISTORY_FILE.test(rel)) continue;
      out.push({ rel, full });
    }
  }
  return out.sort((a, b) => a.rel.localeCompare(b.rel));
}

export function checkCitations(root) {
  root = resolve(root);
  const gt = buildGroundTruth(root);
  const have = (p) => existsSync(join(root, p));
  const findings = [];
  const files = listScanFiles(root);

  for (const { rel, full } of files) {
    const fileDir = full.slice(0, full.length - (rel.split('/').pop()?.length ?? 0));
    // root-relative OR citing-file-relative (도구-local docs/ 등 상대 인용 흡수).
    const resolvable = (p) => existsSync(join(root, p)) || existsSync(join(fileDir, p));
    const lines = readFileSync(full, 'utf-8').split(/\r?\n/);
    // migration/absorption 표 인식 — header 가 흡수/보존/migrated/legacy 면 그 표 region 의 row 인용은
    // 제거된 구 자산의 historical mapping (LL-i-52 / 재작성 ❌) → skip.
    let inMigrationTable = false;
    for (let i = 0; i < lines.length; i++) {
      const ln = lines[i];
      if (/^\s*#/.test(ln) || ln.trim() === '') inMigrationTable = false;
      else if (/^\s*\|.*(흡수|보존|migrated|legacy|absorbed|구 자산|deprecated).*\|/i.test(ln))
        inMigrationTable = true;
      if (inMigrationTable && /^\s*\|/.test(ln)) continue;
      if (FP_LINE.test(ln)) continue;
      const lineNo = i + 1;
      const add = (kind, ref, why) =>
        findings.push({ file: rel, line: lineNo, kind, ref, why });

      for (const m of ln.matchAll(/([a-z0-9][a-z0-9-]*\.schema\.json)/g)) {
        if (!gt.schemas.has(m[1])) add('schema', m[1], 'schemas/ 부재 (rename drift)');
      }
      for (const m of ln.matchAll(
        /\b(methodology-spec|flows|templates|schemas|docs|tools|skills|agents|scripts|guides)\/[A-Za-z0-9._/가-힣-]+\.(?:md|json|yaml|yml|mermaid|js|ts)\b/g
      )) {
        if (m[0].includes('*')) continue;
        if (ABSENCE_CTX.test(ln)) continue; // 의도적 부재 / future-carry 후보 경로
        if (!resolvable(m[0])) add('repo-path', m[0], '실파일 부재 (재구조화 drift)');
      }
      for (const m of ln.matchAll(/\bADR-(?:[A-Z]+-)?\d{1,3}\b/g)) {
        if (ABSENCE_CTX.test(ln)) continue;
        if (!adrResolves(gt, m[0])) add('adr', m[0], 'docs/adr/ prefix 매칭 부재');
      }
      for (const m of ln.matchAll(/\bDEC-\d{4}-\d{2}-\d{2}-[A-Za-z0-9가-힣-]+/g)) {
        const id = m[0].replace(/\.md$/, '');
        if (ABSENCE_CTX.test(ln)) continue;
        if (!decResolves(gt, id)) add('dec', id, 'decisions/ prefix 매칭 부재');
      }
    }
  }
  return {
    root,
    scanned_file_count: files.length,
    finding_count: findings.length,
    findings,
  };
}
