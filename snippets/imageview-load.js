import {ImageView, TextView, contentView} from 'tabris';

new ImageView({
  id: 'image1',
  right: '50% +8', bottom: '50% +8', width: 64, height: 64,
  background: '#dedede',
  image: {src: 'resources/cloud-check.png', scale: 3}
}).onLoad(handleLoad)
  .appendTo(contentView);

new TextView({
  id: 'label-image1',
  right:'50% +8', top: '50% +8', width: 64,
  alignment: 'centerX'
}).appendTo(contentView);

new ImageView({
  id: 'image2',
  left: '50% +8', bottom: '50% +8', width: 64, height: 64,
  background: '#dedede',
  image: {src: 'unavailable.png', scale: 3}
}).onLoad(handleLoad)
  .appendTo(contentView);

new TextView({
  id: 'label-image2',
  left: '50% +8', top: '50% +8', width: 64,
  alignment: 'centerX'
}).appendTo(contentView);

function handleLoad({target, error}) {
  contentView.find('#label-' + target.id).first(TextView).set({text: error ? 'Error' : 'Success'});
}
