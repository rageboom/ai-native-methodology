# plan — PoC #03 Phase 5-1 (api openapi.yaml + extension)

> **일자**: 2026-04-30
> **선행**: Phase 4.5 + 4.5+1 종결 (신뢰도 0.80 / 단계 3)
> **scope**: api 산출물 4종 / NestJS @Controller decorator + DTO 정적 추출

---

## 1. 자산 (전수 read 완료 ✅)

### 1.1 입력
- `source/nestjs-realworld-tmp/src/{user,article,profile,tag,app}.controller.ts` (HEAD `c1c2cc4`)
- `src/main.ts` — Swagger DocumentBuilder + setGlobalPrefix('api') + addBearerAuth()
- `src/{user,article}/dto/*.dto.ts`
- Phase 1-4 + 4.5 산출물 (cross-link 의무)

### 1.2 endpoint 정량 (정적 추출)

| Controller | base | endpoint 수 |
|---|---|---|
| UserController | `/api` (★ @Controller() 빈 prefix) | 5 (findMe, update, create, delete, login) |
| ArticleController | `/api/articles` | 11 (findAll, getFeed, findOne, findComments, create, update, delete, createComment, deleteComment, favorite, unFavorite) |
| ProfileController | `/api/profiles` | 3 (getProfile, follow, unFollow) |
| TagController | `/api/tags` | 1 (findAll) |
| AppController | `/api` | 1 (root — Hello World) |
| **합계** | — | **21** |

### 1.3 ground truth 출처 정직 표기

- ★ DEC-PoC03-N5 정합 — `@nestjs/swagger` 자동 생성 spec **본 환경 nest start 불가** → **정적 추출 (controller decorator + DTO + interface)** 만 본 세션 가능
- 런타임 dump 2-way diff = **carry-over (사용자 환경 변동 시)**
- 정적 추출 신뢰도 = ~0.90 (PoC #02 ground truth 1.00 대비 -10p)

---

## 2. 산출 4종

| 파일 | 목적 | 형식 |
|---|---|---|
| `openapi.yaml` | spec 자체 (AI/사람 양쪽) | OpenAPI 3.0.1 / 21 op / paths × methods 매핑 |
| `api-extension.json` | AI 메타 (composes_uc / breaks_br / anti_pattern_refs / x-related-findings) | schemas/openapi-extension.schema.json 정합 |
| `api.md` | 사람 눈 요약 (heatmap + RFC 위반 인덱스 + 권고) | api.template.md 정합 |
| `_manifest.yml` | Phase 5-1 매니페스트 | api.template.yaml 정합 |

---

## 3. 핵심 발견 (사전 정리)

### 3.1 ★ 즉시 등록 finding 후보 (F-157+)

| ID | severity | 핵심 |
|---|---|---|
| **F-157** | medium | `@Controller()` 빈 prefix (UserController) — controller path inconsistency (다른 controller 는 `@Controller('articles')` 등) |
| **F-158** | high | ★ ApiResponse status drift — Article controller 의 `@ApiResponse({status: 201, description: '...deleted'})` 가 RFC 9110 §15.3.5 위반 + NestJS default DELETE 200 와 spec drift 동시 (PoC #02 F-085 isomorphic ★) |
| **F-159** | medium | API versioning 부재 — `app.setGlobalPrefix('api')` 단일 / no /v1 (PoC #02 F-082 isomorphic ★) |
| **F-160** | medium | PUT /user, PUT /articles/:slug 부분 갱신 — RFC 5789 PATCH 권고 (PoC #02 F-086 isomorphic ★) |
| **F-161** | low | `addBearerAuth()` 표준 준수 ✅ (★ F-084 비재현 = 학습 효과) — finding 이 아닌 positive 메타 등재 |
| **F-162** | high | DTO validation 빈약 — UpdateUserDto/CreateArticleDto/CreateCommentDto 0 validator (★ F-128 합산 OWASP API1) |
| **F-163** | medium | TagController `@ApiBearerAuth()` 부재 시그널 인지 불일치 — ApiBearerAuth 적용 / 그러나 tag findAll 은 auth scope 불요 (정합성 X) |

### 3.2 PoC #02 ↔ PoC #03 cross-validation (★ §8.1 정합)

| PoC #02 finding | PoC #03 결과 |
|---|---|
| F-070 critical (favorite RFC 7231 §4.2.2 idempotency) | **★ 재현** — POST + DELETE /:slug/favorite 동일 패턴 (그러나 ApiResponse 데코는 둘 다 201) |
| F-082 (API versioning 부재) | ★ 재현 → F-159 |
| F-083 (DELETE 200 vs 204) | ★ 재현 → F-158 묶음 |
| F-084 (Token apiKey 비표준) | **★ 비재현 (학습 효과)** — Bearer 표준 ✅ → F-161 positive |
| F-085 (POST status drift) | ★ 재현 (변형) → F-158 묶음 |
| F-086 (PUT vs PATCH) | ★ 재현 → F-160 |
| F-087 (307 internal redirect) | ❌ 비재현 — NestJS 가 redirect 못 함 (학습 효과 / Spring 특이) |

### 3.3 Phase 6 AP candidate preview (NestJS 종합)

| AP 후보 | severity | composite | 근거 |
|---|---|---|---|
| AP-AUTH-NEST-001 | critical | F-140 + F-118 + F-119 + F-150 (cumul) | NestJS Passport 미사용 + DELETE auth 부재 |
| AP-API-001 (NestJS 변형) | high | F-158 + F-070 형 (favorite) | ApiResponse 데코 status drift |
| AP-API-002 | medium | F-159 | API versioning 부재 |
| AP-API-003 | medium | F-160 | PUT vs PATCH |
| AP-API-004 | medium | F-162 | DTO validation 빈약 (OWASP API1) |
| AP-VALIDATION-001 (cumul) | high | F-128/127/143/144 + F-162 | class-validator 12% coverage |

→ Phase 6 = 8 후보 (직전 세션 식별) + Phase 5-1 신규 4 = **약 12 AP 후보** (Phase 6 격상 데이터).

---

## 4. 절차 (Auto Mode 직진)

| Step | 작업 | 시간 |
|---|---|---|
| A | openapi.yaml 작성 (정적 추출 + 21 op + components) | ~45분 |
| B | api-extension.json (Phase 4.5 cross-link 의무) | ~25분 |
| C | api.md (heatmap + 권고) | ~15분 |
| D | _manifest.yml + finding 등록 (F-157~F-163) | ~10분 |
| E | DEC + STATUS + commit | ~10분 |

총 ~1h45m.

---

## 5. 위험

| # | 위험 | 대응 |
|---|---|---|
| R-1 | 정적 추출 누락 (NestJS Swagger 가 자동 생성하는 추가 메타) | ground truth 캐비엇 명시 + 신뢰도 -10p |
| R-2 | DTO 가 interface 가 아닌 class — JSON Schema 매핑 시 타입 추정 | TypeScript readonly 키워드 read-only 매핑 |
| R-3 | @User decorator 통한 implicit auth 가 controller decorator 부재 | F-140 cumul + F-157 명시 의무 |
| R-4 | App.module / shared/base.controller 영향 분석 | base.controller = 빈 file (확인 후 무시) |

---

## 6. 종료 조건

- [ ] openapi.yaml 21 op + Bearer 표준 + components.schemas (DTO 7-9개)
- [ ] api-extension.json 21 op × Phase 4.5 cross-link 완성
- [ ] api.md heatmap + RFC 위반 인덱스
- [ ] _manifest.yml (신뢰도 0.80~0.85 산식)
- [ ] 신규 finding F-157~F-163 등록
- [ ] DEC + STATUS 갱신
- [ ] git commit

---

## 7. 신뢰도 산식 (예상)

```yaml
base: 0.75
modifiers:
  orm_full: +0.10                       # TypeORM 0.2 (G6 신규)
  domain_context_md: +0.03
  openapi_static_extraction: +0.04      # ★ runtime ground truth 부재 → -3 (PoC #02 +0.07 → +0.04)
  diagrams_other: +0.02                 # Phase 4.5 다이어그램 보강 후
  no_operational_db: -0.03
subtotal: 0.91
cross_validation_modifiers:
  poc02_isomorphic_consensus: +0.02     # F-082/083/086 재현 + F-084 비재현 = 학습 효과
  static_only_caveat: -0.03             # ★ 런타임 ground truth 부재
raw_confidence: 0.90
```

→ **0.90 예상** (PoC #02 0.93 대비 -3p — 정적 추출만 가능).

---

## 8. 일괄 승인 묶음 (K1~K6)

| # | 결정 | 권고 | 대안 |
|---|---|---|---|
| K1 | research.md 생략 (가벼운 sub-agent 전략) | ✅ 본 단계 = 결정적 추출 + cross-link / 새 설계 ❌ | 3 sub-agent 병렬 추가 (~10분) |
| K2 | Ground truth 출처 = 정적 추출만 (런타임 dump carry-over) | ✅ 신뢰도 -3p 정직 표기 | nest start 시도 (환경 부재 → 시뮬 ❌ 위반) |
| K3 | finding 등록 — F-157~F-163 7건 (직전 식별) | ✅ Phase 5-1 산출 시점 등록 | Phase 6 까지 보류 |
| K4 | Phase 6 AP candidate preview — 4 신규 + 8 직전 = 12 | ✅ manifest 표기 | 5-1 단계 미식별 |
| K5 | DEC 단일 (Phase 5-1 종결) | ✅ `DEC-2026-04-30-poc03-phase51-종결.md` | Phase 6 통합 후 1건 |
| K6 | F-161 (Bearer 표준 ✅) = positive finding 등록 | ✅ ★ PoC #02 학습 효과 입증 데이터 | 일반 finding 형식만 |

---

## Lessons Learned (작업 종결 시)

(추가)

**End of plan.**
