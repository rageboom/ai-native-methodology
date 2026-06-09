# plan — 대형·decayed-clean-arch 프로젝트 analysis scope 도출 전략 (본체 격상)

> 트리거: ep-be-gea(Spring Boot, 6307 Java, 클린아키텍처 *지향*하나 decay) analysis 점검.
> 우선순위: 품질 1 / 재작업 최소 2. 본체 격상 우선(examples PoC 작업보다). §8.1 단일 PoC 과적합 회피 적용.

## 1. 진단 (실측 grounded)

### 1.1 예제 프로젝트 사실
- 규모: api 1951 + core 4280 + batch 76 ≈ 6307 Java / 267 SQL / 561M. 단일 analysis 패스 불가.
- 스택: Spring Boot + data-jdbc, XML mapper 0 → **Modern paradigm** (단 decay 로 천장 하향).
- 구조: `core/<BC>/<feature>/{domain,application,infrastructure}` — feature-sliced 모듈러 모놀리스 *지향*.
  - BC: backoffice(1843) / frontoffice(1255) / external(446) / eam(198) / *common(480).
  - feature: biztrip / wlfr / event / issue / resve / reqmng / electronicapproval ...
  - DB 3스키마: ep_be_gea_admin / ep_be_gea_user / ep_be_gea_if.
- 클린아키텍처 적용 흔적: domain 115 / application 122 / infrastructure 215 dirs.

### 1.2 decay 실측 (경계가 샌다)
- domain → infrastructure/application 역참조 **45건** (의존성 규칙 위반).
- frontoffice ↔ backoffice 교차 import **514건** (281+233) → 123 고유 클래스.
- **누수가 feature 축 정렬**: frontoffice/biztrip→backoffice/biztrip, /event→/event(enums), /wlfr→/wlfr.
  - 해석: front/back office 의 *같은 feature = 한 업무의 두 얼굴*. 진짜 응집 단위 = **feature-across-BC**.
  - 결론: **명목 패키지 트리(BC 우선) ≠ 실제 응집(feature 우선).** 패키지 경로를 scope 절취선으로 믿으면 깨진다.

## 2. 갭 (기존 자산 정밀 대조 — 액면 수용 금지 정합)

| 자산 | 현 상태 | 갭 |
|---|---|---|
| analysis-code-graph | CodeGraph OSS 실행→code-graph.json. callers/callees/impact 질의. trust=reference-lens, gate inject ❌ | cohesion 클러스터링 단계 ❌. codegraph→scope 후보 도출 배선 ❌. symbol 단위 수동 질의만 |
| dep-graph-navigator/context-federator | artifact-graph(UC/BHV) 위 영향분석. 산출물 *후* 용도 | 원시코드에서 *분석 전* scope 도출 용도 아님 |
| modules_for_priority_analysis (inventory.schema) | path/reason/loc/file_count. "LOC/파일수 큰 모듈 **추정**" | coupling/cohesion 필드 ❌. codegraph 연계 ❌. decayed 에서 틀리는 휴리스틱 |

**갭 확정**: codegraph 는 있으나 "측정→scope 도출"로 배선 안 됨. priority 모듈은 LOC 추정 = decayed clean-arch 에서 오답.

## 3. 제안 설계 (trust 모델 정합 — codegraph reference-lens 제약 준수)

### 핵심 원칙
1. **패키지 경로 ≠ 경계, 측정된 coupling = 경계.** scope 후보는 codegraph 측정 cohesion 클러스터에서 도출.
2. **scope 후보 = advisory(권고).** codegraph 출력은 reference-lens → 어떤 gate 에도 inject ❌. 최종 scope 절단은 사용자 결단. (DEC-2026-05-28 §4.2 + feedback_chain_driver_deterministic_axis 정합)
3. **경계 위반 = 1급 산출물.** domain→infra 역참조, feature 축 벗어난 교차참조 → antipatterns + migration-cautions + finding. decay = 분석 가치 출력.
4. **legacy-spectrum 으로 scope별 decay 등급 → §3-A 천장 보정.** 정직 표기(깨끗 60%대 / 얽힘 더 낮게).

### 격상 대상 파일 (잠정 — 승인 후 확정)
- `skills/analysis-source-inventory/SKILL.md` — codegraph-측정 cohesion clustering → scope 후보 도출 단계 신설.
- `schemas/inventory.schema.json` — modules_for_priority_analysis 에 coupling/cohesion·cluster 근거 필드 보강 (additive).
- `skills/analysis-code-graph/SKILL.md` — clustering 질의 가이드 + 경계위반→finding 라우팅 명문화.
- `methodology-spec/workflow/discovery.md` — scope 도출 절차 반영.
- (검토) 새 ADR — "decayed-arch scope 도출: 측정 기반 + advisory" / DEC 로그.

## 4. 승인 필요 결정 (배치 — 5~6 묶음 / principle 3)
- D1: clustering 알고리즘 = (a) codegraph 출력에 결정론 community detection 도구 신설 vs (b) codegraph 질의 결과를 LLM 이 reference-lens 로 클러스터 제안. → trust 영향.
- D2: scope 후보 advisory 강제 수준 — 순수 권고 vs inventory 산출 필수 필드.
- D3: 경계 위반 라우팅 대상 — antipatterns / migration-cautions / finding 중 어디까지.
- D4: 격상 범위 — skill+schema 만(최소) vs +ADR/DEC(정식 paradigm 자산화).
- D5: §8.1 — ep-be-gea 1 PoC. 격상 즉시 vs ep-be-gea+poc-17 corroboration 후. (보수: 설계는 paradigm-grounded, 격상은 advisory 라 과적합 위험 낮음)

## 5. 2원칙 research (완료 — 5/5 선례 지지, 반대 0)
- **CodeScene temporal coupling** — 명목 경계≠실측 응집, 도구출력=진단신호(advisory). "dig into code, understand why" → 경계 확정 아님. 직접 선례.
- **Louvain/Leiden** — 알고리즘 확립, but SW 아키텍처 적용 = 연구 단계. ⚠️ "업계 표준" 인용 ❌ → "coupling 측정 기반 경계 도출" 일반 원칙으로만 인용 (과장 회피 / research-fact-validation).
- **ArchUnit(enforced) / dependency-cruiser(severity warn=advisory·error=enforced) / Structure101·Sonargraph(advisory)** — 같은 도구가 severity 로 advisory/enforced 분리. codegraph→severity=warn(advisory finding) = dependency-cruiser 동형.
- **Vertical Slice (Bogard)** — "minimize coupling between slices, maximize coupling in a slice, couple along the axis of change." feature-across-BC 직접 근거. 레이어 분리 = 잘못된 응집 기준.
- **advisory vs authoritative** — 학술(Koschke)·상용(vFunction) 모두 클러스터링 출력=advisory 제안→사람 승인 표준. reference-lens=advisory = 주류.
- 종합: 설계 전부 지지. 유일 주의 = Louvain 과장 인용 회피.

## 6. Lessons Learned
- 명목 패키지 트리를 scope 절취선으로 액면 수용하면 decayed clean-arch 에서 깨진다 — 실측(coupling) 먼저. (diagnose-before-design 정합)
- codegraph 는 존재했으나 "측정→scope 도출"로 배선 안 됨 = 자산 있음에도 갭. 격상 전 기존 자산 정밀 대조가 갭 위치를 좁혔다.

## 7. 실행 결과 (v0.25.0 격상 + ep-be-gea dogfood)
- **Part 1 격상**: v0.24.0→0.25.0 / release-readiness 41/41 / drift layout ✅ / schema-validator 40/40 / workspace 1469 GREEN. provenance leak 2건(내 ADR inline)·README/CLAUDE version 회귀 fix 후 통과.
- **Part 2 codegraph 실측**(ep-be-gea / 외부격리 / commit ❌): CodeGraph OSS 0.9.6 → 6508 files / 139990 nodes / 257879 edges. coupling 결정론 집계(78358 edge / contains·imports 제외):
  - cross-BC same-feature: biztrip 566 / wlfr 498 / req 245 / event 103 / issue 92 / resve 92 / reqmng 73 → **feature-across-BC 응집 확정**(내 grep preview 514 와 동일 결론).
  - shared kernel 자동 식별: base(int 17%)·api/presentation(30%)·cache·paging → scope 아님 / [2] backbone.
  - domain→infra 역참조 27건(codegraph 권위 / grep 45=import 기준).
  - inventory.json#scope_candidates 8건 산출 → inventory.schema 검증 **VALID**(신규 필드 실데이터 입증).
- **§8.1**: ep-be-gea = scope-derivation 메커니즘 1차 corroboration. 천장 수치는 여전히 미주장(poc-17 2차 후).

## 6. 이후 (격상 완료 후)
- ep-be-gea `[0] 글로벌 inventory → [1] codegraph 실측 클러스터링 → [2] DB backbone → [3] feature-across-BC scope full 11-phase`.
- 사내 소스: examples/ 밖 외부 경로 + commit 금지 + 마스킹 DEC만 공개.

## Lessons Learned
- (작성 예정)
