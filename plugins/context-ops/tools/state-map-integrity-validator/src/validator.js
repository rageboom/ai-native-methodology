/**
 * state-map.json 참조 무결성 검증 (FE 상태 머신 / 산출물 8).
 *
 * 배경: schemas/state-map.schema.json 은 transition `target` / `initial` /
 *   `final_states` / `child_states` / parallel `regions` / history `default_target`
 *   를 모두 free string 으로 두어(JSON Schema 구조적 한계), "정의된 state 를 가리키는가"
 *   를 검증하지 못한다. 미정의 state 로 전이하는 schema-valid state-map 이
 *   schema-validator + evidence-scan 을 모두 GREEN 통과하던 갭을 닫는다.
 *   (br-cross-consistency-validator 의 FE 판 — 100% 결정론 구조 검사 / gate 적법.)
 *
 * severity 비대칭 (W3C SCXML 1.0 REC §3.11 + XState v5 stateUtils.ts 선례 정합):
 *   - dangling reference (target/initial/final/child/history/parallel ∉ states) = high (gating)
 *       W3C: target 은 "legal state specification" MUST → 비적합 문서.
 *       XState v5: undefined target/initial 은 machine 생성 시점 throw (hard error).
 *   - 도달 불가 state (initial 서 BFS 미도달) = medium (advisory / non-gating)
 *       guarded transition · 의도적 dead state · 부모/병렬 진입으로 false-positive 구조적 내재
 *       → XState graph 도구·YAKINDU 모두 severity 미부여 (advisory 통념).
 *
 * 입력 형식: canonical 스키마 포맷 { machines: [{ id, initial, states, ... }] }.
 *   machines 부재 또는 [] (BE / FE 무관 산출물) → passed=true, 0 findings (N/A).
 *   old-format(state_machines[]) 거부는 schema-validator 소관 (double-jeopardy 회피).
 *
 * 출력: { passed, findings, summary:{critical,high,medium,low,info}, machine_count }
 *   findings-aggregator transformGeneric 가 summary.high → gate-eval validator_high (HARD_BLOCK) 매핑.
 */

const SEVERITIES = ['critical', 'high', 'medium', 'low', 'info'];

export function validateStateMap(doc) {
	const machines = Array.isArray(doc?.machines) ? doc.machines : [];

	const findings = [];
	const summary = { critical: 0, high: 0, medium: 0, low: 0, info: 0 };
	let seq = 0;

	const add = (severity, machineId, rule, message, extra = {}) => {
		seq += 1;
		findings.push({
			id: `F-STATEMAP-${String(seq).padStart(3, '0')}`,
			severity,
			machine_id: machineId,
			rule,
			message,
			...extra,
		});
		if (SEVERITIES.includes(severity)) summary[severity] += 1;
	};

	for (const m of machines) {
		if (!m || typeof m !== 'object') continue;
		const machineId = typeof m.id === 'string' ? m.id : '<unknown>';
		const states =
			m.states && typeof m.states === 'object' && !Array.isArray(m.states)
				? m.states
				: {};
		const defined = new Set(Object.keys(states));

		// states 부재 = 검사 대상 없음 (schema 가 states required 이므로 여기 도달 시 skip).
		if (defined.size === 0) continue;

		// 1. initial ∈ states (머신 시작점)
		if (
			typeof m.initial === 'string' &&
			m.initial.length > 0 &&
			!defined.has(m.initial)
		) {
			add(
				'high',
				machineId,
				'initial_undefined',
				`initial '${m.initial}' 이 states 에 정의되지 않음 (머신 시작 불가)`,
				{ ref: m.initial },
			);
		}

		// 2. transition target ∈ states + 3. child_states ⊆ states (state 순회 1회)
		for (const [stateName, sdef] of Object.entries(states)) {
			const node = sdef && typeof sdef === 'object' ? sdef : {};
			const on = node.on && typeof node.on === 'object' ? node.on : {};
			for (const [event, handler] of Object.entries(on)) {
				const target =
					typeof handler === 'string'
						? handler
						: handler && typeof handler.target === 'string'
							? handler.target
							: null;
				// target 없는 전이(internal transition / actions-only) = 정상 SCXML → skip.
				if (typeof target === 'string' && target.length > 0 && !defined.has(target)) {
					add(
						'high',
						machineId,
						'transition_target_undefined',
						`state '${stateName}' 의 이벤트 '${event}' 전이 target '${target}' 이 states 에 정의되지 않음`,
						{
							from_state: stateName,
							event,
							ref: target,
							...(handler && typeof handler === 'object' && handler.source_ref
								? { source_ref: handler.source_ref }
								: {}),
						},
					);
				}
			}
			for (const child of Array.isArray(node.child_states)
				? node.child_states
				: []) {
				if (typeof child === 'string' && !defined.has(child)) {
					add(
						'high',
						machineId,
						'child_state_undefined',
						`compound state '${stateName}' 의 child_state '${child}' 이 states 에 정의되지 않음`,
						{ from_state: stateName, ref: child },
					);
				}
			}
		}

		// 4. final_states ⊆ states
		for (const fs of Array.isArray(m.final_states) ? m.final_states : []) {
			if (typeof fs === 'string' && !defined.has(fs)) {
				add(
					'high',
					machineId,
					'final_state_undefined',
					`final_states 의 '${fs}' 이 states 에 정의되지 않음`,
					{ ref: fs },
				);
			}
		}

		// 5. parallel_regions[].regions ⊆ states
		for (const pr of Array.isArray(m.parallel_regions) ? m.parallel_regions : []) {
			for (const region of Array.isArray(pr?.regions) ? pr.regions : []) {
				if (typeof region === 'string' && !defined.has(region)) {
					add(
						'high',
						machineId,
						'parallel_region_undefined',
						`parallel '${pr?.id ?? '<unknown>'}' 의 region '${region}' 이 states 에 정의되지 않음`,
						{ parallel_id: pr?.id, ref: region },
					);
				}
			}
		}

		// 6. history[].default_target ∈ states (state_id 는 선언 id — 참조 아님 → 검사 제외, false-positive 회피)
		for (const h of Array.isArray(m.history) ? m.history : []) {
			if (
				typeof h?.default_target === 'string' &&
				h.default_target.length > 0 &&
				!defined.has(h.default_target)
			) {
				add(
					'high',
					machineId,
					'history_default_target_undefined',
					`history '${h?.state_id ?? '<unknown>'}' 의 default_target '${h.default_target}' 이 states 에 정의되지 않음`,
					{ history_id: h?.state_id, ref: h.default_target },
				);
			}
		}

		// 7. 도달성 (advisory / medium / non-gating) — initial 이 유효할 때만.
		if (typeof m.initial === 'string' && defined.has(m.initial)) {
			const reachable = computeReachable(m, states, defined);
			for (const s of defined) {
				if (!reachable.has(s)) {
					add(
						'medium',
						machineId,
						'state_unreachable',
						`state '${s}' 이 initial '${m.initial}' 로부터 도달 불가 (advisory — 의도적 dead state/부모·병렬 진입으로 false-positive 주의 / non-gating)`,
						{ ref: s },
					);
				}
			}
		}
	}

	const passed = summary.critical === 0 && summary.high === 0;
	return { passed, findings, summary, machine_count: machines.length };
}

/**
 * initial 로부터 도달 가능한 state 집합 (BFS). 보수적 seed —
 *   parallel regions + history default_target 은 컨테이너 진입 시 활성이므로 도달로 간주
 *   (false unreachable 최소화 / advisory 특성).
 */
function computeReachable(m, states, defined) {
	const reachable = new Set();
	const queue = [];
	const seed = (s) => {
		if (typeof s === 'string' && defined.has(s) && !reachable.has(s)) {
			reachable.add(s);
			queue.push(s);
		}
	};

	seed(m.initial);
	for (const pr of Array.isArray(m.parallel_regions) ? m.parallel_regions : [])
		for (const r of Array.isArray(pr?.regions) ? pr.regions : []) seed(r);
	for (const h of Array.isArray(m.history) ? m.history : [])
		seed(h?.default_target);

	while (queue.length > 0) {
		const cur = queue.shift();
		const node = states[cur] && typeof states[cur] === 'object' ? states[cur] : {};
		const on = node.on && typeof node.on === 'object' ? node.on : {};
		for (const handler of Object.values(on)) {
			const t =
				typeof handler === 'string'
					? handler
					: handler && typeof handler.target === 'string'
						? handler.target
						: null;
			seed(t);
		}
		for (const child of Array.isArray(node.child_states) ? node.child_states : [])
			seed(child);
	}
	return reachable;
}
