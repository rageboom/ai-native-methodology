// Markdown 결정표 파서 — `| input | input | ... | output |` 형태의 첫 번째 표 추출.
// dmn-check 차용 5종 검증의 입력으로 사용.

const normalize = (s) => String(s).trim()
  .replace(/[★⚠️✅❌⏳]/g, '')
  .replace(/<br\s*\/?>(\s*)/gi, ' ')
  .replace(/\s+/g, ' ')
  .trim();

// "Y" / "예" / "O" → true ; "N" / "아니오" / "X" → false ; "*" → wildcard ; else literal.
function classifyCell(raw) {
  const v = normalize(raw).toLowerCase();
  if (v === '*') return { kind: 'wildcard' };
  if (['y', 'yes', 'o', '예', '참', 'true'].includes(v)) return { kind: 'bool', value: true };
  if (['n', 'no', 'x', '아니오', '거짓', 'false'].includes(v)) return { kind: 'bool', value: false };
  if (v === '' || v === '-') return { kind: 'empty' };
  return { kind: 'literal', value: v };
}

export function parseMarkdownTables(md) {
  // 모든 markdown table 추출. 각 table = { headers, rows, lineStart }
  const lines = md.split('\n');
  const tables = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    // 표 헤더 후보: pipe 로 시작/끝
    if (/^\s*\|.*\|\s*$/.test(line) && i + 1 < lines.length && /^\s*\|[\s:|\-]+\|\s*$/.test(lines[i + 1])) {
      const header = parseRow(line);
      const rows = [];
      let j = i + 2;
      while (j < lines.length && /^\s*\|.*\|\s*$/.test(lines[j])) {
        rows.push(parseRow(lines[j]));
        j++;
      }
      tables.push({ headers: header, rows, lineStart: i + 1 });
      i = j;
    } else {
      i++;
    }
  }
  return tables;
}

function parseRow(line) {
  return line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map(normalize);
}

export { classifyCell, normalize };
