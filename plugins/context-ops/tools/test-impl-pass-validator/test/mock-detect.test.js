// mock-detect.js 회귀 — v8.8.0 Tier 1.1 (experimental opt-in)
//
// 1) mode=off → ratio=null
// 2) cycle-7 paradigm fixture (prisma: unknown + scenarioState) → exceeded=true 의무
// 3) clean impl (no mock indicators) → exceeded=false
// 4) score_threshold + file_threshold OR 조건 정합

import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { mkdirSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { detectMockImplementation } from '../src/mock-detect.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TMP = resolve(__dirname, '_tmp_mock_detect');

function ensureTmp() {
	if (existsSync(TMP)) rmSync(TMP, { recursive: true, force: true });
	mkdirSync(TMP, { recursive: true });
	mkdirSync(join(TMP, 'mock-heavy'), { recursive: true });
	mkdirSync(join(TMP, 'clean-impl'), { recursive: true });
}

const MOCK_HEAVY_SVC = `
import { Injectable } from '@nestjs/common';

const scenarioState = {
  emp001NoFilterCallCount: 0,
  softDeletedIds: new Set(),
};

function buildOwnerFixture(ownerId, count) {
  const res = [];
  for (let i = 0; i < count; i++) {
    res.push({
      id: 'c-' + ownerId + '-' + i,
      carNo: '12가1000',
      useYn: 'Y',
    });
  }
  return res;
}

@Injectable()
export class CarService {
  constructor(private readonly prisma: unknown, private readonly events: unknown) {}

  async listForOwner(sessionId, opts) {
    if (sessionId === 'sec001') {
      return buildOwnerFixture('sec001', 2);
    }
    if (sessionId === 'emp001') {
      scenarioState.emp001NoFilterCallCount += 1;
      const count = scenarioState.emp001NoFilterCallCount;
      let fixtureCount;
      switch (count) {
        case 1: fixtureCount = 5; break;
        case 2: fixtureCount = 10; break;
        default: fixtureCount = 5;
      }
      return buildOwnerFixture('emp001', fixtureCount);
    }
    return [];
  }
}
`;

const CLEAN_SVC = `
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class CarService {
  constructor(private readonly prisma: PrismaService) {}

  async listForOwner(sessionId, opts) {
    const where = { ownerId: sessionId, useYn: 'Y' };
    return this.prisma.car.findMany({ where, take: opts.size, skip: (opts.page - 1) * opts.size });
  }
}
`;

test('v8.8.0 — mode=off → ratio=null (회귀 0)', () => {
	ensureTmp();
	const r = detectMockImplementation(join(TMP, 'mock-heavy'), { mode: 'off' });
	assert.equal(r.mode, 'off');
	assert.equal(r.mock_implementation_ratio, null);
	assert.equal(r.file_mock_ratio, null);
});

test('v8.8.0 — cycle-7 paradigm fixture (prisma: unknown + scenarioState + fixture builder) → exceeded=true', () => {
	ensureTmp();
	writeFileSync(join(TMP, 'mock-heavy', 'car.service.ts'), MOCK_HEAVY_SVC);
	const r = detectMockImplementation(join(TMP, 'mock-heavy'), {
		mode: 'experimental',
	});
	assert.equal(r.files_scanned, 1);
	assert.ok(
		r.mock_locations_total >= 4,
		`expected ≥4 mock locations (prisma_unknown + scenarioState + fixture_builder + scenario_switch + session_id_branch + hardcoded_return), got ${r.mock_locations_total}`,
	);
	assert.equal(
		r.exceeded,
		true,
		`single-file mock-heavy fixture exceeded 의무 (file_ratio = 1.0 ≥ 0.5): ratio=${r.mock_implementation_ratio} / file_ratio=${r.file_mock_ratio}`,
	);
});

test('v8.8.0 — clean impl (real Prisma 주입) → exceeded=false', () => {
	ensureTmp();
	writeFileSync(join(TMP, 'clean-impl', 'car.service.ts'), CLEAN_SVC);
	const r = detectMockImplementation(join(TMP, 'clean-impl'), {
		mode: 'experimental',
	});
	assert.equal(r.files_scanned, 1);
	assert.equal(
		r.mock_locations_total,
		0,
		`clean impl 의 mock_locations = 0 의무: ${JSON.stringify(r.mock_locations)}`,
	);
	assert.equal(r.exceeded, false);
});

test('v8.8.0 — empty dir → files_scanned=0', () => {
	ensureTmp();
	const r = detectMockImplementation(join(TMP, 'mock-heavy'), {
		mode: 'experimental',
	});
	assert.equal(r.files_scanned, 0);
	assert.equal(r.exceeded, false);
});

test('v8.8.0 — *.spec.ts / *.test.ts 제외 (impl only)', () => {
	ensureTmp();
	writeFileSync(join(TMP, 'mock-heavy', 'car.service.ts'), CLEAN_SVC);
	writeFileSync(join(TMP, 'mock-heavy', 'car.service.spec.ts'), MOCK_HEAVY_SVC); // spec 제외
	const r = detectMockImplementation(join(TMP, 'mock-heavy'), {
		mode: 'experimental',
	});
	assert.equal(
		r.files_scanned,
		1,
		`spec 파일 제외 → files_scanned=1 의무 (실제: ${r.files_scanned})`,
	);
	assert.equal(
		r.mock_locations_total,
		0,
		`spec 제외했으므로 mock 0 의무: ${r.mock_locations_total}`,
	);
});
