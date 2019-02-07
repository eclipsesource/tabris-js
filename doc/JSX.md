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

\* Some properties can also be set by putting the value between the opening and closing tag, like children. For `<TextView>foo</TextView>` sets the `text` property to `'foo'`. Properties that support this are marked as such in the API reference.

> :warning: In TypeScript JSX expressions themselves are type-safe, but their return type is `any`! So be extra careful when you assign them to a variable to give it the proper type.

To add multiple children to an existing parent you group them using `WidgetCollection`:

```jsx
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
```

This is not necessary inside JSX elements:

```xml
<Composite>
  <Button />
  <TextView />
</Composite>
```

## Custom JSX Elements

JSX becomes a lot more powerful when creating your own elements. There are two ways to do this.

### Stateless Functional Components

A "stateless function component" (SFC) is essentially a factory that can be used as an JSX element. This can be any function that fits the following pattern:

* Name starts with an upper case.
* Returns a JSX supported value, e.g. a widget or array of widgets.
* Takes a plain object as the first parameter. (This represents the attributes.)
* Takes am array as the second parameter. (This represents the child elements.)

A SFC that initializes an existing widget with new default values could look like this:

```jsx
const StyledText = properties => <TextView textColor='red' {...properties} />;

// example usage:
contentView.append(<StyledText>Hello World!</StyledText>);
```

In TypeScript you need to give the proper type of the properties object and children:

```tsx
const StyledText = (properties: TextView['jsxProperties']) =>
  <TextView textColor='red' {...properties} />;
```

> :point-right: `TextView['jsxProperties']` resolves to the attributes supported by `TextView`. Explained in the next section.

### Custom Components

Any custom component (a user-defined class extending a built-in widget) can be used as a JSX element right away. The only requirement is that the constructor takes the `properties` object and passes it on to the base class in a `super(properties)` or `set(properties)` call. All attributes are interpreted as either a property or a listener as you would expect.

In TypeScript the attributes that are available on the element are derived from the properties and events of the component:

* All public, writable properties except functions (methods) are valid attributes.
* All events defined via `Listeners` properties are also valid listener attributes.
* All child types accepted by the super type are still accepted.

#### Data Binding

Declarative data binding via JSX is provided by the [`tabris-decorators` extension](http://github.com/eclipsesource/tabris-decorators). Once installed in your project, you can do one-way bindings between a property of your custom component and the property of a child like this:

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

The `tabris-decorators` module also provides two-way bindings and type conversions. The API documentation can be found [here](https://github.com/eclipsesource/tabris-decorators/blob/master/doc/data-binding.md).

#### Adding Special Attributes

In the *rare* case that the above behavior needs to be modified, you can do so by declaring a special (TypeScript-only) property called `jsxProperties`. The *type* of this property defines what JSX attributes are accepted. The value is irrelevant, it should not be assigned to anything.

The following example defines a JSX component that takes a "foo" attribute even though there is no matching property:

```ts
class CustomComponent extends tabris.Composite {

  public jsxProperties: tabris.JSXProperties<this> & {foo: number};

  constructor({foo, ...properties}: tabris.Properties<CustomComponent> & {foo: number}) {
    super(properties);
    console.log(foo);
  }

}
```

The type `JSXProperties<this>` part provides the default behavior for JSX attributes as described above. The second part `{foo: number}` is the additional attribute. In this case it would be a required attribute, but it can be made optional like this: `{foo?: number}`. The constructor properties parameter type should be extended in exactly the same way.

Which elements are accepted as children is determined by a `children` entry of `jsxProperties`. If your custom component does not accept children you could disallow them like this:

```js
class CustomComponent extends tabris.Composite {

  public jsxProperties: tabris.JSXProperties<this> & {children?: never};

}
```