---
---
# Widget Basics

The UI of a Tabris.js app consists of native widgets, represented by JavaScript objects. There are different types of widgets such as `Button`, `TextView`, or `ScrollView`. Every widget type is a subtype of [Widget](api/Widget.md) which provides common methods to get and set properties, be notified of events, and append widgets to a parent widget. Most of these methods return the widget itself to allow method chaining.

## Creating Native Widgets

Every widget constructor accepts an object with initial property values to create the native widget with. Here's how you create and initialize a widget in Tabris.js:

```js
let button = new Button({
  left: 10,
  top: 10,
  text: 'OK'
});
```

If you prefer declarative UI, you may also [use `JSX` to create widgets](./lang.md#JSX). When you [generate a Tabris.js TypeScript project](./getting-started.md#create-your-first-app), JSX support is already set up.

## Widget Properties

Every native widget supports a set of properties (e.g. a text or a color). These properties can be read and written directly or using the Widget's `get()` and `set()` methods.

```js
widget.text = 'Hello World';
let text = widget.text;
```

Example with `get()` and `set()`:

```js
widget.set('text', 'Hello World');
let text = widget.get('text');
```

Like with the constructor, it's also possible to set multiple property values:

```js
button.set({
  text: 'OK',
  background: 'blue'
});
```

When trying to set an invalid value (e.g. a value of the wrong type), the value will be converted if possible, otherwise it will be ignored with a warning printed to the developer console. The `set()` method will also print a warning for unsupported properties.

## Events

Widgets can notify listeners of events such as a user interaction or a property change. Event listeners can be added using the methods `on()` and `once()`, and removed using `off()`.

Example:

```js
function selectionHandler(event) {
  console.log('Button ' + event.target.text + ' selected!');
};
button.on('select', selectionHandler);
```

The listener function is called with an instance of [EventObject](./api/EventObject.md) that may include a number of additional properties depending on the event type.

> :point_right: Event types are case sensitive.

A *context* object may be given as the third parameter to `on()`. This object will then be available as `this` inside the listener function.

```js
function selectionHandler() {
  console.log(this.foo);
};
button.on('select', selectionHandler, {foo: 'Hello World'});
```

The method `once()` does the same as `on()`, but it removes the listener after it has been invoked by an event.

To remove a listener, use the method `off()`.

### Change Events

All widgets support property change events that are fired when a property value changes. All change events are named `[propertyName]Changed` and provide a `ChangeEvent`.

In addition to the common event properties, change events have a property `value` that contains the new value of the property.

Example:

```js
new TextInput().on('textChanged', (event) => {
  console.log('The text has changed to: ' + event.value);
});
```

It's often convenient to use the [ES6 destructuring syntax](http://exploringjs.com/es6/ch_destructuring.html) for the event parameter, which allows to extract event properties as named variables:

```js
checkBox.on('selectionChanged', ({target, value: checked}) => {
  target.text = checked ? 'checked' : 'unchecked';
});
```

## Animations

All widgets have the method [`animate(properties, options)`](api/Widget.md#animateproperties-options). It expects a map of properties to animate (akin to the `set` method), and a set of options for the animation itself.
All animated properties are set to their target value as soon as the animation starts. Therefore, calling `get` will always return either the start or target value, never one in between.
Only the properties `transform` and `opacity` can be animated.

The `animate` method returns a Promise that is resolved once the animation is completed. If the animation is aborted, e.g. by disposing the widget, the promise is rejected.

Example:

```js
label.animate({
  opacity: 0,
  transform: {
    translationX: 200,
    scaleX: 0.1
  }
}, {
  duration: 1000,
  easing: 'ease-out'
}).then(() => label.dispose());
```

## The Widget Tree

### Setting the Parent

To become visible, a widget needs a parent. The top-level parent of all widgets is the content view (`ui.contentView`). Widgets can be included in the widget hierarchy using `append()` or `appendTo()`.

Example:

```js
let button = new Button({
  text: 'OK',
  ...
}).appendTo(parent);
```

If the widget already has a parent, it is removed from the actual parent and appended to the new one. An *addChild* event is triggered on the parent.

It's also possible to add multiple widgets to the same parent using `append()`:

```js
page.append(okButton, cancelButton);
```

### Traversing

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

## Disposing of a Widget

The `dispose` method disposes of the widget and all of its children. It triggers a *removeChild* event on the parent and a *dispose* event on itself.

Example:

```js
button.on('dispose', () => console.log('Button disposed!'));
button.dispose();
```

After a widget is disposed none of its methods will work except `isDisposed()`, which returns `true` if the widget has been disposed, otherwise `false`.
