# 정합성 검증 보고서 — Phase 2 (db)

> **사람 눈** 산출물 (이중 렌더링 정합 — `schema.json` + `schema.sql` + `erd.mermaid` 의 짝).
> 본 template 은 PoC #02 정합성-검증-보고서 형식의 표준화. ADR-008 (이중 렌더링 사상) + ADR-002 (7대 산출물) 정합.

> 작성일: {YYYY-MM-DD}
> 분석 대상: `{repo}` (HEAD `{commit}`)
> 명세: methodology-spec/workflow/phase-2-db.md (v{version}) §3.3 / §4.2

---

## 1. 출처 매트릭스

다중 출처 우선 (DDL 파일 + ORM + Migration + ERD + 운영 DB) → 단일 출처 fallback.

| 출처 | 존재 | 위치 | 신뢰도 기여 |
|---|---|---|---|
| ORM 메타 (소스 코드) | {✅/⚠️/❌} | `{경로 — @Entity / @Table 클래스}` | {70%} |
| DDL 파일 (schema.sql / migration.sql) | {✅/⚠️/❌} | `{경로}` | {ORM derivative 시 출처 자격 무력화 — §2 참조} |
| Migration (Flyway / Liquibase / Alembic) | {✅/⚠️/❌} | {경로 또는 (미사용)} | {0~30%} |
| ERD 문서 | {✅/❌} | {경로 또는 (별도 미제공)} | {0~10%} |
| 운영 DB 메타 (information_schema) | {✅/❌} | {커넥션 또는 (미접근)} | {0~30%} |

→ **사실상 출처 {N}종 (...)**. {DDL 이 ORM derivative / Migration 이 ground truth 등 결론}.

---

## 2. ★ 핵심 발견 (있을 시 — 출처 분별 / 정합 위반)

### 2.1 schema.sql 출처 분별 (ORM derivative vs 수동)

ORM (Hibernate / JPA) 의 `auto-generated DDL` vs 사람 작성 DDL 구분 알고리즘:

| 표지 | ORM derivative 패턴 | 수동 작성 패턴 |
|---|---|---|
| FK 명명 | `fk` + 25자 base35 lowercase (Hibernate `NamingHelper#generateHashedFkName`) | `fk_{table}_{ref}` 의미적 |
| UQ 명명 | `uk` + 25자 base35 lowercase | `uk_{table}_{column}` 의미적 |
| 컬럼 순서 | Java field 선언 순서 | 사람이 의도한 순서 (PK → FK → 데이터) |
| 주석 | 부재 또는 자동 생성 | 사람 의도 주석 |

→ ORM derivative 확정 시 schema.sql 은 별도 출처 자격 X. ORM 메타가 ground truth.

(F-050 분별 절차 정합)

### 2.2 정합 위반 / critical (있을 시)

| 차원 | 위반 |
|---|---|
| ORM ↔ schema.sql | {예: TagJpaRepository<Tag, **Integer**> vs Tag.id = String — F-048 critical} |
| schema.sql ↔ 운영 DB | {예: 컬럼 길이 차이} |
| ERD ↔ 코드 | {예: 관계 다중성 어긋남} |

→ Phase 6 AP-DB-{NNN} {severity} 단일 등록 후보.

---

## 3. 테이블 인벤토리

| 테이블 | PK | UQ | FK | 컬럼 수 | ORM 클래스 | 비고 |
|---|---|---|---|---|---|---|
| `{users}` | id | email, username | — | 8 | `User.java` | — |
| `{article}` | id | slug | author → users | 7 | `Article.java` | — |
| ... | | | | | | |

**합계**: {N} 테이블 / {M} 컬럼 / {F} FK / {U} UQ.

---

## 4. 정합성 검증 5종

### 4.1 Type 정합 (ORM ↔ schema)
{발견 / 통과 — 예: F-048 TagJpaRepository<Tag, Integer> vs Tag.id String 불일치}

### 4.2 Cardinality 정합 (FK 다중성)
{1:N / N:M 어긋남}

### 4.3 Nullable 정합
{ORM @Column(nullable=false) vs DDL NOT NULL 일관성}

### 4.4 UQ / Index 정합
{비즈니스 BR (rules.json) 상의 unique 요구가 DDL UQ 로 강제되는지 / race-safe 보장 여부}

### 4.5 Length / Type 정합 (RFC / 표준 위반 후보)
{예: email VARCHAR(30) — RFC 5321 §4.5.3.1.1 max 254 위반 후보}

---

## 5. 데이터 무결성 / Race Safety 분석 (있을 시)

| BR | 검증 위치 | Race Safety | 비고 |
|---|---|---|---|
| BR-{...}-EMAIL-UNIQUE-001 | App pre-check + DB UQ | App = 1중 race-prone / DB = 1중 race-safe | 2중 안전망 (★ DEC-static-tool 시 finding) |
| ... | | | |

(Phase 4.5 decision-table 정합 — formal-spec.schema)

---

## 6. anti-pattern / finding 인덱스

### 6.1 anti-pattern (Phase 6 격상 후보)

| AP ID | severity | 파생 finding | composite view |
|---|---|---|---|
| AP-DB-{NNN} | critical | F-{NNN} | DB 데이터 무결성 (있을 시) |

### 6.2 finding 누적 (본 phase 신규)

| finding | severity | status | 한줄 |
|---|---|---|---|
| F-{NNN} | high | promoted | {요약} |

---

## 7. 변경 권고 우선순위

1. **즉시 수정 (critical)** — {코드 위치 + 1글자 fix 또는 1라인 patch}
2. **단기 (high)** — {권고}
3. **중기 (medium)** — {권고}
4. **장기 (low)** — {권고}

---

## 8. 본 산출물 자체 메타

```yaml
phase: 2
deliverable: 정합성-검증-보고서.md (사람 눈) + schema.json (AI 눈) + schema.sql + erd.mermaid
raw_confidence: 0.NN
inputs:
  - source: {경로}
  - schema.sql: {경로 또는 (없음)} / 출처: {ORM derivative / 수동 / Migration}
  - migration: {도구 / (미사용)}
  - erd: {경로 / (없음)}
cross_validation:
  performed: true
  validators:
    - { type: senior_engineer_subagent, real_tool: false, simulation_reason: "AI 검증 보조용" }
    # 진짜 도구 사용 시 5종 물증 (formal-spec.schema 정합)
    # - { type: external_tool, real_tool: true, tool_name: "schemaspy/atlas", tool_version: "...", ... }
known_limitations:
  - "{한계 1 — 예: H2 in-memory + create-drop → 운영 DB 메타 미접근}"
trust_level:
  current: "0.NN"
  current_step: 2          # ADR-009 §2.1 표 row #
  next_validation: "Phase 6 AP 격상 / Phase 4.5 decision-table 정합"
```

---

## 9. 참조 / 다음 phase

- 다음 phase: Phase 3 (arch) + Phase 4 (5.A rules + 5.B domain)
- 격상 대기 finding: §6.2
- 외부 검증 후보: schemaspy / atlas / sqlfluff / sqlcheck (★★★ 진짜 도구 의무 — DEC-static-tool-실행-의무화)
