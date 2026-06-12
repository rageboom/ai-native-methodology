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

/**
 * 단독 HTML 문자열 생성.
 * @param {Object} graph      보강(augment)된 그래프
 * @param {Object} freshness  checkGraphFreshness 결과 (stale/synthesized_at/stale_sources)
 * @param {Object} [opts]
 * @param {string} [opts.graphName]
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
	return html;
}
