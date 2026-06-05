// openapi-coverage.js — codegraph wiring STEP 6 (DEC-2026-06-03-codegraph-deliverable-wiring §5 STEP 6 / 순수 / I/O 없음).
//   "Modern-scoped reading-aid" 의 정직한 minimal core = openapi 정적 검증 — codegraph 의 유일 비중복 신규 niche.
//     Specmatic/optic/schemathesis = 전부 runtime(Spring Actuator /mappings) 또는 spec-only → 정적 "코드有 계약無" + controller-anchor + auth-grounding 을
//     running app 없이 잡는 것은 그들이 구조적으로 못 함. (route-path coverage 자체는 STEP 1 이 부분 시행 → 여기선 verb-단위 직접 diff + anchor + auth 로 좁힘.)
//   3 sub-mechanism:
//     (a) verb-diff — codegraph route {verb,path} 전수 ∖ openapi.yaml operations = 코드有 계약無 (medium) / 역방향 계약有 코드無 (low / codegraph 동적라우팅 사각 caveat).
//     (b) controller-anchor — openapi-extension operations[].extracted_from.controller_method ∖ codegraph 심볼 = stale anchor.
//         STEP 4 buildAnchorVerify 역방향 set-diff 그대로 재사용 (anchor = controller_method / artifact = openapi:opId). live/stale/informational 동형.
//     (c) auth-grounding — auth 보유 operation(permission_expression/auth_required/required_roles)의 controller-anchor 실재 여부 reading-aid 레이어.
//         정직 경계: codegraph 는 @PreAuthorize *내용* 을 읽지 못함 (심볼 인덱스만) → auth 표현식 검증 ❌ / "auth 보유 op 의 controller method 가 live 한가" 만 corroborate (finding 미산출).
//   trust 경계 (불변 / DEC §2 / check39):
//     · 출력 = reference-lens / 비차단(severity low|medium ceiling) / 결정적 gate inject ❌ / 최종 evidence = 실코드·실 openapi.yaml.
//     · informational (codegraph 사각 = 동적 라우팅·미인덱스 controller file·iBATIS2) = severity 필드 부재 / finding 채널 진입 절대 ❌ (STEP 3·4 informational_notes 패턴 동형).
//   route 노드 0 (Stripes ActionBean·non-MVC) = verb_diff unverified note (false-health 회피 / method-axis 'impl-spec 부재=unverified' 동형).

import { normalizePath, normalizeFile, normalizeSymbol } from './normalize.js';
import { SEVERITY_CEILING, pinSeverity } from './render.js';
import { buildAnchorVerify } from './anchor-verify.js';
import { parseRouteName } from './normalize.js';
import { isFrameworkRoute, isDynamicRoute } from './filters.js';

const HTTP_VERBS = Object.freeze([
	'get',
	'post',
	'put',
	'patch',
	'delete',
	'head',
	'options',
	'trace',
]);

// ── openapi.yaml 최소 path 추출 (무의존성 / 전체 YAML 파서 ❌ — paths 블록 한정 라인 기반).
//   OpenAPI 3.x 표준 구조 가정: top-level `paths:` → path key(`/...:`) → verb key(`get:` 등) → optional `operationId:`.
//   anchors·refs·multi-line scalar 등 일반 YAML 은 미지원 = 정직 경계 (reference-lens / 비차단이라 허용 / 비표준 구조 = 추출 누락 → unverified 쪽으로 안전).
export function extractOpenapiOps(yamlText) {
	if (typeof yamlText !== 'string' || !yamlText.trim())
		return { basePath: '', ops: [], parsed: false };
	const lines = yamlText.split(/\r?\n/);

	// servers basePath — 첫 `- url:` 의 path 컴포넌트 (http://host:port/api → /api / 상대경로면 그대로).
	let basePath = '';
	let inServers = false;
	for (const raw of lines) {
		const line = raw.replace(/\t/g, '  ');
		const content = line.trim();
		if (!content || content.startsWith('#')) continue;
		const indent = line.length - line.trimStart().length;
		if (indent === 0) {
			inServers = /^servers:\s*$/.test(content);
			if (!inServers && basePath) break; // servers 지나감
			continue;
		}
		if (inServers) {
			const m = content.match(/url:\s*["']?([^"'\s]+)["']?/);
			if (m) {
				const url = m[1];
				const pm = url.match(/^https?:\/\/[^/]+(\/.*)$/i);
				if (pm) basePath = pm[1].replace(/\/+$/, '');
				else if (url.startsWith('/')) basePath = url.replace(/\/+$/, '');
				break;
			}
		}
	}

	// paths 블록 추출.
	const ops = [];
	let inPaths = false;
	let pathKeyIndent = -1; // path key 들의 indent (첫 path 로 확정)
	let curPath = null;
	let curVerb = null;
	let curOpId = null;
	let curVerbIndent = -1;
	const flush = () => {
		if (curPath && curVerb)
			ops.push({
				verb: curVerb.toUpperCase(),
				path: curPath,
				operation_id: curOpId || null,
			});
		curVerb = null;
		curOpId = null;
		curVerbIndent = -1;
	};
	for (const raw of lines) {
		const line = raw.replace(/\t/g, '  ');
		const content = line.trim();
		if (!content || content.startsWith('#')) continue;
		const indent = line.length - line.trimStart().length;
		if (!inPaths) {
			if (indent === 0 && /^paths:\s*$/.test(content)) inPaths = true;
			continue;
		}
		// top-level 키(indent 0)로 복귀 = paths 블록 종료.
		if (indent === 0) {
			flush();
			break;
		}
		// path key: '/' 로 시작 + ':' 로 끝.
		const pm = content.match(/^(\/[^:]*?):\s*(?:#.*)?$/);
		if (pm && (pathKeyIndent === -1 || indent <= pathKeyIndent)) {
			if (pathKeyIndent === -1) pathKeyIndent = indent;
			if (indent === pathKeyIndent) {
				flush();
				curPath = pm[1].trim();
				continue;
			}
		}
		if (!curPath) continue;
		// verb key (path 보다 깊은 indent).
		const vm = content.match(/^([a-z]+):\s*(?:#.*)?$/);
		if (vm && HTTP_VERBS.includes(vm[1]) && indent > pathKeyIndent) {
			flush();
			curVerb = vm[1];
			curVerbIndent = indent;
			continue;
		}
		// operationId (verb 하위).
		if (curVerb && indent > curVerbIndent) {
			const om = content.match(/^operationId:\s*["']?([^"'\s]+)["']?/);
			if (om) curOpId = om[1];
		} else if (curVerb && indent <= curVerbIndent && !vm) {
			// verb 형제 키지만 verb 아님 → 현재 verb 유지 (다음 verb/path 에서 flush).
		}
	}
	flush();
	return { basePath, ops, parsed: true };
}

// codegraph route path 에서 basePath prefix 제거 (poc-02 controller @RequestMapping("/api") vs openapi servers /api 흡수).
export function stripBasePath(p, basePath) {
	if (!basePath || basePath === '/' || typeof p !== 'string') return p;
	const bp = basePath.replace(/\/+$/, '');
	if (p === bp) return '/';
	if (p.startsWith(bp + '/')) return p.slice(bp.length);
	return p;
}

// ── (a) verb-diff: codegraph route ∖ openapi operations (양방향).
export function buildVerbDiff({ routeNodes = [], openapiOps = [], basePath = '' }) {
	// route 0 = unverified (Stripes/non-MVC / @*Mapping 미발화 / false-health 회피 — method-axis 게이트 동형).
	if (!routeNodes.length) {
		return {
			state: 'unverified',
			reason:
				'codegraph route 노드 0 — Spring MVC @*Mapping(또는 동등 라우팅) 미검출 (Stripes ActionBean·non-MVC·미지원 프레임워크 가능). verb-diff 대상 코드 route 부재 (false-health 회피).',
			base_path: basePath || '',
			total_code_routes: 0,
			total_spec_ops: openapiOps.length,
			matched: 0,
			code_not_in_spec: [],
			spec_not_in_code: [],
			informational_notes: [],
		};
	}

	// spec 측 키 집합 (verb + normalized path).
	const specKeys = new Set();
	const specByKey = new Map();
	for (const o of openapiOps) {
		const np = normalizePath(o.path);
		const key = `${o.verb} ${np}`;
		specKeys.add(key);
		if (!specByKey.has(key))
			specByKey.set(key, { ...o, normalized_path: np });
	}

	// code 측 (basePath strip + normalize).
	const codeKeys = new Set();
	const codeNotInSpec = [];
	const informational = [];
	let matched = 0;
	const seen = new Set();
	for (const n of routeNodes) {
		const { verb, path } = parseRouteName(n.name);
		const rawPath = path || n.name || '';
		const stripped = stripBasePath(rawPath, basePath);
		const np = normalizePath(stripped);
		// 동적 라우팅 = codegraph 사각 (계약 부재 단정 ❌ → informational).
		if (isDynamicRoute(rawPath)) {
			informational.push({
				verb: verb || null,
				path: rawPath,
				reason:
					'동적 라우팅 추정 — codegraph 정적 추출 사각. 계약 부재 단정 ❌ (부재≠누락).',
			});
			continue;
		}
		// degenerate path (root/빈 path) = codegraph 가 class @RequestMapping + method path 합성 실패한 추출 아티팩트.
		//   "코드有 계약無" 단정 ❌ → informational (false-positive 회피 / 실 endpoint 는 다른 path / 사람 확인).
		if (!np || np === '/') {
			informational.push({
				verb: verb || null,
				path: rawPath,
				reason:
					'codegraph 가 path 미합성(root/빈 path) — class @RequestMapping + method-level path 합성 실패 추정 = 정적 추출 사각. 계약 부재 단정 ❌ (실 endpoint 는 다른 path 가능 / 사람 확인).',
			});
			continue;
		}
		if (isFrameworkRoute(np)) continue; // /actuator·/error 등 = noise (계약 대상 아님).
		const key = `${verb || '?'} ${np}`;
		if (seen.has(key)) continue;
		seen.add(key);
		codeKeys.add(key);
		// verb 미상(파싱 실패) route 는 path-only 매칭 (verb 불명 = informational 안전).
		if (!verb) {
			const anyVerbHit = [...specKeys].some((k) => k.endsWith(` ${np}`));
			if (anyVerbHit) {
				matched++;
			} else {
				informational.push({
					verb: null,
					path: rawPath,
					reason:
						'codegraph route verb 미파싱 — verb-단위 매칭 불가 (path-only 비교에서도 미발견). 계약 부재 단정 보류.',
				});
			}
			continue;
		}
		if (specKeys.has(key)) {
			matched++;
		} else {
			codeNotInSpec.push({
				verb,
				path: rawPath,
				normalized_path: np,
				file: normalizeFile(n.filePath),
			});
		}
	}

	// 역방향: 계약有 코드無 (codegraph 동적 라우팅 사각 가능 → low/caveat).
	const specNotInCode = [];
	for (const o of openapiOps) {
		const np = normalizePath(o.path);
		const key = `${o.verb} ${np}`;
		if (!codeKeys.has(key)) {
			specNotInCode.push({
				verb: o.verb,
				path: o.path,
				normalized_path: np,
				operation_id: o.operation_id || null,
			});
		}
	}

	codeNotInSpec.sort((a, b) =>
		(a.normalized_path + a.verb).localeCompare(b.normalized_path + b.verb),
	);
	specNotInCode.sort((a, b) =>
		(a.normalized_path + a.verb).localeCompare(b.normalized_path + b.verb),
	);
	informational.sort((a, b) =>
		(a.path + (a.verb || '')).localeCompare(b.path + (b.verb || '')),
	);

	return {
		state: 'verified',
		base_path: basePath || '',
		total_code_routes: seen.size,
		total_spec_ops: specKeys.size,
		matched,
		code_not_in_spec: codeNotInSpec,
		spec_not_in_code: specNotInCode,
		informational_notes: informational,
	};
}

// ── (b) controller-anchor: openapi-extension extracted_from.controller_method ∖ codegraph 심볼.
//   STEP 4 buildAnchorVerify 역방향 set-diff 재사용 — anchor = {symbol, artifact:'openapi:opId', anchor_path:controller_file}.
//   2-세그(controller_class.controller_method)=byQn2 정확매칭 / bare method=byName loose. live/stale/informational 동형.
export function buildControllerAnchor({
	extOperations = [],
	symbolNodesByKind = {},
	indexedFiles = [],
	freshness = null,
}) {
	const anchors = [];
	for (const op of extOperations) {
		const ef = op?.extracted_from;
		const method =
			ef && typeof ef.controller_method === 'string'
				? ef.controller_method.trim()
				: '';
		if (!method) continue;
		const klass =
			ef && typeof ef.controller_class === 'string'
				? ef.controller_class.trim()
				: '';
		const symbol = klass ? `${klass}.${method}` : method;
		const anchorPath =
			ef && typeof ef.controller_file === 'string'
				? normalizeFile(ef.controller_file)
				: null;
		anchors.push({
			symbol,
			normalized: normalizeSymbol(symbol),
			artifact: `openapi:${op.operation_id || symbol}`,
			anchor_path: anchorPath,
			anchor_type: 'controller_method',
		});
	}
	const verify = buildAnchorVerify({
		anchors,
		symbolNodesByKind,
		indexedFiles,
		freshness,
	});
	if (verify.state === 'unverified')
		verify.reason =
			'openapi-extension operations[].extracted_from.controller_method 부재 — controller anchor 검증 대상 0 (api-extension.json 미보유 또는 controller 미추출 / false-health 회피).';
	return verify;
}

// ── (c) auth-grounding: auth 보유 op 의 controller-anchor live 여부 reading-aid (finding 미산출 / codegraph 는 auth 표현식 내용 검증 ❌).
export function buildAuthGrounding({ extOperations = [], controllerAnchor = null }) {
	// artifact → state 맵 (live/stale/informational).
	const stateByArtifact = new Map();
	if (controllerAnchor && controllerAnchor.state === 'verified') {
		for (const a of controllerAnchor.live_anchors || [])
			stateByArtifact.set(a.artifact, 'live');
		for (const a of controllerAnchor.stale_anchors || [])
			stateByArtifact.set(a.artifact, 'stale');
		for (const a of controllerAnchor.informational_notes || [])
			stateByArtifact.set(a.artifact, 'informational');
	}
	const authOps = [];
	for (const op of extOperations) {
		const hasAuth =
			op?.auth_required === true ||
			(typeof op?.permission_expression === 'string' &&
				op.permission_expression.trim()) ||
			(Array.isArray(op?.required_roles) && op.required_roles.length);
		if (!hasAuth) continue;
		const artifact = `openapi:${op.operation_id || ''}`;
		authOps.push({
			operation_id: op.operation_id || null,
			controller_method: op?.extracted_from?.controller_method || null,
			anchor_state: stateByArtifact.get(artifact) || 'unknown',
			auth: {
				...(op.auth_required !== undefined
					? { auth_required: op.auth_required }
					: {}),
				...(op.permission_expression
					? { permission_expression: op.permission_expression }
					: {}),
				...(Array.isArray(op.required_roles) && op.required_roles.length
					? { required_roles: op.required_roles }
					: {}),
			},
		});
	}
	authOps.sort((a, b) =>
		String(a.operation_id).localeCompare(String(b.operation_id)),
	);
	return {
		auth_bearing_ops: authOps,
		note:
			'reading-aid — codegraph 는 @PreAuthorize 표현식 *내용* 을 검증 못 함(심볼 인덱스만). auth 보유 op 의 controller method 가 codegraph 에 live 한지(anchor_state)만 corroborate. anchor_state=stale = auth 가 부재 심볼에 걸림 = 사람 확인 권고. finding 미산출(정직 경계).',
	};
}

// ── 통합.
export function buildOpenapiCoverage({
	routeNodes = [],
	openapiOps = [],
	basePath = '',
	extOperations = [],
	symbolNodesByKind = {},
	indexedFiles = [],
	freshness = null,
}) {
	const verbDiff = buildVerbDiff({ routeNodes, openapiOps, basePath });
	const controllerAnchor = buildControllerAnchor({
		extOperations,
		symbolNodesByKind,
		indexedFiles,
		freshness,
	});
	const authGrounding = buildAuthGrounding({ extOperations, controllerAnchor });
	return {
		base_path: basePath || '',
		verb_diff: verbDiff,
		controller_anchor: controllerAnchor,
		auth_grounding: authGrounding,
	};
}

// ── finding (reference-lens / 비차단 / 사람 검토 후 promote).
//   informational_notes 는 절대 순회 ❌ (codegraph 사각 = 부재≠거짓 / finding 채널 진입 차단 / check39).
//   code_not_in_spec = medium (codegraph 가 실 route 발견 + 계약 부재 = clean) / spec_not_in_code = low (codegraph 동적라우팅 사각 = noise-prone) / controller stale = medium.
export function toOpenapiFindings(coverage, dbPath = null) {
	const findings = [];
	let seq = 1;
	const next = () => `F-CGAPI-${String(seq++).padStart(3, '0')}`;
	const vd = coverage?.verb_diff;
	if (vd && vd.state === 'verified') {
		for (const h of vd.code_not_in_spec || []) {
			findings.push({
				id: next(),
				axis: 'verb_diff',
				severity: pinSeverity('medium'),
				message: `route ${h.verb} ${h.path} 가 코드에 존재(codegraph)하나 openapi.yaml 명세에 부재 — 코드有 계약無 (계약 누락 / 사람 확인). 최종 evidence = 실코드·실 openapi.yaml.`,
				evidence: h.file ? [h.file] : [],
				code_graph_ref: {
					kind: 'route',
					symbol: `${h.verb} ${h.path}`,
					...(h.file ? { file: h.file } : {}),
					...(dbPath ? { db_path: dbPath } : {}),
				},
			});
		}
		for (const h of vd.spec_not_in_code || []) {
			findings.push({
				id: next(),
				axis: 'verb_diff',
				severity: pinSeverity('low'),
				message: `openapi.yaml 명세에 ${h.verb} ${h.path}${h.operation_id ? ' (' + h.operation_id + ')' : ''} 가 있으나 codegraph route 미발견 — 계약有 코드無 (codegraph 동적 라우팅 사각 가능 / noise-prone / 사람 확인).`,
				evidence: [],
				code_graph_ref: {
					kind: 'route',
					symbol: `${h.verb} ${h.path}`,
					...(dbPath ? { db_path: dbPath } : {}),
				},
			});
		}
	}
	const ca = coverage?.controller_anchor;
	if (ca && ca.state === 'verified') {
		for (const s of ca.stale_anchors || []) {
			findings.push({
				id: next(),
				axis: 'controller_anchor',
				severity: pinSeverity('medium'),
				message: `openapi operation '${s.artifact}' 가 가리키는 controller method '${s.symbol}' 가 codegraph 인덱스에 부재 — 파일은 인덱싱됐으나 심볼 없음 = stale/dangling controller anchor (리네임/삭제 추정 / 사람 확인). 최종 evidence = 실코드 grep.`,
				evidence: s.file ? [s.file] : [],
				code_graph_ref: {
					kind: 'controller_method',
					symbol: s.symbol,
					...(s.file ? { file: s.file } : {}),
					...(dbPath ? { db_path: dbPath } : {}),
				},
			});
		}
	}
	return findings;
}

// freshness 배너 (render 패턴 / display-only).
function freshnessBanner(fresh) {
	if (!fresh || !fresh.available) return null;
	if (!fresh.stale)
		return `🟢 codegraph 인덱스 fresh (indexed_at=${fresh.indexed_at})`;
	return `⚠️ STALE — codegraph 인덱스(${fresh.indexed_at}) 이후 source ${fresh.stale_count}개 변경 → 결과 부정확 가능. 재인덱싱: \`codegraph index\``;
}

export function renderOpenapiCoverageMarkdown(report) {
	const c = report.openapi_coverage;
	const L = [];
	L.push('# codegraph openapi coverage — [code↔contract / reference-lens]');
	L.push('');
	const banner = freshnessBanner(report.codegraph?.freshness);
	if (banner) {
		L.push(`> ${banner}`);
		L.push('');
	}
	L.push(
		`> trust: reference-lens / 비차단(severity ${SEVERITY_CEILING.join('|')}) / 결정적 gate inject ❌. 최종 evidence = 실코드·실 openapi.yaml.`,
	);
	L.push(
		`> Specmatic/optic/schemathesis 가 못 보는 *정적* "코드有 계약無" + controller-anchor + auth-grounding (running app 불요). route-path coverage 자체는 STEP 1 소관.`,
	);
	L.push(
		`> target: \`${report.target}\` · stack: ${report.stack?.language ?? '?'} · openapi: ${c.openapi_file ?? '?'} · base_path: ${c.base_path || '(none)'}`,
	);
	L.push('');

	// (a) verb-diff.
	const vd = c.verb_diff;
	if (vd.state === 'unverified') {
		L.push('## verb-diff — unverified');
		L.push(`_${vd.reason}_`);
		L.push('');
	} else {
		L.push(
			`## verb-diff (code route=${vd.total_code_routes} / spec op=${vd.total_spec_ops} / matched=${vd.matched} / **code有계약無=${vd.code_not_in_spec.length}** / 계약有코드無=${vd.spec_not_in_code.length})`,
		);
		if (vd.code_not_in_spec.length === 0 && vd.spec_not_in_code.length === 0)
			L.push('_verb-diff hole 없음 — 코드 route 와 openapi.yaml 계약이 verb-단위 일치._');
		for (const h of vd.code_not_in_spec)
			L.push(`- ⚠ 코드有계약無 \`${h.verb} ${h.path}\`  (${h.file})`);
		for (const h of vd.spec_not_in_code)
			L.push(
				`- ◦ 계약有코드無 \`${h.verb} ${h.path}\`${h.operation_id ? ' (' + h.operation_id + ')' : ''} — codegraph route 미발견 (동적라우팅 사각 가능)`,
			);
		if (vd.informational_notes?.length) {
			L.push('');
			L.push(
				'### verb-diff informational notes (codegraph 사각 — not a defect / 부재 ≠ 누락)',
			);
			L.push(
				'> 동적 라우팅·verb 미파싱 등 codegraph 정적 추출 사각. 결함 아님 — 계약 부재 단정 ❌. 최종 판단 = 사람.',
			);
			for (const n of vd.informational_notes)
				L.push(`- \`${n.verb ? n.verb + ' ' : ''}${n.path}\` — ${n.reason}`);
		}
		L.push('');
	}

	// (b) controller-anchor.
	const ca = c.controller_anchor;
	if (ca.state === 'unverified') {
		L.push('## controller-anchor — unverified');
		L.push(`_${ca.reason}_`);
		L.push('');
	} else {
		L.push(
			`## controller-anchor (total=${ca.total} live=${ca.live} **stale=${ca.stale}** informational=${ca.informational} / index=${ca.symbol_index_size} keys)`,
		);
		L.push(
			'> openapi operation 이 가리키는 controller method 가 codegraph 심볼에 실재하는가 (역방향 set-diff / STEP 4 동형).',
		);
		if (ca.stale === 0)
			L.push(
				'_stale controller anchor 없음 — 모든 operation controller method 가 codegraph 에 실재(또는 codegraph 사각=informational)._',
			);
		for (const s of (ca.stale_anchors || []).slice(0, 80))
			L.push(
				`- ⚠ \`${s.symbol}\`  (${s.artifact} / ${s.file ?? '?'}) — 심볼 부재 (파일 인덱싱됨)`,
			);
		if (ca.informational_notes?.length) {
			L.push('');
			L.push(
				'### controller-anchor informational notes (codegraph 미인덱스 controller file = codegraph 사각 — not a defect / 부재 ≠ stale)',
			);
			L.push(
				'> controller file 이 codegraph 미인덱스(iBATIS2·동적 dispatch·미지원 언어·freshness stale). 결함 아님 — stale/finding 보고 ❌. 최종 판단 = 사람.',
			);
			for (const n of (ca.informational_notes || []).slice(0, 60))
				L.push(`- \`${n.symbol}\`  (${n.artifact}) — ${n.reason}`);
		}
		L.push('');
	}

	// (c) auth-grounding (reading-aid).
	const ag = c.auth_grounding;
	if (ag && ag.auth_bearing_ops?.length) {
		L.push(`## auth-grounding (reading-aid / ${ag.auth_bearing_ops.length} auth-bearing op)`);
		L.push(`> ${ag.note}`);
		for (const o of ag.auth_bearing_ops.slice(0, 60)) {
			const flag = o.anchor_state === 'stale' ? '⚠ ' : '';
			L.push(
				`- ${flag}\`${o.operation_id}\` → ${o.controller_method ?? '?'} [${o.anchor_state}]${o.auth.permission_expression ? '  auth=' + o.auth.permission_expression : o.auth.auth_required ? '  auth_required' : ''}`,
			);
		}
		L.push('');
	}
	return L.join('\n').trimEnd();
}
