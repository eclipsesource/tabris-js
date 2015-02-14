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

The animate method returns an `Animation` object supporting event handling. It's methods `on`, `off`, `once` and `trigger` function just like on `Widget`. It also has a `cancel` method to stop the animation.

Supported Events:
- *start*: Fired once the animation begins, i.e. after the time specified in `delay`
- *progress*: Fired for each frame of the animation
- *completion*: Fired after the animation finishes. Not fired if `cancel` is used

While the animation runs the properties are continuously updated. Calling `get` will return the current value. When the animation stops (due to completion or by `cancel`) the properties will remain at their last animated value. 

Example:
```javascript
label.animate({
  opacity: 0,
  transform: {
    translationX: 200,
    translationY: 200,
    scaleX: 0.1,
    scaleY: 0.1
  }
}, {
  duration: 1000,
  easing: "ease-out"
}).on("completion", function() {
  label.dispose();
});
```
