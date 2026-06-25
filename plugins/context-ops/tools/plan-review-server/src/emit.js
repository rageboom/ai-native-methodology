// emit.js — 산출물(들) → self-contained HTML. 스크립트 = kit.js(공유) + renderers(스키마별) + app(부트스트랩)
//   을 한 <script> 에 연결 주입. 단일(buildHtml) / 멀티 phase(buildHtmlMulti) 두 경로.
//   dep-graph-viz/emit 자산-인라인 패턴 포팅. 외부 네트워크 0 / `</script>` 안전 이스케이프.

import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ASSETS = join(__dirname, '..', 'assets');

function read(p) { return readFileSync(p, 'utf8'); }
function inject(haystack, token, value) { return haystack.split(token).join(value); }
function scriptSafe(s) { return s.replace(/<\/(script)/gi, '<\\/$1'); }

function rendererPath(artifactType) {
	const p = join(ASSETS, 'renderers', `${artifactType}.js`);
	return existsSync(p) ? p : null;
}

// kit + (요청 타입들의 렌더러 + generic) + app 을 연결. 중복 렌더러 제거.
function assembleScripts(artifactTypes) {
	const kit = read(join(ASSETS, 'kit.js'));
	const app = read(join(ASSETS, 'app.js'));
	const files = [];
	const seen = new Set();
	for (const t of artifactTypes) {
		const p = rendererPath(t);
		if (p && !seen.has(p)) { seen.add(p); files.push(p); }
	}
	const generic = join(ASSETS, 'renderers', 'generic.js');
	if (!seen.has(generic)) files.push(generic); // 항상 fallback 포함
	const renderers = files.map(read).join('\n');
	return [kit, renderers, app].join('\n');
}

function baseHtml({ scripts, documents, data, fieldModel, summary, meta, summaries }) {
	const template = read(join(ASSETS, 'template.html'));
	const style = read(join(ASSETS, 'style.css'));
	let html = template;
	html = inject(html, '__STYLE__', style);
	html = inject(html, '__SCRIPTS__', scriptSafe(scripts));
	html = inject(html, '__DOCUMENTS__', scriptSafe(JSON.stringify(documents)));
	html = inject(html, '__DATA__', scriptSafe(JSON.stringify(data)));
	html = inject(html, '__FIELD_MODEL__', scriptSafe(JSON.stringify(fieldModel)));
	html = inject(html, '__SUMMARY__', scriptSafe(JSON.stringify(summary)));
	html = inject(html, '__META__', scriptSafe(JSON.stringify(meta)));
	html = inject(html, '__SUMMARIES__', scriptSafe(JSON.stringify(summaries)));
	return html;
}

// 단일 문서.
export function buildHtml({ fieldModel, taskPlan, summary = null, meta = {}, artifactType = 'task-plan', summaries = null }) {
	return baseHtml({
		scripts: assembleScripts([artifactType]),
		documents: null,
		data: taskPlan,
		fieldModel,
		summary,
		meta,
		summaries,
	});
}

// 멀티(phase) 문서 — documents: [{ artifactType, renderAs?, label, data, fieldModel, summaries }].
//   renderAs(있으면) 가 렌더러 선택 키 — 같은 산출물 파일을 다른 뷰로(예: discovery-spec → discovery-draft).
export function buildHtmlMulti({ documents, summary = null, meta = {} }) {
	const types = documents.map((d) => d.renderAs || d.artifactType);
	return baseHtml({
		scripts: assembleScripts(types),
		documents, // 각 문서가 자기 data/fieldModel/summaries 보유 (kit.initMulti 가 병합)
		data: null,
		fieldModel: null,
		summary,
		meta,
		summaries: null,
	});
}
