import { Input } from "../../../../src/react/field.tsx";
import { Search } from "../../../../src/react/search.tsx";

export const view = (
  <Search data-tone="info">
    <svg aria-hidden="true" />
    <Input type="search" aria-label="Search cards" />
  </Search>
);
