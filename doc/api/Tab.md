```js
import {Tab, TabFolder, contentView} from 'tabris';

new TabFolder({left: 0, top: 0, right: 0, bottom: 0})
  .append(new Tab({title: 'Albums'}))
  .append(new Tab({title: 'Artists'}))
  .onSelect(({selection}) => console.log(`Tab changed to ${selection}`))
  .appendTo(contentView);
```
