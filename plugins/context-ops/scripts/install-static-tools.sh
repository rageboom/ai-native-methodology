#!/usr/bin/env bash
# install-static-tools.sh — idempotent installer for Tier 1 static-analysis tools.
#
# Invoked by SessionStart hook (see hooks/hooks.json).
# Always exits 0 — never blocks Claude Code session start.
# Writes status to stderr so Claude surfaces it; stdout stays clean.
#
# Scope (matches static-runner/README.md tier policy):
#   Tier 1 (auto-install attempted): Semgrep
#   Tier 2 (informational only):     PMD / SpotBugs / CodeQL / Bandit / Snyk / OSV-Scanner
#   Tier 2 require JVM/JDK or per-language envs that a plugin cannot bootstrap;
#   users keep ownership per DEC-2026-05-18-runtime-tool-exclusion.

set -u

PLUGIN_ROOT="${CLAUDE_PLUGIN_ROOT:-$(cd "$(dirname "$0")/.." && pwd)}"
MARKER_DIR="${PLUGIN_ROOT}/.static-tools"
SEMGREP_MARKER="${MARKER_DIR}/.semgrep-installed"
LOG_PREFIX="[ai-native-methodology/install]"

log() { printf '%s %s\n' "$LOG_PREFIX" "$*" >&2; }

ensure_semgrep() {
  if command -v semgrep >/dev/null 2>&1; then
    if [ ! -f "$SEMGREP_MARKER" ]; then
      mkdir -p "$MARKER_DIR" && touch "$SEMGREP_MARKER"
    fi
    return 0
  fi

  log "semgrep not found — attempting auto-install (Tier 1)…"

  if command -v pipx >/dev/null 2>&1; then
    if pipx install semgrep >&2; then
      log "semgrep installed via pipx."
      mkdir -p "$MARKER_DIR" && touch "$SEMGREP_MARKER"
      return 0
    fi
    log "pipx install semgrep failed — trying next channel."
  fi

  if command -v brew >/dev/null 2>&1; then
    if brew install semgrep >&2; then
      log "semgrep installed via brew."
      mkdir -p "$MARKER_DIR" && touch "$SEMGREP_MARKER"
      return 0
    fi
    log "brew install semgrep failed — trying next channel."
  fi

  if command -v pip3 >/dev/null 2>&1; then
    if pip3 install --user semgrep >&2; then
      log "semgrep installed via pip3 --user."
      log "Add ~/.local/bin to PATH if 'semgrep' is not found in new shells."
      mkdir -p "$MARKER_DIR" && touch "$SEMGREP_MARKER"
      return 0
    fi
    log "pip3 install --user semgrep failed."
  fi

  log "ERROR: could not auto-install semgrep. Install manually:"
  log "  pipx install semgrep   # recommended (PEP 668 safe)"
  log "  brew install semgrep   # macOS Homebrew"
  log "  pip3 install --user semgrep"
  return 1
}

report_tier2() {
  # Informational only — never install. Java / per-language envs are user-owned.
  local available=()
  for tool in pmd spotbugs codeql bandit snyk osv-scanner; do
    if command -v "$tool" >/dev/null 2>&1; then
      available+=("$tool")
    fi
  done
  if [ "${#available[@]}" -gt 0 ]; then
    log "Tier 2 tools detected on PATH: ${available[*]} (will be used when available)."
  fi
}

main() {
  ensure_semgrep || true
  report_tier2
  exit 0
}

main "$@"
