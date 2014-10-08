tabris.js touch events
======================

Event types
-----------

* `touchstart` Fired when the user starts touching the screen.
* `touchmove` Fired repeatedly while the user swipes across the screen.
* `touchend` Fired when the user stops touching the screen.
* `longpress` Fired when the user touches and holds a widget for a about a second.

The target of all touch events is the first touched widget. Multiple touches are currently ignored.
Touch events do not yet "bubble", i.e. parents do not receive events if a child is touched.
The `touchend` event is fired regardless of how and where the touch ended. A `touchcancel` event
may be implemented in the future.


Event Object
------------

```
{
  touches : [*touch] // An array of all current touches.
}
```

Touch Object
------------

```
{
  x : number // Horizontal offset relative to the current page
  y : number // Vertical offset relative to the current page
}
```
