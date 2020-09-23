import {navigationBar} from 'tabris';

const height = navigationBar.height;
navigationBar.set({height});
navigationBar.height = height;
navigationBar.onHeightChanged(function() {});

/*Expected
(5,
Cannot assign to 'height'
*/
