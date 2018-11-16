import Image from './Image';

export function imageToArray(value) {
  const width = value.width === 'auto' ? null : value.width;
  const height = value.height === 'auto' ? null : value.height;
  const scale = value.scale === 'auto' ? null : value.scale;
  return [value.src, checkValue(width), checkValue(height), checkValue(scale)];
}

export function imageFromArray(value) {
  const result = {src: value[0]};
  if (value[1]) {
    result.width = value[1];
  }
  if (value[2]) {
    result.height = value[2];
  }
  if (value[3]) {
    result.scale = value[3];
  }
  return Image.from(result);
}

function checkValue(value) {
  return value != null ? value : null;
}
