import {ui} from 'tabris';

const height = ui.statusBar.height;
ui.statusBar.set({height});
ui.statusBar.height = height;
ui.statusBar.onHeightChanged(function() {});

/*Expected
(5,14): error TS2540: Cannot assign to 'height' because it is a constant or a read-only property
*/