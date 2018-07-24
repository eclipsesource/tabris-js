import {Composite, Properties} from 'tabris';

class CustomComponent extends Composite {
  constructor(props: Properties<CustomComponent>) { super(props); }
  foo() {}
}

let customComponent = new CustomComponent({});
customComponent.set({foo: function() {}});
customComponent.set({on: (ev: any) => customComponent});
customComponent.set({dispose: undefined});
customComponent = new CustomComponent({foo2: function() {}});
customComponent = new CustomComponent({append: undefined});

/*Expected
(9,
'foo' does not exist
(10,
'on' does not exist
(11,
'dispose' does not exist
(12,
'foo2' does not exist
(13,
'append' does not exist
*/
