import {Composite, contentView, ColorResources, Row, TextView, Stack} from 'tabris';
import * as colorData from './resources/colors.json';

const colors = ColorResources.from(colorData);

contentView.set({background: colors.myBackground}).append(
  <Stack>
    {
      Object.keys(colors).map((name: keyof typeof colors) =>
        <Row spacing={20} padding={20}>
          <Composite height={50} width={50} background={colors[name]}/>
          <TextView font={{size: 20}}>{name} ({colors[name].toString()}}</TextView>
        </Row>
      )
    }
  </Stack>
);
