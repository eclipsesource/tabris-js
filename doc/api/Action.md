```js
import {Action, NavigationView, contentView} from 'tabris';

const navigationView = new NavigationView({layoutData: 'fill'})
  .appendTo(contentView);

new Action({
  title: 'Settings',
  image: 'resources/settings.png'
}).onSelect(() => console.log('Settings selected'))
  .appendTo(navigationView);
```
