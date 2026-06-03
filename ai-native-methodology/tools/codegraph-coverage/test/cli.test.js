import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
function sqliteOrSkip() { try { return require('node:sqlite'); } catch { return null; } }
const CLI = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'cli.js');

function run(args) { return spawnSync(process.execPath, [CLI, ...args], { encoding: 'utf-8' }); }

// 완전한 fixture 프로젝트: .codegraph/codegraph.db + .aimd/output/{inventory,impl-spec,acceptance-criteria}.json
function makeProject(base) {
  const sqlite = sqliteOrSkip();
  const root = mkdtempSync(join(base, 'proj-'));
  mkdirSync(join(root, '.codegraph'), { recursive: true });
  mkdirSync(join(root, '.aimd', 'output'), { recursive: true });
  const dbPath = join(root, '.codegraph', 'codegraph.db');
  const db = new sqlite.DatabaseSync(dbPath);
  db.exec('CREATE TABLE nodes (id TEXT, kind TEXT, name TEXT, qualified_name TEXT, file_path TEXT, start_line INTEGER, visibility TEXT, is_static INTEGER, signature TEXT)');
  const ins = db.prepare('INSERT INTO nodes VALUES (?,?,?,?,?,?,?,?,?)');
  ins.run('r1', 'route', 'POST /users', 'UsersApi::r', 'src/api/UsersApi.java', 1, null, 0, null);
  ins.run('r2', 'route', 'GET /orphan', 'OrphanApi::r', 'src/api/OrphanApi.java', 1, null, 0, null); // hole
  ins.run('m1', 'method', 'register', 'pkg::UserService::register', 'src/svc/UserService.java', 5, 'public', 0, '()'); // covered (file in impl-spec)
  ins.run('m2', 'method', 'orphanWork', 'pkg::Ghost::orphanWork', 'src/svc/Ghost.java', 9, 'public', 0, '()'); // hole
  db.close();
  const out = join(root, '.aimd', 'output');
  writeFileSync(join(out, 'inventory.json'), JSON.stringify({ stack: { backend: { language: 'Java', framework: 'Spring Boot', orm: [{ name: 'MyBatis' }] } } }));
  writeFileSync(join(out, 'acceptance-criteria.json'), JSON.stringify({ criteria: [{ openapi_path: '/users', operationId: 'createUser' }] }));
  writeFileSync(join(out, 'impl-spec.json'), JSON.stringify({ modules: [{ id: 'IMPL-USER', source_files: ['src/svc/UserService.java'] }] }));
  return { root, dbPath };
}

describe('cli — real spawn (no-simulation)', () => {
  const sqlite = sqliteOrSkip();
  const base = mkdtempSync(join(tmpdir(), 'cgcov-cli-'));

  it('codegraph DB 부재 = exit 3 (정직 신호 / 날조 ❌)', () => {
    const empty = mkdtempSync(join(base, 'nodb-'));
    mkdirSync(join(empty, '.aimd', 'output'), { recursive: true });
    writeFileSync(join(empty, '.aimd', 'output', 'inventory.json'), '{}');
    const r = run(['--target', empty]);
    assert.equal(r.status, 3);
    assert.match(r.stderr, /codegraph DB unavailable|no-simulation/);
  });

  it('usage error = exit 3', () => {
    const r = run(['--bogus']);
    assert.equal(r.status, 3);
  });

  if (!sqlite) { it('node:sqlite 부재 → full-run skip', () => assert.ok(true)); return; }

  it('★ full run — route hole + method hole 탐지 + report schema-shape + exit 0 (비차단)', () => {
    const { root } = makeProject(base);
    const outFile = join(root, 'report.json');
    const r = run(['--target', root, '--out', outFile, '--json']);
    assert.equal(r.status, 0, 'coverage-hole 은 비차단 — hole 있어도 exit 0');
    const report = JSON.parse(readFileSync(outFile, 'utf-8'));
    // route: /orphan 은 hole, /users 는 AC 로 covered
    assert.equal(report.coverage.axes.route.holes.length, 1);
    assert.equal(report.coverage.axes.route.holes[0].normalized_path, '/orphan');
    // method: Ghost.orphanWork 은 hole, UserService.register 는 impl-spec file 로 covered
    assert.equal(report.coverage.axes.method.holes.length, 1);
    assert.equal(report.coverage.axes.method.holes[0].symbol, 'Ghost.orphanWork');
    // trust 라벨
    assert.equal(report.meta.reference_lens, true);
    assert.deepEqual(report.meta.severity_ceiling.sort(), ['low', 'medium']);
    // findings severity ceiling
    for (const f of report.findings) assert.ok(['low', 'medium'].includes(f.severity));
  });

  it('stdout markdown 기본 (--json 미지정) + freshness/ trust 배너', () => {
    const { root } = makeProject(base);
    const r = run(['--target', root]);
    assert.equal(r.status, 0);
    assert.match(r.stdout, /codegraph coverage-hole/);
    assert.match(r.stdout, /reference-lens/);
  });

  it('cleanup', () => { rmSync(base, { recursive: true, force: true }); assert.ok(true); });
});
