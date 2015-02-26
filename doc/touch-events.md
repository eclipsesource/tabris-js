Touch Events
============

Touch events in Tabris.js follow the names and patterns established in HTML in order to support interoperability, e.g. with the HTML5 Canvas API. Currently, there are some known issues (see below).

## Event types

The target of all touch events is the widget that was touched first.

### touchstart
Fired when a widget is touched.

### touchmove
Fired repeatedly while swiping across the screen after initiating a `touchstart` event. `touchmove` is only fired on the widget that received the `touchstart` event for the same touch.

### touchend
Fired when the touch interaction ends (i.e. the finger is lifted up) on the same widget that received the `touchstart` event. `touchend` is only fired on the widget that received the `touchstart` event for the same touch.

### touchcancel
Fired instead of `touchend` when the touch interaction ends on another widget than it started.

### longpress
Fired after initiating a `touchstart` event for the same widget and holding the pointer in position for a specific amount of time (about a second). The event handler argument is an empty object.

## Event Object

Event handlers for touch events receive an event object as single parameter. This event object includes the following properties:

- **time**: *number* - number of milliseconds since the start of the app
- **touches**: *[touch, ...]* - an array of touch objects for all current touches. Since multiple touches are currently not supported, this array has always one element.

### Touch Object

Every touch object has the following properties:

- **x**: *number* - the horizontal offset relative to the target widget
- **y**: *number* - the vertical offset relative to the target widget
- **pageX**: *number* - the horizontal offset relative to the current page
- **pageY**: *number* - the vertical offset relative to the current page

Example:
```javascript
widget.on("touchstart", function(event) {
  var x = event.touches[0].pageX;
  var y = event.touches[0].pageY;
  ...
});
```

## Known issues

* Multiple touches are currently ignored.
* Touch events do not yet "bubble", i.e. parents do not receive events when a child is touched.
* On iOS, touch events on children of a ScrollComposite are only fired when their duration exceeds about 500ms.
