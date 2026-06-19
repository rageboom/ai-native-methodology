// source-ext.js — 소스 파일 확장자 판정 (공유 helper).
//
// 용도: Gap B(living-graph 자동배선 / plan-living-graph-autowire) — PostToolUse 가 손수정 *코드* 파일
//   write 를 감지할 때 산출물(.ai-context JSON)이 아닌 source 파일인지 분류.
//
// 참고: scripts/codegraph-nudge.js 에 동형 사본(SOURCE_EXTS/isSourcePath)이 존재한다 — 그 hook 은
//   plugin-root scripts/ 에서 단독 실행되어 안정성 우선 미이관(추후 본 모듈 import 로 통합 = drift 제거 carry).
//   둘은 동일 목록을 유지해야 한다(divergence 시 본 모듈이 canonical).

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
