import {Resources, Color, ColorValue, ResourceData, ResourceBase} from 'tabris';

let str: string;
let color: Color;

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

class MyColorResources extends Resources<Color, ColorValue> {

  public foo: Color;
  public bar: Color;

  constructor(data: Partial<ResourceData<MyColorResources, ColorValue>>, base?: ResourceBase<MyColorResources>) {
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
color = myColors2.bar;
color = myColors2.foo;
