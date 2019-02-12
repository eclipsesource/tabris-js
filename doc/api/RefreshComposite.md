```js
import {RefreshComposite, contentView} from 'tabris';

new RefreshComposite({layoutData: 'fill'})
  .onRefresh(() => console.log('Refreshing...'))
  .appendTo(contentView);
```
