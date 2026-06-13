// append-catalog.test.js — 공용 카탈로그 writer (multi-BC / 2-zone) 회귀.
//   DEC-2026-06-12-resve-multidomain-corroboration §F-1: load-business-rules.js(reader) 의 writer 짝.
//   핵심 회귀: (1) upsert-by-id sibling 보존(BC#2 가 BC#1 안 덮음) (2) indent 보존(2-space 파일이 reformat 안 됨).
//   _shared 는 자체 test 패키지가 없어 소비자(chain-driver)에 둠(load-business-rules-split.test.js 선례).
import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
	detectIndent,
	upsertById,
	mergeUbiquitousLanguage,
	upsertBcFile,
	upsertCautionGroup,
	appendBoundedContext,
	appendBcFileToIndex,
} from '../../_shared/append-catalog.js';

describe('detectIndent', () => {
	test('2-space 파일 → 2', () => {
		assert.equal(detectIndent('{\n  "a": 1\n}'), 2);
	});
	test('tab 파일 → \\t', () => {
		assert.equal(detectIndent('{\n\t"a": 1\n}'), '\t');
	});
	test('한 줄/감지 불가 → 2(기본)', () => {
		assert.equal(detectIndent('{"a":1}'), 2);
		assert.equal(detectIndent(''), 2);
	});
});

describe('upsertById — sibling 보존', () => {
	test('없는 id → append', () => {
		const arr = [{ id: 'A' }];
		const r = upsertById(arr, { id: 'B', v: 1 }, 'id');
		assert.equal(r.action, 'appended');
		assert.deepEqual(arr.map((x) => x.id), ['A', 'B']);
	});
	test('있는 id → in-place 교체(중복 ❌)', () => {
		const arr = [{ id: 'A', v: 1 }, { id: 'B' }];
		const r = upsertById(arr, { id: 'A', v: 2 }, 'id');
		assert.equal(r.action, 'replaced');
		assert.equal(r.index, 0);
		assert.equal(arr.length, 2);
		assert.equal(arr[0].v, 2);
	});
	test('idKey 누락 entry → throw', () => {
		assert.throws(() => upsertById([], {}, 'id'), /missing key/);
	});
});

describe('mergeUbiquitousLanguage — term dedup', () => {
	test('term_ko/term 정규화 + 기존 term skip', () => {
		const dom = { ubiquitous_language: [{ term: '예약', term_en: 'Reservation' }] };
		const added = mergeUbiquitousLanguage(dom, [
			{ term_ko: '예약', term_en: 'X' }, // 이미 있음 → skip
			{ term_ko: '자산', term_en: 'Asset', definition: 'd' }, // 신규
		]);
		assert.deepEqual(added, ['자산']);
		assert.equal(dom.ubiquitous_language.length, 2);
		assert.equal(dom.ubiquitous_language[1].term, '자산');
		assert.deepEqual(dom.ubiquitous_language[1].synonyms, []);
	});
});

describe('upsertBcFile — total_rules 재계산', () => {
	test('append + total 합산', () => {
		const idx = { bc_files: [{ bounded_context: 'BC-A', rule_count: 3 }], total_rules: 3 };
		const r = upsertBcFile(idx, { bounded_context: 'BC-B', rule_count: 5 });
		assert.equal(r.action, 'appended');
		assert.equal(idx.total_rules, 8);
	});
	test('교체 시 total 재계산(중복합산 ❌)', () => {
		const idx = { bc_files: [{ bounded_context: 'BC-A', rule_count: 3 }], total_rules: 3 };
		upsertBcFile(idx, { bounded_context: 'BC-A', rule_count: 10 });
		assert.equal(idx.bc_files.length, 1);
		assert.equal(idx.total_rules, 10);
	});
	test('F-finding: rule_ids 가 SSOT — 틀린 rule_count 를 rule_ids.length 로 교정', () => {
		// 레거시(rule_ids 없는) BC-A 는 rule_count 그대로 사용
		const idx = { bc_files: [{ bounded_context: 'BC-A', rule_count: 36 }], total_rules: 36 };
		// caller 가 rule_count 21 로 잘못 기재(실제 rule_ids 는 23개) — LLM 팬아웃 drift 재현
		const r = upsertBcFile(idx, {
			bounded_context: 'BC-B',
			rule_count: 21,
			rule_ids: Array.from({ length: 23 }, (_, i) => `BR-B-${i + 1}`),
		});
		assert.equal(r.action, 'appended');
		assert.equal(idx.bc_files[1].rule_count, 23, 'rule_count 가 rule_ids.length(23) 로 교정');
		assert.equal(idx.total_rules, 59, 'total = 36 + 23 (과소집계 57 아님)');
		assert.equal(r.total_rules, 59);
	});
	test('F-finding: rule_ids 부재 entry 는 rule_count fallback(하위호환)', () => {
		const idx = { bc_files: [], total_rules: 0 };
		upsertBcFile(idx, { bounded_context: 'BC-LEGACY', rule_count: 7 });
		assert.equal(idx.total_rules, 7);
		assert.equal(idx.bc_files[0].rule_count, 7);
	});
});

describe('upsertCautionGroup — title 키', () => {
	test('append', () => {
		const mc = { caution_groups: [{ title: 'G1', cautions: [] }] };
		upsertCautionGroup(mc, { title: 'G2', cautions: [{ id: 'X' }] });
		assert.deepEqual(mc.caution_groups.map((g) => g.title), ['G1', 'G2']);
	});
	test('title 충돌 → cautions id union 병합 (sibling caution 보존 / group 통째 교체 ❌)', () => {
		// 회귀: empcard rollup 이 stdpkng 메타 그룹을 통째 교체해 2 cautions drop (DEC-2026-06-14).
		const mc = {
			caution_groups: [
				{
					title: 'META',
					category: 'database',
					cautions: [
						{ id: 'C-A', title: 'a' },
						{ id: 'C-B', title: 'b' },
					],
				},
			],
		};
		const r = upsertCautionGroup(mc, {
			title: 'META',
			cautions: [
				{ id: 'C-B', title: 'b2' },
				{ id: 'C-C', title: 'c' },
			],
		});
		assert.equal(r.action, 'merged');
		assert.equal(mc.caution_groups.length, 1, '그룹 수 유지(통째 교체 금지)');
		const g = mc.caution_groups[0];
		assert.deepEqual(
			g.cautions.map((c) => c.id),
			['C-A', 'C-B', 'C-C'],
			'C-A 보존 + C-C 추가',
		);
		assert.equal(g.cautions.find((c) => c.id === 'C-B').title, 'b2', '같은 id 는 교체');
		assert.equal(r.addedCautions, 1);
		assert.equal(r.replacedCautions, 1);
		assert.equal(g.category, 'database', '기존 그룹 메타 보존');
	});
	test('merge idempotent — 같은 group 재적용 시 중복 0', () => {
		const mc = { caution_groups: [] };
		const grp = {
			title: 'M',
			cautions: [{ id: 'C-1' }, { id: 'C-2' }],
		};
		upsertCautionGroup(mc, grp);
		upsertCautionGroup(mc, grp);
		assert.equal(mc.caution_groups.length, 1);
		assert.deepEqual(
			mc.caution_groups[0].cautions.map((c) => c.id),
			['C-1', 'C-2'],
		);
	});
});

describe('path-based — multi-BC no-clobber + indent 보존 (핵심 회귀)', () => {
	let root;
	before(() => {
		root = mkdtempSync(join(tmpdir(), 'append-catalog-'));
	});
	after(() => {
		rmSync(root, { recursive: true, force: true });
	});

	test('appendBoundedContext: BC#2 가 BC#1 을 안 덮고, 2-space indent 보존', () => {
		const p = join(root, 'domain.json');
		// 기존 = 2-space, BC-EVENT 1개
		const initial = {
			meta: { v: 1 },
			bounded_contexts: [{ id: 'BC-EVENT', name: '이벤트' }],
			ubiquitous_language: [{ term: '이벤트', term_en: 'Event' }],
		};
		writeFileSync(p, JSON.stringify(initial, null, 2) + '\n');

		const r = appendBoundedContext(
			p,
			{ id: 'BC-RESV-MTRM', name: '회의실 예약' },
			[{ term_ko: '회의실', term_en: 'MeetingRoom', definition: 'd' }],
		);
		assert.equal(r.action, 'appended');
		assert.deepEqual(r.addedUl, ['회의실']);

		const text = readFileSync(p, 'utf8');
		const obj = JSON.parse(text);
		// sibling 보존
		assert.deepEqual(obj.bounded_contexts.map((b) => b.id), ['BC-EVENT', 'BC-RESV-MTRM']);
		assert.equal(obj.ubiquitous_language.length, 2);
		// indent 보존 — 2-space 그대로 (reformat 가짜 diff 차단)
		assert.match(text, /\n {2}"meta":/);
		assert.ok(!/\n {1}"meta":/.test(text), '1-space 로 reformat 되면 안 됨');
		assert.ok(text.endsWith('\n'), 'trailing newline 보존');
	});

	test('appendBcFileToIndex: 누적 + total 재계산', () => {
		const p = join(root, 'business-rules.json');
		writeFileSync(
			p,
			JSON.stringify({ bc_files: [{ bounded_context: 'BC-EVENT', rule_count: 36 }], total_rules: 36 }, null, 2) + '\n',
		);
		// caller 가 rule_count 99 로 잘못 기재 — rule_ids(20개) 가 SSOT 이므로 20 으로 교정되어야 함
		appendBcFileToIndex(p, {
			bounded_context: 'BC-RESV-MTRM',
			rule_count: 99,
			rule_ids: Array.from({ length: 20 }, (_, i) => `BR-RESVMTRM-X-${String(i + 1).padStart(3, '0')}`),
		});
		const obj = JSON.parse(readFileSync(p, 'utf8'));
		assert.deepEqual(obj.bc_files.map((f) => f.bounded_context), ['BC-EVENT', 'BC-RESV-MTRM']);
		assert.equal(obj.bc_files[1].rule_count, 20, 'rule_count 가 rule_ids.length 로 교정(99 무시)');
		assert.equal(obj.total_rules, 56, 'total = 36 + 20');
	});
});
