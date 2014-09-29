Cloud Push
==========

Tabris.js can handle messages received from platform specific remote cloud push
services. An application signature should be integrated in each tabris.js client
to authorize it for the cloud push service. The native push component sends a
registration request to the remote cloud push service, which sends back a token.
It is received with a registration event in tabris.js. This token should be
stored on a messaging server, which the developers should create themselves.
Tabris.js does not support the developer in any way to write the messaging
component. It is expected that the developer creates a separate server-side
message push component which communicates with tabris.js. It sends the push
messages to the cloud service together with the token, and it in turn then
notifies the tabris.js client. Tabris.js uses a message event to notify the
application of the received message.

Currently tabris.js supports the following push services:

* iOS: APNS (Apple Push Notification Service)
* Android: GCM (Google Cloud Messaging for Android)

tabris.js
---------

To communicate with the native client one should first initialize a CloudPush
proxy object in tabris.js.

```javascript
var cloudPush = tabris.create("tabris.CloudPush");
```

Upon registration the token received with the `Registered` event should be
forwarded to the messaging server of the developer.

```javascript
var registeredHandler = function(token) {
  // handle token
};
cloudPush.on("Registered", registeredHandler);
```

To handle received push messages and errors the `MessageReceived` and
`ErrorReceived` events should be listened for on the proxy.

```javascript
var messageHandler = function(message) {
  // handle message
};
var errorHandler = function(error) {
  // handle error
};
cloudPush.on("MessageReceived", messageHandler);
cloudPush.on("ErrorReceived", errorReceived);
```

**Note:** Listening to a `Notification` event might not be a good solution for
enabling the client for push notifications. See tabris-js issue #86.

The native client will be enabled for receiving push messages after listening
for the `Notification` event type. This will also trigger the registration request.

```javascript
cloudPush.on("Notification", function() {});
```
