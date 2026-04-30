# 아키텍처 보고서 — PoC #03 NestJS Phase 3

> **사람 눈** 산출물 (이중 렌더링 정합 — `architecture.json` + `architecture.mermaid` + `dependency-graph.mermaid` 의 짝).
> 일자: 2026-04-30 / raw confidence 0.85

---

## 1. 핵심 요약

- **모듈 시스템**: NestJS Module tree (5 module + shared 디렉토리)
- **architecture style**: Modular Monolith (NestJS Module-based) — 0.85
  - PoC #02 multi-module Hexagonal hybrid 0.65 cap 대비 **분류 단순**
- **circular 의존**: 0건 ✅
- **layer violation**: 0건 (★ NestJS Module = DI 경계 — 분류기 적용 X)
- **Phase 1 cap 0.85 → Phase 3 0.85**: 격상 0 (정합 — Δ +0.00)

### ★ PoC #02 와 본질적 차이

| 차원 | PoC #02 | PoC #03 |
|---|---|---|
| 모듈 시스템 | Gradle multi-module 8 + Hexagonal hybrid | npm 단일 + NestJS Module tree |
| port-adapter 분류 | 가능 (디렉토리 convention) | ❌ (Senior 위험 5) |
| LV-001 / CIRCULAR-001 | 0건 (Hexagonal 회피 입증) | 0건 (단방향 tree 본질) — 재현하나 메커니즘 다름 |
| 도메인 경계 강도 | 강함 (port-adapter 명시) | 약함 (cross-module entity 사용 — F-137) |

---

## 2. 5 모듈 분석

### 2.1 ApplicationModule (root)

- 역할: DI root + bootstrap entry + AppController 의 'Hello World!' 잔재 (★ minor)
- imports: TypeOrmModule.forRoot() + 4 sub-module
- 책임: 단순 root — 비즈니스 로직 0

### 2.2 UserModule (BC-USER) ★ sink

- 역할: User CRUD + signup/login + JWT generation + AuthMiddleware 정의
- exports: UserService (4 sub-module 모두 import)
- entity: UserEntity
- ★ sink 패턴 — 다른 module 이 import 하지만 역은 없음 → DAG 보장
- ★ AuthMiddleware 가 UserModule 에 있지만 모든 module 이 사용 — 책임 위치 문제 (★ Phase 6 격상 후보)

### 2.3 ArticleModule (BC-CONTENT)

- 역할: Article CRUD + comments + favorites
- entity: ArticleEntity, Comment + ★ UserEntity, FollowsEntity (cross-module forFeature)
- imports: UserModule
- middleware: AuthMiddleware applied to 8 routes
- ★ **F-137 신규** — UserEntity, FollowsEntity 직접 InjectRepository → 도메인 경계 약함
- ArticleService 204 line — 가장 복잡

### 2.4 ProfileModule (BC-PROFILE)

- 역할: Profile + follow/unfollow
- entity: FollowsEntity + ★ UserEntity (cross-module)
- imports: UserModule
- ★ **F-138 신규** — FollowsEntity 가 profile/ 디렉토리 / semantic 으로는 user 관계

### 2.5 TagModule (★ F-122 dead code 의문)

- 역할: Tag list — TagService.findAll() 만
- entity: TagEntity (insert 코드 부재)
- imports: UserModule (★ 형식적 — TagService 미사용)
- 결론: ★ Phase 6 후보 — dead code 또는 미완성 기능

### 2.6 shared/ (★ Module 미등록)

- 단순 디렉토리 — `@Module()` 등록 부재
- ValidationPipe + BaseController
- ★ BaseController dead code 가능성 (사용처 grep 부재)
- ★ NestJS 표준은 SharedModule 등록

---

## 3. Bounded Context 후보 (Phase 4 입력)

| BC | 모듈 | 테이블 | Aggregate 후보 |
|---|---|---|---|
| BC-USER | MOD-USER | user | User |
| BC-CONTENT | MOD-ARTICLE, MOD-TAG | article, comment, tag, user_entity_favorites_article_entity | Article, Comment (sub), Tag (★ dead?) |
| BC-PROFILE | MOD-PROFILE | follows | Follows (★ semantic 모호) |

---

## 4. Phase 1 cap 0.85 검증 (Δ +0.00)

| 단계 | cap | 비고 |
|---|---|---|
| Phase 1 (init) | 0.85 (추정) | 단일 NestJS module tree → 분류 단순 |
| Phase 3 (arch) | 0.85 (확정) | LV/CIRCULAR 0건 + 5 module 인식 정확 |
| Δ | **+0.00** | ★ 정합 (PoC #02 = Δ +0.20 격상과 다른 패턴 — 본 PoC = 추정 즉시 일치) |

---

## 5. cross-validation 시그널 (Phase 6 합산 후보)

| 패턴 | PoC #02 | PoC #03 | 분류 |
|---|---|---|---|
| AP-ARCH-001 (LV) | 비재현 | 비재현 | 양 PoC 비재현 = 본질적 회피 (positive) |
| CIRCULAR-001 | 비재현 | 비재현 | 상동 |
| port-adapter 가이드 (J) | F-075 | ❌ NestJS 단일 module = port-adapter 분류 X | **비재현 (stack 의존)** |
| multi-module Outside-in (K) | F-064/065/066 positive | ❌ 단일 module = 비교 불가 | **비재현 (stack 의존)** |
| Service 간 직접 의존 0 (F-066 positive) | 재현 | 재현 (다른 메커니즘) | ★ 재현 — DAG 본질 |
| 도메인 경계 약함 | 강함 (Hexagonal) | 약함 (cross-module entity) | **PoC #03 신규 발견** (F-137) |

---

## 6. Phase 3 finding (신규 2건)

| finding | severity | 설명 |
|---|---|---|
| **F-137** | medium | ArticleModule + ProfileModule 가 다른 도메인 entity 직접 InjectRepository — 도메인 경계 약함 |
| **F-138** | low | FollowsEntity 위치 모호 — profile/ 디렉토리 / semantic = user 관계 |

→ Phase 1 18 signals + Phase 2 6 finding + Phase 3 2 신규 = **누적 23건** (F-118~F-138).

---

## 7. 다음 phase 인계 (Phase 4)

- 3 BC + 4 Aggregate 후보 (User / Article / Comment / Follows)
- Tag = ★ dead 의문 (F-122)
- 외부 의존성 0건 (RealWorld 한계 — PoC #02 와 동일)
- ★ 도메인 경계 약함 (F-137) — Phase 4 도메인 모델 분석 시 합산
- ★ FollowsEntity 위치 (F-138) — Phase 4 의미 결정
- BR 추출 source: class-validator 데코 (DTO + entity 양쪽) + service.ts manual throw (★ Senior 위험 3 정합)

---

## 8. 본 산출물 자체 메타

```yaml
phase: 3
deliverable: architecture.md (사람 눈) + architecture.json (AI 눈) + architecture.mermaid + dependency-graph.mermaid + circular-dependencies.md
raw_confidence: 0.85
phase_1_cap: 0.85
delta: +0.00
trust_level:
  current: 0.85
  current_step: 1
  next_validation: "Phase 4 도메인 의미 검증 + Phase 6 cross-val 합산"
honesty_disclosures:
  - "★ NestJS Module = DI 경계 분류 — port-adapter ❌ (Senior 위험 5 정합)"
  - "★ Service 간 직접 의존 0 cross-val 재현 — 메커니즘 본질적 차이 (PoC #02 = Hexagonal / PoC #03 = NestJS tree)"
```
