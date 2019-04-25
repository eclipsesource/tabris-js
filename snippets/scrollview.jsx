import {Button, contentView, ScrollView, TextView} from 'tabris';

contentView.append(
  <$>
    <ScrollView stretchX centerY height={100} background='#234' direction='horizontal' padding={16}
                onScrollXStateChanged={(e) => $(TextView)[1].text = `Scroll state: <b>${e.value}</b>`}>
      <TextView centerY font='16px' textColor='white'>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
        eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation
        ullamco laboris nisi ut aliquip ex ea commodo consequat.
      </TextView>
    </ScrollView>
    <TextView left={16} right={16} bottom={['next()', 16]} alignment='centerX' markupEnabled/>
    <Button left={16} right={16} bottom={16} text='Scroll to 300' onSelect={() => $(ScrollView).only().scrollToX(300)}/>
  </$>
);
