---
---
# Testing Tabris.js applications

## Unit Tests

Unit tests of tabris application code may be written with any JavaScript/TypeScript test tool (such as [Mocha](https://mochajs.org/)) that can run in node. However, if the code under test relies on the `tabris` module it may initially produce errors such as:

<code style='textColor: red'>tabris.js not started</code><br/>
<code style='textColor: red'>JSX is not defined</code><br/>
<code style='textColor: red'>$ is not defined</code>

This is because the `tabris` module needs to be initialized before it can be used. Usually this is done via platform-native code, i.e. the Tabris.js parts written specifically for iOS or Android. Within node that native code needs to be emulated, otherwise no instances of `NativeObject` (which includes all widgets) can be created.

### Initializing the Tabris module

> :point_right: You may create a example test setup when generating a compiled Tabris.js app with the CLI `tabris init` command. In that case the steps described below have already been taken care of.

To resolve the initialization problem Tabris.js provides the a sub-module identified as `tabris/ClientMock` which exports the `ClientMock` class. This class partially imitates the behavior and API of the platforms-native code and allows - with some limitations - code based on the `tabris` module to run as it would in a production environment.

This quickest way to set up `ClientMock` looks like this:

```js
import {tabris} from 'tabris';
import ClientMock from 'tabris/ClientMock';

tabris._init(new ClientMock()); // do this before using tabris module
```

> :point_right: The first import statement technically only imports (and shadows) the already global `tabris` object, but is needed in TypeScript to access to the "internal" [`_init`](./api/Tabris.html#_initclient-options) method.

After the call to `_init` the tabris module can be used. <b>Depending on your application this needs to be done before the code under test is imported.</b> This is the case if your application calls Tabris.js API at the root of a module. (Extending Tabris.js classes is fine, just not creating instances or calling methods.)

However, "`import ... from ...`" statements can not be mixed with other code, you either have to use dynamic imports (which is cumbersome), or wrap the above code in its own module, e.g. `init-tabris.js`. Then simply import that module as the first one in every test class. You project could look like this:

```js
|-package.json
|-src
  |- MyApp.js
|-test
  |-init-tabris.js
  |-MyApp.test.js
```

In which case `init-tabris.js` contains the code above and `MyApp.test.js` looks like this:

```js
import './init-tabris';
import MyApp from '../src/MyApp';

describe('MyApp', function() {
  //...
});

```

The `_init` method may be called again at any point to reset the state of the tabris module. You may want to do this before or after each test.

```js
beforeEach(function() {
  tabris._init(new ClientMock());
});
```

### Faking read-only properties

Many Tabris.js objects (instance of `NativeObject`) have read-only properties that normally can not be set via JavaScript. This includes most properties on `tabris.Device` and `tabris.App`, but also Widget `bounds`. You can set those for specific types during the initialization call on the `ClientMode`:

```js
tabris._init(new ClientMock({
  'tabris.Device': {platform: 'Android'},
  'tabris.App': {version: '1.0.0'}
}));
```
