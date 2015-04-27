Example:

```js
var lang = tabris.device.get("language");

tabris.device.on("change:orientation", function(event) {
  console.log("new orientation:", event.value);
});
```
