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

// ── evidence-scan 모드 (F-DOGFOOD-014 — 날조 source_evidence 차단) ──
import { validateEvidenceExistence } from '../src/validator.js';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

describe('analysis-extraction-validator — evidence-scan (F-DOGFOOD-014)', () => {
  function fixture() {
    const root = mkdtempSync(join(tmpdir(), 'evscan-'));
    const repo = join(root, 'repo');
    const out = join(repo, '.ai-context', 'output');
    mkdirSync(join(repo, 'src'), { recursive: true });
    mkdirSync(out, { recursive: true });
    writeFileSync(join(repo, 'src', 'a.ts'), 'line1\nline2\nline3\n'); // 4 lines (trailing)
    return { root, repo, out };
  }

  it('실재 file+line 인용 = ok / findings 0', () => {
    const { root, repo, out } = fixture();
    writeFileSync(join(out, 'business-rules-x.json'), JSON.stringify({
      business_rules: [{ id: 'BR-X-Y-001', source_evidence: [{ type: 'code_condition', file: 'src/a.ts', line: 2 }] }],
    }));
    const r = validateEvidenceExistence(out, repo);
    assert.equal(r.summary.critical, 0);
    assert.equal(r.coverage.refs_ok, 1);
    rmSync(root, { recursive: true, force: true });
  });

  it('날조 파일 인용 → critical (fabrication-grade)', () => {
    const { root, repo, out } = fixture();
    writeFileSync(join(out, 'rules.json'), JSON.stringify({
      rules: [{ evidence: [{ file: 'src/DOES_NOT_EXIST/fabricated.ts', line: 9999 }] }],
    }));
    const r = validateEvidenceExistence(out, repo);
    assert.equal(r.summary.critical, 1);
    assert.ok(r.findings.some(f => f.kind === 'evidence.file_missing'));
    assert.equal(r.coverage.refs_missing, 1);
    rmSync(root, { recursive: true, force: true });
  });

  it('라인 범위 밖 인용 → high', () => {
    const { root, repo, out } = fixture();
    writeFileSync(join(out, 'd.json'), JSON.stringify({
      evidence: [{ file: 'src/a.ts', line: 9999 }],
    }));
    const r = validateEvidenceExistence(out, repo);
    assert.equal(r.summary.high, 1);
    assert.ok(r.findings.some(f => f.kind === 'evidence.line_out_of_range'));
    rmSync(root, { recursive: true, force: true });
  });

  it('절대경로 인용 → info (존재검사 skip / 비이식 정직 표기)', () => {
    const { root, repo, out } = fixture();
    writeFileSync(join(out, 'e.json'), JSON.stringify({
      evidence: [{ file: '/abs/machine/path.log', line: 1 }],
    }));
    const r = validateEvidenceExistence(out, repo);
    assert.equal(r.summary.critical, 0);
    assert.equal(r.coverage.refs_absolute, 1);
    rmSync(root, { recursive: true, force: true });
  });

  it('findings-*.json (aggregator 자기 출력) 은 scan 제외', () => {
    const { root, repo, out } = fixture();
    writeFileSync(join(out, 'findings-analysis.json'), JSON.stringify({
      sources: { x: { file: 'src/NOPE.ts', line: 1 } },
    }));
    const r = validateEvidenceExistence(out, repo);
    assert.equal(r.coverage.refs_total, 0);
    rmSync(root, { recursive: true, force: true });
  });

  it('하위 디렉토리(business-rules/) 재귀 scan + line 없는 file 인용 = 존재만 검사', () => {
    const { root, repo, out } = fixture();
    mkdirSync(join(out, 'business-rules'), { recursive: true });
    writeFileSync(join(out, 'business-rules', 'BC-X.json'), JSON.stringify({
      business_rules: [{ source_evidence: [{ file: 'src/a.ts' }] }],
    }));
    const r = validateEvidenceExistence(out, repo);
    assert.equal(r.coverage.refs_ok, 1);
    assert.equal(r.summary.critical, 0);
    rmSync(root, { recursive: true, force: true });
  });
});
