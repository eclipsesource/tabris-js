```js
import {Stack, contentView} from 'tabris';

const stackComposite = new Stack({
  layoutData: 'fill',
  spacing: 16
}).appendTo(contentView);

stackComposite.append(
   new TextView({text: 'top'}),
   new TextView({text: 'center'}),
   new TextView({text: 'bottom'})
);
```
