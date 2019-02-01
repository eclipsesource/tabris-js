import {
  Action,
  ActionSheet,
  ActivityIndicator,
  AlertDialog,
  app,
  Button,
  Canvas,
  CheckBox,
  CollectionView,
  Composite,
  contentView,
  DateDialog,
  device,
  drawer,
  fs,
  ImageView,
  NavigationView,
  Page,
  Picker,
  Popover,
  printer,
  ProgressBar,
  RadioButton,
  RefreshComposite,
  ScrollView,
  SearchAction,
  Slider,
  StackComposite,
  Switch,
  Tab,
  TabFolder,
  TextInput,
  TextView,
  TimeDialog,
  ToggleButton,
  Video,
  WebView
} from 'tabris';

const snippets = [
  actionSnippet,
  activityIndicatorSnippet,
  buttonSnippet,
  canvasSnippet,
  checkBoxSnippet,
  collectionViewSnippet,
  compositeSnippet,
  drawerSnippet,
  imageViewSnippet,
  navigationViewSnippet,
  pageSnippet,
  pickerSnippet,
  progressBarSnippet,
  radioButtonSnippet,
  refreshCompositeSnippet,
  scrollViewSnippet,
  searchActionSnippet,
  sliderSnippet,
  stackCompositeSnippet,
  switchSnippet,
  tabSnippet,
  tabFolderSnippet,
  textInputSnippet,
  textViewSnippet,
  toggleButtonSnippet,
  videoSnippet,
  webViewSnippet,
  consoleSnippet,
  printerSnippet,
  actionSheetSnippet,
  alertDialogSnippet,
  dateDialogSnippet,
  timeDialogSnippet,
  popoverSnippet
];

const large = 288;
const medium = 224;
const small = 160;
const tiny = 128;
const android = (value, defaultValue = 0) => device.platform === 'Android' ? value : defaultValue;
const ios = (value, androidValue = 0) => device.platform === 'iOS' ? value : androidValue;

let snippetParent;
let snippetResult;

runSnippet(0);

function runSnippet(i) {
  if (snippetResult && typeof snippetResult.tearDown === 'function') {
    snippetResult.tearDown();
    snippetResult = null;
  }
  const snippet = snippets[i];
  if (snippet) {
    if (snippetParent) {
      snippetParent.dispose();
    }

    snippetParent = new Composite({left: 0, top: 0}).appendTo(contentView);
    snippetResult = snippet(snippetParent) || {};

    setTimeout(() => {
      const fileName = createFileName(snippet);
      capture(snippetResult.captureTarget || snippetParent)
        .then(image => fs.writeFile(fileName, image))
        .catch(err => console.log(err))
        .then(() => runSnippet(++i));
    }, snippetResult.captureDelay || 1000);
  }
}

function capture(target) {
  return new Promise((resolve, reject) => {
    if (device.platform !== 'Android') {
      reject('View capturing is only supported on Android');
    }
    app._nativeCall('capture', {
      target: target.cid,
      onError: (err) => reject(err),
      onSuccess: (image) => resolve(image)
    });
  });
}

function createFileName(snippet) {
  let name = snippet.name.replace('Snippet', '');
  name = name.charAt(0).toUpperCase() + name.slice(1);
  return `${fs.filesDir}/${name}.png`;
}

function dimen(view, width, height = undefined) {
  view.width = width;
  view.height = height;
}

function actionSnippet(parent) {
  dimen(parent, large);
  const navigationView = new NavigationView({
    left: 16, right: 16, top: 16, bottom: 16, actionColor: device.platform === 'iOS' ? 'black' : 'white'
  }).appendTo(parent);
  new Page({title: 'Action'}).appendTo(navigationView);
  if (device.platform === 'Android') { new Action({title: 'Share'}).appendTo(navigationView); }
  new Action({image: 'resources/search-black-24dp@3x.png'}).appendTo(navigationView);
}

function activityIndicatorSnippet(parent) {
  dimen(parent, android(72, 52), android(72, 52));
  new ActivityIndicator({left: 16, right: 16, top: 16, bottom: 16}).appendTo(parent);
  return {captureDelay: 2100};
}

function buttonSnippet(parent) {
  dimen(parent, small);
  new Button({left: 16, right: 16, top: android(10, 16), text: 'Button'}).appendTo(parent);
  new Button({left: 16, right: 16, top: ['prev()', ios(12)], text: 'Flat', style: 'flat'}).appendTo(parent);
  new Button({left: 16, right: 16, top: ['prev()', ios(12)], text: 'Outline', style: 'outline'}).appendTo(parent);
  new Button({left: 16, right: 16, top: ['prev()', ios(12)], bottom: 16, text: 'Text', style: 'text'}).appendTo(parent);
}

function canvasSnippet(parent) {
  dimen(parent, 232, 198);
  new Canvas({left: 16, right: 16, top: 16, bottom: 16})
    .on('resize', ({target: canvas, width, height}) => {
      const scaleFactor = device.scaleFactor;
      const ctx = canvas.getContext('2d', width * scaleFactor, height * scaleFactor);
      ctx.textAlign = 'center';
      ctx.fillStyle = '#db4437aa';
      ctx.fillRect(60, 0, 264, 190);
      ctx.fillStyle = '#4356ccaa';
      ctx.fillRect(0, 120, 264, 180);
      ctx.fillStyle = '#8dbd0090';
      ctx.beginPath();
      ctx.arc(260, 192, 140, 0, 2 * Math.PI, false);
      ctx.fill();
      ctx.fillStyle = 'white';
      ctx.font = ctx.font = '30px';
      ctx.fillText('Canvas', 64, 280);
    }).appendTo(parent);
}

function checkBoxSnippet(parent) {
  new CheckBox({left: android(9, 16), top: android(9, 16), text: 'Checked', checked: true}).appendTo(parent);
  new CheckBox({left: android(9, 16), top: ['prev()', ios(12)], right: 16, bottom: android(9, 16), text: 'Unchecked'})
    .appendTo(parent);
}

function collectionViewSnippet(parent) {
  dimen(parent, medium, 232);
  const items = [
    ['Search', 'search-black-24dp@3x.png'],
    ['Settings', 'settings-black-24dp@3x.png'],
    ['Delete', 'delete-black-24dp@3x.png'],
    ['Close', 'close-black-24dp@3x.png'],
    ['Arrow', 'arrow-forward-black-24dp@3x.png']
  ];
  new CollectionView({
    left: 16, top: 16, right: 16, bottom: 16,
    cellHeight: 40,
    itemCount: items.length,
    cellType: index => items[index].type,
    createCell: () => new Composite()
      .append(new ImageView({left: 16, centerY: 0, tintColor: '#555'}))
      .append(new TextView({left: ['prev()', 16], centerY: 0}))
      .append(new Composite({left: 0, right: 0, bottom: 0, height: 1, background: '#ddd'})),
    updateCell: (view, index) => {
      const item = items[index];
      view.children()[0].image = `resources/${item[1]}`;
      view.children()[1].text = item[0];
      view.children()[2].visible = index !== items.length - 1;
    }
  }).appendTo(parent);
}

function compositeSnippet(parent) {
  dimen(parent, small, small);
  new Composite({left: 16, top: 16, right: 16, bottom: 16, background: 'white', elevation: 8}).appendTo(parent);
}

function drawerSnippet() {
  drawer.enabled = true;
  drawer.open();
  new TextView({left: 16, top: 16, text: 'Open drawer'}).appendTo(drawer);
  return {tearDown: () => drawer.close(), captureTarget: tabris};
}

function imageViewSnippet(parent) {
  dimen(parent, tiny);
  new ImageView({
    left: 16, right: 16, top: 16, bottom: 16, background: 'white', elevation: 8, image: 'resources/cover.jpg'
  }).appendTo(parent);
}

function navigationViewSnippet(parent) {
  dimen(parent, large);
  const navigationView = new NavigationView({
    left: 16, right: 16, top: 16, bottom: 16,
    drawerActionVisible: true,
    actionColor: device.platform === 'iOS' ? 'black' : 'white'
  }).appendTo(parent);
  new Page({title: 'Tabris.js'}).appendTo(navigationView);
  new Action({image: 'resources/search-black-24dp@3x.png'}).appendTo(navigationView);
}

function pageSnippet(parent) {
  dimen(parent, large, medium);
  const navigationView = new NavigationView({
    left: 16, right: 16, top: 16, bottom: 16,
    elevation: 8,
    background: 'white'
  }).appendTo(parent);
  new Page({title: 'Tabris.js'}).appendTo(navigationView).append(new TextView({centerX: 0, centerY: 0, text: 'Page'}));
}

function pickerSnippet(parent) {
  dimen(parent, medium);
  const items = ['San Francisco', 'Berlin', 'Shanghai'];
  new Picker({
    left: 16, right: 16, top: 16, bottom: 16,
    itemCount: items.length,
    itemText: (index) => items[index]
  }).appendTo(parent);
}

function progressBarSnippet(parent) {
  dimen(parent, medium);
  new ProgressBar({left: 16, right: 16, top: android(10, 16), bottom: android(10, 16), selection: 33.3})
    .appendTo(parent);
}

function radioButtonSnippet(parent) {
  new RadioButton({
    left: android(10, 14), top: android(10, 15), text: 'One', checked: true
  }).appendTo(parent);
  new RadioButton({left: android(10, 14), top: ['prev()', ios(10)], text: 'Two'}).appendTo(parent);
  new RadioButton({
    left: android(10, 14), right: 16, top: ['prev()', ios(10)], bottom: android(10, 15), text: 'Three'
  }).appendTo(parent);
}

function refreshCompositeSnippet(parent) {
  dimen(parent, medium, medium);
  new RefreshComposite({
    refreshIndicator: true,
    left: 16, right: 16, top: 16, bottom: 16, background: 'white', elevation: 8, refreshMessage: 'Refreshing...'
  }).appendTo(parent);
}

function scrollViewSnippet(parent) {
  dimen(parent, tiny, small);
  const scrollView = new ScrollView({left: 16, right: 16, top: 16, bottom: 16, background: 'white', elevation: 8})
    .appendTo(parent);
  for (let i = 1; i <= 10; i++) {
    new TextView({left: 16, top: ['prev()', 16], height: 16, text: i}).appendTo(scrollView);
  }
}

function searchActionSnippet(parent) {
  dimen(parent, large);
  const navigationView = new NavigationView({
    left: 16, right: 16, top: 16, bottom: 16
  }).appendTo(parent);
  new SearchAction({
    image: 'resources/search-black-24dp@3x.png',
    message: 'Favorite fruits',
    proposals: ['Apple', 'Banana', 'Cranberry']
  }).appendTo(navigationView).open();
}

function sliderSnippet(parent) {
  dimen(parent, medium);
  new Slider({left: android(0, 16), right: 16, top: android(13, 16), bottom: android(13, 16), selection: 33.3})
    .appendTo(parent);
}

function stackCompositeSnippet(parent) {
  dimen(parent, small);
  new StackComposite({
    left: 16, right: 16, top: 16, bottom: 16,
    elevation: 8, background: 'white', padding: 16, spacing: 16, alignment: 'stretchX'
  }).appendTo(parent)
    .append(new TextView({text: 'Top', background: '#eee'}))
    .append(new TextView({text: 'Middle', background: '#eee'}))
    .append(new TextView({text: 'Bottom', background: '#eee'}));
}

function switchSnippet(parent) {
  new Switch({left: android(5, 16), top: android(13, 16), checked: true}).appendTo(parent);
  new Switch({left: android(13, 16), top: ['prev()', android(6, 16)], right: android(5, 16), bottom: android(13, 16)})
    .appendTo(parent);
}

function tabSnippet(parent) {
  tabFolderSnippet(parent);
}

function tabFolderSnippet(parent) {
  dimen(parent, large, small * 2 + 16);
  new TabFolder({
    left: 16, right: 16, top: 16, height: 144,
    background: 'white', elevation: 8, tabBarElevation: 2, tabBarLocation: 'top'
  }).appendTo(parent)
    .append(new Tab({title: 'Search'})
      .append(new TextView({centerX: 0, centerY: 0, text: 'Search tab'})))
    .append(new Tab({title: 'Settings'}));

  const tabFolder = new TabFolder({
    left: 16, right: 16, top: ['prev()', 16], bottom: 16,
    background: 'white', elevation: 8, tabBarElevation: 2, tabBarLocation: 'bottom'
  }).appendTo(parent)
    .append(new Tab({title: 'Search', image: 'resources/search-black-24dp@3x.png'}))
    .append(new Tab({title: 'Settings', image: 'resources/settings-black-24dp@3x.png'})
      .append(new TextView({centerX: 0, centerY: 0, text: 'Settings tab'})));
  tabFolder.selection = tabFolder.children()[1];
}

function textInputSnippet(parent) {
  dimen(parent, medium);
  new TextInput({left: 16, right: 16, top: android(10, 16), message: 'First name'}).appendTo(parent);
  new TextInput({left: 16, right: 16, top: ['prev()', ios(12)], text: 'Smith'}).appendTo(parent);
  new TextInput({left: 16, right: 16, top: ['prev()', ios(12)], type: 'password', text: 'Smith'}).appendTo(parent);
  new TextInput({
    left: 16, right: 16, top: ['prev()', ios(12)], bottom: android(14, 16), type: 'multiline', text: 'Multiple\nlines'
  }).appendTo(parent);
}

function textViewSnippet(parent) {
  new TextView({left: 16, right: 16, top: 16, bottom: 16, text: 'Hello World!'}).appendTo(parent);
}

function toggleButtonSnippet(parent) {
  dimen(parent, tiny);
  new ToggleButton({
    left: android(12, 16), top: android(10, 16), right: android(12, 16),
    text: 'Active', checked: true
  }).appendTo(parent);
  new ToggleButton({
    left: android(12, 16), top: ['prev()', ios(12)], bottom: android(10, 16), right: android(12, 16), text: 'Inactive'
  }).appendTo(parent);
}

function videoSnippet(parent) {
  dimen(parent, large, 109 + 32);
  const video = new Video({
    left: 16, right: 16, top: 16, bottom: 16,
    url: 'http://peach.themazzone.com/durian/movies/sintel-1280-stereo.mp4'
  }).appendTo(parent);
  return {captureTarget: video, captureDelay: 20000};
}

function webViewSnippet(parent) {
  dimen(parent, large, 204 + 32);
  new WebView({
    left: 16, right: 16, top: 16, bottom: 16, background: 'white', elevation: 8, url: 'https://tabris.com'
  }).appendTo(parent);
  return {captureDelay: 3000};
}

function consoleSnippet(parent) {
  parent.right = 0;
  new TextView({right: 16, top: 16, text: 'Console snippet. Open dev drawer.'}).appendTo(parent);
  ['debug', 'log', 'info', 'warn', 'error'].forEach((method) => { console[method](method); });
  return {captureDelay: 5000, captureTarget: tabris};
}

function printerSnippet() {
  new Button({left: 16, top: android(10, 16), text: 'Print'}).onTap(() => {
    fetch(app.getResourceLocation('resources/salad.jpg'))
      .then(res => res.arrayBuffer())
      .then(data => printer.print(data, {jobName: 'Salad image', contentType: 'image/jpg'}))
      .then(event => console.log('Printing finished', event))
      .catch(err => console.error(err));
  }).appendTo(snippetParent);
}

function actionSheetSnippet() {
  const actionSheet = new ActionSheet({
    title: 'Actions',
    message: 'Select any of the actions below to proceed.',
    actions: [
      {title: 'Settings', image: {src: 'resources/settings-black-24dp@3x.png', scale: 3}},
      {title: 'Delete', image: {src: 'resources/delete-black-24dp@3x.png', scale: 3}, style: 'destructive'},
      {title: 'Cancel', image: {src: 'resources/close-black-24dp@3x.png', scale: 3}, style: 'cancel'}
    ]
  }).open();
  return {tearDown: () => actionSheet.close(), captureTarget: actionSheet};
}

function alertDialogSnippet() {
  const dialog = new AlertDialog({
    title: 'Document changed',
    message: 'Do you want to save your edits?',
    buttons: {
      ok: 'Save',
      cancel: 'Cancel'
    }
  }).open();
  return {tearDown: () => dialog.close(), captureTarget: dialog};
}

function dateDialogSnippet() {
  const dialog = new DateDialog().open();
  return {tearDown: () => dialog.close(), captureTarget: dialog};
}

function timeDialogSnippet() {
  const dialog = new TimeDialog().open();
  return {tearDown: () => dialog.close(), captureTarget: dialog};
}

function popoverSnippet() {
  const popover = new Popover();
  popover.contentView.append(new TextView({left: 16, top: 16, text: 'Hello Popover'}));
  popover.open();
  return {tearDown: () => popover.close(), captureTarget: popover};
}
