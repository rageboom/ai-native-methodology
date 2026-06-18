// preflight-check.js checkTool timeout 단위 테스트 (DEC-2026-06-18).
// 회귀 가드: 무응답 도구 probe 가 게이트 전체를 무한 hang 시키지 않고 timeout → absent(timed_out) 처리.

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { checkTool, TOOL_PROBE_TIMEOUT_MS } from '../preflight-check.js';

describe('checkTool — tool probe timeout (hang 차단)', () => {
	it('무응답(블록) 도구는 timeout 내에 absent + timed_out 으로 반환 (무한 hang ❌)', () => {
		const t0 = Date.now();
		// `sleep 5` = --version 이 5초간 무응답인 가짜 도구. timeout 1.5s 로 강제 차단.
		const r = checkTool(
			'faketool',
			{ cmd: 'sleep', versionFlag: '5', kind: 'analysis', fallback: 'fb' },
			1500,
		);
		const elapsed = Date.now() - t0;
		assert.equal(r.installed, false);
		assert.equal(r.status, 'absent');
		assert.equal(r.timed_out, true);
		assert.match(r.fallback, /무응답/);
		// 핵심: 5초 sleep 을 끝까지 기다리지 않고 ~1.5s 에 끊겨 반환 (hang 차단 입증).
		assert.ok(
			elapsed < 4000,
			`timeout 이 작동해야 함 — 실제 ${elapsed}ms (5s sleep 을 끝까지 안 기다림)`,
		);
	});

	it('정상 도구(node --version)는 ok + installed:true', () => {
		const r = checkTool('node', {
			cmd: 'node',
			versionFlag: '--version',
			kind: 'core',
		});
		assert.equal(r.installed, true);
		assert.equal(r.status, 'ok');
		assert.match(r.version, /v\d+\.\d+/);
		assert.equal(r.timed_out, undefined);
	});

	it('미설치 도구는 absent (timed_out 아님 — 즉시 반환)', () => {
		const r = checkTool('nope', {
			cmd: 'definitely-not-a-real-binary-xyz',
			versionFlag: '--version',
			kind: 'analysis',
			fallback: 'fb',
		});
		assert.equal(r.installed, false);
		assert.equal(r.status, 'absent');
		assert.equal(r.timed_out, undefined); // 미설치 = 즉시 / timeout 아님
	});

	it('기본 timeout 상한이 합리적 (>0, env override 가능)', () => {
		assert.ok(TOOL_PROBE_TIMEOUT_MS > 0);
		assert.ok(TOOL_PROBE_TIMEOUT_MS <= 60000);
	});

	it('spec.probeEnv 는 probe 자식 env 로 전달된다 ("쓰는 방식대로 탐지" — 거짓 absent ❌)', () => {
		// semgrep 처럼 naked 호출이 무응답인 도구를, runner 와 동일 오프라인 env 로 탐지하는 경로.
		// env 가 자식에 실제 전달되는지를 결정론적으로 검증(도구 설치 비의존).
		const r = checkTool('envtool', {
			cmd: 'echo "$AIMD_PROBE_MARKER"',
			versionFlag: '',
			kind: 'analysis',
			probeEnv: { AIMD_PROBE_MARKER: 'v-from-probeenv' },
		});
		assert.equal(r.installed, true);
		assert.match(r.version, /v-from-probeenv/);
	});
});
