# DEC-2026-06-08-aimd-rename-ai-context

**상태**: 승인·시행 (plugin.json 0.22.0 → 0.23.0 MINOR)

## 발단
사용자 지적: 출력 디렉토리 `.aimd/`(≈ AI-Native Methodology Directory 추정 / 명시 정의 없음)는 **폴더를 본 사람이 안에 뭐가 들었는지 모른다**. 식별자가 `context-ops` 로 바뀐 것과도 어긋나 보임.

## 결정
디렉토리 컨벤션 `.aimd/` → **`.ai-context/`**.
- **기준 = 내용 서술성(discoverability)** — 식별자 정합(.ax/.context-ops 후보)이 아니라 "폴더명이 내용을 말해줘야". `.ai-context` = AI 운영 컨텍스트 = 방법론 P0("산출물 = LLM 운영 컨텍스트 그 자체"). 패키지 `context-ops` 가 `.ai-context/` 를 만들고 동기화 = 자연 짝.
- **타이밍**: v0.x **사내 미배포**(채택자 0) → 마이그레이션 부담 없는 적기. 기능 변경 0(순수 컨벤션).
- dot-prefix 유지(도구-관리 / 손수정 말 것 신호).

## 스코프
- **Sweep** `/\.aimd(?!-install)/g` → `.ai-context` (281 파일 / 2-pass — 1차에 docs·extensions 스코프 누락 → 잔존 grep 으로 발견·보강): tools 코어+test · skills · agents · schemas(설명+state.schema default) · templates · flows · methodology-spec · guides · hooks · scripts · .github · docs(ADR·dependency-graph) · extensions(mobile-native) · README · CLAUDE.md · .gitignore · examples. 내부 식별자 `AIMD_GITIGNORE_BODY`·`AIMD_DERIVED_BASENAMES`·`isAimdDerivedOutput` → `AICONTEXT_*`·`isAiContextDerivedOutput`.
- **git mv** 14 example `.aimd/` 디렉토리 (history 보존 / poc-18·19=target/).
- **보존**: `.aimd-install`(무관 static-tool install marker / `(?!-install)` anchor) · 역사 기록(`archive/`·`CHANGELOG-HISTORY.md`·과거 CHANGELOG/DEC 항목 = 시점 사실 / runtime read 0).
- **클린 컷**: 미배포 → `.aimd` 하위호환 fallback 불요.

## Senior 적대검토 (REVISE@0.86 → 2 BLOCKER 반영)
- **BLOCKER-1**: naive sweep 이 `.aimd-install`(install marker) 를 `.ai-context-install` 로 오변환 → install-static-tools.js/.sh + .gitignore 파손. → 정규식 `(?!-install)` 음성 lookahead anchor.
- **BLOCKER-2**: `.github/workflows/chain-check.yml`(live default target_dir + strict gate `.aimd/config/test-cmd.json`) INCLUDE 누락 → 추가.
- MAJOR(release-readiness.js:390 `e.name !== '.aimd'` walker guard + poc-05 하드코딩) = INCLUDE swept + git mv lockstep. EXCLUDE 경계(runtime read 0)·test lockstep·`.ai-context ⊄ .aimd` prefix = SAFE.

## 검증
- chain-driver 502 GREEN + 전 워크스페이스(RR check#11) + release-readiness **41/41**(check#16 poc-05 graph 경로 lockstep) + 잔존 `.aimd`(INCLUDE)=0 + `.aimd-install` 보존 + 3-way.

## 교훈
- "폴더명 = 내용 서술" 사용자 개념 = discoverability(식별자 정합 아님) → 첫 옵션 셋(.ax/.context-ops/유지)이 빗나간 것을 사용자 메타 발화로 교정.
- 역사 기록은 시점 사실 → 컨벤션 리네임 시에도 보존(역사 왜곡 회피).
- Senior 적대검토가 `.aimd-install` substring 충돌(코드 착수 전이면 installer 파손 release)을 차단.
