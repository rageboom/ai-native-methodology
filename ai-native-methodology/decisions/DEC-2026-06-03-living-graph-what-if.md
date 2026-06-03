# DEC-2026-06-03-living-graph-what-if

> v12.5.0 MINOR release SSOT. dep-graph 의도③ "질의 → 영향 + 스펙 + 코드"의 가설(what-if) 진입 슬라이스 (b) — `chain-driver navigate --what-if`.
> 상태: **승인 + 시행 완료** (2026-06-03). 4원칙 = `plan-dep-graph-what-if.md` → Senior 적대적 리뷰 0.82(value 정직 판정 = gold-plating 경계) → 사용자 "순서대로 진행"(s68 triage 잔여 ③ 순차 착수 승인).

**작성일**: 2026-06-03

**relates to**:

- `DEC-2026-06-03-living-graph-nl-routing.md` (v12.4.0) — 의도③ (a) NL 라우팅. 본 DEC = 의도③ (b) what-if (마지막 ③ 슬라이스).
- `DEC-2026-06-03-living-graph-spec-body.md` (v12.3.0) — 의도③ 첫 슬라이스. 3 슬라이스(spec-body + NL 라우팅 + what-if)로 의도③ 핵심 충족.
- s68 triage(`project_session_depgraph_audit_v1210`) — "③(a) what-if = DEFER(propose producer 부재 + do_not_edit_manually 계약 + 가설엣지 자동추론=LLM trust선 위반 → in-memory 비파괴+사용자명시입력만 안전)". 본 DEC 가 그 trust선을 설계 제약으로 정면 수용.

---

## 0. 한 줄 요약

navigate 는 기존 노드의 영향만 봄 → "삭제하면 뭐 끊기나 / 의존 추가하면?" 등 **그래프에 아직 없는 변경**을 못 물음. `--origin X --what-if "<op>"` 가 사용자 명시 op 을 **in-memory 사본**에 적용해 baseline 대비 영향 delta 를 결정론 계산. 그래프 파일 write 절대 ❌(비파괴) / op 문자열이 변경의 SOLE source(LLM 추론 ❌).

## 1. Senior gold-plating 경계 (value 정직 판정 → scope 축소)

what-if 는 s68 triage 의 **최저순위 DEFER** + trust 우려. Senior 리뷰에 value 정직 판정을 명시 요청 → **"Genuine but NARROW — not gold-plating IF scoped to core_two"**:

- navigate --origin 은 이미 "기존 노드 변경 영향"을 답함 → what-if 의 유일한 marginal value = **그래프에 아직 없는 변경 시뮬레이션**.
- 정확히 2 op 이 이를 전달 → **v1 scope = core_two**.

## 2. 결단 (Senior 0.82)

### D1 — op 범위 = core_two (remove-node + add-edge)

- `remove-node:ID` — "이 artifact 삭제하면 뭐 끊기나"(navigate 불가: 노드가 아직 존재해 자기 impact tree 에 남음). → newly orphaned.
- `add-edge:SRC>TGT[:edge_type]` — "아직 합성 안 된 의존성 추가하면?"(기본 derived_from). → newly reachable.
- **carry** (§8.1 self-overfitting / external pull 필요): deprecate-node(impact tree 로 reproducible) · remove-edge(niche) · add-node(phantom 노드 = schema 필드 부재 → under-specified diff = 최저신뢰).

### D2 — `--origin` 필수 (op-target 와 다를 수 있음)

--origin diff = 결정론·legible(analyzeImpact pure·id-sort). graph-wide centrality diff = muddy(랭킹 noise) → carry. remove-node 시 origin = downstream consumer(제거 대상 ≠ origin). origin == 제거 대상 = **graceful exit 3**("downstream consumer 를 --origin 으로" / must-fix #1).

### D3 — add-node carry

phantom 노드(schema 필드 미채움) = grade 전파·diff under-specified = 최저신뢰 quadrant. 진짜 신규 artifact = add-edge + 실 producer→resync(v12.2.0)로 충당.

### D4 — grep-gate skip → 불변성 unit test

what-if = write 경로 **구조적 부재**(analyzeImpact·topKImpactRoot pure + structuredClone 사본만 / cmdNavigate writeFileSync 0). check31-style grep-gate = 존재불가 코드 부재 단언 = near-zero + RR surface↑(31→32). → **불변성 unit test**(원본 그래프 파일 byte-identical + baseline result.impact 가설 무관 = 진짜 회귀 enforcer).

## 3. trust선 (triage DEFER 근거 정면 수용)

- **그래프 파일 write 절대 ❌** — `structuredClone(graph)` 사본에만 op 적용 (do_not_edit_manually 계약).
- **가설 = op 문자열이 SOLE source** — LLM/heuristic 엣지 추론 ❌ (결정론 vs LLM axis / STRONG-STOP).
- **"가설 / 미저장"(`unsaved:true`)** — text·json 양쪽 라벨.

## 4. 시행 (`chain-driver/src/cli.js cmdNavigate`)

`parseWhatIfOp`(결정론 파싱) + `applyWhatIfOp`(사본 mutate) + cmdNavigate 내 what-if 계산(op 검증 → structuredClone → analyzeImpact 가설 → baseline delta) → `result.what_if = {op, kind, unsaved:true, [edge_type], hypothetical_by_grade, delta:{MUST/SHOULD/FYI:{added,removed}}}` + text 블록(newly orphaned/reachable 귀속). add-edge edge_type = EDGE_TYPE_CATALOG 검증(미지 → exit 3). 본체 algorithm·스키마 무변경(pure 함수에 사본 주입만).

## 5. 검증 (no-simulation / 실 CLI·실 그래프)

- 새 test 11: remove-node delta+unsaved / add-edge delta+edge_type / 불변성(파일 byte-identical / must-fix #2) / baseline 불변(가설이 baseline 오염 ❌) / 결정론 provenance(동일 op 2회=동일 delta / must-fix #3) / origin==제거대상 graceful / 대상부재 / 미지 edge_type / 미지원 op carry / text 라벨 / 회귀0.
- **mechanism corroborated on 2 internal dogfood 도메인** (§8.1 정직): RealWorld remove-node→newly orphaned(BHV+UC) + add-edge→newly reachable / ecommerce 동형. **둘 다 self-dogfood = external adopter pull deferred / prod validation overclaim ❌** (self-referential-drift inflation 회피 / [[feedback_self_referential_corrective_drift]]).
- workspace **1095 pass/0 fail** + release-readiness **31/31** + version 3-way 12.5.0 + CLAUDE/README sync / breaking 0.

## 6. carry (DEFER / external pull 게이트 / 능동 ❌)

- 의도③ what-if 잔여: deprecate-node · remove-edge · add-node (전부 external use-case pull 필요 / gold-plating 회피).
- graph-wide centrality diff(origin 미지정 what-if) · 임베딩 의미검색(NL 라우팅 잔여) · TASK·TC·IMPL spec 본문 · 의도①④(codegraph 코드축).

## 7. Why / How to apply

**Why**: navigate 소비 루프의 가설 질의 — refactoring 안전성("이 legacy artifact 버려도 되나")을 그래프 변경 없이 미리 확인(산출물=LLM 운영 컨텍스트 P0 / S2 AX-마이그레이션 질문 매핑). Senior value 정직 판정으로 scope 축소 = gold-plating·self-referential-drift 경계 준수.
**How to apply**: what-if 는 **읽기 전용 시뮬레이션** — 그래프 파일을 절대 쓰지 않음(do_not_edit_manually). 가설을 실제 적용하려면 실 producer 로 artifact 편집 후 resync-graph(v12.2.0). what-if delta 는 op 문자열만의 결정론 함수 — LLM 이 가설 엣지를 추론·확장하면 trust선 위반. core_two 외 op 제안 = external pull 입증 후 4원칙.
