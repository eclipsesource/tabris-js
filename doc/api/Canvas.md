Example:

```javascript
new tabris.Canvas({ left: 0, top: 0, right: 0, bottom: 0 })
  .on("resize", function(canvas, bounds) {
    var ctx = canvas.getContext("2d", bounds.width, bounds.height);
    ctx.moveTo(0, 0);
    // ...
  })
  .appendTo(page);
```
