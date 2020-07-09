import * as tabris from 'tabris';
import {asFactory} from 'tabris';

const onPanHandler: (event: tabris.WidgetPanEvent) => void = (event) => {};

// Widgets
const action: tabris.Action = tabris.Action({unknown: 'foo'});
const button: tabris.Button = tabris.Button({onSelect: onPanHandler});

let widget: any = null;
if (widget instanceof tabris.ImageView) {
  console.log(widget.foo);
  tabris.AlertDialog.open(widget);
}

tabris.Composite({children: [new Date()]});
tabris.NavigationView({children: new tabris.Button()});
tabris.TabFolder({children: new tabris.Button()});

// Custom Components

const MyCustomWidget = asFactory(
  class MyCustomWidget extends tabris.Composite {
    constructor(props: tabris.Properties<MyCustomWidget>) { super(props); }
    public foo: number;
    public bar: string;
  }
);
type MyCustomWidget = ReturnType<typeof MyCustomWidget>;

const MyCustomWidgetWithCustomJsx = asFactory(
  class MyCustomWidgetWithCustomJsx extends tabris.Composite {
    constructor(props: tabris.Properties<MyCustomWidgetWithCustomJsx>) { super(props); }
    public jsxAttributes: tabris.JSXAttributes<this> & {
      foo?: number;
      bar: string;
    };
  }
);
type MyCustomWidgetWithCustomJsx = InstanceType<typeof MyCustomWidgetWithCustomJsx>;

namespace components {
  export class MyCustomWidgetWithUnpackedListeners extends tabris.Composite {
    constructor(props: tabris.Properties<MyCustomWidgetWithUnpackedListeners>) { super(props); }
    public foo: number;
    public readonly bar: string;
    public onFooChanged = new tabris.Listeners<tabris.PropertyChangedEvent<this, string>>(this, 'onFooChanged');
  }
}

type MyCustomWidgetWithUnpackedListeners = components.MyCustomWidgetWithUnpackedListeners;
const MyCustomWidgetWithUnpackedListeners = asFactory(components.MyCustomWidgetWithUnpackedListeners);

const someWidget: tabris.Widget = null as unknown as any;

let custom1: MyCustomWidget = MyCustomWidget({foo: '23'});
custom1 = new MyCustomWidget({baz: 23});

let custom2: MyCustomWidget = MyCustomWidgetWithCustomJsx({height: 23, bar: 'foo'});
MyCustomWidgetWithCustomJsx({height: 23});

if (someWidget instanceof MyCustomWidgetWithCustomJsx) {
  custom1 = someWidget;
}

let num: number;
MyCustomWidgetWithUnpackedListeners({
  onFooChanged: event => num = event.value
});

tabris.TextView({}, {});
tabris.TextView({}, tabris.NativeObject);
tabris.TextView({}, tabris.Composite);
tabris.TextView({}, tabris.Composite);
tabris.TextView({}, () => {});
tabris.TextView({}, () => tabris.NativeObject);
tabris.TextView({}, () => tabris.Composite);
tabris.TextView({}, () => tabris.Composite);

/*Expected
(7,
not assignable
(8,
not assignable
(12,
does not exist
(13,
not assignable
(16,
not assignable
(17,
not assignable
(18,
not assignable
(56,
not assignable
(57,
not assignable
(59,
missing
(60,
not assignable
(63,
not assignable
(68,
assignable
(71,
not assignable
(72,
not assignable
(73,
not assignable
(74,
not assignable
(75,
not assignable
(76,
missing
(77,
missing
(78,
not assignable
*/
