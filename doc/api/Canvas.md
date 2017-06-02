Example:

```js
new Canvas({
  left: 0, top: 0, right: 0, bottom: 0
}).on("resize", ({target: canvas, width, height}) => {
  let ctx = canvas.getContext("2d", width, height);
  ctx.moveTo(0, 0);
  // ...
}).appendTo(page);
```
