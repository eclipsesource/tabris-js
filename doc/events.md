dispose
=======
Fired on widget dispose. The event handler argument is an empty object.

focusin
=======
Fired on widget focus gain. The event handler argument is an empty object.

focusout
=======
Fired on widget focus lost. The event handler argument is an empty object.

resize
======
Fired on object bounds resize. The event handler argument is an object
containing the following properties:

* `x` - object `x` position
* `y` - object `y` position
* `width` - object width
* `height` - object height

scroll
======
Fired on scroll. The event handler argument is an object containing the
following properties:

* `x` - x coordinate scrolling position
* `y` - y coordinate scrolling position

selection
=========
Fired on widget selection. The event handler argument is an empty object.

longpress
=========
Fired after initiating a *touchstart* event for the same widget and holding the
pointer in position for a specific amount of time. The event handler argument is
an empty object.

touchend
========
A touch event fired when the touch interaction is over, i.e. when the user has
lifted up his finger. *touchend* is only fired on the widget that received the
*touchstart* event for the same touch.

touchmove
=========
A touch event continously fired for every movement while dragging across the
screen after initiating a *touchstart* event. *touchmove* is only fired on the
widget that received the *touchstart* event for the same touch.

touchstart
==========
A touch event fired on touching a widget.

Touch event object
==================
Touch event objects contain the following properties:

* *touches* is an array of objects containing x and y coordinates of the touch
position. It contains one touch object as multitouch is not currently supported.
* *time* is a number in milliseconds which represents the time past since the
start of the app.