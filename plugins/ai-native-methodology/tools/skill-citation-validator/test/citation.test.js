// skill-citation-validator test — 결정적 / no-simulation.
// repo-wide (v8.1.1): regression-guard (실 repo 0 / dogfood) + synthetic 양성 + history/absence/migration-table FP 필터.

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join } from 'node:path';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { checkCitations } from '../src/check-citations.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..', '..', '..');

describe('skill-citation-validator (repo-wide v8.1.1)', () => {
	it('실 repo active 표면 = 0 stale citation (regression-guard / dogfood)', () => {
		const r = checkCitations(REPO_ROOT);
		assert.equal(
			r.finding_count,
			0,
			`stale citation 재유입: ${JSON.stringify(r.findings, null, 2)}`,
		);
		assert.ok(
			r.scanned_file_count >= 150,
			`scanned=${r.scanned_file_count} (repo-wide active doc 예상 ≥150)`,
		);
	});

	it('synthetic — schema/repo-path/ADR/DEC 검출 + history/absence/migration-table/relative FP 필터', () => {
		const tmp = mkdtempSync(join(tmpdir(), 'scv-'));
		try {
			mkdirSync(join(tmp, 'schemas'), { recursive: true });
			writeFileSync(join(tmp, 'schemas', 'real.schema.json'), '{}');
			mkdirSync(join(tmp, 'docs', 'adr'), { recursive: true });
			writeFileSync(join(tmp, 'docs', 'adr', 'ADR-FE-002-x.md'), '# x'); // prefix-match 대상
			mkdirSync(join(tmp, 'decisions'), { recursive: true });
			writeFileSync(
				join(tmp, 'decisions', 'DEC-2026-01-01-real-종결.md'),
				'# d',
			); // prefix-match 대상
			mkdirSync(join(tmp, 'methodology-spec'), { recursive: true });
			writeFileSync(join(tmp, 'methodology-spec', 'exists.md'), '# e');

			const w = (rel, body) => {
				const f = join(tmp, rel);
				mkdirSync(dirname(f), { recursive: true });
				writeFileSync(f, body);
			};
			// bad — 부재 schema + 부재 repo-path + 부재 DEC
			w(
				'methodology-spec/bad.md',
				[
					'`schemas/ghost.schema.json`',
					'`methodology-spec/ghost.md`',
					'DEC-2099-12-31-nope 참조',
				].join('\n'),
			);
			// good/FP — prefix-match + absence-ctx + migration-table + relative + history-exclude
			w(
				'methodology-spec/good.md',
				[
					'`schemas/real.schema.json`',
					'`docs/adr/ADR-FE-002-x.md`', // repo-path = 정확 경로 (실존 해소)
					'bare ADR-FE-002 인용', // ADR id prefix → ADR-FE-002-x.md 해소
					'DEC-2026-01-01-real 참조', // DEC prefix → DEC-2026-01-01-real-종결 해소
					'ADR-999 격상 — 대체 활용', // supersession ctx → skip
					'`methodology-spec/ghost-future.md` (v9 carry 후보)', // future-carry ctx → skip
					'',
					'| 자산 | 흡수 영역 |', // migration-table header
					'|---|---|',
					'| `agents/old/README.md` | skills-axis §4 |', // 흡수 표 row → skip (historical)
				].join('\n'),
			);
			// CHANGELOG = history-class → 전체 skip
			w('CHANGELOG.md', '`schemas/ghost.schema.json` (구 이름 보존)');
			// docs/adr/ = history-class → 전체 skip
			w('docs/adr/ADR-X-1.md', '`schemas/ghost.schema.json`');
			// F-X02 — decisions/INSPECTION-* = 워크스페이스 점검 리포트 → history-class skip (finding-quote stale 경로 FP 차단)
			w(
				'decisions/INSPECTION-2026-05-31-x.md',
				'`schemas/ghost.schema.json` (점검 finding-quote 안 decision-time stale 경로 인용)',
			);

			const r = checkCitations(tmp);
			const byFile = (f) => r.findings.filter((x) => x.file === f);
			// bad.md = schema(ghost.schema.json) + repo-path(schemas/ghost.schema.json 동일결함 이중검출) + repo-path(ghost.md) + dec(nope) = 4
			assert.equal(
				byFile('methodology-spec/bad.md').length,
				4,
				`bad.md 4건: ${JSON.stringify(r.findings)}`,
			);
			assert.equal(
				byFile('methodology-spec/good.md').length,
				0,
				`good.md FP: ${JSON.stringify(byFile('methodology-spec/good.md'))}`,
			);
			assert.equal(
				byFile('CHANGELOG.md').length,
				0,
				'CHANGELOG history-exclude',
			);
			assert.equal(
				byFile('docs/adr/ADR-X-1.md').length,
				0,
				'docs/adr history-exclude',
			);
			assert.equal(
				byFile('decisions/INSPECTION-2026-05-31-x.md').length,
				0,
				'F-X02 — INSPECTION-* history-exclude',
			);
		} finally {
			rmSync(tmp, { recursive: true, force: true });
		}
	});
});
