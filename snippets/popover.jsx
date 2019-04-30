import {Action, NavigationView, Page, Popover, Button, TextView, contentView, device} from 'tabris';

contentView.append(
  <Button stretchX top={24} onSelect={showPopover}>Show Popover</Button>
);

const IMG_CLOSE = device.platform === 'iOS' ? 'resources/close-black-24dp@3x.png' : 'resources/close-white-24dp@3x.png';
const button = contentView.find().first(Button);

function showPopover() {
  const popover = Popover.open(
    <Popover width={300} height={400} anchor={button}>
      <NavigationView stretch>
        <Action placement='navigation' title='Close' image={IMG_CLOSE} onSelect={() => popover.close()}/>
        <Page title='Popover'>
          <TextView center>Hello Popover</TextView>
        </Page>
      </NavigationView>
    </Popover>
  );
}
