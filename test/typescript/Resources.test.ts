import {Resources, Color, ColorValue, ResourceData} from 'tabris';

let str: string;
let color: Color;
let colorValue: ColorValue;

// Typing by subclassing, fixed entry names, suitable for DI
class MyStringResources extends Resources<string> {

  public foo: string;
  public bar: string;

  constructor(data: ResourceData<MyStringResources>) {
    super({data});
  }

}

const myStrings = new MyStringResources({foo: 'foo', bar: {en: 'bar', de: 'baz'}});
str = myStrings.foo;
str = myStrings.bar;

// Subclassing with inherited values, conversion, type checking
class MyColorResources extends Resources<Color, ColorValue> {

  public foo: Color;
  public bar: Color;

  constructor(data: Partial<ResourceData<MyColorResources, ColorValue>>, base?: Partial<MyColorResources>) {
    super({
      data, base,
      converter: Color.from,
      type: Color,
      validator: Color.isValidColorValue
    });
  }

}

const myColors = new MyColorResources({
  foo: 'red',
  bar: {
    android: {red: 0, green: 1, blue: 2},
    ios: new Color(0, 1, 2)
  }
});
const myColors2 = new MyColorResources({bar: [0, 1, 4]}, myColors);
color = myColors2.foo;
color = myColors2.bar;

// Typing via ResourceBuilder with validator
const myColors3 = Resources.build({
  validator: Color.isValidColorValue
}).from({
  baz: 'blue',
  bar: {
    android: {red: 0, green: 1, blue: 2},
    ios: new Color(0, 1, 2)
  },
  references: {ref: 'bar'}
});

colorValue = myColors3.bar;
colorValue = myColors3.baz;

// ResourceBuilder with converter and inherited values from subclass
const myColors4 = Resources.build({converter: Color.from}).from(myColors2, {
  $schema: 'ignore',
  $scaleFactor: 'higher',
  $fallbackLanguage: 'de',
  baz: 'blue',
  bar: {
    android: [0, 1, 2],
    ios: new Color(0, 1, 2)
  },
  inherited: {inherit: true},
  references: {ref: 'bar'}
});

color = myColors4.bar;
color = myColors4.foo;
color = myColors4.baz;

// ResourceBuilder with type and inherited values from same ResourceBuilder
const myColors5 = Resources.build({type: Color}).from(myColors4, {
  bar: {
    android: Color.from([0, 1, 2]),
    ios: new Color(0, 1, 2)
  }
});

color = myColors5.bar;
color = myColors5.foo;
color = myColors5.baz;
