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
6. **UC 후보 추출** — "사용자 시나리오" / "기능 목록" / "use case" / "유즈케이스" 키워드 섹션 + 동사 + 대상 entity.
7. **용어집 추출** — "용어" / "glossary" / "약어" 섹션 + 본문 안 backtick 또는 정의 패턴 (`A: B` 또는 "A 란 B 를 의미한다").
8. **산출 작성** — `.aimd/<scope>/planning/plan-doc-extract.json` (schema = `schemas/plan-doc-extract.schema.json`).

## 산출물

- `.aimd/<scope>/planning/plan-doc-extract.json` (strict / additionalProperties:false)
- 이중 렌더링 (`plan-doc-extract.md`) 은 orchestrate merge 단계에서 `input-summary.md` 안 통합

## 본체 명세 참조

- `methodology-spec/workflow/input.md` §5종 입력 (d)
- `methodology-spec/plugin-charter.md` §1 R8

## When NOT to invoke

- 기획 문서 부재 (사용자 자연어 의도만) → `analysis-from-prompt`
- 큰 PDF (≫ 20 page) — 사용자 분할 안내 후 chunk 별 재호출 (한 번에 흡수 ❌)
- 이미지·다이어그램만 있는 문서 (텍스트 미존재) → 본 skill scope 외 / Figma 자료라면 `analysis-from-figma`
