---
---
# Modules

Tabris.js uses the same basic module system as [Node.js](https://nodejs.org/dist/latest-v10.x/docs/api/modules.html), also known as the ["CommonJS"](https://en.wikipedia.org/wiki/CommonJS) module system,

This means:

* Each JavaScript file represents a module.
* Each module has an implicit local scope. A variable declared with `var`, `let` or `const` will never be global.
* The module code will not be parsed and executed until the module is imported.
* To access a value (e.g. a class) created by **module A** in another **module B**, it needs to be exported by **A** and imported by **B**

## Startup

When the application starts, it will load the main module to kickstart your application. It is identified in the `main` field of your project's `package.json`. For example:

```json
{
  "name": "my-app",
  "version": "1.0",
  "main": "dist/my-main-script.js"
}
```

This main module can then import other modules of your application, or third party modules installed in your project via npm.

> :point_right: Tabris.js does *not* support npm modules installed globally on your development machine, only those installed locally in the projects `node_modules` folder. Also, npm modules that depend on native node.js modules like `'http'` do not work.

The Tabris.js API is also available globally (without importing) and can be accessed immediately under the `tabris` namespace. Therefore "`new tabris.Button();`" always works, while "`new Button();`" requires `Button` to be imported from `'tabris'`.

Some other values available without import (i.e. in the "global" namespace) are: `console`, `Math`, `setTimeout`, `setInterval`, `clearTimeout`, `localStorage`, `XMLHttpRequest`, `fetch`, `device`, `ImageData` and `WebSocket`.

## Syntax

The exact `import/export` syntax differs depending on your project setup.

The modern ES6 syntax is preferred and used throughout this documentation. ES6 Modules support is not provided by Tabris.js directly but by a third party compiler like [tsc](http://www.typescriptlang.org/docs/handbook/compiler-options.html) (works for both JavaScript and TypeScript files), or bundling tools like [WebPack](http://webpack.js.org/). For an in-depth explanation of this syntax please refer to the either

* the MDN articles on [import](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import)
and [export](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/export) statements, or
* the [module chapter](http://www.typescriptlang.org/docs/handbook/modules.html) in the TypeScript handbook.

If you use a vanilla JavaScript project without a compiler/bundler you have to use the ES5/CommonJS syntax (i.e. `require()`). You can get a detailed explanation in the [Node.js docs](https://nodejs.org/dist/latest-v10.x/docs/api/modules.html).

The Node.js implementation is the standard that Tabris.js follows and aims to be compatible with.

## Virtual Modules

A module is usually define by a file, but it is also possible to define a module at runtime at any path. This is done using [`Module.define`](./api/Module#definepathexports):

```js
const {Module} = require('tabris');

Module.define('/src/my/virtual/module', myExports);
```

It could then be imported - for example from file `/src/my/real/module.js` - like this:

```js
const myExports = require('../virtual/module');
```

Of course you can also define virtual modules in `node_modules` to make them easily importable from anywhere in your application code.

If you use this feature in a TypeScript based project the virtual modules can be [declared in a separate `d.ts` file](https://www.typescriptlang.org/docs/handbook/modules.html#ambient-modules). The ES6 module system and different output folder also need to be considered:

```js
import {Module} from 'tabris';

Module.define('/dist/my/virtual/module', {default: myDefaultExport});
```

Import from `/src/my/real/module.ts`:

```js
import myDefaultExport from '../virtual/module';
```

Make sure the module that defines the virtual module is always parsed first. Assuming this is done is done in `src/virtualModules.ts`, your main module may begin like this:

```js
import './virtualModules';
import './my/real/module';
```
