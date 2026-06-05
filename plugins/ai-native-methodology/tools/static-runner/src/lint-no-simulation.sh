#!/usr/bin/env bash
# lint-no-simulation.sh — Sprint 4 묶음 O 차단 룰 enforcement.
# 입력: 디렉토리 (재귀). 검사: _manifest.yml + cross_validation 메타에 5종 물증 모두 있는지.
# 5종 누락 또는 simulation_only:true → exit 1.
# v2.0 sub-plan-3a — chain 4/5 (test-spec.json / impl-spec.json) 의 test_run_evidence(per-TC) /
#   test_pass_evidence(impl root) 5종 물증 10 필드 검증 추가 + impl-spec source_files commit_hash 의무 검증.
#   F-T05 — schema 정식 필드명(test_run_evidence/test_pass_evidence) + legacy(test_invocation_evidence) 모두 인식.

set -euo pipefail

TARGET_DIR="${1:-.}"
CHAIN_MODE="${LINT_CHAIN_MODE:-auto}"  # auto | strict | off
EXIT=0

if [ ! -d "$TARGET_DIR" ]; then
  echo "[lint-no-simulation] usage: $0 <dir-with-cross-validation-metadata> [--chain-strict|--chain-off]" >&2
  echo "                     env: LINT_CHAIN_MODE=auto|strict|off (default: auto)" >&2
  exit 2
fi

# parse optional flag
for arg in "$@"; do
  case "$arg" in
    --chain-strict) CHAIN_MODE=strict ;;
    --chain-off)    CHAIN_MODE=off ;;
  esac
done

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

# 4. chain 4/5 enforcement — test-spec.json(test_run_evidence per-TC) / impl-spec.json(test_pass_evidence root)
#    5종 물증 10 필드 (test_runner_version / test_runner_stdout_path / invocation_timestamp /
#    duration_ms / pass_count / fail_count / skip_count / reproduction_command / result_hash / report_format)
#    F-T05 — schema 정식 필드명 + legacy(test_invocation_evidence) 모두 인식 (naive 단일 grep → schema-valid 산출물 미탐 차단).
if [ "$CHAIN_MODE" != "off" ]; then
  CHAIN_REQUIRED=(test_runner_version test_runner_stdout_path invocation_timestamp duration_ms pass_count fail_count skip_count reproduction_command result_hash report_format)
  while IFS= read -r f; do
    # evidence 블록(test_run_evidence / test_pass_evidence / legacy test_invocation_evidence)이 있으면 10 필드 모두 grep
    if grep -Eq '"test_run_evidence"|"test_pass_evidence"|"test_invocation_evidence"' "$f" 2>/dev/null; then
      for k in "${CHAIN_REQUIRED[@]}"; do
        if ! grep -q "\"$k\"" "$f" 2>/dev/null; then
          echo "[lint-no-simulation] ❌ FAIL — chain 4/5 ($f) evidence missing field: $k" >&2
          EXIT=1
        fi
      done
    elif [ "$CHAIN_MODE" = "strict" ]; then
      # strict 모드: test-spec/impl-spec 가 evidence 자체 없으면 fail
      echo "[lint-no-simulation] ❌ FAIL — chain 4/5 ($f) has no evidence (test_run_evidence/test_pass_evidence/test_invocation_evidence) (strict mode)" >&2
      EXIT=1
    fi
  done < <(find "$TARGET_DIR" \( -name 'test-spec.json' -o -name 'impl-spec.json' \) 2>/dev/null || true)

  # impl-spec.json source_files 가 있으면 같은 file 안에 commit_hash 도 의무
  while IFS= read -r f; do
    if grep -q '"source_files"' "$f" 2>/dev/null && ! grep -q '"commit_hash"' "$f" 2>/dev/null; then
      echo "[lint-no-simulation] ❌ FAIL — chain 5 ($f) impl_modules source_files present but commit_hash missing" >&2
      EXIT=1
    fi
  done < <(find "$TARGET_DIR" -name 'impl-spec.json' 2>/dev/null || true)
fi

if [ $EXIT -eq 0 ]; then
  echo "[lint-no-simulation] ✅ OK — no policy violation found in $TARGET_DIR (chain mode: $CHAIN_MODE)"
fi
exit $EXIT
