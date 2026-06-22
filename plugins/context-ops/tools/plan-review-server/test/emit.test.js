import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildHtml } from '../src/emit.js';
import { buildFieldModel } from '../src/field-classify.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(__dirname, '..', '..', '..');
const SCHEMA = JSON.parse(
	readFileSync(join(REPO, 'schemas', 'task-plan.schema.json'), 'utf-8'),
);
const PLAN = JSON.parse(
	readFileSync(
		join(
			REPO,
			'examples',
			'poc-14-fsim-corroboration',
			'.ai-context',
			'output',
			'task-plan.json',
		),
		'utf-8',
	),
);

function render(extra) {
	const fieldModel = buildFieldModel(PLAN, SCHEMA);
	return buildHtml({
		fieldModel,
		taskPlan: PLAN,
		summary: {
			verdict: 'review',
			headline: '검토 후 진행 — 권장 기준 미달 1건',
			blocking: [],
			review: [{ code: 'coverage_threshold', detail: 'coverage 0.8 < 0.85' }],
		},
		meta: { taskPlanPath: '.ai-context/output/task-plan.json' },
		...extra,
	});
}

test('buildHtml — 모든 placeholder 치환 (잔여 __X__ 없음)', () => {
	const html = render();
	const leftovers = html.match(/__[A-Z_]+__/g);
	assert.equal(leftovers, null, `잔여 placeholder: ${leftovers}`);
});

test('buildHtml — self-contained (외부 네트워크 자산 0)', () => {
	const html = render();
	assert.equal(/src\s*=\s*["']https?:/i.test(html), false, 'external src 금지');
	assert.equal(/href\s*=\s*["']https?:/i.test(html), false, 'external href 금지');
	assert.equal(/cdn\./i.test(html), false, 'CDN 참조 금지');
});

test('buildHtml — 데이터·평결·스크립트(kit+renderer+app) 인라인', () => {
	const html = render();
	assert.ok(html.includes('TASK-USER-FSIM-001'), '산출물 데이터 인라인');
	assert.ok(html.includes('검토 후 진행'), 'gate headline 인라인');
	assert.ok(html.includes('id="artifact-data"'), 'artifact-data 스크립트 블록');
	assert.ok(html.includes('var Kit'), 'kit.js 인라인');
	assert.ok(html.includes('var Renderer'), '렌더러 인라인');
	assert.ok(html.includes('연결 인수기준'), 'kit LABELS 인라인 (가독성 레이어)');
});

test('buildHtml — artifactType 별 렌더러 선택 (AC=Gherkin / 미상=generic)', () => {
	const acFm = buildFieldModel({ meta: {}, criteria: [{ id: 'AC-X-001', gherkin: { given: ['g'], when: 'w', then: ['t'] } }] }, SCHEMA);
	const acHtml = buildHtml({ fieldModel: acFm, taskPlan: { criteria: [] }, artifactType: 'acceptance-criteria' });
	assert.ok(acHtml.includes('scenarioNode'), 'AC 렌더러(Gherkin) 선택');
	const genHtml = buildHtml({ fieldModel: { leaves: [] }, taskPlan: {}, artifactType: 'unknown-xyz' });
	assert.ok(genHtml.includes('var Renderer'), 'generic fallback 렌더러');
});

test('buildHtml — </script> 안전 이스케이프', () => {
	// 데이터에 </script> 가 들어가도 조기 종료되지 않아야 한다.
	const fieldModel = buildFieldModel(
		{ meta: {}, derivation_source: {}, tasks: [{ id: 'TASK-X-001', title: 'a</script>b' }] },
		SCHEMA,
	);
	const html = buildHtml({ fieldModel, taskPlan: { x: 'a</script>b' } });
	assert.equal(html.includes('a</script>b'), false, '원본 </script> 잔존 금지');
	assert.ok(html.includes('a<\\/script>b'), '이스케이프된 형태 존재');
});
