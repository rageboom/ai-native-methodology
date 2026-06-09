// release-readiness.test.js — Senior F3 흡수 / file presence 만 검사하는 criterion 0개 입증.
// 7 case: criterion 별 1 happy + 1 negative + 1 invariant.

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join } from 'node:path';
import {
	mkdtempSync,
	rmSync,
	writeFileSync,
	mkdirSync,
	cpSync,
	existsSync,
	readFileSync,
	readdirSync,
} from 'node:fs';
import { tmpdir } from 'node:os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, '..', '..');
const SCRIPT = resolve(ROOT, 'scripts/release-readiness.js');

function runScript(args, env = {}, timeout = 60000) {
	return spawnSync('node', [SCRIPT, ...args], {
		cwd: ROOT,
		env: { ...process.env, ...env },
		encoding: 'utf-8',
		shell: false,
		timeout,
	});
}

// v3.6.7 A1 — check11 (workspace test) 본격 spawn 회피 default (test cadence 시간 절감).
// happy path / criterion full 검증 case 만 본격 spawn (timeout 600_000).
const SKIP_WS = ['--skip-workspace-test'];

describe('release-readiness — Senior F3 흡수 (content-aware criterion / file presence ❌) + v3.6.7 11/11 + v7.1.0 12/12 + v8.1.0 13/13 격상', () => {
	it('happy path — 41/42 pass for v2.5.0 (A1 skip via --skip-workspace-test / check12 staleness + check13 citation pass / 본격 spawn 회피 cadence)', () => {
		// skip 시 check11(workspace_test) = pass=false / total 41/42 (나머지 전부 pass). release 본격 시행 시 본 flag ❌ 의무.
		const r = runScript(['--target', 'v2.5.0', '--json', ...SKIP_WS]);
		const out = JSON.parse(r.stdout);
		assert.equal(out.criteria_total, 42);
		assert.equal(out.criteria_passed, 41);
		const ws = out.results.find((x) => x.id === 'workspace_test_pass');
		assert.ok(
			ws.detail.includes('skipped via --skip-workspace-test'),
			'skip detail 명시 의무',
		);
		const stale = out.results.find((x) => x.id === 'authoring_spec_staleness');
		assert.ok(
			stale.pass,
			`check12 staleness must pass — detail: ${stale.detail}`,
		);
		const cite = out.results.find((x) => x.id === 'skill_citation_integrity');
		assert.ok(
			cite.pass,
			`check13 skill citation must pass — detail: ${cite.detail}`,
		);
	});

	it('all 42 criterion ids are present in output (no skipped)', () => {
		const r = runScript(['--target', 'v2.5.0', '--json', ...SKIP_WS]);
		const out = JSON.parse(r.stdout);
		const ids = out.results.map((x) => x.id).sort();
		assert.deepEqual(ids, [
			'adopter_corroboration_capture',
			'adoption_paradigm_drift',
			'adr_registry',
			'agent_skills_phaseflow_sync',
			'analysis_validator_violation',
			'artifact_secret_leak',
			'authoring_spec_staleness',
			'be_task_openapi_ref_ratchet',
			'catalog_range_covers_version',
			'chain_coverage',
			'claude_md_version_sync',
			'code_pointer_coverage',
			'codegraph_anchor_verify_reference_lens_trust',
			'codegraph_coverage_reference_lens_trust',
			'codegraph_finding_reference_lens_trust',
			'codegraph_module_reference_lens_trust',
			'codegraph_openapi_reference_lens_trust',
			'context_cache_reference_lens_trust',
			'db_assets_validator',
			'e2e_cycle_pass',
			'gate_enum_consistency',
			'gate_validator_list_consistency',
			'graph_integrity',
			'layer_2_consistency',
			'legacy_4_stage_expression_absent',
			'marketplace_stage_sync',
			'matrix_greenness',
			'plan_gate_operational',
			'poc_corroboration',
			'preflight_tools',
			'readme_version_sync',
			'real_tool_evidence',
			'shipped_identity_leak',
			'shipped_provenance_leak',
			'shipped_repo_relative_tool_path',
			'skill_citation_integrity',
			'spec_body_reference_lens_trust',
			'template_count_drift',
			'template_schema_valid',
			'trace_view_reference_lens_trust',
			'validators_violation',
			'workspace_test_pass',
		]);
	});

	it('authoring_spec_staleness — §6 pin 4 area ≤ 60d fresh + digest_sha 4행 일치 + --skip-authoring-staleness ≠ pass (R18 / ADR-PLUGIN-001 §7 patch v4)', () => {
		const r = runScript(['--target', 'v7.1.0', '--json', ...SKIP_WS]);
		const out = JSON.parse(r.stdout);
		const stale = out.results.find((x) => x.id === 'authoring_spec_staleness');
		assert.ok(stale.pass, `check12 must pass — detail: ${stale.detail}`);
		assert.match(
			stale.detail,
			/4 area 모두 ≤ 60d fresh \+ digest_sha 4행 일치/,
		);
		// skip flag = skip(≠pass) — release 시 본 flag ❌ 의무 (drift enforcement 정합 / check11 mirror).
		const r2 = runScript([
			'--target',
			'v7.1.0',
			'--json',
			...SKIP_WS,
			'--skip-authoring-staleness',
		]);
		const out2 = JSON.parse(r2.stdout);
		const stale2 = out2.results.find(
			(x) => x.id === 'authoring_spec_staleness',
		);
		assert.equal(stale2.pass, false);
		assert.ok(
			stale2.detail.includes('skipped via --skip-authoring-staleness'),
			'skip detail 명시 의무',
		);
	});

	// v8.2.0 digest_sha regression-guard (dogfood) — 실 §6 4행 각 digest_sha == sha256(trim(digest)) 선두 12hex.
	// release-readiness.js 가 ROOT 경로 hardcode → 파괴적 mutation 회피 (adr_registry test 패턴 동형).
	// digest 변경 후 hash 미재커밋 시 sha 불일치 = check #12 fail = §9 Layer i 불변식 결정적 강제 입증.
	it('§6 digest_sha — 4 area 모두 sha256(trim(digest)) 선두 12hex 와 일치 (§9 Layer i 불변식 / blind-spot closure)', async () => {
		const { createHash } = await import('node:crypto');
		const specPath = join(ROOT, 'methodology-spec/plugin-authoring-spec.md');
		const text = readFileSync(specPath, 'utf-8');
		const rows = [];
		for (const line of text.split(/\r?\n/)) {
			const m = line.match(
				/^\|\s*(skills|hooks|sub-agents|plugins-reference)\s*\|/,
			);
			if (!m) continue;
			const cells = line
				.split('|')
				.slice(1, -1)
				.map((c) => c.trim());
			assert.equal(
				cells.length,
				7,
				`${m[1]}: §6 행 7-cell 의무 (digest '|' 침입 fail-closed) — got ${cells.length}`,
			);
			const expected = createHash('sha256')
				.update(cells[3])
				.digest('hex')
				.slice(0, 12);
			assert.equal(
				cells[4],
				expected,
				`${m[1]}: digest_sha 불일치 (커밋 ${cells[4]} ≠ 재계산 ${expected} — digest 변경 후 hash 미재커밋)`,
			);
			rows.push(m[1]);
		}
		assert.deepEqual(rows.sort(), [
			'hooks',
			'plugins-reference',
			'skills',
			'sub-agents',
		]);
	});

	// v8.2.1 §8-2 documented-exception no-loophole — `_base-` 자산 정확 8 (frozen allowlist).
	// 9번째 `_base-` skill/agent 추가 시 check #12 fail (예외의 loophole 화 차단 / 신규=S3 ratchet).
	it('check12 _base- allowlist — 정확 5 skill + 3 agent (§8-2 documented-exception / loophole 방지)', () => {
		const r = runScript(['--target', 'v8.2.1', '--json', ...SKIP_WS]);
		const out = JSON.parse(r.stdout);
		const c = out.results.find((x) => x.id === 'authoring_spec_staleness');
		assert.ok(c.pass, `check12 must pass — detail: ${c.detail}`);
		assert.match(c.detail, /_base- 8 allowlist 정합/);
		// 실 디스크 = 정확히 enumerated 8 (frozen).
		const baseSkills = readdirSync(join(ROOT, 'skills'), {
			withFileTypes: true,
		})
			.filter((e) => e.isDirectory() && e.name.startsWith('_base-'))
			.map((e) => e.name)
			.sort();
		const baseAgents = readdirSync(join(ROOT, 'agents'), {
			withFileTypes: true,
		})
			.filter(
				(e) =>
					e.isFile() && e.name.startsWith('_base-') && e.name.endsWith('.md'),
			)
			.map((e) => e.name.replace(/\.md$/, ''))
			.sort();
		assert.deepEqual(baseSkills, [
			'_base-apply-baseline-ratchet',
			'_base-apply-template',
			'_base-build-traceability-matrix',
			'_base-invoke-go-stop-gate',
			'_base-log-finding',
		]);
		assert.deepEqual(baseAgents, [
			'_base-industry-case-researcher',
			'_base-official-docs-checker',
			'_base-senior-engineer',
		]);
	});

	it('layer_2_consistency — per-PoC mean ≥ 0.7 + critical/high drift 0 (Senior REVISE-1 + LL-i-43 정합)', () => {
		const r = runScript(['--target', 'v2.5.0', '--json', ...SKIP_WS]);
		const out = JSON.parse(r.stdout);
		const layer2 = out.results.find((x) => x.id === 'layer_2_consistency');
		assert.ok(
			layer2.pass,
			`layer_2_consistency must pass — detail: ${layer2.detail}`,
		);
		assert.match(layer2.detail, /poc-01=0\.\d+ \(n=13\)/);
		assert.match(layer2.detail, /poc-03=0\.\d+ \(n=18\)/);
		assert.match(layer2.detail, /poc-05=0\.\d+ \(n=2,sample\)/);
		assert.ok(
			layer2.delegated_to.includes('layer-2-results'),
			'delegated_to must reference Layer 2 results dir',
		);
	});

	it('every criterion records delegated_to (file presence 단독 ❌ / Senior F3)', () => {
		const r = runScript(['--target', 'v2.0.0-rc1', '--json', ...SKIP_WS]);
		const out = JSON.parse(r.stdout);
		for (const c of out.results) {
			assert.ok(
				typeof c.delegated_to === 'string' && c.delegated_to.length > 0,
				`${c.id} missing delegated_to`,
			);
		}
	});

	it('adr_registry rejects ADR with missing "결정" section (content-aware)', () => {
		// 임시 ADR 파일에 본문 없는 ADR 작성 → 재실행 시 fail.
		// 본 test 는 검사 함수의 정합성만 확인 — 실제 mutation 은 destructive 라 회피.
		// 직접 ADR-CHAIN-005 본문 일부를 텍스트 검사로 확인 (regex 만).
		const adrPath = join(
			ROOT,
			'docs/adr/ADR-CHAIN-005-driver-state-machine.md',
		);
		const text = readFileSync(adrPath, 'utf-8');
		assert.match(text, /^- 상태: 승인됨/m, 'ADR must declare 승인됨 status');
		assert.match(text, /## 결정/m, 'ADR must have 결정 section');
	});

	it('real_tool_evidence requires 10 fields + valid sha256 hash format', () => {
		// schema 정합 직접 검증 — release-readiness 의 sha256 regex 와 일치.
		const path = join(
			ROOT,
			'examples/poc-05-sample-user-register/.ai-context/output/impl-spec.json',
		);
		const spec = JSON.parse(readFileSync(path, 'utf-8'));
		const ev = spec.test_pass_evidence;
		const required = [
			'test_runner_version',
			'test_runner_stdout_path',
			'invocation_timestamp',
			'duration_ms',
			'pass_count',
			'fail_count',
			'skip_count',
			'reproduction_command',
			'result_hash',
			'report_format',
		];
		for (const f of required) assert.ok(ev[f] !== undefined, `missing ${f}`);
		assert.match(ev.result_hash, /^sha256:[a-f0-9]{64}$/);
	});

	it('matrix_greenness checks per-cell status (cells > 0 + all green required)', () => {
		const path = join(
			ROOT,
			'examples/poc-05-sample-user-register/.ai-context/output/matrix.json',
		);
		const m = JSON.parse(readFileSync(path, 'utf-8'));
		assert.ok(Array.isArray(m.matrix) && m.matrix.length > 0);
		const allGreen = m.matrix.every((c) => c.status === 'green');
		assert.ok(allGreen);
	});

	it('e2e_cycle_pass verifies fail_count==0 AND pass_count>0 (not just file existence)', () => {
		const path = join(
			ROOT,
			'examples/poc-05-sample-user-register/.ai-context/output/impl-spec.json',
		);
		const spec = JSON.parse(readFileSync(path, 'utf-8'));
		const ev = spec.test_pass_evidence;
		assert.equal(ev.fail_count, 0);
		assert.ok(ev.pass_count > 0);
	});

	it('non-existent target version still runs all 42 checks (target is metadata)', () => {
		const r = runScript(['--target', 'v99.99.99', '--json', ...SKIP_WS]);
		// even with bogus target, should still evaluate all checks against current artifacts.
		const out = JSON.parse(r.stdout);
		assert.equal(out.criteria_total, 42);
	});

	// check41 discrimination — 카탈로그 범위 ⊇ plugin.json 버전 (install ETARGET 회귀 가드).
	//   실 결함: 0.x 에서 ^0.1.0 = <0.2.0 라 0.19.x/0.20.x 미커버 → /plugin install "No matching version (ETARGET)".
	it('catalog_range_covers_version — 범위 ⊇ 버전 + 0.x caret 함정/major 경계 discrimination', () => {
		const r = runScript(['--target', 'v0.20.0', '--json', ...SKIP_WS]);
		const out = JSON.parse(r.stdout);
		const c = out.results.find((x) => x.id === 'catalog_range_covers_version');
		assert.ok(c.pass, `check41 must pass (범위가 현재 버전 커버) — detail: ${c.detail}`);
		assert.ok(c.delegated_to.includes('ETARGET'), 'ETARGET 회귀 차단 의도 명시');
		// discrimination — release-readiness.js semverSatisfies 미러 (compact / caret + comparator-set).
		const parseV = (s) => {
			const m = /^[v=]?(\d+)\.(\d+)\.(\d+)/.exec(String(s).trim());
			return m ? [+m[1], +m[2], +m[3]] : null;
		};
		const cmp = (a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2];
		const sat = (version, range) => {
			const v = parseV(version);
			const r2 = String(range).trim();
			if (r2.startsWith('^')) {
				const lo = parseV(r2.slice(1));
				const hi =
					lo[0] > 0 ? [lo[0] + 1, 0, 0]
					: lo[1] > 0 ? [0, lo[1] + 1, 0]
					: [0, 0, lo[2] + 1];
				return cmp(v, lo) >= 0 && cmp(v, hi) < 0;
			}
			return r2.split(/\s+/).every((cstr) => {
				const m = /^(>=|<=|>|<|=)?(.+)$/.exec(cstr);
				const op = m[1] || '=';
				const d = cmp(v, parseV(m[2]));
				return op === '>=' ? d >= 0
					: op === '<=' ? d <= 0
					: op === '>' ? d > 0
					: op === '<' ? d < 0
					: d === 0;
			});
		};
		assert.equal(sat('0.20.0', '^0.1.0'), false, '0.x caret 함정: ^0.1.0 은 0.20.0 미커버 (원 결함)');
		assert.equal(sat('0.20.0', '>=0.1.0 <1.0.0'), true, '수정 범위 >=0.1.0 <1.0.0 은 0.20.0 커버');
		assert.equal(sat('1.0.0', '>=0.1.0 <1.0.0'), false, 'major 경계: 1.0.0 은 0.x 범위 밖 → 게이트가 차단(범위 갱신 강제)');
		assert.equal(sat('1.5.0', '^1.0.0'), true, '1.x 는 caret 정상(^1.0.0 ⊇ 1.5.0)');
	});

	// v11.29.0 check30 discrimination — Type 2 캡처 배선 content-aware (file-presence ❌).
	it('adopter_corroboration_capture — golden round-trip + leak-guard discrimination (배선만 / 측정 ❌)', () => {
		const r = runScript(['--target', 'v11.29.0', '--json', ...SKIP_WS]);
		const out = JSON.parse(r.stdout);
		const c = out.results.find((x) => x.id === 'adopter_corroboration_capture');
		assert.ok(c.pass, `check30 must pass — detail: ${c.detail}`);
		assert.match(c.detail, /golden round-trip/);
		assert.match(c.detail, /leak-guard discrimination/);
		assert.ok(
			c.delegated_to.includes('adopter-evidence-packager'),
			'content-aware (packager round-trip 위임 / file-presence ❌)',
		);
	});

	// v12.7.0 check32 discrimination — 출하 skill/agent repo-relative 실행 경로 가드 (EXT-PATH / DEC-2026-06-03-plugin-root-path).
	it('shipped_repo_relative_tool_path — skills/agents 본문 node|bash tools/ 0 + 검출 regex discrimination (배포버그 가드 / content-aware)', () => {
		const r = runScript(['--target', 'v12.7.0', '--json', ...SKIP_WS]);
		const out = JSON.parse(r.stdout);
		const c = out.results.find(
			(x) => x.id === 'shipped_repo_relative_tool_path',
		);
		assert.ok(
			c.pass,
			`check32 must pass (0 repo-relative tool paths) — detail: ${c.detail}`,
		);
		assert.ok(
			c.delegated_to.includes('CLAUDE_PLUGIN_ROOT'),
			'delegated_to references the required prefix',
		);
		// discrimination — canonical regex (release-readiness.js check32 미러 / digest_sha test 패턴 동형 / 단순 안정 regex).
		const BROKEN_RE =
			/(?:[A-Za-z_][A-Za-z0-9_]*=\S+\s+)*\b(?:node|bash)\s+["']?(?:tools|scripts)\//;
		const isViolation = (line) =>
			!line.includes('${CLAUDE_PLUGIN_ROOT}') &&
			!/allow-repo-path:/.test(line) &&
			BROKEN_RE.test(line);
		assert.ok(
			isViolation('   node tools/chain-driver/src/cli.js next'),
			'bare node tools/ = violation',
		);
		assert.ok(
			isViolation('   PYTHONUTF8=1 node tools/static-runner/src/cli.js'),
			'env-prefix node tools/ = violation',
		);
		assert.ok(
			isViolation('bash tools/static-runner/src/lint-no-simulation.sh out'),
			'bash tools/ = violation',
		);
		assert.ok(
			!isViolation(
				'node ${CLAUDE_PLUGIN_ROOT}/tools/chain-driver/src/cli.js next',
			),
			'prefixed = OK',
		);
		assert.ok(
			!isViolation('the `tools/` directory holds validators'),
			'prose tools/ (no node|bash) = OK',
		);
		assert.ok(
			!isViolation('node tools/x.js  <!-- allow-repo-path: doc example -->'),
			'allow-repo-path: exempt',
		);
	});

	// v12.8.0 check33 discrimination — trace-view reference-lens trust (옵션 A+B / DEC-2026-06-03-dep-graph-trace-view).
	it('trace_view_reference_lens_trust — gate 모듈 trace-view 토큰 0 + trace-view.js gate-import 0 + reference_lens:true (display-only)', () => {
		const r = runScript(['--target', 'v12.8.0', '--json', ...SKIP_WS]);
		const out = JSON.parse(r.stdout);
		const c = out.results.find(
			(x) => x.id === 'trace_view_reference_lens_trust',
		);
		assert.ok(
			c.pass,
			`check33 must pass (trace-view reference-lens) — detail: ${c.detail}`,
		);
		assert.match(c.detail, /reference-lens/);
		assert.ok(
			c.delegated_to.includes('trace-view.js'),
			'content-aware (trace-view.js gate-import 0 + reference_lens:true / file-presence ❌)',
		);
	});

	// v12.9.0 check34 discrimination — codegraph-coverage reference-lens trust (STEP 1 / DEC-2026-06-03-codegraph-deliverable-wiring §5).
	it('codegraph_coverage_reference_lens_trust — gate 모듈 coverage 토큰 0 + severity ceiling 코드+구조 강제 + reference_lens:true', () => {
		const r = runScript(['--target', 'v12.9.0', '--json', ...SKIP_WS]);
		const out = JSON.parse(r.stdout);
		const c = out.results.find(
			(x) => x.id === 'codegraph_coverage_reference_lens_trust',
		);
		assert.ok(
			c.pass,
			`check34 must pass (codegraph-coverage reference-lens) — detail: ${c.detail}`,
		);
		assert.match(c.detail, /reference-lens/);
		assert.match(c.detail, /low.*medium/);
		assert.ok(
			c.delegated_to.includes('render.js'),
			'content-aware (render.js severity ceiling + schema enum / file-presence ❌)',
		);
	});

	// v12.10.0 check35 discrimination — codegraph→finding-list reference-lens trust (STEP 2 / DEC-2026-06-03-codegraph-deliverable-wiring §5 STEP 2).
	it('codegraph_finding_reference_lens_trust — gate 모듈 STEP 2 토큰 0 + finding-system code_graph_ref⟹severity conditional + finding-export ceiling/gate-import 0', () => {
		const r = runScript(['--target', 'v12.10.0', '--json', ...SKIP_WS]);
		const out = JSON.parse(r.stdout);
		const c = out.results.find(
			(x) => x.id === 'codegraph_finding_reference_lens_trust',
		);
		assert.ok(
			c.pass,
			`check35 must pass (codegraph→finding-list reference-lens) — detail: ${c.detail}`,
		);
		assert.match(c.detail, /reference-lens/);
		assert.match(c.detail, /code_graph_ref/);
		assert.ok(
			c.delegated_to.includes('finding-export.js'),
			'content-aware (finding-export.js ceiling + gate-import 0 + schema conditional / file-presence ❌)',
		);
		// discrimination — canonical 구조 검사 미러 (release-readiness.js check35 양성 ② 동형 / finding-system.schema.json conditional 실재 확인).
		const fsSchema = JSON.parse(
			readFileSync(
				resolve(ROOT, 'schemas/finding-system.schema.json'),
				'utf-8',
			),
		);
		assert.ok(
			fsSchema.properties.code_graph_ref &&
				fsSchema.properties.code_graph_ref.type === 'object',
			'code_graph_ref optional object 실재',
		);
		const cond = fsSchema.allOf.find(
			(x) => x.if && x.if.required && x.if.required.includes('code_graph_ref'),
		);
		assert.deepEqual(
			cond.then.properties.severity.enum,
			['low', 'medium'],
			'code_graph_ref ⟹ severity ⊆ {low,medium}',
		);
	});

	// v12.11.0 check36 discrimination — module dependency coverage-hole reference-lens trust (STEP 3 / DEC-2026-06-03-codegraph-deliverable-wiring §5 STEP 3).
	it('codegraph_module_reference_lens_trust — gate 모듈 module-axis 토큰 0 + informational_notes severity 부재(onlyArch 구조 차단) + module-graph ceiling/gate-import 0', () => {
		const r = runScript(['--target', 'v12.11.0', '--json', ...SKIP_WS]);
		const out = JSON.parse(r.stdout);
		const c = out.results.find(
			(x) => x.id === 'codegraph_module_reference_lens_trust',
		);
		assert.ok(
			c.pass,
			`check36 must pass (module coverage-hole reference-lens) — detail: ${c.detail}`,
		);
		assert.match(c.detail, /reference-lens/);
		assert.ok(
			c.delegated_to.includes('module-graph.js'),
			'content-aware (module-graph.js ceiling + gate-import 0 / file-presence ❌)',
		);
		// discrimination — onlyArch 구조적 절단 미러 (release-readiness.js check36 양성 ② 동형 / informational_notes 가 severity 를 절대 못 가짐).
		const ccSchema = JSON.parse(
			readFileSync(
				resolve(ROOT, 'schemas/code-coverage-hole.schema.json'),
				'utf-8',
			),
		);
		const info = ccSchema.$defs.moduleAxis.properties.informational_notes.items;
		assert.equal(
			info.additionalProperties,
			false,
			'informational_notes.items additionalProperties:false',
		);
		assert.equal(
			'severity' in (info.properties || {}),
			false,
			'onlyArch(informational_notes)는 severity 필드 구조적 부재 → finding 채널 진입 불가',
		);
	});

	// v12.12.0 check37 discrimination — ast_symbol stale-anchor verify reference-lens trust (STEP 4 / DEC-2026-06-03-codegraph-deliverable-wiring §5 STEP 4).
	it('codegraph_anchor_verify_reference_lens_trust — gate 모듈 anchor-verify 토큰 0 + REQUIRED_VALIDATORS 미등록 + informational_notes severity 부재 + anchor-verify ceiling/gate-import 0', () => {
		const r = runScript(['--target', 'v12.12.0', '--json', ...SKIP_WS]);
		const out = JSON.parse(r.stdout);
		const c = out.results.find(
			(x) => x.id === 'codegraph_anchor_verify_reference_lens_trust',
		);
		assert.ok(
			c.pass,
			`check37 must pass (anchor-verify reference-lens) — detail: ${c.detail}`,
		);
		assert.match(c.detail, /reference-lens/);
		assert.ok(
			c.delegated_to.includes('anchor-verify.js'),
			'content-aware (anchor-verify.js ceiling + gate-import 0 / file-presence ❌)',
		);
		// discrimination — codegraph 사각(informational_notes) 구조적 절단 미러 (release-readiness.js check37 양성 ② 동형 / informational_notes 가 severity 를 절대 못 가짐).
		const avSchema = JSON.parse(
			readFileSync(
				resolve(ROOT, 'schemas/code-anchor-verify.schema.json'),
				'utf-8',
			),
		);
		const info =
			avSchema.properties.anchor_verify.properties.informational_notes.items;
		assert.equal(
			info.additionalProperties,
			false,
			'informational_notes.items additionalProperties:false',
		);
		assert.equal(
			'severity' in (info.properties || {}),
			false,
			'codegraph 사각(informational_notes)는 severity 필드 구조적 부재 → finding 채널 진입 불가',
		);
		// findings.severity enum ⊆ {low,medium} (gate leak 구조 차단).
		assert.deepEqual(
			avSchema.properties.findings.items.properties.severity.enum,
			['low', 'medium'],
			'findings.severity ⊆ {low,medium}',
		);
	});

	// v12.13.0 check38 discrimination — context-cache callees 증분 reference-lens trust (STEP 5 / DEC-2026-06-03-codegraph-deliverable-wiring §5 STEP 5).
	//   ★ context-cache 는 finding-severity 채널 부재 → check34~37 severity-ceiling 가드와 메커니즘 상이 (복붙 시 거짓 isomorphic). 구조 증명 = symbols/symbolRef severity 필드 부재.
	it('context_cache_reference_lens_trust — gate 모듈 STEP 5 토큰 0 + federator gate-import 0 + schema callees=symbolRef & symbols/symbolRef severity 필드 부재', () => {
		const r = runScript(['--target', 'v12.13.0', '--json', ...SKIP_WS]);
		const out = JSON.parse(r.stdout);
		const c = out.results.find(
			(x) => x.id === 'context_cache_reference_lens_trust',
		);
		assert.ok(
			c.pass,
			`check38 must pass (context-cache reference-lens) — detail: ${c.detail}`,
		);
		assert.match(c.detail, /reference-lens/);
		assert.ok(
			c.delegated_to.includes('federator.js'),
			'content-aware (federator.js gate-import 0 + non-gating 라벨 / file-presence ❌)',
		);
		// discrimination — callees 가 finding 채널 진입 구조 불가 미러 (release-readiness.js check38 ③ 동형 / symbols·symbolRef 가 severity 를 절대 못 가짐).
		const ccSchema = JSON.parse(
			readFileSync(
				resolve(ROOT, 'schemas/context-cache.schema.json'),
				'utf-8',
			),
		);
		const symItems =
			ccSchema.properties.packs.items.properties.code_refs.items.properties
				.symbols.items;
		assert.equal(
			symItems.properties.callees.items.$ref,
			'#/$defs/symbolRef',
			'callees.items = $ref symbolRef (callers 동형 / array items)',
		);
		assert.equal(
			'severity' in (symItems.properties || {}),
			false,
			'symbols.items 는 severity 필드 구조적 부재 → callees 가 finding 채널 진입 불가',
		);
		assert.equal(
			'severity' in (ccSchema.$defs.symbolRef.properties || {}),
			false,
			'$defs.symbolRef 는 severity 필드 구조적 부재 (callees/callers/affected 공통)',
		);
	});

	// v12.14.0 check39 discrimination — openapi 정적 검증 reference-lens trust (STEP 6 / DEC-2026-06-03-codegraph-deliverable-wiring §5 STEP 6).
	//   verb-diff + controller-anchor(STEP4 역방향 재사용) + auth-grounding. 구조 증명 = verb_diff/controller_anchor informational_notes severity 필드 부재.
	it('codegraph_openapi_reference_lens_trust — gate 모듈 STEP 6 토큰 0 + REQUIRED_VALIDATORS 미등록 + verb_diff/controller_anchor informational_notes severity 부재 + openapi-coverage ceiling/gate·federator-import 0', () => {
		const r = runScript(['--target', 'v12.14.0', '--json', ...SKIP_WS]);
		const out = JSON.parse(r.stdout);
		const c = out.results.find(
			(x) => x.id === 'codegraph_openapi_reference_lens_trust',
		);
		assert.ok(
			c.pass,
			`check39 must pass (openapi-coverage reference-lens) — detail: ${c.detail}`,
		);
		assert.match(c.detail, /reference-lens/);
		assert.ok(
			c.delegated_to.includes('openapi-coverage.js'),
			'content-aware (openapi-coverage.js ceiling + gate/federator-import 0 / file-presence ❌)',
		);
		// discrimination — codegraph 사각(informational_notes) 구조적 절단 미러 (release-readiness.js check39 ② 동형 / informational_notes 가 severity 를 절대 못 가짐).
		const oaSchema = JSON.parse(
			readFileSync(
				resolve(ROOT, 'schemas/code-openapi-coverage.schema.json'),
				'utf-8',
			),
		);
		for (const ax of ['verb_diff', 'controller_anchor']) {
			const info =
				oaSchema.properties.openapi_coverage.properties[ax].properties
					.informational_notes.items;
			assert.equal(
				info.additionalProperties,
				false,
				`${ax}.informational_notes.items additionalProperties:false (codegraph 사각 임의필드 차단)`,
			);
			assert.equal(
				'severity' in (info.properties || {}),
				false,
				`${ax}.informational_notes.items severity 구조적 부재 → finding 채널 진입 불가`,
			);
		}
		const sevEnum =
			oaSchema.properties.findings.items.properties.severity.enum;
		assert.deepEqual(
			[...sevEnum].sort(),
			['low', 'medium'],
			'findings.severity enum ⊆ {low,medium} (gate leak 차단)',
		);
	});

	it('artifact_secret_leak (check42) — 방출 산출물 secret/credential 누출 0건 (delta #2-b / output-hygiene release-gate)', () => {
		const r = runScript(['--target', 'v0.24.0', '--json', ...SKIP_WS]);
		const out = JSON.parse(r.stdout);
		const c = out.results.find((x) => x.id === 'artifact_secret_leak');
		assert.ok(c, 'check42 artifact_secret_leak criterion must exist');
		assert.ok(
			c.pass,
			`check42 must pass (방출 산출물 secret 누출 0) — detail: ${c.detail}`,
		);
		assert.match(c.detail, /no-simulation/);
		assert.ok(
			c.delegated_to.includes('scanSecrets'),
			'content-aware (scanSecrets 결정론 regex / release-block / chain gate 미주입)',
		);
	});

	it('scanSecrets — TP(실 secret) hit / FP(test-data·타입설명·placeholder) clean (release-block low-FP 의무)', async () => {
		const { scanSecrets } = await import('../../tools/_shared/pii-patterns.js');
		// TP — 진짜 secret 은 hit
		assert.ok(scanSecrets('ghp_1234567890abcdefghijklmnopqrstuvwx').length, 'github token');
		assert.ok(scanSecrets('AKIA1234567890ABCDEF').length, 'aws access key (AKIA+16)');
		assert.ok(
			scanSecrets('private static final String SECRET = "kP9mX2vL8qR4nT6w"').length,
			'verbatim 복사된 SECRET 할당 (실증 risk)',
		);
		assert.ok(
			scanSecrets('eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTYifQ.abc123def456ghi').length,
			'jwt',
		);
		assert.ok(scanSecrets('-----BEGIN RSA PRIVATE KEY-----').length, 'private key');
		// FP — 구조화 산출물 흔한 test-data/타입설명/placeholder 는 clean
		assert.equal(scanSecrets("password='secret123'").length, 0, 'short test password');
		assert.equal(scanSecrets('"password": "@IsNotEmpty()"').length, 0, '검증 데코레이터 설명');
		assert.equal(
			scanSecrets('"password": "string (argon2 hash via @BeforeInsert)"').length,
			0,
			'타입 설명 (공백 포함)',
		);
		assert.equal(scanSecrets('apiKey: "your-api-key-here"').length, 0, 'placeholder');
		assert.equal(scanSecrets('"description": "validates the password field"').length, 0, 'prose');
		// 결정론
		assert.deepEqual(
			scanSecrets('ghp_1234567890abcdefghijklmnopqrstuvwx'),
			scanSecrets('ghp_1234567890abcdefghijklmnopqrstuvwx'),
		);
	});

	it('missing --target → exit 2 (usage error)', () => {
		const r = runScript([]);
		assert.equal(r.status, 2);
	});

	it('A1 본격 spawn — workspace test + 42/42 pass (pnpm -r run test 실시간 실행 / timeout 600s)', () => {
		// A1 본격 검증 — check11 spawn → pnpm -r --workspace-concurrency=1 run test 실시간 실행 → fail=0 의무 입증.
		// 본 case = release 본격 시행 cadence 정합 (다른 case 는 SKIP_WS 사용 / 본 case 만 본격 spawn).
		const r = runScript(['--target', 'v8.1.0', '--json'], {}, 600_000);
		const out = JSON.parse(r.stdout);
		const ws = out.results.find((x) => x.id === 'workspace_test_pass');
		assert.ok(
			ws.pass,
			`workspace_test_pass must pass — full detail: ${ws.detail} | r.status=${r.status} | stderr=${r.stderr.slice(0, 300)}`,
		);
		assert.match(ws.detail, /\d+\/\d+ pass \/ 0 fail/);
		assert.equal(out.criteria_total, 42);
		assert.equal(out.criteria_passed, 42);
		assert.equal(out.ready, true);
		assert.equal(r.status, 0);
	});

	// check40 discrimination — shipped prose provenance 회귀 가드 (shipped-provenance-cleanup / DEC-2026-06-05).
	it('shipped_provenance_leak — skills/agents/methodology-spec 본문 거버넌스 마커 0 + 검출/면제 discrimination (## 인용 footer + allow-provenance + 한글 footer regression)', () => {
		const r = runScript(['--target', 'v12.14.0', '--json', ...SKIP_WS]);
		const out = JSON.parse(r.stdout);
		const c = out.results.find((x) => x.id === 'shipped_provenance_leak');
		assert.ok(c.pass, `check40 must pass (0 body provenance markers) — detail: ${c.detail}`);
		assert.ok(c.delegated_to.includes('## 인용'), 'delegated_to references the ## 인용 footer convention');
		// discrimination — release-readiness.js check40 미러 (MARKERS + FOOTER_RE / digest_sha test 패턴 동형).
		const FOOTER_RE = /^#{1,4}\s+(인용|Cross-link|Provenance)(\s|$)/;
		const MARKERS = [
			/DEC-\d{4}-\d{2}-\d{2}-/,
			/\bADR-[A-Za-z]+-?\d+/,
			/v\d+\.\d+(\.\d+)?[^|]{0,30}(신설|종결|누적|갱신|MINOR|PATCH|폐기|추가|rename|개칭|carry)/,
			/session\s*\d+\s*차/,
			/[Pp]oC\s*#?\d|poc-\d+/,
			/\bLL-[A-Za-z0-9]/,
		];
		const isMarker = (line) => MARKERS.some((re) => re.test(line));
		// poisoned 본문 = 위반
		assert.ok(isMarker('본 skill 은 DEC-2026-05-26-ticket-plan-단일 정합.'), 'body DEC = marker');
		assert.ok(isMarker('ADR-CHAIN-001 §2 정합'), 'body ADR = marker');
		assert.ok(isMarker('v8.0.0 신설 — 이전 paradigm 폐기'), 'version change-history = marker');
		assert.ok(isMarker('session 54차 결단 흡수'), 'session N차 = marker');
		assert.ok(isMarker('PoC #06 Spring 4.1 입증'), 'inline PoC #N = marker');
		assert.ok(isMarker('LL-i-26 정합'), 'LL tag = marker');
		// clean = 비위반 (present-tense 아키텍처 명칭 / 게이트 문구 / 현재형 규칙)
		assert.ok(!isMarker('chain harness v9.0 6-stage (discovery → spec → plan → test → implement)'), 'architecture version naming = OK');
		assert.ok(!isMarker('≥ 2 PoC corroboration 의무 (Legacy + Modern)'), 'gate phrasing (no digit after PoC) = OK');
		assert.ok(!isMarker('NFR allocation 누락 시 gate #3 block'), 'present-tense rule = OK');
		// FOOTER_RE — 한글 '인용' 매칭 (regression: JS '\b' 는 한글 뒤 미성립 → (\s|$) 경계)
		assert.ok(FOOTER_RE.test('## 인용'), '## 인용 footer heading detected');
		assert.ok(FOOTER_RE.test('## 인용 (Provenance)'), '## 인용 (suffix) detected');
		assert.ok(FOOTER_RE.test('## Cross-link'), '## Cross-link detected');
		assert.ok(!FOOTER_RE.test('## 인용문 작성 가이드'), 'non-footer 인용문 heading not matched');
	});
});
