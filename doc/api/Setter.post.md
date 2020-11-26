## As JSX Element

This function can also be used as a [JSX element](../declarative-ui.md#jsx-specifics) inside another element to set on of its attributes. This is equivalent to setting the attribute directly in the parent element, but allows neatly inlining a multi-line expression such as an object literal or function. (Technically a JSX attribute can be multi-line as well, but this would look rather confusing.)

As a element `Setter` itself requires the following attributes:

Attribute | type | Description
-|-|-
`target`| `Constructor` | The type of the parent element.
`attribute`| `string` | The attribute to set.

The value to be set is then contained within the `Setter` element's body. Example:

```jsx
contentView.append(
  <Stack>
    <Button text='Simple dialog'>
      <Setter target={Button} attribute='onSelect'>
        {async () => {
          await AlertDialog.open('Hello').onClose.promise();
          $().only(TextView).text = 'Dialog closed';
        }}
      </Setter>
    </Button>
    <TextView/>
  </Stack>
);
```

This is equivalent to:

```jsx
contentView.append(
  <Stack>
    <Button text='Simple dialog' onSelect={showSimpleDialog}/>
    <TextView/>
  </Stack>
);

async function showSimpleDialog() {
  await AlertDialog.open('Hello').onClose.promise();
  $().only(TextView).text = 'Dialog closed';
}
```

Which is better is a matter of taste.

If an attribute is set both directly and via `Setter` an error will be thrown. Similarly, you can not specify multiple setter for the same attribute in the same parent element.

### Apply

The `Apply` element is `Setter` for the `apply` attribute. It can be used to invoke `apply` on a `<Composite>` element (or any of its subclasses):

```jsx
<Stack>
  <Apply>{ {TextView: {font: '24px'}} }</Apply>
  <TextView>Hello</TextView>
  <TextView>World</TextView>
</Stack>
```

Alternatively it can be used with attributes to create a single rule. A single composite can contain multiple `<Apply>` elements, so this syntax still allows multiple rules.

All attributes are optional.

Attribute | type | Description
-|-|-
`target`| `Constructor` | The type of the target widget(s).
`selector`| ${doc:SelectorString} | The selector matching the target widget(s). If omitted the `target` is also the selector.
`attr`| `Attributes` | The attributes to apply to the target widget(s). Alternatively the attributes may be put in to the elements body.

Example:

```js
<Composite padding={8}>
  <Apply target={TextView} selector='#foo' attr={ {textColor: 'white' } }/>
  <Apply target={TextView} selector='#bar' attr={ {font: '24px'} }/>
  <Apply target={TextView}>
    { {
      top: 'prev() 10',
      background: '#66E'
    } }
  </Apply>
  <TextView id='foo'>Hello</TextView>
  <TextView id='bar'>World</TextView>
</Composite>
```
