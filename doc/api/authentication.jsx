import {authentication} from 'tabris';

authentication.authenticate()
  .then((result) => console.log(result));
