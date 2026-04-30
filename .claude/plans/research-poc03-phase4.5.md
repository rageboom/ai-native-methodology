# Research — PoC #03 Phase 4.5 형식 명세 + drift-validator 첫 외부 검증

> 4원칙 2단계 (에이전트 팀 토론) 산출. 가벼운 sub-agent 3 병렬 (시간 cap 8분).
> 작성: 2026-04-30
> plan: `plan-poc03-phase4.5.md`

---

## 0. 3 sub-agent 결과 요약

| Sub-agent | 시간 | fetch 성공 | 핵심 발견 |
|---|---|---|---|
| **NestJS 7 공식** | ~44초 | ❌ (도구 부재 — 학습 코퍼스 정직 표기) | JwtAuthGuard 권장 / DTO 12% AP 등록 / @BeforeUpdate 누락 / fast-check 1:N |
| **OSS 사례** | ~123초 | ✅ (Sairyss + lujakob + fast-check raw fetch) | lujakob = PoC #03 100% 일치 / Sairyss = rich domain 권위 / DB UQ 단독 + catch 정설 |
| **Senior Engineer** | ~41초 | ❌ (학습 코퍼스 + 추론) | UC-LOGIN 재고 ⚠️ / 신뢰도 80-87% ❌ (critical -3%p 추가) / NestJS 특이 위험 3건 / double_hit 3건 |

★★★ no-simulation 정합: NestJS 7 공식 + Senior = 학습 코퍼스 기반. OSS 사례만 진짜 raw fetch 5건 성공.

---

## 1. NestJS 7 공식 / 학습 코퍼스 보고 (Sub-agent 1)

### 1.1 정직 표기

Sub-agent 환경에서 WebFetch / WebSearch **미제공** → docs.nestjs.com / GitHub release notes / fast-check 공식 모두 fetch 시도 불가. 학습 코퍼스 기반 답변 → **메인이 진짜 fetch 로 cross-check 권장**. 신뢰도 -5%p 패널티 (★★★ no-simulation 정합).

### 1.2 5 답 정수

| # | 영역 | 결론 |
|---|---|---|
| 1 | Guard vs Middleware (NestJS 7) | F-140 처리 = **JwtAuthGuard 권장** (Middleware ❌). `@UseGuards(JwtAuthGuard)` controller 데코레이터. |
| 2 | DTO + class-validator 분포 | NestJS 7 권장 = DTO 100% + ValidationPipe 글로벌 + `whitelist:true` + `forbidNonWhitelisted:true`. PoC #03 12% = **AP 등록 가치 ★★**. |
| 3 | @BeforeInsert + AR 생애주기 | `@BeforeInsert` = lifecycle subscriber. business invariant 검증은 Service layer 권장. **★ @BeforeUpdate 누락 위험 — state-machine 다이어그램에 명시 의무**. |
| 4 | Idempotent endpoint (NestJS 7) | favorite/follow toggle = idempotent ⭕ + `INSERT ... ON CONFLICT DO NOTHING` 동등 처리. PoC #02 AP-API-001 재현 가능성 ★★. |
| 5 | fast-check property-test | invariants.ts 1:N property 매핑. arbitrary = `fc.emailAddress()` / `fc.string({minLength:8})` / `fc.uuid()`. state-machine 전이별 spec 파일 분리. |

---

## 2. OSS 사례 raw fetch 보고 (Sub-agent 2 — ★ 진짜 fetch)

### 2.1 raw fetch 성공 5건

| Source | URL | stars | 핵심 |
|---|---|---|---|
| NestJS 공식 sample | github.com/nestjs/nest/tree/master/sample (36 samples) | 공식 | **DDD/Aggregate sample 0개** — 모두 anemic entity + Service |
| **lujakob/nestjs-realworld-example-app** | raw.githubusercontent.com/lujakob/nestjs-realworld-example-app/master/src/user/* | 다수파 | **PoC #03 100% 동일 패턴** — anemic + Service `validate()` + `getRepository().where().orWhere().getOne()` race-prone pre-check |
| **Sairyss/domain-driven-hexagon** | github.com/Sairyss/domain-driven-hexagon | ★★★★ 11k+ | rich domain 권위 — `AggregateRoot.create()` + `protected validate(props)` + `Guard.*` 헬퍼 + 도메인 에러 클래스 |
| dubzzz/fast-check examples/004-stateMachine | raw.githubusercontent.com/dubzzz/fast-check/main/examples/004-stateMachine/musicPlayer/main.spec.ts | 공식 | `fc.modelRun` + Model/Real 분리 + `fc.commands` 권장 |
| XState + NestJS | github.com/search?q=xstate+nestjs (9건, max 17 stars) | 미미 | **industry 채택 미미** — Aggregate lifecycle XState 표현 RealWorld 스케일 사례 부재 |

### 2.2 5 답 정수

#### 2.2.1 DDD + NestJS — 양극화

- **lujakob 류 (다수파 ★★★)** — anemic entity + Service `validate()` + class-validator 혼합 = NestJS 생태계 다수파. **PoC #03 = 이 패턴 100% 일치**.
- **Sairyss 류 (권위 reference ★ 11k stars)** — `AggregateRoot.create()` 팩토리 + protected validate + Guard.* + 도메인 에러 클래스. class-validator 는 **DTO 경계** 만 사용.

→ **명세는 코드 충실도 (lujakob 정합), antipattern 은 industry best 기준 (Sairyss 정합)** — 두 축 분리 의무.

#### 2.2.2 약한 Aggregate (Follows / Tag) — industry 합의 부재

- **(a) Sairyss 류**: 강한 Aggregate 만 정의, 약한 association = Repository method 처리 (e.g. `FollowRepository.follow(followerId, followeeId)`)
- **(b) lujakob 류**: Follows = `@Entity` ManyToMany 처리

→ PoC #03 = (b) 패턴. Phase 4.5 명세는 (b) 정합. Tag = **Value Object 처리 권장 (Sairyss-style)** 이나 RealWorld 스케일은 거의 entity (PoC #03 = entity).

#### 2.2.3 invariants.ts — industry 표준 부재

| 패턴 | 채택 | 평가 |
|---|---|---|
| **Smart Constructor (`static create()`)** | Sairyss + 광범위 | **★★ industry mainline — PoC #03 권장** |
| throw + 도메인 에러 클래스 | Sairyss | 광범위 |
| Result / Either (fp-ts / neverthrow) | 소수 | 소수 진영 |
| Branded Type | Effect.ts 등 advanced | 채택 미미 |

→ **PoC #03 invariants.ts 권장 = `static create()` + throw 기반** (industry mainline 정합).

#### 2.2.4 fast-check + NestJS Service property-test

- fast-check 공식 examples = 자료구조 / state machine 만 (musicPlayer = `fc.modelRun` + Model/Real 분리 + `fc.commands`)
- **NestJS Service + fast-check + Mock Repository 결합 OSS 사례 raw fetch 실패** — industry 합의 부재
- **PoC #03 권장 = 단발 property 부터 시작** (model-based 는 후속 phase)

#### 2.2.5 race-prone unique check — TypeORM 정설

| 패턴 | 채택 | 평가 |
|---|---|---|
| **DB UQ 단독 + `catch QueryFailedError → ConflictException`** | Sairyss | **★★ industry 정설** |
| App pre-check + DB UQ 2중 | (드뭄) | race 미해결 + 비효율 → **antipattern** |
| App pre-check 단독 | lujakob (PoC #03) | **★★ critical race** |

→ **PoC #03 의 App 1중 (DB UQ 자체 부재) 은 lujakob 패턴 그대로 + 더 나쁨**. AP-DB-001-poc03 등록 정합. PoC #02 의 App+DB UQ 2중도 industry 정설 (DB UQ 단독 + catch) 대비 비효율 → **재평가 후보**.

---

## 3. Senior Engineer Cross-validation 보고 (Sub-agent 3)

### 3.1 5 의사결정 판정

| # | 판정 | 핵심 |
|---|---|---|
| 1 BR 5건 | ✅ 동의 (확신) | favoriteCount race **AP 추적 ≠ BR 형식화 보류** 명시 권고. JWT-EXPIRY = Decision Table 형식 적합 (만료/갱신/블랙리스트 3차원). |
| 2 AR 3개 | ✅ 동의 (확신) | Article FSM = **counter aggregate** 측면 집중 (CRUD transition 보다 invariant 표현 비중 ↑). RealWorld 스펙상 Article = published/draft 구분 없음 (CREATED → UPDATED 만). |
| 3 UC 5개 | ⚠️ **우려 (추정)** | **UC-USER-LOGIN 미선정 재고 권고** — JWT 발급 흐름 = NestJS Passport ↔ Spring Security 가장 큰 구조 차이 발생 지점 → **drift-validator cross-platform 검증 핵심 데이터**. UC-ARTICLE-FAVORITE 1건 교체 또는 6번째 추가. |
| 4 drift-validator 첫 외부 검증 | ✅ 동의 (확신) | **false negative 우선 측정 명시 권고** (false positive 보다 위험). |
| 5 Static carry-over 신뢰도 80-87% | ❌ **반대 (확신)** | **★★ AP-AUTH-NEST-001 critical (F-140) 은 typescript-eslint + Semgrep 없이 sub-agent 검증 불충분**. critical finding 1건당 -3%p 추가 패널티 도입 → **실제 신뢰도 70-77%** 로 조정. Sprint 5 진짜 실행으로 +10%p 회복. |

### 3.2 NestJS / TypeScript 특이 위험 3건

| # | 위험 | 정도 |
|---|---|---|
| 1 | **DI Scope 오용** — `@Injectable({scope: Scope.REQUEST})` Guard/Interceptor 전파 시 메모리 누수 / 성능 저하 | 추정 |
| 2 | **Decorator 실행 순서 모호성** — `@UseGuards` / `@UseInterceptors` / `@UsePipes` 조합 시 클래스 vs 메서드 데코레이터 순서. **JWT auth bypass 위험 직접 연결** ★★ AP-AUTH-NEST-001 동일 영역 | 확신 |
| 3 | **TypeORM eager 기본값 차이** — Spring JPA `@ManyToOne(fetch=LAZY)` vs TypeORM eager — PoC #02 N+1 finding 이 PoC #03 다른 형태로 재발 가능 | 추정 |

### 3.3 ★★ double_hit 후보 3건

| # | 시그널 | 자산화 가치 |
|---|---|---|
| 1 | **transitionFuzzyMatch 한계 (F-117 재발)** | **★★★ 도구 본질적 한계 확정 → 방법론 v1.2.x 격상 트리거** |
| 2 | **JWT/Auth invariant 자연어 빈약** | rules.json L0 한계 정량 데이터 → ADR-008 강화 근거 |
| 3 | **Counter aggregate race (favoriteCount)** | 언어 무관 ★★ AP 자산화 가능 (PoC #02 양 환경 공통 발견 시) |

### 3.4 정직 한계

- plan.md 미열람 추론 (의사결정 5건 요약만)
- ★★ AP-AUTH-NEST-001 / F-140 실제 내용 미확인 → 위험 추정 정확도 ↓
- NestJS 11.x / TypeORM 0.3.x 최신 학습 컷오프 (2026-01) 이후 변동 가능

---

## 4. 통합 발견 (3 sub-agent 합산)

### 4.1 합의 영역 (3 agent 동의)

| 합의 | 영향 |
|---|---|
| **F-140 처리 = JwtAuthGuard 권장** (Middleware ❌) | Phase 6 AP migration_advice 명시 |
| **DTO 12% coverage = AP 등록 가치 ★★** | Phase 6 antipatterns 후보 보강 |
| **App pre-check + DB UQ 부재 = critical race-prone** | AP-DB-001-poc03 정식 등록 정합 |
| **PoC #02 AP-API-001 (idempotency) 재현 가능성 ★★** | Phase 6 cross-validation 시그널 |
| **invariants.ts = `static create()` + throw 기반** | industry mainline (Sairyss 정합) |

### 4.2 분기 영역 (sub-agent 견해 차이)

| 영역 | NestJS 공식 | OSS 사례 | Senior |
|---|---|---|---|
| 신뢰도 평가 | (미언급) | (미언급) | **❌ 80-87% 우려 / 70-77% 권고** |
| UC 5개 선정 | (미언급) | (미언급) | **⚠️ UC-USER-LOGIN 재고** |
| Article FSM 가치 | (미언급) | (미언급) | **counter aggregate 집중 권고** |

→ **Senior 권고 3건 본 plan 에 반영 의무**.

### 4.3 PoC #03 만의 ★★ 통찰

- **PoC #03 = lujakob 패턴 100% 일치** → industry NestJS 다수파 (anemic + Service validate + race-prone pre-check) 자체가 **industry best 기준 antipattern** = **★★★ NestJS 생태계 메타 finding**
- → Phase 6 antipattern 등록 시 "industry 다수파 ≠ industry best" 분리 표기 의무

---

## 5. 본 research 가 plan 에 반영하는 변경 사항

### 5.1 plan §2 BR 5건 → 6건 (Senior ⚠️ 의사결정 3 반영)

**추가**: `BR-USER-LOGIN-VERIFY-001` decision-table 1건 (★ JWT 발급 흐름 cross-platform 핵심 데이터).

→ BR 형식화 = **6건** (PoC #02 = 5건 / PoC #03 = +1 확장).

### 5.2 plan §2 AR Article FSM 방향 (Senior 의사결정 2 반영)

**Article state-machine = counter aggregate 측면 집중** (CRUD transition 보다 favoriteCount/commentCount invariant 표현 비중 ↑).

### 5.3 plan §6 신뢰도 평가 (Senior ❌ 의사결정 5 반영)

기존: 80-87% (시뮬 -5 / 진짜 static -5 / 사용자 검증 미완 -3)
**변경**: **70-77%** (위 + critical finding 1건당 -3%p 추가 / AP-AUTH-NEST-001 + AP-DB-001 = -6%p 추가)

→ Sprint 5 진짜 실행으로 +10%p 회복 계획 명시.

### 5.4 plan §6 invariants.ts 패턴 (OSS Sairyss 권위 반영)

**`static create()` + throw 기반 + Guard.* 헬퍼 + 도메인 에러 클래스 분리** = industry mainline 정합. PoC #03 의 anemic + Service validate 는 **명세는 코드 충실도, antipattern 은 industry best** 두 축 분리.

### 5.5 plan §6 race-prone 처리 권고 (OSS TypeORM 정설 반영)

`migration-advice` = **DB UQ 단독 + `catch QueryFailedError → ConflictException`** (Sairyss + TypeORM 정설). App pre-check + DB UQ 2중 (PoC #02 패턴) 도 industry 정설 대비 비효율 → **재평가 후보**.

---

## 6. 사용자 일괄 승인 묶음 (3원칙 — 5~6 핵심 결정)

| # | 결정 | 옵션 | 권고 |
|---|---|---|---|
| **D1** | BR 형식화 5 vs 6 | (a) 5건 — plan 원안 / (b) **6건 — UC-USER-LOGIN 추가 (Senior 권고)** | **(b) 권고** — JWT 발급 흐름 cross-platform 핵심 데이터 |
| **D2** | AR state-machine 3개 (User/Follows/Article) Article FSM 방향 | (a) CRUD transition 중심 / (b) **counter aggregate 집중 (Senior 권고)** | **(b) 권고** — favoriteCount/commentCount invariant 표현 비중 ↑ |
| **D3** | UC sequence 5 vs 6 | (a) 5건 (plan 원안) / (b) UC-USER-LOGIN 추가 6건 / (c) UC-ARTICLE-FAVORITE 교체 5건 | **(b) 권고** — D1 정합 + UC-FAVORITE 도 maintain |
| **D4** | invariants.ts 패턴 | (a) 코드 충실도 (anemic + Service validate) / (b) **`static create()` + throw + Guard.* (Sairyss 권위)** / (c) 양쪽 표기 | **(c) 권고** — 명세 = (a) 코드 충실 / antipattern 권고 = (b) industry best |
| **D5** | 신뢰도 평가 | (a) 80-87% (plan 원안) / (b) **70-77% (Senior 권고 — critical 1건당 -3%p 추가)** | **(b) 권고** — Sprint 5 진짜 실행 +10%p 회복 명시 |
| **D6** | drift-validator 첫 외부 검증 false 측정 우선 | (a) breaking 수만 측정 / (b) **false negative 우선 측정 (Senior 권고)** | **(b) 권고** — Sprint 5 carry-over 시 진짜 static tool 로 확인 |

---

## 7. 다음 단계

3원칙 (사용자 일괄 승인) → 4원칙 (실행) 진입.

승인 후 산출 순서:
1. Phase 4.5 디렉토리 구성 (`output/formal-spec/...`)
2. state-machine 3개 (User / Follows / Article)
3. sequence 6개 (D1+D3 권고 시)
4. decision-table 6개
5. invariants.ts 3개 + property.spec.ts 3개
6. drift-validator + decision-table-validator 자동 실행
7. _manifest.yml + PROGRESS-poc03-phase4.5.md
8. 종결 후 STATUS.md + DEC-2026-04-30-poc03-phase45-종결.md
