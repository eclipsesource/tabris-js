## Related Types

### RuleSet

JavaScript type: `Object` or `Array` or `Function`
TypeScript type: `RuleSetStatic | RuleSetCallback`;

A set of static rules (multiple via array) or a callback that returns of of the former.

See also the article ["Selector API"](../selector.md#compositeapply).

### RuleSetStatic

JavaScript type: `Object` or `Array`
TypeScript type: `RuleSetObject | Attributes | Array<RuleSetObject|Attributes>`;

One or more `RuleSetObject` or `Attributes` objects. Both can be created by [`Setter`](./Setter.md), but an `Attributes` object **must** be created by that function so the constructor can be used as the selector.

```js
widget.apply([
  Setter(TextView, {background: 'blue'}), // matches all TextView widgets
  Setter(TextView, '#foo', {text: 'foo'}) // matches widget with id "foo", must be a TextView
]);
```

### RuleSetObject

JavaScript type: `Object`
TypeScript type: `{[selector]: Attributes}`

A plain object with selectors as keys and attribute objects as values.

Example:

```js
{
  '#okbutton': {text: 'OK!', onSelect: handleOk},
  '#cancelbutton': {text: 'Cancel!', onSelect: handleCancel}
}
```

The order in which the attribute objects are applied depends on the type of selectors being used. The order is:

- `'*'` > `'Type'` > `'.class'` > `'#id'`


When using child selectors, the more specific selector is applied first.

See also the article ["Selector API"](../selector.md#compositeapply).

### RuleSetCallback

JavaScript type: `Function`
TypeScript type: `(target: Widget) => RuleSetStatic;`

A function that is given of the target widget and must return a [`RuleSetStatic`](#rulesetstatic) or array of them.
