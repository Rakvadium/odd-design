// expect: ODD-BUTTON-008 ODD-BUTTON-008
export const view = (
  <>
    <button className="odd-button" data-icon-only><svg aria-hidden="true" /></button>
    <button className="odd-button" data-icon-only aria-label=" "><svg aria-hidden="true" /></button>
  </>
);
