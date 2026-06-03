# DEC-2026-06-01-readme-sync

> README.md stale 동기화 (front door v11.1.0→현행) + drift-resistant 재구성 + version-sync 가드. v11.28.0 MINOR.

## 맥락

session 62차 후속 — 사용자 "이제 뭐 남았나" → "1"(① 잔여) 반복. ① 핵심 = README.md (plugin user 진입점) 가 title v11.1.0(26 버전 stale) + 카운트(skill 55·도구 22·스키마 46·770 test·22 criterion) 전부 stale = front-door 신뢰도 붕괴 (Type 2 감사 EXT-MISS-08·EXT-DOC-DRIFT-01).

## 결정 (additive / breaking 0)

1. **버전 동기화**: title·현재·install·dist 트리 `v11.1.0`→`v11.28.0` 또는 `v<version>` placeholder. 사내 GHE URL 유지.
2. ** drift-resistant 재구성**(카운트 재-stale 회피 / 감사 교훈): 22-criterion 하드코딩 리스트 → 영역 요약 + release:check pointer / 브리틀 카운트(skill/tool/schema/test) → 제거·위임 / "분석 대상 사내 프로젝트"→"프로젝트" / 라이선스 → UNLICENSED 명시.
3. **회귀 가드 check29 `readme_version_sync`**(release-readiness 28→29): README canonical stamp(title+현재) ↔ plugin.json sync (check10 동형 / history·placeholder 제외 오탐 회피).

## 근거 (4원칙)

- §1 plan = `.claude/plans/plan-genuine-defects-cleanup.md`(① bucket / README 항목). 현 paradigm 카운트 전수 검증(skill 57/tool 27/schema 47/PoC #01~#16). §3 사용자 "1".
- drift-resistant 설계 = 감사 EXT-DOC-DRIFT-01("카운트·버전 하드코딩 재-stale") 교훈 직접 반영 — 카운트 하드코딩 최소화 + version-only 가드(count 가드는 브리틀로 보류).

## 검증 (no-simulation)

- self-test 14/14(count 28→29 + 신규 id) / discrimination 실증(check29 title+현재 추출·history `v9.0`/`v11.0.0` 미추출 오탐 ❌·stale stamp 탐지) / README 잔존 v11.1.0 0·stale count 0 / skill-citation 0 stale / workspace 1018 / release-readiness **29/29** / version 3-way 11.28.0.

## §8.1

front-door 외부-노출 stale cleanup (self-referential 과 구분 — plugin user 진입점) / check29 = R2 drift enforcement. 본 release 로 ① "지금 가능한 진짜 결함" bucket 사실상 소진 → 잔여 = ②③(≥2 distinct 도메인 / Type 2 / public-OSS = 새 도메인·조직 결정).

## 잔여 carry

dep-graph ≥2 distinct 도메인(A2 usability·FE kinds·A3) · Type 2 외부 채택(43 장벽) · public-OSS 공개(조직) · README count-drift 종합 가드(보류).

Extends DEC-2026-06-01-genuine-defects-cleanup.
