// explore.test.js — 드릴다운/색상 순수 로직 회귀 테스트.
//   app.js 가 인라인이라 직접 테스트 불가 → 순수 함수를 explore.js 로 분리해 여기서 검증.
//   특히 colorOf 자기참조 무한루프(F-VIZ-COLOR-RECURSION) 회귀를 잡는다.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
	colorOf,
	chainRelations,
	exploreVisibleSet,
	tidyTreeRows,
} from '../src/explore.js';

const STAGE = {
	UC: '#2563eb',
	BHV: '#0d9488',
	AC: '#16a34a',
	TASK: '#ca8a04',
	TC: '#ea580c',
	IMPL: '#dc2626',
};
const KIND = { chain: '#2563eb', analysis: '#059669', symbol: '#0891b2' };

test('colorOf — 단계 우선 / kind fallback / 기본값 (무한루프 회귀)', () => {
	assert.equal(colorOf({ artifact_subkind: 'AC', artifact_kind: 'chain' }, STAGE, KIND), '#16a34a');
	// 단계 없음 → kind 색 (버그 시 자기참조 무한루프로 stack overflow 났던 경로)
	assert.equal(colorOf({ artifact_kind: 'analysis' }, STAGE, KIND), '#059669');
	assert.equal(colorOf({ artifact_kind: 'symbol' }, STAGE, KIND), '#0891b2');
	// 아무 색도 없음 → fallback (재귀 없이 반드시 문자열 반환)
	assert.equal(colorOf({}, STAGE, KIND), '#6b7280');
	assert.equal(typeof colorOf({ artifact_kind: 'unknown' }, STAGE, KIND), 'string');
});

test('chainRelations — forward(이른 컬럼→늦은 컬럼) 부모/자식, 방향 무관', () => {
	const col = { UC1: 0, BHV1: 1, BHV2: 1, AC1: 2 };
	const edges = [
		{ source: 'UC1', target: 'BHV1' }, // 정방향
		{ source: 'AC1', target: 'BHV2' }, // 역방향(타깃이 더 이른 컬럼) → BHV2 가 부모
		{ source: 'X', target: 'BHV1', skip: true }, // skipEdge
	];
	const { childrenOf, parentsOf } = chainRelations(
		edges,
		(id) => (id in col ? col[id] : null),
		(x) => x,
		(e) => e.skip === true,
	);
	assert.deepEqual(childrenOf.get('UC1'), ['BHV1']);
	assert.deepEqual(childrenOf.get('BHV2'), ['AC1']); // 역방향에서 BHV2(col1) 가 AC1(col2) 의 부모
	assert.deepEqual(parentsOf.get('BHV1'), ['UC1']); // skip 엣지(X→BHV1)는 제외
});

test('chainRelations — 같은 컬럼 / 컬럼 미상 엣지 무시', () => {
	const edges = [
		{ source: 'A', target: 'B' }, // 같은 컬럼
		{ source: 'A', target: 'Z' }, // Z 컬럼 미상(null)
	];
	const { childrenOf } = chainRelations(
		edges,
		(id) => ({ A: 1, B: 1 }[id] ?? null),
		(x) => x,
	);
	assert.equal(childrenOf.size, 0);
});

test('exploreVisibleSet — roots 부터 expanded 자식만 펼침', () => {
	const childrenOf = new Map([
		['UC1', ['BHV1', 'BHV2']],
		['BHV1', ['AC1']],
	]);
	// 아무것도 안 펼침 → roots 만
	assert.deepEqual(
		[...exploreVisibleSet(['UC1', 'UC2'], new Set(), childrenOf)].sort(),
		['UC1', 'UC2'],
	);
	// UC1 펼침 → 자식 BHV 노출, 손주는 BHV1 미펼침이라 숨김
	assert.deepEqual(
		[...exploreVisibleSet(['UC1'], new Set(['UC1']), childrenOf)].sort(),
		['BHV1', 'BHV2', 'UC1'],
	);
	// UC1 + BHV1 펼침 → AC1 까지
	assert.deepEqual(
		[...exploreVisibleSet(['UC1'], new Set(['UC1', 'BHV1']), childrenOf)].sort(),
		['AC1', 'BHV1', 'BHV2', 'UC1'],
	);
});

test('tidyTreeRows — 부모는 자식 중앙 + 서브트리 영역 비겹침', () => {
	const childrenOf = new Map([
		['UC1', ['BHV1', 'BHV2']],
		['BHV1', ['AC1', 'AC2']],
		['UC2', ['BHV3']],
	]);
	const expanded = new Set(['UC1', 'BHV1', 'UC2']);
	const vis = new Set(['UC1', 'UC2', 'BHV1', 'BHV2', 'BHV3', 'AC1', 'AC2']);
	const row = tidyTreeRows(['UC1', 'UC2'], expanded, childrenOf, vis, 0.7);

	// 부모 중앙 정렬
	assert.equal(row.get('BHV1'), (row.get('AC1') + row.get('AC2')) / 2);
	assert.equal(row.get('UC1'), (row.get('BHV1') + row.get('BHV2')) / 2);
	// UC2 서브트리가 UC1 서브트리 최대행보다 아래 (영역 비겹침)
	const uc1Max = Math.max(row.get('AC1'), row.get('AC2'), row.get('BHV2'));
	assert.ok(row.get('BHV3') > uc1Max, 'UC2 가지가 UC1 가지 영역과 겹치지 않음');
	// leaf 는 연속 정수 슬롯
	assert.equal(row.get('AC1'), 0);
	assert.equal(row.get('AC2'), 1);
});

test('tidyTreeRows — 미펼침 루트는 leaf 로 (자식 미노출)', () => {
	const childrenOf = new Map([['UC1', ['BHV1']]]);
	const row = tidyTreeRows(['UC1'], new Set(), childrenOf, new Set(['UC1']), 0.7);
	assert.equal(row.get('UC1'), 0);
	assert.equal(row.has('BHV1'), false);
});

test('역방향 — 같은 함수에 parentsOf + leaf 루트를 넘기면 코드→UC 드릴다운 동작', () => {
	// forward: UC1→BHV1→IMPL1. reverse: IMPL1(leaf) 부터 parentsOf 로 거슬러 펼침.
	const parentsOf = new Map([
		['BHV1', ['UC1']],
		['IMPL1', ['BHV1']],
	]);
	// IMPL1 만 펼침 → BHV1 노출, UC1 은 BHV1 미펼침이라 숨김
	assert.deepEqual(
		[...exploreVisibleSet(['IMPL1'], new Set(['IMPL1']), parentsOf)].sort(),
		['BHV1', 'IMPL1'],
	);
	// IMPL1 + BHV1 펼침 → UC1 까지 (코드→UC 전체 추적)
	assert.deepEqual(
		[...exploreVisibleSet(['IMPL1'], new Set(['IMPL1', 'BHV1']), parentsOf)].sort(),
		['BHV1', 'IMPL1', 'UC1'],
	);
	// tidy-tree 도 parentsOf 로 동작 (IMPL1 루트, 부모 방향 트리)
	const vis = new Set(['IMPL1', 'BHV1', 'UC1']);
	const row = tidyTreeRows(['IMPL1'], new Set(['IMPL1', 'BHV1']), parentsOf, vis, 0.7);
	assert.equal(row.get('UC1'), 0); // 말단(leaf=트리 잎)
	assert.ok(row.has('IMPL1') && row.has('BHV1'));
});
