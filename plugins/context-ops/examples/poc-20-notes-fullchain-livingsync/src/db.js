// db.js — better-sqlite3 연결 + 스키마 부트스트랩 (raw SQL / ORM 아님)
import Database from 'better-sqlite3';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export function openDb(path = ':memory:') {
	const db = new Database(path);
	db.pragma('foreign_keys = ON');
	db.exec(readFileSync(join(__dirname, 'schema.sql'), 'utf8'));
	return db;
}
