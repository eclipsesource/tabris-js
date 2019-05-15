import {Composite, contentView, Percent} from 'tabris';

// Percentage can be given as a string (with or without offset) or via Percent constructor
contentView.append(
  <$>
    <Composite left={16} top={16} right={16} bottom={new Percent(70)} background='red'/>
    <Composite left={16} top='30% 10' right={16} bottom={60} background='blue'/>
  </$>
);
