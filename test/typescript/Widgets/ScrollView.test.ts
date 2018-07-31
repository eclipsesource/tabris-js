import {ScrollView, ScrollViewScrollEvent, ScrollViewProperties, Properties} from 'tabris';

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

widget
  .onScrollX((event: ScrollViewScrollEvent) => {})
  .onScrollY((event: ScrollViewScrollEvent) => {});

class CustomComponent extends ScrollView {
  public foo: string;
  constructor(props: Properties<CustomComponent>) { super(props); }
}

new CustomComponent({foo: 'bar'}).set({foo: 'bar'});
