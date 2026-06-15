// calibrate.js — PURE calibration logic for codegraph caller-resolution accuracy.
//
// Codifies the 2026-06-15 manual calibration (DEC-2026-06-15-codegraph-search-token-saving §calibration):
//   codegraph `callers <symbol>` answer  ↔  independent identifier-call grep proxy (ground truth).
// Output = reference-lens verdict {PASS = authoritative-capable / WARN = valve-prominent}, NEVER a gate.
//
// All functions here are PURE (no fs / no child_process) so tests inject synthetic codegraph results +
// file contents — the CLI (cli.js) does the real I/O (real codegraph CLI + real source read = no-simulation).
//
// Why two signals feed the verdict:
//   (1) precision — observed wrong caller-files (codegraph reported a file with no real call = phantom edge).
//   (2) fabrication-risk scan — STRUCTURAL precondition for the impossible-edge failure (ep-fe-mis 5,050):
//       a collision symbol (defined in >1 file) CALLED from a file that lacks a local definition →
//       codegraph may last-resort bind cross-folder. Self-contained repos (every call has a local def)
//       are folder-local-safe even with name collisions (verified: tools/ parseArgs 26 defs, 0 risk).

const DEFAULT_SOURCE_EXT = ['.js', '.mjs', '.cjs', '.ts', '.tsx', '.jsx', '.java', '.py', '.go', '.rb'];

// Lines that are imports/requires (a symbol appearing here is not a call site).
const IMPORT_RE = /^\s*(import\b|.*\brequire\s*\(|from\s+['"]|#include\b|\buse\b)/;

// Candidate function/method symbol names from source text (for sampling WHICH symbols to test).
// Pragmatic, JS/TS-leaning + basic Java/Python/Go; imperfect extraction only affects sample composition,
// never the per-symbol comparison (which is symbol-name driven).
function extractSymbols(text) {
	const names = new Set();
	const patterns = [
		/\bfunction\s+([A-Za-z_$][\w$]*)\s*\(/g, // function foo(
		/\bexport\s+(?:default\s+)?(?:async\s+)?function\s+([A-Za-z_$][\w$]*)/g, // export function foo
		/\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?(?:\([^)]*\)|[A-Za-z_$][\w$]*)\s*=>/g, // const foo = (..) =>
		/\bdef\s+([A-Za-z_][\w]*)\s*\(/g, // python def foo(
		/\bfunc\s+([A-Za-z_][\w]*)\s*\(/g, // go func foo(
	];
	for (const re of patterns) {
		let m;
		while ((m = re.exec(text)) !== null) {
			if (m[1] && m[1].length > 2) names.add(m[1]);
		}
	}
	return [...names];
}

// Deterministic sample of up to `n` symbols from a sorted candidate list (stride sampling for spread).
function sampleSymbols(allSymbols, n) {
	const sorted = [...new Set(allSymbols)].sort();
	if (sorted.length <= n) return sorted;
	const stride = sorted.length / n;
	const out = [];
	for (let i = 0; i < n; i++) out.push(sorted[Math.floor(i * stride)]);
	return [...new Set(out)];
}

// Files whose text CALLS `symbol` (identifier + `(`), excluding the definition line and import lines.
// fileContents = Map/obj filePath -> text. Returns sorted distinct file list.
function callSiteFiles(symbol, fileContents) {
	// `\b…\(` matches whole-identifier calls incl. namespace member calls (`svc.foo(`) — codegraph resolves
	// some of those too, so counting them is the FAIRER proxy (excluding them under-credits codegraph).
	// NOTE: a grep proxy is NOT ground truth for caller resolution — disagreements cluster at the
	// member/namespace-call boundary (the static frontier). This tool measures AGREEMENT, not absolute
	// accuracy; per-symbol disagreement files are surfaced for human review.
	const callRe = new RegExp(`\\b${escapeRe(symbol)}\\s*\\(`);
	const defRe = defRegex(symbol);
	const files = [];
	for (const [file, text] of entries(fileContents)) {
		const hit = text.split('\n').some((line) => {
			if (!callRe.test(line)) return false;
			if (IMPORT_RE.test(line)) return false;
			if (defRe.test(line)) return false; // the definition line itself is not a call
			return true;
		});
		if (hit) files.push(file);
	}
	return files.sort();
}

// Files whose text DEFINES `symbol` (function / const-arrow / def / func). Sorted distinct.
function defFiles(symbol, fileContents) {
	const defRe = defRegex(symbol);
	const files = [];
	for (const [file, text] of entries(fileContents)) {
		if (defRe.test(text)) files.push(file);
	}
	return files.sort();
}

function defRegex(symbol) {
	const s = escapeRe(symbol);
	return new RegExp(
		`(\\bfunction\\s+${s}\\b)|(\\b(?:const|let|var)\\s+${s}\\s*=)|(\\bdef\\s+${s}\\b)|(\\bfunc\\s+${s}\\b)`,
	);
}

function escapeRe(s) {
	return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function entries(fileContents) {
	return fileContents instanceof Map ? [...fileContents.entries()] : Object.entries(fileContents);
}

// ── comparison (file granularity) ────────────────────────────────────────────
// cgCallerFiles = files codegraph reported as callers of `symbol`.
// gtCallSiteFiles = files the grep proxy found a real call in.
function compareSymbol(symbol, cgCallerFiles, gtCallSiteFiles) {
	const cg = new Set(cgCallerFiles);
	const gt = new Set(gtCallSiteFiles);
	const matched = [...cg].filter((f) => gt.has(f));
	const cgOnly = [...cg].filter((f) => !gt.has(f)); // codegraph reported, no real call → phantom / FP
	const gtOnly = [...gt].filter((f) => !cg.has(f)); // real call, codegraph missed → FN
	return {
		symbol,
		matched: matched.length,
		cg_only: cgOnly.length,
		gt_only: gtOnly.length,
		cg_only_files: cgOnly,
		gt_only_files: gtOnly,
		vacuous: cg.size === 0 && gt.size === 0,
	};
}

function aggregate(perSymbol) {
	let tp = 0,
		fp = 0,
		fn = 0,
		measured = 0;
	for (const r of perSymbol) {
		if (r.vacuous) continue;
		measured++;
		tp += r.matched;
		fp += r.cg_only;
		fn += r.gt_only;
	}
	const precision = tp + fp === 0 ? null : tp / (tp + fp);
	const recall = tp + fn === 0 ? null : tp / (tp + fn);
	return { measured, tp, fp, fn, precision, recall };
}

// Structural fabrication-risk: collision symbols (defs > 1) CALLED from a file lacking a local def.
// Conservative proxy (over-counts legit unique cross-module imports) — WARN bias is safe-by-design.
function scanFabricationRisk(defsBySymbol, callsBySymbol) {
	const risks = [];
	let collisionSymbols = 0;
	for (const [sym, defFileList] of entries(defsBySymbol)) {
		if ((defFileList?.length ?? 0) <= 1) continue;
		collisionSymbols++;
		const calls = callsBySymbol[sym] || (callsBySymbol instanceof Map ? callsBySymbol.get(sym) : []) || [];
		const defSet = new Set(defFileList);
		const callWithoutLocalDef = calls.filter((f) => !defSet.has(f));
		if (callWithoutLocalDef.length) {
			risks.push({ symbol: sym, def_count: defFileList.length, call_without_local_def: callWithoutLocalDef });
		}
	}
	return { collision_symbols: collisionSymbols, risk_count: risks.length, risks };
}

// Verdict: PASS (authoritative-capable) iff BIDIRECTIONAL agreement (precision AND recall >= threshold)
// AND no fabrication structural risk. PASS is intentionally hard — it gates the OPTIONAL P3 hard-block.
// Default threshold 0.9 = "high agreement" (NOT a perfection/accuracy claim — proxy ≠ ground truth).
function computeVerdict(agg, fab, opts = {}) {
	const T = opts.precisionThreshold ?? 0.9;
	const reasons = [];
	let pass = true;
	if (agg.precision === null || agg.recall === null) {
		pass = false;
		reasons.push('no measurable symbols (sample produced only vacuous comparisons)');
	} else {
		if (agg.precision < T) {
			pass = false;
			reasons.push(`precision ${agg.precision.toFixed(3)} < ${T} (codegraph reported caller-files with no proxy-visible call)`);
		}
		if (agg.recall < T) {
			pass = false;
			reasons.push(`recall ${agg.recall.toFixed(3)} < ${T} (proxy-visible call-files codegraph did not report — often member/namespace calls)`);
		}
	}
	if (fab.risk_count > 0) {
		pass = false;
		reasons.push(
			`fabrication-risk: ${fab.risk_count} collision symbol(s) called from a file without a local definition (cross-folder bind risk / impossible-edge precondition)`,
		);
	}
	return {
		verdict: pass ? 'PASS' : 'WARN',
		authoritative_capable: pass,
		agreement_threshold: T,
		reasons: pass
			? ['precision AND recall >= threshold (high bidirectional agreement)', 'no fabrication risk (collision symbols folder-local)']
			: reasons,
		// What PASS unlocks (consumer = future P3 hard-block, still §8.1-gated):
		guidance: pass
			? 'high agreement on this target — eligible for navigation-authority (P3 hard-block) when index_fresh; review per-symbol disagreements first. grep stays the falsification valve.'
			: 'keep codegraph as reference-lens here — prefer additive-injection/nudge; grep authoritative. Do NOT hard-block. Inspect per-symbol disagreement files (often member/namespace-call boundary).',
	};
}

// Full report assembly — PURE (cgCallersBySymbol + fileContents injected by CLI).
function calibrate({ cgCallersBySymbol, fileContents, symbols, opts = {} }) {
	const perSymbol = symbols.map((sym) => {
		const cgFiles = (cgCallersBySymbol[sym] || (cgCallersBySymbol instanceof Map ? cgCallersBySymbol.get(sym) : []) || []);
		return compareSymbol(sym, cgFiles, callSiteFiles(sym, fileContents));
	});
	const agg = aggregate(perSymbol);
	const defsBySymbol = {};
	const callsBySymbol = {};
	for (const sym of symbols) {
		defsBySymbol[sym] = defFiles(sym, fileContents);
		callsBySymbol[sym] = callSiteFiles(sym, fileContents);
	}
	const fab = scanFabricationRisk(defsBySymbol, callsBySymbol);
	const verdict = computeVerdict(agg, fab, opts);
	return {
		reference_lens: true,
		gate_injected: false,
		trust_note:
			'reference-lens calibration — NEVER injected into deterministic chain gates (DEC-2026-05-28 §4.2). PASS only gates the OPTIONAL navigation-authority (P3), bounded by the always-available grep falsification valve.',
		sampled: symbols.length,
		aggregate: agg,
		fabrication_scan: fab,
		per_symbol: perSymbol,
		...verdict,
	};
}

export {
	DEFAULT_SOURCE_EXT,
	extractSymbols,
	sampleSymbols,
	callSiteFiles,
	defFiles,
	compareSymbol,
	aggregate,
	scanFabricationRisk,
	computeVerdict,
	calibrate,
};
