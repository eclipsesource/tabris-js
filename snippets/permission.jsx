import {AlertDialog, permission} from 'tabris';

(async () => {
  if (permission.isAuthorized('camera')) {
    AlertDialog.open('Camera permission is available');
  } else {
    const status = await permission.requestAuthorization('camera');
    AlertDialog.open(`Camera permission has been ${status}.`);
  }
})().catch(ex => console.error(ex));
