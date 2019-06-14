import {AlertDialog, permission} from 'tabris';

if (permission.isAuthorized('camera')) {
  AlertDialog.open('Camera permission is available');
} else {
  (async () => {
    const status = await permission.requestAuthorization('camera');
    AlertDialog.open(`Camera permission has been ${status}.`);
  })();
}
