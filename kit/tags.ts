/**
 * Standard tags. Every test must have @smoke or @regression (checked by `npm run trace:check`).
 *
 * @smoke      fast, critical-path checks. Run on every PR. Keep under ~5 minutes total.
 * @regression full suite. Run nightly and before release.
 * @critical   failure blocks release (used by the release quality gate).
 * @slow       long tests, excluded from PR runs.
 */
export const Tag = {
  smoke: '@smoke',
  regression: '@regression',
  critical: '@critical',
  slow: '@slow',
} as const;

export type TagValue = (typeof Tag)[keyof typeof Tag];
