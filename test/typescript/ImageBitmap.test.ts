import {ImageBitmap} from 'tabris';

(async () => {
  let imageBitmap: ImageBitmap = await createImageBitmap(new Blob());
  imageBitmap.close();
  let width: number = imageBitmap.width;
  let height: number = imageBitmap.height;
})().catch(() => {});