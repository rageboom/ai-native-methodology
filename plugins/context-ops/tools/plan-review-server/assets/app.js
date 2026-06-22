// app.js — 부트스트랩/디스패치. (인터랙션=kit.js / 배치=renderers/* → RENDERERS 맵)
//   단일 문서: artifact-data + meta.artifactType → RENDERERS[type] || generic → #form 렌더.
//   멀티(phase) 문서: documents[] 있으면 → Kit.initMulti + 탭 UI + 문서별 렌더 (apply/패널 공유).
//   emit 가 kit + 렌더러(들) + app 을 한 <script> 에 연결 주입.
(function () {
	'use strict';
	function J(id) {
		var el = document.getElementById(id);
		if (!el) return null;
		try { return JSON.parse(el.textContent); } catch (e) { return null; }
	}
	function pick(type) {
		return (RENDERERS && (RENDERERS[type] || RENDERERS.generic)) || null;
	}

	var documents = J('documents'); // 멀티(phase) 모드
	if (Array.isArray(documents) && documents.length) {
		Kit.initMulti({
			documents: documents,
			meta: J('meta-data') || {},
			gate: J('gate-summary-data'),
			agentReply: (J('meta-data') || {}).agentReply || null,
		});
		Kit.renderMulti(documents, document.getElementById('form'), pick);
		Kit.afterRender();
		return;
	}

	// 단일 문서
	var ctx = {
		data: J('artifact-data') || {},
		fieldModel: J('field-model') || { leaves: [] },
		summaries: J('ai-summaries') || {},
		meta: J('meta-data') || {},
		gate: J('gate-summary-data'),
		agentReply: (J('meta-data') || {}).agentReply || null,
	};
	Kit.init(ctx);
	var R = pick(ctx.meta.artifactType);
	if (R && typeof R.render === 'function') R.render(document.getElementById('form'), ctx);
	Kit.afterRender();
})();
