import {TextView, Attributes, contentView, Stack, Widget, Setter} from 'tabris';

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
  {person, ...attr}: {person: Person} & Attributes<TextView>
) => TextView({
  ...attr,
  text: `Hello ${person.firstName} ${person.lastName}`
}, PersonDataView);

examples.append(
  PersonText({person: {firstName: 'Jane', lastName: 'Doe'}})
);

// Dynamic component displaying data in a TextView:

type PersonAttr = Attributes<Widget> & {data: Person};

const PersonDataView = (attr: PersonAttr): TextView & {data: Person} =>
  TextView({
    ...attr,
    onDataChanged: ev => {
      const person = ev.value as Person;
      ev.target.text = `Hello ${person.firstName} ${person.lastName}`;
    }
  }, PersonDataView);

examples.append(
  PersonDataView({data: {firstName: 'Sam', lastName: 'Rogan'}})
);

// Component displaying data dynamically in a composed UI:

const PersonView = (attr: PersonAttr): Stack & {data: Person} =>
  Stack({
    ...attr,
    apply: ({data}: {data: Partial<Person>}) => ({
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

  $(PersonDataView).only().data.firstName = 'John';
  $(PersonView).only().data = {firstName: 'Samuel', lastName: 'Rogan'};

}, 1000);
