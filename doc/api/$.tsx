// Create markup string, but avoid implicit `any` type:

const str: string = (
  <$>
    This is <b>some text</b>
    with multiple lines
  </$>
);
