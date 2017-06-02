Example:

```js
var lang = tabris.device.language;

tabris.device.on("orientationChanged", function(event) {
  console.log("new orientation:", event.value);
});
```
