type Label = string;

export function Example(): Label {
  const label = "Save" as Label;
  return (
    <button className="odd-button" disabled>
      {label}
    </button>
  );
}
