# Search usage rules

These codes apply to `odd-search`. Shared codes are in [General usage rules](general.md). For search with suggestions, wrap an `odd-combobox` in a plain `<search>` element instead ([Combobox usage rules](combobox.md)), because `odd-search` needs its own search input as a direct child.

```html
<search class="odd-search">
  <label class="odd-visually-hidden" for="card-search">Search cards</label>
  <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24">…magnifier…</svg>
  <input class="odd-input" type="search" id="card-search" placeholder="Search cards">
</search>
```

A search is a `search` element, the search landmark, with three direct children: a visually hidden `label`, the magnifier `svg` with `aria-hidden="true"`, and an `input.odd-input` with `type="search"`. Enter does nothing, so filter as the user types. To submit on Enter, put a `form` around the search. `odd-search` on a `form` directly inside a plain `search` also works, as `search.css` documents. In React, `Search` renders the `search`, and a `form` around it submits.

## ODD-SEARCH-001

Fails when `odd-search` is on an element other than `search` or `form`.

The class draws the same box on any element, but only a `search` element is the search landmark. A `div.odd-search` is not in the landmark list.

Move the class onto a `search`, or onto a `form` directly inside a `search`. In React, use `Search`.

## ODD-SEARCH-002

Fails when a search has no direct child with `odd-input` and `type="search"`.

`search.css` pads only a direct `.odd-input` to clear the icon. An input wrapped in a `div` keeps its normal padding, so the icon covers the first letters. A raw `input` with no class has no field styles at all. A `form` between the `search.odd-search` and the input unstyles the input and leaves the icon unsized. An input with another `type` is a `textbox`, not a `searchbox`, and `search.css` restyles the clear button only on `type="search"`.

Make the input an `Input` with `type="search"`, or an `input` with `odd-input` and `type="search"`, directly inside `odd-search`. To submit, put the `form` around the search. When the input, its class, or its `type` comes from an expression, ESLint cannot see it and stays silent. The runtime checker still reads the rendered page.

## ODD-SEARCH-003

Fails when a search has no direct `svg` child with `aria-hidden="true"`.

The input always keeps room for the icon. With no icon, the text starts after an empty gap. An icon wrapped in a `span` or a `button` is neither placed nor sized. An `svg` without `aria-hidden="true"` is read out as an image in Chromium and Firefox.

Put the magnifier `svg`, with `aria-hidden="true"`, directly inside `odd-search` before the input. ESLint reads a bare `aria-hidden` as empty and reports it. An icon component that renders an `svg`, such as one from an icon library, counts. The runtime checker reads the rendered page, so it sees inside it.

## ODD-SEARCH-004

Fails when `onSubmit` or `onsubmit` is on a `search` element with `odd-search`.

A `search` element holds no form, so no submit event fires and Enter does nothing. The handler never runs.

To submit, put a `form` around the search and put `onSubmit` on the form. To filter as the user types, use `onChange` on the input.

## ODD-SEARCH-005

Fails when a search has a system `data-*` attribute that it does not read, such as `data-tone`.

`search.css` reads no `data-*` attribute. App data attributes, the appearance axes, and the headless allowlist stay allowed.

Remove the attribute.
