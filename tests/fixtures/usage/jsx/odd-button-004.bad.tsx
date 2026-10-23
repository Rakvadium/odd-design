// expect: ODD-BUTTON-004 ODD-BUTTON-004 ODD-BUTTON-004
export const view = (
  <>
    <button className="odd-button" data-icon-only="false">Save</button>
    <button className="odd-button" data-icon-only={false}><svg aria-hidden="true" /></button>
    <button className="odd-button" data-icon-only="false" aria-label="Settings"><svg aria-hidden="true" /></button>
  </>
);
