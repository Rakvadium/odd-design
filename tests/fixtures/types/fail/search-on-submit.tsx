import type { FormEvent } from "react";
import { Input } from "../../../../src/react/field.tsx";
import { Search } from "../../../../src/react/search.tsx";

declare function submit(event: FormEvent<HTMLElement>): void;

export const view = (
  <Search onSubmit={submit}>
    <svg aria-hidden="true" />
    <Input type="search" aria-label="Search cards" />
  </Search>
);
