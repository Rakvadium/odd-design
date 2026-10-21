import type { Meta, StoryObj } from "@storybook/html-vite";

const meta = { title: "Components/Data Display" } satisfies Meta;

export default meta;
type Story = StoryObj;

const decks = [
  ["Midnight Control", "Extended", 60, 14, "success", "Legal"],
  ["Ember Aggro", "Standard", 60, 9, "warning", "Rotating"],
  ["Tidecaller", "Standard", 62, 21, "success", "Legal"],
  ["Old Faithful", "Retro", 55, 3, "danger", "Banned card"],
] as const;

export const Table: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "A native table in a scroll wrapper that keyboard users can focus and scroll. Checking a row's checkbox tints the row. The sorted column carries `aria-sort`; the page does the sorting.",
      },
    },
  },
  render: () => `<div class="ds-table-wrap" tabindex="0" role="region" aria-labelledby="decks-caption" style="max-inline-size: 48rem">
    <table class="ds-table">
      <caption id="decks-caption">Your decks, sorted by name</caption>
      <thead>
        <tr>
          <th scope="col"><input type="checkbox" aria-label="Select all decks"></th>
          <th scope="col" aria-sort="ascending"><button class="ds-table-sort">Deck</button></th>
          <th scope="col"><button class="ds-table-sort">Format</button></th>
          <th scope="col" data-numeric><button class="ds-table-sort">Cards</button></th>
          <th scope="col" data-numeric>Versions</th>
          <th scope="col">Status</th>
        </tr>
      </thead>
      <tbody>
        ${decks
          .map(
            ([name, format, cards, versions, tone, status], i) => `<tr>
          <td><input type="checkbox" aria-label="Select ${name}" ${i === 1 ? "checked" : ""}></td>
          <th scope="row" style="font-weight: 600"><a href="#">${name}</a></th>
          <td>${format}</td>
          <td data-numeric>${cards}</td>
          <td data-numeric>${versions}</td>
          <td><span class="ds-badge" data-tone="${tone}">${status}</span></td>
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
  </div>`,
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
          "An image avatar has `alt` text; an initials avatar is `role=\"img\"` with an `aria-label`. Next to a visible name, hide the avatar instead so the name isn't read twice. The shape follows the chrome's chip radius.",
      },
    },
  },
  render: () => `<div class="ds-stack" style="--gap: var(--space-5)">
    <div class="ds-row">
      <span class="ds-avatar" data-size="sm" role="img" aria-label="Ana Rojas">AR</span>
      <span class="ds-avatar" role="img" aria-label="Ana Rojas">AR</span>
      <span class="ds-avatar" data-size="lg" role="img" aria-label="Ana Rojas">AR</span>
      <span class="ds-avatar" data-size="lg"><img src="${photo("#8a5cf6", "#f472b6")}" alt="Kai Nakamura"></span>
    </div>
    <div class="ds-avatar-group" role="group" aria-label="Collaborators">
      <span class="ds-avatar"><img src="${photo("#0ea5e9", "#22c55e")}" alt="Mira Okafor"></span>
      <span class="ds-avatar" role="img" aria-label="Ana Rojas">AR</span>
      <span class="ds-avatar"><img src="${photo("#f59e0b", "#ef4444")}" alt="Theo Laurent"></span>
      <span class="ds-avatar" role="img" aria-label="and 3 more">+3</span>
    </div>
    <div class="ds-row" style="--gap: var(--space-3)">
      <span class="ds-avatar" aria-hidden="true">MO</span>
      <div>
        <p style="font-weight: 600">Mira Okafor</p>
        <p class="ds-muted" style="font-size: var(--text-sm)">Edited Midnight Control · 2 hours ago</p>
      </div>
    </div>
  </div>`,
};

export const Separator: Story = {
  render: () => `<div class="ds-stack" style="max-inline-size: 32rem">
    <div class="ds-stack" style="--gap: var(--space-2)">
      <h3 class="ds-heading">Deck notes</h3>
      <p class="ds-muted">Mulligan aggressively for an early unit.</p>
    </div>
    <hr class="ds-separator">
    <div class="ds-stack" style="--gap: var(--space-2)">
      <h3 class="ds-heading">Sideboard</h3>
      <p class="ds-muted">Bring in the control package against tempo decks.</p>
    </div>
    <hr class="ds-separator">
    <div class="ds-row" style="--gap: var(--space-3); font-size: var(--text-sm)">
      <a href="#">Edit</a>
      <hr class="ds-separator" aria-orientation="vertical">
      <a href="#">Duplicate</a>
      <hr class="ds-separator" aria-orientation="vertical">
      <a href="#">Export</a>
    </div>
  </div>`,
};
