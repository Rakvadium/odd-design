import { describe, expect, test } from "bun:test";
import { branchSlug, buildProof, formatEvent, type ProofInput } from "../.agents/skills/verify-odd-design/scripts/proof.ts";

const BUTTON = "stories/mirrored/Button.stories.ts";
const BUTTON_SOURCE = `import { mirrored } from "../mirror.ts";

const meta = { title: "Components/Button" };

export default meta;

const omitToken = { table: { disable: true } };

export const Playground = mirrored({
  scene: () => "playground",
});

export const Variants = mirrored({
  scene: () => "variants",
});
`;

const INDEX = {
  v: 5,
  entries: {
    "components-button--docs": { type: "docs", id: "components-button--docs", importPath: "./stories/mirrored/Button.stories.ts" },
    "components-button--playground": {
      type: "story",
      id: "components-button--playground",
      importPath: "./stories/mirrored/Button.stories.ts",
      exportName: "Playground",
    },
    "components-button--variants": {
      type: "story",
      id: "components-button--variants",
      importPath: "./stories/mirrored/Button.stories.ts",
      exportName: "Variants",
    },
    "components-chip--basic": { type: "story", id: "components-chip--basic", importPath: "./stories/mirrored/Chip.stories.ts", exportName: "Basic" },
    "components-chip--outline": { type: "story", id: "components-chip--outline", importPath: "./stories/mirrored/Chip.stories.ts", exportName: "Outline" },
  },
};

const VARIANTS_DIFF = `diff --git a/stories/mirrored/Button.stories.ts b/stories/mirrored/Button.stories.ts
index 1111111..2222222 100644
--- a/stories/mirrored/Button.stories.ts
+++ b/stories/mirrored/Button.stories.ts
@@ -14 +14 @@ export const Variants = mirrored({
-  scene: () => "old variants",
+  scene: () => "variants",
`;

const CSS_DIFF = `diff --git a/src/css/components/button.css b/src/css/components/button.css
index 3333333..4444444 100644
--- a/src/css/components/button.css
+++ b/src/css/components/button.css
@@ -12 +12 @@ .odd-button {
-  padding: 1px;
+  padding: 2px;
`;

const log = (...lines: string[]) => lines.map((l, i) => `[2026-10-31T10:00:${String(i).padStart(2, "0")}.000Z] ${l}`).join("\n");

const UP = `up {"storybook":"http://127.0.0.1:6100","head":"abc1234"}`;
const gotoVariants = (mode: string) =>
  `goto {"story":"components-button--variants","url":"http://127.0.0.1:6100/iframe.html?id=components-button--variants","html":{"chrome":"calm","palette":"default","mode":"${mode}"}}`;
const LIGHT = [
  gotoVariants("light"),
  `screenshot {"path":"variants/light-before.png","full":false,"scheme":"light"}`,
  `click {"target":".odd-button","text":"Save","tag":"<button class=odd-button>"}`,
  `screenshot {"path":"variants/light-after.png","full":false,"scheme":"light"}`,
  `eval {"js":"document.activeElement.textContent","result":"Save"}`,
];
const DARK = [
  gotoVariants("dark"),
  `screenshot {"path":"variants/dark-before.png","full":false,"scheme":"dark"}`,
  `press {"key":"Tab","focus":"<button class=odd-button>"}`,
  `screenshot {"path":"variants/dark-after.png","full":false,"scheme":"dark"}`,
  `state {"dialogs":[],"popovers":[],"focus":"<button class=odd-button>"}`,
];

const input = (over: Partial<ProofInput>): ProofInput => ({
  run: "fix-button",
  branch: "fix/button",
  head: "abc1234",
  base: "d21483c",
  transcript: "",
  diff: VARIANTS_DIFF,
  untracked: [],
  index: INDEX,
  source: (path) => (path === BUTTON ? BUTTON_SOURCE : undefined),
  changedSince: () => [],
  ...over,
});

const NO_GOTO_VARIANTS = ["MISSING components-button--variants light: no goto", "MISSING components-button--variants dark: no goto"];

describe("the verdict", () => {
  test("a story proven in light and dark passes, cites its four screenshots, and renders the table with mapped image links", () => {
    const proof = buildProof(input({ transcript: log(UP, ...LIGHT, ...DARK) }));
    expect(proof.ok).toBe(true);
    expect(proof.report).toEqual(["ok components-button--variants light dark"]);
    expect(proof.cited).toEqual(["variants/light-before.png", "variants/light-after.png", "variants/dark-before.png", "variants/dark-after.png"]);
    expect(proof.render((p) => `https://cdn.test/${p}`)).toBe(`## Verify proof: passed

Branch \`fix/button\` at \`abc1234\`, base \`d21483c\` (merge-base with \`origin/main\`), run \`fix-button\`. HTML Storybook in Chrome.

**Changed stories:** \`components-button--variants\`.

| Story | Theme | Action | Screenshot | Read |
| --- | --- | --- | --- | --- |
| \`components-button--variants\` | calm · default · light | click \`.odd-button\` with text \`Save\` | <img src="https://cdn.test/variants/light-before.png" width="280" alt="before"> <img src="https://cdn.test/variants/light-after.png" width="280" alt="after"> | eval \`document.activeElement.textContent\` → \`"Save"\` |
| \`components-button--variants\` | calm · default · dark | press \`Tab\` | <img src="https://cdn.test/variants/dark-before.png" width="280" alt="before"> <img src="https://cdn.test/variants/dark-after.png" width="280" alt="after"> | state: focus \`<button class=odd-button>\` |

Each row is one \`goto\`. The left image is before the first action, the right is after it, and the read was taken after the action.
`);
  });

  test("a dark segment with no read after the interaction fails, cites nothing, and lists the gap under Missing", () => {
    const proof = buildProof(input({ transcript: log(UP, ...LIGHT, ...DARK.slice(0, 4)) }));
    expect(proof.ok).toBe(false);
    expect(proof.report).toEqual(["MISSING components-button--variants dark: no read (eval, aria, or state) after an interaction"]);
    expect(proof.cited).toEqual([]);
    expect(proof.render((p) => p)).toContain(
      "## Verify proof: incomplete\n\nBranch `fix/button` at `abc1234`, base `d21483c` (merge-base with `origin/main`), run `fix-button`. HTML Storybook in Chrome.\n\n**Changed stories:** `components-button--variants`.\n\n**Missing:**\n- MISSING components-button--variants dark: no read (eval, aria, or state) after an interaction\n\n| Story |",
    );
  });

  test("focus is not an interaction, because no user calls el.focus()", () => {
    const focused = LIGHT.map((l) => l.replace("click {", "focus {"));
    const proof = buildProof(input({ transcript: log(UP, ...focused, ...DARK) }));
    expect(proof.ok).toBe(false);
    expect(proof.report).toEqual(["MISSING components-button--variants light: no interaction (click, hover, press, or type)"]);
  });

  test("a goto between the interaction and the after screenshot breaks the evidence, since the page reloaded", () => {
    const [goto, before, click, after, read] = LIGHT;
    const proof = buildProof(input({ transcript: log(UP, goto, before, click, goto, after, read, ...DARK) }));
    expect(proof.ok).toBe(false);
    expect(proof.report).toEqual(["MISSING components-button--variants light: no light screenshot after an interaction"]);
  });

  test("a mode:system segment whose screenshots measured dark proves dark, and the theme says so", () => {
    const system = [gotoVariants("system"), `emulate {"features":["prefers-color-scheme=dark"]}`, ...DARK.slice(1)];
    const proof = buildProof(input({ transcript: log(UP, ...LIGHT, ...system) }));
    expect(proof.ok).toBe(true);
    expect(proof.render((p) => p)).toContain("| `components-button--variants` | calm · default · system (dark) | press `Tab` |");
  });

  test("a mode:system segment whose screenshots measured light does not prove dark", () => {
    const system = [gotoVariants("system"), ...DARK.slice(1).map((l) => l.replace('"scheme":"dark"', '"scheme":"light"'))];
    const proof = buildProof(input({ transcript: log(UP, ...LIGHT, ...system) }));
    expect(proof.ok).toBe(false);
    expect(proof.report).toEqual(["MISSING components-button--variants dark: no dark screenshot before the first interaction"]);
  });

  test("only events after the last up count", () => {
    const proof = buildProof(input({ transcript: log(UP, ...LIGHT, ...DARK, UP) }));
    expect(proof.ok).toBe(false);
    expect(proof.report).toEqual(NO_GOTO_VARIANTS);
  });

  test("an unparsable line after the last up fails the proof, and the same line before it is history", () => {
    const prose = `[2026-10-31T09:00:00.000Z] eval document.title -> "Button"`;
    const after = buildProof(input({ transcript: `${log(UP, ...LIGHT, ...DARK)}\n${prose}` }));
    expect(after.ok).toBe(false);
    expect(after.report).toEqual([
      `BAD transcript line 12 after the last up does not parse: [2026-10-31T09:00:00.000Z] eval document.title -> "Button"`,
      "ok components-button--variants light dark",
    ]);
    expect(after.cited).toEqual([]);

    const before = buildProof(input({ transcript: `${prose}\n${log(UP, ...LIGHT, ...DARK)}` }));
    expect(before.ok).toBe(true);
  });

  test("a commit since the last up that touches a UI path makes the evidence stale; one that touches only docs does not", () => {
    const transcript = log(UP, ...LIGHT, ...DARK);
    const stale = buildProof(input({ head: "def5678", transcript, changedSince: (from) => (from === "abc1234" ? ["src/css/components/button.css", "docs/a.md"] : []) }));
    expect(stale.ok).toBe(false);
    expect(stale.cited).toEqual([]);
    expect(stale.report).toEqual([
      "STALE HEAD moved from abc1234 to def5678 since the last up, and those commits touch src/css/components/button.css; restart the run (ctl.ts down, ctl.ts up) and drive the stories again",
      "ok components-button--variants light dark",
    ]);

    const docsOnly = buildProof(input({ head: "def5678", transcript, changedSince: () => ["docs/a.md"] }));
    expect(docsOnly.ok).toBe(true);
  });
});

describe("which stories a change requires", () => {
  test("a change inside one export requires only that story", () => {
    expect(buildProof(input({})).report).toEqual(NO_GOTO_VARIANTS);
  });

  test("a change to a helper between exports requires every story in the file", () => {
    const diff = VARIANTS_DIFF.replace("@@ -14 +14 @@ export const Variants = mirrored({", "@@ -7 +7 @@");
    expect(buildProof(input({ diff })).report).toEqual([
      "MISSING components-button--playground light: no goto",
      "MISSING components-button--playground dark: no goto",
      ...NO_GOTO_VARIANTS,
    ]);
  });

  test("an untracked story file requires every story in it", () => {
    expect(buildProof(input({ diff: "", untracked: ["stories/mirrored/Chip.stories.ts", "notes.txt"] })).report).toEqual([
      "MISSING components-chip--basic light: no goto",
      "MISSING components-chip--basic dark: no goto",
      "MISSING components-chip--outline light: no goto",
      "MISSING components-chip--outline dark: no goto",
    ]);
  });

  test("a touched export with no row in the live index fails even when every indexed story is proven", () => {
    const source = `${BUTTON_SOURCE}
export const Sizes = mirrored({
  scene: () => "sizes",
});
`;
    const diff = `${VARIANTS_DIFF}@@ -16,0 +17,4 @@
+
+export const Sizes = mirrored({
+  scene: () => "sizes",
+});
`;
    const proof = buildProof(input({ diff, source: () => source, transcript: log(UP, ...LIGHT, ...DARK) }));
    expect(proof.ok).toBe(false);
    expect(proof.report).toEqual([
      "MISSING stories/mirrored/Button.stories.ts export Sizes: no row in the live index; the story failed to load or Storybook is stale",
      "ok components-button--variants light dark",
    ]);
  });

  test("a CSS-only change needs one story proven in both schemes and names the file", () => {
    const empty = buildProof(input({ diff: CSS_DIFF }));
    expect(empty.ok).toBe(false);
    expect(empty.report).toEqual([
      "MISSING one story proven in both light and dark that renders the changed files",
      "note src/css/components/button.css changed and no story maps to it; prove at least one story that renders it",
    ]);

    const proven = buildProof(input({ diff: CSS_DIFF, transcript: log(UP, ...LIGHT, ...DARK) }));
    expect(proven.ok).toBe(true);
    expect(proven.report).toEqual([
      "ok components-button--variants light dark",
      "note src/css/components/button.css changed and no story maps to it; prove at least one story that renders it",
    ]);
    expect(proven.render((p) => p)).toContain(
      "**Changed stories:** none. One story proven in both light and dark covers the files below.\n**Changed files no story maps to:** `src/css/components/button.css`.\n",
    );
  });

  test("a change outside src, stories, and .storybook passes with an empty transcript", () => {
    const diff = `diff --git a/README.md b/README.md
index 5555555..6666666 100644
--- a/README.md
+++ b/README.md
@@ -1 +1 @@
-old
+new
`;
    const proof = buildProof(input({ diff, untracked: ["tests/new.test.ts"] }));
    expect(proof.ok).toBe(true);
    expect(proof.report).toEqual(["ok nothing under src/, stories/, or .storybook/ changed; no proof needed"]);
  });
});

describe("the transcript format", () => {
  test("formatEvent writes the kind and the rest as JSON, and buildProof reads back what it wrote", () => {
    const at = new Date("2026-10-31T10:00:00.000Z");
    expect(formatEvent({ kind: "press", key: "Tab", focus: '<button class="odd-button">' }, at)).toBe(
      `[2026-10-31T10:00:00.000Z] press {"key":"Tab","focus":"<button class=\\"odd-button\\">"}`,
    );

    const transcript = [
      formatEvent({ kind: "up", storybook: "http://127.0.0.1:6100", head: "abc1234" }, at),
      ...(["light", "dark"] as const).flatMap((scheme) => [
        formatEvent({ kind: "goto", story: "components-button--variants", url: "http://x", html: { chrome: "calm", palette: "default", mode: scheme } }, at),
        formatEvent({ kind: "screenshot", path: `v/${scheme}-before.png`, full: true, scheme }, at),
        formatEvent({ kind: "hover", target: '[interestfor="tip"]', tag: '<button interestfor="tip">' }, at),
        formatEvent({ kind: "screenshot", path: `v/${scheme}-after.png`, full: false, scheme }, at),
        formatEvent({ kind: "eval", js: 'a -> b || "c"', result: { open: true } }, at),
      ]),
    ].join("\n");
    const proof = buildProof(input({ transcript }));
    expect(proof.report).toEqual(["ok components-button--variants light dark"]);
    expect(proof.render((p) => p)).toContain('| hover `[interestfor="tip"]` | <img src="v/dark-before.png" width="280" alt="before"> <img src="v/dark-after.png" width="280" alt="after"> | eval `a -> b \\|\\| "c"` → `{"open":true}` |');
  });

  test("branchSlug turns a branch into a run name", () => {
    expect(branchSlug("feat/encode-verify-screenshot-proof")).toBe("feat-encode-verify-screenshot-proof");
    expect(branchSlug("Fix/Button__States")).toBe("fix-button-states");
    expect(branchSlug("")).toBe("default");
  });
});
