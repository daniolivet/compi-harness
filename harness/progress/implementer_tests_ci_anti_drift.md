# Implementation: tests_ci_anti_drift

**Task:** 1 — Tests + CI + anti-drift templates
**Type:** feature
**Generated:** 2026-07-18T13:15:15+00:00

## Files modified
- `LICENSE` — created, MIT, `Copyright (c) 2026 compi-harness contributors`
- `package.json` — added scripts lint/typecheck/test/pretest/prepublishOnly + devDeps vitest/eslint/@eslint/js/typescript-eslint
- `package-lock.json` — regenerated via `npm install`
- `tsconfig.json` — added `tests` to `include`
- `bin/cli.ts` — read `pkg.version` from `package.json` at runtime via `readFileSync` + `fileURLToPath(import.meta.url)` (replaced hardcoded `'0.1.0'`)
- `eslint.config.js` — created, ESLint 9 flat config (@eslint/js + typescript-eslint recommended, ignores dist/node_modules/templates)
- `scripts/check.sh` — created, `set -euo pipefail`, lint+typecheck+test+build, chmod +x
- `.github/workflows/ci.yml` — created, push+pull_request, ubuntu-latest, Node 18, separate steps
- `tests/unit/registry.test.ts` — 3 tests (length+order, isValidAdapterId, getAdapters)
- `tests/unit/scaffolder.test.ts` — 4 tests (isHarnessInstalled: empty/one-marker/both/re-check)
- `tests/unit/writers.test.ts` — 4 tests (applyProjectName: replace/idempotent/missing/content-gated)
- `tests/e2e/init.test.ts` — 6 tests (it.each(adapters), spawn dist/cli.js, base+adapter file asserts, bash harness/init.sh green in tmpdir)
- `tests/anti-drift/drift.test.ts` — 1 test (compareDirs harness↔templates/base/harness with 3 excludes, agents↔templates/agents no excludes)

## Tests added
- `registry.test.ts` — validates adapter registry invariants
- `scaffolder.test.ts` — validates isHarnessInstalled idempotency
- `writers.test.ts` — validates applyProjectName placeholder replacement + idempotency
- `init.test.ts` — validates full `compi-harness init` per adapter (6) + harness/init.sh green
- `drift.test.ts` — validates templates/ mirror invariant

## Verification
- `./harness/init.sh`: green (run by the reviewer in round 2; the implementer does not run tests on its own).
- Iterations after review: 1 (round 1 CHANGES_REQUESTED for `import { os } from 'node:os'` named-import bug in 3 test files → fixed to default import `import os from 'node:os'`; round 2 APPROVED).
