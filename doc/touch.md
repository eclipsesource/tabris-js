Gesture and Touch Events
========================

## Gesture Events

In Tabris.js there are 13 gesture events based on 4 basic gesture types:  

- `tap`
- `longpress`
- `pan`
- `pan:left` 
- `pan:right` 
- `pan:up`
- `pan:down` 
- `pan:horizontal` 
- `pan:vertical`
- `swipe:left`
- `swipe:right` 
- `swipe:up`
- `swipe:down` 

Example:

```javascript
widget.on("swipe:left", function(event) {
  moveWidgetLeft();
};
```

Each gesture type ("tap", "longpress", "pan" and "swipe") has a different event object. However, the `touches` property is the same for all. It provides an array of touch coordinates for each finger currently touching the display, relative to the origin coordinates of the widget. The other properties are: 

- **tap**:  
    - **state**: *string* - `"recognized"` (widget was tapped)
    - **touches**: *[{x: number, y: number}]* 
- **longpress**: 
     - **state**: *string* - `"start"` (widget has been hold down long enough) then `"end"`/`"cancel"` (gesture ended/aborted)
     - **touches**: *[{x: number, y: number}]*
- **pan**: 
     - **state**: *string* - `"start"` (finger starts moving), then `"change"` (is moving), then `"end"`/`"cancel"` (gesture ended/aborted)
     - **touches**: *[{x: number, y: number}]*
     - **translation**: *{x: number, y: number}* - current offset to the coordinates of the first touch 
     - **velocity**: *{x: number, y: number}* - current velocity in pixels per second
- **swipe**: 
    - **event.state**: *string* - `"recognized"` (finger traveled in one direction with a certain speed)
    - **event.touches**: *[{x: number, y: number}]*

The **swipe** gesture event is only fired once per touch. Therefore `swipe:left` fires if the finger moves quickly to the left, but then no swipe event (for any direction) will be fired again until the finger is released.

The **pan** gesture may be used without giving a direction, in which case it is fired as soon as the finger starts moving in any direction. The distance the finger needs to travel before the gesture event fires is very small, but the exact value may depend on the platform. If a direction is given it is only relevant for the *initial* direction the finger moves. So `pan:left` fires a start event if that is the first direction the finger moves in, but afterwards change events are fired regardless of direction.

In a `ScrollView` (or `CollectionView`) a recognized **pan** or **swipe** gesture in a non-scrollable direction will prevent scrolling. Therefore, attaching a `pan:horizontal` listener to a widget in a vertically scrolling `ScrollView`, will prevent scrolling for any gesture that starts with a horizontal movement. When no pan listener is attached or the movement starts in a vertical direction, scrolling is still possible.

## Touch Events
Touch events are a low-level alternative to gesture events. They should only be used in case an interaction can not be accurately represented by a gesture. The API and behavior is also not yet considered stable.

Touch events follow the names and patterns established in HTML in order to support interoperability, e.g. with the HTML5 Canvas API. Currently, there are some known issues (see below).

### Event types

The target of all touch events is the widget that was touched first.

#### touchstart
Fired when a widget is touched.

#### touchmove
Fired repeatedly while swiping across the screen after initiating a `touchstart` event. `touchmove` is only fired on the widget that received the `touchstart` event for the same touch.

#### touchend
Fired when the touch interaction ends (i.e. the finger is lifted up) on the same widget that received the `touchstart` event. `touchend` is only fired on the widget that received the `touchstart` event for the same touch.

#### touchcancel
Fired instead of `touchend` when the touch interaction ends on another widget than it started.

### Event Object

Event handlers for touch events receive an event object as single parameter. This event object includes the following properties:

- **time**: *number* - number of milliseconds since the start of the app
- **touches**: *[touch, ...]* - an array of touch objects for all current touches. Since multiple touches are currently not supported, this array has always one element.

#### Touch Object

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
