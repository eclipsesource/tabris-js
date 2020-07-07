import {app} from 'tabris';

const id = app.id;
const version = app.version;
const versionCode = app.versionCode;

app.id = id;
app.onIdChanged(function() {});

app.version = version;
app.onVersionChanged(function() {});

app.versionCode = versionCode;
app.onVersionCodeChanged(function() {});

/*Expected
(7
read-only
(8
does not exist
(10
read-only
(11
does not exist
(13
read-only
(14
does not exist
*/
