// server.js — plan-review ephemeral HTTP 서버 (node:http).
//   GET  /         task-plan 폼 HTML (gate 평결 인라인)
//   GET  /summary  gate 평결 JSON (chain-driver next --dry-run 위임)
//   POST /apply    edits+comments → apply() → 분기 결과 JSON
//
// 서버는 판정을 만들지 않는다 — 평결=chain-driver / 재검증=plan-coverage-validator /
// task-plan write=사람 입력만 (결정론 axis 무오염 / reference-lens).

import http from 'node:http';
import { readFileSync, statSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { spawnSync } from 'node:child_process';
import { buildFieldModel } from './field-classify.js';
import { buildHtml, buildHtmlMulti } from './emit.js';
import { apply } from './apply.js';
import { atomicWrite } from '../../chain-driver/src/state-store.js';
import { ARTIFACTS } from './artifact-registry.js';
import { scoreUseCases, difficultyReviewItems } from './difficulty.js';

// anchor 의 최상위 토큰 (예: "behaviors[0].name" → "behaviors", "criteria[1]" → "criteria").
function topKey(anchor) {
	if (!anchor) return null;
	const m = String(anchor).match(/^([^.[]+)/);
	return m ? m[1] : null;
}

// 산출물 파일 mtime — 라이브 리로드용 버전 토큰.
//   ★ 산출물만 추적한다(revision ❌): 리로드는 AI 재설계로 산출물이 *바뀔 때* 일어나야지,
//   apply(=revision 기록) 직후 일어나면 "재설계 중" 상태에서 조기 리로드된다(닫힌 루프 정합).
function versionToken(artifactPath) {
	try {
		return String(Math.round(statSync(artifactPath).mtimeMs));
	} catch {
		return '0';
	}
}

// chain-driver next --dry-run --json 에 평결을 위임한다 (state 전이 없음).
//   projectRoot/state 부재 등 어떤 실패에도 null 로 degrade (페이지는 폼만 렌더).
export function fetchGateSummary({ chainDriverCli, projectRoot, findingsPath }) {
	if (!chainDriverCli || !projectRoot) return null;
	// chain-driver 는 project 를 위치 인자로 받는다 (next <root> …). --project 플래그 아님.
	const a = [chainDriverCli, 'next', projectRoot, '--dry-run', '--json'];
	if (findingsPath) a.push('--findings', findingsPath);
	const res = spawnSync('node', a, { encoding: 'utf-8' });
	try {
		return JSON.parse(res.stdout).summary ?? null;
	} catch {
		return null;
	}
}

function readBody(req) {
	return new Promise((resolve, reject) => {
		let data = '';
		req.on('data', (c) => {
			data += c;
			if (data.length > 5_000_000) req.destroy(); // 5MB guard
		});
		req.on('end', () => resolve(data));
		req.on('error', reject);
	});
}

export function createServer(opts) {
	// 멀티(phase) 문서 모드 — opts.documents 가 있으면 분기.
	if (Array.isArray(opts.documents) && opts.documents.length) {
		return createMultiServer(opts);
	}
	const {
		taskPlanPath,
		acceptancePath,
		schema,
		projectRoot = null,
		chainDriverCli = null,
		validatorCli,
		findingsPath = null,
		threshold = 0.85,
		onApply = null, // (result, parsed) => void — poll 핸드오프(stdout 마커 emit)용
		artifactType = 'task-plan', // discovery-spec/behavior-spec/acceptance-criteria/task-plan
		summaries = null, // { "<cardBase>": { summary } } — AI 평이 요약(원문 ≠ / 표시 전용)
		agentReply = null, // AI 재설계 후 "뭘 바꿨다" 배너 (닫힌 루프 / 표시 전용)
	} = opts;

	return http.createServer(async (req, res) => {
		try {
			const url = (req.url || '/').split('?')[0];

			if (req.method === 'GET' && (url === '/' || url === '/index.html')) {
				const taskPlan = JSON.parse(readFileSync(taskPlanPath, 'utf-8'));
				const fieldModel = buildFieldModel(taskPlan, schema);
				const summary = fetchGateSummary({
					chainDriverCli,
					projectRoot,
					findingsPath,
				});
				const html = buildHtml({
					fieldModel,
					taskPlan,
					summary,
					meta: {
						taskPlanPath,
						artifactType,
						label: (ARTIFACTS[artifactType] && ARTIFACTS[artifactType].label) || artifactType,
						agentReply,
					},
					artifactType,
					summaries,
				});
				res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
				res.end(html);
				return;
			}

			if (req.method === 'GET' && url === '/summary') {
				const summary = fetchGateSummary({
					chainDriverCli,
					projectRoot,
					findingsPath,
				});
				res.writeHead(200, { 'content-type': 'application/json' });
				res.end(JSON.stringify(summary));
				return;
			}

			// 라이브 리로드 — 클라이언트가 폴링해 토큰 변하면 스크롤 보존 reload.
			if (req.method === 'GET' && url === '/version') {
				res.writeHead(200, { 'content-type': 'application/json' });
				res.end(JSON.stringify({ version: versionToken(taskPlanPath) }));
				return;
			}

			if (req.method === 'POST' && url === '/apply') {
				const body = await readBody(req);
				let parsed;
				try {
					parsed = JSON.parse(body || '{}');
				} catch {
					parsed = {};
				}
				const result = apply({
					taskPlanPath,
					acceptancePath,
					schema,
					edits: parsed.edits || {},
					comments: parsed.comments || [],
					validatorCli,
					threshold,
					artifactType,
				});
				// poll 핸드오프 — 에이전트가 stdout 마커를 watch 해 즉시 재dispatch.
				if (typeof onApply === 'function') {
					try {
						onApply(result, parsed);
					} catch {
						/* emit 실패는 비치명 (plan-revisions.json 이 durable 채널) */
					}
				}
				res.writeHead(200, { 'content-type': 'application/json' });
				res.end(
					JSON.stringify({
						branch: result.branch,
						written: result.written,
						validator_summary: result.validator?.summary ?? null,
						edit_cost: result.edit_cost,
					}),
				);
				return;
			}

			res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
			res.end('not found');
		} catch (e) {
			res.writeHead(500, { 'content-type': 'application/json' });
			res.end(JSON.stringify({ error: e.message }));
		}
	});
}

// ================= 멀티(phase) 문서 서버 =================
// opts.documents: [{ artifactType, path, schema, label }] + meta(phase label) + agentReply
//   + (옵션) chainDriverCli/projectRoot/findingsPath(phase gate) + onApply.
// GET / : 전 문서 한 페이지(탭). GET /version : 전 문서 mtime. POST /apply : top-level key→artifact 라우팅.
function createMultiServer(opts) {
	const {
		documents,
		phase = 'phase',
		phaseLabel = phase,
		schema, // unused (per-doc schema)
		projectRoot = null,
		chainDriverCli = null,
		findingsPath = null,
		onApply = null,
		onConfirm = null,
		agentReply = null,
	} = opts;

	// /confirm-scope 화이트리스트 — 사람 소유 필드만 직접 write (LLM inject ❌ / 결정론 axis 무오염).
	//   discovery 게이트①(DEC-2026-06-25-discovery-2-gate): 범위·충돌·질문·확정 마커만.
	const OQ_STATUS = ['open', 'answered', 'deferred', 'resolved'];
	function applyScopeConfirm(spec, payload) {
		const touched = { scope: 0, conflicts: 0, open_questions: 0 };
		const byId = (arr, id) => (Array.isArray(arr) ? arr.find((x) => x && x.id === id) : null);
		for (const s of payload.scope || []) {
			const uc = byId(spec.use_cases, s.uc_id);
			if (uc) { uc.in_scope = !!s.in_scope; touched.scope++; }
		}
		for (const c of payload.conflicts || []) {
			const cf = byId(spec.conflicts, c.id);
			if (cf) { cf.resolved = !!c.resolved; if (typeof c.resolution_ref === 'string') cf.resolution_ref = c.resolution_ref; touched.conflicts++; }
		}
		for (const q of payload.open_questions || []) {
			const oq = byId(spec.open_questions, q.id);
			if (oq) {
				if (typeof q.answer === 'string') oq.answer = q.answer;
				if (typeof q.status === 'string' && OQ_STATUS.indexOf(q.status) >= 0) oq.status = q.status;
				touched.open_questions++;
			}
		}
		spec.finalization_status = 'confirmed';
		return touched;
	}

	// 게이트① 신규 UC 추가 — 사람이 화면에서 입력한 name/description 만 받아 직접 write.
	//   id 는 결정론 생성(기존 UC prefix + 다음 번호), change_type='new'(근거 면제 / detail-fill 생성), in_scope=true.
	//   LLM 단독 추가 ❌ — 내용은 사람 입력, id 는 기계 생성.
	function addNewUseCases(spec, added) {
		if (!Array.isArray(added) || !added.length) return 0;
		spec.use_cases = Array.isArray(spec.use_cases) ? spec.use_cases : [];
		let prefix = 'UC-NEW-', maxN = 0;
		for (const u of spec.use_cases) {
			const m = /^(UC-[A-Z0-9_-]+-)(\d{3})$/.exec((u && u.id) || '');
			if (m) { if (prefix === 'UC-NEW-') prefix = m[1]; if (m[1] === prefix) maxN = Math.max(maxN, parseInt(m[2], 10)); }
		}
		let count = 0;
		for (const a of added) {
			if (!a || typeof a.name !== 'string' || !a.name.trim()) continue;
			maxN++;
			spec.use_cases.push({
				id: prefix + String(maxN).padStart(3, '0'),
				name: a.name.trim(),
				description: typeof a.description === 'string' ? a.description.trim() : '',
				change_type: 'new',
				in_scope: true,
				source_grounded_evidence: [],
				code_pointers_na: true,
			});
			count++;
		}
		return count;
	}

	function loadDoc(d) {
		const data = JSON.parse(readFileSync(d.path, 'utf-8'));
		const fieldModel = buildFieldModel(data, d.schema);
		// renderAs = 같은 산출물 파일을 다른 뷰로 (게이트① / DEC-2026-06-25-discovery-2-gate).
		//   discovery-draft phase 의 discovery-spec → PRD 산문 + 영향 도식 + 범위/충돌/질문 선택 뷰.
		const renderAs = phase === 'discovery-draft' && d.artifactType === 'discovery-spec' ? 'discovery-draft' : d.renderAs || null;
		const doc = { artifactType: d.artifactType, renderAs, label: d.label || d.artifactType, path: d.path, data, fieldModel, summaries: d.summaries || null };
		// discovery-spec 난이도 reference-lens (S1) — artifact-graph 있으면 UC별 영향 정량 → S/M/L.
		//   부재(greenfield/미합성) = degraded (정직 / LLM 추론 ❌). 표시·review[] 전용 / verdict ❌.
		if (d.artifactType === 'discovery-spec') {
			const graphPath = join(dirname(d.path), 'artifact-graph.json');
			let graph = null;
			if (existsSync(graphPath)) {
				try { graph = JSON.parse(readFileSync(graphPath, 'utf-8')); } catch { graph = null; }
			}
			doc.difficulty = scoreUseCases(data, graph);
		}
		return doc;
	}
	// anchor 최상위 key → 어느 문서(artifactType) 소유인지. (content key 는 산출물마다 고유)
	function keyArtifactMap(docs) {
		const map = {};
		const shared = new Set(['meta', 'derivation_source', 'cross_links']);
		docs.forEach((doc) => {
			Object.keys(doc.data || {}).forEach((k) => { if (!shared.has(k)) map[k] = doc.artifactType; });
		});
		return map;
	}
	function mergedLeafLocked(docs, anchor) {
		for (const doc of docs) {
			const l = (doc.fieldModel.leaves || []).find((x) => x.path === anchor);
			if (l) return !!l.locked;
		}
		return false;
	}
	function versionMulti() {
		let t = 0;
		for (const d of documents) { try { t += statSync(d.path).mtimeMs; } catch { /* skip */ } }
		return String(Math.round(t));
	}

	return http.createServer(async (req, res) => {
		try {
			const url = (req.url || '/').split('?')[0];

			if (req.method === 'GET' && (url === '/' || url === '/index.html')) {
				const docs = documents.map(loadDoc);
				const summary = fetchGateSummary({ chainDriverCli, projectRoot, findingsPath });
				// 난이도 高(L) UC → gate review[](검토권장·비차단) 표시 계층 병합.
				//   chain-driver verdict·blocking 은 무오염 (정량 advisory 만 / D3 / STRONG-STOP 준수).
				const discDoc = docs.find((d) => d.artifactType === 'discovery-spec' && d.difficulty);
				if (summary && summary.verdict && discDoc) {
					const items = difficultyReviewItems(discDoc.difficulty).map((it) => ({ code: it.id, label: it.text }));
					if (items.length) summary.review = [...(summary.review || []), ...items];
				}
				const html = buildHtmlMulti({
					documents: docs.map((d) => ({ artifactType: d.artifactType, renderAs: d.renderAs || null, label: d.label, data: d.data, fieldModel: d.fieldModel, summaries: d.summaries, difficulty: d.difficulty || null })),
					summary,
					meta: { phase, label: phaseLabel, agentReply, taskPlanPath: docs[0] && docs[0].path },
				});
				res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
				res.end(html);
				return;
			}
			if (req.method === 'GET' && url === '/version') {
				res.writeHead(200, { 'content-type': 'application/json' });
				res.end(JSON.stringify({ version: versionMulti() }));
				return;
			}
			if (req.method === 'GET' && url === '/summary') {
				res.writeHead(200, { 'content-type': 'application/json' });
				res.end(JSON.stringify(fetchGateSummary({ chainDriverCli, projectRoot, findingsPath })));
				return;
			}
			if (req.method === 'POST' && url === '/apply') {
				let body = '';
				req.on('data', (c) => { body += c; if (body.length > 5_000_000) req.destroy(); });
				await new Promise((r) => req.on('end', r));
				let parsed; try { parsed = JSON.parse(body || '{}'); } catch { parsed = {}; }
				const docs = documents.map(loadDoc);
				const k2a = keyArtifactMap(docs);

				// 잠금 belt — locked anchor 코멘트 drop.
				const rejectedLocked = [];
				const groups = {}; // artifactType → comments[]; '_global' → 전역
				for (const c of parsed.comments || []) {
					const a = c && c.anchor;
					if (a && mergedLeafLocked(docs, a)) { rejectedLocked.push(a); continue; }
					const art = a ? (k2a[topKey(a)] || '_unknown') : '_global';
					(groups[art] || (groups[art] = [])).push(c);
				}
				// phase-revisions.json (산출물별 그룹) — durable 채널.
				const revPath = join(dirname(docs[0].path), `${phase}-revisions.json`);
				const revision = { timestamp: new Date().toISOString(), phase, next_action: 'replan', groups, rejected_locked: rejectedLocked };
				atomicWrite(revPath, JSON.stringify(revision, null, 2) + '\n');

				const result = { branch: 'expensive', written: revPath, groups, rejected_locked: rejectedLocked };
				if (typeof onApply === 'function') { try { onApply(result, parsed); } catch { /* non-fatal */ } }
				res.writeHead(200, { 'content-type': 'application/json' });
				res.end(JSON.stringify(result));
				return;
			}

			// POST /confirm-scope — 게이트①(DEC-2026-06-25-discovery-2-gate) 구조적 선택 직접 write.
			//   사람 소유 필드(in_scope / conflicts.resolved+resolution_ref / open_questions.status+answer)
			//   + finalization_status='confirmed' 만 (화이트리스트 / LLM inject ❌). intervention-log 기록은 게이트 skill.
			if (req.method === 'POST' && url === '/confirm-scope') {
				let body = '';
				req.on('data', (c) => { body += c; if (body.length > 5_000_000) req.destroy(); });
				await new Promise((r) => req.on('end', r));
				let payload; try { payload = JSON.parse(body || '{}'); } catch { payload = {}; }
				const target = documents.find((d) => d.artifactType === 'discovery-spec');
				if (!target) {
					res.writeHead(409, { 'content-type': 'application/json' });
					res.end(JSON.stringify({ error: 'discovery-spec 문서 없음 — /confirm-scope 는 discovery 게이트 전용' }));
					return;
				}
				const spec = JSON.parse(readFileSync(target.path, 'utf-8'));
				const touched = applyScopeConfirm(spec, payload);
				touched.added = addNewUseCases(spec, payload.added_use_cases);
				atomicWrite(target.path, JSON.stringify(spec, null, 2) + '\n');
				const result = { written: target.path, finalization_status: 'confirmed', touched };
				if (typeof onConfirm === 'function') { try { onConfirm(result, payload); } catch { /* non-fatal */ } }
				res.writeHead(200, { 'content-type': 'application/json' });
				res.end(JSON.stringify(result));
				return;
			}
			res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
			res.end('not found');
		} catch (e) {
			res.writeHead(500, { 'content-type': 'application/json' });
			res.end(JSON.stringify({ error: e.message }));
		}
	});
}
