# Decision Log Index

> 역시간순. 단일 진입점. 상세는 각 파일 참조.

---

## 미해결 결정 (open-question / 검토중 / 보류)

(없음 — ★ ★ ★ v2.0 정체성 결단 carry resolved 2026-05-06 by DEC-2026-05-06-v2.0-i-strict-채택. carry K-1 ~ K-9 = 명시 후속 / master plan §K 정합 / 본 INDEX 의 미해결 항목 ❌)

## 진행중 결정

(없음 — 2026-05-17 갱신. 직전 진행중 표기 1건 모두 후속 결단 안 흡수 완료 / 아래 ↓ 승인 결정으로 이전):
- DEC-2026-05-17-spike-planning-agent-실험 → DEC-2026-05-17-v4-multi-agent-paradigm-채택 안 본격 흡수 (옵션 C → 옵션 A 본격 격상 / spike 자산 보존)
- DEC-2026-04-30-v1.2.3-본체-격상 → v1.3.0 release 안 본격 흡수 완료 (2026-05-01)
- DEC-2026-04-29-phase-4-5-형식화-후보 (옵션 C 시범) → ADR-008 dual rendering + ADR-009 5-stage confidence 본격 정식 채택 (v1.4.x)

(★ ★ ★ ★ ★ ★ 직전 흡수 2026-05-17 noter):
- DEC-2026-04-30-v1.2.3-본체-격상 → v1.3.0 release 안 본격 흡수 완료 (2026-05-01)
- DEC-2026-04-29-phase-4-5-형식화-후보 (옵션 C 시범) → ADR-008 dual rendering + ADR-009 5-stage confidence 본격 정식 채택 (v1.4.x)

---

## 승인 결정 (시간순)

| ID | 일자 | 카테고리 | 상태 | 요약 |
|---|---|---|---|---|
| [★ ★ ★ ★ ★ DEC-2026-05-17-묶음-P-prereq-종결-phase2-5-보류](DEC-2026-05-17-묶음-P-prereq-종결-phase2-5-보류.md) | 2026-05-17 (★ session 24차 / no version bump / carry only) | methodology / 묶음 P prereq 전 chain (Sprint 1~3) 종결 / Phase 2 ⑤ 보류 결단 | 승인 (★ ★ ★ 사용자 결단 3건 / 묶음 P 자율 시행 후 gate / "push") | 사용자 "묶음 P 해줘" → Sprint 1 (10 sub-sprint / 전체 11 PoC rules.json VALID + analysis_validator_violation criterion 전수 격상) + Sprint 2 (4 PoC 30 BR dual representation) + Sprint 3 (4 PoC Layer 2 / 8 dispatch → ★ Layer 2 corroboration 7 PoC 도달) 자율 종결. ★ ★ ★ 핵심 발견 = PoC #08 echo-chamber drift (Sprint 2 GWT 합성 Sonnet 이 is_likely_bug 무시 → 동일 모델 Sonnet Layer 2 미검출 / Haiku blind 검출 0.55·0.58 = industry-first + Adzic SBE 함정 회피 자격 본격 실측). 처분 LL-i-44 정합 (rules.json 변경 ❌ / C-poc08-drift carry). Sprint 1-J = pre-pre-prereq 사각지대(PoC #03) 계획 외 발견 즉시 보정. ★ ★ Phase 2 ⑤ 사용자 결단 3건 — #1 보류/별도 session #2 ★ 확정 제약 "분류 보존 강제 포함" (intent_vs_bug_classification 보존 검증 의무 / 재논의 ❌) #3 push carry only (18 commit / version bump ❌). release-readiness 11/11 + workspace 364/364 + chain harness validated 본질 보존. |
| [★ ★ ★ ★ DEC-2026-05-17-rules-schema-enforcement-strengthen](DEC-2026-05-17-rules-schema-enforcement-strengthen.md) | 2026-05-17 (★ session 22차 / v4.0.1 PATCH / additive only) | methodology / rules.json schema enforcement 강화 / ADR-CHAIN-011 §5 patch v11 | 승인 (★ ★ 사용자 결단 "추천으로 해줘" / 4 결단 묶음 / research 후) | paradigm 안정점 직후 enforcement criterion 강화 묶음. 3-에이전트 research (Senior + official-docs + industry-case) 후 사용자 결단 4건 본격 채택 — ③ source_grounded_evidence required (auto_extracted=true 한정 / if/then schema) + ⑥ intent_vs_bug_classification 공유 $ref SSOT 신설 (schemas/intent-classification.schema.json) + H-1 (Gherkin tag 표기 수정) + H-2 (Maldonado 인용 오류 수정 / SATD 5 분류 = design/defect/documentation/test/requirement 본격 명시 / `self_recognized` = 본 방법론 고유 합성). ⑤ cross_consistency_check inline = carry (PoC 적용률 3/14 시기상조 / ≥ 7 PoC 도달 후 재평가). drift-validator 신규 test 5건 (57/57 pass). 14 PoC 회귀 풀이 0. chain harness validated 본질 보존. v4.0.1 PATCH release. |
| [★ ★ ★ ★ ★ DEC-2026-05-17-v4-multi-agent-paradigm-채택](DEC-2026-05-17-v4-multi-agent-paradigm-채택.md) | 2026-05-17 (★ session 21차 / v4.0.0 MAJOR / paradigm 본질 변화) | methodology / B5 옵션 A 본격 채택 / DEC-2026-05-15-g5 retract | 승인 (★ ★ ★ 사용자 명시 결단 "A로 해줘" / opt-out cooling-off) | plan-skill-invocation-guarantee §B5 옵션 A 본격 진입. stage 별 sub-agent 5종 신설 (`agents/{analysis,planning,spec,test,implement}-agent.md`) + 3 base agent 병존 + spike agent archive 이동 (C-3 carry 본격 시행). main agent = orchestrator (skill 직접 호출 ❌ 권고 / Task tool 로 stage agent dispatch). frontmatter `skills: [...]` 사전 주입 paradigm (Sub-agents.md spec). lifecycle-contract §Agent column 본격 재작성 + chain-driver hooks-bridge 격상 + agents/README paradigm 정책 재작성. **DEC-2026-05-15-g5 retract**. v4.0.0 MAJOR + carry C-1+C-3 본격 흡수. C-2 (PoC 재실행) + C-4 (design agent) = 후속 carry. |
| [★ ★ DEC-2026-05-17-spike-planning-agent-실험](DEC-2026-05-17-spike-planning-agent-실험.md) | 2026-05-17 (★ session 21차 / B5 옵션 C 스파이크 / v4 본격 결단 source) | methodology / B5 옵션 C 스파이크 / paradigm 가능 입증 자산 | 승인 (★ v4.0 본격 채택 source / archive 이동 / 역사 기록) | `agents/_spike-planning-agent.md` EXPERIMENTAL 단일 파일 신설 + 외부 사실 검증 (claude-code-guide / Sub-agents.md spec) — frontmatter `tools` 에 Skill 명시 ❌ / sub-agent Skill tool 자동 활성 ✅ / `skills: [...]` 사전 주입 ✅ → multi-agent paradigm 가능 입증. 본 spike 결과 = v4.0 본격 채택 (옵션 A) source 자격. ★ ★ ★ 2026-05-17 archive 이동 (`archive/v4-spike/_spike-planning-agent.md`) — agents/ 폴더 가시화 ↓ + 역사 기록 보존 (commit `8605652`). |
| [★ ★ ★ DEC-2026-05-16-r4-poc-12-13-보류-자산화](DEC-2026-05-16-r4-poc-12-13-보류-자산화.md) | 2026-05-16 (★ session 20차 / v3.6.6 PATCH) | methodology / R4 결단 / PoC 처분 자산화 | 승인 (★ 사용자 명시 옵션 (c) 채택) | PoC #12 (raw query) + PoC #13 (QueryDSL) = README 안 정탐 결과 추천 (★ ★ ★ ★ ★ "pure realworld OSS 부재" + (B) 정책 완화 회귀 추천) + ADR-CHAIN-008 (MEDIUM × ≥ 5 PoC isomorphic = strong corroboration 자격 도달 / PoC #06~#11 6 PoC 누적) + paradigm 진화 안정점 정합 → status = "보류" 명시 자산화. 사용자 source 도착 시 재진입 가능 (라벨 부활 ❌ / 새 DEC 신설 의무 / LL-cleanup-02 정합). |
| [DEC-2026-05-15-g3-scope-folder-종결](DEC-2026-05-15-g3-scope-folder-종결.md) | 2026-05-15 | methodology / G3 종결 / 지속 운영 인프라 (v3.2) | 종결 | charter §3 G3 (R5/R7 산출물 폴더 자동 생성) 종결. scope/stage 폴더 + manifest 이중 렌더링 + M4 sync (자동 drift 감지 + 수동 갱신) + chain-driver query/sync CLI. SessionStart hook 자동 발동. 114/114 test pass. plan-charter §3 G2>G4>G5>G1 활성 / G3 종결 표기. |
| [DEC-2026-05-15-plugin-charter-17-requirements-채택](DEC-2026-05-15-plugin-charter-17-requirements-채택.md) | 2026-05-15 | methodology / charter (사용자 요구사항 SSOT) | 승인 | 사용자 요구사항 17 (R1~R17) 채택 + `methodology-spec/plugin-charter.md` 단일 SSOT 신설. v3.1.0 검증 = ✅ 11 / ⚠️ 4 / ❌ 2. Gap G1~G5 (ITSM 티켓화 / Figma+Swagger 입력 / 산출물 폴더 자동화 / FE skill 보강 / stage↔asset 매핑표) + 추가 권장 P1~P8 (Resume / token telemetry / impact analyzer / semver catalog / rollback / statusline / PR generator / secret scanning) backlog. Claude Code 디폴트 §4 (hooks / 컨텍스트 / plan-driven / multi-agent / 배포 / MCP ITSM) 본격 명문화. |
| [★ ★ ★ ★ ★ ★ DEC-2026-05-14-v2.5.0-minor-final](DEC-2026-05-14-v2.5.0-minor-final.md) | 2026-05-14 (★ ★ ★ session 15차 Phase D 종결 — v2.5.0 MINOR FINAL release) | methodology / release / MINOR FINAL (★ Layer 2 LLM paradigm + ≥ 2 PoC corroboration + chain harness validated 본질 보존 + release-readiness 9/9 strict 통과) | 승인 (★ ★ ★ ★ session 14차 carry `C-v2.5.0-minor-final-release` 본격 이행 / Phase D 본격 종결) | ★ ★ ★ v2.5.0 MINOR FINAL release 본격 자산화. Layer 2 LLM Claude Code sub-agent invocation paradigm 본격 도입 / ≥ 2 PoC corroboration 자격 본격 도달 (PoC #01+#03+#05) / release-readiness 9/9 strict 본격 통과 (★ layer_2_consistency criterion 신설) / chain harness validated §8.1 strict 본질 보존. ★ git tag v2.5.0. |

## Archive

> session 14차 이전 의사결정 (paradigm 진화 안정점 이전 / 111 DEC) → [`INDEX-HISTORY.md`](INDEX-HISTORY.md) 이전 (★ A2 / v3.6.8 / 2026-05-16 / R3 STATUS archive cadence 정합).

