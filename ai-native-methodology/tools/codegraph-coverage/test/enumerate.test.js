import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, mkdirSync, writeFileSync, utimesSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createRequire } from 'node:module';
import { enumerateNodes, distinctFiles, checkIndexFreshness, sourceRootForDb } from '../src/enumerate.js';

const require = createRequire(import.meta.url);
function sqliteOrSkip() { try { return require('node:sqlite'); } catch { return null; } }

// codegraph nodes 테이블 모사 fixture 생성 (실 SQLite — no-simulation 단위).
function makeFixtureDb(dir, { withCols = true } = {}) {
  const sqlite = sqliteOrSkip();
  const root = mkdtempSync(join(dir, 'cg-'));
  mkdirSync(join(root, '.codegraph'), { recursive: true });
  const dbPath = join(root, '.codegraph', 'codegraph.db');
  const db = new sqlite.DatabaseSync(dbPath);
  if (withCols) {
    db.exec(`CREATE TABLE nodes (id TEXT, kind TEXT, name TEXT, qualified_name TEXT, file_path TEXT, start_line INTEGER, visibility TEXT, is_static INTEGER, signature TEXT)`);
    const ins = db.prepare('INSERT INTO nodes (id,kind,name,qualified_name,file_path,start_line,visibility,is_static,signature) VALUES (?,?,?,?,?,?,?,?,?)');
    ins.run('r1', 'route', 'GET /a', 'A.java::route:/a', 'src/A.java', 1, null, 0, null);
    ins.run('r2', 'route', 'POST /b', 'B.java::route:/b', 'src/B.java', 2, null, 0, null);
    ins.run('m1', 'method', 'doIt', 'pkg::Svc::doIt', 'src/Svc.java', 3, 'public', 0, '()');
  } else {
    db.exec(`CREATE TABLE nodes (id TEXT, kind TEXT)`); // 컬럼 누락 = schema 불일치
  }
  db.close();
  return { root, dbPath };
}

describe('enumerate — 실 SQLite read (no-simulation)', () => {
  const sqlite = sqliteOrSkip();
  if (!sqlite) { it('node:sqlite 부재 → skip', () => assert.ok(true)); return; }
  const base = mkdtempSync(join(tmpdir(), 'cgcov-'));

  it('kind 별 전수 열거 (route/method)', () => {
    const { dbPath } = makeFixtureDb(base);
    const r = enumerateNodes(dbPath, ['route', 'method']);
    assert.equal(r.available, true);
    assert.equal(r.byKind.route.length, 2);
    assert.equal(r.byKind.method.length, 1);
    assert.equal(r.byKind.route[0].name, 'GET /a');
    assert.equal(r.byKind.method[0].qualified_name, 'pkg::Svc::doIt');
  });

  it('DB 부재 = graceful available:false (날조 ❌)', () => {
    const r = enumerateNodes(join(base, 'nope', '.codegraph', 'codegraph.db'), ['route']);
    assert.equal(r.available, false);
    assert.match(r.reason, /부재/);
  });

  it('★ schema 불일치(컬럼 누락) = graceful available:false (codegraph 버전 변경 방어 / PRAGMA probe)', () => {
    const { dbPath } = makeFixtureDb(base, { withCols: false });
    const r = enumerateNodes(dbPath, ['route']);
    assert.equal(r.available, false);
    assert.match(r.reason, /schema 불일치/);
  });

  it('distinctFiles 열거', () => {
    const { dbPath } = makeFixtureDb(base);
    const files = distinctFiles(dbPath);
    assert.deepEqual([...files].sort(), ['src/A.java', 'src/B.java', 'src/Svc.java']);
  });

  it('freshness STALE — source 가 index 이후 변경', () => {
    const { root, dbPath } = makeFixtureDb(base);
    // source 파일을 DB 보다 미래 mtime 으로 생성
    const srcRoot = sourceRootForDb(dbPath);
    mkdirSync(join(srcRoot, 'src'), { recursive: true });
    writeFileSync(join(srcRoot, 'src', 'A.java'), '// changed', { flag: 'w' });
    const future = Date.now() / 1000 + 10000;
    utimesSync(join(srcRoot, 'src', 'A.java'), future, future);
    const fr = checkIndexFreshness(dbPath, ['src/A.java'], srcRoot);
    assert.equal(fr.available, true);
    assert.equal(fr.stale, true);
    assert.equal(fr.stale_count, 1);
  });

  it('cleanup', () => { rmSync(base, { recursive: true, force: true }); assert.ok(true); });
});
