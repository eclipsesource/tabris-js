---
---
# EcmaScript 6, TypeScript and JSX

## EcmaScript 6

Tabris.js 2 supports all ES5 and most ES6/ES7 (aka ES2015/ES2016) features without transpilers like Babel. This includes:

 * [Arrow functions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions)
 * [Classes](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes)
 * [const](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/const)
 * [Default parameters](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Default_parameters) (except iOS 9)
 * [Destructuring assignment](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment)
 * [Exponentiation operator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Arithmetic_Operators#Exponentiation_(**))(except iOS 9)
 * [for...of](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/statements/for...of)
 * [Generators](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Iterators_and_Generators#Generators) (except iOS 9)
 * [Iterators](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Iterators_and_Generators#Iterators)
 * [let](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/let)
 * [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)
 * [Methods](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Method_definitions)
 * [Object property shorthands](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer#New_notations_in_ECMAScript_2015)
 * [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)
 * [Reflect](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Reflect) (except iOS 9)
 * [Rest parameters](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/rest_parameters) (except iOS 9)
 * [Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) (except iOS 9)
 * [set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/set) and [get](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get) literals
 * [Set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set)
 * [Spread operator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_operator)
 * [Symbol](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol)
 * [Template literals](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals)
 * [Typed Arrays and ArrayBuffer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Typed_arrays)
 * [WeakMap](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap)
 * [WeakSet](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakSet)

 NOT supported (without transpiling) are:
  * async/await: Use `then` instead.
  * import/export: [Use the `require` function and `exports` object instead](modules.md).

## TypeScript

Tabris.js 2 is optimized for use with TypeScript 2. TypeScript is a <em>type-safe</em> dialect of JavaScript/EcmaScript and also supports <em>ES6 module syntax</em> (`import` and `export` statements) and `async`/`await`. A complete guide to TypeScript can be found at [typescriptlang.org](http://www.typescriptlang.org/docs/home.html). As an IDE we can recommend [Visual Studio Code](https://code.visualstudio.com/) with the [tslint](https://marketplace.visualstudio.com/items?itemName=eg2.tslint) extension, but there are [many suitable TypeScript IDEs](https://github.com/Microsoft/TypeScript/wiki/TypeScript-Editor-Support) out there.

TypeScript files have to be "transpiled" to JavaScript before execution. The compiler is included when generating a new Tabris.js app using the `tabris init` command, so no additional installation step is required. Simply choose `TypeScript App` when given the option. After the app has been generated, type `npm start` to serve the TypeScript code to your Tabris Developer App as JavaScript. In Visual Studio Code you can also use the preconfigured `start` task instead.

As long as the task is still running, changes to your TypeScript code (any `.ts` file in `src`) will be detected by the TypeScript compiler automatically. No restart is needed.

### Stay safe

In TypeScript not all APIs, not even all Tabris.js APIs, are perfectly type safe. It's therefore recommended to follow these general guidelines:

<b>Casting</b>: Avoid explicit casting, as it can fail silently. Use [type guards](http://www.typescriptlang.org/docs/handbook/advanced-types.html#type-guards-and-differentiating-types) instead.

<b>Implicit "any"</b>: In TypeScript a value of the type `any` is essentially the same as a JavaScript value. The compiler will accept any actions on this value, including assigning it to typed variables. An implicit `any` may occur if
you do not give a type for a variable, field or parameter, and none can be inferred by assignment. <em>Always give the type of function parameters. Fields and variables are safe only if they are assigned a value on declaration</em>.

<b>Widget event handling:</b> Do not use `widget.on(event, handler)`. Instead, use `widget.on({event: handler})`.

<b>Widget apply method:</b> Use `widget.apply` <em>only</em> to set properties of the base `Widget` class, like `layoutData`.

<b>Selector API and WidgetCollection:</b> By default the widget methods `find`, `children`, `sibling` return a "mixed" WidgetCollection. This means you would have to do a type check and cast to safely retrieve a widget from the collection. However, you can also use widget classes (constructors) as selectors, which results in a collection that TypeScript "knows" to only have instances of that type. In that case no cast will be necessary. Example: `widget.children(Button).first('.myButton')` returns a button (or null), but nothing else. It should be noted that the `set` method of such a WidgetCollection is still not type-aware. You can use the `forEach` method instead to safely set properties for all widgets in the collection.

<b>NPM modules:</B> The `tabris` module is automatically type-safe, but the same is not true for all modules that can be installed via `npm`. You may have to <em>[manually install declaration files](http://www.typescriptlang.org/docs/handbook/declaration-files/consumption.html)</em> for each installed npm module.

### Interfaces

When used in TypeScript the tabris module exports the following interfaces used by the specific widget properties:
 * [`Image`](./types.md#image)
 * [`Color`](./types.md#color)
 * [`Font`](./types.md#font)
 * [`LayoutData`](./types.md#layoutData)
 * [`Bounds`](./types.md#bounds)
 * [`Transformation`](./types.md#transformation)
 * [`margin`](./types.md#margin)
 * [`dimension`](./types.md#dimension)
 * [`offset`](./types.md#offset)
 * [`BoxDimensions`](./types.md#boxdimensions)
 * [`ImageData`](./types.md#imagedata)
 * [`Selector`](./types.md#selector) 
 * [`AnimationOptions`](./types.md#animationoptions)

You may want to use these for your own custom UI component properties:

```ts
import {Composite, Color} from 'tabris';

class MyCustomButton extends Composite {

  /* ... constructor, etc ... */

  public set textColor(value: Color) {
    this.internalLabel.textColor = value;
  }

}
```

The tabris module also exports the following event object types:

 * [`EventObject<T>`](./api/EventObject.md) class, where `T` is the type of the `target` event property. Used for events that have no type-specific properties and also the basis for all other event interfaces.
 * [`PropertyChangedEvent<T, U>`](./types.md#propertychangedevent) interface, where `T` is the type of the `target` property and `U` is the type of the `value` property. Used for all events matching the naming scheme `{propertyName}Changed`, e.g. `BackgroundChanged`.
 * *Target-specific events* following the naming scheme `{TargetType}{EventName}Event`, for example `PickerSelectEvent`.

These can be used to define listeners outside as class members:

```ts
import {Composite, Picker, PickerSelectEvent} from 'tabris';

class MyCustomForm extends Composite {

  constructor() {
    super();
    /* .... */
    new Picker()
      .appendTo(this)
      .on({select: this.handlePickerSelect});
  }

  private handlePickerSelect(ev: PickerSelectEvent) {
    /* .... */
  }

}
```

You can also directly create instances of `EventObject` (since it's a class, not an interface) and use them to trigger events that have no type-specific properties, and you can use it as a base for event objects that have additional properties, such as change events.

Interfaces relating to `set`, `get` and the constructor `properties` parameters:
* `{TargetType}Properties` interface, e.g. `CompositeProperties`
* `Properties<T extends NativeObject>`
* `Partial<T extends NativeObject, U extends keyof T>`

These interfaces can be used to extend the properties accepted by the `set` and `get` methods, as well as those supported by the constructor of your own class. Let's look at a simple constructor first:

```ts
import {Composite, CompositeProperties} from 'tabris';

class MyCustomForm extends Composite {

  constructor(properties?: CompositeProperties) {
    super(properties);
    /* .... */
  }

}
```

This just makes your class accept all properties of the class it extends (`Composite`). For every built-in widget, there is a matching **properties interface** (`CompositeProperties` in this case) that can be used in this way.

The special interface `Properties` provides a generic way to reference the properties interface belonging to a widget. Thus, the above can also be written as:

```ts
import {Composite, Properties} from 'tabris';

class MyCustomForm extends Composite {

  constructor(properties?: Properties<MyCustomForm>) {
    super(properties);
    /* .... */
  }

}
```

In order to make `set`, `get` and the constructor (if declared as above) accept the properties added in your class, the properties interface of your class must be extended. This can be done by overriding a special property called `tsProperties` and extending its type. For this we are using the properties interface for the super class and *the Tabris' version* of the `Partial` interface. For example, let's add properties `foo` and `bar` to a custom component:

```ts
import {Composite, Partial, Properties} from 'tabris';

class MyCustomForm extends Composite {

  public tsProperties: Properties<Composite> & Partial<this, 'foo' | 'bar'>;

  // initializing plain properties is a must for "super" and "set" to work as a expected.
  public foo: string = null;
  public bar: number = null;

  constructor(properties?: Properties<MyCustomForm>) {
    super(properties);
  }

}
```
> :point_right: Instead of `Properties<Composite>` you can also use `CompositeProperties` in this example. Do NOT use `Properties<MyCustomForm>` to define `tsProperties` (it creates a circular reference).

> :point_right: If you add a property to your class, but not to `tsProperties`, you can still access it directly (i.e. `instance.foo`), but not in `set`, `get` or the constructor. Also, you can of course extend (or completely exchange) the interface used by the constructor, for example to define constructor arguments that are not settable public properties. An example for this can be found in [this snippet](https://github.com/eclipsesource/tabris-js/blob/master/examples/input-tsx/input.tsx)

> :point_right: 
*How does this Work?* The generic `Properties<T>` interface references the type of `tsProperties` on `T`. The `set` and `get` methods use the interface `Properties<this>`, thereby always referencing `tsProperties`. (The actual value of the `tsProperties` property is not relevant to this mechanism - it is always `undefined`.) In the above examples `tsProperties` is overwritten using `&` to extend the properties interface of the super class  with selected properties of your own class. In the `Partial<T, U>` interface `U` is a TypeScript string union type that is used to filter the properties of `T`. Both of these "special" interfaces use a TypeScript technique known as "mapped types".

Finally, there are the `{TargetType}Events` interfaces, e.g. `CompositeEvents`. These are used by the [`on`](./api/NativeObject.md#on) and [`off`](./api/NativeObject.md#off) methods. You may want to extend them to define your own `on`/`off` methods when extending widget classes.

## JSX

JSX is an extension to the JavaScript/TypeScript syntax that allows mixing code with XML-like declarations. Tabris 2 supports <em>type-safe JSX</em> out of the box with any TypeScript based project. All you have to do is name your files `.tsx` instead of `.ts`. You can then use JSX expressions to create widgets. For example...

```jsx
ui.contentView.append(
  <composite left={0} top={0} right={0} bottom={0}>
    <button centerX={0} top={100} text='Show Message' onSelect={handleButtonSelect}/>
    <textView centerX={0} top='prev() 50' font='24px'/>
  </composite>
);
```

...is the same as...

```js
ui.contentView.append(
  new Composite({left: 0, top: 0, right: 0, bottom: 0}).append(
    new Button({centerX: 0, top: 100, text: 'Show Message'}).on({select: handleButtonSelect}),
    new TextView({centerX: 0, top: 'prev() 50', font: '24px'})
  )
);
```

JSX in Tabris.js TypeScript apps follows these specific rules:
 * Every JSX element is a constructor call. If nested directly in code, they need to be separated from each other (see below).
 * Element names starting lowercase are intrinsic elements. These include all instantiable widget build into Tabris.js, as well as `WidgetCollection`. The types of these elements don't need to be explicitly imported.
 * Element names starting with uppercase are user defined elements, i.e. any class extending a Tabris.js widget. These <em>do</em> need to be imported.
 * Attributes can be either strings (using single or double quotation marks) or JavaScript/TypeScript expressions (using curly braces).
 * An attribute of the same name as a property is used to set that property via constructor.
 * An attribute that follows the naming scheme `on{EventType}` is used to register a listener with that event.
 * Each element may have any number of child elements (if that type supports children), all of which are appended to their parent in the given order. An element that has a `text` attribute may also use plain text a child element, e.g. `<textView>Hello</textView>`.
 * While the JSX expressions themselves are type-safe, <em>their return type is not</em> (it's `any`), so follow the instructions for casting above. It can be considered safe to use unchecked JSX expressions within `widget.append()`, as all JSX elements are appendable types.

Note that this is <em>not</em> valid:

```jsx
ui.contentView.append(
  <button centerX={0} top={100} text='Show Message'/>
  <textView centerX={0} top='prev() 50' font='24px'/>
);
```

JSX elements that are nested directly in code must be separated like any expression, in this case by a comma:

```jsx
ui.contentView.append(
  <button centerX={0} top={100} text='Show Message'/>,
  <textView centerX={0} top='prev() 50' font='24px'/>
);
```

To avoid this, you may wrap your widgets in a `WidgetCollection`. This example has the same effect as the previous:

```jsx
ui.contentView.append(
  <widgetCollection>
    <button centerX={0} top={100} text='Show Message'/>
    <textView centerX={0} top='prev() 50' font='24px'/>
  </widgetCollection>
);
```

To support your own attributes on a user defined element, add a field on your custom widget called `jsxProperties`. The *type* of the field defines what attributes are accepted. (The assigned value is irrelevant.) It should be an interface that includes some or all properties supported by the object. It can also include fields for listeners following the naming scheme `on{EventType}`. To support all JSX attributes of the super class as well, extend the corresponding interface exported by the JSX namespace.

An example with a new property `foo` and a matching change event would look like this:

```ts
import {Composite, CompositeProperties, EventObject, ui} from 'tabris';

type MyViewProperties = { foo?: string; };

class MyView extends Composite implements MyViewProperties {

  private jsxProperties: JSX.CompositeProperties & MyViewProperties & {
    onFooChanged?: (ev: EventObject<MyView> & {value: string}) => void;
  };

  private _foo: string = '';

  constructor(properties: CompositeProperties & MyViewProperties) {
    super(properties);
  }

  public set foo(value: string) {
    if (this._foo !== value) {
      this._foo = value;
      this.trigger('fooChanged', Object.assign(new EventObject(), {value}));
    }
  }

  public get foo() {
    return this._foo;
  }

}
```

The result can be used like this:

```jsx
ui.contentView.append(
  <MyView foo='Hello' onFooChanged={({value}) => console.log(value)} />
);
```


### JSX without TypeScript

If you want to use JSX without writing TypeScript, you can still use the TypeScript compiler to convert your `.jsx` files to `.js`. Simply generate a TypeScript app and add an entry `"allowJs": true` in the `compilerOptions` object of `tsconfig.json`. Then change the filenames in the `include` object from `.ts` and `.tsx` to `.js` and `.jsx`. You may also have to adjust your linter setup, if you use any.
