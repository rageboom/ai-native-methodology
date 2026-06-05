// dmn-check 5종 차용 (red6/dmn-check Apache 2.0 알고리즘) — 약식 구현.
// 입력: 단일 markdown 표 ({ headers, rows }). 사용자가 "입력 컬럼 / 출력 컬럼" 분할 인덱스 제공.
//
// 5종:
//   1. duplicate     — 입력 컬럼 모든 값이 동일한 두 row
//   2. conflict      — 입력 동일 + 출력 다름 (UNIQUE hit policy 위반)
//   3. gap           — bool 입력 (Y/N) 의 모든 조합 (2^N) 중 누락 — wildcard "*" 는 모든 조합 포괄
//   4. overlap       — wildcard "*" 가 다른 구체 row 와 동일 입력을 cover (UNIQUE 위반 후보)
//   5. type-check    — 같은 입력 컬럼 내 cell kind 가 일관 (모두 bool 또는 모두 literal). 혼합 시 finding.

import { classifyCell } from './parse-md-table.js';

export function checkDecisionTable({ headers, rows, inputCols, outputCols, source = 'unknown' }) {
  const findings = [];
  const N = headers.length;
  inputCols ??= guessInputCols(headers);
  outputCols ??= range(N).filter((i) => !inputCols.includes(i));

  if (inputCols.length === 0) {
    findings.push({ severity: 'breaking', kind: 'table.no-input-columns', message: 'cannot identify input columns' });
    return findings;
  }
  if (outputCols.length === 0) {
    findings.push({ severity: 'non-breaking', kind: 'table.no-output-columns', message: 'cannot identify output columns' });
  }

  const classifiedRows = rows.map((r) => r.map(classifyCell));

  // 5. type-check — 컬럼 단위 cell kind 분포
  for (const ci of inputCols) {
    const kinds = new Set(classifiedRows.map((r) => r[ci]?.kind).filter(Boolean));
    kinds.delete('wildcard'); // wildcard 는 type 무관
    kinds.delete('empty');
    if (kinds.size > 1) {
      findings.push({
        severity: 'non-breaking',
        kind: 'type.mixed-column',
        column_index: ci,
        column_header: headers[ci],
        kinds: Array.from(kinds),
        message: `input column "${headers[ci]}" mixes cell kinds: ${Array.from(kinds).join(',')}`,
      });
    }
  }

  // 1+2. duplicate / conflict
  for (let a = 0; a < classifiedRows.length; a++) {
    for (let b = a + 1; b < classifiedRows.length; b++) {
      if (rowsInputEqual(classifiedRows[a], classifiedRows[b], inputCols)) {
        const sameOutput = rowsInputEqual(classifiedRows[a], classifiedRows[b], outputCols);
        if (sameOutput) {
          findings.push({
            severity: 'non-breaking',
            kind: 'rule.duplicate',
            rows: [a, b],
            message: `rows ${a + 1} and ${b + 1} are duplicates (same input + same output)`,
          });
        } else {
          findings.push({
            severity: 'breaking',
            kind: 'rule.conflict',
            rows: [a, b],
            message: `rows ${a + 1} and ${b + 1} conflict (same input, different output) — violates UNIQUE hit policy`,
          });
        }
      }
    }
  }

  // 4. overlap (wildcard 가 다른 구체 row 의 입력을 cover)
  for (let a = 0; a < classifiedRows.length; a++) {
    for (let b = 0; b < classifiedRows.length; b++) {
      if (a === b) continue;
      if (rowCovers(classifiedRows[a], classifiedRows[b], inputCols) && !rowsInputEqual(classifiedRows[a], classifiedRows[b], inputCols)) {
        const sameOutput = rowsInputEqual(classifiedRows[a], classifiedRows[b], outputCols);
        if (!sameOutput) {
          findings.push({
            severity: 'breaking',
            kind: 'rule.overlap',
            rows: [a, b],
            message: `row ${a + 1} (wildcard) overlaps row ${b + 1} (specific) with different output — UNIQUE policy ambiguous`,
          });
        }
      }
    }
  }

  // 3. gap — input 컬럼이 모두 bool kind 인 경우만 (2^N 조합 검증)
  const allBool = inputCols.every((ci) => classifiedRows.every((r) => ['bool', 'wildcard'].includes(r[ci]?.kind)));
  if (allBool && inputCols.length <= 5 && classifiedRows.length > 0) {
    const total = 1 << inputCols.length;
    let covered = 0;
    for (let mask = 0; mask < total; mask++) {
      const inputAssignment = inputCols.map((_, idx) => Boolean((mask >> idx) & 1));
      const isCovered = classifiedRows.some((r) => rowCoversAssignment(r, inputCols, inputAssignment));
      if (isCovered) covered++;
    }
    if (covered < total) {
      findings.push({
        severity: 'non-breaking',
        kind: 'rule.gap',
        covered, total,
        message: `decision table covers ${covered}/${total} possible boolean input combinations — ${total - covered} gap(s)`,
      });
    }
  }

  return findings;
}

function rowsInputEqual(a, b, cols) {
  for (const ci of cols) {
    const ca = a[ci], cb = b[ci];
    if (!ca || !cb) return false;
    if (ca.kind !== cb.kind) return false;
    if (ca.kind === 'wildcard') continue;
    if (ca.kind === 'bool') { if (ca.value !== cb.value) return false; }
    else if (ca.kind === 'literal') { if (ca.value !== cb.value) return false; }
    else if (ca.kind === 'empty') continue;
  }
  return true;
}

function rowCovers(rowA, rowB, cols) {
  for (const ci of cols) {
    const a = rowA[ci], b = rowB[ci];
    if (!a) return false;
    if (a.kind === 'wildcard') continue;
    if (b && a.kind === b.kind) {
      if (a.kind === 'bool') { if (a.value !== b.value) return false; }
      else if (a.kind === 'literal') { if (a.value !== b.value) return false; }
    } else return false;
  }
  return true;
}

function rowCoversAssignment(row, cols, assignment) {
  for (let k = 0; k < cols.length; k++) {
    const ci = cols[k];
    const cell = row[ci];
    if (!cell) return false;
    if (cell.kind === 'wildcard' || cell.kind === 'empty') continue;
    if (cell.kind !== 'bool') return false;
    if (cell.value !== assignment[k]) return false;
  }
  return true;
}

function guessInputCols(headers) {
  // 휴리스틱: header 가 "입력" / "input" 으로 시작하는 컬럼.
  const idx = [];
  headers.forEach((h, i) => {
    if (/^(입력|input)/i.test(h)) idx.push(i);
  });
  if (idx.length === 0) {
    // fallback — 마지막 컬럼 외 모두 input.
    for (let i = 0; i < headers.length - 1; i++) idx.push(i);
  }
  return idx;
}

function range(n) { return Array.from({ length: n }, (_, i) => i); }
