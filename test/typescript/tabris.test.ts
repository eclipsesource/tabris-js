import {
  Action,
  AlertDialog,
  Button,
  Canvas,
  CanvasContext,
  Composite,
  CheckBox,
  Cell,
  CollectionView,
  NavigationBar,
  Page,
  Drawer,
  ImageView,
  Picker,
  RadioButton,
  ScrollView,
  SearchAction,
  Slider,
  StatusBar,
  Switch,
  TabFolder,
  Tab,
  TextInput,
  TextView,
  ToggleButton,
  ProgressBar,
  Video,
  WebView,
  Widget,
  WidgetCollection,
  app,
  App,
  device,
  Device,
  ui,
  UI,
  Image
} from "tabris";

var page: Page = new Page();

function test_events() {
  var listener = () => console.log("triggered");
  var widget = new Composite();
  widget.on("foo", listener);
  widget.trigger("foo", "details");
  widget.off("foo", listener);
  widget.off(null, listener);
}

function test_Action() {
  var widget: Action = new Action();
  widget.set("foo", 23);
  widget.set({
    image: {src: "http://example.org"},
    title: "foo",
    placementPriority: "high"
  });
  var self: Action = widget.on("event", function(widget: Action) {});
}

function test_Button() {
  var widget: Button = new Button();
  widget.set("foo", 23);
  widget.set({
    width: 200,
    height: 400,
    alignment: "center",
    image: {src: "http://example.org"},
    text: "foo"
  });
  let width: number = widget.width;
  let height: number = widget.height;
  let alignment: "center" | "left" | "right" = widget.alignment;
  let image: Image = widget.image;
  let text: string = widget.text;
}

function test_CheckBox() {
  var widget: CheckBox = new CheckBox();
  widget.set("foo", 23);
  widget.set({
    selection: true,
    text: "foo"
  });
  let selection: boolean = widget.selection;
}

function test_Canvas() {
  var widget: Canvas = new Canvas();
  widget.set("foo", 23);
  widget.set({
  });
  var ctx: CanvasContext = widget.getContext("2d", 200, 300);
}

function test_Cell() {
  var widget: Cell = new Cell();
  widget.set("foo", 23);
  widget.set({
  });
}

function test_CollectionView() {
  var widget: CollectionView = new CollectionView();
  widget.set("foo", 23);
  widget.set({
    cellType: (item: any) => "foo",
    initializeCell: (cell: Cell, type: string) => {},
    itemHeight: (item: any, type: string) => 23,
    items: ["foo", "bar", "baz"],
    refreshEnabled: true,
    refreshIndicator: true,
    refreshMessage: "foo"
  });
  let cellType: string|Function = widget.cellType;
  let initializeCell: Function = widget.initializeCell;
  let itemHeight: number|Function = widget.itemHeight;
  let items: any[] = widget.items;
  let refreshEnabled: boolean = widget.refreshEnabled;
  let refreshIndicator: boolean = widget.refreshIndicator;
  let refreshMessage: string = widget.refreshMessage;
  widget.insert(["item1", "item2"]);
  widget.insert(["item1", "item2"], 3);
  widget.refresh();
  widget.refresh(3);
  widget.remove(3);
  widget.remove(3, 2);
  widget.reveal(23);
}

function test_Composite() {
  var widget: Composite = new Composite();
  widget.set("foo", 23);
  widget.set({
  });
}

function test_Drawer() {
  var widget: Drawer = new Drawer();
  widget.set("foo", 23);
  widget.set({
  });
  var same: Drawer = widget.open();
  var same: Drawer = widget.close();
}

function test_ImageView() {
  var widget: ImageView = new ImageView();
  widget.set("foo", 23);
  widget.set({
    image: {src: "http://example.com"},
    scaleMode: "auto"
  });
  let scaleMode: "auto" | "fill" | "fit" | "none" | "stretch" = widget.scaleMode;
}

function test_NavigationBar() {
  let navigationBar: NavigationBar = new NavigationBar();
  let displayMode: 'default'|'hide'|'float' = navigationBar.displayMode;
  let height: number = navigationBar.height;
  let background: string = navigationBar.background;
}

function test_Page() {
  var page: Page = new Page();
  let image: Image = page.image;
  let title: string = page.title;
  page.set("foo", 23);
  page.set({
    image: {src: "http://example.com"},
    title: "foo",
  });
}

function test_Picker() {
  var widget: Picker = new Picker();
  widget.set("foo", 23);
  widget.set({
    selection: "foo",
    selectionIndex: 23,
    items: ["foo", "bar", "baz"]
  });
  let selection: any = widget.selection;
  let selectionIndex: number = widget.selectionIndex;
  let items: any[] = widget.items;
}

function test_ProgressBar() {
  var widget: ProgressBar = new ProgressBar();
  widget.set("foo", 23);
  widget.set({
    minimum: 0,
    maximum: 100,
    selection: 23,
    state: "normal"
  });
  let minimum: number = widget.minimum;
  let maximum: number = widget.maximum;
  let selction: number = widget.selection;
  let state: "error" | "normal" | "paused" = widget.state;
}

function test_RadioButton() {
  var widget: RadioButton = new RadioButton();
  widget.set("foo", 23);
  widget.set({
    selection: true,
    text: "foo"
  });
}

function test_ScrollView() {
  let scrollView: ScrollView = new ScrollView();

  scrollView.set('foo', 23);
  scrollView.set({
    direction: 'horizontal'
  });

  let direction: 'horizontal' | 'vertical' = scrollView.direction;
  scrollView.direction = 'horizontal';

  let offsetX: number = scrollView.offsetX;
  scrollView.offsetX = 23;

  let offsetY: number = scrollView.offsetY;
  scrollView.offsetY = 42;

  scrollView.scrollToX(23);
  scrollView.scrollToX(23, {});
  scrollView.scrollToX(23, {animate: false});

  scrollView.scrollToY(42);
  scrollView.scrollToY(42, {});
  scrollView.scrollToY(42, {animate: false});
}

function test_SearchAction() {
  var widget: SearchAction = new SearchAction();
  widget.set("foo", 23);
  widget.set({
    message: "foo",
    proposals: ["foo", "bar", "baz"],
    text: "foo"
  });
  let message: string = widget.message;
  let proposals: string[] = widget.proposals;
  let text: string = widget.text;
}

function test_Slider() {
  var widget: Slider = new Slider();
  widget.set("foo", 23);
  widget.set({
    minimum: 0,
    maximum: 100,
    selection: 23
  });
  let minimum: number = widget.minimum;
  let maximum: number = widget.maximum;
  let selction: number = widget.selection;
}

function test_StatusBar() {
  let statusBar: StatusBar = new StatusBar();
  let theme: 'default'|'light'|'dark' = statusBar.theme;
  let displayMode: 'default'|'hide'|'float' = statusBar.displayMode;
  let height: number = statusBar.height;
  let background: string = statusBar.background;
}

function test_Switch() {
  var widget: Switch = new Switch();
  widget.set("foo", 23);
  widget.set({
    selection: true
  });
}

function test_TextInput() {
  var widget: TextInput = new TextInput();
  widget.set("foo", 23);
  widget.set({
    alignment: "center",
    autoCapitalize: true,
    autoCorrect: false,
    editable: true,
    text: "foo",
    message: "bar",
    type: "search",
    keyboard: "ascii"
  });
  let alignment: "center" | "left" | "right" = widget.alignment;
  let autoCapitalize: boolean = widget.autoCapitalize;
  let autoCorrect: boolean = widget.autoCorrect;
  let editable: boolean = widget.editable;
  let text: string = widget.text;
  let message: string = widget.message;
  let type: "default" | "multiline" | "password" | "search" = widget.type;
  let keyboard: "ascii" | "decimal" | "default" | "email" | "number" | "numbersAndPunctuation" | "phone" | "url" = widget.keyboard;
}

function test_Tab() {
  var tab: Tab = new Tab();
  tab.set("foo", 23);
  tab.set({
    badge: "foo",
    title: "bar",
    image: {src: "http://example.org"}
  });
  let badge: string = tab.badge;
  var folder = new TabFolder();
  tab.appendTo(folder);
}

function test_TabFolder() {
  var widget: TabFolder = new TabFolder();
  widget.set("foo", 23);
  widget.set({
    paging: true,
    tabBarLocation: "auto",
    selection: tab1
  });
  let paging: boolean = widget.paging;
  let tabBarLocation: "auto" | "bottom" | "hidden" | "top" = widget.tabBarLocation;
  let selection: Tab = widget.selection;
  var tab1: Tab, tab2: Tab;
  var same: TabFolder = widget.append(tab1, tab2);
}

function test_TextView() {
  var widget: TextView = new TextView();
  widget.set("foo", 23);
  widget.set({
    alignment: "center",
    markupEnabled: true,
    maxLines: 23,
    text: "foo"
  });
  let alignment: "center" | "left" | "right" = widget.alignment;
  let markupEnabled: boolean = widget.markupEnabled;
  let maxLines: number|Function = widget.maxLines;
  widget.set("maxLines", 23);
  widget.set("maxLines", () => 42);
}

function test_ToggleButton() {
  var widget: ToggleButton = new ToggleButton();
  widget.set("foo", 23);
  widget.set({
    alignment: "center",
    image: {src: "http://example.org/"},
    selection: true,
    text: "foo"
  });
}

function test_Video() {
  var widget: Video = new Video();
  widget.set("foo", 23);
  widget.set({
    url: "http://example.org"
  });
  let url: string = widget.url;
}

function test_WebView() {
  var widget: WebView = new WebView();
  widget.set("foo", 23);
  widget.set({
    html: "<html>",
    url: "http://example.org"
  });
  let url: string = widget.url;
  let html: string = widget.html;
}

function test_Widget() {
  let widget: Widget = new Composite();
  let other: Widget = new Button();

  // find
  let found: WidgetCollection = widget.find('.foo');
  let visibleFound: WidgetCollection = widget.find((widget: Widget) => widget.visible);

  // parent
  let parent: Widget = widget.parent();

  // children
  let children: WidgetCollection = widget.children();
  let filteredChildren: WidgetCollection = widget.children('.foo');
  let visbleChildren: WidgetCollection = widget.children((widget: Widget) => widget.visible);

  // siblings
  let siblings: WidgetCollection = widget.siblings();
  let filteredSiblings: WidgetCollection = widget.siblings('.foo');
  let visbleSiblings: WidgetCollection = widget.siblings((widget: Widget) => widget.visible);

  // appendTo, insertBefore, insertAfter
  widget.appendTo(page);
  widget.insertBefore(other);
  widget.insertAfter(other);

  // detach, dispose, isDisposed
  widget.detach();
  widget.dispose();
  let disposed = widget.isDisposed();
}

function test_WidgetCollection() {
  let collection: WidgetCollection = page.find();
  let widget: Widget = new Button();

  // length
  let length: number = collection.length;

  // first, last
  let first: Widget = collection.first();
  let last: Widget = collection.last();

  // toArray
  let array: Widget[] = collection.toArray();

  // forEach
  collection.forEach((widget: Widget, index: number) => index !== 0 && widget.visible);

  // indexOf, includes
  let index = collection.indexOf(widget);
  let included = collection.includes(widget);

  // filter
  let filteredMembers: WidgetCollection = collection.filter('.foo');
  let visibleMembers: WidgetCollection = collection.filter((widget: Widget) => widget.visible);

  // find
  let found: WidgetCollection = collection.find('.foo');
  let visibleFound: WidgetCollection = collection.find((widget: Widget) => widget.visible);

  // parent
  let parents: WidgetCollection = collection.parent();

  // children
  let children: WidgetCollection = collection.children();
  let filteredChildren: WidgetCollection = collection.children('.foo');
  let visbleChildren: WidgetCollection = collection.children((widget: Widget) => widget.visible);

  // appendTo
  collection.appendTo(page);

  // dispose
  collection.dispose();
}

function test_tabris_app() {
  app.installPatch("url", (error: Error, patch: Object) => {});
  app.reload();
}

function test_tabris_device() {
  var lang: string = device.get("language");
  var model: string = device.get("model");
  var orient: string = device.get("orientation");
  var platform: string = device.get("platform");
  var factor: number = device.get("scaleFactor");
  var height: number = device.get("screenHeight");
  var width: number = device.get("screenWidth");
  var version: string = device.get("version");
  var same: Device = device.on("change:orientation", () => {}).off("change:orientation", () => {});
}

function test_tabris_ui() {
  var statusBar: StatusBar = ui.statusBar;
  var navigationBar: NavigationBar = ui.navigationBar;
  var drawer: Drawer = ui.drawer;
  var contentView: Composite = ui.contentView;
}

function test_AlertDialog() {
  let widget: AlertDialog = new AlertDialog();
  widget.set('foo', 23);
  widget.buttons = {ok: 'Ok', cancel: 'Cancel', neutral: 'Close'};
  widget.buttons = {ok: 'Ok'};
  widget.buttons = {cancel: 'Cancel'};
  widget.title = 'foo';
  widget.message = 'bar';
  let self1: AlertDialog = widget.on('close', (widget: AlertDialog, button: string) => {});
  let self2: AlertDialog = widget.on('close:ok', (widget: AlertDialog) => {});
  let self3: AlertDialog = widget.on('close:cancel', (widget: AlertDialog) => {});
  let self4: AlertDialog = widget.on('close:neutral', (widget: AlertDialog) => {});
}
