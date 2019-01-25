import {ImageView, TextView, contentView} from 'tabris';

new ImageView({
  id: 'image1',
  right: '50% +8', bottom: '50% +8', width: 64, height: 64,
  background: '#dedede',
  image: {src: 'resources/cloud-check.png', scale: 3}
}).on('load', handleLoad)
  .appendTo(contentView);

new TextView({
  id: 'label-image1',
  right:'50% +8', top: '50% +8', width: 64,
  alignment: 'center'
}).appendTo(contentView);

new ImageView({
  id: 'image2',
  left: '50% +8', bottom: '50% +8', width: 64, height: 64,
  background: '#dedede',
  image: {src: 'unavailable.png', scale: 3}
}).on('load', handleLoad)
  .appendTo(contentView);

new TextView({
  id: 'label-image2',
  left: '50% +8', top: '50% +8', width: 64,
  alignment: 'center'
}).appendTo(contentView);

function handleLoad({target, error}) {
  contentView.find('#label-' + target.id).set({text: error ? 'Error' : 'Success'});
}
