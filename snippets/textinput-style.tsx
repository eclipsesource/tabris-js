import {contentView, Stack, TextInput} from 'tabris';

contentView.append(
  <Stack stretch spacing={16} padding={16} alignment='stretchX'>
    <TextInput style='outline' message='outline'/>
    <TextInput style='fill' message='fill'/>
    <TextInput style='underline' message='underline'/>
    <TextInput style='none' message='none'/>
  </Stack>
);
