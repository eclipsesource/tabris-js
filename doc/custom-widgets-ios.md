---
---
# Custom Widgets on iOS

A Tabris.js widget consists of a [JavaScript API](custom-widgets.md) and a native client side implementation. This document describes how to create the native implementation for a custom widget on the iOS platform.

In order to implement a custom widget you will need to [build locally](build.md).

### Building upon Cordova infrastructure

To create a Tabris.js custom widget, we make use of the Cordova build system. Therefore we create a Cordova plugin that ties into Tabris.js specific APIs. In fact creating a Tabris.js custom widget does not require touching any of the Cordova specific APIs. All interaction with the JavaScript parts is enabled through Tabris.js specific APIs.

By leveraging the Cordova plugin architecture, we make use of the Cordova build chain and provide a `plugin.xml` in our plugin to customize the build process. Once a plugin is defined it can be consumed by an app via the regular `cordova plugin add <plugin-id/git-url>` shell command or a `<plugin />` entry in the config.xml of an app.

:information_source: A working example of the concepts outlined in this document can be found [here](https://github.com/eclipsesource/tabris-maps).

## Implementing your new widget

> :point_right: When implementing and/or overriding a method, check if you need to call `super`!

### Initializers

To develop a new widget that can communicate with the JavaScript side, you create a new class that subclasses `BasicWidget`. `BasicWidget` has two initializers you’ll need to override.

The first initializer is `- (instancetype)initWithObjectId:(NSString *)objectId andClient:(TabrisClient *)client`. It is the designated initializer of all widgets and all other initializers should call it. This initializer should contain all the code that is necessary to run the widget (e.g. create new instance of view) and it should always call its `super`.

The second initializer is `- (instancetype)initWithObjectId:(NSString *)objectId properties:(NSDictionary *)properties andClient:(TabrisClient *)client`. This initializer is called directly by the JavaScript and should always call the aforementioned designated initializer (or some other initializer that calls it). The `properties` parameter contains all of the parameters that were passed by constructor in JavaScript. You should extract and set those after the designated initializer has been executed.

### Required methods

Implementation of the following methods is required:

```objc
+ (NSString *)remoteObjectType;
+ (NSMutableSet *)remoteObjectProperties;
- (UIView *)view;
```

`+ (NSString *)remoteObjectType` must return the unique identifier of the widget. Using reverse domain name notation is advised (e.g. `@“com.mydomain.MyWidget”`). It must return the same value as type declared in JavaScript (e.g. `_type: “com.mydomain.MyWidget”`). This method does not require a `super` call.

`+ (NSMutableSet *)remoteObjectProperties` contains all of the widget’s properties that can be accessed by JavaScript. You have to call `super` of this method first. Afterwards add the names of properties defined by your widget to this set, to expose those to JavaScript.

`- (UIView *)view` returns the actual instance of the iOS native widget. You should have property in your class that will be returned by this method. This method does not require a `super` call.

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

If the JavaScript invokes a `beep` method, the call will be forwarded to the native `- (void)beep:(NSDictionary *)parameters` method. Please note that methods you are registering have to accept `NSDictionary` as a parameter. This dictionary contains all of the parameters passed by JavaScript to the native side.

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

You have to execute following instructions after you add a plugin (e.g. `cordova plugin add`) to your project. Locate your Xcode project file (typically located in `platforms/ios/`) and open it.

The final step of this process is adding your new widget to widget registry. To do this edit the `AppDelegate.m` in your project to:

* Import your plugins header file (e.g. `#import "MyWidget.h"`)
* Find the `- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions` method. Inside of this method you have add following line `[self.client addRemoteObject:[MyWidget class]];` along the other calls of `addRemoteObject:` method.

### Other methods

Following methods can be overridden:

* `- (void)destroy` - Called upon destruction of a widget.
* `- (void)addObject:(id<RemoteObject>)object` &ndash; Called when a child object sets this object as parent.
* `- (void)removeObject:(id<RemoteObject>)object` &ndash; Called when a child object is being removed (e.g. when child is destroyed).
* `- (void)addWidgetView:(id<Widget>)widget` &ndash; Used to add a UIView of a child to this widget’s view hierarchy.
* `- (void)childObjectChanged:(id<RemoteObject>)object` &ndash; Will be called when a child object calls `[self notifyObjectChange]`.

## Swift

In order to develop a Tabris plugin in Swift, you’ll have to open your project in Xcode and adjust couple of things:

* Add a new Swift class to your project. Xcode will ask to create a bridging header (if you don't have one). You have to confirm its creation.
* Go to the bridging header and impor the Tabris headers to this file.
* Go to the `Build Settings` of your project and find `Defines Module` and `Enable Modules (C and Objective-C)`. Set both of them to `Yes`.
* There is a second special header file that bridges Swift to Objective-C. It is automatically generated by Xcode upon build time and is not a part of your projects structure. Therefore, after adding new classes or methods in Swift you need to rebuild the project to make them visible on Objective-C. This is very important because you need to register your widgets in `AppDelegate.m`, which is written in Objective-C. This header file has your projects name and the `-Swift.h` suffix (e.g. `MyProject-Swift.h`). You have to import it in `AppDelegate.m`. After you do this, register your widget as stated previously.
