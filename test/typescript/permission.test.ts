import {permission} from 'tabris';

permission.getAuthorizationStatus('camera', 'foo');
permission.isAuthorizationPossible('camera', 'foo');
permission.isAuthorized('camera', 'foo');
permission.requestAuthorization('camera', 'foo').then((result) => {
  result = 'undetermined';
  result = 'granted';
  result = 'declined';
  result = 'denied';
  result = 'rejected';
});
let authorizationCallback = () => {}
let errorCallback = (error: Error) => {}
permission.withAuthorization('foo', authorizationCallback, authorizationCallback, errorCallback);