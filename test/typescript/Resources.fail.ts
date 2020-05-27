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

new MyStringResources({bar: {en: 'bar', de: 'baz'}})
const myStrings = new MyStringResources({bar: {en: 'bar', de: 'baz'}, foo: 'x'})
str = myStrings.baz;
color = myStrings.bar;

Resources.build();
Resources.build({});
Resources.build({validator: Color.isValidColorValue}).from({baz: 23});
Resources.build({validator: Color.isValidColorValue}).from({baz: 23}, {});
Resources.build({type: Color}).from({bar: 'red'});
Resources.build({type: Color}).from({bar: 'red'}, {});
Resources.build({converter: Color.from}).from({bar: 'red'}, {});

const myColors = Resources.build({
  validator: Color.isValidColorValue
}).from({foo: 'red'});
color = myColors.foo;

const myColors2 = Resources.build({type: Color}).from({foo: Color.from('red')});
str = myColors2.foo;

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
(34,
not assignable
(36,
does not exist
(37,
not assignable
(39,
Expected 1 argument
(40,
missing in type
(41,
not assignable
(42,
not assignable
(43,
not assignable
(44,
not assignable
(45,
not assignable
(50,
not assignable
(53,
not assignable
*/
