import * as tabris from 'tabris';

let onPanHandler: (event: tabris.WidgetPanEvent) => void = (event) => {};
let onTextChangedHandler: (event: tabris.PropertyChangedEvent<tabris.TextInput, string>) => void = (event) => {};

// Widgets
let action: tabris.Action = <tabris.Action title='foo' onSelect={() => {}}>foo</tabris.Action>;
let button: tabris.Button = <tabris.Button onPanUp={onPanHandler}>foo</tabris.Button>;
let canvas: tabris.Canvas = <tabris.Canvas onResize={function() {}} left={23} transform={{rotation: 360}}/>;
let checkBox: tabris.CheckBox = <tabris.CheckBox checked={true}>foo</tabris.CheckBox>;
let collectionView: tabris.CollectionView = <tabris.CollectionView refreshEnabled={true} cellHeight={x => 23} />;
let stackComposite: tabris.StackComposite = <tabris.StackComposite padding={10} layoutData={{width: 100}}/>;
let composite: tabris.Composite = <tabris.Composite padding={10} layoutData={{width: 100}}/>;
let imageView: tabris.ImageView = <tabris.ImageView image='./foo.jpg'/>;
let navigationView: tabris.NavigationView = <tabris.NavigationView actionColor='red'/>;
let page: tabris.Page = <tabris.Page autoDispose={false}/>;
let picker: tabris.Picker = <tabris.Picker selectionIndex={3} itemText={x => 'foo'} />;
let progressBar: tabris.ProgressBar = <tabris.ProgressBar maximum={100}/>;
let radioButton: tabris.RadioButton = <tabris.RadioButton checked={true}>foo</tabris.RadioButton>;
let scrollView: tabris.ScrollView = <tabris.ScrollView background='blue' padding={23} direction='vertical'/>;
let searchAction: tabris.SearchAction = <tabris.SearchAction title='bar'>foo</tabris.SearchAction>;
let slider: tabris.Slider = <tabris.Slider maximum={100}/>;
let switchButton: tabris.Switch = <tabris.Switch thumbOnColor='red'>foo</tabris.Switch>;
let tab: tabris.Tab = <tabris.Tab background={[255, 255, 255, 0]} badge='3'/>;
let tabFolder: tabris.TabFolder = <tabris.TabFolder tabBarLocation='top'/>;
let textInput: tabris.TextInput = <tabris.TextInput autoCapitalize={true} onTextChanged={onTextChangedHandler}>foo</tabris.TextInput>;
let textView: tabris.TextView = <tabris.TextView alignment='right'>foo</tabris.TextView>;
let toggleButton: tabris.ToggleButton = <tabris.ToggleButton text='red'>foo</tabris.ToggleButton>;
let video: tabris.Video = <tabris.Video background={[255, 255, 255]} autoPlay={true}/>;
let webView: tabris.WebView = <tabris.WebView background={new tabris.Color(255, 255, 255)} url='http://localhost/'/>;

let noAttributes: tabris.Composite = <tabris.Composite/>;

let compositeWithChildren: tabris.Composite = <tabris.Composite>{[new tabris.Button(), new tabris.WidgetCollection<tabris.TextView>([])]}</tabris.Composite>;
let canvasWithChildren: tabris.Canvas = <tabris.Canvas>{new tabris.Button()}</tabris.Canvas>;
let navigationViewWidthChildren: tabris.NavigationView = <tabris.NavigationView>{new tabris.Page()}</tabris.NavigationView>;
let pageWidthChildren: tabris.Page = <tabris.Page>{new tabris.Button()}</tabris.Page>;
let scrollViewWidthChildren: tabris.ScrollView = <tabris.ScrollView>{new tabris.Button()}</tabris.ScrollView>;
let tabWidthChildren: tabris.Tab = <tabris.Tab>{new tabris.Button()}</tabris.Tab>;
let tabFolderWidthChildren: tabris.TabFolder = <tabris.TabFolder>{new tabris.Tab()}</tabris.TabFolder>;

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

// WidgetCollection
let widgetCollection: tabris.WidgetCollection = <tabris.WidgetCollection>{[new tabris.Button(), new tabris.TextView()]}</tabris.WidgetCollection>;
widgetCollection = <tabris.WidgetCollection children={[new tabris.Button(), new tabris.TextView()]} />;

// Popup

const actions: Array<{title: string, image?: tabris.ImageValue, style?: 'default'|'cancel'|'destructive'}> = [
  {title: 'foo', image: 'foo.jpg', style: 'default'}
];

let actionSheet: tabris.ActionSheet = <tabris.ActionSheet title='foo' message='foo' actions={actions} />;
actionSheet = <tabris.ActionSheet title='foo' actions={actions}>foo</tabris.ActionSheet>;
actionSheet = <tabris.ActionSheet title='foo'>{actions}</tabris.ActionSheet>;
actionSheet = <tabris.ActionSheet title='foo'>{['foo', 'bar', actions[0]]}</tabris.ActionSheet>;
actionSheet = <tabris.ActionSheet title='foo'><tabris.ActionSheetItem image='foo.jpg' title='foo' style='cancel'/></tabris.ActionSheet>;
actionSheet = <tabris.ActionSheet title='foo'><tabris.ActionSheetItem>foo</tabris.ActionSheetItem></tabris.ActionSheet>;

const textInputs: tabris.TextInput[] = [new tabris.TextInput(), new tabris.TextInput()];

let alertDialog: tabris.AlertDialog = <tabris.AlertDialog title='foo' message='foo' textInputs={textInputs} />;
actionSheet = <tabris.AlertDialog title='foo' textInputs={textInputs}>foo</tabris.AlertDialog>;
actionSheet = <tabris.AlertDialog title='foo'>{textInputs}</tabris.AlertDialog>;
actionSheet = <tabris.AlertDialog title='foo'>{['foo', 'bar', textInputs[0]]}</tabris.AlertDialog>;
actionSheet = <tabris.AlertDialog title='foo'><tabris.TextInput /></tabris.AlertDialog>;
