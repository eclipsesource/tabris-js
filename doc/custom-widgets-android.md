---
---
# Custom Widgets Android

A Tabris.js widget consists of a [JavaScript API](custom-widgets.md) and a native client side implementation. This document describes how to create the native implementation for a custom widget on the Android platform.

In order to implement a custom widget you will need to [build locally](build.md).

### Building upon Cordova infrastructure

To create a Tabris.js custom widget, we make use of the Cordova build system. Therefore we create a Cordova plugin that ties into Tabris.js specific APIs. A Tabris.js custom widget does not require touching any of the Cordova specific Java APIs. All interaction with the JavaScript parts is enabled through Tabris.js specific APIs.

By leveraging the Cordova plugin architecture we are able to make use of the Cordova build chain and to provide a `plugin.xml` in our plugin to customize the build process. Once a plugin is defined it can be consumed by an app via the regular `cordova plugin add <plugin-id/git-url>` shell command or a `<plugin />` entry in the config.xml of an app.

:information_source: A working example of the concepts outlined in this document can be found [here](https://github.com/eclipsesource/tabris-calendar).

## Receiving messages from JavaScript

Creating a custom widget requires handling incoming messages from JavaScript and sending messages back to JavaScript. The main entry point to this communication loop is the `com.eclipsesource.tabris.android.Operator`. The operator provides callback methods for all communication _from_ JavaScript to the native client. The following snippet shows a basic operator that uses the `com.eclipsesource.tabris.android.AbstractViewOperator` as a basis for a `View` specific operator:

```java
public class CalendarOperator extends AbstractViewOperator<CalendarView> {

  public CalendarOperator(Activity activity, TabrisContext tabrisContext) {
    // ..
  }

  @Override
  public String getType() {
    return "com.example.calendar.Calendar";
  }

}
```

The snippet above shows two important aspects of an `Operator`: The class _has to have_ a two argument constructor `CalendarOperator(<Activity>, <TabrisContext>)` and the method `getType()` has to return the name of the custom widget as registered on the [JavaScript side](custom-widgets.md).

## Registering an operator

To make an operator available to the Tabris.js Android runtime we have to register it. The simplest way is to declare our operator in a `meta-data` entry of the `AndroidManifest.xml`.

Since our custom widget is wrapped in a Cordova plug-in we can use the plug-in's `plugin.xml` file to add a new `meta-data` entry into the `AndroidManifest.xml` via the Cordova [`config-file`](https://cordova.apache.org/docs/en/5.0.0/plugin_ref_spec.md.html) directive. The following snippet shows how to declare our operator in the `plugin.xml` so that it is part of the final `AndroidManifest.xml`:

```xml
<plugin xmlns="http://apache.org/cordova/ns/plugins/1.0"
        xmlns:android="http://schemas.android.com/apk/res/android"
        id="com.example.tabris.calendar">

  <platform name="android">
    <config-file target="AndroidManifest.xml" parent="/manifest/application">
      <meta-data
        android:name="com.example.tabris.android.OPERATOR.com.example.tabris.calendar"
        android:value="com.example.tabris.calendar.CalendarOperator" />
    </config-file>
  </platform>

  ...
</plugin>
```

The snippet above inserts the `meta-data` element with its two attributes `name` and `value` into the `AndroidManifest.xml`. The `name` attribute has to be an application wide unique ID with a prefix of `com.eclipsesource.tabris.android.OPERATOR`. In order to make the name unique we append the widget specific ID `.com.eclipsesource.tabris.calendar` to the prefix. The `value` attribute of the `meta-data` element has to contain the fully qualified class name of our `Operator` implementation, eg.: `com.eclipsesource.tabris.calendar.CalendarOperator`.

## Instantiating a widget

With the `Operator` registered we can now instantiate the Android `View` object that we want to display in the UI. To handle a create operation sent from JavaScript we implement the `Operator.create(<Properties>)` method in the operator:

```java
@Override
public CalendarView createView(Properties properties) {
  return new CalendarView(activity);
}
```

The snippet instantiates the Android `android.widget.CalendarView` with the `Activity` passed into the constructor of the `Operator`. The `properties`  argument could contain widget specific configuration directives but is not used in this example.

## Handling properties

While we have instantiated our widget and passed it back to the system, it is not yet visible in the UI. To show an Android `View` it has to be added to the view hierarchy. In order to do that we have to process the `parent` property passed in from JavaScript. The `parent` provides the widget onto which we want to add our custom widget.

Since this is a very common scenario we don't have to implement this ourselves but rather rely on the pre-existing `com.eclipsesource.tabris.android.ViewPropertyHandler`. The `ViewPropertyHandler` implements the `PropertyHandler` interface which provides `get` and `set` methods to support various properties.

The concrete `ViewPropertyHandler` provides default implementations for [common widget properties](https://tabrisjs.com/documentation/latest/api/Widget#properties) like `parent`, `layoutData`, `visible` etc..

To activate the property handler we override `AbstractOperator.getPropertyHandler()` and return the corresponding handler:

```java
@Override
public PropertyHandler<CalendarView> getPropertyHandler(CalendarView calendarView) {
  return propertyHandler;
}
```

By returning the default `ViewPropertyHandler` we have covered all the common widget properties of Tabris.js but it is also possible to extend the `ViewPropertyHandler` to provide your own implementation for a property or to add a custom property. The following snippet shows how to add support for the custom property `date`:

```java
public class CalendarWidgetPropertyHandler extends ViewPropertyHandler<CalendarView> {

  @Override
  public void set(CalendarView view, Properties properties) {
    super.set(view, properties);
    if (properties.hasProperty("date")) {
      view.setDate(properties.getLong("date"), true, false);
    }
  }

  @Override
  public Object get(CalendarView view, String property) {
    if (property.equals("date")) {
      return String.valueOf(view.getDate());
    }
    return super.get(view, property);
  }

}
```

Note how the snippet not only processes incoming properties in the `set` method but also provides a `get` implementation so that the `date` property can be read as well.

## Sending messages to JavaScript

:exclamation: This API is likely going to change.

While receiving an operation from JavaScript covers a lot of ground we also want to send messages proactively to JavaScript. A classic example is a user initiated action like a button tap.

To send a message for a particular widget we use a `com.eclipsesource.tabris.android.RemoteObject`. A `RemoteObject` can be obtained from the `TabrisContext` via the `ObjectRegistry`:

```java
RemoteObject remoteObject = tabrisContext.getObjectRegistry().getRemoteObjectForObject(view);
```

Continuing the example from above the following snippet sends a notify operation to JavaScript when the user changes the date on the `CalendarView`:

```java
private class OnDateChangeListener implements CalendarView.OnDateChangeListener {

  @Override
  public void onSelectedDayChange(@NonNull CalendarView calendarView, int year, int month, int dayOfMonth) {
    String date = // get date from calendarView
    RemoteObject remoteObject = tabrisContext.getObjectRegistry().getRemoteObjectForObject(calendarView);
    remoteObject.notify("change_date", "date", date);
  }

}
```

## Destroying a widget

When a widget is no longer being used we also need to take care of destroying it. In case of our custom Android `View` we receive a destroy operation in the `Operator` and are responsible for cleaning up any resources that are not required anymore. When an `Operator` inherits from the `AbstractViewOperator` the destroy operation will remove the view from the view hierarchy.

```java
@Override
public void destroy(CalendarView calendarView) {
  super.destroy(calendarView);
  // perform any necessary cleanup
}
```
