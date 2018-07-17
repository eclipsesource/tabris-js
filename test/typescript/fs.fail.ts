import {fs} from 'tabris';

const filesDir = fs.filesDir;
fs.set({filesDir});
fs.filesDir = filesDir;
fs.on({onFilesDirChanged: function() {}});

const cacheDir = fs.cacheDir;
fs.set({cacheDir});
fs.cacheDir = cacheDir;
fs.on({onCacheDirChanged: function() {}});

/*Expected
(5,4): error TS2540: Cannot assign to 'filesDir' because it is a constant or a read-only property.
(10,4): error TS2540: Cannot assign to 'cacheDir' because it is a constant or a read-only property.
*/