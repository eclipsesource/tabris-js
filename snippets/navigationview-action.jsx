import {Action, NavigationView, contentView, device, AlertDialog} from 'tabris';

const IMAGE = device.platform === 'iOS'
  ? 'resources/share-black-24dp@3x.png'
  : 'resources/share-white-24dp@3x.png';

contentView.append(
  <NavigationView stretch background='#e7e7e7'>
    <Action title='Action' image={IMAGE}
        onSelect={() => AlertDialog.open('Action selected.')}/>
  </NavigationView>
);
