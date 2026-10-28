import { Card } from "../../../../src/react/card.tsx";

export const view = (
  <Card onClick={() => location.assign("/decks/ember")}>
    <h3 className="odd-card-title">Ember Aggro</h3>
  </Card>
);
