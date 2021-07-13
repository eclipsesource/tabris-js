## Related Types

### PropertyChangedEvent&lt;TargetType, ValueType&gt;

* JavaScript Type: `tabris.EventObject`
* TypeScript Type: `PropertyChangedEvent`

```ts
interface PropertyChangedEvent<TargetType, ValueType> extends EventObject<TargetType>{
  readonly value: ValueType;
  readonly originalEvent: PropertyChangedEvent<object, unknown> | null;
}
```

An event object fired when an object property changes. It is an instance of [`EventObject`](./EventObject.md) that provides an additional property `value` containing the new value.

The TypeScript interface is generic with two type parameters, the first is the type of the target and the second is the type of the value that changed.

A `PropertyChangedEvent` event may also be issued for a property change on a child object. This is supported by the widget [`data`](${doc:WidgetUrl}#data) property, and by all properties on ${doc:ObservableData}. In that case the change event on the parent will contain a reference to the change event fired by the child in `originalEvent`.

Example:

```js
widget.onDataChanged(ev => console.log(ev.originalEvent?.value));
widget.data.foo = 1; // print "1"
```
