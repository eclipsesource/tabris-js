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
(5,
Cannot assign to 'language'
(6,

(9,
(10,
Cannot assign to 'model'
(11,

(14,
(15,
Cannot assign to 'orientation'

(18,
(19,
Cannot assign to 'platform'
(20,

(23,
(24,
Cannot assign to 'scaleFactor'
(25,

(28,
(29,
Cannot assign to 'screenHeight'
(30,

(33,
(34,
Cannot assign to 'screenWidth'
(35,

(38,
(39,
Cannot assign to 'version'
(40,

(43,
(44,
Cannot assign to 'name'
(45,
*/