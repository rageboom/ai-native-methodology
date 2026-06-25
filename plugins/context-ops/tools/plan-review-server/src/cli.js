#!/usr/bin/env node
// cli.js — plan-review-server 진입점. chain 산출물(discovery-spec/behavior-spec/
//   acceptance-criteria/task-plan) 검토용 로컬 HTTP 서버 spawn. ephemeral: gate 진입 시
//   띄우고, 검토(apply)/종료 후 Ctrl+C.
//   usage: plan-review-server --input <path> [--artifact <type>] [--summaries <path>]
//                             [--project <dir>] [--findings <path>] [--port 0] [--no-open]

import { resolve, dirname, join, basename } from 'node:path';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import { createServer } from './server.js';
import { knownArtifact, ARTIFACTS, VALIDATORS, PHASES, knownPhase } from './artifact-registry.js';

// 플랫폼별 브라우저 자동 오픈 (best-effort / 실패 무시).
export function openBrowserCommand(platform) {
	if (platform === 'darwin') return { cmd: 'open', args: [] };
	if (platform === 'win32') return { cmd: 'cmd', args: ['/c', 'start', ''] };
	return { cmd: 'xdg-open', args: [] };
}
function openBrowser(url) {
	try {
		const { cmd, args } = openBrowserCommand(process.platform);
		const child = spawn(cmd, [...args, url], { stdio: 'ignore', detached: true });
		child.on('error', () => {});
		child.unref();
	} catch {
		/* 자동 오픈 실패 = URL 수동 클릭으로 fallback */
	}
}

// 파일명에서 artifact-type 추론 (discovery-spec.json → discovery-spec).
export function inferArtifactType(path) {
	const base = basename(path).replace(/\.json$/i, '');
	return knownArtifact(base) ? base : null;
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const TOOLS = resolve(__dirname, '..', '..'); // plugins/context-ops/tools
const REPO = resolve(TOOLS, '..'); // plugins/context-ops

function parseArgs(argv) {
	const a = { port: 0 };
	for (let i = 2; i < argv.length; i++) {
		const k = argv[i];
		if (k === '--input' || k === '--task-plan') a.input = argv[++i];
		else if (k === '--phase') a.phase = argv[++i];
		else if (k === '--artifact') a.artifact = argv[++i];
		else if (k === '--summaries') a.summaries = argv[++i];
		else if (k === '--agent-reply') a.agentReply = argv[++i];
		else if (k === '--acceptance') a.acceptance = argv[++i];
		else if (k === '--project') a.project = argv[++i];
		else if (k === '--findings') a.findings = argv[++i];
		else if (k === '--schema') a.schema = argv[++i];
		else if (k === '--port') a.port = Number(argv[++i]);
		else if (k === '--threshold') a.threshold = Number(argv[++i]);
		else if (k === '--no-open') a.noOpen = true;
		else if (k === '-h' || k === '--help') a.help = true;
	}
	return a;
}

const HELP = `plan-review-server — chain 산출물(discovery/spec/plan) 검토 HTML 편집기
usage (단일):  plan-review-server --input <path> [--artifact <type>] [--summaries <path>] [...]
usage (phase): plan-review-server --phase <discovery|spec|plan> --project <dir> [...]

  --phase       discovery|spec|plan — 한 페이즈의 산출물을 한 페이지(탭)로. spec = behavior+unit+ac 3종.
                --project 의 .ai-context/output/ 에서 산출물 자동 수집. (--summaries 는 산출물별 nesting)
  --input       (단일) 산출물 json 경로 (--task-plan 별칭). 예: .ai-context/output/discovery-spec.json
  --artifact    discovery-spec|behavior-spec|unit-spec|acceptance-criteria|task-plan (미지정 시 파일명 추론)
  --summaries   AI 평이 요약 json (원문 ≠ / 표시 전용). 단일 = { "<cardBase>": { summary } } /
                phase = { "<artifact-type>": { "<cardBase>": { summary } } } (산출물별 nesting)
  --agent-reply 재설계 후 "뭘 바꿨다" 배너 텍스트 (닫힌 루프 / 표시 전용)
  --acceptance  (task-plan 만) 미지정 시 같은 디렉토리 acceptance-criteria.json
  --project     chain-driver state 루트 (gate 평결 위임 / 미지정 시 평결 생략)
  --findings    validator findings json (gate 평결 입력)
  --port        0 = 랜덤 빈 포트 (기본)
  --no-open     브라우저 자동 오픈 안 함 (기본 = 자동 오픈)

서버는 판정을 만들지 않는다 — 평결=chain-driver / 재검증=plan-coverage-validator(plan 만) /
산출물 write=사람 입력(프롬프트)만. (reference-lens / 결정론 axis 무오염)`;

function fail(msg) {
	console.error(msg);
	process.exit(2);
}

// phase 모드 — 한 페이즈 산출물을 한 페이지로. <project>/.ai-context/output/<artifact>.json 수집.
function runPhase(args) {
	const phase = args.phase;
	if (!knownPhase(phase)) fail(`✗ phase 미상: '${phase}' (discovery|spec|plan)`);
	if (!args.project) fail('✗ --phase 는 --project <dir> 필요 (.ai-context/output/ 수집)');
	const root = resolve(args.project);
	const outDir = join(root, '.ai-context', 'output');
	// phase summaries 는 산출물별 nesting — 한 페이지에 여러 산출물이라 type 으로 1차 분기.
	//   { "<artifact-type>": { "<cardBase>": { summary } } } (단일 --input 모드는 flat).
	let phaseSummaries = null;
	if (args.summaries) {
		const sp = resolve(args.summaries);
		if (!existsSync(sp)) fail(`✗ summaries 부재: ${sp}`);
		try {
			phaseSummaries = JSON.parse(readFileSync(sp, 'utf-8'));
		} catch (e) {
			fail(`✗ summaries 파싱 실패: ${e.message}`);
		}
	}
	const documents = [];
	for (const at of PHASES[phase].artifacts) {
		const p = join(outDir, `${at}.json`);
		if (!existsSync(p)) {
			console.error(`  · ${at}.json 없음 — 건너뜀 (${p})`);
			continue;
		}
		const schemaPath = join(REPO, 'schemas', `${at}.schema.json`);
		documents.push({
			artifactType: at,
			path: p,
			schema: JSON.parse(readFileSync(schemaPath, 'utf-8')),
			label: ARTIFACTS[at].label,
			summaries: (phaseSummaries && phaseSummaries[at]) || null,
		});
	}
	if (!documents.length) fail(`✗ ${phase} 페이즈 산출물이 ${outDir} 에 없음`);

	const server = createServer({
		documents,
		phase,
		phaseLabel: PHASES[phase].label,
		projectRoot: root,
		chainDriverCli: join(TOOLS, 'chain-driver', 'src', 'cli.js'),
		findingsPath: args.findings ? resolve(args.findings) : null,
		agentReply: args.agentReply || null,
		onApply: (result) => {
			process.stdout.write('PLAN_REVIEW_APPLY ' + JSON.stringify({ phase, branch: result.branch, written: result.written, groups: result.groups }) + '\n');
		},
	});
	server.listen(args.port, '127.0.0.1', () => {
		const { port } = server.address();
		const url = `http://127.0.0.1:${port}/`;
		// gate-review-passage 마커 — 검토 서버가 실제로 떴다는 증거. chain-driver next 가 actor
		// provenance(user vs llm_assumed) 도출에 read. advisory only (Phase 1 / DEC-2026-06-25-gate-review-bypass-guard).
		// phase(discovery|spec|plan) == stage 명. SSOT: _shared/ai-context-layout.js gateReviewPassagePath(root).
		try {
			const runtimeDir = join(root, '.ai-context', 'runtime');
			mkdirSync(runtimeDir, { recursive: true });
			writeFileSync(
				join(runtimeDir, 'gate-review-passage.json'),
				JSON.stringify(
					{ stage: phase, presented_at: new Date().toISOString(), via: 'plan_review_server', pid: process.pid },
					null,
					2,
				) + '\n',
				'utf-8',
			);
		} catch {
			/* 마커 기록 실패는 비치명 (advisory) */
		}
		console.error(`\n  📋 ${PHASES[phase].label} 검토 (${documents.map((d) => d.artifactType).join(' / ')}) — 브라우저에서 열기:`);
		console.error(`  \x1b[1;4;36m${url}\x1b[0m\n`);
		console.error(`  (project: ${root})`);
		console.error(`  검토·apply 후 Ctrl+C 로 종료.`);
		if (!args.noOpen) openBrowser(url);
	});
}

function main() {
	const args = parseArgs(process.argv);
	if (args.help) {
		console.log(HELP);
		process.exit(0);
	}
	if (args.phase) return runPhase(args);
	if (!args.input) fail(HELP);

	const inputPath = resolve(args.input);
	if (!existsSync(inputPath)) fail(`✗ 입력 산출물 부재: ${inputPath}`);

	const artifactType = args.artifact || inferArtifactType(inputPath);
	if (!artifactType || !knownArtifact(artifactType)) {
		fail(
			`✗ artifact-type 미상: '${artifactType ?? ''}'. --artifact 로 지정 ` +
				`(discovery-spec|behavior-spec|acceptance-criteria|task-plan).`,
		);
	}

	const schemaPath = args.schema
		? resolve(args.schema)
		: join(REPO, 'schemas', `${artifactType}.schema.json`);
	if (!existsSync(schemaPath)) fail(`✗ 스키마 부재: ${schemaPath}`);
	const schema = JSON.parse(readFileSync(schemaPath, 'utf-8'));

	// validator/acceptance 는 task-plan 만 (plan-coverage). 나머지는 프롬프트만 → 항상 replan.
	const isPlan = VALIDATORS[artifactType] === 'plan-coverage';
	let acceptancePath = null;
	let validatorCli = null;
	if (isPlan) {
		acceptancePath = args.acceptance
			? resolve(args.acceptance)
			: join(dirname(inputPath), 'acceptance-criteria.json');
		if (!existsSync(acceptancePath)) {
			fail(`✗ acceptance-criteria.json 부재: ${acceptancePath} (--acceptance 로 지정 가능)`);
		}
		validatorCli = join(TOOLS, 'plan-coverage-validator', 'src', 'cli.js');
	}

	let summaries = null;
	if (args.summaries) {
		const sp = resolve(args.summaries);
		if (!existsSync(sp)) fail(`✗ summaries 부재: ${sp}`);
		try {
			summaries = JSON.parse(readFileSync(sp, 'utf-8'));
		} catch (e) {
			fail(`✗ summaries 파싱 실패: ${e.message}`);
		}
	}

	const label = ARTIFACTS[artifactType].label;

	const server = createServer({
		taskPlanPath: inputPath,
		acceptancePath,
		schema,
		artifactType,
		summaries,
		agentReply: args.agentReply || null,
		projectRoot: args.project ? resolve(args.project) : null,
		chainDriverCli: join(TOOLS, 'chain-driver', 'src', 'cli.js'),
		validatorCli,
		findingsPath: args.findings ? resolve(args.findings) : null,
		threshold: args.threshold || 0.85,
		// poll 핸드오프 — apply 시 machine-readable 마커를 stdout 한 줄로. 에이전트가
		//   Monitor 로 watch 해 즉시 해당 stage agent 재dispatch (수동 "파일 읽어" 단계 제거).
		onApply: (result, parsed) => {
			const payload = {
				artifact_type: artifactType,
				branch: result.branch,
				written: result.written,
				comments: (parsed.comments || []).map((c) => ({
					anchor: c.anchor ?? null,
					label: c.label ?? null,
					text: c.text,
					selected_text: c.selected_text ?? null,
				})),
			};
			process.stdout.write('PLAN_REVIEW_APPLY ' + JSON.stringify(payload) + '\n');
		},
	});

	server.listen(args.port, '127.0.0.1', () => {
		const { port } = server.address();
		const url = `http://127.0.0.1:${port}/`;
		console.error('');
		console.error(`  📋 ${label} 검토 — 브라우저에서 열기:`);
		console.error(`  \x1b[1;4;36m${url}\x1b[0m`); // bold underline cyan = 클릭 가능 링크
		console.error('');
		console.error(`  (입력: ${inputPath})`);
		console.error(`  검토·apply 후 Ctrl+C 로 종료.`);
		if (!args.noOpen) openBrowser(url);
	});
}

// 직접 실행 시에만 서버 기동 (import 시 side-effect 차단 / 테스트 안전).
if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
	main();
}
