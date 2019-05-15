import {ImageView, TextView, contentView} from 'tabris';

contentView.append(
  <$>
    <ImageView centerX={-44} centerY={-64} width={64} height={64}
        background='#dedede'
        image={{src: 'resources/cloud-check.png', scale: 3}}
        onLoad={handleLoad}/>
    <ImageView centerX={44} centerY={-64} width={64} height={64}
        background='#dedede'
        image={{src: 'unavailable.png', scale: 3}}
        onLoad={handleLoad}/>
  </$>
);

/** @param {tabris.ImageViewLoadEvent} event */
function handleLoad({target, error}) {
  new TextView({
    centerX: target.centerX, top: [target, 8],
    text: error ? 'Error' : 'Success'
  }).insertAfter(target);
}
