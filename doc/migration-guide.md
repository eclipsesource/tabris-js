---
---
# Migration Guide 2.x to 3.0

## Widgets

### append, children, find, apply moved to Composite

Only `Composite` and it sub classes can contain children. Therefore methods dealing with child handling have no purpose on the `Widget` class and have been moved to `Composite`. Since calling these methods on non-composites has no effect or causes errors, most applications should not have adjust to this change.

### font moved to Button, CheckBox, RadioButton, TextInput, TextView and ToggleButton

Only widgets actually support different fonts now have a font property. Most applications should not have adjust to this change.
