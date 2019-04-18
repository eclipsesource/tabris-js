---
---
# Custom Widgets on iOS

A Tabris.js widget consists of a [JavaScript API](custom-widgets.md) and a native client-side implementation. This document describes how to create the native implementation for a custom widget on the iOS platform.

In order to implement a custom widget, you will need to [build locally](build.md).

### Building upon Cordova infrastructure

To create a Tabris.js custom widget, we make use of the Cordova build system. Therefore we create a Cordova plugin that ties into Tabris.js specific APIs. In fact, creating a Tabris.js custom widget does not require touching any of the Cordova specific APIs. All interaction with the JavaScript parts is enabled through Tabris.js specific APIs.

By leveraging the Cordova plugin architecture, we make use of the Cordova build chain and provide a `plugin.xml` in our plugin to customize the build process. Once a plugin is defined it can be consumed by an app via the regular `cordova plugin add <plugin-id/git-url>` shell command or a `<plugin />` entry in the config.xml of an app.

:information_source: A working example of the concepts outlined in this document can be found [here](https://github.com/eclipsesource/tabris-maps).

## Implementing your new widget

> :point_right: When implementing and/or overriding a method, check if you need to call `super`!

### Widget hierarchy

`BasicObject` is at the bottom of Tabris.js widget hierarchy. It can interact with JavaScript but cannot have any UI elements. The most common use case for this class is a widget which does not need UI elements.

`BasicWidget` inherits from `BasicObject`. `BasicWidget` is not capable of receiving touch inputs. If your widget needs touch input please use `Control` widget as your superclass.

`Control` inherits from `BasicWidget` implements all of the necessary things to provide a full widget. This class can receive touch inputs, contain other widgets.

### Initializers

To develop a new widget that can communicate with the JavaScript side, you have to create a new class that subclasses one of the classes mentioned in `Widget Hierarchy` paragraph. `BasicObject` and all of its subclasses has a designated initializer you’ll need to override.

```objc
- (instancetype)initWithObjectId:(NSString *)objectId properties:(NSDictionary *)properties andClient:(TabrisClient *)client;
```

`properties` parameter contains all of the constructor parameters passed from JavaScript to the native side.

### Required methods

Implementation of the following methods is required:

```objc
+ (NSString *)remoteObjectType;
+ (NSMutableSet *)remoteObjectProperties;
```

`+ (NSString *)remoteObjectType` must return the unique identifier of the widget. Using reverse domain name notation is advised (e.g. `@“com.mydomain.MyWidget”`). It must return the same value as type declared in JavaScript (e.g. `_type: “com.mydomain.MyWidget”`). This method does not require a `super` call.

`+ (NSMutableSet *)remoteObjectProperties` contains all of the widget’s properties that can be accessed by JavaScript. You have to call `super` of this method first. Afterward add the names of properties defined by your widget to this set, to expose those to JavaScript.

### Defining UI

In order for Tabris.js to be able to present your widget, you need to define it first. You should consider making a container view your widget which will contain all of the necessary UI elements. After doing so you need call `[self defineWidgetView:self.myWidgetContainerView]`. This is best done in the constructor.

If you are inheriting from `Control` you need to set `interactiveWhenEnabled` to `YES` in order to enable touch inputs. This is also best done in the constructor.

### Calls from the JavaScript

The JavaScript API can invoke methods on the native widget. To do this, you have to register a selector for the specific JavaScript call. Here is an example:

```objc
- (instancetype)initWithObjectId:(NSString *)aId andClient:(TabrisClient *)tabrisClient {
  self = [super initWithObjectId:aId andClient:tabrisClient];
  if (self) {
    //Prior initialization
    [self registerSelector:@selector(beep:) forCall:@"beep"];
    //Following initialization
  }
  return self;
}

- (void)beep:(NSDictionary *)parameters {
}
```

If the JavaScript invokes a `beep` method, the call will be forwarded to the native `- (void)beep:(NSDictionary *)parameters` method. Please note that the methods you are registering have to accept `NSDictionary` as a parameter. This dictionary contains all of the parameters passed by JavaScript to the native side.

### Events

Events are notifications sent from the native side to JavaScript. In order to add an event to your widget, you only have to declare a public boolean property conforming to this naming pattern: `eventNameListener` (e.g. `longPressListener`). Please note you should not change the value of this property inside of your native code.

```objc
@interface MyWidget : BasicWidget
@property (assign) BOOL myEventListener;
@end

@implementation MyWidget

- (void)someMethod {
  //Method implementation
  if (self.myEventListener) {
    Message<Notification> *message = [[self notifications] forObject:self];
    [message fireEvent:@"myEvent" withAttributes:@{@"key":@"value", @"otherKey":@"otherValue"}];
  }
}
```

### Registering your widget

In order for Tabris.js to know about your custom widget, you need to register it. In order to do this you need to add the following XML to your `plugin.xml`:

```xml
<config-file target="*TabrisPlugins.plist" parent="classes">
  <array>
    <string>MyClassName</string>
    <string>MyAnotherClassName</string>
    ...
  </array>
</config-file>
```

You only need to register classes that should be accessible from JavaScript.

### Other methods

Following methods can be overridden:

* `- (void)destroy` - Called upon destruction of a widget.
* `- (void)addObject:(id<RemoteObject>)object` &ndash; Called when a child object sets this object as parent.
* `- (void)removeObject:(id<RemoteObject>)object` &ndash; Called when a child object is being removed (e.g. when child is destroyed).
* `- (void)childObjectChanged:(id<RemoteObject>)object` &ndash; Will be called when a child object calls `[self notifyObjectChange]`.
