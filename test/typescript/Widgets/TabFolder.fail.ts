import {TabFolder, Button} from 'tabris';


let widget = new TabFolder();

widget.onTabBarLocationChanged(function() {});
widget.onTabModeChanged(function() {});
widget.append(new Button());

/*Expected
(6,
(7,
(8,
'Button' is not assignable to parameter
*/