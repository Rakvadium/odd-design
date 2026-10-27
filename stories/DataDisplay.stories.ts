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

export const AvatarFallback: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "With `data-initials`, `avatarFallback` from `odd-design/enhance` swaps an image that fails to load for its initials and keeps its name. It is for markup a page owns. React throws when a script replaces children it rendered, so the React `Avatar` types `data-initials` as `never`; a React app renders the initials itself when the image fails.",
      },
    },
  },
  render: () => /* html */ `<div class="odd-row">
    <span class="odd-avatar" data-size="lg" data-initials="JP" id="broken-avatar"><img src="/missing-avatar.png" alt="Jo Park"></span>
  </div>`,
};
