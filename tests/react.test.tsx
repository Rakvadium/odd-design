import { afterEach, describe, expect, test } from "bun:test";
import { fileURLToPath } from "node:url";
import { act, type ReactElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { checkRoot } from "../src/js/usage/dom.ts";
import { Alert, AlertTitle } from "../src/react/alert.tsx";
import { Badge } from "../src/react/badge.tsx";
import { Button } from "../src/react/button.tsx";
import { Choice, Segmented, Switch } from "../src/react/choice.tsx";
import { Field, FieldError, Hint, Input, Label, Select, Textarea } from "../src/react/field.tsx";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

const repo = fileURLToPath(new URL("..", import.meta.url));

const markup: readonly [string, ReactElement, string][] = [
  ["no props", <Button>Save</Button>, '<button type="button" class="odd-button">Save</button>'],
  [
    "variant and size",
    <Button variant="primary" size="sm">
      Save
    </Button>,
    '<button type="button" class="odd-button" data-variant="primary" data-size="sm">Save</button>',
  ],
  [
    "submit with aria-disabled",
    <Button type="submit" aria-disabled="true" aria-busy="true">
      Pay
    </Button>,
    '<button type="submit" aria-disabled="true" aria-busy="true" class="odd-button">Pay</button>',
  ],
  [
    "className",
    <Button className="wide" variant="ghost">
      Reset
    </Button>,
    '<button type="button" class="odd-button wide" data-variant="ghost">Reset</button>',
  ],
  [
    "link",
    <Button href="/docs" aria-current="page" variant="secondary">
      Docs
    </Button>,
    '<a href="/docs" aria-current="page" class="odd-button" data-variant="secondary">Docs</a>',
  ],
  [
    "icon-only",
    <Button iconOnly aria-label="Close" size="lg">
      <svg aria-hidden="true" />
    </Button>,
    '<button aria-label="Close" type="button" class="odd-button" data-size="lg" data-icon-only=""><svg aria-hidden="true"></svg></button>',
  ],
  [
    "invoker commands",
    <Button command="show-modal" commandfor="settings" interestfor="hint">
      Settings
    </Button>,
    '<button command="show-modal" commandfor="settings" interestfor="hint" type="button" class="odd-button">Settings</button>',
  ],
  [
    "headless and app data attributes",
    <Button data-state="open" data-chrome="bubblegum" data-testid="menu">
      Menu
    </Button>,
    '<button data-state="open" data-chrome="bubblegum" data-testid="menu" type="button" class="odd-button">Menu</button>',
  ],
  [
    "field with an error",
    <Field>
      <Label htmlFor="email">Email</Label>
      <Input id="email" type="email" required aria-invalid="true" aria-describedby="email-hint email-error" />
      <Hint id="email-hint">We never share it.</Hint>
      <FieldError id="email-error">Enter an email address.</FieldError>
    </Field>,
    '<div class="odd-field"><label for="email" class="odd-label">Email</label><input id="email" type="email" required="" aria-invalid="true" aria-describedby="email-hint email-error" class="odd-input"/><p id="email-hint" class="odd-hint">We never share it.</p><p id="email-error" class="odd-error">Enter an email address.</p></div>',
  ],
  [
    "disabled textarea and select with className",
    <>
      <Textarea id="notes" disabled />
      <Select id="format" className="wide">
        <option>Standard</option>
      </Select>
    </>,
    '<textarea id="notes" disabled="" class="odd-textarea"></textarea><select id="format" class="odd-select wide"><option>Standard</option></select>',
  ],
  [
    "choice, switch, and segmented",
    <>
      <Choice>
        <input type="checkbox" defaultChecked /> Weekly digest
      </Choice>
      <Choice className="wide">
        <Switch type="checkbox" role="switch" disabled /> Compact grid
      </Choice>
      <Segmented>
        <legend>View</legend>
        <label>
          <input type="radio" name="view" defaultChecked /> Grid
        </label>
      </Segmented>
    </>,
    '<label class="odd-choice"><input type="checkbox" checked=""/> Weekly digest</label><label class="odd-choice wide"><input type="checkbox" role="switch" disabled="" class="odd-switch"/> Compact grid</label><fieldset class="odd-segmented"><legend>View</legend><label><input type="radio" name="view" checked=""/> Grid</label></fieldset>',
  ],
  [
    "badge tones and solid",
    <>
      <Badge>Draft</Badge>
      <Badge tone="danger" solid className="wide">
        Banned
      </Badge>
      <Badge tone="success" solid={false} data-testid="status">
        Legal
      </Badge>
    </>,
    '<span class="odd-badge">Draft</span><span class="odd-badge wide" data-tone="danger" data-solid="">Banned</span><span data-testid="status" class="odd-badge" data-tone="success">Legal</span>',
  ],
  [
    "alert tone and title",
    <>
      <Alert>
        <AlertTitle>Drafts are private</AlertTitle>
      </Alert>
      <Alert tone="warning" className="wide">
        Rotation is coming
      </Alert>
      <Alert tone="danger" data-testid="notice">
        <AlertTitle>Could not save</AlertTitle>
      </Alert>
    </>,
    '<div class="odd-alert"><p class="odd-alert-title">Drafts are private</p></div><div class="odd-alert wide" data-tone="warning">Rotation is coming</div><div data-testid="notice" class="odd-alert" data-tone="danger"><p class="odd-alert-title">Could not save</p></div>',
  ],
];

describe("React markup", () => {
  test.each(markup)("%s renders markup the runtime checker accepts", (_name, element, expected) => {
    const html = renderToStaticMarkup(element);
    expect(html).toBe(expected);
    const host = document.createElement("div");
    host.innerHTML = html;
    expect(() => checkRoot(host)).not.toThrow();
  });
});

let mounted: Root | undefined;

afterEach(async () => {
  const root = mounted;
  mounted = undefined;
  if (root !== undefined) await act(async () => root.unmount());
  document.body.replaceChildren();
});

async function mountForm(ariaDisabled: "true" | "false" | undefined) {
  const counts = { clicks: 0, submits: 0 };
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  mounted = root;
  await act(async () =>
    root.render(
      <form
        onSubmit={(event) => {
          event.preventDefault();
          counts.submits += 1;
        }}
      >
        <input name="card" />
        <Button type="submit" aria-disabled={ariaDisabled} onClick={() => (counts.clicks += 1)}>
          Pay
        </Button>
      </form>,
    ),
  );
  const button = host.querySelector("button");
  const field = host.querySelector("input");
  if (button === null || field === null) throw new Error("the form did not render");
  return { counts, button, field };
}

function pressEnter(field: HTMLInputElement): void {
  if (!field.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true }))) return;
  // happy-dom has no implicit submission. The HTML spec fires a click at the form's default button.
  field.form?.querySelector('[type="submit"]')?.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
}

describe("Button with aria-disabled", () => {
  test("ignores a click and an Enter, and never sets disabled", async () => {
    const { counts, button, field } = await mountForm("true");
    await act(async () => button.click());
    await act(async () => pressEnter(field));
    expect(counts).toEqual({ clicks: 0, submits: 0 });
    expect(button.disabled).toBe(false);
    expect(button.hasAttribute("disabled")).toBe(false);
  });

  test.each([[undefined], ["false" as const]])("with aria-disabled %p submits once per click and once per Enter", async (ariaDisabled) => {
    const { counts, button, field } = await mountForm(ariaDisabled);
    await act(async () => button.click());
    expect(counts).toEqual({ clicks: 1, submits: 1 });
    await act(async () => pressEnter(field));
    expect(counts).toEqual({ clicks: 2, submits: 2 });
  });
});

function tsc(project: string): { exit: number; output: string } {
  const result = Bun.spawnSync([process.execPath, "x", "tsc", "-p", project], { cwd: repo });
  return { exit: result.exitCode, output: `${result.stdout.toString()}${result.stderr.toString()}` };
}

function errorsByFixture(output: string): Map<string, string> {
  const blocks = new Map<string, string>();
  let current: string | undefined;
  for (const line of output.split(/\r?\n/)) {
    const header = /^tests\/fixtures\/types\/fail\/([\w-]+)\.tsx\(/.exec(line);
    if (header?.[1] !== undefined) current = header[1];
    if (current !== undefined && line !== "") blocks.set(current, `${blocks.get(current) ?? ""}${line}\n`);
  }
  return blocks;
}

const failures: Record<string, { codes: string[]; text: string[] }> = {
  "button-disabled": { codes: ["ODD-BUTTON-007"], text: [] },
  "button-variant": { codes: [], text: ['"primary"', '"secondary"', '"danger"', '"ghost"'] },
  "button-size": { codes: [], text: ['"sm"', '"lg"'] },
  "button-link-aria-disabled": { codes: ["ODD-BUTTON-013"], text: [] },
  "button-icon-only": { codes: ["ODD-BUTTON-008"], text: [] },
  "button-data-tone": { codes: ["ODD-BUTTON-015"], text: [] },
  "button-aria-current-value": { codes: [], text: ['"page"'] },
  "button-aria-current-button": { codes: ["ODD-BUTTON-012"], text: [] },
  "button-aria-current-icon-only": { codes: ["ODD-BUTTON-012"], text: [] },
  "button-raw-data-variant": { codes: [], text: ['"data-variant"'] },
  "field-error-hidden": { codes: ["ODD-FIELD-002"], text: [] },
  "input-aria-disabled": { codes: ["ODD-FIELD-003"], text: [] },
  "choice-aria-disabled": { codes: ["ODD-CHOICE-003"], text: [] },
  "switch-aria-disabled": { codes: ["ODD-CHOICE-003"], text: [] },
  "switch-type": { codes: [], text: ['"checkbox"', '"switch"'] },
  "badge-tone": { codes: [], text: ['"neutral"', '"primary"', '"success"', '"warning"', '"danger"', '"info"'] },
  "badge-data-variant": { codes: ["ODD-BADGE-004"], text: [] },
  "alert-tone": { codes: [], text: ['"info"', '"success"', '"warning"', '"danger"'] },
  "alert-role": { codes: ["ODD-ALERT-003"], text: [] },
  "alert-aria-live": { codes: ["ODD-ALERT-003"], text: [] },
  "alert-data-variant": { codes: ["ODD-ALERT-004"], text: [] },
  "alert-title-data-tone": { codes: ["ODD-ALERT-005"], text: [] },
};

describe("React types", () => {
  test(
    "each fail fixture prints its own code and no other",
    () => {
      const { exit, output } = tsc("tests/fixtures/types/fail");
      expect(exit).not.toBe(0);
      const blocks = errorsByFixture(output);
      expect([...blocks.keys()].sort()).toEqual(Object.keys(failures).sort());
      for (const [fixture, { codes, text }] of Object.entries(failures)) {
        const block = blocks.get(fixture) ?? "";
        expect({ fixture, codes: [...new Set(block.match(/ODD-[A-Z]+-\d{3}/g))] }).toEqual({ fixture, codes });
        for (const part of text) expect({ fixture, found: block.includes(part) }).toEqual({ fixture, found: true });
      }
    },
    { timeout: 60_000 },
  );

  test(
    "the pass fixture compiles with no output",
    () => {
      expect(tsc("tests/fixtures/types/pass")).toEqual({ exit: 0, output: "" });
    },
    { timeout: 60_000 },
  );
});
