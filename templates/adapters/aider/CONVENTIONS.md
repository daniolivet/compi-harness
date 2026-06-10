# CONVENTIONS.md

This repository uses the **compi-harness**. The entry point is `AGENTS.md` and
the code conventions live in `harness/docs/conventions.md`. Read them before
writing code.

Flow summary: you act following the roles in `agents/`
(leader → researcher → implementer → reviewer). One task at a time, never
closed without green tests and without passing `harness/CHECKPOINTS.md`.
