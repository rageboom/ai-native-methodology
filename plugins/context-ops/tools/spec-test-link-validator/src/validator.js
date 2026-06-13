// spec-test-link-validator core
// 검증:
//   1. acceptance AC-* → test-spec TC-* 1:N coverage
//   2. test-spec TC-* 의 framework 가 analysis-source-inventory stack 정합
//   3. behavior BHV-* → TC-* link 정합 (TC.bhv_ref)
//   4. coverage ≥ 0.85 ratchet

import { readFileSync, existsSync } from 'node:fs';

// analysis-source-inventory.json 의 detected stack 시그널 → 허용 framework 매핑
const FRAMEWORK_HINTS = {
	java: [
		'junit5',
		'junit',
		'spock',
		'testng',
		'spring-cloud-contract',
		'pact',
		'testcontainers',
	],
	spring: [
		'junit5',
		'junit',
		'spring-cloud-contract',
		'pact',
		'testcontainers',
	],
	kotlin: ['junit5', 'kotest', 'spring-cloud-contract'],
	nodejs: [
		'jest',
		'vitest',
		'mocha',
		'jasmine',
		'supertest',
		'playwright',
		'cypress',
		'playwright-visual',
		'axe-core',
		'percy',
		'chromatic',
	],
	typescript: [
		'jest',
		'vitest',
		'mocha',
		'jasmine',
		'supertest',
		'playwright',
		'cypress',
		'playwright-visual',
		'axe-core',
		'percy',
		'chromatic',
	],
	nestjs: ['jest', 'vitest'],
	react: [
		'jest',
		'vitest',
		'testing-library',
		'cypress',
		'playwright',
		'playwright-visual',
		'axe-core',
		'percy',
		'chromatic',
	],
	python: ['pytest', 'unittest', 'schemathesis'],
	rails: ['rspec', 'minitest'],
	ruby: ['rspec', 'minitest'],
	go: ['gotest', 'go-test'], // T16 token 정합 (load-test-cmd / test-cmd.schema = 'go-test')
};

// T9 (INSPECTION-2026-05-31-test) — v11.0.0 contract/visual framework.
//   test-spec.schema.json if/then 이 openapi_contract_ref / visual_regression_ref 로 검증 (hard gate)
//   → stack-allowlist 추론과 무관 → framework_mismatch(soft medium) 검사 bypass (false-positive 제거).
//   (DEC-2026-05-26-contract-강제-양-axis §1 layer 3 정합.)
const CONTRACT_VISUAL_FRAMEWORKS = new Set([
	'schemathesis',
	'dredd',
	'pact',
	'spring-cloud-contract', // contract (BE axis)
	'playwright-visual',
	'axe-core',
	'percy',
	'chromatic', // visual / a11y (FE axis)
]);

export function validateSpecTestLink(
	behavior,
	acceptance,
	testSpec,
	inventory,
	threshold = 0.85,
) {
	const findings = [];

	// 1. AC → TC coverage
	const acIds = new Set((acceptance?.criteria ?? []).map((a) => a.id));
	const verifiableAcIds = new Set(
		(acceptance?.criteria ?? []).filter((a) => a.verifiable).map((a) => a.id),
	);
	const tcByAC = new Map();
	const allBHVs = new Set((behavior?.behaviors ?? []).map((b) => b.id));

	for (const tc of testSpec?.test_cases ?? []) {
		// v0.36.0 (DEC-2026-06-11-tdd-unit-layer-thread) — test_layer=unit TC 는 AC 없이 정당
		//   (빌딩블록을 class_ref 로 검증 / 유닛테스트는 acceptance 시나리오가 아님).
		//   AC coverage 축에서 제외 (no_ac_ref 오탐 차단 / AC 분모 미진입 = behavior-only 무회귀).
		if (tc.test_layer === 'unit') continue;
		if (!tc.ac_ref) {
			findings.push({
				kind: 'chain.tc.no_ac_ref',
				severity: 'critical',
				tc_id: tc.id,
				message: `TC ${tc.id} missing ac_ref`,
			});
			continue;
		}
		if (!acIds.has(tc.ac_ref)) {
			findings.push({
				kind: 'chain.tc.unknown_ac',
				severity: 'critical',
				tc_id: tc.id,
				ac_ref: tc.ac_ref,
				message: `TC ${tc.id} references unknown AC ${tc.ac_ref}`,
			});
		} else {
			if (!tcByAC.has(tc.ac_ref)) tcByAC.set(tc.ac_ref, []);
			tcByAC.get(tc.ac_ref).push(tc.id);
		}
		if (tc.bhv_ref && !allBHVs.has(tc.bhv_ref)) {
			findings.push({
				kind: 'chain.tc.unknown_bhv',
				severity: 'critical',
				tc_id: tc.id,
				bhv_ref: tc.bhv_ref,
				message: `TC ${tc.id} references unknown BHV ${tc.bhv_ref}`,
			});
		}
	}

	// verifiable AC → TC coverage
	let acCoveredCount = 0;
	for (const acId of verifiableAcIds) {
		if (tcByAC.has(acId)) acCoveredCount++;
		else
			findings.push({
				kind: 'chain.ac.no_tc',
				severity: 'high',
				ac_id: acId,
				message: `verifiable AC ${acId} has no TC (chain 2→3 link missing)`,
			});
	}
	const acCoverage =
		verifiableAcIds.size === 0 ? 1.0 : acCoveredCount / verifiableAcIds.size;

	// 2. framework match
	const stackHints = inferStackHints(inventory);
	const allowed = new Set();
	for (const hint of stackHints) {
		for (const fw of FRAMEWORK_HINTS[hint] ?? []) allowed.add(fw);
	}
	if (allowed.size > 0) {
		for (const tc of testSpec?.test_cases ?? []) {
			// T9 — contract/visual framework 는 schema if/then(openapi_contract_ref/visual_regression_ref)이
			//   검증 → stack-mismatch 검사 bypass (false-positive medium 제거).
			if (
				tc.framework &&
				!CONTRACT_VISUAL_FRAMEWORKS.has(tc.framework) &&
				!allowed.has(tc.framework)
			) {
				findings.push({
					kind: 'chain.tc.framework_mismatch',
					severity: 'medium',
					tc_id: tc.id,
					framework: tc.framework,
					stack_hints: [...stackHints],
					message: `TC ${tc.id} framework=${tc.framework} not in detected stack [${[...stackHints].join(', ')}]`,
				});
			}
		}
	}

	// 3. coverage threshold
	if (acCoverage < threshold) {
		findings.push({
			kind: 'chain.ac_coverage.below_threshold',
			severity: 'high',
			coverage: acCoverage,
			threshold,
			message: `AC→TC coverage ${acCoverage.toFixed(2)} < ${threshold}`,
		});
	}

	return {
		findings,
		coverage: { ac_to_tc: acCoverage },
		summary: {
			total_findings: findings.length,
			critical: findings.filter((f) => f.severity === 'critical').length,
			high: findings.filter((f) => f.severity === 'high').length,
			medium: findings.filter((f) => f.severity === 'medium').length,
		},
	};
}

// ──────────────────────────────────────────────────────────────────────
// v0.36.0 (DEC-2026-06-11-tdd-unit-layer-thread) — mocking-soundness 계약.
//   composition TC 가 mock 한 협력자 UNIT 은 자기 test_layer=unit TC 로 핀될 때만 건전.
//   = Fowler "Mocks Aren't Stubs"의 위험('green but mask inherent errors') 형식화 + CDC 합성.
//   ★ HARD (v0.40.0 / DEC-2026-06-12-unit-layer-hard-flip 조건⑤) — cli --unit-spec 시 result.findings 로 병합 →
//     gate #4 validateSpecTestLink exit-code(critical|high 차단) + gate-eval validator_high HARD_BLOCK 합류.
//     §8.1 ratchet 충족(ep-be-gea S2 + poc-18 S2 + poc-21 greenfield = 3 도메인) → SOFT→HARD. provenance-무관 hygiene(mock 건전성 / waived 면제 존중).
// ──────────────────────────────────────────────────────────────────────
export function validateMockSoundness(testSpec, unitSpec) {
	const findings = [];
	const tcs = testSpec?.test_cases ?? [];
	// UNIT 이 자기 유닛테스트(test_layer=unit + class_ref)를 가지는가?
	const unitTested = new Set(
		tcs
			.filter((t) => t.test_layer === 'unit' && t.class_ref)
			.map((t) => t.class_ref),
	);
	// waived 단위는 mock 건전성 면제 (동작 주장 ❌ — data class 등)
	const waived = new Set(
		(unitSpec?.units ?? [])
			.filter((u) => u.unit_test_obligation === 'waived')
			.map((u) => u.id),
	);
	for (const tc of tcs) {
		for (const m of tc.mocks ?? []) {
			const U = m.collaborator_unit_ref;
			if (!U || waived.has(U)) continue;
			if (!unitTested.has(U)) {
				findings.push({
					kind: 'unit.mock.unsound',
					severity: 'high',
					tc_id: tc.id,
					collaborator_unit_ref: U,
					message: `TC ${tc.id} mocks ${U} but ${U} has no test_layer=unit TC — mock = unverified assumption (propose-only / soft / DEC-2026-06-11)`,
				});
			}
		}
	}
	return {
		findings,
		summary: {
			total_findings: findings.length,
			high: findings.filter((f) => f.severity === 'high').length,
		},
	};
}

// ──────────────────────────────────────────────────────────────────────
// v0.44.0 (DEC-2026-06-13-displayname-label-lint-soft) — code @DisplayName ↔ test-spec 라벨 정합 (SOFT / opt-in --test-source).
//   dogfood(ep-be-gea golf/event/resv) 가 노출: 테스트 @DisplayName 의 BR/AC/TC 토큰이 test-spec SSOT 와 drift + 날조 BR id.
//   기존 검증기 어느 것도 코드 라벨을 안 봄(spec-test-link=JSON↔JSON / test-impl-pass=runner XML / code-pointer=ast warn).
//   ★ 결정론 범위(STRONG-STOP 준수 / LLM 판단 0) = 구조적 subset 만:
//     A. 날조 id — 라벨의 BR ∉ business-rules(critical) / AC ∉ acceptance(high) / TC ∉ test-spec(high).
//     B. join(source_evidence 의 nested-class/method 명 = 라벨 아닌 안정 식별자)로 그 클래스 @DisplayName 의 TC/AC 토큰을
//        해당 TC.id/ac_ref 와 대조(high mismatch). code_pointers/class_ref 가 있으면 우선 사용. 없으면 best-effort.
//     C. intra-label: 한 @DisplayName 이 AC+TC 동시 보유 시 라벨 AC == 라벨-TC 의 spec ac_ref (high).
//   ※ "실재 id·오의미"(event 식 drift)는 의미 판단 필요 = 본 결정론 lint 비대상(semantic 영역 / 정직 표기). SOFT=cli 가 별도 키로만 attach.
//   §8.1: 1 datapoint(단일 마스킹 Java 프로젝트) = SOFT only. HARD flip 은 ≥2 distinct 도메인 후.
//   다언어: @DisplayName=Java/JUnit5 전용 extractor(아래). TS/React = carry.
// ──────────────────────────────────────────────────────────────────────
const LABEL_TOKEN_RE = /\b(BR|AC|BHV|UC|TC)-[A-Z0-9-]*\d{3}\b/g;
const DISPLAYNAME_RE = /@DisplayName\(\s*"((?:[^"\\]|\\.)*)"\s*\)/g;

export function deriveScope(testSpec) {
	for (const tc of testSpec?.test_cases ?? []) {
		const m = /^TC-(.+)-\d{3}$/.exec(tc.id || '');
		if (m) return m[1];
	}
	return null;
}

// short form(AC-007) → full(AC-<scope>-007). 이미 full 이면 그대로.
export function normalizeLabelId(token, scope) {
	const m = /^(BR|AC|BHV|UC|TC)-(\d{3})$/.exec(token);
	if (m && scope) return `${m[1]}-${scope}-${m[2]}`;
	return token;
}

function tokensIn(text) {
	const out = { BR: [], AC: [], BHV: [], UC: [], TC: [] };
	let m;
	LABEL_TOKEN_RE.lastIndex = 0;
	while ((m = LABEL_TOKEN_RE.exec(text)) !== null) out[m[1]].push(m[0]);
	return out;
}

// Java/JUnit5 extractor — @DisplayName 을 인접한 `class X` 또는 `void y(` 에 바인딩(±3 line).
//   regex 기반(JavaParser 비의존) — exotic 포맷 미스 가능(exhaustive-no / sql-inventory-extractor 선례 caveat).
export function extractJavaDisplayNames(content) {
	const lines = content.split('\n');
	const labels = []; // {label, kind, name, tokens}
	for (let i = 0; i < lines.length; i++) {
		const dm = /@DisplayName\(\s*"((?:[^"\\]|\\.)*)"\s*\)/.exec(lines[i]);
		if (!dm) continue;
		const label = dm[1];
		// 다음 1~3 줄에서 class/method 선언 탐색
		let kind = null,
			name = null;
		for (let j = i + 1; j <= Math.min(i + 3, lines.length - 1); j++) {
			const cm = /\bclass\s+([A-Za-z_]\w*)/.exec(lines[j]);
			const mm = /\b(?:void|[A-Za-z_][\w<>,\s]*?)\s+([A-Za-z_]\w*)\s*\(/.exec(lines[j]);
			if (cm) { kind = 'class'; name = cm[1]; break; }
			if (mm && /\bvoid\b|@Test/.test(lines[j] + lines[j - 1])) { kind = 'method'; name = mm[1]; break; }
		}
		labels.push({ label, kind, name, tokens: tokensIn(label) });
	}
	return labels;
}

// source_evidence / code_pointers / class_ref 에서 안정 식별자(nested class · method 명) 추출 (라벨 아님).
function joinIdentifiers(tc) {
	const ids = { classes: [], methods: [] };
	for (const cp of tc.code_pointers ?? []) {
		if (cp.symbol) {
			const seg = String(cp.symbol).split(/[.#]/).pop();
			if (seg) ids.methods.push(seg);
			const cls = String(cp.symbol).split(/[.#]/).slice(-2, -1)[0];
			if (cls) ids.classes.push(cls);
		}
	}
	if (tc.class_ref) ids.classes.push(String(tc.class_ref).split(/[.$]/).pop());
	const se = tc.source_evidence || '';
	// `Main$Nested (real JUnit...)` / `void methodName(` / `Class#method`
	const nested = /\$([A-Za-z_]\w*)/.exec(se);
	if (nested) ids.classes.push(nested[1]);
	const meth = /(?:void\s+|#)([A-Za-z_]\w*)\s*\(?/.exec(se);
	if (meth) ids.methods.push(meth[1]);
	return ids;
}

export function validateCodeLabelConsistency(testSpec, sourceFiles, brIds, acIds) {
	// sourceFiles: [{ path, content }] (cli 가 source_file 들을 disk read). brIds/acIds: Set (business-rules / acceptance).
	const findings = [];
	const scope = deriveScope(testSpec);
	const tcs = testSpec?.test_cases ?? [];
	const tcIds = new Set(tcs.map((t) => t.id));
	const tcToAc = new Map(tcs.map((t) => [t.id, t.ac_ref]));
	let checked = 0;
	const skipped = [];

	// 파일별 @DisplayName 라벨 추출 (Java only — .java 만)
	const byFileLabels = new Map();
	for (const f of sourceFiles ?? []) {
		if (!f || !f.content) { skipped.push({ path: f?.path, reason: 'unreadable' }); continue; }
		if (!/\.java$/.test(f.path || '')) { skipped.push({ path: f.path, reason: 'non_java_extractor_carry' }); continue; }
		byFileLabels.set(f.path, extractJavaDisplayNames(f.content));
	}

	// A. 모든 라벨의 토큰 날조/미존재 검사
	for (const [path, labels] of byFileLabels) {
		for (const L of labels) {
			const hasTok = L.tokens.BR.length || L.tokens.AC.length || L.tokens.TC.length;
			if (!hasTok) continue;
			checked++;
			for (const raw of L.tokens.BR) {
				const id = normalizeLabelId(raw, scope);
				if (brIds && brIds.size && !brIds.has(id) && !brIds.has(raw)) {
					findings.push({ kind: 'code_label.br_fabricated', severity: 'critical', source_file: path, label: L.label, token: raw, message: `@DisplayName BR ${raw} not in business-rules (fabricated / no-simulation)` });
				}
			}
			for (const raw of L.tokens.AC) {
				const id = normalizeLabelId(raw, scope);
				if (acIds && acIds.size && !acIds.has(id) && !acIds.has(raw)) {
					findings.push({ kind: 'code_label.ac_unknown', severity: 'high', source_file: path, label: L.label, token: raw, message: `@DisplayName AC ${raw} not in acceptance-criteria` });
				}
			}
			for (const raw of L.tokens.TC) {
				const id = normalizeLabelId(raw, scope);
				if (!tcIds.has(id) && !tcIds.has(raw)) {
					findings.push({ kind: 'code_label.tc_unknown', severity: 'high', source_file: path, label: L.label, token: raw, message: `@DisplayName TC ${raw} not in test-spec` });
				}
			}
			// C. intra-label: AC+TC 동시 보유 시 라벨 AC == 라벨-TC 의 spec ac_ref
			if (L.tokens.TC.length === 1 && L.tokens.AC.length === 1) {
				const nTC = normalizeLabelId(L.tokens.TC[0], scope);
				const nAC = normalizeLabelId(L.tokens.AC[0], scope);
				const expected = tcToAc.get(nTC) ?? tcToAc.get(L.tokens.TC[0]);
				if (expected && expected !== nAC && expected !== L.tokens.AC[0]) {
					findings.push({ kind: 'code_label.ac_tc_mismatch', severity: 'high', source_file: path, label: L.label, message: `@DisplayName pairs ${L.tokens.AC[0]} with ${L.tokens.TC[0]}, but test-spec ${nTC}.ac_ref=${expected}` });
				}
			}
		}
	}

	// B. join — source_evidence/code_pointers 의 class/method 명으로 그 라벨의 TC/AC 가 해당 TC 와 맞는지
	for (const tc of tcs) {
		if (!tc.source_file) continue;
		const labels = byFileLabels.get(tc.source_file);
		if (!labels) { continue; }
		const ids = joinIdentifiers(tc);
		const cand = labels.find(
			(L) => (L.kind === 'class' && ids.classes.includes(L.name)) || (L.kind === 'method' && ids.methods.includes(L.name)),
		);
		if (!cand) { skipped.push({ tc_id: tc.id, reason: 'join_anchor_absent' }); continue; }
		const labTC = cand.tokens.TC.map((t) => normalizeLabelId(t, scope));
		const labAC = cand.tokens.AC.map((t) => normalizeLabelId(t, scope));
		if (labTC.length && !labTC.includes(tc.id)) {
			findings.push({ kind: 'code_label.tc_join_mismatch', severity: 'high', source_file: tc.source_file, tc_id: tc.id, bound: cand.name, label: cand.label, message: `${cand.name} @DisplayName TC=${cand.tokens.TC.join(',')} but test-spec binds it to ${tc.id}` });
		}
		if (tc.ac_ref && labAC.length && !labAC.includes(tc.ac_ref)) {
			findings.push({ kind: 'code_label.ac_join_mismatch', severity: 'high', source_file: tc.source_file, tc_id: tc.id, bound: cand.name, label: cand.label, message: `${cand.name} @DisplayName AC=${cand.tokens.AC.join(',')} but test-spec ${tc.id}.ac_ref=${tc.ac_ref}` });
		}
	}

	return {
		findings,
		summary: {
			total_findings: findings.length,
			critical: findings.filter((f) => f.severity === 'critical').length,
			high: findings.filter((f) => f.severity === 'high').length,
			medium: findings.filter((f) => f.severity === 'medium').length,
		},
		checked,
		skipped,
	};
}

function inferStackHints(inventory) {
	const hints = new Set();
	if (!inventory) return hints;
	// simple flat extraction
	const text = JSON.stringify(inventory).toLowerCase();
	for (const key of Object.keys(FRAMEWORK_HINTS)) {
		if (text.includes(key)) hints.add(key);
	}
	return hints;
}

export function loadJson(path) {
	if (!existsSync(path)) return null;
	try {
		return JSON.parse(readFileSync(path, 'utf-8'));
	} catch (e) {
		throw new Error(`JSON parse error at ${path}: ${e.message}`);
	}
}
