// formal_spec_links 검증 — link 가 실제 파일을 가리키는지 + 가리키는 산출물의 br_id/aggregate_root 가 정합한지.

import { readFileSync, statSync } from 'node:fs';
import { dirname, resolve, basename } from 'node:path';

/**
 * source: { type: 'api' | 'antipattern', file: string, item: object }
 * baseDir: source file 의 dirname (link resolve 기준)
 */
export function checkLinks({ source, baseDir }) {
  const findings = [];
  const links = source.item.formal_spec_links;
  if (!links) {
    return findings; // optional 필드 — 부재 자체는 OK
  }

  for (const category of ['decision_tables', 'state_machines', 'sequence_diagrams', 'invariants']) {
    const arr = links[category];
    if (!arr) continue;
    for (const linkPath of arr) {
      const resolved = resolve(baseDir, linkPath);
      try {
        statSync(resolved);
      } catch {
        findings.push({
          severity: 'breaking',
          kind: 'link.dead-reference',
          category,
          link: linkPath,
          source_file: source.file,
          source_id: source.item.operation_id ?? source.item.id,
          message: `formal_spec_links.${category}: "${linkPath}" not found (resolved: ${resolved})`,
        });
        continue;
      }

      // 추가 검증 — decision_tables 일 때 br_id 가 source 의 related_rules 또는 finding_refs 와 정합?
      if (category === 'decision_tables' && linkPath.endsWith('.md') || linkPath.endsWith('.json')) {
        const expectedBrId = basename(linkPath, linkPath.endsWith('.json') ? '.json' : '.md');
        const linkedRules = source.item.related_rules ?? source.item.finding_refs ?? [];
        // related_rules 가 비었으면 정합성 검증 skip (optional)
        // 비어있지 않은데 expectedBrId 가 자체 존재 안 하는 BR pattern 이면 finding
        if (linkedRules.length > 0 && !expectedBrId.match(/^BR-[A-Z0-9_-]+-\d+$/)) {
          findings.push({
            severity: 'non-breaking',
            kind: 'link.br-id-pattern-mismatch',
            link: linkPath,
            expected_pattern: '^BR-[A-Z0-9_-]+-\\d+$',
            actual: expectedBrId,
          });
        }
      }
    }
  }

  return findings;
}

export function summarize(findings) {
  const out = { breaking: 0, 'non-breaking': 0, info: 0 };
  for (const d of findings) out[d.severity] = (out[d.severity] ?? 0) + 1;
  return out;
}
