Example:

```js
var lang = tabris.device.get("language");

tabris.device.on("change:orientation", function(device, orientation) {
  console.log("new orientation:", orientation);
});
```
