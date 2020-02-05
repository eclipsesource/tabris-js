import {AlertDialog, Button, Composite, contentView, permission, Properties, Stack, TextView} from 'tabris';

const PERMISSIONS = [
  'camera',
  'location',
  'android.permission.CAMERA',
  'android.permission.ACCESS_COARSE_LOCATION',
  'android.permission.ACCESS_FINE_LOCATION',
  'android.permission.INTERNET'
].filter((entry) => device.platform === 'Android' || !entry.startsWith('android.permission.'));

const STATUS_COLORS = {granted: 'green', declined: 'blue', denied: 'red', undetermined: 'gray'};

class PermissionView extends Composite {

  public _permission: string;

  constructor(properties: Properties<PermissionView>) {
    super(properties);
    this.append(
      <$>
        <TextView id='name' left right='next() 16' centerY font='14px ' maxLines={2}
            text={properties.permission.replace('android.permission.', '')}/>
        <TextView id='status' right='next() 16' centerY alignment='right' font='14px monospace' maxLines={1}/>
        <Button id='requestButton' centerY right style='outline' text='Request'
            onSelect={() => handlePermissions(this._permission)}/>
      </$>
    );
    this.update();
  }

  public set permission(value: string) {
    this._permission = value;
  }

  public update() {
    const status = permission.getAuthorizationStatus(this._permission);
    this.find('#status').only(TextView).set({
      text: status,
      textColor: STATUS_COLORS[status]
    });
    this.find('#requestButton').only().enabled = permission.isAuthorizationPossible(this._permission);
  }

}

contentView.append(
  <Stack stretchX alignment='stretchX' spacing={device.platform !== 'Android' ? 16 : 0} padding={[24, 16]}>
    {PERMISSIONS.map((entry) => <PermissionView permission={entry}/>)}
    <Button top={24} text='Request all permission' onSelect={() => handlePermissions(...PERMISSIONS)}/>
    <TextView top={device.platform === 'Android' ? 16 : 24} font='italic 14px' alignment='centerX'
        markupEnabled lineSpacing={1.2} textColor='gray'
        text='To reset the permissions<br/>clear the app settings or reinstall the app.'/>
  </Stack>
);

function handlePermissions(...permissions: string[]) {
  if (permission.isAuthorized(...permissions)) {
    AlertDialog.open(`${JSON.stringify(permissions)} permissions is authorized`);
  } else if (permission.isAuthorizationPossible(...permissions)) {
    requestPermissions(...permissions).catch((error) => AlertDialog.open(error));
  } else {
    AlertDialog.open(`None of the permissions ${JSON.stringify(permissions)} are eligible to request authorization.`
      + `\n\nStatus is '${(permission.getAuthorizationStatus(...permissions))}'.`);
  }
}

async function requestPermissions(...permissions: string[]) {
  const requestResult = await permission.requestAuthorization(...permissions);
  if (requestResult === 'granted') {
    AlertDialog.open(`The ${JSON.stringify(permissions)} permissions are available after requesting them.`);
  } else if (requestResult === 'declined') {
    AlertDialog.open(
      <AlertDialog title='User needs explanation' buttons={{ok: 'Ok', neutral: 'Request permission'}}
          message={`Provide more details why the user should grant the ${JSON.stringify(permissions)} permissions.`}
          onCloseNeutral={() => handlePermissions(...permissions)}/>
    ).open();
  } else {
    AlertDialog.open(`The permissions ${JSON.stringify(permissions)} have been denied.`);
  }
  $(PermissionView).forEach((view) => view.update());
}
