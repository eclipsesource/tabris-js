---
---
# Custom Widgets on Android

A Tabris.js widget consists of a [JavaScript API](custom-widgets.md) and a native client side implementation. This document describes how to create the native implementation for a custom widget on the Android platform.

In order to implement a custom widget you will need to [build locally](build.md).

## Building upon Cordova infrastructure

To create a Tabris.js custom widget, we make use of the Cordova build system. Therefore we create a Cordova plugin that ties into Tabris.js specific APIs. A Tabris.js custom widget does not require touching any of the Cordova specific Java APIs. All interaction with the JavaScript parts is enabled through Tabris.js specific APIs.

By leveraging the Cordova plugin architecture we are able to make use of the Cordova build chain and to provide a `plugin.xml` in our plugin to customize the build process. Once a plugin is defined it can be consumed by an app via the regular `cordova plugin add <plugin-id/git-url>` shell command or a `<plugin />` entry in the config.xml of an app.

:information_source: A working example of the concepts outlined in this document can be found in the [tabris-plugin-lottie](https://github.com/eclipsesource/tabris-plugin-lottie).

## Receiving messages from JavaScript

Creating a custom widget requires handling incoming messages from JavaScript and sending messages back to JavaScript. The main entry point to this communication loop is the `com.eclipsesource.tabris.android.ObjectHandler`. The handler provides callback methods for all communication _from_ JavaScript to the native client. The following snippet shows a basic handler written in kotlin, that uses the `com.eclipsesource.tabris.android.internal.nativeobject.view.ViewHandler` as a basis for a `View` specific handler:

```kotlin
class ButtonHandler(private val scope: ActivityScope) : ViewHandler<Button>(scope) {

  override val type = "com.eclipsesource.Button"

}
```

The snippet above shows two important aspects of an `ObjectHandler`: The class _has to have_ a one argument constructor with either a `Scope` or an `ActivityScope` and the property `type` has to return the internal name of the custom widget as registered on the [JavaScript side](custom-widgets.md).

## Registering an ObjectHandler

To make an `ObjectHandler` available to the Tabris.js Android runtime we have to register it in the `AndroidManifest.xml`. We use the cordova [`<config-file>`](https://cordova.apache.org/docs/en/latest/plugin_ref/spec.html) element in the `plugin.xml` to add the `ObjectHandler` in the `AndroidManifest.xml`. Make sure to include the `android` namespace in the `<widget>` root element of the `plugin.xml` (e.g. `<widget xmlns:android="http://schemas.android.com/apk/res/android">`).

The following snippet shows how to declare an `ObjectHandler` in the `plugin.xml` so that it is part of the final `AndroidManifest.xml`:

```xml
<plugin xmlns="http://apache.org/cordova/ns/plugins/1.0"
        xmlns:android="http://schemas.android.com/apk/res/android"
        id="tabris-plugin-button">

  <platform name="android">
    <config-file target="AndroidManifest.xml" parent="/manifest/application">
      <meta-data
          android:name="com.eclipsesource.tabris.android.HANDLER.com.eclipsesource.button"
          android:value="com.eclipsesource.button.ButtonHandler" />
    </config-file>
  </platform>

  ...
</plugin>
```

The snippet above inserts the `meta-data` element with its two attributes `name` and `value` into the `AndroidManifest.xml`. The `name` attribute has to be an application wide unique ID with a prefix of `com.eclipsesource.tabris.android.HANDLER`. In order to make the name unique we append the widget specific id `.com.eclipsesource.Button` to the prefix. The `value` attribute of the `meta-data` element has to contain the fully qualified class name of our `ObjectHandler` implementation, eg.: `com.eclipsesource.button.ButtonHandler`.

## Instantiating an object

An `ObjectHandler` is able to instantiate new objects via its `create(id: String, properties: V8Object)` method. In the case of our `ButtonHandler` we create and return a new `Button`.

```kotlin
override fun create(id: String, properties: V8Object) = Button(scope.activity)
```

The snippet instantiates a `android.widget.Button` with the `Activity` of the `ActivityScope` (which we obtained in the constructor of the `ObjectHandler`). The `properties` argument could contain widget specific configuration directives but is not used in this example.

## Handling properties

After an object is instantiated, we are also going to set properties or return property values. These so called `set` and `get` operations are processed via `com.eclipsesource.tabris.android.Property` objects.

By inheriting from the `ViewHandler` we already support the base set of properties from the Tabris.js `Widget` object. To add a set of custom properties we add them to the list of properties defined by our `ObjectHandler`:

```kotlin
override val properties by lazy {
  super.properties + listOf<Property<Button, *>>(
      StringProperty("text", { text = it }),
      IntProperty("maxLines", { maxLines = it ?: Integer.MAX_VALUE }, { maxLines })
  )
}
```

In the example above we implement two properties called `text` and `maxLines`. We make use of the convenience `Property` implementations `StringProperty` and `IntProperty` which only pass the incoming value to the `set` lambda if it is of the given type or null. Inside the `set` lambda with receiver, `this` is redeclared to be the widget (in our case the `Button`) and the only parameter is the value passed into the set operation (here refereed to as `it`). These language constructs allow to write very expressive code to handle properties. Of course the `Property` interface can also be implemented manually. In the `get` lambda we return the property value which can by of any type.

## Sending messages to JavaScript

While receiving an operation from JavaScript covers a lot of ground we also want to send messages proactively to JavaScript. A classic example is a user initiated action like a button tap.

To send a message from a particular widget we use a `com.eclipsesource.tabris.android.RemoteObject`. A `RemoteObject` can be obtained from the `ObjectRegistry` or the convenience method on the `Scope`:

```kotlin
scope.remoteObject(object)

// or

scope.objectRegistry.findRemoteObject(object)
```

Continuing the example from above the following snippet sends a notify operation to JavaScript. When a `Button` is tapped we send a `select` event:

```kotlin
scope.remoteObject(it)?.notify("select")
```

Note that the `RemoteObject` dispatches the event only if we previously received a `listen` operation, where the event has been activated (e.g. `select` is set to `true`). Otherwise the `RemoteObject` will not send the event. The event will be activated and deactivated automatically without any `ObjectHandler` specific code.

## Handling call operations

An `ObjectHandler` is also able to handle incoming `call` operations. These usually invoke method calls. For example a `ScrollView` could be instructed to scroll to a particular position. The following snippet shows a shortened version of such a `call` method:

```kotlin
override fun call(scrollView: ScrollView, method: String, properties: V8Object) = when (method) {
  "scrollToX" -> scrollToX(scrollView, properties)
  "scrollToY" -> scrollToY(scrollView, properties)
  else -> null
}
```

## Handling listen operations

A `listen` operation allows to setup infrastructure so that events can be send via a `RemoteObject`. For example a listener can be registered for a button tap when a `select` event is activated.

The following snippet shows how to receive a `listen` call via the `ObjectHandler` method `listen()`.

```kotlin
override fun listen(id: String, button: Button, event: String, listen: Boolean) = when (event) {
    "select" -> button.setOnClickListener { scope.remoteObject(it)?.notify("select") }
    else -> super.listen(id, textInput, event, listen)
  }
```

## Destroying a widget

When a widget is no longer being used we also need to take care of destroying it. In case of our custom Android `View` we receive a destroy operation in the `ObjectHandler` and are responsible for cleaning up any resources that are not required anymore. When an `ObjectHandler` inherits from the `ViewHandler` the destroy operation will also remove the view from the view hierarchy.

```kotlin
override fun destroy(button: Button) {
  super.destroy(button)
  // perform any necessary cleanup
}
```
