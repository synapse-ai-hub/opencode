# opencode Package Guide

## Database
- Schema: `packages/core/src/**/*.sql.ts` (Drizzle).
- Migrations: applied by core.

## Module Shape
- Flat top-level exports + self-reexport at bottom: `export * as Foo from "./foo"` in the same file.
- For `foo/index.ts`, use `"."` as reexport source.
- Multi-sibling dirs: no barrel `index.ts`. Import specific siblings directly.
- Namespace-private helpers stay as non-exported top-level declarations.

## Effect Rules

### Core
- `Effect.gen(function* () { ... })` for composition.
- `Effect.fn("Domain.method")` for named/traced effects.
- `Effect.callback` for callback-based APIs.
- `Effect.void` instead of `Effect.succeed(undefined)`.

### Modules
- In `src/config`, follow self-export pattern (`export * as ConfigAgent from "./agent"`).

### Schemas & Errors
- `Schema.Class` for multi-field data, `Schema.brand` for single-value.
- `Schema.TaggedErrorClass` for typed errors.
- `Schema.Defect` instead of `unknown` for defects.
- `yield* new MyError(...)` over `yield* Effect.fail(new MyError(...))`.

### Runtime vs InstanceState
- `makeRuntime` for services (returns runPromise/runFork/runCallback).
- `InstanceState` for per-directory state using ScopedCache.
- `Effect.forkScoped` inside InstanceState.make for background consumers.
- `Effect.addFinalizer` / `Effect.acquireRelease` for cleanup.

### Services
- Prefer Effect services: FileSystem, ChildProcessSpawner, HttpClient, Path, Config, Clock, DateTime.
- Use `Effect.cached` for deduplication of concurrent callers.
- Use `EffectBridge` for native/external callbacks re-entering Effect.

### v4 Beta
- `Effect.forkIn(scope)` instead of `Effect.fork` / `Effect.forkDaemon`.
