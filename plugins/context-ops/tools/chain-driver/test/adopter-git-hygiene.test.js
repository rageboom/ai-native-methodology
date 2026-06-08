// adopter-git-hygiene.test.js — DEC-2026-06-08-living-sync-adopter-git-hygiene
//   B  = chain-driver init 이 .aimd/.gitignore 스캐폴드 (런타임 상태만 / idempotent / upgrade 경로).
//   C-lite = resolveOriginNodeIds {skipDerivedNoise} opt-in → --git 재검출이 도구 자기 파생물(.aimd/) skip.
//            lift·--changed(옵션 미전달)=무회귀. 진짜 새 구조 파일=unresolved 유지(BLOCKER-1 보존).
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import {
	mkdtempSync,
	mkdirSync,
	writeFileSync,
	readFileSync,
	existsSync,
	rmSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveOriginNodeIds } from '../src/sync-loop.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CLI = join(__dirname, '..', 'src', 'cli.js');
const run = (args, opts = {}) => spawnSync('node', [CLI, ...args], { encoding: 'utf-8', ...opts });

const NODE = (id, sp) => ({ id, artifact_kind: 'chain', artifact_subkind: 'BHV', state: 'active', source_path: sp });

describe('C-lite — resolveOriginNodeIds {skipDerivedNoise} (opt-in)', () => {
	const graph = { nodes: [NODE('BHV-1', '.aimd/output/behavior-spec.json')], edges: [] };
	const changed = [
		'.aimd/output/behavior-spec.json', // 매핑 (산출물)
		'.aimd/state.json', // 도구 상태
		'.aimd/output/artifact-graph.json', // 파생물
		'.aimd/output/matrix.json', // 파생물
		'.aimd/output/findings-spec.json', // 파생물 (findings-*)
		'.aimd/post/intervention-log.jsonl', // 파생물 (nested scope)
		'src/new-structural-file.js', // 진짜 미매핑 (도구 파생물 ❌)
	];

	it('opt-in=true → 매핑은 id, 도구 파생물은 skip, 진짜 새 파일만 unresolved', () => {
		const r = resolveOriginNodeIds(graph, changed, { skipDerivedNoise: true });
		assert.deepEqual(r.ids, ['BHV-1']);
		assert.deepEqual(r.unresolved, ['src/new-structural-file.js'], 'BLOCKER-1: 진짜 새 구조 파일은 유지');
		assert.deepEqual(r.skipped_derived, [
			'.aimd/output/artifact-graph.json',
			'.aimd/output/findings-spec.json',
			'.aimd/output/matrix.json',
			'.aimd/post/intervention-log.jsonl',
			'.aimd/state.json',
		]);
	});

	it('무회귀 — 옵션 미전달(lift/--changed 동형) = 도구 파생물도 전부 unresolved', () => {
		const r = resolveOriginNodeIds(graph, changed); // 옵션 없음
		assert.deepEqual(r.ids, ['BHV-1']);
		assert.equal(r.skipped_derived.length, 0, 'skip 안 함');
		assert.equal(r.unresolved.length, 6, '파생물 5 + 새파일 1 모두 unresolved');
	});

	it('prefix-pin (Senior MINOR-Q1) — .aimd/ 밖 동명 파일은 skip ❌', () => {
		const r = resolveOriginNodeIds(graph, ['data/matrix.json', 'reports/findings-x.json'], { skipDerivedNoise: true });
		assert.equal(r.skipped_derived.length, 0, '.aimd/ 밖은 도구 파생물 아님');
		assert.deepEqual(r.unresolved, ['data/matrix.json', 'reports/findings-x.json']);
	});

	it('매핑된 산출물명이 패턴과 무관 — skip 로직과 충돌 0 (AND-guard)', () => {
		// 만약 어떤 노드 source_path 가 matrix.json 이라면(가정) 매핑되어 hit → skip 분기 미도달.
		const g2 = { nodes: [NODE('X', '.aimd/output/matrix.json')], edges: [] };
		const r = resolveOriginNodeIds(g2, ['.aimd/output/matrix.json'], { skipDerivedNoise: true });
		assert.deepEqual(r.ids, ['X'], '매핑 우선 — skip 분기 안 탐');
		assert.equal(r.skipped_derived.length, 0);
	});
});

describe('B — chain-driver init 이 .aimd/.gitignore 스캐폴드', () => {
	it('신규 init → .aimd/.gitignore 생성 + 런타임 상태만 (파생물 제외 안 함)', () => {
		const root = mkdtempSync(join(tmpdir(), 'gi-new-'));
		const r = run(['init', root]);
		assert.equal(r.status, 0, r.stderr);
		const gi = join(root, '.aimd', '.gitignore');
		assert.ok(existsSync(gi), '.gitignore 생성');
		const body = readFileSync(gi, 'utf-8');
		assert.match(body, /^state\.json$/m);
		assert.match(body, /state\.json\.tmp/);
		assert.match(body, /intervention-log\.jsonl/);
		assert.doesNotMatch(body, /artifact-graph\.json/, '파생물=커밋 대상이라 제외 안 함');
		assert.doesNotMatch(body, /matrix\.json/);
		rmSync(root, { recursive: true, force: true });
	});

	it('idempotent — 기존 .gitignore 무클로버 (사용자 커스텀 보존)', () => {
		const root = mkdtempSync(join(tmpdir(), 'gi-keep-'));
		mkdirSync(join(root, '.aimd'), { recursive: true });
		writeFileSync(join(root, '.aimd', '.gitignore'), 'CUSTOM-USER-LINE\n');
		run(['init', root]);
		const body = readFileSync(join(root, '.aimd', '.gitignore'), 'utf-8');
		assert.equal(body, 'CUSTOM-USER-LINE\n', '덮어쓰지 않음');
		rmSync(root, { recursive: true, force: true });
	});

	it('upgrade 경로 (Senior MINOR-Q3) — state.json 존재 프로젝트 재-init(exit 3)도 .gitignore 받음', () => {
		const root = mkdtempSync(join(tmpdir(), 'gi-up-'));
		run(['init', root]); // 1차
		rmSync(join(root, '.aimd', '.gitignore'), { force: true }); // gitignore 만 삭제(구버전 상태 모사)
		const r = run(['init', root]); // state.json 존재 + no-scope → exit 3
		assert.equal(r.status, 3, 'state.json already exists');
		assert.ok(existsSync(join(root, '.aimd', '.gitignore')), 'exit 前 ensure 로 재생성');
		rmSync(root, { recursive: true, force: true });
	});
});

describe('C-lite e2e — sync-loop --git 이 도구 파생물 noise 제거 (no-sim / tmp git)', () => {
	it('산출물+artifact-graph+matrix 동시 변경 → unresolved 0 / skipped 2 / 매핑 origin', () => {
		const root = mkdtempSync(join(tmpdir(), 'git-clite-'));
		const g = (a) => spawnSync('git', a, { cwd: root, encoding: 'utf-8' });
		g(['init', '-q']); g(['config', 'user.email', 't@t']); g(['config', 'user.name', 't']);
		const outDir = join(root, '.aimd', 'output'); mkdirSync(outDir, { recursive: true });
		writeFileSync(join(outDir, 'behavior-spec.json'), JSON.stringify({ v: 1 }));
		writeFileSync(join(outDir, 'artifact-graph.json'), JSON.stringify({ synthesized_at: '2026-01-01', v: 1 }));
		writeFileSync(join(outDir, 'matrix.json'), JSON.stringify({ v: 1 }));
		const graph = { nodes: [NODE('BHV-1', '.aimd/output/behavior-spec.json')], edges: [] };
		const graphPath = join(root, 'graph.json'); writeFileSync(graphPath, JSON.stringify(graph));
		g(['add', '-A']); g(['commit', '-q', '-m', 'init']);
		// 산출물 + 도구 파생물(커밋돼 있음) 동시 변경
		writeFileSync(join(outDir, 'behavior-spec.json'), JSON.stringify({ v: 2 }));
		writeFileSync(join(outDir, 'artifact-graph.json'), JSON.stringify({ synthesized_at: '2026-01-02', v: 2 }));
		writeFileSync(join(outDir, 'matrix.json'), JSON.stringify({ v: 2 }));
		const r = run(['sync-loop', root, '--graph', graphPath, '--git', 'HEAD', '--dry-run', '--json']);
		assert.equal(r.status, 0, r.stderr);
		const out = JSON.parse(r.stdout.slice(r.stdout.indexOf('{')));
		const gd = out.regen_queue.git_diff;
		assert.ok(out.origins.includes('BHV-1'), '산출물 = origin');
		assert.equal((gd.unresolved_paths || []).length, 0, '도구 파생물 noise 0');
		assert.equal((gd.skipped_derived || []).length, 2, 'artifact-graph + matrix skip');
		rmSync(root, { recursive: true, force: true });
	});
});
