# DEC-2026-05-06-round-trip-부분-허용

| 항목 | 값 |
|---|---|
| 결정자 | 윤주스 (TF Lead) |
| 일자 | 2026-05-06 |
| 상태 | 승인 (★ ★ ★ ★ DEC-2026-04-29-round-trip-스코프-아웃 partial retract / chain harness 안에서 round-trip 정식 허용) |
| 카테고리 | methodology / scope 재정의 / partial retract / 사용자 명시 결단 |
| 관련 | DEC-2026-04-29-round-trip-스코프-아웃 (partial retract 대상), DEC-2026-05-06-v2.0-i-strict-채택 (동반 / 본 DEC 의 trigger), DEC-2026-05-06-cooling-off-정책-폐기 (즉시 결단 가능 정합), `~/.claude/plans/a-stateful-gadget.md` (master plan §A.2) |

---

## 컨텍스트

DEC-2026-04-29-round-trip-스코프-아웃 의 핵심:

> **round-trip (산출물 → 신규 시스템) 검증을 본 방법론 scope 에서 영구 제외**.
>
> 본 방법론의 가치를 다음과 같이 재정의:
> > "기존 시스템(legacy code) → 형식 명세 + 위험 기록" 한 방향 추출기.
> > 신규 시스템 구축은 사람의 책임. 본 산출물은 참고 입력 자료로만 활용.

근거:
1. 신규 시스템 자동 생성 = 70~80% 한계 (UI/UX / 운영 결정 / 사람의 개선 의도 형식화 불가)
2. 자동 생성 검증 부담 (언어/스택/패러다임 다양성) > 가치
3. 추출기로 한정하면 7대 산출물의 자기-완결성만 보장하면 됨
4. F-074 단방향 round-trip 만 유지 (자연어 명세 빈약성 검증 수단)

→ 영구 scope 외부:
- ❌ 산출물 → 신규 코드 자동 생성 검증
- ❌ "본 방법론 산출물로 신규 시스템을 자동 생성한다" 주장
- ❌ round-trip 정확도 정량 측정

## 사용자 결단 (2026-05-06)

DEC-2026-05-06-v2.0-i-strict-채택 = (A) i-strict 채택 (chain 4단계 SDLC harness / AI 자동 코드 생성 + 사용자 검토) → DEC-2026-04-29 의 영구 scope 결단과 ★ 정면 충돌.

사용자 발언 (2026-05-06 본 conversation):
> "분석해서 산출물 내고 그걸로 스팩문서 만들고 테스트 코드 만들고 그걸 기준으로 코드를 구현하는걸 목적으로 해... 잘못된것을 하지 않도록 하는 룰이나, 툴, 정책 들이 필요하다."
> "A로 하고 싶다."

→ 사용자가 "본 방법론 = chain 4단계 + 자동 코드 생성 + 검증 강제" 명시 채택.

## 결정

**DEC-2026-04-29-round-trip-스코프-아웃 partial retract** — 4 항목 중 2 항목 retract / 2 항목 보존:

### Retract (chain harness 안에서 정식 허용)

| 영역 | v1.5.0 (DEC-2026-04-29) | v2.0 (본 DEC) |
|---|---|---|
| 산출물 → 신규 코드 자동 생성 (round-trip) | ❌ 영구 외 | ✅ ★ scope 안 — chain 4단계 harness gate 안에서만 / 도구 강제 검증 의무 |
| "본 방법론으로 신규 시스템 자동 생성" 주장 | ❌ 안 함 | ✅ ★ chain 4단계 harness 통과 = 정식 주장 가능 |
| 산출물 → 코드 정확도 정량 측정 | ❌ 안 함 | ✅ ★ test-spec coverage / impl-spec test pass rate 정식 측정 |

### 보존 (변경 ❌)

| 영역 | 정책 |
|---|---|
| AI 시뮬 (test 통과 시뮬 / 구현 정확성 시뮬) | ❌ ★ ★ ★ no-simulation 정책 동일 / 강화 (chain 단계마다 진짜 도구 실행 / 5종 물증 7 필드 의무) |
| F-074 단방향 round-trip 검증 | ✅ 유지 (CHAIN 1 → CHAIN 2 단계 흡수) |
| 70~80% 한계 인정 | ★ 명시 잔존 — gate 별 사용자 검토 ≤15% / 100% 자동화 ❌ 명시 (master plan §J.2 옵션 A) |
| §8.1 strict ≥2 PoC corroboration | ✅ 유지 (cooling-off 만 폐기 / strict 임계 보존) |

## 새 경계 (v2.0)

| 영역 | scope 안/외 |
|---|---|
| 코드 → 산출물 추출 (analysis stage) | ★ scope 안 (chain 시작점) |
| **산출물 → 코드 자동 생성 (chain 4단계)** | ★ ★ ★ **scope 안 (harness gate 안에서)** |
| **산출물 → 코드 정확도 정량 측정** | ★ ★ **scope 안 (coverage / test pass rate)** |
| AI 시뮬 (test/impl 통과 시뮬) | ❌ ★ ★ ★ scope 외 (no-simulation 강화) |
| 자연어 → 형식화 (F-074) | scope 안 |
| harness 외부 자동 코드 생성 | ❌ scope 외 (gate 우회 ❌) |

## 70~80% 한계 closure 전략

원본 DEC 의 핵심 근거 = "신규 시스템 자동 생성 = 70~80% 한계 (UI/UX / 운영 결정 / 사람의 개선 의도 형식화 불가)".

본 DEC 후속 처리: ★ ★ **명시 잔존 한계로 인정 + gate 별 사용자 검토로 ≤ 15% 폐쇄 시도** (master plan §J.2 옵션 A 권고):
- AI 자동화 ≥ 85%
- 사람 검토 (gate #1~#4) ≤ 15%
- 7~15% 잔존 영역 = revisit loop + 사후 review carry
- ★ ★ "100% 자동화 의도 ❌" 명시 (Lessons Learned 14차 retract pattern 회피)

옵션 B (chain 5단계 사후 review/refactor 추가) = carry K-2 (v2.x 사용자 결단 시 진입).

## 산출물 이식성 5종 (변경 ❌)

DEC-2026-04-29 의 5종 이식성 표 = ★ 그대로 유지. chain 2 단계 = "현 7대 + 신규 추가 산출물" → 7대 산출물 (rules / domain / openapi / schema / antipatterns) 의 신규 시스템 입력 가치는 v2.0 에서도 보존.

| 산출물 | 활용도 |
|---|---|
| rules.json (BR) / domain.json / openapi.yaml | ★★★ 그대로 입력 (언어/환경 100% 무관) |
| schema.json + erd.mermaid | ★★★ 입력 + DB 타입 매핑 (RDB 내 90% 무관) |
| antipatterns.json + migration-cautions.md | ★★★ 회피 목록 (패턴 단위 무관) |

v2.0 추가 5종 (planning-spec / behavior-spec / acceptance-criteria / test-spec / impl-spec / traceability-matrix) = ★ chain 4단계 harness 안에서 정식 input/output / 외부 시스템 이식성은 별도 평가 (sub-plan-2 schemas 작성 시 정합).

## DEC 해소

- DEC-2026-04-29-round-trip-스코프-아웃 status: **승인 (★★★ 본 DEC 로 partial retract — 2 항목 retract / 2 항목 보존)**
- 원 DEC §scope 제외 영역 / §scope 유지 영역 = 본 DEC §새 경계 로 대체

## 영향

### 즉시 갱신

| 자산 | 액션 |
|---|---|
| `decisions/DEC-2026-04-29-round-trip-스코프-아웃.md` | 상태 헤더 갱신 + retract 표기 추가 / 본문 보존 (역사 기록) |
| memory `project_round_trip_unvalidated.md` | 본 DEC 로 partial retract 표기 추가 / 본문 보존 |
| memory `project_methodology_scope.md` | "한 방향 추출기" → "chain 4단계 harness" / round-trip 부분 허용 반영 / 5종 이식성 표 보존 |
| `methodology-spec/lifecycle-contract.md` | §가치 경계 충돌 deferral resolved / chain 4단계 채움 / round-trip 부분 허용 명시 |
| `CLAUDE.md` | "★★★ 본 방법론 가치 명세" chain 4단계 갱신 + round-trip 부분 허용 명시 |

### v2.0 진입 영향

본 DEC = ★ v2.0 SDLC 4단계 harness 의 ★ 사상 prerequisite. master plan sub-plan-1 ~ sub-plan-6 모두 본 DEC 정합.

## release / version

- 본 DEC = release ❌ (사상 결단 / 자산 변경 = sub-plan-1 안에서 별도 commit)
- v2.0.0 release = sub-plan-6 종결 시점

## 다음 액션

1. ✅ 본 DEC 등재
2. ⏳ DEC-2026-04-29-round-trip-스코프-아웃 상태 헤더 갱신
3. ⏳ memory `project_round_trip_unvalidated.md` 갱신
4. ⏳ memory `project_methodology_scope.md` 갱신
5. ⏳ lifecycle-contract.md / CLAUDE.md / skills-axis.md / agents READMEs 갱신
6. ⏳ STATUS.md / INDEX.md 갱신

---

**END**
