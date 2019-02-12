```js
import {Switch, contentView} from 'tabris';

new Switch()
  .onSelect(() => console.log('Switch toggled'))
  .appendTo(contentView);
```
