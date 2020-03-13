import {fs} from 'tabris';

const filesDir = fs.filesDir;
fs.set({filesDir});
fs.filesDir = filesDir;
fs.onFilesDirChanged(function() {});

const cacheDir = fs.cacheDir;
fs.set({cacheDir});
fs.cacheDir = cacheDir;
fs.onCacheDirChanged(function() {});

const externalFileDirs = fs.externalFileDirs;
fs.set({externalFileDirs: externalFileDirs});
fs.externalFileDirs = externalFileDirs;
fs.onExternalFileDirsChanged(function() {});

const externalCacheDirs = fs.externalCacheDirs;
fs.set({externalCacheDirs: externalCacheDirs});
fs.externalCacheDirs = externalCacheDirs;
fs.onExternalCacheDirsChanged(function() {});

/*Expected
(5,
Cannot assign to 'filesDir'
(10,
Cannot assign to 'cacheDir'
(15,
Cannot assign to 'externalFileDirs'
(20,
Cannot assign to 'externalCacheDirs'
*/
