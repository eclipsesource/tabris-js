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

You get this "vanilla" JS kind of project setup if you choose the Template "Hello World (JavaScript)" when running the `tabris init` command, or by just typing `npm init && npm i tabris` in an empty directory.

> **Important:** Many examples in the official Tabris.js documentation make use of the ES6 module syntax and JSX. These features do not work with vanilla JS projects. The details are explained below and in [this article](./widget-basics.md).

In vanilla JS projects your code will be executed exactly as written, and which language features are available depends entirely on the JavaScript engine. In general both platforms (iOS/Android) support most of the [ECMAScript 2017](https://www.ecma-international.org/ecma-262/8.0/) standard, but not the [ES6 Module syntax](./modules.md).

Notable supported features:

Feature|Example
--- | ---
[Arrow functions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions)|`(a, b) => a + b`
[Classes](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes)|`class { … }`
[const](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/const)|`const a = 1;`
[Default parameters](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Default_parameters)|`function(a = 1) { … }`
[Destructuring assignment](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment)|`[a, b] = [1, 2]`
[Exponentiation operator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Exponentiation)|`a ** b`
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
[import/](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import)[export](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/export)|`import {foo} from 'foo';`|`const {foo} = require('foo');`
[JSX](./declarative-ui.md)|`<TextView text='foo'/>`|`TextView({text: 'foo'})`
[Types/Interfaces](./typescript.md)|`const foo: string;`|`/** @type {string} */ const foo;`
[async/await](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function)*|`await fn();`|`fn().then(...);`

* "async" functions are parsed, but can not update the UI. This can currently not be fixed. It's recommended to either use promises directly or a compiler that transforms async functions to promises.

### Compiled JavaScript Projects

There are many tools (e.g. [TypeScript](http://typescriptlang.org/),  [Babel](https://babeljs.io/), [WebPack](https://webpack.js.org/)) that provide some kind of JavaScript pre-processing. In Tabris.js this can enable the use of syntax (see above) that would otherwise not be supported at runtime.

The Tabris.js project templates provided by the `tabris init` command use the [TypeScript](http://typescriptlang.org/) compiler ([`tsc`](http://www.typescriptlang.org/docs/handbook/compiler-options.html)) to provide ES6 Module syntax and JSX support in JavaScript code. We generally recommend `tsc` over Babel, even for non-TypeScript projects. This is because it requires less dependencies and configuration, provides better auto completion in your IDE, and eases migration to TypeScript should this be desired later on.

### TypeScript Projects

Since `tabris init` creates a JavaScript/TypeScript hybrid projects, everything from the previous section still applies here. You simply create `.ts` and `.tsx` files instead of `.js` and `.jsx` files. Further notes on TypeScript support can be found [here](./typescript.md).
