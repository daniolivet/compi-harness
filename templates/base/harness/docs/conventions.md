# Code conventions

> **Template.** Fill in with your project's real conventions.
> Extreme homogeneity. The AI predicts better when the repository looks
> like itself everywhere. If a convention isn't here, **it isn't
> mandatory** — reviewers should only reject changes that violate written
> rules.

## Language style

- **Language and version:** <e.g. TypeScript 5.x with `strict: true`, Python 3.12, Go 1.22, Rust 1.78>
- **Target / runtime:** <e.g. Node 20 LTS, CPython 3.12, JVM 21>
- **Formatting:** <tool + rules. E.g. Prettier (width 100, single quotes)>
- **Linter:** <tool + ruleset. E.g. ESLint with recommended-type-checked>
- **Imports:** <order and grouping. E.g. builtins, externals, project aliases, relative>
- **Strings / types / control flow:** <language-specific rules that matter>
- **Typing:** <where types must be made explicit and where they are inferred>
- **Forbidden:** <e.g. `any`, `var`, global mutation, circular imports>

## Naming

| Type                       | Convention        | Example                       |
|----------------------------|-------------------|-------------------------------|
| Files                      | `<convention>`    | `<example>`                   |
| Types / Classes            | `<convention>`    | `<example>`                   |
| Functions / variables      | `<convention>`    | `<example>`                   |
| Module constants           | `<convention>`    | `<example>`                   |
| Private                    | `<convention>`    | `<example>`                   |
| Enums                      | `<convention>`    | `<example>`                   |

### Suffixes by role (if applicable)

> If your stack has well-defined roles (controller, service, repository,
> view, handler...), document here the expected file and class suffixes.
> If it doesn't apply, delete this section.

| Role                   | File suffix             | Type suffix         |
|------------------------|-------------------------|---------------------|
| <Role>                 | `<suffix>`              | `<suffix>`          |

## File structure

> How a module / package / domain is organized. Give a concrete example
> of what a well-structured domain looks like.

```
src/<domain>/
├── <file1>
├── <file2>
└── <subfolder>/
    └── <file>
```

<Rules about import order, file header, separators, etc.>

## Input validation

> How the inputs that cross the system boundary are validated (HTTP,
> CLI args, queue messages, external files). The goal: never process
> data with an unknown type.

- <Rule 1>
- <Rule 2>
- <Code example>

## Dependency injection / coupling

- <How dependencies are resolved. E.g. constructor injection, FX,
  DI containers, top-level wiring in `main`.>
- <What is forbidden: global singletons, direct `new` of services,
  access to global state from domain logic.>

## Tests

- **Framework:** <e.g. Jest, pytest, go test, cargo test>
- **Location:** <e.g. next to the file under test, in a separate `tests/`>
- **Naming:** <e.g. `<unit>.spec.ts`, `test_<unit>.py`>
- **Minimum structure of a test:** <describe → it / arrange-act-assert>
- **Isolation:** <how it is guaranteed that tests don't share state>
- **Mocks:** <what is mocked and what isn't. See `verification.md` for details>

## Error handling

> How errors are modeled in this project. Languages with exceptions,
> with `Result`/`Either`, with error codes... each has different rules.

- <Where the error types are defined>
- <Who throws / produces them>
- <Who translates them into the external response (HTTP status, exit code, message)>
- <What is NOT done: defensive `try/catch`, silent swallow, stack traces to the client>
- <Code example>

## Logging

> Log policy. If this isn't documented, every agent will invent its own
> style and the repo ends up with `console.log`, `print`, `fmt.Println` and a
> half-baked structured logger.

- **Logger:** <library + why>
- **Configuration:** <where it is set up, what is redacted, what is included automatically>
- **Levels:** <when to use error/warn/info/debug>
- **Structured vs string:** <rule. E.g. "data as a separate field, never concatenated into the message">
- **Forbidden in `src/`:** <e.g. `console.log`, `print`, `fmt.Println` outside the official logger>

## Async / concurrency

> If the language has its own async model (async/await, goroutines,
> threads, actors), document how it is used here.

- <Rules: how it is composed, what patterns are avoided, how async errors are handled>
- <Specific linter rule if applicable (e.g. `no-floating-promises`)>

## Comments

By default they are **not** written. They are only allowed when they explain a non-obvious
*why* (e.g. documented workaround, subtle invariant, design
decision a name can't express). Names should do the rest.

<If your project exports a public library, document here the format of the
docstrings/JSDoc/rustdoc expected on the exported API.>
