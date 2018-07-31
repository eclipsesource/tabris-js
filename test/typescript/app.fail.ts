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
(7,10): error TS2345
'id' does not exist
(8,5): error TS2540: Cannot assign to 'id' because it is a constant or a read-only property.

(11,10): error TS2345
'version' does not exist
(12,5): error TS2540: Cannot assign to 'version' because it is a constant or a read-only property.

(15,10): error TS2345
'versionCode' does not exist
(16,5): error TS2540: Cannot assign to 'versionCode' because it is a constant or a read-only property.
*/