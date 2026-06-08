import { describe, it, expect, beforeEach } from 'vitest';
import { openDb } from '../src/db.js';
import { createUser } from '../src/users.js';
import { createCategory } from '../src/categories.js';
import { createNote, listNotesByUser } from '../src/notes.js';

let db, uid, cid;
beforeEach(() => {
	db = openDb(':memory:');
	uid = createUser(db, 'alice').id;
	cid = createCategory(db, 'work').id;
});

// TC-NOTES-001 ← AC-NOTES-001 (정상 메모 작성)
describe('AC-NOTES-001 정상 메모 작성', () => {
	it('존재 사용자 + 존재 카테고리 + 비어있지 않은 본문 → notes 1행 (작성자·카테고리 FK)', () => {
		const note = createNote(db, uid, '첫 메모', cid);
		expect(note.id).toBeGreaterThan(0);
		expect(note.user_id).toBe(uid);
		expect(note.category_id).toBe(cid);
		const list = listNotesByUser(db, uid);
		expect(list).toHaveLength(1);
		expect(list[0].author).toBe('alice');
		expect(list[0].category).toBe('work');
	});
});

// TC-NOTES-002 ← AC-NOTES-002 (사용자/본문 거부)
describe('AC-NOTES-002 잘못된 입력 거부', () => {
	it('빈 본문 → throw', () => {
		expect(() => createNote(db, uid, '   ', cid)).toThrow(/body required/);
		expect(listNotesByUser(db, uid)).toHaveLength(0);
	});
	it('미존재 사용자 → throw', () => {
		expect(() => createNote(db, 9999, '본문', cid)).toThrow(/user not found/);
	});
});

// TC-NOTES-003 ← AC-NOTES-003 (카테고리 거부 / 요구사항2)
describe('AC-NOTES-003 카테고리 필수', () => {
	it('카테고리 누락 → throw', () => {
		expect(() => createNote(db, uid, '본문', null)).toThrow(/category required/);
	});
	it('미존재 카테고리 → throw', () => {
		expect(() => createNote(db, uid, '본문', 9999)).toThrow(/category not found/);
	});
});
