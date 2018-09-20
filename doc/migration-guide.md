---
---
# Migration Guide 2.x to 3.0-beta1

Note that this guide refers to a pre-release version of Tabris.js 3. Further breaking changes are expected for the final release.

## General

### Removed `get("prop")` and `set("prop", value)`

This concerns all instances of `NativeObject` (including widgets) and `WidgetCollection`.

The `set` method still exists, but now only takes one argument (the properties object).
The `get` method has been removed entirely.

#### Alternatives for `set("prop", value)`:

On both `NativeObject` and `WidgetCollection`, `obj.set('foo', baz)` can be replaced with `obj.set({foo: baz})`,
and `obj.set(bar, baz)` can be replaced with `obj.set([foo]: baz})`.

On `NativeObject` only, `obj.set('foo', baz)` can be replaced with `obj.foo = baz`,
and `obj.set(bar, baz)` can be replaced with `obj[bar] = baz`.

#### Alternatives for `get("prop")`:

On `NativeObject`, `bar = obj.get('foo')` can be replaced with `bar = obj.foo`,
and `baz = obj.get(bar)` can be replaced with `baz = obj[bar]`.

On `WidgetCollection`, `bar = wc.get('foo');` can be replaced with `bar = wc.first().foo`,
and `baz = wc.get(bar)` can be replaced with `baz = wc.first()[bar]`.

### "trigger" object/eventObject parameter is now cloned

**This is relevant only if in your application you are passing values to `trigger` of types other than `Object` or `EventObject`.** Examples would be passing primitives (e.g. `trigger('select', selectionIndex);`) or instances of classes other than `Object` (e.g. `trigger('select', someArray);`). If you do that you need to change this to pass an object that references the value instead (e.g. `trigger('select', {selectionIndex});`)

 Previously the second parameter of the `trigger` method was  directly passed on to all listeners in all cases. However, we want to ensure that listeners can always expect to be called with a valid `EventObject` instance. For that reason the values of the `trigger` parameter are now copied to a new event object, *unless* the given parameter is already an instance of `EventObject` and has not been initialized yet.


## TypeScript

### Properties interfaces removed

The `tabris` module no longer exports a separate properties interfaces for every built-in type, e.g. `CompositeProperties` for `Composite`. These can be replaced with the generic `Properties` type. There are two variants:

`Properties<Composite>` contains all properties recognized by the `set` method of `Composite`.

`Properties<typeof Composite>` contains all properties recognized by the `Composite` constructor.

Unlike the previous interfaces, the generic `Properties` type has an indexer, i.e. it also permits excess properties to be present. For example, `{top: 3, foo: 'bar'}` would not have been assignable to `CompositeProperties`, but it is assignable to `Properties<Composite>`. This was done to match the behavior of the `set` method.

### "tsProperties" property no longer supported

It is no longer necessary to create a property `tsProperties` on classes inheriting from `Widget` to control the properties accepted by the `set` method. Instead all new public properties (except functions) are recognized by `set` automatically. To override the automatic behavior the `set` method can be overwritten.

### type "Partial"

The helper type `Partial<T, U>` was removed to avoid confusion with the `Partial` type built in to newer TypeScript versions. It can be replaced with `Partial<Pick<T, U>>`.

### types "margin", "dimension" and "offset"

These types have been renamed to start with an upper case.

### Event handling

The methods `on` and `once` no longer have widget-specific parameters, meaning they are not type-safe anymore. Strictly speaking this is not a breaking change, but it is strongly recommended to switch to the new (type safe) `Listeners` API as soon as possible. Some examples:

`widget.on('resize', listener)` and `widget.on({resize: listener})` become `widget.onResize(listener)`.

`widget.off('resize', listener)` becomes `widget.onResize.removeListener(listener)`.

`widget.once('resize', listener)` becomes `widget.onResize.once(listener)`.

## JSX

### Elements need to be imported

Tabris no longer provides "intrinsic" elements. This means that instead of creating a built-in widget via a lowercase element it has to be done by referencing the actual widget class.

Example:

This...
```jsx
import { ui } from 'tabris';

ui.contentView.append(<textView text='foo'/>);
```

has to be changed to:

```jsx
import { ui, TextView } from 'tabris';

ui.contentView.append(<TextView text='foo' />);
```