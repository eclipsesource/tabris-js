import {ScrollView} from 'tabris';

let widget: ScrollView;

// Properties
let direction: 'horizontal' | 'vertical';
let offsetX: number;
let offsetY: number;

widget.direction = direction;

direction = widget.direction;
offsetX = widget.offsetX;
offsetY = widget.offsetY;

// Methods
let offset: number;
let options: {animate?: boolean};
let thisReturnValue: ScrollView;

thisReturnValue = widget.scrollToX(offset);
thisReturnValue = widget.scrollToX(offset, options);
thisReturnValue = widget.scrollToY(offset);
thisReturnValue = widget.scrollToY(offset, options);
