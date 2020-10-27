---
---
# Declarative UI

In the context of Tabris.js, "Declarative UI" refers to a set of APIs and syntaxes that define application UI in a more compact and expressive way than using exclusively imperative code. Specifically, it allows creating UI elements, setting their properties, attaching listeners and adding children. It does *not necessarily* imply UIs declared in separate files, proprietary file formats, reactive patterns or data binding.

## Flavors

Tabris.js offers two options when it comes to declarative UI:

**JSX:**

JSX is a proprietary extension to the JavaScript/TypeScript syntax that allows mixing code with XML-like declarations. Tabris.js 3 supports JSX syntax out of the box in `.jsx` and `.tsx` files with any TypeScript compiler based projects. The only requirement is that in `tsconfig.json` the `jsx` property is set to `"react"` and `jsxFactory` to `"JSX.createElement"`.

JSX is the more powerful and flexible option, especially combined with [decorators](./databinding/index.md).

**Widget Factories:**

Introduced in Tabris.js 3.6, widget factories are mainly intended to be a pure JavaScript alternative to the JSX setup that does not require a proprietary compiler. However, it *can* be used in TypeScript in case it's the preferred syntax, and it is also slightly more type-safe than JSX since the type of the elements do not resolve to `any`.

A widget factory is technically any function that returns a widget (which would include [functional components](#functional-components)), but in the context of this article it specifically refers to a widget constructor that can be called without `new`. When used in that manner the function will allow addition creation arguments ("attributes"), just like JSX elements.

Unlike JSX this option does currently not feature a databinding extension, and it is not applicable to dialogs.

## Comparison

Consult the following table to get an overview of how imperative UI, JSX and widget factories differ in syntax:

Action | Example
-|-
**Create an instance**|
Imperative|`new TextView()`
Factory|`TextView()`
JSX|`<TextView />`
**Set a string property**|
Imperative|`new TextView({text: 'foo'})`
Factory|`TextView({text: 'foo'})`
JSX|`<TextView text='foo' />`
**Set non-string property**|
Imperative|`new TextView({elevation: 3})`
Factory|`TextView({elevation: 3})`
JSX|`<TextView elevation={3} />`
**Set property to true**|
Imperative|`new TextView({markupEnabled: true})`
Factory|`TextView({markupEnabled: true})`
JSX|`<TextView markupEnabled />`
**Register listener**|
Imperative|`new TextView().onResize(cb)`
Factory|`TextView({onResize: cb})`
JSX|`<TextView onResize={cb} />`
**Set properties object**|
Imperative|`new TextView(props)`
Factory|`TextView(props)`
JSX|`<TextView {...props} />`
**Mix in properties object**|
Imperative|`new TextView({text: 'foo', ...props})`
Factory|`new TextView({text: 'foo', ...props})`
JSX|`<TextView text='foo' {...props} />`
**Add new children**|
Imperative|`new Composite().append(new TextView())`
Factory|`Composite({children: [TextView()]})`
JSX|`<Composite><TextView /></Composite>`
**Add existing children**|
Imperative|`new Composite().append(children)`
Factory|`Composite({children})`
JSX|`<Composite>{children}</Composite>`


> :point_right: Listeners registered via declarative UI become "attached" listeners. There can only ever be one attached listener per type on each widget. This is rarely a relevant difference, with one exception: The [`apply`](#using-apply) method also registers "attached" listeners, meaning it can de-register any listener that was registered with JSX or factory API to register a new one.

## JSX specifics

In JSX, some properties can also be set by putting the value as the content of the element, like children. The value must be put in curly braces, except strings and markup, which can be inlined directly.

Most commonly this sets the `text` property. Examples:

JavaScript/TypeScript | JSX
---|---
`new TextView({text: fooVar})`|`<TextView>{fooVar}</TextView>`
`new TextView({text: 'foo'})`|`<TextView>{'foo'}</TextView>`
`new TextView({text: 'foo'})`|`<TextView>foo</TextView>`
`new TextView({text: '<b>bar/b>'})`|`<TextView><b>bar</b></TextView>`
`new TextView({text: 'bar ' + foo})`|`<TextView>bar {foo}</TextView>`

Properties that support this are always marked as such in the API reference.

> :warning: In TypeScript JSX expressions themselves are type-safe, but their return type is `any`! So be extra careful when you assign them to a variable to give it the proper type.

To add multiple children to an existing parent you group them using `WidgetCollection` or `$`:

```jsx
import {contentView, Button, TextView, WidgetCollection, $} from 'tabris';

// JavaScript/TypeScript:
contentView.append(
  new Button(),
  new TextView()
);

// JSX:
contentView.append(
  <WidgetCollection>
    <Button />
    <TextView />
  </WidgetCollection>
);

// <$> can be used as a shortcut of <WidgetCollection>
contentView.append(
  <$>
    <Button />
    <TextView />
  </$>
);
```

This is not necessary inside JSX elements:

```xml
<Composite>
  <Button />
  <TextView />
</Composite>
```

The `<$>` element can also create multiline strings:

```jsx
/** @type {string} **/
const str =
  <$>
    This is some very long text
    across multiple lines
  </$>
);
contentView.append(<TextView>{str}</TextView>);
```

The line breaks and indentions will not become part of the final string.

## Custom Components

A custom component is any user-defined class extending a built-in widget. They can be used in a declarative UI expression as well as long as the constructor takes a `properties` object and passes it on to the base class in a `this.set(properties)` call. The creation attributes that are available on the element are derived from the properties and events of the component:

* All public properties except functions (methods) are valid attributes.
* All events defined via `Listeners` properties are also valid listener attributes.
* All child types accepted by the super type are still accepted.

Any such component can be used as a JSX element right away.

### asFactory

To be used as a factory it needs to passed through the [`asFactory`](./api/utils.md#asfactoryconstructor) method first:

Plain **JavaScript**:
```js
exports.ExampleComponent = asFactory(ExampleComponent);
```

In the ES6 module system the class needs to be renamed on export:
```js
export const ExampleComponent = asFactory(ExampleComponentBase);
```

In **TypeScript** the type needs to be exported separately. By using a namespace a rename can be avoided:
```ts
namespace internal {

  @component
  export class ExampleComponent extends Composite {
    // ...
  }

}

export const ExampleComponent = asFactory(internal.ExampleComponent);
export type ExampleComponent = internal.ExampleComponent;
```

### Data Binding

> :point_right: Data binding currently only works with **JSX**.

Declarative data binding via JSX is provided by the [`tabris-decorators` extension](./databinding/index.md). Once installed in your project, you can do [one-way bindings](./databinding/@component.md) between a property of your custom component and the property of a child like this:

```tsx
@component
class CustomComponent extends Composite {

  @property public myText: string = 'foo';

  constructor(properties: CompositeProperties) {
    super(properties);
    this.append(
      <TextView bind-text='myText'/>
    );
  }

}
```

The `tabris-decorators` module also provides [two-way bindings](./databinding/@bind.md).

### Dialogs

> :point_right: This is a **JSX**-only feature.

Dialogs can be created via JSX-syntax as well. This should be combined with the dialogs dedicated, static "open" method:

```js
AlertDialog.open(
  <AlertDialog title='Warning' buttons={ {ok: 'OK'} }>
    You have been logged out
  </AlertDialog>
);
```

### Adding Special Attributes

In the *rare* case that the element API needs to be modified, you can do so by declaring a special (**TypeScript**-only) property called `jsxAttributes`. The *type* of this property defines what attributes are accepted. The property may *NOT* be assigned a value.

> :point_right: Despite the name `jsxAttributes` is also affecting widget factories.

The following example defines a JSX component that takes a "foo" attribute even though there is no matching property:

```ts
class CustomComponent extends tabris.Composite {

  public jsxAttributes: tabris.JSXAttributes<this> & {foo: number};

  constructor({foo, ...properties}: tabris.Properties<CustomComponent> & {foo: number}) {
    super(properties);
    console.log(foo);
  }

}
```

The type `JSXAttributes<this>` provides the default behavior for creation attributes as described above. The second part `{foo: number}` is the additional attribute. In this case it would be a required attribute, but it can be made optional like this: `{foo?: number}`. The constructor properties parameter type should be extended in exactly the same way.

Which elements are accepted as children is determined by a `children` entry of `jsxAttributes`. If your custom component does not accept children you could disallow them like this:

```js
class CustomComponent extends tabris.Composite {

  public jsxAttributes: tabris.JSXAttributes<this> & {children?: never};

}
```

### Functional Components

A functional component is a function that can be used as a JSX element or plain widget factory. Such a function needs to fulfill the following requirements:

* Name starts with an upper case.
* Takes an "attributes" object as the first parameter.
* Returns a widget, WidgetCollection or array of widgets.

Typically a functional component passes on some or all of the given attributes to the widget it returns:

```jsx
const StyledText = attributes => <TextView textColor='red' {...attributes} />;
contentView.append(<StyledText>Hello World!</StyledText>);
```

Or in pure **JavaScript**:
```js
const StyledText = attributes => TextView({textColor: 'red', ...attributes});
contentView.append(StyledText({text: 'Hello World'}));
```

If a JSX element has children (everything within the element's body) they are mapped to the attribute "children". Therefore `<Foo><Bar/></Foo>` is treated like `<Foo children={<Bar/>}/>`.

In **TypeScript** (`.tsx` files) you need to give the proper type of the attributes object:

```tsx
const StyledText = (attributes: Attributes<TextView>) =>
  <TextView textColor='red' {...attributes} />;
```

```ts
const StyledText = (attributes: Attributes<TextView>) =>
  TextView({textColor: 'red', ...attributes});
```

> :point_right: The Attributes interface needs to be imported from `'tabris'`

If your IDE understands jsDocs with TypeScript types you can also do this in **JavaScript/JSX** files:

```jsx
/** @param {Attributes<TextView>=} attributes */
const StyledText = attributes => <TextView textColor='red' {...attributes} />;
```

```js
/** @param {Attributes<TextView>=} attributes */
const StyledText = attributes => TextView({textColor: 'red', ...attributes});
```

A function that is used a JSX-based functional component can also be used as a selector, as can its name:

```jsx
contentView.find(StyledText).first() === contentView.find('StyledText').first();
```

**However**, this does not work out-of-the-box when using factory API. In this case you must associate the function itself with the widget it creates. This is done by passing it as the second parameter of the factory call:

```js
/** @param {Attributes<TextView>=} attributes */
const StyledText = attributes => TextView({textColor: 'red', ...attributes}, StyledText);
```

You can find further example snippets for functional components here:

* [JavaScript/JSX](https://playground.tabris.com/?snippet=functional-jsx-components.jsx)
* [Pure JavaScript](https://playground.tabris.com/?snippet=functional-js-components.js)
* [TypeScript/JSX](https://playground.tabris.com/?snippet=functional-jsx-components-typescript.tsx)
* [Pure TypeScript](https://playground.tabris.com/?snippet=functional-js-components-typescript.tsx)

There are two categories of functional components, stateless and dynamic:

### Stateless Functional Components

A "stateless function component" (SFC) is a functional component that does not add any behavior to the widgets it creates, it has not any state of its own. The most common use case for this is to create an alias for a built-in widget with different defaults such as specific fonts or colors, as seen in the above examples. This is also be called a styled component.

A SFC may also be used to display static data passed as an additional creation attribute. Since there is no consistent way to update the data the component is still considered "stateless". This is also called a static component.

This additional attribute can be conveniently extracted from the rest via parameter destructuring. Here is an easy example using a model Class `Person` which has the properties `firstName` and `lastName`:

```jsx
/** @param {tabris.Attributes<tabris.Widget> & {person: Person}} attributes */
function StaticComponent({person, ...other}) {
  return (
    <TextView {...other}>
      This is always {person.firstName} {person.lastName}
    </TextView>
  );
}
```

### Dynamic Functional Components

All widgets have a general-purpose "data" property that can contain any object. Consequently it can be used to store state on would otherwise be considered a stateless or static component. Using a change listener or the `apply` method the component can then update itself whenever `data` changes.

#### Using a change listener

By attaching a property change listener within the component function the component can be modified. Use this if the returned widget has no children.

Special care has to be taken to ensure the change listener is called for the initial value: If the property is set before the listener is attached it won't work.

```jsx
function PersonView({data, ...other}) {
  return (<TextView {...other}/>)
    .onDataChanged(ev =>
      ev.target.text = ev.value
        ? `This is now ${ev.value.firstName} ${ev.value.lastName}`
        : ''
    )
    .set({data}); // set data last!
}
```

The usage is as you would expect:

```jsx
// initial value:
contentView.append(
  <PersonView data={new Person('Rogan', 'Joe')}/>
);

// change the person:
$(PersonView).only().data = new Person('Harris', 'Sam');
```

In TypeScript we need to do some casting to stay type-safe. You can do this with an `instanceof` check or using the [`checkType`](./api/utils.md#checktypevalue-type-callback) utility function:

```tsx
type PersonDataAttr = Attributes<Widget> & {data: Person};
function PersonView(attributes: PersonDataAttr) {
  const {data, ...other} = attributes;
  const widget: TextView = <TextView {...other}/>;
  return widget
    .onDataChanged(ev => {
      const person = checkType(ev.value, Person, {nullable: true});
      ev.target.text = person
        ? `This is now ${person.firstName} ${person.lastName}`
        : '';
    })
    .set({data});
}
```

In Visual Studio Code JsDoc can do the same for **JavaScript**:

```jsx
/** @param {tabris.Attributes<tabris.Widget> & {data: Person}} attributes */
function PersonView({data, ...other}) {
  /** @type {TextView} */
  const widget = <TextView {...other}/>;
  return widget
    .onDataChanged(ev => {
      const person = checkType(ev.value, Person, {nullable: true});
      ev.target.text = person
        ? `This is now ${person.firstName} ${person.lastName}`
        : '';
    })
    .set({data});
}
```

#### Using "apply"

The [`apply` method](./selector.md#compositeapply) can set properties of several widgets simultaneously in response to a property change. This makes is ideal for functional components that consist of a composite with children.

By default `apply` just sets properties once for each given child selector. To make it re-apply them every time `data` changes we must define the `dataChanged` event as a "trigger". This is done in a options object preceding a callback that returns the selector/properties object ("ruleset"):

```jsx
function PersonView(attributes) {
  return (
    <Composite {...attributes}>
      <TextView id='label'/>
    </Composite>
  ).apply({trigger: 'onDataChanged'}, ({data}) => ({
    '#label': {
      text: data instanceof Person
        ? `This is now ${data.firstName} ${data.lastName}`
        : ''
    }
  }));
}
```

Notice that with this pattern the `data` property can also be `null` *or* [an empty object](./api/Widget.md#data) the first `apply` sets the text property of '#label'.

In **TypeScript** some casting is needed. To improve type-safety it's recommended to use apply in "strict" mode and the ["Setter" helper function](./api/Setter.md):

```tsx
type PersonDataAttr = Attributes<Widget> & {data: Person};
function PersonView(attr: PersonDataAttr) {
  ((
    <Composite {...attr}>
      <TextView id='label'/>
    </Composite>
  ) as Composite).apply({mode: 'strict', trigger: 'onDataChanged'}, ({data}) => ({
    '#label': Setter(TextView, {
      text: data instanceof Person
        ? `This is now ${data.firstName} ${data.lastName}`
        : ''
    })
  }));
}
```

And the same in pure **JavaScript**:
```js
/** @param {tabris.Attributes<tabris.Widget> & {data: Person}} attr */
function PersonView(attr) {
  const children = [TextView({id: 'label'})];
  return Composite({children, ...attr}, PersonView)
    .apply({mode: 'strict', trigger: 'onDataChanged'}, ({data}) => ({
      '#label': Setter(TextView, {
        text: data instanceof Person
          ? `This is now ${data.firstName} ${data.lastName}`
          : ''
      })
    }));
}
```
