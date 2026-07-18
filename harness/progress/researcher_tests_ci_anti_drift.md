# Research: tests_ci_anti_drift

**Task:** 1 — Tests + CI + anti-drift templates
**Type:** feature
**Generated:** 2026-07-18T13:15:15+00:00

## Objective
Make `npm test` exist and pass with unit + E2E + anti-drift coverage of the CLI, add a GitHub Actions workflow that runs build + test on push/PR, read the CLI version from `package.json` at runtime, add an MIT `LICENSE`, wire `prepublishOnly` to the build, and provide `./scripts/check.sh` as the meta-repo's own gate (lint + typecheck + test + build) consumed by `./harness/init.sh`.

## Chosen approach
Vitest over `node:test` (zero-config esbuild TS transpile, first-class E2E subprocess support, modern Node+TS standard). Unit tests only target functions that do not hit the `templates.ts` path trap (`isHarnessInstalled`, `applyProjectName`, `registry`); everything that depends on the templates layout is covered by E2E tests that spawn the built `dist/cli.js` in a tmpdir. Anti-drift test compares `harness/` ↔ `templates/base/harness/` recursively with 3 excludes (`progress/`, `feature_list.json`, `hotfix_list.json`) and `agents/` ↔ `templates/agents/` with no excludes. ESLint 9 flat config with `@eslint/js` + `typescript-eslint` recommended (no custom rules). Typecheck via `tsc --noEmit` reusing the existing `tsconfig.json` (add `tests` to `include`; no `tsconfig.build.json`). CLI version read from `package.json` at runtime via `readFileSync` + `fileURLToPath(import.meta.url)` (Node 18 compatible, unlike import attributes). `scripts/check.sh` is a 4-step `set -euo pipefail` pipeline (lint+typecheck+test+build). CI on Node 18 with lint/typecheck/test/build as separate steps.

## Principles applied
- SOLID: SRP — each new test file targets one module (`registry.test.ts` → `registry.ts`, etc.); `scripts/check.sh` only orchestrates. DIP — `bin/cli.ts` depends on the `package.json` data source via runtime read, not a hardcoded literal.
- KISS / DRY / YAGNI: Vitest zero-config, ESLint recommended-only, no `tsconfig.build.json`, no custom ESLint rules, no Vitest config file. DRY — E2E loops over the `adapters` array from `src/agents/registry.ts` instead of re-listing ids; anti-drift reuses one recursive comparator for both `harness/` and `agents/`. YAGNI — no coverage thresholds, no `--watch` script, no custom rules.

## Files analyzed
- `src/commands/init.ts`, `src/core/{scaffolder,templates,writers}.ts`, `src/agents/{types,registry}.ts`, `bin/cli.ts`, `package.json`, `tsconfig.json`, `tsup.config.ts`, `templates/**`, `harness/init.sh`
