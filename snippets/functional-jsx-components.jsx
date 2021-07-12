import {TextView, contentView, Stack, Setter, Apply} from 'tabris';

const examples = new Stack({padding: 8, spacing: 8}).appendTo(contentView);

// Styled Component:

/**
 * @param {tabris.Attributes<TextView>} attr
 * @returns {TextView}
 **/
const ColorfulText = attr => (
  <TextView textColor='red' background='yellow' {...attr}/>
);

examples.append(
  <$>
    <ColorfulText>
      This text is red and yellow
    </ColorfulText>
    <ColorfulText background='gray'>
      But this one has a gray background
    </ColorfulText>
  </$>
);

// Component displaying immutable data in a TextView:

/** @typedef {{firstName: string, lastName: string}} Person */

/**
 * @param {tabris.Attributes<TextView> & {person: Person}} attr
 * @returns {TextView}
 **/
const PersonText = ({person, ...attr}) => (

  <TextView {...attr}>
    Hello {person.firstName} {person.lastName}
  </TextView>

);

examples.append(
  <PersonText person={{firstName: 'Jane', lastName: 'Doe'}}/>
);

// Dynamic component displaying data in a TextView:

/**
 * @param {tabris.Attributes<tabris.Widget, Person>} attr
 * @returns {tabris.Widget<Person>}
 **/
const PersonDataView = attr => (

  <TextView {...attr}>
    <Setter target={TextView} attribute='onDataChanged'>
      {ev => ev.target.text = `Hello ${ev.value.firstName} ${ev.value.lastName}`}
    </Setter>
  </TextView>

);

examples.append(
  <PersonDataView data={{firstName: 'Sam', lastName: 'Rogan'}}/>
);

// Component displaying data in a composed UI:

/**
 * @param {tabris.Attributes<tabris.Widget, Person>} attr
 * @returns {tabris.Widget<Person>}
 **/
const PersonView = attr => (

  <Stack {...attr}>
    <Apply>
      {
        /** @param {tabris.Widget<Person>} widget */
        ({data}) => ({
          '#firstname': {text: data.firstName},
          '#lastname': {text: data.lastName}
        })
      }
    </Apply>
    <TextView>Hello</TextView>
    <TextView id='firstname' background='#ee9999'/>
    <TextView id='lastname' background='#9999ee'/>
  </Stack>

);

examples.append(
  <PersonView data={{firstName: 'Joe', lastName: 'Harris'}}/>
);

// Example how data can be manipulated after creation (type-safe):

setTimeout(() => {

  $(PersonDataView).only().data.firstName = 'John';
  $(PersonView).only().data = {firstName: 'Samuel', lastName: 'Rogan'};

}, 1000);
