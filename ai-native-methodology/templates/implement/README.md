# templates/implement/ — chain 4 (impl stage) template

★ v2.0.0-rc1 chain harness validated. chain 4 (impl / GREEN 의무) 의 impl-spec template placeholder. sub-plan-4 chain skill 일부 채움 / 본 디렉토리 active template 은 v2.x carry.

## 본 디렉토리 자산

현재 디렉토리 자체 template 채움은 사용자 프로젝트마다 stack 분기 (Spring / NestJS / FastAPI / Rails / React / etc) 가 달라 일률적 template 부재. 대신:

- chain 4 skill (`generate-impl-spec`) 가 stack 별 scaffold 생성
- TC-* (chain 3 산출) → IMPL-* 분해 / 100% test pass 의무 (gate #4)

## 향후 채움 후보 (v2.x)

- `refactor-by-spec.template.md`
- `generate-from-rules.template.ts` (rules.json + openapi.yaml → API handler scaffold)

## 가치 경계 (★ ★ ★ DEC-2026-05-06-round-trip-부분-허용)

★ ★ chain harness gate 안에서 round-trip (산출물 → 신규 코드 자동 생성) **정식 허용**. 단:
- gate #4 의 100% test pass 통과 의무
- AI 자동 ≥ 85% / 사용자 검토 ≤ 15%
- 70~80% 한계 명시 잔존

## 참조

- [`../../skills/implement/`](../../skills/implement/) — chain 4 skill 2종 (sub-plan-4 채움)
- [`../../methodology-spec/deliverables/21-impl-spec.md`](../../methodology-spec/deliverables/21-impl-spec.md)
- DEC-2026-05-06-round-trip-부분-허용 — chain 4 round-trip 정식 허용
