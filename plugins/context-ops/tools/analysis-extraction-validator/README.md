# analysis-extraction-validator

v11.0.3 — analysis stage 입력 어댑터 산출물의 **source-grounded hard gate**.

F-162 (analysis-from-figma verbatim 검증 부재) + F-163 (input-adapter 비대칭 전수 점검)의 구조적 해소. discovery stage 의 `discovery-extraction-validator` 가 가진 source-grounded 게이트를 analysis stage 산출물 (`figma-extract.json` / `plan-doc-extract.json`) 에도 대칭 적용.

## 검증 항목

| # | 대상 | 조건 | severity |
|---|------|------|----------|
| 1 | figma TEXT 노드 | `text_content` (verbatim) 부재 | **critical** |
| 2 | figma TEXT 노드 | `provenance: "inferred"` (가시 텍스트 추론 금지) | **high** |
| 3 | figma TEXT / plan-doc uc·glossary | `provenance` 필드 부재 (silent 통과 차단) | **high** |
| 4 | 공통 | `inferred` 비율 > threshold (default 0.5) | **medium** (사용자 확인 권고) |

`critical` / `high` 존재 시 exit 1 (gate fail). `medium` 만이면 exit 0.

## 사용

```bash
analysis-extraction-validator --extract .ai-context/<scope>/planning/figma-extract.json
analysis-extraction-validator --extract .ai-context/<scope>/planning/plan-doc-extract.json --threshold 0.3 --json
analysis-extraction-validator --extract <path> --dry-run   # finding 출력만 / exit 0
```

adapter 종류는 산출물 키 구조로 자동 감지 (`components`/`screens` → figma, `uc_candidates`/`glossary` → plan-doc).

## 적용 범위 (현재 / carry)

- ✅ figma-extract / plan-doc-extract (provenance 필드 보유 산출물)
- ⏳ swagger-extract (evidence 필드 carry / parser verbatim 이라 LOW)
- prompt-extract 는 `assumptions`+`confidence` 별도 메커니즘 / html-template 는 외부 analyzer 실행 의무 → 본 validator 대상 외 (F-163 판정)

## 인용

- `methodology-spec/finding-system.md` F-162 / F-163
- `tools/discovery-extraction-validator/` (대칭 패턴 원본)
