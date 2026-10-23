// expect: none
function Button(props: { disabled?: boolean; children: string }) {
  return <button {...props} />;
}
export const view = <Button disabled>Save</Button>;
