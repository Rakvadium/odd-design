import type { Meta, StoryObj } from "@storybook/html-vite";
import { enhanceSelectAll } from "../src/js/enhance.ts";

const meta = { title: "Components/Data Display" } satisfies Meta;

export default meta;
type Story = StoryObj;

const legal = /* html */ `<span class="odd-badge" data-tone="success">Legal</span>`;

const decks = [
  ["Midnight Control", "Extended", 60, 14, legal],
  ["Ember Aggro", "Standard", 60, 9, /* html */ `<span class="odd-badge" data-tone="warning">Rotating</span>`],
  ["Tidecaller", "Standard", 62, 21, legal],
  ["Old Faithful", "Retro", 55, 3, /* html */ `<span class="odd-badge" data-tone="danger">Banned card</span>`],
] as const;

export const Table: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "A native table in a scroll wrapper that keyboard users can focus and scroll. Checking a row's checkbox tints the row, and `enhanceSelectAll` makes the header checkbox select every row and show a mixed state. The sorted column carries `aria-sort`; the page does the sorting.",
      },
    },
  },
  render: () => {
    const root = document.createElement("div");
    root.innerHTML = /* html */ `<div class="odd-table-wrap" tabindex="0" role="region" aria-labelledby="decks-caption" style="max-inline-size: 48rem">
    <table class="odd-table">
      <caption id="decks-caption">Your decks, sorted by name</caption>
      <thead>
        <tr>
          <th scope="col"><input type="checkbox" data-select-all aria-label="Select all decks"></th>
          <th scope="col" aria-sort="ascending"><button class="odd-table-sort">Deck</button></th>
          <th scope="col"><button class="odd-table-sort">Format</button></th>
          <th scope="col" data-numeric><button class="odd-table-sort">Cards</button></th>
          <th scope="col" data-numeric>Versions</th>
          <th scope="col">Status</th>
        </tr>
      </thead>
      <tbody>
        ${decks
          .map(
            ([name, format, cards, versions, badge], i) => /* html */ `<tr>
          <td><input type="checkbox" aria-label="Select ${name}" ${i === 1 ? "checked" : ""}></td>
          <th scope="row" style="font-weight: 600"><a href="#">${name}</a></th>
          <td>${format}</td>
          <td data-numeric>${cards}</td>
          <td data-numeric>${versions}</td>
          <td>${badge}</td>
        </tr>`,
          )
          .join("")}
      </tbody>
      <tfoot>
        <tr>
          <td></td>
          <th scope="row">4 decks</th>
          <td></td>
          <td data-numeric>237</td>
          <td data-numeric>47</td>
          <td></td>
        </tr>
      </tfoot>
    </table>
  </div>`;
    requestAnimationFrame(() => enhanceSelectAll(root.querySelector("table")!));
    return root;
  },
};

/** A stand-in profile photo, so the story needs no network. */
const photo = (a: string, b: string) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><defs><linearGradient id="g" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><rect width="40" height="40" fill="url(#g)"/><circle cx="20" cy="16" r="7" fill="#fff" fill-opacity=".85"/><ellipse cx="20" cy="36" rx="13" ry="10" fill="#fff" fill-opacity=".85"/></svg>`,
  )}`;

export const Avatar: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "An image avatar has `alt` text; an initials avatar is `role=\"img\"` with an `aria-label`. With `data-initials`, `avatarFallback` swaps an image that fails to load (Jo Park's) for initials and keeps its name. Next to a visible name, hide the avatar instead so the name isn't read twice. The shape follows the chrome's chip radius.",
      },
    },
  },
  render: () => /* html */ `<div class="odd-stack" style="--gap: var(--space-5)">
    <div class="odd-row">
      <span class="odd-avatar" data-size="sm" role="img" aria-label="Ana Rojas">AR</span>
      <span class="odd-avatar" role="img" aria-label="Ana Rojas">AR</span>
      <span class="odd-avatar" data-size="lg" role="img" aria-label="Ana Rojas">AR</span>
      <span class="odd-avatar" data-size="lg"><img src="${photo("#8a5cf6", "#f472b6")}" alt="Kai Nakamura"></span>
      <span class="odd-avatar" data-size="lg" data-initials="JP" id="broken-avatar"><img src="/missing-avatar.png" alt="Jo Park"></span>
    </div>
    <div class="odd-avatar-group" role="group" aria-label="Collaborators">
      <span class="odd-avatar"><img src="${photo("#0ea5e9", "#22c55e")}" alt="Mira Okafor"></span>
      <span class="odd-avatar" role="img" aria-label="Ana Rojas">AR</span>
      <span class="odd-avatar"><img src="${photo("#f59e0b", "#ef4444")}" alt="Theo Laurent"></span>
      <span class="odd-avatar" role="img" aria-label="and 3 more">+3</span>
    </div>
    <div class="odd-row" style="--gap: var(--space-3)">
      <span class="odd-avatar" aria-hidden="true">MO</span>
      <div>
        <p style="font-weight: 600">Mira Okafor</p>
        <p class="odd-muted" style="font-size: var(--text-sm)">Edited Midnight Control · 2 hours ago</p>
      </div>
    </div>
  </div>`,
};

export const Separator: Story = {
  render: () => /* html */ `<div class="odd-stack" style="max-inline-size: 32rem">
    <div class="odd-stack" style="--gap: var(--space-2)">
      <h3 class="odd-heading">Deck notes</h3>
      <p class="odd-muted">Mulligan aggressively for an early unit.</p>
    </div>
    <hr class="odd-separator">
    <div class="odd-stack" style="--gap: var(--space-2)">
      <h3 class="odd-heading">Sideboard</h3>
      <p class="odd-muted">Bring in the control package against tempo decks.</p>
    </div>
    <hr class="odd-separator">
    <div class="odd-row" style="--gap: var(--space-3); font-size: var(--text-sm)">
      <a href="#">Edit</a>
      <hr class="odd-separator" aria-orientation="vertical">
      <a href="#">Duplicate</a>
      <hr class="odd-separator" aria-orientation="vertical">
      <a href="#">Export</a>
    </div>
  </div>`,
};
