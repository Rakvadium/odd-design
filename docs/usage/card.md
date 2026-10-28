# Card usage rules

These codes apply to `odd-card`, `odd-card-title`, `odd-card-link`, and `odd-card-footer`. Shared codes are in [General usage rules](general.md).

```html
<article class="odd-card" data-interactive>
  <p class="odd-eyebrow">Interactive</p>
  <h3 class="odd-card-title"><a class="odd-card-link" href="/decks/ember">Ember Aggro</a></h3>
  <p class="odd-muted">The whole card is clickable. Screen readers hear a single link.</p>
  <div class="odd-card-footer"><span class="odd-badge" data-tone="warning">Rotating soon</span></div>
</article>
```

A card is an `article` for a standalone item, a `section` with `aria-labelledby` for a named panel, or a `div`. Its title is a heading at the level the page outline needs. A clickable card has `data-interactive` and exactly one control, an `a.odd-card-link` with an `href` or a `button.odd-card-link`, inside the title. The link's `::after` stretches over the card, so the whole card clicks through one link whose name is the title. In React, `Card` renders the `article` and `interactive` sets `data-interactive`. `CardLink` renders the `a`, and `CardFooter` renders the footer `div`. Write the title heading yourself, as `<h3 className="odd-card-title">`.

## ODD-CARD-001

Fails when a card class is on the wrong element. `odd-card` belongs on `article`, `section`, or `div`. `odd-card-title` belongs on `h1` to `h6`. `odd-card-link` belongs on `a` or `button`. `odd-card-footer` belongs on `div`.

Screen reader users move between cards by heading, so a title in a `p` or `div` hides the card from that list. A card on an `a` or `button` makes the whole card one control, and its name becomes every word in it.

Move the class onto its element. In React, use `Card`, `CardLink`, and `CardFooter`, and write the title heading yourself.

## ODD-CARD-002

Fails when `data-interactive` is not empty or `true`.

`card.css` reads only the presence of `data-interactive`, so `data-interactive="false"` still makes the card interactive. The checker then skips ODD-CARD-003 on that card, so this is the one code it reports.

Remove the attribute for a static card. In React, `interactive={false}` renders nothing.

## ODD-CARD-003

Fails when a card has `data-interactive` and does not hold exactly one link or button, its `odd-card-link`. Also fails when a card without `data-interactive` holds an `odd-card-link`.

The stretch and the focus ring both need the pair. Without `data-interactive`, the link does not stretch, looks like plain text, and loses its focus outline, because `card.css` moves the ring onto the interactive card. With `data-interactive` and no card link, only the hover shadow changes, and the card does not click. A second link or button in an interactive card sits under the stretched link and does not take a click. Put that action outside the card, or make the card static.

The checker stops at a nested card, so an inner card's link does not count for the outer one. When part of a card's content comes from a component or an expression, the checker cannot see inside it. A missing link then stays silent. A second control, or a link or button that is not the card link, still fails. A spread on the card hides whether it sets `data-interactive`, so a card link in it then stays silent too.

## ODD-CARD-004

Fails when the card has `onClick`, `onclick`, `tabIndex`, or `tabindex`.

A click handler on an `article` does nothing from the keyboard, and a focusable card reads all of its content as one name.

Remove them. Give the card `data-interactive` and put an `a.odd-card-link` in its title. In React, `onClick` and `tabIndex` on `Card` are type errors that print this code.

## ODD-CARD-005

Fails when an `a.odd-card-link` has no `href`.

An anchor without an `href` takes no focus and has no link role, so keyboard and screen reader users cannot open the card.

Add the `href`. For an action that is not navigation, use a `button` with `odd-card-link`. In React, `href` is a required prop of `CardLink`.

## ODD-CARD-006

Fails when `odd-card` has a system `data-` attribute other than `data-interactive` and `data-span`, or a near miss of either.

`card.css` reads only `data-interactive`. `data-tone` copied from a badge does nothing, and `data-interactiv` leaves the card static. `data-span` places the card in an `odd-grid`, so it passes. An app `data-` attribute, the appearance axes, and the headless allowlist pass.

Remove the attribute, or correct its name. In React, pass `interactive`. A system `data-` attribute such as `data-tone` on `Card` is a type error, and `data-span` is not.

## ODD-CARD-007

Fails when `odd-card-title`, `odd-card-link`, or `odd-card-footer` has a system `data-` attribute.

None of them reads a `data-` attribute. `data-interactive` on the link does nothing, because `card.css` selects it on `odd-card` only. An app `data-` attribute, the appearance axes, and the headless allowlist pass.

Remove the attribute. Put `data-interactive` and `data-span` on the card. In React, a system `data-` attribute on `CardLink` or `CardFooter` is a type error.
