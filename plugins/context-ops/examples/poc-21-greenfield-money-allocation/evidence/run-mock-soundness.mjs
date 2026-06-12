// run-mock-soundness.mjs — GATED 조건④ 재현기.
//   실 검증기 함수 spec-test-link-validator/validateMockSoundness(testSpec, unitSpec) 를 직접 실행(no-simulation).
//   committed unit-spec.json(3 UNIT: ALLOC required·FORMAT required·RECEIPT-DTO waived) + 집중 test-spec fixture 로
//   mock-soundness RED(FORMAT unit TC 부재=unsound)→GREEN(추가=sound) 실증. ≥2 협력자(ALLOC·FORMAT) + ≥1 waived(DTO).
//   ※ full UC→BHV→AC SDLC chain 은 poc-21 unit-layer scope 밖 — 본 fixture 는 mock-soundness 입력만(test_layer/class_ref/mocks).
import { validateMockSoundness } from '../../../tools/spec-test-link-validator/src/validator.js';
import { readFileSync, writeFileSync } from 'node:fs';

const here = new URL('.', import.meta.url).pathname;
const unitSpec = JSON.parse(readFileSync(`${here}../.ai-context/output/unit-spec.json`, 'utf8'));

// GREEN test-spec fixture — composition TC 가 3 협력자 mock, ALLOC·FORMAT 둘 다 unit TC 보유.
const greenTcs = [
	{ id: 'TC-ALLOC-UNIT-001', test_layer: 'unit', class_ref: 'UNIT-ALLOC-001', mocks: [] },
	{ id: 'TC-FORMAT-UNIT-001', test_layer: 'unit', class_ref: 'UNIT-FORMAT-001', mocks: [] },
	{
		id: 'TC-RECEIPT-COMP-001',
		test_layer: 'composition',
		mocks: [
			{ collaborator_unit_ref: 'UNIT-ALLOC-001', mock_kind: 'mock' },
			{ collaborator_unit_ref: 'UNIT-FORMAT-001', mock_kind: 'mock' },
			{ collaborator_unit_ref: 'UNIT-RECEIPT-DTO-001', mock_kind: 'stub' },
		],
	},
];
// RED 변형 — UNIT-FORMAT-001 의 unit TC 부재(아직 안 핀) → composition 의 FORMAT mock = unsound.
const redTcs = greenTcs.filter((t) => t.id !== 'TC-FORMAT-UNIT-001');

const red = validateMockSoundness({ test_cases: redTcs }, unitSpec);
const green = validateMockSoundness({ test_cases: greenTcs }, unitSpec);

const stamp = (phase, r, note) => ({
	phase,
	scenario: 'greenfield',
	provenance: 'designed_from_spec',
	tool: 'spec-test-link-validator/validateMockSoundness (real / no-simulation)',
	collaborators_checked: ['UNIT-ALLOC-001', 'UNIT-FORMAT-001'],
	waived_exempt: ['UNIT-RECEIPT-DTO-001'],
	findings: r.findings,
	summary: r.summary,
	simulated_evidence_count: 0,
	note,
});

writeFileSync(`${here}mock-soundness-RED.json`, JSON.stringify(stamp('RED', red,
	'UNIT-FORMAT-001 unit TC 부재 → composition FORMAT mock = unsound(1 high). ALLOC=sound(unit TC 보유) / DTO=waived 면제.'), null, 2) + '\n');
writeFileSync(`${here}mock-soundness-GREEN.json`, JSON.stringify(stamp('GREEN', green,
	'UNIT-FORMAT-001 unit TC 추가 → 0 findings(sound). ≥2 협력자(ALLOC·FORMAT) 핀 + ≥1 waived(DTO) 면제 = 조건④ breadth.'), null, 2) + '\n');

console.log('RED  unsound:', red.summary.high, '→', red.findings.map((f) => f.collaborator_unit_ref).join(','));
console.log('GREEN unsound:', green.summary.high);
console.log(red.summary.high === 1 && green.summary.high === 0 ? 'RED→GREEN ✅ (조건④ mock-soundness breadth)' : 'UNEXPECTED ❌');
