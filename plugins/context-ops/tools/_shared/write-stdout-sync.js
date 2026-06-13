// write-stdout-sync.js — 동기 stdout flush (대용량 파이프 출력 truncation 방지).
//
// 문제(WLFR 489-rule dogfood / DEC-2026-06-13-validator-stdout-truncation-fix):
//   validator 가 `console.log(JSON.stringify(result))` 직후 `process.exit(N)` 을 호출하면,
//   출력이 파이프 커널 버퍼(~64KB)를 넘을 때 console.log/process.stdout.write 가 비동기가 되어
//   process.exit() 가 flush 전에 프로세스를 종료 → 파이프로 캡처하는 소비자(findings-aggregator
//   의 execFileSync)가 truncation 된 JSON 을 받아 JSON.parse 실패(게이트 "error" + 허위 critical).
//   파일 redirect(`>`)는 동기라 멀쩡 → 파이프 소비자에서만 결정론적으로 깨짐.
//
// 해결: fd 1(stdout)에 fs.writeSync 로 blocking write(EAGAIN 재시도)하여 완전 flush 후 반환.
//   이어지는 process.exit(N) 은 데이터가 이미 다 쓰인 뒤라 안전. exit-code 의미 보존(변경 ❌).
import { writeSync } from 'node:fs';

/**
 * stdout(fd 1)에 동기 기록 + 후행 개행 보장. 완전히 쓰인 뒤 반환.
 * @param {string} text
 */
export function writeStdoutSync(text) {
	const buf = Buffer.from(text.endsWith('\n') ? text : text + '\n', 'utf8');
	let offset = 0;
	while (offset < buf.length) {
		try {
			offset += writeSync(1, buf, offset, buf.length - offset, null);
		} catch (e) {
			if (e.code === 'EAGAIN') continue; // non-blocking 파이프 가득 → 리더 drain 후 재시도
			throw e;
		}
	}
}
