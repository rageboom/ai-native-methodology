// hotspot.js — Tornhill hotspot prioritization (churn × complexity). git-only + 파일내용. 결정론.
//
// 델타 #4 (DEC-2026-06-09-hotspot-prioritization-reference-lens / plan §3 "S0 carve 와 묶음"):
//   3 구조 신호(SCC/Martin/co-change = WHERE to cut)에 **직교**하는 우선순위 axis (WHICH region first).
//   자주 바뀌고(churn) 복잡한(complexity) region = 먼저 carve/격리/hardening (Tornhill 2015/2018).
//
//   churn = co-change 가 mine 한 file_churn(windowed 전체 revision 수) **재사용**(단일 git 패스 / 중복 0).
//   complexity = indentation-complexity (Tornhill canonical proxy) — 줄별 들여쓰기 레벨 합.
//     언어 무관 + 파서 불요 + 실 측정(no-simulation). cyclomatic(AST)은 언어별 파서 필요 → 1차 scope 외.
//
// no-simulation 정직 경계: churn 부재(co-change 미실행/이력 없음) = 정직 미산출(coChangeStatus mirror).
//   파일 read 실패(삭제·이동·binary) = honest skip(추정 ❌). readFileFn 주입형(테스트 seam).

import { join } from 'node:path';

function round4(x) {
	return Math.round(x * 10000) / 10000;
}

// indentation-complexity: 비공백 줄별 들여쓰기 레벨(= leading whitespace / tab_width) 합 + 평균.
//   tab = tab_width 공백 환산. flat 파일(markdown 등)은 ~0 → churn 높아도 hotspot 낮음(Tornhill 의도: 복잡코드).
export function indentationComplexity(content, tabWidth = 4) {
	let total = 0;
	let lines = 0;
	for (const raw of content.split('\n')) {
		if (!raw.trim()) continue; // blank 제외
		lines++;
		let spaces = 0;
		for (const ch of raw) {
			if (ch === ' ') spaces++;
			else if (ch === '\t') spaces += tabWidth;
			else break;
		}
		total += Math.floor(spaces / tabWidth);
	}
	return { total, lines, mean: lines ? round4(total / lines) : 0 };
}

// fileChurn = { [path]: revisionCount } (co-change file_churn). coChangeStatus = co-change status mirror.
// readFileFn(absPath) -> string (throws/ null = read 불가 → honest skip).
export function computeHotspot({
	fileChurn,
	repoPath = null,
	readFileFn,
	params,
	coChangeStatus,
}) {
	const { top_n, min_churn, tab_width } = params;

	if (coChangeStatus !== 'mined') {
		return {
			status: coChangeStatus, // not_run / no_git_history mirror
			items: [],
			note: `churn(co-change git 이력) 부재 — hotspot 미산출 (co_change.status=${coChangeStatus}).`,
		};
	}
	if (typeof readFileFn !== 'function') {
		return {
			status: 'not_run',
			items: [],
			note: 'readFileFn 미주입 — complexity 측정 불가.',
		};
	}

	const scored = [];
	let unreadable = 0;
	let belowChurn = 0;
	for (const [file, churn] of Object.entries(fileChurn)) {
		if (churn < min_churn) {
			belowChurn++;
			continue;
		}
		let content;
		try {
			content = readFileFn(repoPath ? join(repoPath, file) : file);
		} catch {
			unreadable++;
			continue; // 삭제·이동·binary — honest skip (추정 ❌)
		}
		if (content == null) {
			unreadable++;
			continue;
		}
		const cx = indentationComplexity(content, tab_width);
		scored.push({
			file,
			churn,
			complexity_total: cx.total,
			complexity_mean: cx.mean,
			score: churn * cx.total,
		});
	}
	// 결정론 정렬: score desc → file asc
	scored.sort(
		(a, b) =>
			b.score - a.score || (a.file < b.file ? -1 : a.file > b.file ? 1 : 0),
	);
	const items = scored.slice(0, top_n);
	return {
		status: 'mined',
		items,
		note: `churn × indentation-complexity (Tornhill). ${scored.length} file(s) scored (min_churn>=${min_churn} / ${belowChurn} below) → top ${items.length}${unreadable ? ` / ${unreadable} unreadable(삭제·이동·binary) honest skip` : ''}. score=churn×complexity_total (flat 파일=낮은 score).`,
	};
}
