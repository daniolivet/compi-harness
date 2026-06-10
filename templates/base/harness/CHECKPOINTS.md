# CHECKPOINTS.md — Objective criteria for "correct final state"

> **Template.** This is the list the `reviewer` walks through before approving
> a task. Each checkpoint must be **objectively verifiable**: the
> reviewer reads the code and the output of `./harness/init.sh` and decides `[x]` or `[ ]`
> without opining. If a checkpoint is subjective ("clean code"), it is poorly
> written — reformulate it in verifiable terms ("there are no functions longer
> than 50 lines", "every public API has a test").

## How it is used

- The `reviewer` walks through this list for each closed task.
- Marks `[x]` if met, `[ ]` if not, noting file and line when it
  fails.
- Any `[ ]` ⇒ `CHANGES_REQUESTED`.
- This list grows with the project's experience. When a bug slips through,
  the checkpoint that would have caught it is added.

## General checkpoints (valid in any project)

- **C1.** `./harness/init.sh` finishes green.
- **C2.** All new files follow the conventions in `harness/docs/conventions.md`.
- **C3.** Every new or modified public unit in `src/` has its test.
- **C4.** The task respects `harness/docs/architecture.md` (layers, dependencies, modules).
- **C5.** `harness/progress/current.md` is up to date and reflects what was done.
- **C6.** No TODO/FIXME left without context, no debug `console.log`/`print`, no temporary files.
- **C7.** The task's `acceptance` (in `harness/feature_list.json` / `harness/hotfix_list.json`) is met point by point.

## Project-specific checkpoints

> Add here the ones your stack and domain justify. Possible examples:

- **C8.** <e.g. "No Prisma entity is returned from a controller."> 
- **C9.** <e.g. "Every multi-table operation is wrapped in `$transaction`."> 
- **C10.** <e.g. "No service imports another module bypassing the `exports`."> 
- **C11.** <e.g. "Every new endpoint has its e2e with a body assert."> 
- **C12.** <e.g. "There is no `any` in new TypeScript code."> 

> **Practical rule:** keep this list short (10-15 items). If it becomes
> unmanageable, turn it into automated checks inside `./scripts/check.sh`
> and leave in CHECKPOINTS.md only the things that only a human (or model)
> eye can judge.
