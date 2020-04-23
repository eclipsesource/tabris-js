import {Resources, Color, ResourceData} from 'tabris';

let str: string;
let color: Color;

class MyStringResources extends Resources<string> {

  public foo: string;
  public bar: string;

  constructor(data: ResourceData<MyStringResources>) {
    super({
      data: {
        foo: {
          android: 23,
          ios: 'foo'
        }
      },
      base: {
        bar: 23
      },
      config: {
        fallbackLanguage: 23,
        scaleFactor: 'none'
      },
      converter: () => 23,
      type: 23,
      validator: () => 23
    });
  }

}

const myStrings = new MyStringResources({foo: 'foo', bar: {en: 'bar', de: 'baz'}})
str = myStrings.baz;
color = myStrings.bar;

/*Expected
(15,
not assignable
(20,
not assignable
(23,
not assignable
(24,
not assignable
(26,
not assignable
(27,
not assignable
(28,
not assignable
(35,
does not exist
(36,
not assignable
*/
