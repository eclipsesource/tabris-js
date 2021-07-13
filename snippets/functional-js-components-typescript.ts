import {TextView, Attributes, contentView, Stack, Widget, Setter, PropertyChangedEvent, ObservableData} from 'tabris';

const examples = new Stack({padding: 8, spacing: 8}).appendTo(contentView);

// Styled Component:

const ColorfulText = (attr: Attributes<TextView>) =>
  TextView({textColor: 'red', background: 'yellow', ...attr});

examples.append(
  ColorfulText({
    text: 'This text is red and yellow'
  }),
  ColorfulText({
    background: 'gray',
    text: 'But this one has a gray background'
  })
);

// Component displaying immutable data in a TextView:

type Person = {firstName?: string, lastName?: string};

const PersonText = (
  {person, ...attr}: Attributes<TextView> & {person: Person}
) => TextView({
  ...attr,
  text: `Hello ${person.firstName} ${person.lastName}`
}, PersonText);

examples.append(
  PersonText({person: {firstName: 'Jane', lastName: 'Doe'}})
);

// Dynamic component displaying data in a TextView:

const PersonDataView = (attr: Attributes<Widget, Person>): Widget<Person> =>
  TextView({
    ...attr,
    onDataChanged: ({target, value}: PropertyChangedEvent<TextView, Person>) =>
      target.text = `Hello ${value.firstName} ${value.lastName}`
  }, PersonDataView);

examples.append(
  PersonDataView({data: {firstName: 'Sam', lastName: 'Rogan'}})
);

// Component displaying data dynamically in a composed UI:

const PersonView = (attr: Attributes<Widget, Person>): Widget<Person> =>
  Stack({
    ...attr,
    apply: ({data}: Widget<Person>) => ({
      '#firstname': Setter(TextView, {text: data?.firstName || ''}),
      '#lastname': Setter(TextView, {text: data?.lastName || ''})
    }),
    children: [
      TextView({id: 'firstname', background: '#ee9999'}),
      TextView({id: 'lastname', background: '#9999ee'})
    ]
  }, PersonView);

examples.append(
  PersonView({data: {firstName: 'Joe', lastName: 'Harris'}})
);

// Example how data can be manipulated after creation (type-safe):

setTimeout(() => {

  // direct manipulation
  $(PersonDataView).only().data.firstName = 'John';

  // indirect using ObservableData
  const newPerson = ObservableData({firstName: 'Samuel', lastName: 'Rogan'});
  $(PersonView).only().data = newPerson;
  setTimeout(() => newPerson.firstName = 'Sammy', 1000);

}, 1000);
