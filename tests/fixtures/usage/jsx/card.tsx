// expect: ODD-CARD-003 ODD-CARD-003 ODD-CARD-003 ODD-CARD-004 ODD-CARD-004 ODD-CARD-001 ODD-CARD-003 ODD-STATIC-001
import { Card, CardFooter, CardLink } from "odd-design/react";
import { DeckTitle } from "./deck-title";
declare const deck: { href: string; name: string };
declare function open(): void;
declare const props: { interactive?: boolean };
export const view = (
  <>
    <Card interactive>
      <h3 className="odd-card-title"><CardLink href={deck.href}>{deck.name}</CardLink></h3>
      <CardFooter>60 cards</CardFooter>
    </Card>
    <Card interactive><DeckTitle /></Card>
    <Card interactive><h3 className="odd-card-title">Ember Aggro</h3></Card>
    <Card><h3 className="odd-card-title"><CardLink href="/decks/ember">Ember Aggro</CardLink></h3></Card>
    <Card interactive><h3 className="odd-card-title"><CardLink href="/decks/ember">Ember Aggro</CardLink></h3><CardFooter><button type="button">Share</button></CardFooter></Card>
    <Card onClick={open} tabIndex={0}><h3 className="odd-card-title">Ember Aggro</h3></Card>
    <Card><p className="odd-card-title">Ember Aggro</p></Card>
    <Card interactive><button type="button">Share</button><DeckTitle /></Card>
    <Card {...props}><CardLink href="/decks/ember">Ember Aggro</CardLink></Card>
  </>
);
