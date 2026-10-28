// expect: ODD-SEARCH-002 ODD-SEARCH-002 ODD-SEARCH-002 ODD-SEARCH-003 ODD-SEARCH-003 ODD-SEARCH-003 ODD-SEARCH-003 ODD-SEARCH-001 ODD-SEARCH-004 ODD-SEARCH-005
import { Input, Search } from "odd-design/react";
import { SearchIcon } from "lucide-react";
declare const query: string;
declare function setQuery(value: string): void;
declare function submit(event: { preventDefault(): void }): void;
declare const inputClass: string;
declare const inputType: string;
declare const iconProps: object;
export const view = (
  <>
    <Search><label className="odd-visually-hidden" htmlFor="q">Search cards</label><svg aria-hidden="true" /><Input type="search" id="q" value={query} onChange={(event) => setQuery(event.target.value)} /></Search>
    <search><form className="odd-search" onSubmit={submit}><svg aria-hidden="true" /><Input type="search" name="q" aria-label="Search cards" /></form></search>
    <Search><SearchIcon aria-hidden /><Input type="search" aria-label="Search cards" /></Search>
    <Search><svg aria-hidden="true" /><input className={inputClass} type="search" aria-label="Search cards" /></Search>
    <Search><svg aria-hidden="true" /><Input type={inputType} aria-label="Search cards" /></Search>
    <Search><svg {...iconProps} /><Input type="search" aria-label="Search cards" /></Search>
    <Search><svg aria-hidden="true" /><input type="search" aria-label="Search cards" /></Search>
    <Search><svg aria-hidden="true" /><Input type="text" aria-label="Search cards" /></Search>
    <Search><form onSubmit={submit}><svg aria-hidden="true" /><Input type="search" aria-label="Search cards" /></form></Search>
    <Search><span><svg aria-hidden="true" /></span><Input type="search" aria-label="Search cards" /></Search>
    <Search><svg /><Input type="search" aria-label="Search cards" /></Search>
    <Search><svg aria-hidden /><Input type="search" aria-label="Search cards" /></Search>
    <div className="odd-search"><svg aria-hidden="true" /><Input type="search" aria-label="Search cards" /></div>
    <Search onSubmit={submit}><svg aria-hidden="true" /><Input type="search" aria-label="Search cards" /></Search>
    <Search data-tone="info"><svg aria-hidden="true" /><Input type="search" aria-label="Search cards" /></Search>
  </>
);
