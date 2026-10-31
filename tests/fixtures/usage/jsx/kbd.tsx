// expect: ODD-KBD-002 ODD-KBD-003 ODD-KBD-001
import { Kbd } from "odd-design/react";
export const view = (
  <>
    <p>Press <Kbd>Ctrl</Kbd> <Kbd>K</Kbd> to search.</p>
    <p>Press <Kbd aria-hidden="true">Ctrl</Kbd> to search.</p>
    <p>Press <Kbd data-size="sm">Esc</Kbd> to close.</p>
    <p>Press <span className="odd-kbd">Esc</span> to close.</p>
  </>
);
