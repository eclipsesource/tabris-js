import {contentView, ImageView, ScrollView, Stack, TextView} from 'tabris';

/**
 * @param {Blob} blob
 * @param {Rect | undefined} crop
 * @param {ResizeOptions} options
 * @param {tabris.Composite} view
 */
const loadImageBitmap = (blob, crop, options, view) => {
  const imageView = view.find(ImageView).only();
  const [sx, sy, sw, sh] = crop || [];
  const promise = crop
    ? createImageBitmap(blob, sx, sy, sw, sh, options)
    : createImageBitmap(blob, options);
  promise.then(image => imageView.set({image})).catch(console.error);
  return view;
};

/**
 * @param {object} attributes
 * @param {Blob} attributes.blob
 * @param {Rect=} attributes.crop
 * @param {ResizeOptions=} attributes.options
 */
const Card = ({blob, crop, options}) => loadImageBitmap(
  blob, crop, options,
  <Stack stretchX>
    <ImageView centerX width={200} height={200} scaleMode='none' background='#dedede'/>
    <TextView alignment='centerX' stretchX>
      {crop ? `crop: ${JSON.stringify(crop)}` : ''}
      {crop && options ? '\n' : ''}
      {options ? `options: ${JSON.stringify(options)}` : ''}
    </TextView>
  </Stack>
);

fetch('resources/target_200.png')
  .then(response => response.blob())
  .then(blob =>
    contentView.append(
      <ScrollView stretch>
        <Stack stretchX padding={16} spacing={24}>
          <Card blob={blob}/>
          <Card blob={blob} options={{resizeWidth: 100}}/>
          <Card blob={blob} options={{resizeWidth: 100, resizeQuality: 'pixelated'}}/>
          <Card blob={blob} options={{resizeHeight: 100, resizeQuality: 'low'}}/>
          <Card blob={blob} options={{resizeWidth: 100, resizeQuality: 'medium'}}/>
          <Card blob={blob} options={{resizeWidth: 100, resizeQuality: 'high'}}/>
          <Card blob={blob} options={{resizeWidth: 180, resizeHeight: 180}}/>
          <Card blob={blob} options={{resizeWidth: 100, resizeHeight: 150}}/>
          <Card blob={blob} options={{resizeWidth: 400, resizeHeight: 250}}/>
          <Card blob={blob} crop={[0, 0, 100, 100]}/>
          <Card blob={blob} crop={[50, 50, 100, 100]}/>
          <Card blob={blob} options={{resizeWidth: 200, resizeHeight: 200}} crop={[0, 0, 100, 100]}/>
          <Card blob={blob} options={{resizeWidth: 50, resizeHeight: 100}} crop={[0, 0, 100, 100]}/>
          <Card blob={blob} options={{resizeWidth: 100, resizeHeight: 50}} crop={[50, 50, 100, 100]}/>
          <Card blob={blob} options={{resizeWidth: 300, resizeHeight: 50}} crop={[100, 100, 50, 50]}/>
        </Stack>
      </ScrollView>
    )
  ).catch(console.error);

/**
 * @typedef ResizeOptions
 * @type {Parameters<createImageBitmap>[5]}
 * @typedef Rect
 * @type {[number, number, number, number]}
 */
