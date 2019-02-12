```js
import {NavigationView, Page, contentView} from 'tabris';

new NavigationView({layoutData: 'fill'})
  .append(new Page({title: 'Albums'}))
  .appendTo(contentView);
```
