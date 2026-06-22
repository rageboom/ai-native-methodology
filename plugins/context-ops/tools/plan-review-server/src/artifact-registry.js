// artifact-registry.js — 백엔드 artifact 메타(슬림). CLI/서버가 쓰는 것만:
//   knownArtifact(검증) · VALIDATORS(검증기 선택) · ARTIFACTS[type].label(CLI/타이틀).
//   섹션 순서·라벨·카드 제목·블록 렌더링은 모두 브라우저 렌더러(assets/renderers/*) + kit 으로 이관
//   (스키마별 렌더러가 배치 소유 / 백엔드는 배치 모름). v0.65.0 재구성.

// spec stage = 3종 (composite=behavior-spec / unit=unit-spec / ac=acceptance-criteria).
export const ARTIFACTS = {
	'discovery-spec': { label: 'discovery-spec (발견)' },
	'behavior-spec': { label: 'behavior-spec (동작 / spec-composite)' },
	'unit-spec': { label: 'unit-spec (유닛 / spec-unit)' },
	'acceptance-criteria': { label: 'acceptance-criteria (인수 기준 / spec-ac)' },
	'task-plan': { label: 'task-plan (작업 계획)' },
};

// validator 는 task-plan 만(plan-coverage). 나머지는 프롬프트만 → 항상 replan.
export const VALIDATORS = {
	'task-plan': 'plan-coverage',
};

export function knownArtifact(type) {
	return Object.prototype.hasOwnProperty.call(ARTIFACTS, type);
}

// chain stage(phase) → 산출물 묶음. spec 은 3종(composite=behavior / unit / ac)을 한 페이지로.
export const PHASES = {
	discovery: { label: 'discovery (발견)', artifacts: ['discovery-spec'] },
	spec: { label: 'spec (명세)', artifacts: ['behavior-spec', 'unit-spec', 'acceptance-criteria'] },
	plan: { label: 'plan (계획)', artifacts: ['task-plan'] },
};

export function knownPhase(phase) {
	return Object.prototype.hasOwnProperty.call(PHASES, phase);
}
