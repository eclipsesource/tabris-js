import {TabFolder} from 'tabris';


let widget = new TabFolder();

const tabBarLocation = widget.tabBarLocation;
widget.set({tabBarLocation});
widget.tabBarLocation = tabBarLocation;
widget.on({tabBarLocationChanged: function() {}});

/*Expected
(9,12): error TS2345
'tabBarLocationChanged' does not exist
*/