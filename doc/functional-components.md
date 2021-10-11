---
---
# Functional Components

A functional component is a function that can be used [as a JSX element or plain widget factory](./declarative-ui.md). Such a function needs to fulfill the following requirements:

* Name starts with an upper case.
* Takes an "attributes" object as the first parameter.
* Returns a widget, WidgetCollection or array of widgets.

Self-running example snippets can for different setups be found here:

* [Pure JavaScript](${doc:functional-js-components.js})
* [Pure TypeScript](${doc:functional-js-components-typescript.ts})
* [JavaScript/JSX](${doc:functional-jsx-components.jsx})
* [TypeScript/JSX](${doc:functional-jsx-components-typescript.tsx})

## Basics

Typically a functional component passes on some or all of the given attributes to the widget it returns:

```jsx
const StyledText = attributes => <TextView textColor='red' {...attributes} />;
contentView.append(<StyledText>Hello World!</StyledText>);
```

Or in pure **JavaScript**:
```js
const StyledText = attributes => TextView({textColor: 'red', ...attributes});
contentView.append(StyledText({text: 'Hello World'}));
```

If a JSX element has children (everything within the element's body) they are mapped to the attribute "children". Therefore `<Foo><Bar/></Foo>` is treated like `<Foo children={<Bar/>}/>`.

In **TypeScript** (`.tsx` files) you need to give the proper type of the attributes object:

```tsx
const StyledText = (attributes: Attributes<TextView>) =>
  <TextView textColor='red' {...attributes} />;
```

```ts
const StyledText = (attributes: Attributes<TextView>) =>
  TextView({textColor: 'red', ...attributes});
```

> :point_right: The Attributes interface needs to be imported from `'tabris'`

If your IDE understands jsDocs with TypeScript types you can also do this in **JavaScript/JSX** files:

```jsx
/** @param {Attributes<TextView>=} attributes */
const StyledText = attributes => <TextView textColor='red' {...attributes} />;
```

```js
/** @param {Attributes<TextView>=} attributes */
const StyledText = attributes => TextView({textColor: 'red', ...attributes});
```

A function that is used as a JSX-based functional component can also be used as a selector, as can its name:

```jsx
contentView.find(StyledText).first() === contentView.find('StyledText').first();
```

**However**, this does not work out-of-the-box when using widget factories. In this case you must associate the function itself with the widget it creates. This is done by passing it as the second parameter of the factory call:

```js
/** @param {Attributes<TextView>=} attributes */
const StyledText = attributes => TextView({textColor: 'red', ...attributes}, StyledText);
```

There are two categories of functional components, stateless and dynamic:

## Stateless Functional Components

A "stateless" functional component (SFC) is a functional component that does not add any behavior to the widgets it creates. The most common use case for this is to create an alias for a built-in widget with different defaults such as specific fonts or colors, as seen in the above examples. This is also be called a styled component.

A SFC may also be used to display static data passed as an additional creation attribute. Since there is no consistent way to update the data the component is still considered "stateless". This is also called a static component.

This additional attribute can be conveniently extracted from the rest via parameter destructuring. Here is an easy example using a model Class `Person` which has the properties `firstName` and `lastName`:

```jsx
/** @param {tabris.Attributes<tabris.Widget> & {person: Person}} attributes */
function StaticComponent({person, ...other}) {
  return (
    <TextView {...other}>
      This is always {person.firstName} {person.lastName}
    </TextView>
  );
}
```

## Dynamic Functional Components

All widgets have a special [`data`](./api/Widget.md#data) property that can contain any object. Consequently it can be used with a change listener or the `apply` method for the component to update itself whenever it is changed.

To make `data` useful for dynamic components it behaves different than most properties:

* The widget will fire `dataChanged` events not only if the `data` property is assigned a new object, but also if the object inside it emits change events.
* The initial value of `data` is an empty ${doc:ObservableData} instance, which automatically fires change events for all its properties.
* If `data` is assigned a plain object, that object will be converted to an ${doc:ObservableData} instance.
*  When set as an attribute (via JSX or a widget factory) it is set *after* the listeners have been registered.


### Using a change listener

By attaching a property change listener within the component function the component can be modified. Use this if the returned widget has no children.

```jsx
function PersonDataView(attr) {
  return (<TextView {...attr}/>)
    .onDataChanged(ev =>
      ev.target.text = `This is now ${ev.value?.firstName} ${ev.value?.lastName}`;
    );
}
```

> You can also use the `<Setter>` element to define the change listener as seen [here for JavaScript/JSX](${doc:functional-jsx-components.jsx}) and [here for TypeScript/JSX](${doc:functional-jsx-components-typescript.tsx}).

In **TypeScript** we need to do an extra step keep the type of `data` inside the change event, as it defaults to `any`. You can do this with a runtime check (e.g. `instanceof` or [`checkType`](./api/utils.md#checktypevalue-type-callback)), or by simply declaring the event object type.

Runtime check:

```tsx
function PersonDataView(attributes: Attributes<Widget, Person>) {
  const widget: TextView = <TextView {...attributes}/>;
  return widget
    .onDataChanged(ev => {
      const person = checkType(ev.value, Person, {nullable: true});
      ev.target.text = `This is now ${person?.firstName} ${person?.lastName}`;
    });
}
```

Declare event object:

```tsx
function PersonDataView(attributes: Attributes<Widget, Person>) {
  const widget: TextView = <TextView {...attributes}/>;
  return widget
    .onDataChanged((ev: PropertyChangedEvent<TextView, Person>) =>
      ev.target.text = person
        ? `This is now ${ev.value.firstName} ${ev.value.lastName}`
        : '';
    );
}
```

### Using "apply"

The [`apply`](./selector.md#compositeapply) method/attribute can set computed attributes of several widgets simultaneously in response to a property change. This makes is ideal for functional components that consist of a composite with children.

To do this it must be given a callback that returns a ${doc:RuleSet} that may be derived from the widget's state. When using the [`apply`](./selector.md#compositeapply) attribute or [`<Apply>`](./api/Setter.md#apply) element the callback will be invoked whenever the a widget property emits one ore more change events as described [here](./api/Observable.md#mutationssource).

Example in **JavaScript** using the `apply` attribute:

```jsx
function ComposedComponent(attr) {
  return Stack({
    children: [
      TextView({id: 'firstname', background: '#ee9999'}),
      TextView({id: 'lastname', background: '#9999ee'})
    ],
    apply: widget => ({
      '#firstname': {text: widget.data.firstName || ''},
      '#lastname': {text: widget.data.lastName || ''}
    }),
    ...attr
  }, ComposedComponent);
}
```

And in **TypeScript/JSX** using the `<Apply>` element:

```tsx
function ComposedComponent(attr: Attributes<Widget, Person>) {
  return (
    <Stack {...attr}>
      <TextView id='firstname' background='#ee9999'/>
      <TextView id='lastname' background='#9999ee'/>
      <Apply>
        {({data}: Widget<Person>) => [
          Setter(TextView, '#firstname', {text: data.firstName || ''}),
          Setter(TextView, '#lastname', {text: data.lastName || ''})
        ]}
      </Apply>
    </Stack>
  );
}
```

When calling `apply` on the instance it's default behavior is different compared to the `apply` attribute. If you want to use it to create a dynamic component please read the detailed documentation [here](./selector.md#compositeapply)

### Usage

The usage of a dynamic component is simple:

```jsx
// initial value:
contentView.append(
  <PersonView data={{firstName: 'Jane', lastName: 'Doe'}}/>
);

// exchange the person:
$(PersonView).only().data = {firstName: 'Sam', lastName: 'Doe'};

// modify the person:
$(PersonView).only().data.firstName = 'Sammy';
```

Since plain objects assigned to [`data`](./api/Widget.md#data) are *copied* to new ${doc:ObservableData} instances this following does *not* work:

```js
const newPerson = {firstName: 'Sam', lastName: 'Doe'};
$(PersonView).only().data = newPerson;

// later:
newPerson.firstName = 'Sammy'; // ignored because this is not the object in "data"
```

Instead the `newPerson` needs to be be created as ${doc:ObservableData} to begin with:

```js
const newPerson = ObservableData({firstName: 'Samuel', lastName: 'Rogan'});
$(PersonView).only().data = newPerson;
// later:
newPerson.firstName = 'Sammy'; // OK
```

