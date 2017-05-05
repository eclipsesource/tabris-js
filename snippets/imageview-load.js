new tabris.ImageView({
  id: 'image1',
  right: '50% +8', bottom: '50% +8', width: 64, height: 64,
  background: '#dedede',
  image: {src: 'images/cloud-check.png', scale: 3}
}).on('load', handleLoad)
  .appendTo(tabris.ui.contentView);

new tabris.TextView({
  id: 'label-image1',
  right:'50% +8', top: '50% +8', width: 64,
  alignment: 'center'
}).appendTo(tabris.ui.contentView);

new tabris.ImageView({
  id: 'image2',
  left: '50% +8', bottom: '50% +8', width: 64, height: 64,
  background: '#dedede',
  image: {src: 'unavailable.png', scale: 3}
}).on('load', handleLoad)
  .appendTo(tabris.ui.contentView);

new tabris.TextView({
  id: 'label-image2',
  left: '50% +8', top: '50% +8', width: 64,
  alignment: 'center'
}).appendTo(tabris.ui.contentView);

function handleLoad({target, error}) {
  tabris.ui.contentView.find('#label-' + target.id).text = error ? 'Error' : 'Success';
}
