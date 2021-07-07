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
 * @param {{person: Person} & tabris.Attributes<TextView>} attr
 * @returns {TextView}
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
 * @typedef {tabris.Widget & {data: Person}} PersonWidget
 * @typedef {tabris.Attributes<tabris.Widget> & {data: Person}} PersonAttr
 */

/**
 * @param {PersonAttr} attr
 * @returns {TextView & {data: Person}}
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
 * @param {PersonAttr} attr
 * @returns {Stack & {data: Person}}
 **/
const PersonView = attr => Stack({
  ...attr,
  apply: widget => ({
    '#firstname': {text: widget.data.firstName},
    '#lastname': {text: widget.data.lastName}
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

  $(PersonDataView).only().data = {firstName: 'Joe', lastName: 'Harris'};
  $(PersonView).only().data = {firstName: 'Sam', lastName: 'Rogan'};

}, 1000);
