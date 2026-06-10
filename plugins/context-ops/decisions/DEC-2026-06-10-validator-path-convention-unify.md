# DEC-2026-06-10-validator-path-convention-unify

- **결정**: validator 간 project-root 경로 해석을 `_shared/project-root.js` 로 단일화 (F15) + F13 sibling family(F14/F16) diagnose-before-design 처분
- **시각**: 2026-06-10
- **버전**: plugin.json 0.30.0 → 0.31.0 MINOR (validator 경로 해석 정합 / schema·gate semantics 무변경 / backward-compat)
- **트리거**: ep-be-gea dogfooding — golf chain 2(spec) gate#2 검증 중 발견 (**F15**)

## 배경 (F15 갭)

`formal-spec-link-validator`(gate#2 REQUIRED)가 chain mode 에서 cross-ref 경로를 `baseDir = dirname(파일)` 기준으로 해석. 그런데 산출물 cross-ref(derivation_source.behavior_spec_path 등)는 **project-root-relative**(`.ai-context/...`) 컨벤션 → spec-dir 기준 해석 시 이중 prefix → **dead-reference(breaking)** → gate#2 거짓 block.

**diagnose-before-design 실측**:
- `chain-coverage-validator` 는 v9.0.4(F-MB-VAL-001)에서 동일 문제를 `autoDetectProjectRoot`(5-PoC corroborated)로 이미 해결 — 단 `.ai-context/output/` 패턴 한정.
- formal-spec-link 엔 그 로직도, `--project-root` 플래그도 부재 = 진짜 델타.
- event spec 도 동일 dead-reference 재현(선재 / golf 회귀 아님) — 즉 2 검증기의 경로 규약 불일치.

## 결정 내용 (F15 수정)

`_shared/project-root.js` 신설 — `resolveProjectRoot(specPath)`: 경로의 `/.ai-context/` 부모 = project root.
- **일반화**: `.ai-context/output/`(분석 산출물) + `.ai-context/<scope>/<stage>/`(chain 산출물) 양쪽 일관(구 `.ai-context/output$`→../.. 결과 동형 / 5-PoC 테스트 lock 보존). 그 외 = fallback dirname(backward-compat).
- `chain-coverage-validator`: 로컬 autoDetectProjectRoot → shared 위임(export 이름 alias 보존 / 41 test green / scope-dir 도 이제 자동 커버).
- `formal-spec-link-validator`: `--project-root <dir>` 플래그 추가 + chain mode baseDir = `projectRoot ?? resolveProjectRoot(path) ?? dirname`.
- 검증: golf·event formal-spec-link breaking **2→0** / formal-spec-link test 21→26(resolveProjectRoot 5종) / chain-coverage 41 무회귀.

## F13 sibling family — F14/F16 diagnose-before-design 처분 (코드 ❌)

F13(discovery-validator scope-aware) 수정 후 같은 뿌리(전역 누적 산출물 ↔ scope subset)의 형제 후보 3종 발견. 액면 수용 ❌ 실측 결과:

- **F14 (chain-coverage AP-coverage scope) → REFRAME/DEFER**: severe AP 전수 carry 요구는 **대부분 correct-by-design**(cross-cutting AP[DB/SECURITY/ARCH]는 scope 마다 인지해야 silent-omission 차단). AP 는 scope 속성 필드 부재(id prefix 만 힌트). scope 귀속을 antipatterns schema 에 추가 = analysis 계약 대변경인데 근거가 1-PoC(AP-SECURITY-001 = event-local 인데 concern-prefix 라 golf carry 강요되는 mis-attribution noise)뿐 → §8.1 과적합. honest carry(golf excluded_antipatterns 명시)가 이미 처리. **≥2 도메인서 mis-attribution 반복 입증 시 재검토.**
- **F16 (graph-synth orphan) → DISSOLVE**: graph-synthesizer 에 **이미 Layer-4**(`cross_links.to_analysis_artifacts` basename→kind / 코드 주석 "graph-integrity orphan 해소" 명시)가 존재. golf 의 characterization/sql-inventory orphan 은 golf 가 그걸 **미누적→미참조하는 게 정답**(architecture 는 cross_links 추가로 해소). graph-integrity 는 gate#2 밖(비차단). = 결함 아님.

## §8.1 단일 PoC 과적합 회피

- **F15 수정** = paradigm-grounded(v9.0.4 autoDetectProjectRoot 선례 + 5-PoC lock 일반화 / 경로 규약 단일화는 구조적 정합). 임계·gate semantics 무변경 — 해석 base 정의만 정정.
- **F14/F16** = 액면 수용 회피 = diagnose-before-design 실천(역공학 갭분석 "~70% 이미 존재" 선례 동형). 코드 0.

Relates: DEC-2026-06-10-discovery-validator-scope-aware(F13 모 / sibling family) + feedback_diagnose_before_design_check_existing + F-MB-VAL-001(autoDetectProjectRoot 선례).
