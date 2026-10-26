// expect: ODD-FIELD-003 ODD-FIELD-002
import { Field, FieldError, Hint, Input, Label, Select, Textarea } from "odd-design/react";
export const view = (
  <>
    <Field>
      <Label htmlFor="email">Email</Label>
      <Input id="email" aria-invalid="true" aria-describedby="email-hint email-error" />
      <Hint id="email-hint">We never share it.</Hint>
      <FieldError id="email-error">Enter an email address.</FieldError>
    </Field>
    <Textarea id="notes" />
    <Select id="format"><option>Standard</option></Select>
    <Input id="owner" aria-disabled="true" />
    <FieldError id="name-error" hidden>Enter a name.</FieldError>
  </>
);
