import * as tabris from 'tabris';
import { Popover } from 'tabris';

const onPanHandler: (event: tabris.WidgetPanEvent) => void = (event) => {};
const onTextChangedHandler: (event: tabris.PropertyChangedEvent<tabris.TextInput, string>) => void = (event) => {};

// Widgets
const action: tabris.Action = <tabris.Action title='foo' onSelect={() => {}}>foo</tabris.Action>;
const button: tabris.Button = <tabris.Button onPanUp={onPanHandler}>foo</tabris.Button>;
const canvas: tabris.Canvas = <tabris.Canvas onResize={function() {}} left={23} transform={{rotation: 360}}/>;
const checkBox: tabris.CheckBox = <tabris.CheckBox checked={true}>foo</tabris.CheckBox>;
const collectionView: tabris.CollectionView = <tabris.CollectionView refreshEnabled={true} cellHeight={x => 23} />;
const stackComposite: tabris.StackComposite = <tabris.StackComposite padding={10} layoutData={{width: 100}}/>;
const composite: tabris.Composite = <tabris.Composite padding={10} layoutData={{width: 100}}/>;
const imageView: tabris.ImageView = <tabris.ImageView image='./foo.jpg'/>;
const navigationView: tabris.NavigationView = <tabris.NavigationView actionColor='red'/>;
const page: tabris.Page = <tabris.Page autoDispose={false}/>;
const picker: tabris.Picker = <tabris.Picker selectionIndex={3} itemText={x => 'foo'} />;
const progressBar: tabris.ProgressBar = <tabris.ProgressBar maximum={100}/>;
const radioButton: tabris.RadioButton = <tabris.RadioButton checked={true}>foo</tabris.RadioButton>;
const scrollView: tabris.ScrollView = <tabris.ScrollView background='blue' padding={23} direction='vertical'/>;
const searchAction: tabris.SearchAction = <tabris.SearchAction title='bar'>foo</tabris.SearchAction>;
const slider: tabris.Slider = <tabris.Slider maximum={100}/>;
const switchButton: tabris.Switch = <tabris.Switch thumbOnColor='red'>foo</tabris.Switch>;
const tab: tabris.Tab = <tabris.Tab background={[255, 255, 255, 0]} badge='3'/>;
const tabFolder: tabris.TabFolder = <tabris.TabFolder tabBarLocation='top'/>;
const textInput: tabris.TextInput = <tabris.TextInput autoCapitalize={true} onTextChanged={onTextChangedHandler}>foo</tabris.TextInput>;
const textView: tabris.TextView = <tabris.TextView alignment='right'>foo</tabris.TextView>;
const toggleButton: tabris.ToggleButton = <tabris.ToggleButton text='red'>foo</tabris.ToggleButton>;
const video: tabris.Video = <tabris.Video background={[255, 255, 255]} autoPlay={true}/>;
const webView: tabris.WebView = <tabris.WebView background={new tabris.Color(255, 255, 255)} url='http://localhost/'/>;

const noAttributes: tabris.Composite = <tabris.Composite/>;

const compositeWithChildren: tabris.Composite = <tabris.Composite>{[
  new tabris.Button(), new tabris.WidgetCollection([new tabris.TextView()])
]}</tabris.Composite>;
const canvasWithChildren: tabris.Canvas = <tabris.Canvas>{new tabris.Button()}</tabris.Canvas>;
const navigationViewWidthChildren: tabris.NavigationView = <tabris.NavigationView>{new tabris.Page()}</tabris.NavigationView>;
const pageWidthChildren: tabris.Page = <tabris.Page>{new tabris.Button()}</tabris.Page>;
const scrollViewWidthChildren: tabris.ScrollView = <tabris.ScrollView>{new tabris.Button()}</tabris.ScrollView>;
const tabWidthChildren: tabris.Tab = <tabris.Tab>{new tabris.Button()}</tabris.Tab>;
const tabFolderWidthChildren: tabris.TabFolder = <tabris.TabFolder>{new tabris.Tab()}</tabris.TabFolder>;

class MyCustomWidget extends tabris.Composite {

  public foo: number;
  public bar: string;

}

class MyCustomWidgetWithCustomJsx extends tabris.Composite {

  public jsxProperties: tabris.JSXProperties<this> & {
    children?: tabris.JSXChildren<tabris.Widget>;
    foo?: number;
    bar: string;
  };

}

class MyCustomWidgetWithUnpackedListeners extends tabris.Composite {

  public foo: number;
  public readonly bar: string;
  public onFooChanged = new tabris.Listeners<tabris.PropertyChangedEvent<this, string>>(this, 'onFooChanged');
}

const custom1: MyCustomWidget = <MyCustomWidget height={23}/>;
const custom2: MyCustomWidgetWithCustomJsx = <MyCustomWidgetWithCustomJsx height={23} bar='foo'/>;
const custom3: MyCustomWidgetWithUnpackedListeners = <MyCustomWidgetWithUnpackedListeners
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

// CollectionView
const cellType: string|((index: number) => string) = () => 'foo';
const createCell: (cellType: string) => tabris.Widget = () => <tabris.Composite />;
const updateCell: (cell: tabris.Widget, index: number) => void = () => {};

const textInputs: tabris.TextInput[] = [new tabris.TextInput(), new tabris.TextInput()];

const cv: tabris.CollectionView = <tabris.CollectionView
  cellType={cellType} createCell={createCell} updateCell={updateCell}
/>;
let alertDialog: tabris.AlertDialog = <tabris.AlertDialog
  title='foo'
  message='foo'
  textInputs={textInputs}
  onClose={(ev: tabris.AlertDialogCloseEvent) => console.log(ev.button  + ev.texts[0].trim())}
  onCloseOk={(ev: tabris.AlertDialogCloseEvent) => console.log(ev.button === 'ok' && ev.texts[0].trim())}
  onCloseCancel={(ev: tabris.AlertDialogCloseEvent) => console.log(ev.button === 'cancel' && ev.texts[0].trim())}
  onCloseNeutral={(ev: tabris.AlertDialogCloseEvent) => console.log(ev.button === 'neutral' && ev.texts[0].trim())}/>;
alertDialog = <tabris.AlertDialog title='foo' textInputs={textInputs}>foo</tabris.AlertDialog>;
alertDialog = <tabris.AlertDialog title='foo'>{textInputs}</tabris.AlertDialog>;
alertDialog = <tabris.AlertDialog title='foo'>{['foo', 'bar', textInputs[0]]}</tabris.AlertDialog>;
alertDialog = <tabris.AlertDialog title='foo'><tabris.TextInput /></tabris.AlertDialog>;

let dateDialog: tabris.DateDialog = <tabris.DateDialog
  date={new Date()}
  minDate={new Date()}
  maxDate={new Date()}
  onSelect={(ev: tabris.DateDialogSelectEvent) => console.log(ev.date.toDateString())}
  onClose={(ev: tabris.DateDialogCloseEvent) => console.log(ev.date ? ev.date.toDateString() : '')}/>;
dateDialog = <tabris.DateDialog/>;

let timeDialog: tabris.TimeDialog = <tabris.TimeDialog
  date={new Date()}
  onSelect={(ev: tabris.TimeDialogSelectEvent) => console.log(ev.date.toTimeString())}
  onClose={(ev: tabris.TimeDialogCloseEvent) => console.log(ev.date ? ev.date.toTimeString() : '')}/>;
timeDialog = <tabris.TimeDialog/>;

let popover: tabris.Popover = <tabris.Popover width={100} height={200} anchor={custom1}>
  {[new tabris.Button(), new tabris.TextView()]}
</tabris.Popover>;

popover = <tabris.Popover onClose={() => {}} />;
