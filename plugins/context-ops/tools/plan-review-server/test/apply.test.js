import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import {
	mkdtempSync,
	rmSync,
	copyFileSync,
	readFileSync,
	existsSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
	applyEdits,
	classifyEditCost,
	decideBranch,
	indexLeaves,
	apply,
} from '../src/apply.js';
import { buildFieldModel } from '../src/field-classify.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(__dirname, '..', '..', '..');
const SCHEMA = JSON.parse(
	readFileSync(join(REPO, 'schemas', 'task-plan.schema.json'), 'utf-8'),
);
const VALIDATOR_CLI = join(
	REPO,
	'tools',
	'plan-coverage-validator',
	'src',
	'cli.js',
);
const POC = join(
	REPO,
	'examples',
	'poc-14-fsim-corroboration',
	'.ai-context',
	'output',
);

// committed examples 를 절대 건드리지 않도록 tmp 복사본에서만 apply 실행.
let workDir;
let taskPlanPath;
let acceptancePath;

before(() => {
	workDir = mkdtempSync(join(tmpdir(), 'plan-review-test-'));
	taskPlanPath = join(workDir, 'task-plan.json');
	acceptancePath = join(workDir, 'acceptance-criteria.json');
	copyFileSync(join(POC, 'task-plan.json'), taskPlanPath);
	copyFileSync(join(POC, 'acceptance-criteria.json'), acceptancePath);
});

after(() => {
	rmSync(workDir, { recursive: true, force: true });
});

function freshLeafIndex() {
	const plan = JSON.parse(readFileSync(taskPlanPath, 'utf-8'));
	return indexLeaves(buildFieldModel(plan, SCHEMA));
}

// ---- 순수 함수 ----

test('classifyEditCost — ①text 편집 = 싼 변경', () => {
	const idx = freshLeafIndex();
	const cost = classifyEditCost({ 'tasks[0].title': '새 제목' }, [], idx);
	assert.equal(cost.expensive, false);
});

test('classifyEditCost — 코멘트 동반 = 비싼 변경', () => {
	const idx = freshLeafIndex();
	const cost = classifyEditCost({}, [{ anchor: 'tasks[0].dependencies', text: '순서 바꿔' }], idx);
	assert.equal(cost.expensive, true);
	assert.ok(cost.reasons.includes('comments_present'));
});

test('classifyEditCost — ③link 편집 = 비싼 변경 (fail-safe)', () => {
	const idx = freshLeafIndex();
	const cost = classifyEditCost({ 'tasks[0].ac_refs[0]': 'AC-X-999' }, [], idx);
	assert.equal(cost.expensive, true);
	assert.ok(cost.reasons.some((r) => r.startsWith('link_edit:')));
});

test('classifyEditCost — layer(expensive enum) 편집 = 비싼 변경', () => {
	const idx = freshLeafIndex();
	const cost = classifyEditCost({ 'tasks[0].layer': 'be' }, [], idx);
	assert.equal(cost.expensive, true);
	assert.ok(cost.reasons.some((r) => r.startsWith('expensive_enum:')));
});

test('decideBranch — 싼 변경 ∧ validator 통과 = cheap', () => {
	assert.equal(decideBranch({ expensive: false }, { exitCode: 0 }), 'cheap');
});

test('decideBranch — validator 실패(exit 1) = expensive', () => {
	assert.equal(decideBranch({ expensive: false }, { exitCode: 1 }), 'expensive');
});

test('decideBranch — validator 없음(skipped) = expensive (검증없이 write 안 함)', () => {
	assert.equal(decideBranch({ expensive: false }, { skipped: true }), 'expensive');
});

test('apply — discovery-spec(validator 없음) 코멘트 → expensive + discovery-spec-revisions.json', () => {
	const dWork = mkdtempSync(join(tmpdir(), 'plan-review-disc-'));
	const dPath = join(dWork, 'discovery-spec.json');
	const dSchema = JSON.parse(
		readFileSync(join(REPO, 'schemas', 'discovery-spec.schema.json'), 'utf-8'),
	);
	copyFileSync(join(POC, 'discovery-spec.json'), dPath);
	const r = apply({
		taskPlanPath: dPath,
		acceptancePath: null, // discovery 는 acceptance/validator 없음
		schema: dSchema,
		edits: {},
		comments: [{ anchor: 'use_cases[0].description', text: '이 UC 범위를 좁혀줘' }],
		validatorCli: null, // 스킵
		artifactType: 'discovery-spec',
		nowIso: '2026-06-22T00:00:00Z',
	});
	assert.equal(r.branch, 'expensive');
	assert.equal(r.validator.skipped, true);
	assert.equal(r.revision.artifact_type, 'discovery-spec');
	assert.ok(existsSync(join(dWork, 'discovery-spec-revisions.json')), 'artifact별 revision 파일명');
	rmSync(dWork, { recursive: true, force: true });
});

test('applyEdits — number 필드 coercion', () => {
	const plan = JSON.parse(readFileSync(taskPlanPath, 'utf-8'));
	const idx = indexLeaves(buildFieldModel(plan, SCHEMA));
	const out = applyEdits(plan, { 'tasks[0].execution_order': '5' }, idx);
	assert.strictEqual(out.tasks[0].execution_order, 5); // string '5' → number 5
});

// ---- IO 오케스트레이션 (real validator spawn) ----

test('apply — 싼 변경(title) → task-plan.json 반영 + cheap', () => {
	const r = apply({
		taskPlanPath,
		acceptancePath,
		schema: SCHEMA,
		edits: { 'tasks[0].title': '변경된 제목 — Signup 검증' },
		comments: [],
		validatorCli: VALIDATOR_CLI,
		nowIso: '2026-06-19T00:00:00Z',
	});
	assert.equal(r.branch, 'cheap');
	assert.equal(r.validator.exitCode, 0);
	const written = JSON.parse(readFileSync(taskPlanPath, 'utf-8'));
	assert.equal(written.tasks[0].title, '변경된 제목 — Signup 검증');
	assert.ok(!existsSync(join(workDir, 'task-plan-revisions.json')));
});

test('apply — locked(meta provenance) edit 은 서버 belt 가 거부 (수정 불가 잠금)', () => {
	const before = readFileSync(taskPlanPath, 'utf-8');
	const r = apply({
		taskPlanPath,
		acceptancePath,
		schema: SCHEMA,
		edits: { 'meta.confidence': '0.99' }, // provenance — 수정 시도
		comments: [],
		validatorCli: VALIDATOR_CLI,
		nowIso: '2026-06-22T00:00:00Z',
	});
	assert.ok(r.rejected_locked.includes('meta.confidence'), 'readonly edit 거부 기록');
	const after = JSON.parse(readFileSync(taskPlanPath, 'utf-8'));
	const orig = JSON.parse(before);
	assert.equal(after.meta.confidence, orig.meta.confidence, 'provenance 불변');
});

test('apply — 구조 link(id/dependencies/execution_order) 코멘트는 서버 belt 가 거부', () => {
	const r = apply({
		taskPlanPath,
		acceptancePath,
		schema: SCHEMA,
		edits: {},
		comments: [
			{ anchor: 'tasks[0].id', text: 'ID 바꿔줘' },
			{ anchor: 'tasks[0].execution_order', text: '순서 바꿔' },
			{ anchor: 'tasks[0].title', text: '제목 다듬어' }, // text = 통과
			{ anchor: null, text: '전체 의견' }, // 전역 = 통과
		],
		validatorCli: VALIDATOR_CLI,
		nowIso: '2026-06-22T00:00:00Z',
	});
	assert.ok(r.rejected_locked.includes('tasks[0].id'), 'id 코멘트 거부');
	assert.ok(r.rejected_locked.includes('tasks[0].execution_order'), 'execution_order 코멘트 거부');
	// 통과한 코멘트만 revision 에 기록.
	const texts = r.revision.comments.map((c) => c.text);
	assert.ok(texts.includes('제목 다듬어'), 'text 필드 코멘트는 통과');
	assert.ok(texts.includes('전체 의견'), '전역 코멘트는 통과');
	assert.ok(!texts.includes('ID 바꿔줘'), 'id 코멘트는 기록 안 됨');
});

test('apply — 코멘트 동반 → task-plan-revisions.json 기록 + task-plan 불변', () => {
	const before = readFileSync(taskPlanPath, 'utf-8');
	const r = apply({
		taskPlanPath,
		acceptancePath,
		schema: SCHEMA,
		edits: {},
		comments: [{ anchor: 'tasks[0].dependencies', text: '이 task 를 로그인 다음으로' }],
		validatorCli: VALIDATOR_CLI,
		nowIso: '2026-06-19T00:00:00Z',
	});
	assert.equal(r.branch, 'expensive');
	assert.equal(r.revision.next_action, 'replan');
	const revPath = join(workDir, 'task-plan-revisions.json');
	assert.ok(existsSync(revPath));
	const rev = JSON.parse(readFileSync(revPath, 'utf-8'));
	assert.equal(rev.comments[0].text, '이 task 를 로그인 다음으로');
	// task-plan.json 은 건드리지 않았다.
	assert.equal(readFileSync(taskPlanPath, 'utf-8'), before);
});
