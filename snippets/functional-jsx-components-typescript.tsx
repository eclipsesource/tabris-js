import {TextView, Attributes, contentView, Stack, Widget, CheckBox, checkType, Setter, Apply} from 'tabris';

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
    <ComposedComponent data={joe}/>
    <CheckBox>
      Tap to change dynamic component data
      <Setter attribute='onSelect' target={CheckBox}>
        {ev => {
          $(DynamicComponent).only().data = ev.checked ? sam : joe;
          $(ComposedComponent).only().data = ev.checked ? sam : joe;
        }}
      </Setter>
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

function ComposedComponent(attr: PersonDataAttr) {
  return (
    <Stack {...attr}>
      <TextView id='firstname' background='#ee9999'/>
      <TextView id='lastname' background='#9999ee'/>
      <Apply>
        {({data}: {data: Partial<Person>}) => [
          Setter(TextView, '#firstname', {text: data.firstName || ''}),
          Setter(TextView, '#lastname', {text: data.lastName || ''})
        ]}
      </Apply>
    </Stack>
  );
}
