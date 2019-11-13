import {ImageBitmap, Canvas} from 'tabris';

(async () => {
  let imageBitmap: ImageBitmap = await ImageBitmap.createImageBitmap(new Blob());
  imageBitmap = await createImageBitmap(new Blob());
  imageBitmap = await createImageBitmap(new ImageData(10, 20));
  imageBitmap = await createImageBitmap(imageBitmap);
  imageBitmap = await createImageBitmap(new Canvas());
  imageBitmap.close();
  let width: number = imageBitmap.width;
  let height: number = imageBitmap.height;
})().catch(() => {});
