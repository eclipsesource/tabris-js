import {Drawer, ui, EventObject} from 'tabris';

let widget: Drawer = ui.drawer;

// Propeties
let enabled: boolean;

enabled = widget.enabled;

widget.enabled = enabled;

// Methods
let thisReturnValue: Drawer;

thisReturnValue = widget.close();
thisReturnValue = widget.open();

// Events
let target: Drawer = widget;
let timeStamp: number = 0;
let type: string = 'foo';

let drawerCloseEvent: EventObject<Drawer> = {target, timeStamp, type};

widget.on({
  close: (event: EventObject<Drawer>) => {}
});
