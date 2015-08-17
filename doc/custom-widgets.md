# Custom Widgets

> <img align="left" src="img/note.png"> <i>The custom widget API is not final yet. It may change without prior notice!</i>

Custom widgets are written in JavaScript the language available for the native platforms, using the interfaces of the native Tabris.js clients, and wrapped in a Cordova plug-in. This article covers the JavaScript part of the implementation

## Registering a Custom Widget in JavaScript

Custom widgets must be registered in JavaScript in order to allow creating instances using the `tabris.create()` method and to let the JavaScipt part communicate with your native implementation. This is done using the method `registerWidget`:

```javascript
    tabris.registerWidget(type, definition);
```

The parameter `type` is the name of the widget that is used to create instances using `tabris.create()`. Type names should begin with an upper-case character, internal types are prefixed with an underscore, e.g. "_myInternalWidget".

The second parameter `definition` is an object with the following members:

* `_type`: The native type to be used in the native bridge `create` operation, if it differs from the type used in JavaScript. Defaults to the type that was specified in the first parameter.
* `_properties`: An object that defines the properties that should be forwarded to the native widget (see below).
* `_events`: An object that defines the events that are supported by the native widget (see list below).
* `_supportsChildren`: If set to `true`, the custom widget will support children. Otherwise, an error will be thrown when attempting to append a child.

### Properties

The `_properties` object maps property names to their definitions. Properties described in the Tabris.js documentation for `Widget` are automatically defined. A property can be defined using one of these syntaxes:

* A property type identifier (see below).
* A *map* with any of these entries:
    * `type`: One of the property type identifiers listed below. Same effect as giving the type directly. If omitted, any value is accepted.
    * `default`: A default value to return when the property has not yet been set.
    * `nocache`: If set to true the property value will never be cached in JavaScript. Use this for all properties that can change on the native side, e.g. selection.

The type identifier determines how the property value is checked/encoded/converted before passing it to the native side.

#### Example

```javascript
properties: {
  text: "string",
  selection: {
    type: "number",
    default: 0
  },
  ...
}
```

#### Available property types

* `"any"`: Accepts any value. The value is not checked or converted.
* `"boolean"`: Accepts `true` or `false`, all other values are converted as determined by the JavaScript language ("truthy"/"falsy" values).
* `"string"`:  Accepts any strings, any non-string is converted as determined by the JavaScript language (e.g. `23.0` becomes `"23"`).
* `"natural"`: Accepts any number equal or greater than zero and smaller than infinity, with any non-round number being rounded. Any other value (including `NaN`) is rejected.
* `"integer"`: Accepts any number equal or greater than -infinity and smaller than infinity, with any non-round number being rounded. Any other value (including `NaN`) is rejected.
* `"color"`: Accepts any value describing a color as outlined in the Tabris.js documentation, other values are rejected. Will be passed as an [r, g, b, a] array to the native side.
* `"font"`: Accepts any value describing a font as outlined in the Tabris.js documentation, other values are rejected. Will be passed as an [[family*], size, bold, italic] array to the native side.
* `"image"`: Accepts any value describing an image as outlined in the Tabris.js documentation, other values are rejected. Will be passed to the native side as an object as described in the Tabris.js documentation.
* `["choice", ["op1", "op2", ...]]` allows `"op1"`, `"op2"`, etc. Other values are rejected.
* `["choice", ["op1": "encodedOp1", ...}]` allows `"op1"` and encodes it as `"encodedOp1"`. Other values are rejected.
* `"array"`: Accepts any array.
* `"array:<type>"`: Accepts array whose entries are all of the type `<type>`, or can be converted to `<type>` as described above.
* `"nullable:<type>"`: Accepts null or `<type>` or any value that can be converted to `<type>` as described above.

Rejected values will not be passed on in a `set` operation and cause a console warning to be logged.

### Events

Widgets can send events to the JavaScipt code by issuing `notify` operations on the native bridge. To enable events on your custom widget, you have to declare the events in the `_events` map in `registerWidget`.  Events described in the Tabris.js documentation for `Widget` are automatically defined.

Valid values for the `_events` map are:


* `true`: passes the name of the event to the `listen` operation without any changes.
* A *map* with any of these entries:
    * `trigger`: A function that will be called instead of proxy.trigger for this event type.

#### Example

```javascript
_events: {
  select: {
    trigger: function(event) {
      this.trigger("select", this, event);
    }
  }
}
```
