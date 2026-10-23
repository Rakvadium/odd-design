# General usage rules

These codes apply across components. Button codes are in [Button usage rules](button.md).

## ODD-CLASS-001

Fails when an element uses an `odd-` class that is not in the registry.

The registry lists every `odd-` class that `src/css` defines, including the layout classes in `base.css`.

Use a registered class, or remove the class. Correct a near miss to the registered name.

## ODD-STATIC-001

Fails when a class or attribute value is not a literal, or when a PascalCase component carries an `odd-` class.

The checker reads values that are written out in the source. A computed value hides the markup, and a component boundary hides the element.

Write a literal value. Put `odd-` classes on a lowercase element, or on `Button` from this package.

## ODD-STATIC-002

Fails when a template contains a contract class and is neither tagged `html` nor marked with an html comment.

The HTML parser skips an unmarked template, so a mistake in it never reaches the checker.

Tag the template `html`, or put `/* html */` at the start of the template.

## ODD-STATIC-003

Fails when a disable comment for an `odd` rule has no written reason.

A disable with no reason hides a finding and leaves no record of why.

Write the reason in the comment after the disable.
