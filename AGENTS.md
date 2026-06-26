# Repo Conventions

## Branch Names
Max 3 words, hyphen-separated. No slashes or type prefixes (`feat/`, `fix/`).
Example: `session-recovery`, `fix-scroll-state`, `regenerate-sdk`.

## Commits & PR Titles
`type(scope): summary`. Types: feat, fix, docs, chore, refactor, test.
Scopes: core, opencode, tui, app, desktop, sdk, plugin.
Example: `fix(tui): simplify thinking toggle styling`.

## TypeScript Style

- One function unless composable/reusable. Inline single-use values. No preemptive extraction.
- Avoid `try`/`catch`, avoid `any`.
- Prefer Bun APIs (`Bun.file()`). Rely on type inference.
- Prefer functional array methods (flatMap, filter, map) over for loops.
- Prefer `const`. Use ternaries or early returns over reassignment.
- Avoid `else` — use early returns.
- No destructuring unless it improves clarity; dot notation preferred.
- No alias imports (`foo as bar`), no star imports (`import *`).
- Use dynamic imports for heavy modules in cold paths.
- snake_case for Drizzle column names.
- Add comments for non-obvious constraints, not for obvious control flow.

## Testing
- Avoid mocks. Test actual implementation, don't duplicate logic.
- Run from package dirs, not repo root.

## Type Checking
- `bun typecheck` from package dirs, never `tsc` directly.
