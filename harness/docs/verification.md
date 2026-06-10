# Verification — How to prove the work works

> **Template.** Fill in with your project's real verification policy.
> Golden rule: **the agent doesn't say "it works", it proves it**.
> Every task ends with executable evidence, not with claims.

## Mocking policy

> Before the levels, a rule that applies to everything that follows. Define
> what is mocked and what isn't. Without this, every agent invents its own policy
> and the "green" tests start to diverge from production.

- **<Rule 1>.** <Example: "DB always real (testcontainer). Zero mocks
  of the DB client. The mock-vs-real divergence has been a source of incidents
  before.">
- **<Rule 2>.** <Example: "Only out-of-process I/O is mocked: third-party HTTP
  clients, queues, S3, outgoing webhooks.">
- **<Rule 3>.** <Example: "If a dependency isn't external I/O, it isn't
  mocked. Period.">

## Verification levels

### Level 1 — Unit tests (mandatory)

> What counts as a "unit test" in this project, what each one covers and how
> they are run. You have to be able to read this and know, without opening code, what
> you expect a new PR to have.

Every public unit with its own logic (<services / handlers / pure
functions>) has its test that:

1. Covers the happy path.
2. Covers at least one error path if the function can fail.
3. <Stack-specific rule — e.g. "If it touches persistence, it does so
   against a real DB via testcontainer">.

Minimum structure:

```<language>
<describe/it block or equivalent>
  <happy path test>
  <error path test asserting the concrete error type>
```

Command:
```bash
<command to run unit tests>
```

### Level 2 — E2E / integration (mandatory if applicable)

> If your project exposes an external surface (HTTP, CLI, gRPC, queue),
> describe here how that surface is verified end-to-end.

Each new or modified <endpoint / command / handler> has an e2e test
that:

1. <Starts the real system (no internal mocks)>
2. <Configures the same middleware / pipeline as production>
3. <Uses real dependencies via testcontainer or sandbox>
4. <Calls the external surface and verifies response + observable effect>

Skeleton:

```<language>
<minimal e2e test example>
```

Each e2e covers, at minimum: happy path + a relevant validation or
domain error.

Command:
```bash
<command to run e2e>
```

### Level 3 — Manual smoke (optional but recommended)

> When it's worth bringing up the real app and hitting it by hand before
> closing the task. Useful for discovering things the test ignores (CORS,
> headers, error format, unexpected latency).

Before closing the session, <bring up the app / run the CLI / open the UI>
and try the change against an ephemeral environment:

```bash
<command to start the system in dev mode>
# in another terminal or browser
<command to invoke the new functionality>
```

If the behavior differs from what the test covers, **a test case is
missing** — the task isn't closed until it's added.

## Anti-patterns (don't do)

- ❌ **"I added the change, it should work."** Without an executable test
  nothing gets closed.
- ❌ **Mocking what the mocking policy says not to mock.** If it
  touches persistence and your policy says "real DB", there's no shortcut.
- ❌ **A test that only checks the function doesn't throw.** It has to
  assert the result or the observable effect.
- ❌ **An e2e that only verifies the status code / exit code.** The body /
  output is part of the contract — it's asserted too.
- ❌ **Sharing state between tests without reset.** Each test leaves the DB /
  filesystem / queue as it found it.
- ❌ **Giant response snapshots.** A snapshot kills review.
  Assert concrete fields.
- ❌ **Marking the task as `done` without passing `./harness/init.sh`.**

## Final verification before closing

`./harness/init.sh` is run by the `reviewer` as the **single verification
gate** (it includes the project tests via `./scripts/check.sh`). The
`implementer` does not run tests or `init.sh` on its own: it writes code +
tests and leaves verification to the reviewer; it also doesn't re-run it when marking
`done` (it trusts the `APPROVED`). The `leader` runs it once at the start
to confirm the environment is green before kicking off.

```bash
./harness/init.sh
```

Internally `harness/init.sh` delegates the project-specific checks to
`./scripts/check.sh` (at the project root) if it exists — define there whatever
is relevant for your stack (lint + typecheck + unit + e2e + build).

If `./harness/init.sh` is red, **nothing** is marked as `done`. The blocker
is noted in `harness/progress/current.md` with the failing command and the
relevant output.
