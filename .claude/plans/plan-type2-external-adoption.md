# Type 2 (외부 사용자 적용) — 실행 대기 플랜 (사용자 "진행" 결단 시 Phase 0부터 착수)

> 상태: **PARKED / READY** — 작성만(v11.19.0 release 직후 / 2026-06-01). 사용자가 "진행"이라고 하면 이 문서대로 착수.
> 작성 근거: 방법론 메모리 Type 분류(Type 1/1.5/2) + `feedback_self_referential_corrective_drift` + `project_methodology_purpose_ax_operation` + CLAUDE.md 가치 명세.
>
> **사용자 정정 (2026-06-01 / session 66차)**: 대상 = **사내 사람들** / 제공 형태 = **플러그인 install** / **public-OSS 아님**. → public-OSS 공개·영어 진입점·공개 git/marketplace 채널 작업 **전부 폐기**. **EFI-WEB = 그냥 PoC = Type 2 대상 아님** (후보로 기록하지 않음). 남은 실작업 = (A) plugin-install 실행 경로(`node tools/` → `${CLAUDE_PLUGIN_ROOT}`) + 사내 가벼운 수집 경로 / (B) 사내 팀 self-serve 측정. 아래 본문 중 public-OSS/외부-OSS/영어/EFI-WEB-대상 언급은 본 정정으로 무효.

## Context — 왜 Type 2 인가

방법론 핵심 목표(`INSPECTION-LEDGER §1`)는 _"비결정론적 LLM을 결정론적 구조로 끌어올려 **누가 돌려도 같은 품질**"_. 그 명제의 진짜 검증대 = 주 타깃 **S2(AX전환)**을 **나 아닌 외부 사용자(Type 2)**가 자기 실제 코드베이스에 돌려 corroboration 을 쌓는 것.

**Type 분류 (3계층 / 메모리 정합)**:

- **Type 1** — self-run (내가 직접 도구/chain 실행). ✅ 다수.
- **Type 1.5** — user dogfood (내가 "사용자" 입장 시뮬 / RealWorld 등). ✅ S2 2차 execution corroboration까지.
- **Type 2** — **external user** (제3자 Claude Code 사용자가 자기 프로젝트에 install·실행). ❌ **미실현** — deadline 없음 / OSS·사내 채택 의존.

**현 시점 진단 (v11.19.0)**: 결정론 기반(release-readiness 26 게이트 / no-simulation trio / §8.1)은 단단함 = "도구" 측면 준비 충족. 미충족 = **외부 사용자 onboarding 마찰 제거 + corroboration 수집 채널**. 메모리가 반복 경고하는 "self-referential corrective 만 + 본격 prod 가치 진전 부재"의 **그 '진전' 축이 바로 Type 2**.

## 목표 (완료 정의)

외부 사용자(또는 외부 팀) ≥1명이 자기 **실제** 프로젝트에 플러그인 install → chain harness 1 cycle(discovery→spec→plan→test→implement) 완주 → **Type 2 corroboration 1건 캡처** (stack / use-scenario / gate 통과율 / finding / 사용자 피드백).

## Phase 0 — 착수 결정 (이 플랜 최대 미지수 / 사용자 결단 필수)

**후보 = 사내 사용자/팀** (플러그인 install 배포 / 사용자 정정 2026-06-01):

- 사내 다른 팀(자기 실제 프로젝트 / stack 무관: NestJS·JPA·MyBatis3 등)에 플러그인 install → self-serve 1 cycle.
- ~~사내 EFI-WEB 실 적용~~ = **EFI-WEB 은 그냥 PoC** (Type 2 대상 아님 / 정정).
- ~~OSS 프로젝트(공개)~~ = **public-OSS 아님** (정정 / 폐기).
- → 후보 팀별 stack / use-scenario(S1·S2·S3·greenfield) / 접근성 / 동의 매핑.

## Phase 1 — external-readiness 감사 (워크플로 권장 — 다차원 fan-out)

- **install 경로 실측**: `source:"./"` 플러그인을 외부 사용자가 clone→install→첫 prompt 까지 마찰 점검(plugin.json/marketplace.json install 흐름).
- **onboarding 자산 외부-적합성**: `guides/{getting-started, chain-harness-guide, common-errors, first-prompt-cookbook}` + `README`(scenario A/B/C) — 내부 가정·사내 경로·한국어-only·전제지식 등 **외부 장벽** 식별.
- **환경 의존 preflight**(no-simulation Tier): 외부 환경의 Semgrep/CodeGraph/test runner/JDK 등 가용성 — `scripts/preflight-check.js` 외부 시나리오 확장.
- **corroboration 캡처 메커니즘**: Type 1.5 `.aimd/simulation/{invocation-log, frequency.json, non-use-rationale}` 패턴을 **Type 2용**으로 확장(사용자 피드백 schema + 익명 evidence).

## Phase 2 — 외부 적용 동행

후보 프로젝트에 install + 첫 chain 1 cycle 동행 → gate 통과율 / finding / 막힌 지점 / 사용자 오해·마찰 실측 캡처 → finding 등재.

## Phase 3 — corroboration 종결 + 본체 반영

- Type 2 corroboration evidence 산출 + `STATUS.md`/ledger 등재.
- §8.1 strict: **≥2 distinct domain** corroboration 자격 재평가(현재 RealWorld 단일 = WARN).
- 외부 적용에서 나온 finding → **본체 격상**(본체 우선원칙 / examples sweep 후순위).

## 제약 (불변)

- 품질 1순위 + 재작업 최소화 / **no-simulation**(Type 2 = 진짜 외부 실행만 / persona 시뮬 ❌) / deadline 없음(채택 의존 — 압박 시 fake corroboration 금지, `feedback_commit_block_no_cheat`).
- 본 플랜 = **준비/대기**. 사용자 "진행" 결단 전까지 착수 ❌.

## 착수 시 첫 행동 (사용자 go 시)

1. AskUserQuestion — Phase 0 후보(EFI-WEB / 다른 사내팀 / OSS) + use-scenario 확정.
2. ~~Phase 1 external-readiness 감사~~ — **session 62차(2026-06-01)에 완료** (아래 §Phase 1 감사 결과 참조). 재실행 불필요.
3. 결과 → Phase 2 적용 동행 plan 구체화.

---

## Phase 1 external-readiness 감사 결과 (완료 / 2026-06-01 / session 62차)

> 워크플로 `wqxvf2yqv` (4차원 fan-out install/onboarding/preflight/corroboration-capture + completeness critic + synth). **43 장벽** file:line. 교차검증됨. **overall verdict: `blocked`** (public-OSS=blocked / internal-legacy-S2·internal-modern=major-gaps).

**이미 해소(v11.27.0+v11.28.0+v11.29.0)**: 사내 신원 누출(2 skill) / 깨진 license(UNLICENSED) / stale adoption 템플릿(6-stage 재작성) / README front-door stale(v11.28.0) / **Type 2 캡처 배선 EXT-CAPTURE-01·03·05(v11.29.0 / F-EXT-CAPTURE-001 RESOLVED — adopter-corroboration schema + adopter-evidence-packager 도구 + check30 + chain-driver gate#5 suggest 트리거 + PII 익명화/leak guard)** — + 회귀 가드 check27/28/29/30. 정직: 캡처 '배선' 완료 / Type 2 '측정'은 실 adopter 실행 시 발생(측정=0).

**잔여 핵심 장벽 (Phase 2/3 = 외부 적용 시점 / profile별)**:

- **public-OSS = install hard-block**: 모든 install URL 이 사내 GHE(`github.smilegate.net`) 단일 (EXT-INSTALL-01) — 공개 git/marketplace 채널 0. **public-OSS 공개 결단(③) 의존**. + 영어 진입점 0(EXT-LANG-01 / 온보딩 100% 한국어) + repo-relative `node tools/` 경로(설치 plugin 환경 실행 불가 / EXT-MISS-03 / `${CLAUDE_PLUGIN_ROOT}` 일괄 치환 필요) + 7 agent `model: opus` pin(저tier 외부 사용자 / EXT-MISS-02).
- ~~**Type 2 corroboration 캡처 메커니즘 = 사실상 0** (capture readiness 0.08)~~ → **v11.29.0 배선 완료 (F-EXT-CAPTURE-001 RESOLVED)**: `schemas/adopter-corroboration.schema.json`(work-unit-manifest.scenario + state.last_gate 재사용 / EXT-CAPTURE-01) + `tools/adopter-evidence-packager`(PII best-effort redaction + post-redaction leak guard / opaque sha256 가명화 / EXT-CAPTURE-03) + chain-driver gate#5 terminal **suggest**(consent / auto-write ❌ — adopter 데이터 주권 / EXT-CAPTURE-05) + check30 게이트. **잔여 EXT-CAPTURE-04**: ledger 산입 = 현재 `.aimd/output/adopter-corroboration.json` 생성까지 / maintainer 수집은 adopter 명시 공유(자동 전송 ❌ by design) → Phase 2/3 에서 수집·집계 채널 구체화. 측정=0(실 adopter 대기).
- **preflight**: codegraph(essential)·gradle(S2 빌드) 누락(EXT-PREFLIGHT-02/03) / SessionStart hook bash-only(.ps1 0 / Windows / EXT-PREFLIGHT-01) / fallback 한국어.
- **F-EXT-\* finding 등재 권장**: F-EXT-CAPTURE-001(critical) / F-EXT-PREFLIGHT-001 / F-EXT-PATH-001 / F-EXT-PUBLIC-OSS-001(phase-2-defer) 등 (미등재 / 다음 세션 ③ 착수 시 ledger).
- **honest_assessment(인용)**: "이 감사는 우리 자산 audit(준비)이지 Type 2 corroboration(측정)이 ❌. 진짜 prod 가치는 internal-modern 팀 1곳 실 self-serve 캡처(phase2 §5)에서 비로소 시작." → **②(2nd 도메인 dogfood)와 ③(외부 self-serve)이 진짜 측정 / 그 전은 전부 배선(necessary, not sufficient)**.

**Phase 2 진입 액션 순서(권장)**: ① internal-legacy-S2 + internal-modern 2 profile 로 first-arm scope(public-OSS=phase-2-defer) → ② capture 3-체인(schema→emit→ledger) 신설 → ③ preflight codegraph/gradle + `${CLAUDE_PLUGIN_ROOT}` 경로 → ④ internal-modern 팀 1곳 self-serve dogfood → adopter-corroboration 1건 실 캡처 = Type 2 first-arm = §8.1 2nd distinct domain 후보.

전체 43 장벽 raw = 워크플로 출력(휘발 / 필요 시 재실행 wqxvf2yqv 동형).
