```js
import {Slider, contentView} from 'tabris';

new Slider({
  left: 16, right: 16,
  selection: 50
}).onSelect(({selection}) => console.log(`Slider is at ${selection}`))
  .appendTo(contentView);
```
