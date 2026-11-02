// expect: ODD-METER-001 ODD-METER-001 ODD-METER-001 ODD-METER-002 ODD-METER-002 ODD-STATIC-001 ODD-METER-003
import { Meter, Progress, type MeterTone } from "odd-design/react";
declare const typeTone: MeterTone;
export const view = (
  <>
    <div className="odd-stack"><div className="odd-row"><label className="odd-muted" htmlFor="actions">Actions</label><span className="odd-stat-value">22</span></div><Meter id="actions" min={0} max={60} value={22} tone="info" /></div>
    <Meter value={0.93} low={0.6} high={0.85} optimum={0} aria-label="Storage" />
    <Progress value={40} max={100} aria-label="Importing decks" />
    <Progress aria-label="Syncing" />
    <div className="odd-meter" aria-label="Units" />
    <progress className="odd-meter" value={40} max={100} aria-label="Importing decks" />
    <div className="odd-progress" aria-label="Importing decks" />
    <Meter tone="primary" value={22} max={60} aria-label="Actions" />
    <progress className="odd-progress" data-tone="neutral" aria-label="Syncing" />
    <Meter tone={typeTone} value={22} max={60} aria-label="Actions" />
    <Progress data-size="sm" aria-label="Syncing" />
  </>
);
