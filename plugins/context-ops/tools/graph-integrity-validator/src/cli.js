#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { validateGraph } from "./validator.js";

const args = process.argv.slice(2);
let graphPath = null;
let format = "text";

for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === "--format") {
    format = args[++i];
  } else if (a === "--help" || a === "-h") {
    printHelp();
    process.exit(0);
  } else if (!graphPath) {
    graphPath = a;
  }
}

if (!graphPath) {
  printHelp();
  process.exit(2);
}

let graph;
try {
  graph = JSON.parse(readFileSync(resolve(graphPath), "utf8"));
} catch (err) {
  console.error(`[graph-integrity] ERROR — ${graphPath} 읽기 실패: ${err.message}`);
  process.exit(2);
}

const result = validateGraph(graph);

if (format === "json") {
  console.log(JSON.stringify(result, null, 2));
} else {
  printText(result);
}

process.exit(result.passed ? 0 : 1);

function printHelp() {
  console.error(
    [
      "Usage: graph-integrity-validator <path-to-artifact-graph.json> [--format text|json]",
      "",
      "검증 항목:",
      "  - DFS cycle 감지 (back-edge → 사이클 경로)",
      "  - Tier-1 orphan 감지 (state ∈ {active, drift} 중 in/out 엣지 모두 없음)",
      "  - Unknown edge 감지 (source/target 이 nodes 배열에 없음)",
      "",
      "exit code:",
      "  0 = pass",
      "  1 = fail (cycle/orphan/unknown 중 ≥ 1)",
      "  2 = usage error / 파일 읽기 실패",
    ].join("\n")
  );
}

function printText(result) {
  const s = result.summary;
  if (result.passed) {
    console.log(
      `[graph-integrity] PASS — nodes=${s.node_count} edges=${s.edge_count} cycles=0 orphans=0 unknown=0`
    );
    return;
  }

  console.log(
    `[graph-integrity] FAIL — nodes=${s.node_count} edges=${s.edge_count} cycles=${s.cycle_count} orphans=${s.orphan_count} unknown=${s.unknown_edge_count}`
  );

  if (result.cycles.length > 0) {
    console.log(`  Cycles (${result.cycles.length}):`);
    for (const c of result.cycles) {
      console.log(`    - ${c.join(" → ")}`);
    }
  }
  if (result.orphans.length > 0) {
    console.log(`  Orphans (${result.orphans.length}):`);
    for (const o of result.orphans) {
      console.log(`    - ${o.id} (${o.reason})`);
    }
  }
  if (result.unknown_edges.length > 0) {
    console.log(`  Unknown edges (${result.unknown_edges.length}):`);
    for (const u of result.unknown_edges) {
      console.log(
        `    - ${u.edge.source} → ${u.edge.target} (${u.reason})`
      );
    }
  }
}
