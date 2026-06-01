# input phase: 입력 정리 (Input Preparation)

> **v3.3.0 G2 종결 이후 (2026-05-15)**: 본 단계는 **3중 양립** — (1) 사용자 수동 (자료를 inputs/ 폴더에 배치) / (2) skill 명시 호출 (`analysis-from-{prompt,swagger,plan-doc,figma}` / `analysis-input-collection`) / (3) `analysis-input-orchestrate` 자동 dispatch (자연어 발화 1회 → BCDE 4 skill 자동 + merge + cross-ref + conflict). 셋 모두 정합.

---

## 1. 목적

분석 대상 레포와 부가 자료를 정리·정돈하여 후속 phase 가 사용할 수 있게 한다.

**답하는 질문**:
- 어떤 소스를 분석할 것인가?
- 추가로 제공할 자료는 무엇인가? (ERD, 운영DB, 기획서 등)
- 자료의 형식과 위치는?

---

## 2. 입력

★ ★ ★ **R8 입력 5종 (charter §1) — v3.3.0 G2 종결 시 자산 대칭 도달**:

| R8 종류 | 입력 | 흡수 skill | 출처 |
|---|---|---|---|
| (a) 기존 코드 | 분석 대상 레포 | `analysis-input-collection` + `analysis-source-inventory` 등 22 skill | git clone |
| (b) Figma | Figma desktop selection | `analysis-from-figma` | Figma 앱 + frame 선택 |
| (c) Swagger / OpenAPI | openapi.yaml / swagger.json | `analysis-from-swagger` | 파일 경로 / URL |
| (d) 기획 문서 | Markdown / PDF / Notion export | `analysis-from-plan-doc` | 파일 경로 / zip |
| (e) 자연어 prompt | 자연어 발화 (메타데이터 + 의도) | `analysis-from-prompt` (잔여 의도) + `analysis-input-orchestrate` (메타데이터 파싱 + dispatch) | 사용자 직접 입력 |

기타 선택 입력 (analysis stage 자산 보강용):

| 입력 | 출처 | 필수/선택 |
|---|---|---|
| ERD | DBML, Mermaid, 이미지 | 선택 |
| 운영 DB 메타 | INFORMATION_SCHEMA SQL | 선택 |
| 도메인 컨텍스트 | domain-context.md (LLM grounding 용) | 선택 (권장) |
| API 테스트 | Postman collection, 요청/응답 샘플 | 선택 |

---

## 3. 처리

### 3.1 디렉토리 생성

```
{분석대상레포}/
└── .ai-analysis/
    └── inputs/
        ├── erd/                    # ERD 파일
        ├── db-meta/                # 운영 DB 메타
        ├── planning-docs/          # 기획 문서
        ├── design-specs/           # 디자인 명세
        ├── domain-context.md       # 도메인 컨텍스트 (grounding)
        └── api-tests/              # API 테스트 데이터
```

### 3.2 사용자 작업 (3중 양립)

**경로 A — 수동**:
1. 분석 대상 레포 git clone
2. `.ai-analysis/inputs/` 디렉토리 생성
3. 가용한 자료를 해당 하위 디렉토리에 배치
4. (권장) `domain-context.md` 작성 — 비즈니스 영역, 핵심 흐름, 용어 등

**경로 B — skill 명시 호출**:
- 입력 종류별 skill 직접 호출 — `/analysis-from-swagger` / `/analysis-from-figma` / `/analysis-from-plan-doc` / `/analysis-from-prompt` / `/analysis-input-collection`

**경로 C — orchestrate 자동 dispatch (v3.3.0 G2)**:
- 자연어 발화 1회 (메타데이터 + 의도 섞임) → `analysis-input-orchestrate` 자동 호출
- 휴리스틱 (URL/path 패턴 + 키워드) + 인라인 마커 (`@swagger:`, `@figma:`, `@plan-doc:`) 으로 1단계 파싱
- BCDE 4 skill 자동 dispatch + merge + cross-ref + conflict 검출 (정량 산식)
- 산출 = `.aimd/<scope>/planning/input-summary.json` (json 단독 SSOT / ADR-011)
- Hybrid rule: 총 입력 ≤ 50K token = 직접 chain / > 50K = Task tool sub-agent

### 3.3 환경 제약 케이스

git clone 이 불가능한 환경 (예: web-only):
- web_fetch 로 핵심 파일만 선택적 가져오기
- GitHub API 로 디렉토리 구조 조회
- **우선순위**: build 설정 → 소스 코드 (핵심 도메인) → 설정 파일

### 3.4 ★ Scenario detection (BE/FE 분리 운영 — ADR-FE-004 정합)

| signal | A 분리 | B JS 풀스택 | C JSP |
|---|---|---|---|
| package.json + 별도 BE repo / pom.xml | ✅ | — | (조건부) |
| package.json deps: next / nuxt / remix / @astrojs / solid-start / sveltekit | — | ✅ | — |
| has_api_routes_dir (pages/api/ / app/api/ / server/api/) | — | ✅ | — |
| 파일 확장자 .jsp / .thymeleaf / .erb | — | — | ✅ |
| BE template engine (spring-boot-starter-thymeleaf / jstl) | — | — | ✅ |
| **default when unclear** | ✅ | — | — |

→ 본 detection 으로 `_manifest.yml` 의 `scenario` 필드 자동 결정. mixed 케이스 (Tier 1+2+4 등) = 사용자 confirm 의무.

→ Scenario 별 산출 명령 차이 + IR 4계층 매트릭스 = `methodology-spec/be-fe-separation.md` 참조.

---

## 4. 출력

### 4.1 파일 구성

```
.ai-analysis/inputs/
├── _manifest.yml                  # 입력 매니페스트 (`discovery` phase 가 참조)
├── source-info.md                 # 분석 대상 메타정보
└── (입력 파일들)
```

### 4.2 _manifest.yml 형식

```yaml
generated_at: 2026-04-26
source:
  repo_url: https://github.com/example/project
  branch: main
  commit_sha: abc1234

inputs:
  source_code: true
  erd: false
  orm: auto_detect         # `discovery` phase 에서 자동 감지
  operational_db: false
  planning_docs: false
  design_specs: false
  domain_context_md: true
  postman_or_api_test: false

expected_confidence_average: 0.78   # ADR-003 공식 v1 로 산정
formula_version: "v1"
applied_modifiers:
  - { input: domain_context_md, bonus: 0.03 }
applied_penalties: []

# ★ v1.4 Stage 6 신설 — BE/FE 분리 운영 Scenario (ADR-FE-004)
scenario: A   # A 분리 default / B JS 풀스택 / C JSP
scenario_signals:
  - { signal: package_json_present, detected: true }
  - { signal: separate_be_repo, detected: true }
  - { signal: jsp_template_files, detected: false }
```

### 4.3 source-info.md 형식

```markdown
# 분석 대상 정보

- 레포: {URL}
- 언어: {1차 추정}
- 프레임워크: {1차 추정}
- 라이선스: {라이선스}
- Ground Truth 자료: {있으면 목록}
```

---

## 5. 승인 게이트

```
□ .ai-analysis/inputs/ 디렉토리 생성 완료
□ _manifest.yml 작성 완료
□ source-info.md 작성 완료 (권장)
□ 입력 파일이 해당 디렉토리에 배치 완료
□ domain-context.md 작성 여부 확인 (권장)
```

승인 후 `discovery` phase 진입.

---

## 6. 신뢰도

이 phase 는 사용자 수동 작업이므로 신뢰도 산정 대상이 아님.
다만 **입력의 양과 질이 후속 phase 의 신뢰도를 결정** (ADR-003 §6).

---

## 7. 다음 단계

`discovery` phase (`/analyze-init`) 진입.
