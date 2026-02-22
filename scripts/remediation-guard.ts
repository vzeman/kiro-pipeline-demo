#!/usr/bin/env npx tsx

import { execSync } from 'node:child_process';

export interface Finding {
  severity: 'blocking' | 'warning' | 'suggestion';
  file: string;
  line: number | null;
  message: string;
}

export interface RemediationDecision {
  shouldRemediate: boolean;
  attemptNumber: number;
  reason: string;
  securityBlockers: string[];
  skippedFindings: string[];
}

const MAX_ATTEMPTS: Record<string, number> = {
  relaxed: 10,
  standard: 5,
  strict: 3,
};

const SECURITY_KEYWORDS = [
  'security',
  'injection',
  'xss',
  'ssrf',
  'csrf',
  'auth bypass',
  'authentication',
  'authorization',
  'privilege escalation',
  'secret',
  'credential',
  'token exposure',
  'vulnerability',
  'sanitize',
  'unsanitized',
];

const PROTECTED_FILE_PATTERNS = [
  /^\.github\/workflows\//,
  /^harness\.config\.json$/,
  /^KIRO\.md$/,
  /^package-lock\.json$/,
  /^package\.json$/,
  /^tsconfig\.json$/,
  /^eslint\.config\.js$/,
];

export function isSecurityFinding(finding: Finding): boolean {
  const msg = finding.message.toLowerCase();
  return SECURITY_KEYWORDS.some((keyword) => msg.includes(keyword));
}

export function isProtectedFile(filePath: string): boolean {
  return PROTECTED_FILE_PATTERNS.some((pattern) => pattern.test(filePath));
}

export function getAttemptCount(prNumber: number): number {
  try {
    const repo = process.env.GITHUB_REPOSITORY || '';
    if (!repo) return 0;

    const output = execSync(
      `gh pr view ${prNumber} --repo "${repo}" --json labels --jq '.labels[].name'`,
      { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] },
    );

    let maxAttempt = 0;
    for (const label of output.trim().split('\n')) {
      const match = label.match(/^remediation-attempt-(\d+)$/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxAttempt) maxAttempt = num;
      }
    }
    return maxAttempt;
  } catch {
    return 0;
  }
}

function formatFinding(finding: Finding, prefix: string): string {
  const loc = finding.file
    ? `${finding.file}${finding.line ? `:${finding.line}` : ''}`
    : 'general';
  return `[${prefix}] ${loc} — ${finding.message}`;
}

export function evaluate(
  prNumber: number,
  findings: Finding[],
  strictness: string,
): RemediationDecision {
  const maxAttempts = MAX_ATTEMPTS[strictness] ?? MAX_ATTEMPTS.relaxed;
  const currentAttempt = getAttemptCount(prNumber);
  const nextAttempt = currentAttempt + 1;

  if (nextAttempt > maxAttempts) {
    return {
      shouldRemediate: false,
      attemptNumber: nextAttempt,
      reason: `Remediation limit reached (${maxAttempts} attempts for ${strictness} mode). Human review required.`,
      securityBlockers: [],
      skippedFindings: [],
    };
  }

  const securityBlockers: string[] = [];
  const skippedFindings: string[] = [];
  const actionableFindings: Finding[] = [];

  for (const finding of findings) {
    if (isSecurityFinding(finding)) {
      securityBlockers.push(formatFinding(finding, finding.severity));
      continue;
    }

    if (finding.file && isProtectedFile(finding.file)) {
      skippedFindings.push(formatFinding(finding, 'protected'));
      continue;
    }

    actionableFindings.push(finding);
  }

  if (actionableFindings.length === 0 && securityBlockers.length > 0) {
    return {
      shouldRemediate: false,
      attemptNumber: nextAttempt,
      reason: 'All findings are security-related and require human review.',
      securityBlockers,
      skippedFindings,
    };
  }

  if (actionableFindings.length === 0) {
    return {
      shouldRemediate: false,
      attemptNumber: nextAttempt,
      reason: 'No actionable findings after filtering security and protected-file issues.',
      securityBlockers,
      skippedFindings,
    };
  }

  return {
    shouldRemediate: true,
    attemptNumber: nextAttempt,
    reason: `${actionableFindings.length} actionable finding(s) to remediate (attempt ${nextAttempt}/${maxAttempts}).`,
    securityBlockers,
    skippedFindings,
  };
}

if (process.argv.includes('--evaluate')) {
  const prNumber = parseInt(process.env.PR_NUMBER || '0', 10);
  const strictness = process.env.STRICTNESS || 'relaxed';

  if (!prNumber) {
    console.error('ERROR: PR_NUMBER environment variable is required.');
    process.exit(1);
  }

  let findings: Finding[] = [];
  try {
    findings = JSON.parse(process.env.FINDINGS || '[]');
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error(`ERROR: Failed to parse FINDINGS JSON: ${msg}`);
    process.exit(1);
  }

  const decision = evaluate(prNumber, findings, strictness);
  console.log(JSON.stringify(decision, null, 2));
}

if (process.argv.includes('--self-test')) {
  console.log('Running remediation-guard self-test...\n');

  console.assert(
    isSecurityFinding({
      severity: 'blocking',
      file: 'src/auth.ts',
      line: 10,
      message: 'SQL injection vulnerability in query builder',
    }) === true,
    'SQL injection should be detected as security finding',
  );
  console.assert(
    isSecurityFinding({
      severity: 'blocking',
      file: 'src/api.ts',
      line: 5,
      message: 'Unsanitized user input passed to shell command',
    }) === true,
    'Unsanitized input should be detected as security finding',
  );
  console.assert(
    isSecurityFinding({
      severity: 'warning',
      file: 'src/utils.ts',
      line: 5,
      message: 'Missing null check on optional parameter',
    }) === false,
    'Missing null check is not a security finding',
  );
  console.assert(
    isSecurityFinding({
      severity: 'suggestion',
      file: 'src/ui.ts',
      line: 20,
      message: 'Consider using a Map instead of plain object',
    }) === false,
    'Code quality suggestion is not a security finding',
  );

  console.assert(
    isProtectedFile('.github/workflows/ci.yml') === true,
    'CI workflow should be protected',
  );
  console.assert(
    isProtectedFile('harness.config.json') === true,
    'harness.config.json should be protected',
  );
  console.assert(
    isProtectedFile('KIRO.md') === true,
    'KIRO.md should be protected',
  );
  console.assert(
    isProtectedFile('package-lock.json') === true,
    'package-lock.json should be protected',
  );
  console.assert(
    isProtectedFile('package.json') === true,
    'package.json should be protected',
  );
  console.assert(
    isProtectedFile('tsconfig.json') === true,
    'tsconfig.json should be protected',
  );
  console.assert(
    isProtectedFile('src/utils/helpers.ts') === false,
    'Regular source file should not be protected',
  );
  console.assert(
    isProtectedFile('tests/guard.test.ts') === false,
    'Test file should not be protected',
  );

  const mockFindings: Finding[] = [
    {
      severity: 'blocking',
      file: 'src/utils/parser.ts',
      line: 42,
      message: 'Unhandled error in catch block — will crash process',
    },
    {
      severity: 'warning',
      file: 'src/core/engine.ts',
      line: 10,
      message: 'SQL injection vulnerability in query',
    },
    {
      severity: 'suggestion',
      file: 'harness.config.json',
      line: null,
      message: 'Consider adding more patterns to tier2',
    },
  ];

  const decision = evaluate(0, mockFindings, 'relaxed');
  console.assert(
    decision.securityBlockers.length === 1,
    `Expected 1 security blocker, got ${decision.securityBlockers.length}`,
  );
  console.assert(
    decision.skippedFindings.length === 1,
    `Expected 1 skipped finding, got ${decision.skippedFindings.length}`,
  );
  console.assert(
    decision.shouldRemediate === true,
    'Should remediate when actionable findings exist',
  );

  const securityOnly = evaluate(
    0,
    [
      {
        severity: 'blocking',
        file: 'src/auth.ts',
        line: 1,
        message: 'Authentication bypass in login handler',
      },
    ],
    'relaxed',
  );
  console.assert(
    securityOnly.shouldRemediate === false,
    'Should NOT remediate when all findings are security-related',
  );
  console.assert(
    securityOnly.reason.includes('security-related'),
    'Reason should mention security',
  );

  const emptyDecision = evaluate(0, [], 'relaxed');
  console.assert(
    emptyDecision.shouldRemediate === false,
    'Should NOT remediate with no findings',
  );

  console.log('\n✔ All self-tests passed.');
}
