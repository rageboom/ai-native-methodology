# plan — 진짜 결함 정리 (Type 2 감사 교차검증 defect / 정직성·P0 무결성)

> 4원칙 §1. 사용자 "①" 선택 (지금 가능 / 새 도메인 불필요 / 진짜 결함). v11.26.0→v11.27.0.

## 대상 = 교차검증된 3 결함 + 회귀 가드

### 결함 1 — 사내 신원 누출 (정직성 / R15)

- `skills/ticket-sync/SKILL.md:436` + `skills/_base-invoke-go-stop-gate/SKILL.md:57` 의 example payload `"user":"sangcl@smilegate.com"` (둘 다 출하 skill / build INCLUDE).
- fix: `"user":"reviewer@example.com"` placeholder 치환.
- **회귀 가드 (release-readiness 신규 check)**: 출하 dir(skills/agents/templates) 대상 `smilegate\.(com|net)|sangcl` grep → 발견 시 fail (R2 enforcement / `feedback_drift_enforcement_via_release_readiness`).

### 결함 2 — 깨진 license 참조

- `plugin.json:10` `"license":"SEE LICENSE IN LICENSE"` 인데 top-level LICENSE 파일 부재 = 존재않는 파일 가리킴(명백한 결함).
- fix: `"UNLICENSED"` (정직 / 사내 표준·외부 미공개 = de facto all-rights-reserved / OSS 공개 결단은 별도 = public-OSS carry). 사용자 결정 필요 (UNLICENSED vs 실 OSS LICENSE 추가).
- README 라이선스 절 = 이미 "(사내 표준 — 외부 공개 시 결정)" = 정합 (무변경 또는 SPDX 명시).

### 결함 3 — stale adoption 템플릿 (P0 직격)

- `templates/adoption/CLAUDE.md` = **v2.0.0-rc1 / SDLC 4-stage / planning-spec / gate #1~#4** (현 v11.x 6-stage 대비 4 major 버전 stale). build-plugin alias → dist root CLAUDE.md = **adopter 의 첫 LLM 운영 컨텍스트** → 틀린 paradigm 주입 = P0(LLM 운영 컨텍스트) 직격.
- fix: 현 6-stage paradigm 전면 재작성 (analysis→discovery→spec→plan→test→implement / gate #1~#5 / chain N=gate #N INTERNAL CONVENTION / 4 use-scenario S1·S2·S3·greenfield / BE·FE 분리 / no-simulation R19 Tier / 4원칙 / stack 정책 유지).
- **drift-resistant 설계** (감사 교훈 EXT-DOC-DRIFT): 브리틀한 카운트(skill 57/tool 27 등) 하드코딩 **회피** — 안정적 paradigm(stage·gate·시나리오)만 기술 + 카운트는 README/CHANGELOG 위임. 도구 호출 경로 = `${CLAUDE_PLUGIN_ROOT}/...` (감사 EXT-PATH-01: repo-relative `node tools/` 는 install 환경서 깨짐).
- **회귀 가드 (release-readiness 신규 check)**: adoption CLAUDE.md 가 stale 토큰(`planning-spec` / `4-stage`·`4단계` / `v2.0.0-rc1`) 미포함 + 현 토큰(`discovery` / `gate #5`·`#1~#5`) 포함 검사 (재-stale 차단).

## 현 paradigm 사실 (검증됨 / 재작성 grounding)

- 6 stage: analysis(pre) → discovery(#1) → spec(#2) → plan(#3) → test(#4 RED) → implement(#5 GREEN). chain N=gate #N INTERNAL CONVENTION.
- flows: analysis + discovery/spec/plan/test/implement phase-flow + sdlc-4stage-flow.json(master DAG / revisit edges).
- chain skill: discovery 6 / spec 3 / plan 3 / test 4 / implement 4 / analysis 30. (카운트는 adoption 본문에 하드코딩 ❌)

## 검증 (no-simulation)

- 2 신규 release-readiness check (26→28): identity-leak grep / adoption-paradigm drift marker. self-test fixture 판별(content-aware).
- skill-citation-validator 0 stale (skill 2 파일 편집 후).
- adoption CLAUDE.md 재작성 후 신규 drift check PASS 실측 + identity check PASS 실측 (BEFORE=현 상태로 FAIL 입증 = discrimination).
- workspace 전체 pass + version-check 3-way + release-readiness 28/28.

## §8.1 (정직)

정직성·P0 무결성 cleanup (self-referential corrective 와 구분: 출하 자산의 외부-노출 결함 = adopter 영향 실재 / R15·P0 정합). 회귀 가드 2종 = enforcement criterion (양심 의존 ❌ paradigm).

## STOP-3

workspace pass + release-readiness 28/28 + skill-citation 0 stale + version 3-way 11.27.0 + breaking 0 = MINOR (의도적: 신규 gate 2종 = enforcement 추가 / 산출물 호환 유지).

## Lessons Learned (실패 시)

(미발생)
