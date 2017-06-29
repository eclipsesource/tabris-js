import * as tabris from 'tabris';

let action: tabris.Action = <action title='foo'/>;
let button: tabris.Button = <button text='foo'/>;
let canvas: tabris.Canvas = <canvas transform={{rotation: 360}}/>;
let checkBox: tabris.CheckBox = <checkBox checked={true}/>;
let collectionView: tabris.CollectionView = <collectionView refreshEnabled={true}/>;
let composite: tabris.Composite = <composite layoutData={{width: 100}}/>;
let imageView: tabris.ImageView = <imageView image='./foo.jpg'/>;
let navigationView: tabris.NavigationView = <navigationView actionColor='red'/>;
let page: tabris.Page = <page autoDispose={false}/>;
let picker: tabris.Picker = <picker selectionIndex={3}/>;
let progressBar: tabris.ProgressBar = <progressBar maximum={100}/>;
let radioButton: tabris.RadioButton = <radioButton checked={true}/>;
let scrollView: tabris.ScrollView = <scrollView direction='vertical'/>;
let searchAction: tabris.SearchAction = <searchAction text='foo'/>;
let slider: tabris.Slider = <slider maximum={100}/>;
let switchButton: tabris.Switch = <switch thumbOnColor='red'/>;
let tab: tabris.Tab = <tab badge='3'/>;
let tabFolder: tabris.TabFolder = <tabFolder tabBarLocation='top'/>;
let textInput: tabris.TextInput = <textInput autoCapitalize={true}/>;
let textView: tabris.TextView = <textView alignment='right'/>;
let toggleButton: tabris.ToggleButton = <toggleButton text='red'/>;
let video: tabris.Video = <video autoPlay={true}/>;
let webView: tabris.WebView = <webView url='http://localhost/'/>;

let noAttributes: tabris.Composite = <composite/>;
let widgetCollection = <widgetCollection><button/><textView/></widgetCollection>;
let compositeWithChildren = <composite><button/><widgetCollection><textView/></widgetCollection></composite>;

class MyCustomWidget extends tabris.Composite {

  private jsxProperties: {
    foo?: number;
    bar: string;
  };

}

let myCustomWidget: MyCustomWidget = <MyCustomWidget bar='foo'/>;
