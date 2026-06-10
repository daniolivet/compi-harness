# PLAN — `compi-harness` CLI (Phase 1)

A CLI that installs and configures the `compi-harness` in a target repository,
adapting it to the AI coding tool(s) you'll use.

## Locked decisions

- **Stack:** Node + TypeScript, `commander` (commands) + `@clack/prompts`
  (interactive interview), build with `tsup`.
- **Interview:** deterministic. (The `--with-agent` mode that delegates to the
  AI is left for a later phase.)
- **One AI per repo** (single selection) via an adapter pattern (Claude Code,
  Codex, OpenCode, Aider, Cursor, Copilot).
- **Idempotent** (does not overwrite an already-installed harness) + basic
  stack detection.
- The harness templates are **bundled inside the CLI** (offline, versioned with
  the binary), copied from the harness files at the repo root (`CLAUDE.md`,
  `AGENTS.md`, `agents/`, `harness/`).

## Phase 1 goal

> Run `compi-harness init` inside a target repo → it asks which AI(s) you'll
> use, copies the base harness, generates the correct entry files per AI, fills
> in the project name, and finishes with `./harness/init.sh` green. Idempotent
> (does not destroy an already-installed harness).

**Out of Phase 1:** the full 8-block interview, smart stack-based
`scripts/check.sh` generation, `--with-agent` mode, `update`/`check` commands
with real logic, merge/diff on existing files.

## Target package structure

```
compi-harness/                 # npm package (workspace root)
├── bin/cli.ts                 # entrypoint: init | update | check
├── src/
│   ├── core/
│   │   ├── templates.ts       # resolves the bundled templates dir
│   │   ├── scaffolder.ts      # copies templates, idempotent
│   │   └── writers.ts         # answers -> files
│   └── agents/
│       ├── types.ts           # AgentAdapter interface
│       ├── registry.ts        # adapter map
│       ├── claude-code.ts     # CLAUDE.md + .claude/agents/
│       ├── codex.ts           # AGENTS.md
│       ├── opencode.ts        # AGENTS.md
│       ├── aider.ts           # AGENTS.md + CONVENTIONS.md
│       ├── cursor.ts          # .cursorrules (bridge)
│       └── copilot.ts         # .github/copilot-instructions.md (bridge)
├── templates/                 # harness bundled as assets
└── package.json               # bin, files: ["dist","templates"]
```

## Milestones

- [x] **M1 — Package skeleton.** `package.json` with `bin`, TS, commander,
  clack, build with tsup. `bin/cli.ts` with `init` and `update`/`check` stubs.
  Verifiable: `compi-harness --help` lists the commands.
- [x] **M2 — Bundle templates.** Copy the harness from the repo root into
  `templates/`, including the adapter bridge files. `files: ["dist","templates"]`.
- [x] **M3 — Scaffolding core.** Idempotent `scaffolder` (detects existing
  harness) + `writers` (replaces `<nombre-del-proyecto>`).
- [x] **M4 — Adapter registry.** `types`, `registry` and the 6 adapters.
- [x] **M5 — Wire `init`.** idempotency guard → AI single-select → minimal
  questions (name) → base scaffolding → adapters → run `./harness/init.sh` →
  summary.
- [x] **M6 — E2E verification.** Run `init` in a temp dir; check files per AI
  combination and `./harness/init.sh` green. CLI README.

## Acceptance criteria (Phase 1)

1. `compi-harness init` in an empty repo generates the base harness + entry
   files for the chosen AIs.
2. Selecting Claude Code produces `CLAUDE.md`, `AGENTS.md` and `.claude/agents/`
   (and no redundant root `agents/`).
3. Re-running `init` on an already-installed harness does not destroy it
   (aborts or requires `--force`).
4. The project name appears substituted in the JSON queues.
5. `./harness/init.sh` finishes green after `init`.
6. `update`/`check` exist as stubs without breaking.

## Notes

- Minor deviation: the "description" minimal question was dropped from Phase 1
  because writers only uses the project name; it belongs to the Phase 2
  interview.
- The `<project-name>` literal in `writers.ts` must match the placeholder
  string inside the harness JSON templates. The whole harness was translated
  to English, so the placeholder is `<project-name>` (was `<nombre-del-proyecto>`).
