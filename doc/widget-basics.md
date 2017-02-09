# Widget Basics

## Creating Native Widgets

The UI of a Tabris.js app consists of native widgets, represented by JavaScript objects. There are many different types of widgets such as `Button`, `TextView`, or `ScrollView`. Every widget type is a subtype of [Widget](api/Widget.md).

Here's how you create and initialize a widget in Tabris.js:

```js
var button = new tabris.Button({
  left: 10,
  top: 10,
  text: "OK"
});
```

Widgets have methods to modify their properties, be notified of events, and append widgets to a parent widget. Most of these methods return the widget itself to allow method chaining.

## Widget Properties

Every native widget supports a set of properties (e.g. a text or a color). These properties can be read and written using the [property API](api/Properties.md) methods `get` and `set`, respectively. Widget's properties can also be written or read by directly accessing fields on the widget object. For example, `var text = widget.text;` is the same as `var text = widget.get("text");` and `widget.text = "foo";` is the same as `widget.set("text", "foo");`. If the property is supported, but the given value is of the wrong type, the value will either be converted (if boolean or string are expected), or ignored with a printed warning.

Example with `get` and `set`:

```js
widget.set("text", "Hello World");
var text = widget.get("text");
```

Example with field access:

```js
widget.text = "Hello World";
var text = widget.text;
```

Like with the constructor, it's also possible to give an object defining multiple property values:

```js
button.set({
  text: "OK",
  background: "blue"
});
```

Even if a property is not explicitly supported by the widget it can still be set and fire appropriate change events. This can be used to attach arbitrary data to a widget. *Note that this does only work using `set` and `get`.* Using direct field access with properties unkown to Tabris.js will not work correctly unless you also define a JavaScript property that redirects to `set` and `get` using [Object.defineProperty](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty). Example:

```js
Object.defineProperty(myCustomComponent, 'foo', {
  set: function(value) {
    this.set('foo', value);
  },
  get: function() {
    return this.get('foo');
  }
});
```

Where `myCustomComponent` can be either an instance of a Tabris.js widget, or an ES6 class extending a Tabris.js widget.

## Events

Widgets can fire a number of events, e.g. on touch or on modification. Event listeners can be added using the [event API](api/Events.md) methods `on` and `once`, and removed using `off`.

Example:

```js
var selectionHandler = function(button) {
  console.log("Button " + button.get("text") + " selected!");
};
button.on("select", selectionHandler);
```

Depending on the event type the listener function is called with a list of parameters, where the first parameter is usually the widget itself.

> <img align="left" src="img/note.png"> <i>Event types are case sensitive. All Tabris.js event types are lowercase.</i>

An "context" object may be given as the third `on` parameter. This object will then be available as `this` inside the listener function.

```js
var selectionHandler = function() {
  console.log(this.foo);
};
button.on("select", selectionHandler, {foo: "Hello World"});
```

The `once` method does the same as `on`, but removes the listener after it has been invoked by an event.

To remove a listener, use the method `off`.

### Change Events

All widgets support property change events. Change events are fired for all property changes, no matter how or why the change occurred, or if the property is supported by the widget. All change events are named `change:[propertyName]` and have the same parameters: `target`, `value`, `options`.

Example:

```js
new tabris.TextInput().on("change:text", function(textInput, text, options) {
  console.log("The text has changed to: " + text);
});
```

The `options` object may contain additional information about the event. It may be as the final parameter when calling `set` (`widget.set(property, value, options)` or `widget.set(properties, options)`).

## Animations

All widgets have the method [`animate(properties, options)`](api/Widget.md#animateproperties-options). It expects a map of properties to animate (akin to the `set` method), and a set of options for the animation itself.
All animated properties are set to their target value as soon as the animation starts. Therefore, calling `get` will always return either the start or target value, never one in between.
Only the properties `transform` and `opacity` can be animated.

Each animate call will be followed by up to two events fired on the widget:

- *animationstart*: Fired once the animation begins, i.e. after the time specified in `delay`, or immediately on calling `animate`.
- *animationend*: Fired after the animation finishes. Not fired if the widget is disposed before that.

The animation event listeners are called with the widget as the first parameter, and the options given to `animate` as the second.

Example:

```js
label.once("animationend", function(label, options) {
  if (options.name === "my-remove-animation") {
    label.dispose();
  }
});

label.animate({
  opacity: 0,
  transform: {
    translationX: 200,
    scaleX: 0.1
  }
}, {
  duration: 1000,
  easing: "ease-out",
  name: "my-remove-animation"
});
```

The `animate` method also returns a promise that is resolved once the animation is completed. If the animation is aborted, e.g. by disposing the widget, the promise is rejected. Often it's more readable to use the promise over the `animationend` event:

```js
label.animate({
  opacity: 0,
  transform: {
    translationX: 200,
    scaleX: 0.1
  }
}, {
  duration: 1000,
  easing: "ease-out"
}).then(function() {
  label.dispose();
});
```

## The Widget Tree

### Setting the Parent

To be visible, a widget needs a parent. The top-level parent of every UI is a `Page`. Widgets can be included in the widget hierarchy using `append` or `appendTo`.

Example:

```js
var button = new tabris.Button({
  text: "OK",
  ...
}).appendTo(page);
```

If the widget already has a parent, it is de-registered from the actual parent and registered with the new one. Triggers an *addchild* event on the parent.

It's also possible to add any number of widgets to the same parent using `append`:

```js
page.append(okButton, cancelButton);
```

### Traversing
See also: [Selector API](selector.md)

The current parent of a widget is returned by the [`parent`](api/Widget.md#parent) method, and the children by the [`children`](api/Widget.md#children) method.

Example:

```js
var parent = widget.parent();
var firstChild = parent.children()[0];
var lastChild = parent.children().last();
```

The result list of children is an array-like object of the type [`WidgetCollection`](api/WidgetCollection.md).

## Disposing of a Widget

The `dispose` method disposes of the widget and all of its children. Triggers a *removechild* event on the parent and a *dispose* event on itself.

Example:

```js
button.on("dispose", function() {
  console.log("Button disposed!");
});
button.dispose();
```

After a widget is disposed none of its methods will work except `isDisposed`, which returns `true` if the widget has been disposed, otherwise `false`.
