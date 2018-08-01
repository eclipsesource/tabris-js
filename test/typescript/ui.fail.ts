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
(4,9): error
'contentView' does not exist
(5,4): error
Cannot assign to 'contentView'
(6,4): error
'onContentViewChanged' does not exist


(9,9): error
'drawer' does not exist
(10,4): error
Cannot assign to 'drawer'
(11,4): error
'onDrawerChanged' does not exist

(14,9): error
'navigationBar' does not exist
(15,4): error
Cannot assign to 'navigationBar'
(16,4): error
'onNavigationBarChanged' does not exist

(19,9): error
'statusBar' does not exist
(20,4): error
Cannot assign to 'statusBar'
(21,4): error
'onStatusBarChanged' does not exist
*/