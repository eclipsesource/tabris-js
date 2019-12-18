---
---
# Migration Guide 2.x to 3.0

## General

### Removed ui object

The `ui` object (`tabris.ui`) and `Ui` class no longer exist. All properties formerly hosted by `ui` are now directly attached to the `tabris` object/namespace. Example:

Tabris 2.x
```js
import {ui} from 'tabris';

ui.contentView.background = 'red';
ui.drawer.background = 'red';
ui.statusBar.background = 'red';
ui.navigationBar.background = 'red';
```

Tabris 3.0
```js
import {contentView, drawer, statusBar, navigationBar} from 'tabris';

contentView.background = 'red';
drawer.background = 'red';
statusBar.background = 'red';
navigationBar.background = 'red';
```

### Removed `get("prop")` and `set("prop", value)`

This concerns all instances of `NativeObject` (including widgets) and `WidgetCollection`.

The `set` method still exists, but now only takes one argument (the properties object).
The `get` method has been removed entirely.

#### Alternatives for `set("prop", value)`:

On both `NativeObject` and `WidgetCollection`, `obj.set('foo', baz)` can be replaced with `obj.set({foo: baz})`,
and `obj.set(bar, baz)` can be replaced with `obj.set({[foo]: baz})`.

On `NativeObject` only, `obj.set('foo', baz)` can be replaced with `obj.foo = baz`,
and `obj.set(bar, baz)` can be replaced with `obj[bar] = baz`.

#### Alternatives for `get("prop")`:

On `NativeObject`, `bar = obj.get('foo')` can be replaced with `bar = obj.foo`,
and `baz = obj.get(bar)` can be replaced with `baz = obj[bar]`.

On `WidgetCollection`, `bar = wc.get('foo');` can be replaced with `bar = wc.first().foo`,
and `baz = wc.get(bar)` can be replaced with `baz = wc.first()[bar]`.

### app.installPatch removed

You can no longer patch your application using this method.

### AlertDialog textInputs property is now a ContentView

Instead of assigning `TextInputs` widgets to that property they need to be appended:

Old:
```js
alertDialog.textInputs = [new TextInput()];
```

New:
```js
alertDialog.textInputs.append(new TextInput());
```

Alternatively JSX my be used:

```jsx
<AlertDialog>
  <TextInput/>
</AlertDialog>
```

### Removed properties "placementPriority" of Action and "navigationAction" of NavigationView

These properties are replaced by a new property `placement` on the `Action` widget. It accepts the values `'default'` (same as `placementPriority = 'normal'`), `'overflow'` (same as a `placementPriority = 'low'`) and `'navigation'`, which puts the action in the place usually reserved by the drawer icon.

### Removed property `topToolbarHeight` and `bottomToolbarHeight` on `NavigationView`

On iOS a toolbar at the bottom of a `NavigationView` has been used for actions with low priority. With the introduction of the new `Action` `placement` property the bottom toolbar has been removed along with the respective properties `topToolbarHeight` and `bottomToolbarHeight`. In their place a new property `toolbarHeight` has been added.  

### Removed widgetCollection.find

This method has been removed due to its ambiguous nature. This does not affect `composite.find` which still exists.

### "trigger" object/eventObject parameter is now cloned

**This is relevant only if in your application you are passing values to `trigger` of types other than `Object` or `EventObject`.** Examples would be passing primitives (e.g. `trigger('select', selectionIndex);`) or instances of classes other than `Object` (e.g. `trigger('select', someArray);`). If you do that you need to change this to pass an object that references the value instead (e.g. `trigger('select', {selectionIndex});`)

 Previously the second parameter of the `trigger` method was  directly passed on to all listeners in all cases. However, we want to ensure that listeners can always expect to be called with a valid `EventObject` instance. For that reason the values of the `trigger` parameter are now copied to a new event object, *unless* the given parameter is already an instance of `EventObject` and has not been initialized yet.

### Color properties

All color properties are now of the type `ColorValue`. While these properties still accept the same string values as in 2.x, they will return a "Color" class instance instead of a string. The exception is CanvasContext, where color properties still return a string for W3C compatibility.

### Widget.background property

Widget background setter now also accepts `ColorValue`, `ImageValue`, and `LinearGradientValue` values and the getter will return instances of the "Color", "Image" and "LinearGradient" classes.

### Widget.backgroundImage property removed

You can now set images directly on the `background` property.

### alignment properties

All widget `alignment` properties (on `Button`, `TextInput`, `TextView` and `ToggleButton`) now expect `centerX` instead of `center`.

### TabFolder.textColor property replaced with more flexible properties

The `TabFolder.textColor` property has been replaced with a set of new properties which provide more
control over the appearance of the TabFolder tabs:

- `tabTintColor`
- `selectedTabTintColor`
- `tabBarBackground`
- `selectedTabIndicatorTintColor`

In addition the `TabFolder` gained the property `tabBarElevation` which is applicable on Android.

### Tab.badge property changed to be of type number instead of string

With the added support for `badge` on Android, the type of the `badge` property has been updated to be a number:

```js
tab.badge = 10
```

### CollectionView select event removed

The collectionView no longer provides a select event. Interactions with a cell have to be handled directly by listeners attached to the cell. A new method `itemIndex` may be used to determine the index associated with a cell:

```js
collectionView.createCell = () => {
  const cell = new SomeWidget();
  cell.onTap(() => {
    const index = cell.parent(CollectionView).itemIndex(cell);
    // do something with the item...
  });
  return cell;
}
```

### Picker allows empty state with "message" property as placeholder

The `Picker` now allows to show an (initial) empty state. This unselected state can be filled with a `message` text similar to a `TextInput`. The initial `selectionIndex` is therefore `-1`. It can also be set to `-1` which shows the empty state or the `message` respectively.

To recreate the previous behavior the `selectionIndex` could be set to `0`.

### Picker property "fillColor" removed

With the introduction of the new `style` property on `Picker`, the iOS only property `fillColor` became redundant.
Previously the `fillColor` was required to separate the Android underline colorization from the ios picker background color. Setting the `Picker` `style` to _underline_ on Android now ignores the background and only applies the `borderColor` property.

### Font properties

All font properties are now of the type "FontValue". While these properties still accept the same string values as in 2.x, they will return a "Font" class instance instead of a string. The exception is CanvasContext, where font properties still return a string for W3C compatibility.

### Image properties

All image properties are now of the type "ImageValue". While these properties still accept the same string values as in 2.x, they will return an "Image" class instance instead of a string.

### Gesture event "longpress" renamed to "longPress"

To be consistent with the event naming scheme of gesture events, the event "longpress" has been renamed to "longPress".

### TextInput property "fillColor" removed

With the introduction of the new `style` property on `TextInput`, the iOS only property `fillColor` became redundant. Previously the `fillColor` was required to separate the Android underline colorization from the ios input background color. Setting the `TextInput` `style` to _underline_ on Android now ignores the background and only applies the `borderColor` property.

## TypeScript

### Properties interfaces removed

The `tabris` module no longer exports a separate properties interfaces for every built-in type. These can be replaced with the generic `Properties` type:

`CompositeProperties` `=>` `Properties<Composite>`

### "tsProperties" property no longer supported

It is no longer necessary or supported to create a property `tsProperties` on classes inheriting from `Widget` to control the properties accepted by the `set` method. In most cases public properties are recognized by `set` automatically. That excludes methods/functions.

When called on `this` the supported properties can not be inferred. To fix this the `set` method can be overwritten/re-declared, or it may be called with the appropriate generic type like this: `this.set<MyComponent>({propA: valueA});`

### type "Partial"

The helper type `Partial<T, U>` was removed to avoid confusion with the `Partial` type built in to newer TypeScript versions. It can be replaced with `Partial<Pick<T, U>>`.

### CollectionView is generic

The `CollectionView` is now a generic type `CollectionView<Cell extends Widget>`, where `Cell` is the type of widget returned by the `createCell` callback. All occurrences of `CollectionView` as a type should be replaced with the appropriate generic version, e.g. `CollectionView<Composite>`.

### types "dimension" and "offset"

Types "dimension" and "offset" have been renamed to start with an upper case.
Type "margin" has been replaced with "ConstraintValue", which includes the former "margin" type.

### LayoutData and related properties

The `layoutData` property is now of the type `LayoutDataValue`. The values that were accepted in 2.x are still accepted, with one exception: It was previously possible to give a percentage as a number type within a `margin` (now `ConstraintValue`) type array, i.e. `[number, number]`. However, this was an undocumented feature, as the documentation stated:

> "All **percentages** are provided as strings with a percent suffix, e.g. `"50%"`."

All percentages are now of the `PercentValue` type, i.e. a string like `"50%"`, an instance of the `Percent` class, or a `Percent`-like object, e.g. `{percent: 50}`.

The return value of the `layoutData` property is now always an instance of the `LayoutData` class instead of a plain object.

The shorthand properties to `layoutData` now also return the normalized types used in the `LayoutData` class, i.e. an instance of `Constraint` (for `left`, `right`, `top` and `bottom`) or `SiblingReference` (for `baseline`), a number (for `width`, `height`, `centerX` and `centerY`), or `"auto"` (the default for all of these).

In 2.x, negative edge offsets were previously supported on some platforms. To prevent inconsistent layouts among platforms, they are not supported anymore.

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
import { contentView, TextView } from 'tabris';

contentView.append(<TextView text='foo' />);
```
Only widgets actually supporting different fonts now have a font property. Most applications should not have to adjust to this change.

### jsxProperties

It used to be necessary to declare this property to add JSX attributes to a custom component. This now happens automatically. The mechanism itself is still present, but the property is now named `jsxAttributes` to make it distinct from the properties of the created object. Declaring `jsxAttributes` may sometimes be be necessary because properties that are either functions or are marked as readonly are not available as JSX attributes by default.

## Cordova plugins

The Cordova CLI dependency has been updated from `6.5.0` to `8.1.2`. The Cordova CLI will now use the system `npm` to install plugins. This has following implications:

* Plugins need to provide a `package.json` in their root directory.
* Plugins in package [subdirectories](https://cordova.apache.org/docs/en/6.x/reference/cordova-cli/index.html#plugin-spec) are not supported anymore.

## Android custom theme

Creating a custom theme follows the same approach as in 2.x but the paths to the theme.xml file has been changed slightly due to the migration to cordova-android 8.0. Declared theme.xml resource files need to be prefixed with with `app/src/main/`, e.g.:

```
<resource-file src="res/android/values/my_theme.xml" target="res/values/my_theme.xml" />
```

should be changed to:

```
<resource-file src="res/android/values/my_theme.xml" target="app/src/main/res/values/my_theme.xml" />
```

For more details on Android custom themes see: https://docs.tabris.com/3.0/theming-android.html
