# ADR-PLUGIN-001: Plugin Authoring Spec + 외부 docs drift baseline+ratchet

- 상태: 승인됨 (Accepted) — v7.1.0 MINOR / charter R18
- 일자: 2026-05-17
- 결정자: 윤주스 (TF Lead) — 사용자 질문 "plugin skill/hooks/agent 작성 시 Anthropic 공식 best practice?" → plan 4결단 (R18 정식 / package.json 선행 housekeeping / 감사+백로그만 수정 이연 / staleness 60일)
- 관련: ADR-010 (baseline+ratchet 차용 원천) / ADR-009 (네트워크=§2 dispatch / no-simulation trust ladder) / `methodology-spec/plugin-authoring-spec.md` (단일 SSOT) / `methodology-spec/plugin-charter.md` R18 / DEC-2026-05-17-plugin-authoring-spec / DEC-2026-05-17-package-version-3way-sync-fix (선행) / F-015 (`_base-official-docs-checker`)

---

## 1. 컨텍스트

본 plugin 은 그 자체가 방법론이며 47 skills + 9 agents + `hooks/hooks.json` + `.claude-plugin/{plugin,marketplace}.json` 으로 구성된다. 그러나:

> "이 자산들을 작성할 때 Anthropic 공식 / 업계 best practice 가 있는가?" (사용자 질문 2026-05-17)

기존 상태:
- 저작 규칙 명문 부재 → 신규 skill/agent/hook 작성 시 일관성 drift (silent).
- Anthropic 공식 Claude Code docs 는 **진화**한다 (실측: hooks 이벤트 5→29종 / sub-agents `skills` 공식 필드화 / `system_prompt`·`preloaded_skills` 미존재). 규칙을 한 번 적어도 공식이 바뀌면 stale → 인지 불가.
- 양심 의존("문서 가끔 확인") = 본 repo 가 거부하는 패러다임 (CLAUDE.md "양심 의존 차단").

### 산업 표준 사례 (외부 권위 pin + staleness gate)

- **Renovate / Dependabot** — dependency pin + staleness PR (만료 시 자동 알림)
- **TUF (The Update Framework)** — metadata `expires` 필드 (만료 = 신뢰 거부)
- **SLSA provenance** — freshness / attestation 만료 검증
- **OWASP Dependency-Track** — component EOL/staleness 정책 차단
- **(본 repo 내부)** ADR-010 baseline+ratchet (Slack/GitLab/Dropbox/Figma/Shopify 6 사례) — 기존 grandfather + 신규만 차단

→ **공통 = pin + 만료 임계 + 자동 차단**. 양심 ❌. 본 ADR 은 ADR-010 을 **외부 권위(공식 docs)** 에 재적용.

## 2. 결정

### 2.1 plugin-authoring-spec.md = 단일 SSOT

`methodology-spec/plugin-authoring-spec.md` 신설 — Skill(S1~S7)·Hook(H1~H7)·Agent(A1~A6)·Packaging(P1~P4) 저작 규칙 + §6 공식 docs pin baseline + §7 compliance 매트릭스 + §8 이연 backlog + §9 drift 재검증 + §10 SSOT 선언. 규칙·digest 변경 = 본 문서에서만 (charter·schema·skill 재선언 ❌).

### 2.2 외부 docs drift = ADR-010 baseline+ratchet 차용 (2계층 분리)

- **baseline** = §6 pin 표 (area · official_url · content_anchor · `pinned_guidance_digest` · `last_verified`). 생성 시 실 `_base-official-docs-checker` F-015 dispatch 결과로 seed (암기 작성 ❌ = ADR-009 no-simulation 정합).
- **Layer (i) 네트워크 재검증** — 60일 cadence OR check #12 red OR plugin-authoring PR. `_base-official-docs-checker` ×4 dispatch (§6 area 별). VERIFIED→`last_verified` 갱신 / CONTRADICTS→finding+DEC+규칙·digest 갱신+semver 평가 / INSUFFICIENT-DATA→finding·미갱신(clock 지속). **release-readiness 밖** (네트워크=비결정 / ADR-009 §2 dispatch territory).
- **Layer (ii) 결정적 가드** — `release-readiness.js` check #12 (`authoring_spec_staleness`). §6 `last_verified` 4행 정규식 추출 → `today − last_verified ≤ 60일` 의무. date-math only / 네트워크 ❌ / `check10` 패턴 isomorphic / `--skip-authoring-staleness`=skip≠pass / release 시 flag ❌ 의무.

### 2.3 split 정당화 (no-simulation / 결정적 release-readiness 불변)

| 제약 | 네트워크를 release-readiness 에 넣으면 위반 | split 이 충족 |
|---|---|---|
| no-network / 결정적 release-readiness | WebFetch = 비결정·offline/CI 실패·flaky gate | 네트워크는 문서화 cadence (agent dispatch) / gate 는 date 산술만 |
| 양심 의존 차단 | "문서 가끔 확인" = 양심 의존 = 거부 패러다임 | check #12 가 staleness 를 release gate 로 강제 |
| no-simulation (ADR-009) | corpus 기반 digest 작성 = simulation | §6 seed = 실 F-015 dispatch / checker 계약 = corpus fallback ❌ |

### 2.4 grandfather (ADR-010 §2.1 차용)

감사 실 위반 = baseline grandfathered. ratchet = **신규·수정 skill/agent 는 §2·§4 즉시 강제**. 47개 즉시 rewrite 불요 (defect-explosion 회피).

### 2.5 deferred breaking = 본 ADR scope ❌

`spec-integrate-7대-deliverables` 한글 → kebab rename = command-surface = **별도 MAJOR** (3 ref / cooling-off + Senior + STOP-gate / v7.0.0 rename 선례). 본 ADR (v7.1.0 MINOR) = 감사·기록만, 수정 ❌.

## 3. 결과

### Positive

- 저작 규칙 단일 SSOT → 신규 자산 일관성 강제 (ratchet).
- 외부 권위 drift 가 결정적 release gate 로 차단 (양심 비의존).
- 실 F-015 cross-check 가 가설 false-positive 3건 제거 (S1 retrofit 불요 / marketplace 위치 정합 / agent `skills:` 공식 필드) + over-claim 2건 교정 (`system_prompt`·`preloaded_skills` 미존재) → 방법론 정확도 향상.

### 트레이드오프

- check #12 는 calendar-day 의존 (오늘 통과해도 61일 후 무변경 fail) — ★ 의도된 ratchet (ADR-010 "2년 자동 expiry" 동형). 60일 coarse 임계 + `--skip-authoring-staleness` (비release cadence) 로 dev flakiness 회피.
- 네트워크 재검증은 사람이 cadence 를 트리거 (자동화 ❌) — 그러나 check #12 red 가 트리거를 강제 (양심 비의존 유지). 네트워크 자동화 = over-engineering + 제약 위반 → 의도적 미채택.

## 4. 검증

- release-readiness **12/12** (A1 본격 spawn `criteria_total=12 passed=12 ready=true exit 0`) + `release-readiness.test.js` **12/12 pass** (check #12 happy + skip≠pass + id 정합 신규 case 포함).
- version-check **3-way 7.1.0** (선행 housekeeping DEC-2026-05-17-package-version-3way-sync-fix 로 package.json 청산 후 정상 bump).
- workspace test green / drift-validator 3-way 불변 (skill/agent/flow 무수정 = §8 이연의 안전 속성).
- §6 pin = 실 `_base-official-docs-checker` ×4 VERIFIED (2026-05-17 / canonical `code.claude.com/docs/en/*`).

## 5. 본 방법론 적용

- charter **R18** 정식 신설 (§5 backlog 격상 아닌 신규 정식 R / 사용자 결단).
- `release-readiness.js` check #12 = 11/11 → **12/12**.
- §9 Layer i cadence = 향후 운영 절차 (60일 / `_base-official-docs-checker` dispatch / CONTRADICTS 시 DEC).
- CLAUDE.md 핵심 디렉토리 + 참고 § pointer.

## 6. 참조

- 공식 Claude Code docs (실 F-015 VERIFIED 2026-05-17): `code.claude.com/docs/en/skills` · `/hooks` · `/sub-agents` · `/plugins-reference`
- ADR-010 (baseline+ratchet 원천 / Slack·GitLab·Dropbox·Figma·Shopify 6 사례) · ADR-009 (no-simulation trust ladder / 네트워크=§2)
- 산업 사례 — Renovate/Dependabot pin+staleness · TUF metadata `expires` · SLSA freshness · OWASP Dependency-Track EOL
- `methodology-spec/plugin-authoring-spec.md` (단일 SSOT) · DEC-2026-05-17-plugin-authoring-spec · DEC-2026-05-17-package-version-3way-sync-fix

---

## §7 patch 영역 (★ 향후 §9 Layer i CONTRADICTS 발생 시 patch vN + Lessons Learned LL-i-NN accretion / ADR-CHAIN-011 §5·§9 패턴 차용)

- (없음 — 신설 시점. 차기 네트워크 재검증서 공식 docs 변경 검출 시 본 절에 patch v1 + 영향 규칙 + semver 영향 기록)

## §8 Lessons Learned

- **LL-plugin-01** — 외부 권위(공식 docs) 는 코드 의존성과 동형으로 drift 한다. pin baseline + 결정적 staleness gate (date-math) + 네트워크 재검증 cadence 분리 = ADR-010 을 외부 권위에 재적용한 paradigm. 실 F-015 cross-check 가 main-agent 사전 research 의 가설 false-positive 3건 + over-claim 2건을 제거 → "research 수렴만으로 단정 ❌ / 1차 출처 독립 fetch 의무" (memory `feedback_sub_agent_validation` 정합).
