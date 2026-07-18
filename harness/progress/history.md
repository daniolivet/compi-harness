# Historical log (append-only)

> Every time a session closes, its summary is appended here.
> Do not edit previous entries. You only append at the end.

---

## YYYY-MM-DD — Project start (example, delete it when adopting)
- **Agent:** implementer
- **Changes:** initial harness structure (AGENTS.md, feature_list.json, hotfix_list.json, docs/).
- **Result:** environment ready.

## 2026-07-18 — Task 1 closed: Tests + CI + anti-drift templates
- **Agent:** implementer (close)
- **Type:** feature
- **Changes:** F1 implemented — Vitest test suite (5 files, 18 tests: unit + E2E per adapter + anti-drift), ESLint 9 flat config, `tsc --noEmit` typecheck, `scripts/check.sh` gate (lint+typecheck+test+build), GitHub Actions CI on Node 18, MIT LICENSE (`compi-harness contributors`), `bin/cli.ts` reads version from `package.json` at runtime, `prepublishOnly: npm run build`.
- **Iterations:** 1 round of CHANGES_REQUESTED (`os` named-import bug in 3 test files → default import) → round 2 APPROVED.
- **Result:** `./harness/init.sh` green (18/18 tests, lint ✓, typecheck ✓, build ✓). Task 1 marked `done` in `harness/feature_list.json`.
