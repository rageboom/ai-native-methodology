#!/usr/bin/env node
// chain-driver — chain harness driver CLI (sub-plan-5).
//
// commands:
//   chain-driver init <project>            — .aimd/state.json 초기화
//   chain-driver state <project> [--json]  — 현재 state read
//   chain-driver next <project> [--findings <path>] [--user-decision go|stop|revisit:<stage>] [--dry-run]
//                                          — gate 평가 + (옵션) stage 전이
//   chain-driver suggest-skill --prompt <text>
//                                          — UserPromptSubmit 권고 (stderr only)
//   chain-driver hooks-bridge              — stdin JSON → stdout hook output (suppressOutput)
//   chain-driver migrate <project>         — state schema migration
//   chain-driver revisit-detect <project> [--base <sha>] [--user-decision go|ignore]
//                                          — git diff → revisit 추론 + intervention log
//
// exit codes (ADR-CHAIN-005 §7):
//   0 = ok
//   1 = blocked-by-gate
//   2 = invariant-violation (mechanical trio (ii))
//   3 = usage-error
//   4 = state-corrupt

import { existsSync, readFileSync, appendFileSync, mkdirSync } from 'node:fs';
import { basename, dirname, join, resolve, isAbsolute } from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import {
	initState,
	readState,
	writeStateCAS,
	recoverTmpFiles,
	ensureAimdDir,
	StateCorruptError,
	MigrationRequiredError,
	CURRENT_STATE_VERSION,
	migrate,
	statePath,
	ensureScopeDir,
	readManifest,
	writeManifest,
	listScopes,
} from './state-store.js';
import { executeQuery } from './query.js';
import { markDrift, cascade } from './sync.js';

const MANIFEST_STAGES = ['discovery', 'spec', 'plan', 'test', 'impl'];
function stageToManifestStage(stage) {
	return stage === 'implement' ? 'impl' : stage;
}
import {
	loadFlow,
	nextStage,
	validateStateAgainstFlow,
	getGateForStage,
} from './stage-graph.js';
import {
	evaluateGate,
	applyUserDecision,
	requiredValidators,
} from './gate-eval.js';
import { loadSkill, formatSkillSuggestion } from './invoke-skill.js';
import {
	parseHookInput,
	buildSuggestOutput,
	buildBlockOutput,
	suggestSkillForPrompt,
	suggestAgentForPrompt,
	shouldBlockToolUse,
	detectGraphArtifactWrite,
	evaluatePolicyForEdges,
} from './hooks-bridge.js';
import { gitDiffNumstat, detectRevisit } from './revisit-detect.js';
import { analyzeImpact, EDGE_TYPE_CATALOG } from './impact-analyzer.js';
import {
	loadPolicy,
	evaluatePolicy,
	appendProposeRecord,
} from './policy-evaluator.js';
import { topologicalOrder, cascadeOrder } from './propagation-orderer.js';
import { topKImpactRoot } from './centrality.js';
// living-sync 전파 루프 (Phase 1 MVP / DEC-2026-06-07-living-sync-operating-model) — 순수 코어.
import {
	computeSyncLoop,
	markTransientDrift,
	selectNextStage,
	markStageDone,
	queueStatus,
} from './sync-loop.js';
// Loop A / A1 (B-minimal) — graph freshness 를 SessionStart 배너에 노출 (DEC-2026-06-03 C-living-graph-autotrigger).
//   _shared 프리미티브 (fs-only / child_process 무관 = hot-path 경량 / code-pointer-validator 와 DRY 공유).
import { checkGraphFreshness } from '../../_shared/graph-freshness.js';
// 의도③ (a) NL 라우팅 (navigate --prompt) — prompt → 노드 결정론 매칭 (_shared / federator 와 DRY 공유).
import {
	matchPromptToNodes,
	isConfidentTop,
} from '../../_shared/prompt-node-match.js';
// trace-view (옵션 A+B / DEC-2026-06-03-dep-graph-trace-view) — 사람 gate-검토용 view-time 렌더러 (순수 formatter / stdout only).
import { buildTraceView, renderTraceViewMarkdown } from './trace-view.js';

function usage(code = 3) {
	console.error(
		[
			'usage: chain-driver <command> [options]',
			'',
			'commands:',
			'  init <project> [--scope <slug>] [--scenario <S1|S2|S3|greenfield>]',
			'  state <project> [--json]',
			'  next <project> [--findings <path>] [--user-decision <go|stop|revisit:STAGE>] [--dry-run]',
			'  query <project> [--scope <slug>] [--stage <s>] [--ref <id>] [--stale]',
			'  query --graph <artifact-graph.json> [--ref <node-id>]   (graph JSON 출력 / 툴링용)',
			'  sync <project> [--scope <slug>]',
			'  impact --graph <artifact-graph.json> --origin <node-id> [--change-kind <kind>] [--policy <path>] [--out-jsonl <path>] [--code-pointer-only] [--json]',
			'  navigate --graph <artifact-graph.json> --origin <node-id> [--with-spec] [--json]   (dep-graph-navigator backend)',
			'  navigate --graph <artifact-graph.json> --prompt "<자연어>" [--with-spec] [--json]   (의도③ NL 라우팅 — id/title 결정론 해소)',
			'  navigate --graph <artifact-graph.json> --origin <id> --what-if "remove-node:ID|add-edge:SRC>TGT[:type]" [--json]   (의도③ 가설 변경 영향 / 비파괴)',
			'  navigate --graph <artifact-graph.json> --stage <discovery|spec|plan|test|implement> [--scope <id>] [--json]   (F3 stage/scope 일괄 의존성 rollup)',
			'  trace-view --graph <artifact-graph.json> [--scope <id>] [--no-matrix] [--json]   (사람 gate-검토용 추적성 맵 + coverage 매트릭스 / stdout)',
			'  resync-graph [<project>] [--scope <slug>] [--out-dir <dir>] [--repo-root <dir>] [--dry-run]   (Loop A lazy 재합성 — STALE 배너 nudge → 1 명령)',
		'  sync-loop <project> --graph <artifact-graph.json> (--origin <id>... | --changed <path>...) [--mark] [--force] [--dry-run] [--json]   (living-sync Phase 1 — forward 영향 closure → regen_queue worklist)',
			'  sync-next <project> [--findings <path>] [--user-decision <go|stop>] [--dry-run] [--json]   (living-sync Phase 1c — regen_queue 를 stage 단위로 소비 / findings 없으면 재생성 지시 surface)',
			'  suggest-skill --prompt <text>',
			'  hooks-bridge          (reads stdin JSON, writes stdout JSON)',
			'  migrate <project>',
			'  revisit-detect <project> [--base <sha>] [--user-decision <go|ignore>]',
			'',
			'exit codes: 0=ok, 1=blocked, 2=invariant-violation, 3=usage, 4=state-corrupt',
		].join('\n'),
	);
	process.exit(code);
}

function parseArgs(argv) {
	const out = { json: false, dryRun: false };
	out.command = argv[2];
	const rest = argv.slice(3);
	// first positional = project (for most commands)
	if (rest.length && !rest[0].startsWith('--')) {
		out.project = rest.shift();
	}
	for (let i = 0; i < rest.length; i++) {
		const a = rest[i];
		if (a === '--json') out.json = true;
		else if (a === '--dry-run') out.dryRun = true;
		else if (a === '--prompt') out.prompt = rest[++i];
		else if (a === '--findings') out.findingsPath = rest[++i];
		else if (a === '--user-decision') out.userDecision = rest[++i];
		else if (a === '--base') out.baseSha = rest[++i];
		else if (a === '--repo-root') out.repoRoot = rest[++i];
		else if (a === '--scope') out.scope = rest[++i];
		else if (a === '--out-dir') out.outDir = rest[++i];
		else if (a === '--scenario') out.scenario = rest[++i];
		else if (a === '--stage') out.stage = rest[++i];
		else if (a === '--direction') out.direction = rest[++i];
		else if (a === '--ref') out.ref = rest[++i];
		else if (a === '--stale') out.stale = true;
		// dep-graph P3 impact 명령
		else if (a === '--graph') out.graphPath = rest[++i];
		else if (a === '--origin') {
			out.origin = rest[++i]; // scalar (impact/navigate back-compat)
			(out.origins ||= []).push(out.origin); // sync-loop multi-origin 누적
		} else if (a === '--changed') (out.changedPaths ||= []).push(rest[++i]);
		else if (a === '--mark') out.mark = true;
		else if (a === '--no-mark') out.mark = false;
		else if (a === '--force') out.force = true;
		else if (a === '--change-kind') out.changeKind = rest[++i];
		else if (a === '--policy') out.policyPath = rest[++i];
		else if (a === '--out-jsonl') out.outJsonl = rest[++i];
		else if (a === '--code-pointer-only') out.codePointerOnly = true;
		else if (a === '--with-spec') out.withSpec = true;
		else if (a === '--what-if') out.whatIf = rest[++i];
		else if (a === '--no-matrix')
			out.noMatrix = true; // trace-view: coverage 매트릭스 억제 (기본 ON).
		else if (a === '--help' || a === '-h') usage(0);
		else if (a.startsWith('--')) usage(3);
	}
	return out;
}

function logIntervention(state, projectRoot, entry) {
	const path = join(
		projectRoot,
		state?.intervention_log_path || '.aimd/output/intervention-log.jsonl',
	);
	mkdirSync(dirname(path), { recursive: true });
	const line =
		JSON.stringify({ timestamp: new Date().toISOString(), ...entry }) + '\n';
	appendFileSync(path, line, 'utf-8');
}

function blockedExit(state, projectRoot) {
	// mechanical gate trio (ii) — non-interactive exit 2 + same message.
	const reason = state.block_reason || 'unknown';
	console.error(
		`[chain-driver] BLOCKED — block_reason=${reason}. ` +
			`Resolve via /aimd-next or /aimd-stage <name>. (mechanical trio (ii))`,
	);
	logIntervention(state, projectRoot, {
		event_type: 'trio_block',
		actor: 'driver',
		decision: '(ii)',
		exit_code: 2,
		message: `blocked exit on subsequent invocation. reason=${reason}`,
	});
	process.exit(2);
}

function cmdInit(args) {
	if (!args.project) usage(3);
	const root = resolve(args.project);
	const projectId = basename(root);
	recoverTmpFiles(root);
	try {
		let state;
		if (existsSync(statePath(root))) {
			if (!args.scope) {
				console.error(
					`[chain-driver] state.json already exists. Use --scope <slug> to add a scope.`,
				);
				process.exit(3);
			}
			state = readState(root);
		} else {
			state = initState(root, projectId);
		}
		if (args.scope) {
			ensureScopeDir(root, args.scope, args.scenario); // v11.9.0 use-scenario taxonomy seed
			state = writeStateCAS(root, (s) => {
				s.current_scope = args.scope;
				return s;
			});
		}
		process.stdout.write(JSON.stringify(state, null, 2) + '\n');
		process.exit(0);
	} catch (e) {
		console.error(`[chain-driver] init failed: ${e.message}`);
		process.exit(3);
	}
}

// regen_queue 표시 — done-aware (Phase 1c). 완료 큐를 "pending" 으로 잘못 표기하던 것 교정.
function regenQueueSummary(q) {
	if (!q || !(q.items?.length)) return '-';
	const st = queueStatus(q);
	if (q.blocked) return `BLOCKED @${q.blocked.stage} (${st.done}/${st.total} done)`;
	if (st.complete) return `complete (${st.done}/${st.total} done)`;
	return `${st.pending}/${st.total} pending`;
}

// D7 clobber 가드 — sync-loop 재실행이 in-flight done 을 덮어쓰는 것 방지.
//   in-progress = blocked 표기 있거나, 일부 done 인데 아직 미완료 (완전 미시작/완료 큐는 교체 OK).
function isQueueInProgress(q) {
	if (!q || !(q.items?.length)) return false;
	if (q.blocked) return true;
	const st = queueStatus(q);
	return st.done > 0 && !st.complete;
}

function cmdState(args) {
	if (!args.project) usage(3);
	const root = resolve(args.project);
	recoverTmpFiles(root);
	const state = readState(root);
	if (!state) {
		console.error('[chain-driver] no state.json — run init first');
		process.exit(3);
	}
	if (args.json) {
		process.stdout.write(JSON.stringify(state, null, 2) + '\n');
	} else {
		const lines = [
			`project_id     : ${state.project_id}`,
			`current_chain  : ${state.current_chain}`,
			`current_phase  : ${state.current_phase}`,
			`blocked        : ${state.blocked} (${state.block_reason || '-'})`,
			`last_gate      : ${state.last_gate ? `${state.last_gate.id} ${state.last_gate.decision}` : '-'}`,
			`pending_revisit: ${state.pending_revisit ? state.pending_revisit.target_stage : '-'}`,
			`regen_queue    : ${regenQueueSummary(state.regen_queue)}`,
		];
		process.stdout.write(lines.join('\n') + '\n');
	}
	process.exit(0);
}

function loadFindings(path) {
	// F-AUDIT-SOFTGATE-001 (=C-13 해소) — --findings 미제출 = 검증 증거 부재 → sentinel 표시 (fail-closed).
	//   기존엔 all-zeros 반환으로 gate 무음 통과(soft). __findings_absent 로 evaluateGate 가 findings_unverified block.
	//   (zero counts 도 유지 — cmdNext validator_findings 기록부가 critical||0 등으로 안전 참조.)
	if (!path)
		return {
			__findings_absent: true,
			critical: 0,
			high: 0,
			medium: 0,
			low: 0,
			info: 0,
		};
	if (!existsSync(path)) {
		console.error(`[chain-driver] findings file not found: ${path}`);
		process.exit(3);
	}
	return JSON.parse(readFileSync(path, 'utf-8'));
}

function cmdNext(args) {
	if (!args.project) usage(3);
	const root = resolve(args.project);
	recoverTmpFiles(root);
	let state;
	try {
		state = readState(root);
	} catch (e) {
		if (e instanceof StateCorruptError) {
			console.error(`[chain-driver] ${e.message}`);
			process.exit(4);
		}
		throw e;
	}
	if (!state) {
		console.error('[chain-driver] no state.json — run init first');
		process.exit(3);
	}
	if (state.blocked) blockedExit(state, root);

	// DEC-2026-06-06-analysis-exit-gate — analysis 자체 gate(#0) 평가. 구: analysis→'discovery' 매핑이
	//   gate 를 discovery(#1)로 평가 + nextStage('discovery')='spec' 로 discovery 를 스킵하던 latent 버그 → analysis→discovery 정상 전이로 교정.
	const stage = state.current_chain;
	const findings = loadFindings(args.findingsPath);
	// v11.9.0 — use-scenario taxonomy: scope manifest.scenario → gate matrix (미지정 → 'S1' default / backward-compat).
	let scenario;
	try {
		scenario = state.current_scope
			? readManifest(root, state.current_scope)?.scenario
			: undefined;
	} catch {
		scenario = undefined;
	}
	const gateResult = evaluateGate(stage, findings, scenario);
	const finalDecision = applyUserDecision(gateResult, args.userDecision);

	if (args.dryRun) {
		process.stdout.write(
			JSON.stringify({ stage, gate: finalDecision, dry_run: true }, null, 2) +
				'\n',
		);
		process.exit(finalDecision.blocked ? 1 : 0);
	}

	if (finalDecision.blocked) {
		writeStateCAS(root, (s) => {
			s.blocked = true;
			s.block_reason = finalDecision.primary_reason || 'validator_high';
			return s;
		});
		logIntervention(state, root, {
			event_type: 'gate_decision',
			actor: 'driver',
			stage,
			decision: 'block',
			exit_code: 1,
			message: finalDecision.reasons.map((r) => r.detail).join('; '),
		});
		console.error(
			`[chain-driver] gate blocked: ${finalDecision.primary_reason}`,
		);
		process.exit(1);
	}

	// unblocked — advance
	const next = nextStage(stage);
	const nowIso = new Date().toISOString();
	writeStateCAS(root, (s) => {
		const decision =
			finalDecision.decision === 'go-with-warnings'
				? 'go'
				: finalDecision.decision || 'go';
		s.last_gate = {
			id: getGateForStage(stage),
			stage,
			decision,
			decision_at: nowIso,
			validator_findings: {
				critical: findings.critical || 0,
				high: findings.high || 0,
				medium: findings.medium || 0,
				low: findings.low || 0,
				info: findings.info || 0,
			},
			intervention_log_path:
				s.intervention_log_path || '.aimd/output/intervention-log.jsonl',
		};
		s.stage_progress[stage] = {
			...(s.stage_progress[stage] || {}),
			status: 'complete',
			completed_at: nowIso,
			gate_decision: decision === 'stop' ? 'stop' : 'go',
		};
		if (next) {
			s.current_chain = next;
			s.stage_progress[next] = {
				...(s.stage_progress[next] || {}),
				status: 'in_progress',
				started_at: nowIso,
			};
		}
		s.blocked = false;
		s.block_reason = null;
		return s;
	});
	// G3 manifest sync — only when current_scope is set.
	if (state.current_scope) {
		try {
			const fromStage = stageToManifestStage(stage);
			if (MANIFEST_STAGES.includes(fromStage)) {
				const fm = readManifest(root, state.current_scope, fromStage);
				if (fm)
					writeManifest(root, state.current_scope, fromStage, {
						...fm,
						status: 'complete',
					});
			}
			if (next) {
				const toStage = stageToManifestStage(next);
				if (MANIFEST_STAGES.includes(toStage)) {
					const tm = readManifest(root, state.current_scope, toStage);
					if (tm)
						writeManifest(root, state.current_scope, toStage, {
							...tm,
							status: 'in_progress',
						});
					const sm = readManifest(root, state.current_scope);
					if (sm)
						writeManifest(root, state.current_scope, null, {
							...sm,
							current_stage: toStage,
						});
				}
			}
		} catch (e) {
			console.error(`[chain-driver] manifest sync warn: ${e.message}`);
		}
	}
	logIntervention(state, root, {
		event_type: 'gate_decision',
		actor: args.userDecision ? 'user' : 'driver',
		stage,
		decision: finalDecision.decision,
		exit_code: 0,
		message: `advanced to ${next || '(terminal)'}`,
	});
	// v8.7.2+ — ticket-sync auto-suggest stderr (R20 / DEC-2026-05-20-r20-verification-mode).
	// Stop hook 직접 등록 ❌ — Stop event = 매 turn 종료마다 발화 = noise.
	// chain-driver next 호출 시점 = 의도된 stage 전이 = ticket-sync 호출 candidate moment.
	// 실 MCP 호출은 사용자 명시 호출 의무 (R20 confirmation gate 본질 보존 / fire-and-forget ❌).
	const stageForTicketSync = stage === 'impl' ? 'implement' : stage;
	process.stderr.write(
		`[chain-driver] ticket-sync auto-suggest: invoke skill context-ops:ticket-sync ` +
			`with stage=${stageForTicketSync} phase=exit (dry_run=true default). ` +
			`Initiative 생성 권한 부재 환경 / plugin verification meta-cycle / migration carry 시: ` +
			`mode=verification + parent_epic=<existing-epic-key>. ` +
			`R20 / DEC-2026-05-20-r20-verification-mode.\n`,
	);
	// v11.29.0 — Type 2 adopter corroboration 캡처 auto-suggest (terminal 전용 / EXT-CAPTURE-05).
	//   gate #5(implement→terminal / !next) 통과 = chain 1 cycle 완주 → adopter-evidence-packager 안내.
	//   suggest-not-autofire (Senior REVISE-1 / official-docs consent): adopter proprietary 코드 hash/stack 을
	//      동의 없이 auto-write ❌ — adopter 명시 실행 의무 (ticket-sync R20 confirmation gate 동질 / 데이터 주권).
	if (!next) {
		process.stderr.write(
			`[chain-driver] adopter-corroboration capture suggest (chain 1 cycle 완주 / terminal): ` +
				`외부 채택(Type 2) corroboration 을 남기려면 adopter-evidence-packager 실행 권장 (opt-in) — ` +
				`node tools/adopter-evidence-packager/src/cli.js --state .aimd/state.json ` +
				`[--manifest .aimd/<scope>/manifest.json --findings <f> --matrix .aimd/output/matrix.json ` +
				`--stack <csv> --org-type <enum> --salt <s>]. ` +
				`익명화(PII redaction + leak guard) 후 .aimd/output/adopter-corroboration.json 생성. ` +
				`자동 전송 ❌ (데이터 주권 / 명시 공유 시 maintainer 에 전달). EXT-CAPTURE-05.\n`,
		);
	}
	process.stdout.write(
		JSON.stringify({ stage, advanced_to: next, gate: finalDecision }, null, 2) +
			'\n',
	);
	process.exit(0);
}

function cmdQuery(args) {
	// dep-graph P4 (operation.md 결정 7) — query --graph 로 artifact-graph.json JSON 출력 (툴링용).
	if (args.graphPath) {
		if (!existsSync(args.graphPath)) {
			console.error(
				`[chain-driver] query --graph: graph not found: ${args.graphPath}`,
			);
			process.exit(3);
		}
		let graph;
		try {
			graph = JSON.parse(readFileSync(args.graphPath, 'utf-8'));
		} catch (e) {
			console.error(`[chain-driver] query --graph parse error: ${e.message}`);
			process.exit(3);
		}
		// 노드 id 필터 (--ref 재사용) 또는 전체
		if (args.ref) {
			const node = (graph.nodes ?? []).find((n) => n.id === args.ref);
			const edges = (graph.edges ?? []).filter(
				(e) => e.source === args.ref || e.target === args.ref,
			);
			process.stdout.write(
				JSON.stringify({ node: node ?? null, edges }, null, 2) + '\n',
			);
		} else {
			process.stdout.write(
				JSON.stringify(
					{ stats: graph.stats, nodes: graph.nodes, edges: graph.edges },
					null,
					2,
				) + '\n',
			);
		}
		process.exit(0);
	}
	if (!args.project) usage(3);
	const root = resolve(args.project);
	const result = executeQuery(root, {
		scope: args.scope,
		stage: args.stage,
		ref: args.ref,
		stale: args.stale,
	});
	process.stdout.write(JSON.stringify(result, null, 2) + '\n');
	process.exit(0);
}

// F3 (Loop B / 소비 루프) — stage → artifact_subkind 매핑 (각 단계 일괄 조회용).
const STAGE_SUBKINDS = {
	discovery: ['UC'],
	spec: ['BHV', 'AC'],
	plan: ['TASK', 'EPIC', 'STORY', 'OP'],
	test: ['TC'],
	implement: ['IMPL'],
};

// F4 (Loop B / 소비 루프) — stage별 기본 방향 프리셋 ("각 단계가 던질 기본 질문").
//   discovery/spec/implement = backward (상류 honor 강조) / plan/test = forward (하류 affects 강조).
//   --direction forward|backward|both 로 override. presentation-only (analyzeImpact 알고리즘 무변경).
const STAGE_DIRECTION = {
	discovery: 'backward',
	spec: 'backward',
	implement: 'backward',
	plan: 'forward',
	test: 'forward',
};

// F3 — stage/scope 단위 일괄 의존성 rollup ("이 단계가 무엇을 honor/affect 하나" 한 번에).
//   단일 --origin 대신 --stage <s> 또는 --scope <id> → 해당 노드 전부의 backward(honor)/forward(affects) 집계.
//   AI 추론 0% — analyzeImpact (결정론 BFS) 재사용. dep-graph-navigator skill 및 stage agent consult 의 단계-일괄 채널.
function cmdNavigateRollup(graph, args) {
	if (args.stage && !STAGE_SUBKINDS[args.stage]) {
		console.error(
			`[chain-driver] navigate --stage: unknown stage '${args.stage}' (discovery|spec|plan|test|implement)`,
		);
		process.exit(3);
	}
	if (
		args.direction &&
		!['forward', 'backward', 'both'].includes(args.direction)
	) {
		console.error(`[chain-driver] navigate --direction: forward|backward|both`);
		process.exit(3);
	}
	// F4 — emphasis = --direction override > stage 기본 프리셋 > 'both'.
	const emphasis =
		args.direction ?? (args.stage ? STAGE_DIRECTION[args.stage] : 'both');
	const subkinds = args.stage ? new Set(STAGE_SUBKINDS[args.stage]) : null;
	const TRAVERSABLE = new Set(['active', 'drift']);
	const target = (graph.nodes ?? []).filter(
		(n) =>
			TRAVERSABLE.has(n.state) &&
			(!subkinds || subkinds.has(n.artifact_subkind)) &&
			(!args.scope || n.scope_id === args.scope),
	);

	const policyPath =
		args.policyPath ||
		join(resolveRepoRoot(process.cwd()), 'policies', 'propagation-policy.json');
	let policy = null;
	try {
		policy = loadPolicy(policyPath);
	} catch {
		policy = null;
	}
	const nonTraversable = policy?.non_traversable_states ?? ['propose'];

	const items = [];
	for (const n of target) {
		let impact;
		try {
			impact = analyzeImpact(graph, n.id, {
				baseGradeOverrides: policy?.edge_grade_overrides ?? undefined,
				nonTraversableStates: nonTraversable,
			});
		} catch {
			continue;
		}
		items.push({
			id: n.id,
			artifact_subkind: n.artifact_subkind,
			state: n.state,
			by_grade: impact.by_grade,
			forward: impact.forward,
			backward: impact.backward,
			code_pointers: (n.code_pointers ?? []).length,
			code_pointers_na: n.code_pointers_na ?? false,
		});
	}
	items.sort((a, b) => a.id.localeCompare(b.id));
	const topRoots = topKImpactRoot(graph, {
		k: 3,
		nonTraversableStates: nonTraversable,
	});

	const result = {
		query: { stage: args.stage ?? null, scope: args.scope ?? null },
		emphasis,
		emphasis_source: args.direction
			? 'override'
			: args.stage
				? 'stage-default'
				: 'none',
		count: items.length,
		nodes: items,
		top_impact_roots: topRoots,
	};

	if (args.json) {
		process.stdout.write(JSON.stringify(result, null, 2) + '\n');
	} else {
		process.stdout.write(
			`[dep-graph-navigator] rollup — stage=${args.stage ?? '-'} scope=${args.scope ?? '-'} / ${items.length} 노드 / emphasis=${emphasis}\n`,
		);
		for (const it of items) {
			process.stdout.write(
				`  ${it.id} (${it.artifact_subkind}) state=${it.state}\n`,
			);
			if (emphasis === 'backward') {
				const ids = it.backward.map((x) => x.id).sort();
				process.stdout.write(
					`    honor(backward): ${ids.length ? ids.join(', ') : '-'}\n`,
				);
			} else if (emphasis === 'forward') {
				const ids = it.forward.map((x) => x.id).sort();
				process.stdout.write(
					`    affects(forward): ${ids.length ? ids.join(', ') : '-'}\n`,
				);
			} else {
				process.stdout.write(
					`    honor(MUST): ${it.by_grade.MUST.length ? it.by_grade.MUST.join(', ') : '-'}\n`,
				);
			}
		}
		process.stdout.write(
			`  top-3 impact root (graph-wide): ${topRoots.map((r) => `${r.id}(${r.score})`).join(', ')}\n`,
		);
	}
	process.exit(0);
}

// dep-graph 의도③ (navigate --with-spec / s68 triage → 본 slice) — 스펙 본문 lazy-read.
//   노드 source 파일에서 본문(UC/BHV/AC + TASK/TC/IMPL = chain leaf 6 subkind)을 읽어 reference-lens 로 표시. display-only / 결정론 fs read / 회귀 0.
//   trust: 본문 = reference-lens — 어떤 결정적 gate(gate-eval/s2-outcome-check/findings-aggregator)에도 inject ❌
//      (DEC-2026-05-28 §4.2 codegraph trust 동형 / skills/dep-graph-navigator/SKILL.md trust 절). result.spec.reference_lens 항상 true.
//   source_path 절대(dogfood 실측)·상대·placeholder('(behavior)') 모두 graceful: existsSync 가 모든 branch gate (절대 포함 / 회귀 차단).
const SPEC_SUBKIND_CONFIG = Object.freeze({
	UC: {
		array: 'use_cases',
		scalars: ['name', 'description'],
		arrays: ['actors', 'preconditions', 'postconditions'],
	},
	BHV: {
		array: 'behaviors',
		scalars: ['name', 'description'],
		arrays: ['preconditions', 'postconditions', 'invariants'],
	},
	AC: {
		array: 'criteria',
		scalars: ['description', 'severity'],
		gherkin: true,
	},
	// 의도③ with-spec 확장 (s70) — plan/test/implement stage leaf 본문 (graph-synthesizer 가 이미 source_path 배선 / UC·BHV·AC 와 대칭).
	//   TASK·TC = 2 distinct 도메인(RealWorld+ecommerce) corroborate / IMPL = ecommerce 1-도메인 (사용자 옵션 2 / Java IMPL shape 검증=carry / 정직 표기).
	TASK: {
		array: 'tasks',
		scalars: [
			'description',
			'behavior_ref',
			'layer',
			'module',
			'execution_order',
		],
		arrays: ['ac_refs', 'tc_refs', 'dependencies'],
	},
	TC: {
		array: 'test_cases',
		scalars: [
			'type',
			'framework',
			'framework_status',
			'ac_ref',
			'bhv_ref',
			'expected_outcome',
			'test_intent',
			'source_file',
		],
	},
	IMPL: {
		array: 'modules',
		scalars: ['framework', 'layer', 'stack', 'commit_hash'],
		arrays: ['tc_refs', 'bhv_refs', 'source_files'],
	},
});
const SPEC_CAP = 5; // 배열 항목 표시 상한 (초과분은 "… (+N more)" 정직 표기 / silent truncation 금지).

function capSpecArray(arr) {
	if (!Array.isArray(arr)) return [];
	if (arr.length <= SPEC_CAP) return arr.slice();
	return [...arr.slice(0, SPEC_CAP), `… (+${arr.length - SPEC_CAP} more)`];
}

// hybrid source 해석 — graph-dir 우선(co-located 실측) → repoRoot(schema 계약) → basename(lossy 최후) → cwd.
//   existsSync 가 모든 후보(절대 포함) gate — stale 절대경로 readFileSync throw 회귀 차단 (must-fix #1).
function resolveSpecSource(sourcePath, graphPath) {
	if (!sourcePath) return null;
	const candidates = isAbsolute(sourcePath)
		? [sourcePath]
		: [
				join(dirname(graphPath), sourcePath), // graph-dir 구조보존 (co-located)
				join(resolveRepoRoot(process.cwd()), sourcePath), // repoRoot (schema "plugin-root 상대")
				join(dirname(graphPath), basename(sourcePath)), // basename (lossy 최후)
				resolve(sourcePath), // cwd
			];
	return candidates.find((c) => existsSync(c)) ?? null;
}

// 노드 → 스펙 본문 (reference-lens). 항상 reference_lens:true. 불가 시 {available:false, reason}.
function readSpecBody(node, graphPath) {
	const base = {
		reference_lens: true,
		subkind: node.artifact_subkind,
		id: node.id,
	};
	const cfg = SPEC_SUBKIND_CONFIG[node.artifact_subkind];
	if (!cfg)
		return {
			...base,
			available: false,
			reason: `subkind ${node.artifact_subkind} 본문 미지원 (chain leaf 6 subkind=UC/BHV/AC/TASK/TC/IMPL 한정 — EPIC/STORY/OP·analysis/aspect = carry)`,
		};
	const full = resolveSpecSource(node.source_path, graphPath);
	if (!full) return { ...base, available: false, reason: 'source 부재' };
	let obj;
	try {
		obj = JSON.parse(readFileSync(full, 'utf-8'));
	} catch {
		return { ...base, available: false, reason: 'source parse 실패' };
	}
	const entry = (obj[cfg.array] ?? []).find((e) => e && e.id === node.id);
	if (!entry) return { ...base, available: false, reason: 'id miss' };
	const body = { ...base, available: true };
	if (node.title) body.title = node.title;
	for (const k of cfg.scalars ?? []) if (entry[k] != null) body[k] = entry[k];
	for (const k of cfg.arrays ?? [])
		if (Array.isArray(entry[k])) body[k] = capSpecArray(entry[k]);
	if (cfg.gherkin && entry.gherkin && typeof entry.gherkin === 'object') {
		body.gherkin = {
			given: capSpecArray(entry.gherkin.given),
			when: entry.gherkin.when ?? null,
			then: capSpecArray(entry.gherkin.then),
			tags: capSpecArray(entry.gherkin.tags),
		};
	}
	return body;
}

// 의도③ (a) NL 라우팅 — prompt 해소 결과 텍스트 출력 (후보 list + 점수 / 탐색 top / list-only / 0매칭 / skip).
function writePromptResolution(pr) {
	if (pr.skipped_reason) {
		process.stdout.write(
			`[dep-graph-navigator] 프롬프트 "${pr.prompt}" → ${pr.skipped_reason}\n`,
		);
		return;
	}
	const n = pr.matches.length;
	const head = pr.resolved
		? `매칭 ${n} (top: ${pr.resolved})`
		: n === 0
			? '매칭 0'
			: `매칭 ${n} (동점/약매칭 — 자동 탐색 억제)`;
	process.stdout.write(
		`[dep-graph-navigator] 프롬프트 "${pr.prompt}" → ${head}\n`,
	);
	for (const m of pr.matches) {
		process.stdout.write(
			`    ${m.node_id} (score ${m.score}) [${m.matched.join(', ')}]\n`,
		);
	}
	if (pr.resolved) process.stdout.write(`  → top 탐색: ${pr.resolved}\n`);
	else process.stdout.write(`  ${pr.reason}\n`);
}

// 의도③ (b) what-if — 가설 변경 영향 (in-memory 비파괴 / 사용자 명시 op 만 / DEC-2026-06-03-living-graph-what-if).
//   op 문자열 = 변경의 SOLE source (LLM/heuristic 엣지 추론 ❌ = trust선). v1 scope = core_two (Senior).
//     remove-node:ID            — 노드+인접 엣지 제거 ("삭제하면 뭐 끊기나")
//     add-edge:SRC>TGT[:type]   — 가설 엣지 추가 (기본 derived_from / "이 의존 추가하면?")
//   deprecate-node·remove-edge·add-node = carry (§8.1 external pull 필요 / gold-plating 회피).
function parseWhatIfOp(opStr) {
	const parts = String(opStr ?? '').split(':');
	const kind = parts[0];
	if (kind === 'remove-node') {
		if (parts.length !== 2 || !parts[1])
			return { error: 'remove-node:ID 형식' };
		return { kind, nodeId: parts[1] };
	}
	if (kind === 'add-edge') {
		if (parts.length < 2 || !parts[1].includes('>'))
			return { error: 'add-edge:SRC>TGT[:edge_type] 형식' };
		const [src, tgt] = parts[1].split('>');
		if (!src || !tgt) return { error: 'add-edge:SRC>TGT[:edge_type] 형식' };
		return { kind, src, tgt, edge_type: parts[2] || 'derived_from' };
	}
	return {
		error: `미지원 op '${kind}' — remove-node | add-edge (deprecate-node·remove-edge·add-node = carry)`,
	};
}

// 가설 op 를 graph 사본에 적용 (호출부가 structuredClone 한 copy 만 넘김 / 원본 무변경).
function applyWhatIfOp(copy, op) {
	if (op.kind === 'remove-node') {
		copy.nodes = (copy.nodes ?? []).filter((n) => n.id !== op.nodeId);
		copy.edges = (copy.edges ?? []).filter(
			(e) => e.source !== op.nodeId && e.target !== op.nodeId,
		);
	} else if (op.kind === 'add-edge') {
		copy.edges = copy.edges ?? [];
		const confidence = EDGE_TYPE_CATALOG.hard.includes(op.edge_type)
			? 'hard'
			: 'soft';
		copy.edges.push({
			source: op.src,
			target: op.tgt,
			edge_type: op.edge_type,
			confidence,
		});
	}
}

// dep-graph P4 (operation.md 결정 7) — dep-graph-navigator skill 의 backend.
// node 상세 + 영향 트리(BFS) + code_pointers + top-K impact root (centrality) 통합.
// usage: chain-driver navigate --graph <path> --origin <node-id> [--with-spec] [--what-if "<op>"] [--json]
//        chain-driver navigate --graph <path> --prompt "<자연어>" [--with-spec] [--json]   (의도③ NL 라우팅)
//        chain-driver navigate --graph <path> --stage <s>|--scope <id> [--json]   (F3 일괄 rollup)
function cmdNavigate(args) {
	if (!args.graphPath) {
		console.error('[chain-driver] navigate: --graph <path> required');
		process.exit(3);
	}
	if (!existsSync(args.graphPath)) {
		console.error(
			`[chain-driver] navigate: graph not found: ${args.graphPath}`,
		);
		process.exit(3);
	}
	let graph;
	try {
		graph = JSON.parse(readFileSync(args.graphPath, 'utf-8'));
	} catch (e) {
		console.error(`[chain-driver] navigate parse error: ${e.message}`);
		process.exit(3);
	}

	// F3 — stage/scope 일괄 rollup (단일 노드 --origin 없이 "이 단계의 의존성" 한 번에)
	//   rollup 우선 — --prompt + --stage/--scope 동시 시 rollup 이 이김 (prompt 해소는 그 뒤 / 회귀 보존).
	if (!args.origin && (args.stage || args.scope)) {
		return cmdNavigateRollup(graph, args);
	}

	// 의도③ (a) NL 라우팅 — --prompt 자연어 → 노드 결정론 해소 (origin 미지정 시).
	//   traversable(active/drift) 전 노드 후보 + includeTitle (selectOriginNodes 의 anchored 필터 ❌ = REFUTE 근본원인).
	//   confident(strong+unique) 만 top-1 자동 탐색 / tie·약매칭 = list-only degrade (오답 권위화 차단 / Senior must-fix).
	let promptResolution = null;
	if (!args.origin && args.prompt) {
		const TRAVERSABLE = new Set(['active', 'drift']);
		const candidates = (graph.nodes ?? []).filter((n) =>
			TRAVERSABLE.has(n.state),
		);
		const matches = matchPromptToNodes(args.prompt, candidates, {
			topN: 5,
			includeTitle: true,
		});
		const confident = isConfidentTop(matches);
		promptResolution = {
			prompt: args.prompt,
			matches,
			resolved: confident ? matches[0].node_id : null,
			reason:
				matches.length === 0
					? '매칭 0 — 식별자/제목 substring 만(동의어·임베딩 ❌). --origin <id> 명시 또는 표현 구체화.'
					: confident
						? null
						: '동점/약매칭 — top-1 자동 탐색 억제. 후보 중 --origin <id> 로 명시.',
		};
		if (confident) {
			args.origin = matches[0].node_id; // top-1 자동 탐색
		} else {
			// list-only — 후보만 노출하고 종료 (탐색 ❌ / 오답 권위화 차단).
			if (args.json) {
				process.stdout.write(
					JSON.stringify({ prompt_resolution: promptResolution }, null, 2) +
						'\n',
				);
			} else {
				writePromptResolution(promptResolution);
			}
			process.exit(0);
		}
	} else if (args.origin && args.prompt) {
		// --prompt + --origin 동시 = origin 우선 (명시 id 권위) / prompt skip (silent drop ❌ — 기록).
		promptResolution = {
			prompt: args.prompt,
			matches: [],
			resolved: args.origin,
			skipped_reason: '--origin 우선 — prompt 무시 (명시 id 권위)',
		};
	}

	if (!args.origin) {
		console.error(
			'[chain-driver] navigate: --origin <node-id> OR --prompt <text> OR --stage/--scope required',
		);
		process.exit(3);
	}

	const node = (graph.nodes ?? []).find((n) => n.id === args.origin);
	if (!node) {
		console.error(
			`[chain-driver] navigate: node '${args.origin}' not in graph`,
		);
		process.exit(3);
	}

	const policyPath =
		args.policyPath ||
		join(resolveRepoRoot(process.cwd()), 'policies', 'propagation-policy.json');
	let policy = null;
	try {
		policy = loadPolicy(policyPath);
	} catch {
		policy = null;
	}
	const nonTraversable = policy?.non_traversable_states ?? ['propose'];

	let impact;
	try {
		impact = analyzeImpact(graph, args.origin, {
			baseGradeOverrides: policy?.edge_grade_overrides ?? undefined,
			nonTraversableStates: nonTraversable,
		});
	} catch (e) {
		console.error(`[chain-driver] navigate: ${e.message}`);
		process.exit(3);
	}

	const topRoots = topKImpactRoot(graph, {
		k: 3,
		nonTraversableStates: nonTraversable,
	});

	// 의도③ (b) what-if — 가설 변경 영향 (in-memory 비파괴 diff / origin 기준 baseline vs 가설).
	let whatIf = null;
	if (args.whatIf) {
		const op = parseWhatIfOp(args.whatIf);
		if (op.error) {
			console.error(`[chain-driver] navigate --what-if: ${op.error}`);
			process.exit(3);
		}
		const ids = new Set((graph.nodes ?? []).map((n) => n.id));
		if (op.kind === 'remove-node') {
			if (!ids.has(op.nodeId)) {
				console.error(
					`[chain-driver] navigate --what-if: 대상 노드 '${op.nodeId}' 부재`,
				);
				process.exit(3);
			}
			if (op.nodeId === args.origin) {
				console.error(
					`[chain-driver] navigate --what-if: origin '${args.origin}' 이 제거 대상과 동일 — 제거 후 영향 분석 불가. downstream consumer 를 --origin 으로 지정.`,
				);
				process.exit(3);
			}
		} else if (op.kind === 'add-edge') {
			if (!ids.has(op.src) || !ids.has(op.tgt)) {
				console.error(
					`[chain-driver] navigate --what-if: add-edge src/tgt 노드 부재 (${op.src}>${op.tgt})`,
				);
				process.exit(3);
			}
			const validTypes = new Set([
				...EDGE_TYPE_CATALOG.hard,
				...EDGE_TYPE_CATALOG.soft,
			]);
			if (!validTypes.has(op.edge_type)) {
				console.error(
					`[chain-driver] navigate --what-if: 미지 edge_type '${op.edge_type}' (${[...validTypes].join('|')})`,
				);
				process.exit(3);
			}
		}
		const copy = structuredClone(graph); // 원본 무변경 — 가설은 사본에만 (do_not_edit_manually 계약).
		applyWhatIfOp(copy, op);
		let hypo;
		try {
			hypo = analyzeImpact(copy, args.origin, {
				baseGradeOverrides: policy?.edge_grade_overrides ?? undefined,
				nonTraversableStates: nonTraversable,
			});
		} catch (e) {
			console.error(`[chain-driver] navigate --what-if: ${e.message}`);
			process.exit(3);
		}
		const deltaFor = (b, h) => {
			const bs = new Set(b),
				hs = new Set(h);
			return {
				added: h.filter((x) => !bs.has(x)).sort(),
				removed: b.filter((x) => !hs.has(x)).sort(),
			};
		};
		whatIf = {
			op: args.whatIf,
			kind: op.kind,
			unsaved: true, // 가설 — 그래프 파일 미저장 (in-memory only).
			...(op.kind === 'add-edge' ? { edge_type: op.edge_type } : {}),
			hypothetical_by_grade: hypo.by_grade,
			delta: {
				MUST: deltaFor(impact.by_grade.MUST, hypo.by_grade.MUST),
				SHOULD: deltaFor(impact.by_grade.SHOULD, hypo.by_grade.SHOULD),
				FYI: deltaFor(impact.by_grade.FYI, hypo.by_grade.FYI),
			},
		};
	}

	const result = {
		node: {
			id: node.id,
			artifact_kind: node.artifact_kind,
			artifact_subkind: node.artifact_subkind,
			state: node.state,
			source_path: node.source_path,
			code_pointers: node.code_pointers ?? [],
			code_pointers_na: node.code_pointers_na ?? false,
		},
		impact: {
			by_grade: impact.by_grade,
			forward: impact.forward,
			backward: impact.backward,
		},
		top_impact_roots: topRoots,
		stats: impact.stats,
	};

	// 의도③ — --with-spec 일 때만 reference-lens 스펙 본문 첨부 (off 시 출력 무변경 = 회귀 0).
	if (args.withSpec) result.spec = readSpecBody(node, args.graphPath);
	// 의도③ (a) NL 라우팅 — prompt 로 해소됐으면 어떻게 해소됐는지 동봉 (투명성).
	if (promptResolution) result.prompt_resolution = promptResolution;
	// 의도③ (b) what-if — 가설 변경 영향 (baseline=result.impact / 가설 delta = result.what_if / 미저장).
	if (whatIf) result.what_if = whatIf;

	if (args.json) {
		process.stdout.write(JSON.stringify(result, null, 2) + '\n');
	} else {
		if (promptResolution) writePromptResolution(promptResolution);
		process.stdout.write(
			`[dep-graph-navigator] ${node.id} (${node.artifact_kind}/${node.artifact_subkind}) state=${node.state}\n`,
		);
		process.stdout.write(`  source: ${node.source_path}\n`);
		if (result.node.code_pointers.length > 0) {
			process.stdout.write(`  code_pointers:\n`);
			for (const cp of result.node.code_pointers) {
				process.stdout.write(
					`    - ${cp.anchor_type}: ${cp.path}${cp.symbol ? ` #${cp.symbol}` : ''}\n`,
				);
			}
		} else {
			process.stdout.write(
				`  code_pointers: ${result.node.code_pointers_na ? '(N/A 명시)' : '(없음)'}\n`,
			);
		}
		if (args.withSpec) {
			const sp = result.spec;
			process.stdout.write(`  spec 본문 (reference-lens / gate 주입 ❌):\n`);
			if (!sp.available) {
				process.stdout.write(`    (불가 — ${sp.reason})\n`);
			} else {
				if (sp.title) process.stdout.write(`    title: ${sp.title}\n`);
				if (sp.name) process.stdout.write(`    name: ${sp.name}\n`);
				if (sp.description)
					process.stdout.write(`    description: ${sp.description}\n`);
				if (sp.actors)
					process.stdout.write(`    actors: ${sp.actors.join(', ')}\n`);
				if (sp.preconditions)
					process.stdout.write(
						`    preconditions: ${sp.preconditions.join(' / ')}\n`,
					);
				if (sp.postconditions)
					process.stdout.write(
						`    postconditions: ${sp.postconditions.join(' / ')}\n`,
					);
				if (sp.invariants)
					process.stdout.write(
						`    invariants: ${sp.invariants.join(' / ')}\n`,
					);
				if (sp.severity) process.stdout.write(`    severity: ${sp.severity}\n`);
				if (sp.gherkin) {
					process.stdout.write(
						`    given: ${sp.gherkin.given.join(' / ') || '-'}\n`,
					);
					process.stdout.write(`    when: ${sp.gherkin.when || '-'}\n`);
					process.stdout.write(
						`    then: ${sp.gherkin.then.join(' / ') || '-'}\n`,
					);
				}
			}
		}
		process.stdout.write(`  영향 트리:\n`);
		process.stdout.write(
			`    MUST: ${impact.by_grade.MUST.join(', ') || '-'}\n`,
		);
		process.stdout.write(
			`    SHOULD: ${impact.by_grade.SHOULD.join(', ') || '-'}\n`,
		);
		process.stdout.write(`    FYI: ${impact.by_grade.FYI.join(', ') || '-'}\n`);
		process.stdout.write(
			`  top-3 impact root (graph-wide): ${topRoots.map((r) => `${r.id}(${r.score})`).join(', ')}\n`,
		);
		if (whatIf) {
			const attribAdded =
				whatIf.kind === 'add-edge' ? 'newly reachable' : 'added';
			const attribRemoved =
				whatIf.kind === 'remove-node' ? 'newly orphaned' : 'removed';
			const etNote =
				whatIf.kind === 'add-edge' ? ` (가설 엣지 ${whatIf.edge_type})` : '';
			process.stdout.write(
				`  what-if (가설 / 미저장): ${whatIf.op}${etNote}\n`,
			);
			for (const g of ['MUST', 'SHOULD', 'FYI']) {
				const d = whatIf.delta[g];
				const notes = [];
				if (d.added.length) notes.push(`${attribAdded}: ${d.added.join(', ')}`);
				if (d.removed.length)
					notes.push(`${attribRemoved}: ${d.removed.join(', ')}`);
				process.stdout.write(
					`    ${g}: +${d.added.length} / -${d.removed.length}${notes.length ? ` (${notes.join(' / ')})` : ''}\n`,
				);
			}
		}
	}
	process.exit(0);
}

// trace-view (옵션 A+B / DEC-2026-06-03-dep-graph-trace-view) — 사람 gate-검토용 view-time 렌더러.
//   navigate(쿼리 단위) 와 분리: stage/feature 조망 + UC→단계 coverage hole. 순수 formatter (새 순회 0) / stdout only / 파일 write 0.
//   reference-lens / display-only — 출력은 어떤 결정적 gate 에도 inject ❌ (release-readiness check 가 구조 검증).
function cmdTraceView(args) {
	if (!args.graphPath) {
		console.error(
			'[chain-driver] trace-view: --graph <artifact-graph.json> required',
		);
		process.exit(3);
	}
	if (!existsSync(args.graphPath)) {
		console.error(
			`[chain-driver] trace-view: graph not found: ${args.graphPath}`,
		);
		process.exit(3);
	}
	let graph;
	try {
		graph = JSON.parse(readFileSync(args.graphPath, 'utf-8'));
	} catch (e) {
		console.error(`[chain-driver] trace-view parse error: ${e.message}`);
		process.exit(3);
	}

	const view = buildTraceView(graph, {
		scope: args.scope ?? null,
		includeMatrix: !args.noMatrix,
		graphName: basename(args.graphPath),
		repoRoot: args.repoRoot ?? resolveRepoRoot(process.cwd()),
	});

	if (args.json) {
		process.stdout.write(JSON.stringify(view, null, 2) + '\n');
	} else {
		process.stdout.write(renderTraceViewMarkdown(view));
	}
	process.exit(0);
}

function cmdSync(args) {
	if (!args.project) usage(3);
	const root = resolve(args.project);
	if (!args.scope) {
		// no scope → markDrift summary
		const summary = markDrift(root);
		process.stdout.write(JSON.stringify(summary, null, 2) + '\n');
		process.exit(0);
	}
	try {
		const result = cascade(root, args.scope);
		process.stdout.write(JSON.stringify(result, null, 2) + '\n');
		process.exit(0);
	} catch (e) {
		console.error(`[chain-driver] sync failed: ${e.message}`);
		process.exit(3);
	}
}

function cmdSuggestSkill(args) {
	if (!args.prompt) usage(3);
	const skillId = suggestSkillForPrompt(args.prompt);
	if (!skillId) {
		process.stderr.write('[chain-driver] no skill matched. Use /aimd-next.\n');
		process.exit(0);
	}
	// Try to load skill meta from repo root (caller responsibility — we use cwd as repoRoot).
	const repoRoot = args.repoRoot || resolveRepoRoot(process.cwd());
	let meta = null;
	try {
		meta = loadSkill(repoRoot, skillId).meta;
	} catch {
		/* ok */
	}
	process.stderr.write(formatSkillSuggestion(skillId, meta) + '\n');
	process.exit(0);
}

// dep-graph P4 (operation.md 결정 7) — SessionStart 그래프 컨텍스트 주입.
// artifact-graph.json 위치 후보를 탐색해 dirty(state=drift) 노드 수 + top-3 impact root 요약.
// 그래프 없으면 null (non-fatal).
function buildGraphSessionContext(root) {
	const candidates = [
		join(root, '.aimd', 'output', 'artifact-graph.json'),
		join(root, '.aimd', 'artifact-graph.json'),
	];
	let graphPath = candidates.find((p) => existsSync(p));
	if (!graphPath) {
		// scope 별 위치도 탐색 (.aimd/<scope>/artifact-graph.json)
		try {
			for (const scope of listScopes(root)) {
				const p = join(root, '.aimd', scope, 'artifact-graph.json');
				if (existsSync(p)) {
					graphPath = p;
					break;
				}
			}
		} catch {
			/* ok */
		}
	}
	if (!graphPath) return null;

	let graph;
	try {
		graph = JSON.parse(readFileSync(graphPath, 'utf-8'));
	} catch {
		return null;
	}

	const nodes = graph.nodes ?? [];
	const driftCount = nodes.filter((n) => n.state === 'drift').length;
	const proposeCount = nodes.filter((n) => n.state === 'propose').length;
	const topRoots = topKImpactRoot(graph, { k: 3 });
	const rootStr = topRoots.map((r) => `${r.id}(${r.score})`).join(', ');

	const parts = [`[dep-graph] ${nodes.length} nodes`];
	// Loop A / A1 (B-minimal / DEC-2026-06-03 C-living-graph-autotrigger) — freshness 정직 노출.
	//   synthesized_at 이후 변경된 source 가 있으면 "건강(0 drift)"으로 오인될 stale 그래프를 ⚠️ STALE 로
	//   prominent 표기 (false-health 방지). display-only — 자동 재합성·drift write ❌ (사용자가 수동 재합성).
	//   결정론 fs mtime / 실패=non-fatal skip.
	let fresh = null;
	try {
		fresh = checkGraphFreshness(graph, { repoRoot: root });
	} catch {
		/* non-fatal */
	}
	if (fresh?.stale) {
		const names = fresh.stale_sources
			.slice(0, 3)
			.map((s) => basename(s))
			.join(', ');
		const more = fresh.stale_sources.length > 3 ? ' …' : '';
		parts.push(
			`⚠️ STALE — ${fresh.stale_sources.length} source 변경(${names}${more}) → 재합성: traceability-matrix-builder --graph`,
		);
	}
	if (driftCount > 0) parts.push(`⚠️ ${driftCount} drift`);
	if (proposeCount > 0) parts.push(`${proposeCount} propose 대기`);
	parts.push(`top-3 impact root: ${rootStr || '-'}`);
	parts.push(`탐색: /dep-graph-navigator <node-id>`);
	return parts.join(' / ');
}

function cmdHooksBridge(args) {
	let stdin = '';
	try {
		stdin = readFileSync(0, 'utf-8');
	} catch {
		/* ok */
	}
	let payload;
	try {
		payload = parseHookInput(stdin);
	} catch (e) {
		console.error(`[chain-driver] ${e.message}`);
		process.exit(3);
	}
	const event = payload.hook_event_name;
	if (event === 'SessionStart') {
		// G3 R5/R7 — recover .tmp + drift 자동 감지 + 사용자 안내 (M4).
		const root = payload.cwd || process.cwd();
		if (!existsSync(join(root, '.aimd', 'state.json'))) {
			// user project not yet initialized — pass-through.
			process.stdout.write(
				JSON.stringify({ suppressOutput: true, continue: true }) + '\n',
			);
			process.exit(0);
		}
		try {
			recoverTmpFiles(root);
		} catch {
			/* non-fatal */
		}
		let driftSummary = { marked: [] };
		try {
			driftSummary = markDrift(root);
		} catch {
			/* non-fatal */
		}
		let additionalContext =
			driftSummary.marked.length > 0
				? `[ai-native-methodology] ⚠️ drift detected in ${driftSummary.marked.length} scope(s): ${driftSummary.marked.join(', ')}. Run: chain-driver sync --scope <slug> to cascade.`
				: '[ai-native-methodology] chain harness ready. M4 sync = drift auto-detect + manual cascade.';
		// dep-graph P4 (operation.md 결정 7) — artifact-graph.json 있으면 dirty 노드 수 + top-3 impact root 주입.
		try {
			const graphInjection = buildGraphSessionContext(root);
			if (graphInjection) additionalContext += `\n${graphInjection}`;
		} catch {
			/* non-fatal — 그래프 없으면 skip */
		}
		const out = {
			suppressOutput: true,
			hookSpecificOutput: { additionalContext },
			continue: true,
		};
		process.stdout.write(JSON.stringify(out) + '\n');
		if (driftSummary.marked.length > 0) {
			process.stderr.write(
				`[ai-native-methodology] ⚠️ drift detected: ${driftSummary.marked.join(', ')}\n`,
			);
			process.stderr.write(`  → chain-driver sync --scope <slug>\n`);
		}
		process.exit(0);
	}
	if (event === 'UserPromptSubmit') {
		const skillId = suggestSkillForPrompt(payload.prompt);
		if (!skillId) {
			process.stdout.write(
				JSON.stringify({ suppressOutput: true, continue: true }) + '\n',
			);
			process.exit(0);
		}
		const repoRoot = args.repoRoot || resolveRepoRoot(process.cwd());
		let meta = null;
		try {
			meta = loadSkill(repoRoot, skillId).meta;
		} catch {
			/* ok */
		}
		// v4.0 multi-agent paradigm (DEC-2026-05-17) — agent dispatch 권고 동봉 (C19: 기존 dead export 결선).
		const agentId = suggestAgentForPrompt(payload.prompt);
		const out = buildSuggestOutput({
			skillId,
			meta,
			sessionId: payload.session_id,
			agentId,
		});
		process.stdout.write(JSON.stringify(out) + '\n');
		process.stderr.write(formatSkillSuggestion(skillId, meta) + '\n');
		process.exit(0);
	}
	if (event === 'PreToolUse') {
		// attempt to resolve project from cwd and check blocked.
		const root = payload.cwd || process.cwd();
		let state = null;
		try {
			state = readState(root);
		} catch {
			state = null;
		}
		if (state) {
			const reason = shouldBlockToolUse({
				toolName: payload.tool_name,
				toolInput: payload.tool_input,
				state,
			});
			if (reason) {
				const out = buildBlockOutput({
					reason,
					sessionId: payload.session_id,
					hookEventName: event,
				});
				process.stdout.write(JSON.stringify(out) + '\n');
				process.stderr.write(`[chain-driver] PreToolUse blocked: ${reason}\n`);
				process.exit(2);
			}
		}
	}
	// dep-graph P3 (operation.md 결정 5) — PostToolUse 시 chain/analysis artifact write 감지 → impact_pending 마킹.
	// hook 은 빠른 detect+mark 만. per-node 영향 분석(BFS)+정책 평가는 `chain-driver impact` 로 분리 (기계적 정직성).
	if (event === 'PostToolUse') {
		const detected = detectGraphArtifactWrite({
			toolName: payload.tool_name,
			toolInput: payload.tool_input,
		});
		if (detected) {
			const root = payload.cwd || process.cwd();
			let markedScope = null;
			try {
				const state = readState(root);
				const scope = state?.current_scope;
				if (scope) {
					const manifest = readManifest(root, scope);
					if (manifest) {
						manifest.sync_state = manifest.sync_state || {
							drift_detected: false,
						};
						manifest.sync_state.impact_pending = true;
						writeManifest(root, scope, manifest);
						markedScope = scope;
					}
				}
			} catch {
				/* non-fatal — manifest 없으면 stderr 안내만 */
			}
			const note =
				`[ai-native-methodology] graph artifact 변경 감지 (${detected.artifact_kind}/${detected.artifact_subkind}: ${detected.filename})` +
				`${markedScope ? ` — scope '${markedScope}' impact_pending=true` : ''}. ` +
				`영향 분석: chain-driver impact --graph <artifact-graph.json> --origin <node-id>`;
			const out = {
				suppressOutput: true,
				hookSpecificOutput: { additionalContext: note },
				continue: true,
			};
			process.stdout.write(JSON.stringify(out) + '\n');
			process.stderr.write(note + '\n');
			process.exit(0);
		}
	}
	// default: pass-through suppress.
	process.stdout.write(
		JSON.stringify({ suppressOutput: true, continue: true }) + '\n',
	);
	process.exit(0);
}

function cmdMigrate(args) {
	if (!args.project) usage(3);
	const root = resolve(args.project);
	let state;
	try {
		state = readState(root);
	} catch (e) {
		console.error(`[chain-driver] ${e.message}`);
		process.exit(4);
	}
	if (!state) {
		console.error('[chain-driver] no state.json');
		process.exit(3);
	}
	try {
		const migrated = migrate(state, CURRENT_STATE_VERSION);
		writeStateCAS(root, () => migrated);
		logIntervention(migrated, root, {
			event_type: 'schema_migration',
			actor: 'driver',
			from_version: state.version,
			to_version: migrated.version,
			message: 'migration applied',
		});
		process.stdout.write(
			`[chain-driver] migrated ${state.version} → ${migrated.version}\n`,
		);
		process.exit(0);
	} catch (e) {
		if (e instanceof MigrationRequiredError) {
			console.error(`[chain-driver] ${e.message}`);
			process.exit(4);
		}
		throw e;
	}
}

function cmdRevisitDetect(args) {
	if (!args.project) usage(3);
	const root = resolve(args.project);
	const state = readState(root);
	if (!state) {
		console.error('[chain-driver] no state.json');
		process.exit(3);
	}
	const base =
		args.baseSha ||
		state.stage_progress?.[state.current_chain]?.git_baseline_sha ||
		'HEAD~1';
	const diff = gitDiffNumstat(root, base, 'HEAD');
	if (!diff.ok) {
		console.error(`[chain-driver] git diff failed: ${diff.error}`);
		process.exit(3);
	}
	const result = detectRevisit({
		changedFiles: diff.files,
		currentChain: state.current_chain,
		ignoreGlobs: state.revisit_ignore_globs || [],
	});
	logIntervention(state, root, {
		event_type: 'revisit_detect',
		actor: 'driver',
		stage: state.current_chain,
		decision: result.revisit_target
			? `candidate:${result.revisit_target}`
			: 'none',
		confidence_loc: result.confidence_loc,
		changed_paths_count: diff.files.length,
		message: result.reason,
	});
	if (result.revisit_target && args.userDecision === 'go') {
		writeStateCAS(root, (s) => {
			s.pending_revisit = {
				target_stage: result.revisit_target,
				detected_at: new Date().toISOString(),
				confidence_loc: result.confidence_loc,
				changed_paths: result.changed_paths,
				user_decision: 'go',
			};
			return s;
		});
	}
	process.stdout.write(JSON.stringify(result, null, 2) + '\n');
	process.exit(result.revisit_target ? 0 : 0);
}

function resolveRepoRoot(start) {
	// walk up looking for ai-native-methodology folder or flows/sdlc-4stage-flow.json
	let cur = resolve(start);
	for (let i = 0; i < 8; i++) {
		if (existsSync(join(cur, 'flows', 'sdlc-4stage-flow.json'))) return cur;
		if (
			existsSync(
				join(cur, 'ai-native-methodology', 'flows', 'sdlc-4stage-flow.json'),
			)
		) {
			return join(cur, 'ai-native-methodology');
		}
		const parent = dirname(cur);
		if (parent === cur) break;
		cur = parent;
	}
	return start;
}

// dep-graph P3 (operation.md 결정 4·5) — impact 분석 + 정책 평가 + propose JSONL 기록.
// usage: chain-driver impact --graph <artifact-graph.json> --origin <node-id>
//          [--change-kind typo|item_add|item_remove|semantic_change] [--policy <path>]
//          [--out-jsonl <path>] [--code-pointer-only] [--json]
function cmdImpact(args) {
	if (!args.graphPath || !args.origin) {
		console.error(
			'[chain-driver] impact: --graph <path> and --origin <node-id> required',
		);
		process.exit(3);
	}
	if (!existsSync(args.graphPath)) {
		console.error(`[chain-driver] impact: graph not found: ${args.graphPath}`);
		process.exit(3);
	}
	let graph;
	try {
		graph = JSON.parse(readFileSync(args.graphPath, 'utf-8'));
	} catch (e) {
		console.error(`[chain-driver] impact: graph parse error: ${e.message}`);
		process.exit(3);
	}

	// 정책 로드 (default = repo policies/propagation-policy.json)
	const policyPath =
		args.policyPath ||
		join(resolveRepoRoot(process.cwd()), 'policies', 'propagation-policy.json');
	let policy = null;
	try {
		policy = loadPolicy(policyPath);
	} catch {
		policy = null;
	}

	const changeKind = args.changeKind || 'semantic_change';

	// BFS 영향 분석 (propose 노드는 policy.non_traversable_states 또는 기본 제외)
	let impact;
	try {
		impact = analyzeImpact(graph, args.origin, {
			codePointerOnly: !!args.codePointerOnly,
			baseGradeOverrides: policy?.edge_grade_overrides ?? undefined,
			nonTraversableStates: policy?.non_traversable_states ?? ['propose'],
		});
	} catch (e) {
		console.error(`[chain-driver] impact: ${e.message}`);
		process.exit(3);
	}

	// topological order → cascade 순서
	const topo = topologicalOrder(graph, {
		nonTraversableStates: policy?.non_traversable_states ?? ['propose'],
	});
	const affectedIds = impact.merged.map((e) => e.id);
	const ordered = cascadeOrder(affectedIds, topo.order);

	// 정책 평가 (evaluate_policy deliverable)
	const nodeById = new Map((graph.nodes ?? []).map((n) => [n.id, n]));
	const originNode = nodeById.get(args.origin);
	const records = policy
		? evaluatePolicyForEdges({
				affected: impact.merged,
				originNode,
				nodeById,
				policy,
				evaluatePolicy,
				changeKind,
			})
		: [];

	// JSONL 기록 (operation.md 결정 5 — auto-propose JSONL). dry_run 여부와 무관하게 기록은 함.
	if (args.outJsonl && records.length > 0) {
		for (const rec of records) {
			appendProposeRecord(args.outJsonl, { ...rec, origin: args.origin });
		}
	}

	const result = {
		origin: args.origin,
		change_kind: changeKind,
		by_grade: impact.by_grade,
		cascade_order: ordered,
		has_cycle: topo.has_cycle,
		policy_loaded: !!policy,
		auto_cascade: policy?.auto_cascade ?? { enabled: false, dry_run: true },
		records,
		stats: impact.stats,
	};

	if (args.json) {
		process.stdout.write(JSON.stringify(result, null, 2) + '\n');
	} else {
		process.stdout.write(
			`[chain-driver impact] origin=${args.origin} change=${changeKind}\n`,
		);
		process.stdout.write(`  MUST: ${impact.by_grade.MUST.join(', ') || '-'}\n`);
		process.stdout.write(
			`  SHOULD: ${impact.by_grade.SHOULD.join(', ') || '-'}\n`,
		);
		process.stdout.write(`  FYI: ${impact.by_grade.FYI.join(', ') || '-'}\n`);
		if (topo.has_cycle)
			process.stdout.write(
				`  ⚠️ cycle detected — 자동 cascade 차단 (graph-integrity #15 fail)\n`,
			);
		for (const rec of records) {
			process.stdout.write(
				`  [${rec.decision}] ${rec.affected_id} (${rec.grade}/${rec.direction}) — ${rec.reasoning}\n`,
			);
		}
		if (args.outJsonl && records.length > 0) {
			process.stdout.write(
				`  written ${records.length} propose record(s) → ${args.outJsonl}\n`,
			);
		}
	}
	process.exit(0);
}

// chain-driver sync-loop — living-sync Phase 1 MVP (DEC-2026-06-07-living-sync-operating-model §5 Phase 1).
//   변경된 origin(--origin id... 또는 --changed path...) → forward 단방향 영향 closure → 순서화된 재생성
//   worklist 를 state.json `regen_queue` 에 durable 기록(결정론 / 비-gating). 재생성(LLM)·NL 라우터·역동기화 = 후속 phase.
//   drift 는 파생값 → 그래프 영속 ❌ (--mark = in-memory display-only escape hatch). has_cycle 시 durable write 거부.
function cmdSyncLoop(args) {
	if (!args.graphPath) {
		console.error('[chain-driver] sync-loop: --graph <path> required');
		process.exit(3);
	}
	if (!existsSync(args.graphPath)) {
		console.error(`[chain-driver] sync-loop: graph not found: ${args.graphPath}`);
		process.exit(3);
	}
	const origins = args.origins ?? (args.origin ? [args.origin] : []);
	const changedPaths = args.changedPaths ?? [];
	if (origins.length === 0 && changedPaths.length === 0) {
		console.error(
			'[chain-driver] sync-loop: --origin <id>... 또는 --changed <path>... 중 하나 필수',
		);
		process.exit(3);
	}
	let graph;
	try {
		graph = JSON.parse(readFileSync(args.graphPath, 'utf-8'));
	} catch (e) {
		console.error(`[chain-driver] sync-loop: graph parse error: ${e.message}`);
		process.exit(3);
	}

	let result;
	try {
		result = computeSyncLoop(graph, { origins, changedPaths });
	} catch (e) {
		console.error(`[chain-driver] sync-loop: ${e.message}`);
		process.exit(3);
	}

	if (result.origins.length === 0) {
		console.error(
			`[chain-driver] sync-loop: 해소된 origin 0건 (unresolved: ${result.unresolved.join(', ') || '-'})`,
		);
		process.exit(3);
	}

	// --mark (기본 off): in-memory display-only — origin+closure 노드를 drift 로 표시(영속 ❌).
	let marked = null;
	if (args.mark) {
		const ids = [
			...result.origins,
			...result.closure.MUST,
			...result.closure.SHOULD,
			...result.closure.FYI,
		];
		marked = markTransientDrift(graph, ids).applied;
	}

	const regenQueue = {
		generated_at: new Date().toISOString(),
		origins: result.origins,
		graph_path: args.graphPath,
		has_cycle: result.has_cycle,
		items: result.items,
	};

	// durable write = state.json regen_queue (drift 자체는 비영속 / §2.3). has_cycle 시 거부.
	let written = false;
	const root = args.project ? resolve(args.project) : null;
	if (root && !args.dryRun && !result.has_cycle) {
		const existing = readState(root);
		if (!existing) {
			console.error(
				`[chain-driver] sync-loop: state.json 부재 (${root}) — init 먼저 / regen_queue 미기록`,
			);
		} else if (isQueueInProgress(existing.regen_queue) && !args.force) {
			// D7 clobber 가드 — in-flight done 보호 (sync-next 진행 중 덮어쓰기 거부).
			console.error(
				`[chain-driver] sync-loop: regen_queue 진행 중 (in-flight done 존재) — 덮어쓰기 거부. ` +
					`소비 완료 후 재실행하거나 --force 로 강제 교체.`,
			);
			process.exit(2);
		} else {
			try {
				writeStateCAS(root, (s) => {
					s.regen_queue = regenQueue;
					return s;
				});
				written = true;
			} catch (e) {
				console.error(`[chain-driver] sync-loop: state write 실패: ${e.message}`);
			}
		}
	}

	const out = {
		origins: result.origins,
		unresolved: result.unresolved,
		closure: result.closure,
		has_cycle: result.has_cycle,
		regen_queue: regenQueue,
		written,
		...(marked !== null ? { marked_drift: marked } : {}),
	};

	if (args.json) {
		process.stdout.write(JSON.stringify(out, null, 2) + '\n');
	} else {
		process.stdout.write(
			`[chain-driver sync-loop] origins=${result.origins.join(', ')}\n`,
		);
		process.stdout.write(`  MUST: ${result.closure.MUST.join(', ') || '-'}\n`);
		process.stdout.write(
			`  SHOULD: ${result.closure.SHOULD.join(', ') || '-'}\n`,
		);
		process.stdout.write(`  FYI: ${result.closure.FYI.join(', ') || '-'}\n`);
		process.stdout.write(
			`  regen_queue: ${result.items.length} item(s) [${result.items.map((it) => it.id).join(' → ')}]\n`,
		);
		if (result.has_cycle)
			process.stdout.write(
				`  ⚠️ cycle detected — regen_queue durable write 거부 (graph-integrity #15 동형)\n`,
			);
		else
			process.stdout.write(
				`  ${written ? 'written → .aimd/state.json regen_queue' : '(미기록 — --dry-run / state 부재 / project 미지정)'}\n`,
			);
		if (result.unresolved.length)
			process.stdout.write(
				`  unresolved: ${result.unresolved.join(', ')}\n`,
			);
	}
	process.exit(0);
}

// chain-driver sync-next — living-sync Phase 1c (루프 닫기 / DEC §5 Phase 1c).
//   regen_queue(sync-loop 산출)를 **stage 단위**로 소비: 다음 미완 stage 의 노드를 surface(재생성 지시) →
//   사람/LLM 이 그 stage skill 로 재생성 + validator 실행 → --findings 로 재호출 = 그 stage gate 재실행.
//   gate pass = 그 stage 미완 item 전부 done / stop = regen_queue.blocked 전용 표기·state.blocked 미접촉(cmdNext 회귀 차단).
//   gate 입도 = stage (Senior BLOCKER #1·MAJOR #2 정정 / evaluateGate=stage 단위). 내용 재생성 = 본 명령 밖(no-simulation §3.4).
function cmdSyncNext(args) {
	if (!args.project) usage(3);
	const root = resolve(args.project);
	recoverTmpFiles(root);
	let state;
	try {
		state = readState(root);
	} catch (e) {
		if (e instanceof StateCorruptError) {
			console.error(`[chain-driver] ${e.message}`);
			process.exit(4);
		}
		throw e;
	}
	if (!state) {
		console.error('[chain-driver] no state.json — run init first');
		process.exit(3);
	}

	const queue = state.regen_queue;
	if (!queue || !(queue.items?.length)) {
		console.error(
			'[chain-driver] sync-next: regen_queue 비어있음 — sync-loop 먼저 실행',
		);
		process.exit(3);
	}
	// #7 has_cycle 방어 (산출 시 이미 write 거부되나 hand-edit 방어).
	if (queue.has_cycle) {
		console.error(
			'[chain-driver] sync-next: regen_queue.has_cycle=true — 소비 거부 (cycle 해소 후 재합성)',
		);
		process.exit(2);
	}

	const status = queueStatus(queue);
	if (status.complete) {
		const out = {
			status: 'complete',
			done: status.done,
			total: status.total,
			fixpoint_guaranteed: false,
		};
		if (args.json) process.stdout.write(JSON.stringify(out, null, 2) + '\n');
		else
			process.stdout.write(
				`[chain-driver sync-next] 큐 완료 (${status.done}/${status.total} done). ` +
					`fixpoint 미보증 — 재생성이 계약을 바꿨으면 sync-loop 재실행.\n`,
			);
		process.exit(0);
	}

	const sel = selectNextStage(queue); // status.complete=false → 미완 존재 → non-null
	let scenario;
	try {
		scenario = state.current_scope
			? readManifest(root, state.current_scope)?.scenario
			: undefined;
	} catch {
		scenario = undefined;
	}

	// findings 미제출 = 재생성 지시 surface (gate 평가 ❌ / exit 0). 재생성 후 --findings 로 재호출.
	if (!args.findingsPath) {
		const reqv = requiredValidators(sel.stage) || [];
		const out = {
			action: 'regenerate',
			stage: sel.stage,
			nodes: sel.item_ids,
			grades: sel.grades,
			required_validators: reqv,
			progress: { done: status.done, total: status.total },
		};
		if (args.json) process.stdout.write(JSON.stringify(out, null, 2) + '\n');
		else {
			process.stdout.write(
				`[chain-driver sync-next] 재생성 대상 stage: ${sel.stage} (${status.done}/${status.total} done)\n`,
			);
			process.stdout.write(`  노드: ${sel.item_ids.join(', ')}\n`);
			process.stdout.write(
				`  필요 validator: ${(reqv.length ? reqv : ['(없음)']).join(', ')}\n`,
			);
			process.stdout.write(
				`  → 재생성 후 그 결과 validator 산출을 --findings <path> 로 재호출하면 gate 재실행·done 표시.\n`,
			);
		}
		process.exit(0);
	}

	// findings 제출 = stage gate 재실행.
	const findings = loadFindings(args.findingsPath);
	const gateResult = evaluateGate(sel.stage, findings, scenario);
	const finalDecision = applyUserDecision(gateResult, args.userDecision);

	if (args.dryRun) {
		process.stdout.write(
			JSON.stringify(
				{
					stage: sel.stage,
					nodes: sel.item_ids,
					gate: finalDecision,
					dry_run: true,
				},
				null,
				2,
			) + '\n',
		);
		process.exit(finalDecision.blocked ? 1 : 0);
	}

	const nowIso = new Date().toISOString();

	if (finalDecision.blocked) {
		// #3·#5 큐-전용 block — state.blocked 미접촉 (cmdNext 회귀 차단).
		writeStateCAS(root, (s) => {
			if (s.regen_queue)
				s.regen_queue.blocked = {
					stage: sel.stage,
					reason: finalDecision.primary_reason || 'validator',
					blocked_at: nowIso,
				};
			return s;
		});
		logIntervention(state, root, {
			event_type: 'sync_next_gate',
			actor: args.userDecision ? 'user' : 'driver',
			stage: sel.stage,
			decision: 'block',
			exit_code: 1,
			message: finalDecision.reasons.map((r) => r.detail).join('; '),
		});
		console.error(
			`[chain-driver] sync-next: stage ${sel.stage} gate blocked: ${finalDecision.primary_reason}. ` +
				`(regen_queue.blocked 표기 / state.blocked 미접촉)`,
		);
		process.exit(1);
	}

	// pass → 그 stage 미완 item 전부 done. state.blocked·current_chain·last_gate 미접촉.
	let after;
	const newState = writeStateCAS(root, (s) => {
		if (s.regen_queue) {
			markStageDone(s.regen_queue, sel.stage);
			delete s.regen_queue.blocked;
			after = queueStatus(s.regen_queue);
			if (after.complete) {
				s.regen_queue.status = 'complete';
				s.regen_queue.completed_at = nowIso;
			} else {
				s.regen_queue.status = 'in_progress';
			}
		}
		return s;
	});
	after = after || queueStatus(newState.regen_queue);

	logIntervention(state, root, {
		event_type: 'sync_next_gate',
		actor: args.userDecision ? 'user' : 'driver',
		stage: sel.stage,
		decision: finalDecision.decision,
		exit_code: 0,
		message: `stage ${sel.stage} done (${sel.item_ids.join(',')}) — ${after.done}/${after.total}`,
	});

	const out = {
		stage: sel.stage,
		marked_done: sel.item_ids,
		decision: finalDecision.decision,
		progress: { done: after.done, total: after.total, complete: after.complete },
		...(after.complete ? { fixpoint_guaranteed: false } : {}),
	};
	if (args.json) process.stdout.write(JSON.stringify(out, null, 2) + '\n');
	else {
		process.stdout.write(
			`[chain-driver sync-next] stage ${sel.stage} gate ${finalDecision.decision} → done: ${sel.item_ids.join(', ')} (${after.done}/${after.total})\n`,
		);
		if (after.complete)
			process.stdout.write(
				`  큐 완료. fixpoint 미보증 — 재생성이 계약을 바꿨으면 sync-loop 재실행.\n`,
			);
	}
	process.exit(0);
}

// chain-driver resync-graph — Loop A / A-lazy-cmd (DEC-2026-06-03-living-graph-a1-surface 후속 / 의도② lazy 재계산).
//   B-minimal STALE 배너의 nudge → 한 명령 재합성 action (8-flag traceability-matrix-builder → resync-graph).
//   convention 입력-탐색(.aimd/output 또는 그래프 위치 dir 의 well-known chain 6 + analysis/aspect scan) →
//   traceability-matrix-builder --graph 위임 (전체 재합성 / --previous-graph propose·deprecated carry-over). caller cwd 만 write.
//   verdict-free / 비-gating / per-write 자동 ❌ (Senior REJECT — quadratic·fixture) : 사람이 STALE 보고 1 명령 실행.
const RESYNC_CHAIN_FILES = Object.freeze([
	['--discovery', 'discovery-spec.json'],
	['--behavior', 'behavior-spec.json'],
	['--acceptance', 'acceptance-criteria.json'],
	['--task-plan', 'task-plan.json'],
	['--test-spec', 'test-spec.json'],
	['--impl-spec', 'impl-spec.json'],
]);

function cmdResyncGraph(args) {
	const projectRoot = args.project ? resolve(args.project) : process.cwd();

	// 1) outputDir 결정 — 기존 artifact-graph.json 위치 우선 (없으면 convention 기본). --out-dir 명시 시 강제.
	let outputDir;
	if (args.outDir) {
		outputDir = resolve(args.outDir);
	} else {
		const candidates = [];
		if (args.scope) candidates.push(join(projectRoot, '.aimd', args.scope));
		candidates.push(join(projectRoot, '.aimd', 'output'));
		candidates.push(join(projectRoot, '.aimd'));
		outputDir =
			candidates.find((d) => existsSync(join(d, 'artifact-graph.json'))) ||
			(args.scope
				? join(projectRoot, '.aimd', args.scope)
				: join(projectRoot, '.aimd', 'output'));
	}

	// 2) chain 입력 convention 스캔 (존재하는 것만 builder flag 로).
	const builderArgs = [];
	const found = [];
	for (const [flag, fname] of RESYNC_CHAIN_FILES) {
		if (existsSync(join(outputDir, fname))) {
			builderArgs.push(flag, join(outputDir, fname));
			found.push(flag.slice(2));
		}
	}
	// matrix-builder hard-require: behavior + acceptance (없으면 그래프 없음 = 정직 거부 / DEC-2026-06-03 §1.1).
	const missing = ['behavior-spec.json', 'acceptance-criteria.json'].filter(
		(f) => !existsSync(join(outputDir, f)),
	);
	if (missing.length > 0) {
		console.error(
			`[chain-driver resync-graph] 재합성 불가 — ${outputDir} 에 ${missing.join(', ')} 부재.`,
		);
		console.error(
			'  chain spec stage(behavior+acceptance) 미도달 / analysis-only scope 는 의존성 그래프 없음 (DEC-2026-06-03 §1.1: migration-start = 엣지 0).',
		);
		process.exit(3);
	}

	const prevGraph = join(outputDir, 'artifact-graph.json');
	const hasPrev = existsSync(prevGraph);
	builderArgs.push(
		'--analysis-dir',
		outputDir,
		'--aspect-dir',
		outputDir,
		'--out-dir',
		outputDir,
		'--graph',
	);
	if (hasPrev) builderArgs.push('--previous-graph', prevGraph);
	if (args.scope) builderArgs.push('--scope-id', args.scope);
	builderArgs.push(
		'--repo-root',
		args.repoRoot ? resolve(args.repoRoot) : projectRoot,
	);

	// watch-item #1 — 입력 coverage 명시 (silent under-synth 방지 / 날조 ❌).
	const coverageLine =
		`${found.length}/6 stage 입력 (${found.join(', ') || '없음'}) + analysis/aspect scan @ ${outputDir}` +
		(hasPrev ? ' / --previous-graph carry-over' : ' / 신규(carry-over 없음)');

	if (args.dryRun) {
		process.stdout.write(
			`[chain-driver resync-graph] (dry-run) 재합성 예정: ${coverageLine}\n`,
		);
		process.stdout.write(
			`  → node <traceability-matrix-builder/src/cli.js> ${builderArgs.join(' ')}\n`,
		);
		process.exit(0);
	}

	// 3) traceability-matrix-builder --graph 위임 (cross-package import 회피 — plugin tools 상대경로 / methodology 컨벤션).
	const here = dirname(fileURLToPath(import.meta.url));
	const matrixCli = join(
		here,
		'..',
		'..',
		'traceability-matrix-builder',
		'src',
		'cli.js',
	);
	if (!existsSync(matrixCli)) {
		console.error(
			`[chain-driver resync-graph] traceability-matrix-builder CLI 미발견: ${matrixCli}`,
		);
		process.exit(3);
	}
	process.stderr.write(`[chain-driver resync-graph] 재합성: ${coverageLine}\n`);
	try {
		const out = execFileSync('node', [matrixCli, ...builderArgs], {
			cwd: projectRoot,
			encoding: 'utf-8',
			stdio: ['ignore', 'pipe', 'pipe'],
			timeout: 60000,
			windowsHide: true,
		});
		process.stdout.write(out);
		process.exit(0);
	} catch (e) {
		// matrix-builder exit 1 = coverage red/forward<threshold. 그래프는 write 완료(cli.js:173 write → :180 exit).
		//   resync 자체는 성공 → 비-fatal. exit 2(usage)·기타 = 실패 전달.
		if (e.stdout) process.stdout.write(e.stdout);
		if (e.stderr) process.stderr.write(e.stderr);
		if (e.status === 1) {
			process.stderr.write(
				'[chain-driver resync-graph] 그래프 재합성 완료 (matrix coverage red/threshold = 별도 사안 / 그래프는 갱신됨).\n',
			);
			process.exit(0);
		}
		console.error(
			`[chain-driver resync-graph] matrix-builder 실패 (exit ${e.status ?? '?'}).`,
		);
		process.exit(e.status ?? 1);
	}
}

function main() {
	const args = parseArgs(process.argv);
	switch (args.command) {
		case 'init':
			return cmdInit(args);
		case 'state':
			return cmdState(args);
		case 'next':
			return cmdNext(args);
		case 'query':
			return cmdQuery(args);
		case 'sync':
			return cmdSync(args);
		case 'impact':
			return cmdImpact(args);
		case 'navigate':
			return cmdNavigate(args);
		case 'trace-view':
			return cmdTraceView(args);
		case 'resync-graph':
			return cmdResyncGraph(args);
		case 'sync-loop':
			return cmdSyncLoop(args);
		case 'sync-next':
			return cmdSyncNext(args);
		case 'suggest-skill':
			return cmdSuggestSkill(args);
		case 'hooks-bridge':
			return cmdHooksBridge(args);
		case 'migrate':
			return cmdMigrate(args);
		case 'revisit-detect':
			return cmdRevisitDetect(args);
		case '--help':
		case '-h':
			return usage(0);
		default:
			return usage(3);
	}
}

main();
