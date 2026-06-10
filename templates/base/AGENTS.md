# AGENTS.md — Navigation map for AI agents

> This file is the **entry point** for any agent working in this
> repository (Codex CLI, OpenCode, Aider, etc. read it automatically;
> Claude Code reads `CLAUDE.md` first and reaches here from there). It is NOT a
> bible of rules: it is a **map**. Read only what you need when you
> need it (progressive disclosure).

---

## 0. Your default role

When you receive a prompt from the user, you act as the **leader** (orchestrator):
you break down the work and coordinate subagents. You **do not implement**. The
full protocol is in `agents/leader.md`. In summary:

```
user prompt
       │
       ▼
leader (you)
   ─ read this file
   ─ run ./harness/init.sh ("at the start" verification)
   ─ ask: feature or hotfix?
   ─ pick the pending task with the lowest id
       │
       ▼
researcher → ⏸ user validation → implementer → reviewer
```

> The plan that the `researcher` produces **is not executed until the user
> validates it**. The `leader` presents the plan and waits for the explicit
> OK before launching the `implementer`.

The subagents are defined in `agents/`. How you invoke them depends on the
agent that is running (Claude Code: Task tool with `subagent_type`;
Codex/OpenCode: explicit spawn). See `harness/README.md` §Compatibility.

---

## 1. Before starting (mandatory)

1. Read `harness/progress/current.md` to understand what state the last session ended in.
2. Run `./harness/init.sh` once to confirm the environment is green ("at the start" verification). If it comes back red, do not proceed.
3. Before you start organizing, ask the user the following question: `Is it a feature or a hotfix?`.
   - If it is a **feature** → read `harness/feature_list.json` and `harness/progress/current.md`.
   - If it is a **hotfix** → read `harness/hotfix_list.json` and `harness/progress/current.md`.
4. Read the file for the task type (`harness/feature_list.json` or `harness/hotfix_list.json`) and pick **one task** with status `pending`. Do not work on more than one task at a time.

## 2. Repository map

> Almost the entire harness lives under `harness/`. Only `CLAUDE.md`, `AGENTS.md` and
> `agents/` stay at the project root (the first two because they are the
> *entry files* that agents read automatically; `agents/` so it can be
> copied to `.claude/agents/`). `src/` and `tests/` belong to the project, not the
> harness.

| File / folder                | What it contains                                          | When to read it |
|------------------------------|-----------------------------------------------------------|---------------|
| `harness/feature_list.json`  | List of tasks with status (pending / in_progress / done)  | If the task is a feature, at the start |
| `harness/hotfix_list.json`   | List of tasks with status (pending / in_progress / done)  | If the task is a hotfix, at the start |
| `harness/progress/current.md`| State of the current session                              | Always, at the start |
| `harness/progress/history.md`| Append-only log of previous sessions                      | If you need historical context |
| `harness/progress/feat_<id>/plan_<id>.md` | Plan that the `researcher` prepares for a feature. Temporary: deleted when the task closes | Implementer, before starting (if it exists) |
| `harness/progress/feat_<id>/review_<id>.md` | The `reviewer`'s verdict (APPROVED / CHANGES_REQUESTED + checkpoints). Temporary: deleted when the task closes | Implementer, after the review |
| `harness/progress/hotfix_<id>/plan_<id>.md` | Plan that the `researcher` prepares for a hotfix. Temporary | Implementer, before starting (if it exists) |
| `harness/progress/hotfix_<id>/review_<id>.md` | The `reviewer`'s verdict for a hotfix. Temporary | Implementer, after the review |
| `harness/progress/<agent>_<slug>.md` | Historical summary that the implementer writes when closing a task (`done`). Persistent. One per agent: `researcher_`, `implementer_`, `reviewer_` | To reconstruct historical context |
| `harness/docs/architecture.md` | What "doing a good job" means in this project           | Before implementing |
| `harness/docs/conventions.md`| Rules for style, naming, structure                        | Before writing code |
| `harness/docs/verification.md` | How to verify that your work works                      | Before declaring a task `done` |
| `harness/CHECKPOINTS.md`     | Objective criteria for "correct final state"              | To self-evaluate |
| `harness/init.sh`            | Environment verification. Run from the root: `./harness/init.sh` | At the start (leader) and at the end (reviewer) |
| `agents/`                    | Subagent definitions (leader, implementer, reviewer, researcher) | If you orchestrate work |
| `src/`                       | Application code                                          | To implement |
| `tests/`                     | Automated tests                                           | To verify |

## 3. Hard rules (non-negotiable)

- **One task at a time.** Do not mix changes from several tasks in the same session.
- **Do not declare a task `done` without green tests.**
- **Document what you do** in `harness/progress/current.md` while you work, not at the end.
- **Leave the repository clean** before closing the session (see §5).
- **If you don't know something, look in `harness/docs/`** before making it up.
- **`./harness/init.sh` is run only by the leader (at the start) and the reviewer
  (verification, includes the project tests).** The implementer does not run
  tests or `init.sh` on its own, and does not re-run it when marking `done`.

## 4. How to pick a task

```
1. Confirm with the user whether it is a feature or a hotfix.
2. Open harness/feature_list.json or harness/hotfix_list.json, depending on the type.
3. Filter by status == "pending".
4. Take the one with the lowest "id".
5. Change its status to "in_progress" and save.
6. Note in harness/progress/current.md: task, start time, brief plan.
```

## 5. Session close (lifecycle)

Before finishing:

1. **Do not re-run `./harness/init.sh`.** The "at the end" verification was already
   run by the `reviewer` on approval (`APPROVED` ⇒ green environment). Running it
   again here only duplicates the tests and slows down the close.
2. If the task is finished: set `status: "done"` in `harness/feature_list.json` or `harness/hotfix_list.json`.
3. Move the summary from `harness/progress/current.md` to the end of `harness/progress/history.md`.
4. Empty `harness/progress/current.md`, leaving only the template.
5. Do not leave temporary files, debug `print()`s, or TODOs without context.

## 6. If you get stuck

- Re-read the relevant section of `harness/docs/`.
- If the tool does not do what you expect, **do not invent a workaround**:
  document the blocker in `harness/progress/current.md` and stop the session.
