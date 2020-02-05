import {ImageView, Picker, contentView} from 'tabris';

const COLORS = ['initial', 'red', 'green', 'blue'];

contentView.append(
  <$>
    <ImageView centerX top={64} image={{src: 'resources/cloud-check.png', scale: 3}}/>
    <Picker centerX top='prev() 16'
        itemCount={COLORS.length}
        selectionIndex={0}
        itemText={index => COLORS[index]}
        onSelect={ev => $(ImageView).only().tintColor = COLORS[ev.index]}/>
  </$>
);
