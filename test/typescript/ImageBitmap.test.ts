import {ImageBitmap, Canvas} from 'tabris';

(async () => {
  let imageBitmap: ImageBitmap = await ImageBitmap.createImageBitmap(new Blob());
  imageBitmap = await createImageBitmap(new Blob());
  imageBitmap = await createImageBitmap(new ImageData(10, 20));
  imageBitmap = await createImageBitmap(imageBitmap);
  imageBitmap = await createImageBitmap(new Canvas());
  imageBitmap = await createImageBitmap(new Canvas(), {});
  imageBitmap = await createImageBitmap(new Canvas(), {resizeHeight: 10});
  imageBitmap = await createImageBitmap(new Canvas(), {resizeHeight: 10, resizeWidth: 20, resizeQuality: 'pixelated'});
  imageBitmap = await createImageBitmap(new Canvas(), {resizeQuality: 'low'});
  imageBitmap = await createImageBitmap(new Canvas(), {resizeQuality: 'medium'});
  imageBitmap = await createImageBitmap(new Canvas(), {resizeQuality: 'high'});
  imageBitmap = await createImageBitmap(new Canvas(), 0, 0, 0, 0, {});
  imageBitmap = await createImageBitmap(new Canvas(), 0, 0, 0, 0, {resizeHeight: 10});
  imageBitmap = await createImageBitmap(new Canvas(), 0, 0, 0, 0, {resizeHeight: 10, resizeWidth: 20, resizeQuality: 'pixelated'});
  imageBitmap.close();
  let width: number = imageBitmap.width;
  let height: number = imageBitmap.height;
})().catch(() => {});
