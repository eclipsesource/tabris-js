import * as tabris from 'tabris';

let onPanHandler: (event: tabris.WidgetPanEvent) => void = (event) => {};
let onTextChangedHandler: (event: tabris.PropertyChangedEvent<tabris.TextInput, string>) => void = (event) => {};

let action: tabris.Action = <action title='foo' onSelect={() => {}}/>;
action = <tabris.Action title='foo' onSelect={() => {}}/>;
let button: tabris.Button = <button text='foo' onPanUp={onPanHandler}/>;
button = <tabris.Button text='foo' onPanUp={onPanHandler}/>;
let canvas: tabris.Canvas = <canvas onResize={function() {}} left={23} transform={{rotation: 360}}/>;
canvas = <tabris.Canvas onResize={function() {}} left={23} transform={{rotation: 360}}/>;
let checkBox: tabris.CheckBox = <checkBox checked={true}/>;
checkBox = <tabris.CheckBox checked={true}/>;
let collectionView: tabris.CollectionView = <collectionView refreshEnabled={true} cellHeight={x => 23} />;
collectionView = <tabris.CollectionView  refreshEnabled={true} cellHeight={x => 23} />;
let composite: tabris.Composite = <composite layoutData={{width: 100}} onPaddingChanged={function() {}} /> ;
composite = <tabris.Composite onPaddingChanged={function() {}} layoutData={{width: 100}}/>;
let imageView: tabris.ImageView = <imageView image='./foo.jpg'/>;
imageView = <tabris.ImageView image='./foo.jpg'/>;
let navigationView: tabris.NavigationView = <navigationView actionColor='red'/>;
navigationView = <tabris.NavigationView actionColor='red'/>;
let page: tabris.Page = <page autoDispose={false}/>;
page = <tabris.Page autoDispose={false}/>;
let picker: tabris.Picker = <picker selectionIndex={3} itemText={x => 'foo'} />;
picker = <tabris.Picker selectionIndex={3} itemText={x => 'foo'} />;
let progressBar: tabris.ProgressBar = <progressBar maximum={100}/>;
progressBar = <tabris.ProgressBar maximum={100}/>;
let radioButton: tabris.RadioButton = <radioButton checked={true}/>;
radioButton = <tabris.RadioButton checked={true}/>;
let scrollView: tabris.ScrollView = <scrollView background='blue' padding={23} direction='vertical'/>;
scrollView = <tabris.ScrollView background='blue' padding={23} direction='vertical'/>;
let searchAction: tabris.SearchAction = <searchAction text='foo'/>;
searchAction = <tabris.SearchAction text='foo'/>;
let slider: tabris.Slider = <slider maximum={100}/>;
slider = <tabris.Slider maximum={100}/>;
let switchButton: tabris.Switch = <switch thumbOnColor='red'/>;
switchButton = <tabris.Switch thumbOnColor='red'/>;
let tab: tabris.Tab = <tab badge='3'/>;
tab = <tabris.Tab badge='3'/>;
let tabFolder: tabris.TabFolder = <tabFolder tabBarLocation='top'/>;
tabFolder = <tabris.TabFolder tabBarLocation='top'/>;
let textInput: tabris.TextInput = <textInput autoCapitalize={true} onTextChanged={onTextChangedHandler}/>;
textInput = <tabris.TextInput autoCapitalize={true} onTextChanged={onTextChangedHandler}/>;
let textView: tabris.TextView = <textView alignment='right'/>;
textView = <tabris.TextView alignment='right'/>;
let toggleButton: tabris.ToggleButton = <toggleButton text='red'/>;
toggleButton = <tabris.ToggleButton text='red'/>;
let video: tabris.Video = <video autoPlay={true}/>;
video = <tabris.Video autoPlay={true}/>;
let webView: tabris.WebView = <webView url='http://localhost/'/>;
webView = <tabris.WebView url='http://localhost/'/>;

let noAttributes: tabris.Composite = <composite/>;
noAttributes = <tabris.Composite/>;
let widgetCollection = <widgetCollection><button/><textView/></widgetCollection>;
widgetCollection = <tabris.WidgetCollection><tabris.Button/><tabris.TextView/></tabris.WidgetCollection>;
let compositeWithChildren = <composite><button/><widgetCollection><textView/></widgetCollection></composite>;
compositeWithChildren = <tabris.Composite><tabris.Button/><tabris.WidgetCollection><tabris.TextView/></tabris.WidgetCollection></tabris.Composite>;

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