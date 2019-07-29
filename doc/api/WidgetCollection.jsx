// WidgetCollection as a JSX element via the `$` alias:

import {contentView, $, TextView} from 'tabris';

contentView.append(
  <$>
    <TextView>Hello</TextView>
    <TextView top='prev()'>World</TextView>
  </$>
);
