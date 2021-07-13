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
**Apply ruleset**|
Imperative|`new Composite().apply(rules)`
Factory|`Composite({apply: rules})`
JSX|`<Composite><Apply>{rules}</Composite></Apply>`

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

By using [`Setter`](./api/Setter.md#as-jsx-element) any attribute of any element can be set via a separate child element:

```jsx
<Button text='Simple dialog'>
  <Setter target={Button} attribute='onSelect'>
    {() => {
      doSomething();
      doSomething();
    }}
  </Setter>
</Button>
```

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

* [JavaScript/JSX](${doc:functional-jsx-components.jsx})
* [Pure JavaScript](${doc:functional-js-components.js})
* [TypeScript/JSX](${doc:functional-jsx-components-typescript.jsx})
* [Pure TypeScript](${doc:functional-js-components-typescript.js})

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

All widgets have a general-purpose [`data`](./api/Widget.md#data) property that can contain any object. Consequently it can be used with a change listener or the `apply` method for the component to update itself whenever it is changed.

#### Using a change listener

By attaching a property change listener within the component function the component can be modified. Use this if the returned widget has no children.

```jsx
function PersonDataView(attr) {
  return (<TextView {...attr}/>)
    .onDataChanged(ev =>
      ev.target.text = ev.value
        ? `This is now ${ev.value.firstName} ${ev.value.lastName}`
        : ''
    );
}
```

> You can also use the `<Setter>` element to define the change listener as seen [here for JavaScript/JSX](${doc:functional-jsx-components.jsx}) and [here for TypeScript/JSX](${doc:functional-jsx-components-typescript.tsx}).

The usage is as you would expect:

```jsx
// initial value:
contentView.append(
  <PersonView data={new Person('Rogan', 'Joe')}/>
);

// change the person:
$(PersonView).only().data = new Person('Harris', 'Sam');
```

In **TypeScript** we need to do an extra step to keep the type of `data` inside the change event, as it defaults to `any`. You can do this with a runtime check (e.g. `instanceof` or [`checkType`](./api/utils.md#checktypevalue-type-callback)), or by simply declaring the event object type. The runtime check is more verbose, but provides a useful error message in case the type does not match at runtime. The TypeScript compiler alone can not entirely prevent this from happening.

Runtime check:

```tsx
function PersonDataView(attributes: Attributes<Widget, Person>) {
  const widget: TextView = <TextView {...attributes}/>;
  return widget
    .onDataChanged(ev => {
      const person = checkType(ev.value, Person);
      ev.target.text = person
        ? `This is now ${person.firstName} ${person.lastName}`
        : '';
    });
}
```

Declare event object:

```tsx
function PersonDataView(attributes: Attributes<Widget, Person>) {
  const widget: TextView = <TextView {...attributes}/>;
  return widget
    .onDataChanged((ev: PropertyChangedEvent<TextView, Person>) =>
      ev.target.text = person
        ? `This is now ${ev.value.firstName} ${ev.value.lastName}`
        : '';
    );
}
```

#### Using "apply"

The [`apply` method/attribute](./selector.md#compositeapply) can set computed attributes of several widgets simultaneously in response to a property change. This makes is ideal for functional components that consist of a composite with children.

To do this it must be given a callback that return a ruleset that may be derived from the widget's state. When using the `apply` attribute or `<Apply>` element the callback will be invoked whenver the a property changes (as described[here](./api/Observable.md#mutationssource)).

Example in **JavaScript** using the `apply` attribute:

```jsx
function ComposedComponent(attr) {
  return Stack({
    children: [
      TextView({id: 'firstname', background: '#ee9999'}),
      TextView({id: 'lastname', background: '#9999ee'})
    ],
    apply: widget => ({
      '#firstname': {text: widget.data.firstName || ''},
      '#lastname': {text: widget.data.lastName || ''}
    }),
    ...attr
  }, ComposedComponent);
}
```

And in **TypeScript/JSX** using the `<Apply>` element:

```tsx
function ComposedComponent(attr: Attributes<Widget, Person>) {
  return (
    <Stack {...attr}>
      <TextView id='firstname' background='#ee9999'/>
      <TextView id='lastname' background='#9999ee'/>
      <Apply>
        {({data}: Widget<Person>) => [
          Setter(TextView, '#firstname', {text: data.firstName || ''}),
          Setter(TextView, '#lastname', {text: data.lastName || ''})
        ]}
      </Apply>
    </Stack>
  );
}
```

When calling `apply` on the instance a "trigger" event needs to be given explicitly which signals when to invoke the callback. This may be any change event (e.g.   `'onDataChanged'`), or `'*'` for any change event as described above.

This is also the only way to make `apply` react to the few change events types that are not included by `'*'`, specifically `'onBoundsChanged'` or any scrolling related property:

```js
contentView.apply(
  {mode: 'strict', trigger: 'onBoundsChanged'},
  ({bounds}) => (bounds.height > bounds.width) ? {
    '#foo': {layoutData: fooVertical},
    '#bar': {layoutData: barVertical}
  } : {
    '#foo': {layoutData: fooHorizontal},
    '#bar': {layoutData: barHorizontal}
  }
);
```
