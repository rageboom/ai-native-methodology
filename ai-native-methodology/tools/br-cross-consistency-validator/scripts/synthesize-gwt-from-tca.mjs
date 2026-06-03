#!/usr/bin/env node
// v2.5.0 Phase B 형식 sliding script — trigger/condition/expected_result → given/when/then 형식 변환 (semantic 합성 ❌)
// session 11차 Q-B1 (b) 결단 정합 / Agent 1 Cucumber/Fowler/ECA 3중 외부 권위 정합 / Agent 3 STOP-1 흡수
//
// paradigm (외부 권위 정합):
//   trigger          → when  (Fowler "when=behavior/trigger" + Cucumber "Event/Command" + ECA "Event" 3중 정합)
//   condition        → given (ECA "Condition=precondition" + Fowler "given=state" 정합)
//   expected_result  → then  (3중 정합)
//   action           → GWT step 분리 ❌ + rejection_method/verification_location metadata 보존
//                       (Cucumber anti-pattern "When = single action only" 정합 / Agent 3 STOP-1 정합)
//
//   natural_language → TODO marker ("TODO: Phase C LLM 본격 합성 필요")
//                       (LL-i-31 정합 / 자동 semantic 생성 = LLM 부재 위반 회피)
//
// 시행:
//   node tools/br-cross-consistency-validator/scripts/synthesize-gwt-from-tca.mjs <rules.json> [--dry-run]
//
// 신규 보존 영역 (TCA 원본):
//   br.trigger / br.condition / br.action / br.expected_result / br.rejection_method / br.verification_location
//   br.current_state / br.evidence_files / br.concerns
//   = 모두 그대로 보존 / GWT 신규 추가 / NL TODO marker 신규 추가
//
// 결과: br = {원본 TCA 보유} + {given/when/then 신규} + {natural_language TODO marker 신규}

import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const targetPath = args.find((a) => !a.startsWith('--'));

if (!targetPath) {
	console.error('Usage: synthesize-gwt-from-tca.mjs <rules.json> [--dry-run]');
	process.exit(2);
}

const absPath = path.isAbsolute(targetPath)
	? targetPath
	: path.resolve(process.cwd(), targetPath);
const doc = JSON.parse(fs.readFileSync(absPath, 'utf8'));
const rules = doc.rules || doc.business_rules || [];

const TODO_NL_MARKER =
	'TODO: Phase C LLM 본격 합성 필요 — trigger + condition + expected_result + action 기반 자연어 BR statement 합성 + 사람 검토 의무 (LL-i-31 정합)';

function normalizeText(v) {
	if (typeof v !== 'string') return null;
	const s = v.trim();
	return s.length > 0 ? s : null;
}

function slideToGiven(condition) {
	const c = normalizeText(condition);
	if (!c) return null;
	return [c];
}

function slideToWhen(trigger) {
	const t = normalizeText(trigger);
	if (!t) return null;
	return [t];
}

function slideToThen(expected_result) {
	const e = normalizeText(expected_result);
	if (!e) return null;
	return [e];
}

let migrated = 0;
let skipped_existing_gwt = 0;
let skipped_no_tca = 0;
const reviewCarry = [];

for (let i = 0; i < rules.length; i++) {
	const br = rules[i];

	// 이미 GWT 보유 시 skip
	const hasExistingGWT =
		Array.isArray(br.given) && Array.isArray(br.when) && Array.isArray(br.then);
	if (hasExistingGWT) {
		skipped_existing_gwt += 1;
		continue;
	}

	const given = slideToGiven(br.condition);
	const when = slideToWhen(br.trigger);
	const then = slideToThen(br.expected_result);

	// 3축 모두 부재 시 skip (TCA paradigm 부재)
	if (!given && !when && !then) {
		skipped_no_tca += 1;
		continue;
	}

	// 형식 sliding 적용 (부분 부재 시 빈 step 회피 = null skip)
	if (given) br.given = given;
	if (when) br.when = when;
	if (then) br.then = then;

	// NL = TODO marker (LL-i-31 정합 / 자동 semantic 합성 ❌)
	if (
		typeof br.natural_language !== 'string' ||
		br.natural_language.trim().length === 0
	) {
		br.natural_language = TODO_NL_MARKER;
	}

	migrated += 1;
	reviewCarry.push({
		br_id: br.id || `<index-${i}>`,
		trigger_to_when: !!when,
		condition_to_given: !!given,
		expected_result_to_then: !!then,
		action_preserved_as_metadata: !!normalizeText(br.action),
		nl_marker: 'TODO (Phase C LLM 본격 합성 의무)',
	});
}

console.log(
	'=== v2.5.0 Phase B 형식 sliding 결과 (trigger/condition/expected_result → given/when/then) ===',
);
console.log('target:', absPath);
console.log('총 BR:', rules.length);
console.log('migrated (TCA → GWT 형식 sliding + NL TODO marker):', migrated);
console.log('skipped (existing GWT):', skipped_existing_gwt);
console.log('skipped (no TCA):', skipped_no_tca);
console.log();

if (reviewCarry.length > 0) {
	console.log(
		'=== 사람 검토 carry (NL TODO marker = Phase C LLM 본격 합성 의무 / LL-i-31 정합) ===',
	);
	for (const c of reviewCarry) {
		const flags = [];
		if (c.trigger_to_when) flags.push('T→W');
		if (c.condition_to_given) flags.push('C→G');
		if (c.expected_result_to_then) flags.push('ER→T');
		if (c.action_preserved_as_metadata) flags.push('A=meta');
		console.log(`  ${c.br_id}: [${flags.join(' / ')}] | nl: ${c.nl_marker}`);
	}
	console.log();
}

if (dryRun) {
	console.log('--dry-run 모드 / 파일 변경 ❌');
} else if (migrated > 0) {
	fs.writeFileSync(absPath, JSON.stringify(doc, null, 2) + '\n', 'utf8');
	console.log(`${absPath} 형식 sliding 적용 ✅`);
	console.log('다음 step (Phase C / session 12차+):');
	console.log('  1. Layer 2 LLM 본격 구현 (Anthropic API / OpenAI API)');
	console.log(
		'  2. 각 BR 의 natural_language TODO marker → 본격 BR statement 합성',
	);
	console.log('  3. 사람 검토 (도메인 전문가 위임 또는 self-review)');
	console.log(
		'  4. cross-validation 본격 진입 (Layer 1 sanity + Layer 2 semantic)',
	);
} else {
	console.log('형식 sliding 대상 부재 / 파일 변경 ❌');
}
