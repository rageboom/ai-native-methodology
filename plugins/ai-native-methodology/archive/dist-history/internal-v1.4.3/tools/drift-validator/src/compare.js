// Comparator — JSON normalized vs Mermaid normalized → oasdiff-style diff list.
// Severity 분류:
//   - breaking : structural drift (state/transition 일치 안 함, sync/return 짝 누락 등)
//   - non-breaking : 부가 정보 차이 (note, label fuzzy, guard 누락 등)
//   - info : 한쪽만 있는 보조 정보 (mermaid 가 더 자세한 경우 등 — 본 방법론 의도된 패턴)

export function compareStateMachine({
	jsonNorm,
	mermaidNorm,
	jsonPath,
	mermaidPath,
}) {
	const diffs = [];

	// initial
	if (
		jsonNorm.initial &&
		mermaidNorm.initial &&
		jsonNorm.initial !== mermaidNorm.initial
	) {
		// mermaid 의 초기 state 가 JSON 의 [*] --> X 보다 더 추상적/구체적일 수 있음 → check substring/prefix.
		if (!stateMatches(jsonNorm.initial, mermaidNorm.initial)) {
			diffs.push({
				severity: 'breaking',
				kind: 'state.initial.mismatch',
				json: jsonNorm.initial,
				mermaid: mermaidNorm.initial,
				message: `initial state mismatch: json="${jsonNorm.initial}" vs mermaid="${mermaidNorm.initial}"`,
			});
		}
	} else if (jsonNorm.initial && !mermaidNorm.initial) {
		diffs.push({
			severity: 'non-breaking',
			kind: 'state.initial.missing-in-mermaid',
			json: jsonNorm.initial,
		});
	} else if (!jsonNorm.initial && mermaidNorm.initial) {
		diffs.push({
			severity: 'non-breaking',
			kind: 'state.initial.missing-in-json',
			mermaid: mermaidNorm.initial,
		});
	}

	// states (JSON 모든 state 가 mermaid 에 등장해야 — fuzzy match)
	for (const sid of jsonNorm.states) {
		if (!mermaidNorm.states.some((m) => stateMatches(sid, m))) {
			diffs.push({
				severity: 'breaking',
				kind: 'state.missing-in-mermaid',
				json: sid,
				message: `JSON state "${sid}" not found in mermaid (or no fuzzy match)`,
			});
		}
	}

	// mermaid 가 추가 state — 본 방법론 의도된 패턴 (mermaid 더 자세함). info.
	for (const sid of mermaidNorm.states) {
		if (!jsonNorm.states.some((j) => stateMatches(j, sid))) {
			diffs.push({
				severity: 'info',
				kind: 'state.extra-in-mermaid',
				mermaid: sid,
				message: `mermaid state "${sid}" not in JSON (likely sub-state of a compound) — informational`,
			});
		}
	}

	// compound states — JSON 의 compound 가 mermaid 의 composite state 와 일치
	for (const cid of jsonNorm.compound_states) {
		if (!mermaidNorm.compound_states.some((m) => stateMatches(cid, m))) {
			diffs.push({
				severity: 'breaking',
				kind: 'state.compound.missing-in-mermaid',
				json: cid,
				message: `JSON compound state "${cid}" not declared as composite in mermaid`,
			});
		}
	}

	// transitions — JSON transition (top-level) 의 from/to 가 mermaid 의 모든 transition (sub-state 포함) 의 from/to 에서 reachable 한지.
	// 의미 동일성 비교는 fuzzy: JSON top-level transition 에 대해 mermaid 가 같은 from→to 를 가짐 OR 같은 from→<sub-state of to> 또는 <sub-state of from>→to 의 형태로 가짐.
	for (const t of jsonNorm.transitions) {
		if (!t.to) continue; // skip null target
		const found = mermaidNorm.transitions.some((m) =>
			transitionFuzzyMatch(t, m, mermaidNorm),
		);
		if (!found) {
			diffs.push({
				severity: 'breaking',
				kind: 'transition.missing-in-mermaid',
				json: { from: t.from, to: t.to, event: t.event },
				message: `JSON transition ${t.from} -[${t.event}]-> ${t.to} not represented in mermaid`,
			});
		}
	}

	return diffs;
}

function stateMatches(a, b) {
	if (a === b) return true;
	// pseudo-state entry/exit 토큰 무시
	if (a.startsWith('__') || b.startsWith('__')) return false;
	// prefix match (validating ↔ validatingstate, persisting ↔ persisting)
	return a.startsWith(b) || b.startsWith(a);
}

function transitionFuzzyMatch(t, m, mNorm) {
	// case 1: 직접 매칭
	if (stateMatches(t.from, m.from) && stateMatches(t.to, m.to)) return true;

	// F-154 fix — compound state inner transition 매칭
	const fromCompound = mNorm.compound_states.includes(t.from);
	const toCompound = mNorm.compound_states.includes(t.to);

	// case 2: t.from = compound, m 이 t.from sub-tree 의 외부로 나가는 transition
	// (e.g. JSON: persistingArticle -[insert_ok]-> published_count0
	//       mermaid: SaveAttempt --> Persisted (sub-state) ... 또는 InsertingRow --> Published_Count0)
	if (fromCompound) {
		if (isOrSubstateOf(m.from, t.from, mNorm) && stateMatches(t.to, m.to))
			return true;
	}

	// case 3: t.to = compound, m 이 t.to sub-tree 로 진입하는 transition
	if (toCompound) {
		if (stateMatches(t.from, m.from) && isOrSubstateOf(m.to, t.to, mNorm))
			return true;
	}

	// case 4: t.from + t.to 둘 다 compound — sub-tree → sub-tree
	if (fromCompound && toCompound) {
		if (
			isOrSubstateOf(m.from, t.from, mNorm) &&
			isOrSubstateOf(m.to, t.to, mNorm)
		)
			return true;
	}

	// case 5: self-loop on compound — JSON: X -[event]-> X (X compound)
	// mermaid 에서 X 안의 sub-state 사이 transition 으로 표현 가능
	if (t.from === t.to && fromCompound) {
		if (
			isOrSubstateOf(m.from, t.from, mNorm) &&
			isOrSubstateOf(m.to, t.from, mNorm)
		)
			return true;
	}

	// case 6: t.from = compound, m.parent 가 t.from 인 inner transition (외부 진입 ❌, 내부 흐름)
	// 단, t.to 가 compound 안의 일부 또는 외부면 case 2/4 에서 잡힘. 여기서는 inner-only.
	// JSON 의 BEFORE_INSERT_HOOK 처럼 compound 안의 sub-state 흐름을 outer 로 elide 한 경우 대응
	if (fromCompound && m.parent && stateMatches(m.parent, t.from)) {
		if (stateMatches(t.to, m.to) || isOrSubstateOf(m.to, t.to, mNorm))
			return true;
	}

	return false;
}

// NEW — stateId 가 ancestorId 자체이거나 그 sub-state 인지
function isOrSubstateOf(stateId, ancestorId, mNorm) {
	if (stateMatches(stateId, ancestorId)) return true;
	const ancestors = mNorm.state_ancestors?.get(stateId);
	if (!ancestors) return false;
	for (const a of ancestors) {
		if (stateMatches(a, ancestorId)) return true;
	}
	return false;
}

export function compareSequence({ jsonNorm, mermaidNorm }) {
	const diffs = [];

	// actors
	for (const a of jsonNorm.actors) {
		if (!mermaidNorm.actors.some((m) => m.id === a.id)) {
			diffs.push({
				severity: 'breaking',
				kind: 'actor.missing-in-mermaid',
				json: a.id,
			});
		}
	}
	for (const a of mermaidNorm.actors) {
		if (!jsonNorm.actors.some((j) => j.id === a.id)) {
			diffs.push({
				severity: 'non-breaking',
				kind: 'actor.missing-in-json',
				mermaid: a.id,
			});
		}
	}

	// messages — JSON message 가 mermaid 의 (from, to, sync) 조합 중 적어도 1개와 일치 (라벨은 fuzzy)
	for (const j of jsonNorm.messages) {
		const candidates = mermaidNorm.messages.filter(
			(m) => m.from === j.from && m.to === j.to && m.sync === j.sync,
		);
		if (candidates.length === 0) {
			diffs.push({
				severity: 'breaking',
				kind: 'message.missing-in-mermaid',
				json: {
					from: j.from,
					to: j.to,
					sync: j.sync,
					label: j.label.slice(0, 60),
				},
				message: `JSON message ${j.from}-${j.sync}->${j.to} not in mermaid`,
			});
			continue;
		}
		// 라벨 fuzzy: 토큰 50% 이상 겹치면 OK, 아니면 non-breaking drift
		const labelMatched = candidates.some((m) =>
			labelFuzzyMatch(j.label, m.label),
		);
		if (!labelMatched) {
			diffs.push({
				severity: 'non-breaking',
				kind: 'message.label-drift',
				json: j.label.slice(0, 80),
				mermaid: candidates[0].label.slice(0, 80),
				message: `message label drift between json and mermaid (from=${j.from}, to=${j.to})`,
			});
		}
	}

	// mermaid 의 추가 message → info
	for (const m of mermaidNorm.messages) {
		if (
			!jsonNorm.messages.some(
				(j) =>
					j.from === m.from &&
					j.to === m.to &&
					j.sync === m.sync &&
					labelFuzzyMatch(j.label, m.label),
			)
		) {
			// 단, 같은 (from, to, sync) 가 JSON 에 있으면 label-drift 로 이미 보고됨 → skip info 중복.
			const sameTuple = jsonNorm.messages.some(
				(j) => j.from === m.from && j.to === m.to && j.sync === m.sync,
			);
			if (!sameTuple) {
				diffs.push({
					severity: 'info',
					kind: 'message.extra-in-mermaid',
					mermaid: {
						from: m.from,
						to: m.to,
						sync: m.sync,
						label: m.label.slice(0, 60),
					},
				});
			}
		}
	}

	return diffs;
}

function labelFuzzyMatch(a, b) {
	if (a === b) return true;
	if (!a || !b) return false;
	const tok = (s) =>
		new Set(
			s
				.toLowerCase()
				.split(/[\s,;:./()\-_'"`{}]+/)
				.filter((t) => t.length > 1),
		);
	const A = tok(a),
		B = tok(b);
	if (A.size === 0 || B.size === 0) return false;
	let inter = 0;
	for (const t of A) if (B.has(t)) inter++;
	const denom = Math.min(A.size, B.size);
	return denom > 0 && inter / denom >= 0.5;
}

// summary helper — counts by severity
export function summarize(diffs) {
	const out = { breaking: 0, 'non-breaking': 0, info: 0 };
	for (const d of diffs) out[d.severity] = (out[d.severity] ?? 0) + 1;
	return out;
}
