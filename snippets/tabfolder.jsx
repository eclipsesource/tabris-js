import {Tab, TabFolder, TextView, contentView} from 'tabris';

contentView.append(
  <TabFolder paging stretch>
    <Tab title='Cart' image='resources/cart@2x.png' selectedImage='resources/cart-filled@2x.png'>
      <TextView centerX centerY>Content of Tab Cart</TextView>
    </Tab>
    <Tab title='Pay' image='resources/card@2x.png' selectedImage='resources/card-filled@2x.png'>
      <TextView centerX centerY>Content of Tab Cart</TextView>
    </Tab>
    <Tab title='Statistic' image='resources/chart@2x.png' selectedImage='resources/chart-filled@2x.png'>
      <TextView centerX centerY>Content of Tab Cart</TextView>
    </Tab>
  </TabFolder>
);
