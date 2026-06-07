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
import { markDrift, cascade, registerCanonicalSources, diffBusinessRulesByRule, listUnbaselinedScopes } from './sync.js';

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
	resolveOriginNodeIds,
	resolveChangedRuleOrigins,
	markTransientDrift,
	selectNextStage,
	markStageDone,
	queueStatus,
	recordCompleted,
	convergenceDecision,
	nonConvergingFinding,
} from './sync-loop.js';
import { resolveDiscoveryOrigins } from './route-discovery.js';
import {
	liftCandidates,
	validateCeiling,
	reconcileObserved,
	relocationSourceHint,
	ceilingOptionsForAnchor,
} from './lift-anchor.js';
import {
	makeGitRunner,
	detectContentDrift,
	findRelocation,
} from '../../_shared/code-pointer-git.js';
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
			'  sync <project> [--scope <slug>] [--register]   (no scope=빈 scope auto-baseline+markDrift / --scope=cascade / --scope --register=canonical sync_sources 등록[living-sync Phase 3a])',
			'  impact --graph <artifact-graph.json> --origin <node-id> [--change-kind <kind>] [--policy <path>] [--out-jsonl <path>] [--code-pointer-only] [--json]',
			'  navigate --graph <artifact-graph.json> --origin <node-id> [--with-spec] [--json]   (dep-graph-navigator backend)',
			'  navigate --graph <artifact-graph.json> --prompt "<자연어>" [--with-spec] [--json]   (의도③ NL 라우팅 — id/title 결정론 해소)',
			'  navigate --graph <artifact-graph.json> --origin <id> --what-if "remove-node:ID|add-edge:SRC>TGT[:type]" [--json]   (의도③ 가설 변경 영향 / 비파괴)',
			'  navigate --graph <artifact-graph.json> --stage <discovery|spec|plan|test|implement> [--scope <id>] [--json]   (F3 stage/scope 일괄 의존성 rollup)',
			'  trace-view --graph <artifact-graph.json> [--scope <id>] [--no-matrix] [--json]   (사람 gate-검토용 추적성 맵 + coverage 매트릭스 / stdout)',
			'  resync-graph [<project>] [--scope <slug>] [--out-dir <dir>] [--repo-root <dir>] [--dry-run]   (Loop A lazy 재합성 — STALE 배너 nudge → 1 명령)',
		'  sync-loop <project> --graph <artifact-graph.json> (--origin <id>... | --changed <path>...) [--mark] [--force] [--dry-run] [--json]   (living-sync Phase 1 — forward 영향 closure → regen_queue worklist)',
			'  sync-next <project> [--findings <path>] [--user-decision <go|stop>] [--dry-run] [--json]   (living-sync Phase 1c — regen_queue 를 stage 단위로 소비 / findings 없으면 재생성 지시 surface)',
			'  sync-converge <project> --graph <artifact-graph.json> --git <baseline-ref> [--cap <n>] [--reset] [--json]   (living-sync carry 2 — 큐 소비 완료 후 고정 baseline 재검출 → cumulative_done dedup → 수렴 판정[fixpoint/continue/non_converging/needs_resynth])',
			'  route [<project>] --discovery-spec <path> --graph <artifact-graph.json> [--analysis <business-rules.json>] [--force] [--dry-run] [--json]   (living-sync Phase 1b — discovery-spec 명시 매핑 → 진입 origins → regen_queue / net-new propose 보고)',
			'  lift [<project>] --changed <codefile>... --graph <artifact-graph.json> [--ceiling <node-id>] [--reconcile [--base <sha>] [--repo-root <dir>]] [--force] [--dry-run] [--json]   (living-sync Phase 2 — 손수정 코드 anchor → backward 천장 후보 surface / --ceiling 명시 시 forward 재전파 → regen_queue / --reconcile = anchor 관측사실 git 신선도 propose / reverse 유일 예외)',
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
		else if (a === '--discovery-spec') out.discoverySpecPath = rest[++i];
		else if (a === '--analysis') out.analysisPath = rest[++i];
		else if (a === '--ceiling') out.ceiling = rest[++i];
		else if (a === '--reconcile') out.reconcile = true;
		else if (a === '--register') out.register = true;
		else if (a === '--bc') (out.bc ||= []).push(rest[++i]);
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
		else if (a === '--br-diff') out.brDiffRef = rest[++i];
		else if (a === '--git') out.gitRef = rest[++i];
		else if (a === '--br-path') out.brPath = rest[++i];
		else if (a === '--reset') out.reset = true; // sync-converge: 세션 초기화
		else if (a === '--cap') out.cap = Number(rest[++i]); // sync-converge: iteration 상한 (기본 10)
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

	// --scope <slug> --register — 명시 (재)등록 (living-sync Phase 3a / baseline 체크포인트).
	if (args.scope && args.register) {
		try {
			const result = registerCanonicalSources(root, args.scope, { bcs: args.bc || [] });
			process.stdout.write(
				JSON.stringify({ scope: args.scope, ...result }, null, 2) + '\n',
			);
			process.exit(0);
		} catch (e) {
			console.error(`[chain-driver] sync --register failed: ${e.message}`);
			process.exit(3);
		}
	}

	if (!args.scope) {
		// no scope → ① 빈 sync_sources scope first-touch 자동 baseline (Phase 3a / DEC §13) → ② markDrift summary.
		//   기계 활성화: 등록 없으면 markDrift 가 영원히 dead-fed. cmdSync(명시 실행)가 등재 트리거.
		//   markDrift 코어는 순수 유지 (SessionStart hook 무영향 — 본 auto-register 는 cmdSync glue 한정).
		const auto_registered = [];
		for (const scope of listScopes(root)) {
			const m = readManifest(root, scope);
			const sources = m?.sync_state?.sync_sources;
			// empty-or-absent 둘 다 first-touch (Senior BLOCKER-1 (B) — absent 도 dead-fed 동일 병 / SessionStart 표면화 집합과 정렬).
			if (m && (!Array.isArray(sources) || sources.length === 0)) {
				const r = registerCanonicalSources(root, scope);
				if (r.registered.length > 0)
					auto_registered.push({ scope, registered: r.registered.length });
			}
		}
		const summary = markDrift(root);
		process.stdout.write(
			JSON.stringify({ auto_registered, ...summary }, null, 2) + '\n',
		);
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
		// living-sync ② honest surface (read-only) — 미-baseline scope 는 markDrift 가 조용히 "건강"으로 오인.
		//   별도 pure helper(second scan / SessionStart 비-perf-critical·scope 소수·동기 무-concurrent-write = TOCTOU 무의미 = 수용).
		let unbaselined = [];
		try {
			unbaselined = listUnbaselinedScopes(root);
		} catch {
			/* non-fatal */
		}
		// 메시지 조립: drift + unbaselined 별도 line. ★ unbaselined>0 면 "ready" 주장 금지(거짓 건강 제거).
		const parts = [];
		if (driftSummary.marked.length > 0)
			parts.push(
				`⚠️ drift detected in ${driftSummary.marked.length} scope(s): ${driftSummary.marked.join(', ')}. Run: chain-driver sync --scope <slug> to cascade.`,
			);
		if (unbaselined.length > 0)
			parts.push(
				`⚠️ ${unbaselined.length} scope(s) unbaselined (sync_sources 비어 markDrift 가 건강으로 오인 — drift 미감지 사각): ${unbaselined.slice(0, 5).join(', ')}${unbaselined.length > 5 ? ' …' : ''}. Run: chain-driver sync to establish baseline.`,
			);
		let additionalContext = parts.length
			? `[ai-native-methodology] ${parts.join(' ')}`
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
		// minor-2 — additionalContext 와 stderr 조건 정합 (부분 false-health 재발 차단).
		if (unbaselined.length > 0) {
			process.stderr.write(
				`[ai-native-methodology] ⚠️ ${unbaselined.length} scope(s) unbaselined (drift 미감지 사각): ${unbaselined.slice(0, 5).join(', ')}${unbaselined.length > 5 ? ' …' : ''}\n`,
			);
			process.stderr.write(`  → chain-driver sync (baseline 등록)\n`);
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
// living-sync carry 1/1b — business-rules.json per-rule diff → per-BR origin (공유 / --br-diff·--git).
//   new = working-tree fs (MAJOR-2 불변식 / git blob ❌). deleted brAbs = newParsed={} (all removed / minor-3).
//   discriminated result (process.exit ❌ = 테스트가능 / cmdSyncLoop 가 exit·in-sync 담당 / minor-5).
function brDiffOrigins({ git, ref, brAbs, brRelPosix, graph }) {
	let oldParsed = {};
	try {
		oldParsed = JSON.parse(git(['show', `${ref}:${brRelPosix}`]));
	} catch {
		oldParsed = {}; // valid ref 에 path 부재 = 신규 파일 → 전 rule added
	}
	let newParsed = {};
	if (existsSync(brAbs)) {
		try {
			newParsed = JSON.parse(readFileSync(brAbs, 'utf-8'));
		} catch (e) {
			return { ok: false, exitCode: 3, msg: `business-rules.json parse error: ${e.message}` };
		}
	} // 부재 = deleted → newParsed={} = all removed (minor-3)
	const { changed_rule_ids, removed_rule_ids } = diffBusinessRulesByRule(oldParsed, newParsed);
	const ruleOrigins = resolveChangedRuleOrigins(graph, changed_rule_ids);
	return {
		ok: true,
		origins: ruleOrigins.origins,
		report: {
			ref,
			changed_rule_ids,
			removed_rule_ids,
			seeded_origins: ruleOrigins.origins,
			coarse_fallback: ruleOrigins.coarse_fallback,
			unresolved: ruleOrigins.unresolved,
		},
	};
}
function reportBrDiff(r) {
	process.stdout.write(
		`[br-diff] ref=${r.ref} changed=${r.changed_rule_ids.length} removed=${r.removed_rule_ids.length} → seeded=${r.seeded_origins.length}` +
			(r.coarse_fallback.length ? ` ⚠️ coarse_fallback(BC-less)=${r.coarse_fallback.join(',')}` : '') +
			(r.removed_rule_ids.length ? ` ⚠️ removed(소비자 stale 가능)=${r.removed_rule_ids.join(',')}` : '') +
			(r.unresolved.length ? ` ⚠️ unresolved(BR 그래프 부재)=${r.unresolved.join(',')}` : '') +
			'\n',
	);
}

function cmdSyncLoop(args) {
	if (!args.graphPath) {
		console.error('[chain-driver] sync-loop: --graph <path> required');
		process.exit(3);
	}
	if (!existsSync(args.graphPath)) {
		console.error(`[chain-driver] sync-loop: graph not found: ${args.graphPath}`);
		process.exit(3);
	}
	let origins = args.origins ?? (args.origin ? [args.origin] : []);
	const changedPaths = args.changedPaths ?? [];
	if (origins.length === 0 && changedPaths.length === 0 && !args.brDiffRef && !args.gitRef) {
		console.error(
			'[chain-driver] sync-loop: --origin <id>... / --changed <path>... / --br-diff <ref> 중 하나 필수',
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

	// living-sync carry 1 — --br-diff <ref>: business-rules.json per-rule git diff → per-BR origin seed.
	let brDiffReport = null;
	let gitDiffReport = null;
	if (args.brDiffRef) {
		if (args.gitRef) {
			console.error('[chain-driver] sync-loop: --br-diff 와 --git 동시 사용 불가 (대체 진입 모드 / 하나만 / MAJOR-1).');
			process.exit(3);
		}
		const root = args.project ? resolve(args.project) : process.cwd();
		const brRel = args.brPath || join('.aimd', 'output', 'business-rules.json');
		const brAbs = isAbsolute(brRel) ? brRel : join(root, brRel);
		if (!existsSync(brAbs)) {
			console.error(`[chain-driver] sync-loop --br-diff: business-rules.json 부재: ${brAbs}`);
			process.exit(3);
		}
		const git = makeGitRunner(root);
		try {
			git(['rev-parse', '--verify', `${args.brDiffRef}^{commit}`]);
		} catch {
			console.error(`[chain-driver] sync-loop --br-diff: invalid git ref / not a repo: ${args.brDiffRef} (미실행 — 날조 ❌)`);
			process.exit(3);
		}
		const brRelPosix = brRel.split('\\').join('/');
		const res = brDiffOrigins({ git, ref: args.brDiffRef, brAbs, brRelPosix, graph });
		if (!res.ok) {
			console.error(`[chain-driver] sync-loop --br-diff: ${res.msg}`);
			process.exit(res.exitCode);
		}
		brDiffReport = res.report;
		origins = [...new Set([...origins, ...res.origins])].sort();
		reportBrDiff(res.report);
		if (origins.length === 0 && changedPaths.length === 0) {
			process.stdout.write('[br-diff] 변경 rule 0 — in-sync (regen_queue 미기록)\n');
			if (args.json) process.stdout.write(JSON.stringify({ br_diff: brDiffReport, in_sync: true }, null, 2) + '\n');
			process.exit(0);
		}
	}

	// living-sync carry 1b — --git <ref>: ref↔worktree 전 산출물 변경 자동 감지 → origins (BR=per-rule 위임 / 기타=coarse).
	if (args.gitRef) {
		const root = args.project ? resolve(args.project) : process.cwd();
		const git = makeGitRunner(root);
		try {
			git(['rev-parse', '--verify', `${args.gitRef}^{commit}`]);
		} catch {
			console.error(`[chain-driver] sync-loop --git: invalid git ref / not a repo: ${args.gitRef} (미실행 — 날조 ❌)`);
			process.exit(3);
		}
		const diff = gitDiffNumstat(root, args.gitRef, null); // ref↔worktree (carry 1b)
		if (!diff.ok) {
			console.error(`[chain-driver] sync-loop --git: git diff 실패: ${diff.error}`);
			process.exit(3);
		}
		const brRel = args.brPath || join('.aimd', 'output', 'business-rules.json');
		const brRelPosix = brRel.split('\\').join('/');
		const changed = diff.files.map((f) => f.path.split('\\').join('/'));
		const brChanged = changed.includes(brRelPosix); // BLOCKER-1: 정규화 키로 partition
		const nonBr = changed.filter((q) => q !== brRelPosix);
		let brOrigins = [];
		if (brChanged) {
			const brAbs = isAbsolute(brRel) ? brRel : join(root, brRel);
			const res = brDiffOrigins({ git, ref: args.gitRef, brAbs, brRelPosix, graph });
			if (!res.ok) {
				console.error(`[chain-driver] sync-loop --git: ${res.msg}`);
				process.exit(res.exitCode);
			}
			brOrigins = res.origins;
			reportBrDiff(res.report);
			gitDiffReport = { br_diff: res.report };
		}
		const pathOrigins = resolveOriginNodeIds(graph, nonBr);
		origins = [...new Set([...origins, ...brOrigins, ...pathOrigins.ids])].sort();
		gitDiffReport = {
			...(gitDiffReport || {}),
			ref: args.gitRef,
			changed_files: changed.length,
			non_br_origins: pathOrigins.ids,
			unresolved_paths: pathOrigins.unresolved,
		};
		process.stdout.write(
			`[git] ref=${args.gitRef} (ref↔worktree) changed_files=${changed.length} → origins(non-BR)=${pathOrigins.ids.length}` +
				(pathOrigins.unresolved.length ? ` ⚠️ unresolved_paths=${pathOrigins.unresolved.length}` : '') +
				' (untracked 파일은 git diff 제외 — 신규 미-add 산출물 미감지 / minor-2)\n',
		);
		if (origins.length === 0 && changedPaths.length === 0) {
			process.stdout.write('[git] 영향 origin 0 — in-sync (regen_queue 미기록)\n');
			if (args.json) process.stdout.write(JSON.stringify({ git_diff: gitDiffReport, in_sync: true }, null, 2) + '\n');
			process.exit(0);
		}
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
		...(brDiffReport ? { br_diff: brDiffReport } : {}),
		...(gitDiffReport ? { git_diff: gitDiffReport } : {}),
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
					delete s.sync_session; // M1 — fresh origin 배치 = 새 수렴 세션 (이전 cumulative_done 무효).
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
					`fixpoint 판정 → sync-converge --git <baseline> 실행 (수렴 원장 / carry 2).\n`,
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
	//   carry 2 — 처리한 노드를 sync_session.cumulative_done 에 누적 (수렴 dedup 기준 / §33 단조).
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
			// 세션 누적 (세션은 sync-converge 가 baseline 확정 / 여기선 done 노드만 적재).
			s.sync_session = recordCompleted(s.sync_session, sel.item_ids);
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
				`  큐 완료. fixpoint 판정 → sync-converge --git <baseline> 실행 (수렴 원장 / carry 2).\n`,
			);
	}
	process.exit(0);
}

// chain-driver sync-converge — living-sync carry 2 (fixpoint 자동 재진입 / 수렴 원장 / DEC §23 carry2).
//   sync-next 가 큐를 소비 완료한 뒤, 고정 baseline 대비 재검출(--git = carry 1b 재사용) → cumulative_done dedup →
//     수렴 결정(convergenceDecision 순수 코어). newWork=∅ AND graph fresh AND unresolved=∅ → fixpoint.
//   ★ 도구는 수렴-제어 half 만 결정론 소유 — 재생성(LLM)·그래프 재합성(외부 flow)은 반복 사이 (no-simulation §3.4).
//   ★ BLOCKER-1(Senior@0.80): 재합성 부재 상태의 fixpoint 선언 = 거짓 건강 → needs_resynth / unverified_fixpoint 강등.
function cmdSyncConverge(args) {
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
		console.error('[chain-driver] sync-converge: no state.json — run init first');
		process.exit(3);
	}

	// --reset: 세션 초기화 (다른 baseline 진입 시 안내대로).
	if (args.reset) {
		writeStateCAS(root, (s) => {
			delete s.sync_session;
			return s;
		});
		process.stdout.write('[chain-driver sync-converge] sync_session reset.\n');
		process.exit(0);
	}

	if (!args.graphPath) {
		console.error('[chain-driver] sync-converge: --graph <path> required');
		process.exit(3);
	}
	if (!existsSync(args.graphPath)) {
		console.error(`[chain-driver] sync-converge: graph not found: ${args.graphPath}`);
		process.exit(3);
	}
	if (!args.gitRef) {
		console.error('[chain-driver] sync-converge: --git <baseline-ref> required (재검출 baseline)');
		process.exit(3);
	}

	// 전제: 큐가 소비 완료(complete) 상태여야 판정. 미완 = sync-next 먼저 / 부재 = sync-loop 먼저.
	const queue = state.regen_queue;
	const qstat = queueStatus(queue);
	if (!queue || !(queue.items?.length)) {
		console.error('[chain-driver] sync-converge: regen_queue 부재 — sync-loop 먼저 실행');
		process.exit(3);
	}
	if (!qstat.complete) {
		console.error(
			`[chain-driver] sync-converge: regen_queue 미완 (${qstat.done}/${qstat.total}) — sync-next 로 소비 완료 후 재판정`,
		);
		process.exit(3);
	}

	// 세션 baseline 확정/검증 (M1: baseline 최초 1회 / 불일치 = exit3 --reset).
	const session = state.sync_session || { cumulative_done: [], iteration: 1 };
	if (session.baseline_ref && session.baseline_ref !== args.gitRef) {
		console.error(
			`[chain-driver] sync-converge: 세션 baseline(${session.baseline_ref}) ≠ --git(${args.gitRef}). ` +
				`다른 변경 배치면 --reset 후 재시작.`,
		);
		process.exit(3);
	}
	const cap = Number.isFinite(args.cap) && args.cap > 0 ? args.cap : (session.cap ?? 10);
	const iteration = session.iteration ?? 1;
	const cumulativeDone = session.cumulative_done ?? [];

	let graph;
	try {
		graph = JSON.parse(readFileSync(args.graphPath, 'utf-8'));
	} catch (e) {
		console.error(`[chain-driver] sync-converge: graph parse error: ${e.message}`);
		process.exit(3);
	}

	// 재검출 = carry 1b --git 메커니즘 재사용 (ref↔worktree diff → BR per-rule + 비-BR coarse origins).
	const git = makeGitRunner(root);
	try {
		git(['rev-parse', '--verify', `${args.gitRef}^{commit}`]);
	} catch {
		console.error(`[chain-driver] sync-converge --git: invalid git ref / not a repo: ${args.gitRef} (미실행 — 날조 ❌)`);
		process.exit(3);
	}
	const diff = gitDiffNumstat(root, args.gitRef, null);
	if (!diff.ok) {
		console.error(`[chain-driver] sync-converge --git: git diff 실패: ${diff.error}`);
		process.exit(3);
	}
	const brRel = args.brPath || join('.aimd', 'output', 'business-rules.json');
	const brRelPosix = brRel.split('\\').join('/');
	const changed = diff.files.map((f) => f.path.split('\\').join('/'));
	const brChanged = changed.includes(brRelPosix);
	const nonBr = changed.filter((q) => q !== brRelPosix);
	let brOrigins = [];
	if (brChanged) {
		const brAbs = isAbsolute(brRel) ? brRel : join(root, brRel);
		const res = brDiffOrigins({ git, ref: args.gitRef, brAbs, brRelPosix, graph });
		if (!res.ok) {
			console.error(`[chain-driver] sync-converge --git: ${res.msg}`);
			process.exit(res.exitCode);
		}
		brOrigins = res.origins;
	}
	const pathOrigins = resolveOriginNodeIds(graph, nonBr);
	const origins = [...new Set([...brOrigins, ...pathOrigins.ids])].sort();

	// 재검출 영향 노드 (origins ∪ forward closure). origin 0 이어도 변경 자체가 없으면 detectedIds=[].
	let detectedIds = [];
	let computeUnresolved = [];
	if (origins.length > 0) {
		const result = computeSyncLoop(graph, { origins });
		detectedIds = result.items.map((it) => it.id);
		computeUnresolved = result.unresolved;
	}
	// ★ BLOCKER-1 신호: 새 구조 파일(노드 미매핑) = unresolved → fixpoint 거부 근거.
	const unresolvedPaths = [...new Set([...pathOrigins.unresolved, ...computeUnresolved])].sort();

	// ★ BLOCKER-1 freshness 가드. derived_from 부재 = freshness no-op → 보증 불가(unverified).
	const fresh = checkGraphFreshness(graph, { repoRoot: root });
	const freshnessVerifiable =
		Array.isArray(graph?.derived_from) && graph.derived_from.length > 0;

	const decision = convergenceDecision({
		detectedIds,
		unresolvedPaths,
		cumulativeDone,
		iteration,
		cap,
		graphStale: fresh.stale,
		freshnessVerifiable,
	});

	const nowIso = new Date().toISOString();
	const baseSession = {
		baseline_ref: args.gitRef,
		cap,
		iteration,
		cumulative_done: cumulativeDone,
		started_at: session.started_at || nowIso,
	};

	// ── 결정별 처리 ────────────────────────────────────────────────
	if (decision.status === 'continue') {
		// 잔여 newWork 만 새 regen_queue 로 시드 (iteration++). cumulative_done = 보존 (소비 시 sync-next 가 누적).
		const result = computeSyncLoop(graph, { origins });
		const items = result.items
			.filter((it) => decision.newWork.includes(it.id))
			.map((it) => ({ ...it, done: false }));
		const regenQueue = {
			generated_at: nowIso,
			converge_iteration: iteration + 1,
			origins,
			graph_path: args.graphPath,
			has_cycle: result.has_cycle,
			items,
		};
		writeStateCAS(root, (s) => {
			if (!result.has_cycle) s.regen_queue = regenQueue;
			s.sync_session = { ...baseSession, iteration: iteration + 1, status: 'converging' };
			return s;
		});
		const out = {
			status: 'continue',
			iteration: iteration + 1,
			cap,
			new_work: decision.newWork,
			has_cycle: result.has_cycle,
		};
		if (args.json) process.stdout.write(JSON.stringify(out, null, 2) + '\n');
		else
			process.stdout.write(
				`[chain-driver sync-converge] 잔여 drift ${decision.newWork.length}건 → iteration ${iteration + 1} 재시드: ` +
					`${decision.newWork.join(', ')}\n  → sync-next 로 소비 후 sync-converge --git ${args.gitRef} 재판정.\n`,
			);
		process.exit(0);
	}

	if (decision.status === 'non_converging') {
		const finding = nonConvergingFinding(decision);
		writeStateCAS(root, (s) => {
			s.sync_session = { ...baseSession, status: 'non_converging' };
			return s;
		});
		const out = { status: 'non_converging', iteration, cap, finding, new_work: decision.newWork };
		if (args.json) process.stdout.write(JSON.stringify(out, null, 2) + '\n');
		else {
			process.stdout.write(
				`[chain-driver sync-converge] ⚠️ 수렴 실패 — iteration ${iteration} 가 cap(${cap}) 도달, 잔여 ${decision.newWork.length}건.\n`,
			);
			process.stdout.write(`  finding(promote-ready): ${finding.kind} [${finding.severity}] — ${finding.message}\n`);
		}
		process.exit(1);
	}

	if (decision.status === 'needs_resynth') {
		writeStateCAS(root, (s) => {
			s.sync_session = { ...baseSession, status: 'needs_resynth' };
			return s;
		});
		const out = {
			status: 'needs_resynth',
			iteration,
			cap,
			reason: decision.reason,
			stale_sources: fresh.stale_sources,
			unresolved_paths: decision.unresolved,
		};
		if (args.json) process.stdout.write(JSON.stringify(out, null, 2) + '\n');
		else {
			process.stdout.write(
				`[chain-driver sync-converge] fixpoint 미확정 — ${decision.reason}. (★ 거짓 수렴 차단 / BLOCKER-1)\n`,
			);
			if (decision.reason === 'graph_stale')
				process.stdout.write(
					`  그래프 stale (${fresh.stale_sources.length} source): 재합성 필요 → traceability-matrix-builder --graph 후 sync-converge --git ${args.gitRef} 재판정.\n`,
				);
			else
				process.stdout.write(
					`  unresolved_paths ${decision.unresolved.length}건 (노드 미매핑 = 새 구조 산출물): 그래프 재합성 후 재판정.\n`,
				);
		}
		process.exit(2);
	}

	if (decision.status === 'unverified_fixpoint') {
		writeStateCAS(root, (s) => {
			s.sync_session = { ...baseSession, status: 'unverified_fixpoint' };
			return s;
		});
		const out = { status: 'unverified_fixpoint', iteration, cap, note: 'graph.derived_from 부재 → freshness 검증 불가' };
		if (args.json) process.stdout.write(JSON.stringify(out, null, 2) + '\n');
		else
			process.stdout.write(
				`[chain-driver sync-converge] newWork=∅ 이나 graph.derived_from 부재 → freshness 검증 불가 = unverified_fixpoint ` +
					`(거짓 fixpoint 확정 금지 / 현 honest-debt 동급). 그래프에 derived_from 배선 시 진짜 fixpoint 판정.\n`,
			);
		process.exit(2);
	}

	// fixpoint — 3조건 동시 충족 (newWork=∅ AND fresh AND unresolved=∅). 큐 clear + 세션 종결.
	writeStateCAS(root, (s) => {
		delete s.regen_queue;
		s.sync_session = { ...baseSession, status: 'fixpoint', completed_at: nowIso };
		return s;
	});
	const out = { status: 'fixpoint', iteration, cap, cumulative_done: cumulativeDone.length };
	if (args.json) process.stdout.write(JSON.stringify(out, null, 2) + '\n');
	else
		process.stdout.write(
			`[chain-driver sync-converge] ✅ fixpoint 도달 (iteration ${iteration} / 누적 처리 ${cumulativeDone.length} 노드). ` +
				`잔여 drift 0 · 그래프 fresh · unresolved 0.\n` +
				`  (단조 trade: 본 세션 baseline 이후 done 노드 재편집은 별도 세션[--reset] / M2.)\n`,
		);
	process.exit(0);
}

// chain-driver route — living-sync Phase 1b 의미 라우터 (DEC §5 Phase 1b).
//   discovery-spec(LLM 산출)의 명시 매핑(use_cases.id / business_rules_intent.br_id)을 결정론 라우팅 →
//   existing 진입 origins → computeSyncLoop forward closure → regen_queue seed (sync-loop 와 동일 durable 경로).
//   net-new(unknown_br / 신규·fine UC) = propose-only report(seed ❌ / 차단은 별도 gate#1 evaluateGate('discovery')+validator).
//   의미 판정(NL→discovery-spec) = LLM skill(밖). 본 명령 = 명시 매핑 결정론 라우팅 + seed.
function cmdRoute(args) {
	if (!args.discoverySpecPath) {
		console.error('[chain-driver] route: --discovery-spec <path> required');
		process.exit(3);
	}
	if (!args.graphPath) {
		console.error('[chain-driver] route: --graph <path> required');
		process.exit(3);
	}
	if (!existsSync(args.discoverySpecPath)) {
		console.error(
			`[chain-driver] route: discovery-spec not found: ${args.discoverySpecPath}`,
		);
		process.exit(3);
	}
	if (!existsSync(args.graphPath)) {
		console.error(`[chain-driver] route: graph not found: ${args.graphPath}`);
		process.exit(3);
	}
	let discoverySpec, graph;
	try {
		discoverySpec = JSON.parse(readFileSync(args.discoverySpecPath, 'utf-8'));
		graph = JSON.parse(readFileSync(args.graphPath, 'utf-8'));
	} catch (e) {
		console.error(`[chain-driver] route: parse error: ${e.message}`);
		process.exit(3);
	}

	// --analysis (br_id content 매칭). br_intent 존재인데 미제공/미로드 = fail-closed (Senior #2).
	let analysis = null;
	if (args.analysisPath) {
		if (!existsSync(args.analysisPath)) {
			console.error(
				`[chain-driver] route: analysis not found: ${args.analysisPath}`,
			);
			process.exit(3);
		}
		try {
			analysis = JSON.parse(readFileSync(args.analysisPath, 'utf-8'));
		} catch (e) {
			console.error(`[chain-driver] route: analysis parse error: ${e.message}`);
			process.exit(3);
		}
	}
	const brIntentCount = (discoverySpec?.business_rules_intent ?? []).length;
	if (brIntentCount > 0 && !analysis) {
		console.error(
			`[chain-driver] route: business_rules_intent ${brIntentCount}건 존재하나 --analysis <business-rules.json> 미제공 — ` +
				`전건 net-new 오분류 방지 fail-closed (Senior #2). --analysis 로 analysis business-rules 공급.`,
		);
		process.exit(3);
	}

	const resolved = resolveDiscoveryOrigins(discoverySpec, graph, analysis);

	// existing origins → forward closure → regen_queue. 0건 = propose-only (S2 graph 부재 대응 / exit 0 / Senior #4).
	let regenQueue = null;
	let written = false;
	let loopResult = null;
	if (resolved.origins.length > 0) {
		try {
			loopResult = computeSyncLoop(graph, { origins: resolved.origins });
		} catch (e) {
			console.error(`[chain-driver] route: ${e.message}`);
			process.exit(3);
		}
		regenQueue = {
			generated_at: new Date().toISOString(),
			origins: loopResult.origins,
			graph_path: args.graphPath,
			has_cycle: loopResult.has_cycle,
			items: loopResult.items,
			source: 'discovery-route',
		};
		const root = args.project ? resolve(args.project) : null;
		if (root && !args.dryRun && !loopResult.has_cycle) {
			const existing = readState(root);
			if (!existing) {
				console.error(
					`[chain-driver] route: state.json 부재 (${root}) — init 먼저 / regen_queue 미기록`,
				);
			} else if (isQueueInProgress(existing.regen_queue) && !args.force) {
				console.error(
					`[chain-driver] route: regen_queue 진행 중 — 덮어쓰기 거부. 소비 완료 후 또는 --force.`,
				);
				process.exit(2);
			} else {
				try {
					writeStateCAS(root, (s) => {
						s.regen_queue = regenQueue;
						delete s.sync_session; // M1 — fresh origin 배치 = 새 수렴 세션 (이전 cumulative_done 무효).
						return s;
					});
					written = true;
				} catch (e) {
					console.error(`[chain-driver] route: state write 실패: ${e.message}`);
				}
			}
		}
	}

	const out = {
		origins: resolved.origins,
		net_new: resolved.net_new,
		diagnostics: resolved.diagnostics,
		counts: resolved.counts,
		regen_queue: regenQueue,
		written,
		propose_only: resolved.origins.length === 0,
	};
	if (args.json) {
		process.stdout.write(JSON.stringify(out, null, 2) + '\n');
	} else {
		process.stdout.write(
			`[chain-driver route] origins(existing)=${resolved.origins.join(', ') || '-'} / net-new=${resolved.counts.net_new} (UC ${resolved.counts.uc_total} + BR ${resolved.counts.br_total} intent)\n`,
		);
		if (regenQueue)
			process.stdout.write(
				`  regen_queue: ${regenQueue.items.length} item(s) [${regenQueue.items.map((it) => it.id).join(' → ')}] ${written ? '→ written' : '(미기록 — --dry-run / state 부재 / project 미지정)'}\n`,
			);
		else
			process.stdout.write(
				`  propose-only (existing origin 0 / seed ❌) — net-new 는 gate#1(discovery) 사람 확인.\n`,
			);
		for (const nn of resolved.net_new)
			process.stdout.write(`  net-new ${nn.kind}: ${nn.ref} — ${nn.reason}\n`);
		for (const d of resolved.diagnostics)
			process.stdout.write(`  ⚠️ ${d.kind} (${d.severity}): ${d.message}\n`);
		if (loopResult?.has_cycle)
			process.stdout.write(`  ⚠️ cycle detected — durable write 거부\n`);
	}
	process.exit(0);
}

// chain-driver lift — living-sync Phase 2 (DEC §5 Phase 2 / forward-only 의 유일 reverse 예외).
//   손수정 코드 → anchor(주인 노드) → backward 천장 후보 surface. --ceiling 명시(사람) 시 그 천장부터
//   forward 재전파 → regen_queue (route/sync-loop 동일 durable 경로). 의미 천장 판정 = 사람(auto-climb ❌).
//   Senior 적대검토(REVISE@0.83) 반영: ① 명시 --ceiling 없으면 forward seed ❌(propose-only / IMPL=forward-leaf 실측)
//   ④ --ceiling 은 anchor backward 조상 allowlist ∈ 검증 ③ forward closure 에서 손수정 anchor 노드 제외(자기 코드 재생성 지시 회피).
//   reconcile(observed-fact 재추출 + intent 충돌 propose) = Phase 2b 분리 (git/fs IO + cross-package 결정 / no-op stub 회피).
function cmdLift(args) {
	if (!args.graphPath) {
		console.error('[chain-driver] lift: --graph <path> required');
		process.exit(3);
	}
	if (!existsSync(args.graphPath)) {
		console.error(`[chain-driver] lift: graph not found: ${args.graphPath}`);
		process.exit(3);
	}
	const changedPaths = args.changedPaths ?? [];
	if (changedPaths.length === 0) {
		console.error('[chain-driver] lift: --changed <codefile>... 필수 (손수정 코드 경로)');
		process.exit(3);
	}
	let graph;
	try {
		graph = JSON.parse(readFileSync(args.graphPath, 'utf-8'));
	} catch (e) {
		console.error(`[chain-driver] lift: graph parse error: ${e.message}`);
		process.exit(3);
	}

	const lift = liftCandidates(graph, changedPaths);
	const ceiling = args.ceiling ?? null;

	// --reconcile (Phase 2b / DEC §11): 손수정 코드 ↔ anchor 관측사실 신선도 git 재탐지 → propose-only 분류.
	//   anchor 노드의 strict_path pointer 만 detectContentDrift(worktree)/findRelocation → reconcileObserved(순수 분류).
	//   relocation=관측사실 후보 / content_drift+intent=flag (자동 덮어쓰기 ❌). 그래프 mutation ❌ (exit 0).
	let reconcile = null;
	if (args.reconcile) {
		const repoRoot = args.repoRoot ? resolve(args.repoRoot) : process.cwd();
		const gitRunner = makeGitRunner(repoRoot);
		const nodeById = new Map((graph.nodes ?? []).map((n) => [n.id, n]));
		const perAnchor = [];
		for (const anchorId of lift.anchors) {
			const node = nodeById.get(anchorId);
			const pointers = (node?.code_pointers ?? []).filter(
				(cp) => cp?.anchor_type === 'strict_path' && cp.path,
			);
			const gitFacts = pointers.map((cp) => {
				const baseSha = cp.commit_hash ?? args.baseSha ?? null;
				return {
					path: cp.path,
					content_drift: detectContentDrift(cp.path, baseSha, {
						gitRunner,
						includeWorktree: true, // D4 손수정=미커밋 작업트리 포함
					}),
					relocation: findRelocation(cp.path, { gitRunner, repoRoot }),
				};
			});
			const classified = reconcileObserved(pointers, gitFacts);
			// Phase 2c carry-B' — relocation 후보에 durable source 수정 위치 동봉 (graph 직접 ❌ = 파생물 clobber / write ❌).
			const subkind = node?.artifact_subkind ?? null;
			const observed_candidates = classified.observed_candidates.map((oc) =>
				oc.kind === 'path_relocated'
					? { ...oc, source_edit: relocationSourceHint(subkind, anchorId, oc) }
					: oc,
			);
			// Phase 2c carry-A — content_drift flag 에 결단 보조(재전파 천장 후보 = anchor 자신 제외 / Senior #1).
			const hasContentDrift = classified.flags.some((f) => f.kind === 'content_drift');
			const ceiling_options = hasContentDrift
				? ceilingOptionsForAnchor(anchorId, lift.ceilingByAnchor)
				: [];
			perAnchor.push({
				anchor: anchorId,
				observed_candidates,
				flags: classified.flags,
				...(hasContentDrift ? { ceiling_options } : {}),
			});
		}
		reconcile = {
			repo_root: repoRoot,
			propose_only: true, // 그래프 mutation ❌ / durable write = 사람
			anchors: perAnchor,
		};
	}

	// --ceiling 명시 시: ancestry guard(R-D3) → forward 재전파(R-D4 hand-edited 제외) → regen_queue durable.
	let regenQueue = null;
	let written = false;
	let loopResult = null;
	let excludedAnchors = [];
	if (ceiling) {
		if (lift.anchors.length === 0) {
			console.error(
				`[chain-driver] lift: --ceiling 지정됐으나 해소된 anchor 0건 (전부 unresolved: ${lift.unresolved.join(', ') || '-'}) — 코드 파일이 어느 노드 code_pointers 와도 매칭 안 됨 (coverage 상한 / 추적 밖)`,
			);
			process.exit(3);
		}
		const v = validateCeiling(ceiling, lift.anchors, lift.ceilingByAnchor);
		if (!v.valid) {
			console.error(
				`[chain-driver] lift: --ceiling '${ceiling}' 는 어느 anchor 의 backward 조상도 아님 (auto-climb ❌ / 사람이 잘못 선택 차단). ` +
					`유효 천장 후보: ${lift.ceilingCandidates.map((c) => c.id).join(', ') || '(없음 — anchor 가 forward-leaf 면 자기 자신만 가능)'}`,
			);
			process.exit(3);
		}
		try {
			loopResult = computeSyncLoop(graph, { origins: [ceiling] });
		} catch (e) {
			console.error(`[chain-driver] lift: ${e.message}`);
			process.exit(3);
		}
		// R-D4 / Senior #3 — 손수정 anchor 노드는 regen_queue 에서 제외 (사람이 방금 쓴 코드 재생성 지시 회피).
		const anchorSet = new Set(lift.anchors);
		const keptItems = loopResult.items.filter((it) => !anchorSet.has(it.id));
		excludedAnchors = loopResult.items
			.filter((it) => anchorSet.has(it.id))
			.map((it) => it.id)
			.sort();
		regenQueue = {
			generated_at: new Date().toISOString(),
			origins: loopResult.origins,
			graph_path: args.graphPath,
			has_cycle: loopResult.has_cycle,
			items: keptItems,
			source: 'lift',
			ceiling,
			hand_edited_excluded: excludedAnchors,
		};

		// durable write = state.json regen_queue (route/sync-loop 동형 clobber 가드 / has_cycle·빈 큐 거부).
		const root = args.project ? resolve(args.project) : null;
		if (
			root &&
			!args.dryRun &&
			!loopResult.has_cycle &&
			keptItems.length > 0
		) {
			const existing = readState(root);
			if (!existing) {
				console.error(
					`[chain-driver] lift: state.json 부재 (${root}) — init 먼저 / regen_queue 미기록`,
				);
			} else if (isQueueInProgress(existing.regen_queue) && !args.force) {
				console.error(
					`[chain-driver] lift: regen_queue 진행 중 — 덮어쓰기 거부. 소비 완료 후 또는 --force.`,
				);
				process.exit(2);
			} else {
				try {
					writeStateCAS(root, (s) => {
						s.regen_queue = regenQueue;
						delete s.sync_session; // M1 — fresh origin 배치 = 새 수렴 세션 (이전 cumulative_done 무효).
						return s;
					});
					written = true;
				} catch (e) {
					console.error(`[chain-driver] lift: state write 실패: ${e.message}`);
				}
			}
		}
	}

	const out = {
		anchors: lift.anchors,
		unresolved: lift.unresolved,
		ceiling_candidates: lift.ceilingCandidates,
		ceiling,
		regen_queue: regenQueue,
		hand_edited_excluded: excludedAnchors,
		written,
		...(reconcile ? { reconcile } : {}),
		// propose-only = 천장 미지정(후보 surface 만) 또는 forward 빈 closure(refactor / reconcile-only Phase 2b).
		propose_only: !ceiling || (regenQueue?.items?.length ?? 0) === 0,
	};
	if (args.json) {
		process.stdout.write(JSON.stringify(out, null, 2) + '\n');
	} else {
		process.stdout.write(
			`[chain-driver lift] anchors=${lift.anchors.join(', ') || '-'}\n`,
		);
		if (lift.anchors.length === 0)
			process.stdout.write(
				`  (해소된 anchor 0 — code_pointers 매칭 없음 / coverage 상한 / 추적 밖)\n`,
			);
		process.stdout.write(
			`  천장 후보: ${lift.ceilingCandidates.map((c) => `${c.id}[${c.grade}/+${c.additional_hard_hops}]`).join(', ') || '(없음 — anchor 가 forward-leaf)'}\n`,
		);
		if (!ceiling) {
			process.stdout.write(
				`  propose-only — 의미 천장(어느 높이까지 바뀌었나)은 사람 판정. --ceiling <후보-id> 로 명시하면 그 천장부터 forward 재전파 (auto-climb ❌).\n`,
			);
		} else {
			process.stdout.write(`  ceiling=${ceiling} (사람 명시)\n`);
			if ((regenQueue?.items?.length ?? 0) === 0)
				process.stdout.write(
					`  forward closure 빈 큐 — 천장=anchor(refactor) 또는 하류 노드 없음 = reconcile-only (observed-fact 재추출은 Phase 2b).\n`,
				);
			else
				process.stdout.write(
					`  regen_queue: ${regenQueue.items.length} item(s) [${regenQueue.items.map((it) => it.id).join(' → ')}] ${written ? '→ written' : '(미기록 — --dry-run / state 부재 / project 미지정)'}\n`,
				);
			if (excludedAnchors.length)
				process.stdout.write(
					`  hand-edited 제외(재생성 ❌): ${excludedAnchors.join(', ')}\n`,
				);
			if (loopResult?.has_cycle)
				process.stdout.write(`  ⚠️ cycle detected — durable write 거부\n`);
		}
		if (lift.unresolved.length)
			process.stdout.write(
				`  unresolved(추적 밖): ${lift.unresolved.join(', ')}\n`,
			);
		if (reconcile) {
			process.stdout.write(`  reconcile (propose-only / 그래프 mutation ❌):\n`);
			let any = false;
			for (const a of reconcile.anchors) {
				for (const oc of a.observed_candidates) {
					any = true;
					process.stdout.write(
						`    [관측사실 후보] ${a.anchor} ${oc.path} → ${oc.kind}: '${oc.suggested}' (suggested_path)\n`,
					);
					// carry-B' — durable 수정 위치(source 산출물 / graph 직접 ❌ = clobber). write ❌ = propose.
					if (oc.source_edit)
						process.stdout.write(
							`        ↳ durable: ${oc.source_edit.source_artifact} ${oc.source_edit.locator}: '${oc.source_edit.old}' → '${oc.source_edit.new}' (수정 후 resync-graph / graph 직접 ❌)\n`,
						);
				}
				for (const fl of a.flags) {
					any = true;
					const detail =
						fl.kind === 'content_drift'
							? 'content_drift — 사람 결단 필요'
							: `intent_review — 사람의도 필드 ${(fl.fields ?? []).join('/')} (자동 ❌)`;
					process.stdout.write(`    [flag] ${a.anchor} ${fl.path}: ${detail}\n`);
				}
				// carry-A — content_drift 결단 보조 (재전파 천장 후보 / anchor 자신 제외 / 재전파=하류 재생성·코드 ❌).
				if (a.ceiling_options) {
					if (a.ceiling_options.length)
						process.stdout.write(
							`        ↳ 결단 ①재전파: lift --ceiling <${a.ceiling_options.join('|')}> = 하류 TASK/TC 재생성(손수정 코드는 closure 제외) / ②재앵커: 코드를 canonical 결단 시 source 재합성(resync)\n`,
						);
					else
						process.stdout.write(
							`        ↳ 결단: 상위 천장 없음(forward-leaf orphan) → 재앵커(코드=canonical / source 재합성)만 가능\n`,
						);
				}
			}
			if (!any)
				process.stdout.write(
					`    (후보·flag 0 — anchor 관측사실 신선 / 또는 git 부재·commit_hash 부재로 판정불가 carry)\n`,
				);
		}
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
		case 'sync-converge':
			return cmdSyncConverge(args);
		case 'route':
			return cmdRoute(args);
		case 'lift':
			return cmdLift(args);
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
