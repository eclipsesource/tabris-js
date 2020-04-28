// Create markup string, but avoid implicit `any` type:

const str: string = (
  <$>
    This is <b>some</b> text
    across multiple lines
  </$>
);
