# KIRO.md

## Project Overview

A TypeScript string utility library providing capitalize, slugify, and truncate functions. Written in TypeScript with npm as the package manager.

## Build & Run Commands

```bash
npm install           # Install dependencies
npm test              # Run all tests
npx vitest run <file> # Run single test file
npm run build         # Build the project
npm run lint          # Lint the codebase
npx tsc --noEmit      # Type-check without emitting files
```

## Code Style Rules

- **Linter**: eslint with TypeScript recommended rules
- **File naming**: Use `kebab-case` for all source files (e.g., `string-utils.ts`)
- **Naming conventions**: `camelCase` for variables/functions, `PascalCase` for interfaces/classes/types
- **Exports**: Named exports only. No default exports in source files
- **Import extensions**: This is a pure ESM package. All local imports must include `.js` extensions (e.g., `from './string-utils.js'`)
- **Error handling**: Use `try/catch` with pattern: `error instanceof Error ? error.message : String(error)`
- **Type safety**: Strict mode enabled. Never use `any` without justification

## Architecture Overview

Flat structure with utility functions:
- `src/index.ts` — Public API exports
- `src/string-utils.ts` — Core utility implementations

No layered architecture. All functions are pure utilities with no dependencies between modules.

## Critical Paths — Extra Care Required

Changes to these files require additional test coverage and human review:

- `src/index.ts`
- `package.json`
- `tsconfig.json`
- `eslint.config.js`

These are classified as **Tier 3 (high risk)** in `harness.config.json`. All Tier 3 changes require: lint + type-check + full test suite + review-agent + manual human review.

## Security Constraints

- Never commit secrets, API keys, or `.env` files
- Never disable linter rules, strict mode, or type checking
- Validate all external input at system boundaries
- Never pass unsanitized user input to shell commands

## Dependency Management

- Add dependencies: `npm install <pkg>`
- Always commit `package-lock.json` after dependency changes
- Do not upgrade major versions without explicit instruction
- Pin exact versions in production dependencies

## Harness System Reference

This project uses harness engineering:
- Risk tiers are defined in `harness.config.json`
- CI gates enforce risk-appropriate checks on every PR
- A review agent will automatically review PRs
- Pre-commit hooks enforce local quality checks
- **Chrome DevTools MCP**: `.mcp.json` configures `@modelcontextprotocol/server-puppeteer` for browser-driven validation
- See `docs/architecture.md` and `docs/conventions.md` for detailed guidelines

## PR Conventions

- **Branch naming**: `<type>/<short-description>` (e.g., `feat/add-reverse`, `fix/empty-string`, `chore/update-deps`)
- **Commit messages**: Conventional Commits — `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`
- All PRs must pass lint, type-check, and test CI gates before merge
- Classify every PR by risk tier (Tier 1/2/3) in the PR description
