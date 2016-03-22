# Selector API

Modifying a widget usually requires having direct access the object. This may not always be the most convenient or efficient way to work with complex UIs. The Tabris.js selector API allows referencing widgets without using an instance, and even manipulating multiple widgets at once.

## Selector Strings

A selector string describes an existing widget that we want to work with. There are different formats for these strings, which will look familiar to you if you know CSS.

- `"*"` - Matches all widgets.
- `"Type"` - Matches all widgets of the given type, e.g. `"Button"` matches all button widgets.
- `".class"` - Matches all widgets that have the given class in their class list, e.g. `".foo"` matches a widget with `class` set to `"foo"` or `"foo bar`".
- `"#id"` - Matches all widgets with the given id, e.g. `"#foo"` matches all widgets with the id "foo".

The id of a widget is a property like any other. It's initial value is undefined, so you always have to assign one yourself, usually when creating the widget.

    new tabris.TextView({id: "myLabel"});

Id's don't have to be unique, but it is strongly recommended that they are so within a page.

The `class` property is a string containing a whitespace separated list of "classes". A class is an arbitrary name for a state or category the widget should be identifiable by. It may only contain alphanumeric characters, "_" and "-".

    new tabris.TextView({class: "label important"});

Classes may be freely mixed, re-used and changed on any widget at any time.

## Working with Selectors

To find a widget anywhere in the current page, simply call `page.find(selector)`. This will return a [WidgetCollection](api/WidgetCollection.md) with all widgets within the page that match the given selector. You can further narrow the search scope by using `page.children(selector)`, or by calling either of these methods on a container within the page.

It is also possible to search through all widgets in the current widget tree, using `tabris.ui.find(selector)`. However, this is rarely practical. Instead, you may use `tabris.ui` to find all current pages (`tabris.ui.children("Page")`), actions (`tabris.ui.children("Action")`) or the drawer (`tabris.ui.children("Drawer")`).

A selector may also be given in [LayoutData](layout.md) instead of a the widget itself. This even works if the referenced widget is not yet created.

## The apply method

### How it works

- `apply({<selector: properties>*})`

The apply method uses selectors to apply different sets of properties to different widgets in one call. It is available on all widgets, but most commonly used on `Page`.

For example, to make all widgets within a page green you could call:

```javascript
page.apply({"*": {background: "green"}});
```

You can also set different properties on different widgets:

```javascript
page.apply({
  "#okbutton": {text: "OK!", background: "yellow"},
  "#cancelbutton": {text: "Cancel!", textColor: "red"}
});
```

The order in which these properties are applied depends on the selector used. The order is:

- `"*"` > `"Type"` > `".class"` > `"#id"`

For example:

```javascript
page.apply({
  "#mybutton": {background: "red"},
  "Button": {background: "green"},
  "*": {background: "blue"}
});
```

This will make all widgets within the page blue, except for the buttons, which are green, except for "#mybutton", which will be red.

> <img align="left" src="img/note.png"> <i>The on-screen order of the properties in the object literal is meaningless. According to the EcmaScript standard the members of a JavaScript object do not have a defined order.</i> 

### How to use it

While we used object literals in the above examples, the apply method can be very effectively used with [modules](module), allowing most or all property values (except ids) to be extracted from your code.

Imagine, for example, that you want to apply different texts to your widgets depending on your locale. You could do it like this:

```javascript
var lang = tabris.device.get("language");
try {
  page.apply(module.require("./texts-" + lang));
} catch() {
  // fallback if the desired language file does not exist:
  page.apply(module.require("./texts-en"));
}
```

Since JSON files can be used as modules, your language file (e.g. "texts-en.json") could simply look like this:

```json
{
  "#okbutton": {"text": "OK!"},
  "#cancelbutton": {"text": "Cancel!"}
}
```

An alternative pattern would be to always use the same module...

```javascript
  page.apply(module.require("./texts));
}
```

But use scripting within the module to calculate the actual values:

```javascript
var texts = {
  en: {
    "#okbutton": {text: "OK!"}
    "#cancelbutton": {text: "Cancel!"}
  },
  //...
};
module.exports = texts[tabris.device.get("language")] || texts.en;
```

The same pattern could be applied for e.g. colors based on the OS, font-sizes based on screen width, or layout data depending on device orientation:

```javascript
page.on("resize", function() {
  var bounds = page.get("bounds");
  page.apply(require("./layout-" + (bounds.width > bounds.height) ? "landscape" : "portrait"));
});
```

> <img align="left" src="img/note.png"> <i>It is better to use the aspect ratio of the page as a basis for selecting a layout than the device orientation. This is because when the device is re-oriented, the page is first re-sized, and then rotated in an animation. Also, in future Tabris.js versions a page may not always have the same aspect ratio as the screen.</i>
