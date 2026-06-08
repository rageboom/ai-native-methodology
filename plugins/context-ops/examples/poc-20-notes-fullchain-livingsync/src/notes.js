// notes.js — 메모 raw SQL 접근 (UC1: 메모 작성 / 요구사항2: 카테고리 필수)
import { findUserById } from './users.js';
import { findCategoryById } from './categories.js';

// UC1 — 메모 작성: 존재 사용자 + 존재 카테고리만, 빈 본문 금지
export function createNote(db, userId, body, categoryId) {
	if (!body || !body.trim()) throw new Error('body required');
	const owner = findUserById(db, userId);
	if (!owner) throw new Error('user not found');
	if (categoryId == null) throw new Error('category required');
	const cat = findCategoryById(db, categoryId);
	if (!cat) throw new Error('category not found');
	const info = db
		.prepare(`INSERT INTO notes (user_id, category_id, body) VALUES (?, ?, ?)`)
		.run(userId, categoryId, body.trim());
	return { id: info.lastInsertRowid, user_id: userId, category_id: categoryId, body: body.trim() };
}

// 사용자의 메모 목록 (작성자 + 카테고리 FK 조인)
export function listNotesByUser(db, userId) {
	return db
		.prepare(
			`SELECT n.id, n.body, n.created_at, u.username AS author, c.name AS category
			   FROM notes n
			   JOIN users u ON u.id = n.user_id
			   JOIN categories c ON c.id = n.category_id
			  WHERE n.user_id = ?
			  ORDER BY n.id`,
		)
		.all(userId);
}
