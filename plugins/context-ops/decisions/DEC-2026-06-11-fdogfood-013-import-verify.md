# DEC-2026-06-11-fdogfood-013-import-verify

> **codegraph module rollup 의 이름-해석 의심(name-collision) 결정론 분류** — F-DOGFOOD-013 수정 cycle. 근본원인을 sqlite 직접 분석으로 확정·정량화한 뒤, codegraph-coverage 에 `import_verified`(source→target import 실재 검증)를 추가해 거짓 엣지를 finding 채널에서 절단하고 report 에 분리 표기. SKILL 의 불가능 지침(4-b)을 실행 가능한 codegraph-coverage 호출로 교체 + 한계 명문화.

**일자**: 2026-06-11
**카테고리**: 결함 수정 + 분석 정밀화 (reference-lens 신호 품질 / 채택자 플로우 배선)
**상태**: 승인 — 사용자 결단 ("일단 왜 거짓 엣지가 있는지부터 분석하고 문제를 해결 해줘" — 분석-우선 지시 후 시행)
**Trigger**: F-DOGFOOD-013 (ep-fe-mis dogfood — `MOD-ADMIN-GEA → MOD-APP-TLM w=667` 류 구조상 불가능한 앱 간 엣지)

---

## 1. 근본원인 분석 (사용자 지시 — 분석 선행 / codegraph.db 직접 질의)

**4연쇄 인과 (가설 → 전수 검증으로 확정)**:

1. **진짜 정의가 인덱스 밖** — admin 의 `openCommonToastbar` 는 hook 내부 클로저 → codegraph 가 노드로 인덱싱하지 않음 (전체 인덱스에 동명 노드 = ep-fe-tlm 모듈-최상위 정의 **단 1개**).
2. **이름 기반 last-resort 연결** — local binding(구조분해) 추적 실패 시 전역 이름 룩업으로 **인덱스에 존재하는 동명 노드에 연결**. `unresolved_refs` 테이블 = **전체 0건** (미해석 보관 없이 무조건 연결). fan-out 아님 — 단일 타깃 흡인.
3. **모노레포 전체 단일 인덱스** — 앱 경계 밖 후보가 존재 (backoffice/frontoffice 쌍둥이 = 동명 유틸/hook/래퍼 다수).
4. **provenance 무구분** — `edges.provenance=null` — import-해석 vs 이름-추측 구분 메타 없음 → rollup 동등 가중 집계.

**정량화 (ep-fe-mis)**: 앱 간 불가능 엣지 **5,050개** (4,179 file-pair). 3 패턴: ① 유일 후보 흡인 (`openCommonToastbar` 단독 1,115 — 정의 1개) ② 다중 후보 오선택 (`useHttpClient` 554 — 동명 정의 **16개**) ③ 외부 라이브러리 충돌 (MUI 동명 래퍼 `TextField`·`Dialog` 류 — import 는 node_modules=미인덱스 → 로컬 래퍼로 오연결).

**해결 층위 판단**: codegraph OSS 인덱서 = 외부 도구 (소관 밖 / 업스트림 후보). 우리 층 = **rollup 소비 시점의 결정론 검증** — "source 파일에 target 파일로 실제 도달하는 import 가 있는가". reference-lens 정신 = 제거 ❌ / **분류 + 분리 표기**.

## 2. 시행

### (b) `import_verified` 결정론 분류 (핵심)

- **module-graph.js (순수 유지)**: rollup 이 module-pair 당 distinct 기여 file-pair 수집 (`FILE_PAIRS_CAP=100` / 초과 = truncated 정직 표기) → holes 에 내부 동봉.
- **신규 `import-verify.js` (I/O 층)**: 해석 경로 3종 결정론 — ① 상대경로 (+확장자/index probing) ② tsconfig paths alias (source 상향 탐색 최근접 / 단일-`*` 패턴 / jsonc 주석 제거) ③ workspace 패키지명 (apps/*·packages/* package.json name→dir / 디렉토리-level 도달). **한계 정직**: extends 체인 paths 상속·exports map·re-export 체인 미해석 = false-unverified 방향 (안전 — verified 주장만 강함).
- **cli.js**: buildCoverage(순수) 후 annotate (file_pairs 소비 후 제거 — report 비포함). `--db` 단독(target 부재) = `status:'skipped'` 정직 표기.
- **render.js**: `import_verified=false` → **finding 채널 미진입** (informational_notes 동형 절단) + markdown "이름-해석 의심" 분리 섹션 (ⓘ / "결함 주장 ❌ / 최종 판단 = 사람 — 실코드 grep"). `undefined`(skip) = 기존 동작 (backward-compat).
- **schema** `code-coverage-hole.schema.json`: holes `import_verified` + moduleAxis `import_verification{status,verified,unverified,note}` — additive optional.

### (a)(c)(d) SKILL 배선 (채택자 플로우)

- `analysis-code-graph` 4-b: "code-graph.json edge 집계"(**불가능 지침** — 산출물에 edge 없음) → codegraph-coverage 호출 명령으로 교체 + verified-만-scope-신호 의무 + 인용에 `tools/codegraph-coverage/` 추가.
- `analysis-code-graph` 신규 "한계 (정직)" 절: name-collision failure mode (4연쇄·실측 수치) + triage(실코드 grep) + (c) scope 단위 인덱싱 옵션 (trade-off 명시 — 전체 인덱스 + 분류가 기본 권장).
- `analysis-source-inventory` 신호원 2번: 동일 불가능 문구 정정 + verified-만 사용 의무.

## 3. 검증 (STOP)

- **테스트**: codegraph-coverage 102→**121 GREEN** (+19: file_pairs 수집·cap·holes 동봉 / parseImportSpecifiers 5형 / 해석 3경로 + 부정 케이스[ep-fe-mis 실측 패턴 재현] / annotate 분류·skip / toFindings 절단).
- **ep-fe-mis 실증**: hole 112 → **verified 11 / 의심 101** / findings 112→**11** (노이즈 ~90% 절단). **앱 간 불가능 hole 49/49 의심 분류 — verified 누출 0**. verified 11 = 전부 admin 도메인→ui-bo/ui-fo/utils (실 import 실재 — workspace 패키지 해석 입증). report = code-coverage-hole.schema **valid**.
- skill-citation-validator: 222 doc / **0 stale**.

## 4. carry (정직)

- **§8.1**: 멀티앱 모노레포 = probe 매트릭스 1st arm (ep-fe-mis). 2nd distinct 도메인 corroboration 후 본체 격상 판단.
- codegraph OSS 업스트림 후보: 미해석 참조의 `unresolved_refs` 보관 / edges `provenance` 채움 (소관 밖 — 제기 여부 사용자 결단).
- intra-admin 의심 hole 중 일부는 동적 패턴일 가능성 — triage 는 사람 (SKILL 명문화로 안내).
- 버전 bump / CHANGELOG = 사용자 release flow 위임.

## 인용

- finding-ledger.md F-DOGFOOD-013 (resolved)
- DEC-2026-05-28-codegraph-probe-결과 §4.2 (reference-lens trust 모델 — 본 분류가 그 정신의 구현)
- DEC-2026-06-03-codegraph-deliverable-wiring §5 STEP 3 (rollup 모체)
- DEC-2026-06-11-epfemis-dogfood-p0-fixes (sibling — 같은 dogfood 의 P0 cycle)
