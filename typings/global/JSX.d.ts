declare namespace JSX {

  function createElement(type: Function, properties: object, ...children: Array<ElementClass>): ElementClass;

  interface ElementClass { jsxProperties: object; }

  type Element = any;

  interface ElementAttributesProperty {
    jsxProperties: any;
  }

  interface IntrinsicElements { }

}
