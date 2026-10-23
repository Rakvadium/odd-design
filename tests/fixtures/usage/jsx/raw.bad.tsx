// expect: ODD-BUTTON-001 ODD-BUTTON-002 ODD-BUTTON-003 ODD-BUTTON-004 ODD-BUTTON-005 ODD-BUTTON-006 ODD-BUTTON-007 ODD-BUTTON-008 ODD-BUTTON-009 ODD-BUTTON-010 ODD-BUTTON-011 ODD-BUTTON-012 ODD-BUTTON-013 ODD-BUTTON-014 ODD-BUTTON-015 ODD-CLASS-001
export const view = (
  <>
    <span className="odd-button">Save</span>
    <button className="odd-button" data-variant="outline">Outline</button>
    <button className="odd-button" data-size="md">Medium</button>
    <button className="odd-button" data-icon-only="false">Save</button>
    <button className="odd-button" aria-disabled="yes">Save</button>
    <button className="odd-button" aria-busy="loading">Saving</button>
    <button className="odd-button" disabled>Save</button>
    <button className="odd-button" data-icon-only><svg aria-hidden="true" /></button>
    <a className="odd-button">Home</a>
    <button className="odd-button" href="/home">Home</button>
    <a className="odd-button" href="/home" aria-current="true">Home</a>
    <button className="odd-button" aria-current="page">Home</button>
    <a className="odd-button" href="/home" aria-disabled="true">Home</a>
    <button className="odd-button" data-icon-only aria-label="Settings"><svg aria-hidden="true" /> Settings</button>
    <button className="odd-button" data-tone="danger">Delete</button>
    <div className="odd-stak">A misspelled layout class</div>
  </>
);
