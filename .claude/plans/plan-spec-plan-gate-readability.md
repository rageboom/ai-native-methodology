# plan — spec·plan 게이트 가독성 (discovery-draft 패턴 확장)

> 4원칙 §1 산출물. 워크트리 `spec-plan-gate-readability` (base = v0.79.0 / d795e012).
> §2 research = `research-spec-plan-gate-readability.md` (작성 예정). §3 사용자 승인 후 코드.
> 토픽: discovery 2-게이트가 discovery 검토화면에 준 "읽히는 산문 렌더러"를 **spec 게이트(#2)·plan 게이트(#3)** 에도 확장.

## 1. 맥락 (사용자 발화)

discovery 검토화면을 PRD 산문 + 공유 묶음 뷰로 읽기 좋게 만든 작업(v0.79.0)을, **"plan, spec 쪽에서도 discovery 와 비슷하게"** 하려던 것이 사용자 의도. CLI 종료로 중단 → 신규 워크트리에서 재개.

## 2. 깊은 숙지 (전수 조사 결론 / 실측)

### 2-1. 렌더러 배선 구조 (재사용 가능)
- 렌더러 = 자기등록형 `RENDERERS['<key>']` (브라우저 assets/renderers/*.js). `ctx.data`(산출물 json) + `ctx.difficulty` 입력.
- phase→artifacts→renderAs 매핑 = `artifact-registry.js` `PHASES`. `server.js:258` 가 renderAs 결정 → `emit.js` 가 렌더러 선택 키로 사용.
- **현재 renderAs 특례는 discovery-draft 하나만 하드코딩** (`phase==='discovery-draft' && artifactType==='discovery-spec'`).
- 공용 헬퍼: `Kit.section`/`Kit.prose`/`Kit.arrange`(필드워커)/`Kit.COLLAPSED`. discovery-draft 는 `Kit.section`+`Kit.prose` 만 쓰고 나머지는 bespoke.

### 2-2. 가독성 갭 = 실측 확정
| 게이트 | 산출물 | 현 렌더러 | 상태 |
| --- | --- | --- | --- |
| spec #2 | behavior-spec / acceptance-criteria / unit-spec | `behavior-spec.js`(7줄) 등 = **`Kit.arrange` 필드워커 위임** | ❌ JSON 인스펙터 |
| plan #3 | task-plan | `task-plan.js`(17줄) = 필드워커 | ❌ JSON 인스펙터 |
- 비교: `discovery-draft.js`(393줄) = PRD 산문 + 묶음 + 라벨 블록 bespoke.
- **결론**: discovery 가 받은 가독성 개선이 spec/plan 에는 미적용 = 같은 통증 잔존.

### 2-3. phase-flow 게이트 구조 (상태머신 접점)
- spec.phase-flow v3.1.0: …→behavior-spec-compose→acceptance-criteria-derive→unit-spec-derive→cross-link→diagrams→**gate-2(#2)**. 단일 chain-driver 게이트.
- plan.phase-flow v1.0.0: task-decompose→architect-decisions→risk-nfr→task-plan-compose→**gate-3(#3)**. 단일 게이트.
- discovery 와 달리 **spec/plan 은 이미 "확정된 scope 에서 파생"** → draft-first(방향 먼저 확정) 동기 약함.

## 3. 설계 (확정 전 / §3 승인 대상)

discovery 2-게이트가 준 것은 3겹이었다 — ① 가독성(산문 렌더러) ② 사용자 선택(/confirm-scope 화이트리스트) ③ draft-first 2-게이트. **spec/plan 에는 어디까지 가져올지가 핵심 결정.**

### 권장 (Option R — readability-only / 가벼움 / 재작업 최소)
**① 가독성만 확장. ②/③ 제외.**
- spec 게이트: behavior-spec + acceptance-criteria(+unit-spec) 를 **하나의 읽히는 페이지**로 — 동작(BHV)을 산문 + Given/When/Then AC 를 사람말 블록 + UC→BHV→AC 추적 라인. 신규 `spec-readable` 렌더러 (또는 각 렌더러 bespoke 격상).
- plan 게이트: task-plan 을 **읽히는 계획서**로 — task 분해를 산문 + 의존성/순서 + ADR/NFR/risk 블록 + AC→TASK 추적.
- renderAs 배선을 discovery-draft 하드코딩 특례 → **phase 기반 일반화**(PHASES.renderAs 사용 / server.js:258 일반화).
- 상태머신·phase-flow·게이트 **무접촉** (gate #2/#3 그대로 / STRONG-STOP 보존). 산문 = render-time / persist ❌ (json 단독 SSOT / ADR-011).
- 기존 `/apply` 자유텍스트 채널 유지(구조적 /confirm-scope 선택 UI 는 미도입).

### 대안 (Option F — full parity / 무거움)
②(구조적 선택: plan task 선택/순서·AC 우선순위 화이트리스트 write) + ③(spec/plan draft-first 2-게이트) 까지. → **권장 안 함**: spec/plan 은 확정 scope 파생이라 draft-first ROI 낮음 + 게이트 증식 = 검토 피로 + 상태머신 접점 리스크. (research 에서 ROI 교차검증.)

## 4. 변경 파일 (Option R 기준 / 잠정)
- `tools/plan-review-server/assets/renderers/`: `behavior-spec.js`·`acceptance-criteria.js`·`unit-spec.js`·`task-plan.js` bespoke 격상 (또는 신규 `spec-readable.js`/`plan-readable.js` + renderAs 매핑).
- `tools/plan-review-server/src/server.js`: renderAs 선택 로직 discovery-draft 하드코딩 → PHASES 기반 일반화.
- `tools/plan-review-server/src/artifact-registry.js`: PHASES 에 renderAs 명시(spec/plan).
- `tools/plan-review-server/assets/kit.js`: 공용 prose/블록 헬퍼 필요 시 보강 (discovery-draft 인라인 헬퍼 → Kit 승격해 spec/plan 재사용).
- `tools/plan-review-server/test/`: spec-readable / plan-readable 렌더 테스트 (buildHtmlMulti 산문 인라인 + 필드워커 미사용 검증).
- release: plugin.json/package.json/CHANGELOG/README/CLAUDE 0.80.0 + DEC-2026-06-25-spec-plan-gate-readability + INDEX.

## 5. 검증 계획
- 신규 렌더 테스트 + 기존 plan-review-server 77 + discovery-draft 8 무회귀.
- release-readiness 43/43 유지. version-check 3-way 0.80.0.
- (선택) 실 산출물 fixture(behavior-spec/task-plan)로 buildHtmlMulti 스냅샷.

## 6. 확정안 (research §4 수렴 / §3 승인 묶음)

research(docs+case+Senior)가 아래로 수렴 — 사용자 승인 대상:
1. **scope = Option R 확정** (가독성 렌더러만 / 상태머신·게이트 무접촉 / STRONG-STOP 보존). **F②(구조적 선택)·draft-first = 명시 scope-out** — spec/plan 은 확정 discovery scope 에서 결정론 파생이라 draft 가 좁힐 모집합 없음(Senior). 
2. **Kit 승격 = 로직 헬퍼만**(prose/section/블록) + **CSS 는 렌더러 로컬 유지**(`dd-` 네임스페이스 누수 차단). discovery-draft 와 중복 최소화.
3. **spec = behavior+ac+unit 통합 뷰** + UC→BHV→AC 추적축 **read-only render-time 표식**(계산/검증 ❌ = traceability-builder 책임 / schema 신설 ❌). plan = TL;DR → 작업분해/의존성/ADR(완전문 산문)/NFR/risk 점진 공개.
4. **renderAs 배선 일반화**(discovery-draft 하드코딩 → PHASES.renderAs) — ⚠️ release-readiness/test expected-renderAs 단언 동시 갱신 + `pnpm test:release` full 의무.
5. **버전 0.80.0 MINOR** (main=0.79.0).
6. **티켓**: discovery 처럼 후속(B안) 제안.

## 7. Lessons / 함정 (선반영)
- 본체 schema 무변경 / 산문 render-time / persist ❌ (ADR-011).
- renderAs 일반화 회귀 → test:release full 동시 갱신(메모리 release_readiness_count_coupling).
- 게이트 증식 회피(상태머신 무접촉 = STRONG-STOP 보존). Auto Mode 호환(검토 UX skip 무해).
- 재사용 우선: discovery-draft 헬퍼 Kit 승격(로직만) → 중복 최소(품질1/재작업최소2).
