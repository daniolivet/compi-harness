# Architecture — What it means to "do a good job"

> **Template.** Fill in the sections marked with `<...>` with the reality
> of your project. This document defines the quality standard. The reviewer
> agents evaluate code against this file. **If it isn't here, it isn't a
> requirement.**

## Context

<Describe in 2-4 sentences what the project does, who uses it and what problem
it solves. Avoid internal jargon. Example: "Web app where the user configures
X, the system scrapes Y, and returns Z.">

<Current scope and main stack. Example: "REST HTTP API in NestJS +
PostgreSQL (via Prisma). The scraping module will come later.">

## Principles

> List the architectural decisions a reviewer must be able to cite to
> approve or reject a change. Don't include style rules (those go in
> `conventions.md`). This is for the structural decisions that, if
> broken, justify a `CHANGES_REQUESTED`.

1. **<Decision 1>.**
   <Why. Example: "Plain framework, three layers and only three
   (controller → service → repository). Don't introduce facades, use-cases,
   ports/adapters or CQRS until a concrete PR proves that the
   duplication justifies it.">

2. **<Decision 2>.**
   <Why. Example: "The DB schema is internal. The external contract is
   the DTOs. The API must be able to evolve without touching the DB, and the DB
   without breaking the API.">

3. **<Decision 3>.**
   <Why. Example: "Explicit domain errors in
   `<domain>/<domain>.errors.ts`. A global filter translates them to HTTP.">

4. **<Decision 4>.**
   <Why. Example: "Constructor injection. No manual singletons
   nor global access to the DB client.">

5. **<Decision 5>.**
   <Why. Example: "One module, one domain. Modules communicate only
   through their public API (`exports`).">

## Data flow

> ASCII diagram of the path a typical request travels from entry
> to persistence and back. Keep it simple: 5-7 layers at most.

```
<entry>
    │
    ▼
<layer 1>   ← <what it does>
    │
    ▼
<layer 2>   ← <what it does>
    │
    ▼
<layer 3>   ← <what it does>
    │
    ▼
<persistence / output>
```

<Any note about the flow: how inputs/outputs are mapped, where errors are
caught, what is logged automatically.>

## What NOT to do

> Concrete anti-patterns. Each bullet must be falsifiable: a reviewer has
> to be able to point at a line of code and say "this violates rule X".

- **Don't <anti-pattern 1>.** <Why it hurts when done.>

- **Don't <anti-pattern 2>.** <Why it hurts when done.>

- **Don't <anti-pattern 3>.** <Why it hurts when done.>

- **Don't <anti-pattern 4>.** <Why it hurts when done.>

- **Don't <anti-pattern 5>.** <Why it hurts when done.>

---

> **How this document evolves.** When a new decision appears in
> a PR and is accepted as a project rule, it gets added here. When a rule
> no longer applies (stack change, big refactor), it gets deleted. Keeping this
> file short and current matters more than having it complete.
