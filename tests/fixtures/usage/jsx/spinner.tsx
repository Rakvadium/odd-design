// expect: ODD-SPINNER-002 ODD-SPINNER-002 ODD-SPINNER-002 ODD-SPINNER-003 ODD-SPINNER-001
import { Spinner } from "odd-design/react";
export const view = (
  <>
    <div className="odd-row" aria-busy="true">
      <Spinner aria-hidden="true" /> Loading projects…
    </div>
    <Spinner />
    <Spinner aria-hidden="true">Loading</Spinner>
    <Spinner aria-hidden="true" role="status" />
    <Spinner aria-hidden="true" data-size="lg" />
    <div className="odd-spinner" aria-hidden="true" />
  </>
);
