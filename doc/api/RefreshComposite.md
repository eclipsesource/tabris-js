```js
import {RefreshComposite, contentView} from 'tabris';

new RefreshComposite({layoutData: 'stretch'})
  .onRefresh(() => console.log('Refreshing...'))
  .appendTo(contentView);
```
