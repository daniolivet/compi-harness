# compi-harness

A **work harness for AI agents** that structures the
*research → implement → review* cycle in a repository. Stack-agnostic
(it assumes no particular language or framework) and **agent-agnostic**:
it works with Claude Code, OpenAI Codex CLI, OpenCode, Cursor, Aider and, in
general, any assistant that can read an instructions file
from the repository.

The idea is simple: when an agent enters the repo, it already knows where to look,
which rules apply, and how to close out the work without leaving the tree dirty. The
harness is **documentation shaped like a directory** + **verification
scripts** + **subagent templates**.

---

## Why?

Working with an agent without structure usually ends in:

- Inconsistent changes (each session invents its own style).
- Tasks marked as "done" without green tests.
- Context lost between sessions — the next one starts from scratch.
- Mocks that hide the fact the change breaks production.
- Review without criteria: "this looks good" instead of "it meets the checkpoints".

The harness attacks each of those causes with a written rule and a
concrete expectation:

- `AGENTS.md` is the map: every agent reads it first.
- `harness/docs/architecture.md` defines what "good code" is in this project.
- `harness/docs/conventions.md` defines how it is written.
- `harness/docs/verification.md` defines how you prove it works.
- `harness/CHECKPOINTS.md` defines when a change is approved.
- `harness/feature_list.json` / `harness/hotfix_list.json` are the work
  queue, with a single lifecycle (`pending → in_progress → done`).
- `harness/progress/current.md` keeps the live session;
  `harness/progress/history.md` is the append-only log.
- `agents/` are the subagent definitions (leader,
  researcher, implementer, reviewer) with their protocols.
- `harness/init.sh` is the gatekeeper: it validates the harness state and delegates the
  stack-specific checks to `./scripts/check.sh`.

> **Repo organization.** To avoid flooding the project root, almost all
> of the harness lives under `harness/`. Only `CLAUDE.md` and
> `AGENTS.md` stay in the root (the *entry files* that agents read
> automatically; they wouldn't work nested) and the `agents/` folder (to copy it to
> `.claude/agents/`). `src/` and `tests/` belong to the project, not the harness.

---

## Structure

```
.
├── CLAUDE.md                     # Entry for Claude Code. Assigns the leader role.
├── AGENTS.md                     # Repository map. Entry for Codex / OpenCode / Aider / etc.
├── agents/
│   ├── leader.md                 # Orchestrator. Does not write code.
│   ├── researcher.md             # Produces the plan.
│   ├── implementer.md            # Executes the plan + writes tests.
│   └── reviewer.md               # Approves or rejects.
└── harness/
    ├── README.md                 # This file.
    ├── CHECKPOINTS.md            # List of objective approval criteria.
    ├── init.sh                   # Environment verification. Run `./harness/init.sh` from the root.
    ├── feature_list.json         # Feature queue (pending / in_progress / done / blocked).
    ├── hotfix_list.json          # Hotfix queue.
    ├── docs/
    │   ├── architecture.md       # Architectural decisions. Quality standard.
    │   ├── conventions.md        # Code style, naming, structure.
    │   └── verification.md       # Test and mocking policy.
    └── progress/
        ├── current.md            # State of the current session. Emptied on close.
        └── history.md            # Append-only log.
```

When the harness is live, temporary and persistent files also appear in
`harness/progress/`:

```
harness/progress/
├── feat_<id>/                # Temporary folder for a feature in progress.
│   ├── plan_<id>.md          # Researcher's plan. Deleted on close.
│   └── review_<id>.md        # Reviewer's verdict. Deleted on close.
├── hotfix_<id>/              # Same, for hotfixes.
├── researcher_<slug>.md      # Historical summary per closed task.
├── implementer_<slug>.md     # Historical summary per closed task.
└── reviewer_<slug>.md        # Historical summary per closed task.
```

---

## Task lifecycle

```
   harness/feature_list.json (status: pending)
            │
            ▼
   ┌─────────────────────────────────────────────┐
   │ 1. leader runs ./harness/init.sh (start)     │
   │ 2. leader asks: feature or hotfix?           │
   │ 3. leader picks pending task with lowest id  │
   │ 4. leader launches researcher                │
   └─────────────────────────────────────────────┘
            │
            ▼
   researcher
   ─ marks task in_progress
   ─ explores code, evaluates approaches (SOLID/KISS/DRY)
   ─ writes harness/progress/feat_<id>/plan_<id>.md
            │
            ▼
   ⏸ USER VALIDATION
   ─ the leader presents the plan to the user
   ─ no progress without their explicit OK
   ─ if they request changes → back to the researcher
            │
            ▼
   implementer
   ─ reads the plan (already validated)
   ─ implements + writes tests
   ─ does NOT run tests or init.sh (verification is done by the reviewer)
            │
            ▼
   reviewer
   ─ walks through harness/CHECKPOINTS.md
   ─ runs ./harness/init.sh (the "at the end" verification, single gate)
   ─ verdict → harness/progress/feat_<id>/review_<id>.md
            │
       ┌────┴─────┐
       ▼          ▼
 CHANGES_REQ   APPROVED
       │          │
       │          ▼
       │   implementer closes (WITHOUT re-running init.sh):
       │   ─ status: "done" in harness/feature_list.json
       │   ─ writes researcher_<slug>.md,
       │     implementer_<slug>.md, reviewer_<slug>.md
       │   ─ moves current.md → history.md
       │   ─ rm -rf harness/progress/feat_<id>/
       │
       └─→ back to implementer
```

Hard rules of the lifecycle:

- **Only one `in_progress` task at a time.** `harness/init.sh` fails if there are more.
- **The researcher's plan is not executed without explicit user validation.**
- **A task is not marked `done` without `APPROVED` from the reviewer** (which implies
  `./harness/init.sh` green).
- **`./harness/init.sh` is run only by the leader (at the start) and the reviewer
  (verification, includes the tests).** The implementer does not run tests or
  `init.sh`, and does not repeat it on close: it trusts the `APPROVED`.
- **`harness/progress/current.md` is updated live**, not at the end.
- **Temporary artifacts (`feat_<id>/`, `hotfix_<id>/`) are deleted when
  the task closes.** The historical summaries (`<role>_<slug>.md`) stay.

---

## How to adopt it in a new project

1. **Copy the harness contents to the project root.** Keep the
   layout: `CLAUDE.md`, `AGENTS.md` and `agents/` stay in the root, and everything
   else under `harness/`:

   ```bash
   # From the target project:
   cp -r /path/to/compi-harness/. ./
   ```

   Do not copy the harness's `.git/` if it has one; its files go in as
   normal project files.

2. **Fill the templates with the reality of your stack:**

   - `harness/docs/architecture.md` — what "good code" means here.
   - `harness/docs/conventions.md` — style, naming, errors, logging.
   - `harness/docs/verification.md` — test and mocking policy.
   - `harness/CHECKPOINTS.md` — add the project-specific checkpoints.
   - `harness/feature_list.json` / `harness/hotfix_list.json` — put the project
     name and the first pending task.
   - `harness/progress/history.md` — delete the example entry.

3. **Create `scripts/check.sh`** (in the project root) with the real
   stack checks (lint, typecheck, test, build). `harness/init.sh`
   invokes it automatically if it exists. Examples:

   ```bash
   # scripts/check.sh — Node
   set -e
   npm run lint
   npm run typecheck
   npm test
   npm run build
   ```

   ```bash
   # scripts/check.sh — Python
   set -e
   ruff check .
   mypy src
   pytest
   ```

   ```bash
   # scripts/check.sh — Go
   set -e
   go vet ./...
   go test ./...
   go build ./...
   ```

4. **Run `./harness/init.sh`** and fix everything that comes back red before
   you start adding tasks.

5. **If you use Claude Code and want native subagent discovery**,
   copy the templates to `.claude/agents/`:

   ```bash
   mkdir -p .claude/agents && cp agents/*.md .claude/agents/
   ```

   For Codex CLI, OpenCode, Aider and others it's not needed — they read `agents/`
   as plain Markdown when the `leader` references them.

6. **Start your agent** in the directory and give it the first prompt. The
   agent will read its entry file (`CLAUDE.md` or `AGENTS.md`), assume the role
   of `leader`, ask you whether it's a feature or hotfix, and start the
   flow. A good first prompt:

   > "I have a new feature: <short description>. Add it to
   > `harness/feature_list.json` and let's begin."

---

## Agent-guided setup

If you don't want to fill the templates (`harness/docs/*.md`,
`harness/CHECKPOINTS.md`, `scripts/check.sh`, the lists) by hand, copy this
prompt and paste it to the agent right after copying the harness into the project. The
agent will ask you block by block and leave everything configured, finishing
with a green `./harness/init.sh`.

```text
You are the setup wizard for this harness (compi-harness). This is a one-time
CONFIGURATION session, not a work session: do NOT act as leader, do NOT
ask "feature or hotfix?", do NOT touch `src/` or `tests/`.

Your task: fill the harness templates by asking me questions block by
block. Rules:

- ONE block at a time. Ask, wait for the answer, write the
  file(s) for that block, and only then move on to the next.
- If I answer "I don't know" or "not applicable", leave it as "N/A" or delete the
  section, but do NOT make things up.
- If an answer is ambiguous, ask again before writing.
- Files allowed to touch: `harness/feature_list.json`,
  `harness/hotfix_list.json`, `harness/docs/architecture.md`,
  `harness/docs/conventions.md`, `harness/docs/verification.md`,
  `harness/CHECKPOINTS.md`, `scripts/check.sh`, and optionally
  `.claude/agents/*.md`. Any other file is out of scope.
- Don't rewrite a whole file if only one section changes: edit
  that section.

---

**Block 1 — Identity**
- Project name (short slug, no spaces).
- Description in 1-2 sentences: what it does, for whom, what problem it solves.

→ Write the `project` field in `harness/feature_list.json` and
  `harness/hotfix_list.json`. Fill the "Context" section of
  `harness/docs/architecture.md`.

**Block 2 — Stack and toolchain**
- Language + version (e.g. TypeScript 5.x, Python 3.12, Go 1.22).
- Runtime/target (Node 20 LTS, CPython 3.12, JVM 21…).
- Relevant frameworks and libraries (HTTP, DB, ORM, validation…).
- Exact commands for: lint, typecheck (if applicable), tests, build.

→ Create `scripts/check.sh` with `set -e` and the commands in order
  (lint → typecheck → test → build). Make it executable (`chmod +x`).
  Fill "Language style" in `harness/docs/conventions.md`.

**Block 3 — Conventions**
- Naming (files, types/classes, functions, constants, private, enums).
- Suffixes by role, if applicable (e.g. `*.service.ts`, `*.controller.ts`).
- Typical structure of a module/domain (folders + example).
- Validation of external inputs (library + where).
- Dependency injection.
- Error handling (exceptions / Result / exit codes; where they are defined).
- Official logger and what is forbidden (`console.log`, `print`, …).
- Asynchrony: patterns that are OK / patterns that are not.

→ Fill `harness/docs/conventions.md`. Delete the sections that don't apply.

**Block 4 — Architecture**
- 3-5 non-negotiable principles (what + why).
- Typical data flow (describe it in prose; you convert it to ASCII).
- 3-5 concrete anti-patterns ("don't do X because Y").

→ Fill `harness/docs/architecture.md`.

**Block 5 — Verification**
- Test framework.
- Mocking policy: what is always mocked, what is never mocked, and why.
- Command for unit tests.
- Is there E2E / integration? If so: command + which real dependencies are used.
- Is there a manual smoke test? If so, how dev is started.

→ Fill `harness/docs/verification.md`.

**Block 6 — Specific checkpoints**
List me 3-7 objective checkpoints beyond the generic C1-C7. Each
one verifiable without opining (bad: "clean code"; good: "no
controller returns Prisma entities directly").

→ Add them as C8, C9, … in `harness/CHECKPOINTS.md` and delete the
  placeholder examples.

**Block 7 — First task (optional)**
Should I add a first entry in `harness/feature_list.json` or
`harness/hotfix_list.json`?
If so: type, id, title, 1-2 sentence description, and acceptance
criteria in bullets. If not, skip it.

**Block 8 — Claude Code subagents (optional)**
Are you going to work with Claude Code and want `.claude/agents/` populated for
native discovery? (Yes/No)

→ If yes: `mkdir -p .claude/agents && cp agents/*.md .claude/agents/`.

---

**Closing**
1. Run `./harness/init.sh`.
2. If it's green, tell me the harness is ready and what the first
   recommended step is (launch the leader with the first task, or ask me
   for one if we skipped block 7).
3. If it's red, list me each `[FAIL]`, explain what's missing, and
   ask me before touching anything. Do NOT improvise fixes.

Start now with Block 1.
```

When it finishes, the only thing left to do is launch the agent with
a real task (step 6 of the previous section).

---

## Compatibility with AI agents

The harness does not depend on any particular agent. What changes between one and
another is **which file it reads first** when entering the repo. That's why we ship
two entry files with equivalent instructions:

- `CLAUDE.md` — entry for Claude Code.
- `AGENTS.md` — standard entry (Codex CLI, OpenCode, Aider and others read it
  automatically; it's the [agents.md](https://agents.md) convention).

Compatibility table:

| Agent                 | Entry file it reads                   | Works out-of-the-box    |
|-----------------------|---------------------------------------|-------------------------|
| Claude Code           | `CLAUDE.md`                           | Yes                     |
| OpenAI Codex CLI      | `AGENTS.md`                           | Yes                     |
| OpenCode (sst)        | `AGENTS.md`                           | Yes                     |
| Aider                 | `AGENTS.md` (also reads `CONVENTIONS.md`) | Yes                 |
| Cursor                | `.cursor/rules` or `.cursorrules`     | Requires a bridge (see below) |
| GitHub Copilot Chat   | `.github/copilot-instructions.md`     | Requires a bridge       |
| Others                | Point manually to `AGENTS.md`         | Yes, with one step      |

**For agents that don't read `CLAUDE.md` or `AGENTS.md` directly** (Cursor,
Copilot, ...), create their config file with a line pointing
to the standard entry:

```
# Example: .cursorrules or .github/copilot-instructions.md
Read AGENTS.md as the entry point. Follow the protocol in agents/leader.md.
```

**The subagents (`agents/leader.md`, `researcher.md`, `implementer.md`,
`reviewer.md`) are written as plain Markdown with YAML frontmatter.**
Claude Code discovers them natively if you copy them to `.claude/agents/` when
adopting the harness. Other agents that don't support "subagents" can
**read them as roles** that the model assumes sequentially in the same
session — the `researcher → implementer → reviewer` flow works the same,
only the engine changes.

## Requirements

- **Bash 4+** (macOS / Linux).
- **`python3`** available on `PATH` so that `init.sh` can validate the JSON.
  If it's not there, validation is skipped with a WARN; the rest of the script
  keeps working.
- An **AI agent** capable of reading the repo (see the compatibility table
  above). The harness doesn't require any in particular.
- Whatever your stack needs. The harness imposes no toolchain.

---

## Philosophy

This harness is designed to minimize two classes of failure:

1. **Drift between sessions.** A new agent reads `AGENTS.md` and in 5 minutes
   knows the same as the one that closed the previous session. It doesn't depend on memory
   or prior chat.

2. **"I left it done" without evidence.** A task is not closed without green tests,
   without passing checkpoints, and without a reviewer agent different
   from the implementer having given the OK.

It's not a testing framework, nor a linter, nor a remote ticketing
system. It's a **convention** that lives in the repo and that anyone (human
or agent) can follow by reading the files in the order indicated by
`AGENTS.md`.

---

## License

See the `LICENSE` file if present. If not, the harness is published
as royalty-free template code — copy it, modify it, and use it
in whatever you want.
