// expect: ODD-BREADCRUMB-003 ODD-BREADCRUMB-002 ODD-BREADCRUMB-004 ODD-BREADCRUMB-001
import { Breadcrumb, TextLink } from "odd-design/react";
export const view = (
  <>
    <Breadcrumb aria-label="Breadcrumb">
      <ol>
        <li><TextLink href="/">Home</TextLink></li>
        <li>Archived</li>
        <li><TextLink href="/archived/alerts" aria-current="page">Alerts</TextLink></li>
      </ol>
    </Breadcrumb>
    <Breadcrumb aria-label="Breadcrumb"><ul><li><TextLink href="/">Home</TextLink></li></ul></Breadcrumb>
    <Breadcrumb><ol><li>Home</li></ol></Breadcrumb>
    <Breadcrumb aria-label="Breadcrumb" data-tone="primary"><ol><li>Home</li></ol></Breadcrumb>
    <div className="odd-breadcrumb"><ol><li>Home</li></ol></div>
  </>
);
