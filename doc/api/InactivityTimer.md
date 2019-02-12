```js
import {InactivityTimer} from 'tabris';

new InactivityTimer({delay: 2000})
  .onTimeout(() => console.log('Inactive'));
```
