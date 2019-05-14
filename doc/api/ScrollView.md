```js
import {ScrollView, TextView, contentView} from 'tabris';

const scrollView = new ScrollView({layoutData: 'stretch'})
  .appendTo(contentView);

new Textview({text: 'Scrollable content'}
  .appendTo(scrollView));
```
