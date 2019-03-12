import {StackComposite, CheckBox, TextView, contentView} from 'tabris';

contentView.append(
  <StackComposite padding={8} spacing={8}>
    <CheckBox onSelect={handleSelect}>Exclude Widget 2 from layout</CheckBox>
    <TextView>Widget 1</TextView>
    <TextView id='target'>Widget 2</TextView>
    <TextView>Widget 3</TextView>
  </StackComposite>
);

const target = contentView.find('#target')[0];
const checkBox = contentView.find(CheckBox)[0];

function handleSelect() {
  target.excludeFromLayout = checkBox.checked;
}
