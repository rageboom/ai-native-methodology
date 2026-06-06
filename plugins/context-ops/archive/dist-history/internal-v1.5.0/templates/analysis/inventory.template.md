# 인벤토리 (Inventory)

> Phase 1 (init) 사람용 보고서. 머신용 산출물은 `inventory.json` 참조.
> 본 템플릿은 v1.1.2 (F-007) 신설. schema 위치: `schemas/inventory.schema.json`

---

## 1. 개요

| 항목 | 값 |
|---|---|
| 레포명 | {{name}} |
| 분석 시각 | {{generated_at}} |
| commit SHA | {{source_commit_sha}} |
| 방법론 버전 | v1.1.2 |
| 전체 신뢰도 | {{confidence}} |

---

## 2. 규모

| 항목 | 값 | 산출 방법 |
|---|---|---|
| 전체 파일 수 | {{total_files}} | deterministic |
| 전체 LOC | {{total_loc}} | {{loc_extraction_method}} |
| 디렉토리 트리 entries | {{total_entries}} | {{directory_tree_extraction.method}} |

> ⚠️ `loc_extraction_method == heuristic_byte_per_35` 인 경우 LOC 는 **추정값**. meta.warnings 확인.
> ⚠️ `directory_tree_extraction.truncated == true` 인 경우 일부 디렉토리 누락. (예: GitHub Trees API 7MB/100k 한계)

### 2.1 주요 언어

| 언어 | bytes | LOC | % |
|---|---|---|---|
| {{lang}} | {{bytes}} | {{loc}} | {{pct}} |

---

## 3. 스택

### 3.1 Backend
- **언어**: {{stack.backend.language}}
- **프레임워크**: {{stack.backend.framework}}
- **ORM**: {{stack.backend.orm[*].name}} (confidence {{...}})
- **DB**: {{stack.backend.db}}

### 3.2 Frontend
- **언어**: {{stack.frontend.language}}
- **프레임워크**: {{stack.frontend.framework}}
- **상태관리**: {{stack.frontend.state_management}}
- **UI 라이브러리 단서**: {{stack.frontend.ui_library_indicators}}

---

## 4. 아키텍처 스타일 후보

> Phase 1 한계로 cap 0.7. 최종 분류는 Phase 3.

| 스타일 | confidence | evidence |
|---|---|---|
| {{style}} | {{confidence}} | {{evidence}} |

---

## 5. 우선 분석 권장 모듈

| 경로 | 사유 | LOC | 파일 수 |
|---|---|---|---|
| {{path}} | {{reason}} | {{loc}} | {{file_count}} |

---

## 6. 경고 (warnings)

> 환경 종속/추정 항목 명시 (F-009 결정성 표 caveat).

- {{warning_1}}
- {{warning_2}}

---

## 7. 입력 출처 (inputs_used)

- {{inputs_used[0]}}
- ...

---

## 다음 단계

→ Phase 2 (`/analyze-db`) 진입.
