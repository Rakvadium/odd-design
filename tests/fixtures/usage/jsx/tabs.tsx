// expect: ODD-TABS-002 ODD-TABS-003 ODD-TABS-003 ODD-TABS-004 ODD-TABS-004 ODD-TABS-001 ODD-TABS-005 ODD-TABS-004 ODD-TABS-004
import { Tabs } from "odd-design/react";
import { DeckTabList } from "./deck-tab-list";
declare const ids: { tab: string; panel: string };
declare const role: "tablist";
declare const tabProps: { role: "tab"; "aria-controls": string };
declare const wiring: { id: string; "aria-controls": string };
export const view = (
  <>
    <Tabs><div role="tablist" aria-label="Deck view"><button role="tab" id="tab-cards" aria-controls="panel-cards" aria-selected="true">Cards</button></div><div role="tabpanel" id="panel-cards" aria-labelledby="tab-cards">A</div></Tabs>
    <Tabs><div role="tablist" aria-label="Deck view" aria-orientation="vertical" data-activation="manual"><button role="tab" id={ids.tab} aria-controls={ids.panel} aria-selected="true" disabled>Cards</button></div></Tabs>
    <Tabs><><div role="tablist" aria-label="Deck view"><button {...tabProps}>Cards</button></div></></Tabs>
    <Tabs><div role="tablist" aria-label="Deck view"><button role="tab" {...wiring}>Cards</button></div></Tabs>
    <Tabs><DeckTabList /><div role="tabpanel" id="panel-cards">A</div></Tabs>
    <Tabs><div role={role} aria-label="Deck view" /></Tabs>
    <Tabs><div><div role="tablist" aria-label="Deck view" /></div></Tabs>
    <Tabs aria-orientation="vertical" data-activation="manual"><div role="tablist" aria-label="Deck view" /></Tabs>
    <Tabs><div role="tablist" aria-label="Deck view"><div role="tab" aria-controls="panel-cards">Cards</div><button role="tab" aria-selected="false">Stats</button></div></Tabs>
    <section className="odd-tabs"><div role="tablist" aria-label="Deck view" /></section>
    <Tabs data-tone="info"><div role="tablist" aria-label="Deck view" /></Tabs>
    <Tabs><div role="tablist" aria-label="Outer"><button role="tab" id="tab-outer" aria-controls="panel-outer" aria-selected="true">Outer</button></div><div role="tabpanel" id="panel-outer" aria-labelledby="tab-outer"><Tabs><div role="tablist" aria-label="Inner"><button role="tab" aria-selected="true">Inner</button></div></Tabs></div></Tabs>
    <Tabs><div role="tablist" aria-label="Deck view"><div role="tab" {...wiring}>Cards</div></div></Tabs>
  </>
);
