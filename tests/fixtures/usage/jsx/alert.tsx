// expect: ODD-ALERT-002 ODD-ALERT-003 ODD-ALERT-003 ODD-ALERT-004 ODD-ALERT-005 ODD-ALERT-001
import { Alert, AlertTitle } from "odd-design/react";
export const view = (
  <>
    <Alert tone="success">
      <AlertTitle>Saved</AlertTitle>
    </Alert>
    <Alert tone="neutral">Draft</Alert>
    <Alert role="status">Saved</Alert>
    <Alert aria-live="polite">Saved</Alert>
    <Alert data-variant="primary">Saved</Alert>
    <AlertTitle data-tone="info">Saved</AlertTitle>
    <span className="odd-alert">Saved</span>
  </>
);
