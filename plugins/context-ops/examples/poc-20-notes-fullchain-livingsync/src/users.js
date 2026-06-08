// users.js — 사용자 raw SQL 접근
export function createUser(db, username) {
	if (!username || !username.trim()) throw new Error('username required');
	const stmt = db.prepare(
		`INSERT INTO users (username) VALUES (?)`,
	);
	const info = stmt.run(username.trim());
	return { id: info.lastInsertRowid, username: username.trim() };
}

export function findUserById(db, id) {
	return db.prepare(`SELECT id, username, created_at FROM users WHERE id = ?`).get(id);
}
