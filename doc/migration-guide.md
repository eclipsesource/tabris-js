# 1.x -> 2.x

## Widgets
* `tabris.create()` has been removed. Widget constructors are now available under the `tabris` namespace. [Create widgets](https://tabrisjs.com/documentation/2.0/widget-basics#creating-native-widgets) using `new` instead, e.g. use:

    ```js
    new tabris.Button({centerX: 0, centerY: 0})
    ```

    ... instead of ...

    ```js
    tabris.create("Button", {centerX: 0, centerY: 0})
    ```

* `tabris.Widget.type` has been removed. `toString()` now returns the widget constructor name.

### Action
* `tabris.Action` must now be appended to a [`NavigationView`](https://tabrisjs.com/documentation/2.0/api/NavigationView#navigationview).

### Drawer
* `tabris.Drawer` constructor has been removed. A singleton drawer instance is now available as [`tabris.ui.drawer`](https://tabrisjs.com/documentation/2.0/api/ui#drawer). Its property
    [`enabled`](https://tabrisjs.com/documentation/2.0/api/Drawer#enabled) must be set to `true` before the drawer can be used.

### ScrollView
* Property `scrollX` is now [`offsetX`](https://tabrisjs.com/documentation/2.0/api/ScrollView#offsetx). It is now read-only, use [`scrollToX()`](https://tabrisjs.com/documentation/2.0/api/ScrollView#scrolltoxoffset) method to scroll.
* Property `scrollY` is now [`offsetY`](https://tabrisjs.com/documentation/2.0/api/ScrollView#offsety). It is now read-only, use [`scrollToY()`](https://tabrisjs.com/documentation/2.0/api/ScrollView#scrolltoyoffsety) method to scroll.
* Event `scroll` has been replaced by [`scrollX`](https://tabrisjs.com/documentation/2.0/api/ScrollView#scrollx-widget-offset) and [`scrollY`](https://tabrisjs.com/documentation/2.0/api/ScrollView#scrolly-widget-offset).

### Page
* Tabris 2.x has a new navigation concept. See [Navigation Patterns](https://tabrisjs.com/documentation/2.0/ui#navigation-patters) for more information.
* `tabris.Page.open()` has been removed. Append the page to a [`NavigationView`](https://tabrisjs.com/documentation/2.0/api/NavigationView#navigationview) instead.
* `tabris.Page.close()` has been removed. Use [`dispose()`](https://tabrisjs.com/documentation/2.0/api/Widget#dispose) or [`detach()`](https://tabrisjs.com/documentation/2.0/api/Widget#detach) to close a page.
* `tabris.Page.topLevel` has been removed.
* `tabris.ui.activePage` has been removed. Get the most top page of a [`NavigationView`](https://tabrisjs.com/documentation/2.0/api/NavigationView#navigationview) by calling [`navigationView.pages().last()`](https://tabrisjs.com/documentation/2.0/api/NavigationView#pages).
* `tabris.PageSelector` has been removed. For a sample page selector implementation, see the [drawer pages snippet](https://github.com/eclipsesource/tabris-js/blob/master/snippets/drawer-pages.js).

### SearchAction
* `tabris.SearchAction` must now be appended to a [`NavigationView`](https://tabrisjs.com/documentation/2.0/api/NavigationView#navigationview).

### Custom widgets
* `tabris.registerWidget()` has been removed. Use [`tabris.Widget.extend(...)`](https://tabrisjs.com/documentation/2.0/custom-widgets#custom-widgets) instead.

## UI
* `tabris.ui.statusBarTheme` has been removed. Use [`tabris.StatusBar.theme`](https://tabrisjs.com/documentation/2.0/api/StatusBar#theme) instead.
* `tabris.ui.displayMode` has been removed. Use [`tabris.StatusBar.displayMode`](https://tabrisjs.com/documentation/2.0/api/StatusBar#displaymode) instead.
* `tabris.ui.background` has been removed. Use [`tabris.NavigationView.toolbarColor`](https://tabrisjs.com/documentation/2.0/api/NavigationView#toolbarcolor) instead.
* `tabris.ui.textColor` has been removed. Use [`tabris.NavigationView.titleTextColor`](https://tabrisjs.com/documentation/2.0/api/NavigationView#titletextcolor), [`tabris.NavigationView.actionColor`](https://tabrisjs.com/documentation/2.0/api/NavigationView#actioncolor) and [`tabris.NavigationView.actionTextColor`](https://tabrisjs.com/documentation/2.0/api/NavigationView#actiontextcolor) instead.
* `tabris.ui.toolbarVisible` has been removed. Use [`tabris.NavigationView.toolbarVisible`](https://tabrisjs.com/documentation/2.0/api/NavigationView#toolbarvisible) instead.

## Properties
* Calling `get()` on a disposed object now returns `undefined`.
* `set()` of a disposed object is a [NOOP](https://en.wikipedia.org/wiki/NOP).

## Events
* `off()` without arguments is not supported anymore.
* `off(event)` is not supported anymore.
* Calling [`on(event, listener, context?)`](https://tabrisjs.com/documentation/2.0/api/NativeObject#onevent-listener-context) or [`once(event, listener, context?)`](https://tabrisjs.com/documentation/2.0/api/NativeObject#onceevent-listener-context) multiple times with identical parameters will result into the callback being registered only once.
