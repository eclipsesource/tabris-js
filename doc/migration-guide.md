---
---
# Migration Guide 2.x to 3.0

## Event Handling

### "trigger" object/eventObject parameter is now cloned

The second parameter of the `trigger` method was previously directly passed on to all listeners in all scenarios. This is no longer the case. To ensure that listeners always receive a valid `EventObject` instance, the values of the parameter are now copied to a new object, *unless* the given parameter is an instance of `EventObject` that has not been initialized yet.

This is relevant only if in your application you are passing values to `trigger` of types other than `Object` or `EventObject`. If you do so you need to pass an object referencing that value. E.g. `trigger('select', selection);` could become `trigger('select', {selection});`.

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

## Event handling

The methods `on` and `once` no longer widget-specific type information, instead allowing any string as the event type and a listener accepting `EventObject<NativeObject>`. To get full type information use the new `Listeners` API which provides separate listener registration functions for each event type, e.g. `widget.onResize(listener);`.

## JSX

### Elements need to be imported

Tabris no longer provides intrinsic elements. This means that instead of creating a built-in widget via a lowercase element (`<textView />`) it has to be done by referencing the actual widget class:

```jsx
import { ui, TextView } from 'tabris';

ui.contentView.append(<TextView />);
```