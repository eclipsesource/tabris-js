---
---
# Widget Basics

In the context of Tabris.js a widget is a native UI element that can be freely arranged, composed and configured in application code. In JavaScript these elements are represented by subclasses of `tabris.Widget`.

See also ["UI Architecture"](./ui.md) for a technical overview of all UI-related Tabris.js API including non-widget API.

## Hello World

This is a complete Tabris.js app to create an onscreen button:

```app.jsx```
```jsx
tabris.contentView.append(
  <tabris.Button>
    Hello World
  </tabris.Button>
);
```

This gets us a push button that looks and behaves like a typical Android button on an Android device, and like a typical iOS button on iOS devices.

Let's look at each part of the app:

Code | Explanation
-----|------------
`tabris.contentView`| uses the `tabris` namespace to access the [`contentView`](./api/ContentView.md) widget instance, [which represents the main content of your app](./ui.md).
`.append(`|calls the append method to add something to that area.
&nbsp;&nbsp;&nbsp;&nbsp;`<tabris.Button>`| creates the actual button via an [JSX](./JSX.md) expression, similar to an HTML element. This is only supported in  `.jsx` or `.tsx` files in a [compiled project setup](./getting-started.md#create-your-first-app).
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`Hello World`| is the text that the button displays. Most widgets that can display text allow defining it that way, but you can also set the `text` attribute.
&nbsp;&nbsp;&nbsp;&nbsp;`</tabris.Button>`|closes the `Button` element and ends the JSX expression.
`);`|ends the `append` call.

### Variations

You can also explicitly [import](./modules.md) any member of the `tabris` namespace from the tabris module, allowing you to omit it in the code:

```app.jsx```
```jsx
import {contentView, Button};

contentView.append(
  <Button>Hello World</Button>
);
```

The text content of the button [can also be set as an attribute](./JSX.md#usage):

```app.jsx```
```jsx
import {contentView, Button};

contentView.append(
  <Button text='Hello World' />
);
```

And if you prefer pure JavaScript/TypeScript, equivalent code would be:

```app.js```
```js
import {contentView, Button} from 'tabris';

contentView.append(
  new Button({text: 'Hello World!'})
);
```

Finally, if you use a ["Vanilla"](./getting-started.md#create-your-first-app) JS project setup without cross-compilation you can use neither JSX nor the ES6 `import` syntax:

```app.js```
```js
const {contentView, Button} = require('tabris');

contentView.append(
  new Button({text: 'Hello World!'})
);
```

## Widget Properties

Every widget supports a fixed set of properties, like `text` or `background`, that can be specified in the JSX element or constructor call.

```jsx
contentView.append(
  <Button text='Hello World' background={[255, 128, 0]} />
);
```

```js
contentView.append(
  new Button({text: 'Hello World!', background: [255, 128, 0]})
);
```

> :point_right: Details about the JSX syntax for attributes can be found [here](./JSX.md#usage).

### Modifying Widgets

To set or get a property on an existing widget you need a reference, which you can easily obtain using the [selector API](./selector.md):

```js
const button = contentView.find(Button).first(); // alternatively: $(Button).first();
const oldText = button.text;
button.text = 'New Text';
```

Using the `set()` method, it's also possible to set multiple properties in one call:

```js
button.set({
  text: 'Hello New World',
  background: 'blue'
});
```

With the [selector API](./selector.md) you can also set multiple properties of multiple widgets:

```js
contentView.find('*').set({background: 'red', opacity: 0.5})
```

> :point_right: Some properties can only be set on creation and not be changed later (like `textInput#type`), while others (like `widget#bounds`) can not bet set at all.

## Composition

Widgets can contain other widgets to form complex user interfaces. This [hierarchy](./ui.md) needs to start with an instance of `ContentView` (e.g. `tabris.contentView`) as a root element, since all other widget types needs to have a parent to be visible.

All widgets that can contain child widgets are instances of `Composite` or one of its subclasses - which include `ContentView`. With some exceptions (e.g. `NavigationView`) widgets can be freely arranged within their parent, which is the topic of [this](./layout.md) article.

With JSX it is possible to create and insert an entire ui fragment in one call. In this example we create a page with content and add it to the appropriate parent:

```jsx
navigationView.append(
  <Page>
    <TextView>
    <Button>
  </Page>
);
```

In pure JavaScript this requires multiple `append` calls:

```js
navigationView.append(
  new Page().append(
    new TextView(),
    new Button()
  )
);
```

If a widget that already has a parent is added to another, it is automatically removed from the old parent first.

The current parent of a widget is returned by the [`parent`](api/Widget.md#parent) method,
and the children by the [`children`](api/Composite.md#childrenselector) method.

## Event Handling

Widgets can notify event callback functions ("listeners") of events such as a user interaction or a property change. For each type of event supported by a widget there is a matching attribute (JSX) and method (JS) to register a listener. These all start with an `on` prefix, so the `select` event is registered with `onSelect`.

Example:

```jsx
const listener = () => {
  console.log('Button selected!');
}

contentView.append(
  <Button onSelect={listener} />
);

// or ...

contentView.append(
  new Button()
    .onSelect(listener)
);
```

Favor arrow functions over `function` to create listeners, it avoids issues with `this` having unexpected values. A simple wrapper can suffice:

```js
button.onSelect((ev) => this.doSomething(ev));
```

The listener function is called with an instance of [EventObject](./api/EventObject.md) that may include a number of additional properties depending on the event type.

The listener registration method is also an object of the [Listeners](./api/Listeners.md) type that provides additional API for event handling. This is how you de-register a listener again:

```js
button.onSelect.removeListener(listener);
```

### Change Events

All widgets support property change events that are fired when a property value changes. All change events are named after the property with `Changed` as a postfix, e.g. `myValue` fires `myValueChanged`, so listeners can be registered via `onMyValueChanged`.

In addition to the common event properties, [change events](./types.md#propertychangedeventtargettype-valuetype) have a property `value` that contains the new value of the property.

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
button.on('dispose', () => console.log('Button disposed!'));
button.dispose();
```

After a widget has been disposed `isDisposed()` returns `true` while almost all other methods will throw an exception if called.
