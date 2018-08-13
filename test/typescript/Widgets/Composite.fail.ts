import {Composite, Properties, Bounds} from 'tabris';

class CustomComponent extends Composite {
  constructor(props: Properties<typeof Composite> & Partial<Pick<CustomComponent, 'foo'>>) { super(props); }
  foo() {}
}

const bounds: Bounds = null;
let customComponent: CustomComponent = new CustomComponent({bounds});
customComponent.set({bounds});

/*Expected
(9,
bounds
(10,
bounds
*/
