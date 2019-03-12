```js
let children = page.children();
for (let child of children) {
  console.log(child.id);
}
```

As a JSX element via the `$` alias:

```jsx
import {contentView, $, TextView} from 'tabris';

contentView.append(
  <$>
    <TextView>Hello</TextView>
    <TextView top='prev()'>World</TextView>
  </$>
);
```
