import {Button, Switch, TextView, contentView} from 'tabris';

const MSG_CHECKED = 'State: checked';
const MSG_UNCHECKED = 'State: unchecked';

contentView.set({padding: 16}).append(
  <$>
    <Switch checked
        onCheckedChanged={() => label.text = switcher.checked ? MSG_CHECKED : MSG_UNCHECKED}/>
    <TextView left='prev() 16' baseline text={MSG_CHECKED}/>
    <Button top='Switch 16' text='Toggle Switch'
      onSelect={() => switcher.checked = !switcher.checked}/>
  </$>
);

const switcher = $(Switch).only();
const label = $(TextView).only();
