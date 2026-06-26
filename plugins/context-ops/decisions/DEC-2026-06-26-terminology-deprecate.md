# DEC-2026-06-26-terminology-deprecate — 용어 정리: "7대 산출물" 폐기 → "산출물" / "코드 고고학" → "리버스 엔지니어링"

- 상태: 시행 (Accepted)
- 일자: 2026-06-26
- 결정자: 윤주스 (TF Lead)
- 티켓: MIS-434 [OP-NAMING-001] (Epic MIS-366 / Initiative MIS-365)
- 관련: ADR-002 (산출물 정의 / 본 DEC 가 용어 amend), ADR-011 (json 단독)

## 컨텍스트

"**7대 산출물**"은 산출물이 *7개뿐*인 듯한 오해를 준다. 실제 분석 산출물은 inventory / architecture / domain / business-rules / openapi / schema+ERD / antipatterns / migration-cautions + FE(state-map / visual-manifest / a11y / i18n / type-spec / form-validation) + recovered-adr / run-manifest / code-graph / sql-inventory / error-mapping / legacy-spectrum / characterization 등으로 훨씬 많고, **스택·영역에 따라 가변**(고정 N 아님)이다. "**코드 고고학**"은 비유적 표현으로, 분석 시점의 실제 행위인 "**리버스 엔지니어링**"(이미 돌아가는 시스템을 증거 기반으로 역추출)으로 대체한다.

**품질 근거**: "7대"라는 *문구* 는 어떤 결정적 gate(schema / validator / coverage 임계 / ID)에도 쓰이지 않는 **사람용 prose** 다 → 치환이 동작에 영향 없음. 검증 = 변경 JSON 전수 파싱 OK / JS `node --check` OK / 테스트가 옛 문자열을 assert 하지 않음(전수 확인).

## 결정

1. `7대 산출물`(및 복합형 `현 7대 + 신규 추가`·`7대 통합`·`BE 7대 + FE 8`·`(7대 / …)`·`7대 7/7`·`7대-deliverables` 앵커·`7대-subset` 등) → `산출물` 계열. **290곳 + 코드(주석/생성문서/finding 메시지) 3파일**.
2. `코드-고고학` / `코드 고고학` → `리버스 엔지니어링`. **전부(잔여 0)**.
3. 파일명 `docs/adr/ADR-002-7대-산출물.md` → `docs/adr/ADR-002-산출물.md` (`git mv`). 제목 = "ADR-002: 산출물 정의".
4. **보존(의도적 22곳)** — "7대"라는 *용어 자체를 회고·인용* 하는 텍스트는 치환 시 기록이 자가당착이 되므로 보존:
   - 용어를 *논하는* 결정/기록 — 예: `DEC-2026-05-17-skill-name-rename`("7대"가 charset 위반 / "틀린 수"라 skill 개명), 옛 skill 명 `integrate-7대` 인용.
   - 존재하지 않는 finding id `chain.7대.unreferenced` 인용(점검 기록 — "이 id 는 없다"는 맥락).
   - "7대 산출물"이 아닌 다른 뜻 — `7대 영역`(=7개 영역) 등.

## ADR-002 amend

ADR-002(산출물 정의)의 명칭에서 "7대"라는 수식을 제거한다. 산출물 수는 **가변**(고정 7 아님). ADR-002 본문은 본 치환으로 갱신되었고, 파일명도 rename 되었다(ID `ADR-002` 불변).

## 결과

- 본문 116파일 + ADR rename + 카탈로그 재생성(`marketplace.json` "7대" 0).
- 버전 v0.84.1 PATCH (동작 무변 / 호환).

## 결정론·검증

- 결정론 일회성 마이그레이션 스크립트(순서 있는 규칙셋) + dry-run diff 검토 후 `--apply` + `git diff` 게이트(사람 검토). LLM 의미 판단 inject ❌.
- 회귀: 변경 JSON 전수 파싱 OK / JS `node --check` OK / 옛 문자열 assert 테스트 없음.

## 인용

- ADR-002 (산출물 정의 / 본 DEC 가 용어 amend)
- MIS-434 [OP-NAMING-001] (Epic MIS-366)
