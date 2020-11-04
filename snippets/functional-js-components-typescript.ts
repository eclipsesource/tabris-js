import {TextView, Attributes, contentView, Stack, Widget, CheckBox, checkType, Setter} from 'tabris';

class Person {
  constructor(
    public lastName: string,
    public firstName: string
  ) {}
}

const joe = new Person('Rogan', 'Joe');
const sam = new Person('Harris', 'Sam');

contentView.append(
  Stack({padding: 8, spacing: 8, children: [
    StyledComponent({text: 'This TextView is red on yellow by default'}),
    StyledComponent({background: 'gray', text: 'Defaults can be overwritten'}),
    StaticComponent({person: joe}),
    DynamicComponent({data: joe}),
    ComposedComponent({data: joe}),
    CheckBox({
      onSelect: ev => {
        $(DynamicComponent).only().data = ev.checked ? sam : joe;
        $(ComposedComponent).only().data = ev.checked ? sam : joe;
      },
      text: 'Tap to change dynamic component data'
    })
  ]})
);

function StyledComponent(attributes: Attributes<TextView>) {
  return TextView({textColor: 'red', background: 'yellow', ...attributes});
}

type PersonAttr = Attributes<Widget> & {person: Person};
function StaticComponent({person, ...attr}: PersonAttr) {
  return TextView({
    text: `This is always ${person.firstName} ${person.lastName}`, ...attr
  });
}

type PersonDataAttr = Attributes<Widget> & {data: Person};

function DynamicComponent({data, ...attr}: PersonDataAttr) {
  return TextView(attr, DynamicComponent)
    .onDataChanged(ev => {
      const person = checkType(ev.value, Person, {nullable: true});
      ev.target.text = person ? `This is now ${person.firstName} ${person.lastName}` : '';
    })
    .set({data}); // needs to be set last to trigger the first change event
}

function ComposedComponent(attr: PersonDataAttr) {
  return Stack({
    children: [
      TextView({id: 'firstname', background: '#ee9999'}),
      TextView({id: 'lastname', background: '#9999ee'})
    ],
    apply: ({data}: {data: Partial<Person>}) => ({
      '#firstname': Setter(TextView, {text: data?.firstName || ''}),
      '#lastname': Setter(TextView, {text: data?.lastName || ''})
    }),
    ...attr
  }, ComposedComponent);
}
