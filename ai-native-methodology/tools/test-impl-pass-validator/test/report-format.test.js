// report-format unit test — F-T06 / T14 (INSPECTION-2026-05-31-test).
// 모든 (test-cmd report_format × framework) 조합이 test-spec enum 유효값으로 정규화됨을 입증.

import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import {
	normalizeReportFormat,
	TEST_SPEC_REPORT_FORMATS,
} from '../src/report-format.js';

// test-cmd.schema.json report_format enum + 미지정(default).
const TEST_CMD_FORMATS = [
	'sarif-2.1.0',
	'junit-xml',
	'json',
	'stdout-regex',
	undefined,
	null,
];
// test-cmd.schema.json framework enum.
const FRAMEWORKS = [
	'jest',
	'vitest',
	'junit5',
	'pytest',
	'go-test',
	'rspec',
	'phpunit',
	'mocha',
	'cargo-test',
	'dotnet-test',
	'other',
];

test('T14 — 모든 (report_format × framework) 조합 → test-spec enum 유효값 (무효 enum 누수 0)', () => {
	for (const fmt of TEST_CMD_FORMATS) {
		for (const fw of FRAMEWORKS) {
			const out = normalizeReportFormat(fmt, fw);
			assert.ok(
				TEST_SPEC_REPORT_FORMATS.has(out),
				`normalizeReportFormat(${JSON.stringify(fmt)}, '${fw}') = '${out}' ∉ test-spec enum`,
			);
		}
	}
});

test('T14 — 형식 기반 매핑은 framework 무관 (sarif/junit-xml)', () => {
	for (const fw of FRAMEWORKS) {
		assert.equal(normalizeReportFormat('sarif-2.1.0', fw), 'sarif_2_1_0');
		assert.equal(normalizeReportFormat('junit-xml', fw), 'junit_xml');
	}
});

test('T14 — json + adapter framework → framework별 *_json', () => {
	assert.equal(normalizeReportFormat('json', 'jest'), 'jest_json');
	assert.equal(normalizeReportFormat('json', 'vitest'), 'vitest_json');
	assert.equal(normalizeReportFormat('json', 'pytest'), 'pytest_json');
	assert.equal(normalizeReportFormat('json', 'junit5'), 'junit_xml');
});

test('T14 — stdout-regex / adapter 부재 framework json → stdout_regex (정직 라벨 / no-simulation)', () => {
	assert.equal(normalizeReportFormat('stdout-regex', 'other'), 'stdout_regex');
	// adapter 없는 framework 의 json = stdout 파싱 경유 → *_json 거짓 라벨 ❌
	assert.equal(normalizeReportFormat('json', 'go-test'), 'stdout_regex');
	assert.equal(normalizeReportFormat('json', 'mocha'), 'stdout_regex');
	assert.equal(normalizeReportFormat('json', 'other'), 'stdout_regex');
});

test('T14 — default(미지정) → framework 기반 (cli.js: report_format ?? json 진입 전후 동등)', () => {
	assert.equal(normalizeReportFormat(undefined, 'jest'), 'jest_json');
	assert.equal(normalizeReportFormat(null, 'pytest'), 'pytest_json');
	assert.equal(normalizeReportFormat(undefined, 'other'), 'stdout_regex');
});

test('T14 — idempotent (이미 test-spec enum 값이면 그대로)', () => {
	for (const v of TEST_SPEC_REPORT_FORMATS) {
		assert.equal(
			normalizeReportFormat(v, 'jest'),
			v,
			`${v} 는 idempotent 의무`,
		);
	}
});

test('T14 — 미지의 값도 유효 enum (안전 fallback)', () => {
	assert.ok(
		TEST_SPEC_REPORT_FORMATS.has(normalizeReportFormat('weird-format', 'jest')),
	);
	assert.equal(normalizeReportFormat('weird-format', 'jest'), 'stdout_regex');
});
