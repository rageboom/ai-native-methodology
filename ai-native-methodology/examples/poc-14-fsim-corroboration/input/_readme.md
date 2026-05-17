# input/ — analysis stage 진입 input (가상 외부 사용자 제공)

본 디렉토리 = 외부 사용자가 plugin 적용 시 제공하는 input 묶음. analysis stage 의 `analysis-input-orchestrate` skill 이 자동 dispatch 하여 BCDE sub-skill 호출.

## 구성

| 파일 | 입력 종류 | 자동 dispatch 대상 skill |
|---|---|---|
| `docs/plan.md` | 기획 문서 (Markdown) | `analysis-from-plan-doc` |
| `swagger.yaml` | OpenAPI 명세 | `analysis-from-swagger` |
| (자연어 발화) | 사용자 prompt | `analysis-from-prompt` |

→ 멀티소스 입력 → `analysis-input-orchestrate` 가 종합 → input-summary.json 산출.
