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

const MANIFEST_STAGES = ['planning', 'spec', 'test', 'impl'];
function stageToManifestStage(stage) {
  return stage === 'implement' ? 'impl' : stage;
}
import { loadFlow, nextStage, validateStateAgainstFlow, getGateForStage } from './stage-graph.js';
import { evaluateGate, applyUserDecision, requiredValidators } from './gate-eval.js';
import { loadSkill, formatSkillSuggestion } from './invoke-skill.js';
import {
  parseHookInput, buildSuggestOutput, buildBlockOutput,
  suggestSkillForPrompt, shouldBlockToolUse,
} from './hooks-bridge.js';
import { gitDiffNumstat, detectRevisit } from './revisit-detect.js';

function usage(code = 3) {
  console.error([
    'usage: chain-driver <command> [options]',
    '',
    'commands:',
    '  init <project> [--scope <slug>]',
    '  state <project> [--json]',
    '  next <project> [--findings <path>] [--user-decision <go|stop|revisit:STAGE>] [--dry-run]',
    '  query <project> [--scope <slug>] [--stage <s>] [--ref <id>] [--stale]',
    '  sync <project> [--scope <slug>]',
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
    else if (a === '--stage') out.stage = rest[++i];
    else if (a === '--ref') out.ref = rest[++i];
    else if (a === '--stale') out.stale = true;
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
      ensureScopeDir(root, args.scope);
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
  if (!path) return { critical: 0, high: 0, medium: 0, low: 0, info: 0 };
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

  const stage = state.current_chain === 'analysis' ? 'planning' : state.current_chain;
  const findings = loadFindings(args.findingsPath);
  const gateResult = evaluateGate(stage === 'analysis' ? 'planning' : stage, findings);
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
    const additionalContext = driftSummary.marked.length > 0
      ? `[ai-native-methodology] ⚠️ drift detected in ${driftSummary.marked.length} scope(s): ${driftSummary.marked.join(', ')}. Run: chain-driver sync --scope <slug> to cascade.`
      : '[ai-native-methodology] chain harness ready. M4 sync = drift auto-detect + manual cascade.';
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
    const out = buildSuggestOutput({ skillId, meta, sessionId: payload.session_id });
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

function main() {
  const args = parseArgs(process.argv);
  switch (args.command) {
    case 'init':           return cmdInit(args);
    case 'state':          return cmdState(args);
    case 'next':           return cmdNext(args);
    case 'query':          return cmdQuery(args);
    case 'sync':           return cmdSync(args);
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
