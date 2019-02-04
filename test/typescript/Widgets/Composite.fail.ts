import {Composite, Properties, Button, TextView, WidgetCollection} from 'tabris';

class CustomComponent extends Composite {
  constructor(props: Properties<typeof Composite> & Partial<Pick<CustomComponent, 'foo'>>) { super(props); }
  foo() {}
}

const bounds: Bounds = null;
let customComponent: CustomComponent = new CustomComponent({bounds});
customComponent.set({bounds});

let button: Button = new Button();
let textView: TextView = new TextView();
let buttonsComposite: Composite<Button> = new Composite<Button>();
buttonsComposite.append(textView);
buttonsComposite.append([textView]);
buttonsComposite.append(new WidgetCollection<TextView>([textView]));
textView = buttonsComposite.children()[0];
buttonsComposite.onLayoutChanged(() => {});

/*Expected
(9,
bounds
(10,
bounds
(15,
not assignable to parameter
(16,
not assignable to parameter
(17,
not assignable to parameter
(18,
not assignable to type 'TextView'
(19,
'onLayoutChanged' does not exist
*/
