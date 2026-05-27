import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { validateAnalysisExtraction, detectAdapterType } from '../src/validator.js';

describe('analysis-extraction-validator — adapter detect', () => {
  it('figma 감지 (components)', () => {
    assert.equal(detectAdapterType({ components: [] }), 'figma');
  });
  it('figma 감지 (screens)', () => {
    assert.equal(detectAdapterType({ screens: [] }), 'figma');
  });
  it('plan-doc 감지 (uc_candidates)', () => {
    assert.equal(detectAdapterType({ uc_candidates: [] }), 'plan-doc');
  });
  it('unknown', () => {
    assert.equal(detectAdapterType({ foo: 1 }), 'unknown');
  });
});

describe('analysis-extraction-validator — figma', () => {
  it('passes for verbatim TEXT 노드', () => {
    const extract = {
      components: [
        { id: '1:1', node_type: 'TEXT', text_content: '조회', provenance: 'verbatim' },
        { id: '1:2', node_type: 'FRAME' }, // 비-TEXT 는 검증 대상 외
      ],
    };
    const r = validateAnalysisExtraction(extract);
    assert.equal(r.adapter, 'figma');
    assert.equal(r.summary.critical, 0);
    assert.equal(r.summary.high, 0);
    assert.equal(r.coverage.verbatim_ratio, 1.0);
  });

  it('detects TEXT 노드 text_content 누락 (critical / F-162)', () => {
    const extract = {
      components: [{ id: '1:1', node_type: 'TEXT', provenance: 'verbatim' }],
    };
    const r = validateAnalysisExtraction(extract);
    assert.ok(r.findings.some(f => f.kind === 'analysis.figma.text_content_missing' && f.severity === 'critical'));
  });

  it('detects TEXT 노드 provenance 누락 (high)', () => {
    const extract = {
      components: [{ id: '1:1', node_type: 'TEXT', text_content: '조회' }],
    };
    const r = validateAnalysisExtraction(extract);
    assert.ok(r.findings.some(f => f.kind === 'analysis.provenance.missing' && f.severity === 'high'));
  });

  it('detects TEXT 노드 provenance=inferred 금지 (high)', () => {
    const extract = {
      components: [{ id: '1:1', node_type: 'TEXT', text_content: '추정라벨', provenance: 'inferred' }],
    };
    const r = validateAnalysisExtraction(extract);
    assert.ok(r.findings.some(f => f.kind === 'analysis.figma.text_inferred' && f.severity === 'high'));
  });
});

describe('analysis-extraction-validator — plan-doc', () => {
  it('passes for verbatim uc + glossary', () => {
    const extract = {
      uc_candidates: [{ name: 'UC1', source_excerpt: '문서 원문', provenance: 'verbatim' }],
      glossary: [{ term: 'A', definition: 'B', provenance: 'verbatim' }],
    };
    const r = validateAnalysisExtraction(extract);
    assert.equal(r.adapter, 'plan-doc');
    assert.equal(r.summary.high, 0);
    assert.equal(r.coverage.verbatim_ratio, 1.0);
  });

  it('detects uc provenance 누락 (high)', () => {
    const extract = {
      uc_candidates: [{ name: 'UC1', source_section: 'H2' }],
    };
    const r = validateAnalysisExtraction(extract);
    assert.ok(r.findings.some(f => f.kind === 'analysis.provenance.missing' && f.entry_kind === 'plan-doc.uc'));
  });

  it('detects inferred 비율 임계 초과 (medium)', () => {
    const extract = {
      uc_candidates: [
        { name: 'UC1', provenance: 'inferred' },
        { name: 'UC2', provenance: 'inferred' },
        { name: 'UC3', provenance: 'verbatim', source_excerpt: 'x' },
      ],
    };
    const r = validateAnalysisExtraction(extract, { inferredRatioThreshold: 0.5 });
    assert.ok(r.findings.some(f => f.kind === 'analysis.inferred_ratio.high' && f.severity === 'medium'));
  });

  it('inferred 비율 임계 이하면 finding 없음', () => {
    const extract = {
      uc_candidates: [
        { name: 'UC1', provenance: 'inferred' },
        { name: 'UC2', provenance: 'verbatim', source_excerpt: 'x' },
        { name: 'UC3', provenance: 'verbatim', source_excerpt: 'y' },
      ],
    };
    const r = validateAnalysisExtraction(extract, { inferredRatioThreshold: 0.5 });
    assert.ok(!r.findings.some(f => f.kind === 'analysis.inferred_ratio.high'));
  });
});

describe('analysis-extraction-validator — unknown adapter', () => {
  it('unknown adapter 는 검증 skip + medium finding', () => {
    const r = validateAnalysisExtraction({ foo: 1 });
    assert.equal(r.adapter, 'unknown');
    assert.ok(r.findings.some(f => f.kind === 'analysis.adapter.unknown'));
    assert.equal(r.coverage.verbatim_ratio, null);
  });
});
