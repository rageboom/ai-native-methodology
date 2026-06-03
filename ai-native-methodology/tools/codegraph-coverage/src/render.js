// render.js — coverage 결과 → 비차단 finding + 사람용 markdown (순수 / I/O 없음).
//   ★ ★ trust ceiling (Senior must-fix / DEC §2 invariant 를 prose→코드): coverage-hole finding 은 severity low|medium 만.
//     차단 등급(상위 2 severity) 절대 금지 — findings-aggregator 가 차단 등급만 gate-block 하므로, ceiling 으로 gate leak 구조적 차단.
//     route hole = medium (clean signal) / method hole = low (noise-prone). check34 가 본 ceiling 을 회귀 가드 (본 파일에 상위 등급 리터럴 0 강제).

// ★ 허용 severity 화이트리스트 — 이 배열 밖 값은 throw (코드 강제 / pin).
export const SEVERITY_CEILING = Object.freeze(['low', 'medium']);

export function pinSeverity(s) {
  if (!SEVERITY_CEILING.includes(s)) {
    throw new Error(`[codegraph-coverage] severity ceiling 위반: '${s}' — coverage-hole 은 ${SEVERITY_CEILING.join('|')} 만 (gate blocker ❌ / trust 경계)`);
  }
  return s;
}

/**
 * coverage 결과 → finding 배열 (reference-lens / 비차단 / 사람 검토 후 promote).
 * @returns {Array<{id,axis,severity,message,evidence}>}
 */
export function toFindings(coverage) {
  const findings = [];
  let seq = 1;
  const next = () => `F-CGCOV-${String(seq++).padStart(3, '0')}`;

  if (coverage.axes.route?.holes?.length) {
    for (const h of coverage.axes.route.holes) {
      const sym = `${h.verb ? h.verb + ' ' : ''}${h.path}`.trim();
      findings.push({
        id: next(),
        axis: 'route',
        severity: pinSeverity('medium'),
        message: `route ${h.verb ? h.verb + ' ' : ''}${h.path} 가 코드에 존재하나 어떤 산출물(AC/discovery/impl/test) 도 미참조 — endpoint coverage-hole`,
        evidence: h.file ? [h.file] : [],
        // ★ v12.10.0 STEP 2 — codegraph 코드 앵커 (auto-seed / promote 시 finding-system code_graph_ref 로 이식).
        code_graph_ref: { kind: 'route', symbol: sym, ...(h.file ? { file: h.file } : {}) },
      });
    }
  }
  if (coverage.axes.method?.holes?.length) {
    for (const h of coverage.axes.method.holes) {
      findings.push({
        id: next(),
        axis: 'method',
        severity: pinSeverity('low'),
        message: `public 메서드 ${h.symbol} 가 코드에 존재하나 어떤 산출물(impl/test/AC code_pointers) 도 미참조 — orphan-impl coverage-hole (noise-prone / 사람 확인)`,
        evidence: h.file ? [h.file] : [],
        code_graph_ref: { kind: 'method', symbol: h.symbol, ...(h.file ? { file: h.file } : {}) },
      });
    }
  }
  return findings;
}

// freshness STALE 배너 (graph-freshness 패턴 — display-only).
function freshnessBanner(fresh) {
  if (!fresh || !fresh.available) return null;
  if (!fresh.stale) return `🟢 codegraph 인덱스 fresh (indexed_at=${fresh.indexed_at})`;
  return `⚠️ STALE — codegraph 인덱스(${fresh.indexed_at}) 이후 source ${fresh.stale_count}개 변경 → 결과 부정확 가능. 재인덱싱: \`codegraph index\` (예: ${(fresh.stale_sample || []).slice(0, 3).join(', ')})`;
}

export function renderMarkdown(report) {
  const L = [];
  L.push('# codegraph coverage-hole — [code→artifact / reference-lens]');
  L.push('');
  const banner = freshnessBanner(report.codegraph?.freshness);
  if (banner) { L.push(`> ${banner}`); L.push(''); }
  L.push(`> ★ trust: reference-lens / 비차단(severity ${SEVERITY_CEILING.join('|')}) / 결정적 gate inject ❌. 최종 evidence = 실코드 grep.`);
  L.push(`> target: \`${report.target}\` · stack: ${report.stack?.language ?? '?'} · 활성 axis: ${(report.active_axes || []).join(', ')}`);
  L.push('');

  const s = report.coverage.stats;
  L.push(`**route**: ${s.route_holes}/${s.route_total} hole · **method**: ${s.method_holes}/${s.method_total} hole · **undetectable axis**: ${s.undetectable_axes}`);
  L.push('');

  const r = report.coverage.axes.route;
  if (r) {
    L.push(`## route coverage (detectable / total=${r.total} covered=${r.covered} hole=${r.holes.length} / excluded=${r.excluded_count} dynamic=${r.dynamic_count})`);
    if (r.holes.length === 0) L.push('_route hole 없음 — 모든 code route 가 산출물에 커버됨._');
    for (const h of r.holes) L.push(`- ⚠ \`${h.verb ? h.verb + ' ' : ''}${h.path}\`  (${h.file})`);
    L.push('');
  }
  const m = report.coverage.axes.method;
  if (m) {
    L.push(`## method coverage (detectable / total=${m.total} covered=${m.covered} hole=${m.holes.length} / filtered=${m.filtered})`);
    if (m.holes.length === 0) L.push('_method hole 없음._');
    for (const h of m.holes.slice(0, 80)) L.push(`- ⚠ \`${h.symbol}\`  (${h.file})`);
    if (m.holes.length > 80) L.push(`- … (+${m.holes.length - 80} more)`);
    L.push('');
  }
  if (report.coverage.undetectable.length) {
    L.push('## undetectable / unverified axes (검출불가 — 정직 carry / per-entity hole ❌)');
    for (const u of report.coverage.undetectable) L.push(`- \`${u.axis}\` [${u.state}] — ${u.reason}`);
    L.push('');
  }
  return L.join('\n').trimEnd();
}
