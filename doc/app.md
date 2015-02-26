# App Information

The object `tabris.app` provides information about the application. It uses the same event API as widgets do (`on`, `off`, `once`, `trigger`). This object supports the following events:

- `pause`: Fired before the application goes into hibernation.
- `resume`: Fired after the application returned from hibernation.

```js
tabris.app.on("pause", function() {
  saveMyData();
});
```
