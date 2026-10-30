// expect: ODD-SCOPE-001 ODD-SCOPE-001 ODD-SKIP-001 ODD-SKIP-001 ODD-SKIP-001
declare const target: string;
export const view = (
  <>
    <a className="odd-skip-link" href="#main">Skip to content</a>
    <a className="odd-skip-link" href={target}>Skip to content</a>
    <div className="odd-scope" data-chrome="glass" data-palette="aurora" data-mode="dark" />
    <div className="odd-scope" data-chrome="glass" />
    <button className="odd-skip-link" type="button">Skip to content</button>
    <a className="odd-skip-link">Skip to content</a>
    <a className="odd-skip-link" href="#">Skip to content</a>
  </>
);
