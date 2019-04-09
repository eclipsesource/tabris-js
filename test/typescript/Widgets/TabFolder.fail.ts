import {TabFolder, Button, Tab} from 'tabris';


let widget = new TabFolder();

widget.onTabBarLocationChanged(function() {});
widget.onTabModeChanged(function() {});
widget.append(new Button());

class CustomTab extends Tab {
  public foo: string;
}

const badlyTypedTabFolder: TabFolder<tabris.Composite> = new TabFolder();
const typedTabFolder: TabFolder<CustomTab> = new TabFolder();
typedTabFolder.append(new Tab());

/*Expected
(6,
(7,
(8,
'Button' is not assignable to parameter
(14,
does not satisfy the constraint
(16,
not assignable to parameter
*/