import type { BadgeProps } from "./badge.tsx";
import type { ButtonProps } from "./button.tsx";
import type { ChoiceProps, SegmentedProps, SwitchProps } from "./choice.tsx";
import type { FieldErrorProps, FieldProps, HintProps, InputProps, LabelProps, SelectProps, TextareaProps } from "./field.tsx";

export type WrapperProps = {
  Button: ButtonProps;
  Field: FieldProps;
  Label: LabelProps;
  Input: InputProps;
  Textarea: TextareaProps;
  Select: SelectProps;
  Hint: HintProps;
  FieldError: FieldErrorProps;
  Choice: ChoiceProps;
  Switch: SwitchProps;
  Segmented: SegmentedProps;
  Badge: BadgeProps;
};
