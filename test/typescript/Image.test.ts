import {ImageValue, Image} from 'tabris';

let imageValue: ImageValue = new Image({src: 'foo'});
imageValue = 'src';
imageValue = {src: 'foo'};
imageValue = {src: 'foo', width: 5};
imageValue = {src: 'foo', height: 5};
imageValue = {src: 'foo', width: 5, height: 5};
imageValue = {src: 'foo', scale: 5};
imageValue = {src: 'foo', width: 5, height: 5, scale: 5};

let image: Image = new Image({src: 'foo'});
image = new Image({src: 'foo', width: 5});
image = new Image({src: 'foo', height: 5});
image = new Image({src: 'foo', width: 5, height: 5});
image = new Image({src: 'foo', scale: 5});
image = new Image({src: 'foo', scale: 5, width: 5, height: 5});
image = Image.from({src: 'foo'});
image = Image.from({src: 'foo', width: 5});
image = Image.from({src: 'foo', height: 5});
image = Image.from({src: 'foo', width: 5, height: 5});
image = Image.from({src: 'foo', scale: 5});
image = Image.from({src: 'foo', scale: 5, width: 5, height: 5});
const bool: boolean = image.equals(image);

let obj: object = {};

if (Image.isImageValue(obj)) {
  imageValue = obj;
}

if (Image.isValidImageValue(obj)) {
  imageValue = obj;
}
