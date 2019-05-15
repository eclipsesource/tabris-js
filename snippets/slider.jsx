import {Slider, TextView, contentView} from 'tabris';

contentView.set({padding: 16}).append(
  <$>
    <TextView centerX top='30%' font='22px sans-serif' text='50'/>
    <Slider left={40} right={40} top='prev() 20' minimum={-50} selection={50} maximum={150}
        onSelectionChanged={ev => $(TextView).only().text = `${ev.value}`}/>
  </$>
);
