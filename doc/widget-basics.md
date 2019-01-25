---
---
# Widget Basics

The UI of a Tabris.js app consists of native widgets, represented by JavaScript objects. There are different types of widgets such as `Button`, `TextView`, or `ScrollView`. Every widget type is a subclass of [Widget](api/widgets/Widget.md) and [NativeObject](api/NativeObject.md), which provide some common API. For example:

```
tabris.NativeObject
 |- tabris.Widget
    |- tabris.Button
```

You can omit the `tabris` namespace when you explicitly [import](./modules.md) the widget from the tabris module. We will assume this to be the case in all following examples.

## Creating Widgets

Every widget constructor accepts an object with initial property values to create the widget with. Here's how you create and initialize a widget in Tabris.js:

```js
const button = new Button({left: 10, top: 10, text: 'OK'});
```

If you prefer declarative UI, you may also [use JSX to create widgets](./lang.md#JSX) within `.jsx` (for JavaScript) or `.tsx` (for TypeScript) files:

```jsx
const button = <Button left={10} top={10} text='OK' />;
```

## Widget Properties

Every widget supports a fixed set of properties (e.g. a text or a color). They can be set on widget creation (via constructor or JSX), or directly on the instance:

```js
widget.text = 'Hello World';
const text = widget.text;
```

Using the `set()` method, it's also possible to set multiple properties in one call:

```js
button.set({
  text: 'OK',
  background: 'blue'
});
```

When trying to set an invalid value (e.g. of the wrong type), the value will be converted if possible, otherwise it will be ignored with a warning printed to the developer console.

## Setting the Parent

To become visible, a widget needs to be added to a parent. The top-level parent of all widgets on the main screen is the content view (`tabris.contentView`). Widgets can be included in the widget hierarchy by using `append()` or `appendTo()`.

Therefore a complete "Hello World" app could look like this:

```js
import { contentView, TextView } from 'tabris';

new TextView({text: 'Hello World'}).appendTo(contentView);
```

If the widget already has a parent, it is removed from the actual parent and appended to the new one. An *addChild* event is triggered on the new parent.

With `append()` you can also add multiple widgets in one call:

```js
new Page().append(
  new TextView(),
  new Button()
);
```

Or in JSX:

```jsx
<Page>
  <TextView>
  <Button>
</Page>
```

JSX also supports WidgetCollection as an element which is useful for appending to already existing widgets:

```jsx
page.append(
  <WidgetCollection>
    <TextView>
    <Button>
  </WidgetCollection>
);
```

## Event Handling

Widgets can notify event callback functions ("listeners") of events such as a user interaction or a property change. For each type of event supported by a widget there is a matching method to register a listener. These all start with an `on` followed by the name of the event, e.g. `onSelect`.

Example:

```js
function listener() {
  console.log('Button selected!');
}

button.onSelect(listener);
```

Inside a class (e.g. its constructor) it is recommended to use arrow functions to avoid `this` having unexpected values.

```js
button.onSelect(() => this.doSomething());
```

In JSX you can use attributes following the same naming pattern to register listener:

```js
const listener = () => console.log('Button selected!');
const button = <Button onSelect={listener} />;
```

The listener function is called with an instance of [EventObject](./api/EventObject.md) that may include a number of additional properties depending on the event type.

The listener registration method is also an object of the [Listeners](./api/Listeners.md) type that provides additional API for event handling. This is how you de-register a listener again:

```js
button.onSelect.removeListener(listener);
```

You can also add and remove listener with the widget methods `on` and `off`:

```js
button.on('select', listener);
button.off('select', listener);
```

> :point_right: You should avoid `on` and `off` when using TypeScript, as they are not type-safe.

### Change Events

All widgets support property change events that are fired when a property value changes. All change events are named `[propertyName]Changed` and provide a `ChangeEvent` object.

In addition to the common event properties, change events have a property `value` that contains the new value of the property.

Example:

```js
new TextInput().onTextChanged(event => {
  console.log('The text has changed to: ' + event.value);
})
```

## Traversing the Widget Tree

See also: [Selector API](selector.md)

The current parent of a widget is returned by the [`parent`](api/Widget.md#parent) method,
and the children by the [`children`](api/Widget.md#children) method.

Example:

```js
let parent = widget.parent();
let firstChild = parent.children()[0];
let lastChild = parent.children().last();
```

The result list of children is an array-like object of the type [`WidgetCollection`](api/WidgetCollection.md).

## Animations

All widgets have the method [`animate(properties, options)`](api/Widget.md#animateproperties-options). It expects a map of properties to animate (akin to the `set` method), and a set of options for the animation itself.
All animated properties are set to their target value as soon as the animation starts. Therefore, reading the property value will always result in either the start or target value, never one in between.

Only the properties `transform` and `opacity` can be animated.

The `animate` method returns a Promise that is resolved once the animation is completed. If the animation is aborted, e.g. by disposing the widget, the promise is rejected.

In this example we use the `async/await` syntax to wait for the animation to finish, then dispose the widget.

```js
async function fadeOut(widget) {
  await widget.animate(
    {opacity: 0}
    {duration: 1000, easing: 'ease-out'}
  );
  widget.dispose());
}

fadeOut(myLabel);
```

## Disposing of a Widget

The `dispose` method disposes of the widget and all of its children. It triggers a *removeChild* event on the parent and a *dispose* event on itself.

Example:

```js
button.on('dispose', () => console.log('Button disposed!'));
button.dispose();
```

After a widget is disposed none of its methods will work except `isDisposed()`, which returns `true` if the widget has been disposed, otherwise `false`.
