import {TabFolder, Button} from 'tabris';


let widget = new TabFolder();

const tabBarLocation = widget.tabBarLocation;
widget.set({tabBarLocation});
widget.tabBarLocation = tabBarLocation;
widget.onTabBarLocationChanged(function() {});

const tabMode = widget.tabMode;
widget.set({tabMode});
widget.tabMode = tabMode;
widget.onTabModeChanged(function() {});

widget.append(new Button());

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
(16,
'Button' is not assignable to parameter
*/