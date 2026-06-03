// enumerate.js — codegraph .codegraph/codegraph.db 직접 read (SQLite / reference-lens).
//   ★ code-graph.json 은 집계 통계(nodes_by_kind 카운트)만 — 노드 목록 부재. 전수 열거는 SQLite nodes 테이블 직접 read.
//     (CLI `query --kind` 은 LIMIT cap=50 → 불완전 / official-docs raw src/db/queries.ts 확인 → SQLite 경로 정답.)
//   ★ federator.js makeCodegraphAdapter.symbolsInFile 선례 동형 (node:sqlite readOnly / DB mtime 축 / 무회귀 패턴).
//   ★ no-simulation: 실 DB read 만. node:sqlite 부재(Node<22.13) · DB 부재 · 스키마 불일치 = available:false (graceful / 호출부 exit 3).
//   ★ codegraph 내부 schema 결합 = carry (codegraph 버전 변경 시 PRAGMA probe 로 재검증 / federator.js:475 동일 risk 상속).

import { createRequire } from 'node:module';
import { existsSync, statSync } from 'node:fs';
import { dirname, join, isAbsolute, resolve } from 'node:path';

const require = createRequire(import.meta.url);
// node:sqlite = Node 22.13+ (unflagged) / 부재(구 Node) = null → 호출부 graceful.
function loadSqlite() { try { return require('node:sqlite'); } catch { return null; } }

// nodes 테이블에서 set-diff 키로 쓰는 최소 컬럼 (federator symbolsInFile 와 동형 + qualified_name/visibility/signature 추가).
const REQUIRED_COLS = ['id', 'kind', 'name', 'file_path'];
const SELECT_COLS = 'name, kind, qualified_name AS qualifiedName, file_path AS filePath, start_line AS startLine, visibility, is_static AS isStatic, signature';

// PRAGMA probe — codegraph 내부 schema 가 기대 컬럼을 갖는지 확인. 불일치 = graceful 신호.
function probeSchema(db) {
  try {
    const cols = db.prepare('PRAGMA table_info(nodes)').all().map((r) => r.name);
    const missing = REQUIRED_COLS.filter((c) => !cols.includes(c));
    return { ok: missing.length === 0, missing, cols };
  } catch (e) {
    return { ok: false, missing: REQUIRED_COLS, cols: [], error: e.message };
  }
}

// dbPath → codegraph project(source) root. dbPath = <root>/.codegraph/codegraph.db → <root>.
export function sourceRootForDb(dbPath) {
  return dirname(dirname(dbPath));
}

/**
 * 주어진 kind 들의 노드 전수 열거. 결정론 — read-only SQLite.
 * @returns {{available:boolean, reason:string|null, byKind:Object<string,Array>, columns:string[]}}
 */
export function enumerateNodes(dbPath, kinds) {
  const sqlite = loadSqlite();
  if (!sqlite) return { available: false, reason: 'node:sqlite 부재 (Node 22.13+ 필요)', byKind: {}, columns: [] };
  if (!existsSync(dbPath)) return { available: false, reason: `codegraph DB 부재: ${dbPath}`, byKind: {}, columns: [] };
  let db;
  try {
    db = new sqlite.DatabaseSync(dbPath, { readOnly: true });
  } catch (e) {
    return { available: false, reason: `DB open 실패: ${e.message}`, byKind: {}, columns: [] };
  }
  try {
    const probe = probeSchema(db);
    if (!probe.ok) {
      db.close();
      return { available: false, reason: `codegraph schema 불일치 (nodes 컬럼 누락: ${probe.missing.join(',')}) — 버전 변경 추정`, byKind: {}, columns: probe.cols };
    }
    const stmt = db.prepare(`SELECT ${SELECT_COLS} FROM nodes WHERE kind = ?`);
    const byKind = {};
    for (const kind of kinds) {
      byKind[kind] = stmt.all(kind).map((r) => ({
        name: r.name,
        kind: r.kind,
        qualified_name: r.qualifiedName ?? null,
        filePath: r.filePath,
        startLine: r.startLine ?? null,
        visibility: r.visibility ?? null,
        is_static: r.isStatic ?? null,
        signature: r.signature ?? null,
      }));
    }
    db.close();
    return { available: true, reason: null, byKind, columns: probe.cols };
  } catch (e) {
    try { db.close(); } catch { /* noop */ }
    return { available: false, reason: `nodes query 실패: ${e.message}`, byKind: {}, columns: [] };
  }
}

/**
 * codegraph 인덱스 freshness — DB mtime vs 인덱싱된 source 파일 newest mtime.
 *   source 가 index 이후 변경 = STALE (사라진 코드에 hole / 신규 코드 누락 = false-health 방지 / graph-freshness 패턴).
 *   결정론 fs.stat — display-only (non-gating / 자동 재인덱싱 ❌ / 사람이 `codegraph index` 재실행).
 * @param {string} dbPath
 * @param {string[]} indexedFiles  nodes 테이블 DISTINCT file_path (없으면 freshness skip)
 * @param {string} [sourceRoot]
 */
export function checkIndexFreshness(dbPath, indexedFiles = [], sourceRoot = null) {
  if (!existsSync(dbPath)) return { available: false, stale: false, reason: 'DB 부재' };
  let dbMtime;
  try { dbMtime = statSync(dbPath).mtimeMs; } catch { return { available: false, stale: false, reason: 'DB stat 실패' }; }
  const root = sourceRoot || sourceRootForDb(dbPath);
  let newest = 0;
  let staleCount = 0;
  const staleSample = [];
  const cap = Math.min(indexedFiles.length, 4000); // 경량 cap (statSync 다발 방어)
  for (let i = 0; i < cap; i++) {
    const f = indexedFiles[i];
    const full = isAbsolute(f) ? f : resolve(root, f);
    let mt;
    try { mt = statSync(full).mtimeMs; } catch { continue; } // 파일 부재(이동/삭제) = skip
    if (mt > newest) newest = mt;
    if (mt > dbMtime) { staleCount++; if (staleSample.length < 5) staleSample.push(f); }
  }
  return {
    available: true,
    stale: staleCount > 0,
    indexed_at: new Date(dbMtime).toISOString(),
    newest_source_mtime: newest ? new Date(newest).toISOString() : null,
    stale_count: staleCount,
    stale_sample: staleSample,
    capped: indexedFiles.length > cap ? indexedFiles.length : 0,
  };
}

// DISTINCT file_path 열거 (freshness 용). read-only.
export function distinctFiles(dbPath) {
  const sqlite = loadSqlite();
  if (!sqlite || !existsSync(dbPath)) return [];
  try {
    const db = new sqlite.DatabaseSync(dbPath, { readOnly: true });
    const rows = db.prepare('SELECT DISTINCT file_path AS f FROM nodes WHERE file_path IS NOT NULL').all();
    db.close();
    return rows.map((r) => r.f);
  } catch { return []; }
}
