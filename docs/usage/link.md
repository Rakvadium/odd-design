# Link usage rules

These codes apply to `odd-link`. Shared codes are in [General usage rules](general.md).

In React, render `TextLink` from `odd-design/react`. It renders the `a` through the router link that `OddProvider` supplies, and writes `aria-current`, `target`, `rel`, and the tooltip from props, so the codes below cannot happen. [Link to a page](react.md#link-to-a-page) covers the props.

```tsx
<p>Read the <TextLink href="/guide">setup guide</TextLink> first.</p>
<TextLink href="/projects" current>Projects</TextLink>
<TextLink href="https://example.com/changelog" newTab tooltip="What changed this week" id="changelog">Changelog</TextLink>
```

The components compile to this HTML:

```html
<p>Read the <a href="/guide" class="odd-link">setup guide</a> first.</p>
<a href="/projects" aria-current="page" class="odd-link">Projects</a>
<a id="changelog" href="https://example.com/changelog" aria-describedby="changelog-tooltip" interestfor="changelog-tooltip" target="_blank" rel="noopener" class="odd-link">Changelog<span class="odd-visually-hidden"> (opens in a new tab)</span></a>
<span class="odd-tooltip" id="changelog-tooltip" popover="hint" role="tooltip">What changed this week</span>
```

A text link is an `a` with an `href`. It looks like every bare `a`, because `base.css` draws the color, the underline, and the hover. The class lets the checkers see the link and draws the current page. `aria-current="page"` marks the link to the page you are on. That link takes the text color and drops the underline, so it differs from the other links by two cues, not by color alone. In React, `current` on `TextLink` writes `aria-current="page"`.

A link that looks like a button is `<a class="odd-button" href>`, and an icon-only link is a Button with `data-icon-only` and an `aria-label`. A card that is one big link uses `odd-card-link`. A link that can't be followed is plain text.

## ODD-LINK-001

Fails when `odd-link` is not on an `a`.

A `span` with the class is plain text. The accessibility tree reads it as part of the paragraph, and Tab skips it. A `button` with the class is a button, which acts on the page instead of going somewhere. `link.css` draws the current page only on an anchor.

Move the class onto an `a` with an `href`. A control that acts on the page is a button with `odd-button`. In React, `TextLink` renders an `a`.

## ODD-LINK-002

Fails when an `a` with `odd-link` has no `href`.

An anchor without an `href` is not a link. The tree reads it as text, and Tab skips it, yet `base.css` still paints it in the link color, so it looks clickable and can't be reached. `href=""` passes the checker, as an empty value passes every required attribute, and it links to the page it is on.

Add the `href` of the page it goes to. Text that goes nowhere is plain text without `odd-link`. In React, `href` is a required prop.

## ODD-LINK-003

Fails when `odd-link` has `aria-disabled` or `disabled`.

`aria-disabled="true"` on a link is announced as disabled, yet a click and Enter both follow it, in Firefox and WebKit. `disabled` is not an attribute of `a`, so the link works and nothing says otherwise. The tree says one thing while the link does another.

Remove `aria-disabled` and `disabled`. A link that can't be followed is plain text without `odd-link` and without an `href`. In React, either attribute on `TextLink` is a type error that prints this code.

## ODD-LINK-004

Fails when `odd-link` has a `role`.

`role="button"` is announced as a button, but Space does nothing on a link, and only Enter follows it, in Firefox and WebKit. A keyboard user follows the role's promise and nothing happens. `role="menuitem"` and other roles break the same way.

Remove `role`. A control that acts on the page is a button with `odd-button`, and a link that looks like a button is an `a` with `odd-button`. In React, `role` on `TextLink` is a type error (`ODD-REACT-001`).

## ODD-LINK-005

Fails when `aria-current` is not `page`.

`link.css` draws the current page only for `aria-current="page"`. `aria-current="true"` or `location` keeps the resting color and underline, so the link to the page you are on looks like every other link. This matches ODD-BUTTON-011.

Set `aria-current="page"` on the link to the page you are on, or remove it. In React, pass `current`, and `aria-current` on `TextLink` is a type error (`ODD-REACT-001`).

## ODD-LINK-006

Fails when `odd-link` has a system `data-` attribute.

A link has one look, and `link.css` reads no `data-` attribute. `data-variant="ghost"` copied from a Button draws the same link. An app `data-` attribute, the appearance axes, and the headless allowlist pass.

Remove the attribute. A link that looks like a button is an `a` with `odd-button`, and an icon-only link is a Button with `data-icon-only` and an `aria-label`. In React, a system `data-` attribute such as `data-variant` on `TextLink` is a type error (`ODD-REACT-002`).

## ODD-LINK-007

Fails when `odd-link` has a `target` and no `rel`.

A link with `target="_blank"` opens a new tab. Without `rel="noopener"`, older browsers hand the new page a handle on this one. A reader who follows the link also lands in a new tab with no warning, where the Back button does nothing.

Add `rel="noopener"` beside `target`, and put words in the link text that say it opens a new tab, such as "(opens in a new tab)". The checker reads only `rel`, so the words are yours to add. Or remove `target`, so the link opens in the same tab. The React types do not check this pair, so in a React app the runtime checker reports it.
