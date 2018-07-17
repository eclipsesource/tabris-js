import {ui} from 'tabris';

const height = ui.navigationBar.height;
ui.navigationBar.set({height});
ui.navigationBar.height = height;
ui.navigationBar.on({heightChanged: function() {}});

/*Expected
(5,18): error TS2540: Cannot assign to 'height' because it is a constant or a read-only property
*/