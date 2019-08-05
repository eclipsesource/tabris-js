---
---
# TypeScript

Tabris.js 3 targets TypeScript 3.3. TypeScript is a <em>type-safe</em> dialect of JavaScript/EcmaScript and also supports <em>ES6 module syntax</em> (`import` and `export` statements) and `async`/`await`. A complete guide to TypeScript can be found at [typescriptlang.org](http://www.typescriptlang.org/docs/home.html). As an IDE we can recommend [Visual Studio Code](https://code.visualstudio.com/) with the [tslint](https://marketplace.visualstudio.com/items?itemName=ms-vscode.vscode-typescript-tslint-plugin) extension, but there are [many suitable TypeScript IDEs](https://github.com/Microsoft/TypeScript/wiki/TypeScript-Editor-Support) out there.

## Setup

TypeScript files have to be compiled to JavaScript before execution. The compiler is installed in the project directory to `node_modules/.bin/tsc` when generating a new Tabris.js app using the `tabris init` command. (It belongs to the `devDependencies` in `package.json`.) To compile the code, simply type `npm run build`. This also happens when sideloading code via `tabris serve`, during a full app build via `tabris build` or on the build service. Alternatively, type `tabris serve -w -a` to start the compiler in watch mode for incremental compiling. That way you do not have to restart `tabris serve` after every code change.

If you want to migrate an existing Vanilla-JavaScript Tabris.js project, do the following:

Install TypeScript in your app project:
```
npm install --save-dev typescript
```

To configure the TypeScript compiler create a new file called `tsconfig.json` with the following content:

```json
{
  "compilerOptions": {
    "module": "commonjs",
    "target": "es6",
    "outDir": "./dist/",
    "lib": [
      "es2017"
    ],
    "jsx": "react",
    "jsxFactory": "JSX.createElement",
    "noImplicitAny": true,
    "noImplicitThis": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "alwaysStrict": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "allowJs": true,
    "sourceMap": true
  },
  "include": [
    "./src/**/*.ts",
    "./src/**/*.tsx",
    "./src/**/*.js",
    "./src/**/*.jsx"
  ]
}
```

This is the default configuration for generated TypeScript projects. It includes support for mixed JavaScript/TypeScript projects, [JSX](./jsx.md) and [decorators](./databinding/index.md). It also adds some recommended compiler options for stricter TypeScript interpretation. If you do not need any of these, a minimal `tsconfig.json` would look like this:

```json
{
  "compilerOptions": {
    "module": "commonjs",
    "target": "es6",
    "outDir": "./dist/",
    "lib": [
      "es2017"
    ]
  },
  "include": [
    "./src/**/*.ts"
  ]
}
```

Now edit `package.json` to let the `main` field point to the compiled app in `dist/`:

```json
{
  "main": "dist/app.js",
  ...
}
```

Also include the following in the `scripts` sections:

```json
{
  "scripts": {
    "build": "tsc -p .",
    "watch": "tsc -p . -w --preserveWatchOutput",
    "start": "tabris serve -a -w"
  }
}
```

The `build`  and `watch` scripts are called by the Tabris.js CLI to compile the code either once (`build`) or after every file change (`watch`).
The `start` script is optional and provides a shortcut (via `npm start`) for convenient code sideloading. The `-w` switch means the `watch` script is used instead of `build`, and `-a` makes the app restart after every re-compile. As a result editing and saving a TypeScript file restarts the app including the code change.

## Type Safety

In TypeScript not all APIs, not even all Tabris.js APIs, are perfectly type safe. Here are some guidelines to avoid losing type safety.

Tabris.js specific recommendations:
* Do not use the `widget.on()` method. Instead, the Listeners API, e.g. `widget.onResize(cb);`.
* Create type-aware `WidgetCollection` instances using widget constructors as selectors, e.g. `widget.children(Button).first();`.
* Be aware that while `widget.set()` and widget constructors provides auto-completion it does not prevent you from setting non-existing properties.
* Use `widget.apply()` only to set properties of the base `Widget` class, like `layoutData`. Or avoid it completely.

General TypeScript recommendations:
* Avoid `any`. An implicit `any` may occur if you do not give a type for a variable, field or parameter, and none can be inferred by assignment.
* Avoid explicit casting, Use [type guards](http://www.typescriptlang.org/docs/handbook/advanced-types.html#type-guards-and-differentiating-types) instead. Tabris.js provides some for [`ColorValue`](./types.md#colorvalue),
* When using third-party libraries you may have to <em>[manually install declaration files](http://www.typescriptlang.org/docs/handbook/declaration-files/consumption.html)</em> to be type safe.

## Interfaces

When used in TypeScript the tabris module exports the following additional interfaces:

 * [`ImageValue`](./types.md#imagevalue), a union of all types accepted as images
 * [`ColorValue`](./types.md#colorvalue), a union of all types accepted as colors
 * [`FontValue`](./types.md#fontvalue), a union of all types accepted as fonts
 * [`PercentValue`](./types.md#percentvalue), a union of all  types accepted as percentages
 * [`PercentValue`](./types.md#percentvalue), a union of all types accepted as percentages
 * [`LinearGradientValue`](./types.md#lineargradientvalue), a union of all types accepted as gradients
 * [`Selector`](./selector.md), a union of all types accepted as gradients
 * [`Bounds`](./types.md#bounds)
 * [`Transformation`](./types.md#transformation)
 * [`Dimension`](./types.md#dimension), alias for `number`
 * [`Offset`](./types.md#offset), alias for `number`
 * [`BoxDimensions`](./types.md#boxdimensions)
 * [`ImageData`](./types.md#imagedata)
 * [`AnimationOptions`](./types.md#animationoptions)
 * [`PropertyChangedEvent<TargetType, ValueType>`](./types.md#propertychangedeventtargettype-valuetype), same as `EventObject<TargetType> & { readonly value: U }`
 * Various `{TargetType}{EventName}Event` interfaces, e.g. `PickerSelectEvent`. Only for events with additional parameters.
 * [`Properties<Widget>`](./types#propertieswidget), which is the interface of the properties parameter used by the constructor and `set` method of the given widget.
