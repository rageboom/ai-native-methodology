---
name: analysis-from-plan-doc
description: Use when user points to planning documents (Markdown / PDF / Notion export zip or directory) as analysis input. Extracts business intent, use case candidates, glossary. Track = both (BE + FE). Stage = analysis (input). Typically auto-dispatched by analysis-input-orchestrate.
allowed-tools: Read, Glob, Grep, Bash
---

# analysis-from-plan-doc — 기획 문서 흡수

Markdown / PDF / Notion export 문서를 입력 받아 비즈니스 의도 + UC 후보 + 용어집 추출.

> **단일 책임**: 기획 문서 흡수. 코드 / spec / 자연어 prompt 흡수는 각각 다른 skill.

## 사전 조건

- 사용자가 문서 경로 제공: `.md` 파일 / `.pdf` 파일 / Notion export `.zip` 또는 풀린 디렉토리
- PDF = Read 도구 20 page cap (큰 PDF 는 분할 의무 — 사용자 안내 후 진행)
- Notion export 1차 = markdown + csv / asset 이미지는 path 참조만 (binary 흡수 ❌)

## 절차

1. **입력 형식 감지** — 확장자 + 디렉토리 구조:
   - `.md` 단일 → 본문 직접 흡수
   - `.pdf` 단일 → Read 도구 (`pages: "1-20"`) 페이지 분할
   - `.zip` → `unzip -d <tmp>` 후 디렉토리 모드로 진행
   - 디렉토리 (Notion export) → `index.html` 있으면 sitemap 활용 / 없으면 모든 `.md` 재귀
2. **Notion subpage hash strip** — 파일명 `Page Name a1b2c3d4....md` → `Page Name.md` 정규화 (UUID hash 32자리 suffix 제거).
3. **본문 파싱** — markdown heading (H1~H4) 으로 섹션 분리 / 표 (GFM table) 보존 / 코드 블록 분리.
4. **CSV 동반 처리** — Notion database export 는 별도 `.csv` 로 / page 본문과 cross-link.
5. **의도 추출** — H1/H2 제목 + 첫 문단 + bullet 리스트의 "목적/배경/범위" 섹션 우선 read.
6. **UC 후보 추출 (원문 인용 의무 / F-163)** — "사용자 시나리오" / "기능 목록" / "use case" / "유즈케이스" 키워드 섹션 + 동사 + 대상 entity. 각 UC 후보는 `source_section` (heading) 뿐 아니라 도출 근거 문서 원문을 `source_excerpt` (verbatim) 에 발췌. 문서에 명시된 UC = `provenance: "verbatim"`. 문서 내용 기반 LLM 종합·추론 UC = `provenance: "inferred"` (후속 stage 사용자 확인 의무).
7. **용어집 추출 (원문 인용 / F-163)** — "용어" / "glossary" / "약어" 섹션 + 본문 안 backtick 또는 정의 패턴 (`A: B` 또는 "A 란 B 를 의미한다"). 문서 명시 정의 = `provenance: "verbatim"` / LLM 종합 정의 = `provenance: "inferred"`.
8. **산출 작성** — `.aimd/<scope>/planning/plan-doc-extract.json` (schema = `schemas/plan-doc-extract.schema.json`).

## no-simulation 의무 / 산출 자격 조건 (F-163)

기획 문서 흡수는 verbatim 인용 우선 (analysis-from-figma F-162 / discovery-from-\* source-grounded 패턴 대칭):

- **원문 인용 우선** — UC 후보 / 용어 정의는 문서 원문에 있으면 `source_excerpt` (verbatim) + `provenance: "verbatim"` 동반. 문서 내용을 LLM 요약·창작으로 채우고 출처 없이 등재 ❌.
- **inferred 명시 의무** — 문서에 직접 명시 안 됐으나 내용 기반 종합한 entry 는 `provenance: "inferred"` 명시 (verbatim 으로 위장 ❌). intent_summary 는 본질상 요약이라 예외 (전체 의도 1~3문장).
- **inferred 비율 노출** — uc_candidates / glossary 중 `provenance: "inferred"` 비율 > 0 이면 후속 GO-STOP gate 에 노출 (사용자 확인 의무). 추론 UC 가 "문서 근거" 로 silent 통과 차단.

> 자동 검증: `tools/analysis-extraction-validator --extract <plan-doc-extract.json>` — provenance 누락(high) + inferred 비율 임계(medium) hard gate (v11.0.3 / discovery-extraction-validator 대칭).

## 산출물

- `.aimd/<scope>/planning/plan-doc-extract.json` (strict / additionalProperties:false / json 단독 — ADR-011)
- 추출 결과는 orchestrate merge 단계에서 `input-summary.json` 안 통합

## 본체 명세 참조

- `methodology-spec/workflow/input.md` §5종 입력 (d)
- `methodology-spec/plugin-charter.md` §1 R8
- `methodology-spec/finding-system.md` F-163 (input-adapter source-grounded 비대칭 전수 점검 — 본 보강의 모 finding) + F-162 (analysis-from-figma 동형 fix)

## When NOT to invoke

- 기획 문서 부재 (사용자 자연어 의도만) → `analysis-from-prompt`
- 큰 PDF (≫ 20 page) — 사용자 분할 안내 후 chunk 별 재호출 (한 번에 흡수 ❌)
- 이미지·다이어그램만 있는 문서 (텍스트 미존재) → 본 skill scope 외 / Figma 자료라면 `analysis-from-figma`
