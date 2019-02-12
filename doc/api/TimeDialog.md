```js
import {TimeDialog} from 'tabris';

new TimeDialog()
  .onSelect(({date}) => console.log(`Selected ${date}`))
  .open();
```
