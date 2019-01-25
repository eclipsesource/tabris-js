import {
  NativeObject, contentView, TextView, app, Button, Picker, Composite, CheckBox, Page, NavigationView, Action, device,
  SearchAction, TabFolder, Popover, ProgressBar, RadioButton, RefreshComposite, ScrollView, Slider, Switch,
  ToggleButton, TextInput, CollectionView, TimeDialog, Video, WebView, ImageView, ActivityIndicator, AlertDialog,
  ActionSheet, Canvas, DateDialog, drawer
} from 'tabris';

// Use these to exclude tests where they are broken due to a platform bug
const ios = device.platform === 'iOS';
const android = device.platform === 'Android';

const snippets = [
  android && ['actionsheet.js', () => confirm(Button)
    .then(() => tap(find(Button)))
    .then(() => wait(1000))
    .then(() => find(ActionSheet).close())
  ],
  ['activityindicator.js', () => confirm(ActivityIndicator)
    .then(() => wait(3000))
    .then(() => tap(find(Button)))
    .then(() => wait(2500))
  ],
  ['alertdialog.js', () => confirm(Button, {}, 4)
    .then(() => wait(500))
    .then(() => forEachAsync(
      findAll(tabris.Button),
      button => tap(button),
      1000,
      () => find(AlertDialog).close()
    ))
    .then(() => wait(500))
  ],
  // 'app-launch.js',
  // 'app.js',
  ['button.js', () => confirm(Button)
    .then(() => tap(find(Button), 10))
  ],
  android && ['canvas.js', () => confirm(Canvas)
    .then(() => find(Canvas).getContext('2d').getImageData(0, 0, 100, 100).data)
    .then(data => data.some(i => i !== 0) ? Promise.resolve() : Promise.reject())
  ],
  ['checkbox.js', () => confirm(CheckBox)
    .then(() => tap(find(CheckBox), 10, 10))
  ],
  ['collectionview.js', () => confirm(CollectionView)
    .then(() => scroll(find(CollectionView)))
  ],
  ['collectionview-cellheightauto.js', () => confirm(CollectionView)
    .then(() => scroll(find(CollectionView)))
  ],
  ['collectionview-celltype.js', () => confirm(CollectionView)
    .then(() => scroll(find(CollectionView)))
  ],
  ['collectionview-columncount.js', () => confirm(CollectionView)
    .then(() => move(find(Slider), 1, 10, 300))
  ],
  ['collectionview-refreshenabled.js', () => confirm(CollectionView)
    .then(() => wait(1200))
    .then(() => find(CollectionView).trigger('refresh'))
    .then(() => wait(1200))
    .then(() => find(CollectionView).trigger('refresh'))
    .then(() => wait(1200))
    .then(() => scroll(find(CollectionView)))
  ],
  ['collectionview-scroll.js', () => confirm(CollectionView)
    .then(() => scroll(find(CollectionView)))
  ],
  ['composite.js', () => confirm(Composite, {}, 2)],
  // 'console.js',
  ['crypto.js', () => confirm(TextView, {text: /\s[0-9][0-9]/})],
  android && ['datedialog.js', () => confirm(Button)
    .then(() => tap(find(Button)))
    .then(() => wait(1000))
    .then(() => find(DateDialog).close())
  ],
  ['device.js', () => confirm(TextView, {text: /.+:\s.+/}, 10)
    .then(() => wait(1000))
  ],
  ['drawer.js', () => wait(500)
    .then(() => drawer.open())
    .then(() => wait(1000))
    .then(() => drawer.close())
    .then(() => wait(500))
  ],
  ['drawer-pages.js', () => confirm(Button)
    .then(() => tap(find(Button)))
    .then(() => drawer.open())
    .then(() => wait(1000))
    .then(() => select(find(CollectionView), 2))
    .then(() => confirm(Page, {title: 'Another Page'}))
  ],
  // TODO: snippet is broken due to freegeoip.net API change
  // ['fetch.js', () => confirm(Button)
  //   .then(() => pressButton())
  //   .then(() => wait(3000))
  //   .then(() => confirm(TextView))
  // ],
  // TODO: untestable, lorempixel is too slow
  // ['fs.js', () => waitFor(ImageView, 'load', 1, 100000)],
  ['imageview.js', () => waitFor(ImageView, 'load', 3)],
  ['imageview-as-a-button.js', () => confirm(ImageView)
    .then(() => tap(find(ImageView), 10, 10))
  ],
  ['imageview-base64.js', () => waitFor(ImageView, 'load')],
  ['imageview-load.js', () => waitFor(ImageView, 'load', 2)],
  ['imageview-scalemode-auto.js', () => waitFor(ImageView, 'load')
    .then(() => move(find(Slider), 20, 20, 500))
  ],
  ['imageview-scalemode.js', () => waitFor(ImageView, 'load')
    .then(() => selectAllItems(find(Picker, {}, 1)))
    .then(() => select(find(Picker, {}, 0), 1))
    .then(() => waitFor(ImageView, 'load'))
    .then(() => selectAllItems(find(Picker, {}, 1)))
  ],
  ['imageview-tintcolor.js', () => waitFor(ImageView, 'load')
    .then(() => selectAllItems(find(Picker)))
  ],
  ['imageview-zoom.js', () => waitFor(ImageView, 'load')
    .then(() => move(find(Slider), 2, 5, 500))
    .then(() => tap(find(CheckBox)))
    .then(() => wait(500))
    .then(() => tap(find(CheckBox)))
  ],
  ['inactivitytimer.js', () => confirm(Button, {}, 2)
    .then(() => tap(find(Button, {text: 'Start'})))
    .then(() => wait(2200))
    .then(() => confirm(TextView, {text: 'inactive!'}))
    .then(() => tap(find(Button, {text: 'Start'})))
    .then(() => wait(100))
    .then(() => tap(find(Button, {text: 'Cancel'})))
    .then(() => confirm(TextView, {text: 'cancelled'}))
  ],
  ['layout.js', () => confirm(Composite)],
  ['layout-baseline.js', () => confirm(TextView)
    .then(() => confirm(TextInput))
  ],
  ['layout-center.js', () => confirm(Composite)],
  ['layout-dynamic.js', () => confirm(Composite, {}, 2)], // TODO: can be tested once orientation lock is supported
  ['layout-nested.js', () => confirm(Composite, {}, 6)
    .then(() => confirm(TextView, {}, 6))
    .then(() => confirm(ImageView, {}, 3))
  ],
  ['layout-relative-position.js', () => confirm(Composite, {}, 4)],
  ['layout-relative-size.js', () => confirm(Composite, {}, 2)],
  ['layout-transform-translationz.js', () => confirm(Composite)
    .then(() => tap(find(Composite), 2, 500, 500))
  ],
  ['layout-z-order.js', () => confirm(Composite, {}, 3)],
  ['local-storage.js', () => confirm(Button, {}, 5)
    .then(() => confirm(TextInput, {text: 'Key'}))
    .then(() => confirm(TextInput, {text: 'Value'}))
    .then(() => tap(find(Button, {text: 'Set'})))
    .then(() => confirm(TextView, {text: '"Key" set to "Value"'}))
    .then(() => tap(find(Button, {text: 'Get'})))
    .then(() => confirm(TextView, {text: '"Key" is "Value"'}))
    .then(() => tap(find(Button, {text: 'Remove'})))
    .then(() => confirm(TextView, {text: 'Removed "Key"'}))
    .then(() => tap(find(Button, {text: 'Get'})))
    .then(() => confirm(TextView, {text: '"Key" is "null"'}))
    .then(() => tap(find(Button, {text: 'List Keys'})))
  ],
  ['navigationbar.js', () => confirm(Picker, {}, 3)
    .then(() => selectAllItems(find(Picker, {}, 0), 300, true))
    .then(() => selectAllItems(find(Picker, {}, 1), 300, true))
    .then(() => selectAllItems(find(Picker, {}, 2), 300, true))
  ],
  ['navigationview-action.js', () => confirm(Action)],
  ['navigationview-action-placementpriority.js', () => confirm(Action, {}, 3)
    .then(() => confirm(Action, {placementPriority: 'high'}))
    .then(() => confirm(Action, {placementPriority: 'normal'}))
    .then(() => confirm(Action, {placementPriority: 'low'}))
  ],
  ['navigationview-page.js', () => confirm(Page)],
  ['navigationview-page-stacked.js', () => confirm(Button, {}, 3)
    .then(() => confirm(Page, {title: 'Initial Page'}))
    .then(() => forAsync(4, i => tap(find(Button, {text: 'Create another page'}, i))))
    .then(() => confirm(Page, {}, 5))
    .then(() => confirm(Page, {title: 'Page 4'}))
    .then(() => tap(find(Button, {text: 'Go back'}, 4)))
    .then(() => wait(100))
    .then(() => confirm(Page, {title: 'Page 3'}))
    .then(() => tap(find(Button, {text: 'Go to initial page'}, 2)))
    .then(() => wait(100))
    .then(() => confirm(Page, {}, 1))
    .then(() => confirm(Page, {title: 'Initial Page'}))
  ],
  ['navigationview-properties.js', () => confirm(
    NavigationView,
    {toolbarVisible: true, drawerActionVisible: true, navigationAction: null}
  )
    .then(() => tap(find(CheckBox, {text: 'Show toolbar'}), 1, 300))
    .then(() => confirm(NavigationView, {toolbarVisible: false}))
    .then(() => tap(find(CheckBox, {text: 'Show toolbar'}), 1, 300))
    .then(() => confirm(NavigationView, {toolbarVisible: true}))
    .then(() => tap(find(CheckBox, {text: 'Show drawer action'}), 1, 300))
    .then(() => confirm(NavigationView, {drawerActionVisible: false}))
    .then(() => tap(find(CheckBox, {text: 'Show drawer action'}), 1, 300))
    .then(() => confirm(NavigationView, {drawerActionVisible: true}))
    .then(() => tap(find(CheckBox, {text: 'Custom navigation action'}), 1, 300))
    .then(() => confirm(NavigationView, {navigationAction: findAll(Action, {title: 'Close'}).pop()}))
    .then(() => tap(find(CheckBox, {text: 'Custom navigation action'}), 1, 300))
    .then(() => confirm(NavigationView, {navigationAction: null}))
    .then(() => forAsync(device.platform === 'Android' ? 4 : 3, i => selectAllItems(find(Picker, {}, i), 300)))
    .then(() => confirm(NavigationView,
      {toolbarColor: 'rgba(0, 0, 0, 0.25)', titleTextColor: 'rgba(0, 0, 0, 0.25)', actionColor: 'rgba(0, 0, 0, 0.25)'}
    ))
  ],
  android && ['navigationview-searchaction.js', () => confirm(SearchAction)
    .then(() => tap(find(Button), 1, 300))
    .then(() => input(find(SearchAction), 'bat')).then(() => wait(300))
    .then(() => select(find(SearchAction), 1)).then(() => wait(300))
    .then(() => confirm(TextView, {text: 'Selected "battleship"'}))
  ],
  ['navigationview-tabfolder.js', () => confirm(TabFolder)
    .then(() => select(find(TabFolder), 1))
    .then(() => select(find(TabFolder), 2))
    .then(() => wait(1000))
    .then(() => select(find(TabFolder), 0))
    .then(() => tap(find(TabFolder).children().first().find(Page).last().find(Button)[0]))
    .then(() => tap(find(TabFolder).children().first().find(Page).last().find(Button)[0]))
    .then(() => tap(find(TabFolder).children().first().find(Page).last().find(Button)[0]))
    .then(() => wait(1000))
    .then(() => tap(find(TabFolder).children().first().find(Page).last().find(Button)[1]))
    .then(() => tap(find(TabFolder).children().first().find(Page).last().find(Button)[1]))
    .then(() => tap(find(TabFolder).children().first().find(Page).last().find(Button)[1]))
  ],
  ['picker.js', () => confirm(Picker)
    .then(() => wait(300))
    .then(() => select(find(Picker), 0))
    .then(() => wait(300))
    .then(() => select(find(Picker), 2))
    .then(() => wait(300))
    .then(() => select(find(Picker), 1))
  ],
  ['popover.js', () => confirm(Button)
    .then(() => tap(find(Button)))
    .then(() => wait(500))
    .then(() => confirm(Popover))
    .then(() => tap(find(Action)))
    .then(() => wait(500))
    .then(() => confirm(Popover, {}, 0))
  ],
  // 'printer.js',
  ['progressbar.js', () => confirm(ProgressBar)
    .then(() => wait(1000))
  ],
  ['radiobutton.js', () => confirm(RadioButton, {}, 3)
    .then(() => tap(find(RadioButton, {}, 0)))
    .then(() => wait(500))
    .then(() => tap(find(RadioButton, {}, 1)))
    .then(() => wait(500))
    .then(() => tap(find(RadioButton, {}, 2)))
    .then(() => wait(500))
  ],
  ['refreshcomposite.js', () => confirm(RefreshComposite)
    .then(() => tap(find(CheckBox)))
    .then(() => find(RefreshComposite).set({refreshIndicator: true}))
    .then(() => find(RefreshComposite).trigger('refresh'))
    .then(() => wait(1200))
    .then(() => confirm(RefreshComposite, {refreshIndicator: true}, 0)) // TODO: Bug, refreshIndicator can be null
    .then(() => wait(500))
  ],
  android && ['scrollview.js', () => confirm(ScrollView)
    .then(() => tap(find(Button)))
    .then(() => wait(500))
    .then(() => confirm(ScrollView, {offsetX: 310}))
    .then(() => find(ScrollView).scrollToX(0))
    .then(() => wait(500))
    .then(() => confirm(ScrollView, {offsetX: 0}))
  ],
  ['slider.js', () => confirm(Slider)
    .then(() => move(find(Slider), 10, 20))
  ],
  ['statusbar.js', () => confirm(Picker, {}, 3)
    .then(() => selectAllItems(find(Picker, {}, 0), 500, true))
    .then(() => selectAllItems(find(Picker, {}, 1), 500, true))
    .then(() => selectAllItems(find(Picker, {}, 2), 500, true))
  ],
  ['switch.js', () => confirm(Switch)
    .then(() => tap(find(Switch), 2, 300))
    .then(() => tap(find(Button), 2, 300))
  ],
  ['tabfolder.js', () => confirm(TabFolder)
    .then(() => selectAllItems(find(TabFolder), 500))
    .then(() => confirm(TabFolder, {selection: find(TabFolder).children()[2]}))
  ],
  ['tabfolder-swipe.js', () => confirm(TabFolder)
    .then(() => selectAllItems(find(TabFolder), 500))
    .then(() => confirm(TabFolder, {selection: find(TabFolder).children()[2]}))
  ],
  ['tabfolder-swipe-parallax.js', () => confirm(TabFolder)
    .then(() => selectAllItems(find(TabFolder), 500))
    .then(() => confirm(TabFolder, {selection: find(TabFolder).children()[4]}))
  ],
  ['textinput.js', () => confirm(TextInput)
    .then(() => input(find(TextInput), 'Hello World'))
    .then(() => wait(500))
    .then(() => input(find(TextInput), ''))
    .then(() => wait(500))
    .then(() => input(find(TextInput), 'Hello Again', true))
  ],
  android && ['textinput-enterkeytype.js', () => confirm(TextInput, {}, 11)
    .then(() => forEachAsync(findAll(TextInput), target => input(target, 'Hello \nWorld'), 500))
  ],
  ['textinput-focus.js', () => confirm(TextInput, {}, 2)
    .then(() => forEachAsync(findAll(TextInput), target => input(target, 'Hello World'), 500))
  ],
  ['textinput-keyboard.js', () => confirm(TextInput, {}, 8)
    .then(() => forEachAsync(findAll(TextInput), target => target.focused = true, 500))
  ],
  ['textinput-revealpassword.js', () => confirm(TextInput)
    .then(() => input(find(TextInput), 'Hello World'))
    .then(() => wait(500))
    .then(() => tap(find(CheckBox)))
    .then(() => confirm(TextInput, {revealPassword: true}))
    .then(() => wait(1000))
    .then(() => tap(find(CheckBox)))
    .then(() => confirm(TextInput, {revealPassword: false}))
  ],
  android && ['textinput-selection.js', () => confirm(TextInput)
    .then(() => input(find(TextInput), ''))
    .then(() => input(find(TextInput), '      -----'))
    .then(() => tap(find(Button, {}, 0)))
    .then(() => wait(1500))
    .then(() => tap(find(Button, {}, 1)))
    .then(() => wait(1500))
  ],
  ['textview.js', () => confirm(TextView, {}, 3)],
  ['textview-font-bundled.js', () => confirm(TextView, {}, 96)
    .then(() => scroll(find(ScrollView)))
  ],
  ['textview-font-external.js', () => confirm(TextView, {}, 2)],
  ['textview-linespacing.js', () => confirm(TextView, {}, 2)
    .then(() => move(find(Slider), 2, 32, 500))
  ],
  ['textview-markupenabled.js', () => confirm(TextView, {markupEnabled: true})
    .then(() => tap(find(CheckBox)))
    .then(() => wait(1000))
    .then(() => tap(find(CheckBox)))
    .then(() => wait(2000))
  ],
  android && ['timedialog.js', () => confirm(Button)
    .then(() => tap(find(Button)))
    .then(() => wait(2000))
    .then(() => find(TimeDialog).trigger('select', {date: find(TimeDialog).date}))
    .then(() => find(TimeDialog).close())
    .then(() => confirm(TimeDialog, {}, 0))
    .then(() => wait(1000))
  ],
  ['timer.js', () => confirm(Button, {text: 'Press me!'})
    .then(() => tap(find(Button)))
    .then(() => wait(2500))
    .then(() => confirm(Button, {text: 'Thank you!'}))
  ],
  ['togglebutton.js', () => confirm(ToggleButton)
    .then(() => forAsync(5, () => tap(find(ToggleButton)), 300))
  ],
  ['video.js', () => confirm(Video)
    .then(() => wait(10000))
    .then(() => confirm(Video, {state: 'play'}))
    .then(() => tap(find(Button)))
    .then(() => confirm(Video, {state: 'pause'}))
    .then(() => wait(500))
    .then(() => tap(find(Button)))
    .then(() => wait(1000))
    .then(() => confirm(Video, {state: 'play'}))
  ],
  ['web-storage.js', () => confirm(TextView, {text: /started\s[0-9]+\stime/})],
  ['webview.js', () => confirm(WebView, {url: /wikipedia/})
    .then(() => input(find(TextInput), 'http://goolge.com', true))
    .then(() => timeout(find(WebView).onLoad.promise()))
    .then(() => confirm(WebView, {url: /google/}))
    .then(() => wait(1000))
  ],
  ['webview-navigation.js', () => confirm(WebView, {url: /wikipedia/})
    .then(() => confirm(ImageView, {enabled: false}, 2))
    .then(() => input(find(TextInput), 'http://goolge.com', true))
    .then(() => timeout(find(WebView).onLoad.promise()))
    .then(() => wait(1000))
    .then(() => confirm(WebView, {url: /google/}))
    .then(() => confirm(TextInput, {text: /google/}))
    .then(() => confirm(ImageView, {image: /back/, enabled: true}))
    .then(() => confirm(ImageView, {image: /forward/, enabled: false}))
    .then(() => wait(1000))
    .then(() => tap(find(ImageView, {image: /back/})))
    .then(() => timeout(find(WebView).onLoad.promise()))
    .then(() => confirm(WebView, {url: /wikipedia/}))
    .then(() => confirm(TextInput, {text: /wikipedia/}))
    .then(() => confirm(ImageView, {image: /back/, enabled: false}))
    .then(() => confirm(ImageView, {image: /forward/, enabled: true}))
    .then(() => tap(find(ImageView, {image: /forward/})))
    .then(() => timeout(find(WebView).onLoad.promise()))
    .then(() => confirm(WebView, {url: /google/}))
    .then(() => confirm(TextInput, {text: /google/}))
    .then(() => confirm(ImageView, {image: /back/, enabled: true}))
    .then(() => confirm(ImageView, {image: /forward/, enabled: false}))
  ],
  ['webview-webmessaging.js', () => confirm(WebView)
    .then(() => tap(find(Button)))
    .then(() => wait(1000))
    .then(() => confirm(TextView, {text: /No message/}))
    .then(() => find(WebView).html = `
      <html><head><script>
        setTimeout(() => window.parent.postMessage("Hello from the WebView", "*"), 100);
      </script></head></html>`
    )
    .then(() => wait(1000))
    .then(() => confirm(TextView, {text: /Hello from the WebView/}))
  ],
  ['widget-cornerradius.js', () => confirm(Composite, {cornerRadius: 24})],
  ['widget-elevation.js', () => confirm(Composite, {elevation: 8})],
  ios && ['widget-highlightontouch.js', () => confirm(Composite, {highlightOnTouch: true})],
  ['widget-lineargradient.js', () => confirm(ScrollView)
    .then(() => timeout(findAll(WebView).pop().onLoad.promise(), 4000, true))
    .then(() => scroll(find(ScrollView)))
  ],
  ['widget-longpress-to-drag.js', () => confirm(Composite)
    .then(() => confirm(TextView))
    .then(() => find(Composite).onTouchStart.trigger({touches: [{absoluteX: 100, absoluteY: 100}]}))
    .then(() => find(Composite).onLongPress.trigger({state: 'start'}))
    .then(() => confirm(TextView, {}, 0))
    .then(() => wait(200))
    .then(() => forAsync(
      20,
      i => find(Composite).onTouchMove.trigger({touches: [{absoluteX: 100 + i * -3, absoluteY: 100 + i * -2}]}),
      16
    ))
    .then(() => find(Composite).onTouchEnd.trigger())
    .then(() => confirm(Composite, {transform: {translationX: -57, translationY: -38}}))
  ],
  android && ['widget-padding.js', () => confirm(TextView, {bounds: {left: 8, top: 8}, left: 0, top: 0})],
  ['widget-styling.js', () => confirm(TextView, {}, 5)],
  ['widget-touch.js', () => confirm(TextView, {text: 'Touch anywhere...'})
    .then(() => contentView.onTouchStart.trigger({touches: [{x: 100, y: 100}]}))
    .then(() => wait(200))
    .then(() => forAsync(
      20,
      i => contentView.onTouchMove.trigger({touches: [{x: 100 + i * -3, y: 100 + i * -2}]}),
      16
    ))
    .then(() => contentView.onTouchEnd.trigger({touches: [{x: 0, y: 0}]}))
    .then(() => confirm(TextView, {text: 'touchEnd: 0 X 0'}))
    .then(() => contentView.onLongPress.trigger({touches: [{x: 0, y: 0}]}))
    .then(() => confirm(TextView, {text: 'longPress: 0 X 0'}))
  ],
  ['xmlhttprequest.js', () => confirm(Button)
    .then(() => tap(find(Button)))
    .then(() => forAsync(100, () => confirm(TextView, {}, 0), 100))
    .catch(() => Promise.resolve())
    .then(() => confirm(TextView, {text: /home/}))
  ]
].filter(v => v);

//#region test controls

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
      console.log(`require('./${file});`);
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
      // tslint:disable-next-line:no-invalid-this
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

//#endregion

//#region test helpers

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
    target.trigger('select', {target, index: value});
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
      if (!obj2[key].test(JSON.stringify(obj1[key]))) {
        console.log(key + ' is ' + obj1[key] + ', not matching ' + obj2[key]);
        return false;
      }
    } else if (obj2[key] && obj2[key].constructor === Object) {
      return has(obj1[key], obj2[key]);
    } else if (typeof obj1[key] === 'number' && typeof obj2[key] === 'number') {
      console.log(key + ' is ' + obj1[key] + ', not close to ' + obj2[key]);
      return Math.round(obj1[key]) === Math.round(obj2[key]);
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
    if (tabris._nativeObjectRegistry.$objects[cid].constructor === type) {
      results.push(tabris._nativeObjectRegistry.$objects[cid]);
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

//#endregion
