import {Composite, contentView} from 'tabris';

contentView.append(
  <$>
    <Composite left={50} top={50} width={100} height={100} background='red'/>
    <Composite left={100} top={100} width={100} height={100} background='green'/>
    <Composite left={150} top={150} width={100} height={100} background='blue'/>
  </$>
);
