## As JSX Element

This function can also be used as a [JSX element](./declarative-ui.md#jsx-specifics) inside another element to set on of its attributes. This is equivalent to setting the attribute directly in the parent element, but allows neatly inlining a multi-line expression such as an object literal or function. (Technically a JSX attribute can be multi-line as well, but this would look rather confusing.)

As a element `Setter` itself requires the following attributes:

Attribute | type | Description
-|-|-
`target`| Constructor | The type of the parent element.
`attribute`| string | The attribute to set.

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
