import {fs} from 'tabris';

let path: string;
let data: ArrayBuffer;
let files: string[];
let none: void;

async function test() {

  // Properties
  path = fs.filesDir;
  path = fs.cacheDir;

  // Methods
  data = await fs.readFile(path);
  files = await fs.readDir(path);
  none = await fs.writeFile(path, data);
  none = await fs.removeFile(path);

}
