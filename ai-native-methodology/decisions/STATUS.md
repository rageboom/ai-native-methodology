# 현재 상태 (Live Snapshot)

> 휘발성 진행 상태. 영속 컨텍스트는 [`/CLAUDE.md`](../../CLAUDE.md), 결정 이력은 [INDEX.md](INDEX.md).
> 본 파일은 phase / sprint 종결 시 갱신. ★ 세션 narrative(release 상세) = [CHANGELOG.md](../CHANGELOG.md) SSOT — STATUS 는 **다음 의제 + 포인터만** 유지 (s73 cleanup / feedback_status_md_archive_cadence / 3중 중복[CHANGELOG+DEC+memory] 회피).

---

## ★ ★ ★ 다음 세션 의제 (사용자 결단 / 2026-06-03 / s73 v12.9.0 종결 갱신)

> 다음 세션 진입 = 아래 frontier 중 **사용자 선택** (방법론 원칙: 다음 의제 = 사용자 결단 / 하드코딩 ❌).

- **codegraph wiring (DEC-2026-06-03-codegraph-deliverable-wiring §5 로드맵)**: ✅ **STEP 1 = v12.9.0** (code→artifact coverage-hole 공통 메커니즘 / `tools/codegraph-coverage` / §9). ✅ **STEP 2 = v12.10.0** (finding 채널 / coverage-hole→finding promote-ready + code_graph_ref conditional + handler-set / cycle·orphan 실측 반증→carry / §10). ✅ **STEP 3 = v12.11.0** (★ "architecture 대치"=거짓자기최면 → **module dependency coverage-hole / 결정론 corroboration lens** 개명 / Option A=module axis 신설·arch.json 무수정 / (a) 1축·SCC·layer·inventory=carry / onlyArch=informational_notes 구조적 절단 / RW module +22·ecom +8 / check36 / §11). **잔여 STEP 4~6**: ▶ STEP 4 impl/test `ast_symbol`(함수단위 추적성) → STEP 5 context-cache 증분 → STEP 6 Modern-scoped reading-aid. 메모리 `project_session_codegraph_step3` / `project_codegraph_4lens_wiring_analysis`. ★ s73~s75(STEP 1·2·3) 전부 **미커밋** (사용자 commit/release 별도 결단).
- **③ Type 2 = 사내 plugin-install 배포 (진짜 prod-value frontier)**: ✅ (A) `${CLAUDE_PLUGIN_ROOT}` 경로 치환 = v12.7.0 완료. **(B) 측정 = 사내 팀 self-serve 1 cycle** (no-simulation / 사용자 의존 / Type 2 측정=0). 잔여 (A) 후속 = **F-EXT-PATH-DOCS-001** (human-facing 문서 guides 16 + adoption/README 5 = `${CLAUDE_PLUGIN_ROOT}` human 셸 미주입 → 별도 doc-design). plan `.claude/plans/plan-type2-external-adoption.md`.
- **dep-graph 의도③ 잔여 = DEFER (external pull 게이트)**: IMPL 2nd distinct 도메인 shape(RealWorld chain5 JDK11+Gradle unblock=자연 close) · 임베딩 의미검색(NL 라우팅) · what-if 확장(deprecate-node·remove-edge·add-node) · EPIC/STORY/OP 본문 · 의도①④(codegraph 코드↔코드축).
- **②** ≥2 distinct 도메인(RealWorld blog + ecommerce e-commerce) 충족 = 3rd 도메인 선택적. **①** 외부-적합성 cleanup 소진(v11.28.0).

---

## Archive

> ★ 세션 narrative 는 STATUS 에 누적하지 않음 (s73 정책) — **release 상세 SSOT = [CHANGELOG.md](../CHANGELOG.md)** / 결정 = [INDEX.md](INDEX.md) / 세션 = memory. 최신 = v12.9.0 (codegraph STEP 1).
> 구 STATUS 역사 (session 66차 이하 / v11.6.0~v11.33.0 + dep-graph/codegraph Q3 + s70/s71/v12.0.0 narrative 등) = [`STATUS-HISTORY.md`](STATUS-HISTORY.md) (전체 cutoff 목록·본문).

