// source-ext.js — 소스 파일 확장자 판정 (공유 helper).
//
// 용도: Gap B(living-graph 자동배선 / plan-living-graph-autowire) — PostToolUse 가 손수정 *코드* 파일
//   write 를 감지할 때 산출물(.ai-context JSON)이 아닌 source 파일인지 분류.
//
// SSOT: 이 모듈이 SOURCE_EXTS 의 canonical 정의다. scripts/codegraph-nudge.js + scripts/graph-context-nudge.js
//   (PostToolUse/PreToolUse/UserPromptSubmit hook) 모두 ../tools/_shared 에서 import 한다 — scripts/ 와 tools/_shared/
//   가 함께 출하되어(build-plugin INCLUDE) plugin-root 상대경로 해소 OK. (구 codegraph-nudge 동형 사본은 v0.75.0 에서 통합.)

import { extname } from 'node:path';

// codegraph 지원 언어 정렬 (codegraph status Languages).
export const SOURCE_EXTS = new Set([
	'.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.java', '.py', '.go', '.rb', '.php',
	'.cs', '.kt', '.kts', '.swift', '.scala', '.sc', '.rs', '.vue',
	'.c', '.h', '.cc', '.cpp', '.hpp', '.hh',
]);

export function isSourcePath(p) {
	if (!p || typeof p !== 'string') return false;
	return SOURCE_EXTS.has(extname(p).toLowerCase());
}

// branch-per-task 가드 전용 확장자 (DEC-2026-06-19-branch-per-task / 적대검증 blocker fix).
//   SOURCE_EXTS(codegraph 언어 정렬 / Gap B 용)는 .xml/.sql/.jsp 등을 제외하나, 본 방법론의 PRIMARY
//   레거시 타깃(Spring/iBATIS)은 SQL 행위가 mapper .xml·.sql 에, 서버템플릿이 .jsp 에 산다 →
//   가드가 그것들을 못 보면 잘못된 브랜치에서 핵심 레거시 소스가 무가드로 통과. 가드는 더 넓게 본다
//   (코드 + SQL/template/build/config). Gap B 의 SOURCE_EXTS 는 codegraph 정렬 유지(불침범).
export const GUARD_SOURCE_EXTS = new Set([
	...SOURCE_EXTS,
	'.xml', '.sql', '.jsp', '.jspx', '.tag', // iBATIS/MyBatis mapper · SQL migration · JSP 서버템플릿
	'.gradle', '.properties', '.yml', '.yaml', // build · Spring config
	'.vm', '.ftl', '.thymeleaf', '.mustache', '.hbs', // 템플릿 엔진
	'.html', '.htm', '.css', '.scss', '.less', // FE markup/style
]);

export function isGuardedSourcePath(p) {
	if (!p || typeof p !== 'string') return false;
	return GUARD_SOURCE_EXTS.has(extname(p).toLowerCase());
}
