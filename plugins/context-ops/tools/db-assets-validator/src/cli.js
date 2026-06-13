#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { writeStdoutSync } from '../../_shared/write-stdout-sync.js';
import { resolve } from "node:path";
import { validateDbAssets } from "./validator.js";

const args = process.argv.slice(2);
let manifestPath = null;
let format = "text";
let stage = null;
let strict = false;

for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === "--manifest") {
    manifestPath = args[++i];
  } else if (a === "--stage") {
    stage = args[++i];
  } else if (a === "--format") {
    format = args[++i];
  } else if (a === "--json") {
    format = "json";
  } else if (a === "--strict") {
    strict = true;
  } else if (a === "--help" || a === "-h") {
    printHelp();
    process.exit(0);
  } else if (!manifestPath) {
    // positional manifest path (편의 — --manifest 생략 가능)
    manifestPath = a;
  }
}

if (!manifestPath) {
  printHelp();
  process.exit(2);
}

let manifest;
try {
  manifest = JSON.parse(readFileSync(resolve(manifestPath), "utf8"));
} catch (err) {
  console.error(`[db-assets] ERROR — ${manifestPath} 읽기 실패: ${err.message}`);
  process.exit(2);
}

const result = validateDbAssets(manifest, { stage });

if (format === "json") {
  writeStdoutSync(JSON.stringify(result, null, 2));
} else {
  printText(result);
}

// exit: blocking (critical/high) = 1 / --strict 시 warn(medium/low) 도 1 / 그 외 0.
const blocking = result.summary.critical > 0 || result.summary.high > 0;
const strictBlocking = strict && result.summary.total_findings > 0;
process.exit(blocking || strictBlocking ? 1 : 0);

function printHelp() {
  console.error(
    [
      "Usage: db-assets-validator <manifest.json> [--stage <s>] [--format text|json] [--strict]",
      "",
      "DB 자산 always-on 정책 검사 (db-assets-always-on.md §8.4 / F-DB-AUTOVAL-001).",
      "work-unit-manifest.json 의 analysis_refs 안 db_tables/db_procedures/db_functions/db_views 검사.",
      "",
      "옵션:",
      "  --manifest <path>  검사 대상 manifest (positional 로도 가능)",
      "  --stage <s>        stage 명시 override (미지정 시 manifest.stage / current_stage 자동 추론)",
      "  --json             machine-readable 출력",
      "  --strict           medium/low(warn) finding 도 exit 1 (CI / pre-chain audit 용)",
      "",
      "검사 항목:",
      "  - sp_missing_id (critical) / sp_invalid_class (critical) / sp_unclassified_at_plan (critical, plan 이후)",
      "  - external_class_mismatch (high) / gamma_external_unset (medium) / db_assets_absent (medium, greenfield 면제)",
      "",
      "exit code:",
      "  0 = pass (critical/high 0 / --strict 시 finding 0)",
      "  1 = fail (critical/high ≥ 1 / --strict 시 finding ≥ 1)",
      "  2 = usage error / 파일 읽기 실패",
    ].join("\n")
  );
}

function printText(result) {
  const s = result.summary;
  const head = `[db-assets] ${result.passed ? "PASS" : "FAIL"} — stage=${s.stage} scenario=${s.scenario} tables=${s.db_tables_count} SP=${s.db_procedures_count} fn=${s.db_functions_count} views=${s.db_views_count} sp_classified=${s.sp_conversion_complete ? "✓" : "✗"}`;
  console.log(head);
  if (result.findings.length === 0) {
    return;
  }
  console.log(`  findings (${result.findings.length}) — critical=${s.critical} high=${s.high} medium=${s.medium} low=${s.low}:`);
  for (const f of result.findings) {
    console.log(`    - [${f.severity}] ${f.code}: ${f.message}`);
  }
}
