#!/usr/bin/env bash
# lint-no-simulation.sh — Sprint 4 묶음 O 차단 룰 enforcement.
# 입력: 디렉토리 (재귀). 검사: _manifest.yml + cross_validation 메타에 5종 물증 모두 있는지.
# 5종 누락 또는 simulation_only:true → exit 1.

set -euo pipefail

TARGET_DIR="${1:-.}"
EXIT=0

if [ ! -d "$TARGET_DIR" ]; then
  echo "[lint-no-simulation] usage: $0 <dir-with-cross-validation-metadata>" >&2
  exit 2
fi

# 1. simulation_only:true grep
if grep -r --include='*.yml' --include='*.yaml' --include='*.json' -l 'simulation_only.*:.*true' "$TARGET_DIR" 2>/dev/null; then
  echo "[lint-no-simulation] ❌ FAIL — simulation_only:true detected. no-simulation policy violated." >&2
  EXIT=1
fi

# 2. real_tool:false grep (단, simulation_reason 필드와 함께 쓰인 명시적 case 만 허용)
while IFS= read -r f; do
  if grep -q 'simulation_reason' "$f" 2>/dev/null; then
    echo "[lint-no-simulation] ⚠️  ALLOWED — $f has real_tool:false WITH explicit simulation_reason (-5%p confidence penalty applies)"
  else
    echo "[lint-no-simulation] ❌ FAIL — $f has real_tool:false WITHOUT simulation_reason. Either run real tool or document why." >&2
    EXIT=1
  fi
done < <(grep -r --include='*.yml' --include='*.yaml' --include='*.json' -l 'real_tool.*:.*false' "$TARGET_DIR" 2>/dev/null || true)

# 3. real_tool:true → 5종 물증 필드 모두 있는지
REQUIRED=(tool_stdout_path tool_stderr_path tool_version invocation_timestamp duration_ms result_hash reproduction_command)
while IFS= read -r f; do
  for k in "${REQUIRED[@]}"; do
    if ! grep -q "$k" "$f" 2>/dev/null; then
      echo "[lint-no-simulation] ❌ FAIL — $f has real_tool:true but missing evidence field: $k" >&2
      EXIT=1
    fi
  done
done < <(grep -r --include='*.yml' --include='*.yaml' --include='*.json' -l 'real_tool.*:.*true' "$TARGET_DIR" 2>/dev/null || true)

if [ $EXIT -eq 0 ]; then
  echo "[lint-no-simulation] ✅ OK — no policy violation found in $TARGET_DIR"
fi
exit $EXIT
