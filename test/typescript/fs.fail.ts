import {fs} from 'tabris';

const filesDir = fs.filesDir;
fs.set({filesDir});
fs.filesDir = filesDir;
fs.onFilesDirChanged(function() {});

const cacheDir = fs.cacheDir;
fs.set({cacheDir});
fs.cacheDir = cacheDir;
fs.onCacheDirChanged(function() {});

/*Expected
(5,
Cannot assign to 'filesDir'
(10,
Cannot assign to 'cacheDir'
*/