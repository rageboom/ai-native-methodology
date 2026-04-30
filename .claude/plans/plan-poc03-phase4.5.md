# Plan — PoC #03 NestJS Phase 4.5 형식 명세 + drift-validator 첫 외부 검증

> 작업 단위: 시퀀스 B (PoC #03 NestJS) Phase 4.5+
> 4원칙 1단계 (깊은 숙지) 산출. research.md → 사용자 승인 → 코드 착수 순.
> 작성: 2026-04-30

---

## 0. 본 plan 의 본질

**PoC #02 Sprint 2 (Java/Spring) 와 동일 절차를 TypeScript/NestJS 컨텍스트에 적용 → 언어 무관성 입증 + drift-validator 첫 외부 검증**.

핵심 검증 가설 3개:

1. **drift-validator 언어 무관성** — Sprint 4 까지는 PoC #02 (Java/Spring) 자가 검증만. NestJS/TypeScript stateDiagram + sequenceDiagram 도 동일하게 동작하는가?
2. **자연어 빈약성 44% 재현** — F-074 패턴이 stack 무관하게 성립하는가? (PoC #02 검증 = Java) → PoC #03 = TypeScript class-validator 분포 12% coverage 환경
3. **transitionFuzzyMatch 한계 (F-117) 재발 여부** — Sprint 4 누적 finding 의 재현/완화 여부 측정

---

## 1. 입력 자산 (Phase 4 종결 산출)

### 1.1 BR 18건 (`output/rules/rules.json`) 분포

| 상태 | 건수 | 우선순위 |
|---|---|---|
| complete | 9 | (형식화 ROI 낮음) |
| partial | 8 | ★★ 형식화 1순위 (자연어 빈약 입증 영역) |
| absent | 1 | ★★ critical (BR-USER-DELETE-AUTH-001 / F-140) |

### 1.2 Aggregate Root 5개 (`output/domain/domain.json`)

| AR | BC | 형식화 가치 | 비고 |
|---|---|---|---|
| **User** | BC-USER | ★★★ | auth + JWT + race-prone signup (F-120) |
| **Follows** | BC-PROFILE | ★★ | self-check 일관성 결여 (F-144) + FK 부재 (F-121) |
| **Article** | BC-CONTENT | ★★ | slug UQ 부재 + favoriteCount race (F-135) + slug update 미구현 (F-126) |
| Comment | BC-CONTENT | ★ | sub-aggregate of Article |
| Tag | BC-CONTENT | ☆ | dead 의문 (F-122) — 형식화 보류 |

### 1.3 critical AP candidate 2건 (Phase 6 합산 후보)

- **AP-DB-001-poc03** — DB UQ + FK 부재 composite (F-120 / F-121 / F-133 / F-135) — **★★ PoC #02 AP-DOMAIN-002 isomorphic + 더 나쁜 (1중 vs 2중)**
- **AP-AUTH-NEST-001-poc03** — Auth scope 결여 + JWT verify 무방어 + 60일 expiry composite (F-140 / F-118 / F-119)

---

## 2. 형식화 대상 BR 5건 + AR 3개 + UC 5개 (PoC #02 Sprint 2 = 5건 매칭)

### 2.1 BR 5건 (★★ critical / partial 우선)

| # | BR id | 우선 이유 | 자연어 빈약 영역 | finding 후보 |
|---|---|---|---|---|
| 1 | BR-USER-USERNAME-EMAIL-UNIQUE-001 | ★★ critical (F-120) — App 1중 race-prone / DB UQ 부재 | 거부 방식 (HttpException 400 vs 409) / 검증 위치 (Service-only / DB UQ 부재) / race window | F-120 + F-145 신규 (DB UQ + 409 격상) |
| 2 | BR-USER-DELETE-AUTH-001 | ★★ critical (F-140) — AuthMiddleware 적용 누락 / 누구나 삭제 가능 | guard 자체 부재 / id vs email 기반 / role check 부재 | F-140 + F-146 신규 (소유권 검증) |
| 3 | BR-FOLLOWS-NO-SELF-001 | ★ partial (F-144) — follow=email / unFollow=id 비교 일관성 결여 | 검증 차원 일관성 / 거부 방식 (HttpException) / Domain 검증 부재 | F-144 + F-147 신규 (Domain invariant) |
| 4 | BR-FOLLOWS-PAIR-UNIQUE-001 | ★ partial (F-121) — App 1중 idempotent / FK 부재 | 거부 방식 (silent skip vs 409) / DB 차단 부재 / race window | F-121 + F-148 신규 |
| 5 | BR-USER-JWT-EXPIRY-001 | ★ partial (F-118 + F-119) — verify 무방어 + 60일 expiry | 거부 방식 (try/catch 부재) / 토큰 무효화 / refresh 부재 | F-118/F-119 보강 + F-149 신규 |

### 2.2 Aggregate Root state-machine 3개

| # | AR | 상태/전이 | 자연어 빈약 영역 |
|---|---|---|---|
| 1 | **User** | anonymous → registered → authenticated → updated_profile → deleted (★ 권한 없음) | logout 명시 부재 / password change endpoint 부재 / delete actor 가 anonymous |
| 2 | **Follows** | not_following → following / followed_by | self-check 차원 (email vs id) / unfollow silent / unique pair (App 1중) |
| 3 | **Article** | created (slug 생성) → published (즉시) → updated (★ slug 미업데이트) → favorited(N) ↔ unfavorited / deleted | draft 상태 명시 부재 / favoriteCount race / slug regeneration 미구현 |

### 2.3 Use Case sequence 5개

| # | UC id | 핵심 호출 | 빈약 영역 |
|---|---|---|---|
| 1 | UC-USER-SIGNUP | UserController.create → UserService.create → QueryBuilder pre-check → save (@BeforeInsert hash) → generateJWT | race window between pre-check 와 save / DB UQ 부재 |
| 2 | UC-USER-DELETE | UserController.delete (★ guard 부재) → UserService.delete → repository.delete({email}) | actor 가 anonymous / id vs email / 소유권 검증 부재 |
| 3 | UC-PROFILE-FOLLOW | ProfileController → ProfileService.follow → email==email check → repository.save (App 1중) | self-check 차원 / unique pair race |
| 4 | UC-ARTICLE-CREATE | ArticleController → ArticleService.create → slugify(title) + random suffix → save | slug UQ 부재 / random suffix 의도 (F-053 변형) |
| 5 | UC-ARTICLE-FAVORITE | ArticleController → ArticleService.favorite → isNewFavorite check → push + favoriteCount++ | favoriteCount race / App level idempotent / count 단조성 위반 가능 |

### 2.4 invariants + property-test 3건 (AR 3개 매칭)

- `User.ts` — username UQ / email UQ / password hash invariant (argon2)
- `Follows.ts` — follower != following / pair unique
- `Article.ts` — slug 비어있지 않음 / favoriteCount >= 0 / favoriteCount = favorites.length

PoC #02 = `User.ts` + `UserFollow.ts` 2개. PoC #03 = +`Article.ts` (favoriteCount 단조성 검증 = NestJS/TypeORM 특이 영역).

---

## 3. 산출 디렉토리 (이중 렌더링 정합)

```
ai-native-methodology/examples/poc-03-realworld-nestjs/output/formal-spec/
├── state-machines/
│   ├── User.json + .mermaid
│   ├── Follows.json + .mermaid
│   └── Article.json + .mermaid
├── sequence-diagrams/
│   ├── UC-USER-SIGNUP.json + .mermaid
│   ├── UC-USER-DELETE.json + .mermaid
│   ├── UC-PROFILE-FOLLOW.json + .mermaid
│   ├── UC-ARTICLE-CREATE.json + .mermaid
│   └── UC-ARTICLE-FAVORITE.json + .mermaid
├── decision-tables/
│   ├── BR-USER-USERNAME-EMAIL-UNIQUE-001.json + .md
│   ├── BR-USER-DELETE-AUTH-001.json + .md
│   ├── BR-FOLLOWS-NO-SELF-001.json + .md
│   ├── BR-FOLLOWS-PAIR-UNIQUE-001.json + .md
│   └── BR-USER-JWT-EXPIRY-001.json + .md
├── invariants/
│   ├── User.ts
│   ├── Follows.ts
│   └── Article.ts
├── property-tests/
│   ├── User.spec.ts
│   ├── Follows.spec.ts
│   └── Article.spec.ts
└── _manifest.yml
```

총 산출 파일 수 = state-machine 6 + sequence 10 + decision-table 10 + invariants 3 + property 3 + manifest 1 = **33 파일** (PoC #02 = 6+4+12+2+4+1 = 29 파일 + 사후 추가).

---

## 4. drift-validator + decision-table-validator 첫 외부 검증

### 4.1 실행 명령

```bash
# state-machine + sequence drift
node ai-native-methodology/tools/drift-validator/src/cli.js \
  ai-native-methodology/examples/poc-03-realworld-nestjs/output/formal-spec/

# decision-table dmn-check 5종
node ai-native-methodology/tools/decision-table-validator/src/cli.js \
  ai-native-methodology/examples/poc-03-realworld-nestjs/output/formal-spec/decision-tables/
```

### 4.2 예상 시그널

| 검증 도구 | 기대 동작 | 측정 metric |
|---|---|---|
| drift-validator | NestJS 5 sequence + 3 state-machine (총 8쌍) 모두 정합 검증 | breaking 0 (목표) / non-breaking finding 등록 / info 무시 |
| decision-table-validator | 5 decision-table 의 duplicate/conflict/gap/overlap/type 5종 dmn-check | gap finding 등록 (자연어 빈약 자동 검출) |
| **transitionFuzzyMatch (F-117)** | message label fuzzy 50% 임계 한계 재현 여부 | NestJS 한국어/영어 혼용 시그널 → ★ Sprint 5 carry-over 데이터 |

### 4.3 첫 외부 검증의 의미

- Sprint 4 = PoC #02 (Java/Spring) **자가 검증** 만 → **외부 검증 0건**
- PoC #03 = **첫 외부 검증** (TypeScript/NestJS, 단일 module, class-validator 12% coverage)
- 성공 시 **언어 무관성 입증 + v1.2.x → v1.3 격상 첫 데이터**
- 실패 (transitionFuzzyMatch 한계 재발) 시 **F-117 격상 + ADR-010 재정의**

---

## 5. Static Analyzer (★★★ no-simulation 정합)

### 5.1 환경 부재 → 사용자 위임 명시

| 도구 | 환경 | 처리 |
|---|---|---|
| Semgrep p/typescript+p/owasp-top-ten+p/nestjs | 부재 | Sprint 5 carry-over (★★★ no-simulation 정합) |
| typescript-eslint strict | 부재 | Sprint 5 carry-over |
| OSV-Scanner | 부재 | Sprint 5 carry-over |
| type-coverage | 부재 | Sprint 5 carry-over |

### 5.2 _manifest.yml 정직 표기

```yaml
cross_validation:
  validators:
    - id: drift-validator
      real_tool: true
      tool_version: "(검증 시점 기록)"
      ...5종 물증
    - id: decision-table-validator
      real_tool: true
      ...5종 물증
    - id: senior-engineer-sub-agent
      real_tool: false
      simulation_reason: "AI sub-agent — Senior persona drift 검출 / 산출물 정합성. Static tool 시뮬레이션 ❌"
    - id: semgrep-typescript
      real_tool: false
      simulation_reason: "환경 부재 (Sprint 5 carry-over). 시뮬 결과 ❌ — 미실행 정직 표기"
trust_level:
  raw_confidence: 0.78  # (drift+dmn 자동 검증 통과 시) / 시뮬 패널티 -5%p / 진짜 static -5%p / 사용자 검증 미완 -3%p
  honesty_disclosure:
    - "Static tool 미실행 — Sprint 5 환경 부재 carry-over"
    - "drift-validator 첫 외부 검증 — 결과 즉시 메서드론 자산화"
```

---

## 6. 종료 조건 (Phase 4.5 phase-4-5-formal-spec.md §7 정합)

- [ ] 5 산출물 (state-machine 3 + sequence 5 + decision-table 5 + invariants 3 + property-test 3) 작성 완료 (이중 렌더링 정합 100%)
- [ ] drift-validator 자동 실행 — breaking 0 또는 finding 등록 / non-breaking + interpretive drift 모두 finding 등록
- [ ] decision-table-validator 자동 실행 — dmn-check 5종 결과 finding 등록
- [ ] Senior Engineer sub-agent cross-validation (시간 cap 12분 / 가벼운 sub-agent 전략)
- [ ] **★★ 양쪽 발견 (double_hit) finding 우선 등록** — drift-validator + sub-agent 합산 시
- [ ] 진짜 static tool 환경 부재 명시 (시뮬 ❌)
- [ ] _manifest.yml 신뢰도 정직 표기 (시뮬 패널티 -5%p / 진짜 static 미실행 -5%p)
- [ ] lint-no-simulation.sh 통과
- [ ] PROGRESS-poc03-phase4.5.md 시간순 로그

---

## 7. 4원칙 적용 절차

| 단계 | 작업 | 산출 |
|---|---|---|
| **1. 깊은 숙지** | (★ 본 plan) — Phase 4 산출물 + Phase 4.5 명세 + drift-validator/decision-table-validator + PoC #02 사례 모두 read | plan-poc03-phase4.5.md (★ 본 파일) |
| 2. 에이전트 팀 토론 | 가벼운 sub-agent 3 병렬 (공식문서 NestJS 7 / 테크기업 TypeScript class-validator 사례 / Senior NestJS 단일 module Aggregate 위험) — 시간 cap 8분 | research-poc03-phase4.5.md |
| 3. 사용자 승인 | 5~6 핵심 결정 일괄 (1) BR 5건 선정 / (2) AR 3개 / (3) UC 5개 / (4) drift-validator 첫 외부 검증 의미 / (5) Senior sub-agent 시간 cap / (6) Static tool carry-over | 승인 후 진입 |
| 4. 실패 시 Revert | drift-validator 한계 시 plan revert + lessons learned 섹션 추가 + 1원칙 재시작 | (예방) |

---

## 8. 예상 finding (5~10건) — F-117 누적 임계 (5~15 건강) 정합

### 8.1 사전 예측 (drift-validator + dmn-check 자동 검출 기대)

| 후보 | 예상 도구 | severity |
|---|---|---|
| F-145 — DB UQ 부재 → 409 status 격상 | dmn-check (gap) + Senior | medium |
| F-146 — UC-USER-DELETE 소유권 검증 부재 | drift-validator (sequence: guard 부재 명시) + Senior | high |
| F-147 — Follows self-check Domain invariant 부재 | invariants.ts cross-check + Senior | high |
| F-148 — FK 부재 → race window | dmn-check (gap) + Senior | medium |
| F-149 — JWT verify try/catch + refresh 패턴 부재 | sequence drift + Senior | medium |
| F-150 — slug regeneration 미구현 (★ slug update F-126 보강) | Article state-machine drift | low |
| F-151 — favoriteCount 단조성 위반 가능 (App level race) | property-test 명세 | medium |
| F-117 재발 후보 — transitionFuzzyMatch 한국어/영어 혼용 한계 | drift-validator | (메타) |

### 8.2 누적 임계 영향

- 현재 finding 117건 (Sprint 4 종결 시점)
- PoC #03 Phase 4.5 = +5~10 → **총 122~127** (F-021 임계 정합 — 건강 영역 유지)

---

## 9. 위험 + 완화

| 위험 | 영향 | 완화 |
|---|---|---|
| drift-validator NestJS sequence parser 한계 | breaking false positive | 정규식 fallback 검증 (Sprint 4 결정 분기 C) — 기존 mermaid normalizer 그대로 동작 가정 |
| TypeScript invariants ↔ Java jqwik 환경 차이 | property-test 실행 불가 | fast-check (TypeScript native) 사용 / Java 산출 ❌ |
| 한국어 BR id 한글 혼용 | drift-validator 정규화 한계 | 영문 BR id 유지 (PoC #02 패턴 정합) |
| Senior sub-agent Write 권한 | 본문 인라인 후 메인 직접 저장 | feedback_sub_agent_write.md 패턴 그대로 |
| 가벼운 sub-agent 시간 cap 초과 | research 지연 | Case 생략 + 우선순위 read 만 (memory feedback_lightweight_sub_agent.md) |

---

## 10. Lessons Learned (실패 시 추가)

> (선행 plan — 비어있음. 실패 발생 시 본 섹션에 기록 후 1원칙 재시작.)

---

## 11. 다음 단계 (본 plan 승인 후)

1. **research.md 작성** (2원칙 — 가벼운 sub-agent 3 병렬)
2. **사용자 일괄 승인** (3원칙 — 5~6 핵심 결정)
3. **5 산출물 작성 + drift-validator 첫 외부 검증** (실행)
4. PROGRESS-poc03-phase4.5.md 시간순 로그
5. 종결 후 STATUS.md + DEC-2026-04-30-poc03-phase45-종결.md
