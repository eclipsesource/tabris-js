import {TextView, Attributes, contentView, Stack, Widget, CheckBox, CheckBoxSelectEvent, checkType} from 'tabris';

class Person {
  constructor(
    public lastName: string,
    public firstName: string
  ) {}
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

function StyledComponent(attributes: Attributes<TextView>) {
  return (
    <TextView textColor='red' background='yellow' {...attributes}/>
  );
}

type PersonAttr = Attributes<Widget> & {person: Person};
function StaticComponent(attributes: PersonAttr) {
  const {person, ...other} = attributes;
  return (
    <TextView {...other}>
      This is always {person.firstName} {person.lastName}
    </TextView>
  );
}

type PersonDataAttr = Attributes<Widget> & {data: Person};
function DynamicComponent(attributes: PersonDataAttr) {
  const {data, ...other} = attributes;
  const widget: TextView  = <TextView {...other}/>;
  return widget
    .onDataChanged(ev => {
      const person = checkType(ev.value, Person, {nullable: true});
      ev.target.text = person ? `This is now ${person.firstName} ${person.lastName}` : '';
    })
    .set({data}); // needs to be set last to trigger the first change event
}

function buttonClick(ev: CheckBoxSelectEvent) {
  $(DynamicComponent).only().data = ev.checked ? sam : null;
}
