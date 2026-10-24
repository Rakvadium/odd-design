import { Button } from "odd-design/react";

export function App() {
  return (
    <>
      <Button disabled>Save</Button>
      <button type="button">Retry</button>
      <div role="button">More</div>
      <Button aria-busy="true">Add</Button>
    </>
  );
}
