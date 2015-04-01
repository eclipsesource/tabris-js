# Native Widgets

## Creating a Native Widget

In Tabris.js, native widgets are created using the `tabris.create` method.

### `tabris.create(type, properties*)`

Creates a native widget of a given type and returns its reference.

Parameters:

- *type*: the type of the widget to create (*string*)
- *properties (optional)*: a set of initial widget properties (*object*)

Example:
```javascript
var button = tabris.create("Button", {
  text: "OK",
  layoutData: {right: 10, bottom: 10}
});
```

## Widget Properties

Every native widget has a set of properties (e.g. a text or a color). These properties can be read and written using the methods `get` and `set`, respectively.

### `get(name)`

Retrieves the current value of the given property from the widget and returns it.

Parameters:

- *name*: the name of the property (*string*)

Example:
```javascript
var input = textField.get("text");
```

### `set(name, value[, options])`

Sets a widget property. Returns the widget itself.

If the property is not supported by the widget, it will have no effect, but still be set. This can be used to attach arbitrary data to a widget. If the property is supported, but the given value is of the wrong type, the value will either be converted (if boolean or string are expected), or ignored with a printed warning. The options parameter is an object that will be given in the corresponding change event. 

Parameters:

- *name*: the property name (*string*)
- *value*: the new value of the property

Example:

```javascript
label.set("text", "Hello World");
```

### `set(properties[, options])`

Sets a number of widget properties at once. Returns the widget itself. The options parameter is an object that will be given in the corresponding change event.

Parameters:

- *properties*: a set of widget properties to set (*object*)

Example:
```javascript
label.set({
  text: "There were errors!",
  foreground: "red"
});
```

### `animate(properties, options)`

Changes one or more widget properties with an animation. See [Animations](animations.md). 

## The Widget Tree

To be visible, a widget needs a parent. The top-level parent of every UI is a `Page`. Widgets can be included in the widget hierarchy using `append` or `appendTo`.

### `appendTo(parent)`

Appends the widget to a parent. If the widget already has a parent, it is de-registered from the actual parent and registered with the new one. Triggers an *add* event on the parent. Returns the widget itself.

Parameters:

- *parent*: the new parent to append the widget to

Example:

```javascript
var button = tabris.create("Button", {
  text: "OK",
  ...
}).appendTo(page);
```

### `append(child, child*, ...)`

Appends one or more child widget to this widget. This method is equivalent to calling `appendTo` on every child, e.g. `parent.append(child1, child2)` is a short cut for calling `child1.appendTo(parent)` and `child2.appendTo(parent)`. Returns the widget itself.

Parameters:

- *child*: a child to append to this widget

Example:

```javascript
buttonBar.append(okButton, cancelButton);
```

### `parent()`

Returns the widget's parent.

Example:

```javascript
var parent = button.parent();
```

### `children(selector*)`

Returns the list of children of this widget as a `WidgetCollection`. 

Example:

```javascript
var firstChild = parent.children()[0];
var lastChild = parent.children().last();
```

Parameters:
- *selector (optional)* A selector to filter the list of children by. 

See also: [Selector API](selector.md)


### `find(selector*)`

Like `children`, but returns the list of all descendants of this widget as a `WidgetCollection`. 

Parameters:
- *selector (optional)* A selector to filter the list of descendants by.

See also: [Selector API](selector.md)

## Events

Widgets can fire a number of events, e.g. on touch or on modification. Event listeners can be added using the `on` method and removed using `off`. Returns the widget itself.

### `on(type, listener, context*)`

Binds a listener function to the widget. The listener will be invoked whenever an event of the given event type is fired.

Note that event types are case sensitive. All Tabris.js event types are lowercase and give the object dispatching the event as the first listener argument.

Parameters:

- *type*: the event type to listen for, case sensitive
- *listener*: the listener function to register
- *context (optional)*: the value of `this` in the listener function during invocation

Example:

```javascript
var selectionHandler = function() {
  console.log("Button selected!");
};
button.on("selection", selectionHandler);
```

### `once(type, listener, context*)`

Same as `on`, but removes the listener after it has been invoked by an event.

### `off(type*, listener*, context*)`

Removes a previously-bound listener function from a widget. If no context is specified, all of the versions of the listener with different contexts will be removed. If no listener is specified, all listeners for the event will be removed. If no type is specified, callbacks for all events will be removed. Returns the widget itself.

Parameters:

- *type (optional)*: the event type to remove listeners for
- *listener (optional)*: the listener function to remove
- *context (optional)*: the context that the listener has been registered with

Example:

```javascript
button.off("selection", selectionHandler, this);
```

### `trigger(type, param*, ...)`

Programmatically invokes all listeners for the given event type with a given set of parameters. Returns the widget itself.

Parameters:

- *type*: the event type to trigger
- *param (optional)*: A number of parameters to be passed to the listener functions

### Property Change Events

All widgets (actually, all tabris objects with event API, e.g. `device`) support property change events. Change events are fired for all property changes, not matter how or why the changed occurred, or if the property is supported by the widget. All change events are named `change:[propertyName]` and have the same parameters: `target`, `value`, `options`.

Example:

```javascript
tabris.create("TextInput").on("change:text", function(textInput, text, options) {
  console.log("The text has changed to: " + text);
});
```

## Disposing Of a Widget

### `dispose()`

Disposes of the widget and all of its children. Triggers a *remove* event on the parent and a *dispose* event on itself.

Example:

```javascript
button.on("dispose", function() {
  console.log("Button disposed!");
});
button.dispose();
```

### `isDisposed()`

Returns `true` if the widget has been disposed, otherwise `false`.
