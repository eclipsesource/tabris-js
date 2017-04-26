import {Drawer, ui} from 'tabris';

let widget: Drawer = ui.drawer;

// Propeties
let enabled: boolean;

enabled = widget.enabled;

widget.enabled = enabled;

// Methods
let thisReturnValue: Drawer;

thisReturnValue = widget.close();
thisReturnValue = widget.open();
