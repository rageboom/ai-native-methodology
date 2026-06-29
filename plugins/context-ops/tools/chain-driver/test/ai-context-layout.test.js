// ai-context-layout.test.js
// analysisOutputPresent probe (DEC-2026-06-26-analysis-state-aware-router / MIS-433)
//   순수 fs 존재 probe — analysis 산출물(.ai-context/base|output)이 하나라도 있으면 true.
//   진입 라우터(UserPromptSubmit)가 "분석 미완 → analysis 먼저"를 결정하는 근거 신호.

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
	analysisOutputPresent,
	ANALYSIS_ARTIFACT_FILENAMES,
	minimalSubsetPresent,
	MINIMAL_SUBSET_FILENAMES,
} from '../../_shared/ai-context-layout.js';

function withTmp(fn) {
	const tmp = mkdtempSync(join(tmpdir(), 'aolayout-'));
	try {
		return fn(tmp);
	} finally {
		rmSync(tmp, { recursive: true, force: true });
	}
}
function writeArtifact(root, dir, name, body = '{}') {
	const d = join(root, '.ai-context', dir);
	mkdirSync(d, { recursive: true });
	writeFileSync(join(d, name), body, 'utf-8');
}

describe('analysisOutputPresent — 분석 산출물 결정론 probe', () => {
	it('truly-fresh (.ai-context 없음) → false', () => {
		withTmp((root) => assert.equal(analysisOutputPresent(root), false));
	});

	it('빈 base/ 디렉토리(산출물 0) → false', () => {
		withTmp((root) => {
			mkdirSync(join(root, '.ai-context', 'base'), { recursive: true });
			assert.equal(analysisOutputPresent(root), false);
		});
	});

	it('NEW 레이아웃 base/architecture.json → true', () => {
		withTmp((root) => {
			writeArtifact(root, 'base', 'architecture.json');
			assert.equal(analysisOutputPresent(root), true);
		});
	});

	it('OLD 레이아웃 output/domain.json (base/ 부재) → true (read-alias)', () => {
		withTmp((root) => {
			writeArtifact(root, 'output', 'domain.json');
			assert.equal(analysisOutputPresent(root), true);
		});
	});

	it('OR-any: ui-spec.json 만 있어도 (greenfield/FE-first subset) → true', () => {
		withTmp((root) => {
			writeArtifact(root, 'base', 'ui-spec.json');
			assert.equal(analysisOutputPresent(root), true);
		});
	});

	it('db-schema.json 별칭도 인식 → true', () => {
		withTmp((root) => {
			writeArtifact(root, 'output', 'db-schema.json');
			assert.equal(analysisOutputPresent(root), true);
		});
	});

	it('chain 산출물(discovery-spec.json)만 있으면 → false (analysis 아님)', () => {
		withTmp((root) => {
			writeArtifact(root, 'base', 'discovery-spec.json');
			assert.equal(analysisOutputPresent(root), false);
		});
	});

	it('root 가드: null/undefined/비문자열 → false (no-throw)', () => {
		assert.equal(analysisOutputPresent(null), false);
		assert.equal(analysisOutputPresent(undefined), false);
		assert.equal(analysisOutputPresent(123), false);
	});

	it('파일명 집합은 chain 산출물·input.json 을 제외(스코프 정확)', () => {
		assert.ok(ANALYSIS_ARTIFACT_FILENAMES.includes('architecture.json'));
		assert.ok(!ANALYSIS_ARTIFACT_FILENAMES.includes('discovery-spec.json'));
		assert.ok(!ANALYSIS_ARTIFACT_FILENAMES.includes('behavior-spec.json'));
		assert.ok(!ANALYSIS_ARTIFACT_FILENAMES.includes('input.json'));
	});
});

describe('minimalSubsetPresent — draft-first grounding floor (AND)', () => {
	const FLOOR = ['architecture.json', 'domain.json', 'business-rules.json'];

	it('universal floor 3종 모두 present(base/) → true', () => {
		withTmp((root) => {
			FLOOR.forEach((f) => writeArtifact(root, 'base', f));
			assert.equal(minimalSubsetPresent(root), true);
		});
	});

	it('OLD output/ 레이아웃 3종 모두 → true (read-alias)', () => {
		withTmp((root) => {
			FLOOR.forEach((f) => writeArtifact(root, 'output', f));
			assert.equal(minimalSubsetPresent(root), true);
		});
	});

	it('business-rules 누락 → false (AND)', () => {
		withTmp((root) => {
			writeArtifact(root, 'base', 'architecture.json');
			writeArtifact(root, 'base', 'domain.json');
			assert.equal(minimalSubsetPresent(root), false);
		});
	});

	it('architecture 누락 → false (AND)', () => {
		withTmp((root) => {
			writeArtifact(root, 'base', 'domain.json');
			writeArtifact(root, 'base', 'business-rules.json');
			assert.equal(minimalSubsetPresent(root), false);
		});
	});

	it('architecture 단독 → analysisOutputPresent=true 이나 minimalSubsetPresent=false (OR↔AND 구분)', () => {
		withTmp((root) => {
			writeArtifact(root, 'base', 'architecture.json');
			assert.equal(analysisOutputPresent(root), true);
			assert.equal(minimalSubsetPresent(root), false);
		});
	});

	it('floor 밖 산출물(ui-spec)만 → false', () => {
		withTmp((root) => {
			writeArtifact(root, 'base', 'ui-spec.json');
			assert.equal(minimalSubsetPresent(root), false);
		});
	});

	it('트랙 조건부(openapi/schema)는 floor 에 미포함 — 3종만으로 true', () => {
		withTmp((root) => {
			FLOOR.forEach((f) => writeArtifact(root, 'base', f));
			// openapi/schema 없이도 universal floor 충족 → true (트랙 완전성은 gate#0 책임)
			assert.equal(minimalSubsetPresent(root), true);
		});
	});

	it('inventory 는 floor 에 미포함 (guidance only)', () => {
		assert.ok(!MINIMAL_SUBSET_FILENAMES.includes('inventory.json'));
		assert.deepEqual([...MINIMAL_SUBSET_FILENAMES].sort(), [...FLOOR].sort());
	});

	it('root 가드: null/undefined/비문자열 → false (no-throw)', () => {
		assert.equal(minimalSubsetPresent(null), false);
		assert.equal(minimalSubsetPresent(undefined), false);
		assert.equal(minimalSubsetPresent(42), false);
	});
});
