// The one accessibility rule set for this repo. The Storybook a11y addon reads it through
// parameters.a11y in preview.ts, and the verify harness's `axe` sweep imports it directly,
// so the panel and the sweep always apply the same rules. No custom rules: stock axe-core only.

/**
 * WCAG 2.0, 2.1, and 2.2 at levels A and AA. axe-core has no `wcag22a` tag (2.2 added no level-A
 * rule it tests). Listing tags replaces axe's default selection, so its best-practice rules don't run.
 * The rules these tags resolve to are recorded in a11y-rules.txt; the sweep fails if that list changes.
 */
export const A11Y_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

/** axe.run options, passed as parameters.a11y.options. */
export const A11Y_OPTIONS = { runOnly: { type: "tag", values: A11Y_TAGS } } as const;

/**
 * Storybook's own UI, which isn't part of any story. The addon skips these itself; the sweep
 * skips the same ones, so both check the same part of the page.
 */
export const A11Y_EXCLUDE = [".sb-wrapper", "#storybook-docs", "#storybook-highlights-root"];
