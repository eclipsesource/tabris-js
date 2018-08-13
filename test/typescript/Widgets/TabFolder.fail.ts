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
(7,
tabBarLocation
(8,
tabBarLocation
(9,

(12,
tabMode
(13,
tabMode
(14,
*/