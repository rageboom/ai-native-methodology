// PII / 사내 신원 패턴 SSOT — Senior REVISE-2 (v11.29.0) 흡수.
// regex 복사 금지 (drift attractor 회피). 패턴 추가/수정 = 본 모듈 단일 지점.
// import 처: scripts/release-readiness.js (check27 shipped_identity_leak) + tools/adopter-evidence-packager.
//
// 정직 (official-docs VERIFIED): regex 기반 redaction = best-effort. false-negative 존재
//    (context-dependent PII 누락 가능) → adopter-evidence-packager 는 post-redaction leak guard 로 2중 방어.

// ── 사내 신원 (check27 / EXT-MISS-01) — 기존 check27 IDENTITY_RE 와 byte-identical (behavior 불변) ──
//    non-global: check27 가 per-line `.test()` 로 사용 (stateful lastIndex 회피).
export const INTERNAL_IDENTITY_RE = /smilegate\.(com|net)|sangcl/i;

// ── 일반 PII 패턴 (adopter evidence 익명화) ──
export const EMAIL_RE = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
// Windows 절대경로 (C:\Users\name\…) + POSIX user/home 경로.
export const ABSOLUTE_PATH_RE =
	/(?:[A-Za-z]:\\[^\s"'`)\]]+|\/(?:home|Users|root)\/[^\s"'`)\]]+)/g;
// private key 헤더 (static-runner rsa-private-key 룰 정합).
export const PRIVATE_KEY_RE =
	/-----BEGIN (?:RSA |EC |OPENSSH |DSA |PGP )?PRIVATE KEY-----/g;
export const IPV4_RE = /\b(?:\d{1,3}\.){3}\d{1,3}\b/g;
// 사내 호스트 (redaction 용 / global). 신원 INTERNAL_IDENTITY_RE 와 별개 — adopter 가 사내 팀일 수 있음.
export const INTERNAL_HOST_RE = /\bsmilegate\.(?:com|net)\b/gi;

// ── 익명화 redaction 규칙 (free-text 필드: stack_signals / feedback summary·friction) ──
//    순서: 구체적(key/path) 먼저 → 일반(email/ip) 나중.
export const REDACTION_RULES = [
	{ label: 'private-key', re: PRIVATE_KEY_RE, replacement: '[redacted-key]' },
	{ label: 'abs-path', re: ABSOLUTE_PATH_RE, replacement: '[redacted-path]' },
	{ label: 'email', re: EMAIL_RE, replacement: '[redacted-email]' },
	{
		label: 'internal-host',
		re: INTERNAL_HOST_RE,
		replacement: '[redacted-host]',
	},
	{ label: 'ipv4', re: IPV4_RE, replacement: '[redacted-ip]' },
];

// ── post-redaction leak guard 규칙 (잔존 시 exit 1) ──
//    "확실한 PII" 만 (email / private key / 사내 host). org 부분문자열 false-positive 회피 (Senior REVISE-3).
export const LEAK_CHECK_RULES = [
	{ label: 'email', source: EMAIL_RE.source, flags: 'i' },
	{ label: 'private-key', source: PRIVATE_KEY_RE.source, flags: '' },
	{ label: 'internal-host', source: INTERNAL_HOST_RE.source, flags: 'i' },
];

/**
 * free-text 1건 redact. global regex 의 stateful lastIndex 회피 위해 매 호출 fresh RegExp.
 * @param {string} text
 * @returns {{ text: string, count: number, labels: string[] }}
 */
export function redactText(text) {
	if (typeof text !== 'string' || text.length === 0)
		return { text, count: 0, labels: [] };
	let out = text;
	let count = 0;
	const labels = [];
	for (const { label, re, replacement } of REDACTION_RULES) {
		const g = new RegExp(
			re.source,
			re.flags.includes('g') ? re.flags : re.flags + 'g',
		);
		out = out.replace(g, () => {
			count++;
			if (!labels.includes(label)) labels.push(label);
			return replacement;
		});
	}
	return { text: out, count, labels };
}

/**
 * post-redaction leak 검사 — 잔존 PII 패턴 1건이라도 있으면 hit.
 * @param {string} text
 * @returns {string[]} 매치된 leak label 목록 (빈 배열 = clean)
 */
export function scanLeak(text) {
	if (typeof text !== 'string' || text.length === 0) return [];
	const hits = [];
	for (const { label, source, flags } of LEAK_CHECK_RULES) {
		if (new RegExp(source, flags).test(text)) hits.push(label);
	}
	return hits;
}

// ── Secret / credential 패턴 (delta #2-b / DEC-2026-06-09-artifact-secret-scan) ──
//    방출 .ai-context/output 산출물 secret 누출 검출용 (release-block / check27 동형). low-FP 의무:
//    release 차단이므로 false-positive 최소화 — 고유 prefix 토큰 + private key + 비-placeholder 할당만.
//    실증 risk: br-cross-consistency 가 산출물에 `SECRET = "..."` verbatim 복사 (output-hygiene 결함).

// 고유 prefix / 형식 기반 토큰 (very-low-FP / verbatim 누출 = 거의 확실 진짜 secret).
export const SECRET_TOKEN_RULES = [
	{ label: 'aws-access-key', source: '\\bAKIA[0-9A-Z]{16}\\b', flags: '' },
	{
		label: 'github-token',
		source: '\\b(?:gh[pos ur]|github_pat)_[A-Za-z0-9_]{20,}\\b',
		flags: '',
	},
	{ label: 'slack-token', source: '\\bxox[baprs]-[0-9A-Za-z-]{10,}\\b', flags: '' },
	{ label: 'google-api-key', source: '\\bAIza[0-9A-Za-z_\\-]{35}\\b', flags: '' },
	{ label: 'stripe-secret-key', source: '\\bsk_live_[0-9A-Za-z]{16,}\\b', flags: '' },
	{ label: 'slack-webhook', source: 'hooks\\.slack\\.com/services/[A-Za-z0-9/]{20,}', flags: '' },
	{
		label: 'jwt',
		source: '\\beyJ[A-Za-z0-9_-]{8,}\\.eyJ[A-Za-z0-9_-]{8,}\\.[A-Za-z0-9_-]{8,}\\b',
		flags: '',
	},
	// private-key 는 PII PRIVATE_KEY_RE 와 동일 패턴 (secret 으로도 등재).
	{ label: 'private-key', source: PRIVATE_KEY_RE.source, flags: '' },
];

// 하드코딩 credential 할당 (`SECRET = "..."` 류). 값이 "진짜 secret 모양"일 때만 hit.
//   FP 회피(release-block): 구조화 산출물엔 password 가 field-name 으로 흔하고 값은 test-data/타입설명
//   ("secret123" / "@IsNotEmpty()" / "string (argon2 hash)") → 아래 looksLikeRealSecret 로 강하게 거른다.
const SECRET_ASSIGNMENT_RE =
	/(?:password|passwd|pwd|secret|api[_-]?key|apikey|access[_-]?key|auth[_-]?token|client[_-]?secret|private[_-]?key|encryption[_-]?key)["'\s]*[:=]\s*["']([^"'\n]+)["']/gi;

// placeholder / 예시 값 (contains-match) — credential 할당에서 제외 (release-block FP 회피).
const SECRET_PLACEHOLDER_RE =
	/example|changeme|change[_-]?me|placeholder|your[-_]|redacted|dummy|sample|fake|<|>|\$\{|\{\{|x{4,}/i;

// 진짜 secret 모양: 16+ token charset(공백·괄호·단어설명 배제) + letter·digit 혼재(entropy proxy) + 비-placeholder.
//   "secret123"(9) / "Test1234!"(9·`!`) / "@IsNotEmpty()"(`@()`) / "string (argon2 hash)"(공백) 모두 탈락.
function looksLikeRealSecret(val) {
	if (typeof val !== 'string' || val.length < 16) return false;
	if (!/^[A-Za-z0-9+/_=.\-]{16,}$/.test(val)) return false;
	if (!/[A-Za-z]/.test(val) || !/[0-9]/.test(val)) return false;
	if (SECRET_PLACEHOLDER_RE.test(val)) return false;
	return true;
}

/**
 * secret / credential 누출 검사 (delta #2-b). 결정론 regex (no-simulation / LLM 판단 ❌).
 * @param {string} text
 * @returns {string[]} 매치된 secret label 목록 (빈 배열 = clean). low-FP (release-block 용).
 */
export function scanSecrets(text) {
	if (typeof text !== 'string' || text.length === 0) return [];
	const hits = new Set();
	for (const { label, source, flags } of SECRET_TOKEN_RULES) {
		if (new RegExp(source, flags).test(text)) hits.add(label);
	}
	const re = new RegExp(SECRET_ASSIGNMENT_RE.source, 'gi');
	let m;
	while ((m = re.exec(text)) !== null) {
		if (looksLikeRealSecret(m[1].trim())) {
			hits.add('hardcoded-credential');
			break;
		}
	}
	return [...hits];
}
