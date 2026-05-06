import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, existsSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import {
  initState, readState, writeStateCAS, statePath, atomicWrite,
  recoverTmpFiles, registerMigration, migrate, CURRENT_STATE_VERSION,
  StateCorruptError, MigrationRequiredError,
} from '../src/state-store.js';

let tmp;
before(() => { tmp = mkdtempSync(join(tmpdir(), 'chain-driver-state-')); });
after(() => { rmSync(tmp, { recursive: true, force: true }); });

describe('state-store', () => {
  it('initState creates .aimd/state.json with defaults', () => {
    const root = join(tmp, 'p1');
    const state = initState(root, 'p1');
    assert.equal(state.project_id, 'p1');
    assert.equal(state.current_chain, 'analysis');
    assert.equal(state.blocked, false);
    assert.equal(state.version, CURRENT_STATE_VERSION);
    assert.ok(existsSync(statePath(root)));
  });

  it('atomicWrite writes via tmp + rename', () => {
    const root = join(tmp, 'p2');
    const path = join(root, 'data.json');
    atomicWrite(path, '{"a":1}');
    assert.equal(readFileSync(path, 'utf-8'), '{"a":1}');
    assert.equal(existsSync(`${path}.tmp`), false);
  });

  it('writeStateCAS bumps version monotonically', () => {
    const root = join(tmp, 'p3');
    initState(root, 'p3');
    const v0 = readState(root).version;
    writeStateCAS(root, (s) => { s.current_phase = 'P1.0'; return s; });
    const v1 = readState(root).version;
    assert.notEqual(v0, v1);
    assert.equal(readState(root).current_phase, 'P1.0');
  });

  it('readState throws StateCorruptError on bad JSON', () => {
    const root = join(tmp, 'p4');
    initState(root, 'p4');
    writeFileSync(statePath(root), '{not json');
    assert.throws(() => readState(root), StateCorruptError);
  });

  it('readState throws StateCorruptError on missing version field', () => {
    const root = join(tmp, 'p5');
    initState(root, 'p5');
    writeFileSync(statePath(root), JSON.stringify({ project_id: 'p5' }));
    assert.throws(() => readState(root), StateCorruptError);
  });

  it('recoverTmpFiles cleans up dangling .tmp', () => {
    const root = join(tmp, 'p6');
    initState(root, 'p6');
    writeFileSync(join(root, '.aimd', 'leftover.tmp'), 'oops');
    const recovered = recoverTmpFiles(root);
    assert.ok(recovered.includes('leftover.tmp'));
    assert.equal(existsSync(join(root, '.aimd', 'leftover.tmp')), false);
  });

  it('migrate same major version is a no-op', () => {
    const state = { version: '1.5', project_id: 'x' };
    const out = migrate(state, '1.7');
    assert.equal(out.version, '1.5');
  });

  it('migrate across major bump requires registered migration', () => {
    const state = { version: '1.0', project_id: 'x' };
    assert.throws(() => migrate(state, '2.0'), MigrationRequiredError);
  });

  it('migrate uses registered migration when present', () => {
    registerMigration('2.0', '3.0', (s) => ({ ...s, version: '3.0', migrated: true }));
    const state = { version: '2.0', project_id: 'x' };
    const out = migrate(state, '3.0');
    assert.equal(out.version, '3.0');
    assert.equal(out.migrated, true);
  });
});
