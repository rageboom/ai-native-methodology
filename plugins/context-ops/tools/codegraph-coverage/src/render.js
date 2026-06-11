// render.js — coverage 결과 → 비차단 finding + 사람용 markdown (순수 / I/O 없음).
//   trust ceiling (Senior must-fix / DEC §2 invariant 를 prose→코드): coverage-hole finding 은 severity low|medium 만.
//     차단 등급(상위 2 severity) 절대 금지 — findings-aggregator 가 차단 등급만 gate-block 하므로, ceiling 으로 gate leak 구조적 차단.
//     route hole = medium (clean signal) / method hole = low (noise-prone). check34 가 본 ceiling 을 회귀 가드 (본 파일에 상위 등급 리터럴 0 강제).

// 허용 severity 화이트리스트 — 이 배열 밖 값은 throw (코드 강제 / pin).
export const SEVERITY_CEILING = Object.freeze(['low', 'medium']);

export function pinSeverity(s) {
	if (!SEVERITY_CEILING.includes(s)) {
		throw new Error(
			`[codegraph-coverage] severity ceiling 위반: '${s}' — coverage-hole 은 ${SEVERITY_CEILING.join('|')} 만 (gate blocker ❌ / trust 경계)`,
		);
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
				// v12.10.0 STEP 2 — codegraph 코드 앵커 (auto-seed / promote 시 finding-system code_graph_ref 로 이식).
				code_graph_ref: {
					kind: 'route',
					symbol: sym,
					...(h.file ? { file: h.file } : {}),
				},
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
				code_graph_ref: {
					kind: 'method',
					symbol: h.symbol,
					...(h.file ? { file: h.file } : {}),
				},
			});
		}
	}
	// v12.11.0 STEP 3 — module dependency coverage-hole (codegraph有 / arch.json無 = LLM 놓친 결정론 의존).
	//   holes 만 순회 — informational_notes(onlyArch=codegraph 사각)는 finding 채널 진입 절대 ❌ (구조적 절단 / Senior must-fix#3 / check36 가드).
	if (coverage.axes.module?.holes?.length) {
		for (const h of coverage.axes.module.holes) {
			// F-DOGFOOD-013 — 이름-해석 의심(import 도달 미확인) hole = finding 채널 미진입.
			//   codegraph 이름-기반 fallback 오연결(모노레포 동명 심볼) 노이즈 차단 — report 에는 정직 잔존.
			if (h.import_verified === false) continue;
			const sym = `${h.from} → ${h.to}`;
			const ek = Array.isArray(h.edge_kinds) ? h.edge_kinds.join(',') : '';
			findings.push({
				id: next(),
				axis: 'module',
				severity: pinSeverity('low'),
				message: `module 의존 ${sym} (weight ${h.weight}${ek ? ' / ' + ek : ''}) 가 코드에 존재(codegraph cross-file edge)하나 architecture.json dependencies[] 미문서화 — module dependency coverage-hole (LLM 의존그래프 불완전 / 사람 확인)`,
				evidence: h.sample_file ? [h.sample_file] : [],
				code_graph_ref: {
					kind: 'module_dependency',
					symbol: sym,
					...(h.sample_file ? { file: h.sample_file } : {}),
				},
			});
		}
	}
	return findings;
}

// freshness STALE 배너 (graph-freshness 패턴 — display-only).
function freshnessBanner(fresh) {
	if (!fresh || !fresh.available) return null;
	if (!fresh.stale)
		return `🟢 codegraph 인덱스 fresh (indexed_at=${fresh.indexed_at})`;
	return `⚠️ STALE — codegraph 인덱스(${fresh.indexed_at}) 이후 source ${fresh.stale_count}개 변경 → 결과 부정확 가능. 재인덱싱: \`codegraph index\` (예: ${(fresh.stale_sample || []).slice(0, 3).join(', ')})`;
}

export function renderMarkdown(report) {
	const L = [];
	L.push('# codegraph coverage-hole — [code→artifact / reference-lens]');
	L.push('');
	const banner = freshnessBanner(report.codegraph?.freshness);
	if (banner) {
		L.push(`> ${banner}`);
		L.push('');
	}
	L.push(
		`> trust: reference-lens / 비차단(severity ${SEVERITY_CEILING.join('|')}) / 결정적 gate inject ❌. 최종 evidence = 실코드 grep.`,
	);
	L.push(
		`> target: \`${report.target}\` · stack: ${report.stack?.language ?? '?'} · 활성 axis: ${(report.active_axes || []).join(', ')}`,
	);
	L.push('');

	const s = report.coverage.stats;
	const moduleStat = report.coverage.axes.module
		? ` · **module**: ${s.module_holes ?? 0}/${s.module_total ?? 0} hole (+${s.module_informational ?? 0} informational)`
		: '';
	L.push(
		`**route**: ${s.route_holes}/${s.route_total} hole · **method**: ${s.method_holes}/${s.method_total} hole${moduleStat} · **undetectable axis**: ${s.undetectable_axes}`,
	);
	L.push('');

	const r = report.coverage.axes.route;
	if (r) {
		L.push(
			`## route coverage (detectable / total=${r.total} covered=${r.covered} hole=${r.holes.length} / excluded=${r.excluded_count} dynamic=${r.dynamic_count})`,
		);
		if (r.holes.length === 0)
			L.push('_route hole 없음 — 모든 code route 가 산출물에 커버됨._');
		for (const h of r.holes)
			L.push(`- ⚠ \`${h.verb ? h.verb + ' ' : ''}${h.path}\`  (${h.file})`);
		L.push('');
	}
	const m = report.coverage.axes.method;
	if (m) {
		L.push(
			`## method coverage (detectable / total=${m.total} covered=${m.covered} hole=${m.holes.length} / filtered=${m.filtered})`,
		);
		if (m.holes.length === 0) L.push('_method hole 없음._');
		for (const h of m.holes.slice(0, 80))
			L.push(`- ⚠ \`${h.symbol}\`  (${h.file})`);
		if (m.holes.length > 80) L.push(`- … (+${m.holes.length - 80} more)`);
		L.push('');
	}
	const mod = report.coverage.axes.module;
	if (mod) {
		const iv = mod.import_verification;
		const ivStat =
			iv?.status === 'done'
				? ` / import-verified=${iv.verified} 의심=${iv.unverified}`
				: '';
		L.push(
			`## module dependency coverage (detectable / codegraph 결정론 의존=${mod.total} corroborated=${mod.covered} hole=${mod.holes.length}${ivStat} / modules=${mod.module_count})`,
		);
		L.push(
			'> "대치" 아니라 결정론 corroboration lens — arch.json dependencies[] 를 codegraph cross-file edge 로 corroborate + LLM 놓친 의존 노출. arch.json 무수정.',
		);
		if (mod.holes.length === 0)
			L.push(
				'_module dependency hole 없음 — codegraph 결정론 의존이 모두 architecture.json 에 문서화됨._',
			);
		// F-DOGFOOD-013 — verified(import 도달 확인) 와 unverified(이름-해석 의심) 분리 표기.
		//   verified === false 만 의심 — undefined(검증 skip)는 기존 표기 유지 (backward-compat).
		const verifiedHoles = mod.holes.filter((h) => h.import_verified !== false);
		const suspectHoles = mod.holes.filter((h) => h.import_verified === false);
		for (const h of verifiedHoles.slice(0, 80))
			L.push(
				`- ⚠ \`${h.from} → ${h.to}\`  weight=${h.weight}${Array.isArray(h.edge_kinds) && h.edge_kinds.length ? ' [' + h.edge_kinds.join(',') + ']' : ''}  (${h.sample_file})`,
			);
		if (verifiedHoles.length > 80)
			L.push(`- … (+${verifiedHoles.length - 80} more)`);
		L.push('');
		if (suspectHoles.length) {
			L.push(
				'### 이름-해석 의심 (import 도달 미확인 — finding 미진입 / F-DOGFOOD-013)',
			);
			L.push(
				'> source 파일에 target 으로 도달하는 import(상대/tsconfig alias/workspace 패키지)가 없음 — codegraph 이름-기반 fallback 오연결(모노레포 동명 심볼 / 클로저·외부패키지 정의 미인덱스 흡인) 가능성. 결함 주장 ❌ / 최종 판단 = 사람 (실코드 grep).',
			);
			for (const h of suspectHoles.slice(0, 40))
				L.push(
					`- ⓘ \`${h.from} → ${h.to}\`  weight=${h.weight}  (${h.sample_file})`,
				);
			if (suspectHoles.length > 40)
				L.push(`- … (+${suspectHoles.length - 40} more)`);
			L.push('');
		}
		// informational_notes (onlyArch = codegraph 사각) — 결함 보고 ❌ / severity 부재 / finding 채널 진입 ❌.
		if (mod.informational_notes?.length) {
			L.push(
				'### informational notes (arch.json有 / codegraph無 = codegraph 사각 — not a defect / 부재 ≠ 거짓)',
			);
			L.push(
				'> codegraph 가 못 본 의존(런타임 DI/decorator/config 와이어링 등). 결함 아님 — coverage-hole/finding 으로 보고 ❌. 최종 판단 = 사람.',
			);
			for (const n of mod.informational_notes)
				L.push(
					`- \`${n.from} → ${n.to}\`${n.type ? ' (' + n.type + ')' : ''} — codegraph 미검출 (런타임 와이어링/iBATIS2/동적 가능 / 부재≠거짓)`,
				);
			L.push('');
		}
	}
	if (report.coverage.undetectable.length) {
		L.push(
			'## undetectable / unverified axes (검출불가 — 정직 carry / per-entity hole ❌)',
		);
		for (const u of report.coverage.undetectable)
			L.push(`- \`${u.axis}\` [${u.state}] — ${u.reason}`);
		L.push('');
	}
	return L.join('\n').trimEnd();
}
