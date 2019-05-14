```js
import {Canvas, contentView} from 'tabris';

new Canvas({layoutData: 'stretch'})
  .onResize(({target: canvas, width, height}) => {
    let context = canvas.getContext("2d", width, height);
    context.moveTo(0, 0);
    // ...
  }).appendTo(contentView);
```
