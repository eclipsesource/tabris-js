import {Drawer} from 'tabris';

let widget: Drawer = new Drawer();

// Propeties
let enabled: boolean;

enabled = widget.enabled;

widget.enabled = enabled;

// Methods
let thisReturnValue: Drawer;

thisReturnValue = widget.close();
thisReturnValue = widget.open();
