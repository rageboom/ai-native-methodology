// extract.js — sql-inventory 결정론 추출기 핵심 (DEC-2026-06-12-sql-inventory-extractor).
//
// analysis-sql-inventory SKILL §1–4 의 grep -E 레시피를 그대로 코드화 — 신규 패턴 발명 ❌(스킬=SSOT).
// auto 5 컬럼만 결정론 산출: sql_id / mapper_xml / statement_type / dynamic_branch / dependent_tables.
// 판단 6 컬럼(business_meaning / called_from_screen / uc_link / intent_vs_bug_classification /
//   confidence / carry_flags)은 null placeholder — LLM/human 보강 의무(가짜 자동화 금지).
//
// 산출 = sql-inventory.auto.json (pre-enrichment / sql-inventory.schema.json 미정합 = 판단컬럼 null 의도)
//   + raw-grep.txt (1차 산출 / SKILL.md:162). no-simulation: real 파싱만 / 0건 시 빈 산출+정직.

import { createHash } from 'node:crypto';

export const TOOL_VERSION = '0.1.0';

// MyBatis/iBATIS executable statement element (sql fragment 제외 / include 제외).
const STMT_ELEMENTS = ['select', 'insert', 'update', 'delete', 'procedure'];

// 판단 컬럼 — 도구가 절대 채우지 않음(LLM/human). null placeholder 로만 emit.
export const PENDING_JUDGMENT_COLUMNS = [
	'called_from_screen',
	'business_meaning',
	'uc_link',
	'intent_vs_bug_classification',
	'confidence',
	'carry_flags',
];

// SKILL §3 dynamic tag → schema dynamic_branch.tag_type enum 매핑 (양방향 link 의무).
// container(choose) 는 분기 아님 → when/otherwise 만 카운트.
const TAG_TYPE_MAP = {
	// MyBatis 3
	if: 'mybatis3:if',
	when: 'mybatis3:choose-when',
	otherwise: 'mybatis3:choose-otherwise',
	where: 'mybatis3:where',
	set: 'mybatis3:set',
	trim: 'mybatis3:trim',
	foreach: 'mybatis3:foreach',
	bind: 'mybatis3:bind',
	// iBATIS 2
	dynamic: 'ibatis2:dynamic',
	iterate: 'ibatis2:iterate',
	isNull: 'ibatis2:isNull',
	isNotNull: 'ibatis2:isNotNull',
	isEmpty: 'ibatis2:isEmpty',
	isNotEmpty: 'ibatis2:isNotEmpty',
	isEqual: 'ibatis2:isEqual',
	isNotEqual: 'ibatis2:isNotEqual',
	isGreaterThan: 'ibatis2:isGreaterThan',
	isGreaterEqual: 'ibatis2:isGreaterEqual',
	isLessThan: 'ibatis2:isLessThan',
	isLessEqual: 'ibatis2:isLessEqual',
	isPropertyAvailable: 'ibatis2:isPropertyAvailable',
	isNotPropertyAvailable: 'ibatis2:isNotPropertyAvailable',
	isParameterPresent: 'ibatis2:isParameterPresent',
	isNotParameterPresent: 'ibatis2:isNotParameterPresent',
};
const DYNAMIC_TAGS = Object.keys(TAG_TYPE_MAP);

// SQL 예약어/잡음 — dependent_tables 후보에서 제외(FROM/JOIN 뒤 식별자 휴리스틱).
const TABLE_STOPWORDS = new Set([
	'SELECT', 'DUAL', '(', 'LATERAL', 'TABLE', 'VALUES', 'ONLY',
]);

function sha256(s) {
	return createHash('sha256').update(s).digest('hex');
}

// 안정 직렬화(키 정렬) — result_hash 결정성 (carve.js 동형).
export function stableStringify(value) {
	if (value === null || typeof value !== 'object') return JSON.stringify(value);
	if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
	const keys = Object.keys(value).sort();
	return `{${keys.map((k) => `${JSON.stringify(k)}:${stableStringify(value[k])}`).join(',')}}`;
}

// XML 주석 blank 처리 — 내용은 지우되 newline/길이 보존(라인번호·인덱스 불변).
function blankComments(xml) {
	return xml.replace(/<!--[\s\S]*?-->/g, (m) => m.replace(/[^\n]/g, ' '));
}

function lineOf(text, index) {
	let n = 1;
	for (let i = 0; i < index && i < text.length; i++) {
		if (text[i] === '\n') n++;
	}
	return n;
}

function attr(openTag, name) {
	const m = openTag.match(new RegExp(`\\b${name}\\s*=\\s*"([^"]*)"`));
	return m ? m[1] : null;
}

// namespace 마지막 세그먼트(가독 sql_id prefix). 부재 시 파일 basename.
function namespacePrefix(xml, relPath) {
	const ns = xml.match(/<(?:sqlMap|mapper)\b[^>]*\bnamespace\s*=\s*"([^"]+)"/);
	if (ns && ns[1]) {
		const segs = ns[1].split('.');
		return segs[segs.length - 1];
	}
	const base = relPath.split('/').pop() || relPath;
	return base.replace(/\.xml$/i, '');
}

// dependent_tables 후보 추출(SKILL §4 FROM/JOIN regex). exhaustive ❌ = 후보 마킹.
// subquery·동적 테이블명(${...})·CTE 는 regex 한계 → 누락 가능.
function extractTables(body) {
	const tables = new Set();
	const re = /\b(?:FROM|JOIN|INTO|UPDATE)\s+(\[?[A-Za-z_#$][A-Za-z0-9_#$.]*\]?)/gi;
	let m;
	while ((m = re.exec(body)) !== null) {
		let t = m[1].replace(/[[\]]/g, '');
		if (t.startsWith('${') || t.startsWith('#{')) continue; // 동적 테이블명 → skip
		const up = t.toUpperCase();
		if (TABLE_STOPWORDS.has(up)) continue;
		tables.add(t);
	}
	return [...tables].sort();
}

function extractDynamicBranches(body) {
	const counts = new Map();
	for (const tag of DYNAMIC_TAGS) {
		const re = new RegExp(`<${tag}\\b`, 'g');
		const n = (body.match(re) || []).length;
		if (n > 0) counts.set(TAG_TYPE_MAP[tag], (counts.get(TAG_TYPE_MAP[tag]) || 0) + n);
	}
	// SQL native CASE WHEN
	const caseN = (body.match(/\bCASE\s+WHEN\b/gi) || []).length;
	if (caseN > 0) counts.set('sql:case_when', caseN);

	return [...counts.entries()]
		.sort((a, b) => a[0].localeCompare(b[0]))
		.map(([tag_type, branch_count]) => ({
			tag: tag_type,
			tag_type,
			branch_count,
		}));
}

// statement_type 판정. statementType 속성 우선 / <procedure> 또는 {call}/EXEC/CALL body → CALLABLE.
function statementType(elementName, openTag, body) {
	const explicit = attr(openTag, 'statementType');
	if (explicit && ['PREPARED', 'CALLABLE', 'STATEMENT'].includes(explicit.toUpperCase())) {
		return explicit.toUpperCase();
	}
	if (elementName === 'procedure') return 'CALLABLE';
	if (/\{\s*call\b/i.test(body) || /\bEXEC\b/i.test(body) || /\bCALL\s+[A-Za-z_]/i.test(body)) {
		return 'CALLABLE';
	}
	return 'PREPARED'; // MyBatis 기본
}

// 단일 XML → { records[], fragments[], rawLines[] }. relPath = 산출물 기록용 상대경로.
export function extractFromXml(rawXml, relPath) {
	const xml = blankComments(rawXml);
	const prefix = namespacePrefix(xml, relPath);
	const records = [];
	const rawLines = [];

	// <sql id="..."> fragment = 비실행 → inventory 제외(카운트만).
	const fragments = [];
	const fragRe = /<sql\b[^>]*\bid\s*=\s*"([^"]+)"/g;
	let fm;
	while ((fm = fragRe.exec(xml)) !== null) fragments.push(fm[1]);

	for (const el of STMT_ELEMENTS) {
		// statement 는 중첩 없음(select 안에 select 없음) → non-greedy open→close 안전.
		const re = new RegExp(`<${el}\\b([^>]*)>([\\s\\S]*?)</${el}>`, 'g');
		let m;
		while ((m = re.exec(xml)) !== null) {
			const openTag = m[1];
			const body = m[2];
			const id = attr(`<${el} ${openTag}>`, 'id');
			if (!id) continue; // id 없는 statement = 비정상 → skip(정직: rawLines 에 남김)
			const line = lineOf(xml, m.index);
			const includes = [...body.matchAll(/<include\b[^>]*\brefid\s*=\s*"([^"]+)"/g)].map(
				(x) => x[1],
			);
			const tables = extractTables(body);
			const stmtType = statementType(el, openTag, body);

			const record = {
				sql_id: `${prefix}.${id}`,
				mapper_xml: relPath,
				mapper_xml_line: line,
				statement_type: stmtType,
				operation: el,
				dynamic_branch: extractDynamicBranches(body),
				dependent_tables: tables,
				dependent_tables_are_candidates: true,
			};
			if (includes.length > 0) {
				// include 된 fragment 안의 테이블은 미해석 → 정직 carry 플래그.
				record.includes_fragments = includes;
				record.tables_note =
					'<include> 사용 — fragment 내 테이블은 미해석(LLM 보강 / dependent_tables 불완전 가능).';
			}
			// 판단 6 컬럼 = null placeholder (도구가 채우지 않음).
			for (const col of PENDING_JUDGMENT_COLUMNS) record[col] = null;

			records.push(record);
			rawLines.push(`${relPath}:${line}:<${el} id="${id}"> [${stmtType}]`);
		}
	}
	// 산출 안정성: sql_id 정렬.
	records.sort((a, b) => a.sql_id.localeCompare(b.sql_id) || a.mapper_xml_line - b.mapper_xml_line);
	rawLines.sort();
	return { records, fragments, rawLines };
}

// 다중 파일 집계 → 완전한 sql-inventory.auto.json 산출 객체.
// files = [{relPath, content}] (CLI 가 읽어 주입 / 테스트 결정성).
export function buildInventory({ files, nowIso, reproductionCommand = '' }) {
	const allRecords = [];
	const allRaw = [];
	let fragmentCount = 0;
	const perFile = [];

	for (const f of [...files].sort((a, b) => a.relPath.localeCompare(b.relPath))) {
		const { records, fragments, rawLines } = extractFromXml(f.content, f.relPath);
		allRecords.push(...records);
		allRaw.push(...rawLines);
		fragmentCount += fragments.length;
		perFile.push({
			mapper_xml: f.relPath,
			statements: records.length,
			excluded_fragments: fragments.length,
		});
	}

	const byType = {};
	for (const r of allRecords) byType[r.operation] = (byType[r.operation] || 0) + 1;
	const tableSet = new Set();
	for (const r of allRecords) for (const t of r.dependent_tables) tableSet.add(t);
	const dynamicTotal = allRecords.reduce(
		(s, r) => s + r.dynamic_branch.reduce((x, d) => x + (Number(d.branch_count) || 0), 0),
		0,
	);
	const callableCount = allRecords.filter((r) => r.statement_type === 'CALLABLE').length;

	const summary = {
		total_sql_operations: allRecords.length,
		by_type: byType,
		dependent_tables_unique: [...tableSet].sort(),
		dynamic_branch_count: dynamicTotal,
		callable_count: callableCount,
		excluded_fragment_count: fragmentCount,
		mapper_files: perFile.length,
	};

	const autoCols = ['sql_id', 'mapper_xml', 'statement_type', 'dynamic_branch', 'dependent_tables'];
	const extraction_automation = {
		auto_extracted_columns: autoCols,
		manual_columns: PENDING_JUDGMENT_COLUMNS,
		auto_ratio_external_6: '4/6 = 66.7% (sql_id/mapper_xml/dynamic_branch/dependent_tables 결정론 / called_from_screen·business_meaning=LLM)',
		auto_ratio_external_7: '5/7 = 71.4% (statement_type 결정론 추가 후)',
		auto_ratio_total_11: '5/11 = 45.5% (판단 6 컬럼 = LLM/human)',
		extractor_note:
			'본 비율은 도구 결정론 산출 실측 — LLM 자기보고 아님. dependent_tables=후보(exhaustive ❌) / statement_type 기본 PREPARED=MyBatis 규약 추론.',
	};

	// 결정론 payload(timestamp 제외) → result_hash.
	const payload = { summary, extraction_automation, inventory: allRecords };
	const resultHash = sha256(stableStringify(payload));
	const inputsHash = sha256(
		[...files].sort((a, b) => a.relPath.localeCompare(b.relPath)).map((f) => `${f.relPath}\0${f.content}`).join('\0\0'),
	);

	const result = {
		meta_status: 'auto_extracted_pending_enrichment',
		meta: {
			schema: 'sql-inventory.schema.json',
			schema_conformance: 'PARTIAL — 판단 6 컬럼(business_meaning/intent_vs_bug_classification/confidence 등) null. LLM 보강 후 sql-inventory.json 으로 승격 시 정합.',
			generated_by: 'sql-inventory-extractor',
			do_not_edit_manually: true,
			reference_lens: false,
			tool_kind: 'deterministic_extractor',
			pending_judgment_columns: PENDING_JUDGMENT_COLUMNS,
			trust_note:
				'auto 5 컬럼 결정론(SKILL analysis-sql-inventory §1–4 grep 레시피 코드화). 판단 컬럼=null → LLM/human 보강 의무. dependent_tables=후보(subquery/CTE/동적테이블명 누락 가능) / statement_type 기본=추론.',
			generated_at: nowIso,
		},
		summary,
		extraction_automation,
		inventory: allRecords,
		raw_grep_lines: allRaw,
		evidence: {
			tool_version: TOOL_VERSION,
			invocation_timestamp: nowIso,
			inputs_hash: inputsHash,
			result_hash: resultHash,
			reproduction_command: reproductionCommand,
			files_scanned: files.length,
			evidence_trust: 'real_tool',
		},
	};
	return result;
}
