// br-cross-consistency-validator unit test
// ADR-CHAIN-011 정합 / Plan N §8 정합 (≥ 15 case)

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
	validateRulesDoc,
	validateRulesDocStrict,
	OVERALL_THRESHOLD,
} from '../src/validator.js';
import {
	extractKeywords,
	keywordOverlap,
	validateBR,
	resetFindingSeq,
} from '../src/deterministic.js';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
const __testdir = dirname(fileURLToPath(import.meta.url));

test('Layer 1: BR with natural_language only — valid', () => {
	const doc = {
		business_rules: [
			{
				id: 'BR-USER-EMAIL-001',
				name: '이메일 유일성',
				natural_language: '사용자 등록 시 이메일은 시스템 내 유일해야 함',
			},
		],
	};
	const r = validateRulesDoc(doc);
	assert.equal(r.stats.total, 1);
	assert.equal(r.stats.with_natural_language, 1);
	assert.equal(r.stats.with_gwt, 0);
	assert.equal(r.findings.length, 0);
	assert.equal(r.summary.gate_status, 'pass');
});

test('Layer 1: BR with GWT only — valid', () => {
	const doc = {
		business_rules: [
			{
				id: 'BR-USER-EMAIL-002',
				name: '이메일 유일성',
				given: ['사용자가 회원가입 페이지에 진입'],
				when: ['이메일을 입력하고 제출'],
				then: ['중복 시 409 Conflict 응답'],
			},
		],
	};
	const r = validateRulesDoc(doc);
	assert.equal(r.stats.with_gwt, 1);
	assert.equal(r.findings.length, 0);
	assert.equal(r.summary.gate_status, 'pass');
});

test('Layer 1: BR with both — valid (v2.5.0 Phase B Q-B3 (b) threshold 자체 제거 / overlap > 0 sanity only)', () => {
	const doc = {
		business_rules: [
			{
				id: 'BR-ORDER-CANCEL-001',
				name: '주문 취소',
				natural_language:
					'주문 상태가 결제완료일 때 사용자가 취소 요청하면 환불 처리됨',
				given: ['주문 상태가 결제완료'],
				when: ['사용자가 취소 요청'],
				then: ['환불 처리됨'],
			},
		],
	};
	const r = validateRulesDoc(doc);
	assert.equal(r.stats.with_both, 1);
	assert.equal(r.findings.length, 0, `findings: ${JSON.stringify(r.findings)}`);
	assert.equal(r.summary.gate_status, 'pass');
});

test('Layer 1: BR with both representations missing — critical finding', () => {
	const doc = {
		business_rules: [
			{
				id: 'BR-NULL-EMPTY-001',
				name: '빈 BR',
			},
		],
	};
	const r = validateRulesDoc(doc);
	assert.ok(r.findings.some((f) => f.rule === 'representation_missing'));
	assert.ok(r.findings.some((f) => f.severity === 'critical'));
});

test('v2.5.0 Phase B Q-B3 (b): overlap = 0 → structural_sanity_only low finding (threshold 자체 제거 / non-empty + overlap > 0 sanity only)', () => {
	const doc = {
		business_rules: [
			{
				id: 'BR-MISMATCH-DRIFT-001',
				name: '키워드 교집합 ∅',
				natural_language: '결제 모듈은 신용카드만 지원',
				given: ['전혀 다른 영역 인증 토큰'],
				when: ['세션 만료'],
				then: ['리다이렉트 로그인'],
			},
		],
	};
	const r = validateRulesDoc(doc);
	const sanityFinding = r.findings.find(
		(f) => f.rule === 'structural_sanity_only',
	);
	assert.ok(sanityFinding, 'structural_sanity_only finding 의무 (overlap = 0)');
	assert.equal(sanityFinding.severity, 'low');
	assert.equal(sanityFinding.overlap_score, 0);
	// keyword_mismatch finding 자체 제거 (Phase B Q-B3 (b) 결단)
	assert.equal(
		r.findings.filter((f) => f.rule === 'keyword_mismatch').length,
		0,
	);
});

test('v2.5.0 Phase B Q-B3 (b): overlap > 0 (낮아도) → finding 부재 (threshold 비교 자체 제거)', () => {
	const doc = {
		business_rules: [
			{
				id: 'BR-LOW-OVERLAP-001',
				name: '낮은 overlap (session 9차 SPIKE v2 PoC #01 mean=0.201 자릿수)',
				natural_language: '결제 모듈은 신용카드 지원',
				given: ['결제 시점'],
				when: ['카드 입력'],
				then: ['환불 처리'],
			},
		],
	};
	const r = validateRulesDoc(doc);
	// overlap > 0 시 → structural_sanity_only finding ❌ (threshold 비교 자체 ❌)
	assert.equal(
		r.findings.filter((f) => f.rule === 'structural_sanity_only').length,
		0,
	);
	assert.equal(
		r.findings.filter((f) => f.rule === 'keyword_mismatch').length,
		0,
	);
	// overlap_distribution 측정 자체 보존 (sanity 자료)
	assert.ok(r.overlap_distribution.mean > 0);
});

test('Layer 1: BR id 4토막 위반 — medium finding (v2.3.7 enforcement)', () => {
	const doc = {
		business_rules: [
			{
				id: 'BR-INVALID-3SEG', // 3토막 위반
				name: '잘못된 ID',
				natural_language: '잘못된 ID pattern test',
			},
		],
	};
	const r = validateRulesDoc(doc);
	assert.ok(r.findings.some((f) => f.rule === 'id_pattern_violation'));
});

test('Layer 1: BR id 4토막 정합 — finding 부재', () => {
	const doc = {
		business_rules: [
			{
				id: 'BR-BILLING-INVOICE-001',
				name: '청구서 발행',
				natural_language: '청구서는 매월 말일 발행됨',
			},
		],
	};
	const r = validateRulesDoc(doc);
	assert.equal(
		r.findings.filter((f) => f.rule === 'id_pattern_violation').length,
		0,
	);
});

test('Layer 1: BR id 5토막 자연 허용 (4토막+ strict)', () => {
	const doc = {
		business_rules: [
			{
				id: 'BR-USER-AUTH-LOGIN-001',
				name: '로그인 인증',
				natural_language: '로그인 시 OAuth 토큰 검증',
			},
		],
	};
	const r = validateRulesDoc(doc);
	assert.equal(
		r.findings.filter((f) => f.rule === 'id_pattern_violation').length,
		0,
	);
});

test('Layer 1: structure 위반 — given 안 결과 키워드 (low finding)', () => {
	const doc = {
		business_rules: [
			{
				id: 'BR-STRUCT-BAD-001',
				name: 'structure 위반 given',
				natural_language: 'given 안에 응답이 들어간 잘못된 구조',
				given: ['응답을 반환하고 저장 완료'], // then 키워드만 / given 키워드 부재
				when: ['시도'],
				then: ['처리'],
			},
		],
	};
	const r = validateRulesDoc(doc);
	// 구조 위반 finding 검출
	const structFinding = r.findings.find(
		(f) => f.rule === 'structure_given_has_result_keyword',
	);
	assert.ok(structFinding, 'structure_given_has_result_keyword finding 의무');
	assert.equal(structFinding.severity, 'low');
});

test('Layer 1: structure 위반 — when 안 전제 키워드 (low finding)', () => {
	const doc = {
		business_rules: [
			{
				id: 'BR-STRUCT-BAD-002',
				name: 'structure 위반 when',
				natural_language: 'when 안에 존재 키워드 잘못된 구조',
				given: ['주어진 상태'],
				when: ['사용자가 존재한다고 가정'], // given 키워드 / when 키워드 부재
				then: ['응답'],
			},
		],
	};
	const r = validateRulesDoc(doc);
	const structFinding = r.findings.find(
		(f) => f.rule === 'structure_when_has_precondition_keyword',
	);
	assert.ok(
		structFinding,
		'structure_when_has_precondition_keyword finding 의무',
	);
	assert.equal(structFinding.severity, 'low');
});

test('Layer 1: 여러 BR — stats aggregation', () => {
	const doc = {
		business_rules: [
			{ id: 'BR-A-X-001', name: 'A', natural_language: '첫번째 BR' },
			{
				id: 'BR-A-X-002',
				name: 'B',
				given: ['있다'],
				when: ['호출'],
				then: ['반환'],
			},
			{
				id: 'BR-A-X-003',
				name: 'C',
				natural_language: '셋째',
				given: ['있다'],
				when: ['호출'],
				then: ['반환'],
			},
		],
	};
	const r = validateRulesDoc(doc);
	assert.equal(r.stats.total, 3);
	assert.equal(r.stats.with_natural_language, 2);
	assert.equal(r.stats.with_gwt, 2);
	assert.equal(r.stats.with_both, 1);
});

test('Layer 1: extractKeywords — Korean + English mix', () => {
	const keywords = extractKeywords('사용자 등록 시 email is unique');
	assert.ok(keywords.has('사용자'));
	assert.ok(keywords.has('등록'));
	assert.ok(keywords.has('email'));
	assert.ok(keywords.has('unique'));
	// stopword 제거
	assert.ok(!keywords.has('is'));
});

test('Layer 1: keywordOverlap — perfect overlap', () => {
	const a = new Set(['주문', '취소', '환불']);
	const b = new Set(['주문', '취소', '환불']);
	const { score, common } = keywordOverlap(a, b);
	assert.equal(score, 1);
	assert.equal(common.size, 3);
});

test('Layer 1: keywordOverlap — no overlap', () => {
	const a = new Set(['주문', '취소']);
	const b = new Set(['결제', '환불']);
	const { score, common } = keywordOverlap(a, b);
	assert.equal(score, 0);
	assert.equal(common.size, 0);
});

test('Layer 1: keywordOverlap — empty set', () => {
	const { score } = keywordOverlap(new Set(), new Set(['a']));
	assert.equal(score, 0);
});

test('Layer 1: overlap_distribution stats (threshold spike 기반 자료)', () => {
	const doc = {
		business_rules: [
			{
				id: 'BR-A-X-001',
				name: 'A',
				natural_language: '주문 취소 환불',
				given: ['주문'],
				when: ['취소'],
				then: ['환불'],
			},
			{
				id: 'BR-A-X-002',
				name: 'B',
				natural_language: '결제 완료',
				given: ['결제'],
				when: ['완료'],
				then: ['저장'],
			},
		],
	};
	const r = validateRulesDoc(doc);
	assert.equal(r.overlap_distribution.count, 2);
	assert.ok(r.overlap_distribution.mean >= 0);
	assert.ok(r.overlap_distribution.mean <= 1);
});

test('Layer 1: deterministic_score 산정 (overall threshold 0.85)', () => {
	// 모든 BR 정상 → score = 1
	const doc = {
		business_rules: [
			{ id: 'BR-A-X-001', name: 'A', natural_language: '깨끗한 BR' },
		],
	};
	const r = validateRulesDoc(doc);
	assert.equal(r.summary.deterministic_consistency_score, 1);
	assert.equal(r.summary.gate_status, 'pass');
	assert.equal(r.summary.overall_threshold, OVERALL_THRESHOLD);
});

test('Layer 1: critical finding → gate_status fail (deterministic 패널티)', () => {
	const doc = { business_rules: [{ id: 'BR-X-Y-001', name: 'A' }] }; // 두 표현 모두 부재 = critical
	const r = validateRulesDoc(doc);
	assert.equal(r.summary.gate_status, 'fail');
});

test('v5.0.0 — top-level `rules` alias 폐기 → extractRules canonical 단일 (묶음 Q ①)', () => {
	// v5.0.0 (DEC-2026-05-17-q1-alias-4중첩-폐기) — extractRules = business_rules 단일.
	// 폐기된 `rules` alias 문서 = BR 0 추출 (canonical 아니므로 비가시 / schema 단에서 reject).
	const legacyDoc = {
		rules: [
			{
				id: 'BR-LEGACY-COMPAT-001',
				name: '레거시',
				natural_language: 'v1.x 호환',
			},
		],
	};
	assert.equal(
		validateRulesDoc(legacyDoc).stats.total,
		0,
		'폐기 alias `rules` = 0 추출 (canonical 아님)',
	);

	const canonicalDoc = {
		business_rules: [
			{
				id: 'BR-LEGACY-COMPAT-001',
				name: '레거시',
				natural_language: 'v1.x 호환',
			},
		],
	};
	assert.equal(
		validateRulesDoc(canonicalDoc).stats.total,
		1,
		'business_rules canonical = 정상 추출',
	);
});

test('v2.5.0 Phase C: Layer 2 strict + --llm-results 부재 → skipped', async () => {
	const doc = {
		business_rules: [
			{ id: 'BR-X-Y-001', name: 'A', natural_language: '테스트' },
		],
	};
	const r = await validateRulesDocStrict(doc);
	assert.equal(r.summary.llm_status, 'skipped');
	assert.equal(r.summary.llm_consistency_score, null);
});

test('Layer 2: 비 strict 모드 → llm_score null 유지', () => {
	const doc = {
		business_rules: [
			{ id: 'BR-X-Y-001', name: 'A', natural_language: '테스트' },
		],
	};
	const r = validateRulesDoc(doc);
	assert.equal(r.summary.llm_consistency_score, null);
});

// v2.5.0 Phase C session 12차 — Layer 2 본격 paradigm test (B-4 paradigm 정합)

test('v2.5.0 Phase C: Layer 2 strict + --llm-results 본격 입력 → semantic_score 처리 + pass', async () => {
	const doc = {
		business_rules: [
			{
				id: 'BR-USER-EMAIL-001',
				name: '이메일 유일성',
				natural_language: '사용자 등록 시 이메일은 시스템 내 유일',
				given: ['사용자가 회원가입 페이지 진입'],
				when: ['이메일 입력 + 제출'],
				then: ['중복 시 409 Conflict 응답'],
			},
		],
	};
	const llmResults = {
		$schema_version: 'v2.5.0-phase-c',
		model: 'claude-sonnet-4-6',
		invoked_at: '2026-05-14T12:00:00Z',
		batch_size: 1,
		results: [
			{
				br_id: 'BR-USER-EMAIL-001',
				semantic_score: 0.92,
				rationale: 'NL ↔ GWT 의미 정합 본질 동치',
				confidence: 0.8,
			},
		],
	};
	const r = await validateRulesDocStrict(doc, { llmResults });
	assert.equal(r.summary.llm_status, 'evaluated');
	assert.equal(r.summary.llm_consistency_score, 0.92);
	assert.equal(r.summary.llm_model, 'claude-sonnet-4-6');
	assert.equal(r.summary.llm_batch_size, 1);
	assert.equal(r.summary.gate_status, 'pass');
	// semantic_drift_detected finding 부재 (score ≥ 0.7)
	assert.equal(
		r.findings.filter((f) => f.rule === 'semantic_drift_detected').length,
		0,
	);
});

test('v2.5.0 Phase C: Layer 2 semantic_score < 0.7 → semantic_drift_detected medium finding + gate fail', async () => {
	const doc = {
		business_rules: [
			{
				id: 'BR-USER-DRIFT-001',
				name: 'semantic drift',
				natural_language: '결제 모듈은 신용카드만 지원',
				given: ['전혀 다른 영역 인증 토큰'],
				when: ['세션 만료'],
				then: ['리다이렉트 로그인'],
			},
		],
	};
	const llmResults = {
		$schema_version: 'v2.5.0-phase-c',
		model: 'claude-sonnet-4-6',
		invoked_at: '2026-05-14T12:00:00Z',
		batch_size: 1,
		results: [
			{
				br_id: 'BR-USER-DRIFT-001',
				semantic_score: 0.35,
				rationale: 'NL = 결제 / GWT = 세션 = 본질 차이',
				confidence: 0.82,
			},
		],
	};
	const r = await validateRulesDocStrict(doc, { llmResults });
	const driftFinding = r.findings.find(
		(f) => f.rule === 'semantic_drift_detected',
	);
	assert.ok(driftFinding, 'semantic_drift_detected finding 의무');
	assert.equal(driftFinding.severity, 'medium');
	assert.equal(driftFinding.semantic_score, 0.35);
	assert.equal(driftFinding.llm_model, 'claude-sonnet-4-6');
	assert.equal(r.summary.gate_status, 'fail');
});

test('v2.5.0 Phase C: Layer 2 confidence > 0.85 → confidence_cap_exceeded low finding (Static Tool 시뮬레이션 금지 정합)', async () => {
	const doc = {
		business_rules: [
			{
				id: 'BR-USER-CAP-001',
				name: 'confidence cap test',
				natural_language: '테스트 BR',
				given: ['테스트'],
				when: ['시도'],
				then: ['반환'],
			},
		],
	};
	const llmResults = {
		$schema_version: 'v2.5.0-phase-c',
		model: 'claude-sonnet-4-6',
		invoked_at: '2026-05-14T12:00:00Z',
		batch_size: 1,
		results: [
			{
				br_id: 'BR-USER-CAP-001',
				semantic_score: 0.95,
				rationale: 'high confidence',
				confidence: 0.99,
			}, // cap 0.85 위반
		],
	};
	const r = await validateRulesDocStrict(doc, { llmResults });
	const capFinding = r.findings.find(
		(f) => f.rule === 'confidence_cap_exceeded',
	);
	assert.ok(capFinding, 'confidence_cap_exceeded finding 의무');
	assert.equal(capFinding.severity, 'low');
	assert.equal(capFinding.original_confidence, 0.99);
	assert.equal(capFinding.capped_confidence, 0.85);
});

test('v2.5.0 Phase C: Layer 1 pass + Layer 2 pass → overall_score = (L1 + L2) / 2 + gate pass', async () => {
	const doc = {
		business_rules: [
			{
				id: 'BR-ORDER-CANCEL-FULL-001',
				name: '통합 paradigm test',
				natural_language: '주문 취소 환불',
				given: ['주문'],
				when: ['취소'],
				then: ['환불'],
			},
		],
	};
	const llmResults = {
		$schema_version: 'v2.5.0-phase-c',
		model: 'claude-sonnet-4-6',
		invoked_at: '2026-05-14T12:00:00Z',
		batch_size: 1,
		results: [
			{
				br_id: 'BR-ORDER-CANCEL-FULL-001',
				semantic_score: 0.9,
				rationale: '정합',
				confidence: 0.8,
			},
		],
	};
	const r = await validateRulesDocStrict(doc, { llmResults });
	// Layer 1 = 1.0 (finding 부재) / Layer 2 = 0.9 / overall = 0.95
	assert.equal(r.summary.deterministic_consistency_score, 1);
	assert.equal(r.summary.llm_consistency_score, 0.9);
	assert.equal(r.summary.overall_score, 0.95);
	assert.equal(r.summary.gate_status, 'pass');
});

test('v2.5.0 Phase C: br_id 매칭 부재 (batch 안 미포함) → skipped per BR', async () => {
	const doc = {
		business_rules: [
			{
				id: 'BR-USER-MISSING-001',
				name: 'missing batch',
				natural_language: '테스트',
				given: ['주어진'],
				when: ['호출'],
				then: ['반환'],
			},
		],
	};
	const llmResults = {
		$schema_version: 'v2.5.0-phase-c',
		model: 'claude-sonnet-4-6',
		invoked_at: '2026-05-14T12:00:00Z',
		batch_size: 0,
		results: [], // batch 안 BR 미포함
	};
	const r = await validateRulesDocStrict(doc, { llmResults });
	// llm_consistency_score = null (aggregate 영역에 score 부재 BR 제외)
	assert.equal(r.summary.llm_consistency_score, null);
	// Layer 2 skipped → Layer 1 만 검증 / Layer 1 pass → overall pass
	assert.equal(r.summary.gate_status, 'pass');
});

test('top-level 부재 (business_rules/rules 모두 없음) — total 0', () => {
	const doc = { meta: { confidence: 0.5 } };
	const r = validateRulesDoc(doc);
	assert.equal(r.stats.total, 0);
});

// v2.5.0 Phase A 신규 paradigm test (Q2 description vs natural_language 재정의 정합)

test('v6.0.0 묶음 Q ②: description-only BR — representation_missing critical (fallback low 폐기 / 표현 자격 박탈 / Senior surfaces louder / LL-i-53 동형)', () => {
	const doc = {
		business_rules: [
			{
				id: 'BR-LEGACY-DESC-001',
				name: 'description-only',
				description: 'v5.x 까지 fallback 인정 / v6.0.0 묶음 Q ② 표현 자격 박탈',
			},
		],
	};
	const r = validateRulesDoc(doc);
	const repr = r.findings.find((f) => f.rule === 'representation_missing');
	assert.ok(
		repr,
		'v6.0.0 — description-only = representation_missing finding 의무',
	);
	assert.equal(repr.severity, 'critical');
	assert.equal(
		r.findings.some((f) => f.rule === 'description_only_fallback'),
		false,
		'v6.0.0 — description_only_fallback (low) finding 폐기 (critical 격상)',
	);
	assert.equal(r.stats.with_description_only, 1); // stats 집계는 보존 (with_description_only / has_description)
	assert.equal(r.stats.with_natural_language, 0); // description ≠ NL alias (v2.5.0 paradigm 계승)
});

test('v6.0.0 묶음 Q ② Senior gate: PoC #06 post-migration — 7 BR 전부 GWT+NL / representation_missing 0 (합성 결함 은폐 inverse 차단)', () => {
	const poc06 = join(
		__testdir,
		'../../../examples/poc-06-efiweb-exchange-spring41/input/business-rules.json',
	);
	const doc = JSON.parse(readFileSync(poc06, 'utf8'));
	const r = validateRulesDoc(doc);
	assert.equal(
		r.stats.total,
		7,
		'#06 cross-consistency corpus = 7 BR (Senior #06 count==7 guard)',
	);
	assert.equal(
		r.findings.filter((f) => f.rule === 'representation_missing').length,
		0,
		'#06 7 BR 전부 GWT+NL 합성 완료 (description fallback 제거가 코퍼스 축소 ❌ / Senior Item1 NO-masking 실증)',
	);
});

test('v2.5.0 Phase A: description + GWT — cross-validation 미시행 (description 제외)', () => {
	const doc = {
		business_rules: [
			{
				id: 'BR-DESC-GWT-001',
				name: 'description with GWT (cross-validation 미시행)',
				description: 'description rationale 포함 — cross-validation 대상 ❌',
				given: ['주문 상태가 결제완료'],
				when: ['사용자가 취소 요청'],
				then: ['환불 처리됨'],
			},
		],
	};
	const r = validateRulesDoc(doc);
	assert.equal(r.stats.with_natural_language, 0); // description ≠ NL
	assert.equal(r.stats.with_gwt, 1);
	assert.equal(r.stats.with_both, 0); // description + GWT ≠ both (NL 부재)
	// keyword_mismatch finding 부재 의무 (cross-validation 미시행)
	assert.equal(
		r.findings.filter((f) => f.rule === 'keyword_mismatch').length,
		0,
	);
});

test('v2.5.0 Phase A: NL + description + GWT — cross-validation = NL ↔ GWT only (description 제외)', () => {
	const doc = {
		business_rules: [
			{
				id: 'BR-FULL-A-X-001',
				name: 'NL + description + GWT 모두',
				natural_language:
					'주문 상태가 결제완료일 때 사용자가 취소 요청하면 환불 처리됨',
				description:
					'rationale + caveat 자유 metadata (DRIFT-XYZ 격상 / production SaaS 정합) — cross-validation 제외',
				given: ['주문 상태가 결제완료'],
				when: ['사용자가 취소 요청'],
				then: ['환불 처리됨'],
			},
		],
	};
	const r = validateRulesDoc(doc);
	assert.equal(r.stats.with_natural_language, 1);
	assert.equal(r.stats.with_gwt, 1);
	assert.equal(r.stats.with_both, 1); // NL + GWT = both (description 무관)
	// overlap 계산 = NL ↔ GWT only (description 제외)
	assert.equal(r.overlap_distribution.count, 1);
});
