// project-root resolver (F15 — DEC-2026-06-10-validator-path-convention-unify)
// 산출물 cross-ref 경로(`.ai-context/...` = project-root-relative)를 해석할 base 를 산출물 path 에서 자동 감지.
//
// 배경: chain-coverage-validator 는 v9.0.4(F-MB-VAL-001)에서 `.ai-context/output/<file>` 패턴 한정
//   autoDetectProjectRoot 를 도입(5-PoC corroborated). 그러나 (a) formal-spec-link-validator 는 이 로직 부재
//   → baseDir=dirname(file) 로 `.ai-context/...` 경로를 spec-dir 기준 해석 → dead-reference(F15) (b) output/ 외
//   scope-dir 산출물(`.ai-context/<scope>/<stage>/`)은 구 로직이 미커버(fallback dirname → 오해석).
//
// 일반화: 경로에 `/.ai-context/` 가 있으면 그 직전(=.ai-context 의 부모)이 project root.
//   → output/(`.ai-context/output/…`) 와 scope-dir(`.ai-context/<scope>/<stage>/…`) 양쪽 일관 처리.
//   구 `.ai-context/output$` → ../.. 결과와 동일(5-PoC 테스트 lock 보존). 그 외 = fallback dirname(backward-compat).

import { dirname } from 'node:path';

const AI_CONTEXT_MARKER = '/.ai-context/';

export function resolveProjectRoot(specPath) {
  if (!specPath || typeof specPath !== 'string') return null;
  // cross-platform: Windows backslash → POSIX 정규화 (POSIX dirname 은 \ 미인식)
  const norm = specPath.replace(/\\/g, '/');
  const idx = norm.indexOf(AI_CONTEXT_MARKER);
  if (idx > 0) return norm.slice(0, idx); // .ai-context 의 부모 = project root (output/ + scope-dir 공통)
  if (norm.startsWith('.ai-context/')) return '.'; // 부모 없는 상대경로 → cwd
  return dirname(norm); // fallback (backward-compat) — `.ai-context` 무함유 위치
}

// chain-coverage 호환 alias (구 export 이름 보존 / import 깨짐 방지).
export const autoDetectProjectRoot = resolveProjectRoot;
