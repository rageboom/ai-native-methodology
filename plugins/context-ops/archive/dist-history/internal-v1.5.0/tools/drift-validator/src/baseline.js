// Sprint 5+ Phase C — baseline 모듈 공용 이동 (tools/_shared/baseline.js).
// 본 파일은 backward-compat re-export shim. 기존 import path (`./baseline.js`) 유지 — 회귀 0.
// 신규 도구는 `tools/_shared/baseline.js` 직접 import 권장 (ADR-010 §2.5 정합).

export {
	fingerprint,
	readBaseline,
	classifyAgainstBaseline,
	writeBaseline,
	ratchetCheck,
	SEVERITY_RATCHET,
} from '../../_shared/baseline.js';
