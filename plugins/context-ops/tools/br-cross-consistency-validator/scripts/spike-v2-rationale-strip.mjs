#!/usr/bin/env node
// SPIKE v2 — REVISE-6 재실측 (ADR-CHAIN-011 §5.4 가설 B 검증)
// description 안 rationale/caveat 제거 후 순수 BR 부분만 추출 → overlap 분포 재측정
// Plan O 가설 B / Agent 3 REVISE-6 / Agent 1 F1 (Jaccard short-text limit) 정합

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateRulesDoc } from '../src/validator.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../../');
const POC01_PATH = path.join(
	ROOT,
	'examples/poc-01-realworld-spring/output/rules/rules.json',
);

function stripRationale(text) {
	if (typeof text !== 'string') return text;
	let s = text;
	// 1. 첫 ". " 까지 (첫 문장)
	const periodSpace = s.indexOf('. ');
	if (periodSpace > 0) s = s.slice(0, periodSpace + 1);
	// 2. 괄호 안 caveat 제거
	s = s
		.replace(/\([^)]*\)/g, '')
		.replace(/\s+/g, ' ')
		.trim();
	// 3. em dash 이후 caveat 제거
	s = s.split(/\s[—–-]\s/)[0].trim();
	return s;
}

function processBR(br) {
	const newBr = { ...br };
	if (br.description) newBr.description = stripRationale(br.description);
	if (br.natural_language)
		newBr.natural_language = stripRationale(br.natural_language);
	return newBr;
}

const doc = JSON.parse(fs.readFileSync(POC01_PATH, 'utf8'));
const rules = doc.rules || doc.business_rules || [];

console.log('=== PoC #01 SPIKE v2 — REVISE-6 재실측 ===');
console.log('Total BR:', rules.length);
console.log();

console.log('=== Sample description 비교 (BR 0) ===');
const sample = rules[0].description || '';
console.log('원본 length=' + sample.length + ':');
console.log(
	'  "' + sample.slice(0, 200) + (sample.length > 200 ? '...' : '') + '"',
);
const strippedSample = stripRationale(sample);
console.log('stripped length=' + strippedSample.length + ':');
console.log('  "' + strippedSample + '"');
console.log();

const strippedRules = rules.map(processBR);
const strippedDoc = { ...doc, rules: strippedRules };

const original = validateRulesDoc(doc);
const stripped = validateRulesDoc(strippedDoc);

console.log('=== Distribution 비교 (overlap 분포) ===');
console.log('  원본 (v1):  ', JSON.stringify(original.overlap_distribution));
console.log('  stripped:   ', JSON.stringify(stripped.overlap_distribution));
console.log();

const oScores = (original.findings || [])
	.filter((f) => f.rule === 'keyword_mismatch')
	.map((f) => ({ path: f.path, br_id: f.br_id, score: f.overlap_score }));
const sScores = (stripped.findings || [])
	.filter((f) => f.rule === 'keyword_mismatch')
	.map((f) => ({ path: f.path, br_id: f.br_id, score: f.overlap_score }));

console.log('=== per-BR overlap 비교 ===');
console.log('  br_id'.padEnd(40) + 'original  stripped  delta');
const sMap = new Map(sScores.map((s) => [s.path, s.score]));
const passing = []; // stripped 안 finding 없음 = overlap ≥ 0.5
for (const o of oScores) {
	const s = sMap.get(o.path);
	const dStr =
		s !== undefined
			? (s - o.score >= 0 ? '+' : '') + (s - o.score).toFixed(3)
			: 'pass';
	const sStr = s !== undefined ? s.toFixed(3) : '≥0.5 pass';
	console.log(
		'  ' +
			(o.br_id || '?').padEnd(40) +
			o.score.toFixed(3).padStart(8) +
			'  ' +
			sStr.padStart(8) +
			'  ' +
			dStr,
	);
}
console.log();

// stripped 안 finding 없는 BR 별도 수집 (overlap ≥ 0.5 통과)
const allStrippedScores = [];
for (let i = 0; i < strippedRules.length; i++) {
	const p = `/business_rules/${i}`;
	const f = sScores.find((x) => x.path === p);
	if (f) {
		allStrippedScores.push(f.score);
	} else {
		// keyword_mismatch 없음 = overlap ≥ 0.5 통과 (≥ 0.5 = floor)
		// 정확한 값 필요 시 validator 안 distribution 사용
	}
}
// stripped overlap_distribution 사용 = 실 측정값
console.log('=== 임계 통과 비교 (실측 distribution 사용) ===');
const origDist = original.overlap_distribution;
const stripDist = stripped.overlap_distribution;

// original 13 BR finding 모두 (max 0.462) + stripped 일부 ≥ 0.5 = finding 없음
// stripped distribution.count = BR with_both 합산 / finding 없음 + score 양쪽 포함
console.log('  threshold | original | stripped');
function countAbove(dist, threshold, totalRules, findingsCount) {
	// stripped 일부 finding 부재 = ≥ 0.5 통과 (keywordThreshold default)
	// distribution count = overlap 계산 BR 총합 (with_both)
	return null;
}

// 정확한 비교 위해 validator 안 overlap_distribution 사용 + 임계 통과 직접 계산
import('../src/validator.js').then((m) => {});

// per-BR 모든 overlap 추출 위해 validator deterministic 재실행 + overlap_score 모두 수집
async function collectAllOverlaps(rules) {
	const { validateBR, resetFindingSeq } =
		await import('../src/deterministic.js');
	resetFindingSeq();
	const out = [];
	for (let i = 0; i < rules.length; i++) {
		const r = validateBR(rules[i], {
			path: `/business_rules/${i}`,
			keywordThreshold: 1.01,
		}); // 1.01 = 모든 BR 안 keyword_mismatch finding 강제 → overlap_score 추출
		if (typeof r.overlap_score === 'number')
			out.push({ br_id: rules[i].id, score: r.overlap_score });
	}
	return out;
}

const origAll = await collectAllOverlaps(rules);
const stripAll = await collectAllOverlaps(strippedRules);

const origSorted = origAll.map((x) => x.score).sort((a, b) => a - b);
const stripSorted = stripAll.map((x) => x.score).sort((a, b) => a - b);

function p(arr, q) {
	return arr[Math.floor(arr.length * q)];
}
function dist(arr) {
	if (!arr.length) return 'empty';
	const n = arr.length;
	const mean = arr.reduce((a, b) => a + b, 0) / n;
	const median = arr[Math.floor(n / 2)];
	return `n=${n} min=${arr[0].toFixed(3)} p25=${p(arr, 0.25).toFixed(3)} p50=${median.toFixed(3)} p75=${p(arr, 0.75).toFixed(3)} p90=${p(arr, 0.9).toFixed(3)} max=${arr[n - 1].toFixed(3)} mean=${mean.toFixed(3)}`;
}

console.log('=== 전체 BR overlap 분포 (forced keywordThreshold=1.01) ===');
console.log('  원본:    ', dist(origSorted));
console.log('  stripped:', dist(stripSorted));
console.log();

console.log('=== 임계 통과 비교 (forced 분포 기반) ===');
console.log('  threshold | original | stripped');
for (const t of [0.85, 0.7, 0.5, 0.4, 0.3, 0.2, 0.15, 0.1]) {
	const o = origSorted.filter((s) => s >= t).length;
	const s = stripSorted.filter((s) => s >= t).length;
	console.log(
		'  ≥' +
			t.toFixed(2) +
			'       ' +
			(o + '/' + origSorted.length).padStart(7) +
			'  ' +
			(s + '/' + stripSorted.length).padStart(7),
	);
}
console.log();

console.log('=== 결단 ===');
const origMean = origSorted.reduce((a, b) => a + b, 0) / origSorted.length;
const stripMean = stripSorted.reduce((a, b) => a + b, 0) / stripSorted.length;
const meanDelta = stripMean - origMean;
console.log(
	'  mean delta: ' +
		(meanDelta >= 0 ? '+' : '') +
		meanDelta.toFixed(3) +
		' (original=' +
		origMean.toFixed(3) +
		' / stripped=' +
		stripMean.toFixed(3) +
		')',
);
console.log();
if (meanDelta >= 0.2) {
	console.log(
		'가설 B 강 확인 — rationale 제거 후 overlap 자릿수 강 상승 = data quality 차이 본질 / semantic 차이 ❌',
	);
	console.log(
		'  → description vs natural_language paradigm 재정의 의무 (Agent 3 R4 정합)',
	);
	console.log(
		'  → Layer 1 keyword overlap 그대로 사용 가능 / 단 paradigm = "pure BR 부분만 매칭"',
	);
} else if (meanDelta >= 0.05) {
	console.log(
		'가설 B 부분 확인 — overlap 자릿수 소폭 상승 / data quality + semantic 차이 혼합',
	);
	console.log('  → paradigm 재정의 + Layer 2 LLM 의무 둘 다 carry');
} else {
	console.log('가설 B 부정 — overlap 변화 미미 / data quality ≠ 본질');
	console.log('  → Layer 2 LLM 의무 단독 강 (Agent 3 R5 정합)');
}
