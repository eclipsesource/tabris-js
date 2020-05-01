import {ColorResources, Color, ColorResourceData} from 'tabris';

let color: Color;

class MyColorResources extends ColorResources {

  public foo: Color;
  public bar: Color;

  constructor(data: Partial<ColorResourceData<MyColorResources>>, base?: Partial<MyColorResources>) {
    super({
      data, base,
      config: {scaleFactor: 'lower', fallbackLanguage: 'de'}
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

const myColors3 = ColorResources.from({
  baz: 'blue',
  bar: {
    android: {red: 0, green: 1, blue: 2},
    ios: new Color(0, 1, 2)
  },
  references: {ref: 'bar'}
});

color = myColors3.bar;
color = myColors3.baz;

const myColors4 = ColorResources.from(myColors2, {
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
