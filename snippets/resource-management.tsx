import {Composite, contentView, Row, TextView, Stack, Color, Font} from 'tabris';
import {colors, fonts} from './resources';

contentView.append(
  <Stack background={colors.myBackground}>
    <ResourceInfo text='Tint Color' color={colors.tint}/>
    <ResourceInfo text='Emphasis Font' font={fonts.emphasis}/>
  </Stack>
);

function ResourceInfo(attr: {color?: Color, font?: Font, text: string}) {
  return (
    <Row spacing={20} padding={20}>
      <TextView text={attr.text} font={attr.font || fonts.main}/>
      <Composite height={50} width={50} background={attr.color}/>
    </Row>
  );
}
