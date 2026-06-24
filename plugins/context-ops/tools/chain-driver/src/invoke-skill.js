// invoke-skill.js — skill markdown 메타 로드 + frontmatter parse.
// LLM 자동 호출 ❌ — 사용자에게 stderr 권고만 (D21' 정합).

import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

export function resolveSkillPath(repoRoot, skillId) {
	// skillId = "discovery-from-analysis-output" 형식.
	const direct = join(repoRoot, 'skills', skillId, 'SKILL.md');
	if (existsSync(direct)) return direct;
	const nested = join(
		repoRoot,
		'ai-native-methodology',
		'skills',
		skillId,
		'SKILL.md',
	);
	if (existsSync(nested)) return nested;
	return null;
}

export function loadSkill(repoRoot, skillId) {
	const path = resolveSkillPath(repoRoot, skillId);
	if (!path) throw new SkillNotFoundError(`skill not found: ${skillId}`);
	const raw = readFileSync(path, 'utf-8');
	return { path, ...parseFrontmatter(raw) };
}

// Minimal YAML-ish frontmatter parser (subset: key: value, key: [list], multiline strings).
export function parseFrontmatter(raw) {
	const meta = {};
	const lines = raw.split('\n');
	if (lines[0]?.trim() !== '---') return { meta, body: raw };
	let endIdx = -1;
	for (let i = 1; i < lines.length; i++) {
		if (lines[i].trim() === '---') {
			endIdx = i;
			break;
		}
	}
	if (endIdx === -1) return { meta, body: raw };
	for (let i = 1; i < endIdx; i++) {
		const line = lines[i];
		const m = line.match(/^([a-zA-Z0-9_-]+):\s*(.*)$/);
		if (!m) continue;
		const key = m[1];
		let val = m[2].trim();
		if (val.startsWith('[') && val.endsWith(']')) {
			val = val
				.slice(1, -1)
				.split(',')
				.map((x) => x.trim().replace(/^["']|["']$/g, ''));
		} else if (
			(val.startsWith('"') && val.endsWith('"')) ||
			(val.startsWith("'") && val.endsWith("'"))
		) {
			val = val.slice(1, -1);
		}
		meta[key] = val;
	}
	const body = lines.slice(endIdx + 1).join('\n');
	return { meta, body };
}

// suggest = stderr only / LLM context 격리 (D21').
export function formatSkillSuggestion(skillId, meta) {
	const name = meta?.name || skillId;
	const desc = meta?.description || '(no description)';
	return [
		`[chain-driver] suggested skill: ${name}`,
		`  path: skills/${skillId}/SKILL.md`,
		`  description: ${desc}`,
		`  LLM SHALL NOT auto-invoke. User explicit decision REQUIRED.`,
		`  Run via /chain-next or /chain-stage <name>.`,
	].join('\n');
}

// hookSpecificOutput.additionalContext — 차단 문구를 LLM context 에 명시 동봉.
// v4.0 multi-agent paradigm (DEC-2026-05-17): agentId 가 있으면 agent dispatch 권고 동봉.
export function formatHookBlockContext(skillId, meta, agentId) {
	return (
		`chain-driver suggested skill '${skillId}' (${meta?.name || ''}). ` +
		(agentId
			? `v4.0 paradigm: dispatch agent '${agentId}' via Task tool (multi-agent / DEC-2026-05-17-v4-multi-agent-paradigm-채택). `
			: '') +
		`LLM SHALL NOT auto-invoke this skill. ` +
		`User explicit decision REQUIRED via /chain-next or /chain-stage <name>.`
	);
}

export class SkillNotFoundError extends Error {
	constructor(msg) {
		super(msg);
		this.name = 'SkillNotFoundError';
		this.exitCode = 3;
	}
}
