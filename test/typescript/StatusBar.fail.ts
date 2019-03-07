import {statusBar} from 'tabris';

const height = statusBar.height;
statusBar.set({height});
statusBar.height = height;
statusBar.onHeightChanged(function() {});

/*Expected
(4,
is not assignable to parameter of type
(5,
Cannot assign to 'height'
*/