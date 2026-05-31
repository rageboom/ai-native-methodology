#!/usr/bin/env node
// chain-driver — ★ ★ ★ chain harness driver CLI (sub-plan-5).
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
import { basename, dirname, join, resolve } from 'node:path';
import {
  initState, readState, writeStateCAS, recoverTmpFiles, ensureAimdDir,
  StateCorruptError, MigrationRequiredError, CURRENT_STATE_VERSION,
  migrate, statePath,
  ensureScopeDir, readManifest, writeManifest, listScopes,
} from './state-store.js';
import { executeQuery } from './query.js';
import { markDrift, cascade } from './sync.js';

const MANIFEST_STAGES = ['discovery', 'spec', 'plan', 'test', 'impl'];
function stageToManifestStage(stage) {
  return stage === 'implement' ? 'impl' : stage;
}
import { loadFlow, nextStage, validateStateAgainstFlow, getGateForStage } from './stage-graph.js';
import { evaluateGate, applyUserDecision, requiredValidators } from './gate-eval.js';
import { loadSkill, formatSkillSuggestion } from './invoke-skill.js';
import {
  parseHookInput, buildSuggestOutput, buildBlockOutput,
  suggestSkillForPrompt, suggestAgentForPrompt, shouldBlockToolUse,
  detectGraphArtifactWrite, evaluatePolicyForEdges,
} from './hooks-bridge.js';
import { gitDiffNumstat, detectRevisit } from './revisit-detect.js';
import { analyzeImpact } from './impact-analyzer.js';
import { loadPolicy, evaluatePolicy, appendProposeRecord } from './policy-evaluator.js';
import { topologicalOrder, cascadeOrder } from './propagation-orderer.js';
import { topKImpactRoot } from './centrality.js';

function usage(code = 3) {
  console.error([
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
    '  navigate --graph <artifact-graph.json> --origin <node-id> [--json]   (dep-graph-navigator backend)',
    '  navigate --graph <artifact-graph.json> --stage <discovery|spec|plan|test|implement> [--scope <id>] [--json]   (★ F3 stage/scope 일괄 의존성 rollup)',
    '  suggest-skill --prompt <text>',
    '  hooks-bridge          (reads stdin JSON, writes stdout JSON)',
    '  migrate <project>',
    '  revisit-detect <project> [--base <sha>] [--user-decision <go|ignore>]',
    '',
    'exit codes: 0=ok, 1=blocked, 2=invariant-violation, 3=usage, 4=state-corrupt',
  ].join('\n'));
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
    else if (a === '--scenario') out.scenario = rest[++i];
    else if (a === '--stage') out.stage = rest[++i];
    else if (a === '--direction') out.direction = rest[++i];
    else if (a === '--ref') out.ref = rest[++i];
    else if (a === '--stale') out.stale = true;
    // dep-graph P3 impact 명령
    else if (a === '--graph') out.graphPath = rest[++i];
    else if (a === '--origin') out.origin = rest[++i];
    else if (a === '--change-kind') out.changeKind = rest[++i];
    else if (a === '--policy') out.policyPath = rest[++i];
    else if (a === '--out-jsonl') out.outJsonl = rest[++i];
    else if (a === '--code-pointer-only') out.codePointerOnly = true;
    else if (a === '--help' || a === '-h') usage(0);
    else if (a.startsWith('--')) usage(3);
  }
  return out;
}

function logIntervention(state, projectRoot, entry) {
  const path = join(projectRoot, state?.intervention_log_path || '.aimd/output/intervention-log.jsonl');
  mkdirSync(dirname(path), { recursive: true });
  const line = JSON.stringify({ timestamp: new Date().toISOString(), ...entry }) + '\n';
  appendFileSync(path, line, 'utf-8');
}

function blockedExit(state, projectRoot) {
  // mechanical gate trio (ii) — non-interactive exit 2 + same message.
  const reason = state.block_reason || 'unknown';
  console.error(
    `[chain-driver] BLOCKED — block_reason=${reason}. ` +
    `Resolve via /aimd-next or /aimd-stage <name>. (mechanical trio (ii))`
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
        console.error(`[chain-driver] state.json already exists. Use --scope <slug> to add a scope.`);
        process.exit(3);
      }
      state = readState(root);
    } else {
      state = initState(root, projectId);
    }
    if (args.scope) {
      ensureScopeDir(root, args.scope, args.scenario); // ★ v11.9.0 use-scenario taxonomy seed
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

function cmdState(args) {
  if (!args.project) usage(3);
  const root = resolve(args.project);
  recoverTmpFiles(root);
  const state = readState(root);
  if (!state) { console.error('[chain-driver] no state.json — run init first'); process.exit(3); }
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
    ];
    process.stdout.write(lines.join('\n') + '\n');
  }
  process.exit(0);
}

function loadFindings(path) {
  // ★ F-AUDIT-SOFTGATE-001 (=C-13 해소) — --findings 미제출 = 검증 증거 부재 → sentinel 표시 (fail-closed).
  //   기존엔 all-zeros 반환으로 gate 무음 통과(soft). __findings_absent 로 evaluateGate 가 findings_unverified block.
  //   (zero counts 도 유지 — cmdNext validator_findings 기록부가 critical||0 등으로 안전 참조.)
  if (!path) return { __findings_absent: true, critical: 0, high: 0, medium: 0, low: 0, info: 0 };
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
  try { state = readState(root); }
  catch (e) {
    if (e instanceof StateCorruptError) { console.error(`[chain-driver] ${e.message}`); process.exit(4); }
    throw e;
  }
  if (!state) { console.error('[chain-driver] no state.json — run init first'); process.exit(3); }
  if (state.blocked) blockedExit(state, root);

  const stage = state.current_chain === 'analysis' ? 'discovery' : state.current_chain;
  const findings = loadFindings(args.findingsPath);
  // ★ v11.9.0 — use-scenario taxonomy: scope manifest.scenario → gate matrix (미지정 → 'S1' default / backward-compat).
  let scenario;
  try { scenario = state.current_scope ? readManifest(root, state.current_scope)?.scenario : undefined; } catch { scenario = undefined; }
  const gateResult = evaluateGate(stage === 'analysis' ? 'discovery' : stage, findings, scenario);
  const finalDecision = applyUserDecision(gateResult, args.userDecision);

  if (args.dryRun) {
    process.stdout.write(JSON.stringify({ stage, gate: finalDecision, dry_run: true }, null, 2) + '\n');
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
    console.error(`[chain-driver] gate blocked: ${finalDecision.primary_reason}`);
    process.exit(1);
  }

  // unblocked — advance
  const next = nextStage(stage);
  const nowIso = new Date().toISOString();
  writeStateCAS(root, (s) => {
    const decision = finalDecision.decision === 'go-with-warnings' ? 'go' : (finalDecision.decision || 'go');
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
      intervention_log_path: s.intervention_log_path || '.aimd/output/intervention-log.jsonl',
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
        if (fm) writeManifest(root, state.current_scope, fromStage, { ...fm, status: 'complete' });
      }
      if (next) {
        const toStage = stageToManifestStage(next);
        if (MANIFEST_STAGES.includes(toStage)) {
          const tm = readManifest(root, state.current_scope, toStage);
          if (tm) writeManifest(root, state.current_scope, toStage, { ...tm, status: 'in_progress' });
          const sm = readManifest(root, state.current_scope);
          if (sm) writeManifest(root, state.current_scope, null, { ...sm, current_stage: toStage });
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
  // ★ ★ v8.7.2+ — ticket-sync auto-suggest stderr (R20 / DEC-2026-05-20-r20-verification-mode).
  // Stop hook 직접 등록 ❌ — Stop event = 매 turn 종료마다 발화 = noise.
  // chain-driver next 호출 시점 = 의도된 stage 전이 = ticket-sync 호출 candidate moment.
  // 실 MCP 호출은 사용자 명시 호출 의무 (R20 confirmation gate 본질 보존 / fire-and-forget ❌).
  const stageForTicketSync = stage === 'impl' ? 'implement' : stage;
  process.stderr.write(
    `[chain-driver] ★ ticket-sync auto-suggest: invoke skill ai-native-methodology:ticket-sync ` +
    `with stage=${stageForTicketSync} phase=exit (dry_run=true default). ` +
    `Initiative 생성 권한 부재 환경 / plugin verification meta-cycle / migration carry 시: ` +
    `mode=verification + parent_epic=<existing-epic-key>. ` +
    `R20 / DEC-2026-05-20-r20-verification-mode.\n`
  );
  process.stdout.write(JSON.stringify({ stage, advanced_to: next, gate: finalDecision }, null, 2) + '\n');
  process.exit(0);
}

function cmdQuery(args) {
  // ★ dep-graph P4 (operation.md 결정 7) — query --graph 로 artifact-graph.json JSON 출력 (툴링용).
  if (args.graphPath) {
    if (!existsSync(args.graphPath)) {
      console.error(`[chain-driver] query --graph: graph not found: ${args.graphPath}`);
      process.exit(3);
    }
    let graph;
    try { graph = JSON.parse(readFileSync(args.graphPath, 'utf-8')); }
    catch (e) { console.error(`[chain-driver] query --graph parse error: ${e.message}`); process.exit(3); }
    // 노드 id 필터 (--ref 재사용) 또는 전체
    if (args.ref) {
      const node = (graph.nodes ?? []).find(n => n.id === args.ref);
      const edges = (graph.edges ?? []).filter(e => e.source === args.ref || e.target === args.ref);
      process.stdout.write(JSON.stringify({ node: node ?? null, edges }, null, 2) + '\n');
    } else {
      process.stdout.write(JSON.stringify({ stats: graph.stats, nodes: graph.nodes, edges: graph.edges }, null, 2) + '\n');
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

// ★ F3 (Loop B / 소비 루프) — stage → artifact_subkind 매핑 (각 단계 일괄 조회용).
const STAGE_SUBKINDS = {
  discovery: ['UC'],
  spec: ['BHV', 'AC'],
  plan: ['TASK', 'EPIC', 'STORY', 'OP'],
  test: ['TC'],
  implement: ['IMPL'],
};

// ★ F4 (Loop B / 소비 루프) — stage별 기본 방향 프리셋 ("각 단계가 던질 기본 질문").
//   discovery/spec/implement = backward (상류 honor 강조) / plan/test = forward (하류 affects 강조).
//   --direction forward|backward|both 로 override. presentation-only (analyzeImpact 알고리즘 무변경).
const STAGE_DIRECTION = {
  discovery: 'backward', spec: 'backward', implement: 'backward',
  plan: 'forward', test: 'forward',
};

// ★ F3 — stage/scope 단위 일괄 의존성 rollup ("이 단계가 무엇을 honor/affect 하나" 한 번에).
//   단일 --origin 대신 --stage <s> 또는 --scope <id> → 해당 노드 전부의 backward(honor)/forward(affects) 집계.
//   AI 추론 0% — analyzeImpact (결정론 BFS) 재사용. dep-graph-navigator skill 및 stage agent consult 의 단계-일괄 채널.
function cmdNavigateRollup(graph, args) {
  if (args.stage && !STAGE_SUBKINDS[args.stage]) {
    console.error(`[chain-driver] navigate --stage: unknown stage '${args.stage}' (discovery|spec|plan|test|implement)`);
    process.exit(3);
  }
  if (args.direction && !['forward', 'backward', 'both'].includes(args.direction)) {
    console.error(`[chain-driver] navigate --direction: forward|backward|both`);
    process.exit(3);
  }
  // ★ F4 — emphasis = --direction override > stage 기본 프리셋 > 'both'.
  const emphasis = args.direction ?? (args.stage ? STAGE_DIRECTION[args.stage] : 'both');
  const subkinds = args.stage ? new Set(STAGE_SUBKINDS[args.stage]) : null;
  const TRAVERSABLE = new Set(['active', 'drift']);
  const target = (graph.nodes ?? []).filter(n =>
    TRAVERSABLE.has(n.state)
    && (!subkinds || subkinds.has(n.artifact_subkind))
    && (!args.scope || n.scope_id === args.scope)
  );

  const policyPath = args.policyPath
    || join(resolveRepoRoot(process.cwd()), 'policies', 'propagation-policy.json');
  let policy = null;
  try { policy = loadPolicy(policyPath); } catch { policy = null; }
  const nonTraversable = policy?.non_traversable_states ?? ['propose'];

  const items = [];
  for (const n of target) {
    let impact;
    try {
      impact = analyzeImpact(graph, n.id, {
        baseGradeOverrides: policy?.edge_grade_overrides ?? undefined,
        nonTraversableStates: nonTraversable,
      });
    } catch { continue; }
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
  const topRoots = topKImpactRoot(graph, { k: 3, nonTraversableStates: nonTraversable });

  const result = {
    query: { stage: args.stage ?? null, scope: args.scope ?? null },
    emphasis,
    emphasis_source: args.direction ? 'override' : (args.stage ? 'stage-default' : 'none'),
    count: items.length,
    nodes: items,
    top_impact_roots: topRoots,
  };

  if (args.json) {
    process.stdout.write(JSON.stringify(result, null, 2) + '\n');
  } else {
    process.stdout.write(`[dep-graph-navigator] rollup — stage=${args.stage ?? '-'} scope=${args.scope ?? '-'} / ${items.length} 노드 / emphasis=${emphasis}\n`);
    for (const it of items) {
      process.stdout.write(`  ${it.id} (${it.artifact_subkind}) state=${it.state}\n`);
      if (emphasis === 'backward') {
        const ids = it.backward.map(x => x.id).sort();
        process.stdout.write(`    honor(backward): ${ids.length ? ids.join(', ') : '-'}\n`);
      } else if (emphasis === 'forward') {
        const ids = it.forward.map(x => x.id).sort();
        process.stdout.write(`    affects(forward): ${ids.length ? ids.join(', ') : '-'}\n`);
      } else {
        process.stdout.write(`    honor(MUST): ${it.by_grade.MUST.length ? it.by_grade.MUST.join(', ') : '-'}\n`);
      }
    }
    process.stdout.write(`  top-3 impact root (graph-wide): ${topRoots.map(r => `${r.id}(${r.score})`).join(', ')}\n`);
  }
  process.exit(0);
}

// ★ dep-graph P4 (operation.md 결정 7) — dep-graph-navigator skill 의 backend.
// node 상세 + 영향 트리(BFS) + code_pointers + top-K impact root (centrality) 통합.
// usage: chain-driver navigate --graph <path> --origin <node-id> [--json]
//        chain-driver navigate --graph <path> --stage <s>|--scope <id> [--json]   (★ F3 일괄 rollup)
function cmdNavigate(args) {
  if (!args.graphPath) {
    console.error('[chain-driver] navigate: --graph <path> required');
    process.exit(3);
  }
  if (!existsSync(args.graphPath)) {
    console.error(`[chain-driver] navigate: graph not found: ${args.graphPath}`);
    process.exit(3);
  }
  let graph;
  try { graph = JSON.parse(readFileSync(args.graphPath, 'utf-8')); }
  catch (e) { console.error(`[chain-driver] navigate parse error: ${e.message}`); process.exit(3); }

  // ★ F3 — stage/scope 일괄 rollup (단일 노드 --origin 없이 "이 단계의 의존성" 한 번에)
  if (!args.origin && (args.stage || args.scope)) {
    return cmdNavigateRollup(graph, args);
  }
  if (!args.origin) {
    console.error('[chain-driver] navigate: --origin <node-id> OR --stage/--scope required');
    process.exit(3);
  }

  const node = (graph.nodes ?? []).find(n => n.id === args.origin);
  if (!node) {
    console.error(`[chain-driver] navigate: node '${args.origin}' not in graph`);
    process.exit(3);
  }

  const policyPath = args.policyPath
    || join(resolveRepoRoot(process.cwd()), 'policies', 'propagation-policy.json');
  let policy = null;
  try { policy = loadPolicy(policyPath); } catch { policy = null; }
  const nonTraversable = policy?.non_traversable_states ?? ['propose'];

  let impact;
  try {
    impact = analyzeImpact(graph, args.origin, {
      baseGradeOverrides: policy?.edge_grade_overrides ?? undefined,
      nonTraversableStates: nonTraversable,
    });
  } catch (e) { console.error(`[chain-driver] navigate: ${e.message}`); process.exit(3); }

  const topRoots = topKImpactRoot(graph, { k: 3, nonTraversableStates: nonTraversable });

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
    impact: { by_grade: impact.by_grade, forward: impact.forward, backward: impact.backward },
    top_impact_roots: topRoots,
    stats: impact.stats,
  };

  if (args.json) {
    process.stdout.write(JSON.stringify(result, null, 2) + '\n');
  } else {
    process.stdout.write(`[dep-graph-navigator] ${node.id} (${node.artifact_kind}/${node.artifact_subkind}) state=${node.state}\n`);
    process.stdout.write(`  source: ${node.source_path}\n`);
    if (result.node.code_pointers.length > 0) {
      process.stdout.write(`  code_pointers:\n`);
      for (const cp of result.node.code_pointers) {
        process.stdout.write(`    - ${cp.anchor_type}: ${cp.path}${cp.symbol ? ` #${cp.symbol}` : ''}\n`);
      }
    } else {
      process.stdout.write(`  code_pointers: ${result.node.code_pointers_na ? '(N/A 명시)' : '(없음)'}\n`);
    }
    process.stdout.write(`  영향 트리:\n`);
    process.stdout.write(`    MUST: ${impact.by_grade.MUST.join(', ') || '-'}\n`);
    process.stdout.write(`    SHOULD: ${impact.by_grade.SHOULD.join(', ') || '-'}\n`);
    process.stdout.write(`    FYI: ${impact.by_grade.FYI.join(', ') || '-'}\n`);
    process.stdout.write(`  top-3 impact root (graph-wide): ${topRoots.map(r => `${r.id}(${r.score})`).join(', ')}\n`);
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
  try { meta = loadSkill(repoRoot, skillId).meta; } catch { /* ok */ }
  process.stderr.write(formatSkillSuggestion(skillId, meta) + '\n');
  process.exit(0);
}

// ★ dep-graph P4 (operation.md 결정 7) — SessionStart 그래프 컨텍스트 주입.
// artifact-graph.json 위치 후보를 탐색해 dirty(state=drift) 노드 수 + top-3 impact root 요약.
// 그래프 없으면 null (non-fatal).
function buildGraphSessionContext(root) {
  const candidates = [
    join(root, '.aimd', 'output', 'artifact-graph.json'),
    join(root, '.aimd', 'artifact-graph.json'),
  ];
  let graphPath = candidates.find(p => existsSync(p));
  if (!graphPath) {
    // scope 별 위치도 탐색 (.aimd/<scope>/artifact-graph.json)
    try {
      for (const scope of listScopes(root)) {
        const p = join(root, '.aimd', scope, 'artifact-graph.json');
        if (existsSync(p)) { graphPath = p; break; }
      }
    } catch { /* ok */ }
  }
  if (!graphPath) return null;

  let graph;
  try { graph = JSON.parse(readFileSync(graphPath, 'utf-8')); }
  catch { return null; }

  const nodes = graph.nodes ?? [];
  const driftCount = nodes.filter(n => n.state === 'drift').length;
  const proposeCount = nodes.filter(n => n.state === 'propose').length;
  const topRoots = topKImpactRoot(graph, { k: 3 });
  const rootStr = topRoots.map(r => `${r.id}(${r.score})`).join(', ');

  const parts = [`[dep-graph] ${nodes.length} nodes`];
  if (driftCount > 0) parts.push(`⚠️ ${driftCount} drift`);
  if (proposeCount > 0) parts.push(`${proposeCount} propose 대기`);
  parts.push(`top-3 impact root: ${rootStr || '-'}`);
  parts.push(`탐색: /dep-graph-navigator <node-id>`);
  return parts.join(' / ');
}

function cmdHooksBridge(args) {
  let stdin = '';
  try { stdin = readFileSync(0, 'utf-8'); } catch { /* ok */ }
  let payload;
  try { payload = parseHookInput(stdin); }
  catch (e) { console.error(`[chain-driver] ${e.message}`); process.exit(3); }
  const event = payload.hook_event_name;
  if (event === 'SessionStart') {
    // G3 R5/R7 — recover .tmp + drift 자동 감지 + 사용자 안내 (M4).
    const root = payload.cwd || process.cwd();
    if (!existsSync(join(root, '.aimd', 'state.json'))) {
      // user project not yet initialized — pass-through.
      process.stdout.write(JSON.stringify({ suppressOutput: true, continue: true }) + '\n');
      process.exit(0);
    }
    try { recoverTmpFiles(root); } catch { /* non-fatal */ }
    let driftSummary = { marked: [] };
    try { driftSummary = markDrift(root); } catch { /* non-fatal */ }
    let additionalContext = driftSummary.marked.length > 0
      ? `[ai-native-methodology] ⚠️ drift detected in ${driftSummary.marked.length} scope(s): ${driftSummary.marked.join(', ')}. Run: chain-driver sync --scope <slug> to cascade.`
      : '[ai-native-methodology] chain harness ready. M4 sync = drift auto-detect + manual cascade.';
    // ★ dep-graph P4 (operation.md 결정 7) — artifact-graph.json 있으면 dirty 노드 수 + top-3 impact root 주입.
    try {
      const graphInjection = buildGraphSessionContext(root);
      if (graphInjection) additionalContext += `\n${graphInjection}`;
    } catch { /* non-fatal — 그래프 없으면 skip */ }
    const out = {
      suppressOutput: true,
      hookSpecificOutput: { additionalContext },
      continue: true,
    };
    process.stdout.write(JSON.stringify(out) + '\n');
    if (driftSummary.marked.length > 0) {
      process.stderr.write(`[ai-native-methodology] ⚠️ drift detected: ${driftSummary.marked.join(', ')}\n`);
      process.stderr.write(`  → chain-driver sync --scope <slug>\n`);
    }
    process.exit(0);
  }
  if (event === 'UserPromptSubmit') {
    const skillId = suggestSkillForPrompt(payload.prompt);
    if (!skillId) {
      process.stdout.write(JSON.stringify({ suppressOutput: true, continue: true }) + '\n');
      process.exit(0);
    }
    const repoRoot = args.repoRoot || resolveRepoRoot(process.cwd());
    let meta = null;
    try { meta = loadSkill(repoRoot, skillId).meta; } catch { /* ok */ }
    // ★ v4.0 multi-agent paradigm (DEC-2026-05-17) — agent dispatch 권고 동봉 (C19: 기존 dead export 결선).
    const agentId = suggestAgentForPrompt(payload.prompt);
    const out = buildSuggestOutput({ skillId, meta, sessionId: payload.session_id, agentId });
    process.stdout.write(JSON.stringify(out) + '\n');
    process.stderr.write(formatSkillSuggestion(skillId, meta) + '\n');
    process.exit(0);
  }
  if (event === 'PreToolUse') {
    // attempt to resolve project from cwd and check blocked.
    const root = payload.cwd || process.cwd();
    let state = null;
    try { state = readState(root); } catch { state = null; }
    if (state) {
      const reason = shouldBlockToolUse({
        toolName: payload.tool_name,
        toolInput: payload.tool_input,
        state,
      });
      if (reason) {
        const out = buildBlockOutput({ reason, sessionId: payload.session_id, hookEventName: event });
        process.stdout.write(JSON.stringify(out) + '\n');
        process.stderr.write(`[chain-driver] PreToolUse blocked: ${reason}\n`);
        process.exit(2);
      }
    }
  }
  // ★ dep-graph P3 (operation.md 결정 5) — PostToolUse 시 chain/analysis artifact write 감지 → impact_pending 마킹.
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
            manifest.sync_state = manifest.sync_state || { drift_detected: false };
            manifest.sync_state.impact_pending = true;
            writeManifest(root, scope, manifest);
            markedScope = scope;
          }
        }
      } catch { /* non-fatal — manifest 없으면 stderr 안내만 */ }
      const note = `[ai-native-methodology] graph artifact 변경 감지 (${detected.artifact_kind}/${detected.artifact_subkind}: ${detected.filename})`
        + `${markedScope ? ` — scope '${markedScope}' impact_pending=true` : ''}. `
        + `영향 분석: chain-driver impact --graph <artifact-graph.json> --origin <node-id>`;
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
  process.stdout.write(JSON.stringify({ suppressOutput: true, continue: true }) + '\n');
  process.exit(0);
}

function cmdMigrate(args) {
  if (!args.project) usage(3);
  const root = resolve(args.project);
  let state;
  try { state = readState(root); } catch (e) { console.error(`[chain-driver] ${e.message}`); process.exit(4); }
  if (!state) { console.error('[chain-driver] no state.json'); process.exit(3); }
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
    process.stdout.write(`[chain-driver] migrated ${state.version} → ${migrated.version}\n`);
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
  if (!state) { console.error('[chain-driver] no state.json'); process.exit(3); }
  const base = args.baseSha || state.stage_progress?.[state.current_chain]?.git_baseline_sha || 'HEAD~1';
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
    decision: result.revisit_target ? `candidate:${result.revisit_target}` : 'none',
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
    if (existsSync(join(cur, 'ai-native-methodology', 'flows', 'sdlc-4stage-flow.json'))) {
      return join(cur, 'ai-native-methodology');
    }
    const parent = dirname(cur);
    if (parent === cur) break;
    cur = parent;
  }
  return start;
}

// ★ dep-graph P3 (operation.md 결정 4·5) — impact 분석 + 정책 평가 + propose JSONL 기록.
// usage: chain-driver impact --graph <artifact-graph.json> --origin <node-id>
//          [--change-kind typo|item_add|item_remove|semantic_change] [--policy <path>]
//          [--out-jsonl <path>] [--code-pointer-only] [--json]
function cmdImpact(args) {
  if (!args.graphPath || !args.origin) {
    console.error('[chain-driver] impact: --graph <path> and --origin <node-id> required');
    process.exit(3);
  }
  if (!existsSync(args.graphPath)) {
    console.error(`[chain-driver] impact: graph not found: ${args.graphPath}`);
    process.exit(3);
  }
  let graph;
  try { graph = JSON.parse(readFileSync(args.graphPath, 'utf-8')); }
  catch (e) { console.error(`[chain-driver] impact: graph parse error: ${e.message}`); process.exit(3); }

  // 정책 로드 (default = repo policies/propagation-policy.json)
  const policyPath = args.policyPath
    || join(resolveRepoRoot(process.cwd()), 'policies', 'propagation-policy.json');
  let policy = null;
  try { policy = loadPolicy(policyPath); } catch { policy = null; }

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
  const affectedIds = impact.merged.map(e => e.id);
  const ordered = cascadeOrder(affectedIds, topo.order);

  // 정책 평가 (evaluate_policy deliverable)
  const nodeById = new Map((graph.nodes ?? []).map(n => [n.id, n]));
  const originNode = nodeById.get(args.origin);
  const records = policy
    ? evaluatePolicyForEdges({
        affected: impact.merged, originNode, nodeById, policy, evaluatePolicy, changeKind,
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
    process.stdout.write(`[chain-driver impact] origin=${args.origin} change=${changeKind}\n`);
    process.stdout.write(`  MUST: ${impact.by_grade.MUST.join(', ') || '-'}\n`);
    process.stdout.write(`  SHOULD: ${impact.by_grade.SHOULD.join(', ') || '-'}\n`);
    process.stdout.write(`  FYI: ${impact.by_grade.FYI.join(', ') || '-'}\n`);
    if (topo.has_cycle) process.stdout.write(`  ⚠️ cycle detected — 자동 cascade 차단 (graph-integrity #15 fail)\n`);
    for (const rec of records) {
      process.stdout.write(`  [${rec.decision}] ${rec.affected_id} (${rec.grade}/${rec.direction}) — ${rec.reasoning}\n`);
    }
    if (args.outJsonl && records.length > 0) {
      process.stdout.write(`  written ${records.length} propose record(s) → ${args.outJsonl}\n`);
    }
  }
  process.exit(0);
}

function main() {
  const args = parseArgs(process.argv);
  switch (args.command) {
    case 'init':           return cmdInit(args);
    case 'state':          return cmdState(args);
    case 'next':           return cmdNext(args);
    case 'query':          return cmdQuery(args);
    case 'sync':           return cmdSync(args);
    case 'impact':         return cmdImpact(args);
    case 'navigate':       return cmdNavigate(args);
    case 'suggest-skill':  return cmdSuggestSkill(args);
    case 'hooks-bridge':   return cmdHooksBridge(args);
    case 'migrate':        return cmdMigrate(args);
    case 'revisit-detect': return cmdRevisitDetect(args);
    case '--help':
    case '-h':             return usage(0);
    default:               return usage(3);
  }
}

main();
