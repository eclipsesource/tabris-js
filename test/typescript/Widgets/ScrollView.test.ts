import {ScrollView, ScrollViewScrollEvent, ScrollViewProperties} from 'tabris';

let widget: ScrollView = new ScrollView();

// Properties
let direction: 'horizontal' | 'vertical';
let offsetX: number;
let offsetY: number;
let scrollbarVisible: boolean;

direction = widget.direction;
offsetX = widget.offsetX;
offsetY = widget.offsetY;
scrollbarVisible = widget.scrollbarVisible;

widget.direction = direction;

let properties: ScrollViewProperties = {direction};
widget = new ScrollView(properties);
widget.set(properties);

// Methods
let offset: number = 42;
let options: {animate?: boolean} = {};
let thisReturnValue: ScrollView;

thisReturnValue = widget.scrollToX(offset);
thisReturnValue = widget.scrollToX(offset, options);
thisReturnValue = widget.scrollToY(offset);
thisReturnValue = widget.scrollToY(offset, options);

// Events
let target: ScrollView = widget;
let timeStamp: number = 0;
let type: string = 'foo';

let scrollXEvent: ScrollViewScrollEvent = {target, timeStamp, type, offset};
let scrollYEvent: ScrollViewScrollEvent = {target, timeStamp, type, offset};

widget.on({
  scrollX: (event: ScrollViewScrollEvent) => {},
  scrollY: (event: ScrollViewScrollEvent) => {}
});
