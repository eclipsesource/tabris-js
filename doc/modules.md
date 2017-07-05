# Modules

All JavaScript files in a Tabris.js project, including the main script, are *modules*. If you are familiar with the Node.js module system ("CommonJS"), it is exactly the same.

This means:

* The code in the file will not be parsed and executed until the file is required.
* The file has an implicit local scope. A variable declared with `var` will never be global. Global variables should be avoided completely.
* There are three pre-defined local variables: `require`, `module` and `exports`. These allow you to import/export data from/to other modules.

When the application starts, it will load the main module that is defined in the `main` field of your project's `package.json`. For example:

```json
{
  "name": "my-app",
  "version": "1.0",
  "main": "my-main-script.js"
}
```

The main module will usually import other modules of your application, which again may import other modules.

> :point_right: This article describes the plain JavaScript syntax for importing and exporting modules. If you are creating a TypeScript app you should use the syntax described in the [TypeScript Handbook](http://www.typescriptlang.org/docs/handbook/modules.html).

## Importing Modules

The local `require` function is used to load and import another module. It accepts a module identifier string and returns whatever that module exports.
Most commonly, the identifier string is the path to the module (without the file extension), relative to the current script file.

A module may be a `.js` file, a `.json` file, or a folder. The `require` function will look for these different types of modules in this order. So to import `mymodule.js` from the same folder as the current script, write:

```js
const myModule = require('./mymodule');
```

> :point_right: You may also include the file extension or a trailing slash if the required module is a folder. Usually, it's left out.

> :warning: The leading dot is mandatory. Without it, the module is looked for elsewhere (see [npm Support](#npm-support)).

Your modules may also be located in a different folder:

```js
const module1 = require('./subfolder/module1');
const module2 = require('../sibling_folder/module2');
```

Every module is loaded exactly once, no matter how often it is imported. Therefore:

```js
require('./mymodule') === require('./mymodule')
```

This is also true when the module is imported using different identifier strings, i.e. with and without extension, or from different scripts.

## Module Exports

Modules should export functions, classes, or other data to be used by other modules.
They should not use the global JavaScript scope to expose such data.
In fact, you should implement your modules as if there were no global scope.

Since each module is loaded only once, no matter how often it is imported, the loading of a module should not have any side-effects.
In particular, a module should not change the state of the app (e.g. by adding widgets to the UI) on load time, but export a function that does this.
The main module is, obviously, an exception to this rule.

### Script Modules

Any JavaScript file is a module and may be imported by other modules.
By default, the export of a module is a plain, empty object.
This object is present in the module script as a local variable called `exports`.
The module may attach any fields to it, for example:

```js
exports.PI = 3.1416;
exports.circumference = (r) => 2 * 3.1416 * r;
```

To export another object (or any other type of data), you can override the `exports` object by assigning `module.exports`. For example:

```js
module.exports = class Circle {

};
```

The `require` function that imports this module will return this class:

```js
const Circle = require('./circle');

let circle = new Circle();
```

The main module can not have any useful exports. The `module` and `exports` objects are present, but completely ignored.

### JSON Modules

When a `.json` file is imported as a module, the file will be parsed and the module will export its JSON content. For example:

```json
{
  "foo": 1,
  "bar": 2
}
```

Request this file in another module:

```js
const data = require('./myjson');
console.log(data.foo === 1);
console.log(data.bar === 2);
```

### Folder Modules

A folder can be used as a module if it contains one of the following files:

* A `package.json` with a `main` entry pointing to a `.js` or `.json` file.
* An `index.js`
* An `index.json`

A folder module may contain multiple internal file modules, but only the first file found out of the above list will be exported directly.

## npm Support

Tabris.js supports loading [npm](https://www.npmjs.com) modules, though the compatibility of the module depends on the API it expects.

Use the [npm command line interface](https://www.npmjs.com/doc/) to install any Tabris.js compatible module into your project folder.

> :point_right: Tabris.js does *not* support globally installed npm modules, only those installed locally in the projects `node_modules` folder.

To load a locally installed npm module, use its name as the identifier string, with no leading dot. For example:

```js
const _ = require('underscore');
```

Modules that have been tested with Tabris.js are tracked as [GitHub issues](https://github.com/eclipsesource/tabris-js/issues?q=label%3A%22compatibility+npm%22). If the module is confirmed to work the issue is closed. Please feel free to add issues for modules that you tested.
