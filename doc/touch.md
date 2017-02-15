Gesture and Touch Events
========================

## Gesture Events

In Tabris.js there are 13 gesture events based on 4 basic gesture types:

- `tap` - Fired once when a finger briefly touched the widget.
- `longpress` - Fired when a finger touched the widget for a longer period of time (about a second, may depend on the platform), and again when lifting the finger.
- `pan` - Starts firing continuously as soon as a finger moved in any direction for a certain distance (about 5px, may depend on the platform). The event is always fired on the widget where the finger first touched, even if the finger is moved outside the widget.
- `pan:left` - Starts firing continuously as soon as a finger moved to the left for a certain distance.
- `pan:right` - Starts firing continuously as soon as a finger moved to the right for a certain distance.
- `pan:up` - Starts firing continuously as soon as a finger moved upwards for a certain distance.
- `pan:down` - Starts firing continuously as soon as a finger moved downwards for a certain distance.
- `pan:horizontal` - Starts firing continuously as soon as a finger moved to the left or right for a certain distance.
- `pan:vertical` - Starts firing continuously as soon as a finger moved upwards or downwards for a certain distance.
- `swipe:left` - Fired once when a finger quickly moved to the left for a certain (longer) distance (may depend on platform).
- `swipe:right` - Fired once when a finger quickly moved to the right for a certain (longer) distance (may depend on platform).
- `swipe:up` - Fired once when a finger quickly moved upwards for a certain (longer) distance (may depend on platform).
- `swipe:down` - Fired once when a finger quickly moved downwards for a certain (longer) distance (may depend on platform).

Example:

```js
widget.on("swipe:left", function(event) {
  moveWidgetLeft();
});
```

All gesture events have the following common properties:

- **target**: *Widget* - the widget that received the event
- **state**: *string* - contains the state of the event (see below).
- **touches**: *{x: number, y: number}[]* - an array of touch coordinates for all current touches, relative to the origin of the widget.

Pan gesture events also contain these additional properties:

- **translation**: *{x: number, y: number}* - current touch coordinates relative to the coordinates of the first touch
- **velocity**: *{x: number, y: number}* - current touch velocity in pixels per second

Event states:

- `"recognized"`: the state for gestures that fire only once (`tap` and `swipe`).
- `"start"`: the gesture started, i.e. the finger starts moving (`pan`) or has been hold down long enough (`longpress`).
- `"change"`: the gesture continued by moving a finger (`pan` only).
- `"end"`: the gesture ended by lifting all fingers (`pan` and `longpress`).
- `"cancel"`: the gesture was interrupted, e.g. by a dialog pop-up (`pan` and `longpress`).

### Gestures in scrollable/panable Widgets

In a scrollable widget, like `ScrollView` or `CollectionView`, a recognized **pan** or **swipe** gesture in a non-scrollable direction will prevent scrolling. Therefore, attaching a `pan:horizontal` listener to a widget in a vertically scrolling `ScrollView`, will prevent scrolling for any gesture that starts with a horizontal movement. When no pan listener is attached or the movement starts in a vertical direction, scrolling is still possible.

## Touch Events

Touch events are a low-level alternative to gesture events. They should only be used in case an interaction can not be accurately represented by a gesture. The target of all touch events is the widget that was touched first. Available touch event types are:

- `touchstart` - Fired when a finger touches the widget.
- `touchmove` - Fired repeatedly while swiping across the screen after initiating a `touchstart` event.
- `touchend` - Fired when the touch interaction ends (i.e. the finger is lifted up) on the same widget that received the `touchstart` event.
- `touchcancel` - Fired instead of `touchend` when the touch interaction ends on another widget than it started.

The event object includes the following properties:

- **target**: *Widget* - the widget that received the event
- **time**: *number* - number of milliseconds since the start of the app
- **touches**: *{x: number, y: number}[]* - an array of touch coordinates for all current touches, relative to the origin of the widget. Since multiple touches are currently not supported, this array has always one element.
