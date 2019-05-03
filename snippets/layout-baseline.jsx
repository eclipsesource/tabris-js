import {$, contentView, TextInput, TextView} from 'tabris';

contentView.append(
  <$>
    <TextView left={16} baseline='next()'>Label</TextView>
    <TextInput left='prev() 16' right={16} top={16}>Text</TextInput>
  </$>
);
