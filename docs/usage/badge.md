# Badge usage rules

These codes apply to `odd-badge`. Shared codes are in [General usage rules](general.md).

```html
<span class="odd-badge">Draft</span>
<span class="odd-badge" data-tone="success">Legal</span>
<span class="odd-badge" data-tone="danger" data-solid>Banned</span>
```

A badge is a short label. `data-tone` sets its color, and `data-solid` fills it with that color. The badge holds no state and takes no focus, so it needs no script and no ARIA.

## ODD-BADGE-001

Fails when `odd-badge` is not on a `span`.

A badge sits inside a sentence, a heading, or a button. Those take phrasing content only. A `div` inside a `p` ends the paragraph early, and a `div` inside a `button` or a heading is invalid HTML.

Move `odd-badge` onto a `span`.

## ODD-BADGE-002

Fails when `data-tone` is not `neutral`, `primary`, `success`, `warning`, `danger`, or `info`.

`badge.css` colors only these six tones. Any other value renders a soft badge in the neutral color, so a misspelled `danger` looks like a working badge in the wrong color. A solid badge with any other value puts `--foreground` text on a `--muted-foreground` fill, a pair the palette test does not check. `neutral` looks the same as no `data-tone`. Use it when the tone comes from data that has a neutral case.

Set one of the six tones, or remove `data-tone` for a neutral badge.

## ODD-BADGE-003

Fails when `data-solid` has a value other than empty or `true`.

`badge.css` matches `[data-solid]`, which reads only whether the attribute is present. So `data-solid="false"` renders a solid badge. In JSX, `data-solid={false}` renders `data-solid="false"`.

Remove `data-solid` for a soft badge. Write `data-solid` with no value, or `data-solid="true"`, for a solid one. In React, pass `solid` to `Badge`.

## ODD-BADGE-004

Fails when `odd-badge` has a system `data-` attribute it does not take.

A badge has no `data-variant` and no `data-size`. Those belong to `odd-button` and other components, and `badge.css` ignores them. An app `data-` attribute passes. The appearance axes and the headless allowlist pass. A misspelled badge attribute, such as `data-tnoe`, is reported with a suggested spelling.

Remove the attribute, or correct its name. The badge takes `data-tone` and `data-solid`.
