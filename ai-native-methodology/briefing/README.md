# briefing/ — 사내 브리핑 자료 (마크다운 정본)

> **본 폴더 = 정본 / Confluence = 발행 채널.**
> Confluence 페이지를 직접 편집하지 마세요. 본 마크다운을 고친 후 재업로드합니다.

## 구성

| 파일 | 페이지 | Confluence ID |
|---|---|---|
| `01-main.md` | AI-Native 개발 방법론 — 종합 브리핑 (메인) | 702650185 |
| `02-first-5min.md` | 동료의 첫 5분 — 사용 시나리오 | 702650188 |
| `03-14-tools.md` | 14개 검증 도구 역할표 | 702650191 |
| `04-version-history.md` | 버전별 진화사 (한 페이지씩) | 702650196 |
| `confluence-mapping.json` | 매핑 메타데이터 | — |

위치 (AITF 스페이스):
```
AI Native 개발 방법론 (697298343)
└── 종합 브리핑 (702650185)
    ├── 동료의 첫 5분 (702650188)
    ├── 14개 검증 도구 (702650191)
    └── 버전별 진화사 (702650196)
```

## 편집 → 재배포 워크플로우

```bash
# 1. 마크다운 편집
vim briefing/01-main.md

# 2. Confluence 재업로드 (단건 예시)
cd /Users/sangcl/Documents/Development/Design/internal-wiki/backend
source .venv/bin/activate
PYTHONPATH=. python scripts/upload_md_to_confluence.py \
  /Users/sangcl/Documents/Development/Study/ai-native-methodology/ai-native-methodology/briefing/01-main.md \
  AITF 697298343
# ※ 첫 업로드는 위처럼 가능. 기존 페이지 갱신은 wiki_page_update (MCP) 사용 권장 —
#    page_id 로 update / title·body 만 변경 가능 / parent 변경은 미지원.

# 3. RAG 재색인 (변경 페이지 ID 만)
# Claude Code 세션에서:
#   ingest_pages(["702650185"])
```

## 빌드 제외 확인

본 폴더는 `scripts/build-plugin.js` 의 `INCLUDE` 목록에 포함되지 않아 **dist/ 플러그인 빌드 산출물에 들어가지 않습니다**. 동료 배포 자산이 아닌 저자(나) 의 사내 브리핑 자료이므로 의도적입니다.

## 작성 이력

- 2026-05-08 — v2.2.0 정식 릴리스 시점 작성. 4 페이지 신설 + AITF 스페이스 Confluence 업로드 + RAG 인제스트 65 청크.
