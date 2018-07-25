---
---
# Migration Guide 2.x to 3.0

## Widgets

### "set" and "get" methods

On instances of `NativeObject` (including widgets) and `WidgetCollection`, `get(prop)` and `set(prop, value)` are no longer supported.
The `set` method now only takes one argument (properties object), and `get` has been removed entirely.

#### Alternatives for `set(prop, value)`:

On both `NativeObject` and `WidgetCollection`, `obj.set('foo', baz)` can be replaced with `obj.set({foo: baz})`, 
and `obj.set(bar, baz)` can be replaced with `obj.set([foo]: baz})`.

On `NativeObject` only, `obj.set('foo', baz)` can be replaced with `obj.foo = baz`, 
and `obj.set(bar, baz)` can be replaced with `obj[bar] = baz`. This does not work when chaining calls on the object.

#### Alternatives for `get(prop)`:

On `NativeObject`, `bar = obj.get('foo')` can be replaced with `bar = obj.foo`,
and `baz = obj.get(bar)` can be replaced with `baz = obj[bar]`.

On `WidgetCollection`, `bar = wc.get('foo');` can be replaced with `bar = wc.first().foo`,
and `baz = wc.get(bar)` can be replaced with `baz = wc.first()[bar]`.

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
