import {Observable, contentView, TextView, Stack, TextInput} from 'tabris';

contentView.append(
  <Stack stretch padding={16} alignment='stretchX' spacing={16}>
    <TextInput font='18px'>We are listening</TextInput>
    <TextView font='18px'/>
  </Stack>
);

Observable.mutations($(TextInput).only()).subscribe(
  textInput =>
    $(TextView).set({
      text: `${textInput.selection} "${textInput.text}"`
    })
);
