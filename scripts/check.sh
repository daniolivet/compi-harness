#!/usr/bin/env bash
# scripts/check.sh — meta-repo verification gate.
# Called by ./harness/init.sh (step 3). Runs lint + typecheck + test + build.
set -euo pipefail

RED='\033[0;31m'; GREEN='\033[0;32m'; NC='\033[0m'
ok()   { printf "${GREEN}[OK]${NC}    %s\n" "$1"; }
fail() { printf "${RED}[FAIL]${NC}  %s\n" "$1"; }

npm run lint
ok "lint"
npm run typecheck
ok "typecheck"
npm test
ok "test"
npm run build
ok "build"
ok "scripts/check.sh passed"
