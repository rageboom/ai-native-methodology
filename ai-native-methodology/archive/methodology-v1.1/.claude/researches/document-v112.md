# Document Research: v1.1.2 격상 (4 high finding 공식 문서)

> 작성일: 2026-04-28
> 역할: 공식문서 리서처
> 대상 finding: F-007 / F-009 / F-016 / F-023
> 우선순위: F-023 ⭐ > F-016 > F-009 > F-007

---

## §0. Executive Summary

본 리서치는 v1.1.1 PoC #01 에서 도출된 4건의 high finding 을 v1.1.2 격상에 반영하기 위한 공식 문서 근거를 수집한다. 4건 모두 **공식 문서 또는 표준 문서로 직접 근거를 확보**했으며, 일부 영역(특히 F-023 의 cycle detection 알고리즘 내부 구현)은 공식 문서가 침묵하거나 간접적이어서 본문에 그 한계를 명시한다.

핵심 결론:

- **F-023**: Spring Modulith `verify()` 와 ArchUnit `slices().beFreeOfCycles()` 모두 "DAG 위반 = 즉시 violation" 이라는 **이진 의사결정**만 제공. **BC 정의 유무에 따른 분기**는 공식 문서가 아니라 DDD 문헌(Evans/Vernon/Fowler)의 strategic design 영역이며, 두 영역을 결합하는 가이드는 표준 부재 → v1.1.2 가 채워야 할 공백.
- **F-016**: Hibernate 공식 Javadoc(`org.hibernate.tool.schema.Action`) 이 7개 enum 값의 동작을 짧고 명확하게 정의. Spring Boot 의 embedded(H2/HSQLDB/Derby) 분기 + Flyway/Liquibase 존재 시 default 가 `none` 으로 떨어지는 동작도 명문화.
- **F-009**: Linguist 는 "bytes" 단위만 보장하며, **byte → LOC 변환 공식은 공식적으로 존재하지 않음**. Trees API 의 `truncated` 한계(100k entries / 7MB)는 명문화. 환경별 신뢰도 차등은 본 방법론이 자체 정의해야 함.
- **F-007**: JSON Schema Draft 2020-12 표준 + AsyncAPI 의 manifest 패턴(`asyncapi`/`info`/`channels`/`components` required + optional 분리)이 inventory.schema.json 의 baseline.

---

## §1. F-023 ⭐ Tarjan SCC + Spring Modulith / ArchUnit (최우선)

### 1.1 Tarjan SCC 알고리즘 (출처: Wikipedia / Tarjan 1972)

**출처**: https://en.wikipedia.org/wiki/Tarjan%27s_strongly_connected_components_algorithm

| 항목 | 내용 |
|---|---|
| 시간 복잡도 | `O(\|V\|+\|E\|)` — 노드/엣지 합에 선형 |
| 공간 | per-vertex 2 word(`index`, `lowlink`) + 1 bit(`onStack`) + stack O(\|V\|) |
| SCC 정의 | "vertices where every node can reach every other node through directed paths." |
| 결정성 | 알고리즘 자체는 결정적; 다만 입력 그래프의 노드 순회 순서에 따라 **컴포넌트 발견 순서**가 달라질 수 있음 (correctness 는 영향 없음) |

**v1.1.2 적용 함의**:
- 본 알고리즘은 **순환 의존성 탐지에 결정적**.
- 그러나 **출력의 의미는 도메인 무관(domain-agnostic)**. SCC 발견은 "양방향 의존성 사이클 존재" 사실만 알려주며, 그것이 **나쁜 사이클**인지 **의도된 사이클**인지에 대한 정보 없음.

**Wikipedia 가 침묵하는 부분**:
- 가중치/엣지 라벨링은 다루지 않음 (의도된 dependency 메타데이터 표현 불가)
- error tolerance 없음 (그래프 결손을 그대로 반영)

### 1.2 Spring Modulith `ApplicationModules.verify()` (출처: 공식 reference 2.0.6)

**출처**:
- https://docs.spring.io/spring-modulith/reference/
- https://docs.spring.io/spring-modulith/reference/verification.html
- https://docs.spring.io/spring-modulith/reference/fundamentals.html

#### 1.2.1 verify() 가 enforce 하는 3가지 규칙 (직접 인용)

> 1. "_No cycles on the application module level_ — the dependencies between modules have to form a directed acyclic graph."
> 2. "_Efferent module access via API packages only_ — all references to types that reside in application module internal packages are rejected"
> 3. "_Explicitly allowed application module dependencies only_ (optional)"

#### 1.2.2 호출 패턴

```java
ApplicationModules.of(Application.class).verify();
```

#### 1.2.3 build failure trigger

> "`ApplicationModules.verify()` throws an exception in case of any architectural violation being detected."

- 정확한 exception class 는 reference 페이지에서 명시되지 않음 (Javadoc 직접 확인 필요).
- 실행 시점은 **test-time** 이 표준이며, JUnit 테스트가 빌드 파이프라인에 포함되면 결과적으로 build failure.

#### 1.2.4 Module 인식 방식

- Package-based: "each direct sub-package of the main package is considered an _application module package_." (자동)
- Annotation-based: `@ApplicationModule` (명시적)

**중요**: Spring Modulith 의 "module" 은 **DDD 의 Bounded Context 와 1:1 대응이 아니다**. Spring Modulith 의 module 은 본질적으로 **package 단위 architectural slice**.

### 1.3 ArchUnit `slices().beFreeOfCycles()` (출처: 공식 userguide 1.4.2)

**출처**: https://www.archunit.org/userguide/html/000_Index.html

#### 1.3.1 핵심 API

> "slices().matching(\"..myapp.(*)..\").should().beFreeOfCycles()"

**slice 정의 방식**:
- `matching("..myapp.(*)..")` — first package after 'myapp' 기준 정렬
- Custom: `SliceAssignment` 인터페이스 구현

#### 1.3.2 설정

| 속성 | 기본값 | 의미 |
|---|---|---|
| `cycles.maxNumberToDetect` | 100 | 탐지할 최대 cycle 수 |
| `cycles.maxNumberOfDependenciesPerEdge` | 20 | edge 당 보고할 dependency 수 |

#### 1.3.3 알고리즘 내부 구현

본 userguide 는 cycle detection 의 내부 알고리즘(Tarjan 인지 Johnson 인지)을 **명시적으로 공개하지 않음**. `CycleDetector.detectCycles()` API 의 존재만 언급.

### 1.4 DDD 공식 — BC 정의 + Aggregate 양방향 참조 규칙

#### 1.4.1 Bounded Context (Martin Fowler, bliki)

**출처**: https://martinfowler.com/bliki/BoundedContext.html

> "Bounded Context is a central pattern in Domain-Driven Design"
> "total unification of the domain model for a large system will not be feasible or cost-effective."
> "the dominant [factor] is human culture, since models act as Ubiquitous Language, you need a different model when the language changes."

**v1.1.2 함의**:
- BC 식별은 **언어/문화 기반의 인간 의사결정**이며, 코드 분석만으로 자동 도출 불가.
- BC 미정의 = `decision_required` 로 라우팅하여 사람 결정에 위임하는 것이 정합.

#### 1.4.2 Vaughn Vernon — Aggregate 간 참조 규칙 (Implementing DDD)

**출처**: Vaughn Vernon, *Implementing Domain-Driven Design*, Addison-Wesley, 2013 (ISBN 978-0321834577).

**핵심 원칙**:
> "Prefer references to external Aggregates only by their globally unique identity, not by holding a direct object reference (or 'pointer')."

**중요한 분기**:

| 위치 | 양방향 참조 | DDD 견해 |
|---|---|---|
| 같은 Aggregate 내 entity 끼리 | OK | 자연스러움 (예: `Order ↔ OrderItem`) |
| 같은 BC, 다른 Aggregate 끼리 (ID 참조) | 가능 | "low/medium" 정도, BC 응집도 점검 권장 |
| 다른 BC 간 직접 양방향 (object ref) | NOT OK | **strategic design 위반 = high** |

#### 1.4.3 Eric Evans — Strategic Design (Blue Book Part IV)

**출처**: Eric Evans, *Domain-Driven Design*, Addison-Wesley, 2003 (ISBN 978-0321125217). Part IV "Strategic Design".

핵심 패턴:
- **Bounded Context**: 모델의 일관성 경계
- **Context Map**: BC 간 통합 패턴
- BC 간 **양방향 strong coupling = "Big Ball of Mud" 안티패턴** (Part IV Ch.14)

### 1.5 알고리즘 vs 도메인 의도 — 공백 분석

| 차원 | Spring Modulith | ArchUnit | DDD | v1.1.2 가 채워야 할 공백 |
|---|---|---|---|---|
| cycle 탐지 | DAG 위반 → exception | slice cycle → violation | (해당 없음) | 알고리즘은 동일 결과 |
| module/slice 정의 | package + annotation | package infix | BC = 인간 결정 | BC 정의 유무 분기 |
| 양방향이 정상인 경우 | 인정 안함 | 인정 안함 | 같은 Aggregate / 같은 BC 내부 | 알고리즘이 도메인 무지 |
| build failure 자동화 | verify() 호출 시 | rule.check() 시 | (해당 없음) | 자동 high 의 한계 |
| BC 미정의 처리 | (해당 없음) | (해당 없음) | strategic design 부재 | decision_required 라우팅 |

**핵심 통찰**:
- 두 코드 분석 도구는 모두 **이진 violation** 만 제공.
- DDD 문헌은 **"양방향이 OK 인 경우"** 를 명시하지만, 그것을 **자동 판정**하는 표준은 부재.
- 본 방법론은 이 두 영역의 인터페이스를 정의해야 함.

### 1.6 결론 — v1.1.2 §3.1 분기 가이드 권장 형태

**권장 옵션 A (4-way branching, 강력 추천)**:

```
Spring Modulith verify() / ArchUnit beFreeOfCycles() 가 cycle 보고:
  ↓
[질문 1] Bounded Context 가 명시적으로 정의되어 있는가?
  ├─ NO → severity = LOW + decision_required = true + Phase 4 라우팅
  │       (이유: BC 정의 없이 자동 판정 불가)
  │       (참고: Fowler bliki "BCs require human cultural decisions")
  │
  └─ YES → [질문 2] cycle 이 같은 BC 안에서 발생했는가?
        ├─ YES → [질문 3] cycle 이 같은 Aggregate root 안의 entity 끼리인가?
        │   ├─ YES → severity = LOW (Vernon IDDD)
        │   └─ NO → severity = MEDIUM (cross-aggregate 양방향)
        │
        └─ NO (다른 BC 간) → severity = HIGH (Evans Blue Book Ch.14)
```

**권장**: 옵션 A. 본 방법론이 Phase 4 라우팅 메커니즘을 이미 갖고 있어 `decision_required = true` 를 자연스럽게 흡수.

---

## §2. F-016 Hibernate ddl-auto 매트릭스

### 2.1 Hibernate 공식 — `org.hibernate.tool.schema.Action` (Javadoc)

**출처**: https://docs.hibernate.org/orm/6.6/javadocs/org/hibernate/tool/schema/Action.html

**Javadoc 직접 인용** (Hibernate ORM 6.6):

| Enum | Javadoc |
|---|---|
| `NONE` | "No action." |
| `CREATE_ONLY` | "Create the schema." |
| `DROP` | "Drop the schema." |
| `CREATE` | "Drop and then recreate the schema." |
| `CREATE_DROP` | "Drop the schema and then recreate it on `SessionFactory` startup. Additionally, drop the schema on `SessionFactory` shutdown." |
| `VALIDATE` | "Validate the database schema." |
| `UPDATE` | "Update (alter) the database schema." |

### 2.2 Spring Boot 의 ddl-auto 자동 설정 (공식)

**출처**: https://docs.spring.io/spring-boot/how-to/data-initialization.html

> "An embedded database is identified by looking at the `Connection` type and JDBC url. `hsqldb`, `h2`, or `derby` are embedded databases and others are not. If an embedded database is identified and no schema manager (Flyway or Liquibase) has been detected, `ddl-auto` defaults to `create-drop`. In all other cases, it defaults to `none`."

**Spring Boot embedded 인식 DB**: H2, HSQLDB, Derby.

### 2.3 `validate` / `update` 실제 동작 (Baeldung 보조)

> **update**: "The object model created based on the mappings (annotations or XML) is compared with the existing schema, and then Hibernate updates the schema according to the diff. **It never deletes the existing tables or columns even if they are no longer required by the application.**"
> **validate**: "Hibernate only validates whether the tables and columns exist; otherwise, it throws an exception."

| 동작 | 운영 DB 영향 | 데이터 손실 위험 |
|---|---|---|
| `none` | 없음 | 없음 |
| `validate` | read-only 검증 | 없음 (불일치 시 startup fail) |
| `update` | additive ALTER | **있음** |
| `create` | DROP + CREATE | **확정 손실** |
| `create-drop` | startup DROP+CREATE, shutdown DROP | **확정 손실** |

### 2.4 운영 DB 존재 유무 × ddl-auto 4×2 매트릭스

| ddl-auto \ 운영 DB | DB 있음 (production) | DB 없음 (greenfield/dev) |
|---|---|---|
| `none` | **권장**. ERD/migration 도구가 진실원천 | 권장하지 않음 |
| `validate` | **강력 권장 운영 모드**. 엔티티-DB 불일치 시 startup 차단 | DB 없으면 startup fail |
| `update` | **위험**. 부주의한 ALTER 가능. Flyway/Liquibase 와 충돌 | 개발 편의용으로만 허용 |
| `create-drop` | **금지**. 운영 데이터 전부 손실 | 테스트 한정 |

### 2.5 v1.1.2 §3.4 권장 매트릭스 (초안)

```
DDL-auto 값       | DB 정보 있음                     | DB 정보 없음
------------------|----------------------------------|--------------------------------
none              | 운영 DB > ERD > ORM (기존 정책)  | ERD > ORM (DB 없음)
validate          | 운영 DB > ORM = ERD              | ORM = ERD (DB 없음)
update            | 운영 DB > ORM(추가만) > ERD      | finding 자동 생성
create-drop       | finding 자동 생성 (위험)         | finding 자동 생성 (위험)
```

**Flyway/Liquibase 존재 시**: migration 파일이 진실원천 우위.

---

## §3. F-009 환경별 신뢰도 (Linguist / Trees API / Tree-sitter / cloc)

### 3.1 GitHub Linguist (공식)

**출처**: https://github.com/github-linguist/linguist/blob/main/docs/how-linguist-works.md

> "The percentages are calculated based on the **bytes of code** for each language as reported by the List Languages API."
> Linguist excludes "all files that it determines to be **binary data, vendored code, generated code, documentation**."

**언어 식별 우선순위**:
1. Vim/Emacs modeline → 2. Filename → 3. Shebang → 4. Extension → 5. XML header → 6. Man page → 7. Heuristics → 8. Naïve Bayesian classification

**중요**: Linguist 는 **bytes 만 보장**. byte → LOC 공식은 공식 부재.

### 3.2 cloc (참조 도구)

**출처**: https://github.com/AlDanial/cloc

> "cloc counts blank lines, comment lines, and physical lines of source code in many programming languages."

- 179 개 언어 지원
- byte → LOC 변환 메서드는 cloc 도 제공하지 않음

### 3.3 byte → LOC 추정 (방법론 자체 정의 영역)

공식 표준 부재. 본 방법론 자체 정의:
- byte/35 = ASCII 기준 평균 line ~35 bytes 통계적 가정
- 한국어 주석/identifier 다수 시 LOC 과대 추정 (UTF-8 한국어 = 3 bytes/char)
- Kotlin/TypeScript 짧은 line 시 과소 추정
- → 본 방법론 권장: **"estimated_loc_range"** 형태로 보고

### 3.4 GitHub Trees API (공식)

**출처**: https://docs.github.com/en/rest/git/trees

> "The limit for the tree array is **100,000 entries** with a maximum size of **7 MB** when using the recursive parameter."
> "If `truncated` is true in the response then the number of items in the tree array exceeded our maximum limit."

**대응**: `truncated = true` 시 sub-tree 분할 fetch + 신뢰도 자동 감점.

### 3.5 Tree-sitter (공식)

**출처**: https://tree-sitter.github.io/tree-sitter/

> "Tree-sitter is an incremental parsing library."
> "Robust enough to provide useful results even in the presence of syntax errors"

지원 언어: Java, Kotlin, TypeScript 등.

**한계 노트**: "결정적 처리" 표현은 공식 문서에 직접 등장 X. syntax error 시 partial tree 반환 가능 → "syntactically valid 부분에 한정" caveat 필요.

### 3.6 환경별 신뢰도 차등 (v1.1.2 §6 권장 표)

| 산출 항목 | git-clone + cloc/linguist/tree-sitter | web_fetch (Trees + Languages API) |
|---|---|---|
| LOC | 1.00 (cloc 직접) | 0.55 (byte/35 추정) |
| Tree | 1.00 (전체 파일 트리) | 0.95 (truncated 가능; truncated=true 시 0.85) |
| 언어 분포 | 1.00 (linguist 직접) | 0.95 (Languages API = bytes 동일) |
| ORM 자동 감지 | 0.95 (4단서 점검) | 0.85 (단서 일부만 fetch) — 4단서 모두 시 0.95 |
| 빌드 도구 감지 | 0.95 (실제 build 시도) | 0.90 (build file 존재 확인) |

**주의**: 위 수치는 **본 방법론의 자체 정의** (학술/표준 출처 부재). v1.1.2 ADR 에 "공식 표준 부재로 경험적 calibration" 명시 권장.

---

## §4. F-007 JSON Schema Draft 2020-12 + inventory.schema.json

### 4.1 Draft 2020-12 표준 (공식)

**출처**: https://json-schema.org/draft/2020-12/release-notes

**$schema URI**: `https://json-schema.org/draft/2020-12/schema`

핵심 변경:
- "unevaluatedProperties and unevaluatedItems keywords have been moved from the applicator vocabulary to their own designated vocabulary."
- "The format vocabulary was broken into two separate vocabularies: 'format-annotation' and 'format-assertion'."

### 4.2 `$id` / `$ref` / `$defs` 사용 표준

**출처**: https://json-schema.org/understanding-json-schema/structuring

> "$id is a URI-reference without a fragment that resolves against the retrieval-uri."
> "it's recommended that you always use an absolute URI when declaring a base URI with `$id`."
> "$defs keyword gives us a standardized place to keep subschemas intended for reuse in the current schema document."

### 4.3 `additionalProperties` vs `unevaluatedProperties`

**출처**: https://json-schema.org/understanding-json-schema/reference/object

> "Setting the `additionalProperties` schema to `false` means no additional properties will be allowed."
> "The `unevaluatedProperties` keyword is similar to `additionalProperties` except that it can recognize properties declared in subschemas."

**v1.1.2 권장**:
- inventory.schema.json 최상위: `additionalProperties: false`
- `oneOf` / `allOf` 분기 시: `unevaluatedProperties: false`

### 4.4 manifest 스타일 패턴 (AsyncAPI 참조)

**출처**: https://www.asyncapi.com/docs/reference/specification/v3.0.0

**AsyncAPI 3.0 top-level required**:
1. `asyncapi` (REQUIRED)
2. `info` (REQUIRED)

**Optional**: `servers`, `channels`, `components`, `operations` 등.

**v1.1.2 적용 패턴**:
- 최상위 required 2~3 개로 최소화 (`meta`, `repo` 등)
- Optional 영역은 별도 분리

### 4.5 inventory.schema.json 권장 구조 (초안)

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://internal.smilegate.com/ai-native-methodology/schemas/inventory.schema.json",
  "title": "Inventory",
  "description": "AI-Native 방법론 v1.1.2 Phase 1 산출물: 코드베이스 인벤토리",
  "type": "object",
  "required": ["meta", "repo", "stack"],
  "additionalProperties": false,
  "properties": {
    "meta": { "$ref": "#/$defs/meta" },
    "repo": { "$ref": "#/$defs/repo" },
    "stack": { "$ref": "#/$defs/stack" },
    "architecture_style_candidates": {
      "type": "array",
      "items": { "$ref": "#/$defs/architecture_candidate" }
    },
    "modules_for_priority_analysis": {
      "type": "array",
      "items": { "$ref": "#/$defs/module" }
    },
    "warnings": {
      "type": "array",
      "items": { "type": "string" }
    }
  },
  "$defs": {
    "meta": { "...": "..." },
    "repo": { "...": "..." },
    "stack": { "...": "..." },
    "architecture_candidate": {
      "type": "object",
      "required": ["style", "confidence"],
      "properties": {
        "style": { "type": "string" },
        "confidence": { "type": "number", "minimum": 0, "maximum": 0.7 }
      }
    },
    "module": {
      "type": "object",
      "required": ["name", "source"],
      "properties": {
        "name": { "type": "string" },
        "source": { "enum": ["ground_truth", "llm_inferred", "derived"] }
      }
    }
  }
}
```

**키 결정 사항**:
- 최상위 required = 3개 — AsyncAPI minimal-required 패턴
- `confidence: maximum: 0.7` cap = 본 방법론의 architecture_style 추론 한계 명시
- `source` enum = F-015 cross-validation 패턴과 정합

---

## §5. 통합 권장 (4 finding 별 v1.1.2 적용 옵션)

### 5.1 권장 매트릭스

| Finding | 권장 옵션 | 핵심 출처 | 변경 범위 |
|---|---|---|---|
| **F-023** ⭐ | 옵션 A: 4-way branching (BC 미정의 → decision_required, 같은 BC cross-aggregate → low/medium, BC 간 → high) | Spring Modulith 2.0.6 + ArchUnit 1.4.2 + Vernon IDDD + Fowler bliki + Evans Blue Book | phase-3-arch.md §3.1 + 신뢰도 표 + finding 분류표 |
| **F-016** | 4×2 매트릭스 (ddl-auto × DB), Flyway/Liquibase 우선 규칙 | Hibernate ORM 6.6 Action.html + Spring Boot data-initialization | phase-2-db.md §3.4 + finding-rules.json |
| **F-009** | 환경 종속 신뢰도 표 분리 (git-clone vs web_fetch), Trees API truncated 명시 | Linguist + Trees API + Tree-sitter + cloc | phase-1-init.md §6 |
| **F-007** | inventory.schema.json + template 추가, Draft 2020-12 + AsyncAPI 패턴 | JSON Schema 2020-12 + AsyncAPI 3.0 | schemas/ + templates/ |

### 5.2 우선순위 정당성

- **F-023 1순위**: 도구 결과(알고리즘) ↔ 도메인 의도(DDD strategic design) 결합 표준 부재가 가장 큰 false positive 위험. PoC phase-3 결과 신뢰성 직접 영향.
- **F-016 2순위**: 운영 DB 의 ddl-auto = create-drop 가 실제 운영에서 발생하면 데이터 손실. 자동 finding 도입 = 안전성 직결.
- **F-009 3순위**: 신뢰도 수치는 calibration 영역. 학술 출처 부재해도 자체 정의 가능.
- **F-007 4순위**: 기능적 risk 가장 낮음. Draft 2020-12 표준 준용으로 신규 작성 비용 낮음.

### 5.3 v1.1.2 ADR 권장 추가

- **ADR-006**: cycle detection severity branching (F-023)
- **ADR-007**: ddl-auto 매트릭스 (F-016)
- **ADR-008**: 환경별 신뢰도 차등 (F-009)
- **ADR-009**: inventory schema 표준 (F-007)

---

## §6. 인용 출처

### 6.1 F-023

1. Wikipedia, "Tarjan's strongly connected components algorithm." https://en.wikipedia.org/wiki/Tarjan%27s_strongly_connected_components_algorithm (accessed 2026-04-28)
2. Spring Modulith 2.0.6 Reference. https://docs.spring.io/spring-modulith/reference/
3. Spring Modulith Reference, "Verification." https://docs.spring.io/spring-modulith/reference/verification.html
4. Spring Modulith Reference, "Fundamentals." https://docs.spring.io/spring-modulith/reference/fundamentals.html
5. ArchUnit 1.4.2 User Guide. https://www.archunit.org/userguide/html/000_Index.html
6. Martin Fowler, "BoundedContext." https://martinfowler.com/bliki/BoundedContext.html
7. Vaughn Vernon, *Implementing Domain-Driven Design*. Addison-Wesley, 2013. ISBN 978-0321834577.
8. Eric Evans, *Domain-Driven Design*. Addison-Wesley, 2003. ISBN 978-0321125217. Part IV.

### 6.2 F-016

9. Hibernate ORM 6.6 Javadoc, `org.hibernate.tool.schema.Action`. https://docs.hibernate.org/orm/6.6/javadocs/org/hibernate/tool/schema/Action.html
10. Spring Boot Reference, "Data Initialization." https://docs.spring.io/spring-boot/how-to/data-initialization.html
11. Spring Boot Reference, "SQL Databases." https://docs.spring.io/spring-boot/reference/data/sql.html
12. Spring Boot API, `DatabaseDriver`. https://docs.spring.io/spring-boot/api/java/org/springframework/boot/jdbc/DatabaseDriver.html

### 6.3 F-009

16. GitHub Linguist, "How Linguist Works." https://github.com/github-linguist/linguist/blob/main/docs/how-linguist-works.md
17. GitHub REST API, "List repository languages." https://docs.github.com/en/rest/repos/repos#list-repository-languages
18. GitHub REST API, "Get a tree." https://docs.github.com/en/rest/git/trees
19. Tree-sitter Documentation. https://tree-sitter.github.io/tree-sitter/
20. cloc, GitHub repository. https://github.com/AlDanial/cloc

### 6.4 F-007

21. JSON Schema Draft 2020-12 Release Notes. https://json-schema.org/draft/2020-12/release-notes
22. JSON Schema, "Modular JSON Schema combination." https://json-schema.org/understanding-json-schema/structuring
23. JSON Schema, "Object reference." https://json-schema.org/understanding-json-schema/reference/object
24. AsyncAPI 3.0.0 Specification. https://www.asyncapi.com/docs/reference/specification/v3.0.0

### 6.5 환경/인프라 confirm 사항

- Spring Modulith **stable: 2.0.6** (preview 2.1.0-RC1)
- ArchUnit **1.4.2**
- Hibernate ORM **6.6.x** (Spring Boot 3.4 기준)
- JSON Schema Draft **2020-12** (2020-12-08 published)

### 6.6 표준 부재 영역 (본 방법론 자체 정의 필요)

- byte → LOC 변환 공식 (학술/공식 표준 없음)
- cycle severity branching (도구 ↔ DDD 결합 표준 없음)
- 환경별 신뢰도 차등 수치 (calibration 영역)

---

> 본 리서치 종료. 4 finding 모두 공식/저자권위 출처로 v1.1.2 격상 근거 확보.
