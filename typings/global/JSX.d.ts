declare namespace JSX {

  type JsxFactory = (
    this: object,
    type: {new (...args: any[]): any },
    properties: object,
    children: Array<any>
  ) => Element;

  type Element = any;

  const jsxFactory: unique symbol;

  function createElement(type: Function, properties: object, ...children: Array<ElementClass>): ElementClass;

  interface ElementClass {
    jsxProperties?: object;
    [JSX.jsxFactory]: JsxFactory;
  }

  interface ElementAttributesProperty {
    jsxProperties: any;
  }

  interface IntrinsicElements { }

}
