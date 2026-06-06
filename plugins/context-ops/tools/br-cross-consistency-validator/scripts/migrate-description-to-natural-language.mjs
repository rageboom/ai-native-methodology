#!/usr/bin/env node
// v2.5.0 Phase A 마이그레이션 script — description → natural_language 자동 추출 + description 안 rationale/caveat 보존
// Q2-c (a) 결단 정합 / ADR-CHAIN-011 §5 patch v3 / Plan P §3.2-5 정합
//
// paradigm:
//   description 첫 문장 (첫 ". " 까지) → natural_language 신규 필드 (pure BR statement 추출)
//   description 원본 보존 (rationale + caveat 자유 metadata / 사람 눈 친화)
//   자동 추출 = 정확 보장 ❌ / 사람 검토 carry 의무
//
// 시행:
//   node tools/br-cross-consistency-validator/scripts/migrate-description-to-natural-language.mjs <rules.json> [--dry-run]

import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const targetPath = args.find((a) => !a.startsWith('--'));

if (!targetPath) {
	console.error(
		'Usage: migrate-description-to-natural-language.mjs <rules.json> [--dry-run]',
	);
	process.exit(2);
}

const absPath = path.isAbsolute(targetPath)
	? targetPath
	: path.resolve(process.cwd(), targetPath);
const doc = JSON.parse(fs.readFileSync(absPath, 'utf8'));
const rules = doc.rules || doc.business_rules || [];

function extractPureBR(description) {
	if (typeof description !== 'string') return null;
	let s = description.trim();
	// 첫 ". " 까지 (첫 문장)
	const periodSpace = s.indexOf('. ');
	if (periodSpace > 0) s = s.slice(0, periodSpace + 1);
	// 괄호 안 caveat 제거
	s = s
		.replace(/\([^)]*\)/g, '')
		.replace(/\s+/g, ' ')
		.trim();
	// em dash 이후 caveat 제거
	s = s.split(/\s[—–-]\s/)[0].trim();
	// trailing " ." → "." 정리 (첫 ". " split 잔존 영역)
	s = s.replace(/\s+\.$/, '.');
	return s.length > 0 ? s : null;
}

let migrated = 0;
let skipped_existing_nl = 0;
let skipped_no_description = 0;
const reviewCarry = []; // 사람 검토 carry 추적

for (let i = 0; i < rules.length; i++) {
	const br = rules[i];
	if (
		typeof br.natural_language === 'string' &&
		br.natural_language.trim().length > 0
	) {
		skipped_existing_nl += 1;
		continue;
	}
	if (
		typeof br.description !== 'string' ||
		br.description.trim().length === 0
	) {
		skipped_no_description += 1;
		continue;
	}
	const extracted = extractPureBR(br.description);
	if (!extracted) {
		skipped_no_description += 1;
		continue;
	}
	br.natural_language = extracted;
	// description 원본 보존
	migrated += 1;
	reviewCarry.push({
		br_id: br.id || `<index-${i}>`,
		original_description_length: br.description.length,
		extracted_nl_length: extracted.length,
		extracted_nl: extracted,
	});
}

console.log('=== v2.5.0 Phase A 마이그레이션 결과 ===');
console.log('target:', absPath);
console.log('총 BR:', rules.length);
console.log('migrated (description → natural_language):', migrated);
console.log('skipped (existing natural_language):', skipped_existing_nl);
console.log('skipped (no description):', skipped_no_description);
console.log();

if (reviewCarry.length > 0) {
	console.log('=== 사람 검토 carry (자동 추출 정확 보장 ❌) ===');
	for (const c of reviewCarry) {
		console.log(
			`  ${c.br_id}:  desc[${c.original_description_length}b] → nl[${c.extracted_nl_length}b]`,
		);
		console.log(`    nl: "${c.extracted_nl}"`);
	}
	console.log();
}

if (dryRun) {
	console.log('--dry-run 모드 / 파일 변경 ❌');
} else if (migrated > 0) {
	fs.writeFileSync(absPath, JSON.stringify(doc, null, 2) + '\n', 'utf8');
	console.log(`${absPath} 마이그레이션 적용 ✅`);
} else {
	console.log('마이그레이션 대상 부재 / 파일 변경 ❌');
}
