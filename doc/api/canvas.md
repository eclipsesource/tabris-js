Example:

```javascript
tabris.create("Canvas", {
  layoutData: {left: 0, top: 0, right: 0, bottom: 0}
}).on("resize", function(canvas, bounds) {
  var ctx = canvas.getContext("2d", bounds.width, bounds.height);
  ctx.moveTo(0, 0);
  // ... 
}).appendTo(page);
```

The following CanvasRenderingContext2D methods are supported:

* save
* restore
* beginPath
* closePath
* lineTo
* moveTo
* bezierCurveTo
* quadraticCurveTo
* rect
* arc
* scale
* rotate
* translate
* transform
* setTransform
* clearRect
* fillRect
* strokeRect
* fillText
* strokeText
* fill
* stroke
* measureText

The following CanvasRenderingContext2D properties are supported:

* lineWidth
* lineCap
* lineJoin
* fillStyle
* strokeStyle
* textAlign
* textBaseline
