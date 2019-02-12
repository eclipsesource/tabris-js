```js
import {ScrollView, TextView, contentView} from 'tabris';

const scrollView = new ScrollView({layoutData: 'fill'})
  .appendTo(contentView);

new Textview({text: 'Scrollable content'}
  .appendTo(scrollView));
```
