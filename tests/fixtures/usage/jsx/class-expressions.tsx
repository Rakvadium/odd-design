// expect: ODD-REACT-003 ODD-REACT-003 ODD-REACT-003 ODD-REACT-003 ODD-REACT-003
import { clsx } from "clsx";
export const view = (tone: string, active: boolean) => (
  <>
    <span className={`odd-badge ${tone}`}>New</span>
    <article className={clsx("deck", active && "odd-card")}>Ember Aggro</article>
    <p className={clsx({ "odd-hint": active })}>Shown on your profile.</p>
    <kbd class="odd-kbd">K</kbd>
    <hr className={"odd-separator"} />
  </>
);
