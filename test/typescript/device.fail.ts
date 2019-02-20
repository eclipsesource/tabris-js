import {device} from 'tabris';

const language = device.language;
device.set({language});
device.language = language;
device.onLanguageChanged(function() {});

const model = device.model;
device.set({model});
device.model = model;
device.onModelChanged(function() {});

const orientation = device.orientation;
device.set({orientation});
device.orientation = orientation;

const platform = device.platform;
device.set({platform});
device.platform = platform;
device.onPlatformChanged(function() {});

const scaleFactor = device.scaleFactor;
device.set({scaleFactor});
device.scaleFactor = scaleFactor;
device.onScaleFactorChanged(function() {});

const screenHeight = device.screenHeight;
device.set({screenHeight});
device.screenHeight = screenHeight;
device.onScreenHeightChanged(function() {});

const screenWidth = device.screenWidth;
device.set({screenWidth});
device.screenWidth = screenWidth;
device.onScreenWidthChanged(function() {});

const version = device.version;
device.set({version});
device.version = version;
device.onVersionChanged(function() {});

const name = device.name;
device.set({name});
device.name = name;
device.onNameChanged(function() {});

/*Expected
(4,
(5,8): error TS2540: Cannot assign to 'language' because it is a constant or a read-only property
(6,8): error TS2339

(9,
(10,8): error TS2540: Cannot assign to 'model' because it is a constant or a read-only property
(11,8): error TS2339

(14,
(15,8): error TS2540: Cannot assign to 'orientation' because it is a constant or a read-only property

(18,
(19,8): error TS2540: Cannot assign to 'platform' because it is a constant or a read-only property
(20,8): error TS2339

(23,
(24,8): error TS2540: Cannot assign to 'scaleFactor' because it is a constant or a read-only property
(25,8): error TS2339

(28,
(29,8): error TS2540: Cannot assign to 'screenHeight' because it is a constant or a read-only property
(30,8): error TS2339

(33,
(34,8): error TS2540: Cannot assign to 'screenWidth' because it is a constant or a read-only property
(35,8): error TS2339

(38,
(39,8): error TS2540: Cannot assign to 'version' because it is a constant or a read-only property
(40,8): error TS2339

(43,
(44,8): error TS2540: Cannot assign to 'name' because it is a constant or a read-only property
(45,8): error TS2339
*/