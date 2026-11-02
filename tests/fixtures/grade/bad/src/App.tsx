import { Button } from "odd-design/react";

export function App() {
  return (
    <>
      <span className="odd-badge">Draft</span>
      <button type="button">Retry</button>
      <div role="button">More</div>
      <Button aria-busy="true">Add</Button>
    </>
  );
}
