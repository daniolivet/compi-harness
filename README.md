# compi-harness (CLI)

A CLI that installs and configures the **compi-harness** in any repository,
adapting it to the AI coding tool(s) you'll use (Claude Code, Codex, OpenCode,
Aider, Cursor, Copilot).

> The harness is documentation-shaped-as-a-directory + verification scripts +
> subagent templates that structure the *research → implement → review* cycle.
> The harness content lives in `templates/` and is bundled inside the CLI.

## Installation

```bash
npm install -g compi-harness
# or without installing:
npx compi-harness init
```

## Usage

Inside the repo where you want the harness:

```bash
compi-harness init
```

It will ask which AI tool you'll use and the project name, copy the base
harness, generate that AI's entry files, and verify the environment with
`./harness/init.sh`. One AI per repo.

### Non-interactive mode

```bash
compi-harness init --name my-project --agent claude-code
```

`init` options:

| Flag | Description |
|------|-------------|
| `--name <name>` | Project name (replaces the placeholder in the work queues). |
| `--agent <id>` | AI tool (one per repo): `claude-code` \| `codex` \| `opencode` \| `aider` \| `cursor` \| `copilot`. |
| `--force` | Reinstall even if a harness already exists. |

### What each AI generates

| AI | Files added on top of the base |
|----|--------------------------------|
| Claude Code | `.claude/agents/` (native subagents) |
| Codex CLI | root `agents/` (reads `AGENTS.md` + `agents/`) |
| OpenCode | root `agents/` (reads `AGENTS.md` + `agents/`) |
| Aider | `CONVENTIONS.md` + root `agents/` |
| Cursor | `.cursorrules` (bridge) + root `agents/` |
| GitHub Copilot | `.github/copilot-instructions.md` (bridge) + root `agents/` |

The common base (`CLAUDE.md`, `AGENTS.md`, `harness/`) is always installed,
regardless of the AI. The subagent role definitions go to `.claude/agents/`
for Claude Code, or to a single root `agents/` for any other AI (which read
them from there) — so a Claude-only install gets no redundant root `agents/`.
`scripts/check.sh` is **not** auto-created; you add it when adopting the
harness (`harness/init.sh` only warns if it is missing).

## Development

```bash
npm install
npm run build          # compile to dist/ with tsup
node dist/cli.js --help
```

The harness templates live in `templates/` (a mirror of the final layout in the
target repo). To resync them with the harness source repo, re-copy its content
into `templates/base` and `templates/adapters`.

## Status

Phase 1 (MVP): interactive and non-interactive `init`, one AI per repo, idempotent.
Pending (later phases): the full 8-block interview, stack-based
`scripts/check.sh` generation, `--with-agent` mode, and the `update` / `check`
commands (currently stubs). See `PLAN.md`.
