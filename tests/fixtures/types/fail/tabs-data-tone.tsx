import { Tabs } from "../../../../src/react/tabs.tsx";

export const view = (
  <Tabs data-tone="info">
    <div role="tablist" aria-label="Deck view">
      <button role="tab" id="tab-cards" aria-controls="panel-cards" aria-selected="true">Cards</button>
    </div>
    <div role="tabpanel" id="panel-cards" aria-labelledby="tab-cards">A</div>
  </Tabs>
);
