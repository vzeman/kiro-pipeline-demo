# Layer Boundaries

No formal architectural layers are defined in this project. The current structure is flat with all source code in `src/` and all tests in `tests/`.

## Current Structure

```
src/
├── index.ts           # Public API (re-exports)
└── string-utils.ts    # Implementation
```

This flat structure is appropriate for a small utility library with three functions. There are no implicit layer boundaries because all functions are independent and have no internal dependencies.

## When to Introduce Layers

Consider introducing layers when:
- The library grows beyond 10-15 functions
- Functions begin to share common internal utilities
- Different categories of utilities emerge (case transformation, formatting, validation, etc.)

## Proposed Layer Structure (Future)

If the library expands, organize by feature domain:

```
src/
├── index.ts                    # Public API
├── case/
│   ├── index.ts               # Re-export case utilities
│   ├── capitalize.ts
│   ├── camel-case.ts
│   └── pascal-case.ts
├── formatting/
│   ├── index.ts               # Re-export formatting utilities
│   ├── truncate.ts
│   ├── pad.ts
│   └── wrap.ts
├── url/
│   ├── index.ts               # Re-export URL utilities
│   ├── slugify.ts
│   └── encode.ts
└── internal/
    └── validators.ts          # Shared internal utilities (not exported)
```

## Dependency Rules (Future)

When layers are introduced, enforce these rules:

1. **Public API** (`src/index.ts`) may import from any feature domain
2. **Feature domains** (`case/`, `formatting/`, `url/`) may import from `internal/` but not from each other
3. **Internal utilities** (`internal/`) may not import from feature domains
4. **Tests** may import from public API or directly from feature domains for white-box testing

Dependency direction:
```
Public API → Feature Domains → Internal Utilities
```

## Enforcement

Use ESLint import rules to enforce boundaries:
```javascript
{
  rules: {
    'no-restricted-imports': ['error', {
      patterns: [{
        group: ['../case/*', '../formatting/*', '../url/*'],
        message: 'Feature domains must not import from each other'
      }]
    }]
  }
}
```

## Migration Path

To evolve toward layered architecture:

1. **Identify domains**: Group related functions by analyzing usage patterns
2. **Create domain directories**: Move functions into `src/<domain>/` directories
3. **Extract shared code**: Move common utilities to `src/internal/`
4. **Update imports**: Change public API to import from domain index files
5. **Add linting rules**: Enforce dependency direction
6. **Update tests**: Organize tests to mirror new structure

This migration should happen incrementally, one domain at a time, to avoid breaking changes.
