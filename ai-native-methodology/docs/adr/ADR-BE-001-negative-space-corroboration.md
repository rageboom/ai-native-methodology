# ADR-BE-001: Negative-Space Corroboration 패턴 정식화 — error-mapping AP-API-001

- 상태: 승인됨 (Accepted)
- 일자: 2026-05-03
- 결정자: 윤주스 (Auto Mode 위임 / 옵션 3 v1.5.0 MINOR 결단)
- 관련: ADR-001 (사상적 기반), ADR-FE-007 (★ ★ ★ FE 보안 antipattern 카탈로그 = ★ §8.1 strict 정합 검증대 첫 통과 / 본 ADR 의 ★ positive-space variant), ADR-009 (다이어그램 신뢰 모델 단계 5), ADR-010 (baseline + ratchet), §8.1 (단일 PoC 과적합 회피 strict)

> **본 ADR 의 위치** — v1.5.0 MINOR ★ ★ ★ ★ 본체 antipattern 카탈로그 ★ negative-space 변형 ★ 첫 격상. ★ ★ ADR-FE-007 (★ positive-space — 4 PoC 모두 ★ 같은 anti-pattern 보유) 와 대칭 / 본 ADR (★ negative-space — 4 PoC 모두 ★ 정합 contract ★ 부재).

---

## 1. 컨텍스트

### 1.1 ★ 두 가지 corroboration 패턴

§8.1 strict (단일 PoC 과적합 회피) + ADR-FE-007 (G4 strict patterns ≥ 3 임계) 을 ★ 본 ADR 이 ★ 확장:

| 패턴 | 정의 | ADR-FE-007 (positive) | ADR-BE-001 (negative) |
|---|---|---|---|
| **positive-space corroboration** | ★ N PoC 가 ★ 같은 anti-pattern 을 ★ 보유 | ★ 4 PoC 모두 JWT 보안 위반 (Java + Hexagonal + NestJS + React) | — |
| **negative-space corroboration** | ★ N PoC 가 ★ 같은 정합 contract 를 ★ 부재 | — | ★ 4 PoC 모두 error mapping contract 부재 (Spring + Spring 3 + NestJS + React-N/A) |

★ ★ ★ 두 패턴 모두 §8.1 strict 통과 자격 자연 충족 — anti-pattern 의 보유든 정합 contract 의 부재든, ★ ★ "여러 PoC 에서 같은 결함 패턴" 이라는 본질이 동일.

### 1.2 ★ AP-API-001 의 negative-space 입증 (★ 4 PoC isomorphic)

```
PoC #01 Java Spring Boot 2.5     : @ExceptionHandler 부재 (★ 신뢰도 0.65 / 정적 추출 한계)
PoC #02 Hexagonal SB3            : @ControllerAdvice 명세 부재 → IllegalArgumentException 직접 throw
                                   (F-070+F-079+F-085 묶음 critical / AP-API-001 critical 등재)
PoC #03 NestJS                   : @Catch ExceptionFilter 부재 → @Post default 201 / @ApiResponse decorator drift
                                   (★ AP-API-001 high 등재 / 5 op spec/runtime drift)
PoC #04 full React FSD           : 해당 없음 (★ FE 트랙 / BE error contract scope 외부)
```

→ ★ ★ ★ ★ 3 BE PoC 모두 = ★ Spring 2.5 + Spring 3 Hexagonal + NestJS = ★ ★ ★ **★ framework 무관 negative-space isomorphic** (★ §8.1 입증).

### 1.3 ★ ★ negative-space 의 격상 자격 정합

ADR-FE-007 §1.1 의 patterns ≥ 3 strict 임계는 ★ "★ patterns" 의 정의를 ★ "★ anti-pattern 의 ★ 같은 형태 보유" 로 가정. 본 ADR 은 ★ ★ "★ 정합 contract 의 ★ 같은 형태 부재" 도 ★ patterns 임계의 ★ 자격 동등으로 정식화.

이유:
1. ★ negative-space = ★ ★ "★ 사람 reviewer 가 ★ 못 보고 지나가기 쉬운 형태" → ★ ★ ★ 자동 회귀 도구 ROI 가 가장 큼 (★ ★ AP-API-001 자동 회귀 = ★ 본 ADR 의 ★ 즉시 가치)
2. ★ positive-space anti-pattern 보유 = code 가 ★ 명시적으로 잘못 / negative-space contract 부재 = code 가 ★ 침묵으로 잘못 → ★ ★ 두 형태 모두 같은 root failure (★ contract 부재의 ★ 결과)
3. ★ ADR-010 baseline + ratchet 정합 — ★ ★ "★ 신규 결함 = production blocker" 의 ★ "★ 결함" 정의는 ★ negative-space 도 포함

---

## 2. 결정

### 2.1 ★ Negative-Space Corroboration ★ 정식화

**원칙**: ★ ★ N PoC 가 ★ 같은 정합 contract 를 ★ 부재 (★ N ≥ 2 / strict 모드 ≥ 3) 시 = ★ ★ patterns ≥ N 임계 자연 충족 / ★ ★ 본체 antipattern 카탈로그 격상 자격 ★ 동등.

**필수 evidence 4종**:
1. ★ N PoC 의 source-grounded 부재 입증 (★ grep 0 hit 또는 ts-morph AST 0 match)
2. ★ ★ 부재의 ★ negative effect 입증 (★ ★ 정적/runtime drift / spec mismatch / unmapped error leak 등)
3. ★ ★ contract 의 ★ industry 표준 인용 (★ RFC / OWASP / CWE / framework 공식 docs)
4. ★ ★ ★ 자동 회귀 도구 ★ 작성 가능성 입증 (★ Semgrep custom rule 또는 ts-morph AST checker)

### 2.2 ★ 본 ADR 의 ★ ★ 첫 적용 — AP-API-001

**AP-API-001 (★ ★ 본체 antipattern 카탈로그 ★ negative-space ★ 첫 정식 등록)**:

```yaml
id: AP-API-001
title: "Error Mapping Contract 부재 (★ 3 BE PoC negative-space isomorphic)"
severity: critical
category: api
applies_to: BE
mechanism:
  - throw_based: "도메인 예외 throw 가 @ControllerAdvice/@ExceptionHandler 매핑 부재 → 500 leak"
  - decorator_drift: "RFC 9110 위반 status code (e.g., DELETE 201) decorator 가 적용 후 ★ 사람 reviewer 누락"

negative_evidence:
  poc_01: "Spring 2.5 / @ExceptionHandler 부재 (신뢰도 0.65)"
  poc_02: "Spring 3 Hexagonal / @ControllerAdvice 명세 부재 → IllegalArgumentException throw → AP-API-001 critical"
  poc_03: "NestJS / @Catch ExceptionFilter 부재 → @Post default 201 + @ApiResponse decorator drift → AP-API-001 high"

industry_standard:
  - "RFC 7231 §4.2.2 (idempotency MUST)"
  - "RFC 9110 §15.3 (status code 의미)"
  - "OWASP API Security Top 10 — API9:2023 Improper Inventory Management"
  - "Spring docs — @RestControllerAdvice 권장"
  - "NestJS docs — Exception Filters 권장"

automatic_regression:
  spring_rule:
    path: "tools/static-runner/rules/error-mapping-missing.yml"
    rule_id: "internal.be.api.error-mapping-generic-exception-in-service"
    introduced_in: "v1.4.4-pre (★ b87cec5 commit)"
  nestjs_rule:
    path: "tools/static-runner/rules/error-mapping-missing.yml"
    rule_id: "internal.be.api.error-mapping-nestjs-delete-201-decorator-drift"
    introduced_in: "v1.4.5-pre"

migration_advice:
  for_new_system:
    BE_Spring:
      - "★ 도메인 specific exception 클래스 의무 (예: ConflictException, NotFoundException)"
      - "★ @RestControllerAdvice + @ExceptionHandler 매핑 의무"
      - "★ @ResponseStatus 또는 ResponseEntity.status() 명시"
      - "★ contract test (rest-assured / Pact) — spec ↔ runtime drift 0 의무"
    BE_NestJS:
      - "★ @HttpCode(N) 명시 의무 (★ NestJS @Post default 201 함정 회피)"
      - "★ @ApiResponse status 정정 의무 (★ DELETE → 204 / Update → 200)"
      - "★ Custom @Catch ExceptionFilter + @UseFilters 또는 global filter"
      - "★ supertest spec/runtime drift 검증 의무"

cross_poc_isomorphic_count: 3   # ★ 3 BE PoC negative-space (PoC #04 FE 해당 없음)
strict_threshold: "★ negative-space ★ patterns ≥ 3 임계 도달 / ADR-FE-007 positive-space 와 대칭 자연 충족"
v150_본체_격상_근거: "★ §8.1 strict + ADR-BE-001 negative-space corroboration 정식화 자격 충족"
```

### 2.3 ★ ★ ★ 본 격상의 의의 (★ §8.1 정합 검증대 ★ 두 번째 통과)

| 단계 | 결단 |
|---|---|
| ADR-FE-007 (2026-05-02) | ★ ★ ★ §8.1 strict 정합 검증대 ★ 첫 통과 (★ positive-space — 4 PoC 모두 anti-pattern 보유) |
| **ADR-BE-001 (★ 2026-05-03)** | ★ ★ ★ ★ §8.1 정합 검증대 ★ 두 번째 통과 (★ ★ negative-space — 3 BE PoC 모두 contract 부재) |

→ ★ ★ ★ ★ ★ **§8.1 정합 + cross-PoC patterns 임계 평가 + ★ ★ negative-space 변형 정식화 + 본체 격상 결단 절차 확장**.

### 2.4 ★ ★ ★ 진짜 도구 직접 confirm (★ v1.4.4-pre + v1.4.5 PATCH 신설)

★ ★ ★ ★ **AP-API-001 의 BE applies_to 양쪽 (Spring throw + NestJS decorator) = 진짜 도구 직접 confirm 도달**.

진행 흐름:
- v1.4.4-pre (★ b87cec5 commit): `error-mapping-generic-exception-in-service` Spring rule (★ no release) → PoC #02 ArticleService:184 정확 매칭
- v1.4.5 PATCH: `error-mapping-nestjs-delete-201-decorator-drift` NestJS sub-rule + AP-API-001 cross-PoC base 정합

산출:
- `tools/static-runner/rules/error-mapping-missing.yml` (★ 2 rule / Spring + NestJS)
- `tools/static-runner/rules/error-mapping-missing.java` (★ 5 positive + 5 negative)
- `tools/static-runner/rules/error-mapping-missing.ts` (★ 3 positive + 3 negative)
- 매칭: PoC #02 ArticleService.java + PoC #03 article.controller.ts (★ 4 op decorator drift)

★ ★ 의의:
- ★ ★ ★ ADR-FE-007 §2.3 의 ★ "진짜 도구 직접 confirm" 패턴을 ★ ★ negative-space 변형으로 ★ 확장
- ★ ★ Sprint 4 묶음 O 의 ★ "사내 custom rule" 1년 long-tail carry 의 ★ BE 트랙 ★ 첫 실현
- ★ ADR-010 §2.3 CI ratchet ★ BE 트랙 ★ 첫 진입 (★ 현재 FE jwt-localstorage + BE error-mapping)
- ★ 사내 적용 시 즉시 적용 자격 (★ Internal-Proprietary license metadata)

★ ★ 관련 commit:
- `b87cec5` (옵션 2′ — 2026-05-03 / no release / Spring rule 신규)
- `4dcace9` (옵션 2 v1.4.5 PATCH — 2026-05-03 / NestJS sub-rule 신규 + AP-API-001 cross-PoC base 정합)

---

## 3. 결과 (Consequences)

### 3.1 좋은 점

- ★ ★ ★ §8.1 strict 정합 검증대 ★ 두 번째 통과 (★ ★ ★ negative-space 변형 정식화).
- ★ ★ 3 BE PoC isomorphic error contract 부재 명시화 (★ Spring 2.5 + Spring 3 + NestJS framework 무관).
- ★ 사용자 사내 신규 시스템 구축 시 ★ error mapping contract 의무 명시.
- ★ AP-API-001 자동 회귀 도구 ★ 양 framework (Spring + NestJS) 본체 격상.
- ★ ★ ★ 본 방법론 antipattern 카탈로그 ★ negative-space 첫 정식 등재 (★ ★ 향후 같은 패턴 재발견 시 본 ADR 차용 가능).
- ★ ★ ADR-FE-007 (positive) ↔ ADR-BE-001 (negative) ★ ★ 대칭 정합 입증.

### 3.2 나쁜 점

- ★ ★ negative-space evidence 의 ★ 부재 입증 자체가 정적 추출 한계 (★ ★ PoC #01 Spring 2.5 신뢰도 0.65 / @ExceptionHandler 의 grep 0 hit 가 ★ 진짜 부재 vs 대안 mechanism 의 모호함).
- ★ negative-space rule 작성 시 ★ false positive 회피 = ★ pattern-not-inside / paths.exclude 의 ★ 정확한 사용 의무 (★ Phase 4.5 round-trip 재생성 코드 8 detection 사례 학습).
- ★ ★ ★ ts-morph 기반 AST semantic 분석은 carry (★ Semgrep pattern-not-inside 의 NestJS @HttpCode 결합 한계 / v1.5.1+ PATCH).

### 3.3 무시한 다른 옵션

- **본체 ADR ❌ — static-runner quality 격상만 유지** — 거부. ★ ★ §8.1 strict + 3 PoC isomorphic 자연 충족 / patterns 임계 정식화 의무.
- **AP-API-001 critical → high 강등** — 거부. ★ ★ PoC #02 critical (★ F-070+F-079+F-085 묶음) 의 ★ 사내 적용 즉시 즉시 수정 priority 가 ★ 본 ADR 의 ★ 핵심 motivation.
- **negative-space 패턴 ★ ADR-FE-007 §1.1 에 ★ 통합 / 별 ADR ❌** — 거부. ★ ★ ADR-FE-007 = ★ FE 보안 안티패턴 카탈로그 / 본 ADR = ★ ★ ★ negative-space corroboration 일반 패턴 정식화 / 두 axis 분리 보존 의무.
- **3 BE PoC + FE PoC #04 합산 = 4 PoC isomorphic 주장** — 거부. ★ ★ FE 트랙은 BE error mapping scope 외부 / ★ 본 ADR cross_poc_isomorphic_count = 3 strict 보존.

---

## 4. 적용 (Implementation)

### 4.1 본 v1.5.0 MINOR

- ★ ★ 본 ADR 신설 (v1.5.0 MINOR 핵심 결단)
- ★ ★ ★ schemas/error-mapping-spec.schema.json 신규 (★ ★ formal-spec deliverable / Phase 5-1 의 ★ negative-space 산출물 정식화)
- ★ skills/analysis-phase-5-error-mapping/SKILL.md 신규 (★ phase-5-1 발동 / OpenAPI + error mapping cross-link)
- ★ flows/analysis.phase-flow.json — phase 5-1 의 skills 배열에 신규 skill 추가 (★ drift-validator 3-way 통과 의무)
- ★ methodology-spec/skills-axis.md §5 매핑 표 갱신
- ★ DEC + STATUS + INDEX + CHANGELOG + memory 갱신

### 4.2 ★ ★ ★ ★ Stage 격상 자격 — v1.5.0 MINOR release

★ ★ ★ §8.1 strict + cross-PoC negative-space corroboration 정식화 = ★ ★ release 진입 자격 자연 충족.

### 4.3 carry (★ v1.5.1+ PATCH)

- ★ ★ ★ ts-morph NestJS @HttpCode + @Post + @ApiResponse 결합 decorator semantic 분석 (★ Semgrep pattern-not-inside 한계 보완)
- ★ AP-API-001 의 PoC #01 evidence 보강 (★ Spring 2.5 source 적용 시 직접 confirm)
- ★ schemas/antipatterns.schema.json 본체 antipattern 카탈로그 ★ 첫 등재 (★ ★ ADR-FE-007 carry 와 합산)
- ★ drift-validator BE corpus (error-mapping-equiv-01 + drift-01) — ★ structural equivalence 부재 영역 / 적정 design 후 carry
- ★ agents/analysis/error-mapping-extractor.md (★ thin agent / ★ Senior research 권고 / SKILL.md 만으로 v1.5.0 충족)
- ★ methodology-spec/deliverables/16-error-mapping-spec.md (★ deliverable full spec)
- ★ migration-cautions BE 신설 (★ ★ "사내 신규 시스템 구축 시 error mapping contract 의무" 별 파일)

---

## 5. 참조

### ADR
- ADR-001 (사상적 기반)
- ADR-009 (다이어그램 신뢰 모델)
- ADR-010 (baseline + ratchet)
- ★ ★ ★ ★ ADR-FE-007 (★ FE 보안 antipattern 카탈로그 / ★ ★ positive-space corroboration 변형 / 본 ADR 의 sister)

### DEC
- DEC-2026-05-02-jwt-rsa-custom-rule (★ negative-space rule 패턴 학습 origin)

### Sources (★ ★ ★ 3 BE PoC negative-space isomorphic 입증)
- PoC #01 RealWorld Spring Boot 2.5 § @ExceptionHandler 부재 (신뢰도 0.65)
- PoC #02 1chz/realworld-java21-springboot3 (Hexagonal) § F-070+F-079+F-085 묶음 critical (AP-API-001)
- PoC #03 NestJS § AP-API-001 high (@Post default 201 + @ApiResponse decorator drift)

### Memory
- `feedback_decision_cadence_24h_cooling_off.md` (★ 본 ADR 신설 = ★ ★ ≥ 24h cooling-off 적용 영역 / 단 사용자 명시 진행 결단으로 즉시 진입)
- `feedback_methodology_body_priority.md` (★ 본 ADR = 본체 + 도구 격상 정합)

### commit
- `b87cec5` (옵션 2′ Spring rule)
- `4dcace9` (v1.4.5 PATCH NestJS sub-rule)
- (★ v1.5.0 MINOR 본 ADR 신설)

**End of ADR-BE-001.**
