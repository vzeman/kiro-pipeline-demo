## Agent-Generated PR

**Agent**: <!-- agent name and version (e.g., AWS Kiro v1.0, remediation-bot) -->
**Trigger**: <!-- what triggered this PR: review remediation, feature request, scheduled task -->
**Head SHA**: `<!-- exact commit SHA this PR was generated at -->`

## Summary
<!-- Auto-generated summary describing all changes. -->

## Risk Assessment

- **Detected Risk Tier**: <!-- auto-populated by risk-policy-gate -->
- **Critical paths touched**:
  <!-- List any files matching Tier 3 patterns from harness.config.json:
       src/index.ts, package.json, tsconfig.json, eslint.config.js -->
  -
- **Confidence level**: <!-- high / medium / low -->

## Changes Made
<!-- Complete list of every file modified. -->

| File | Change Type | Description |
|------|-------------|-------------|
| | added / modified / deleted | |

## Validation Results

| Check | Status | Command |
|-------|--------|---------|
| Lint | <!-- PASS / FAIL --> | `npm run lint` |
| Type Check | <!-- PASS / FAIL --> | `npm run typecheck` |
| Tests | <!-- PASS / FAIL --> | `npm test` |
| Build | <!-- PASS / FAIL --> | `npm run build` |

## Review Agent Status
- [ ] Review agent has analyzed this PR
- [ ] No unresolved blocking findings
- [ ] Review SHA matches current HEAD (`<!-- SHA -->`)
- **Verdict**: <!-- APPROVE / REQUEST_CHANGES / PENDING -->

## Human Review Required
<!-- Tier 3 changes require manual approval. -->
- [ ] Required — Tier 3 (high-risk) changes detected
- [ ] Optional but recommended — Tier 2 changes

## Remediation History
<!-- Only if this PR was created or updated by the remediation agent. Remove this section otherwise. -->
- **Original PR**: #<!-- number -->
- **Remediation attempt**: <!-- 1 / 2 / 3 -->
- **Findings fixed**: <!-- count -->
- **Findings skipped**: <!-- count, with brief reasons -->
- **Validation after fix**: <!-- all passed / partial — specify which failed -->
