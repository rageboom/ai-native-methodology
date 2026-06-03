# DEC-2026-05-07-poc-07-poc03-phase7-retrofit

> **카테고리**: methodology / phase 4.7 (characterization) ≥2 PoC corroboration 충족 / PoC #03 retrofit / v2.1.0 본체 격상 자격 사실 확보
> **상태**: 승인 ( phase 4.7 corroboration #2 충족 — Modern 스택 spectrum 입증)
> **일자**: 2026-05-07
> **선행**: DEC-2026-05-07-poc-06-종결 (corroboration #1 / Legacy 적대성)

---

## 1. 결단

phase 4.7 (characterization) 정식 단계의 v2.1.0 본체 격상 자격 = **≥2 PoC corroboration** 충족 위해 **PoC #03 NestJS RealWorld 에 phase 4.7 retrofit 적용** 결단.

**근거**: PoC #06 (corroboration #1 / EFI-WEB Spring 4.1 + iBATIS / Legacy 적대성) 만으로는 단일 PoC 과적합 위험 (§8.1). 다른 spectrum (Modern NestJS) 에서도 phase 4.7 동작 입증이 본체 격상 자격.

**대안 고려 + 거절**: 사내 다른 legacy Java 프로젝트 PoC #07 신설 — 사용자 결단 + 코드베이스 가용성 carry / 시간 비용 ↑. **PoC #03 retrofit 이 가장 빠른 ≥2 corroboration 충족** (기존 산출 활용).

## 2. ≥2 PoC corroboration 충족 검증

| 자격                              | PoC #06 (corroboration #1) | PoC #03 retrofit (corroboration #2) | 종합      |
| --------------------------------- | -------------------------- | ----------------------------------- | --------- |
| phase 4.7 정식 적용               | ✅ Day 0~3 (2026-05-07)    | ✅ retrofit (2026-05-07)            | ✅        |
| intent-vs-bug 분류 정합           | ✅ 17/18 (94%)             | ✅ 30/30 (100%)                     | ✅        |
| snapshot 형식 정합                | ✅ 3 UC × 10 scenario      | ✅ 1 UC × 3 scenario (signup)       | ✅        |
| 외부 조언 (Michael Feathers) 정합 | ✅ ambiguous 영역 핵심     | ✅ Modern 환경 acceptance oracle    | ✅        |
| **다른 스택/spectrum 입증**       | EFI-WEB (Legacy 적대성)    | NestJS RealWorld (Modern)           | ** 충족** |
| §8.1 단일 PoC 과적합 회피         | (단독)                     | (다른 spectrum)                     | **충족**  |

→ **phase 4.7 v2.1.0 본체 격상 자격 사실 확보**.

## 3. PoC #03 retrofit 산출

| 자산                 | 위치                                                                                  | 상태                                              |
| -------------------- | ------------------------------------------------------------------------------------- | ------------------------------------------------- |
| intent-vs-bug 분류표 | `examples/poc-03-realworld-nestjs/characterization/intent-vs-bug.md`                  | ✅ 19 BR + 11 AP / 30/30 = 100% 명확              |
| snapshot 1종         | `examples/poc-03-realworld-nestjs/characterization/snapshots/UC-USER-SIGNUP-001.json` | ✅ 3 scenario (happy + duplicate + invalid email) |
| coverage matrix      | `examples/poc-03-realworld-nestjs/characterization/coverage.json`                     | ✅ retrofit scope + corroboration 검증            |

## 4. phase 4.7 spectrum 차이 (corroboration 본질)

| 축                      | PoC #06 (Legacy)                               | PoC #03 (Modern)                      | 차이                 |
| ----------------------- | ---------------------------------------------- | ------------------------------------- | -------------------- |
| 스택                    | Spring 4.1.2 + iBATIS 2 + JSP + 표준프레임워크 | NestJS 7+ + TypeORM + class-validator | 적대성 4중 vs Modern |
| BR ambiguous            | 1 (14%)                                        | 2 (10.5%)                             | -3.5%p               |
| AP ambiguous            | 1 (10%)                                        | 0 (0%)                                | -10%p                |
| 자조 코멘트 (자체 인지) | 1 (AP-007)                                     | 0                                     | -1                   |
| 명확 분류 비율          | 17/18 = 94%                                    | 30/30 = 100%                          | +6%p                 |
| 도메인 expert 결단 의무 | ✅ 1건 (DBA carry)                             | ❌ 0건                                | 부재                 |
| **phase 4.7 핵심 가치** | ambiguous 영역 명시 + 도메인 결단 강제         | snapshot + acceptance oracle 자체     | 다른 가치 축         |

**결정적 finding**: phase 4.7 가 **두 spectrum 모두에서 동작**.

- Legacy 환경 (PoC #06) = ambiguous 영역 명시가 핵심 가치 (도메인 expert 결단 강제)
- Modern 환경 (PoC #03) = snapshot 자체가 acceptance oracle 핵심 가치

→ ~~분기 의무~~ **정정** (2026-05-07 / 사용자 비판 수용 / YAGNI): 단일 phase 4.7 prompt 로 양 spectrum 동작 입증. ambiguous 등장 빈도는 코드/도메인 특성이지 phase 4.7 단계 분기 ❌. F-PHASE7-spectrum 단순 finding 보존만.

## 5. v2.1.0 본체 격상 carry 갱신

| ID                                          | 항목                                                                      | 상태                                                                                                                                                 |
| ------------------------------------------- | ------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| C-3                                         | phase 4.7 (characterization) v2.1.0 본체 격상                             | **≥2 PoC corroboration 충족** (PoC #06 + PoC #03 retrofit) → v2.1.0 release 자격                                                                     |
| C-8                                         | phase 4.7 schema 본체 정의                                                | v2.1.0 본체 격상 시 통합 (snapshot 형식 / coverage threshold / intent-vs-bug 분류표)                                                                 |
| C-9                                         | meta-confidence.schema.json `inputs_used` enum 에 `characterization` 추가 | v2.1.0 본체 격상 시                                                                                                                                  |
| F-PHASE7-spectrum ( finding only / 분기 ❌) | Legacy 환경에서 ambiguous ↑ 경향 관찰 (PoC #06 1건 / PoC #03 0건)         | **단순 finding 보존** — skill prompt 분기 의무 ❌ (YAGNI / boundary 흐릿). 동일 prompt 로 양 spectrum 동작 입증 — 사용자 가이드 hint 한 줄 정도 가능 |

## 6. v2.1.0 release 후보 (carry / 사용자 결단)

phase 4.7 본체 격상 + cleanup carry 통합 시 **v2.1.0 minor release 자격**:

| 자격                                                        | 상태                                                                      |
| ----------------------------------------------------------- | ------------------------------------------------------------------------- |
| ≥2 PoC corroboration                                        | ✅ (PoC #06 + #03 retrofit)                                               |
| skills/analysis-phase-4-7-characterization/ 신설            | ⏳ 본 DEC 후 carry                                                        |
| tools/characterization-coverage-validator/ 신설             | ⏳ 본 DEC 후 carry                                                        |
| flows/analysis.phase-flow.json 갱신 (phase 4.7 추가)        | ⏳ 본 DEC 후 carry                                                        |
| meta-confidence.schema.json enum 'characterization' 추가    | ⏳ 본 DEC 후 carry                                                        |
| methodology-spec/deliverables/phase-4-7-characterization.md | ⏳ 본 DEC 후 carry                                                        |
| ADR (예: ADR-CHAIN-006 phase 4.7 신설)                      | ⏳ 본 DEC 후 carry                                                        |
| ~~skill prompt Modern vs Legacy 분기~~                      | **❌ 제거 (2026-05-07 정정 / YAGNI / 단일 prompt 양 spectrum 동작 입증)** |

→ **v2.1.0 minor release 진입은 carry — 사용자 결단 영역**.

## 7. 자산 갱신 (본 결단으로)

- ✅ examples/poc-03-realworld-nestjs/characterization/ 디렉토리 + 3 파일 신설
- ✅ 본 DEC 신설
- ⏳ STATUS.md PoC #03 phase 4.7 retrofit corroboration #2 추가
- ⏳ INDEX.md 본 DEC 추가
- ⏳ plan §6.5 단계 (ii) ✅ 충족 갱신

## 8. 참조

- 선행: DEC-2026-05-07-poc-06-종결 (corroboration #1)
- DEC-2026-05-07-poc-06-domain-결단 (D2 / acceptance oracle 안정화)
- 외부 조언: plan §6.5 (Michael Feathers Characterization Testing + DDD + SbE)
- PoC #06 자산: `examples/poc-06-efiweb-exchange-spring41/characterization/`
- PoC #03 retrofit 자산: `examples/poc-03-realworld-nestjs/characterization/`
- v2.1.0 release plan carry
