// emit.js — 보강 그래프 + freshness 를 self-contained 단독 HTML 로 직조.
//   template.html 의 placeholder 를 인라인 자산(D3 UMD / CSS / 재사용 알고리즘 소스 / app.js / 데이터)으로 치환.
//   결과 HTML 은 서버·인터넷 없이 브라우저에서 바로 열림 (사내 오프라인). committed mirror 아님 (호출부가 gitignored 경로에 write).

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ASSETS = join(__dirname, '..', 'assets');
const CHAIN_SRC = join(__dirname, '..', '..', 'chain-driver', 'src');

function read(p) {
	return readFileSync(p, 'utf8');
}

// $ 특수 패턴 해석 없이 안전 치환 (코드에 $&, $1 등 리터럴 포함 가능).
function inject(haystack, token, value) {
	return haystack.split(token).join(value);
}

// <script> 조기 종료 방지 — 주입 JSON/코드 내 </ 를 <\/ 로 (브라우저는 동일 해석).
function scriptSafe(s) {
	return s.replace(/<\/(script)/gi, '<\\/$1');
}

// HTML 속성/텍스트 escape (도메인 id 는 보통 안전하지만 방어적).
function escHtml(s) {
	return String(s)
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

// 도메인 목록 → 가족(prefix) optgroup <select> 옵션 HTML. domains 없으면 '' (app.js 가 select 숨김).
//   가족 = 첫 '-' 앞 토큰(biztrip/resv/req/cal/issue/…), 단일 토큰은 '기타'로 묶음.
function buildDomainOptions(domains, currentScope) {
	if (!Array.isArray(domains) || !domains.length) return '';
	const fams = new Map();
	for (const id of [...domains].sort()) {
		const fam = id.includes('-') ? id.slice(0, id.indexOf('-')) : '기타';
		(fams.get(fam) ?? fams.set(fam, []).get(fam)).push(id);
	}
	const groups = [...fams.keys()].sort((a, b) =>
		a === '기타' ? 1 : b === '기타' ? -1 : a.localeCompare(b),
	);
	const parts = [];
	for (const fam of groups) {
		parts.push(`<optgroup label="${escHtml(fam)}">`);
		for (const id of fams.get(fam)) {
			const sel = id === currentScope ? ' selected' : '';
			parts.push(`<option value="${escHtml(id)}"${sel}>${escHtml(id)}</option>`);
		}
		parts.push('</optgroup>');
	}
	return parts.join('');
}

/**
 * 단독 HTML 문자열 생성.
 * @param {Object} graph      보강(augment)된 그래프
 * @param {Object} freshness  checkGraphFreshness 결과 (stale/synthesized_at/stale_sources)
 * @param {Object} [opts]
 * @param {string} [opts.graphName]
 * @param {string[]} [opts.domains]      전체 도메인(scope) id 목록 — 있으면 툴바 드롭다운 채움
 * @param {string} [opts.currentScope]   현재 페이지의 scope id (드롭다운 selected)
 * @returns {string} HTML
 */
export function buildHtml(graph, freshness, opts = {}) {
	const template = read(join(ASSETS, 'template.html'));
	const style = read(join(ASSETS, 'style.css'));
	const d3 = read(join(ASSETS, 'vendor', 'd3.v7.min.js'));
	const app = read(join(ASSETS, 'app.js'));

	// 재사용 결정론 알고리즘 — export/import 없는 순수 소스. module <script> 안 인라인 (export 무해).
	const algo = [
		read(join(CHAIN_SRC, 'impact-analyzer.js')),
		read(join(CHAIN_SRC, 'centrality.js')),
		read(join(__dirname, 'layout.js')),
		read(join(__dirname, 'explore.js')),
	].join('\n');

	const graphJson = scriptSafe(JSON.stringify(graph));
	const freshJson = scriptSafe(JSON.stringify(freshness ?? { stale: false }));

	let html = template;
	html = inject(html, '__GRAPH_NAME__', opts.graphName ?? '(graph)');
	html = inject(html, '__STYLE__', style);
	html = inject(html, '__D3__', d3);
	html = inject(html, '__ALGO__', algo);
	html = inject(html, '__APP_JS__', scriptSafe(app));
	html = inject(html, '__GRAPH_JSON__', graphJson);
	html = inject(html, '__FRESHNESS__', freshJson);
	html = inject(
		html,
		'__DOMAIN_OPTIONS__',
		buildDomainOptions(opts.domains, opts.currentScope),
	);
	return html;
}
