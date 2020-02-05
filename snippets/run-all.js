// @ts-nocheck
import {
  NativeObject, contentView, TextView, app, Button, Picker, Composite, CheckBox, Page, NavigationView, Action, device,
  SearchAction, TabFolder, Popover, ProgressBar, RadioButton, RefreshComposite, ScrollView, Slider, Switch,
  ToggleButton, TextInput, CollectionView, TimeDialog, Video, WebView, ImageView, ActivityIndicator, AlertDialog,
  ActionSheet, Canvas, DateDialog, drawer, Color
} from 'tabris';

// Use these to exclude tests where they are broken due to a platform bug
const android = device.platform === 'Android';

const snippets = [
  ['actionsheet.js', async () => {
    await confirm(Button);
    await tap(find(Button));
    await wait(1000);
    await find(ActionSheet).close();
  }],
  ['activityindicator.js', async () => {
    await confirm(ActivityIndicator);
    await wait(3000);
    await tap(find(Button));
    await wait(2500);
  }],
  ['alertdialog.js', async () => {
    await confirm(Button, {}, 4);
    await wait(500);
    await forEachAsync(
      findAll(Button),
      button => tap(button),
      1000,
      () => find(AlertDialog).close()
    );
    await wait(500);
  }],
  ['app-launch.js', async () => {
    await confirm(Button, {text: 'Launch'});
    await confirm(TextInput, {text: 'http://tabris.com'});
  }],
  ['app-info.js', async () => {
    await confirm(TextView, {text: /Id.*com\.eclipsesource\.tabris.*/});
    await confirm(TextView, {text: /Version.*3\.[0-9]\.[0-9][-0-9]*/});
    await confirm(TextView, {text: /Version Code.*[0-9]+/});
  }],
  ['app-events.js', async () => {
    const waitForReloadKey = 'app.js-wait-for-reload';
    await confirm(TextView);
    if (localStorage.getItem(waitForReloadKey)) {
      localStorage.removeItem(waitForReloadKey);
      return;
    }
    localStorage.setItem(waitForReloadKey, true);
    await tap(find(Button, {text: 'Reload app'}));
  }],
  ['button.js', async () => {
    await confirm(Button);
    await tap(find(Button), 10);
  }],
  ['button-style.js', async () => {
    await confirm(Button, {}, 5);
    await forEachAsync(
      findAll(CheckBox),
      checkBox => tap(checkBox),
      1000,
      checkBox => tap(checkBox)
    );
  }],
  ['canvas.js', async () => {
    await confirm(Canvas);
    const data = await find(Canvas).getContext('2d').getImageData(0, 0, 100, 100).data;
    if (!data.some(i => i !== 0)) { throw new Error(); }
  }],
  ['checkbox.js', async () => {
    await confirm(CheckBox);
    await tap(find(CheckBox), 10, 10);
  }],
  ['collectionview.js', async () => {
    await confirm(CollectionView);
    await scroll(find(CollectionView));
  }],
  ['collectionview-ts.js', async () => {
    await confirm(CollectionView);
    await scroll(find(CollectionView));
  }],
  ['collectionview-cellheightauto.js', async () => {
    await confirm(CollectionView);
    await scroll(find(CollectionView));
  }],
  ['collectionview-celltype.js', async () => {
    await confirm(CollectionView);
    await scroll(find(CollectionView));
  }],
  ['collectionview-celltype-ts.js', async () => {
    await confirm(CollectionView);
    await scroll(find(CollectionView));
  }],
  ['collectionview-columncount.js', async () => {
    await confirm(CollectionView);
    await move(find(Slider), 1, 10, 300);
  }],
  ['collectionview-refreshenabled.js', async () => {
    await confirm(CollectionView);
    await wait(1200);
    await find(CollectionView).trigger('refresh');
    await wait(1200);
    await find(CollectionView).trigger('refresh');
    await wait(1200);
    await scroll(find(CollectionView));
  }],
  ['collectionview-scroll.js', async () => {
    await confirm(CollectionView);
    await scroll(find(CollectionView));
  }],
  ['collectionview-scroll-ts.js', async () => {
    await confirm(CollectionView);
    await scroll(find(CollectionView));
  }],
  ['composite.js', () => confirm(Composite, {}, 2)],
  ['console.js', async () => {
    const logs = [];
    const expected = 'debug:Message,log:Message,info:Message,warn:Message,log:onSelect (./console.jsx:11:';
    tabris.on('log', ev => logs.push(ev.level + ':' + ev.message));
    await confirm(Button, {}, 6);
    await wait(500);
    await forEachAsync(
      findAll(tabris.Button),
      button => button.text !== 'error' ? tap(button) : null,
      100
    );
    const actual = logs.join();
    if (!actual.startsWith(expected)) {
      console.error(`Expected log "${expected}", got "${actual}"`);
    }
  }],
  ['crypto.js', () => confirm(TextView, {text: /\s[0-9][0-9]/})],
  ['datedialog.js', async () => {
    await confirm(Button, {}, 3);
    await wait(500);
    await forEachAsync(
      findAll(tabris.Button),
      button => tap(button),
      1000,
      () => find(DateDialog).close()
    );
    await wait(500);
  }],
  ['device.js', async () => {
    await confirm(TextView, {text: /<b>Version:<\/b>\s.+/});
    await wait(1000);
  }],
  ['drawer.js', async () => {
    await wait(500);
    await drawer.open();
    await wait(1000);
    await drawer.close();
    await wait(500);
  }],
  ['drawer-pages.js', async () => {
    await confirm(Button);
    await tap(find(Button));
    await drawer.open();
    await wait(1000);
    await select(find(CollectionView), 2);
    await confirm(Page, {title: 'Another Page'});
  }],
  ['fetch.js', async () => {
    await confirm(Button);
    await tap(find(Button));
    await wait(3000);
    await confirm(TextView);
  }],
  ['fs.js', async () => {
    waitFor(ImageView, 'load', 1, 100000);
  }],
  ['imageview.js', async () => {
    waitFor(ImageView, 'load', 3);
  }],
  ['imageview-as-a-button.js', async () => {
    await confirm(ImageView);
    await tap(find(ImageView), 10, 10);
  }],
  ['imageview-base64.js', async () => {
    waitFor(ImageView, 'load');
  }],
  ['imageview-load.js', async () => {
    waitFor(ImageView, 'load', 2);
  }],
  ['imageview-scalemode-auto.js', async () => {
    await waitFor(ImageView, 'load');
    await move(find(Slider), 20, 20, 500);
  }],
  ['imageview-scalemode.js', async () => {
    await waitFor(ImageView, 'load');
    await selectAllItems(find(Picker, {}, 1));
    await select(find(Picker, {}, 0), 1);
    await waitFor(ImageView, 'load');
    await selectAllItems(find(Picker, {}, 1));
  }],
  ['imageview-tintcolor.js', async () => {
    await waitFor(ImageView, 'load');
    await selectAllItems(find(Picker));
  }],
  ['imageview-zoom.js', async () => {
    await waitFor(ImageView, 'load');
    await move(find(Slider), 2, 5, 500);
    await tap(find(CheckBox));
    await wait(500);
    await tap(find(CheckBox));
  }],
  ['inactivitytimer.js', async () => {
    await confirm(Button, {}, 2);
    await tap(find(Button, {text: 'Start'}));
    await wait(2200);
    await confirm(TextView, {text: 'inactive!'});
    await tap(find(Button, {text: 'Start'}));
    await wait(100);
    await tap(find(Button, {text: 'Cancel'}));
    await confirm(TextView, {text: 'cancelled'});
  }],
  ['layout.js', async () => {
    confirm(Composite);
  }],
  ['layout-baseline.js', async () => {
    await confirm(TextView);
    await confirm(TextInput);
  }],
  ['layout-center.js', async () => {
    confirm(Composite);
  }],
  ['layout-dynamic.js', async () => {
    confirm(Composite, {}, 2);
  }],
  ['layout-relative-position.js', async () => {
    confirm(Composite, {}, 4);
  }],
  ['layout-relative-size.js', async () => {
    confirm(Composite, {}, 2);
  }],
  ['layout-stack.js', async () => {
    confirm(tabris.Stack);
  }],
  ['layout-transform-translationz.js', async () => {
    await confirm(Composite);
    await tap(find(Composite), 2, 500, 500);
  }],
  ['layout-z-order.js', async () => {
    confirm(Composite, {}, 3);
  }],
  ['local-storage.js', async () => {
    await confirm(Button, {}, 5);
    await confirm(TextInput, {text: 'Key'});
    await confirm(TextInput, {text: 'Value'});
    await tap(find(Button, {text: 'Set'}));
    await confirm(TextView, {text: '"Key" set to "Value"'});
    await tap(find(Button, {text: 'Get'}));
    await confirm(TextView, {text: '"Key" is "Value"'});
    await tap(find(Button, {text: 'Remove'}));
    await confirm(TextView, {text: 'Removed "Key"'});
    await tap(find(Button, {text: 'Get'}));
    await confirm(TextView, {text: '"Key" is "null"'});
    await tap(find(Button, {text: 'List Keys'}));
  }],
  ['navigationbar.js', async () => {
    await confirm(Picker, {}, 3);
    await selectAllItems(find(Picker, {}, 0), 300, true);
    await selectAllItems(find(Picker, {}, 1), 300, true);
    await selectAllItems(find(Picker, {}, 2), 300, true);
  }],
  ['navigationview-action.js', async () => {
    confirm(Action);
  }],
  ['navigationview-action-placement.js', async () => {
    await confirm(Action, {}, 3);
    await confirm(Action, {placement: 'default'});
    await confirm(Action, {placement: 'navigation'});
    await confirm(Action, {placement: 'overflow'});
  }],
  ['navigationview-page.js', async () => {
    confirm(Page);
  }],
  ['navigationview-page-stacked.js', async () => {
    await confirm(Button, {}, 3);
    await confirm(Page, {title: 'Initial Page'});
    await forAsync(4, i => tap(find(Button, {text: 'Create another page'}, i)));
    await confirm(Page, {}, 5);
    await confirm(Page, {title: 'Page 4'});
    await tap(find(Button, {text: 'Go back'}, 4));
    await wait(100);
    await confirm(Page, {title: 'Page 3'});
    await tap(find(Button, {text: 'Go to initial page'}, 2));
    await wait(100);
    await confirm(Page, {}, 1);
    await confirm(Page, {title: 'Initial Page'});
  }],
  ['navigationview-properties.js', async () => {
    confirm(
      NavigationView,
      {toolbarVisible: true, drawerActionVisible: true}
    );
    await tap(find(CheckBox, {text: 'Show toolbar'}), 1, 300);
    await confirm(NavigationView, {toolbarVisible: false});
    await tap(find(CheckBox, {text: 'Show toolbar'}), 1, 300);
    await confirm(NavigationView, {toolbarVisible: true});
    await tap(find(CheckBox, {text: 'Show drawer action'}), 1, 300);
    await confirm(NavigationView, {drawerActionVisible: false});
    await tap(find(CheckBox, {text: 'Show drawer action'}), 1, 300);
    await confirm(NavigationView, {drawerActionVisible: true});
    await forAsync(device.platform === 'Android' ? 4 : 3, i => selectAllItems(find(Picker, {}, i), 300));
    await confirm(NavigationView,
      {toolbarColor: 'rgba(0, 0, 0, 0.25)', titleTextColor: 'rgba(0, 0, 0, 0.25)', actionColor: 'rgba(0, 0, 0, 0.25)'}
    );
  }],
  android && ['navigationview-searchaction.js', async () => {
    await confirm(SearchAction);
    await tap(find(Button), 1, 300);
    await input(find(SearchAction), 'bat');
    await wait(300);
    await select(find(SearchAction), 1);
    await wait(300);
    await confirm(TextView, {text: 'Selected "battleship"'});
  }],
  ['navigationview-tabfolder.js', async () => {
    await confirm(TabFolder);
    await select(find(TabFolder), 1);
    await select(find(TabFolder), 2);
    await wait(1000);
    await select(find(TabFolder), 0);
    await tap(find(TabFolder).children().first().find(Page).last().find(Button)[0]);
    await tap(find(TabFolder).children().first().find(Page).last().find(Button)[0]);
    await tap(find(TabFolder).children().first().find(Page).last().find(Button)[0]);
    await wait(1000);
    await tap(find(TabFolder).children().first().find(Page).last().find(Button)[1]);
    await tap(find(TabFolder).children().first().find(Page).last().find(Button)[1]);
    await tap(find(TabFolder).children().first().find(Page).last().find(Button)[1]);
  }],
  ['picker.js', async () => {
    await confirm(Picker);
    await wait(300);
    await select(find(Picker), 0);
    await wait(300);
    await select(find(Picker), 2);
    await wait(300);
    await select(find(Picker), 1);
  }],
  ['popover.js', async () => {
    await confirm(Button);
    await tap(find(Button));
    await wait(500);
    await confirm(Popover);
    await tap(find(Action));
    await wait(500);
    await confirm(Popover, {}, 0);
  }],
  ['printer.js', async () => {
    await confirm(Button, 2);
  }],
  ['progressbar.js', async () => {
    await confirm(ProgressBar);
    await wait(1000);
  }],
  ['radiobutton.js', async () => {
    await confirm(RadioButton, {}, 3);
    await tap(find(RadioButton, {}, 0));
    await wait(500);
    await tap(find(RadioButton, {}, 1));
    await wait(500);
    await tap(find(RadioButton, {}, 2));
    await wait(500);
  }],
  ['refreshcomposite.js', async () => {
    await confirm(RefreshComposite);
    await find(RefreshComposite).set({refreshIndicator: true});
    await find(RefreshComposite).trigger('refresh');
    await wait(1200);
    await confirm(RefreshComposite, {refreshIndicator: true}, 0); // TODO: Bug, refreshIndicator can be null
    await wait(500);
  }],
  android && ['scrollview.js', async () => {
    await confirm(ScrollView);
    await tap(find(Button));
    await wait(500);
    await confirm(ScrollView, {offsetX: 300});
    await find(ScrollView).scrollToX(0);
    await wait(500);
    await confirm(ScrollView, {offsetX: 0});
  }],
  ['slider.js', async () => {
    await confirm(Slider);
    await move(find(Slider), 10, 20);
  }],
  ['statusbar.js', async () => {
    await confirm(Picker, {}, 3);
    await selectAllItems(find(Picker, {}, 0), 500, true);
    await selectAllItems(find(Picker, {}, 1), 500, true);
    await selectAllItems(find(Picker, {}, 2), 500, true);
  }],
  ['switch.js', async () => {
    await confirm(Switch);
    await tap(find(Switch), 2, 300);
    await tap(find(Button), 2, 300);
  }],
  ['tabfolder.js', async () => {
    await confirm(TabFolder);
    await selectAllItems(find(TabFolder), 500);
    await confirm(TabFolder, {selection: find(TabFolder).children()[2]});
  }],
  ['tabfolder-swipe.js', async () => {
    await confirm(TabFolder);
    await selectAllItems(find(TabFolder), 500);
    await confirm(TabFolder, {selection: find(TabFolder).children()[2]});
  }],
  ['tabfolder-swipe-parallax.js', async () => {
    await confirm(TabFolder);
    await selectAllItems(find(TabFolder), 500);
    await confirm(TabFolder, {selection: find(TabFolder).children()[4]});
  }],
  ['textinput.js', async () => {
    await confirm(TextInput);
    await input(find(TextInput), 'Hello World');
    await wait(500);
    await input(find(TextInput), '');
    await wait(500);
    await input(find(TextInput), 'Hello Again', true);
  }],
  android && ['textinput-enterkeytype.js', async () => {
    await confirm(TextInput, {}, 11);
    await forEachAsync(findAll(TextInput), target => input(target, 'Hello \nWorld'), 500);
  }],
  ['textinput-focus.js', async () => {
    await confirm(TextInput, {}, 3);
    await forEachAsync(findAll(TextInput), target => input(target, 'Hello World'), 500);
  }],
  ['textinput-keyboard.js', async () => {
    await confirm(TextInput, {}, 8);
    await forEachAsync(findAll(TextInput), target => target.focused = true, 500);
  }],
  ['textinput-revealpassword.js', async () => {
    await confirm(TextInput);
    await input(find(TextInput), 'Hello World');
    await wait(500);
    await tap(find(CheckBox));
    await confirm(TextInput, {revealPassword: true});
    await wait(1000);
    await tap(find(CheckBox));
    await confirm(TextInput, {revealPassword: false});
  }],
  android && ['textinput-selection.js', async () => {
    await confirm(TextInput);
    await input(find(TextInput), '');
    await input(find(TextInput), '      -----');
    await tap(find(Button, {}, 0));
    await wait(1500);
    await tap(find(Button, {}, 1));
    await wait(1500);
  }],
  ['textview.js', async () => {
    confirm(TextView, {}, 3);
  }],
  ['textview-font-bundled.js', async () => {
    await confirm(TextView, {}, 96);
    await scroll(find(ScrollView));
  }],
  ['textview-font-external.js', async () => {
    confirm(TextView, {}, 2);
  }],
  ['textview-linespacing.js', async () => {
    await confirm(TextView, {}, 2);
    await move(find(Slider), 2, 32, 500);
  }],
  ['textview-markupenabled.js', async () => {
    await confirm(TextView, {markupEnabled: true});
    await tap(find(CheckBox));
    await wait(1000);
    await tap(find(CheckBox));
    await wait(2000);
  }],
  ['timedialog.js', async () => {
    await confirm(Button, {}, 2);
    await wait(500);
    await forEachAsync(
      findAll(tabris.Button),
      button => tap(button),
      1000,
      () => find(TimeDialog).close()
    );
    await wait(500);
  }],
  ['timer.js', async () => {
    await confirm(Button, {text: 'Press me!'});
    await tap(find(Button));
    await wait(2500);
    await confirm(Button, {text: 'Thank you!'});
  }],
  ['togglebutton.js', async () => {
    await confirm(ToggleButton);
    await forAsync(5, () => tap(find(ToggleButton)), 300);
  }],
  ['video.js', async () => {
    await confirm(Video);
    await wait(10000);
    await confirm(Video, {state: 'play'});
    await tap(find(Button));
    await confirm(Video, {state: 'pause'});
    await wait(500);
    await tap(find(Button));
    await wait(1000);
    await confirm(Video, {state: 'play'});
  }],
  ['web-storage.js', async () => {
    confirm(TextView, {text: /started\s[0-9]+\stime/});
  }],
  ['webview.js', async () => {
    await confirm(WebView, {url: /wikipedia/});
    await input(find(TextInput), 'http://goolge.com', true);
    await timeout(find(WebView).onLoad.promise());
    await confirm(WebView, {url: /google/});
    await wait(1000);
  }],
  ['webview-navigation.js', async () => {
    await confirm(WebView, {url: /wikipedia/});
    await confirm(ImageView, {enabled: false}, 2);
    await input(find(TextInput), 'http://goolge.com', true);
    await timeout(find(WebView).onLoad.promise());
    await wait(1000);
    await confirm(WebView, {url: /google/});
    await confirm(TextInput, {text: /google/});
    await confirm(ImageView, {image: {src: /back/}, enabled: true});
    await confirm(ImageView, {image: {src: /forward/}, enabled: false});
    await wait(1000);
    await tap(find(ImageView, {image: {src: /back/}}));
    await timeout(find(WebView).onLoad.promise());
    await confirm(WebView, {url: /wikipedia/});
    await confirm(TextInput, {text: /wikipedia/});
    await confirm(ImageView, {image: {src: /back/}, enabled: false});
    await confirm(ImageView, {image: {src: /forward/}, enabled: true});
    await tap(find(ImageView, {image: {src: /forward/}}));
    await timeout(find(WebView).onLoad.promise());
    await confirm(WebView, {url: /google/});
    await confirm(TextInput, {text: /google/});
    await confirm(ImageView, {image: {src: /back/}, enabled: true});
    await confirm(ImageView, {image: {src: /forward/}, enabled: false});
  }],
  ['webview-webmessaging.js', async () => {
    await confirm(WebView);
    await tap(find(Button));
    await wait(1000);
    await confirm(TextView, {text: /No message/});
    find(WebView).html = `
      <html><head><script>
        setTimeout(() => window.parent.postMessage("Hello from the WebView", "*"), 100);
      </script></head></html>`;
    await wait(1000);
    await confirm(TextView, {text: /Hello from the WebView/});
  }],
  ['widget-cornerradius.js', async () => {
    confirm(Composite, {
      cornerRadius: 24});
  }],
  ['widget-elevation.js', async () => {
    confirm(Composite, {elevation: 8});
  }],
  ['widget-exclude-from-layout.js', async () => {
    confirm(Composite, {foo: 'bar'});
  }],
  ['widget-highlightontouch.js', async () => {
    confirm(Composite, {highlightOnTouch: true});
  }],
  ['widget-lineargradient.js', async () => {
    await confirm(ScrollView);
    await timeout(findAll(WebView).pop().onLoad.promise(), 4000, true);
    await scroll(find(ScrollView));
  }],
  ['widget-longpress-to-drag.js', async () => {
    await confirm(Composite);
    await confirm(TextView);
    await find(Composite).onTouchStart.trigger({touches: [{absoluteX: 100, absoluteY: 100}]});
    await find(Composite).onLongPress.trigger({state: 'start'});
    await confirm(TextView, {}, 0);
    await wait(200);
    await forAsync(
      20,
      i => find(Composite).onTouchMove.trigger({touches: [{absoluteX: 100 + i * -3, absoluteY: 100 + i * -2}]}),
      16
    );
    await find(Composite).onTouchEnd.trigger();
    await confirm(Composite, {transform: {translationX: -57, translationY: -38}});
  }],
  android && ['widget-padding.js', async () => {
    confirm(TextView, {bounds: {left: 8, top: 8}, left: 0, top: 0});
  }],
  ['widget-styling.js', async () => {
    confirm(TextView, {}, 5);
  }],
  ['widget-touch.js', async () => {
    await confirm(TextView, {text: 'Touch anywhere...'});
    await contentView.onTouchStart.trigger({touches: [{x: 100, y: 100}]});
    await wait(200);
    await forAsync(
      20,
      i => contentView.onTouchMove.trigger({touches: [{x: 100 + i * -3, y: 100 + i * -2}]}),
      16
    );
    await contentView.onTouchEnd.trigger({touches: [{x: 0, y: 0}]});
    await confirm(TextView, {text: 'touchEnd: 0 X 0'});
    await contentView.onLongPress.trigger({touches: [{x: 0, y: 0}]});
    await confirm(TextView, {text: 'longPress: 0 X 0'});
  }],
  ['worker.js', async () => {
    confirm(TextView, {}, 5);
  }],
  ['xmlhttprequest.js', async () => {
    await confirm(Button);
    await tap(find(Button));
    try {
      await forAsync(100, () => confirm(TextView, {}, 0), 100);
    } catch (ex) {
      // polling ended before timeout
    }
    await confirm(TextView, {text: /home/});
  }]
].filter(v => v);

// #region test controls

const KEY_SNIPPET_INDEX = `__${module.id}__SNIPPET_INDEX`;
const KEY_AUTO_CONTINUE = `__${module.id}__AUTO_CONTINUE`;
const errors = [];
let options;

if (!showIntro()) {
  const current = snippets[getSnippetIndex()];
  if (!current) {
    showOptions('Tests completed', 'success');
  } else {
    const file = typeof current === 'string' ? current : current[0];
    const test = typeof current === 'string' ? () => Promise.resolve() : current[1];
    initErrorLog();
    wait(300).then(() => {
      console.log(`require('./${file}');`);
      require('./' + file);
      return test().catch(ex => console.error(ex.message + '\n' + ex.stack)).then(() => console.log('test finished'));
    }).then(errorCheck)
      .then(() => showOptions(file + ' - OK', 'next'))
      .catch(ex => {
        console.log(ex.stack);
        showOptions(file + ' - ' + ex, 'error');
      });
  }
}

function showIntro() {
  Object.defineProperty(global, 's', {get: stop});
  Object.defineProperty(global, 'n', {get: next});
  Object.defineProperty(global, 'p', {get: prev});
  if (localStorage.getItem(KEY_SNIPPET_INDEX)) {
    return false;
  }
  const snippetPicker = new Picker({
    top: 'prev()', left: 10, right: 10,
    selectionIndex: 0,
    itemText: index => typeof snippets[index] === 'string' ? snippets[index] : snippets[index][0],
    itemCount: snippets.length
  }).appendTo(contentView);
  const autoCheckBox = new CheckBox({
    top: 'prev()',
    text: 'auto continue',
    checked: localStorage.getItem(KEY_AUTO_CONTINUE) === 'true'
  }).appendTo(contentView);
  new Button({text: 'Start', top: 'prev()'}).on({
    select: () => {
      localStorage.setItem(KEY_AUTO_CONTINUE, autoCheckBox.checked);
      localStorage.setItem(KEY_SNIPPET_INDEX, snippetPicker.selectionIndex);
      app.reload();
    }
  }).appendTo(contentView);
  return true;
}

function initErrorLog() {
  const orgError = console.error;
  console.error = (...args) => {
    errors.push(args.concat('stack trace:', new Error('').stack));
    orgError.apply(console, args);
  };
  const orgTrigger = NativeObject.prototype._trigger;
  NativeObject.prototype._trigger = function() {
    try {
      orgTrigger.apply(this, arguments);
    } catch (ex) {
      console.log('trigger error');
      console.error(ex);
    }
  };
}

function errorCheck() {
  if (errors.length) {
    throw new Error(errors.map(
      args => Array.prototype.map.call(args, msg => msg.stack ? msg.message + '\n' + msg.stack : msg).join('\n')
    ).join('\n'));
  }
}

function showOptions(msg, state) {
  console.log('result: ' + msg);
  const autoContinue = localStorage.getItem(KEY_AUTO_CONTINUE) === 'true';
  const useTimer = state === 'next' && autoContinue;
  const background = state === 'error' ? 'rgba(255, 30, 30, 0.8)' :
    state === 'success' ? 'rgba(30, 255, 30, 0.8)' :
      'rgba(30, 30, 30, 0.6)';
  options = new Composite({
    padding: 12,
    left: 0, bottom: 0, right: 0,
    elevation: 100,
    background
  });
  // Option 1
  if (useTimer) {
    options.append(
      new TextView({
        left: 'prev() 20', bottom: 0,
        font: '32px',
        text: 'Pause  /',
        textColor: 'white',
        highlightOnTouch: true
      }).on({tap: () => {
        options.dispose();
        showOptions('Paused', 'pause');
      }})
    );
  } else if (state !== 'success') {
    options.append(
      new TextView({
        left: 'prev() 20', bottom: 0,
        font: '32px',
        text: 'Hide  /',
        textColor: 'white',
        highlightOnTouch: true
      }).on({tap: () => options.dispose()})
    );
  }
  // Option 2
  options.append(
    new TextView({
      left: 'prev() 20', bottom: 0,
      font: '32px',
      text: state === 'success' ? 'OK' : 'Stop',
      textColor: 'white',
      highlightOnTouch: true
    }).on({tap: stop})
  );
  // Option 3
  if ((state === 'next' && !autoContinue) || state === 'pause') {
    options.append(
      new TextView({
        left: 'prev() 20', bottom: 0,
        font: '32px',
        text: state === 'pause' ? '/  Continue' : '/  Next',
        textColor: 'white',
        highlightOnTouch: true
      }).on({tap: next, longPress: prev})
    );
  } else if (state !== 'success' && !autoContinue) {
    options.append(
      new TextView({
        left: 'prev() 20', bottom: 0,
        font: '32px',
        text: '/  Retry',
        textColor: 'white',
        highlightOnTouch: true
      }).on({tap: () => app.reload()})
    );
  }
  options.append(
    new TextView({
      left: 0, bottom: 'prev() 10', right: 0,
      font: state === 'error' ? '10px' : '24px',
      textColor: 'white',
      text: msg,
      highlightOnTouch: true
    }).on({tap: () => app.reload()})
  );
  options.set({opacity: 0}).animate({opacity: 1}, {duration: 200});
  contentView.append(options);
  if (useTimer) {
    wait(2000).then(() => {
      if (!options.isDisposed()) {
        next();
      }
    });
  }
}

function stop() {
  // Android crashes if disposing widget in gesture event:
  wait(0).then(() => {
    if (options) { options.dispose(); }
    localStorage.removeItem(KEY_SNIPPET_INDEX);
    app.reload();
  });
}

function next() {
  wait(0).then(() => {
    if (options) { options.dispose(); }
    localStorage.setItem(KEY_SNIPPET_INDEX, (getSnippetIndex() + 1));
    app.reload();
  });
}

function prev() {
  wait(0).then(() => {
    if (options) { options.dispose(); }
    if (getSnippetIndex() === 0) {
      return;
    }
    localStorage.setItem(KEY_SNIPPET_INDEX, Math.max(0, (getSnippetIndex() - 1)));
    app.reload();
  });
}

function getSnippetIndex() {
  return parseInt(localStorage.getItem(KEY_SNIPPET_INDEX), 10);
}

// #endregion

// #region test helpers

function confirm(type, props = {}, count = 1) {
  return wait(300).then(() => {
    const results = findAll(type, props).map(element => element.contentView || element);
    if (results.length !== count) {
      console.log(props, results);
      throw new Error(`Expected ${count} matching ${type.name}, found ${results.length}`);
    }
    for (let i = 0; i < results.length; i++) {
      if (results[i] instanceof Action || results[i] instanceof SearchAction) {
        continue; // TODO: Checking bounds of action causes exception
      }
      if (!results[i].bounds.width || !results[i].bounds.height) {
        console.log(props, results);
        throw new Error(`No size: ${type.name} ${i}`);
      }
      if (!results[i].visible) {
        console.log(props, results);
        throw new Error(`Not visible: ${type.name} ${i}`);
      }
    }
  });
}

function tap(target, times = 1, pause = 0, length = 0, afterEach = () => null)  {
  return forAsync(
    times,
    () => target.trigger('touchStart', {target}),
    length,
    i => {
      target.trigger('touchEnd', {target});
      target.trigger('tap', {target});
      if (target instanceof Button || target instanceof Action) {
        target.trigger('select', {target});
      } else if (target instanceof CheckBox || target instanceof Switch || target instanceof ToggleButton) {
        target.checked = !target.checked;
        target.trigger('select', {target, checked: target.checked});
      } else if (target instanceof RadioButton) {
        target.siblings().set({checked: false});
        target.checked = true;
        target.trigger('select', {target, checked: true});
      }
      afterEach(i);
      return wait(pause);
    }
  );
}

function selectAllItems(target, pause = 500, wrap = false) {
  let promise = forAsync(target.itemCount || target.children().length, i => select(target, i), pause);
  if (wrap) {
    promise = promise.then(() => select(target, 0)).then(() => wait(pause));
  }
  return promise;
}

function move(slider, step = 1, pause = 500, endPause = 1000) {
  const steps = Math.ceil((slider.maximum - slider.minimum) / step);
  slider.selection = slider.minimum;
  // Bug: slider can be set out of bounds
  return wait(endPause)
    .then(() => forAsync(
      steps,
      () => select(slider, Math.min(slider.maximum, slider.selection + step)),
      pause
    ))
    .then(() => wait(endPause))
    .then(() => forAsync(
      steps,
      () => select(slider, Math.max(slider.minimum, slider.selection - step)),
      pause
    ))
    .then(() => wait(endPause));
}

function select(target, value) {
  if (target instanceof Picker) {
    target.selectionIndex = value;
    target.trigger('select', {target, index: value});
  } else if (target instanceof CollectionView) {
    target.cellByItemIndex(value).trigger('tap');
  } else if (target instanceof Slider) {
    target.selection = value;
    target.trigger('select', {target, selection: value});
  } else if (target instanceof SearchAction) {
    target.trigger('accept', {target, text: target.proposals[value]});
  } else if (target instanceof TabFolder) {
    target.selection = target.children()[value];
    console.log('select', target.cid, target.selection.cid);
    target.trigger('select', {target, selection: target.selection});
  }
}

function input(target, text, accept) {
  target.focused = true;
  return wait(300).then(() => {
    target.text = text;
    target.trigger('input', {target, text});
  }).then(() => {
    if (accept) {
      target.trigger('accept', {target, text});
    }
  });
}

function scroll(target) {
  if (target instanceof CollectionView) {
    return wait(500)
      .then(() => target.reveal(target.itemCount - 1))
      .then(() => target.trigger('scroll', {target, deltaY: 0}))
      .then(() => wait(1000))
      .then(() => target.reveal(0))
      .then(() => target.trigger('scroll', {target, deltaY: 0}))
      .then(() => wait(500));
  } else if (target instanceof ScrollView) {
    const outerHeight = target.bounds.height;
    let innerHeight = 0;
    target.children().forEach(child => innerHeight = Math.max(innerHeight, child.bounds.top + child.bounds.height));
    const steps = Math.ceil(innerHeight / outerHeight);
    return forAsync(steps, i => target.scrollToY(i * outerHeight), 1000);
  }
}

function forAsync(times, cb, pause = 500, afterEach = () => null) {
  let promiseChain = wait(0);
  for (let i = 0; i < times; i++) {
    promiseChain = promiseChain
      .then(() => cb(i))
      .then(() => wait(pause))
      .then(() => afterEach(i));
  }
  return promiseChain;
}

function forEachAsync(items, cb, pause = 1000, afterEach = () => null) {
  let promiseChain = wait(0);
  for (const item of items) {
    promiseChain = promiseChain
      .then(() => cb(item))
      .then(() => wait(pause))
      .then(() => afterEach(item));
  }
  return promiseChain;
}

function has(obj1, obj2) {
  for (const key in obj2) {
    if (obj2[key] instanceof RegExp) {
      if (!obj2[key].test(obj1[key])) {
        console.log(key + ' is ' + JSON.stringify(obj1[key]) + ', not matching ' + obj2[key]);
        return false;
      }
    } else if (obj2[key] && obj2[key].constructor === Object) {
      return has(obj1[key], obj2[key]);
    } else if (typeof obj1[key] === 'number' && typeof obj2[key] === 'number') {
      console.log(key + ' is ' + obj1[key] + ', not close to ' + obj2[key]);
      return Math.round(obj1[key]) === Math.round(obj2[key]);
    } else if (obj1[key] instanceof Color) {
      if (!obj1[key].toString() === obj2[key]) {
        console.log(key + ' is ' + obj1[key] + ', not matching ' + obj2[key]);
        return false;
      }
    } else if (obj1[key] !== obj2[key]) {
      console.log(key + ' is ' + obj1[key] + ', not ' + obj2[key]);
      return false;
    }
  }
  return true;
}

function waitFor(type, eventType, count = 1, ms = 1000) {
  const targets = findAll(type);
  if (targets.length !== count) {
    throw new Error(`Expected ${count} ${type.name}, found ${targets.length}`);
  }
  return new Promise((resolve, reject) => {
    Promise.all(targets.map(target => new Promise(handle => target.once(eventType, handle))))
      .then(resolve);
    setTimeout(() => reject(new Error('Timeout')), ms);
  });
}

function find(type, props = {}, pos = 0) {
  const all = findAll(type, props);
  if (!all[pos]) {
    throw new Error(`No matching ${type.name}`);
  }
  return all[pos];
}

function findAll(type, props = {}) {
  const results = [];
  for (const cid in tabris._nativeObjectRegistry.$objects) {
    const candidate = tabris._nativeObjectRegistry.$objects[cid];
    if (candidate.constructor === type) {
      if (candidate instanceof tabris.Widget && !candidate.parent(tabris.ContentView)) {
        continue;
      }
      results.push(candidate);
    }
  }
  return results.filter(obj => has(obj, props));
}

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function timeout(promise, time = 6000, allowContinue) {
  return Promise.race([
    promise,
    wait(time).then(() => allowContinue ? Promise.resolve() : Promise.reject('timeout'))
  ]);
}

// #endregion
