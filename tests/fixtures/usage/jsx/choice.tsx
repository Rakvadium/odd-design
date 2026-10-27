// expect: ODD-CHOICE-002 ODD-CHOICE-003 ODD-CHOICE-003 ODD-CHOICE-003
import { Choice, Segmented, Switch } from "odd-design/react";
export const view = (
  <>
    <Choice><input type="checkbox" defaultChecked /> Weekly digest</Choice>
    <Choice><Switch type="checkbox" role="switch" /> Compact grid</Choice>
    <Segmented><legend>View</legend><label><input type="radio" name="view" /> Grid</label></Segmented>
    <Switch type="radio" role="switch" aria-label="Public" />
    <Choice aria-disabled="true"><input type="checkbox" /> Partner offers</Choice>
    <Switch type="checkbox" role="switch" aria-disabled="true" aria-label="Public" />
    <Segmented aria-disabled="true"><legend>View</legend></Segmented>
  </>
);
