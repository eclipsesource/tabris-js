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
(6,8): error TS2345
'contentViewChanged' does not exist

(11,8): error TS2345
'drawerChanged' does not exist

(16,8): error TS2345
'navigationBarChanged' does not exist

(21,8): error TS2345
'statusBarChanged' does not exist in type 'UIEvents'.
*/