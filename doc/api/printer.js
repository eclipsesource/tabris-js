import {printer} from 'tabris';

const imageData = new Uint8Array([]);
printer.print(imageData, {jobName: 'Image', contentType: 'image/jpg'})
  .then(({result}) => console.log(`Printing finished with result ${result}`))
  .catch(err => console.error(err));
