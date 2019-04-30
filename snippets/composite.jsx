import { Composite, TextView, contentView } from 'tabris';

contentView.append(
  <$>
    <Composite stretchY left right='50%' background='#f3f3f3'>
      <TextView center>Composite 1</TextView>
    </Composite>
    <Composite stretchY left='50%' right={0} background='#eaeaea'>
      <TextView center>Composite 2</TextView>
    </Composite>
  </$>
);
