// expect: ODD-FIELD-001 ODD-FIELD-001 ODD-FIELD-001 ODD-FIELD-001 ODD-FIELD-001 ODD-FIELD-003 ODD-FIELD-002
import { Field, FieldError, Hint, Input, Label, Select, Textarea } from "odd-design/react";
export const view = (
  <>
    <Field className="odd-input">
      <Label className="odd-input" htmlFor="email">Email</Label>
      <Input id="email" aria-invalid="true" aria-describedby="email-hint email-error" />
      <Hint className="odd-input" id="email-hint">We never share it.</Hint>
      <FieldError id="email-error">Enter an email address.</FieldError>
    </Field>
    <Textarea className="odd-input" id="notes" />
    <Select className="odd-input" id="format"><option>Standard</option></Select>
    <Input id="owner" aria-disabled="true" />
    <FieldError id="name-error" hidden>Enter a name.</FieldError>
  </>
);
