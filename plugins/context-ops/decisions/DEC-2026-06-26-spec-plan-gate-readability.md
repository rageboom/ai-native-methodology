# DEC-2026-06-26-spec-plan-gate-readability

**spec·plan 게이트 가독성 — discovery 읽기뷰 패턴을 spec/plan 검토 렌더러에 제자리 확장 (v0.80.0 MINOR / additive·UI / 상태머신 무접촉)**

**상태**: 승인·시행 (plugin.json 0.79.0 → 0.80.0)

## 맥락 (사용자 발화)

discovery 게이트 검토 화면은 v0.79.0(DEC-2026-06-25-discovery-2-gate)에서 "JSON 인스펙터 → PRD 산문 + 공유 묶음 뷰"로 읽기 좋게 바꿨다. 그런데 그 다음 단계인 **spec 게이트(#2)·plan 게이트(#3) 검토 화면은 그대로 raw JSON 덩어리**다. "plan, spec 쪽에서도 discovery 와 비슷하게" 읽히게 해달라.

## 진단 (조사로 확인 / 실측)

- spec/plan 산출물 렌더러는 사실상 **필드워커 위임 stub**: `behavior-spec.js`(7줄)·`unit-spec.js`(10)·`task-plan.js`(17)·`acceptance-criteria.js`(44, gherkin 일부 bespoke) 모두 `Kit.arrange` 로 raw 필드 나열 → discovery 가 개선되기 전과 동일한 "JSON 인스펙터" 통증.
- 렌더러 선택은 `artifactType` 기준 자동(`buildHtmlMulti`) — spec 게이트는 이미 behavior+ac+unit 3산출물을 **한 페이지에 쌓아** 보여줌. → 기존 산출물별 렌더러를 **제자리 업그레이드**하면 새 phase/renderAs/`server.js` 배선 불요.
- `Kit` 은 `prose`/`section`/`blockify`/`arrange` 등을 이미 export. discovery-draft 가 인라인하던 `el`·`proseSentences`(문장 줄바꿈) 로직은 Kit 부분 재구현 → 승격하면 spec/plan 이 공유.

## 업계 정합 (4원칙 §2 / research 3-에이전트)

- **공식문서(docs-checker)**: SSOT→render-time 산문(twin persist❌)=정석(CCMS·docs-as-code·OpenAPI 수렴 / ADR-011 정합). ADR 가독=완전문 산문(Nygard 원본 "read like a conversation"). Gherkin→사람말 렌더는 도구 레이어 영역(Cucumber 공식 강제 없음 = 자유 설계). acceptance-criteria 표준 가독포맷=근거 약함(정직).
- **업계사례(industry-case)**: Amazon PR-FAQ(산문+분량제한+TL;DR→상세 점진공개)·Google Design Doc(Goals/Alternatives/측정가능 문장)·Rust Pre-RFC. draft-first 가 spec/plan 에도 쓰이나 **대형 팀엔 오버헤드**(Rust 비판) = mixed.
- **Senior(verdict CONCUR Option R / high)**: draft-first 의 전제(미확정 범위를 싸게 좁힌다)가 spec/plan 에서 **불성립** — in_scope UC 가 discovery 에서 이미 잠긴 뒤 BHV/AC/task 가 결정론 파생, 좁힐 모집합 없음. (Rust Pre-RFC 는 *미확정 설계공간* 소셜화 → 우리 *확정 scope 파생* 과 맥락 다름.) `/confirm-scope` 는 discovery-spec 전용 write → spec/plan 확장 시 새 채널·schema 신설=재작업. Kit 승격은 **로직만 / CSS 렌더러 로컬**(dd- 네임스페이스 누수 차단). 통합뷰 추적축은 **read-only render-time 표식**(계산/검증=traceability-builder 책임 / schema 신설❌).

## 결정 (Option R = 가독성만)

spec·plan 게이트 렌더러를 **제자리에서 읽기뷰로 업그레이드**. draft-first 2-게이트·`/confirm-scope` 구조적 선택은 **명시 scope-out**. 상태머신·phase-flow·게이트·schema·`server.js` renderAs 배선 **무접촉**(gate #2/#3 그대로 / STRONG-STOP 보존 / render-time / persist❌ / ADR-011). 기존 `/apply` 자유텍스트 채널 유지.

① **Kit 로직 헬퍼 승격** (`assets/kit.js`): `Kit.el(tag,cls,text)` + `Kit.proseSentences(text,anchor,label,wrapCls)`(마침표 뒤 문장 줄바꿈 / wrapCls=호출측 로컬 클래스 → CSS 누수 차단). discovery-draft 는 출하·테스트 완료 코드라 churn 회피 위해 미개수(전방 de-dup: 신규 렌더러가 Kit 재사용).
② **behavior-spec 읽기뷰**: 동작별 이름 헤더 + 산문 설명 + 전제/결과/불변 블록 + 추적 칩(← 유스케이스 / → 인수기준 / 규칙).
③ **acceptance-criteria 읽기뷰**: 기준별 산문 + 우선(severity)/검증/자동실행 칩 + Given/When/Then 시나리오(style.css `scn-` 재사용) + 추적(← 동작 / ← 유스케이스 / → 테스트 / 규칙).
④ **unit-spec 읽기뷰**: 유닛 카드(종류/출처 칩 + 코드 위치 + stale 표식 + 불변·협력·동작 추적 + 테스트 의무) + 커버리지 통계 블록(의무충족·뮤테이션·기준선·전략).
⑤ **task-plan 읽기뷰**: 한눈 요약(TL;DR 작업/ADR/위험/NFR 수) → 작업(execution_order 정렬 + 산문 + 의존성/추적) → 설계결정 ADR(결정·대안·영향 완전문 산문 / Nygard) → 위험(severity+완화) → 비기능요구 NFR(특성+측정+task 추적).
⑥ **추적 칩 = json 기존 ref 배열 표시만**(계산/검증 ❌). CSS 는 렌더러 로컬(bs-/ac-/us-/tp-).

## 검증

- `dom-render.test.js` +5(behavior 카드 4·추적 칩·전제블록 / task-plan TL;DR·execution_order 정렬·ADR/위험/NFR 섹션 / unit 카드·커버리지 / AC 카드 4·추적). DOM-stub 실행(throw 없이) + 구조 단언.
- plan-review-server 전체 77 + discovery-draft 8 무회귀. version-check 3-way 0.80.0. release-readiness 43/43.
- renderAs 배선·server.js 무변경 → release-readiness expected-renderAs 결합 리스크 없음(애초 일반화 불요로 판명).

## 본체 격상 / 잔여 (§8.1)

- 1차 시행(가독성 UI / 본체 schema·gate·상태머신 무변경 → §8.1 임계 밖). 실 dogfood(≥2 PoC 에서 spec/plan 게이트 브라우저 검토 체감) corroboration = 후속.
- discovery-draft 인라인 헬퍼의 Kit 완전 통합(출하 코드 churn 회피로 보류)은 차기 touch 시 정리 가능.

Relates: DEC-2026-06-25-discovery-2-gate(읽기뷰 패턴 모 / discovery-draft.js) + DEC-2026-06-19-plan-review-server(검토 편집기) + ADR-011(json 단독 SSOT / render-time) + feedback_chain_driver_deterministic_axis(STRONG-STOP / 상태머신 무접촉) + feedback_quality_priority(§8.1 / Option R 재작업 최소).
