import {ui} from 'tabris';

const contentView = ui.contentView;
ui.set({contentView});
ui.contentView = contentView;
ui.onContentViewChanged(function() {});

const drawer = ui.drawer;
ui.set({drawer});
ui.drawer = drawer;
ui.onDrawerChanged(function() {});

const navigationBar = ui.navigationBar;
ui.set({navigationBar});
ui.navigationBar = navigationBar;
ui.onNavigationBarChanged(function() {});

const statusBar = ui.statusBar;
ui.set({statusBar});
ui.statusBar = statusBar;
ui.onStatusBarChanged(function() {});

/*Expected
(4,9): error TS2345
'contentView' does not exist
(5,4): error TS2540: Cannot assign to 'contentView' because it is a constant or a read-only property.
(6,4): error TS2339

(9,9): error TS2345
'drawer' does not exist
(10,4): error TS2540: Cannot assign to 'drawer' because it is a constant or a read-only property.
(11,4): error TS2551

(14,9): error TS2345
'navigationBar' does not exist
(15,4): error TS2540: Cannot assign to 'navigationBar' because it is a constant or a read-only property.
(16,4): error TS2339

(19,9): error TS2345
'statusBar' does not exist
(20,4): error TS2540: Cannot assign to 'statusBar' because it is a constant or a read-only property.
(21,4): error TS2339
*/