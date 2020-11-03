## Related Types

### RuleSet

JavaScript type: `Object`, `Function`
TypeScript type: `RuleSetObject | ((widget: this) => RuleSetObject`

Either a [ruleset object](#rulesetobject) or callback that returns ruleset object. The callback is given the instance of the widget it is called for.

See also the article ["Selector API"](../selector.md#compositeapply).

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
