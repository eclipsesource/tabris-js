# Animations

## The animate method.

All widgets have the method `animate(properties, options)`. It expects a map of properties to animate (akin to the `set` method), and a set of options for the animation itself.

Parameters:

- *properties*: a set of widget properties to set (*object*). Currently, only the properties `transform` and `opacity` can be animated
- *options*: the properties of the animation itself
    - *delay*: time to wait until the animation starts in ms, defaults to `0`
    - *duration*: duration of the animation in ms
    - *easing*: one of `linear`, `ease-in`, `ease-out`, `ease-in-out`
    - *repeat*: number of times to repeat the animation, defaults to `0` (i.e. play one, zero repeats).
    - *reverse*: plays the animation backwards if set to `true`
    - *name*: an arbitrary string that may be used to identify the animation in an animation event.

Each animate call will be followed by up to two events fired on the widget:

- *animationstart*: Fired once the animation begins, i.e. after the time specified in `delay`, or immediately on calling `animate`.
- *animationend*: Fired after the animation finishes. Not fired if the widget is disposed before that.

The animation event listeners are called with the widget as the first parameter, and the options given to `animate` as the second.

Example:

```javascript
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

The animated properties are set to their target value as soon as the animation starts. Therefore, calling `get` will always return either the start or target value, never one in between.
