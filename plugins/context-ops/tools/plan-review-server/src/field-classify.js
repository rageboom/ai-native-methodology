// field-classify.js — task-plan.json 의 각 leaf 필드를 편집 위젯 부류로 분류한다.
//
//   ① text     자유텍스트 (string/number) — 직접 편집 안전
//   ② enum     schema enum 보유 — select 드롭다운 (layer 는 if/then 유발 → expensive)
//   ③ link     id / *_ref(s) / dependencies / execution_order / ID-값 — 직접 편집 시 다른
//              산출물 ID 체계를 알아야 함 → 잠금 + 코멘트(질의)만 허용 (expensive)
//   readonly   meta / derivation_source — provenance, 사람 편집 대상 아님
//
// 서버는 이 분류만 만든다. 판정/수정/재설계는 하지 않는다 (reference-lens / 결정론 axis 무오염).

// ID 값 패턴 — 다른 산출물(TASK/AC/BHV/ADR/UNIT/NFR/RISK/UC/DR/OP/EPIC/STORY) 식별자.
export const ID_VALUE_RE =
	/^(TASK|AC|BHV|ADR|UNIT|NFR|RISK|UC|DR|OP|EPIC|STORY)(-[A-Z0-9_]+)+$/;

// 필드명 기반 link(③) — 직접 고치려면 cross-artifact ID 체계 지식이 필요한 필드.
const LINK_KEYS = new Set(['id', 'execution_order', 'dependencies']);

// enum 이지만 변경 시 if/then(예: layer=be → openapi_endpoint_ref 필수) 유발 = 비싼 변경.
const EXPENSIVE_ENUM_KEYS = new Set(['layer']);

// provenance 최상위 섹션 — 읽기 전용.
const READONLY_TOP = new Set(['meta', 'derivation_source']);

// ── 수정 불가(locked) 판정 — "기계가 소유한 것"은 클릭/코멘트/edit 전부 ❌ (AI 전담).
//    내용(제목·설명·결정·완화 등 자유텍스트 + 설계 enum)은 사람 리뷰 대상이라 잠그지 않는다.
const STRUCTURAL_LINK_KEYS = new Set(['id', 'execution_order', 'dependencies']); // B 식별자·순서·의존
const EXTERNAL_ID_KEYS = new Set(['jira_id', 'op_task_id', 'sp_id']); // D 외부 시스템이 채우는 ID
const CONTRACT_KEYS = new Set(['path', 'operationId', 'method']); // openapi_endpoint_ref 계약 바인딩
const LOCKED_TOP = new Set(['cross_links']); // C cross_links.to_* = 전부 추적 링크
// C 추적 ref 는 *_ref/*_refs 접미사로 판정하되, 내부 ID 가 아닌 URL 사례 출처는 예외(열림).
const TRACE_REF_EXCEPTIONS = new Set(['industry_case_refs']);

function isTraceRef(key) {
	if (TRACE_REF_EXCEPTIONS.has(key)) return false;
	return key.endsWith('_ref') || key.endsWith('_refs');
}

// 기계 소유 = locked. (provenance / 식별자·순서·의존 / 추적링크 / 외부ID / 계약 바인딩)
function isLocked(key, topSection) {
	if (READONLY_TOP.has(topSection)) return true; // A provenance
	if (LOCKED_TOP.has(topSection)) return true; // C cross_links.to_*
	if (STRUCTURAL_LINK_KEYS.has(key)) return true; // B
	if (isTraceRef(key)) return true; // C *_ref(s)
	if (EXTERNAL_ID_KEYS.has(key)) return true; // D
	if (CONTRACT_KEYS.has(key)) return true; // 계약 바인딩
	return false;
}

function isLinkKey(key) {
	if (LINK_KEYS.has(key)) return true;
	return key.endsWith('_ref') || key.endsWith('_refs');
}

// schema 를 1회 순회하여 enum 보유 property 의 옵션 맵(propName → string[])을 모은다.
//   $defs / items / allOf·anyOf·oneOf / if-then 까지 따라가 best-effort 수집 (first-wins).
export function collectEnums(schema) {
	const out = new Map();
	walk(schema, null);
	return out;

	function walk(node, key) {
		if (!node || typeof node !== 'object') return;
		if (Array.isArray(node.enum) && key && !out.has(key)) {
			out.set(key, node.enum.slice());
		}
		if (node.properties) {
			for (const [k, v] of Object.entries(node.properties)) walk(v, k);
		}
		if (node.items) walk(node.items, key);
		for (const comb of ['allOf', 'anyOf', 'oneOf']) {
			if (Array.isArray(node[comb])) node[comb].forEach((n) => walk(n, key));
		}
		if (node.then) walk(node.then, key);
		if (node.else) walk(node.else, key);
		if (node.$defs) for (const v of Object.values(node.$defs)) walk(v, null);
	}
}

// leaf 1개 분류.
//   locked=true 면 클릭/코멘트/edit 모두 불가 (기계 소유 = provenance/식별자/순서/의존/추적링크/외부ID/계약).
//   kind 는 표시용(text/enum/link/readonly), locked 는 상호작용 가능 여부 — 직교.
export function classifyLeaf({ key, value, topSection, enums }) {
	const locked = isLocked(key, topSection);
	if (READONLY_TOP.has(topSection)) {
		return { kind: 'readonly', expensive: false, locked };
	}
	if (isLinkKey(key)) {
		return { kind: 'link', expensive: true, locked };
	}
	if (typeof value === 'string' && ID_VALUE_RE.test(value)) {
		return { kind: 'link', expensive: true, locked };
	}
	if (enums && enums.has(key)) {
		return {
			kind: 'enum',
			options: enums.get(key),
			expensive: EXPENSIVE_ENUM_KEYS.has(key),
			locked,
		};
	}
	if (typeof value === 'string' || typeof value === 'number') {
		return { kind: 'text', expensive: false, locked };
	}
	if (typeof value === 'boolean') {
		return { kind: 'enum', options: [true, false], expensive: false, locked };
	}
	return { kind: 'readonly', expensive: false, locked };
}

// task-plan 인스턴스를 순회하여 편집 가능 leaf descriptor 목록을 만든다.
//   각 descriptor = { path, key, value, kind, options?, expensive }
//   path = "tasks[0].ac_refs[0]" 형식 (parsePath/get/set 와 1:1 호환).
export function buildFieldModel(taskPlan, schema) {
	const enums = collectEnums(schema);
	const leaves = [];

	for (const [topKey, topVal] of Object.entries(taskPlan)) {
		traverse(topVal, [topKey], topKey);
	}
	return { leaves, enums: Object.fromEntries(enums) };

	function traverse(node, pathArr, topSection) {
		if (Array.isArray(node)) {
			node.forEach((item, i) => traverse(item, [...pathArr, i], topSection));
			return;
		}
		if (node && typeof node === 'object') {
			for (const [k, v] of Object.entries(node)) {
				traverse(v, [...pathArr, k], topSection);
			}
			return;
		}
		// leaf — 배열 인덱스가 마지막이면 직전 세그먼트가 의미 key (예: ac_refs[0] → ac_refs).
		const last = pathArr[pathArr.length - 1];
		const key =
			typeof last === 'number' ? pathArr[pathArr.length - 2] : last;
		const cls = classifyLeaf({ key, value: node, topSection, enums });
		leaves.push({
			path: pathToString(pathArr),
			key: String(key),
			value: node,
			...cls,
		});
	}
}

// ---- path 유틸 (buildFieldModel 의 path 형식과 1:1) ----

export function pathToString(arr) {
	let s = '';
	for (const seg of arr) {
		if (typeof seg === 'number') s += `[${seg}]`;
		else s += s ? `.${seg}` : seg;
	}
	return s;
}

export function parsePath(pathString) {
	const parts = [];
	const re = /([^.[\]]+)|\[(\d+)\]/g;
	let m;
	while ((m = re.exec(pathString)) !== null) {
		if (m[2] !== undefined) parts.push(Number(m[2]));
		else parts.push(m[1]);
	}
	return parts;
}

export function getByPath(obj, pathString) {
	return parsePath(pathString).reduce(
		(acc, k) => (acc == null ? acc : acc[k]),
		obj,
	);
}

export function setByPath(obj, pathString, value) {
	const parts = parsePath(pathString);
	let cur = obj;
	for (let i = 0; i < parts.length - 1; i++) cur = cur[parts[i]];
	cur[parts[parts.length - 1]] = value;
	return obj;
}
