#!/bin/bash
# PreToolUse(Bash) git commit 직전 백엔드 품질 게이트 — WARNING 전용(commit 차단 안 함).
# 실패 시 systemMessage 로 경고만 출력하고 exit 0. 대상: tlm/eam/gea/observer 레포.

INPUT=$(cat)
CWD=$(echo "$INPUT" | jq -r '.cwd // empty' 2>/dev/null)
[ -z "$CWD" ] && CWD="$PWD"

ROOT=$(git -C "$CWD" rev-parse --show-toplevel 2>/dev/null)
[ -z "$ROOT" ] && exit 0

NAME=$(basename "$ROOT")
case "$NAME" in
  ep-be-tlm|ep-be-eam|gea|sgh-mis-observer) ;;
  *) exit 0 ;;
esac

cd "$ROOT" || exit 0
[ -x "./gradlew" ] || exit 0

TASKS=""
KOTLIN=0
if [ -f "build.gradle.kts" ]; then
  KOTLIN=1
  TASKS="ktlintCheck compileKotlin ArchitectureTest"   # Kotlin (observer): ArchUnit 규칙(*Config 패키지)까지 검사
elif [ -f "build.gradle" ]; then
  if [ "$NAME" = "ep-be-eam" ]; then
    TASKS="compileJava"                         # eam: spotless(google-java-format/JDK) 기존 이슈로 skip
  else
    TASKS="spotlessCheck compileJava"
  fi
else
  exit 0
fi

if [ "$KOTLIN" -eq 1 ]; then
  OUT=$(./gradlew ktlintCheck compileKotlin test --tests "*ArchitectureTest" -q 2>&1)
else
  OUT=$(./gradlew $TASKS -q 2>&1)
fi
if [ $? -ne 0 ]; then
  FAIL=$(echo "$OUT" | grep -iE "FAILED|error:|spotless|ktlint" | head -8)
  MSG=$(printf '[backend-quality-gate] %s 커밋 전 품질 검사 실패 (경고만, 커밋은 진행됨)\\n검사: %s\\n%s' "$NAME" "$TASKS" "$FAIL")
  jq -n --arg m "$MSG" '{systemMessage: $m}'
fi
exit 0
