---
---
# Widget Basics

In the context of Tabris.js a widget is a native UI element that can be freely arranged, composed and configured in application code. In JavaScript these elements are represented by subclasses of `tabris.Widget`.

See also ["UI Architecture"](./ui.md) for a technical overview of all UI-related Tabris.js API including non-widget API.

## Hello World

This is a complete Tabris.js app to create an onscreen button:

```app.js```
```js
tabris.contentView.append(
  new tabris.Button({text: 'Hello World!'})
);
```

This gets us a push button that looks and behaves like a typical Android button on an Android device, and like a typical iOS button on iOS devices.

Let's look at each part of the app:

Code | Explanation
-----|------------
`tabris.contentView`| uses the `tabris` namespace to access the [`contentView`](./api/ContentView.md) widget instance, [which represents the main content of your app](./ui.md).
`.append(`|calls the append method to add something to that area.
&nbsp;&nbsp;&nbsp;&nbsp;`new tabris.Button(`| creates the actual button.
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`{text: 'Hello World'}`|sets the `text` property which is the label of the button.
&nbsp;&nbsp;&nbsp;&nbsp;`)`|end of constructor call
`);`|end of append call

### Variations

You can (and in most situations should) explicitly [import](./modules.md) any member of the `tabris` namespace from the tabris module, allowing you to omit it in the code:

```app.js```
```js
import {contentView, Button} from 'tabris';

contentView.append(
  new Button({text: 'Hello World!'})
);
```
If you use a ["Vanilla"](./getting-started.md#create-your-first-app) JS project setup without cross-compilation you must [use `require` instead of the ES6 `import` syntax](./modules.md):

```app.js```
```js
const {contentView, Button} = require('tabris');

contentView.append(
  new Button({text: 'Hello World!'})
);
```

In JavaScript/JSX or TypeScript/JSX [compiled project setup](./getting-started.md#create-your-first-app) you can also create the button via an [JSX](./declarative-ui.md) expression, similar to an HTML element. This is only supported in `.jsx` or `.tsx` files.

```app.jsx```
```jsx
import {contentView, Button} from 'tabris';

contentView.append(
  <Button text='Hello World' />
);
```

Most widgets that can display text allow to set it in the body of the element:

```app.jsx```
```jsx
import {contentView, Button} from 'tabris';

contentView.append(
  <Button>Hello World</Button>
);
```

A vanilla JavaScript equivalent to JSX is also available as of Tabris 3.6:

```app.js```
```js
import {contentView, Button} from 'tabris';

contentView.append(
  Button({text: 'Hello World!'})
);
```

This invokes `Button` as a factory, not a constructor. At a first glance this simply omits `new`, but this API also support additional attributes to register listener and add children. (It is the technical equivalent to using JSX syntax, but unlike JSX does not require a compiler setup.)

## Widget Properties

Every widget supports a fixed set of properties, like `text` or `background`, that can be specified when the widget is created. Most properties support values multiple different types, but will always convert these to the same standard type.

```js
contentView.append(
  new Button({text: 'Hello World!', background: [255, 128, 0]})
);
```

```js
contentView.append(
  Button({text: 'Hello World!', background: new Color(255, 128, 0))
);
```

```jsx
contentView.append(
  <Button text='Hello World' background='rgb(255, 128, 0)' />
);
```

> :point_right: Details about the JSX syntax for attributes can be found [here](./declarative-ui.md#jsx-specifics).

### Modifying Widgets

To set or get a property on an existing widget you need a reference, which you can easily obtain using the [selector API](./selector.md):

```js
const button = contentView.find(Button).first();
const oldText = button.text;
button.text = 'New Text';
```

There is also a shorthand for `contentView.find(selector)`: `$(selector)`. [You can use `$` anywhere without importing it](./api/$.md).

Using the widgets `set()` method, it's also possible to set multiple properties in one call:

```js
button.set({
  text: 'Hello New World',
  background: 'blue'
});
```

With the [selector API](./selector.md) you can also set multiple properties of multiple widgets, for example using [class
selectors](./selector.html#class-selectors).

```js
$('.label').set({background: 'red', opacity: 0.5})
```

> :point_right: Some properties can only be set on creation and not be changed later (e.g. `textInput#type`), and a few (e.g. `widget#bounds`) can not bet set at all.

## Composition

Widgets can contain other widgets to form complex user interfaces. This [hierarchy](./ui.md) always starts with an instance of `ContentView` (e.g. `tabris.contentView`) as the root element, all other widget types needs to have a parent to be visible.

All widgets that can contain child widgets are instances of `Composite` or one of its subclasses - which include `ContentView`. With some exceptions (e.g. `NavigationView`) widgets can be freely arranged within their parent, which is the topic of [this](./layout.md) article.

In pure JavaScript this primarily done via `append` calls. In this example we create a page with content and add it to the appropriate parent:

```js
navigationView.append(
  new Page().append(
    new TextView(),
    new Button()
  )
);
```

With JSX child elements a placed within the body of their parent element:

```jsx
navigationView.append(
  <Page>
    <TextView>
    <Button>
  </Page>
);
```

If you are calling the constructor without `new` the `children` attribute can be set to an array containing all children. Note that on the actual widget instance `children` is a method, not an array.

```jsx
navigationView.append(
  Page({
    children: [
      TextView(),
      Button()
    ]
  })
);
```

If a widget that already has a parent is added to another, it is automatically removed from the old parent first.

The current parent of a widget is returned by the [`parent`](api/Widget.md#parent) method, and the children by the [`children`](api/Composite.md#childrenselector) method. You can not *set* the parent or children via these methods, only get them.

## Event Handling

Widgets can notify event callback functions ("listeners") of events such as a user interaction or a property change. For each type of event supported by a widget there is a matching method (JS) and creation attribute (JSX/factories) to register a listener. These all start with an `on` prefix, so the `select` event is registered with `onSelect`.

Example:

```jsx
const listener = () => {
  console.log('Button selected!');
}

contentView.append(
  new Button().onSelect(listener)
);

// or ...

contentView.append(
  <Button onSelect={listener} />
);

// or ...

contentView.append(
  Button({onSelect: listener})
);
```

It should be made clear that `onSelect` is *NOT* an instance property that a listener can be assigned to, nor can one be passed to a constructor when called with `new`. Only JSX element and widget factories accept listeners this way, on the widget itself `onSelect` is a method.

Always favor arrow functions over `function` to create listeners, it avoids issues with `this` having unexpected values. A simple wrapper can suffice:

```js
button.onSelect((ev) => this.doSomething(ev));
```

The listener function is called with an instance of [EventObject](./api/EventObject.md) that may include a number of additional properties depending on the event type.

The listener registration method is also an object of the type [`Listeners`](./api/Listeners.md) which provides additional API for event handling. This is how you de-register a listener again:

```js
button.onSelect.removeListener(listener);
```

### Change Events

All widgets support property change events that are fired when a property value changes. All change events are named after the property with `Changed` as a postfix, e.g. `myValue` fires `myValueChanged`, so listeners can be registered via `onMyValueChanged`.

In addition to the common event properties, [change events](${doc:PropertyChangedEventUrl}) have a property `value` that contains the new value of the property.

Example:

```js
new TextInput().onTextChanged(event => {
  console.log('The text has changed to: ' + event.value);
})
```

## Animations

All widgets have the method [`animate(properties, options)`](api/Widget.md#animateproperties-options). It expects a map of properties to animate (akin to the `set` method), and a set of options for the animation itself.
All animated properties are set to their target value as soon as the animation starts. Therefore, reading the property value will always result in either the start or target value, never one in between.

Only the properties `transform` and `opacity` can be animated.

The `animate` method returns a Promise that is resolved once the animation is completed. If the animation is aborted, e.g. by disposing the widget, the promise is rejected.

In this example we use the `async/await` syntax to wait for the animation to finish, then dispose the widget.

```js
async function fadeOut(widget) {
  await widget.animate(
    {opacity: 0}
    {duration: 1000, easing: 'ease-out'}
  );
  widget.dispose());
}

fadeOut(myLabel);
```

## Disposing of a Widget

When a widget instance is no longer needed in the application it should be *disposed* to free up the resources it uses. This is done using the `dispose` method, which disposes of the widget and all of its children. It triggers a *removeChild* event on the parent and a *dispose* event on itself.

Example:

```js
button.onDispose(() => console.log('Button disposed!'));
button.dispose();
```

After a widget has been disposed `isDisposed()` returns `true` while almost all other methods will throw an exception if called.

## Custom Components

Custom components are user-defined subclasses of [`Composite`](./api/composite.md) (or other [`Component`](./api/composite.md) subclasses such as [`Page`](./api/Page.md) and [`Tab`](./api/composite.md)). They are composed of built-in widgets (or other custom components) to form a discrete part of the UI which can then be used (and re-used) to form the application UI as a whole. Custom components can define new properties and events for interaction with other parts of the application.

Typically a custom component creates its own children in its constructor and "hides" them from the public API by [overriding the `children` method](./selector.md#encapsulation) or applying the [`@component`](./databinding/@component.md) decorator (TypeScript only). The children are then modified using the protected selector API (e.g. [`_find`](./api/composite.md#_findselector)) as a reaction to property changes.

A custom component with a custom `text` property and custom event `myEvent` may look like this in plain JavaScript:

```js
class ExampleComponent extends Composite {

  /** @param {tabris.Properties<ExampleComponent>=} properties */
  constructor(properties) {
    super();
    /** @type {string} */
    this._text = '';
    /** @type {tabris.Listeners<{target: ExampleComponent}>} */
    this.onMyEvent = new Listeners(this, 'myEvent');
    this.append(this._createContent()).set(properties); // The order is important!
    this.children = () => new WidgetCollection([]);
  }

  set text(value) {
    this._text = value;
    this._find('#message').only(TextView).text = value;
  }

  get text() {
    return this._text;
  }

  _createContent() {
    return Stack({spacing: 23, padding: 23, children: [
      TextView({font: '18px', text: 'The message:'}),
      TextView({font: '18px', id: 'message', background: 'yellow'}),
      Button({
        top: 24, text: 'Push me',
        onSelect: this.onMyEvent.trigger
      })
    ]});
  }

}
```

Or like this in TypeScript/JSX [using one-way data binding](./databinding/index.md):

```tsx
@component
export class ExampleComponent extends Composite {

  @prop text: string;
  @event onMyEvent: Listeners<{target: ExampleComponent}>;

  constructor(properties: Properties<ExampleComponent>) {
    super();
    this.append(
      <Stack spacing={12} padding={12}>
        <TextView font='18px'>The message:</TextView>
        <TextView font='18px' background='yellow' bind-text='text'/>
        <CheckBox top={24} onSelect={this.onMyEvent.trigger}>
          Push Me
        </CheckBox>
      </Stack>
    ).set(properties);
  }

}
```

And in JavaScript/JSX it's only slightly different:

```js
@component
export class ExampleComponent extends Composite {

  /** @type {string} */
  @prop(String) text;

  /** @type {tabris.Listeners<{target: ExampleComponent}>} */
  @event onMyEvent;

  /**
   * @param {Properties<ExampleComponent>} properties
   */
  constructor(properties) {
    super();
    this.append(
      <Stack spacing={12} padding={12}>
        <TextView font='18px'>The message:</TextView>
        <TextView font='18px' bind-text='text'/>
        <CheckBox top={24} onSelect={this.onMyEvent.trigger}>
          Push Me
        </CheckBox>
      </Stack>
    ).set(properties);
  }

}
```

## Functional Components

A functional component is the term used for functions that return a widget or `WidgetCollection`, a.k.a a widget factory. Its name typically starts with an upper case, and it should take a single `properties` or `attributes` parameter object. In the latter case it needs to create widgets using [declarative UI syntax](./declarative-ui.md#functional-components).

A common use case for this is to create widgets that have different default values, such as a different background or text color.

A very simple functional component could look like this:

```js
/** @param {tabris.Properties<TextView>} properties */
function StyledComponent(properties) {
  return new TextView({textColor: 'red', background: 'yellow', ...properties});
}
```

Functional components can also work as selectors:

```js
$(StyledComponent).only().text = 'Hello WOrld';
```

For more advanced examples, read [this section](./declarative-ui.md#functional-components) in the ["Declarative UI" article](./declarative-ui.md).
