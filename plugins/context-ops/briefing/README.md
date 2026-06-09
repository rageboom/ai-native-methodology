# briefing/ — 사내 브리핑 자료 (마크다운 정본)

> **본 폴더 = 정본 / Confluence = 발행 채널.**
> Confluence 페이지를 직접 편집하지 마세요. 본 마크다운을 고친 후 재업로드합니다.

## 구성

| 파일                      | 페이지                                     | Confluence ID |
| ------------------------- | ------------------------------------------ | ------------- |
| `01-main.md`              | AI-Native 개발 방법론 — 종합 브리핑 (메인) | 702650185     |
| `02-first-5min.md`        | 동료의 첫 5분 — 사용 시나리오              | 702650188     |
| `03-14-tools.md`          | 검증 도구 역할표 (파일명은 page_id 매핑 보존 위해 유지) | 702650191     |
| `04-version-history.md`   | 버전별 진화사 (한 페이지씩)                | 702650196     |
| `confluence-mapping.json` | 매핑 메타데이터                            | —             |
| `slides/methodology-deck.md` | 발표용 덱 (Confluence 미매핑 / 별도 자산) | —             |

위치 (AITF 스페이스):

```
AI Native 개발 방법론 (697298343)
└── 종합 브리핑 (702650185)
    ├── 동료의 첫 5분 (702650188)
    ├── 검증 도구 역할표 (702650191)
    └── 버전별 진화사 (702650196)
```

> page `702650191` 의 Confluence 제목은 `검증 도구 역할표` 로 정리됨 (2026-06-09 / 도구 개수는 계속 늘어나므로 제목에 숫자를 박지 않음).

## 편집 → 재배포 워크플로우

```bash
# 1. 마크다운 편집
vim briefing/01-main.md

# 2. Confluence 재업로드 (기존 페이지 갱신)
#    page_id 로 update / title·body 만 변경 가능 / parent 변경은 미지원.
#    Claude Code 세션에서 MCP 도구 사용 권장:
#      wiki_page_update(page_id="702650185", ...)
#    첫 업로드(신규 페이지)만 스크립트 경로:
#      cd /Users/sangcl/Documents/Development/Design/internal-wiki/backend
#      source .venv/bin/activate
#      PYTHONPATH=. python scripts/upload_md_to_confluence.py \
#        /Users/sangcl/Documents/Development/Study/ai-native-methodology/plugins/context-ops/briefing/01-main.md \
#        AITF 697298343

# 3. RAG 재색인 (변경 페이지 ID 만)
#   ingest_pages(["702650185"])
```

## 빌드 제외 확인

본 폴더는 `scripts/build-plugin.js` 의 `INCLUDE` 목록에 포함되지 않아 **배포 산출물에 들어가지 않습니다**. 동료 배포 자산이 아닌 저자(나)의 사내 브리핑 자료이므로 의도적입니다.

## 작성 이력

- 2026-05-08 — v2.2.0 시점 작성. 4 페이지 신설 + AITF 스페이스 Confluence 업로드 + RAG 인제스트.
- 2026-05-14 — v2.5.1 시점 갱신 (Layer 2 LLM / dual representation / 사내 GHE install 호환성).
- 2026-06-09 — **v0.24.0 정합 전면 재작성**. v2.5.1 이후 6단계 패러다임 전환(스킬 네임스페이스 → 6-stage chain → BE/FE 분리 → json-only → 0.x 버전 리셋 → BR-split·living-sync)과 pnpm 모노레포·`context-ops` 리네임을 반영. 깨지기 쉬운 정밀 카운트(테스트 수·카테고리별 스킬 수)는 줄이고 핵심 수치만 유지(다음 릴리스 재-stale 방지). 4 페이지 + confluence-mapping 갱신 / slides 덱은 이번 범위 제외.
