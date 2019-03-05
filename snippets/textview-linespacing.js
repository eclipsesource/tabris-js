import {Composite, Slider, TextView, contentView} from 'tabris';

const textView = new TextView({
  left: 16, top: 16, right: 16,
  text: 'And thus the first man of the Pequod that mounted the mast to look out for ' +
  'the White Whale, on the White Whale\'s own peculiar ground; that man was ' +
  'swallowed up in the deep. But few, perhaps, thought of that at the time. ' +
  'Indeed, in some sort, they were not grieved at this event, at least as a ' +
  'portent; for they regarded it, not as a foreshadowing of evil in the ' +
  'future, but as the fulfilment of an evil already presaged. They declared ' +
  'that now they knew the reason of those wild shrieks they had heard the ' +
  'night before. But again the old Manxman said nay.'
}).appendTo(contentView);

const controls = new Composite({
  left: 0, right: 0, bottom: 0
}).appendTo(contentView);

const spacingView = new TextView({
  right: 16, width: 32, centerY: 0
}).appendTo(controls);

const slider = new Slider({
  left: 16, right: [spacingView, 16], bottom: 16, top: 16,
  minimum: 2,
  maximum: 50
}).onSelectionChanged(({value}) => {
  const lineSpacing = value / 10;
  textView.lineSpacing = lineSpacing;
  spacingView.text = `${lineSpacing}`;
}).appendTo(controls);

slider.selection = 15;
