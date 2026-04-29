# Research: PoC #01 — Phase 3 (arch, 아키텍처) 통합

> 작성일: 2026-04-28
> 작성자: Claude (윤주스 검토 대기)
> 적용 원칙: Work Principles 2원칙 — 3 에이전트 토론 결과 통합
> 대상 plan: `.claude/plans/plan-phase3.md`
> Phase 명세: `methodology-spec/workflow/phase-3-arch.md`

---

## §0. 통합 개요

3 에이전트 병렬 리서치 + Phase 1/2 의 F-015 (sub-agent cross-validation) 사전 적용.

| 에이전트 | 산출물 | 신뢰도 자평 | F-015 검증 |
|---|---|---|---|
| 공식문서 리서처 | `document-phase3.md` (715 line) | **0.88** | 19건 raw fetch 100% (메인 9 + sub-agent 10) ✅ |
| 테크기업 사례 리서처 | `case-phase3.md` (473 line) | **0.93** | 한국 사례 5건 (목표 250%) ✅ |
| Senior Engineer (BE) | `senior-phase3.md` (416 line) | N/A (실무 일화) | - |

**통합 신뢰도 자평**: **0.91** (Phase 2 의 0.92 와 유사). RealWorld 의존 그래프 19건 검증 + 카카오페이 Hexagonal 제거 회고 강한 매칭으로 아키텍처 판정 확정.

### 0.1 Phase 1 candidate 정정 트레이스 (강한 발견)

| 후보 | Phase 1 | Phase 3 사전 추정 | Phase 3 확정 (3 에이전트 합의) |
|---|---|---|---|
| Hexagonal/Clean (영향) | 0.65 | 0.45 | **0.30** ❌ refuted (카카오페이 회고 + ArchUnit 검증) |
| POJO domain 강조 | 0.85 | 0.70 | **0.50** ⚠️ corrected (우형 Multi Module 명시 기준 미달) |
| Layered + Spring-DDD-Lite | (unrecognized) | 0.75 | **0.85** ✅ verified (5 차원 결정적 검증) |

→ Phase 1 candidate 가 양쪽 모두 하향 정정. **합성 명칭 "Layered + Spring-flavored DDD-Lite"** 채택.

---

## §1. 3 에이전트 합의 사항 (모두 동의)

### 1.1 아키텍처 스타일 = "Layered + Spring-flavored DDD-Lite" (0.85)

세 에이전트 모두 동의. 5 차원 검증:

| # | 차원 | 검증 결과 | 출처 |
|---|---|---|---|
| 1 | framework annotation in domain | `@Service`/`@Transactional`/`@Entity`/`PasswordEncoder` 모두 직접 import | document §6 (메인 9건 + sub 10건) |
| 2 | domain → infrastructure 의존 | `domain/jwt/` 가 interface, `infrastructure/jwt/HmacSHA256JWTService` 가 구현 — port-style 1건 부분 적용 | document §7 |
| 3 | port/adapter 분리 | `UserFindService` interface 발견 (단 1건만) — 일관 적용 X | document §6 (sub-agent fetch 결정적 발견) |
| 4 | application → infrastructure | `ArticleRestController` → `infrastructure/jwt/UserJWTPayload` 직접 의존 ✅ Hexagonal 부정 핵심 | Senior §4 |
| 5 | Anemic Domain Model | Fowler 기준 통과 — `User.writeCommentToArticle()` 등 풍부 행동 | document §8 |

→ **합의**: "Pure Hexagonal/Clean" 미달성. "Pure POJO" 미달성. "Layered with Spring-flavored DDD-Lite" 가 정확.

### 1.2 양방향 도메인 import = 알고리즘 관점 순환 확정 (low severity)

**document §1 (C+E)**: Spring Modulith `verify()` Rule #1 + ArchUnit `slices().beFreeOfCycles()` 모두 본 PoC 코드를 **자동 실패**시킴.
- `domain/article` ↔ `domain/user` 양방향 entity import = SCC size 2.

**case (Vaughn Vernon Effective Aggregate Design Part II)**: 양방향 cross-aggregate 참조 = anti-pattern 글로벌 표준.

**Senior §5**: 그러나 도메인 의도 (RealWorld spec 의 follow/author 관계) 분기 필요. 같은 BC 안 cross-aggregate 양방향 = 정상 가능.

→ **합의**: low severity 순환 의존성 + Phase 4 도메인 의도 검증 메모. Bounded Context 미정의 (RealWorld spec 부재) 으로 본 PoC 한정 결정 보류.

→ **F-023 신규 finding (재확인)**: Tarjan SCC + ArchUnit/Modulith 알고리즘 결과 vs 도메인 의도 분기 가이드 부재.

### 1.3 외부 의존성 = 0건 — PoC 한계 정직 인정

세 에이전트 모두 동의:
- HTTP 클라이언트 (RestTemplate / WebClient / OkHttp) 부재
- Kafka / RabbitMQ / SQS 부재
- AWS SDK / Twilio / Stripe SDK 부재
- → external_dependencies[] = **빈 배열**

→ **합의**: 5.D 빈약 자체가 PoC 한계 (plan-poc-realworld.md §2.3 의 "외부 의존성 적음"). 사내 진짜 PoC 시 별도 검증.

→ **F-019 (운영 환경 부재)** 와 연계. 본 PoC 의 architecture.json `external_dependencies: []` + warnings 명시.

### 1.4 Phase 1 candidate 와 Phase 3 확정의 큰 차이 — 정정 트레이스 절차 부재

- Phase 1: Hexagonal/Clean 0.65, POJO 0.85
- Phase 3 확정: Hexagonal/Clean 0.30, POJO 0.50, Layered+Spring-DDD-Lite 0.85
- Δ = 0.35~0.55 (큰 차이)

→ **합의**: **F-024 신규 finding** — Phase 1 candidate vs Phase 3 확정의 차이 (5%/20% 임계) 처리 절차 부재. inventory.json 갱신 vs Phase 3 메모 분기 가이드 필요.

### 1.5 schema architecture_style enum 한계

architecture.schema.json `architecture_style` enum:
```
["layered", "hexagonal", "clean", "microservices", "monolith", "modular_monolith", "unknown"]
```

→ "Layered + Spring-flavored DDD-Lite" 같은 hybrid 표현 불가. enum 1개만 선택 강제.

→ **F-025 신규 finding 후보**: schema 의 architecture_style enum 이 hybrid 표현 미지원. v1.2 후보 (architecture_style 을 array 또는 primary/secondary 객체로 변경).

---

## §2. 3 에이전트 토론 — 의견 차이 영역

### 토론 1: Hexagonal/Clean confidence

| 에이전트 | 입장 | 근거 |
|---|---|---|
| document | 0.30 | 5 차원 검증 中 4 차원 미달 (port 분리 1건 / 의존 방향 위반) |
| case (카카오페이 home Hexagonal 제거 회고) | **0.30** | Hexagonal 적용 3 전제 (명확 도메인 / external depth>breadth / multiple consumers) — RealWorld 1만 충족 |
| Senior §4 | 0.25~0.35 | application → infrastructure 직접 의존 = "디렉토리만 Hexagonal" 패턴 |

**조정 결과**: **0.30 채택** (3 에이전트 합의). evidence:
- "Hexagonal 적용 3 전제 1/3 충족 (카카오페이 회고 기준)"
- "application → infrastructure 직접 의존 (Senior §4)"
- "port/adapter 분리 1건만 부분 적용 (UserFindService)"

### 토론 2: POJO domain confidence

| 에이전트 | 입장 |
|---|---|
| document | 0.50 (Anemic 미달이지만 Spring annotation 직접 사용) |
| case (우형 Multi Module Hexagonal — POJO 강제 명시) | **0.50** | "Spring Component/Service annotation 비사용" 글로벌 기준 미달 |
| Senior §1 | 0.50 ~ 0.70 (인정하기 vs 추구하기 분기) |

**조정 결과**: **0.50 채택** (보수적). source-info.md ground truth "POJO domain" 자기보고 vs 실측 차이 인정.

→ source-info.md 의 "Lombok 도메인 외에서만" 표현은 정확 (lombok 은 POJO 유지) — 단 Spring annotation 의존이 별개 문제.

### 토론 3: 양방향 import severity

| 에이전트 | 입장 |
|---|---|
| document | high — Spring Modulith / ArchUnit 자동 실패 |
| case (Vaughn Vernon) | high — anti-pattern 글로벌 표준 |
| Senior §5 | **low** — 한국 SI 에서 흔함, 도메인 의도 (cascade 정리) 가능 |

**조정 결과**: **low severity + decision_required=true** (Phase 4 도메인 의도 검증 후 재산정).

근거:
- 알고리즘 관점 = high (3 에이전트 中 2 동의)
- 실무 (한국 SI) 관점 = low (Senior §5 일화)
- BC 미정의 → 정확한 분기 불가 → 보수적 low + Phase 4 결정 보류

→ Phase 6 quality 단계에서 안티패턴 격상 검토 (도메인 의도 확정 후).

### 토론 4: F-022 (POJO ground truth vs 실측 차이) severity

| 에이전트 | 입장 |
|---|---|
| document | medium |
| case (우형 사례) | medium~high (글로벌 표준 미달) |
| Senior §1 | **medium** (한국 SI 에서 거의 100% 발생 패턴 — high 처리 시 모든 한국 SI 안티패턴 됨) |

**조정 결과**: **medium**. severity 인정 + warnings 명시. 안티패턴 후보 (AP-DOMAIN-FRAMEWORK-LEAK-XXX) 는 Phase 6 에서 재평가.

---

## §3. 신규 Finding 후보 (Phase 3 진행 전 사전 등록)

3 에이전트 합의 + Phase 3 사전 검증 결과:

| ID | 제목 | severity | 출처 | 즉시/유보 |
|---|---|---|---|---|
| **F-022** | POJO domain ground truth vs 실측 차이 처리 가이드 부재 | medium | 3 에이전트 합의 + 우형 Multi Module 사례 | v1.2 후보 |
| **F-023** | Tarjan SCC + ArchUnit/Modulith 알고리즘 결과 vs 도메인 의도 분기 가이드 부재 | high | document + case (Vaughn Vernon) + Senior | v1.1.2 즉시 |
| **F-024** | Phase 1 candidate vs Phase 3 확정의 차이 (5%/20% 임계) 처리 절차 부재 | medium | 3 에이전트 합의 | v1.1.2 후보 |
| **F-025** | architecture.schema.json `architecture_style` enum 의 hybrid 표현 미지원 | medium | document §1 | v1.2 후보 |
| F-026 | 5.D 외부 의존성 0건 케이스의 신뢰도 처리 가이드 부재 | low | 3 에이전트 합의 (F-019 와 연계) | v1.2 후보 |

**Phase 3 진행 중 추가 발견 가능성** — import 분석 시 명세 빈틈 발현 추정.

---

## §4. Phase 3 실행 계획 (3 에이전트 권장 통합)

### 4.1 web_fetch 추가 — 메인 9건 + sub-agent 10건 = 19건 ✅

이미 사전 fetch 완료 (rate limit 잔여 ~25):
- 메인: Article/User/Comment/Tag domain 5 + ArticleService/UserService/SecurityConfiguration/ArticleRestController/HmacSHA256JWTService/SpringDataJPAConfiguration 4
- sub-agent (document): WebMvcConfiguration / CommentRestController / Comment / CommentService / Tag / TagService / Profile / ProfileService / UserFindService / RealWorldApplication 10

**Phase 3 실행 시 추가 fetch 필요**: 거의 없음 (sampling 충분).

### 4.2 산출물 5종

| 산출물 | 명세 그대로? | 보강 사항 |
|---|---|---|
| `architecture.json` | ⚠️ | architecture.schema.json 준수 + `architecture_style: "layered"` (enum 한계 — F-025 finding) + `secondary_styles` 보조 필드 (Spring-DDD-Lite 표현) |
| `architecture.md` | ✅ | Phase 1 candidate → Phase 3 확정 정정 트레이스 명시 + 카카오페이 회고 인용 |
| `architecture.mermaid` | ✅ | C4 Level 3 component diagram + 7 모듈 |
| `dependency-graph.mermaid` | ✅ | 19건 import 기반 의존성 그래프 + 양방향 (low severity) 표시 |
| `circular-dependencies.md` | ⚠️ | domain/article ↔ domain/user 양방향 분석 + Phase 4 도메인 의도 검증 메모 + F-023 finding 명시 |
| `module-table-mapping.json` | ⭐ | Phase 3 명세 §4.1 의 "module-table-mapping.json" — Phase 2 7 테이블 + 모듈 매핑 |
| `_manifest.yml` | ✅ | Phase 3 매니페스트 |

### 4.3 모듈 식별 (7개 sub-domain 단위 — plan §11 Open Question 결정)

| ID | 이름 | path | layer | files | bytes |
|---|---|---|---|---|---|
| MOD-APPLICATION-ARTICLE | application-article | `application/article` | presentation | 9 | (계산 필요) |
| MOD-APPLICATION-USER | application-user | `application/user` | presentation | 7 | - |
| MOD-APPLICATION-SECURITY | application-security | `application/security` | presentation | 3 | - |
| MOD-DOMAIN-ARTICLE | domain-article | `domain/article` | domain | 12 | 21,579 (Phase 1) |
| MOD-DOMAIN-USER | domain-user | `domain/user` | domain | 12 | 16,814 (Phase 1) |
| MOD-DOMAIN-JWT | domain-jwt | `domain/jwt` | domain | 3 | 495 (Phase 1) |
| MOD-INFRASTRUCTURE-JWT | infra-jwt | `infrastructure/jwt` | infrastructure | 5 | (계산 필요) |
| MOD-INFRASTRUCTURE-REPOSITORY | infra-repo | `infrastructure/repository` | infrastructure | 1 | - |
| MOD-APPLICATION-ROOT | application-root | `application/` (WebMvcConfiguration) | cross-cutting | 1 | - |

→ 9 모듈 (3 application + 3 domain + 2 infrastructure + 1 cross-cutting).

### 4.4 의존성 (19건 import 기반)

```yaml
dependencies:
  # 정상 방향 (Layered)
  - {from: MOD-APPLICATION-ARTICLE, to: MOD-DOMAIN-ARTICLE, type: import, weight: 5+}
  - {from: MOD-APPLICATION-USER, to: MOD-DOMAIN-USER, type: import, weight: 5+}
  - {from: MOD-APPLICATION-ARTICLE, to: MOD-DOMAIN-USER, type: import, weight: 2+}
  
  # Hexagonal 부정 (application → infrastructure 직접)
  - {from: MOD-APPLICATION-ARTICLE, to: MOD-INFRASTRUCTURE-JWT, type: import, weight: 1, violates_layer: true, severity: medium}
  
  # domain ↔ domain (양방향 — low severity 순환)
  - {from: MOD-DOMAIN-ARTICLE, to: MOD-DOMAIN-USER, type: import, weight: 3+}
  - {from: MOD-DOMAIN-USER, to: MOD-DOMAIN-ARTICLE, type: import, weight: 3+, circular: true}
  
  # infrastructure → domain (port 인터페이스 부재)
  - {from: MOD-INFRASTRUCTURE-JWT, to: MOD-DOMAIN-USER, type: import, weight: 1+}
  - {from: MOD-INFRASTRUCTURE-JWT, to: MOD-DOMAIN-JWT, type: import, weight: 3+}  # 정상 (interface 구현)
```

### 4.5 모듈 ↔ 테이블 매핑 (Phase 2 7 테이블 활용)

| 모듈 | 관련 테이블 | Bounded Context 후보 (Phase 4 입력) |
|---|---|---|
| MOD-DOMAIN-ARTICLE | articles, articles_tags, article_favorites, comments, tags | BC-ARTICLE |
| MOD-DOMAIN-USER | users, user_followings | BC-USER |
| MOD-DOMAIN-JWT | (없음 — POJO Payload) | BC-AUTH (cross-cutting) |

→ Phase 4 5.A 의 BC 후보 명시.

### 4.6 신뢰도 산정

```yaml
confidence_breakdown:
  module_identification:
    confidence: 0.98
    element_count: 9
    extraction_method: deterministic
  dependency_graph:
    confidence: 0.92
    element_count: 19   # 19건 import sampling
    extraction_method: pattern_matching
  circular_dependency_detection:
    confidence: 0.95
    element_count: 1   # 1 순환 (domain/article ↔ domain/user)
    extraction_method: deterministic
  external_dependencies:
    confidence: 0.95
    element_count: 0   # 5.D 빈약
    extraction_method: deterministic
  module_responsibility:
    confidence: 0.85
    element_count: 9
    extraction_method: llm_with_grounding
  architecture_style:
    confidence: 0.85   # 사전 검증 강함
    element_count: 1
    extraction_method: llm_with_grounding
  layer_violation_detection:
    confidence: 0.85
    element_count: 1   # application → infrastructure 1건
    extraction_method: pattern_matching
  module_table_mapping:
    confidence: 0.92
    element_count: 7   # Phase 2 7 테이블
    extraction_method: deterministic
```

가중평균: **약 0.91~0.93 예상**.

→ ADR-003 §9 해석: **신뢰 가능 (샘플 검토 권장)**.

---

## §5. 승인 게이트

```
□ architecture.json schema 검증 (architecture.schema.json 준수)
□ Mermaid Component diagram 렌더링
□ 모든 모듈에 ID/책임 명시 (9개)
□ 순환 의존성 = 1건 발견 + 안티패턴 후보 등록 (decision_required)
□ 모듈 ↔ 테이블 매핑 = 사용자 검토 (Phase 2 7 테이블)
□ 아키텍처 스타일 후보 = 사용자 검증 (Phase 1 → Phase 3 정정 트레이스)
□ 외부 의존성 위치 = Phase 4 5.D 라우팅 (현재 0건)

# 보강
□ Phase 1 candidate 와 차이 명시 (정정 트레이스 5 차원 검증)
□ Spring framework 의존 (POJO ground truth 차이) finding 등록 (F-022)
□ 양방향 도메인 import 분기 finding 등록 (F-023)
□ Phase 1 → Phase 3 차이 처리 finding (F-024)
□ schema enum hybrid 미지원 finding (F-025)
□ Phase 3 종료 시 finding 최소 3건 정식 등록
```

---

## §6. 한계 (정직한 자기보고)

### 6.1 검증 완료

- 19건 import raw fetch (메인 9 + sub-agent 10)
- 5 차원 결정적 검증 (framework 의존 / 의존 방향 / port 분리 / app→infra / Anemic)
- 한국 사례 5건 직접 fetch 검증 (카카오페이/카카오뱅크/우형×2)
- Spring Modulith / ArchUnit / Tarjan SCC 알고리즘 검증

### 6.2 잔여 한계

- **import 전수 fetch 미수행**: 56 main + 34 test = 90 java files 中 19건만 sampling. 나머지 의존성은 추론 (E).
- **모듈별 정확한 LOC/file_count**: 일부 추정 (Phase 1 결과 활용)
- **Cockburn Hexagonal 원전 인증서 만료** (document 자평 -0.05)
- **토스 비공개 사례** + **"Hexagonal 같지만 Layered" 명시 키워드 0건** (case §6 정직 보고)

### 6.3 통합 신뢰도

- document: 0.88 / case: 0.93 / Senior: N/A
- **통합: 0.91** (Phase 1 의 0.92, Phase 2 의 0.92 와 유사 수준)
- ADR-003 §9 해석: **신뢰 가능 (샘플 검토 권장)**

---

## §7. Phase 3 실행 권장 순서

### 7.1 본 실행

1. **architecture.json 작성** — 9 모듈 + 19 dependencies + 1 circular + 0 external + module-table mapping
2. **architecture.md 작성** — 사람용. Phase 1 → Phase 3 정정 트레이스 + 카카오페이 회고 인용
3. **architecture.mermaid 작성** — C4 Level 3 component diagram
4. **dependency-graph.mermaid 작성** — 의존성 그래프 + 양방향 표시
5. **circular-dependencies.md 작성** — domain/article ↔ domain/user 분석 + Phase 4 도메인 의도 검증 메모
6. **module-table-mapping.json 작성** (선택) — Phase 4 BC 후보 명시
7. **_manifest.yml 작성**
8. **finding 정식 등록 (최소 3건)** — F-022/F-023/F-024 우선

### 7.2 F-015 사전 적용 효과 (Phase 3)

- 메인 9건 + sub-agent 10건 = 19건 raw fetch 100%
- 학습 코퍼스 의존 최소화
- sub-agent 보고 cross-check: **0% 오차** (Phase 2 와 동일 수준)

→ Phase 1 (D 50% 오차) → Phase 2 (0%) → Phase 3 (0%) — F-015 정착 ✅

---

## §8. 다음 단계

**3원칙: 사용자 승인 대기**

윤주스님 결정:
1. ✅ plan-phase3.md + 3 research + 통합 research 검토
2. ⏳ Phase 3 실행 승인 → §7.1 순서대로 진행
3. ⏳ 또는 plan/research 보강 요청

승인 후 Phase 3 실행 → 산출물 5종 (또는 6종) 작성 + finding 3건 이상 정식 등록 → Phase 4 진입 (윤주스 추가 승인).

---

## §9. Phase 1/2/3 KPI 비교

| 항목 | Phase 1 | Phase 2 | Phase 3 |
|---|---|---|---|
| 사전 등록 finding | 8건 | 5건 | 5건 |
| 정식 등록 (예상) | 4건 | 5건 | 5건+ |
| 신규 발견 (실행 중) | 1건 (F-015 ⭐) | 1건 (F-021 ⭐) | 1+ 건 예상 |
| 통합 신뢰도 | 0.92 | 0.92 | **0.91** |
| F-015 cross-validation | 사후 발견 (D 오차 50%) | 사전 적용 (0% 오차) | **사전 적용 + 19건 검증 (0% 오차)** |
| 한국 사례 | 4건 (Phase 1 보강 후) | 4건 | **5건** ⭐ |
| RealWorld 실측 | 9건 raw fetch | 11건 raw fetch | **19건 raw fetch** |

→ Phase 3 가 **가장 강한 raw fetch 검증** + **카카오페이 회고 등 강한 매칭 출처** 확보.

### 9.1 누적 finding 통계 (Phase 3 정식 등록 후 예상)

- Phase 0: 4 closed
- Phase 1: 4 정식 (F-007/008/009/015)
- Phase 2: 5 정식 (F-016/017/018/019/021)
- Phase 3: 5 정식 (F-022/023/024/025/026 예상)
- **누적: 18 정식 등록** (closed 4 + open 14)

→ F-021 (finding 누적 임계) 의 "20+ = 명세 자체 부실" 임계 근접 (90%).
→ Phase 4 진입 전 v1.1.2 격상 검토 필요 시점.

### 9.2 v1.1.2 후보 finding (high severity)

| ID | proposed_fix |
|---|---|
| F-007 (high) | inventory.schema.json 추가 |
| F-009 (high) | phase-1-init.md §6 환경별 신뢰도 표 |
| F-016 (high) | phase-2-db.md §3.4 ddl-auto 매트릭스 |
| **F-023 (high)** | **phase-3-arch.md §3.1 또는 ADR-004 양방향 도메인 import 분기 가이드** |

→ 본 PoC #01 종료 시 v1.1.2 격상 즉시 후보 4건. F-021 권장 절차에 따라 PoC 일시 정지 vs 종료 후 일괄 처리 결정 필요.
