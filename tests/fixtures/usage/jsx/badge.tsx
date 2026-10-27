// expect: ODD-BADGE-002 ODD-BADGE-004 ODD-BADGE-003 ODD-BADGE-001
import { Badge } from "odd-design/react";
export const view = (
  <>
    <Badge tone="success" solid>Legal</Badge>
    <Badge solid={false}>Draft</Badge>
    <Badge tone="sucess">Legal</Badge>
    <Badge data-variant="danger">Banned</Badge>
    <span className="odd-badge" data-solid={false}>Draft</span>
    <div className="odd-badge">Draft</div>
  </>
);
