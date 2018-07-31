import {TabFolder} from 'tabris';


let widget = new TabFolder();

const tabBarLocation = widget.tabBarLocation;
widget.set({tabBarLocation});
widget.tabBarLocation = tabBarLocation;
widget.onTabBarLocationChanged(function() {});

const tabMode = widget.tabMode;
widget.set({tabMode});
widget.tabMode = tabMode;
widget.onTabModeChanged(function() {});

/*Expected
(7,13): error TS2345
'tabBarLocation' does not exist
(8,8): error TS2540: Cannot assign to 'tabBarLocation' because it is a constant or a read-only property
(9,8): error TS2339

(12,13): error TS2345
'tabMode' does not exist
(13,8): error TS2540: Cannot assign to 'tabMode' because it is a constant or a read-only property
(14,8): error TS2339
*/