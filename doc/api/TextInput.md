```js
import {TextInput, contentView} from 'tabris';

new TextInput({
  left: 16, right: 16,
  message: 'Name'
}).onInput(({text}) => console.log(`Text changed to ${text}`))
  .appendTo(contentView);
```
