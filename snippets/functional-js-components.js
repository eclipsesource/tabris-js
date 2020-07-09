import {TextView, contentView, Stack, CheckBox, checkType} from 'tabris';

class Person {
  /**
   * @param {string} lastName
   * @param {string} firstName
   */
  constructor(lastName, firstName) {
    this.lastName = lastName;
    this.firstName = firstName;
  }
}

const joe = new Person('Rogan', 'Joe');
const sam = new Person('Harris', 'Sam');

contentView.append(
  Stack({padding: 8, spacing: 8, children: [
    StyledComponent({text: 'This TextView is red on yellow by default'}),
    StyledComponent({background: 'gray', text: 'Defaults can be overwritten'}),
    StaticComponent({person: joe}),
    DynamicComponent({data: joe}),
    CheckBox({
      onSelect: (ev => {
        $(DynamicComponent).only(TextView).data = ev.checked ? sam : joe;
      }),
      text: 'Tap to change dynamic component data'
    })
  ]})
);

/** @param {tabris.Attributes<TextView>} attributes */
function StyledComponent(attributes) {
  return TextView({textColor: 'red', background: 'yellow', ...attributes});
}

/** @param {tabris.Attributes<tabris.Widget> & {person: Person}} attributes */
function StaticComponent({person, ...attr}) {
  return TextView({
    text: `This is always ${person.firstName} ${person.lastName}`, ...attr
  });
}

/** @param {tabris.Attributes<tabris.Widget> & {data: Person}} attributes */
function DynamicComponent({data, ...attr}) {
  return TextView(attr, DynamicComponent)
    .onDataChanged(ev => {
      const person = checkType(ev.value, Person, {nullable: true});
      ev.target.text = person ? `This is now ${person.firstName} ${person.lastName}` : '';
    })
    .set({data}); // needs to be set last to trigger the first change event
}
