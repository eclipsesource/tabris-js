tabris.js objects
===============

Creating a tabris.js object
----------------

### create `tabris.create(type, properties)`

A tabris.js object can be instatiated using the `create` method. *Type* is a
string id of the object and *properties* is a object map containing the
constructor arguments, e.g.:

```javascript
var animation = tabris.create("tabris.Animation", {
  target: widget,
  delay: 1000,
  duration: 200,
  easing: "ease-in-out"
});
```

After the object has been created one can also utilize several other methods
which will be useful in the scope of a tabris.js application.

Methods
-------

### set `object.set(key, value)`

One can set object-scope properties invoking the `set` method taking strings
for the *key* and *value* attributes.

**Example:**

```javascript
label.set("customId", "foo");
```

### get `object.get(key)`

Retrieving object-scope property values is done by invoking the `get` method
on the object, which returns the corresponding value for the specified *key*
string.

**Example:**

```javascript
var labelCustomId = label.get("customId");
```

### append `parentWidget.append(type, properties)`

Every widget needs a parent. To add a widget one should call the `append` method
on the parent widget. This will instantiate the corresponding widget type for
the *type* string specified with parent the widget the method was called on and
the specified properties in the *properties* object map and finally return the
object instance.

**Example:**

```javascript
var button = page.append("Button", {
  layoutData: {left:10, top: 10, width: 64},
  text: "OK"
});
```

### call `object.call(method, parameters)`

The `call` method will call the specified string *method* on the native object
and pass on the parameters specified in the *parameters* object map to it.

**Example:**

```javascript
var swipe = mainComposite.append("tabris.Swipe", {
  itemCount: 2
});
swipe.call("add", {
  index: 0,
  control: item1.id
});
```

### on `object.on(event, listener, context)`

Invoking `on` will result in listening on the object it was called on for events
of the type *event* and attach a *listener*, which will be called when the event
of this type gets fired. One can also specify a *context* to be passed on to the
event handler.

**Example:**

```javascript
var selectionHandler = function() {
  console.log("Button selected!");
};

button.on("Selection", selectionHandler, this);
```

### off `object.off(event, listener, context)`

`off` takes the same arguments as `on`. Compared to `on` it detaches the
listener instead.

**Example:**

```javascript
button.off("Selection", selectionHandler, this);
```

### dispose `widget.dispose()`

`dispose` called on the widget disposes of the widget, destroys all of its
children widgets and triggers the *Dispose* event type.

**Example:**

```javascript
button.on("Dispose", function() {
  console.log("Button disposed!");
});
button.dispose();
```
