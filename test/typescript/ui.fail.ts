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
(4,
contentView
(5,
contentView
(6,
'onContentViewChanged' does not exist


(9,
drawer
(10,
drawer
(11,
'onDrawerChanged' does not exist

(14,
navigationBar
(15,
navigationBar
(16,
'onNavigationBarChanged' does not exist

(19,
statusBar
(20,
statusBar
(21,
'onStatusBarChanged' does not exist
*/