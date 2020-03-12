## Related Types

### PropertyChangedEvent&lt;TargetType, ValueType&gt;

* JavaScript Type: `tabris.EventObject`
* TypeScript Type: `PropertyChangedEvent`

```ts
interface PropertyChangedEvent<TargetType, ValueType> extends EventObject<TargetType>{
  readonly value: ValueType
}
```

An event object fired when an object property changes. It is an instance of [`EventObject`](./EventObject.md) that provides an additional property `value` containing the new value.

The TypeScript interface is generic with two type parameters, the first is the type of the target and the second is the type of the value that changed.
