#!/usr/bin/env npx tsx
// ============================================================================
// Issue Implementer Guard — pre-flight gate for automated implementation
//
// Usage:
//   ISSUE_JSON='{"number":1,...}' npx tsx scripts/issue-implementer-guard.ts --evaluate
//   npx tsx scripts/issue-implementer-guard.ts --self-test
// ============================================================================

import { execSync } from 'node:child_process';

export interface ImplementerDecision {
  shouldImplement: boolean;
  issueNumber: number;
  issueTitle: string;
  branchName: string;
  reason: string;
  existingPR: number | null;
  blockedLabels: string[];
}

interface IssuePayload {
  number: number;
  title: string;
  body: string | null;
  pull_request?: unknown;
  user: { login: string };
  labels: Array<{ name: string }>;
}

const TRIGGER_LABEL = 'agent:implement';
const BLOCKING_LABELS = ['agent:skip', 'wontfix', 'duplicate', 'invalid'];
const PR_MARKER_PREFIX = '<!-- issue-implementer:';

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
}

export function deriveBranchName(issueNumber: number, issueTitle: string): string {
  const slug = slugify(issueTitle);
  return `cf/${slug}-${issueNumber}`;
}

export function findExistingPR(issueNumber: number): number | null {
  try {
    const repo = process.env.GITHUB_REPOSITORY || '';
    if (!repo) return null;
    const output = execSync(
      `gh issue view ${issueNumber} --repo "${repo}" --json comments --jq '.comments[].body'`,
      { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] },
    );
    for (const line of output.split('\n')) {
      if (line.includes(PR_MARKER_PREFIX)) {
        const match = line.match(/PR #(\d+)/);
        if (match) return parseInt(match[1], 10);
      }
    }
    return null;
  } catch {
    return null;
  }
}

export function evaluate(issue: IssuePayload, skipPRCheck = false): ImplementerDecision {
  const labelNames = issue.labels.map((l) => l.name);
  const base = {
    issueNumber: issue.number,
    issueTitle: issue.title,
    branchName: deriveBranchName(issue.number, issue.title),
  };

  if (issue.pull_request) {
    return {
      ...base,
      shouldImplement: false,
      reason: 'Pull request — not an issue.',
      existingPR: null,
      blockedLabels: [],
    };
  }

  if (!labelNames.includes(TRIGGER_LABEL)) {
    return {
      ...base,
      shouldImplement: false,
      reason: `Missing required label '${TRIGGER_LABEL}'.`,
      existingPR: null,
      blockedLabels: [],
    };
  }

  const blocked = labelNames.filter((l) => BLOCKING_LABELS.includes(l));
  if (blocked.length > 0) {
    return {
      ...base,
      shouldImplement: false,
      reason: `Blocked by label(s): ${blocked.join(', ')}.`,
      existingPR: null,
      blockedLabels: blocked,
    };
  }

  if (!skipPRCheck) {
    const existingPR = findExistingPR(issue.number);
    if (existingPR) {
      return {
        ...base,
        shouldImplement: false,
        reason: `A PR already exists for this issue: #${existingPR}.`,
        existingPR,
        blockedLabels: [],
      };
    }
  }

  return {
    ...base,
    shouldImplement: true,
    reason: 'Issue approved for implementation.',
    existingPR: null,
    blockedLabels: [],
  };
}

if (process.argv.includes('--evaluate')) {
  let issue: IssuePayload;
  try {
    issue = JSON.parse(process.env.ISSUE_JSON || '{}');
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error(`ERROR: Failed to parse ISSUE_JSON: ${msg}`);
    process.exit(1);
  }
  if (!issue.number) {
    console.error('ERROR: ISSUE_JSON must contain a valid issue number.');
    process.exit(1);
  }
  const decision = evaluate(issue);
  console.log(JSON.stringify(decision, null, 2));
}

if (process.argv.includes('--self-test')) {
  console.log('Running issue-implementer-guard self-test...\n');

  // slugify
  console.assert(slugify('Add dark mode') === 'add-dark-mode', 'Should slugify title');
  console.assert(slugify('Fix: login! @bug#') === 'fix-login-bug', 'Should remove special chars');

  // deriveBranchName
  console.assert(deriveBranchName(42, 'Add dark mode') === 'cf/add-dark-mode-42', 'Should derive branch name');

  // evaluate — missing label
  const noLabel = evaluate(
    { number: 1, title: 'Feature', body: 'Details', user: { login: 'user' }, labels: [{ name: 'bug' }] },
    true,
  );
  console.assert(noLabel.shouldImplement === false, 'Should not implement without agent:implement label');

  // evaluate — ready
  const ready = evaluate(
    { number: 10, title: 'Add dark mode', body: 'Implement dark mode', user: { login: 'user' }, labels: [{ name: 'agent:implement' }, { name: 'enhancement' }] },
    true,
  );
  console.assert(ready.shouldImplement === true, 'Should implement with agent:implement label');
  console.assert(ready.branchName === 'cf/add-dark-mode-10', 'Branch name should match');

  // evaluate — blocked
  const blocked = evaluate(
    { number: 2, title: 'Something', body: null, user: { login: 'user' }, labels: [{ name: 'agent:implement' }, { name: 'wontfix' }] },
    true,
  );
  console.assert(blocked.shouldImplement === false, 'Should not implement with blocking label');
  console.assert(blocked.blockedLabels.includes('wontfix'), 'Should report wontfix as blocked');

  // evaluate — PR
  const pr = evaluate(
    { number: 3, title: 'PR title', body: null, pull_request: { url: 'https://...' }, user: { login: 'user' }, labels: [{ name: 'agent:implement' }] },
    true,
  );
  console.assert(pr.shouldImplement === false, 'PR should be skipped');

  console.log('\n✔ All self-tests passed.');
}
