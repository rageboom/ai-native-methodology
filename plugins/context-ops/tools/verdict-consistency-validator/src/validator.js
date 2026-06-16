// verdict-consistency-validator — BC 분류(verdict) 정합 검사 (pure, testable).
// 판별 칼 = "소유한 쓰기 aggregate(sql-inventory by_type insert+update+delete)".
//   core/supporting  ⟺ write_ops>0 (per-BC, domains/<BC>/)
//   cross_cutting/read_model/operational ⟺ write_ops==0 (소유 없음)
// HARD(high): 이중분류(cross-cutting concern/dir + 등록 BC), verdict↔write_ops 모순, basis 불일치.
// ADVISORY(medium/low): verdict 부재(백필 필요), stale concern, 미등록 dir.
// DEC-2026-06-15-bc-verdict-classification.

import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const readJson = (p) => { try { return JSON.parse(readFileSync(p, 'utf8')); } catch { return null; } };
const isDir = (p) => { try { return statSync(p).isDirectory(); } catch { return false; } };
const OFFICE = new Set(['backoffice', 'frontoffice', 'core', 'epbcommon', 'geacommon', 'application', 'infrastructure', 'domain', 'src', 'main', 'java']);
const ZERO_OK = new Set(['cross_cutting', 'read_model', 'operational']);

function tally(findings) {
  const c = { critical: 0, high: 0, medium: 0, low: 0, info: 0 };
  for (const f of findings) c[f.severity] = (c[f.severity] || 0) + 1;
  return c;
}

export function validateVerdicts(outputRoot, opts = {}) {
  // 기본 advisory: high→medium(비차단). --enforce / CONTEXT_OPS_VERDICT_ENFORCE=1 시에만 HARD(gate STOP).
  // 병렬 dogfood 중 타 세션 게이트 영향 0 + 머지 후 enforce 로 승격 (DEC-2026-06-15).
  const enforce = opts.enforce === true;
  const SHARED = join(outputRoot, 'shared');
  const DOMAINS = join(outputRoot, 'domains');
  const findings = [];
  const add = (severity, kind, bc, message) => findings.push({ severity, kind, bc, message });
  if (!isDir(DOMAINS)) {
    // domains/ 부재 = 도메인 샤딩 분석 산출물이 아님 → verdict 검사 N/A (info / 비차단).
    // ★ early-return 이 advisory 강등(아래)을 우회하므로 여기서 직접 info 로 둔다 — base REQUIRED 인 비-샤딩 PoC 가
    //   high 로 게이트 HARD block 당하던 회귀 차단 (DEC-2026-06-15 "기본 advisory 비차단·타 세션 게이트 영향 0" 계약 정합).
    const f = { severity: 'info', kind: 'no-domains-na', bc: null, message: `domains/ 부재 — 도메인 샤딩 분석 산출물 아님 → verdict 검사 N/A (${DOMAINS})` };
    return { findings: [f], summary: tally([f]), mode: enforce ? 'enforce' : 'advisory' };
  }

  const domainJson = readJson(join(SHARED, 'domain.json')) || {};
  const registry = new Map((domainJson.bounded_contexts || []).map((b) => [b.id, { verdict: b.verdict || null, basis: b.verdict_basis || null, tier: b.tier || null }]));
  const bcDirs = readdirSync(DOMAINS).filter((d) => /^BC-[A-Z0-9-]+$/.test(d) && isDir(join(DOMAINS, d)));

  const facts = new Map();
  for (const bc of bcDirs) {
    const bt = readJson(join(DOMAINS, bc, 'sql-inventory', 'sql-inventory.json'))?.summary?.by_type;
    facts.set(bc, {
      read: bt ? (bt.select || 0) : null,
      write: bt ? (bt.insert || 0) + (bt.update || 0) + (bt.delete || 0) : null,
    });
  }

  // VC1 — domains/<BC>/ 가 레지스트리에 없음
  for (const bc of bcDirs) if (!registry.has(bc)) add('low', 'unregistered', bc, 'BC dir not in domain.json#bounded_contexts (registry lag / parallel-add)');

  // VC2 — verdict ↔ write_ops 정합
  for (const bc of bcDirs) {
    const f = facts.get(bc), r = registry.get(bc);
    if (!r) continue;
    if (f.write == null) { add('low', 'no-sql-data', bc, 'sql-inventory by_type missing — write_ops 계산 불가'); continue; }
    if (r.verdict) {
      if (f.write === 0 && (r.verdict === 'core' || r.verdict === 'supporting'))
        add('high', 'verdict-contradiction', bc, `verdict='${r.verdict}' 은 쓰기 aggregate 소유를 함의하나 write_ops=0`);
      if (f.write > 0 && ZERO_OK.has(r.verdict))
        add('high', 'verdict-contradiction', bc, `verdict='${r.verdict}' 은 소유 없음을 함의하나 write_ops=${f.write}`);
      if (r.basis && r.basis.write_ops != null && r.basis.write_ops !== f.write)
        add('high', 'basis-mismatch', bc, `verdict_basis.write_ops=${r.basis.write_ops} ≠ 실제 ${f.write} (날조/stale 근거)`);
    } else if (f.write === 0 && f.read > 0) {
      add('medium', 'needs-verdict-readonly', bc, `read-only (rd=${f.read}/wr=0) 등록 BC 인데 verdict 부재 — cross_cutting/read_model/operational 중 사람 판정 필요`);
    } else {
      add('low', 'needs-verdict', bc, 'verdict 필드 부재 (백필: write_ops>0 → core/supporting)');
    }
  }

  // VC3/VC4 — 이중분류 + stale concern (정밀 매칭: 모듈 토큰 + 도메인 토큰)
  const tokensOf = (bc) => bc.replace(/^BC-/, '').split('-');
  const byToken = new Map();
  for (const bc of bcDirs) if (registry.has(bc)) for (const t of tokensOf(bc)) { if (!byToken.has(t)) byToken.set(t, []); byToken.get(t).push(bc); }
  const domainMatches = (ds, bc) => { if (!ds) return true; ds = ds.toUpperCase(); return tokensOf(bc).some((t) => ds.startsWith(t) || t.startsWith(ds.slice(0, Math.max(4, Math.min(t.length, ds.length)))) || t === ds); };
  const promotedBc = (origin) => {
    const segs = (origin || '').split('/').map((s) => s.trim()).filter((s) => s && !OFFICE.has(s.toLowerCase()));
    if (!segs.length) return null;
    const cands = (byToken.get(segs[segs.length - 1].toUpperCase()) || []).filter((bc) => domainMatches(segs.length >= 2 ? segs[segs.length - 2] : null, bc));
    return cands.length === 1 ? cands[0] : null;
  };

  // de-hardcoded: glob shared/*-cross-cutting.json (프로젝트 무관 일반화) — 과거 ['biztrip-..','reservation-..'] 고정.
  const xcutFiles = existsSync(SHARED) ? readdirSync(SHARED).filter((n) => /-cross-cutting\.json$/.test(n)) : [];
  for (const xn of xcutFiles) {
    const xf = join(SHARED, xn);
    if (!existsSync(xf)) continue;
    for (const c of (readJson(xf)?.cross_cutting_concerns || [])) {
      const bc = promotedBc(c.origin_module || '');
      if (!bc) continue;
      add('high', 'double-classification', bc, `cross_cutting concern '${c.id || ''}' (origin ${c.origin_module}) 이 등록 BC ${bc} 와 동일 — cross-cutting 쌍둥이 은퇴 (${xn})`);
      if ((c.verdict || '') === 'cross_cutting') add('medium', 'stale-concern', bc, `concern '${c.id || ''}' 이 cross_cutting 으로 표기됐으나 ${bc} 는 등록 BC (${xn})`);
    }
  }
  const xd = join(SHARED, 'cross-cutting');
  if (isDir(xd)) for (const mod of readdirSync(xd).filter((m) => isDir(join(xd, m)))) {
    const bc = promotedBc(mod);
    if (bc) add('high', 'double-classification', bc, `shared/cross-cutting/${mod}/ 쌍둥이가 등록 BC ${bc} 와 공존 — 은퇴`);
  }

  // C5 — 같은 canonical 산출물의 stale 중복 표현 (business-rules.json + business-rules/ dir). high (enforce 차단).
  for (const bc of bcDirs) {
    const dir = join(DOMAINS, bc);
    if (existsSync(join(dir, 'business-rules.json')) && isDir(join(dir, 'business-rules')))
      add('high', 'duplicate-artifact', bc, `${bc} 에 business-rules.json(canonical) + business-rules/ dir 공존 — dir 형 stale/inert (삭제)`);
  }

  // C4 — 선언 tier 기반 완전성 (advisory low). tier 는 domain.json#bounded_contexts[].tier 명시 선언만 신뢰
  //   (파일 유무 추론 ❌ — use_cases-backfill leaf=domain.json 1개가 full-leaf 로 오판되던 결함 차단). 미선언 BC = 검사 skip(opt-in).
  const TIER_MANDATORY = {
    baseline: ['business-rules.json', 'openapi.yaml', 'sql-inventory'],
    characterized: ['business-rules.json', 'openapi.yaml', 'sql-inventory', 'characterization'],
    'full-leaf': ['business-rules.json', 'openapi.yaml', 'sql-inventory', 'characterization', 'bc-scope.json', 'domain.json', 'findings-analysis.json', 'migration-cautions.json', 'README.md'],
  };
  const hasArtifact = (dir, name) => {
    const p = join(dir, name);
    if (name === 'characterization') return isDir(p) && readdirSync(p).length > 0;
    if (name === 'sql-inventory') return existsSync(join(p, 'sql-inventory.json'));
    return existsSync(p);
  };
  for (const bc of bcDirs) {
    const tier = registry.get(bc)?.tier;
    if (!tier) continue; // 미선언 → skip (추론 ❌ / 명시 opt-in)
    const mand = TIER_MANDATORY[tier];
    if (!mand) { add('low', 'tier-unknown', bc, `${bc} tier='${tier}' 미정의 (baseline|characterized|full-leaf 아님)`); continue; }
    const dir = join(DOMAINS, bc);
    const missing = mand.filter((a) => !hasArtifact(dir, a));
    if (missing.length) add('low', 'incomplete-tier', bc, `${bc} 선언 tier='${tier}' 인데 mandatory 누락: ${missing.join(', ')}`);
  }

  // advisory 기본: high → medium 강등(게이트 비차단). enforce 시 high 유지(HARD block).
  if (!enforce) for (const f of findings) if (f.severity === 'high') { f.downgraded_from = 'high'; f.severity = 'medium'; }
  return { findings, summary: tally(findings), mode: enforce ? 'enforce' : 'advisory' };
}
