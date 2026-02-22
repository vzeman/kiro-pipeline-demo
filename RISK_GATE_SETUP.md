# Risk Policy Gate System — Generated Artifacts

## Overview

The risk-policy-gate preflight system has been successfully generated for your TypeScript project. This system classifies pull requests by risk tier and enforces appropriate CI checks before merge.

## Generated Files

### 1. `scripts/risk-policy-gate.sh` (Shell Script)
- **Purpose**: Portable bash implementation for maximum compatibility
- **Execution**: `bash scripts/risk-policy-gate.sh`
- **Features**:
  - SHA discipline enforcement (prevents TOCTOU races)
  - File classification into 3 risk tiers based on `harness.config.json`
  - Required checks computation per tier
  - Docs drift detection (warns when code changes without doc updates)
  - Review agent status tracking
  - JSON output for GitHub Actions integration

### 2. `scripts/risk-policy-gate.ts` (TypeScript Alternative)
- **Purpose**: Type-safe implementation with proper glob pattern matching
- **Execution**: `npx tsx scripts/risk-policy-gate.ts`
- **Features**: Same as shell version, plus:
  - Structured error handling
  - Type-safe JSON parsing
  - Better glob pattern support for complex rules

### 3. `.github/workflows/risk-policy-gate.yml` (CI Workflow)
- **Purpose**: GitHub Actions workflow that runs the gate on every PR
- **Triggers**: `pull_request` events (opened, synchronize, reopened) + manual dispatch
- **Security**: SHA-pinned actions (all actions use commit SHAs, not version tags)
- **Jobs**:
  - `risk-gate`: Runs the preflight script, outputs tier and required checks
  - `lint`: Runs for all tiers
  - `type-check`: Runs for Tier 2+
  - `test`: Runs for Tier 2+
  - `build`: Runs for Tier 2+
  - `structural-tests`: Runs for Tier 3 only
  - `harness-smoke`: Validates harness config and critical files
  - `manual-approval`: Requires environment approval for Tier 3

## Risk Tier Classification

Based on your `harness.config.json`:

### Tier 1 (Low Risk) — Documentation Only
- **Patterns**: `**/*.md`, `docs/**`, `LICENSE`
- **Required Checks**: `lint`, `harness-smoke`
- **Merge Policy**: Self-merge allowed, no approvals required

### Tier 2 (Medium Risk) — Source Code
- **Patterns**: `src/**/*.ts`, `tests/**/*.ts`, `vitest.config.ts`
- **Required Checks**: `lint`, `type-check`, `test`, `build`, `harness-smoke`
- **Merge Policy**: 1 approval required, review agent recommended

### Tier 3 (High Risk) — Critical Paths
- **Patterns**: `src/index.ts`, `package.json`, `tsconfig.json`, `eslint.config.js`
- **Required Checks**: All Tier 2 checks + `structural-tests`, `manual-approval`
- **Merge Policy**: 2 approvals required, manual environment approval

## How It Works

1. **PR opened/updated** → Workflow triggers
2. **SHA discipline check** → Verifies commit hasn't changed since workflow started
3. **File classification** → Each changed file is classified into a tier
4. **Overall tier** → PR tier = maximum tier of any changed file
5. **Required checks** → Gate outputs JSON list of checks needed for this tier
6. **Conditional jobs** → Downstream jobs use `contains(fromJSON(...), 'check-name')` to run only if required
7. **PR summary** → Gate annotates PR with tier, SHA, and required checks

## Testing Locally

Both scripts can be run locally for testing:

```bash
# Shell version (no dependencies)
bash scripts/risk-policy-gate.sh

# TypeScript version (requires Node.js)
npx tsx scripts/risk-policy-gate.ts
```

In local mode (no `EXPECTED_SHA` set), SHA discipline is skipped and the script runs in dry-run mode.

## Environment Variables

The workflow sets these automatically, but you can override for testing:

- `EXPECTED_SHA`: PR head commit SHA (enforces SHA discipline)
- `BASE_REF`: Base branch name (default: `main`)
- `STRICTNESS`: `relaxed` | `standard` | `strict` (default: `relaxed`)
- `REVIEW_AGENT_STATUS`: Override review agent status (for remediation loops)

## Next Steps

### Required: Create Tier 3 Approval Environment

For Tier 3 PRs to work, you need to create a GitHub environment:

1. Go to your repo → Settings → Environments
2. Create environment named `tier3-approval`
3. Add required reviewers (maintainers who can approve critical changes)
4. Save

### Optional: Add Structural Tests

If you want Tier 3 to run structural tests, create `scripts/structural-tests.sh`:

```bash
#!/usr/bin/env bash
set -euo pipefail

echo "Running structural tests..."

# Example: Check that src/index.ts only exports public API
# Example: Validate no circular dependencies
# Example: Ensure critical files have required headers

echo "✔ All structural tests passed"
```

### Optional: Adjust Strictness

Edit the workflow to change strictness level:

```yaml
env:
  STRICTNESS: standard  # or 'strict' for docs drift enforcement
```

## Consistency Notes

- **Node.js version**: All jobs use Node 22 (consistent with your project)
- **Action SHAs**: All actions pinned to commit SHAs (security best practice)
- **TypeScript execution**: Uses `npx tsx` (ESM-compatible, not `ts-node`)
- **Structural tests**: Always run via `bash scripts/structural-tests.sh`, never `npm test`

## Validation Results

✅ Shell script tested locally — outputs valid JSON
✅ TypeScript script tested locally — outputs valid JSON  
✅ Workflow YAML validated — parses correctly
✅ All files are executable and ready to use

## Architecture

```
PR Event
   ↓
risk-gate job (runs scripts/risk-policy-gate.sh)
   ↓
Outputs: tier, required-checks JSON
   ↓
Downstream jobs (lint, test, build, etc.)
   ↓
Each job checks: if contains(required-checks, 'job-name')
   ↓
Only required jobs run
```

This ensures:
- No wasted CI time on unnecessary checks
- Higher scrutiny for riskier changes
- Clear visibility into why certain checks are required
- SHA discipline prevents race conditions

---

**Generated by Kiro CLI** — Harness Engineering Agent  
**Date**: 2026-02-22  
**Stack**: TypeScript, GitHub Actions, Vitest, ESLint
