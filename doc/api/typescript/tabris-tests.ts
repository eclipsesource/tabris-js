import {
    Action,
    Button,
    Canvas,
    Composite,
    CheckBox,
    Cell,
    CollectionView,
    Page,
    Drawer,
    ImageView,
    PageSelector,
    Picker,
    RadioButton,
    ScrollView,
    SearchAction,
    Slider,
    Switch,
    TabFolder,
    Tab,
    TextInput,
    TextView,
    ToggleButton,
    ProgressBar,
    Video,
    WebView,
    WidgetCollection,
    app,
    App,
    device,
    Device,
    ui,
    UI,
} from "tabris";

var page: Page = new Page();

function test_events() {
  var listener = () => console.log("triggered");
  var widget = new Composite();
  widget.on("foo", listener);
  widget.trigger("foo", "details");
  widget.off("foo", listener);
  widget.off("foo");
  widget.off(null, listener);
  widget.off();
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
}

function test_CheckBox() {
  var widget: CheckBox = new CheckBox();
  widget.set("foo", 23);
  widget.set({
    selection: true,
    text: "foo"
  });
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
}

function test_Page() {
  var page: Page = new Page();
  page.set("foo", 23);
  page.set({
    image: {src: "http://example.com"},
    title: "foo",
    topLevel: true
  });
  page.open().close();
}

function test_PageSelector() {
  var widget: PageSelector = new PageSelector();
  widget.set("foo", 23);
  widget.set({
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
  var widget: ScrollView = new ScrollView();
  widget.set("foo", 23);
  widget.set({
    direction: "horizontal"
  });
}

function test_SearchAction() {
  var widget: SearchAction = new SearchAction();
  widget.set("foo", 23);
  widget.set({
    message: "foo",
    proposals: ["foo", "bar", "baz"],
    text: "foo"
  });
}

function test_Slider() {
  var widget: Slider = new Slider();
  widget.set("foo", 23);
  widget.set({
    minimum: 0,
    maximum: 100,
    selection: 23
  });
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
}

function test_Tab() {
  var tab: Tab = new Tab();
  tab.set("foo", 23);
  tab.set({
    badge: "foo",
    title: "bar",
    image: {src: "http://example.org"}
  });
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
}

function test_WebView() {
  var widget: WebView = new WebView();
  widget.set("foo", 23);
  widget.set({
    html: "<html>",
    url: "http://example.org"
  });
}

function test_WidgetCollection() {
  var collection: WidgetCollection = page.find();
  var length: number = collection.length;
  var grandParents: WidgetCollection = collection.parent().parent();
  var grandChildren: WidgetCollection = collection.children().children();
  var found: WidgetCollection = collection.find().find(".class");
  collection.appendTo(page);
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
  var same: Device = device.on("change:orientation", () => {}).off("change:orientation");
}

function test_tabris_ui() {
  var page: Page = ui.get("activePage");
  var bg: string = ui.get("background");
  var tc: string = ui.get("textColor");
  var visible: boolean = ui.get("toolbarVisible");
  var same: UI = ui.on("change:activePage", () => {}).off("change:activePage");
}
