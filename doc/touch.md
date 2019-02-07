---
---
Gesture and Touch Events
========================

## Gesture Events

In Tabris.js there are 13 high-level gesture events based on 4 basic gesture types:

Gesture | Description
-|-
[`tap`](./api/Widget.md#tap) | Fired once when a finger briefly touched the widget.
[`longPress`](./api/Widget.md#longPress) | Fired when a finger touched the widget for a longer period of time (about a second, may depend on the platform), and again when lifting the finger.
[`pan`](./api/Widget.md#pan) | Starts firing continuously as soon as a finger moved in any direction for a certain distance (about 5px, may depend on the platform). The event is always fired on the widget where the finger first touched, even if the finger is moved outside the widget.
[`panLeft`](./api/Widget.md#panLeft) | Starts firing continuously as soon as a finger moved to the left for a certain distance.
[`panRight`](./api/Widget.md#panRight) | Starts firing continuously as soon as a finger moved to the right for a certain distance.
[`panUp`](./api/Widget.md#panUp) | Starts firing continuously as soon as a finger moved upwards for a certain distance.
[`panDown`](./api/Widget.md#panDown) | Starts firing continuously as soon as a finger moved downwards for a certain distance.
[`panHorizontal`](./api/Widget.md#panHorizontal) | Starts firing continuously as soon as a finger moved to the left or right for a certain distance.
[`panVertical`](./api/Widget.md#panVertical) | Starts firing continuously as soon as a finger moved upwards or downwards for a certain distance.
[`swipeLeft`](./api/Widget.md#swipeLeft) | Fired once when a finger quickly moved to the left for a certain (longer) distance (may depend on platform).
[`swipeRight`](./api/Widget.md#swipeRight) | Fired once when a finger quickly moved to the right for a certain (longer) distance (may depend on platform).
[`swipeUp`](./api/Widget.md#swipeUp) | Fired once when a finger quickly moved upwards for a certain (longer) distance (may depend on platform).
[`swipeDown`](./api/Widget.md#swipeDown) | Fired once when a finger quickly moved downwards for a certain (longer) distance (may depend on platform).

All gesture event objects provide (in addition to [EventObject API](./api/EventObject.md)) a `touches` property which is an array of coordinates, i.e. `{x: number, y: number}[]`. The x/y values values are DIP (device independent pixel) coordinates relative to the top-left corner of the widget that fires the event.

Example:

```js
widget.onSwipeLeft(ev => console.log(`Swiped left by ${ev.touches[0].x}px`));
```

Some gesture events also provide a `state` property of the type `string`:

State      | Description
-----------|------------
`"start"`  | The gesture started, i.e. the finger starts moving (`pan`) or has been held down long enough (`longPress`).
`"change"` | The gesture continued by moving a finger (`pan` only).
`"end"`    | The gesture ended by lifting all fingers (`pan` and `longPress`).
`"cancel"` | The gesture was interrupted, e.g. by a dialog pop-up (`pan` and `longPress`).

Example:

```js
widget.onLongPress(e => {
  if (e.state === 'start') {
    widget.background = 'red';
  } else {
    widget.background = 'transparent';
  }
});
```

Pan gesture events also contain these additional properties of the type `number`:

Property       | Description
---------------|------------
`translationX` | Current touch coordinates relative to the coordinates of the first touch
`translationY` | Current touch coordinates relative to the coordinates of the first touch
`velocityX`    | Current touch velocity in pixels per second
`velocityY`    | Current touch velocity in pixels per second


### Gestures in scrollable/panable Widgets

In a scrollable widget, like `ScrollView` or `CollectionView`, a recognized **pan** or **swipe** gesture in a non-scrollable direction will prevent scrolling. Therefore, attaching a `panHorizontal` listener to a widget in a vertically scrolling `ScrollView`, will prevent scrolling for any gesture that starts with a horizontal movement. When no pan listener is attached or the movement starts in a vertical direction, scrolling is still possible.

## Touch Events

Touch events are a low-level alternative to gesture events. They should only be used in case an interaction can not be accurately represented by a gesture. The target of all touch events is the widget that was touched first. Available touch event types are:

Event | Description
-|-
[`touchStart`](./api/Widget.md#touchStart) | Fired when a finger touches the widget.
[`touchMove`](./api/Widget.md#touchMove) | Fired repeatedly while swiping across the screen after initiating a `touchStart` event.
[`touchEnd`](./api/Widget.md#touchEnd) | Fired when the touch interaction ends (i.e. the finger is lifted up) on the same widget that received the `touchStart` event.
[`touchCancel`](./api/Widget.md#touchCancel) | Fired instead of `touchEnd` when the touch interaction ends on another widget than it started.

All touch event objects provide (in addition to [EventObject API](./api/EventObject.md)) a `touches` property which is an array of "touch" objects providing multiple coordinates as `number` values representing DIP (device independent pixel).

Touch Property | Description
---------------|------------
`x`            | Horizontal offset of the touch relative to the widget's left edge.
`y`            | Vertical offset of the touch relative to the widget's top edge.
`absoluteX`    | Horizontal offset of the touch relative to its `ContentView`.
`absoluteY`    | Vertical offset of the touch relative to its `ContentView`.

> :point_right: Since multiple touches are currently not supported, the `touches` array always has one element.

Example:
```js
widget.onTouchStart(ev => {
  const x = ev.touches[0].absoluteX;
  const y = ev.touches[0].absoluteY;
  // ...
});
```
