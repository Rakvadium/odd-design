// expect: ODD-LINK-002 ODD-LINK-003 ODD-LINK-005 ODD-LINK-007 ODD-LINK-004 ODD-LINK-001 ODD-STATIC-001
import { TextLink, TextLink as Anchor } from "odd-design/react";
import { Link } from "./router";
export const view = (
  <>
    <TextLink href="/projects">Projects</TextLink>
    <TextLink href="/roadmap" aria-current="page">Roadmap</TextLink>
    <TextLink href="https://example.com/changelog" target="_blank" rel="noopener">Changelog (opens in a new tab)</TextLink>
    <TextLink>Projects</TextLink>
    <TextLink href="/archive" aria-disabled="true">Archive</TextLink>
    <TextLink href="/projects" aria-current="true">Projects</TextLink>
    <TextLink href="https://example.com/status" target="_blank">Status</TextLink>
    <Anchor href="/settings" role="button">Settings</Anchor>
    <span className="odd-link">Settings</span>
    <Link className="odd-link" to="/settings">Settings</Link>
  </>
);
