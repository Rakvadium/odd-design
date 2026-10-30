// expect: ODD-TYPOGRAPHY-001 ODD-TYPOGRAPHY-002 ODD-TYPOGRAPHY-002 ODD-TYPOGRAPHY-003 ODD-STATIC-001
declare const size: string;
export const view = (
  <>
    <h2 className="odd-heading" data-size="xl">Your collection</h2>
    <p className="odd-eyebrow" data-tone="primary">Season 4</p>
    <div className="odd-heading">Your collection</div>
    <h2 className="odd-heading" data-size="md">Your collection</h2>
    <h2 className="odd-heading" data-size="3xl">Your collection</h2>
    <p className="odd-eyebrow" data-tone="danger">Season 4</p>
    <h2 className="odd-heading" data-size={size}>Your collection</h2>
  </>
);
