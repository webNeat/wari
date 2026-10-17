# Coding rules

## Working approach

- Read the relevant implementation, tests, and documentation before proposing changes.
- Use `src/is/is.ts`, `src/is/is.test.ts`, and `src/is/README.md` as local style references.
- Treat explicit current instructions as overrides to existing examples.
- Choose the smallest solution that meets the current requirements.
- Handle small, style-sensitive edits directly rather than delegating them.
- Present the smallest proposed design before implementing substantial changes.
- Resolve routine details from approved examples instead of repeatedly asking the user.
- Verify whether existing tools support a requirement before adding scripts or dependencies.
- Do not add abstractions, configuration, or workflows for hypothetical future needs.
- Reconsider the design when a fix adds complexity instead of patching around it.
- Preserve user edits and apply the same convention to all affected files.
- Before reporting completion, inspect the actual diff for style consistency, unnecessary code, repetition, and scope creep.
- Verify both correctness and adherence to approved examples before reporting completion.
- The parent agent must review delegated changes for style and scope, not just passing tests.
- Include the relevant style references and acceptance checks in delegated tasks.

## Pitfalls to avoid

- Do not replace tool-supported features with custom orchestration scripts.
- Do not generate fixtures that can be small, committed files.
- Do not expand a function example into setup for unrelated APIs.
- Do not add test helpers or nested wrappers when direct assertions suffice.
- Do not treat passing tests as proof that a change matches the requested style.
- Do not accept delegated output without inspecting its diff.
- Do not overwrite user corrections with earlier agent conventions.
- Do not claim unrun or blocked checks passed.

## Maintaining rules

- Update this file whenever the user gives feedback that establishes or changes a coding rule.
- Keep rules concise and atomic.
- Distinguish general conventions from case-specific feedback when updating rules.
- Record recurring failure modes as concrete prohibitions, not just positive guidance.

## Implementation

- Leave `archive/` unchanged unless explicitly asked.
- Follow the API specifications in `docs/`.
- Give each public function its own `src/<name>/` directory.
- Colocate implementation, one test file, and documentation as `<name>.ts`, `<name>.test.ts`, and `README.md`.
- Group type assertions in `test('types', ...)` without separate `describe` blocks.
- Use `it(...)` for runtime behavior tests.
- Put type tests before runtime tests.
- Export public functions from `src/index.ts`.
- Use `{ success: true, data }` and `{ success: false, error }` for `result` outcomes.
- Use descriptive generic parameter names in public signatures.
- Use PascalCase for types and classes.

## Documentation

- Document public functions and classes with short, concise API documentation.
- Use simple, direct language in documentation, guided by ASD-STE100.
- Follow the react-tidy documentation template: signature, arguments, returns, and usage.
- Keep the root README consumer-focused, following react-tidy's introduction, features, installation, function list, and contributing structure.
- Keep usage examples focused on the documented function; omit unrelated setup and use illustrative types when sufficient.
- Show intended Wari workflows in usage examples.
- Add implementation comments only when necessary.
- Let the configured formatter control layout and punctuation.

## Testing

- Use `expectTypeOf` from `vite-plus/test` for source type assertions.
- Ensure type assertions are compiler-checked.
- Avoid redundant test assertions that verify an already-established guarantee.
- Give test classes distinct fields when their structural differences matter to type assertions.
- Use `@ts-expect-error` to test invalid calls.
- Use throwing assertions for invalid calls that also throw at runtime instead of unreachable test blocks.
- Keep consumer type fixtures independent of Vitest to support TypeScript 5.0.

## Tooling and compatibility

- Use Vite+ for building, linting, formatting, and running tests.
- Prefer existing tool capabilities over custom orchestration scripts.
- Share consumer runtime tests across Vitest Node and browser projects.
- Keep the minimal consumer fixture committed in `tests/consumer/`.
- Install the library in the consumer with `file:../..`.
- Use npm and its `install:lib` script for consumer installation.
- Use pinned pnpm for the root project.
- Support both ESM and CommonJS consumers.
- Verify native CommonJS loading outside Vitest's module transformations.
- Test published declarations with TypeScript 5.0 onward.
- Test maintained Node releases and current Chromium, Firefox, and WebKit.
- Increase minimum supported versions only in major releases.
- Run CI on Linux only.
- Collect coverage without blocking on a percentage threshold.
- Use Changesets release PRs for versioning and changelogs.
- Publish through npm trusted publishing with provenance after CI passes.
- Do not add Git hooks.
- Do not add dependency-update automation unless requested.
