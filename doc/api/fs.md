```js
import {fs} from 'tabris';

fs.writeFile(fs.cacheDir + '/file.txt', "Hello World!")
  .then(() => console.log(`File written successfully`))
  .catch(error => console.error(error));
```
