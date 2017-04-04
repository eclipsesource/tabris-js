import {ScrollView} from 'tabris';

let widget: ScrollView = new ScrollView();

// Properties
let direction: 'horizontal' | 'vertical';
let offsetX: number;
let offsetY: number;

direction = widget.direction;
offsetX = widget.offsetX;
offsetY = widget.offsetY;

widget.direction = direction;

// Methods
let offset: number = 42;
let options: {animate?: boolean} = {};
let thisReturnValue: ScrollView;

thisReturnValue = widget.scrollToX(offset);
thisReturnValue = widget.scrollToX(offset, options);
thisReturnValue = widget.scrollToY(offset);
thisReturnValue = widget.scrollToY(offset, options);
