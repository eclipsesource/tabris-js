import * as tabris from 'tabris';

let onPanHandler: (event: tabris.WidgetPanEvent) => void = (event) => {};
let onTextChangedHandler: (event: tabris.PropertyChangedEvent<tabris.TextInput, string>) => void = (event) => {};

let action: tabris.Action = <tabris.Action title='foo' onSelect={() => {}}/>;
let button: tabris.Button = <tabris.Button text='foo' onPanUp={onPanHandler}/>;
let canvas: tabris.Canvas = <tabris.Canvas onResize={function() {}} left={23} transform={{rotation: 360}}/>;
let checkBox: tabris.CheckBox = <tabris.CheckBox checked={true}/>;
let collectionView: tabris.CollectionView = <tabris.CollectionView  refreshEnabled={true} cellHeight={x => 23} />;
let composite: tabris.Composite = <tabris.Composite onPaddingChanged={function() {}} layoutData={{width: 100}}/>;
let imageView: tabris.ImageView = <tabris.ImageView image='./foo.jpg'/>;
let navigationView: tabris.NavigationView = <tabris.NavigationView actionColor='red'/>;
let page: tabris.Page = <tabris.Page autoDispose={false}/>;
let picker: tabris.Picker = <tabris.Picker selectionIndex={3} itemText={x => 'foo'} />;
let progressBar: tabris.ProgressBar = <tabris.ProgressBar maximum={100}/>;
let radioButton: tabris.RadioButton = <tabris.RadioButton checked={true}/>;
let scrollView: tabris.ScrollView = <tabris.ScrollView background='blue' padding={23} direction='vertical'/>;
let searchAction: tabris.SearchAction = <tabris.SearchAction text='foo'/>;
let slider: tabris.Slider = <tabris.Slider maximum={100}/>;
let switchButton: tabris.Switch = <tabris.Switch thumbOnColor='red'/>;
let tab: tabris.Tab = <tabris.Tab badge='3'/>;
let tabFolder: tabris.TabFolder = <tabris.TabFolder tabBarLocation='top'/>;
let textInput: tabris.TextInput = <tabris.TextInput autoCapitalize={true} onTextChanged={onTextChangedHandler}/>;
let textView: tabris.TextView = <tabris.TextView alignment='right'/>;
let toggleButton: tabris.ToggleButton = <tabris.ToggleButton text='red'/>;
let video: tabris.Video = <tabris.Video autoPlay={true}/>;
let webView: tabris.WebView = <tabris.WebView url='http://localhost/'/>;

let noAttributes: tabris.Composite = <tabris.Composite/>;
let widgetCollection = <tabris.WidgetCollection><tabris.Button/><tabris.TextView/></tabris.WidgetCollection>;
let compositeWithChildren =  <tabris.Composite><tabris.Button/><tabris.WidgetCollection><tabris.TextView/></tabris.WidgetCollection></tabris.Composite>;

class MyCustomWidget extends tabris.Composite {

  public foo: number;
  public bar: string;

}

class MyCustomWidgetWithCustomJsx extends tabris.Composite {

  public jsxProperties: tabris.Composite['jsxProperties'] & {
    foo?: number;
    bar: string;
  };

}

class MyCustomWidgetWithUnpackedListeners extends tabris.Composite {

  public foo: number;
  public readonly bar: string;
  public onFooChanged = new tabris.Listeners<tabris.PropertyChangedEvent<this, string>>(this, 'onFooChanged');
  public jsxProperties: tabris.Composite['jsxProperties'] & tabris.JSXProperties<this, 'foo' | 'onFooChanged'>;

}

class NonWidgetElement implements JSX.ElementClass {
  [JSX.jsxFactory](type: {new (): any }, properties: object, children: Array<any>) {
    return new type();
  }
}

let custom1: MyCustomWidget = <MyCustomWidget height={23}/>;
let custom2: MyCustomWidgetWithCustomJsx = <MyCustomWidgetWithCustomJsx height={23} bar='foo'/>;
let custom3: MyCustomWidgetWithUnpackedListeners = <MyCustomWidgetWithUnpackedListeners
  height={23}
  foo={23}
  onFooChanged={event => {
    const str: string = event.value;
    const widget: MyCustomWidgetWithUnpackedListeners = event.target;
  }}
  />;
let custom4: NonWidgetElement = <NonWidgetElement />;
