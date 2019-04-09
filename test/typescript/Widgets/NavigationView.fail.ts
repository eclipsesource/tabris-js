import {NavigationView, Button, Page, Action} from 'tabris';


let widget = new NavigationView();
widget.append(new Button());

class CustomPage extends Page {
  public foo: string;
}

class CustomAction extends Action {
  public bar: string;
}

const badlyTypedNavigationView1: NavigationView<tabris.Composite> = new NavigationView();
const badlyTypedNavigationView2: NavigationView<CustomPage, tabris.Composite> = new NavigationView();
const badlyTypedNavigationView3: NavigationView<CustomAction, CustomPage> = new NavigationView();
const typedNavigationView: NavigationView<CustomPage, CustomAction> = new NavigationView();
typedNavigationView.append(new Action());
typedNavigationView.append(new Page());

/*Expected
(5,
'Button' is not assignable to parameter
(15,
does not satisfy the constraint
(16,
does not satisfy the constraint
(17,
does not satisfy the constraint
(19,
not assignable to parameter
(20,
not assignable to parameter
*/