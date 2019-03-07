import {TextInput, TextView, contentView, WidgetCollection} from 'tabris';

contentView.append(
  <WidgetCollection>
    <TextView left={16} top={16}>Label:</TextView>
    <TextInput left='prev() 16' baseline>Text</TextInput>
  </WidgetCollection>
);
