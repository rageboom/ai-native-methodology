// categories.js — 카테고리 raw SQL 접근 (요구사항2)
export function createCategory(db, name) {
	if (!name || !name.trim()) throw new Error('category name required');
	const info = db.prepare(`INSERT INTO categories (name) VALUES (?)`).run(name.trim());
	return { id: info.lastInsertRowid, name: name.trim() };
}

export function findCategoryById(db, id) {
	return db.prepare(`SELECT id, name FROM categories WHERE id = ?`).get(id);
}
