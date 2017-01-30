# Modules

All JavaScript files in a Tabris.js project, including the main script, are modules.

This means:

* The script in the file will not be parsed and executed until it is required.
* The file has an implicit local scope. A variable declared with `var` will never be global. Global variables should be avoided completely.
* There are three pre-defined local variables: `require`, `module` and `exports`. These allow you to import/export data from/to other modules.

The main module will be loaded when the application is started. To define a script as the main module, simply add it to your projects `package.json`, like this:

    {
      "name": "my-app",
      "version": "1.0",
      "main": "my-main-script.js"
    }

## require

The local `require` function is used to load other modules. It accepts a module identifier string and returns what that module exports.
Most commonly the identifier string is the path to the module without file extension and relative to the current script file.

A module may be a `.js` file, a `.json` file, or a folder. The `require` method will look for these different types of modules in this order. So to import "mymodule.js" from the same folder as the current script, simply write:

     var myModuleImport = require("./mymodule");

**The leading dot is mandatory.** Without it the module is looked for elsewhere. (See [npm Support](#npm-support))

Your modules may also be located in a different folder:

     var module1 = require("./subfolder/module1");
     var module2 = require("../sibling_folder/module2");

To deal with ambiguous scenarios (multiple module with the same name), the module identifier string may also include the file extension or a trailing slash (for folders):

     var myJsModule = require("./mymodule.js");
     var myJsonModule = require("./mymodule.json");
     var myFolderModule = require("./mymodule/");

Every module is loaded exactly once, no matter how often it is imported. Therefore:

    require("./mymodule") === require("./mymodule")

This is also true when the module imported using different identifier strings, i.e. with and without extension, or from different scripts.

The Developer App usually loads modules from an HTTP server. For some larger modules this may slow down the application significantly. However, you can [build your own developer app](build.md) and include any number of files. When a requested module is available on the device, the local resource will be used and no HTTP request will be issued.

## Module Types

### Script Modules

Any JavaScript file may be loaded as a module. However, loading a module should never have any side-effects. Implement each module as if there is no shared global scope, even though this is not the case for compatibility reasons. It is also recommended not to change the state of the application on load time (except in the main module). Remember that each module is loaded only once, no matter how often it is imported.

Instead, modules should export data (which may include functions) to be used by other modules. By default the export of any module is a plain, empty object. This object is present in the module script as a local variable called `exports`. It may be modified in any way by the script, for example:

    exports.foo = 1;
    exports.bar = 2;

To export another type of object, (or any other data type), ignore `exports` and use `module` instead. For example:

    module.exports = function() {
      // e.g. add a top-level page to the application
    };

This will cause the require method importing this module to directly return this function:

    require("./mymodule")();

The main module can not have any useful exports. The `module` and `exports` objects are present, but completely ignored.

### JSON Modules

When a `.json` file is used as a module, the export is simply the contents of the file. For example:

    {
      "foo": 1,
      "bar": 2
    }

Request this file in another module:

    var data = require("./myjson");
    console.log(data.foo === 1);
    console.log(data.bar === 2);

### Folder Modules

Folders can be used as a module if they contain one of the following files:

* A `package.json` with a `main` entry pointing to a `.js` or `.json` file.
* An `index.js`
* An `index.json`

A folder module may consist of multiple internal file modules, but only the first file found by going through the above list will be exported directly.

## npm Support

Tabris.js supports loading [npm](https://www.npm.org) modules, though the compatibility of the module depends on the API it expects.

Use the [npm command line interface](https://www.npmjs.org/doc/) to install any Tabris.js compatible module into your project folder.

> <img align="left" src="img/note.png"> <i>Tabris.js does *not* support globally installed npm modules, only those installed locally in the projects `node_modules` folder.</i>

To load a locally installed npm module, simply use its name as the identifier string, with no leading dot. For example:

    var _ = require("underscore");

Modules that have been tested with Tabris.js are tracked as [GitHub issues](https://github.com/eclipsesource/tabris-js/issues?q=label%3A%22compatibility+npm%22). If the module is confirmed to work the issue is closed. Please feel free to add issues for modules that you tested.

