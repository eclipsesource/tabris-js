---
---
# Migration Guide 2.x to 3.0

## Widgets

### "append", "children", "find", "apply" moved to Composite

Only `Composite` and it sub classes can contain children. Therefore methods dealing with child handling have no purpose on the `Widget` class and have been moved to `Composite`. Since calling these methods on non-composites has no effect or causes errors, most applications should not have adjust to this change.

### "font" moved to Button, CheckBox, RadioButton, TextInput, TextView and ToggleButton

Only widgets actually support different fonts now have a font property. Most applications should not have adjust to this change.

## TypeScript

### "tsProperties" property no longer supported

It is no longer necessary to create a property `tsProperties` on classes inheriting from `Widget` to control the properties accepted by the `set` method. Instead new public properties (except for functions) are supported by `set` automatically. To override the automatic behavior the `set` method has to be overwritten.

### type "Partial"

The helper type `Partial<T, U>` was removed to avoid confusion with the `Partial` type built in to newer TypeScript versions. It can be replaced with `Partial<Pick<T, U>>`.

### types "margin", "dimension" and "offset"

These types have been renamed to start with an upper case.
