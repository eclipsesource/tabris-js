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

<b>Widget property access:</b> Do <em>not</em> use `widget.set(key, value)` or `widget.get(key)`. Instead access properties <em>directly</em> like this: `widget.key = value`. You can also safely <em>use property objects</em>: like `widget.set({key: value})` and `new Widget({key: value})`.

<b>Widget event handling:</b> Do not use `widget.on(event, handler)`. Instead, use `widget.on({event: handler})`.

<b>Widget apply method:</b> Use `widget.apply` <em>only</em> to set properties of the base `Widget` class, like `layoutData`.

<b>Selector API and WidgetCollection:</b> By default the widget methods `find`, `children`, `sibling` return a "mixed" WidgetCollection. This means you would have to do a type check and cast to safely retrieve a widget from the collection. However, you can also use widget classes (constructors) as selectors, which results in a collection that TypeScript "knows" to only have instances of that type. In that case no cast will be necessary. Example: `widget.children(Button).first('.myButton')` returns a button (or null), but nothing else. It should be noted that the `set` method of such a WidgetCollection is still not type-aware. You can use the `forEach` method instead to safely set properties for all widgets in the collection.

<b>NPM modules:</B> The `tabris` module is automatically type-safe, but the same is not true for all modules that can be installed via `npm`. You may have to <em>[manually install declaration files](http://www.typescriptlang.org/docs/handbook/declaration-files/consumption.html)</em> for each installed npm module.

### Interfaces

When used in TypeScript the tabris module exports interfaces used by the tabris API. These are:

 * Property/parameter types: [`Image`](./types.md#image), [`Color`](./types.md#color), [`Font`](./types.md#font), [`LayoutData`](./types.md#layoutData), [`Bounds`](./types.md#bounds), [`Transformation`](./types.md#transformation), [`margin`](./types.md#margin), [`dimension`](./types.md#dimension), [`offset`](./types.md#offset), [`BoxDimensions`](./types.md#boxdimensions),  [`ImageData`](./types.md#imagedata), [`Selector`](./types.md#selector) and [`AnimationOptions`](./types.md#animationoptions)
 * The change event object: [`PropertyChangedEvent<T, U>`](./types.md#propertychangedevent), where `T` is the type of the `target` event property and `U` is the type of the `value` property. Used for all events matching the naming scheme `{propertyName}Changed`, e.g. `BackgroundChanged`.
 * Special event objects: Some events use specific interfaces that follow the naming scheme `{TargetType}{EventName}Event`, e.g. `PickerSelectEvent`. You may want to use those to define listeners that do not use parameter destructuring.
 * Property maps: These are the interfaces used by the [`set`](./api/NativeObject.md#set) method and widget constructors. You may want to extend them to define your own property maps when extending widget classes. They follow the naming scheme `{TargetType}Properties`, e.g. `CompositeProperties`.
 * Listener maps: These are the interfaces used by the [`on`](./api/NativeObject.md#on) and [`off`](./api/NativeObject.md#off) methods. You may want to extend them to define your own listener maps when extending widget classes. They follow the naming scheme `{TargetType}Events`, e.g. `CompositeEvents`.

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
 * Each element may have any number of children (if that type supports children), all of which are appended to their parent in the given order.
 * To support attribute checks on user defined elements, add a field on your custom widget called `jsxProperties`. The type <em>must</em> match the type of the first constructor parameter. You do not have to assign anything to the field.
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

### JSX without TypeScript

If you want to use JSX without writing TypeScript, you can still use the TypeScript compiler to convert your `.jsx` files to `.js`. Simply generate a TypeScript app and add an entry `"allowJs": true` in the `compilerOptions` object of `tsconfig.json`. Then change the filenames in the `include` object from `.ts` and `.tsx` to `.js` and `.jsx`. You may also have to adjust your linter setup, if you use any.
