# Selector API

Modifying a widget usually requires direct access to the object. However, assigning all mutable widgets to variables can quickly clutter your UI code. For this reason, the Tabris.js API offers methods to find widgets by certain attributes, and even to manipulate multiple widgets at once. Widgets can be selected by their *type*, their *ID*, or their *class* attributes, using a format established by CSS.

## Selecting widgets by type

The simplest method to select widgets is to refer to their type. For example, the following statement would uncheck all checkboxes on a page:

```js
page.find('CheckBox').set('selection', false);
```

## Selecting widgets by ID

The `id` of a widget is a property like any other. It is initially undefined, so you have to assign an ID yourself to refer to the widget. Usually you would do this when you create the widget:

```js
new Button({id: 'submit'});
```

To select a widget by its ID, you can use the selector expression `'#id'` where `id` is the ID of the widget:

```js
page.find('#submit').set('enabled', false);
```

IDs should be unique. Although this is not enforced by the framework, it's a good practice not to use the same ID twice within a component to avoid confusion.

## Selecting widgets by class attribute

The `class` property is a string containing a whitespace separated list of "classes". A class is an arbitrary name for a state or category the widget should be identifiable by. It may only contain alphanumeric characters, `'_'` and `'-'`.

```js
new TextView({class: 'label important'});
```

Classes may be mixed, re-used and changed on any widget at any time. Using the `classList` property is a handy way to do so:

```js
textView.classList.push('important');
```

To select a widget by a class attribute, use the selector expression `'.class'` where `class` is the class name:

```js
page.find('.important').set('textColor', 'red');
```

## Selector Expressions

The following types of selector expressions are supported:

- `'*'` matches all widgets.
- `'Type'` matches all widgets of the given type, e.g. `'Button'` matches all Button widgets.
- `'.class'` matches all widgets that have the given class in their class list, e.g. `'.foo'` matches a widget with `class` set to `'foo'`, but also `'foo bar`'.
- `'#id'` matches all widgets with the given ID, e.g. `'#foo'` matches all widgets with the ID `'foo'`.

## Selector Functions

All methods that accept a selector expression can also be called with a predicate function to test each widget of a collection. This function will be called for each widget and returns `true` to include the widget, and `false` to skip it. For example, the following snippet would select all visible widgets on a page:

```js
let visibleChildren = page.children(widget => widget.visible);
```

## Working with Selectors

The following methods on Widget accept a selector expression:

- `widget.find(selector)` will select all descendants that match the selector.
- `widget.children(selector)` will select all direct children that match the selector, but not their children.
- `widget.siblings(selector)` will select all siblings of the widget that match the selector.

These methods return a [WidgetCollection](api/WidgetCollection.md). You can extract widgets from the collection using the methods `first()` and `last()` or using array index notation:

```js
let submitButton = page.find('#submit').first(); // or
let submitButton = page.find('#submit')[0];
```

You can also set properties on the included widgets without extracting them:

```js
page.find('.input').set('enabled', false);
```

## The apply method

An efficient way to configure multiple widgets in a component is using the `apply()` method on the parent.

### How it works

- `apply({<selector: properties>*})`

The apply method uses selectors to apply different sets of properties to different widgets in one call. For example, to apply a background color to all widgets within a page you could call:

```js
page.apply({'*': {background: 'green'}});
```

You can also set different properties on different widgets:

```js
page.apply({
  '#okbutton': {text: 'OK!', background: 'yellow'},
  '#cancelbutton': {text: 'Cancel!', textColor: 'red'}
});
```

The order in which these properties are applied depends on the type of selectors being used. The order is:

- `'*'` > `'Type'` > `'.class'` > `'#id'`

For example, the following call would make all widgets within the page blue, except for the buttons, which would be green, except for `'#mybutton'`, which would be red:

```js
page.apply({
  '#mybutton': {background: 'red'},
  'Button': {background: 'green'},
  '*': {background: 'blue'}
});
```

> :point_right: The on-screen order of the properties in the object literal is meaningless. According to the EcmaScript standard the members of a JavaScript object do not have a defined order.

### How to use it

While we used object literals in the examples above, the apply method can be very effectively used with [modules](modules.md), allowing most or all property values (except IDs) to be extracted from your code.

Imagine, for example, that you want to apply different texts to your widgets depending on your locale. You could do it like this:

```js
let lang = device.language;
try {
  page.apply(module.require('./texts-' + lang));
} catch() {
  // fallback if the desired language file does not exist:
  page.apply(module.require('./texts-en'));
}
```

Since JSON files can be used as modules, your language file (e.g. `texts-en.json`) could simply look like this:

```json
{
  '#okbutton': {'text': 'OK'},
  '#cancelbutton': {'text': 'Cancel'}
}
```

An alternative pattern would be to always use the same module...

```js
page.apply(module.require('./texts'));
```

But use scripting within the module to calculate the actual values:

```js
let texts = {
  en: {
    '#okbutton': {text: 'OK!'}
    '#cancelbutton': {text: 'Cancel!'}
  },
  //...
};
module.exports = texts[device.language] || texts.en;
```

The same pattern can be applied for platform-specific colors, font-sizes based on screen width, or layout data depending on device orientation:

```js
page.on('resize', ({width, height}) => {
  page.apply(require('./layout-' + (width > height) ? 'landscape' : 'portrait'));
});
```

> :point_right: It is better to use the aspect ratio of the page as a basis for selecting a layout than the device orientation. This is because when the device is re-oriented, the page is first re-sized, and then rotated in an animation. Also, in future Tabris.js versions a page may not always have the same aspect ratio as the screen.
