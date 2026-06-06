// yaml-emit.js — 최소 결정적 block-style YAML 직렬화 (zero-dep / pure / testable).
//
// 목적: swagger-extract → openapi.yaml elevation 의 직렬화 layer.
//   외부 yaml 의존 회피 (workspace 무 yaml dep / dep drift 회피 S1 정합).
//   OpenAPI 문서 = object / array / string / number / boolean / null 조합 → block style 로 직렬화.
//
// 범위 한정: OpenAPI 문서 표현에 필요한 JSON 값 타입만. cyclic ref / function / undefined = 비대상.
// 결정적성: key 순서 = 입력 객체의 삽입 순서 보존 (Object.keys). multiline 문자열 = double-quote escape.

// YAML plain scalar 로 안전하게 쓸 수 있는 문자열인가 (따옴표 불필요).
function isPlainSafe(s) {
  if (s.length === 0) return false;
  // 숫자/불리언/null 처럼 보이면 따옴표 필요 (타입 오해 방지).
  if (/^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$/.test(s)) return false;
  if (/^(true|false|null|yes|no|on|off|~)$/i.test(s)) return false;
  // 선행/후행 공백 또는 제어문자 → 따옴표.
  if (s !== s.trim()) return false;
  if (/[\n\t]/.test(s)) return false;
  // block 컨텍스트 plain scalar 정밀 규칙 (YAML 1.2):
  //   - 첫 글자가 indicator (- ? : , [ ] { } # & * ! | > ' " % @ `) → 따옴표.
  if (/^[-?:,\[\]{}#&*!|>'"%@`]/.test(s)) return false;
  //   - ": " (콜론+공백) 또는 끝 콜론 → mapping 모호 → 따옴표.
  if (/:(\s|$)/.test(s)) return false;
  //   - " #" (공백+해시) → 주석 시작 모호 → 따옴표.
  if (/\s#/.test(s)) return false;
  //   - 따옴표/역슬래시 포함 → 안전하게 따옴표.
  if (/["'\\]/.test(s)) return false;
  //   (주의: { } [ ] , 는 첫 글자 아니면 block scalar 안에서 안전 — URL/path 템플릿 /x/{id} 보존.)
  return true;
}

function quoteString(s) {
  if (isPlainSafe(s)) return s;
  // double-quote + escape (\ " 및 제어문자).
  const esc = s
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\t/g, '\\t')
    .replace(/\r/g, '\\r');
  return `"${esc}"`;
}

function scalar(v) {
  if (v === null) return 'null';
  if (typeof v === 'boolean') return v ? 'true' : 'false';
  if (typeof v === 'number') {
    if (!Number.isFinite(v)) throw new Error(`yaml-emit: non-finite number not representable: ${v}`);
    return String(v);
  }
  if (typeof v === 'string') return quoteString(v);
  throw new Error(`yaml-emit: unsupported scalar type: ${typeof v}`);
}

function isScalar(v) {
  return v === null || typeof v === 'boolean' || typeof v === 'number' || typeof v === 'string';
}

// 빈 컬렉션은 flow 표기 ({} / []) 로 — block 표기로는 "비어있음" 표현 불가.
function emit(value, indent) {
  const pad = '  '.repeat(indent);
  const lines = [];

  if (Array.isArray(value)) {
    if (value.length === 0) return [`${pad}[]`];
    for (const item of value) {
      if (isScalar(item)) {
        lines.push(`${pad}- ${scalar(item)}`);
      } else if (Array.isArray(item)) {
        // 배열 안 배열: '- ' 다음 줄에 중첩.
        if (item.length === 0) {
          lines.push(`${pad}- []`);
        } else {
          lines.push(`${pad}-`);
          lines.push(...emit(item, indent + 1));
        }
      } else {
        // 객체 항목: 첫 key 를 '- ' 와 같은 줄에 두고 나머지는 정렬.
        const sub = emitObjectInline(item, indent + 1);
        if (sub.length === 0) {
          lines.push(`${pad}- {}`);
        } else {
          lines.push(`${pad}- ${sub[0]}`);
          for (let i = 1; i < sub.length; i++) lines.push(`${pad}  ${sub[i]}`);
        }
      }
    }
    return lines;
  }

  if (value && typeof value === 'object') {
    const sub = emitObjectInline(value, indent);
    return sub.map((l) => `${pad}${l}`);
  }

  return [`${pad}${scalar(value)}`];
}

// 객체를 indent 0 기준 라인 배열로 반환 (호출측이 pad 부여). key 순서 보존.
function emitObjectInline(obj, indent) {
  const keys = Object.keys(obj);
  if (keys.length === 0) return ['{}'];
  const out = [];
  for (const k of keys) {
    const v = obj[k];
    const key = quoteString(k);
    if (isScalar(v)) {
      out.push(`${key}: ${scalar(v)}`);
    } else if (Array.isArray(v)) {
      if (v.length === 0) {
        out.push(`${key}: []`);
      } else {
        out.push(`${key}:`);
        for (const line of emit(v, 0)) out.push(`  ${line}`);
      }
    } else {
      // nested object
      const nestedKeys = Object.keys(v);
      if (nestedKeys.length === 0) {
        out.push(`${key}: {}`);
      } else {
        out.push(`${key}:`);
        for (const line of emit(v, 0)) out.push(`  ${line}`);
      }
    }
  }
  return out;
}

// 최상위 직렬화 — 항상 object 진입 가정 (OpenAPI 루트 = object).
export function emitYaml(doc) {
  if (doc === null || typeof doc !== 'object' || Array.isArray(doc)) {
    return emit(doc, 0).join('\n') + '\n';
  }
  return emitObjectInline(doc, 0).join('\n') + '\n';
}

// 테스트/검증용 export.
export const _internals = { isPlainSafe, quoteString, scalar };
