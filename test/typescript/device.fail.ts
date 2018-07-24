import {device} from 'tabris';

const language = device.language;
device.set({language});
device.language = language;
device.on({languageChanged: function() {}});

const model = device.model;
device.set({model});
device.model = model;
device.on({modelChanged: function() {}});

const orientation = device.orientation;
device.set({orientation});
device.orientation = orientation;

const platform = device.platform;
device.set({platform});
device.platform = platform;
device.on({platformChanged: function() {}});

const scaleFactor = device.scaleFactor;
device.set({scaleFactor});
device.scaleFactor = scaleFactor;
device.on({scaleFactorChanged: function() {}});

const screenHeight = device.screenHeight;
device.set({screenHeight});
device.screenHeight = screenHeight;
device.on({screenHeightChanged: function() {}});

const screenWidth = device.screenWidth;
device.set({screenWidth});
device.screenWidth = screenWidth;
device.on({screenWidthChanged: function() {}});

const version = device.version;
device.set({version});
device.version = version;
device.on({versionChanged: function() {}});

const name = device.name;
device.set({name});
device.name = name;
device.on({nameChanged: function() {}});

/*Expected
(4,12): error TS2345
(5,8): error TS2540: Cannot assign to 'language' because it is a constant or a read-only property
(6,12): error TS2345
'languageChanged' does not exist

(9,12): error TS2345
(10,8): error TS2540: Cannot assign to 'model' because it is a constant or a read-only property
(11,12): error TS2345
'modelChanged' does not exist

(14,12): error TS2345
(15,8): error TS2540: Cannot assign to 'orientation' because it is a constant or a read-only property

(18,12): error TS2345
(19,8): error TS2540: Cannot assign to 'platform' because it is a constant or a read-only property
(20,12): error TS2345
'platformChanged' does not exist

(23,12): error TS2345
(24,8): error TS2540: Cannot assign to 'scaleFactor' because it is a constant or a read-only property
(25,12): error TS2345
'scaleFactorChanged' does not exist

(28,12): error TS2345
(29,8): error TS2540: Cannot assign to 'screenHeight' because it is a constant or a read-only property
(30,12): error TS2345
'screenHeightChanged' does not exist

(33,12): error TS2345
(34,8): error TS2540: Cannot assign to 'screenWidth' because it is a constant or a read-only property
(35,12): error TS2345
'screenWidthChanged' does not exist

(38,12): error TS2345
(39,8): error TS2540: Cannot assign to 'version' because it is a constant or a read-only property
(40,12): error TS2345
'versionChanged' does not exist

(43,12): error TS2345
(44,8): error TS2540: Cannot assign to 'name' because it is a constant or a read-only property
(45,12): error TS2345
'nameChanged' does not exist
*/