---
---
# Selector API

Modifying a widget usually requires direct access to the object. However, assigning all mutable widgets to variables can quickly clutter your UI code. For this reason, the Tabris.js API offers methods to find widgets by certain attributes, and even to manipulate multiple widgets at once. Widgets can be selected by their *type*, their *ID*, or their *class* attributes, using a format established by CSS.

## Selecting widgets by type

The simplest method to select widgets is to refer to their type. For example, the following statement would uncheck all checkboxes on a page:

```js
page.find('CheckBox').set('selection', false);
```

You may also give the type via the constructor instead of a string:

```js
page.find(CheckBox).set('selection', false);
```

This is mainly useful in TypeScript (provides better autocompletion), or to select all widgets that _extend_ a given widget class:

```js
page.find(Composite).set('background', 'green');
```

This would make all composites green, including, for example, instances of `TabFolder`.

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

## Selecting by parent-child relationship

A widget may also selected by its parent. This is done by giving first the selector of the parent, followed by `' > '`, and then the selector of the child.

Example: Let's say you have a page with two buttons:

```js
page.append(
  new Button(),
  new Composite().append(new Button)
);
```

In this case you can of course select both buttons:

```js
page.find('Button').set('textColor', 'red');
```

But also only the button inside the composite:

```js
page.find('Composite > Button').set('textColor', 'red');
```

Or only the button attached to the page directly:

```js
page.find('Page > Button').set('textColor', 'red');
```

The latter example can also be expressed more precisely using the `:host` pseudo class:

```js
page.find(':host > Button').set('textColor', 'red');
```

In this case the `:host` refers specifically to the widget that `find` is called on, not just any `Page` instance that could technically be nested inside `page` (via another `NavigationView`).

## Selector Expressions

The following types of selector expressions are supported:

- `'*'` matches all widgets.
- `'Type'` matches all widgets of the given type, e.g. `'Button'` matches all Button widgets.
- `'.class'` matches all widgets that have the given class in their class list, e.g. `'.foo'` matches a widget with `class` set to `'foo'`, but also `'foo bar`'.
- `'#id'` matches all widgets with the given ID, e.g. `'#foo'` matches all widgets with the ID `'foo'`.
- `selector1 > selector2` matches all widgets that match `selector2` that also have a parent that matches `selector1`.
- `:host` matches the widget the selector is used with. It currently does not match anything when used on a `WidgetCollection` instance.

## Selector Functions

All methods that accept a selector expression can also be called with a predicate function to test each widget of a collection. This function will be called for each widget and returns `true` to include the widget, and `false` to skip it. For example, the following snippet would select all visible widgets on a page:

```js
let visibleChildren = page.children(widget => widget.visible);
```

When the given function is a constructor it will _not_ be called, but used to match all instances of that constructor.

## Working with Selectors

The following methods on Widget accept a selector expression:

- `widget.find(selector)` will select all descendants that match the selector.
- `widget.children(selector)` will select all direct children that match the selector, but not their children.
- `widget.siblings(selector)` will select all siblings of the widget that match the selector.

The selector parameter defaults to `*`, so `find()` is the same as `find('*')`.

These methods all return a [WidgetCollection](api/WidgetCollection.md), You can extract individual widgets from the collection using the methods `first()` and `last()` or using array index notation:

```js
let submitButton = page.find('#submit').first(); // or
let submitButton = page.find('#submit')[0];
```

Both `first` and `last` also support selectors, as does the `filter` method:

```js
let lastButton = page.find('*').last(Button);
let importantComposites = page.find('Composite').filter('.important');
```

You can also set properties on the included widgets without extracting them:

```js
page.find('.input').set('enabled', false);
```

Since the scope of `page.find()` excludes `page` itself, the `:host` pseudo class by itself does not select anything.

```js
console.log(page.find(':host').length); // '0'
console.log(page.find(':host > *') === page.children()); // 'true'
```

## The apply method

An efficient way to configure multiple widgets in a component is using the `apply()` method on the parent.

- `apply({<selector: properties>*})`

The apply method uses selectors expressions to apply different sets of properties to different widgets in one call. For example, to apply a background color to all widgets within a page you could call:

```js
page.apply({'*': {background: 'green'}});
```

This _also_ sets the background of `page` itself, since the scope of `apply` includes the widget it is called on:

```js
page.apply({':host': {background: 'green'}}); // same as "page.background = green";
```

With `apply` you can set different properties on different widgets in one call:

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

When using child selectors, the more specific selector wins. In this example, all buttons are green except for those directly attached to `page`, which are red.

```js
page.apply({
  ':host > Button': {background: 'red'},
  'Button': {background: 'green'}
});
```

> :point_right: The on-screen order of the properties in the object literal is meaningless. According to the EcmaScript standard the members of a JavaScript object do not have a defined order. The priority of two selectors with the same specificity is undefined.
