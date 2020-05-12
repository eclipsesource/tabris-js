import {TextResources, TextResourceData} from 'tabris';

let str: string;

class MyTextResources extends TextResources {

  public foo: string;
  public bar: string;

  constructor(data: Partial<TextResourceData<MyTextResources>>, base?: Partial<MyTextResources>) {
    super({
      data, base,
      config: {fallbackLanguage: 'de'}
    });
  }

}

const myTexts = new MyTextResources({
  foo: 'one',
  bar: {
    en: 'two',
    de: 'three'
  }
});
const myTexts2 = new MyTextResources({bar: 'four'}, myTexts);
str = myTexts2.foo;
str = myTexts2.bar;

const myTexts3 = TextResources.from({
  $fallbackLanguage: 'de',
  baz: 'one',
  bar: {
    en: 'two',
    de: 'three'
  },
  references: {ref: 'bar'}
});

str = myTexts3.bar;
str = myTexts3.baz;

const json = {
  baz: 'one',
  bar: {
    android: 'two',
    ios: 'three'
  },
  inherited: {inherit: true},
  references: {ref: 'bar'}
};

const myTexts4 = TextResources.from(myTexts2, json);

str = myTexts4.bar;
str = myTexts4.foo;
str = myTexts4.baz;
