import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { buildInventory, extractFromXml, PENDING_JUDGMENT_COLUMNS } from '../src/extract.js';

// iBATIS 2 혼합 fixture (5 stmt 종류 / sql-inventory-validator fixture 동형).
const MIXED = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE sqlMap PUBLIC "-//iBATIS.com//DTD SQL Map 2.0//EN" "http://www.ibatis.com/dtd/sql-map-2.dtd">
<sqlMap namespace="TestMixedDAO">
  <select id="findById" parameterClass="java.lang.Long" resultClass="HashMap">
    SELECT * FROM users WHERE id = #id#
  </select>
  <insert id="insertUser" parameterClass="HashMap">
    INSERT INTO users (name, email) VALUES (#name#, #email#)
  </insert>
  <update id="updateUser" parameterClass="HashMap">
    UPDATE users SET name = #name# WHERE id = #id#
  </update>
  <delete id="deleteUser" parameterClass="java.lang.Long">
    DELETE FROM users WHERE id = #id#
  </delete>
  <procedure id="callRefreshUser" parameterClass="HashMap">
    EXEC MDI.dbo.REFRESH_USER ?
  </procedure>
</sqlMap>`;

// MyBatis 3 fixture (reqmng 동형 — dynamic tags + sql fragment + include).
const MYBATIS3 = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mapper PUBLIC "//mybatis.org/DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.example.foo.BoSampleRepository">
  <sql id="baseWhere">
    <if test="name != null">AND name = #{name}</if>
  </sql>
  <select id="search" parameterType="Foo" resultType="Foo">
    SELECT * FROM TB_FOO f JOIN TB_BAR b ON f.id = b.fid
    <where>
      <if test="status != null">AND status = #{status}</if>
      <foreach collection="ids" item="i" open="AND id IN (" close=")" separator=",">#{i}</foreach>
    </where>
    <include refid="baseWhere"/>
  </select>
  <insert id="create" parameterType="Foo">
    INSERT INTO TB_FOO (name) VALUES (#{name})
  </insert>
</mapper>`;

test('iBATIS 2 mixed — 5 statement, types, procedure→CALLABLE', () => {
	const { records, fragments } = extractFromXml(MIXED, 'TestMixed.xml');
	assert.equal(records.length, 5);
	assert.equal(fragments.length, 0);
	const byId = Object.fromEntries(records.map((r) => [r.sql_id, r]));
	assert.equal(byId['TestMixedDAO.findById'].operation, 'select');
	assert.equal(byId['TestMixedDAO.callRefreshUser'].statement_type, 'CALLABLE');
	assert.equal(byId['TestMixedDAO.insertUser'].statement_type, 'PREPARED');
	// 전 record 동일 테이블 'users'
	for (const r of records) {
		if (r.operation === 'procedure') continue; // EXEC = FROM/JOIN 없음
		assert.deepEqual(r.dependent_tables, ['users']);
		assert.equal(r.dependent_tables_are_candidates, true);
	}
});

test('판단 6 컬럼 = null placeholder (도구가 채우지 않음)', () => {
	const { records } = extractFromXml(MIXED, 'TestMixed.xml');
	for (const r of records) {
		for (const col of PENDING_JUDGMENT_COLUMNS) {
			assert.equal(r[col], null, `${col} must be null`);
		}
	}
});

test('MyBatis 3 — sql fragment 제외 / include 추적 / dynamic branch / table 후보', () => {
	const { records, fragments } = extractFromXml(MYBATIS3, 'BoSample.xml');
	assert.equal(fragments.length, 1); // <sql id="baseWhere"> 제외
	assert.deepEqual(fragments, ['baseWhere']);
	assert.equal(records.length, 2); // search + create (sql fragment 미포함)

	const search = records.find((r) => r.sql_id === 'BoSampleRepository.search');
	assert.ok(search);
	assert.deepEqual(search.dependent_tables, ['TB_BAR', 'TB_FOO']); // 정렬
	assert.deepEqual(search.includes_fragments, ['baseWhere']);
	assert.ok(search.tables_note.includes('include'));
	// dynamic_branch: mybatis3:foreach 1 / mybatis3:if 1 / mybatis3:where 1 (정렬 by tag_type)
	const bt = Object.fromEntries(search.dynamic_branch.map((d) => [d.tag_type, d.branch_count]));
	assert.equal(bt['mybatis3:if'], 1);
	assert.equal(bt['mybatis3:foreach'], 1);
	assert.equal(bt['mybatis3:where'], 1);

	const create = records.find((r) => r.sql_id === 'BoSampleRepository.create');
	assert.equal(create.statement_type, 'PREPARED');
	assert.deepEqual(create.dependent_tables, ['TB_FOO']);
	assert.equal(create.dynamic_branch.length, 0);
});

test('buildInventory — summary / extraction_automation / evidence', () => {
	const r = buildInventory({
		files: [
			{ relPath: 'a/TestMixed.xml', content: MIXED },
			{ relPath: 'b/BoSample.xml', content: MYBATIS3 },
		],
		nowIso: '2026-06-12T00:00:00.000Z',
	});
	assert.equal(r.meta_status, 'auto_extracted_pending_enrichment');
	assert.equal(r.summary.total_sql_operations, 7); // 5 + 2
	assert.equal(r.summary.excluded_fragment_count, 1);
	assert.equal(r.summary.callable_count, 1);
	assert.equal(r.summary.by_type.select, 2);
	assert.ok(r.summary.dependent_tables_unique.includes('users'));
	assert.ok(r.summary.dependent_tables_unique.includes('TB_FOO'));
	assert.equal(r.extraction_automation.auto_extracted_columns.length, 5);
	assert.match(r.extraction_automation.auto_ratio_external_6, /^\d+\/6 = /);
	assert.equal(r.evidence.evidence_trust, 'real_tool');
	assert.match(r.evidence.result_hash, /^[a-f0-9]{64}$/);
	assert.match(r.evidence.inputs_hash, /^[a-f0-9]{64}$/);
	assert.ok(Array.isArray(r.raw_grep_lines) && r.raw_grep_lines.length === 7);
});

test('result_hash 결정론 — timestamp 독립', () => {
	const a = buildInventory({ files: [{ relPath: 'x.xml', content: MIXED }], nowIso: '2026-06-12T00:00:00.000Z' });
	const b = buildInventory({ files: [{ relPath: 'x.xml', content: MIXED }], nowIso: '2030-01-01T12:34:56.000Z' });
	assert.equal(a.evidence.result_hash, b.evidence.result_hash);
});

test('result_hash 입력 변하면 변함', () => {
	const a = buildInventory({ files: [{ relPath: 'x.xml', content: MIXED }], nowIso: '2026-06-12T00:00:00.000Z' });
	const b = buildInventory({ files: [{ relPath: 'x.xml', content: MYBATIS3 }], nowIso: '2026-06-12T00:00:00.000Z' });
	assert.notEqual(a.evidence.result_hash, b.evidence.result_hash);
});

test('빈 입력 — 0건 정직 산출(throw ❌)', () => {
	const r = buildInventory({ files: [], nowIso: '2026-06-12T00:00:00.000Z' });
	assert.equal(r.summary.total_sql_operations, 0);
	assert.deepEqual(r.inventory, []);
	assert.equal(r.evidence.files_scanned, 0);
});

// F1 — CTE(WITH…AS) 별칭이 dependent_tables 로 새는 회귀 차단 (ep-be-gea 출입통제 dogfood / DEC-2026-06-13)
test('CTE — WITH 별칭(base_range/di_agg/USERS)은 dependent_tables 제외, 실테이블만 유지', () => {
	const CTE = `<mapper namespace="com.example.acm.AcmRepository">
  <select id="searchSummary" resultType="map">
    WITH base_range AS (
      SELECT id, dt FROM EP_BE_GEA_ADMIN.dbo.ADM_ENTRC_BASE
    ),
    di_agg (k, c) AS (
      SELECT k, COUNT(*) FROM EP_BE_GEA_ADMIN.dbo.ADM_VISITOR GROUP BY k
    ),
    USERS AS (
      SELECT * FROM base_range
    )
    SELECT * FROM base_range b JOIN di_agg d ON b.id = d.k JOIN USERS u ON u.id = b.id
  </select>
</mapper>`;
	const { records } = extractFromXml(CTE, 'Acm.xml');
	const r = records.find((x) => x.sql_id === 'AcmRepository.searchSummary');
	assert.ok(r);
	assert.deepEqual(r.dependent_tables, ['EP_BE_GEA_ADMIN.dbo.ADM_ENTRC_BASE', 'EP_BE_GEA_ADMIN.dbo.ADM_VISITOR']);
	for (const cte of ['base_range', 'di_agg', 'USERS', 'users']) {
		assert.ok(!r.dependent_tables.includes(cte), `CTE ${cte} 누출`);
	}
});

test('CTE — RECURSIVE + col-list + 자기참조 JOIN 도 실테이블만 유지', () => {
	const xml = `<mapper namespace="X"><select id="q" resultType="map">
WITH RECURSIVE node_cte (id, pid) AS (
  SELECT id, pid FROM EP.dbo.TREE_TABLE WHERE pid IS NULL
  UNION ALL SELECT t.id, t.pid FROM EP.dbo.TREE_TABLE t JOIN node_cte n ON t.pid = n.id
)
SELECT * FROM node_cte</select></mapper>`;
	const { records } = extractFromXml(xml, 'X.xml');
	assert.deepEqual(records[0].dependent_tables, ['EP.dbo.TREE_TABLE']);
	assert.ok(!records[0].dependent_tables.includes('node_cte'));
});

test('CTE — <sql> fragment 정의 + <include> 참조 CTE 도 제외 (fragment-defined / 출입통제 실사례)', () => {
	const xml = `<mapper namespace="Z">
  <sql id="cteBlock">
    WITH base_range AS ( SELECT id FROM EP.dbo.ENTRC_BASE ),
    di_agg (k, c) AS ( SELECT k, COUNT(*) FROM EP.dbo.VISITOR GROUP BY k )
  </sql>
  <select id="search" resultType="map">
    <include refid="cteBlock"/>
    SELECT * FROM base_range b JOIN di_agg d ON b.id = d.k
  </select>
</mapper>`;
	const { records } = extractFromXml(xml, 'Z.xml');
	const r = records.find((x) => x.sql_id === 'Z.search');
	assert.ok(r);
	// fragment 에 정의된 CTE(base_range/di_agg)도 include 해소로 포착 → 제외(body 엔 WITH 없음)
	assert.ok(!r.dependent_tables.includes('base_range'), 'fragment CTE base_range 누출');
	assert.ok(!r.dependent_tables.includes('di_agg'), 'fragment CTE di_agg 누출');
	assert.deepEqual(r.dependent_tables, []); // CTE 참조뿐 — fragment 내 실테이블은 미해석(include carry)
});

// TVF/키워드 noise — ep-be-gea dogfood (DEC-2026-06-13-sql-inventory-cte-exclusion §7)
test('TVF — FROM/JOIN name( (OPENJSON·STRING_SPLIT)은 dependent_tables 제외, 실테이블만', () => {
	const xml = `<mapper namespace="X"><select id="q" resultType="map">
SELECT * FROM EP.dbo.ORDERS o
CROSS APPLY OPENJSON(o.payload) j
JOIN STRING_SPLIT(o.csv, ',') s ON 1=1</select></mapper>`;
	const { records } = extractFromXml(xml, 'X.xml');
	assert.deepEqual(records[0].dependent_tables, ['EP.dbo.ORDERS']);
	assert.ok(!records[0].dependent_tables.includes('OPENJSON'));
	assert.ok(!records[0].dependent_tables.includes('STRING_SPLIT'));
});

test('TVF 가드 — INSERT INTO t(col,col) 의 컬럼리스트는 실테이블 누락 ❌ (FROM/JOIN 한정)', () => {
	const xml = `<mapper namespace="Y"><insert id="ins">
INSERT INTO EP.dbo.ORDERS(id, name) VALUES (#{id}, #{name})</insert></mapper>`;
	const { records } = extractFromXml(xml, 'Y.xml');
	assert.deepEqual(records[0].dependent_tables, ['EP.dbo.ORDERS']); // 컬럼리스트 '(' 에도 실테이블 유지
});

test('TVF 가드 — FROM t (NOLOCK) 공백 hint 는 실테이블 유지 (즉시 ( 만 함수)', () => {
	const xml = `<mapper namespace="Z"><select id="q">SELECT * FROM EP.dbo.LEDGER (NOLOCK) WHERE id=#{id}</select></mapper>`;
	const { records } = extractFromXml(xml, 'Z.xml');
	assert.deepEqual(records[0].dependent_tables, ['EP.dbo.LEDGER']);
});

test('키워드 — UPDATE SET (MERGE) 의 SET / JOIN FROM 의 FROM 은 제외', () => {
	const xml = `<mapper namespace="W"><update id="mrg">
MERGE INTO EP.dbo.ACCT t USING EP.dbo.STG s ON t.id=s.id
WHEN MATCHED THEN UPDATE SET t.amt = s.amt</update></mapper>`;
	const { records } = extractFromXml(xml, 'W.xml');
	assert.ok(!records[0].dependent_tables.includes('SET')); // UPDATE SET 키워드 제외
	assert.ok(records[0].dependent_tables.includes('EP.dbo.ACCT')); // MERGE INTO target 유지
	// 주: USING 절(EP.dbo.STG)은 추출기가 FROM|JOIN|INTO|UPDATE 만 캡처 → 미포착 = 별개 한계(본 fix 범위 아님)
});

// DEC §8 — bracket-quoted qualified name 복원 / SQL 주석 끊긴 CTE / mid-token 동적 / UPDATE-alias
test('bracket-quoted [db].[dbo].[T] 는 전체 복원(점 형태), bare DB명 누출 0', () => {
	const xml = `<mapper namespace="X"><select id="q">
SELECT * FROM [EP_BE_COMMON].[dbo].[TB_BASE_USER] u
JOIN EP_BE_GEA_ADMIN.[dbo].[ADM_X] a ON 1=1
WHERE EXISTS (SELECT 1 FROM [dbo].[ADM_Y])</select></mapper>`;
	const { records } = extractFromXml(xml, 'X.xml');
	const t = records[0].dependent_tables;
	assert.ok(t.includes('EP_BE_COMMON.dbo.TB_BASE_USER'));
	assert.ok(t.includes('EP_BE_GEA_ADMIN.dbo.ADM_X'));
	assert.ok(t.includes('dbo.ADM_Y'));
	assert.ok(!t.includes('EP_BE_COMMON')); // bare DB명 누출 0
});

test('SQL /* */ 주석으로 끊긴 CTE 체인도 포착 → 제외 (emp_distinct-식)', () => {
	const xml = `<mapper namespace="Y"><select id="q">
WITH base AS (SELECT 1 id FROM EP.dbo.A),
/* 집계 CTE */
emp_distinct AS (SELECT id FROM EP.dbo.B)
SELECT * FROM base b INNER JOIN emp_distinct e ON b.id=e.id</select></mapper>`;
	const { records } = extractFromXml(xml, 'Y.xml');
	assert.deepEqual(records[0].dependent_tables, ['EP.dbo.A', 'EP.dbo.B']); // CTE(base/emp_distinct) 제외, 실테이블만
});

test('동적 테이블 mid-token (db.dbo.${t})는 skip — db.dbo.$ 누출 0', () => {
	const xml = `<mapper namespace="Z"><select id="q">SELECT * FROM EP_BE_COMMON.dbo.\${userTableName} u WHERE id=#{id}</select></mapper>`;
	const { records } = extractFromXml(xml, 'Z.xml');
	assert.ok(!records[0].dependent_tables.some((t) => t.includes('$')));
	assert.equal(records[0].dependent_tables.length, 0); // 동적 → 정직 캡처 0
});

test('UPDATE <alias> SET … FROM <table> <alias>: 별칭 제외, 실테이블(FROM) 유지', () => {
	const xml = `<mapper namespace="W"><update id="u">
UPDATE T1 SET T1.X = 'Y' FROM EP_BE_GEA_ADMIN.dbo.ADM_LIST T1 INNER JOIN EP.dbo.OTHER o ON 1=1</update></mapper>`;
	const { records } = extractFromXml(xml, 'W.xml');
	const t = records[0].dependent_tables;
	assert.ok(!t.includes('T1')); // UPDATE-alias 제외
	assert.ok(t.includes('EP_BE_GEA_ADMIN.dbo.ADM_LIST') && t.includes('EP.dbo.OTHER')); // 실테이블 유지
});

test('UPDATE 가드 — 평범한 UPDATE <bare-realtable> SET (FROM-alias 아님)은 유지', () => {
	const xml = `<mapper namespace="V"><update id="u">UPDATE MY_BARE_TABLE SET x=1 WHERE id=#{id}</update></mapper>`;
	const { records } = extractFromXml(xml, 'V.xml');
	assert.ok(records[0].dependent_tables.includes('MY_BARE_TABLE')); // alias 집합에 없음 → 실테이블 유지
});

test('CTE — 비-CTE SQL(컬럼 alias·CAST AS)은 오제외 0 (false-positive 가드)', () => {
	const xml = `<mapper namespace="Y"><select id="q" resultType="map">
SELECT a.id, CAST(a.amt AS INT) AS amt2, (SELECT 1) AS one FROM EP.dbo.ACCOUNT a JOIN EP.dbo.LEDGER l ON a.id = l.aid</select></mapper>`;
	const { records } = extractFromXml(xml, 'Y.xml');
	assert.deepEqual(records[0].dependent_tables, ['EP.dbo.ACCOUNT', 'EP.dbo.LEDGER']);
});

// T-SQL FROM-less DELETE (`DELETE <table> WHERE …`) — dependent_tables 포착 (DEC §9 / FROM-less DELETE dogfood).
test('FROM-less DELETE (T-SQL `DELETE <schema.table> WHERE`)는 실테이블 포착', () => {
	const xml = `<mapper namespace="D"><delete id="deleteItem" parameterType="P">
/* deleteItem comment */
DELETE EP_DB.dbo.SAMPLE_REQ_BASE
WHERE REQ_NO = #{reqNo}</delete></mapper>`;
	const { records } = extractFromXml(xml, 'D.xml');
	assert.equal(records[0].operation, 'delete');
	assert.deepEqual(records[0].dependent_tables, ['EP_DB.dbo.SAMPLE_REQ_BASE']);
});

test('FROM-less DELETE bare 테이블도 포착 / `DELETE FROM t`는 중복·FROM 누출 0 (regression)', () => {
	const xml = `<mapper namespace="D2">
<delete id="bare">DELETE MY_TABLE WHERE id = #{id}</delete>
<delete id="withFrom">DELETE FROM users WHERE id = #{id}</delete></mapper>`;
	const { records } = extractFromXml(xml, 'D2.xml');
	const byId = Object.fromEntries(records.map((r) => [r.sql_id, r]));
	assert.deepEqual(byId['D2.bare'].dependent_tables, ['MY_TABLE']);
	assert.deepEqual(byId['D2.withFrom'].dependent_tables, ['users']); // FROM 규칙 단독 / 'FROM' 누출·중복 0
});

test('SQL Server aliased DELETE (`DELETE d FROM <table> d`)는 별칭 제외·실테이블(FROM) 유지', () => {
	const xml = `<mapper namespace="D3"><delete id="aliased">
DELETE d FROM EP.dbo.TARGET d INNER JOIN EP.dbo.OTHER o ON d.id = o.id WHERE o.x = #{x}</delete></mapper>`;
	const { records } = extractFromXml(xml, 'D3.xml');
	const t = records[0].dependent_tables;
	assert.ok(!t.includes('d') && !t.includes('D')); // alias 제외
	assert.deepEqual(t, ['EP.dbo.OTHER', 'EP.dbo.TARGET']); // 실테이블만
});

test('T-SQL `DELETE TOP (n) FROM <table>`: TOP 토큰 제외, 실테이블 유지', () => {
	const xml = `<mapper namespace="D4"><delete id="topDel">
DELETE TOP (100) FROM EP.dbo.BATCH_QUEUE WHERE created &lt; #{cutoff}</delete></mapper>`;
	const { records } = extractFromXml(xml, 'D4.xml');
	const t = records[0].dependent_tables;
	assert.ok(!t.includes('TOP')); // 행수제한 키워드 제외
	assert.deepEqual(t, ['EP.dbo.BATCH_QUEUE']);
});
