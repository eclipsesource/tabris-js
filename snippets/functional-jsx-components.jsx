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
  <Stack padding={8} spacing={8}>
    <StyledComponent>
      This TextView is red on yellow by default
    </StyledComponent>
    <StyledComponent background='gray'>
      Defaults can be overwritten
    </StyledComponent>
    <StaticComponent person={joe}/>
    <DynamicComponent data={joe}/>
    <CheckBox onSelect={buttonClick}>
      Tap to change dynamic component data
    </CheckBox>
  </Stack>
);

/** @param {tabris.Attributes<TextView>} attributes */
function StyledComponent(attributes) {
  return (
    <TextView textColor='red' background='yellow' {...attributes}/>
  );
}

/** @param {tabris.Attributes<tabris.Widget> & {person: Person}} attributes */
function StaticComponent({person, ...other}) {
  return (
    <TextView {...other}>
      This is always {person.firstName} {person.lastName}
    </TextView>
  );
}

/** @param {tabris.Attributes<tabris.Widget> & {data: Person}} attributes */
function DynamicComponent({data, ...other}) {
  /** @type {TextView} */
  const widget = <TextView {...other}/>;
  return widget
    .onDataChanged(ev => {
      const person = checkType(ev.value, Person, {nullable: true});
      ev.target.text = person ? `This is now ${person.firstName} ${person.lastName}` : '';
    })
    .set({data}); // needs to be set last to trigger the first change event
}

/** @param {tabris.CheckBoxSelectEvent} ev */
function buttonClick(ev) {
  $(DynamicComponent).only().data = ev.checked ? sam : joe;
}

