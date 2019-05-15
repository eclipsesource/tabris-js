import {ImageView, Picker, TextView, contentView} from 'tabris';

/** @type {Array<tabris.ImageView['scaleMode']>} */
const SCALE_MODES = ['auto', 'fit', 'fill', 'stretch', 'none'];
const IMAGES = [
  {name: 'Large', src: 'resources/salad.jpg', scale: 3},
  {name: 'Small', src: 'resources/landscape.jpg', scale: 3}
];

contentView.append(
  <$>
    <ImageView centerX top={16} width={200} height={200}
        background='rgb(220, 220, 220)'
        image={IMAGES[0]}/>
    <TextView left={16} top='prev() 32' width={96} text='Image'/>
    <Picker left='prev()' right={16} baseline='prev()'
        itemCount={IMAGES.length}
        selectionIndex={0}
        itemText={index => IMAGES[index].name}
        onSelect={ev => $(ImageView).only().image = IMAGES[ev.index]}/>
    <TextView left={16} top='prev() 32' width={96}>Scale mode</TextView>
    <Picker right={16} left='prev()' baseline='prev()'
        itemCount={SCALE_MODES.length}
        selectionIndex={0}
        itemText={index => SCALE_MODES[index]}
        onSelect={ev => $(ImageView).only().scaleMode = SCALE_MODES[ev.index]}/>
  </$>
);
