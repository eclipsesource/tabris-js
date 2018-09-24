---
---
# TypeScript

Tabris.js 3 targets TypeScript 2.9 or later. TypeScript is a <em>type-safe</em> dialect of JavaScript/EcmaScript and also supports <em>ES6 module syntax</em> (`import` and `export` statements) and `async`/`await`. A complete guide to TypeScript can be found at [typescriptlang.org](http://www.typescriptlang.org/docs/home.html). As an IDE we can recommend [Visual Studio Code](https://code.visualstudio.com/) with the [tslint](https://marketplace.visualstudio.com/items?itemName=eg2.tslint) extension, but there are [many suitable TypeScript IDEs](https://github.com/Microsoft/TypeScript/wiki/TypeScript-Editor-Support) out there.

TypeScript files have to be compiled to JavaScript before execution. The compiler is installed in the project directory to `node_modules/.bin/tsc` when generating a new Tabris.js app using the `tabris init` command. To compile the code, simply type `npm run build`. This also happens during a full app build via `tabris build` or using the build service. Alternatively, type `npm start` to start the compiler in watch mode for incremental compiling and code side loading.

## Type Safety

In TypeScript not all APIs, not even all Tabris.js APIs, are perfectly type safe. Here are some guidelines to avoid losing type safety.

Tabris.js specific recommendations:
* Do not use the `widget.on()` method. Instead, the Listeners API, e.g. `widget.onResize(cb);`.
* Create type-aware `WidgetCollection` instances using widget constructors as selectors, e.g. `widget.children(Button).first();`.
* Be aware that while `widget.set()` and widget constructors provides auto-completion it does not prevent you from setting non-existing properties.
* Use `widget.apply()` only to set properties of the base `Widget` class, like `layoutData`. Or avoid it completely.

General TypeScript recommendations:
* Avoid `any`. An implicit `any` may occur if you do not give a type for a variable, field or parameter, and none can be inferred by assignment.
* Avoid explicit casting, Use [type guards](http://www.typescriptlang.org/docs/handbook/advanced-types.html#type-guards-and-differentiating-types) instead.
* When using third-party libraries you may have to <em>[manually install declaration files](http://www.typescriptlang.org/docs/handbook/declaration-files/consumption.html)</em> to be type safe.

## Interfaces

When used in TypeScript the tabris module exports the following additional interfaces:

 * [`Image`](./types.md#image)
 * [`Color`](./types.md#color), which is just an alias for `string`
 * [`Font`](./types.md#font), also an alias for `string`
 * [`LayoutData`](./types.md#layoutData)
 * [`Bounds`](./types.md#bounds)
 * [`Transformation`](./types.md#transformation)
 * [`Margin`](./types.md#margin)
 * [`Dimension`](./types.md#dimension)
 * [`Offset`](./types.md#offset)
 * [`BoxDimensions`](./types.md#boxdimensions)
 * [`ImageData`](./types.md#imagedata)
 * [`Selector`](./types.md#selector)
 * [`AnimationOptions`](./types.md#animationoptions)
 * [`PropertyChangedEvent<T, U>`](./types.md#propertychangedevent), same as `EventObject<T> & { readonly value: U }`
 * `{TargetType}{EventName}Event` interfaces, e.g. `PickerSelectEvent`. Only for events with additional parameters.
 * `Properties<Widget>`, which is the interface of the properties parameter used by the `set` method of the given widget.
 * `Properties<typeof Widget>`, which is the interface of the properties parameter used by the constructor of the given widget.
