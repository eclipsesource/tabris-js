import {EventObject, Popover, Widget, Properties, ContentView} from 'tabris';

let popover: Popover = new Popover();

// Properties
let width: number;
let height: number;
let anchor: Widget;
let contentView: ContentView;

width = popover.width;
height = popover.height;
anchor = popover.anchor;
contentView = popover.contentView;

popover.width = width;
popover.height = height;
popover.anchor = anchor;

let properties: Properties<typeof Popover> = {width, height, anchor};
popover = new Popover(properties);
popover.set(properties);

// Methods
let thisReturnValue: Popover;

thisReturnValue = popover.close();
thisReturnValue = popover.open();

// Events
popover.onClose((event: EventObject<Popover>) => {});
