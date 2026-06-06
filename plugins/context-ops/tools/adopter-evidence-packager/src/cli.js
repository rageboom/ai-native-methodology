#!/usr/bin/env node
// adopter-evidence-packager CLI — Type 2 외부 adopter corroboration 캡처.
// state.json + manifest + findings + matrix → 익명화 corroboration → schema 검증 → leak guard → write.
// exit: 0 = packaged+valid / 1 = schema invalid 또는 post-redaction PII 잔존(필드 경로) / 2 = usage·read error.

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { resolve, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import { buildCorroboration } from './packager.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PLUGIN_ROOT = resolve(__dirname, '..', '..', '..'); // tools/adopter-evidence-packager/src → plugin root
const SCHEMA_PATH = join(PLUGIN_ROOT, 'schemas', 'adopter-corroboration.schema.json');

function readJson(path, label) {
  try { return JSON.parse(readFileSync(resolve(path), 'utf-8')); }
  catch (e) { console.error(`[adopter-packager] ERROR — ${label} 읽기 실패 (${path}): ${e.message}`); process.exit(2); }
}

function parseArgs(argv) {
  const a = { format: 'text' };
  for (let i = 0; i < argv.length; i++) {
    const k = argv[i];
    const next = () => argv[++i];
    switch (k) {
      case '--state': a.state = next(); break;
      case '--manifest': a.manifest = next(); break;
      case '--findings': a.findings = next(); break;
      case '--matrix': a.matrix = next(); break;
      case '--out': a.out = next(); break;
      case '--plugin-version': a.pluginVersion = next(); break;
      case '--plugin-root': a.pluginRoot = next(); break;
      case '--salt': a.salt = next(); break;
      case '--adopter-id': a.adopterIdRaw = next(); break;
      case '--project-id': a.projectIdRaw = next(); break;
      case '--org-type': a.orgType = next(); break;
      case '--stack': a.stackSignals = next().split(',').map((s) => s.trim()).filter(Boolean); break;
      case '--scenario': a.scenario = next(); break;
      case '--loc-bucket': a.locBucket = next(); break;
      case '--feedback': a.feedback = next(); break;
      case '--friction': a.frictionPoints = next().split('|').map((s) => s.trim()).filter(Boolean); break;
      case '--captured-at': a.capturedAt = next(); break;
      case '--no-redact': a.noRedact = true; break;
      case '--dry-run': a.dryRun = true; break;
      case '--json': a.format = 'json'; break;
      case '--help': case '-h': a.help = true; break;
      default:
        if (!a.state && !k.startsWith('--')) a.state = k;
        break;
    }
  }
  return a;
}

function resolvePluginVersion(args) {
  if (args.pluginVersion) return args.pluginVersion;
  const root = args.pluginRoot ? resolve(args.pluginRoot) : PLUGIN_ROOT;
  const p = join(root, '.claude-plugin', 'plugin.json');
  if (existsSync(p)) {
    try { return JSON.parse(readFileSync(p, 'utf-8')).version; } catch { /* fall through */ }
  }
  return null;
}

function printHelp() {
  console.error([
    'Usage: adopter-evidence-packager --state <.aimd/state.json> [opts]',
    '',
    'Type 2 외부 adopter corroboration 캡처 (익명화 / opt-in / consent).',
    '입력: .aimd/state.json (필수) + scope manifest + findings + traceability-matrix.',
    '출력: .aimd/output/adopter-corroboration.json (익명화 / schema 검증 / PII leak guard).',
    '',
    '옵션:',
    '  --state <path>        .aimd/state.json (positional 로도 가능 / 필수)',
    '  --manifest <path>     scope manifest.json (scenario / stack_signals)',
    '  --findings <path>     findings 카운트 json ({critical,high,medium,low,info})',
    '  --matrix <path>       traceability matrix.json (coverage)',
    '  --plugin-version <v>  방법론 버전 (미지정 시 plugin.json 자동)',
    '  --plugin-root <dir>   plugin.json 탐색 root override',
    '  --salt <s>            가명화 salt (rainbow-table 회피 / 권장)',
    '  --adopter-id <raw>    adopter 식별자 raw (hash 됨 / 미지정 시 state.project_id)',
    '  --project-id <raw>    project 식별자 raw (hash 됨 / 미지정 시 state.project_id)',
    '  --org-type <enum>     internal-team|external-oss|individual|undisclosed (기본 undisclosed)',
    '  --stack <csv>         스택 신호 csv (미지정 시 manifest.stack_signals)',
    '  --scenario <enum>     S1|S2|S3|greenfield (미지정 시 manifest.scenario / 기본 S1)',
    '  --loc-bucket <enum>   <1k|1k-10k|10k-100k|100k+|undisclosed',
    '  --feedback <text>     자유 피드백 (redaction 통과)',
    '  --friction <a|b|c>    friction point (| 구분 / redaction 통과)',
    '  --captured-at <iso>   캡처 시각 override (기본 now / 결정성 테스트용)',
    '  --no-redact           redaction skip (leak guard 는 항상 enforce / 검증·사전정제 입력 전용)',
    '  --dry-run             stdout 출력만 / 파일 미작성',
    '  --json                machine-readable',
    '',
    'exit: 0=packaged+valid / 1=schema invalid 또는 PII 잔존 / 2=usage·read error',
  ].join('\n'));
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) { printHelp(); process.exit(0); }
  if (!args.state) { printHelp(); process.exit(2); }

  const state = readJson(args.state, 'state.json');
  const manifest = args.manifest ? readJson(args.manifest, 'manifest') : undefined;
  const findings = args.findings ? readJson(args.findings, 'findings') : undefined;
  const matrix = args.matrix ? readJson(args.matrix, 'matrix') : undefined;

  const pluginVersion = resolvePluginVersion(args);
  if (!pluginVersion) {
    console.error('[adopter-packager] ERROR — plugin_version 결정 실패: --plugin-version 명시 또는 --plugin-root 의 .claude-plugin/plugin.json 필요');
    process.exit(2);
  }

  const capturedAt = args.capturedAt || new Date().toISOString();
  const { corroboration, redaction_count, leak_hits } = buildCorroboration({
    state, manifest, findings, matrix,
    pluginVersion, salt: args.salt,
    adopterIdRaw: args.adopterIdRaw, projectIdRaw: args.projectIdRaw,
    orgType: args.orgType, stackSignals: args.stackSignals,
    scenario: args.scenario, locBucket: args.locBucket,
    feedback: args.feedback, frictionPoints: args.frictionPoints,
    capturedAt, noRedact: args.noRedact,
  });

  // ── schema 검증 ──
  const schema = readJson(SCHEMA_PATH, 'schema');
  const ajv = new Ajv2020({ allErrors: true, strict: false, allowUnionTypes: true });
  addFormats(ajv);
  const validate = ajv.compile(schema);
  const valid = validate(corroboration);

  // ── post-redaction leak guard (Senior REVISE-3 / silent wall ❌) ──
  if (leak_hits.length > 0) {
    const detail = leak_hits.map((h) => `${h.field} (${h.labels.join(',')})`).join('; ');
    if (args.format === 'json') {
      console.log(JSON.stringify({ ok: false, reason: 'pii_leak', leak_hits, redaction_count }, null, 2));
    } else {
      console.error(`[adopter-packager] LEAK GUARD — post-redaction PII 잔존 ${leak_hits.length}건: ${detail}`);
      console.error('  → 해당 필드 입력에서 PII 제거 후 재실행 (best-effort regex 가 놓친 케이스 / no-redact 사용 시 redaction 우회됨).');
    }
    process.exit(1);
  }

  if (!valid) {
    const detail = (validate.errors || []).map((e) => `${e.instancePath || '/'} ${e.message}`).join('; ');
    if (args.format === 'json') {
      console.log(JSON.stringify({ ok: false, reason: 'schema_invalid', errors: validate.errors }, null, 2));
    } else {
      console.error(`[adopter-packager] SCHEMA INVALID — ${detail}`);
    }
    process.exit(1);
  }

  // ── write (dry-run 아닐 때) ──
  const outPath = args.out
    ? resolve(args.out)
    : resolve(dirname(resolve(args.state)), 'output', 'adopter-corroboration.json');

  if (args.dryRun) {
    if (args.format === 'json') console.log(JSON.stringify({ ok: true, dry_run: true, redaction_count, corroboration }, null, 2));
    else { console.log(`[adopter-packager] DRY-RUN — corroboration valid (redaction ${redaction_count}건 / PII leak 0). 미작성. out=${outPath}`); console.log(JSON.stringify(corroboration, null, 2)); }
    process.exit(0);
  }

  try {
    mkdirSync(dirname(outPath), { recursive: true });
    writeFileSync(outPath, JSON.stringify(corroboration, null, 2) + '\n', 'utf-8');
  } catch (e) {
    console.error(`[adopter-packager] ERROR — 출력 작성 실패 (${outPath}): ${e.message}`);
    process.exit(2);
  }

  if (args.format === 'json') console.log(JSON.stringify({ ok: true, out: outPath, redaction_count }, null, 2));
  else console.log(`[adopter-packager] ✓ corroboration 작성 — ${outPath} (redaction ${redaction_count}건 / PII leak 0 / schema valid)`);
  process.exit(0);
}

main();
