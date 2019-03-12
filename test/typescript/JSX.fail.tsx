import * as tabris from 'tabris';

<tabris.Canvas height={23} getContext={function(val: any) { return val; }} />;
<tabris.CheckBox checked={23}/>;
<tabris.CollectionView refreshEnabled={true} firstVisibleIndex={23} />;
<tabris.ScrollView height={23} onDirectionChanged={function() {}} />;
<tabris.TextInput height={23} onTypeChanged={function() {}} />;
<tabris.TextView alignment='top'/>;
<tabris.Video autoPlay={0}/>;
<tabris.WidgetCollection length={2}>{[new tabris.Button(), new tabris.TextView()]}</tabris.WidgetCollection>;
<tabris.UI />;

<tabris.Drawer />;
<tabris.StatusBar />;
<tabris.NavigationBar />;
<tabris.Widget />;
<tabris.NativeObject />;
<tabris.Device />;
<tabris.App />;

class MyCustomWidget extends tabris.Composite {

  public foo: number;
  public bar: string;

}

const custom1: MyCustomWidget = <MyCustomWidget height={23} foo={23}/>;

class MyCustomWidgetWithCustomJsx extends tabris.Composite {

  public jsxProperties: tabris.Composite['jsxProperties'] & {
    foo?: number;
    bar: string;
  };

}

const custom2: MyCustomWidgetWithCustomJsx = <MyCustomWidgetWithCustomJsx height={23} foo='foo'/>;

class MyCustomWidgetWithUnpackedListeners extends tabris.Composite {

  public foo: number;
  public readonly bar: string;
  public onFooChanged = 23;
  public jsxProperties: tabris.JSXProperties<this>;

}

const custom3: MyCustomWidgetWithUnpackedListeners = <MyCustomWidgetWithUnpackedListeners
  onFooChanged={function() {}}
/>;

class MyCustomWidgetWithWrongJsx extends tabris.Composite {

  public jsxProperties: {x: number};

}

const noIntrinsicElements: any = <textInput />;

/** Invalid children **/

<tabris.Action left={10}>{new tabris.Button()}</tabris.Action>;
<tabris.Button left={10}>{new tabris.Button()}</tabris.Button>;
<tabris.Canvas left={10}>foo</tabris.Canvas>;
<tabris.CheckBox left={10}>{new tabris.Button()}</tabris.CheckBox>;
<tabris.CollectionView left={10}>{new tabris.Button()}</tabris.CollectionView>;
<tabris.Composite left={10}>foo</tabris.Composite>;
<tabris.ImageView left={10}>{new tabris.Button()}</tabris.ImageView>;
<tabris.NavigationView left={10}>{new tabris.Button()}</tabris.NavigationView>;
<tabris.Page left={10}>foo</tabris.Page>;
<tabris.Picker left={10}>{new tabris.Button()}</tabris.Picker>;
<tabris.ProgressBar left={10}>{new tabris.Button()}</tabris.ProgressBar>;
<tabris.RadioButton left={10}>{new tabris.Button()}</tabris.RadioButton>;
<tabris.ScrollView left={10}>foo</tabris.ScrollView>;
<tabris.SearchAction left={10}>{new tabris.Button()}</tabris.SearchAction>;
<tabris.Slider left={10}>{new tabris.Button()}</tabris.Slider>;
<tabris.Switch left={10}>{new tabris.Button()}</tabris.Switch>;
<tabris.Tab title='foo'>foo</tabris.Tab>;
<tabris.TabFolder left={10}>{new tabris.Button()}</tabris.TabFolder>;
<tabris.TextInput left={10}>{new tabris.Button()}</tabris.TextInput>;
<tabris.TextView left={10}>{new tabris.Button()}</tabris.TextView>;
<tabris.ToggleButton left={10}>{new tabris.Button()}</tabris.ToggleButton>;
<tabris.Video left={10}>{new tabris.Button()}</tabris.Video>;
<tabris.WebView left={10}>{new tabris.Button()}</tabris.WebView>;
<tabris.WidgetCollection>foo</tabris.WidgetCollection>;
<tabris.ActionSheet>{new tabris.Button()}</tabris.ActionSheet>;
<tabris.AlertDialog>{new tabris.Button()}</tabris.AlertDialog>;
<tabris.DateDialog>{new tabris.Button()}</tabris.DateDialog>;
<tabris.TimeDialog>{new tabris.Button()}</tabris.TimeDialog>;

const markup = <tabris.TextView markupEnabled>
  <br>no children please</br>
  <b>{23}</b>
  <a href={false}>link</a>
  <doesnotexist/>
</tabris.TextView>;

/*Expected
(4,
'number' is not assignable to type 'boolean'
(5,
'firstVisibleIndex' does not exist
(6,
'onDirectionChanged' does not exist
(7,
'onTypeChanged' does not exist
(8,
'"top"' is not assignable to type
(9,
'number' is not assignable to type 'boolean'
(10,
'length' does not exist
(11,
(13,
(14,
(15,
(17,
(18,
(19,
(39,
'string' is not assignable to type 'number'
(51,
(56,
'jsxProperties' in type 'MyCustomWidgetWithWrongJsx' is not assignable
(60,
'textInput' does not exist
(64,
(66,
(67,
(68,
(69,
(70,
(71,
(72,
(73,
(74,
(75,
(76,
(77,
(78,
(79,
(80,
(81,
(82,
(83,
(84,
(85,
(86,
(87,
(88,
(89,
(90,
(91,
(94,
(95,
(96,
(97,
*/
