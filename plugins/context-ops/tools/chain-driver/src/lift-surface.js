// lift-surface.js — Gap B surface (plan-living-graph-autowire §4 / living-sync §7) 순수 렌더/조립.
//
// 역할: liftCandidates(lift-anchor.js / surface-only) 결과 → 사람 gate-검토용 advisory 객체 + 텍스트.
// 불변: I/O·graph mutation·forward 전파 0 (forward-only / computeSyncLoop 미 import = 구조적 보장).
//   drain glue(manifest read/clear)는 cli.js 소관 — 본 모듈은 순수(테스트 용이 / revisit-impact.js 의 렌더 분리 동형).

export function buildLiftAdvisory(lift, changedPaths) {
	return {
		changed_paths: [...changedPaths],
		anchors: [...lift.anchors],
		unresolved: [...lift.unresolved],
		ceiling_candidates: lift.ceilingCandidates.map((c) => ({ ...c })),
	};
}

const MAX_SHOWN = 8;

export function renderLiftAdvisory(adv) {
	if (adv.degraded) {
		return (
			`[lift 후보] 손수정 코드 ${adv.changed_paths.length}건 ` +
			`(${adv.changed_paths.join(', ')}) — ${adv.reason}`
		);
	}
	const lines = [
		`[lift 후보 / forward-only · auto-climb ❌] 손수정 코드 ${adv.changed_paths.length}건 → 의미천장 후보:`,
	];
	if (!adv.ceiling_candidates || adv.ceiling_candidates.length === 0) {
		lines.push(
			`  (천장 후보 없음 — anchor ${adv.anchors.length}건 forward-leaf / ` +
			`unresolved ${adv.unresolved.length}건 = 코드 앵커 커버리지 상한)`,
		);
	} else {
		for (const c of adv.ceiling_candidates.slice(0, MAX_SHOWN)) {
			lines.push(
				`  • ${c.id} (${c.grade} / +${c.additional_hard_hops}hop / ${c.first_hop_edge_type})`,
			);
		}
		if (adv.ceiling_candidates.length > MAX_SHOWN) {
			lines.push(`  … (+${adv.ceiling_candidates.length - MAX_SHOWN} more)`);
		}
	}
	if (adv.unresolved?.length) {
		lines.push(`  unresolved(추적 밖): ${adv.unresolved.length}건`);
	}
	lines.push(
		`  → 의도 재전파: chain-driver lift --changed <path> --ceiling <id> (사람이 천장 확정 / 자동 ❌).`,
	);
	return lines.join('\n');
}
