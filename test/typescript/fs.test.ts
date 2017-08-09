import {fs} from 'tabris';

let path: string;
let data: ArrayBuffer;
let text: string;
let files: string[];
let none: void;

async function test() {

  // Properties
  path = fs.filesDir;
  path = fs.cacheDir;

  // Methods
  data = await fs.readFile(path);
  text = await fs.readFile(path, 'utf-8');
  files = await fs.readDir(path);
  none = await fs.writeFile(path, data);
  none = await fs.writeFile(path, text, 'utf-8');
  none = await fs.removeFile(path);

}
