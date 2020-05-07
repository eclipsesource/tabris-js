import {FontResources, Font, FontResourceData} from 'tabris';

let font: Font;

class MyFontResources extends FontResources {

  public foo: Font;
  public bar: Font;

  constructor(data: Partial<FontResourceData<MyFontResources>>, base?: Partial<MyFontResources>) {
    super({
      data, base,
      config: {scaleFactor: 'lower', fallbackLanguage: 'de'}
    });
  }

}

const myFonts = new MyFontResources({
  foo: 'red',
  bar: {
    android: {size: 12, family: ['serif']},
    ios: new Font(14, ['san-serif'])
  }
});
const myFonts2 = new MyFontResources({bar: '22px arial'}, myFonts);
font = myFonts2.foo;
font = myFonts2.bar;

const myFonts3 = FontResources.from({
  baz: 'italic 12px',
  bar: {
    android: {size: 12, family: ['serif']},
    ios: new Font(14, ['san-serif'])
  },
  references: {ref: 'bar'}
});

font = myFonts3.bar;
font = myFonts3.baz;

// This must not be inlined so the type is inferred more broadly,
// specifically this tests if style and weight are accepted when
// only recognized as "string" instead of a union
const json = {
  baz: 'italic 12px',
  bar: {
    android: {size: 12, style: 'italic', weight: 'bold'},
    ios: new Font(14, ['san-serif'])
  },
  inherited: {inherit: true},
  references: {ref: 'bar'}
};

const myFonts4 = FontResources.from(myFonts2, json);

font = myFonts4.bar;
font = myFonts4.foo;
font = myFonts4.baz;
