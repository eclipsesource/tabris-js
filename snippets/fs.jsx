import {ImageView, fs, contentView} from 'tabris';

const FILE = fs.cacheDir + '/test.png';

contentView.append(
  <ImageView center width={400} height={200} background='#aaaaaa'/>
);

(async () => {
  try {
    const response = await fetch('http://lorempixel.com/400/200/');
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} - ${response.statusText}`);
    }
    const data = await response.arrayBuffer();
    await fs.writeFile(FILE, data);
    $(ImageView).only().image = FILE;
  } catch (ex) {
    console.error(ex);
  }
})();
