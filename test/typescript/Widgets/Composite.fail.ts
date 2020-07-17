import { Composite, Properties, Button, TextView, WidgetCollection, Set } from 'tabris';

class CustomComponent extends Composite {
  constructor(props: Properties<Composite> & Partial<Pick<CustomComponent, 'foo'>>) { super(props); }
  public foo() {} public _doX() {} private _doy() {}
}

const bounds: Bounds = null;
const customComponent: CustomComponent = new CustomComponent({bounds});
customComponent.set({bounds});

const button: Button = new Button();
let textView: TextView = new TextView();
const buttonsComposite: Composite<Button> = new Composite<Button>();
buttonsComposite.append(textView);
buttonsComposite.append([textView]);
buttonsComposite.append(new WidgetCollection<TextView>([textView]));
textView = buttonsComposite.children()[0];
buttonsComposite.onLayoutChanged(() => {});
buttonsComposite.set({children: (() => {}) as any});
customComponent.set({_doX: (() => {}) as any});
customComponent.set({_doY: (() => {}) as any});
customComponent.set({doesNotExist: (() => {}) as any});
customComponent._scheduleRenderChildren();
customComponent.$flushChildren();
customComponent._layout;
new Composite().apply({foo: Set(Button, {nonProp: 'foo'})});
new Composite().apply({foo: Set(Button, {text: 23})});
new Composite().apply({foo: Set(Button, {onSelect: ev => console.log(ev.foo)})});
new Composite().apply('foo', {foo: {text: 23}});
new Composite().apply({mode: 'foo'}, {foo: {text: 23}});
new Composite().apply({mode: 'foo'}, {foo: {text: 23}});
new Composite().apply(() => 23);
new Composite().apply(widget => widget.foo);

/*Expected
(9,
bounds
(10,
bounds
(15,
not assignable
(16,
(17,
(18,
(19,
'onLayoutChanged' does not exist
(20,
(21,
(22,
(23,
(24,
private
(25,
private
(26,
private
(27,
(28,
(29,
(30,
(31,
(32,
(33,
(34,
*/
