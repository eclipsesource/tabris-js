import {EventObject, Popover, PopoverProperties, Widget} from 'tabris';

let popover: Popover = new Popover();

// Properties
let width: number;
let height: number;
let anchor: Widget;

width = popover.width;
height = popover.height;
anchor = popover.anchor;

popover.width = width;
popover.height = height;
popover.anchor = anchor;

let properties: PopoverProperties = {width, height, anchor};
popover = new Popover(properties);
popover.set(properties);

// Methods
let thisReturnValue: Popover;

thisReturnValue = popover.close();
thisReturnValue = popover.open();

// Events
popover.onClose((event: EventObject<Popover>) => {});
