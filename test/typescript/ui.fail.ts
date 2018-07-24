import {ui} from 'tabris';

const contentView = ui.contentView;
ui.set({contentView});
ui.contentView = contentView;
ui.on({contentViewChanged: function() {}});

const drawer = ui.drawer;
ui.set({drawer});
ui.drawer = drawer;
ui.on({drawerChanged: function() {}});

const navigationBar = ui.navigationBar;
ui.set({navigationBar});
ui.navigationBar = navigationBar;
ui.on({navigationBarChanged: function() {}});

const statusBar = ui.statusBar;
ui.set({statusBar});
ui.statusBar = statusBar;
ui.on({statusBarChanged: function() {}});

/*Expected
(4,9): error TS2345
'contentView' does not exist
(5,4): error TS2540: Cannot assign to 'contentView' because it is a constant or a read-only property.
(6,8): error TS2345
'contentViewChanged' does not exist

(9,9): error TS2345
'drawer' does not exist
(10,4): error TS2540: Cannot assign to 'drawer' because it is a constant or a read-only property.
(11,8): error TS2345
'drawerChanged' does not exist

(14,9): error TS2345
'navigationBar' does not exist
(15,4): error TS2540: Cannot assign to 'navigationBar' because it is a constant or a read-only property.
(16,8): error TS2345
'navigationBarChanged' does not exist

(19,9): error TS2345
'statusBar' does not exist
(20,4): error TS2540: Cannot assign to 'statusBar' because it is a constant or a read-only property.
(21,8): error TS2345
'statusBarChanged' does not exist
*/