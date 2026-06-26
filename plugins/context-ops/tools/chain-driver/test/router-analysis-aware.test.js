// router-analysis-aware.test.js
// analysis-state-aware 진입 라우터 (DEC-2026-06-26-analysis-state-aware-router / MIS-433)
//   UserPromptSubmit e2e — work-intent 자연어인데 분석 산출물이 없으면 discovery 대신
//   analysis 진입(analysis-input-collection/analysis-agent)으로 교체 + analysis-first 안내.
//   결정론 fs probe(cli glue) — routeEntry 는 순수(prompt-only) 유지(아래 purity pin).

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { routeEntry } from '../src/hooks-bridge.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CLI = join(__dirname, '..', 'src', 'cli.js');

function hook({ prompt, cwd }) {
	const payload = JSON.stringify({
		hook_event_name: 'UserPromptSubmit',
		prompt,
		cwd,
		session_id: 'router-test',
	});
	const r = spawnSync('node', [CLI, 'hooks-bridge'], {
		input: payload,
		encoding: 'utf-8',
	});
	const out = r.stdout ? JSON.parse(r.stdout) : null;
	return {
		status: r.status,
		ctx: out?.hookSpecificOutput?.additionalContext || '',
		raw: out,
	};
}
function withTmp(fn) {
	const tmp = mkdtempSync(join(tmpdir(), 'router-aa-'));
	try {
		return fn(tmp);
	} finally {
		rmSync(tmp, { recursive: true, force: true });
	}
}

const WORK_INTENT = '예약 취소 기능 추가해줘';

describe('UserPromptSubmit — analysis-state-aware 라우팅 (e2e)', () => {
	it('분석 산출물 ABSENT + work-intent → analysis 진입으로 교체 + analysis-first 안내', () => {
		withTmp((root) => {
			const { ctx } = hook({ prompt: WORK_INTENT, cwd: root });
			assert.match(ctx, /analysis-input-collection/, '제안 스킬 = analysis 진입');
			assert.match(ctx, /analysis-agent/, 'agent = analysis-agent');
			assert.match(ctx, /analysis-first/, 'analysis-first 안내');
			assert.match(ctx, /greenfield/, 'greenfield 분기 명시(dead-end 회피)');
			assert.doesNotMatch(ctx, /입구·라우터부터 ground/, 'discovery-default note 아님');
		});
	});

	it('분석 산출물 PRESENT(base/architecture.json) + work-intent → discovery 정상(교체 ❌)', () => {
		withTmp((root) => {
			const base = join(root, '.ai-context', 'base');
			mkdirSync(base, { recursive: true });
			writeFileSync(join(base, 'architecture.json'), '{}', 'utf-8');
			const { ctx } = hook({ prompt: WORK_INTENT, cwd: root });
			assert.match(ctx, /discovery-from-nl-md/, '제안 스킬 = discovery (불변)');
			assert.match(ctx, /입구·라우터/, 'discovery-default note');
			assert.doesNotMatch(ctx, /analysis-first/, 'analysis-first 미발생');
		});
	});

	it('OLD output/ 레이아웃 산출물 present → discovery 정상 (read-alias)', () => {
		withTmp((root) => {
			const out = join(root, '.ai-context', 'output');
			mkdirSync(out, { recursive: true });
			writeFileSync(join(out, 'business-rules.json'), '{}', 'utf-8');
			const { ctx } = hook({ prompt: WORK_INTENT, cwd: root });
			assert.match(ctx, /discovery-from-nl-md/);
			assert.doesNotMatch(ctx, /analysis-first/);
		});
	});

	it('stage-explicit(스펙 트리거)는 분석 부재여도 교체 ❌ (스왑은 discovery-default 한정)', () => {
		withTmp((root) => {
			const { ctx } = hook({ prompt: 'spec 시작해줘', cwd: root });
			assert.match(ctx, /spec-compose-behavior-spec/, 'stage 스킬 유지');
			assert.doesNotMatch(ctx, /analysis-input-collection/);
			assert.doesNotMatch(ctx, /analysis-first/);
		});
	});

	it('비-작업 prompt(질문)는 분석 부재여도 침묵 (route null)', () => {
		withTmp((root) => {
			const { raw } = hook({ prompt: '이 코드 구조 설명해줘', cwd: root });
			assert.equal(raw.suppressOutput, true);
			assert.equal(raw.hookSpecificOutput, undefined, 'additionalContext 없음(침묵)');
		});
	});
});

describe('routeEntry 순수성 pin — probe 는 glue, routeEntry 는 prompt-only', () => {
	it('work-intent 는 fs 와 무관하게 항상 discovery-default 반환', () => {
		// routeEntry 는 root 인자를 받지 않음 = 분석 산출물 존재 여부를 모름.
		// analysis-default 로의 교체는 cli.js glue 가 analysisOutputPresent 로 수행(순수성 보존).
		const r = routeEntry('예약 취소 기능 추가해줘');
		assert.equal(r.source, 'discovery-default');
		assert.equal(r.skillId, 'discovery-from-nl-md');
	});
});
