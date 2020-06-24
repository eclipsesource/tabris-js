---
---
# Selector API

Tabris.js offers APIs to find and manipulate widgets anywhere in the UI tree using selectors. A selectors is [a string, a widget constructor, or a filter function](#selector-syntax) that can be used by the framework to filter a given set of widgets and *select* only those with a specific *type*, *ID*, or *class* attribute or parent-child relationship.

## Selector Syntax

### Type Selectors

The simplest method to select widgets is to refer to their type. For example, the following statement would select all instances of `CheckBox`. [This also works with JSX element names](./JSX.md#stateless-functional-components).

```js
page.find('CheckBox')
```

You may also give the type via the constructor or [JSX Element](./JSX.md#stateless-functional-components) instead of a string:

```js
page.find(CheckBox)
```

This is preferable in TypeScript (as it provides better autocompletion), or to also select all widgets that _extend_ a given widget class:

```js
page.find(Composite)
```

This would find all instances of `Composite` or one of it's subclasses, like `TabFolder` or `Canvas`.

### ID Selectors

The `id` of a widget is a property like any other. It is initially undefined, so you have to assign an ID yourself to refer to the widget. Usually you would do this when you create the widget:

```jsx
<Button id='submit'/>
```
... or ...
```js
new Button({id: 'submit'});
```

To select a widget by its ID, you can use the selector expression `'#id'` where *id* is the ID of the widget:

```js
page.find('#submit')
```

By convention IDs should be unique within the given subtree, although this is not enforced by the framework. See "[Encapsulation](#encapsulation)".

### Class Selectors

The `class` property is a string containing a whitespace separated list of "classes".  A class is an arbitrary name for a state or category the widget should be identifiable by. It may only contain alphanumeric characters, `'_'` and `'-'`.

> :point_right: The `class` attribute is comparable to the concept of a CSS class, and not related to JavaScript/TypeScript classes in any way.

Examples:

```jsx
<TextView class='label important'/>
```
or
```js
new TextView({class: 'label important'});
```

Classes may be mixed, re-used and changed on any widget at any time. Using the `classList` property is a handy way to do so:

```js
textView.classList.push('important');
```

To select a widget by a class attribute, use the selector expression `'.class'` where *class* is the class name:

```js
page.find('.important')
```

### Relationship Selectors

A widget may also selected by its parent. This is done by giving first the selector of the parent, followed by `' > '`, and then the selector of the child.

Example: Let's say you have a page with two buttons:

```jsx
<Page>
  <Button/>
  <Composite>
    <Button/>
  </Composite>
</Page>
```

In this case you can either select both buttons...

```js
page.find('Button')
```

...or only the button within the composite...

```js
page.find('Composite > Button')
```

...or only the button directly attached to the page:

```js
page.find('Page > Button')
```

In this case the `'Page'` we select here is supposed to only refer to the *page* object itself, not any (potential) children that are also of the type `Page`. To avoid this ambiguity we can use the `:host` pseudo class:

```js
page.find(':host > Button')
```

The `:host` selector refers specifically to the widget that applies the selector, in this case the *page*.

### Star selector

The character `'*'` matches all widgets. Sometimes useful in conjunction with the [`apply`](#compositeapply) method or [Relationship Selectors](#relationship-selectors):

```js
page.find(':host > * > Button')
```

This selects all Buttons attached to any child of *page*, regardless of the type of the child in between.

### Selector Functions

Filter functions are also valid selectors. These type of functions are called for each widget candidate and need to return either `true` to include it or `false` to exclude it. For example, the following snippet would select all visible widgets on a page:

```js
page.children(widget => widget.visible)
```

When the given function is a constructor it will _not_ be called, but treated as a [type selector](#type-selectors).

## WidgetCollection

Instances of `WidgetCollection` can be both the basis and the result of a selection. Therefore a quick overview is useful here:

Widget collections are array-like objects that represent a set of widgets in Tabris.js. They are immutable and every entry is unique, i.e. they never contain any duplicates. They may also be empty, representing zero widgets.

Notably, a widget collection features a subset of the widget API that allows modifying all contained widgets at once. This includes `set`, `trigger`, `on`, `off`, `once`, `append`, `appendTo`, `dispose` and `animate`. Example:

```js
collection
  .set({background: 'blue'}) // make all widgets blue..
  .animate({opacity: 0}, {duration: 400}); // fade out
```

The same could be done to only a specific entry:

```js
collection[3]
  .set({background: 'blue'})
  .animate({opacity: 0}, {duration: 400});
```

The first example will never fail, even if the collection is empty, while the second may cause an exception if the collection has less than four widgets. Like arrays, widget collections are zero indexed.

While `WidgetCollection` has some array-like API (`length`, `forEach`, `indexOf`), you can also get an actual array, which is mutable safe copy:

```js
const arr = collection.toArray();
arr.splice(2, 3);
const collection2 = new WidgetCollection(arr);
```

JSX can be used to create a widget collection, usually to create and append multiple widgets to the same parent:

```jsx
contentView.append(
  <WidgetCollection>
    <TextView/>
    <TextView/>
    <TextView/>
  </WidgetCollection>
);
```

In TypeScript `WidgetCollection` is a generic type (`WidgetCollection<T extends Widget = Widget>`>)that "knows" what type of widgets are contained - if they are all of the same type:

```js
const collection: WidgetCollection<TextView> = new WidgetCollection([new TextView()]);
collection[0].text = 'foo'; // would not compile on WidgetCollection<Widget>
```

Such a collection is created implicitly whenever a constructor is used as a [type selector](#type-selectors).

## APIs that accept Selectors

### composite.children()

The method `composite.children(selector)` method returns a new widget collection containing the composite's current children that match the given selector. This includes only first generation descendants, so children of children are not part of the result. If the composite is a custom component (user defined subclass) that [encapsulates](#encapsulation) its children **the method will always return an empty `WidgetCollection`.

The selector parameter defaults to `*`, so `children()` is the same as `children('*')`.

```jsx
(
  <Composite>
    <TextView/>
    <TextView/>
    <Composite>
      <TextView/>
    </Composite>
  </Composite>
).children(TextView).set({left: 23});
```

This will modify the first two children of the given composite since these are `TextView` instances.

### composite.find()

The method `composite.find(selector)` returns a new widget collection containing all descendants that match the given selector. **This excludes** the widget the method was called on, **and any descendants of [encapsulated](#encapsulation) components**.

The selector parameter defaults to `*`, so `find()` is the same as `find('*')`.

```jsx
(
  <Composite>
    <TextView/>
    <TextView/>
    <Composite>
      <TextView/>
    </Composite>
  </Composite>
).find(TextView).set({left: 23});
```

This will modify all `TextView` elements in the tree.

### $()

This function is a global alias for `tabris.contentView.find()`, and it therefore accepts the same selector parameters.

```js
$('.foo > .bar').set({background: 'blue'});
// same thing:
tabris.contentView.find('.foo > .bar').set({background: 'blue'});
```

Note that `$()` will **not** search through *all* widgets in the UI tree. It's scope does *not* include any widgets in the drawer, a popover, or an [encapsulated](#encapsulation) custom component. A component is encapsulated if it overrides the [`children()`](#children) method or uses the `@component` decorator.

Due to it's scope it is mainly intended to be used in snippets, for debugging and when bootstrapping your application.

### widgetCollection.filter()

The method `widgetCollection.filter(selector)` returns a new widget collection containing all entries of the original collection that match the given selector. This is useful to narrow down an initial selection:

```jsx
(
  <Composite>
    <TextView class='foo'/>
    <TextView class='bar'/>
    <Button class='foo'/>
  </Composite>
).children(TextView).filter('.foo').set({left: 23});
```

This will modify the first `TextView` instance, but neither the `Button` nor the second `TextView`.

### widgetCollection.first() and widgetCollection.last()

These return the first/last entry in the collection that match the given selector. If no element matches they return `undefined`. The selector parameter defaults to `*`, so `first()` is the same as `first('*')`. It is also effectively the same as accessing the element via index:

```js
page.find('#submit').first() === page.find('#submit')[0];
```

In TypeScript `first(Type)` and `last(Type)` perform an implicit cast:

```js
page.find('#submit').first().text = 'Hello'; // does not compile
page.find('#submit').first(Button).text = 'Hello'; // OK
```

### widgetCollection.only()

Very similar to `first()`, except that it requires the collection to have exactly one match for the given selector. If there is more or less than one match the method throws en Error. This is preferable to `first()` if there is only one match expected, as it greatly reduces the risk of accidentally selecting the wrong one or encountering hard-to-debug exceptions if no match exists.

Without a selector the widget collection needs to have exactly one entry.

```js
// throws if more than one child with the id "submit" exists:
page.find('#submit').only() === page.find('#submit').first();
```

### widgetCollection.children()

The method `collection.children(selector)` will apply the given selector to all children of it's own entries. This allows selecting by parent-child relationships, similar to [relationship selectors](#relationship-selectors):

```js
widget.find(':host > .foo > .bar');
widget.children('.foo').children('.bar'); // same result
```

While this method is longer, it allows using non-string selector, i.e. functions/constructors.

When subclassing a `Composite` (including `Page`, `Tab` and `Canvas`), it is recommended to overwrite the `children` method to [encapsulate](#encapsulation) the component. The method will then always return an empty `WidgetCollection`, even when the composite/component contains children. The `_children()` method will still work the same way.

### composite.apply()

__Note: Within [encapsulated](#encapsulation) components, use `_apply()` instead.__

A shortcut for setting different sets of properties for different selections in one method call. The method takes a plain object with selectors as keys and property objects as values:

```js
page.apply({
  '#okbutton': {text: 'OK!', background: 'yellow'},
  '#cancelbutton': {text: 'Cancel!', textColor: 'red'}
});
```
__The scope includes the widget it is called on__:

```js
page.apply({':host': {background: 'green'}}); // same as "page.background = green";
```

The order in which the property objects are applied depends on the type of selectors being used. The order is:

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

> :point_right: The order of the properties in the object literal is meaningless. According to the EcmaScript standard the members of a JavaScript object do not have a defined order. The priority of two selectors with the same specificity is undefined.

## Encapsulation

All custom components should override their `children` method to protect them from outside manipulation:

```js
class MyCustomComponent extends Composite {

  // ...

  children() {
    return new WidgetCollection();
  }

}
```

Alternatively, when using the (TypeScript-only) [`@component`](./databinding/@component.md) decorator will do this automatically:

```ts
@component
class MyCustomComponent extends Composite {

  // ... no override needed

}
```

Either approach will prevent `find()` and `apply()` from including any children of `MyCustomComponent`. It will always appear as though it has no children. For `MyCustomComponent` itself to still be able to select its own children it needs to use the non-public version of the selector API:

```js
class MyCustomComponent extends Composite {

  // ...

  doSomething()
    this._children().set({background: 'red'});
    this._find('#foo').set({background: 'green'});
    this._apply({'.bar': {background: 'blue'}});
  }

}
```

**Why encapsulation?**

By default the scope of `find` and `apply` include all descendants of their hosts, including all children of a custom component. This may not be desireable:

```jsx
widget.append(
  <Composite>
    <Button id='primary'/>
    <MyCustomComponent/>
  </Composite>
);
```

In this scenario we may want to select all `'#primary'` elements:

```js
widget.find('#primary').set({text: 'blue'});
```

But `MyCustomComponent` may itself also contain a match for `'#primary'`:

```js
class MyCustomComponent extends Composite {

  constructor(properties) {
    super(properties);
    this.append(<TextView id='primary'/>);
  }

}
```

This would be an unexpected collision, assuming `MyCustomComponent` considers its own children to be internals that should not be accessed by outside code. This is what encapsulation prevents.
