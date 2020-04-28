import {permission} from 'tabris';

permission.getAuthorizationStatus(2);
permission.isAuthorizationPossible(2);
permission.isAuthorized(2);
permission.requestAuthorization('foo').then((result) => {
  result = 'unsupported';
});
let authorizationCallback = () => {}
let errorCallback = (error: Error) => {}
permission.withAuthorization('foo', authorizationCallback, authorizationCallback, errorCallback);

/*Expected
(3,
not assignable
(4,
not assignable
(5,
not assignable
(7,
not assignable
*/