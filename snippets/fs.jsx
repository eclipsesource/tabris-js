import {ImageView, fs, contentView, TextView, Stack, Button} from 'tabris';

const DIR = fs.cacheDir + '/pics';
const FILE = DIR + '/test.png';

contentView.append(
  <Stack stretchX padding={12} spacing={12}>
    <ImageView centerX width={400} height={200} background='#aaaaaa'/>
    <Button onSelect={clean}>Clean</Button>
    <TextView stretchX>Downloading Image...</TextView>
  </Stack>
);

const message = $(TextView).only();

(async () => {
  try {
    const response = await fetch('https://picsum.photos/400/200/');
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} - ${response.statusText}`);
    }
    const data = await response.arrayBuffer();
    if (fs.isFile(FILE)) {
      message.text = `Overwrite file\n${FILE}`;
    } else {
      message.text = `Create file\n${FILE}`;
    }
    await fs.writeFile(FILE, data);
    $(ImageView).only().image = FILE;
  } catch (ex) {
    console.error(ex);
  }

})().catch(ex => console.error(ex));

async function clean() {
  const files = await fs.readDir(DIR);
  if (await fs.remove(DIR)) {
    message.text = `Deleted file ${files.join()}.`;
  } else {
    message.text = `Directory ${DIR} did not exist.`;
  }
}
