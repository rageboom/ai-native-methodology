// apply.js — 사람 편집(edits) + 코멘트(comments)를 받아 변경 종류로 분기한다.
//
//   싼 변경  = comments 없음 ∧ edits 가 ①text/②enum(layer 제외)만 ∧ validator exit 0
//             → task-plan.json 확정 write (atomicWrite). 다음 gate 에서 그대로 go 가능.
//   비싼 변경 = comments 있음 ∨ ③link/layer 편집 ∨ validator exit 1
//             → plan-revisions.json 기록(next_action="replan"). 메인이 plan-agent 재dispatch.
//
// 서버는 판정을 만들지 않는다 — 재검증은 plan-coverage-validator(결정론)에 위임하고,
// task-plan.json 에는 사람 입력만 쓴다 (LLM inject ❌ / 결정론 axis 무오염).

import { spawnSync } from 'node:child_process';
import {
	writeFileSync,
	mkdtempSync,
	rmSync,
	readFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { setByPath, buildFieldModel } from './field-classify.js';
import { atomicWrite } from '../../chain-driver/src/state-store.js';

// leaf descriptor 배열 → path 인덱스.
export function indexLeaves(fieldModel) {
	const idx = {};
	for (const leaf of fieldModel.leaves) idx[leaf.path] = leaf;
	return idx;
}

// edits 를 task-plan 복제본에 적용 (원본 number 필드는 숫자 coercion).
export function applyEdits(taskPlan, edits, leafIndex) {
	const clone = structuredClone(taskPlan);
	for (const [path, raw] of Object.entries(edits || {})) {
		const leaf = leafIndex[path];
		let value = raw;
		if (leaf && typeof leaf.value === 'number' && typeof raw === 'string') {
			const n = Number(raw);
			if (!Number.isNaN(n)) value = n;
		}
		setByPath(clone, path, value);
	}
	return clone;
}

// 변경 비용 분류 — link/layer/readonly 편집 또는 코멘트가 있으면 expensive.
//   link/readonly 는 UI 에서 잠겨 있어 정상적으로는 안 오지만, 직접 POST 변조 방어로
//   도착 시에도 절대 silent write 하지 않고 replan 으로 보낸다 (fail-safe).
export function classifyEditCost(edits, comments, leafIndex) {
	const reasons = [];
	if (Array.isArray(comments) && comments.length > 0) {
		reasons.push('comments_present');
	}
	for (const path of Object.keys(edits || {})) {
		const leaf = leafIndex[path];
		if (!leaf) {
			reasons.push(`unknown_field:${path}`);
			continue;
		}
		if (leaf.kind === 'link') reasons.push(`link_edit:${path}`);
		else if (leaf.kind === 'enum' && leaf.expensive) {
			reasons.push(`expensive_enum:${path}`);
		} else if (leaf.kind === 'readonly') reasons.push(`readonly_edit:${path}`);
	}
	return { expensive: reasons.length > 0, reasons };
}

// 분기 결정 — 순수 함수.
export function decideBranch(editCost, validatorResult) {
	if (editCost.expensive) return 'expensive';
	// validator 없음(discovery/spec/AC) → 검증 없이 cheap-write 안 함. 변경 있으면 replan.
	if (validatorResult && validatorResult.skipped) return 'expensive';
	if (validatorResult && validatorResult.exitCode !== 0) return 'expensive';
	return 'cheap';
}

// plan-coverage-validator 재실행 (IO). candidate 를 temp 에 써서 검증.
export function runValidator({
	candidate,
	acceptancePath,
	validatorCli,
	threshold = 0.85,
}) {
	const dir = mkdtempSync(join(tmpdir(), 'plan-review-'));
	const candPath = join(dir, 'task-plan.candidate.json');
	writeFileSync(candPath, JSON.stringify(candidate, null, 2));
	const res = spawnSync(
		'node',
		[
			validatorCli,
			'--task-plan',
			candPath,
			'--acceptance',
			acceptancePath,
			'--threshold',
			String(threshold),
			'--json',
		],
		{ encoding: 'utf-8' },
	);
	rmSync(dir, { recursive: true, force: true });
	let summary = null;
	try {
		const parsed = JSON.parse(res.stdout);
		summary = parsed.summary ?? parsed;
	} catch {
		/* 출력 파싱 실패 시 null — 호출부가 stderr 로 진단 */
	}
	return {
		exitCode: res.status,
		summary,
		stdout: res.stdout,
		stderr: res.stderr,
	};
}

// 전체 오케스트레이션 (IO).
//   nowIso = 호출부 주입(테스트 결정성). 미주입 시 현재 시각.
export function apply({
	taskPlanPath,
	acceptancePath,
	schema,
	edits = {},
	comments = [],
	validatorCli,
	threshold = 0.85,
	nowIso,
	artifactType = 'task-plan',
}) {
	const taskPlan = JSON.parse(readFileSync(taskPlanPath, 'utf-8'));
	const fieldModel = buildFieldModel(taskPlan, schema);
	const leafIndex = indexLeaves(fieldModel);

	// 수정 불가 잠금(서버 belt) — locked 경로(readonly provenance + 순수 구조 link:
	//   id/dependencies/execution_order)는 UI 우회로 edit/comment 가 들어와도 진입 시 버린다.
	//   (UI 잠금과 이중화 / 기계 소유 항목은 사람 변경·코멘트 대상 ❌ = AI 전담.)
	const rejectedLocked = [];
	const safeEdits = {};
	for (const [path, val] of Object.entries(edits || {})) {
		if (leafIndex[path] && leafIndex[path].locked) {
			rejectedLocked.push(path);
		} else {
			safeEdits[path] = val;
		}
	}
	edits = safeEdits;

	// locked leaf 에 단 코멘트도 거부 (카드 전체/전역 코멘트는 leaf 가 아니라 통과).
	const safeComments = [];
	for (const c of comments || []) {
		const a = c && c.anchor;
		if (a && leafIndex[a] && leafIndex[a].locked) {
			rejectedLocked.push(a);
		} else {
			safeComments.push(c);
		}
	}
	comments = safeComments;

	const candidate = applyEdits(taskPlan, edits, leafIndex);
	const editCost = classifyEditCost(edits, comments, leafIndex);
	// validator 는 task-plan 만(plan-coverage). discovery/spec/AC = validatorCli 미지정 → 스킵.
	const validatorResult =
		validatorCli && acceptancePath
			? runValidator({ candidate, acceptancePath, validatorCli, threshold })
			: { exitCode: null, summary: null, skipped: true };
	const branch = decideBranch(editCost, validatorResult);
	const timestamp = nowIso || new Date().toISOString();

	if (branch === 'cheap') {
		atomicWrite(taskPlanPath, JSON.stringify(candidate, null, 2) + '\n');
		return {
			branch: 'cheap',
			written: taskPlanPath,
			validator: validatorResult,
			edit_cost: editCost,
			rejected_locked: rejectedLocked,
		};
	}

	// expensive — 산출물은 건드리지 않고 revision 만 기록 (artifact 별 파일).
	const revisionsPath = join(dirname(taskPlanPath), `${artifactType}-revisions.json`);
	const revision = {
		timestamp,
		artifact_type: artifactType,
		next_action: 'replan',
		edits,
		comments,
		edit_cost: editCost,
		validator_summary: validatorResult.summary,
		validator_exit: validatorResult.exitCode,
	};
	atomicWrite(revisionsPath, JSON.stringify(revision, null, 2) + '\n');
	return {
		branch: 'expensive',
		written: revisionsPath,
		validator: validatorResult,
		edit_cost: editCost,
		revision,
		rejected_locked: rejectedLocked,
	};
}
