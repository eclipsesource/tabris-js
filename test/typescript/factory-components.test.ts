import * as tabris from 'tabris';
import {asFactory} from 'tabris';

const onPanHandler: (event: tabris.WidgetPanEvent) => void = (event) => {};
const onTextChangedHandler: (event: tabris.PropertyChangedEvent<tabris.TextInput, string>) => void = (event) => {};

// Widgets
const action: tabris.Action = tabris.Action({title: 'foo', onSelect: () => {}});
const button: tabris.Button = tabris.Button({onPanUp: onPanHandler});
const canvas: tabris.Canvas = tabris.Canvas({onResize: function() {}, left: 23, transform: {rotation: 360}});
const checkBox: tabris.CheckBox = tabris.CheckBox({checked: true});
const collectionView: tabris.CollectionView<tabris.Widget> = tabris.CollectionView({refreshEnabled: true, cellHeight: x => 23});
const stackComposite: tabris.Stack = tabris.Stack({padding: 10, layoutData: {width: 100}});
const composite: tabris.Composite = tabris.Composite({padding: 10, layoutData: {width: 100}});
const imageView: tabris.ImageView = tabris.ImageView({padding: 10, image: './foo.jpg'});
const navigationView: tabris.NavigationView = tabris.NavigationView({actionColor: 'red'});
const page: tabris.Page = tabris.Page({autoDispose: false});
const picker: tabris.Picker = tabris.Picker({selectionIndex: 3, itemText: x => 'foo'});
const progressBar: tabris.ProgressBar = tabris.ProgressBar({maximum: 100});
const radioButton: tabris.RadioButton = tabris.RadioButton({checked: true});
const scrollView: tabris.ScrollView = tabris.ScrollView({background: 'blue', padding: 23, direction: 'vertical'});
const searchAction: tabris.SearchAction = tabris.SearchAction({title: 'bar'});
const slider: tabris.Slider = tabris.Slider({maximum: 100});
const switchButton: tabris.Switch = tabris.Switch({thumbOnColor: 'red'});
const tab: tabris.Tab = tabris.Tab({background: [255, 255, 255, 0], badge: 3});
const tabFolder: tabris.TabFolder = tabris.TabFolder({tabBarLocation: 'top'});
const textInput: tabris.TextInput = tabris.TextInput({autoCapitalize: true, onTextChanged: onTextChangedHandler});
const textView: tabris.TextView = tabris.TextView({alignment: 'right'});
const toggleButton: tabris.ToggleButton = tabris.ToggleButton({text: 'red'});
const video: tabris.Video = tabris.Video({background: [255, 255, 255], autoPlay: true});
const webView: tabris.WebView = tabris.WebView({background: new tabris.Color(255, 255, 255), url: 'http://localhost/'});
const noAttributes: tabris.Composite = tabris.Composite();

// Ensure instanceof and statics work for built-in factories
let widget: unknown = null;
if (widget instanceof tabris.ImageView) {
  console.log(widget.image);
}
tabris.AlertDialog.open('foo');

// shorthands
let shorthands1: tabris.Composite = tabris.Composite({center: true, stretch: true, stretchX: true, stretchY: true});

// Children
const compositeWithChildren: tabris.Composite = tabris.Composite({
  children: [
    new tabris.Button(), new tabris.WidgetCollection([new tabris.TextView()])
  ]
});
const canvasWithChildren: tabris.Canvas = tabris.Canvas({children: new tabris.Button()});
const navigationViewWithChildren: tabris.NavigationView = tabris.NavigationView({children: new tabris.Page()});
const pageWithChildren: tabris.Page = tabris.Page({children: new tabris.Button()});
const scrollViewWithChildren: tabris.ScrollView = tabris.ScrollView({children: new tabris.Button()});
const tabWithChildren: tabris.Tab = tabris.Tab({children: new tabris.Button()});
const tabFolderWithChildren: tabris.TabFolder = tabris.TabFolder({children: new tabris.Tab()});

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

export const MyStyledComponent = (attributes: tabris.Attributes<tabris.TextInput>) =>
  tabris.TextInput({background: 'blue', ...attributes}, MyStyledComponent);

const someWidget: tabris.Widget = null as unknown as any;

let custom1: MyCustomWidget = MyCustomWidget({height: 23, foo: 23});
custom1 = new MyCustomWidget({height: 23, foo: 23});

export const MyStyledCustomWidget = (attributes: tabris.Attributes<MyCustomWidget>) =>
  MyCustomWidget({background: 'blue', ...attributes}, MyStyledCustomWidget);

let num: number = custom1.foo;
if (someWidget instanceof MyCustomWidget) {
  custom1 = someWidget;
}

let custom2: MyCustomWidgetWithCustomJsx = MyCustomWidgetWithCustomJsx({height: 23, bar: 'foo'});
custom2 = new MyCustomWidgetWithCustomJsx({height: 23});
if (someWidget instanceof MyCustomWidgetWithCustomJsx) {
  custom2 = someWidget;
}

let str: string;
let custom3: MyCustomWidgetWithUnpackedListeners = MyCustomWidgetWithUnpackedListeners({
  height: 23,
  foo: 23,
  onFooChanged: event => {
    str = event.value;
    const widget: MyCustomWidgetWithUnpackedListeners = event.target;
  }
});
custom3 = new MyCustomWidgetWithUnpackedListeners({
  height: 23,
  foo: 23
}).onFooChanged(ev => str = ev.value);

if (someWidget instanceof MyCustomWidgetWithUnpackedListeners) {
  custom3 = someWidget;
}

const custom4: tabris.TextInput = MyStyledComponent({onAccept: ev => console.log(ev.text)});

