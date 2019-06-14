```js
import {permission} from 'tabris';

if (permission.isAuthorized('camera')) {
  console.log('Camera permission is available');
} else {
  (async () => {
    const status = await permission.requestAuthorization('camera');
    console.log(`Camera permission has been ${status}.`);
  })();
}
```
