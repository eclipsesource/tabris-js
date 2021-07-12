import {TextView, contentView, Stack} from 'tabris';

const examples = new Stack({padding: 8, spacing: 8}).appendTo(contentView);

// Styled Component:

/** @param {tabris.Attributes<TextView>} attr */
const ColorfulText = attr =>
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

/** @typedef {{firstName?: string, lastName?: string}} Person */

/**
 * @param {tabris.Attributes<TextView> & {person: Person}} attr
 **/
const PersonText = ({person, ...attr}) => TextView({
  ...attr,
  text: `Hello ${person.firstName} ${person.lastName}`
}, PersonText);

examples.append(
  PersonText({person: {firstName: 'Jane', lastName: 'Doe'}})
);

// Dynamic component displaying data in a TextView:

/**
 * @param {tabris.Attributes<tabris.Widget, Person>} attr
 * @returns {tabris.Widget<Person>}
 **/
const PersonDataView = attr => TextView({
  ...attr,
  onDataChanged: ev =>
    ev.target.text = `Hello ${ev.value.firstName} ${ev.value.lastName}`
}, PersonDataView);

examples.append(
  PersonDataView({data: {firstName: 'Sam', lastName: 'Rogan'}})
);

// Component displaying data dynamically in a composed UI:

/**
 * @param {tabris.Attributes<tabris.Widget, Person>} attr
 * @returns {tabris.Widget<Person>}
 **/
const PersonView = attr => Stack({
  ...attr,
  /** @param {tabris.Widget<Person>} widget */
  apply: ({data}) => ({
    '#firstname': {text: data.firstName},
    '#lastname': {text: data.lastName}
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
