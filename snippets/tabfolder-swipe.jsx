import {Tab, TabFolder, TextView, contentView} from 'tabris';

contentView.append(
  <TabFolder stretch paging tabBarLocation='hidden'>
    <Tab>
      <TextView center font='20px'>Page 1/3</TextView>
    </Tab>
    <Tab>
      <TextView center font='20px'>Page 2/3</TextView>
    </Tab>
    <Tab>
      <TextView center font='20px'>Page 3/3</TextView>
    </Tab>
  </TabFolder>
);
