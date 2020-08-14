import { authentication } from 'tabris';

// Properties
let availableBiometrics: Array<'face' | 'fingerprint'>;

availableBiometrics = authentication.availableBiometrics;

// Methods
authentication.canAuthenticate();
authentication.cancel();
authentication.authenticate().then((result: any) => {
  result.status = 'success';
  result.status = 'canceled';
  result.status = 'userCanceled';
  result.status = 'limitExceeded';
  result.status = 'lockout';
  result.status = 'biometricsNotEnrolled';
  result.status = 'credentialsNotEnrolled';
  result.status = 'error';
});
