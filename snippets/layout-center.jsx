import {Composite, contentView, WidgetCollection} from 'tabris';

contentView.append(
  <WidgetCollection>
    <Composite centerX centerY width={100} height={100} background='red'/>
    <Composite centerX={-120} centerY width={100} height={100} background='green'/>
    <Composite centerX={120} centerY width={100} height={100} background='green'/>
    <Composite centerX centerY={120} width={100} height={100} background='green'/>
    <Composite centerX centerY={-120} width={100} height={100} background='green'/>
  </WidgetCollection>
);
