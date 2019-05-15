import {ImageView, Slider, Stack, contentView} from 'tabris';

contentView.append(
  <Stack stretch padding={16} spacing={16} >
    <ImageView width={100} height={250}
        image='resources/target_200.png'
        background='#aaaaaa'
        scaleMode='auto'/>
    <Slider stretchX minimum={50} selection={100} maximum={300}
        onSelectionChanged={ev => $(ImageView).only().width = ev.value}/>
  </Stack>
);
