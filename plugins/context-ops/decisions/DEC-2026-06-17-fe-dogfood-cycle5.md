# DEC-2026-06-17-fe-dogfood-cycle5

**mis-fe-admin FE dogfood cycle 5 — cycle4 carry queue 11건 청산 (design 9 + validator TDD 2 / 전부 additive)**

> v0.59.0 MINOR. cycle4(v0.56/0.57)가 §8.1 2nd-도메인(apps/common)으로 한 차례 거른 carry 11건을, 편집 전 dev v0.57.0 소스 재대조 + 독립 적대검증(12-agent: 6 ground → 6 adversarial-verify)으로 청산. **11건 전부 real 확정 (stale 0 · false_positive 0)** — 이미 over-claim 을 거른 carry 라 정제도가 높음(cycle3 stale 10 / cycle4 FP 7 과 대조). 사용자 design 결단 = 전부 추천 채택.

## 맥락
mis-fe-admin(React18 + MUI + Module-Federation 7-app monorepo)을 context-ops 방법론의 dogfood 대상으로 실행. cycle4 reverify(`.ai-context/dogfood-common/cycle4-findings.json` cycle4_reverify.dispositions)가 다음 결단·코드변경 동반 carry 11건을 cycle5 로 이월:
- design-gated a_priori 3: type-spec-05 / state-map-03 / state-map-04
- design_decision 6: state-map-01 / state-map-02 / ui-spec-01 / ui-spec-02 / i18n-spec-04 / characterization-04
- validator TDD 2 (RED→GREEN): characterization-01 / characterization-02

## 결정 (사용자 추천 채택 / 전부 additive-safe)

### schema 구조화 채널 (design 9)
1. **type-spec-05 (A)** — `references[]` items 를 `oneOf:[string(legacy bare name), object{ref, resolution:enum[intra_spec,in_repo,external_workspace,node_module,unresolved], t_id}]` 로 확장 + `summary.framework_neutrality_basis`(all_types|scope_internal_only) + `summary.scope_internal_type_count`. monorepo 외부 워크스페이스(@sg/* / node_modules) 참조를 분류해 neutrality_score 분모를 정직하게.
2. **state-map-01 (A)** — `state_sources[].liveness`(present_unused|present_active).
3. **state-map-02 (A)** — `state_sources[].url_model`(route_param|pathname_as_truth).
4. **state-map-03 (A)** — transition object `source_ref`(per-transition 코드 앵커 / action 문자열 file:line stuffing 금지).
5. **state-map-04 (A)** — `cross_links.to_artifact` enum 에 `findings` 추가 + `machines[].related_findings[]` (primary_source_type=mixed → finding 의무인데 machine→finding 링크 채널 부재였음).
6. **ui-spec-01 (A)** — `design_tokens.token_ownership`(local|external_package|mixed|unknown) + `external_token_source`(@sg/ui-bo foundation/*).
7. **ui-spec-02 (A)** — component `suspense_boundary.is_remote_boundary` + `remote_name`(Module-Federation lazy-remote 경계 vs 평범한 React.lazy code-split 구분).
8. **i18n-spec-04 (B)** — `resources[].manual_pluralization` bool(CASE_COUNT 건/명/case(s) 수동복수형 smell) + `cross_links.to_id` description 에 표준 예약 AP-id(`AP-I18N-PLURALIZE-MISS`/`AP-I18N-ORPHAN-SHARED`) 명문화(analyst-invented id drift 차단).
9. **characterization-04 (A)** — `$defs.scenario.realized_in[]`(file required + lines/role/note) — 한 scenario 가 여러 파일에 걸칠 때 단일 snapshot 앵커로 표현 못 하던 갭. snapshot.endpoint/service_method = canonical primary 유지, realized_in[] = 보조 anchor set.

### validator 정합 (validator TDD 2 / RED→GREEN)
10. **characterization-01 (B)** — `characterization-coverage-validator` 가 snapshots 를 `snapshots/` 서브디렉토리에서만 읽어 schema 가 required 로 강제하는 embedded root `snapshots[]`/`coverage` 산출물을 false-FAIL. entry-file 읽기를 hoist + `entry.snapshots`/`entry.coverage` fallback. SKILL 산출물 wording split→embedded(schema SSOT) 정합.
11. **characterization-02 (B)** — schema-validator 가 `characterization.json` 을 미존재 schema 로 라우팅 → silent SKIP(false-green). canonical = `characterization-spec.json`(skill + 양 validator 일치) → **alias 추가 ❌ / producer skill 명시 파일명 guard + consumer rename** + RED/GREEN 회귀 테스트.

## trust / 불변
- codegraph reference-lens / 결정적 gate inject ❌ (DEC-2026-05-28 §4.2) — 불변.
- 전 11건 optional·additive (기존 valid 산출물·bundled example 무파손). state-map-04 to_artifact 는 enum APPEND(기존 값 보존).

## 검증
release:check 42/42 · characterization-coverage-validator 25/25(RED→GREEN) · schema-validator 44/44(char-02 routing 회귀가드 2 신규) · 5 schema ajv 컴파일 OK.

## 양보
동시 작업(codegraph 토큰절감 companion)이 v0.58.0 선점 → cycle5 = v0.59.0 양보(cycle4 Semgrep v0.55.0 양보 선례 동형 / 파일단위 분리 커밋 / 두 작업 파일셋 disjoint).

## 인용
- DEC-2026-06-17-fe-dogfood-cycle4 (직전 cycle / carry queue 출처)
- DEC-2026-05-28-codegraph-probe (reference-lens trust 불변)
- 산출물 근거: mis-fe-admin `.ai-context/runtime/cycle5-grounding.json` (12-agent ground+verify)
