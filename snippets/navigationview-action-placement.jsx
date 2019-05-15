import {Action, NavigationView, contentView, device} from 'tabris';

contentView.append(
  <NavigationView stretch>
    <Action placement='navigation' image={getImage('close')}/>
    <Action placement='default' image={getImage('settings')}/>
    <Action placement='overflow' title='Share'/>
  </NavigationView>
);

function getImage(image) {
  return 'resources/' + image + (device.platform === 'iOS' ? '-black-24dp@3x.png' : '-white-24dp@3x.png');
}
