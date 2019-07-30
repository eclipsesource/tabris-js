---
---
# Runtime

Tabris.js apps are executed in a JavaScript engine hosted by a native iOS or Android App. The code may be packaged with the app (using the Tabris build service or CLI), or side-loaded via HTTP and Tabris CLI. Side loading is usually only done with debug builds or the Tabris Developer App.

## The JavaScript Engine

The different platforms use different JavaScript engines.

Android uses V8 (via [J2V8](https://github.com/eclipsesource/J2V8)), which is bundled with the native part of the app. As a result the version of the JavaScript engine that an Tabris app runs in is bound to the Tabris.js version the app is built on.

On iOS the [JavaScriptCore](https://developer.apple.com/documentation/javascriptcore) engine is used, which is part of the operating system. Therefore the version of iOS that a Tabris app is installed on determines which version of the JavaScript engine it runs on.

## Application Programming Language

Tabris.js apps can be developed in JavaScript or TypeScript. In both cases you also have the option to embed JSX (an HTML-like language extension) in your JavaScript/TypeScript code.

Which language features are available to you depends on the exact JavaScript engine the code runs in (as explained above), and which compiler - if any - is used to pre-process your code.

### Vanilla JavaScript Projects

> :warning: Some examples in the official Tabris.js documentation make use of modern features that do not work with Vanilla JavaScript Projects. We recommend using a setup with a compiler as explained in the next section.

You get this kind of project setup if you choose "Vanilla JavaScript" running the `tabris init` command, or by just typing `npm init && npm i tabris` in an empty directory.

For these kind of projects your code will be executed exactly as written, and which language features are available depends entirely on the JavaScript engine. In general both engines support most of the [ECMAScript 2017](https://www.ecma-international.org/ecma-262/8.0/) standard, but not the [ES6 Module syntax](./modules.md).

Notable supported features:

Feature|Example
--- | ---
[Arrow functions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions)|`(a, b) => a + b`
[Classes](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes)|`class { … }`
[const](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/const)|`const a = 1;`
[Default parameters](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Default_parameters)|`function(a = 1) { … }`
[Destructuring assignment](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment)|`[a, b] = [1, 2]`
[Exponentiation operator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Arithmetic_Operators#Exponentiation)|`a ** b`
[for...of](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/statements/for...of)|`for (let a of b) { … }`
[Generators](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Iterators_and_Generators#Generator_functions)|`function*() { … }`
[let](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/let)|`let a = 1;`
[Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)|`new Map(iterable)`
[Methods](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Method_definitions)|`{ a() { … } }`
[Object property shorthands](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer#New_notations_in_ECMAScript_2015)|`{a, b}`
[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)|`new Promise(cb)`
[Reflect](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Reflect)|`Reflect.setPrototypeOf(a, proto)`
[Rest parameters](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/rest_parameters)|`function(...args) { … }`
[Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy)|`new Proxy(a, handler)`
[set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/set)|`{ set a(value) { … } }`
[get](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get)|`{ get a() { … } }`
[Set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set)|`new Set(iterable)`
[Spread operator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_operator)|`foo(...arr)`
[Symbol](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol)|`Symbol(str)`
[Template literals](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals)|<code>\`foo ${value} bar\`</code>
[Typed Arrays and ArrayBuffer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Typed_arrays)|`new Uint8Array(buffer)`
[WeakMap](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap)|`new WeakMap(iterable)`
[WeakSet](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakSet)|`new WeakSet(iterable)`

Notable feature NOT supported:

Feature|Example|Alternative
--- | --- | ---
[import/](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import)[export](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/export)|`import * as foo from 'foo';`|`const foo = require('foo');`
[async/await](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function)|`await fn();`|`fn().then(cb);`
[JSX](./JSX.md)|`<TextView />`|`new TextView()`
[Types/Interfaces](./typescript.md)|`const foo: string;`|`const foo;`

### Compiled JavaScript Projects

There are various tools that provide some kind of JavaScript pre-processing to allow the use of constructs (and sometimes APIs) that would otherwise not be supported at runtime, or to optimize the code in some way. Particularly popular in this category is [Babel](https://babeljs.io/), which  works fine with Tabris.js. However, using the `tabris init` command and choosing the "Compiled" option will create a project using the [TypeScript](http://typescriptlang.org/) compiler [`tsc`](http://www.typescriptlang.org/docs/handbook/compiler-options.html), which we recommend even for JavaScript projects. Not only is this a less complex setup than a comparable *Babel* configuration, it can also provide better auto completion support and eases migration to TypeScript should this be desired later on.

With this kind of setup `.js` files now can use the ES6 module syntax ([import/](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import)[export](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/export)) and async functions ([async/await](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function)). It also supports [JSX](./JSX.md) syntax in `.jsx` files.

### TypeScript Projects

TypeScript is recommended over JavaScript for all serious software development efforts. Since `tabris init` creates a JavaScript/TypeScript hybrid project, everything from the previous section still applies here. You simply create `.ts` and `.tsx` files instead of `.js` and `.jsx` files. Further notes on TypeScript support can be found [here](./typescript.md).
