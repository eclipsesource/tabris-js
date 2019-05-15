import {ImageView, contentView, Stack} from 'tabris';

const attributes = {width: 250, height: 100, image: 'resources/target_200.png', background: '#aaaaaa'};

contentView.append(
  <Stack stretch padding={16} spacing={16}>
    <ImageView scaleMode='fit' {...attributes}/>
    <ImageView scaleMode='none' {...attributes}/>
    <ImageView scaleMode='fill' {...attributes}/>
  </Stack>
);
