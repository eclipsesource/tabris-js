import {navigationBar} from 'tabris';

const height = navigationBar.height;
navigationBar.set({height});
navigationBar.height = height;
navigationBar.onHeightChanged(function() {});

/*Expected
(4,
is not assignable to parameter of type
(5,
Cannot assign to 'height' because it is a constant or a read-only property
*/