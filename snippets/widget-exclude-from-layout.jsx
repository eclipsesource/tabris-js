import {Stack, CheckBox, TextView, contentView} from 'tabris';

contentView.append(
  <Stack padding={16} spacing={8}>
    <CheckBox onSelect={handleSelect}>Exclude Widget 2 from layout</CheckBox>
    <TextView>Widget 1</TextView>
    <TextView id='target'>Widget 2</TextView>
    <TextView>Widget 3</TextView>
  </Stack>
);

const target = $('#target')[0];
const checkBox = $(CheckBox)[0];

function handleSelect() {
  target.excludeFromLayout = checkBox.checked;
}
