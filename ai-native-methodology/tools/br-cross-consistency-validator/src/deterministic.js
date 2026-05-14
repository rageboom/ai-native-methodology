// Layer 1 결정적 검증 (100% 정확 / LLM 부재)
// ★ ADR-CHAIN-011 §5.3 정합 — anyOf 강제 + 키워드 매칭 + structure 검증 + BR id 4토막

const BR_ID_PATTERN = /^BR-[A-Z0-9_-]+-[A-Z0-9_-]+-[0-9]+$/;

const STOPWORDS_KO = new Set([
  '은', '는', '이', '가', '을', '를', '의', '에', '와', '과', '도', '만', '로', '으로', '에서', '부터', '까지',
  '다', '요', '까', '네', '지', '나', '며', '면', '며', '고',
  '것', '수', '때', '등', '및', '또', '또한', '그리고', '하지만', '그러나',
  '경우', '상황', '시점', '여부',
  '한다', '하는', '한', '하면', '하지', '해야', '할', '함',
  '있다', '있는', '있을', '없다', '없는',
  '됩니다', '됩니', '된다', '되는', '되어',
]);

const STOPWORDS_EN = new Set([
  'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'of', 'to', 'and', 'or', 'in', 'on', 'at', 'by', 'for', 'with', 'as',
  'this', 'that', 'these', 'those', 'it', 'its', 'they', 'them',
  'must', 'should', 'will', 'shall', 'can', 'could', 'may', 'might',
  'has', 'have', 'had', 'do', 'does', 'did',
  'not', 'no', 'if', 'then', 'else', 'when', 'where', 'who', 'whom',
]);

// given 영역 키워드 (전제)
const GIVEN_KEYWORDS = [
  '있다', '있는', '있을', '존재', '보유', '가정', '주어', '주어진',
  '경우', '상황', '상태', '시점',
  'given', 'when', 'has', 'have', 'exists', 'is registered', 'is logged',
];

// when 영역 키워드 (발동)
const WHEN_KEYWORDS = [
  '할 때', '시도', '시점', '호출', '요청', '요구', '발생', '발동',
  '클릭', '입력', '제출', '전송', '진입',
  'try', 'attempt', 'request', 'call', 'submit', 'invoke', 'trigger', 'click', 'enter',
];

// then 영역 키워드 (결과)
const THEN_KEYWORDS = [
  '응답', '거부', '허용', '반환', '발생', '저장', '갱신', '삭제', '생성',
  '에러', '오류', '실패', '성공', '완료',
  '리다이렉트', '이동', '표시',
  'response', 'reject', 'allow', 'return', 'raise', 'throw', 'save', 'update', 'delete', 'create',
  'error', 'fail', 'success', 'complete',
];

export function extractKeywords(text) {
  if (typeof text !== 'string') return new Set();
  // ★ 단순 토큰화 — 공백 + 구두점 split / 한국어/영어 mix 대응
  // ★ 본 session = 단순 word-level / 다음 session 한국어 형태소 분석 정밀화 후보 (ADR-CHAIN-011 §7.2 한계 명시)
  const tokens = text
    .toLowerCase()
    .replace(/[.,;:!?'"`~/\\(){}\[\]<>=+\-*&^%$#@|]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length >= 2)
    .filter(t => !STOPWORDS_EN.has(t) && !STOPWORDS_KO.has(t));
  return new Set(tokens);
}

export function keywordOverlap(setA, setB) {
  if (setA.size === 0 || setB.size === 0) return { common: new Set(), score: 0 };
  const common = new Set();
  for (const t of setA) {
    if (setB.has(t)) common.add(t);
  }
  // ★ intersection / max(|A|, |B|) — Plan N §4-2 정합
  const score = common.size / Math.max(setA.size, setB.size);
  return { common, score };
}

function joinGWT(gwt) {
  const parts = [];
  for (const key of ['given', 'when', 'then']) {
    const v = gwt[key];
    if (Array.isArray(v)) parts.push(...v);
    else if (typeof v === 'string') parts.push(v);
  }
  return parts.join(' ');
}

function hasAnyKeyword(text, keywords) {
  const lower = text.toLowerCase();
  return keywords.some(kw => lower.includes(kw.toLowerCase()));
}

export function validateBR(br, options = {}) {
  const findings = [];
  const path = options.path || '/business_rules/?';
  const keywordThreshold = options.keywordThreshold ?? 0.5;

  // ★ ★ ★ v2.5.0 Phase A paradigm 재정의 (ADR-CHAIN-011 §5 patch v3) — description ≠ natural_language alias
  //   ★ natural_language = ★ pure BR statement / cross-validation 대상 (★ Layer 2 LLM mandatory v2.5.0 Phase C)
  //   ★ description = ★ optional metadata (★ rationale + caveat 자유 / cross-validation 대상 ❌)
  //   ★ ★ session 9차 SPIKE v2 결정적 사실 정합 (description 안 rationale 안 GWT 매칭 keyword 존재 = description ≠ pure BR statement)
  const nlText = (typeof br.natural_language === 'string' && br.natural_language.trim().length > 0)
    ? br.natural_language
    : null;
  const hasNL = nlText !== null;
  // ★ ★ description = optional metadata (★ cross-validation 대상 ❌ / Phase A backward-compat fallback)
  const hasDescription = typeof br.description === 'string' && br.description.trim().length > 0;
  // ★ ★ GWT — array 의무 (★ schema 안 array required) / 단 string 도 호환 인정 (★ PoC #02 사실 정합)
  const hasGWTArray = Array.isArray(br.given) && br.given.length > 0
    && Array.isArray(br.when) && br.when.length > 0
    && Array.isArray(br.then) && br.then.length > 0;
  const hasGWTString = typeof br.given === 'string' && br.given.length > 0
    && typeof br.when === 'string' && br.when.length > 0
    && typeof br.then === 'string' && br.then.length > 0;
  const hasGWT = hasGWTArray || hasGWTString;
  // ★ ★ trigger/condition/action alias (PoC #03 사실 정합)
  const hasTCA = (typeof br.trigger === 'string' || Array.isArray(br.trigger))
    && (typeof br.condition === 'string' || Array.isArray(br.condition))
    && (typeof br.action === 'string' || Array.isArray(br.action));

  // ★ 4-1. 표현 ≥ 1 의무 (★ NL / GWT / description fallback / TCA 변형 인정)
  if (!hasNL && !hasGWT && !hasTCA && !hasDescription) {
    findings.push({
      id: nextFindingId('REPR'),
      severity: 'critical',
      path,
      br_id: br.id || '<unknown>',
      rule: 'representation_missing',
      message: 'natural_language / given-when-then / description / trigger-condition-action 중 ≥ 1 표현 의무 (★ schema anyOf 정합)',
      suggestion: '★ ★ natural_language 우선 작성 권장 (★ v2.5.0 paradigm)',
    });
  }

  // ★ ★ ★ v2.5.0 Phase A 신규 — description-only fallback carry (★ Phase B 마이그레이션 의무 / C-poc-03-05-dual-representation 정합)
  if (!hasNL && !hasGWT && !hasTCA && hasDescription) {
    findings.push({
      id: nextFindingId('FALLBACK'),
      severity: 'low',
      path,
      br_id: br.id || '<unknown>',
      rule: 'description_only_fallback',
      message: '★ description fallback (★ cross-validation 미시행) — natural_language 마이그레이션 의무 (★ Phase B carry)',
      suggestion: '★ description 첫 문장 → natural_language 추출 + description 안 rationale/caveat 보존',
    });
  }

  // ★ 4-4. BR id 4토막 strict
  if (typeof br.id === 'string' && !BR_ID_PATTERN.test(br.id)) {
    findings.push({
      id: nextFindingId('ID'),
      severity: 'medium',
      path,
      br_id: br.id,
      rule: 'id_pattern_violation',
      message: `BR id 4토막 strict pattern 위반 (예상: BR-{도메인}-{이름}-{번호} / 현: ${br.id})`,
      suggestion: 'BR id 4토막 정합 (v2.3.7 enforcement)',
    });
  }

  // ★ 4-2 + 4-3. 두 표현 동시 보유 시 cross-validation
  let overlapScore = null;
  if (hasNL && hasGWT) {
    const nlKw = extractKeywords(nlText);
    const gwtText = joinGWT(br);
    const gwtKw = extractKeywords(gwtText);
    const { common, score } = keywordOverlap(nlKw, gwtKw);
    overlapScore = score;

    if (score < keywordThreshold) {
      findings.push({
        id: nextFindingId('KW'),
        severity: 'medium',
        path,
        br_id: br.id || '<unknown>',
        rule: 'keyword_mismatch',
        message: `natural_language ↔ given/when/then 키워드 정합 ${(score * 100).toFixed(0)}% (< ${(keywordThreshold * 100).toFixed(0)}%)`,
        suggestion: '두 표현 의미 정합 검토 또는 natural_language 갱신',
        natural_language_keywords: [...nlKw].slice(0, 20),
        gwt_keywords: [...gwtKw].slice(0, 20),
        common_keywords: [...common].slice(0, 20),
        overlap_score: Number(score.toFixed(3)),
      });
    }

    // ★ 4-3. structure 검증
    if (Array.isArray(br.given)) {
      const givenText = br.given.join(' ');
      if (hasAnyKeyword(givenText, THEN_KEYWORDS) && !hasAnyKeyword(givenText, GIVEN_KEYWORDS)) {
        findings.push({
          id: nextFindingId('STR'),
          severity: 'low',
          path,
          br_id: br.id || '<unknown>',
          rule: 'structure_given_has_result_keyword',
          message: 'given 안 결과(then) 키워드 발견 + 전제(given) 키워드 부재',
          suggestion: 'given 안 전제 조건 표현 점검',
        });
      }
    }
    if (Array.isArray(br.when)) {
      const whenText = br.when.join(' ');
      if (hasAnyKeyword(whenText, GIVEN_KEYWORDS) && !hasAnyKeyword(whenText, WHEN_KEYWORDS)) {
        findings.push({
          id: nextFindingId('STR'),
          severity: 'low',
          path,
          br_id: br.id || '<unknown>',
          rule: 'structure_when_has_precondition_keyword',
          message: 'when 안 전제(given) 키워드 발견 + 발동(when) 키워드 부재',
          suggestion: 'when 안 발동 조건 표현 점검',
        });
      }
    }
  }

  return { findings, overlap_score: overlapScore, has_nl: hasNL, has_gwt: hasGWT, has_description: hasDescription };
}

// ★ Layer 1 = single-pass / finding id sequence는 호출자에서 reset
let _findingSeq = 0;
function nextFindingId(prefix) {
  _findingSeq += 1;
  return `F-CONSISTENCY-${prefix}-${String(_findingSeq).padStart(3, '0')}`;
}
export function resetFindingSeq() { _findingSeq = 0; }

export const __testing__ = { BR_ID_PATTERN, GIVEN_KEYWORDS, WHEN_KEYWORDS, THEN_KEYWORDS, STOPWORDS_KO, STOPWORDS_EN };
