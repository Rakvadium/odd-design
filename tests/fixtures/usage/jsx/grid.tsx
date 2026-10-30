// expect: ODD-GRID-001 ODD-GRID-001
import { Card } from "odd-design/react";
declare const span: string;
export const view = (
  <>
    <main className="odd-grid"><Card data-span="8" aria-label="Queue" /><div data-span={span} /><div /></main>
    <main className="odd-grid"><Card data-span="13" aria-label="Queue" /></main>
    <div className="odd-grid"><div data-span="half" /></div>
  </>
);
