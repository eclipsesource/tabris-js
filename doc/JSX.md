---
---
# JSX

JSX is a proprietary extension to the JavaScript/TypeScript syntax that allows mixing code with XML-like declarations. Tabris 3 supports JSX out of the box in `.jsx` and `.tsx` files with any TypeScript compiler based projects. The only requirement is that in `tsconfig.json` the
`jsx` property is set to `"react"` and `jsxFactory` to `"JSX.createElement"`.

## Usage

In Tabris, JSX is used to create UI elements in a declarative manner. Every constructor for a Widget, WidgetCollection or Popup based class can be used as an JSX element.

Action | JavaScript/TypeScript | JSX
---|---|---
Create an instance|`new TextView()`|`<TextView />`
Set a string property*|`new TextView({text: 'foo'})`|`<TextView text='foo' />`
Set non-string property*|`new TextView({elevation: 3})`|`<TextView elevation={3} />`
Set property to true|`new TextView({markupEnabled: true})`|`<TextView markupEnabled />`
Register listener|`new TextView().onResize(cb)`|`<TextView onResize={cb} />`
Set properties object|`new TextView(props)`|`<TextView {...props} />`
Mix in properties object|`new TextView({text: 'foo', ...props})`|`<TextView text='foo' {...props} />`
Add new children|`new Composite().append(new TextView())`|`<Composite><TextView /></Composite>`
Add existing children|`new Composite().append(children)`|`<Composite>{children}</Composite>`

Some properties can also be set by putting the value between the opening and closing tag, like children. The value must be put in curly braces, except strings and markup, which can be inlined directly.

Most commonly this sets the `text` property. Examples:

JavaScript/TypeScript | JSX
---|---
`new TextView({text: foo})`|`<TextView>{foo}</TextView>`
`new TextView({text: 'foo'})`|`<TextView>{'foo'}</TextView>`
`new TextView({text: 'foo'})`|`<TextView>foo</TextView>`
`new TextView({text: '<b>bar/b>'})`|`<TextView><b>bar</b></TextView>`
`new TextView({text: 'bar ' + foo})`|`<TextView>bar {foo}</TextView>`

Properties that support this are always marked as such in the API reference.

> :warning: In TypeScript JSX expressions themselves are type-safe, but their return type is `any`! So be extra careful when you assign them to a variable to give it the proper type.

To add multiple children to an existing parent you group them using `WidgetCollection` or `$`:

```jsx
import {contentView, Button, TextView, WidgetCollection, $};

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

## Custom JSX Elements

JSX becomes a lot more powerful when creating your own elements. There are two ways to do this.

### Stateless Functional Components

A "stateless function component" (SFC) is essentially a factory that can be used as an JSX element. This can be any function that fits the following pattern:

* Name starts with an upper case.
* Returns a JSX supported value, e.g. a widget or array of widgets.
* Takes a plain object as the first parameter. (This contains the attributes and children.)

A SFC that initializes an existing widget with new default values could look like this:

```jsx
const StyledText = attributes => <TextView textColor='red' {...attributes} />;

// example usage:
contentView.append(<StyledText>Hello World!</StyledText>);
```

If the element has children (everything within the element's body) they are mapped to the attribute "children". Therefore `<Foo><Bar/></Foo>` is treated like `<Foo children={<Bar/>}/>`.

In TypeScript (`.tsx` files) you need to give the proper type of the attributes object:

```tsx
const StyledText = (attributes: Attributes<TextView>) =>
  <TextView textColor='red' {...attributes} />;
```

> :point-right: The Attributes interface needs to be imported from `'tabris'`

If your IDE understands jsDocs wit TypeScript types you can also do this in `.jsx` files:
```jsx
/** @param {Attributes<TextView>=} attributes */
const StyledText = attributes => <TextView textColor='red' {...attributes} />;
```

A function that was used as a SFC can also be used as a selector, as can its name:

```jsx
console.log(contentView.find(StyledText).first() === contentView.find('StyledText').first());
```

See example snippets for SFCs [here](https://playground.tabris.com/?snippet=function-jsx-components.jsx) for JavaScript and [here](https://playground.tabris.com/?snippet=function-jsx-components-typescript.tsx) for TypeScript.

### Dynamic Functional Components

All widgets have a general-purpose "data" property that can contain any object. Consequently it can be used to store state on what is otherwise a [stateless functional component](#statelessfunctionalcomponents). By attaching a property change listener within the component function the component (or any of its children) can be modified. Special care has to be taken to ensure the change listener is called for the initial value: If the property is set before the listener is attached it won't work.

Here is an easy example using a model Class `Person` which has the properties `firstName` and `lastName`:

```jsx
function PersonView({data, ...other}) {
  return (<TextView {...other}/>)
    .onDataChanged(ev =>
      ev.target.text = ev.value ? `This is now ${ev.value.firstName} ${ev.value.lastName}` : ''
    )
    .set({data}); // do this last!
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

In TypeScript we need to cast the TextView and the change event value to stay type-safe. The [`checkType`](./api/utils.md#checktypevaluetypecallback) utility function can be used to do this implicitly:

```tsx
type PersonDataAttr = Attributes<Widget> & {data: Person};
function PersonView(attributes: PersonDataAttr) {
  const {data, ...other} = attributes;
  const widget: TextView = <TextView {...other}/>;
  return widget
    .onDataChanged(ev => {
      const person = checkType(ev.value, Person, {nullable: true});
      ev.target.text = person ? `This is now ${person.firstName} ${person.lastName}` : '';
    })
    .set({data}); // needs to be set last to trigger the first chang event
}
```

Using JsDoc and `checkType` we also can achieve type-safety in JavaScript:

```jsx
/** @param {tabris.Attributes<tabris.Widget> & {data: Person}} attributes */
function PersonView({data, ...other}) {
  /** @type {TextView} */
  const widget = <TextView {...other}/>;
  return widget
    .onDataChanged(ev => {
      const person = checkType(ev.value, Person, {nullable: true});
      ev.target.text = person ? `This is now ${person.firstName} ${person.lastName}` : '';
    })
    .set({data}); // needs to be set last to trigger the first chang event
}
```

You can see variants of these examples in action [here](https://playground.tabris.com/?snippet=function-jsx-components.jsx) for JavaScript and [here](https://playground.tabris.com/?snippet=function-jsx-components-typescript.tsx) for TypeScript.

### Custom Components

Any custom component (a user-defined class extending a built-in widget) can be used as a JSX element right away. The only requirement is that the constructor takes the `properties` object and passes it on to the base class in a `super(properties)` or `set(properties)` call. All attributes are interpreted as either a property or a listener as you would expect.

In TypeScript the attributes that are available on the element are derived from the properties and events of the component:

* All public, writable properties except functions (methods) are valid attributes.
* All events defined via `Listeners` properties are also valid listener attributes.
* All child types accepted by the super type are still accepted.

#### Data Binding

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

#### Adding Special Attributes

In the *rare* case that the above behavior needs to be modified, you can do so by declaring a special (TypeScript-only) property called `jsxAttributes`. The *type* of this property defines what JSX attributes are accepted. The value is irrelevant, it should not be assigned to anything.

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

The type `JSXAttributes<this>` part provides the default behavior for JSX attributes as described above. The second part `{foo: number}` is the additional attribute. In this case it would be a required attribute, but it can be made optional like this: `{foo?: number}`. The constructor properties parameter type should be extended in exactly the same way.

Which elements are accepted as children is determined by a `children` entry of `jsxAttributes`. If your custom component does not accept children you could disallow them like this:

```js
class CustomComponent extends tabris.Composite {

  public jsxAttributes: tabris.JSXAttributes<this> & {children?: never};

}
```
