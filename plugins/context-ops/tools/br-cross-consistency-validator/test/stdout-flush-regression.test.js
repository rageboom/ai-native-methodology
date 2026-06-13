// stdout-flush-regression.test.js — writeStdoutSync 대용량 출력이 process.exit() 직후에도
// 파이프 소비자(execFileSync)에서 truncation 되지 않음을 회귀 검증.
// WLFR 489-rule dogfood: br-cross 69KB 출력이 console.log+process.exit 로 파이프에서 56855B
// truncation → 게이트 JSON.parse 실패. (DEC-2026-06-13-validator-stdout-truncation-fix)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const helper = resolve(__dirname, '../../_shared/write-stdout-sync.js');
const helperUrl = pathToFileURL(helper).href;

// 파이프 커널 버퍼(~64KB)를 크게 넘는 페이로드를 writeStdoutSync 로 쓴 뒤 즉시 process.exit(0).
// console.log + process.exit 였다면 비동기 flush 전 종료로 잘렸을 것.
function runChild(byteTarget) {
	const childSrc = `
		import { writeStdoutSync } from ${JSON.stringify(helperUrl)};
		const arr = Array.from({ length: ${byteTarget} }, (_, i) => ({ i, k: 'value-한글-' + i }));
		writeStdoutSync(JSON.stringify({ items: arr }, null, 2));
		process.exit(0);
	`;
	return execFileSync('node', ['--input-type=module', '-e', childSrc], {
		encoding: 'utf-8',
		maxBuffer: 64 * 1024 * 1024,
	});
}

test('writeStdoutSync: 대용량(>64KB) 출력이 process.exit 직후에도 파이프에서 완전 캡처', () => {
	const out = runChild(5000); // ~수백 KB JSON (파이프 버퍼 수배 초과)
	assert.ok(out.length > 200 * 1024, `output should exceed pipe buffer (got ${out.length}B)`);
	// truncation 됐다면 JSON.parse 실패. 완전하면 통과 + 끝(마지막 키)까지 보존.
	const parsed = JSON.parse(out);
	assert.equal(parsed.items.length, 5000);
	assert.equal(parsed.items[4999].i, 4999, '마지막 요소(스트림 끝)까지 truncation 없이 보존');
});

test('writeStdoutSync: 멀티바이트(한글) 경계가 잘리지 않음', () => {
	const out = runChild(3000);
	const parsed = JSON.parse(out); // mid-multibyte 잘림 시 invalid UTF-8 → parse 실패
	assert.ok(parsed.items.every((x) => x.k.includes('한글')));
});
