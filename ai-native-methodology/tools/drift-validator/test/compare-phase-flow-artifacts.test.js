// compare-phase-flow-artifacts.test.js — 이중 렌더링 산출물명 정합 검증 (outputs[] ↔ mermaid 노드 라벨).
// 신설 — drift-validator 가 json↔mermaid 산출물 파일명 발산(rename 누락)을 검출하는지 회귀 고정.
// 배경: discovery.phase-flow.json(discovery-spec) ↔ .mermaid(planning-spec) 발산을 0 breaking 통과시킨 맹점 수정.

import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { normalizePhaseFlowJson, normalizePhaseFlow } from '../src/normalize-phase-flow.js';
import { comparePhaseFlow } from '../src/compare-phase-flow.js';

function run(json, mermaid) {
  const jsonNorm = normalizePhaseFlowJson(json);
  const mermaidNorm = normalizePhaseFlow(mermaid);
  return comparePhaseFlow({ jsonNorm, mermaidNorm, jsonPath: 'x.json', mermaidPath: 'x.mermaid' });
}

const JSON_DISCOVERY = {
  phases: [
    { id: 'compose', name: 'compose', depends_on: [], inputs: ['business-rules.json'], outputs: ['discovery-spec.json', 'discovery-spec.md'] },
  ],
};

test('mermaid 산출물명이 JSON 계약과 다르면 breaking (rename 누락 검출)', () => {
  const mermaid = `flowchart TB
    subgraph SUB["s"]
      P_compose["Phase compose — compose"]
    end
    subgraph OUT["out"]
      OUT_JSON["planning-spec.json (deliverable 17 / 파일명 reuse)"]
      OUT_MD["planning-spec.md (사람 눈)"]
    end
    P_compose --> OUT_JSON`;
  const diffs = run(JSON_DISCOVERY, mermaid);
  const breaking = diffs.filter((d) => d.severity === 'breaking' && d.kind === 'artifact.mermaid-not-in-json');
  assert.equal(breaking.length, 2, 'planning-spec.json/md 2건 breaking 이어야 (discovery-spec 와 발산)');
  assert.ok(breaking.some((d) => d.mermaid === 'planning-spec.json'));
});

test('mermaid 산출물명이 JSON 계약과 일치하면 0 breaking', () => {
  const mermaid = `flowchart TB
    subgraph SUB["s"]
      P_compose["Phase compose — compose"]
    end
    subgraph OUT["out"]
      OUT_JSON["discovery-spec.json (deliverable 17)"]
      OUT_MD["discovery-spec.md (사람 눈)"]
    end
    P_compose --> OUT_JSON`;
  const diffs = run(JSON_DISCOVERY, mermaid);
  assert.equal(diffs.filter((d) => d.severity === 'breaking').length, 0, 'GREEN — 0 breaking');
});

test('flow 정의 파일(*.phase-flow.json)은 산출물 아님 — false positive 제외', () => {
  const mermaid = `flowchart TB
    subgraph SUB["s"]
      P_compose["Phase compose — compose"]
    end
    subgraph OUT["out"]
      OUT_JSON["discovery-spec.json"]
      OUT_MD["discovery-spec.md"]
    end
    NEXT["next: spec.phase-flow.json"]
    P_compose --> OUT_JSON`;
  const diffs = run(JSON_DISCOVERY, mermaid);
  assert.equal(diffs.filter((d) => d.severity === 'breaking').length, 0, 'phase-flow.json 교차참조는 breaking 아님');
});

test('JSON 계약 파일명이 mermaid 미렌더 → info (중간 산출물/config 정상)', () => {
  const mermaid = `flowchart TB
    subgraph SUB["s"]
      P_compose["Phase compose — compose"]
    end
    subgraph OUT["out"]
      OUT_JSON["discovery-spec.json"]
      OUT_MD["discovery-spec.md"]
    end
    P_compose --> OUT_JSON`;
  const diffs = run(JSON_DISCOVERY, mermaid);
  // business-rules.json 은 JSON input 이지만 mermaid 미렌더 → info (breaking 아님)
  const info = diffs.filter((d) => d.kind === 'artifact.json-not-in-mermaid');
  assert.ok(info.some((d) => d.json === 'business-rules.json'));
  assert.equal(diffs.filter((d) => d.severity === 'breaking').length, 0);
});
