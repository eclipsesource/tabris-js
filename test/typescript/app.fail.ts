import {app} from 'tabris';

const id = app.id;
const version = app.version;
const versionCode = app.versionCode;

app.set({id});
app.id = id;
app.onIdChanged(function() {});

app.set({version});
app.version = version;
app.onVersionChanged(function() {});

app.set({versionCode});
app.versionCode = versionCode;
app.onVersionCodeChanged(function() {});

/*Expected
(7,
'id'

(11,
'version'

(15,
'versionCode'
*/