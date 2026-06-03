# Circular Dependencies — PoC #03 NestJS

> Phase 3 분석 결과: **CIRCULAR 0건** ✅
>
> 단 Senior 위험 5 정합 — NestJS Module = DI 경계. circular 검증의 의미가 PoC #02 (multi-module Hexagonal) 와 본질적 차이.

---

## 1. 결과 요약

| 분류                    | 건수  | 비고                                                                                                            |
| ----------------------- | ----- | --------------------------------------------------------------------------------------------------------------- |
| Module 간 circular DI   | **0** | imports 단방향 — APP → 4 sub / sub → User                                                                       |
| File 간 circular import | **0** | TypeScript circular import 없음                                                                                 |
| Entity 간 양방향 관계   | 1     | UserEntity ↔ ArticleEntity (favorites ManyToMany + articles OneToMany) — TypeORM 의 의도된 양방향 / circular ❌ |

---

## 2. 의존성 트리 (단방향 검증)

```
ApplicationModule (root)
├── UserModule (exports UserService)
├── ArticleModule (imports UserModule)
├── ProfileModule (imports UserModule)
└── TagModule (imports UserModule formal only)

UserModule
└── (no module imports — 가장 하위)

UserModule ← ArticleModule
UserModule ← ProfileModule
UserModule ← TagModule
```

→ UserModule = sink. 다른 모듈이 UserModule 을 import 하지만 역은 없음. **DAG (Directed Acyclic Graph) ✅**.

---

## 3. PoC #02 CIRCULAR-001 cross-validation

| 차원                 | PoC #02 (Spring Boot multi-module)          | PoC #03 (NestJS 단일 module tree)                    | 분류                      |
| -------------------- | ------------------------------------------- | ---------------------------------------------------- | ------------------------- |
| circular 분류기 적용 | LV-001 / CIRCULAR-001 검증                  | NestJS @Module = DI 경계 — **분류기 학습 효과 X**    | 비재현 (본질)             |
| 검증 결과            | 0건                                         | 0건                                                  | 동일 결과 / 다른 메커니즘 |
| 의미                 | "Hexagonal port-adapter circular 회피 입증" | "NestJS module tree 본질적 단방향 — circular 어려움" | F-066 cross-val           |

→ **F-066 (PoC #02 positive — Service 간 직접 의존 0) cross-validation 비재현** — 본 PoC = 본질적으로 다른 메커니즘. 단방향 module tree 가 NestJS 표준 패턴.

---

## 4. 잠재적 의존 분석 (circular 아님 / 도메인 경계 약함)

### 4.1 Cross-module entity 사용

| 모듈          | 다른 도메인 entity 사용   | 메커니즘                 |
| ------------- | ------------------------- | ------------------------ |
| ArticleModule | UserEntity, FollowsEntity | TypeOrmModule.forFeature |
| ProfileModule | UserEntity                | TypeOrmModule.forFeature |

→ circular ❌ (UserModule 은 다른 모듈 entity 사용 안 함). 단 **도메인 경계 약함** — F-137 신규 medium 후보 (Phase 6 격상 평가).

### 4.2 UserEntity ↔ ArticleEntity 양방향 (TypeORM 의도)

```typescript
// User.entity.ts
@OneToMany(() => ArticleEntity, article => article.author)
articles: ArticleEntity[];

@ManyToMany(() => ArticleEntity)
@JoinTable()
favorites: ArticleEntity[];

// Article.entity.ts
@ManyToOne(() => UserEntity, user => user.articles)
author: UserEntity;
```

→ 양방향 관계 = ORM 표준 패턴. circular 아님.

---

## 5. 본 PoC 의 circular 회피 본질

PoC #03 가 circular 0건 인 이유:

1. **NestJS Module tree 단일** — APP → 4 sub. 트리 본질
2. **UserModule sink 패턴** — 모든 sub 가 UserModule 사용 (auth 의무) / UserModule 은 다른 sub 사용 안 함
3. **Service 간 직접 의존 부재** — Service 는 자체 module 의 Repository 만 사용. 다른 Service 호출 ❌
4. **Event-driven / message-bus 부재** — 단순 동기 호출만

→ 본 PoC 가 **F-066 (PoC #02) cross-val 재현** — "Service 간 직접 의존 0 = circular 회피" 패턴 정합. ** 단 분류 메커니즘은 다름** — PoC #02 = Hexagonal port-adapter 보장 / PoC #03 = NestJS module tree 본질.

---

## 6. 본 phase finding 후보

| finding                    | severity   | 설명                                                                                                                                                              |
| -------------------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **F-137 신규 medium 후보** | medium     | 도메인 경계 약함 — ArticleModule 가 UserEntity/FollowsEntity 직접 사용 (TypeOrmModule.forFeature). PoC #02 multi-module Hexagonal 의 명시적 port-adapter 와 차이. |
| **F-138 신규 low 후보**    | low        | FollowsEntity 가 profile/ 디렉토리 — semantic 으로는 user 관계 (위치 모호)                                                                                        |
| F-066 cross-val            | (positive) | Service 간 직접 의존 0 — 재현 (다른 메커니즘으로)                                                                                                                 |

---

## 7. 결론

✅ **CIRCULAR 0건** + **LV 0건** ( Senior 위험 5 정합 — NestJS Module 분류기 적용 ❌)

- Phase 3 cap 0.85 검증 ✅
- Phase 4 진입 — 3 BC + 4 Aggregate Root 후보
- Phase 6 합산 시 F-066 (positive) cross-val 메타 finding
