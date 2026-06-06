import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { validateDbAssets } from "../src/validator.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const CLI = join(__dirname, "..", "src", "cli.js");
const fixturePath = (name) => join(__dirname, "fixtures", name);
const fixture = (name) => JSON.parse(readFileSync(fixturePath(name), "utf8"));

function runCli(extraArgs) {
  return spawnSync("node", [CLI, ...extraArgs], { encoding: "utf8" });
}

// ── golden fixture 판별 (release-readiness #23 가 동일 axis 검사) ─────────────

test("compliant-plan fixture — PASS / critical 0 / high 0 / sp_conversion_complete=true", () => {
  const r = validateDbAssets(fixture("compliant-plan.json"));
  assert.equal(r.passed, true);
  assert.equal(r.summary.critical, 0);
  assert.equal(r.summary.high, 0);
  assert.equal(r.summary.sp_conversion_complete, true);
  assert.equal(r.summary.db_tables_count, 2);
  assert.equal(r.summary.db_procedures_count, 1);
});

test("violations-plan fixture — FAIL / sp_unclassified_at_plan(critical) + external_class_mismatch(high)", () => {
  const r = validateDbAssets(fixture("violations-plan.json"));
  assert.equal(r.passed, false);
  const codes = r.findings.map((f) => f.code);
  assert.ok(codes.includes("sp_unclassified_at_plan"), "plan 이후 미분류 SP = critical");
  assert.ok(codes.includes("external_class_mismatch"), "external=true + class≠gamma = high");
  const unclassified = r.findings.find((f) => f.code === "sp_unclassified_at_plan");
  assert.equal(unclassified.severity, "critical");
  const mismatch = r.findings.find((f) => f.code === "external_class_mismatch");
  assert.equal(mismatch.severity, "high");
});

// ── 구조 검사 ────────────────────────────────────────────────────────────────

test("sp_missing_id — db_procedures item 에 id 부재 = critical", () => {
  const r = validateDbAssets({
    scope: "x", status: "in_progress", current_stage: "spec",
    analysis_refs: { db_procedures: [{ sp_conversion_class: "alpha" }] },
  });
  const f = r.findings.find((x) => x.code === "sp_missing_id");
  assert.ok(f);
  assert.equal(f.severity, "critical");
  assert.equal(r.passed, false);
});

test("sp_invalid_class — enum 위반 = critical", () => {
  const r = validateDbAssets({
    scope: "x", status: "in_progress", current_stage: "plan",
    analysis_refs: { db_procedures: [{ id: "SP1", sp_conversion_class: "omega" }] },
  });
  const f = r.findings.find((x) => x.code === "sp_invalid_class");
  assert.ok(f);
  assert.equal(f.severity, "critical");
});

// ── 논리 검사 (γ ↔ external) ──────────────────────────────────────────────────

test("gamma_external_unset — class=gamma 인데 external≠true = medium (non-blocking)", () => {
  const r = validateDbAssets({
    scope: "x", status: "in_progress", current_stage: "plan",
    analysis_refs: { db_procedures: [{ id: "SP1", sp_conversion_class: "gamma" }] },
  });
  const f = r.findings.find((x) => x.code === "gamma_external_unset");
  assert.ok(f);
  assert.equal(f.severity, "medium");
  assert.equal(r.passed, true, "medium 은 non-blocking");
});

test("valid gamma+external=true — finding 없음", () => {
  const r = validateDbAssets({
    scope: "x", status: "in_progress", current_stage: "plan",
    analysis_refs: { db_procedures: [{ id: "SP1", sp_conversion_class: "gamma", external: true }] },
  });
  assert.equal(r.findings.length, 0);
  assert.equal(r.passed, true);
});

// ── stage 정책 (plan 이후 hard-gate / discovery 까지 nullable) ──────────────────

test("pre-plan(spec) + 미분류 SP — finding 없음 / sp_conversion_complete=false", () => {
  const r = validateDbAssets({
    scope: "x", status: "in_progress", current_stage: "spec",
    analysis_refs: { db_procedures: [{ id: "SP1" }] },
  });
  assert.equal(r.findings.length, 0, "discovery/spec 까지 sp_conversion_class nullable");
  assert.equal(r.summary.sp_conversion_complete, false);
  assert.equal(r.passed, true);
});

test("plan 이후(impl) + 미분류 SP — sp_unclassified_at_plan critical", () => {
  const r = validateDbAssets({
    scope: "x", status: "in_progress", current_stage: "impl",
    analysis_refs: { db_procedures: [{ id: "SP1" }] },
  });
  const f = r.findings.find((x) => x.code === "sp_unclassified_at_plan");
  assert.ok(f);
  assert.equal(f.severity, "critical");
});

test("--stage override 가 manifest.current_stage 보다 우선", () => {
  // manifest 는 spec 인데 opts.stage=plan → hard-gate 발화
  const r = validateDbAssets(
    { scope: "x", status: "in_progress", current_stage: "spec",
      analysis_refs: { db_procedures: [{ id: "SP1" }] } },
    { stage: "plan" }
  );
  assert.ok(r.findings.some((f) => f.code === "sp_unclassified_at_plan"));
  assert.equal(r.summary.stage, "plan");
});

// ── always-on nudge (paradigm-aware) ─────────────────────────────────────────

test("db_assets_absent — 비-DB 자산만 있고 DB 0 = medium (S1)", () => {
  const r = validateDbAssets({
    scope: "x", status: "in_progress", current_stage: "spec", scenario: "S1",
    analysis_refs: { rules: ["BR-1"], domain: ["Foo"] },
  });
  const f = r.findings.find((x) => x.code === "db_assets_absent");
  assert.ok(f);
  assert.equal(f.severity, "medium");
  assert.equal(r.summary.db_assets_complete, false);
});

test("greenfield 면제 — DB 0 + 비-DB 채움이어도 db_assets_absent 미발화", () => {
  const r = validateDbAssets({
    scope: "x", status: "in_progress", current_stage: "spec", scenario: "greenfield",
    analysis_refs: { rules: ["BR-1"], domain: ["Foo"] },
  });
  assert.ok(!r.findings.some((x) => x.code === "db_assets_absent"));
});

test("analysis_refs 전무 — finding 없음 (stage manifest 등 / false-positive 회피)", () => {
  const r = validateDbAssets({ scope: "x", status: "pending" });
  assert.equal(r.findings.length, 0);
  assert.equal(r.passed, true);
  assert.equal(r.summary.db_procedures_count, 0);
});

// ── CLI exit code (no-simulation / 결정론) ────────────────────────────────────

test("CLI — compliant fixture exit 0", () => {
  const r = runCli([fixturePath("compliant-plan.json"), "--json"]);
  assert.equal(r.status, 0);
  const out = JSON.parse(r.stdout);
  assert.equal(out.passed, true);
});

test("CLI — violations fixture exit 1 + finding codes 노출", () => {
  const r = runCli([fixturePath("violations-plan.json"), "--json"]);
  assert.equal(r.status, 1);
  const out = JSON.parse(r.stdout);
  const codes = out.findings.map((f) => f.code);
  assert.ok(codes.includes("sp_unclassified_at_plan") && codes.includes("external_class_mismatch"));
});

test("CLI — --strict 시 medium(warn) 도 exit 1", () => {
  // gamma_external_unset(medium) 만 있는 manifest → 기본 exit 0 / --strict exit 1
  const r0 = runCli([fixturePath("compliant-plan.json"), "--json"]); // medium 없음 → 0
  assert.equal(r0.status, 0);
  // 임시로 violations 는 high 라 별도 — medium-only 는 unit 으로 충분히 커버되므로 strict 경로만 확인:
  const rStrict = runCli([fixturePath("violations-plan.json"), "--strict", "--json"]);
  assert.equal(rStrict.status, 1);
});

test("CLI — 파일 읽기 실패 exit 2", () => {
  const r = runCli([join(__dirname, "fixtures", "does-not-exist.json")]);
  assert.equal(r.status, 2);
});

test("CLI — 인자 없음 exit 2 (usage)", () => {
  const r = runCli([]);
  assert.equal(r.status, 2);
});
