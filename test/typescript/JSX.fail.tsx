import * as tabris from 'tabris';

<tabris.Canvas height={23} getContext={function(val: any) { return val; }} />;
<tabris.CheckBox checked={23}/>;
<tabris.CollectionView refreshEnabled={true} firstVisibleIndex={23} />;
<tabris.ScrollView height={23} onDirectionChanged={function () {}} />;
<tabris.TextInput height={23} onTypeChanged={function() {}} />;
<tabris.TextView alignment='top'/>;
<tabris.Video autoPlay={0}/>;
<tabris.WidgetCollection length={2}><tabris.Button/><tabris.TextView/></tabris.WidgetCollection>;
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

let custom1: MyCustomWidget = <MyCustomWidget height={23} foo={23}/>;

class MyCustomWidgetWithCustomJsx extends tabris.Composite {

  public jsxProperties: tabris.Composite['jsxProperties'] & {
    foo?: number;
    bar: string;
  };

}

let custom2: MyCustomWidgetWithCustomJsx = <MyCustomWidgetWithCustomJsx height={23} foo='foo'/>;

class MyCustomWidgetWithUnpackedListeners extends tabris.Composite {

  public foo: number;
  public readonly bar: string;
  public onFooChanged = 23;
  public jsxProperties: tabris.Composite['jsxProperties'] & tabris.JSXProperties<this, 'foo' | 'onFooChanged'>;

}

let custom3: MyCustomWidgetWithUnpackedListeners = <MyCustomWidgetWithUnpackedListeners
  onFooChanged={function() {}}
/>;

class MyCustomWidgetWithWrongJsx extends tabris.Composite {

  public jsxProperties: {x: number};

}

/*Expected
(3,
'getContext' does not exist
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
(16,
'jsxProperties' is missing in type 'Widget'
(17,
'jsxProperties' is missing in type 'NativeObject'
(18,
'jsxProperties' is missing in type 'Device'
(19,
'jsxProperties' is missing in type 'App'
(28,
'foo' does not exist
(39,
'string' is not assignable to type 'number'
(51,
Types of property 'onFooChanged' are incompatible.
(56,
jsxProperties' in type 'MyCustomWidgetWithWrongJsx' is not assignable
*/