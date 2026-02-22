## Summary
<!-- Brief description of what this PR does and why. Link to the issue if applicable. -->

## Risk Tier
<!-- The risk-policy-gate auto-detects the tier, but classify here for reviewer context. -->
<!-- See harness.config.json for full pattern definitions. -->
- [ ] **Tier 1 (Low)**: Documentation, comments, `*.md`, `docs/`, `CHANGELOG.md`, `LICENSE`
- [ ] **Tier 2 (Medium)**: Source code in `src/`, tests in `tests/`, `vitest.config.ts`
- [ ] **Tier 3 (High)**: Critical paths (`src/index.ts`, `package.json`, `tsconfig.json`, `eslint.config.js`)

## Changes
<!-- Group modified files by logical concern. -->

### Added
-

### Changed
-

### Removed
-

## Testing
<!-- How were these changes validated? -->
- [ ] Unit tests added/updated
- [ ] Manual testing completed
- [ ] All checks pass locally:
  ```
  npm run lint && npm run typecheck && npm test
  ```

## Evidence
<!-- Tier 1: none required. Tier 2: tests-pass, lint-clean, type-check-clean. Tier 3: all of Tier 2 + manual-review. -->

| Check | Result |
|-------|--------|
| `npm run lint` | <!-- PASS / FAIL --> |
| `npm run typecheck` | <!-- PASS / FAIL --> |
| `npm test` | <!-- PASS / FAIL --> |
| `npm run build` | <!-- PASS / FAIL --> |

## Review Checklist
- [ ] Code follows project conventions
- [ ] ESM imports use `.js` extensions for local files
- [ ] `import type` used for type-only imports
- [ ] No secrets, API keys, or credentials committed
- [ ] No ESLint rules or TypeScript strict mode disabled
- [ ] Documentation updated if public API changed
- [ ] Risk tier accurately reflects scope of changes
