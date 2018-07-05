---
---
# Modules

Tabris.js uses the ["CommonJS"](http://www.commonjs.org/) module system, same as [Node.js](https://nodejs.org).

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

If you use a vanilla JavaScript project without a compiler/bundler you have to use the ES5/CommonJS syntax (i.e. `require()`). You can get
* an overview of the syntax on the [CommonJS Wiki](https://nodejs.org/dist/latest-v10.x/docs/api/modules.html), or
* a detailed explanation in the [Node.js docs](https://nodejs.org/dist/latest-v10.x/docs/api/modules.html).

The Node.js implementation is the standard that Tabris.js follows and aims to be compatible with.