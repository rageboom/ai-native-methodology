// normalize.js — set-diff 키 정규화 (순수 / I/O 없음).
//   codegraph 노드와 산출물 ref 의 표기 차이를 흡수해 결정론 매칭. (Spring {slug} vs NestJS :id / src-root prefix 차이 등.)

// route 노드 name "GET /articles/{slug}" → { verb:'GET', path:'/articles/{slug}' } (verb 는 codegraph name 에 포함 — 실 DB 확인).
export function parseRouteName(name) {
	if (typeof name !== 'string') return { verb: null, path: '' };
	const m = name.match(/^([A-Z]+)\s+(\/.*)$/);
	if (m) return { verb: m[1], path: m[2] };
	if (name.startsWith('/')) return { verb: null, path: name };
	return { verb: null, path: name };
}

// path 정규화: :param / {param} → {} (Spring·NestJS 통일), 중복 슬래시 축약, 후행 슬래시 제거, query/anchor 제거.
export function normalizePath(p) {
	if (typeof p !== 'string') return '';
	let s = p.trim().split('?')[0].split('#')[0];
	s = s.replace(/:[A-Za-z0-9_]+/g, '{}'); // NestJS/Express :id
	s = s.replace(/\{[^}]*\}/g, '{}'); // Spring/OpenAPI {slug}
	s = s.replace(/\/{2,}/g, '/');
	if (s.length > 1) s = s.replace(/\/+$/, '');
	return s;
}

// file 경로 정규화: backslash→/, 선행 ./ 및 / 제거.
export function normalizeFile(f) {
	if (typeof f !== 'string') return '';
	return f.replace(/\\/g, '/').replace(/^\.\//, '').replace(/^\/+/, '').trim();
}

// suffix-정렬 file 매칭 — codegraph file_path(src-relative) vs 산출물 source_files(repo-relative) prefix 차이 흡수.
//   "auth/auth.controller.ts"  ↔  "src/auth/auth.controller.ts"  (한쪽이 다른쪽의 '/'-경계 suffix) = 동일 파일.
export function fileMatches(a, b) {
	const x = normalizeFile(a),
		y = normalizeFile(b);
	if (!x || !y) return false;
	if (x === y) return true;
	return x.endsWith('/' + y) || y.endsWith('/' + x);
}

// symbol 정규화: qualified_name "io.spring.api::ArticleApi::article" → "ArticleApi.article" (끝 2 세그먼트 / :: # . 통일).
//   ast_symbol "ArticleApi.article" 와 동일 키로 수렴. (클래스+메서드 단위 — 패키지 차이 흡수 / reference-lens 수준 충분.)
export function normalizeSymbol(s) {
	if (typeof s !== 'string' || !s) return '';
	const unified = s.replace(/::/g, '.').replace(/#/g, '.').replace(/\s+/g, '');
	const segs = unified.split('.').filter(Boolean);
	return segs.slice(-2).join('.');
}
