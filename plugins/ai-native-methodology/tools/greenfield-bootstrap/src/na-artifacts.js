// na-artifacts.js — greenfield 의 legacy-only 산출물 N/A 생성 (결정적 / pure).
//
// greenfield 시나리오 = 코드-고고학 패스 없음 (legacy 코드 부재) → antipatterns / migration-cautions
// 는 본질적으로 N/A. "빈/N-A 정당화 명시" (use-scenario-taxonomy.md §3.1 / code_pointers_na 동형).
//
// schema 정합 주의: antipatterns.schema.json = top-level additionalProperties:false (required meta+antipatterns).
//   → N/A 사유는 meta(additionalProperties:true) 안에 embed. top-level 신규 필드 금지.

// meta-confidence.schema.json inputs_used enum 중 greenfield 입력 채널 매핑.
const CHANNEL_INPUTS = Object.freeze({
	swagger: 'design_specs', // API 계약 = design spec
	figma: 'design_specs',
	'plan-doc': 'planning_docs',
	prompt: 'documentation',
});

export function buildNaAntipatterns({
	channel = 'swagger',
	generatedAt,
	methodologyVersion = 'v11.10.0',
} = {}) {
	const inputUsed = CHANNEL_INPUTS[channel] || 'design_specs';
	return {
		meta: {
			generated_at: generatedAt,
			confidence: 0.98,
			inputs_used: [inputUsed],
			methodology_version: methodologyVersion,
			generated_by: 'greenfield-bootstrap',
			scenario: 'greenfield',
			na_reason:
				'greenfield scenario — legacy 코드가 없어 코드-고고학 패스를 수행하지 않음. ' +
				'antipatterns 카탈로그는 legacy 전용(회피 후보 추출) 산출물이므로 N/A. ' +
				'빈 배열은 설계상 정당(누락 ❌). 향후 S2(AX전환)/S3(특성화) 진입 시 채워짐.',
		},
		antipatterns: [],
	};
}

export function buildMigrationCautionsMd({
	scope = 'greenfield',
	channel = 'swagger',
} = {}) {
	return `# Migration Cautions — N/A (greenfield)

> **scenario**: \`greenfield\` — 신규 프로젝트 (legacy 코드 없음 / bootstrap 입력 채널 = \`${channel}\`).
> **scope**: \`${scope}\`

본 산출물(migration-cautions, deliverable 7)은 **legacy 전용** — 코드-고고학 패스(기존 코드에서 마이그레이션 위험 추출)의 결과물입니다. greenfield 시나리오는 전환 대상 legacy 코드가 없으므로 **N/A** 입니다.

| 항목 | greenfield 상태 |
|---|---|
| 회피 대상 antipattern | 없음 (\`antipatterns.json\` = \`[]\` / \`meta.na_reason\` 참조) |
| 마이그레이션 위험 | 해당 없음 (신규 빌드 — 처음부터 AX-native) |
| 코드-고고학 패스 | 미수행 (입력어댑터 패스만 / use-scenario-taxonomy.md §3) |

향후 본 프로젝트가 운영되며 legacy 부채가 쌓이면, 그 시점에 **S2(AX전환)** 또는 **S3(특성화)** 패스로 본 산출물을 채웁니다. greenfield 의 정상 상태 = 산출물이 빌드 부산물로 나오며 곧장 AX 운영 진입.
`;
}
