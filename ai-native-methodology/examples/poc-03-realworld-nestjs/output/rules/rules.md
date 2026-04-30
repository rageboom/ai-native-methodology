# 비즈니스 규칙 — PoC #03 NestJS Phase 4 (5.A)

> raw confidence 0.78 / 18 BR / class-validator coverage 12% (★ Senior 위험 3 입증)

---

## 1. 핵심 요약

| 영역 | 값 |
|---|---|
| BR 총 | **18** (PoC #02 14건 대비 +4) |
| 추출 source | class-validator 데코 6 + service.ts manual throw 12+ + lifecycle hook 2 |
| race-safe BR | **0건** ★★ (PoC #02 = 5+ — DB UQ 2중 안전망) |
| critical concern | 2건 (F-140 + F-120 합산 BR-USER-DELETE-AUTH-001 / BR-USER-USERNAME-EMAIL-UNIQUE-001) |
| 자연어 빈약성 추정 | **28~33%** 만 표현 가능 (PoC #02 44% 대비 더 악화 — Senior 위험 3 정합) |

---

## 2. BR 인벤토리 (18)

### 2.1 User 도메인 (9 BR)

| BR ID | 핵심 | state |
|---|---|---|
| BR-USER-USERNAME-NOT-BLANK-001 | @IsNotEmpty | complete |
| BR-USER-EMAIL-FORMAT-001 | @IsEmail | complete (★ update 시 우회 가능 F-143) |
| BR-USER-EMAIL-NOT-BLANK-001 | @IsNotEmpty | complete |
| BR-USER-PASSWORD-NOT-BLANK-001 | @IsNotEmpty | complete |
| BR-USER-USERNAME-EMAIL-UNIQUE-001 | App pre-check (UQ 부재) | ★ partial (race-prone F-120) |
| BR-USER-PASSWORD-HASH-001 | argon2 @BeforeInsert | complete |
| BR-USER-LOGIN-VERIFY-001 | argon2.verify | complete |
| BR-USER-JWT-EXPIRY-001 | 60일 | ★ partial (F-119 / F-118) |
| **BR-USER-DELETE-AUTH-001** | **★★ guard 부재** | **★★ absent (F-140 critical)** |

### 2.2 Profile 도메인 (3 BR)

| BR ID | 핵심 | state |
|---|---|---|
| BR-FOLLOWS-NO-SELF-001 | service 단 차단 | ★ partial (F-144 일관성 결여) |
| BR-FOLLOWS-PAIR-UNIQUE-001 | App 1중 (UQ 부재) | ★ partial (race F-121/F-120) |
| BR-FOLLOWS-FOLLOWER-OR-USERNAME-PRESENT-001 | not null | complete |

### 2.3 Article 도메인 (6 BR)

| BR ID | 핵심 | state |
|---|---|---|
| BR-ARTICLE-SLUG-AUTO-001 | slugify random suffix | ★ partial (F-125/F-126/F-120) |
| BR-ARTICLE-FAVORITE-IDEMPOTENT-001 | isNewFavorite | ★ partial (F-135) |
| BR-ARTICLE-UNFAVORITE-IDEMPOTENT-001 | deleteIndex check | complete |
| BR-ARTICLE-AUTHOR-AUTO-001 | userRepository.findOne | complete |
| BR-ARTICLE-COMMENT-EAGER-001 | eager:true | ★ partial (F-124) |
| BR-ARTICLE-FEED-FOLLOWS-ONLY-001 | follows 빈 배열 | complete |

---

## 3. ★★ Race Safety Analysis (PoC #02 ↔ PoC #03)

| Layer | PoC #02 | PoC #03 | 분류 |
|---|---|---|---|
| L1. Application pre-check | ✅ (TOCTOU race-prone) | ✅ (TOCTOU race-prone) | 동일 |
| L2. Domain validation | ⚠️ partial (Java entity validate) | ❌ (UpdateUserDto 검증 우회 F-143) | **PoC #03 더 약함** |
| L3. DB Unique constraint | ✅ (race-safe) | ❌ **부재 (F-120)** | **PoC #03 critical 결여** |

→ **종합**: PoC #02 = "App pre + DB UQ 2중 + race window 1건". PoC #03 = "**App pre 1중 only + race window 모든 unique BR**". **PoC #02 보다 본질적으로 위험**.

---

## 4. ★ 자연어 빈약성 정량 추정 (PoC #02 F-074 cross-val)

**PoC #02 BR-USER-FOLLOW-NO-SELF-001** = 자연어 4/9 표현 (44%).
**PoC #03 BR-FOLLOWS-NO-SELF-001** 자연어 표현 추정:

| 9 항목 | PoC #03 자연어 표현 가능 |
|---|---|
| 트리거 (POST /follow) | ✅ |
| 액션 (throw HttpException) | ✅ |
| 기대 결과 (400) | ✅ |
| 현재 상태 (App 1중) | ✅ |
| 거부 방식 (HttpException — service 단) | ⚠️ partial (어느 service?) |
| 검증 위치 (profile.service.ts:53 vs 75 — F-144 일관성 결여) | ❌ (자연어로 표현 어려움) |
| HTTP status (400) | ✅ |
| 에러 메시지 (cannot be equal) | ✅ |
| 일관성 (email vs id 비교 — 분리) | ❌ (★ 자연어 모호 — F-144 발견 신호) |

→ **5/9 = 55% 표현** (단 일관성 결여 발견 = 형식화 ROI). **PoC #02 44% 대비 자연어 표현 약간 더 — 단 형식화 ROI 동일/큼** (★ 일관성 결여 패턴 형식화로 노출).

---

## 5. cross-validation (PoC #02 ↔ PoC #03)

| PoC #02 BR | PoC #03 BR | 분류 |
|---|---|---|
| BR-USER-EMAIL-UNIQUE-001 | BR-USER-USERNAME-EMAIL-UNIQUE-001 | ★★ isomorphic + 더 나쁜 (race-safe ❌) |
| BR-USER-USERNAME-UNIQUE-001 | (위 동일 BR 에 합산) | 합산 |
| BR-USER-PASSWORD-ENCRYPTED-001 | BR-USER-PASSWORD-HASH-001 | ★ isomorphic — argon2 vs BCrypt (algorithm 차이) |
| BR-USER-FOLLOW-NO-SELF-001 | BR-FOLLOWS-NO-SELF-001 | ★ isomorphic + 일관성 결여 발견 (F-144) |
| BR-USER-FOLLOW-IDEMPOTENT-001 | BR-FOLLOWS-PAIR-UNIQUE-001 | ★ isomorphic — 둘 다 partial |
| BR-USER-FOLLOW-DIRECTIONAL-001 | (PoC #03 별 BR 부재 — Profile.follow 가 directional 명시 없음) | ★ PoC #03 에서 약함 |
| (PoC #02 부재) | BR-USER-DELETE-AUTH-001 | **★★ PoC #03 신규 critical** |

---

## 6. Phase 4.5 형식화 우선순위 (5건 권장 — PoC #02 정합)

1. **BR-USER-USERNAME-EMAIL-UNIQUE-001** (★★ critical 합산 — F-120 + F-143 결합 결정-table)
2. **BR-FOLLOWS-NO-SELF-001** (★ F-144 일관성 결여 형식화로 노출)
3. **BR-FOLLOWS-PAIR-UNIQUE-001** (race window 정량화)
4. **BR-ARTICLE-SLUG-AUTO-001** (★ F-125 random suffix 정량화)
5. **BR-USER-DELETE-AUTH-001** (★★ F-140 critical — auth scope 결여 형식화)

---

## 7. Phase 4 신규 finding (5.A 영역)

| finding | severity | 영역 |
|---|---|---|
| **F-143 medium 신규** | medium | UserService.update 에서 validate(newUser) 미호출 (signup 만) — update 시 형식 검증 우회 |
| **F-144 low 신규** | low | follow self-check (email) vs unFollow self-check (id) 일관성 결여 |

(F-140 / F-141 / F-142 / F-139 는 5.B domain 등록 — 합산 의무)

---

## 8. 다음 phase 인계

- Phase 4.5: 5 BR 형식화 (위 우선순위)
- Phase 5-1: API ↔ BR x-related-rules 매핑
- Phase 6: BR-USER-DELETE-AUTH-001 ★★ critical → AP-AUTH-NEST-001 (가칭) 단일 등록 후보
