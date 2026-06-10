#!/usr/bin/env bash
# init.sh — Environment verification and initialization
#
# WHEN it runs (verification policy):
#   1. At the START of the process — the `leader` runs it when starting the
#      session to confirm the environment is green before touching anything.
#   2. At the END — the `reviewer` runs it as the single verification gate
#      (includes the project's tests via ./scripts/check.sh).
# The `implementer` does NOT run it — neither this script nor the tests on its
# own: it writes code + tests and leaves verification to the reviewer. It also
# does not re-run it when closing the task: it trusts the reviewer's green.
#
# This script lives in `harness/` but runs from the project root
# (e.g. `./harness/init.sh`). Internally it does a `cd` to the root, so
# it works no matter where it is invoked from.
#
# This script is **stack-agnostic**: it only validates the harness's base files.
# Project-specific checks (toolchain, lint, typecheck, tests)
# are delegated to `./scripts/check.sh` if it exists. Create that file when adopting
# the harness and put there whatever your stack needs (node, python, go, rust...).
#
# Expected output: clear exit codes and blocks marked with [OK]/[FAIL].

set -u

# Position ourselves at the project root (the parent of harness/), so that
# the relative paths below are stable regardless of the agent's cwd.
cd "$(dirname "$0")/.." || { echo "[FAIL]  could not cd to the project root"; exit 1; }

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m'

ok()    { printf "${GREEN}[OK]${NC}    %s\n" "$1"; }
warn()  { printf "${YELLOW}[WARN]${NC}  %s\n" "$1"; }
fail()  { printf "${RED}[FAIL]${NC}  %s\n" "$1"; }

EXIT_CODE=0

echo "── 1. Verifying harness base files ─────────────────────"

for f in AGENTS.md CLAUDE.md harness/feature_list.json harness/hotfix_list.json harness/progress/current.md harness/docs/architecture.md harness/docs/conventions.md harness/docs/verification.md harness/CHECKPOINTS.md; do
  if [ ! -f "$f" ]; then
    fail "Missing base file: $f"
    EXIT_CODE=1
  else
    ok "$f exists"
  fi
done

echo ""
echo "── 2. Validating feature_list.json and hotfix_list.json ─"

# JSON validation with python3 (preinstalled on macOS/Linux). If python3 is
# not available, validation is skipped with a WARN.
if command -v python3 >/dev/null 2>&1; then
  for list in harness/feature_list.json harness/hotfix_list.json; do
    [ -f "$list" ] || continue
    python3 - "$list" <<'PY'
import json, sys
path = sys.argv[1]
try:
    data = json.load(open(path))
    valid = {"pending", "in_progress", "done", "blocked"}
    key = "features" if "features" in data else "hotfixes"
    items = data.get(key, [])
    in_progress = [i for i in items if i.get("status") == "in_progress"]
    if len(in_progress) > 1:
        print(f"[FAIL]  {path}: {len(in_progress)} tasks in in_progress (maximum 1)")
        sys.exit(1)
    for it in items:
        st = it.get("status")
        if st not in valid:
            print(f"[FAIL]  {path}: invalid status in {it.get('id')}: {st}")
            sys.exit(1)
    print(f"[OK]    {path} valid ({len(items)} tasks)")
except Exception as e:
    print(f"[FAIL]  {path} invalid: {e}")
    sys.exit(1)
PY
    if [ $? -ne 0 ]; then EXIT_CODE=1; fi
  done
else
  warn "python3 not available — JSON validation skipped"
fi

echo ""
echo "── 3. Project verification hook ────────────────────────"

if [ -f "./scripts/check.sh" ]; then
  if bash ./scripts/check.sh; then
    ok "./scripts/check.sh passed"
  else
    fail "./scripts/check.sh failed"
    EXIT_CODE=1
  fi
else
  warn "./scripts/check.sh does not exist — define the project checks there (lint/typecheck/test)"
fi

echo ""
echo "── 4. Summary ──────────────────────────────────────────"

if [ $EXIT_CODE -eq 0 ]; then
  ok "Environment ready. You can start working."
else
  fail "Environment is NOT ready. Fix the errors before proceeding."
fi

exit $EXIT_CODE
