# DEC-2026-05-02 — adoption carry OFF 결단 ( workspace 본체 단일 focus)

- 일자: 2026-05-02
- 카테고리: methodology / 우선순위 재정렬 / 사용자 결단
- 결정자: 윤주스 (TF Lead) / 명시적 결단 (Auto Mode 위임 ❌)
- 상태: 승인 ( 본 세션 / no release / 본체 commit 만)
- 관련: DEC-2026-05-02-adoption-폐기-build-step-신설 ( v1.4.3 PATCH / 본 결단의 직전 단계) / DEC-2026-05-02-plugin-first ( 14차 결단 / retracted)

---

## 1. 컨텍스트

### 1.1 v1.4.3 follow-up 시점 carry 상태

4 agent 검증 결과 (1fa23ca commit) F4 + F5 + adoption 폴더 lock rename = 사용자 결단 carry 등재 → 다음 세션 강제 결단 의무.

| carry  | 자산                                             | 현재 처리                                                                                  |
| ------ | ------------------------------------------------ | ------------------------------------------------------------------------------------------ |
| F4     | `adoption/CLAUDE.md` (root, 73 line)             | 폐기 vs `docs/adoption/ADOPTION-ROOT-CONTEXT.md` 흡수 결단                                 |
| F5     | `adoption/legacy-analyzer/.claude/` (4 metadata) | 외부 이관 (`harness-engineering-study/`) vs `archive/legacy-analyzer-plans/` 흡수 결단     |
| rename | `ai-native-methodology-adoption/` 폴더           | 외부 프로세스 lock 으로 자동 rename 실패 / 사용자 lock 해제 후 직접 rename + 30일 cooldown |

### 1.2 사용자 결단 (2026-05-02)

> "이제 adoption 은 신경 안써도 됨 이 프로젝트만 신경 쓸거야."

→ adoption 영역 carry 전체 OFF / workspace 본체 (`ai-native-methodology/`) 단일 focus.

---

## 2. 결정 ( 사용자 명시 / 단일 결단)

| #      | 결정                                         | 채택                                                              | 사유                                                                       |
| ------ | -------------------------------------------- | ----------------------------------------------------------------- | -------------------------------------------------------------------------- |
| **D1** | F4 결단                                      | **OFF** (carry 폐기 / 결단 영역 아님)                             | 사용자 명시 — adoption 영역 신경 안 씀                                     |
| **D2** | F5 결단                                      | **OFF** (carry 폐기 / 결단 영역 아님)                             | 사용자 명시 — `harness-engineering-study/` 외부 이관도 본 프로젝트 영역 ❌ |
| **D3** | adoption 폴더 rename                         | **사용자 자체 영역 / 본 프로젝트 작업 ❌**                        | 외부 워크스페이스 lock / 본 프로젝트 commit 영향 0                         |
| **D4** | `docs/adoption/` 디렉토리 위상               | **frozen archive only** (활성 작업 ❌ / 갱신 ❌)                  | v1.3 작업 history 보존 목적만 / `docs/adoption/README.md` §status 정합     |
| **D5** | `templates/adoption/{CLAUDE,README}.md` 위상 | **유지** (사내 적용 진입점 / build script 가 dist root 별칭 복사) | v1.4.3 흡수 자산 / 사용자 직접 편집 자산 / 폐기 ❌                         |
| **D6** | 우선순위 재정렬                              | **Phase B 진입 자격 4 미충족 / v1.4.x 환경 carry 3 / 잠재 v1.5+** | adoption 영역 0 / 본체 진화 only                                           |

---

## 3. 영향 범위

### 3.1 즉시 효과

- F4 + F5 + adoption rename = 본 프로젝트 작업 backlog 에서 제거
- `docs/adoption/README.md` §사용자 결단 carry 섹션 = OFF 결단 명시 (보존 / archive 정합)
- `decisions/STATUS.md` v1.4.3 PATCH 항목 carry 7 → 5 ( adoption 2건 = 결단 영역 아님 분리)
- memory `project_adoption_workspace.md` + `project_plugin_first_distribution.md` = adoption 영역 OFF / workspace 본체 단일 focus 명시

### 3.2 영속성

- 다음 세션 시작 시 git log + memory + STATUS 정합 검증 (memory `feedback_session_handoff_drift`) → 본 결단 인지 의무
- adoption 영역 자산 ( workspace 본체 안 — `templates/adoption/` + `docs/adoption/` + `archive/methodology-v1.1/`) = 유지 (frozen / build script source 일부 / archive)
- 외부 워크스페이스 (`ai-native-methodology-adoption/`) = 사용자 자체 영역 / 본 프로젝트 무관

### 3.3 유지되는 것 ( 폐기 ❌)

- `templates/adoption/CLAUDE.md` + `README.md` ( build script 가 dist root 의 `CLAUDE.md` + `ADOPTION-README.md` 로 별칭 복사 / 폐기 시 plugin install 회귀 발생)
- `archive/methodology-v1.1/` ( v1.0~v1.1.2 진화 metadata / archive 정합)
- `docs/adoption/{v1.3-plan,v1.3-status,v1.3-decisions-index,lessons-learned-2026-05-02,README}.md` ( frozen archive)

---

## 4. 우선순위 재정렬 (본 결단 후 / 본 프로젝트 backlog)

### 4.1 우선순위 1 — Phase B 진입 자격 4 미충족

| #   | 자격                   | 작업                                                               |
| --- | ---------------------- | ------------------------------------------------------------------ |
| 1   | Phase A self-iter 누적 | iteration 진행 + 마찰점 finding 수렴                               |
| 2   | 7대 산출물 안정        | 4 PoC 외 추가 적용 입증                                            |
| 3   | release.yml CI         | GitHub Actions (build + sha256 verify + plugin install smoke test) |
| 4   | LICENSE + InfoSec      | LICENSE 파일 + 사내 InfoSec 검토                                   |

### 4.2 우선순위 2 — v1.4.x 환경/시간 carry 3건

| #   | carry                            | 영역                     |
| --- | -------------------------------- | ------------------------ |
| 1   | F-FE-006 i18n                    | v1.5 / 적용 대상 발견 시 |
| 2   | static-runner severity 변환 검토 | quality 격상             |
| 3   | RSA/JWT 길이 custom rule         | quality 격상             |

### 4.3 우선순위 3 — 잠재적 v1.5+

- 추가 PoC (Vue / Angular / Svelte / Flutter / React Native / Django / Rails / Go)
- 사내 실 적용 첫 case (100K+ LOC legacy → 7대 산출물 추출)

---

## 5. Lessons Learned

### 5.1 결단 cadence 가속 사례 ( memory `feedback_decision_cadence_24h_cooling_off` 보강 후보)

- 14차 결단 (DEC-2026-05-02-plugin-first) → 1일 retract (DEC-2026-05-02-adoption-폐기-build-step-신설)
- v1.4.3 follow-up (1fa23ca) F4+F5 carry 등재 → 1일 (사실상 같은 날) 본 결단 OFF
- 본 cadence 가속 = 사용자 명시 결단 영역 / cooling-off 면제 ( plan.md 비용 작음 / 방향 선언 / 자산 변경 0)
- 본 결단 = 24h cooling-off 의무 ❌ ( memory 정합)

### 5.2 carry 등재 cost / 결단 cadence trade-off

- F4+F5 carry 등재 시점 (1fa23ca) = Agent 1 재검증 결과 "미묘한 가치" 발견
- 사용자 결단 시점 = 본 프로젝트 단일 focus 우선
- lesson: carry 등재 자체는 cost 작음 (등재 → 결단 → OFF 정상 사이클)
- 단, carry 가 누적 시 backlog 인지 부담 증가 → 사용자 명시 OFF 결단 가치

### 5.3 본체 자산화 ❌ ( §8.1 strict 정합)

- 본 결단 = 본 워크스페이스 specific (사용자 의지 변경 / adoption 자체 폐기 결단 1차)
- §8.1 컴포넌트 ≥ 3 임계 미달
- 본체 자산화 ❌ — methodology-spec / ADR / schema 격상 0

---

## 6. 검증

| 항목                                                                         | 결과              |
| ---------------------------------------------------------------------------- | ----------------- |
| `decisions/STATUS.md` v1.4.3 PATCH carry 7 → 5 갱신                          | ✅                |
| `decisions/INDEX.md` 신규 DEC 최상단 등재                                    | ✅                |
| `docs/adoption/README.md` §사용자 결단 carry 섹션 OFF 결단 명시              | ✅                |
| memory `project_adoption_workspace.md` adoption 영역 OFF 명시                | ✅                |
| memory `project_plugin_first_distribution.md` workspace 본체 단일 focus 명시 | ✅                |
| commit (no tag / no release)                                                 | ⏳ 사용자 결단 후 |

---

## 7. 종결 진술

> 사용자 명시 결단 — adoption 영역 carry 전체 OFF / workspace 본체 (`ai-native-methodology/`) 단일 focus.
> F4+F5+rename = 본 프로젝트 backlog 제거 / 외부 워크스페이스 = 사용자 자체 영역.
> 우선순위 재정렬 — Phase B 진입 자격 4 / v1.4.x 환경 carry 3 / 잠재 v1.5+ only.
> 본 결단 = 24h cooling-off 면제 ( 자산 변경 0 / 방향 선언) / §8.1 본체 자산화 ❌.

**End of DEC-2026-05-02-adoption-carry-OFF.**
