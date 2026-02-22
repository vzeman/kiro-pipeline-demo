# Coding Conventions

This document is the authoritative reference for coding standards. Both human developers and AI coding agents must follow these rules.

## Naming Conventions

### Files

All source files use **kebab-case** with `.ts` extension:
- `string-utils.ts` (source)
- `string-utils.test.ts` (tests)

### Variables and Functions

**camelCase** for all variables and functions:
```typescript
function capitalize(str: string): string
const maxLength = 10;
```

### Types, Interfaces, and Classes

**PascalCase** with no prefix (no `I` on interfaces, no `T` on types):
```typescript
type StringTransformer = (input: string) => string;
interface UtilityConfig { ... }
```

### Constants

**camelCase** for all constants (no UPPER_SNAKE_CASE):
```typescript
const defaultMaxLength = 100;
```

## Exports

**Named exports only.** No default exports in source files.

```typescript
// ✓ Correct
export function capitalize(str: string): string { ... }

// ✗ Wrong
export default function capitalize(str: string): string { ... }
```

## Import Organization

Imports are ordered:
1. External dependencies (none in this project)
2. Internal modules (relative imports)

```typescript
import { capitalize, slugify } from './string-utils.js';
```

**Critical**: All imports from local TypeScript files must include the `.js` extension (not `.ts`) because this project uses ESM with `"type": "module"`.

## Error Handling

### Edge Cases

Functions handle edge cases gracefully without throwing:
```typescript
if (!str) return str;  // Return empty string as-is
if (str.length <= maxLength) return str;  // No-op if under limit
```

### No Exceptions

This library does not throw exceptions. Invalid inputs return safe defaults (empty string, original string, etc.).

## Documentation

All exported functions must have JSDoc comments:
```typescript
/**
 * Capitalize the first letter of a string.
 */
export function capitalize(str: string): string { ... }
```

## Linting

Enforced by ESLint with TypeScript plugin. Run `npm run lint` before pushing.

Configuration: `eslint.config.js` using flat config format with recommended rules from `@eslint/js` and `typescript-eslint`.

## Type Checking

- **Checker**: `tsc`
- **Mode**: Strict (all strict flags enabled in `tsconfig.json`)
- **Command**: `npm run build` (type-checks as part of compilation)

No explicit `typecheck` script exists; type checking happens during build.

## Testing Conventions

- **Runner**: Vitest
- **Command**: `npm test`
- **Test files**: Located in `tests/` directory with `.test.ts` suffix
- **Structure**: `describe` blocks for each function, `it` blocks for each test case
- **Assertions**: Use Vitest's `expect` API

Example:
```typescript
describe('capitalize', () => {
  it('capitalizes the first letter', () => {
    expect(capitalize('hello')).toBe('Hello');
  });
});
```

## Git Workflow

### Branch Naming

`<type>/<short-description>` where type is one of:
```
feat/    fix/    chore/    docs/    refactor/    test/
```

Examples:
- `feat/add-camel-case`
- `fix/slugify-unicode`
- `docs/update-readme`

### Commit Messages

[Conventional Commits](https://www.conventionalcommits.org/) format:
```
feat: add camelCase function
fix: handle empty strings in truncate
chore: update dependencies
docs: add architecture docs
refactor: extract validation helper
test: add edge cases for slugify
```

### PR Size

Keep PRs focused on a single concern. Prefer multiple small PRs over one large PR. Every PR must be classified by risk tier in the description.

### Merge Strategy

Squash commits on merge to maintain clean history.

## Code Review Standards

### Risk Tiers

All changes are classified by risk tier as defined in `harness.config.json`:

| Tier | Scope | Required Checks |
|---|---|---|
| **Tier 1** (low) | Docs, comments, markdown files | lint |
| **Tier 2** (medium) | Source code (`src/**`), tests (`tests/**`) | lint, type-check, test, build |
| **Tier 3** (high) | Entry points (`src/index.ts`), config files (`package.json`, `tsconfig.json`, `eslint.config.js`) | lint, type-check, test, build, structural-tests, manual-approval |

### Review Focus

**Automated checks** (handled by CI):
- Linting passes
- Type checking passes
- All tests pass
- Build succeeds

**Human reviewers** should focus on:
- API design and naming consistency
- Edge case handling
- Test coverage for new functions
- Documentation clarity
- Adherence to pure function principles

### Approval Requirements

- **Tier 1**: Self-merge allowed after lint passes
- **Tier 2**: 1 approval required, review agent must approve
- **Tier 3**: 2 approvals required, review agent + manual review

## Pre-commit Hooks

Husky is configured to run checks before commit. Hooks are located in `.husky/` directory.

Lint-staged is used to run linters only on staged files for faster feedback.
