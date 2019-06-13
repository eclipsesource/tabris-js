declare namespace JSX {

  type JsxFactory = (
    this: tabris.JsxProcessor,
    type: {new (...args: any[]): any },
    attributes: object
  ) => Element;

  type Element = any;

  const jsxFactory: unique symbol;
  const jsxType: unique symbol;

  function createElement(type: Function|string, attributes: object, ...children: Array<ElementClass>): ElementClass;

  function install(jsxProcessor: tabris.JsxProcessor): void;

  interface ElementClass {
    jsxAttributes?: object;
    [JSX.jsxFactory]: JsxFactory;
  }

  interface ElementAttributesProperty {
    jsxAttributes: any;
  }

  interface ElementChildrenAttribute {
    children?: any;
  }

  interface IntrinsicElements {
    br: {children?: never};
    b: {children?: string|string[], font?: tabris.FontValue, textColor?: tabris.ColorValue};
    span: {children?: string|string[], font?: tabris.FontValue, textColor?: tabris.ColorValue};
    big: {children?: string|string[], font?: tabris.FontValue, textColor?: tabris.ColorValue};
    i: {children?: string|string[], font?: tabris.FontValue, textColor?: tabris.ColorValue};
    small: {children?: string|string[], font?: tabris.FontValue, textColor?: tabris.ColorValue};
    strong: {children?: string|string[], font?: tabris.FontValue, textColor?: tabris.ColorValue};
    ins: {children?: string|string[], font?: tabris.FontValue, textColor?: tabris.ColorValue};
    del: {children?: string|string[], font?: tabris.FontValue, textColor?: tabris.ColorValue};
    a: {href?: string, children?: string|string[], font?: tabris.FontValue, textColor?: tabris.ColorValue};
  }

}
