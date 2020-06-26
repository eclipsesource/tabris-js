import {Button, contentView, fs, Stack, TextView} from 'tabris';

contentView.append(
  <Stack stretchX padding={16} spacing={16}>
    <Button text='Open file'
        onSelect={async () => $(TextView).only().text = (await fs.openFile()).map(file => file.name).toString()}/>
    <TextView/>
  </Stack>
);
